from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum
from datetime import datetime

class AgentType(str, Enum):
    TONE = "tone"
    FACTUAL = "factual"
    VISUAL = "visual"
    COMPLIANCE = "compliance"

class ContentType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    SOCIAL_POST = "social_post"
    CAMPAIGN_ASSET = "campaign_asset"
    PRESS_RELEASE = "press_release"

class SubmissionStatus(str, Enum):
    PENDING_REVIEW = "pending_review"
    AUTO_PASSED = "auto_passed"
    AUTO_FLAGGED = "auto_flagged"
    REVIEWED_ACCEPTED = "reviewed_accepted"
    REVIEWED_REJECTED = "reviewed_rejected"
    REVIEWED_EDITED = "reviewed_edited"

class RoutingDecision(str, Enum):
    AUTO_PASS = "auto_pass"
    AUTO_FLAG = "auto_flag"
    HUMAN_REVIEW = "human_review"

class DecisionType(str, Enum):
    ACCEPT = "accept"
    REJECT = "reject"
    EDIT = "edit"

class ReasonCode(str, Enum):
    FALSE_POSITIVE = "FALSE_POSITIVE"
    BRAND_ALIGNMENT_EXCEPTION = "BRAND_ALIGNMENT_EXCEPTION"
    POLICY_BREACH_CONFIRMED = "POLICY_BREACH_CONFIRMED"
    OFF_TONE_CONFIRMED = "OFF_TONE_CONFIRMED"
    FACTUAL_ERROR_CONFIRMED = "FACTUAL_ERROR_CONFIRMED"
    LEGAL_RISK_CONFIRMED = "LEGAL_RISK_CONFIRMED"
    VISUAL_GUIDELINE_BREACH = "VISUAL_GUIDELINE_BREACH"
    CONTEXTUAL_NUANCE_APPROVED = "CONTEXTUAL_NUANCE_APPROVED"
    SLIGHT_COPY_EDIT_REQUIRED = "SLIGHT_COPY_EDIT_REQUIRED"

# Request Models
class ContentSubmissionCreate(BaseModel):
    title: str = Field(..., example="Summer Flash Sale Tweet")
    channel: str = Field(..., example="Twitter/X")
    content_type: ContentType = ContentType.SOCIAL_POST
    raw_content: str = Field(..., example="Don't miss the CRAZIEST deals in the galaxy! 100% cure for high prices guaranteed!")
    image_url: Optional[str] = None
    submitter_id: str = "creator_user_1"
    metadata: Optional[Dict[str, Any]] = None

class HumanDecisionCreate(BaseModel):
    content_id: str
    reviewer_id: str = "reviewer_alice"
    reviewer_name: str = "Alice Jenkins (Senior Brand Guardian)"
    decision: DecisionType
    reason_code: ReasonCode
    comment: str
    edited_content: Optional[str] = None

class RuleWeightUpdate(BaseModel):
    rule_id: str
    manual_weight: float
    reason: str

class RuleApprovalRequest(BaseModel):
    cluster_id: str
    approved: bool
    notes: Optional[str] = None
    reviewer_id: str = "brand_manager_marcus"

# Agent Scan Models
class FlaggedSpan(BaseModel):
    start: Optional[int] = None
    end: Optional[int] = None
    text: str
    issue: str
    severity: str # "high", "medium", "low"
    suggestion: Optional[str] = None

class AgentResult(BaseModel):
    agent_type: AgentType
    agent_name: str
    score: float # 0.0 (clean) to 1.0 (severe violation)
    confidence: float # 0.0 to 1.0 certainty
    flagged: bool
    severity: str # "clean", "low", "medium", "high", "critical"
    rule_violated: Optional[str] = None
    flagged_spans: List[FlaggedSpan] = []
    explanation: str
    suggestions: List[str] = []

class MemoryMatch(BaseModel):
    case_id: str
    title: str
    content_snippet: str
    resolution: str # "approved", "rejected", "edited"
    similarity: float # 0.0 to 1.0 (e.g. 0.92 = 92% match)
    label: str
    reason: str
    timestamp: str

class RoutingSummary(BaseModel):
    combined_score: float # 0.0 to 1.0
    combined_confidence: float # 0.0 to 1.0
    decision: RoutingDecision
    route_reason: str
    top_memory_match: Optional[MemoryMatch] = None
    matched_cases: List[MemoryMatch] = []
    agent_breakdown: Dict[str, AgentResult]
    explainability: str

class ContentSubmission(BaseModel):
    id: str
    title: str
    channel: str
    content_type: ContentType
    raw_content: str
    image_url: Optional[str] = None
    submitter_id: str
    created_at: str
    status: SubmissionStatus
    routing: RoutingSummary
    human_decision: Optional[Dict[str, Any]] = None

class RuleWeight(BaseModel):
    rule_id: str
    rule_name: str
    category: str
    current_weight: float # Sensitivity multiplier / weight
    threshold: float
    default_weight: float
    override_count: int
    accept_override_count: int # Flagged by AI but accepted by human (false positive indicator)
    reject_override_count: int # Missed by AI or agreed reject
    last_updated: str
    description: str

class ProposedRule(BaseModel):
    cluster_id: str
    rule_name: str
    category: str
    pattern_description: str
    detected_phrases: List[str]
    example_case_ids: List[str]
    example_snippets: List[str]
    cluster_size: int
    confidence: float
    status: str # "pending_approval", "approved", "rejected"
    suggested_action: str # "auto_flag" or "require_review"
    created_at: str
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None

class AuditLog(BaseModel):
    id: str
    actor: Optional[str] = "System"
    role: Optional[str] = "System"
    action: Optional[str] = "EVENT"
    entity: Optional[str] = "General"
    details: Optional[str] = ""
    timestamp: str

class AnalyticsOverview(BaseModel):
    total_scanned: int
    auto_passed: int
    auto_flagged: int
    pending_human_review: int
    human_resolved: int
    false_positive_rate: float
    false_positive_trend: List[Dict[str, Any]]
    turnaround_time_seconds: float
    channel_risk_breakdown: Dict[str, Dict[str, Any]]
    agent_flag_distribution: Dict[str, int]
    active_antibodies_count: int
    learned_rules_count: int
