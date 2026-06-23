import asyncio
import asyncpg
from app.core.config import settings

async def main() -> None:
    """
    Connects to the default 'postgres' database and verifies/creates
    the target 'heatwave_db' configured in settings.
    """
    print(f"Checking PostgreSQL instance at {settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}...")
    try:
        # Establish connection to standard management database
        conn = await asyncpg.connect(
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            database="postgres"
        )
        
        # Query if the target database exists
        query = "SELECT datname FROM pg_database WHERE datname = $1"
        exists = await conn.fetchval(query, settings.POSTGRES_DB)
        
        if not exists:
            # CREATE DATABASE cannot run inside a transaction block
            await conn.execute(f'CREATE DATABASE "{settings.POSTGRES_DB}"')
            print(f"Successfully created database '{settings.POSTGRES_DB}'.")
        else:
            print(f"Database '{settings.POSTGRES_DB}' already exists.")
            
        await conn.close()
    except Exception as e:
        print(f"Error connecting or creating database: {e}")
        print("Please check that your PostgreSQL service is running and credentials in .env are correct.")

if __name__ == "__main__":
    asyncio.run(main())
