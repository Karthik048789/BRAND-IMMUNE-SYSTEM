from datetime import datetime
from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException
from backend.app.models.schemas import HumanDecisionCreate, ContentSubmission, SubmissionStatus, DecisionType
from backend.app.memory.memory_bank import memory_bank
from backend.app.services.adaptive_threshold_service import adaptive_service
from backend.app.services.clustering_service import clustering_service
from backend.app.services.analytics_service import analytics_service
from backend.app.data.store import global_store

router = APIRouter(prefix="/api/review", tags=["Human-in-the-Loop Review"])

@router.post("/decision")
async def submit_human_decision(decision_in: HumanDecisionCreate):
    """
    FR5 & FR6: Reviewer submits Accept / Reject / Edit decision with mandatory reason code & comment.
    Persists decision, updates memory bank with labeled example, recalculates adaptive rule thresholds,
    and checks for clustering of recurring manual overrides.
    """
    global_store.initialize()
    
    # 1. Locate submission in shared store
    target_sub = None
    for s in global_store.submissions:
        if s["id"] == decision_in.content_id:
            target_sub = s
            break
            
    if not target_sub:
        raise HTTPException(status_code=404, detail=f"Submission {decision_in.content_id} not found")

    if not decision_in.comment or len(decision_in.comment.strip()) < 3:
        raise HTTPException(status_code=400, detail="Mandatory review comment required for audit compliance.")

    now_ts = datetime.now().isoformat()
    decision_record = {
        "content_id": decision_in.content_id,
        "reviewer_id": decision_in.reviewer_id,
        "reviewer_name": decision_in.reviewer_name,
        "decision": decision_in.decision.value,
        "reason_code": decision_in.reason_code.value,
        "comment": decision_in.comment,
        "edited_content": decision_in.edited_content,
        "timestamp": now_ts
    }
    global_store.human_decisions.insert(0, decision_record)

    # 2. Update submission status
    if decision_in.decision == DecisionType.ACCEPT:
        target_sub["status"] = SubmissionStatus.REVIEWED_ACCEPTED.value
        mem_resolution = "approved"
    elif decision_in.decision == DecisionType.REJECT:
        target_sub["status"] = SubmissionStatus.REVIEWED_REJECTED.value
        mem_resolution = "rejected"
    else:
        target_sub["status"] = SubmissionStatus.REVIEWED_EDITED.value
        mem_resolution = "edited"
        if decision_in.edited_content:
            target_sub["raw_content"] = decision_in.edited_content

    target_sub["human_decision"] = decision_record

    # 3. FR6: Store labeled training example in Vector Memory Bank
    unique_case_id = f"CASE_RESOLVED_{decision_in.content_id[-8:]}_{int(datetime.now().timestamp())}"
    memory_bank.add_case(
        case_id=unique_case_id,
        title=target_sub["title"],
        content=target_sub["raw_content"],
        resolution=mem_resolution,
        label=decision_in.reason_code.value,
        reason=f"Human Reviewer ({decision_in.reviewer_name}): {decision_in.comment}",
        category=target_sub.get("channel", "general"),
        reviewer_id=decision_in.reviewer_id,
        timestamp=now_ts
    )

    # 4. FR6: Adaptive Thresholding update
    # Check which rules were flagged by agents
    routing = target_sub.get("routing", {})
    breakdown = routing.get("agent_breakdown", {})
    flagged_rules = []
    for agent_key, res in breakdown.items():
        if isinstance(res, dict) and res.get("flagged") and res.get("rule_violated"):
            flagged_rules.append(res["rule_violated"])

    # If AI missed the violation and human rejected it, strengthen standard rules
    if not flagged_rules and decision_in.decision == DecisionType.REJECT:
        flagged_rules.append("RULE_TONE_SLANG")

    # Determine if reviewer overturned AI flags (False Positive)
    is_false_positive = (
        decision_in.decision == DecisionType.ACCEPT and 
        (decision_in.reason_code.value in ["FALSE_POSITIVE", "BRAND_ALIGNMENT_EXCEPTION", "CONTEXTUAL_NUANCE_APPROVED"] or len(flagged_rules) > 0)
    )

    for rule_id in flagged_rules:
        adaptive_service.record_human_override(
            rule_id=rule_id,
            is_false_positive=is_false_positive,
            reviewer_comment=f"{decision_in.reason_code.value}: {decision_in.comment}"
        )

    # 5. FR7: Real ML Clustering for recurring manual overrides
    # If the human rejected an item or specified a manual policy flag
    if decision_in.decision == DecisionType.REJECT or decision_in.reason_code.value in ["POLICY_BREACH_CONFIRMED", "OFF_TONE_CONFIRMED", "FACTUAL_ERROR_CONFIRMED"]:
        clustering_service.log_manual_flag(
            content_id=decision_in.content_id,
            content=target_sub["raw_content"],
            reason_code=decision_in.reason_code.value,
            comment=decision_in.comment,
            category=target_sub.get("channel", "general")
        )

    # 6. Immutable Audit Log
    analytics_service.log_audit(
        actor=decision_in.reviewer_name,
        role="Human Reviewer",
        action=f"REVIEW_{decision_in.decision.value.upper()}",
        entity=f"Submission {decision_in.content_id}",
        details=f"Decision: {decision_in.decision.value.upper()} [{decision_in.reason_code.value}]. Comment: '{decision_in.comment}'. Added to memory bank."
    )

    return {
        "success": True,
        "message": f"Decision '{decision_in.decision.value}' recorded. Memory bank updated with new labeled precedent.",
        "submission": target_sub,
        "decision": decision_record
    }

@router.get("/queue", response_model=List[ContentSubmission])
def get_pending_review_queue():
    """Returns all items currently awaiting human reviewer evaluation."""
    global_store.initialize()
    pending = [s for s in global_store.submissions if s["status"] == SubmissionStatus.PENDING_REVIEW.value]
    return [ContentSubmission(**s) for s in pending]
