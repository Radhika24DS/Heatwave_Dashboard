import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.future import select
from app.core.config import settings
from app.models.location import District

async def seed_data() -> None:
    """
    Asynchronously seeds the database with three initial Indian districts:
    - Delhi
    - Nagpur (Maharashtra)
    - Chennai (Tamil Nadu)
    """
    print(f"Connecting to database '{settings.POSTGRES_DB}' for seeding...")
    # Create a local engine and session maker for the standalone script
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)
    
    async with SessionLocal() as session:
        try:
            # Query if districts table already contains records
            result = await session.execute(select(District))
            existing_districts = result.scalars().all()
            
            if existing_districts:
                print(f"Table 'districts' already has {len(existing_districts)} records. Skipping seeder.")
                return
                
            print("Seeding sample districts: Delhi, Nagpur, Chennai...")
            sample_districts = [
                District(
                    name="Delhi",
                    state="Delhi",
                    latitude=28.6139,
                    longitude=77.2090,
                    population=16787941
                ),
                District(
                    name="Nagpur",
                    state="Maharashtra",
                    latitude=21.1458,
                    longitude=79.0882,
                    population=2405665
                ),
                District(
                    name="Chennai",
                    state="Tamil Nadu",
                    latitude=13.0827,
                    longitude=80.2707,
                    population=4646732
                ),
            ]
            
            session.add_all(sample_districts)
            await session.commit()
            print("Successfully seeded 3 districts in the database.")
            
        except Exception as e:
            await session.rollback()
            print(f"Error seeding database: {e}")
            print("Make sure your tables are created by running migrations before running this script.")
        finally:
            await session.close()
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
