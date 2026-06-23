from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import AdvisoryRole, RiskLevel

class AdvisoryBase(BaseModel):
    role: AdvisoryRole = Field(..., description="Target demographic group")
    risk_level: RiskLevel = Field(..., description="Triggering hazard risk level")
    title: str = Field(..., max_length=255, description="Advisory headline")
    content: str = Field(..., description="Safety and protection guidelines")
    document_source: Optional[str] = Field(None, max_length=255, description="Official source URL or reference link")

class AdvisoryCreate(AdvisoryBase):
    pass

class AdvisoryUpdate(BaseModel):
    role: Optional[AdvisoryRole] = None
    risk_level: Optional[RiskLevel] = None
    title: Optional[str] = Field(None, max_length=255)
    content: Optional[str] = None
    document_source: Optional[str] = Field(None, max_length=255)

class AdvisoryInDBBase(AdvisoryBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Advisory(AdvisoryInDBBase):
    pass
