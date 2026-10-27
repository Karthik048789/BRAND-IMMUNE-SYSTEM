import re
from typing import Dict, Any, List, Optional
from backend.app.agents.base_agent import BaseAgent
from backend.app.models.schemas import AgentResult, AgentType, FlaggedSpan

class VisualLogoAgent(BaseAgent):
    def __init__(self):
        super().__init__(AgentType.VISUAL, "Visual & Logo Integrity Agent")
        
        self.visual_violation_patterns = [
            (
                r"(stretch(ed|ing)?|distort(ed|ing)?)\s+logo",
                "Logo aspect ratio distortion detected. Logos must maintain fixed proportional aspect ratio (1:1 / 4:1).",
                "high",
                "RULE_VISUAL_LOGO_PROPORTION",
                "Restore original vector aspect ratio without non-uniform scaling."
            ),
            (
                r"(low\s+contrast|yellow\s+text\s+on\s+white|white\s+text\s+on\s+yellow|grey\s+text\s+on\s+black)",
                "Insufficient color contrast ratio (< 4.5:1 WCAG AA) detected on visual text layer.",
                "medium",
                "RULE_VISUAL_CONTRAST_RATIO",
                "Ensure foreground text has minimum 4.5:1 contrast against background asset."
            ),
            (
                r"(legacy\s+202[0-3]|old\s+blue\s+icon|vintage\s+mark|obsolete\s+crest)",
                "Deprecated brand icon/mark referenced. Deprecated since Q4 2024 rebranding.",
                "high",
                "RULE_VISUAL_DEPRECATED_ASSETS",
                "Replace with modern 2026 monochromatic primary shield mark from brand portal."
            ),
            (
                r"(no\s+padding|overlapping\s+logo|touching\s+border|zero\s+margin\s+around\s+logo|text\s+on\s+logo)",
                "Logo clearspace / exclusion zone violation. Minimum 24px exclusion perimeter mandatory.",
                "high",
                "RULE_VISUAL_CLEARSPACE_BREACH",
                "Maintain minimum 24px clearance area surrounding the logo mark on all sides."
            ),
            (
                r"(drop\s+shadow\s+on\s+logo|bevel\s+on\s+logo|gradient\s+fill\s+on\s+monochrome|neon\s+glow\s+logo)",
                "Unauthorized stylization effects applied to primary mark. Brand prohibits bevels, dropshadows, or neon filters.",
                "medium",
                "RULE_VISUAL_UNAUTHORIZED_STYLING",
                "Use flat single-color SVG representation without filter effects."
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
        w_clearspace = weights.get("RULE_VISUAL_CLEARSPACE_BREACH", 1.0)
        w_contrast = weights.get("RULE_VISUAL_CONTRAST_RATIO", 1.0)
        w_styling = weights.get("RULE_VISUAL_UNAUTHORIZED_STYLING", 1.0)

        flagged_spans: List[FlaggedSpan] = []
        lower_content = content.lower()
        score_accumulator = 0.0
        meta = metadata or {}

        # 1. Text pattern scan for design briefs, copy briefs, image metadata descriptions
        for pat, issue_desc, sev, rule_id, sug in self.visual_violation_patterns:
            rule_multiplier = 1.0
            if "CLEARSPACE" in rule_id: rule_multiplier = w_clearspace
            elif "CONTRAST" in rule_id: rule_multiplier = w_contrast
            elif "STYLING" in rule_id: rule_multiplier = w_styling

            for match in re.finditer(pat, lower_content):
                flagged_spans.append(
                    FlaggedSpan(
                        start=match.start(),
                        end=match.end(),
                        text=content[match.start():match.end()],
                        issue=issue_desc,
                        severity=sev,
                        suggestion=sug
                    )
                )
                score_accumulator += (0.40 if sev == "high" else 0.25) * rule_multiplier

        # 2. Check metadata parameters (e.g. if image upload with creative dimensions or contrast ratio)
        if meta.get("logo_padding_px", 50) < 24:
            flagged_spans.append(
                FlaggedSpan(
                    start=None,
                    end=None,
                    text=f"Padding: {meta.get('logo_padding_px')}px",
                    issue=f"Clearspace boundary breach: {meta.get('logo_padding_px')}px provided, minimum 24px required.",
                    severity="high",
                    suggestion="Add 24px padding around logo bounding box."
                )
            )
            score_accumulator += 0.45 * w_clearspace

        if meta.get("contrast_ratio", 7.0) < 4.5:
            flagged_spans.append(
                FlaggedSpan(
                    start=None,
                    end=None,
                    text=f"Contrast: {meta.get('contrast_ratio')}:1",
                    issue="Text overlay fails WCAG AA 4.5:1 contrast requirement.",
                    severity="medium",
                    suggestion="Increase color contrast or add a 40% dark scrim behind text."
                )
            )
            score_accumulator += 0.35 * w_contrast

        # 3. Check Dynamic Rules for Visual
        if dynamic_rules:
            for dyn_rule in dynamic_rules:
                if dyn_rule.get("category") == "visual" and dyn_rule.get("status") == "approved":
                    for phrase in dyn_rule.get("detected_phrases", []):
                        if phrase.lower() in lower_content:
                            idx = lower_content.find(phrase.lower())
                            flagged_spans.append(
                                FlaggedSpan(
                                    start=idx,
                                    end=idx + len(phrase),
                                    text=content[idx:idx + len(phrase)],
                                    issue=f"[Learned Visual Rule] {dyn_rule.get('pattern_description')}",
                                    severity="high",
                                    suggestion="Align visual creative with brand asset repository guidelines."
                                )
                            )
                            score_accumulator += 0.50

        final_score = min(1.0, score_accumulator)
        flagged = final_score >= 0.25

        if len(flagged_spans) == 0:
            confidence = 0.95
            explanation = "Visual assets adhere to logo lockup guidelines, contrast standards, and official color palettes."
            severity = "clean"
        elif final_score >= 0.6:
            confidence = 0.91
            explanation = f"Brand visual integrity risk: {len(flagged_spans)} visual guideline violations detected (logo placement or contrast)."
            severity = "high"
        else:
            confidence = 0.80
            explanation = f"Minor visual discrepancy: {len(flagged_spans)} non-critical visual adjustments recommended."
            severity = "low"

        suggestions = [s.suggestion for s in flagged_spans if s.suggestion]

        return AgentResult(
            agent_type=self.agent_type,
            agent_name=self.name,
            score=round(final_score, 2),
            confidence=round(confidence, 2),
            flagged=flagged,
            severity=severity,
            rule_violated="RULE_VISUAL_IDENTITY_COMPLIANCE" if flagged else None,
            flagged_spans=flagged_spans,
            explanation=explanation,
            suggestions=suggestions[:3]
        )
