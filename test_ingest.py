import asyncio
import logging
from app.db.session import SessionLocal
from app.services.rag import RagService

logging.basicConfig(level=logging.INFO)

async def run():
    async with SessionLocal() as db:
        rag = RagService()
        result = await rag.ingest_from_supabase(db, 1)
        print("Final Result:", result)

if __name__ == "__main__":
    asyncio.run(run())
