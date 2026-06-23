from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from app.models.location import District
from app.schemas.district import DistrictCreate

class DistrictService:
    @staticmethod
    async def get_all_districts(db: AsyncSession) -> List[District]:
        """
        Retrieves all districts ordered by name.
        """
        result = await db.execute(select(District).order_by(District.name))
        return list(result.scalars().all())

    @staticmethod
    async def create_district(db: AsyncSession, district_in: DistrictCreate) -> District:
        """
        Creates a new district record in the database.
        """
        db_district = District(
            name=district_in.name,
            state=district_in.state,
            latitude=district_in.latitude,
            longitude=district_in.longitude,
            population=district_in.population
        )
        db.add(db_district)
        await db.commit()
        await db.refresh(db_district)
        return db_district
