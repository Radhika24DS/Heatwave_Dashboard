from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class ModelRegistryBase(BaseModel):
    model_name: str = Field(..., max_length=100, description="Identifier of the model")
    version: str = Field(..., max_length=50, description="Model version tag")
    algorithm: str = Field(..., max_length=100, description="Algorithm used to train model")
    accuracy: Optional[float] = Field(None, ge=0.0, le=1.0, description="Model accuracy metrics")
    model_path: str = Field(..., max_length=512, description="Path where model artifact is saved")
    is_active: bool = Field(False, description="Indicator if model is currently serving prediction requests")

class ModelRegistryCreate(ModelRegistryBase):
    pass

class ModelRegistryUpdate(BaseModel):
    is_active: Optional[bool] = None
    accuracy: Optional[float] = Field(None, ge=0.0, le=1.0)

class ModelRegistryInDBBase(ModelRegistryBase):
    id: int
    trained_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ModelRegistry(ModelRegistryInDBBase):
    pass
