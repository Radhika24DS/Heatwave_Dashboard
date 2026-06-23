import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class AerosolDataBase(BaseModel):
    district_id: int = Field(..., description="ID of the district")
    date: datetime.date = Field(..., description="Date of the aerosol observation")
    aod_value: Optional[float] = Field(None, ge=0.0, description="Aerosol Optical Depth value")
    pm25: Optional[float] = Field(None, ge=0.0, description="PM2.5 particulate matter level")
    pm10: Optional[float] = Field(None, ge=0.0, description="PM10 particulate matter level")
    source: Optional[str] = Field(None, max_length=100, description="Satellite/sensor origin")

class AerosolDataCreate(AerosolDataBase):
    pass

class AerosolDataUpdate(BaseModel):
    aod_value: Optional[float] = Field(None, ge=0.0)
    pm25: Optional[float] = Field(None, ge=0.0)
    pm10: Optional[float] = Field(None, ge=0.0)
    source: Optional[str] = Field(None, max_length=100)

class AerosolDataInDBBase(AerosolDataBase):
    id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class AerosolData(AerosolDataInDBBase):
    pass
