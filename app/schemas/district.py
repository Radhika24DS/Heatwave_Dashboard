from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class DistrictBase(BaseModel):
    name: str = Field(..., max_length=100, description="Name of the district")
    state: str = Field(..., max_length=100, description="State the district belongs to")
    latitude: float = Field(..., ge=-90.0, le=90.0, description="Latitude coordinates")
    longitude: float = Field(..., ge=-180.0, le=180.0, description="Longitude coordinates")
    population: Optional[int] = Field(None, ge=0, description="Population of the district")

class DistrictCreate(DistrictBase):
    pass

class DistrictUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    state: Optional[str] = Field(None, max_length=100)
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0)
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0)
    population: Optional[int] = Field(None, ge=0)

class DistrictInDBBase(DistrictBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class District(DistrictInDBBase):
    pass
