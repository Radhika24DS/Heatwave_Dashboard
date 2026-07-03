import asyncio
from app.db.session import SessionLocal
from sqlalchemy import text

async def run():
    async with SessionLocal() as db:
        await db.execute(text('ALTER TABLE embeddings ALTER COLUMN embedding TYPE vector(3072)'))
        await db.commit()
        print('Altered table successfully.')

if __name__ == "__main__":
    asyncio.run(run())
