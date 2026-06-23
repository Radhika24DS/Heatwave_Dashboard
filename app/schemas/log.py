from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class SystemLogBase(BaseModel):
    user_id: Optional[int] = Field(None, description="User ID associated with the audit event")
    action: str = Field(..., max_length=100, description="Performed action label")
    details: Optional[str] = Field(None, description="Detailed JSON/string payload about action")
    ip_address: Optional[str] = Field(None, max_length=45, description="User IP address (IPv4 or IPv6)")

class SystemLogCreate(SystemLogBase):
    pass

class SystemLogInDBBase(SystemLogBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SystemLog(SystemLogInDBBase):
    pass
