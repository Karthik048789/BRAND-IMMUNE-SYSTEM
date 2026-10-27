import re
from typing import Dict, Any, List, Optional
from backend.app.agents.base_agent import BaseAgent
from backend.app.models.schemas import AgentResult, AgentType, FlaggedSpan

class ToneAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentType.TONE, "Tone & Voice Agent")
        
        # Seed brand tone patterns
        self.slang_terms = [
            "bruh", "no cap", "fr fr", "sus", "yolo", "slaps", "delulu", 
            "rizz", "skibidi", "lowkey", "highkey", "mid", "clout", "omg"
        ]
        self.aggressive_urgency = [
            r"buy now or (regret|die|cry)",
            r"hurry (up )?before (it'?s too late|we run out forever)",
            r"don'?t be (stupid|an idiot|dumb)",
            r"you'?d be crazy not to buy",
            r"wake up and buy"
        ]
        self.clickbait_tropes = [
            r"you won'?t believe what",
            r"shocking (secret|truth) revealed",
            r"doctors hate this (one )?trick",
            r"this will blow your mind",
            r"crazy hack that breaks the internet"
        ]
        self.competitor_disparagement = [
            r"(competitors|rivals) are (trash|garbage|clowns|idiots|useless)",
            r"everyone else is a joke",
            r"our competition is a scam"
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
        w_slang = weights.get("RULE_TONE_SLANG", 1.0)
        w_urgency = weights.get("RULE_TONE_AGGRESSIVE_URGENCY", 1.0)
        w_clickbait = weights.get("RULE_TONE_CLICKBAIT", 1.0)
        w_disparagement = weights.get("RULE_TONE_COMPETITOR_DISPARAGEMENT", 1.0)

        flagged_spans: List[FlaggedSpan] = []
        lower_content = content.lower()
        score_accumulator = 0.0

        # Check Slang
        for word in self.slang_terms:
            pattern = rf"\b{re.escape(word)}\b"
            for match in re.finditer(pattern, lower_content):
                flagged_spans.append(
                    FlaggedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=content[match.start():match.end()],
                        issue=f"Colloquial/informal slang '{match.group()}' violates brand standard tone.",
                        severity="medium" if w_slang > 0.8 else "low",
                        suggestion="Replace with polished, professional language adhering to brand voice."
                    )
                )
                score_accumulator += 0.25 * w_slang

        # Check Aggressive Urgency
        for pat in self.aggressive_urgency:
            for match in re.finditer(pat, lower_content):
                flagged_spans.append(
                    FlaggedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=content[match.start():match.end()],
                        issue="Aggressive/desperate urgency detected. Conflicts with premium brand positioning.",
                        severity="high",
                        suggestion="Use measured invitation or value-driven call to action."
                    )
                )
                score_accumulator += 0.45 * w_urgency

        # Check Clickbait
        for pat in self.clickbait_tropes:
            for match in re.finditer(pat, lower_content):
                flagged_spans.append(
                    FlaggedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=content[match.start():match.end()],
                        issue="Clickbait sensationalism detected.",
                        severity="medium",
                        suggestion="Focus on authentic feature benefits rather than tabloid phrasing."
                    )
                )
                score_accumulator += 0.35 * w_clickbait

        # Check Competitor Disparagement
        for pat in self.competitor_disparagement:
            for match in re.finditer(pat, lower_content):
                flagged_spans.append(
                    FlaggedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=content[match.start():match.end()],
                        issue="Unethical competitor disparagement violates fair marketing standards.",
                        severity="high",
                        suggestion="Emphasize our unique technological advantages rather than attacking rivals."
                    )
                )
                score_accumulator += 0.60 * w_disparagement

        # Check Excessive ALL CAPS (shouting)
        words = re.findall(r'\b[A-Z]{4,}\b', content)
        # Exclude common corporate acronyms
        acronym_allowlist = {"NASA", "HTML", "SaaS", "IEEE", "GDPR", "REST", "JSON", "AI", "API", "B2B"}
        shouting_words = [w for w in words if w not in acronym_allowlist]
        if len(shouting_words) >= 2:
            flagged_spans.append(
                FlaggedSpan(
                    start=None,
                    end=None,
                    text=", ".join(shouting_words[:4]),
                    issue="Excessive capitalized shouting words detected.",
                    severity="low",
                    suggestion="Use title case or sentence case for emphasis."
                )
            )
            score_accumulator += 0.20

        # Check Dynamic Approved Rules
        if dynamic_rules:
            for dyn_rule in dynamic_rules:
                if dyn_rule.get("category") == "tone" and dyn_rule.get("status") == "approved":
                    for phrase in dyn_rule.get("detected_phrases", []):
                        if phrase.lower() in lower_content:
                            idx = lower_content.find(phrase.lower())
                            flagged_spans.append(
                                FlaggedSpan(
                                    start=idx,
                                    end=idx + len(phrase),
                                    text=content[idx:idx + len(phrase)],
                                    issue=f"[Learned Rule] {dyn_rule.get('pattern_description')}",
                                    severity="high",
                                    suggestion="Adjust phrasing to comply with newly learned brand policy."
                                )
                            )
                            score_accumulator += 0.50

        # Normalize score
        final_score = min(1.0, score_accumulator)
        flagged = final_score >= 0.25
        
        # Confidence calculation
        if len(flagged_spans) == 0:
            confidence = 0.95
            explanation = "Tone is well-calibrated, professional, and consistent with core brand guidelines."
            severity = "clean"
        elif final_score > 0.6:
            confidence = 0.92
            explanation = f"High severity tone violation: {len(flagged_spans)} off-brand markers found (slang, aggression, or sensationalism)."
            severity = "high"
        else:
            confidence = 0.78
            explanation = f"Moderate tone inconsistency: {len(flagged_spans)} borderline phrases identified."
            severity = "medium"

        suggestions = [s.suggestion for s in flagged_spans if s.suggestion]

        return AgentResult(
            agent_type=self.agent_type,
            agent_name=self.name,
            score=round(final_score, 2),
            confidence=round(confidence, 2),
            flagged=flagged,
            severity=severity,
            rule_violated="RULE_TONE_VOICE_CONSISTENCY" if flagged else None,
            flagged_spans=flagged_spans,
            explanation=explanation,
            suggestions=suggestions[:3]
        )
