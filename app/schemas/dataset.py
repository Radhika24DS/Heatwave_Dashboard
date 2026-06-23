from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import DatasetStatus

class DatasetBase(BaseModel):
    filename: str = Field(..., max_length=255, description="Name of the file uploaded")
    file_path: str = Field(..., max_length=512, description="Storage location path")
    dataset_type: str = Field(..., max_length=100, description="Data type categorization")
    status: DatasetStatus = Field(DatasetStatus.PENDING, description="Status of database integration processing")

class DatasetCreate(BaseModel):
    filename: str = Field(..., max_length=255)
    file_path: str = Field(..., max_length=512)
    dataset_type: str = Field(..., max_length=100)
    uploaded_by_user_id: Optional[int] = None

class DatasetUpdate(BaseModel):
    status: Optional[DatasetStatus] = None

class DatasetInDBBase(DatasetBase):
    id: int
    uploaded_by_user_id: Optional[int]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Dataset(DatasetInDBBase):
    pass
