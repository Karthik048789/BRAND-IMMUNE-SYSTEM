from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.app.models.schemas import RuleWeight

class AdaptiveThresholdService:
    def __init__(self):
        # Initial antibody rule set with calibrated weights and thresholds
        self._rules: Dict[str, Dict[str, Any]] = {
            "RULE_TONE_SLANG": {
                "rule_id": "RULE_TONE_SLANG",
                "rule_name": "Informal Slang & Colloquialisms",
                "category": "tone",
                "current_weight": 1.0,
                "threshold": 0.45,
                "default_weight": 1.0,
                "override_count": 2,
                "accept_override_count": 2,
                "reject_override_count": 0,
                "last_updated": datetime.now().isoformat(),
                "description": "Flags non-standard colloquialisms, internet slang, and informal terminology."
            },
            "RULE_TONE_AGGRESSIVE_URGENCY": {
                "rule_id": "RULE_TONE_AGGRESSIVE_URGENCY",
                "rule_name": "Aggressive Urgency & Pressure",
                "category": "tone",
                "current_weight": 1.0,
                "threshold": 0.50,
                "default_weight": 1.0,
                "override_count": 0,
                "accept_override_count": 0,
                "reject_override_count": 0,
                "last_updated": datetime.now().isoformat(),
                "description": "Flags desperate or coercive calls to action that degrade brand trust."
            },
            "RULE_FACTUAL_SUPERLATIVES": {
                "rule_id": "RULE_FACTUAL_SUPERLATIVES",
                "rule_name": "Unsubstantiated Superlatives",
                "category": "factual",
                "current_weight": 1.0,
                "threshold": 0.50,
                "default_weight": 1.0,
                "override_count": 1,
                "accept_override_count": 1,
                "reject_override_count": 0,
                "last_updated": datetime.now().isoformat(),
                "description": "Flags claims of #1 ranking, infinite capability, or 100% cure."
            },
            "RULE_FACTUAL_UNVERIFIED_CLAIMS": {
                "rule_id": "RULE_FACTUAL_UNVERIFIED_CLAIMS",
                "rule_name": "Unverified Statistical Metrics",
                "category": "factual",
                "current_weight": 1.0,
                "threshold": 0.55,
                "default_weight": 1.0,
                "override_count": 0,
                "accept_override_count": 0,
                "reject_override_count": 0,
                "last_updated": datetime.now().isoformat(),
                "description": "Flags statistical percentage metrics presented without rigorous evidence."
            },
            "RULE_VISUAL_CLEARSPACE_BREACH": {
                "rule_id": "RULE_VISUAL_CLEARSPACE_BREACH",
                "rule_name": "Logo Clearspace Exclusion Zone",
                "category": "visual",
                "current_weight": 1.0,
                "threshold": 0.40,
                "default_weight": 1.0,
                "override_count": 0,
                "accept_override_count": 0,
                "reject_override_count": 0,
                "last_updated": datetime.now().isoformat(),
                "description": "Enforces 24px exclusion perimeter around primary brand mark."
            },
            "RULE_VISUAL_CONTRAST_RATIO": {
                "rule_id": "RULE_VISUAL_CONTRAST_RATIO",
                "rule_name": "WCAG AA Contrast Ratio (<4.5:1)",
                "category": "visual",
                "current_weight": 0.95,
                "threshold": 0.45,
                "default_weight": 1.0,
                "override_count": 3,
                "accept_override_count": 2,
                "reject_override_count": 1,
                "last_updated": datetime.now().isoformat(),
                "description": "Ensures text overlay meets accessibility standards on visual assets."
            },
            "RULE_COMPLIANCE_FTC_DISCLOSURE": {
                "rule_id": "RULE_COMPLIANCE_FTC_DISCLOSURE",
                "rule_name": "Mandatory Influencer #ad Disclosure",
                "category": "compliance",
                "current_weight": 1.0,
                "threshold": 0.50,
                "default_weight": 1.0,
                "override_count": 0,
                "accept_override_count": 0,
                "reject_override_count": 0,
                "last_updated": datetime.now().isoformat(),
                "description": "Mandates clear & conspicuous #ad disclosure on commercial partner assets."
            },
            "RULE_COMPLIANCE_FINANCIAL_PROMISES": {
                "rule_id": "RULE_COMPLIANCE_FINANCIAL_PROMISES",
                "rule_name": "Statutory Financial Disclaimers",
                "category": "compliance",
                "current_weight": 1.0,
                "threshold": 0.60,
                "default_weight": 1.0,
                "override_count": 0,
                "accept_override_count": 0,
                "reject_override_count": 0,
                "last_updated": datetime.now().isoformat(),
                "description": "Flags unqualified guarantees of profit, yield, or capital preservation."
            }
        }
        self._history: List[Dict[str, Any]] = [
            {
                "timestamp": datetime.now().isoformat(),
                "rule_id": "RULE_VISUAL_CONTRAST_RATIO",
                "previous_weight": 1.0,
                "new_weight": 0.95,
                "previous_threshold": 0.40,
                "new_threshold": 0.45,
                "reason": "Recalibrated: 2 false-positive overrides on artistic dark-mode assets.",
                "override_type": "FALSE_POSITIVE"
            }
        ]

    def get_all_rules(self) -> List[RuleWeight]:
        return [RuleWeight(**r) for r in self._rules.values()]

    def get_weight_map(self) -> Dict[str, float]:
        return {r_id: data["current_weight"] for r_id, data in self._rules.items()}

    def get_rule(self, rule_id: str) -> Optional[Dict[str, Any]]:
        return self._rules.get(rule_id)

    def record_human_override(self, rule_id: str, is_false_positive: bool, reviewer_comment: str = ""):
        """
        PRD FR6: Every decision becomes a labeled training example.
        Recalculates rule sensitivity (adaptive thresholding) based on override frequency.
        """
        rule = self._rules.get(rule_id)
        if not rule:
            return

        rule["override_count"] += 1
        prev_weight = rule["current_weight"]
        prev_thresh = rule["threshold"]

        if is_false_positive:
            # AI flagged this, but human marked it Acceptable (False Positive).
            # We want to lower sensitivity to reduce reviewer alert fatigue!
            rule["accept_override_count"] += 1
            # Adaptive step: reduce weight by 0.08 per false positive override (min 0.35)
            new_weight = max(0.35, round(prev_weight - 0.08, 2))
            # Shift threshold upward so it requires higher severity to trigger
            new_thresh = min(0.85, round(prev_thresh + 0.05, 2))
            reason = f"Adaptive threshold shift: Overturned by reviewer ({reviewer_comment or 'Marked false positive'}). Sensitivity lowered to reduce alert fatigue."
        else:
            # Human confirmed rejection or caught missed violation
            rule["reject_override_count"] += 1
            # Reinforce rule sensitivity
            new_weight = min(1.30, round(prev_weight + 0.04, 2))
            new_thresh = max(0.30, round(prev_thresh - 0.02, 2))
            reason = f"Rule reinforced: Violation confirmed by reviewer ({reviewer_comment or 'Policy breach confirmed'})."

        rule["current_weight"] = new_weight
        rule["threshold"] = new_thresh
        rule["last_updated"] = datetime.now().isoformat()

        self._history.append({
            "timestamp": datetime.now().isoformat(),
            "rule_id": rule_id,
            "rule_name": rule["rule_name"],
            "previous_weight": prev_weight,
            "new_weight": new_weight,
            "previous_threshold": prev_thresh,
            "new_threshold": new_thresh,
            "reason": reason,
            "override_type": "FALSE_POSITIVE" if is_false_positive else "CONFIRMED_BREACH"
        })

    def simulate_overrides_demo(self, rule_id: str = "RULE_TONE_SLANG", count: int = 4) -> Dict[str, Any]:
        """
        Interactive demo tool specifically for Hackathon evaluation (PRD Page 3 & Page 8):
        'At least one adaptive threshold shift is demonstrable (before/after override scenario)'.
        """
        rule = self._rules.get(rule_id)
        if not rule:
            return {"error": "Rule not found"}

        initial_weight = rule["current_weight"]
        initial_threshold = rule["threshold"]

        for i in range(count):
            self.record_human_override(
                rule_id=rule_id,
                is_false_positive=True,
                reviewer_comment=f"Demo automated batch override #{i+1}: Accept slang in casual social teaser"
            )

        return {
            "rule_id": rule_id,
            "rule_name": rule["rule_name"],
            "before": {
                "weight": initial_weight,
                "threshold": initial_threshold
            },
            "after": {
                "weight": rule["current_weight"],
                "threshold": rule["threshold"]
            },
            "overrides_applied": count,
            "explanation": f"Adaptive learning successfully re-weighted '{rule['rule_name']}'. Weight shifted from {initial_weight} -> {rule['current_weight']}, raising detection threshold from {initial_threshold} -> {rule['threshold']} to prevent future alert fatigue."
        }

    def set_manual_override(self, rule_id: str, new_weight: float, reason: str):
        rule = self._rules.get(rule_id)
        if not rule:
            return
        prev = rule["current_weight"]
        rule["current_weight"] = max(0.1, min(2.0, round(new_weight, 2)))
        rule["last_updated"] = datetime.now().isoformat()
        self._history.append({
            "timestamp": datetime.now().isoformat(),
            "rule_id": rule_id,
            "rule_name": rule["rule_name"],
            "previous_weight": prev,
            "new_weight": rule["current_weight"],
            "reason": f"Manual Admin adjustment: {reason}",
            "override_type": "MANUAL_ADMIN"
        })

    def get_history(self, limit: int = 20) -> List[Dict[str, Any]]:
        return sorted(self._history, key=lambda x: x["timestamp"], reverse=True)[:limit]

adaptive_service = AdaptiveThresholdService()
