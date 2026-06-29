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
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=False,
        connect_args={
            "statement_cache_size": 0,
            "prepared_statement_cache_size": 0,
        }
    )
    SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)
    
    async with SessionLocal() as session:
        try:
            # Query if districts table already contains records
            result = await session.execute(select(District))
            existing_districts = result.scalars().all()
            
            if existing_districts:
                print(f"Table 'districts' already has {len(existing_districts)} records. Skipping seeder.")
                return
                
            print("Seeding sample Karnataka districts...")
            sample_districts = [
                District(name="Bangalore", state="Karnataka", latitude=12.9716, longitude=77.5946, population=8443675),
                District(name="Mysore", state="Karnataka", latitude=12.2958, longitude=76.6394, population=3001127),
                District(name="Belagavi", state="Karnataka", latitude=15.8497, longitude=74.4977, population=4762269),
                District(name="Kalaburagi", state="Karnataka", latitude=17.3297, longitude=76.8343, population=2566326),
                District(name="Mangalore", state="Karnataka", latitude=12.9141, longitude=74.8560, population=2089649),
                District(name="Chikkamagaluru", state="Karnataka", latitude=13.3161, longitude=75.7720, population=1137961),
                District(name="Bidar", state="Karnataka", latitude=17.9104, longitude=77.5199, population=1703300),
                District(name="Davanagere", state="Karnataka", latitude=14.4644, longitude=75.9218, population=1945497),
                District(name="Udupi", state="Karnataka", latitude=13.3409, longitude=74.7421, population=1177361),
                District(name="Tumkur", state="Karnataka", latitude=13.3379, longitude=77.1173, population=2678779),
            ]
            
            session.add_all(sample_districts)
            await session.commit()
            print("Successfully seeded 10 Karnataka districts in the database.")
            
        except Exception as e:
            await session.rollback()
            print(f"Error seeding database: {e}")
            print("Make sure your tables are created by running migrations before running this script.")
        finally:
            await session.close()
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())
