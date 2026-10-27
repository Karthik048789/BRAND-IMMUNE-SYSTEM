from typing import List, Dict, Any
from datetime import datetime, timedelta
from backend.app.memory.memory_bank import memory_bank
from backend.app.models.schemas import (
    ContentType, SubmissionStatus, RoutingDecision, AgentType,
    AgentResult, FlaggedSpan, MemoryMatch, RoutingSummary
)

def populate_seed_memory():
    """Seed memory bank with past resolved brand governance cases."""
    cases = [
        {
            "case_id": "CASE_HIST_101",
            "title": "Q3 Influencer Teaser Campaign",
            "content": "Special thanks to our partners for sending this gift box! Can't wait for you all to try it.",
            "resolution": "rejected",
            "label": "FTC_DISCLOSURE_MISSING",
            "reason": "Missing mandatory #ad disclosure at start of sponsored post. FTC requires unambiguous commercial tagging.",
            "category": "compliance"
        },
        {
            "case_id": "CASE_HIST_102",
            "title": "Autonomous Cloud Launch Press Release",
            "content": "Delivering enterprise cloud infrastructure with industry-leading 99.99% uptime SLA backed by tier-4 data centers.",
            "resolution": "approved",
            "label": "PERFORMANCE_CLAIM_SUBSTANTIATED",
            "reason": "SLA claims accompanied by verified technical architecture appendix.",
            "category": "factual"
        },
        {
            "case_id": "CASE_HIST_103",
            "title": "Cyber Monday Urgency Copy",
            "content": "BUY NOW OR CRY! This will blow your mind, insane deals that break the internet!",
            "resolution": "rejected",
            "label": "OFF_BRAND_HYPERBOLE",
            "reason": "Shouty capitalization and tabloid clickbait style violates premium luxury brand tone guidelines.",
            "category": "tone"
        },
        {
            "case_id": "CASE_HIST_104",
            "title": "Smart Wealth Micro-Investment Tweet",
            "content": "Start micro-investing with zero minimum. Automated portfolios tailored to your goals. Capital at risk.",
            "resolution": "approved",
            "label": "FINANCIAL_PROMO_COMPLIANT",
            "reason": "Included required 'Capital at risk' statutory disclaimer without promising fixed returns.",
            "category": "compliance"
        },
        {
            "case_id": "CASE_HIST_105",
            "title": "Bio-Shield Vitamin Supplement Label",
            "content": "Scientifically formulated immune support blend. *These statements have not been evaluated by the FDA.",
            "resolution": "approved",
            "label": "FDA_DISCLAIMER_ATTACHED",
            "reason": "Standard dietary disclaimer correctly appended in 8pt minimum legible font.",
            "category": "compliance"
        },
        {
            "case_id": "CASE_HIST_106",
            "title": "Flagship Store Exterior Signage",
            "content": "Primary brand shield rendered in pure titanium white on slate background with 48px clearspace margin.",
            "resolution": "approved",
            "label": "LOGO_CLEARSPACE_APPROVED",
            "reason": "Exceeds 24px exclusion perimeter; monochrome lockup compliant with Q4 2024 identity system.",
            "category": "visual"
        },
        {
            "case_id": "CASE_HIST_107",
            "title": "Competitor Roast Meme Tweet",
            "content": "Our competitors are literal clowns with prehistoric software. Switch today to not be dumb.",
            "resolution": "rejected",
            "label": "UNETHICAL_DISPARAGEMENT",
            "reason": "Direct attack on rival software violates corporate integrity and dignity standards.",
            "category": "tone"
        },
        {
            "case_id": "CASE_HIST_108",
            "title": "Energy Drink Packaging Claim",
            "content": "Scientifically proven to cure 100% of morning fatigue with absolute zero crash forever.",
            "resolution": "rejected",
            "label": "UNSUPPORTED_MEDICAL_CURE",
            "reason": "Total cure claims violate food and beverage marketing laws and internal fact-checking threshold.",
            "category": "factual"
        }
    ]

    for c in cases:
        memory_bank.add_case(
            case_id=c["case_id"],
            title=c["title"],
            content=c["content"],
            resolution=c["resolution"],
            label=c["label"],
            reason=c["reason"],
            category=c["category"],
            reviewer_id="system_historical_data"
        )

