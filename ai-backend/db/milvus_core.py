import json, hashlib
from typing import List, Dict, Any, Tuple, Optional
from functools import lru_cache
from src.config.config import VECTOR_DIM, model

class MilvusCore:
    def __init__(self):
        self._schema_cache = {}
        
    @staticmethod
    def get_embedding(text: str) -> List[float]:
        try:
            if not text.strip():
                return [0.0] * VECTOR_DIM
            
            embedding = model.encode(text).tolist()
            
            # Ensure correct dimension
            if len(embedding) != VECTOR_DIM:
                if len(embedding) < VECTOR_DIM:
                    embedding.extend([0.0] * (VECTOR_DIM - len(embedding)))
                else:
                    embedding = embedding[:VECTOR_DIM]
            return embedding
        except Exception:
            return [0.0] * VECTOR_DIM