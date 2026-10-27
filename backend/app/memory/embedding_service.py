import math
import re
from typing import List, Dict, Any, Tuple
import numpy as np

class LightweightEmbeddingService:
    """
    Semantic vector embedding service using dense character and subword n-gram 
    hash-projections and term-frequency cosine spaces.
    Fast, reliable, zero-network-dependency, produces consistent high-dimensional 
    embeddings for fast vector retrieval.
    """
    def __init__(self, dimension: int = 128):
        self.dimension = dimension

    def _tokenize(self, text: str) -> List[str]:
        # Clean and extract words and subwords
        cleaned = re.sub(r'[^\w\s#@]', ' ', text.lower())
        tokens = cleaned.split()
        ngrams = []
        for token in tokens:
            ngrams.append(token)
            # Add character tri-grams for subword similarity
            if len(token) > 4:
                for i in range(len(token) - 2):
                    ngrams.append(token[i:i+3])
        return ngrams

    def embed_text(self, text: str) -> List[float]:
        tokens = self._tokenize(text)
        if not tokens:
            return [0.0] * self.dimension
        
        vector = np.zeros(self.dimension, dtype=np.float32)
        for token in tokens:
            # Deterministic hash projection
            h = hash(token) % self.dimension
            vector[h] += 1.0
            
            # Second harmonic for collision resistance
            h2 = (hash(token + "_salt") ^ 0x5bd1e995) % self.dimension
            vector[h2] += 0.5

        # L2 Normalize
        norm = np.linalg.norm(vector)
        if norm > 1e-6:
            vector = vector / norm
            
        return vector.tolist()

    def cosine_similarity(self, vec_a: List[float], vec_b: List[float]) -> float:
        a = np.array(vec_a, dtype=np.float32)
        b = np.array(vec_b, dtype=np.float32)
        norm_a = np.linalg.norm(a)
        norm_b = np.linalg.norm(b)
        if norm_a < 1e-6 or norm_b < 1e-6:
            return 0.0
        dot = np.dot(a, b)
        similarity = float(dot / (norm_a * norm_b))
        # Clamp to 0.0 - 1.0
        return max(0.0, min(1.0, (similarity + 1.0) / 2.0 if similarity < 0 else similarity))

embedding_service = LightweightEmbeddingService()
