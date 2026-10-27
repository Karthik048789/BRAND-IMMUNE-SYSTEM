from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routes.content import router as content_router, initialize_content_store
from backend.app.routes.review import router as review_router
from backend.app.routes.rules import router as rules_router
from backend.app.routes.analytics import router as analytics_router
from backend.app.routes.admin import router as admin_router

app = FastAPI(
    title="Brand Immune System API",
    description="Self-learning brand governance layer that detects violations and continuously learns from human review decisions.",
    version="1.0.0"
)

# Enable CORS for frontend Vite dev server and browser clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(content_router)
app.include_router(review_router)
app.include_router(rules_router)
app.include_router(analytics_router)
app.include_router(admin_router)

@app.on_event("startup")
async def startup_event():
    initialize_content_store()

@app.get("/")
def read_root():
    return {
        "project": "Brand Immune System",
        "tagline": "Self-learning brand governance & antibody defense layer",
        "status": "online",
        "docs_url": "/docs",
        "endpoints": {
            "scan_content": "POST /api/content/scan",
            "submissions": "GET /api/content/submissions",
            "review_queue": "GET /api/review/queue",
            "submit_decision": "POST /api/review/decision",
            "rule_weights": "GET /api/rules/weights",
            "simulate_shift": "POST /api/rules/weights/simulate-shift",
            "proposed_rules": "GET /api/rules/proposed",
            "analytics_overview": "GET /api/analytics/overview",
            "audit_logs": "GET /api/analytics/audit-logs"
        }
    }
