import os
from pathlib import Path
from dotenv import load_dotenv

# Base directory of the project (this file's parent.parent)
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables
load_dotenv(BASE_DIR / ".env")

# Map GEMINI_API_KEY to GOOGLE_API_KEY if needed for langchain
if "GOOGLE_API_KEY" not in os.environ and "GEMINI_API_KEY" in os.environ:
    os.environ["GOOGLE_API_KEY"] = os.environ["GEMINI_API_KEY"]

# Embedding model to use (Google Gemini)
EMBEDDING_MODEL = "models/gemini-embedding-2"

# Path where the FAISS index and its docstore will be persisted
FAISS_INDEX_DIR = BASE_DIR / "rag" / "artifacts" / "faiss_index"

# Retrieval defaults
TOP_K = 1
SIMILARITY_THRESHOLD = 0.7  # minimum cosine similarity to accept a match
