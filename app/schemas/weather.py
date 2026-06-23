import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class IMDWeatherDataBase(BaseModel):
    district_id: int = Field(..., description="ID of the district")
    date: datetime.date = Field(..., description="Date of the weather observation")
    max_temp: float = Field(..., description="Maximum temperature in Celsius")
    min_temp: float = Field(..., description="Minimum temperature in Celsius")
    humidity: Optional[float] = Field(None, ge=0.0, le=100.0, description="Humidity percentage")
    wind_speed: Optional[float] = Field(None, ge=0.0, description="Wind speed in km/h")
    rainfall: Optional[float] = Field(None, ge=0.0, description="Rainfall in mm")
    source: Optional[str] = Field(None, max_length=100, description="Data source name")

class IMDWeatherDataCreate(IMDWeatherDataBase):
    pass

class IMDWeatherDataUpdate(BaseModel):
    max_temp: Optional[float] = None
    min_temp: Optional[float] = None
    humidity: Optional[float] = Field(None, ge=0.0, le=100.0)
    wind_speed: Optional[float] = Field(None, ge=0.0)
    rainfall: Optional[float] = Field(None, ge=0.0)
    source: Optional[str] = Field(None, max_length=100)

class IMDWeatherDataInDBBase(IMDWeatherDataBase):
    id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class IMDWeatherData(IMDWeatherDataInDBBase):
    pass
