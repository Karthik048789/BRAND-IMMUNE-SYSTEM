from typing import Dict, Any, List, Tuple
from backend.app.models.schemas import AgentResult, RoutingDecision, RoutingSummary, MemoryMatch
from backend.app.memory.memory_bank import memory_bank

class RoutingService:
    def __init__(self):
        self.auto_pass_score_threshold = 0.20
        self.auto_flag_score_threshold = 0.70
        self.min_confidence_for_auto = 0.85
        self.duplicate_similarity_threshold = 0.96

    def compute_routing(
        self,
        content: str,
        agent_results: Dict[str, AgentResult]
    ) -> RoutingSummary:
        # 1. Query memory bank for similar past-resolved cases
        matches: List[MemoryMatch] = memory_bank.search_similar(content, top_k=3, threshold=0.35)
        top_match: Optional[MemoryMatch] = matches[0] if matches else None

        # 2. Extract agent scores and confidences
        scores = [res.score for res in agent_results.values()]
        confidences = [res.confidence for res in agent_results.values()]
        flagged_count = sum(1 for res in agent_results.values() if res.flagged)
        max_score = max(scores) if scores else 0.0
        avg_score = sum(scores) / len(scores) if scores else 0.0
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0.90

        # Combine score with weight toward highest violation
        combined_score = round((max_score * 0.7) + (avg_score * 0.3), 2)
        combined_confidence = round(avg_confidence, 2)

        # 3. Check Edge Cases (PRD 2.5)

        # Edge Case A: Duplicate / Near-Duplicate Resubmission
        if top_match and top_match.similarity >= self.duplicate_similarity_threshold:
            if top_match.resolution == "approved":
                return RoutingSummary(
                    combined_score=min(combined_score, 0.10),
                    combined_confidence=0.98,
                    decision=RoutingDecision.AUTO_PASS,
                    route_reason=f"Short-circuit auto-pass: Exact match ({int(top_match.similarity*100)}%) with previously approved Case #{top_match.case_id}.",
                    top_memory_match=top_match,
                    matched_cases=matches,
                    agent_breakdown=agent_results,
                    explainability=f"Duplicate approved asset. Reuses verified resolution from '{top_match.title}'."
                )
            elif top_match.resolution == "rejected":
                return RoutingSummary(
                    combined_score=max(combined_score, 0.95),
                    combined_confidence=0.98,
                    decision=RoutingDecision.AUTO_FLAG,
                    route_reason=f"Short-circuit auto-flag: Identical match ({int(top_match.similarity*100)}%) with previously rejected Case #{top_match.case_id} ({top_match.reason}).",
                    top_memory_match=top_match,
                    matched_cases=matches,
                    agent_breakdown=agent_results,
                    explainability=f"Blocked automatically. Matches rejected precedent '{top_match.title}' ({int(top_match.similarity*100)}% match)."
                )

        # Edge Case B: Cold Start (No similar past cases in memory bank)
        is_cold_start = not top_match or top_match.similarity < 0.40
        if is_cold_start and flagged_count > 0 and combined_score < 0.85:
            return RoutingSummary(
                combined_score=combined_score,
                combined_confidence=round(combined_confidence * 0.85, 2),
                decision=RoutingDecision.HUMAN_REVIEW,
                route_reason="Cold-start precedent: No historical case match found in memory bank. Routing to human reviewer to establish baseline.",
                top_memory_match=top_match,
                matched_cases=matches,
                agent_breakdown=agent_results,
                explainability="New uncatalogued format or novel copy structure. Defaulted to human reviewer to expand antibody memory."
            )

        # Edge Case C: Conflicting Agent Signals
        # (e.g. one agent found critical violation score > 0.65, but another says 0.0 with high confidence)
        has_critical_disagreement = (max_score >= 0.65 and min(scores) <= 0.05 and flagged_count >= 1 and flagged_count <= 2)
        if has_critical_disagreement and (combined_score < 0.85):
            conflicting_agents = [r.agent_name for r in agent_results.values() if r.flagged]
            clean_agents = [r.agent_name for r in agent_results.values() if not r.flagged]
            return RoutingSummary(
                combined_score=combined_score,
                combined_confidence=round(combined_confidence * 0.80, 2),
                decision=RoutingDecision.HUMAN_REVIEW,
                route_reason=f"Conflicting agent signals: Flagged by [{', '.join(conflicting_agents)}] but passed by [{', '.join(clean_agents)}]. Requiring human editorial judgment.",
                top_memory_match=top_match,
                matched_cases=matches,
                agent_breakdown=agent_results,
                explainability="Conflicting internal agent evaluations detected. Escalated to human reviewer to resolve nuance."
            )

        # Standard Routing Logic (FR4)
        if combined_score <= self.auto_pass_score_threshold and combined_confidence >= self.min_confidence_for_auto:
            decision = RoutingDecision.AUTO_PASS
            if top_match:
                reason = f"Auto-pass: Passed all 4 antibody agents. Consistent with approved Case #{top_match.case_id} ({int(top_match.similarity*100)}% match)."
            else:
                reason = "Auto-pass: Clean content, 0 policy violations detected across all 4 antibody agents."
            explainability = "Verified on-brand. Tone, factual claims, visual constraints, and legal disclosures fully satisfied."

        elif combined_score >= self.auto_flag_score_threshold and combined_confidence >= self.min_confidence_for_auto:
            decision = RoutingDecision.AUTO_FLAG
            flagged_names = [res.agent_name for res in agent_results.values() if res.flagged]
            if top_match and top_match.resolution == "rejected":
                reason = f"Auto-flag: High confidence breach confirmed by {', '.join(flagged_names)}. Highly similar to rejected Case #{top_match.case_id} ({int(top_match.similarity*100)}% match)."
            else:
                reason = f"Auto-flag: Severe rule violation detected by {', '.join(flagged_names)}."
            explainability = f"Flagged automatically due to acute policy violations. Score: {int(combined_score*100)}/100."

        else:
            decision = RoutingDecision.HUMAN_REVIEW
            flagged_names = [res.agent_name for res in agent_results.values() if res.flagged]
            reason = f"Routed to Human Queue: Ambiguous confidence ({int(combined_confidence*100)}%) with potential issues in {', '.join(flagged_names) if flagged_names else 'content boundary'}."
            if top_match:
                explainability = f"Requires human verification. Related precedent Case #{top_match.case_id} was '{top_match.resolution}' ({int(top_match.similarity*100)}% match: {top_match.reason})."
            else:
                explainability = "Borderline score requiring human reviewer discretion."

        return RoutingSummary(
            combined_score=combined_score,
            combined_confidence=combined_confidence,
            decision=decision,
            route_reason=reason,
            top_memory_match=top_match,
            matched_cases=matches,
            agent_breakdown=agent_results,
            explainability=explainability
        )

routing_service = RoutingService()
