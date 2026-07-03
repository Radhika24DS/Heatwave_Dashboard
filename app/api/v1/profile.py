import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel, EmailStr

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.utils.security import hash_password, verify_password
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter()


class ProfileUpdate(BaseModel):
    name:  Optional[str]       = None
    email: Optional[EmailStr]  = None


class PasswordChange(BaseModel):
    current_password: str
    new_password:     str


@router.get("/me")
async def get_profile(
    current_user: User = Depends(deps.get_current_user),
):
    """
    Returns the authenticated user's profile decoded from the JWT.
    """
    return standard_response(
        status="success",
        data={
            "id":         current_user.id,
            "name":       current_user.name,
            "email":      current_user.email,
            "role":       current_user.role.value,
            "is_active":  current_user.is_active,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
            "updated_at": current_user.updated_at.isoformat() if current_user.updated_at else None,
        },
        message="Profile retrieved successfully.",
    )


@router.patch("/profile")
async def update_profile(
    updates: ProfileUpdate,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Updates the authenticated user's name and/or email.
    """
    if updates.name:
        current_user.name = updates.name
    if updates.email:
        current_user.email = updates.email

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        logger.error(f"Profile update failed: {e}")
        raise HTTPException(status_code=500, detail="Profile update failed.")

    return standard_response(
        status="success",
        data={"name": current_user.name, "email": current_user.email},
        message="Profile updated successfully.",
    )


@router.post("/change-password")
async def change_password(
    payload: PasswordChange,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Changes the authenticated user's password after verifying the current one.
    """
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    if len(payload.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="New password must be at least 8 characters.",
        )

    current_user.hashed_password = hash_password(payload.new_password)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        logger.error(f"Password change failed: {e}")
        raise HTTPException(status_code=500, detail="Password change failed.")

    return standard_response(
        status="success",
        data=None,
        message="Password changed successfully.",
    )