def get_initial_submissions() -> List[Dict[str, Any]]:
    """Return realistic submissions pre-populated across the workflow."""
    now = datetime.now()
    
    return [
        # Item 1: High-priority in Human Review Queue (Ambiguous Tone / Borderline Slang)
        {
            "id": "SUB_2026_001",
            "title": "Gen-Z Targeted Discord Community Announcement",
            "channel": "Twitter/X",
            "content_type": ContentType.SOCIAL_POST.value,
            "raw_content": "No cap, our new feature drops this Friday and it honestly slaps! Join the Discord before we hit server limits.",
            "image_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
            "submitter_id": "copywriter_leo",
            "created_at": (now - timedelta(minutes=14)).isoformat(),
            "status": SubmissionStatus.PENDING_REVIEW.value,
            "routing": {
                "combined_score": 0.48,
                "combined_confidence": 0.74,
                "decision": RoutingDecision.HUMAN_REVIEW.value,
                "route_reason": "Routed to Human Queue: Ambiguous confidence (74%) regarding modern slang usage ('no cap', 'slaps') in youth-targeted channel.",
                "top_memory_match": {
                    "case_id": "CASE_HIST_103",
                    "title": "Cyber Monday Urgency Copy",
                    "content_snippet": "BUY NOW OR CRY! This will blow your mind, insane deals that break the internet!",
                    "resolution": "rejected",
                    "similarity": 0.52,
                    "label": "OFF_BRAND_HYPERBOLE",
                    "reason": "Shouty capitalization and tabloid clickbait style violates premium luxury brand tone guidelines.",
                    "timestamp": (now - timedelta(days=12)).isoformat()
                },
                "matched_cases": [],
                "agent_breakdown": {
                    "tone": {
                        "agent_type": "tone",
                        "agent_name": "Tone & Voice Agent",
                        "score": 0.50,
                        "confidence": 0.76,
                        "flagged": True,
                        "severity": "medium",
                        "rule_violated": "RULE_TONE_SLANG",
                        "flagged_spans": [
                            {"start": 0, "end": 6, "text": "No cap", "issue": "Colloquial slang 'no cap' conflicts with polished enterprise voice.", "severity": "medium", "suggestion": "Consider 'Without question' or 'Frankly'."},
                            {"start": 44, "end": 49, "text": "slaps", "issue": "Internet slang 'slaps' may reduce trust with B2B audience.", "severity": "medium", "suggestion": "Replace with 'delivers exceptional speed'."}
                        ],
                        "explanation": "Moderate tone inconsistency: 2 informal slang terms identified.",
                        "suggestions": ["Replace with polished language", "Verify if social channel exception applies"]
                    },
                    "factual": {
                        "agent_type": "factual",
                        "agent_name": "Factual Consistency Agent",
                        "score": 0.05,
                        "confidence": 0.95,
                        "flagged": False,
                        "severity": "clean",
                        "rule_violated": None,
                        "flagged_spans": [],
                        "explanation": "Claims are verified, defensible, and conform to factual substantiation standards.",
                        "suggestions": []
                    },
                    "visual": {
                        "agent_type": "visual",
                        "agent_name": "Visual & Logo Integrity Agent",
                        "score": 0.0,
                        "confidence": 0.95,
                        "flagged": False,
                        "severity": "clean",
                        "rule_violated": None,
                        "flagged_spans": [],
                        "explanation": "Visual assets adhere to guidelines.",
                        "suggestions": []
                    },
                    "compliance": {
                        "agent_type": "compliance",
                        "agent_name": "Compliance & Legal Agent",
                        "score": 0.0,
                        "confidence": 0.97,
                        "flagged": False,
                        "severity": "clean",
                        "rule_violated": None,
                        "flagged_spans": [],
                        "explanation": "Legal and regulatory compliance clear.",
                        "suggestions": []
                    }
                },
                "explainability": "Borderline tone score. Similar past Case #CASE_HIST_103 was rejected, but youth context may warrant approved exception."
            },
            "human_decision": None
        },

        # Item 2: Pending Human Review (Conflicting Signals: Factual vs Tone)
        {
            "id": "SUB_2026_002",
            "title": "Quantum Core Hardware Whitepaper Teaser",
            "channel": "LinkedIn",
            "content_type": ContentType.CAMPAIGN_ASSET.value,
            "raw_content": "Our new Quantum Core delivers 10x faster computing with completely zero latency compared to legacy architectures.",
            "image_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
            "submitter_id": "product_marketer_sam",
            "created_at": (now - timedelta(minutes=32)).isoformat(),
            "status": SubmissionStatus.PENDING_REVIEW.value,
            "routing": {
                "combined_score": 0.62,
                "combined_confidence": 0.81,
                "decision": RoutingDecision.HUMAN_REVIEW.value,
                "route_reason": "Conflicting agent signals: Flagged by [Factual Consistency Agent] for absolute zero latency claim, but Tone and Visual scored completely clean.",
                "top_memory_match": {
                    "case_id": "CASE_HIST_102",
                    "title": "Autonomous Cloud Launch Press Release",
                    "content_snippet": "Delivering enterprise cloud infrastructure with industry-leading 99.99% uptime SLA backed by tier-4 data centers.",
                    "resolution": "approved",
                    "similarity": 0.61,
                    "label": "PERFORMANCE_CLAIM_SUBSTANTIATED",
                    "reason": "SLA claims accompanied by verified technical architecture appendix.",
                    "timestamp": (now - timedelta(days=20)).isoformat()
                },
                "matched_cases": [],
                "agent_breakdown": {
                    "tone": {
                        "agent_type": "tone",
                        "agent_name": "Tone & Voice Agent",
                        "score": 0.05,
                        "confidence": 0.95,
                        "flagged": False,
                        "severity": "clean",
                        "rule_violated": None,
                        "flagged_spans": [],
                        "explanation": "Tone is authoritative, measured, and executive-ready.",
                        "suggestions": []
                    },
                    "factual": {
                        "agent_type": "factual",
                        "agent_name": "Factual Consistency Agent",
                        "score": 0.70,
                        "confidence": 0.92,
                        "flagged": True,
                        "severity": "high",
                        "rule_violated": "RULE_FACTUAL_SUPERLATIVES",
                        "flagged_spans": [
                            {"start": 57, "end": 79, "text": "completely zero latency", "issue": "Unsubstantiated absolute claim 'zero latency' is physically impossible and invites false advertising risk.", "severity": "high", "suggestion": "Replace with 'sub-millisecond latency' or cite specific benchmark methodology."}
                        ],
                        "explanation": "Critical factual hazard: Absolute physics claim unsupported.",
                        "suggestions": ["Replace 'completely zero latency' with benchmarked metric (e.g. '<0.2ms')"]
                    },
                    "visual": {
                        "agent_type": "visual",
                        "agent_name": "Visual & Logo Integrity Agent",
                        "score": 0.0,
                        "confidence": 0.95,
                        "flagged": False,
                        "severity": "clean",
                        "rule_violated": None,
                        "flagged_spans": [],
                        "explanation": "Compliant technical schema.",
                        "suggestions": []
                    },
                    "compliance": {
                        "agent_type": "compliance",
                        "agent_name": "Compliance & Legal Agent",
                        "score": 0.10,
                        "confidence": 0.90,
                        "flagged": False,
                        "severity": "clean",
                        "rule_violated": None,
                        "flagged_spans": [],
                        "explanation": "No statutory breach.",
                        "suggestions": []
                    }
                },
                "explainability": "Flagged because Factual Consistency agent detected an impossible absolute claim. Human reviewer must verify if legal substantiation is filed."
            },
            "human_decision": None
        },

        # Item 3: High Confidence Auto-Flagged (Severe multi-agent breach)
        {
            "id": "SUB_2026_003",
            "title": "Affiliate Influencer Paid Story",
            "channel": "Instagram",
            "content_type": ContentType.SOCIAL_POST.value,
            "raw_content": "Collab with Brand Immune System! Guaranteed return of 40% monthly yield and you can't lose money! Hurry before we run out forever!",
            "image_url": "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80",
            "submitter_id": "affiliate_agency_apex",
            "created_at": (now - timedelta(hours=1, minutes=10)).isoformat(),
            "status": SubmissionStatus.AUTO_FLAGGED.value,
            "routing": {
                "combined_score": 0.92,
                "combined_confidence": 0.96,
                "decision": RoutingDecision.AUTO_FLAG.value,
                "route_reason": "Auto-flag: Critical compliance and financial liability breach detected across Compliance and Tone agents.",
                "top_memory_match": {
                    "case_id": "CASE_HIST_101",
                    "title": "Q3 Influencer Teaser Campaign",
                    "content_snippet": "Special thanks to our partners for sending this gift box! Can't wait for you all to try it.",
                    "resolution": "rejected",
                    "similarity": 0.78,
                    "label": "FTC_DISCLOSURE_MISSING",
                    "reason": "Missing mandatory #ad disclosure at start of sponsored post.",
                    "timestamp": (now - timedelta(days=15)).isoformat()
                },
                "matched_cases": [],
                "agent_breakdown": {
                    "compliance": {
                        "agent_type": "compliance",
                        "agent_name": "Compliance & Legal Agent",
                        "score": 0.95,
                        "confidence": 0.98,
                        "flagged": True,
                        "severity": "critical",
                        "rule_violated": "RULE_COMPLIANCE_FINANCIAL_PROMISES",
                        "flagged_spans": [
                            {"start": 33, "end": 68, "text": "Guaranteed return of 40% monthly yield", "issue": "Severe financial promise breach. Direct regulatory violation.", "severity": "critical", "suggestion": "Remove guaranteed return promise immediately."}
                        ],
                        "explanation": "Acute SEC promotional risk. Guaranteed yield promises strictly prohibited.",
                        "suggestions": ["Immediate cease distribution"]
                    },
                    "tone": {
                        "agent_type": "tone",
                        "agent_name": "Tone & Voice Agent",
                        "score": 0.70,
                        "confidence": 0.91,
                        "flagged": True,
                        "severity": "high",
                        "rule_violated": "RULE_TONE_AGGRESSIVE_URGENCY",
                        "flagged_spans": [
                            {"start": 96, "end": 126, "text": "Hurry before we run out forever", "issue": "Aggressive urgency pressure.", "severity": "high", "suggestion": "Remove false scarcity."}
                        ],
                        "explanation": "Desperate urgency and sensationalist copy.",
                        "suggestions": []
                    },
                    "factual": {
                        "agent_type": "factual",
                        "agent_name": "Factual Consistency Agent",
                        "score": 0.85,
                        "confidence": 0.94,
                        "flagged": True,
                        "severity": "critical",
                        "rule_violated": "RULE_FACTUAL_IMPOSSIBLE_GUARANTEES",
                        "flagged_spans": [],
                        "explanation": "Guaranteed 40% returns is statistically impossible.",
                        "suggestions": []
                    },
                    "visual": {
                        "agent_type": "visual",
                        "agent_name": "Visual & Logo Integrity Agent",
                        "score": 0.1,
                        "confidence": 0.90,
                        "flagged": False,
                        "severity": "clean",
                        "rule_violated": None,
                        "flagged_spans": [],
                        "explanation": "Clean asset dimensions.",
                        "suggestions": []
                    }
                },
                "explainability": "Auto-blocked. Matches rejected precedent CASE_HIST_101 and triggers strict regulatory financial prohibition."
            },
            "human_decision": None
        },

        # Item 4: Clean Auto-Passed Item
        {
            "id": "SUB_2026_004",
            "title": "Corporate Sustainability Annual Snapshot",
            "channel": "Website",
            "content_type": ContentType.CAMPAIGN_ASSET.value,
            "raw_content": "We are proud to share our 2025 impact report. Through systematic investments, our team reduced emissions across all tier-1 operations.",
            "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80",
            "submitter_id": "communications_dir_priya",
            "created_at": (now - timedelta(hours=2, minutes=45)).isoformat(),
            "status": SubmissionStatus.AUTO_PASSED.value,
            "routing": {
                "combined_score": 0.05,
                "combined_confidence": 0.96,
                "decision": RoutingDecision.AUTO_PASS.value,
                "route_reason": "Auto-pass: Clean content, 0 policy violations detected across all 4 antibody agents. Consistent with approved corporate precedent.",
                "top_memory_match": {
                    "case_id": "CASE_HIST_102",
                    "title": "Autonomous Cloud Launch Press Release",
                    "content_snippet": "Delivering enterprise cloud infrastructure with industry-leading 99.99% uptime SLA backed by tier-4 data centers.",
                    "resolution": "approved",
                    "similarity": 0.58,
                    "label": "PERFORMANCE_CLAIM_SUBSTANTIATED",
                    "reason": "SLA claims accompanied by verified technical architecture appendix.",
                    "timestamp": (now - timedelta(days=20)).isoformat()
                },
                "matched_cases": [],
                "agent_breakdown": {
                    "tone": {"agent_type": "tone", "agent_name": "Tone Agent", "score": 0.0, "confidence": 0.96, "flagged": False, "severity": "clean", "rule_violated": None, "flagged_spans": [], "explanation": "Exemplary brand tone.", "suggestions": []},
                    "factual": {"agent_type": "factual", "agent_name": "Factual Agent", "score": 0.0, "confidence": 0.97, "flagged": False, "severity": "clean", "rule_violated": None, "flagged_spans": [], "explanation": "Claims are measured and qualified.", "suggestions": []},
                    "visual": {"agent_type": "visual", "agent_name": "Visual Agent", "score": 0.0, "confidence": 0.95, "flagged": False, "severity": "clean", "rule_violated": None, "flagged_spans": [], "explanation": "Adheres to clearspace.", "suggestions": []},
                    "compliance": {"agent_type": "compliance", "agent_name": "Compliance Agent", "score": 0.0, "confidence": 0.98, "flagged": False, "severity": "clean", "rule_violated": None, "flagged_spans": [], "explanation": "Compliant.", "suggestions": []}
                },
                "explainability": "Verified on-brand. Tone, factual claims, visual constraints, and legal disclosures fully satisfied."
            },
            "human_decision": None
        },

        # Item 5: Human Resolved (Accepted with Reason Code - False Positive Demonstration)
        {
            "id": "SUB_2026_005",
            "title": "Developer Evangelist Hackathon Shoutout",
            "channel": "Twitter/X",
            "content_type": ContentType.SOCIAL_POST.value,
            "raw_content": "Huge shoutout to all builders who hacked with our API this weekend! The energy was highkey unreal.",
            "image_url": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&auto=format&fit=crop&q=80",
            "submitter_id": "dev_advocate_zack",
            "created_at": (now - timedelta(hours=4)).isoformat(),
            "status": SubmissionStatus.REVIEWED_ACCEPTED.value,
            "routing": {
                "combined_score": 0.35,
                "combined_confidence": 0.79,
                "decision": RoutingDecision.HUMAN_REVIEW.value,
                "route_reason": "Routed to Human Queue: Tone flagged informal slang ('highkey') in developer social copy.",
                "top_memory_match": None,
                "matched_cases": [],
                "agent_breakdown": {
                    "tone": {"agent_type": "tone", "agent_name": "Tone Agent", "score": 0.35, "confidence": 0.80, "flagged": True, "severity": "medium", "rule_violated": "RULE_TONE_SLANG", "flagged_spans": [], "explanation": "Slang 'highkey' flagged.", "suggestions": []},
                    "factual": {"agent_type": "factual", "agent_name": "Factual Agent", "score": 0.0, "confidence": 0.95, "flagged": False, "severity": "clean", "rule_violated": None, "flagged_spans": [], "explanation": "Clean.", "suggestions": []},
                    "visual": {"agent_type": "visual", "agent_name": "Visual Agent", "score": 0.0, "confidence": 0.95, "flagged": False, "severity": "clean", "rule_violated": None, "flagged_spans": [], "explanation": "Clean.", "suggestions": []},
                    "compliance": {"agent_type": "compliance", "agent_name": "Compliance Agent", "score": 0.0, "confidence": 0.95, "flagged": False, "severity": "clean", "rule_violated": None, "flagged_spans": [], "explanation": "Clean.", "suggestions": []}
                },
                "explainability": "Flagged for slang. Overturned by reviewer as acceptable developer community register."
            },
            "human_decision": {
                "reviewer_id": "reviewer_alice",
                "reviewer_name": "Alice Jenkins",
                "decision": "accept",
                "reason_code": "BRAND_ALIGNMENT_EXCEPTION",
                "comment": "Approved for DevRel channel. Natural engineer voice acceptable in hackathon recap posts.",
                "timestamp": (now - timedelta(hours=3, minutes=30)).isoformat()
            }
        }
    ]
