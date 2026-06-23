from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db
from app.services.district import DistrictService
from app.schemas.district import District, DistrictCreate
from app.utils.responses import standard_response

router = APIRouter()

@router.get("", response_model=dict)
async def list_districts(db: AsyncSession = Depends(get_db)):
    """
    Retrieves a list of all geographical districts stored in the database.
    """
    districts = await DistrictService.get_all_districts(db)
    # Convert SQLAlchemy model instances to Pydantic schemas for serialization
    serialized_districts = [District.model_validate(d) for d in districts]
    return standard_response(
        status="success",
        data=serialized_districts,
        message="Districts retrieved successfully"
    )

@router.post("", response_model=dict, status_code=status.HTTP_201_CREATED)
async def create_district(district_in: DistrictCreate, db: AsyncSession = Depends(get_db)):
    """
    Registers a new district in the database.
    """
    try:
        new_district = await DistrictService.create_district(db, district_in)
        serialized_district = District.model_validate(new_district)
        return standard_response(
            status="success",
            data=serialized_district,
            message="District created successfully"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to register district: {str(e)}"
        )
