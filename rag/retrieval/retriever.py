# rag/retrieval/retriever.py
"""AdvisoryRetriever – loads the FAISS index and returns raw advisory text.
The retriever **never** calls any LLM – it only returns the stored document
content verbatim.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional

from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain.schema.document import Document

from rag.config import FAISS_INDEX_DIR, EMBEDDING_MODEL, TOP_K, SIMILARITY_THRESHOLD

# ---------------------------------------------------------------------------
# Helper data class – shape of the object returned to the CLI / callers
# ---------------------------------------------------------------------------
@dataclass
class AdvisoryResult:
    title: str
    content: str
    role: str
    risk_level: str
    document_source: str
    similarity_score: Optional[float] = None
    is_fallback: bool = False

# ---------------------------------------------------------------------------
# Retriever class
# ---------------------------------------------------------------------------
class AdvisoryRetriever:
    """Load the persisted FAISS index and perform metadata‑filtered retrieval.

    * The index is built by ``rag.ingestion.build_index``.
    * Documents are stored as LangChain ``Document`` objects with metadata
      ``role``, ``risk_level``, ``title`` and ``source_path``.
    * If the index file does not exist, a clear ``FileNotFoundError`` is raised
      with a hint to run ``python -m rag.cli build-index``.
    """

    def __init__(self) -> None:
        # Initialise the embedding model (CPU‑friendly)
        self.embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
        # Load the FAISS index from disk – must exist before first query
        index_path = Path(FAISS_INDEX_DIR)
        if not index_path.exists():
            raise FileNotFoundError(
                f"FAISS index directory not found at '{index_path}'. "
                "Run 'python -m rag.cli build-index' first."
            )
        # ``allow_dangerous_deserialization`` is required for custom docstore
        self.vectorstore = FAISS.load_local(
            str(index_path), self.embeddings, allow_dangerous_deserialization=True
        )

    # ---------------------------------------------------------------------
    def _all_documents(self) -> List[Document]:
        """Return all stored ``Document`` objects from the FAISS docstore."""
        return list(self.vectorstore.docstore._dict.values())  # type: ignore[attr-defined]

    # ---------------------------------------------------------------------
    def _filter_by_meta(self, docs: List[Document], role: str, risk: str) -> List[Document]:
        """Filter documents by exact ``role`` and ``risk_level`` metadata."""
        return [d for d in docs if d.metadata.get("role") == role and d.metadata.get("risk_level") == risk]

    # ---------------------------------------------------------------------
    def _fallback_risk(self, risk: str) -> List[str]:
        """Return ordered alternative risk levels for fallback.
        Preference: higher severity first, then lower.
        """
        order = ["LOW", "MODERATE", "HIGH", "EXTREME"]
        idx = order.index(risk)
        higher = order[idx + 1 :]
        lower = list(reversed(order[:idx]))
        return higher + lower

    # ---------------------------------------------------------------------
    def get_advisory(
        self,
        role: str,
        risk_level: str,
        query: Optional[str] = None,
        top_k: int = TOP_K,
    ) -> AdvisoryResult:
        """Retrieve an advisory matching ``role`` and ``risk_level``.

        If ``query`` is provided, a similarity search is performed within the
        filtered subset. If no document matches the exact risk level, the method
        falls back to the nearest risk level (higher severity first) and marks
        the result with ``is_fallback=True``.
        """
        all_docs = self._all_documents()
        candidates = self._filter_by_meta(all_docs, role, risk_level)
        is_fallback = False
        used_risk = risk_level

        if not candidates:
            for alt in self._fallback_risk(risk_level):
                candidates = self._filter_by_meta(all_docs, role, alt)
                if candidates:
                    is_fallback = True
                    used_risk = alt
                    break
            else:
                raise ValueError(f"No advisory found for role={role} with any risk level")

        similarity_score: Optional[float] = None
        if query:
            results = self.vectorstore.similarity_search_with_score(query, k=top_k)
            filtered = [(doc, score) for doc, score in results if doc in candidates]
            if filtered:
                doc, similarity_score = filtered[0]
            else:
                doc = candidates[0]
        else:
            doc = candidates[0]

        meta = doc.metadata
        return AdvisoryResult(
            title=meta.get("title", "Untitled Advisory"),
            content=doc.page_content,
            role=meta.get("role", role),
            risk_level=used_risk,
            document_source=meta.get("source_path", ""),
            similarity_score=similarity_score,
            is_fallback=is_fallback,
        )

# ---------------------------------------------------------------------------
# Simple demo when run as a script
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    try:
        retr = AdvisoryRetriever()
        result = retr.get_advisory(role="FARMER", risk_level="HIGH")
        print(json.dumps(result.__dict__, indent=2))
    except Exception as exc:
        print(f"Error: {exc}")
