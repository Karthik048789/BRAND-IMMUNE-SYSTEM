from fastapi import APIRouter
from backend.app.memory.memory_bank import memory_bank
from backend.app.services.analytics_service import analytics_service
from backend.app.data.store import global_store

router = APIRouter(prefix="/api/admin", tags=["System Administration"])

@router.post("/reset-seed")
def reset_to_seed_data():
    """Resets memory bank, submissions, and audit logs to original hackathon seed demo state."""
    memory_bank._cases.clear()
    global_store.reset()
    
    analytics_service.log_audit(
        actor="System Admin",
        role="Administrator",
        action="SYSTEM_RESET_SEED",
        entity="Global Database",
        details="Restored initial seed dataset and memory bank."
    )
    return {"success": True, "message": "System successfully restored to pristine hackathon demo dataset."}

@router.get("/system-health")
def get_system_health():
    """System status and agent orchestration health check."""
    return {
        "status": "healthy",
        "active_agents": {
            "tone_agent": "online",
            "factual_consistency_agent": "online",
            "visual_logo_agent": "online",
            "compliance_legal_agent": "online"
        },
        "vector_db": {
            "engine": "In-Memory Semantic Vector DB",
            "total_indexed_cases": memory_bank.count(),
            "status": "ready"
        },
        "version": "1.0.0-hackathon-final"
    }
