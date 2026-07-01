from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.enums import UserRole

class UserBase(BaseModel):
    name: str = Field(..., max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="User's login/notification email")
    role: UserRole = Field(..., description="System access role")
    is_active: bool = Field(True, description="Whether the user account is active")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100, description="Plain text password")

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=100)

class UserInDBBase(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass

class UserLogin(BaseModel):
    email: EmailStr = Field(..., description="User's login email")
    password: str = Field(..., min_length=8, max_length=100, description="Plain text password")

