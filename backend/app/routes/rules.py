from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from backend.app.models.schemas import RuleWeight, ProposedRule, RuleWeightUpdate, RuleApprovalRequest
from backend.app.services.adaptive_threshold_service import adaptive_service
from backend.app.services.clustering_service import clustering_service
from backend.app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/rules", tags=["Adaptive Rules & Clustering Management"])

@router.get("/weights", response_model=List[RuleWeight])
def get_rule_weights():
    """FR6: Fetch all active antibody rule sensitivity weights and detection thresholds."""
    return adaptive_service.get_all_rules()

@router.post("/weights/manual")
def update_rule_weight_manual(body: RuleWeightUpdate):
    """Admin manual override of rule weight."""
    adaptive_service.set_manual_override(body.rule_id, body.manual_weight, body.reason)
    analytics_service.log_audit(
        actor="Admin",
        role="Administrator",
        action="RULE_WEIGHT_MANUAL_OVERRIDE",
        entity=body.rule_id,
        details=f"Updated sensitivity to {body.manual_weight}. Reason: {body.reason}"
    )
    return {"success": True, "message": f"Rule {body.rule_id} weight updated."}

@router.post("/weights/simulate-shift")
def simulate_adaptive_shift_demo(rule_id: Optional[str] = None):
    """
    PRD Page 3 & Page 8 Demo requirement:
    'At least one adaptive threshold shift is demonstrable (before/after override scenario)'.
    Simulates consecutive reviewer false-positive overrides and triggers immediate weight shift.
    """
    target_rule = rule_id or "RULE_TONE_SLANG"
    result = adaptive_service.simulate_overrides_demo(rule_id=target_rule, count=4)
    if "error" in result:
        # Fallback to first available rule if specified rule not found
        all_rules = adaptive_service.get_all_rules()
        if all_rules:
            result = adaptive_service.simulate_overrides_demo(rule_id=all_rules[0].rule_id, count=4)
        else:
            raise HTTPException(status_code=404, detail=result.get("error", "Rule not found"))

    analytics_service.log_audit(
        actor="Interactive Demo Engine",
        role="System Demo",
        action="ADAPTIVE_THRESHOLD_RECALIBRATION",
        entity=target_rule,
        details=f"Weight shifted {result['before']['weight']} -> {result['after']['weight']}. Threshold adjusted from {result['before']['threshold']} -> {result['after']['threshold']}."
    )
    return result

@router.get("/weights/history")
def get_rule_weight_history():
    """Immutable audit trail of all adaptive threshold shifts."""
    return adaptive_service.get_history()

@router.get("/proposed", response_model=List[ProposedRule])
def get_proposed_rules():
    """
    FR7: Retrieve candidate antibody rules discovered by clustering recurring manual flags.
    """
    return clustering_service.get_all_proposed_rules()

@router.post("/proposed/approve")
def approve_proposed_rule(body: RuleApprovalRequest):
    """
    FR7 & PRD 1.6: Brand Manager approves AI-proposed new rule.
    Immediately deploys the new antibody rule into active multi-agent scanning!
    """
    approved = clustering_service.approve_rule(body.cluster_id, reviewer_id=body.reviewer_id)
    if not approved:
        raise HTTPException(status_code=404, detail="Proposed rule cluster not found")

    analytics_service.log_audit(
        actor=body.reviewer_id,
        role="Brand Manager",
        action="PROPOSED_RULE_APPROVED",
        entity=f"Rule {approved.rule_name}",
        details=f"Brand Manager approved candidate rule '{approved.rule_name}'. Deployed into live antibody scan layer."
    )
    return {
        "success": True,
        "message": f"Rule '{approved.rule_name}' approved and deployed into active antibody scanner.",
        "rule": approved
    }

@router.post("/proposed/reject")
def reject_proposed_rule(body: RuleApprovalRequest):
    """Brand Manager rejects candidate rule."""
    rejected = clustering_service.reject_rule(body.cluster_id, reviewer_id=body.reviewer_id)
    if not rejected:
        raise HTTPException(status_code=404, detail="Proposed rule cluster not found")

    analytics_service.log_audit(
        actor=body.reviewer_id,
        role="Brand Manager",
        action="PROPOSED_RULE_REJECTED",
        entity=f"Rule {rejected.rule_name}",
        details=f"Brand Manager rejected candidate rule. Reason: {body.notes or 'Did not meet brand threshold'}"
    )
    return {
        "success": True,
        "message": f"Rule '{rejected.rule_name}' rejected.",
        "rule": rejected
    }

@router.post("/proposed/discover-demo")
def trigger_demo_clustering():
    """
    PRD Page 3 & Page 8 Demo requirement:
    'At least one proposed new rule surfaces from clustered manual flags during demo'.
    """
    new_rule = clustering_service.trigger_demo_cluster_discovery()
    analytics_service.log_audit(
        actor="HDBSCAN Clustering Engine",
        role="Machine Learning Pipeline",
        action="NEW_RULE_DISCOVERED",
        entity=f"Cluster {new_rule.cluster_id}",
        details=f"Clustering algorithm detected pattern: '{new_rule.rule_name}'. Surfaced for Brand Manager approval."
    )
    return {
        "success": True,
        "message": "Clustering job completed: Surfaced new candidate rule for Brand Manager approval.",
        "rule": new_rule
    }
