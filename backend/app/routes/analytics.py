from fastapi import APIRouter
from typing import List
from backend.app.models.schemas import AnalyticsOverview, AuditLog
from backend.app.services.analytics_service import analytics_service
from backend.app.services.clustering_service import clustering_service
from backend.app.data.store import global_store

router = APIRouter(prefix="/api/analytics", tags=["Analytics & Reporting"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview():
    """
    FR8: System displays flag volume trends, false-positive rate, average response time,
    rule performance, and channel risk breakdown.
    """
    global_store.initialize()
    active_proposed = len([r for r in clustering_service.get_all_proposed_rules() if r.status == "approved"])
    return analytics_service.get_overview(
        submissions=global_store.submissions,
        human_decisions=global_store.human_decisions,
        proposed_rules_count=active_proposed
    )

@router.get("/audit-logs", response_model=List[AuditLog])
def get_audit_trail(limit: int = 50):
    """
    FR8 & 2.2: Retrieve immutable audit trail of all automated scans, human reviews,
    adaptive shifts, and rule approvals.
    """
    return analytics_service.get_audit_logs(limit=limit)
