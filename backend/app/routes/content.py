import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from backend.app.models.schemas import ContentSubmissionCreate, ContentSubmission, SubmissionStatus, RoutingDecision
from backend.app.agents.orchestrator import orchestrator
from backend.app.services.routing_service import routing_service
from backend.app.services.adaptive_threshold_service import adaptive_service
from backend.app.services.clustering_service import clustering_service
from backend.app.services.analytics_service import analytics_service
from backend.app.data.store import global_store

router = APIRouter(prefix="/api/content", tags=["Content Ingestion & Scanning"])

def initialize_content_store():
    global_store.initialize()

@router.on_event("startup")
def startup_init():
    global_store.initialize()

@router.post("/scan", response_model=ContentSubmission)
async def scan_content(submission_in: ContentSubmissionCreate):
    """
    FR1 & FR2: Ingest content and run parallel checks across all 4 Antibody Agents:
    Tone, Factual, Visual, Compliance.
    FR3 & FR4: Query Memory Bank and compute confidence scoring & routing.
    """
    global_store.initialize()
    start_time = datetime.now()

    # 1. Fetch current adaptive rule weights & approved dynamic rules
    rule_weights = adaptive_service.get_weight_map()
    dynamic_rules = clustering_service.get_approved_dynamic_rules()

    # 2. Parallel multi-agent scan
    metadata = submission_in.metadata or {}
    metadata["channel"] = submission_in.channel
    agent_results = await orchestrator.scan_content(
        content=submission_in.raw_content,
        content_type=submission_in.content_type.value,
        metadata=metadata,
        rule_weights=rule_weights,
        dynamic_rules=dynamic_rules
    )

    # 3. Confidence scoring and routing
    routing_summary = routing_service.compute_routing(
        content=submission_in.raw_content,
        agent_results=agent_results
    )

    # 4. Determine initial status based on routing decision
    if routing_summary.decision == RoutingDecision.AUTO_PASS:
        status = SubmissionStatus.AUTO_PASSED
    elif routing_summary.decision == RoutingDecision.AUTO_FLAG:
        status = SubmissionStatus.AUTO_FLAGGED
    else:
        status = SubmissionStatus.PENDING_REVIEW

    # Measure real scan latency
    latency = (datetime.now() - start_time).total_seconds()
    analytics_service.record_scan_latency(latency)

    # 5. Persist submission
    sub_id = f"SUB_{datetime.now().strftime('%Y%m%d')}_{str(uuid.uuid4())[:6].upper()}"
    new_submission = {
        "id": sub_id,
        "title": submission_in.title,
        "channel": submission_in.channel,
        "content_type": submission_in.content_type.value,
        "raw_content": submission_in.raw_content,
        "image_url": submission_in.image_url,
        "submitter_id": submission_in.submitter_id,
        "created_at": datetime.now().isoformat(),
        "status": status.value,
        "routing": routing_summary.model_dump() if hasattr(routing_summary, "model_dump") else routing_summary.dict(),
        "human_decision": None
    }

    global_store.submissions.insert(0, new_submission)

    # 6. Immutable Audit log
    analytics_service.log_audit(
        actor=submission_in.submitter_id,
        role="Content Submitter",
        action="CONTENT_SCAN",
        entity=f"Submission {sub_id}",
        details=f"Scanned {submission_in.content_type.value} on {submission_in.channel}. Decision: {routing_summary.decision.value.upper()} (Risk: {int(routing_summary.combined_score*100)}%, Conf: {int(routing_summary.combined_confidence*100)}%)."
    )

    return ContentSubmission(**new_submission)

@router.get("/submissions", response_model=List[ContentSubmission])
def list_submissions(
    status: Optional[str] = Query(None, description="Filter by status"),
    channel: Optional[str] = Query(None, description="Filter by channel"),
    search: Optional[str] = Query(None, description="Search keyword in title or content")
):
    global_store.initialize()
    results = global_store.submissions

    if status and status != "all":
        results = [s for s in results if s.get("status") == status]
    if channel and channel != "all":
        results = [s for s in results if (s.get("channel") or "").lower() == channel.lower()]
    if search:
        s_lower = search.lower()
        results = [s for s in results if s_lower in (s.get("title") or "").lower() or s_lower in (s.get("raw_content") or "").lower()]

    return [ContentSubmission(**s) for s in results]

@router.get("/submissions/{submission_id}", response_model=ContentSubmission)
def get_submission(submission_id: str):
    global_store.initialize()
    for s in global_store.submissions:
        if s["id"] == submission_id:
            return ContentSubmission(**s)
    raise HTTPException(status_code=404, detail="Submission not found")
