# rag/ingestion/build_index.py
"""Build FAISS index from advisory markdown documents.

The function scans the ``rag/documents`` directory for ``.md`` files, parses a simple
YAML front‑matter block (role, risk_level, title) and creates LangChain ``Document``
objects with that metadata. It then builds a FAISS vector store using the
embedding model defined in ``rag.config`` and persists it under
``rag/artifacts/faiss_index``.
"""

import os
from pathlib import Path
import yaml
from typing import List

from langchain.schema.document import Document
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

from rag.config import FAISS_INDEX_DIR, EMBEDDING_MODEL


def _load_markdown(file_path: Path) -> Document:
    """Read a markdown file, extract front‑matter and return a Document.

    Expected front‑matter format (YAML block at the top of the file):
    ```yaml
    ---
    role: PUBLIC
    risk_level: LOW
    title: Some title
    ---
    ```
    The remainder of the file is treated as ``page_content``.
    """
    text = file_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        raise ValueError(f"File {file_path} missing front‑matter block")
    # Split front‑matter and content
    parts = text.split("---", 3)
    # parts[0] is empty before first ---
    # parts[1] contains YAML
    # parts[2] is the remaining content (may start with a newline)
    yaml_block = parts[1]
    content = parts[2].lstrip("\n")
    meta = yaml.safe_load(yaml_block)
    # Ensure required keys exist
    for key in ("role", "risk_level", "title"):
        if key not in meta:
            raise ValueError(f"Missing '{key}' in front‑matter of {file_path}")
    metadata = {
        "role": meta["role"].upper(),
        "risk_level": meta["risk_level"].upper(),
        "title": meta["title"],
        "source_path": str(file_path),
    }
    return Document(page_content=content, metadata=metadata)


def build_faiss_index() -> None:
    """Create and persist a FAISS index from all advisory markdown files.

    The index directory is created if it does not exist. Existing index files are
    overwritten.
    """
    docs_dir = Path(__file__).resolve().parent.parent / "documents"
    if not docs_dir.is_dir():
        raise FileNotFoundError(f"Advisory documents directory not found: {docs_dir}")

    markdown_files = list(docs_dir.rglob("*.md"))
    if not markdown_files:
        raise FileNotFoundError("No advisory markdown files found to index.")

    documents: List[Document] = []
    for md_path in markdown_files:
        try:
            doc = _load_markdown(md_path)
            documents.append(doc)
        except Exception as exc:
            # Skip problematic files but surface the issue for debugging
            print(f"Warning: skipping {md_path}: {exc}")

    # Initialise embeddings (CPU‑friendly model)
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)

    # Build FAISS vector store
    vectorstore = FAISS.from_documents(documents, embeddings)

    # Ensure the target directory exists
    index_path = Path(FAISS_INDEX_DIR)
    index_path.mkdir(parents=True, exist_ok=True)

    # Persist the index (both vector data and docstore)
    vectorstore.save_local(str(index_path))
    print(f"FAISS index built and saved to {index_path}")
