import sys
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from supabase import create_client

from app.core.config import settings
from langchain_google_genai import GoogleGenerativeAIEmbeddings

def print_header(title):
    print("=" * 60)
    print(f" {title} ".center(60, "="))
    print("=" * 60)

async def verify_db():
    print_header("DATABASE CONFIGURATION VERIFICATION")
    try:
        # Create async engine
        engine = create_async_engine(
            settings.DATABASE_URL,
            connect_args={
                "statement_cache_size": 0,
                "prepared_statement_cache_size": 0,
            }
        )
        async with engine.connect() as conn:
            # 1. Check pgvector extension
            res_vector = await conn.execute(text("SELECT extname FROM pg_extension WHERE extname = 'vector'"))
            vector_ext = res_vector.scalar()
            if vector_ext:
                print("[PASS] Database extension 'vector' (pgvector) is ENABLED.")
            else:
                print("[FAIL] Database extension 'vector' (pgvector) is NOT enabled. Please run 'CREATE EXTENSION IF NOT EXISTS vector;' in your Supabase SQL Editor.")

            # 2. Check essential tables
            tables = ["users", "districts", "alerts", "documents", "document_chunks", "embeddings", "advisories", "heatwave_predictions"]
            for table in tables:
                try:
                    res = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                    count = res.scalar()
                    print(f"[PASS] Table '{table}' verified. Current records count: {count}")
                except Exception as e:
                    print(f"[FAIL] Table '{table}' verification failed: {e}")

        await engine.dispose()
    except Exception as e:
        print(f"[ERROR] Database connection failed: {e}")
        print("Please check your DATABASE_URL environment variable.")

def verify_supabase():
    print_header("SUPABASE CLIENT & STORAGE VERIFICATION")
    try:
        url = settings.SUPABASE_URL
        key = settings.SUPABASE_SERVICE_ROLE_KEY
        if not url or not key:
            print("[FAIL] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing from environment/config.")
            return

        supabase = create_client(url, key)
        print("[PASS] Supabase client initialized successfully.")

        # Test storage bucket access
        bucket_name = "hews-documents"
        try:
            res = supabase.storage.from_(bucket_name).list()
            print(f"[PASS] Storage bucket '{bucket_name}' is accessible. Found {len(res)} file(s).")
            for f in res:
                print(f"       - {f['name']} ({f.get('metadata', {}).get('size', 0)} bytes)")
        except Exception as e:
            print(f"[FAIL] Failed to access storage bucket '{bucket_name}': {e}")
            print(f"       Ensure that a bucket named '{bucket_name}' exists and has the appropriate RAG policies.")

    except Exception as e:
        print(f"[ERROR] Supabase client verification failed: {e}")

def verify_gemini():
    print_header("GEMINI API KEY & EMBEDDINGS VERIFICATION")
    try:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            print("[FAIL] GEMINI_API_KEY is missing from environment/config.")
            return

        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/gemini-embedding-2",
            google_api_key=api_key
        )
        # Attempt simple embed
        vector = embeddings.embed_query("Verify Gemini service embedding compatibility.")
        if vector and len(vector) > 0:
            print(f"[PASS] Gemini Embedding API key validated successfully. Vector output dimensions: {len(vector)}")
        else:
            print("[FAIL] Gemini Embedding API returned empty vector.")

    except Exception as e:
        print(f"[ERROR] Gemini Embedding service verification failed: {e}")
        print("        Verify your GEMINI_API_KEY is active and supports embedding models.")

async def main():
    await verify_db()
    verify_supabase()
    verify_gemini()
    print_header("VERIFICATION COMPLETE")

if __name__ == "__main__":
    asyncio.run(main())
