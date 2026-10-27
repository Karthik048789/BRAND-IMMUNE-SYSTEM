import re
from typing import Dict, Any, List, Optional
from backend.app.agents.base_agent import BaseAgent
from backend.app.models.schemas import AgentResult, AgentType, FlaggedSpan

class ComplianceAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentType.COMPLIANCE, "Compliance & Legal Agent")
        
        self.financial_hazard_patterns = [
            (
                r"(guaranteed\s+(return[s]?|yield|profit)|risk-free\s+investment|can'?t\s+lose\s+money)",
                "Unqualified financial return promise. Violates SEC / FTC financial promotional regulations.",
                "critical",
                "RULE_COMPLIANCE_FINANCIAL_PROMISES",
                "Add mandatory risk disclosure: 'Investments involve risk including possible loss of principal. Not financial advice.'"
            )
        ]

        self.influencer_disclosure_patterns = [
            (
                r"(our\s+partner|check\s+out\s+this\s+gift|thanks\s+to\s+the\s+team\s+for\s+sending|collab\s+with)",
                "Commercial influencer partnership indicated without required prominent '#ad' or '#sponsored' disclosure.",
                "high",
                "RULE_COMPLIANCE_FTC_DISCLOSURE",
                "Include clear and conspicuous '#ad' or '#sponsored' disclosure at the very start of the post."
            )
        ]

        self.medical_hazard_patterns = [
            (
                r"(treat[s]?|cure[s]?|prevent[s]?)\s+(cancer|diabetes|depression|arthritis|infection|anxiety)",
                "Unapproved medical disease claim. Subject to FDA warning letters.",
                "critical",
                "RULE_COMPLIANCE_FDA_HEALTH_CLAIMS",
                "Include standard FDA disclaimer and replace therapeutic claims with general wellness language."
            )
        ]

        self.trademark_patterns = [
            (
                r"(brand\s+immune\s+system(?!®|™)|bis\s+engine(?!®|™))",
                "Proprietary trademark referenced without appropriate ® or ™ notation.",
                "low",
                "RULE_COMPLIANCE_TRADEMARK_NOTATION",
                "Append registered trademark symbol ® on first reference in commercial copy."
            )
        ]

    async def scan(
        self,
        content: str,
        content_type: str,
        metadata: Optional[Dict[str, Any]] = None,
        rule_weights: Optional[Dict[str, float]] = None,
        dynamic_rules: Optional[List[Dict[str, Any]]] = None
    ) -> AgentResult:
        weights = rule_weights or {}
        w_fin = weights.get("RULE_COMPLIANCE_FINANCIAL_PROMISES", 1.0)
        w_ftc = weights.get("RULE_COMPLIANCE_FTC_DISCLOSURE", 1.0)
        w_med = weights.get("RULE_COMPLIANCE_FDA_HEALTH_CLAIMS", 1.0)
        w_tm = weights.get("RULE_COMPLIANCE_TRADEMARK_NOTATION", 1.0)

        flagged_spans: List[FlaggedSpan] = []
        lower_content = content.lower()
        score_accumulator = 0.0
        meta = metadata or {}
        channel = meta.get("channel", "").lower()

        # 1. Financial check
        for pat, issue, sev, rule_id, sug in self.financial_hazard_patterns:
            for match in re.finditer(pat, lower_content):
                # Check if safe disclaimer exists in text
                if "not financial advice" not in lower_content and "capital at risk" not in lower_content:
                    flagged_spans.append(
                        FlaggedSpan(
                            start=match.start(),
                            end=match.end(),
                            text=content[match.start():match.end()],
                            issue=issue,
                            severity=sev,
                            suggestion=sug
                        )
                    )
                    score_accumulator += 0.65 * w_fin

        # 2. Influencer / Social endorsement check
        if any(c in channel for c in ["instagram", "tiktok", "twitter", "social", "youtube", "influencer"]):
            has_explicit_ad = bool(re.search(r"(#ad|#sponsored|#partner|paid partnership)", lower_content))
            for pat, issue, sev, rule_id, sug in self.influencer_disclosure_patterns:
                for match in re.finditer(pat, lower_content):
                    if not has_explicit_ad:
                        flagged_spans.append(
                            FlaggedSpan(
                                start=match.start(),
                                end=match.end(),
                                text=content[match.start():match.end()],
                                issue=issue,
                                severity=sev,
                                suggestion=sug
                            )
                        )
                        score_accumulator += 0.50 * w_ftc

        # 3. Medical check
        for pat, issue, sev, rule_id, sug in self.medical_hazard_patterns:
            for match in re.finditer(pat, lower_content):
                if "not evaluated by the fda" not in lower_content:
                    flagged_spans.append(
                        FlaggedSpan(
                            start=match.start(),
                            end=match.end(),
                            text=content[match.start():match.end()],
                            issue=issue,
                            severity=sev,
                            suggestion=sug
                        )
                    )
                    score_accumulator += 0.70 * w_med

        # 4. Dynamic Rules
        if dynamic_rules:
            for dyn_rule in dynamic_rules:
                if dyn_rule.get("category") == "compliance" and dyn_rule.get("status") == "approved":
                    for phrase in dyn_rule.get("detected_phrases", []):
                        if phrase.lower() in lower_content:
                            idx = lower_content.find(phrase.lower())
                            flagged_spans.append(
                                FlaggedSpan(
                                    start=idx,
                                    end=idx + len(phrase),
                                    text=content[idx:idx + len(phrase)],
                                    issue=f"[Learned Compliance Rule] {dyn_rule.get('pattern_description')}",
                                    severity="high",
                                    suggestion="Add mandated regulatory compliance clause."
                                )
                            )
                            score_accumulator += 0.55

        final_score = min(1.0, score_accumulator)
        flagged = final_score >= 0.25

        if len(flagged_spans) == 0:
            confidence = 0.97
            explanation = "Legal and regulatory compliance clear. No statutory risks detected."
            severity = "clean"
        elif final_score >= 0.65:
            confidence = 0.95
            explanation = f"Statutory / regulatory breach alert: {len(flagged_spans)} missing disclosures or high-liability claims identified."
            severity = "critical"
        else:
            confidence = 0.81
            explanation = f"Compliance note: {len(flagged_spans)} potential disclaimer omission(s) noted."
            severity = "medium"

        suggestions = [s.suggestion for s in flagged_spans if s.suggestion]

        return AgentResult(
            agent_type=self.agent_type,
            agent_name=self.name,
            score=round(final_score, 2),
            confidence=round(confidence, 2),
            flagged=flagged,
            severity=severity,
            rule_violated="RULE_COMPLIANCE_STATUTORY_REQUIREMENTS" if flagged else None,
            flagged_spans=flagged_spans,
            explanation=explanation,
            suggestions=suggestions[:3]
        )
