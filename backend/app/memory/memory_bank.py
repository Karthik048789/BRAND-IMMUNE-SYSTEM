from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.app.memory.embedding_service import embedding_service
from backend.app.models.schemas import MemoryMatch

class MemoryBank:
    """
    In-memory vector database storing past resolved brand cases,
    their embeddings, human review decisions, and explainability records.
    """
    def __init__(self):
        self._cases: Dict[str, Dict[str, Any]] = {}

    def add_case(
        self,
        case_id: str,
        title: str,
        content: str,
        resolution: str, # "approved", "rejected", "edited"
        label: str,
        reason: str,
        category: str = "general",
        reviewer_id: str = "system_seed",
        timestamp: Optional[str] = None
    ) -> Dict[str, Any]:
        vector = embedding_service.embed_text(content)
        ts = timestamp or datetime.now().isoformat()
        
        record = {
            "id": case_id,
            "title": title,
            "content": content,
            "snippet": content[:140] + ("..." if len(content) > 140 else ""),
            "vector": vector,
            "resolution": resolution,
            "label": label,
            "reason": reason,
            "category": category,
            "reviewer_id": reviewer_id,
            "created_at": ts
        }
        self._cases[case_id] = record
        return record

    def search_similar(self, query_text: str, top_k: int = 4, threshold: float = 0.35) -> List[MemoryMatch]:
        if not self._cases:
            return []
            
        query_vec = embedding_service.embed_text(query_text)
        scored_matches = []
        
        for cid, record in self._cases.items():
            sim = embedding_service.cosine_similarity(query_vec, record["vector"])
            if sim >= threshold:
                scored_matches.append((sim, record))
                
        # Sort by similarity descending
        scored_matches.sort(key=lambda x: x[0], reverse=True)
        top = scored_matches[:top_k]
        
        results: List[MemoryMatch] = []
        for sim, r in top:
            results.append(
                MemoryMatch(
                    case_id=r["id"],
                    title=r["title"],
                    content_snippet=r["snippet"],
                    resolution=r["resolution"],
                    similarity=round(sim, 3),
                    label=r["label"],
                    reason=r["reason"],
                    timestamp=r["created_at"]
                )
            )
        return results

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        return self._cases.get(case_id)

    def count(self) -> int:
        return len(self._cases)

    def get_all_cases(self) -> List[Dict[str, Any]]:
        return list(self._cases.values())

memory_bank = MemoryBank()
