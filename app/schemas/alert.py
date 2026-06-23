from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import RiskLevel, AlertStatus

class AlertBase(BaseModel):
    district_id: int = Field(..., description="Target district ID")
    issued_by_user_id: Optional[int] = Field(None, description="System user ID who authorized/triggered the alert")
    risk_level: RiskLevel = Field(..., description="Warning hazard risk level")
    message: str = Field(..., description="Content of the alert warning message")
    status: AlertStatus = Field(AlertStatus.ACTIVE, description="Current alert status")

class AlertCreate(AlertBase):
    pass

class AlertUpdate(BaseModel):
    risk_level: Optional[RiskLevel] = None
    message: Optional[str] = None
    status: Optional[AlertStatus] = None

class AlertInDBBase(AlertBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Alert(AlertInDBBase):
    pass
