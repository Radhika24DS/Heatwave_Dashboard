import os
from pathlib import Path

# Embedding model to use (local, CPU‑friendly)
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Base directory of the project (this file's parent.parent)
BASE_DIR = Path(__file__).resolve().parent.parent

# Path where the FAISS index and its docstore will be persisted
FAISS_INDEX_DIR = BASE_DIR / "rag" / "artifacts" / "faiss_index"

# Retrieval defaults
TOP_K = 1
SIMILARITY_THRESHOLD = 0.7  # minimum cosine similarity to accept a match
