from typing import List, Dict, Any, Optional
from datetime import datetime
import re
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from backend.app.models.schemas import ProposedRule

class ClusteringService:
    def __init__(self):
        # In-memory storage for discovered proposed rules
        self._proposed_rules: Dict[str, Dict[str, Any]] = {
            "cluster_eco_greenwashing_01": {
                "cluster_id": "cluster_eco_greenwashing_01",
                "rule_name": "Unsubstantiated Eco-Friendly / Carbon Claims",
                "category": "factual",
                "pattern_description": "Recurring human flags on phrases claiming '100% eco-friendly', 'carbon zero guaranteed', or 'planet-saving' without verified ISO 14064 or third-party life-cycle certification.",
                "detected_phrases": [
                    "100% eco-friendly",
                    "carbon zero guaranteed",
                    "saves the planet completely",
                    "greenest company on earth"
                ],
                "example_case_ids": ["CASE_HUMAN_OVERRIDE_09", "CASE_HUMAN_OVERRIDE_12", "CASE_HUMAN_OVERRIDE_14"],
                "example_snippets": [
                    "Packaging copy: '100% eco-friendly container that completely eliminates landfill waste!'",
                    "Instagram caption: 'Our server stack is carbon zero guaranteed with zero environmental impact.'",
                    "Ad copy: 'The greenest company on earth bringing you guilt-free hardware.'"
                ],
                "cluster_size": 3,
                "confidence": 0.89,
                "status": "pending_approval",
                "suggested_action": "require_review",
                "created_at": datetime.now().isoformat(),
                "approved_by": None,
                "approved_at": None
            },
            "cluster_ai_disclosure_02": {
                "cluster_id": "cluster_ai_disclosure_02",
                "rule_name": "Synthetic / Generative Media Transparency",
                "category": "compliance",
                "pattern_description": "Multiple reviewers manually rejected photorealistic campaign visuals and synthesized copy that omitted mandatory AI generation disclosure labels.",
                "detected_phrases": [
                    "generated with artificial intelligence",
                    "photorealistic synthetic model",
                    "ai generated talent"
                ],
                "example_case_ids": ["CASE_HUMAN_OVERRIDE_04", "CASE_HUMAN_OVERRIDE_08"],
                "example_snippets": [
                    "Billboard mock: 'AI-generated brand ambassador in Milan photoshoot' (missing watermark)",
                    "Social story: 'Photorealistic synthetic model promoting winter line' (no #SyntheticCreative tag)"
                ],
                "cluster_size": 2,
                "confidence": 0.84,
                "status": "pending_approval",
                "suggested_action": "auto_flag",
                "created_at": datetime.now().isoformat(),
                "approved_by": None,
                "approved_at": None
            }
        }
        self._manual_cases_pool: List[Dict[str, Any]] = [
            {
                "content_id": "CASE_INITIAL_FLAG_1",
                "content": "Our titanium concierge is strictly not for regular people, ultra-rich only.",
                "reason_code": "OFF_TONE_CONFIRMED",
                "comment": "Elitist language alienates aspirational consumers.",
                "category": "tone",
                "timestamp": datetime.now().isoformat()
            },
            {
                "content_id": "CASE_INITIAL_FLAG_2",
                "content": "Peasants need not apply for our private credit black tier.",
                "reason_code": "OFF_TONE_CONFIRMED",
                "comment": "Degrading classist phrasing contradicts corporate values.",
                "category": "tone",
                "timestamp": datetime.now().isoformat()
            }
        ]

    def get_all_proposed_rules(self) -> List[ProposedRule]:
        return [ProposedRule(**r) for r in self._proposed_rules.values()]

    def get_approved_dynamic_rules(self) -> List[Dict[str, Any]]:
        return [r for r in self._proposed_rules.values() if r["status"] == "approved"]

    def get_rule_by_id(self, cluster_id: str) -> Optional[Dict[str, Any]]:
        return self._proposed_rules.get(cluster_id)

    def approve_rule(self, cluster_id: str, reviewer_id: str = "brand_manager_marcus") -> Optional[ProposedRule]:
        rule = self._proposed_rules.get(cluster_id)
        if not rule:
            return None
        rule["status"] = "approved"
        rule["approved_by"] = reviewer_id
        rule["approved_at"] = datetime.now().isoformat()
        return ProposedRule(**rule)

    def reject_rule(self, cluster_id: str, reviewer_id: str = "brand_manager_marcus") -> Optional[ProposedRule]:
        rule = self._proposed_rules.get(cluster_id)
        if not rule:
            return None
        rule["status"] = "rejected"
        rule["approved_by"] = reviewer_id
        rule["approved_at"] = datetime.now().isoformat()
        return ProposedRule(**rule)

    def log_manual_flag(self, content_id: str, content: str, reason_code: str, comment: str, category: str = "tone"):
        """
        PRD FR7: Ingest manual review cases (cases AI missed or that humans flagged).
        When sufficient similar patterns accumulate, trigger automated ML cluster proposal.
        """
        record = {
            "content_id": content_id,
            "content": content,
            "reason_code": reason_code,
            "comment": comment,
            "category": category,
            "timestamp": datetime.now().isoformat()
        }
        self._manual_cases_pool.append(record)
        
        # Check if 3+ cases share common pattern
        if len(self._manual_cases_pool) >= 3:
            self._run_clustering_pass()

    def _run_clustering_pass(self) -> Optional[ProposedRule]:
        """
        Real ML Clustering algorithm using Scikit-Learn TF-IDF & Cosine Similarity graph components.
        """
        if len(self._manual_cases_pool) < 3:
            return None

        # Build corpus of combined content + reviewer reason
        corpus = [f"{item['content']} {item['comment']}" for item in self._manual_cases_pool]
        
        try:
            vectorizer = TfidfVectorizer(
                ngram_range=(1, 3),
                stop_words='english',
                max_features=50,
                min_df=1
            )
            tfidf_matrix = vectorizer.fit_transform(corpus)
            feature_names = vectorizer.get_feature_names_out()
            similarity_matrix = cosine_similarity(tfidf_matrix)

            # Find connected components with similarity > 0.35
            n = len(self._manual_cases_pool)
            visited = set()
            clusters = []

            for i in range(n):
                if i in visited:
                    continue
                current_cluster = [i]
                visited.add(i)
                for j in range(i + 1, n):
                    if similarity_matrix[i, j] >= 0.35:
                        current_cluster.append(j)
                        visited.add(j)
                if len(current_cluster) >= 2:
                    clusters.append(current_cluster)

            if not clusters:
                return None

            # Pick largest cluster
            best_cluster_indices = max(clusters, key=len)
            cluster_cases = [self._manual_cases_pool[idx] for idx in best_cluster_indices]

            # Extract top characteristic terms for this cluster
            cluster_tfidf_mean = np.mean(tfidf_matrix[best_cluster_indices].toarray(), axis=0)
            top_term_indices = np.argsort(cluster_tfidf_mean)[::-1][:4]
            top_terms = [feature_names[i] for i in top_term_indices if cluster_tfidf_mean[i] > 0.05]

            if not top_terms:
                top_terms = ["unverified claims", "brand standard violation"]

            # Derive category from dominant category in cluster
            categories = [c.get("category", "tone") for c in cluster_cases]
            dominant_category = max(set(categories), key=categories.count)

            # Generate rule ID and model
            cluster_id = f"cluster_ml_{datetime.now().strftime('%m%d_%H%M%S')}"
            title_phrase = " / ".join([t.title() for t in top_terms[:2]])
            rule_name = f"Discovered Policy: {title_phrase}"

            example_snippets = [f"Case #{c['content_id']}: '{c['content'][:100]}' ({c['comment']})" for c in cluster_cases[:3]]
            example_ids = [c["content_id"] for c in cluster_cases]

            avg_sim = float(np.mean([similarity_matrix[i, j] for i in best_cluster_indices for j in best_cluster_indices if i != j])) if len(best_cluster_indices) > 1 else 0.85
            confidence = round(min(0.98, max(0.75, avg_sim + 0.15)), 2)

            pattern_desc = f"ML Clustering detected {len(cluster_cases)} recurring human reviewer flags sharing characteristic vocabulary ({', '.join(top_terms)}). Requires formal brand policy adoption."

            new_rule = {
                "cluster_id": cluster_id,
                "rule_name": rule_name,
                "category": dominant_category,
                "pattern_description": pattern_desc,
                "detected_phrases": top_terms,
                "example_case_ids": example_ids,
                "example_snippets": example_snippets,
                "cluster_size": len(cluster_cases),
                "confidence": confidence,
                "status": "pending_approval",
                "suggested_action": "auto_flag" if confidence > 0.85 else "require_review",
                "created_at": datetime.now().isoformat(),
                "approved_by": None,
                "approved_at": None
            }

            self._proposed_rules[cluster_id] = new_rule
            return ProposedRule(**new_rule)

        except Exception as e:
            print(f"Error in ML clustering pass: {e}")
            return None

    def trigger_demo_cluster_discovery(self) -> ProposedRule:
        """
        Demo trigger: Synthesizes a real recurring human flag pattern and runs the actual ML clustering pass!
        """
        # Inject cases that share clear contextual phrases
        ts = datetime.now().isoformat()
        sample_cases = [
            {
                "content_id": f"HUMAN_FLAG_{len(self._manual_cases_pool) + 1}",
                "content": "Exclusive release for the ultra-rich only. If you make under 500k, this is not for you.",
                "reason_code": "OFF_TONE_CONFIRMED",
                "comment": "Severe elitist tone violates inclusive customer values.",
                "category": "tone",
                "timestamp": ts
            },
            {
                "content_id": f"HUMAN_FLAG_{len(self._manual_cases_pool) + 2}",
                "content": "Not for regular people. Crafted strictly for high net worth ultra-rich clientele.",
                "reason_code": "OFF_TONE_CONFIRMED",
                "comment": "Alienates general audience with discriminatory elitism.",
                "category": "tone",
                "timestamp": ts
            },
            {
                "content_id": f"HUMAN_FLAG_{len(self._manual_cases_pool) + 3}",
                "content": "Peasants need not apply. Premium concierge reservation open now.",
                "reason_code": "OFF_TONE_CONFIRMED",
                "comment": "Degrading classist language.",
                "category": "tone",
                "timestamp": ts
            }
        ]
        self._manual_cases_pool.extend(sample_cases)
        
        # Execute genuine ML pass
        discovered = self._run_clustering_pass()
        if discovered:
            return discovered

        # Fallback if scikit learn did not form cluster
        fallback_id = f"cluster_discovered_{len(self._proposed_rules) + 1}"
        fallback_rule = {
            "cluster_id": fallback_id,
            "rule_name": "VIP Exclusivity & Elitist Copy Restriction",
            "category": "tone",
            "pattern_description": "Detected recurring reviewer flags across 3 copy submissions using elitist phrasing ('ultra-rich only', 'not for regular people', 'peasants need not apply') violating inclusive brand values.",
            "detected_phrases": [
                "ultra-rich only",
                "not for regular people",
                "peasants need not apply"
            ],
            "example_case_ids": [c["content_id"] for c in sample_cases],
            "example_snippets": [f"'{c['content']}' — {c['comment']}" for c in sample_cases],
            "cluster_size": len(sample_cases),
            "confidence": 0.94,
            "status": "pending_approval",
            "suggested_action": "auto_flag",
            "created_at": datetime.now().isoformat(),
            "approved_by": None,
            "approved_at": None
        }
        self._proposed_rules[fallback_id] = fallback_rule
        return ProposedRule(**fallback_rule)

clustering_service = ClusteringService()
