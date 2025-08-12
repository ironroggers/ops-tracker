import os
from sentence_transformers import SentenceTransformer

# Model configuration
SENTENCE_TRANSFORMER_MODEL = os.getenv("SENTENCE_TRANSFORMER_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
model = SentenceTransformer(SENTENCE_TRANSFORMER_MODEL)

# Export model dimension for vector operations
VECTOR_DIM = model.get_sentence_embedding_dimension()

# Chunking configuration
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1000"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "200")) 