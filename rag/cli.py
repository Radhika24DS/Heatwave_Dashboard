# rag/cli.py
"""Command‑line interface for the advisory retrieval system.
Usage:
  python -m rag.cli build-index
  python -m rag.cli query --role ROLE --risk RISK [--q QUERY]
"""
import argparse
import sys
from pathlib import Path

# Import inside functions to avoid heavy imports when only help is needed

def build_index():
    from rag.ingestion.build_index import build_faiss_index
    build_faiss_index()


def query_advisory(role: str, risk: str, query: str | None):
    from rag.retrieval.retriever import AdvisoryRetriever
    retriever = AdvisoryRetriever()
    result = retriever.get_advisory(role=role.upper(), risk_level=risk.upper(), query=query)
    print("--- Advisory ---")
    print(f"Title: {result.title}\n")
    print(result.content)
    if result.is_fallback:
        print("\n[NOTE] Fallback advisory was used.")
    if result.similarity_score is not None:
        print(f"\nSimilarity score: {result.similarity_score:.4f}")


def main(argv: list[str] | None = None):
    parser = argparse.ArgumentParser(description="RAG advisory retrieval CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # build-index command
    subparsers.add_parser("build-index", help="Load markdown files, sync DB and build FAISS index")

    # query command
    q_parser = subparsers.add_parser("query", help="Retrieve advisory by role and risk level")
    q_parser.add_argument("--role", required=True, help="User role (PUBLIC, FARMER, TRAVELLER)")
    q_parser.add_argument("--risk", required=True, help="Risk level (LOW, MODERATE, HIGH, EXTREME)")
    q_parser.add_argument("--q", dest="query", help="Optional free‑text query to refine similarity search")

    args = parser.parse_args(argv)

    if args.command == "build-index":
        build_index()
    elif args.command == "query":
        query_advisory(args.role, args.risk, args.query)
    else:
        parser.print_help()
        sys.exit(1)

if __name__ == "__main__":
    main()
