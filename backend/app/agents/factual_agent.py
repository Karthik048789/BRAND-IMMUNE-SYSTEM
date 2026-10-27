import re
from typing import Dict, Any, List, Optional
from backend.app.agents.base_agent import BaseAgent
from backend.app.models.schemas import AgentResult, AgentType, FlaggedSpan

class FactualAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentType.FACTUAL, "Factual Consistency Agent")
        
        self.superlatives = [
            r"#\s*1\s+(brand|platform|app|tool|product)\s+in\s+the\s+(world|universe|galaxy|market)",
            r"(cure[s]?|eliminat(es|ing))\s+100%\s+of\s+(disease[s]?|problems|risk[s]?)",
            r"(absolute(ly)?|completely)\s+(zero|no)\s+(latency|bugs|flaws|competition)",
            r"the\s+only\s+(company|software|solution)\s+on\s+earth",
            r"infinitely\s+(scalable|fast|secure)",
            r"unmatched\s+by\s+any\s+human\s+or\s+machine",
            r"100%\s+foolproof",
            r"100%\s+guaranteed\s+(success|cure|profit)"
        ]

        self.fake_metrics = [
            r"proven\s+by\s+100%\s+of\s+scientists",
            r"99\.999%\s+(instant\s+growth|revenue\s+increase)",
            r"guaranteed\s+to\s+double\s+your\s+income",
            r"statistically\s+impossible\s+to\s+fail"
        ]

        self.missing_citations = [
            r"\b\d{2,3}%\s+faster\b",
            r"\b\d{2,3}x\s+more\s+effective\b",
            r"\b[0-9]+k\s+new\s+users\s+every\s+minute\b"
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
        w_super = weights.get("RULE_FACTUAL_SUPERLATIVES", 1.0)
        w_metrics = weights.get("RULE_FACTUAL_UNVERIFIED_CLAIMS", 1.0)
        w_citations = weights.get("RULE_FACTUAL_CITATION_REQUIRED", 1.0)

        flagged_spans: List[FlaggedSpan] = []
        lower_content = content.lower()
        score_accumulator = 0.0

        # Check Superlatives
        for pat in self.superlatives:
            for match in re.finditer(pat, lower_content):
                flagged_spans.append(
                    FlaggedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=content[match.start():match.end()],
                        issue="Unsubstantiated absolute superlative / health/performance guarantee.",
                        severity="high",
                        suggestion="Softify to verifiable comparative claim (e.g. 'Industry-leading performance', 'Designed for maximum reliability')."
                    )
                )
                score_accumulator += 0.50 * w_super

        # Check Fake Metrics / Unverifiable Promises
        for pat in self.fake_metrics:
            for match in re.finditer(pat, lower_content):
                flagged_spans.append(
                    FlaggedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=content[match.start():match.end()],
                        issue="High-risk unqualified metric claim without empirical validation backing.",
                        severity="critical" if w_metrics > 0.9 else "high",
                        suggestion="Provide specific verifiable third-party benchmark study reference or remove numerical claim."
                    )
                )
                score_accumulator += 0.60 * w_metrics

        # Check Missing Citations for High-claim Statistics
        for pat in self.missing_citations:
            for match in re.finditer(pat, lower_content):
                # If there's an asterisk or source footnote nearby, give benefit of doubt
                has_source = "*" in content or "source:" in lower_content or "study" in lower_content
                if not has_source:
                    flagged_spans.append(
                        FlaggedSpan(
                            start=match.start(),
                            end=match.end(),
                            text=content[match.start():match.end()],
                            issue="Statistical performance claim presented without an accompanying source citation or footnote.",
                            severity="medium",
                            suggestion="Append an asterisk with testing methodology reference (e.g., '*Based on internal lab benchmarks Q1 2026')."
                        )
                    )
                    score_accumulator += 0.30 * w_citations

        # Check Dynamic Rules
        if dynamic_rules:
            for dyn_rule in dynamic_rules:
                if dyn_rule.get("category") == "factual" and dyn_rule.get("status") == "approved":
                    for phrase in dyn_rule.get("detected_phrases", []):
                        if phrase.lower() in lower_content:
                            idx = lower_content.find(phrase.lower())
                            flagged_spans.append(
                                FlaggedSpan(
                                    start=idx,
                                    end=idx + len(phrase),
                                    text=content[idx:idx + len(phrase)],
                                    issue=f"[Learned Factual Rule] {dyn_rule.get('pattern_description')}",
                                    severity="high",
                                    suggestion="Verify factual accuracy with engineering / product documentation."
                                )
                            )
                            score_accumulator += 0.55

        final_score = min(1.0, score_accumulator)
        flagged = final_score >= 0.25

        if len(flagged_spans) == 0:
            confidence = 0.96
            explanation = "Claims are verified, defensible, and conform to factual substantiation standards."
            severity = "clean"
        elif final_score >= 0.7:
            confidence = 0.94
            explanation = f"Critical factual hazard: {len(flagged_spans)} unsupported absolute claims found that could invite false advertising scrutiny."
            severity = "critical"
        else:
            confidence = 0.82
            explanation = f"Unsubstantiated factual claim: {len(flagged_spans)} statements require footnote substantiation."
            severity = "medium"

        suggestions = [s.suggestion for s in flagged_spans if s.suggestion]

        return AgentResult(
            agent_type=self.agent_type,
            agent_name=self.name,
            score=round(final_score, 2),
            confidence=round(confidence, 2),
            flagged=flagged,
            severity=severity,
            rule_violated="RULE_FACTUAL_SUBSTANTIATION" if flagged else None,
            flagged_spans=flagged_spans,
            explanation=explanation,
            suggestions=suggestions[:3]
        )
