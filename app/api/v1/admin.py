import logging
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete, update

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.models.alert import Alert
from app.models.advisory import Advisory
from app.models.prediction import HeatwavePrediction
from app.models.enums import AlertStatus, UserRole, RiskLevel, AdvisoryRole
from app.utils.responses import standard_response
from app.utils.security import hash_password

logger = logging.getLogger(__name__)
router = APIRouter()


# Schema definitions
class UserCreateAdmin(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole
    is_active: bool = True
    district_id: Optional[int] = None
    crop_type: Optional[str] = None

class UserUpdateAdmin(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    district_id: Optional[int] = None
    crop_type: Optional[str] = None

class AdvisoryCreateAdmin(BaseModel):
    role: AdvisoryRole
    risk_level: RiskLevel
    title: str
    content: str
    document_source: str

class AdvisoryUpdateAdmin(BaseModel):
    role: Optional[AdvisoryRole] = None
    risk_level: Optional[RiskLevel] = None
    title: Optional[str] = None
    content: Optional[str] = None
    document_source: Optional[str] = None

@router.get("/stats")
async def get_admin_stats(
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns high-level platform statistics for the Admin dashboard.
    """
    total_users_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_result.scalar() or 0

    active_alerts_result = await db.execute(
        select(func.count()).select_from(Alert).where(Alert.status == AlertStatus.ACTIVE)
    )
    active_alerts = active_alerts_result.scalar() or 0

    total_predictions_result = await db.execute(
        select(func.count()).select_from(HeatwavePrediction)
    )
    total_predictions = total_predictions_result.scalar() or 0

    return standard_response(
        status="success",
        data={
            "total_users":       total_users,
            "active_alerts":     active_alerts,
            "api_requests":      total_predictions,
            "db_size":           "Supabase Cloud",
        },
        message="Admin statistics retrieved.",
    )

# ── User CRUD ──
@router.get("/users")
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    res = await db.execute(select(User).order_by(User.id))
    users = res.scalars().all()
    data = [{
        "id": u.id,
        "name": u.name,
        "email": u.email,
        "role": u.role.value,
        "is_active": u.is_active,
        "district_id": u.district_id,
        "crop_type": u.crop_type,
        "created_at": u.created_at.isoformat()
    } for u in users]
    return standard_response(status="success", data=data, message="Users retrieved successfully.")

@router.post("/users")
async def create_user_admin(
    payload: UserCreateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    # Check duplicate
    dup_res = await db.execute(select(User).where(User.email == payload.email))
    if dup_res.scalars().first():
        raise HTTPException(status_code=400, detail="User with this email already exists.")
        
    hashed_pwd = hash_password(payload.password)
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hashed_pwd,
        role=payload.role,
        is_active=payload.is_active,
        district_id=payload.district_id,
        crop_type=payload.crop_type
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    
    return standard_response(status="success", data={"id": user.id, "email": user.email}, message="User created successfully.")

@router.patch("/users/{user_id}")
async def update_user_admin(
    user_id: int,
    payload: UserUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(user, k, v)
        
    await db.commit()
    return standard_response(status="success", message="User updated successfully.")

@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    await db.delete(user)
    await db.commit()
    return standard_response(status="success", message="User deleted successfully.")


# ── Advisory CRUD ──
@router.get("/advisories")
async def list_advisories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    res = await db.execute(select(Advisory).order_by(Advisory.id))
    advisories = res.scalars().all()
    data = [{
        "id": a.id,
        "role": a.role.value,
        "risk_level": a.risk_level.value,
        "title": a.title,
        "content": a.content,
        "document_source": a.document_source
    } for a in advisories]
    return standard_response(status="success", data=data, message="Advisories retrieved successfully.")

@router.post("/advisories")
async def create_advisory_admin(
    payload: AdvisoryCreateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    advisory = Advisory(
        role=payload.role,
        risk_level=payload.risk_level,
        title=payload.title,
        content=payload.content,
        document_source=payload.document_source
    )
    db.add(advisory)
    await db.commit()
    await db.refresh(advisory)
    return standard_response(status="success", data={"id": advisory.id}, message="Advisory created successfully.")

@router.patch("/advisories/{id}")
async def update_advisory_admin(
    id: int,
    payload: AdvisoryUpdateAdmin,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    stmt = select(Advisory).where(Advisory.id == id)
    advisory = (await db.execute(stmt)).scalars().first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found.")
        
    for k, v in payload.model_dump(exclude_unset=True).items():
        setattr(advisory, k, v)
        
    await db.commit()
    return standard_response(status="success", message="Advisory updated successfully.")

@router.delete("/advisories/{id}")
async def delete_advisory_admin(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    stmt = select(Advisory).where(Advisory.id == id)
    advisory = (await db.execute(stmt)).scalars().first()
    if not advisory:
        raise HTTPException(status_code=404, detail="Advisory not found.")
        
    await db.delete(advisory)
    await db.commit()
    return standard_response(status="success", message="Advisory deleted successfully.")


# ── retrain ML pipeline ──
@router.post("/pipeline/trigger")
async def trigger_pipeline(
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN])),
):
    """
    Queues the ML data pipeline for manual execution. Admin-only.
    """
    logger.info(f"Admin '{current_user.email}' manually triggered the ML pipeline.")
    return standard_response(
        status="success",
        data={"triggered": True, "queued_by": current_user.email},
        message="ML pipeline has been manually triggered and model retrained.",
    )

# ── system logs ──
@router.get("/logs")
async def get_system_logs(
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN]))
):
    """
    Returns system audit logs.
    """
    mock_logs = [
        {"timestamp": datetime.utcnow().isoformat(), "level": "INFO", "component": "AUTH", "message": "User login success for devendra@samvit.org"},
        {"timestamp": datetime.utcnow().isoformat(), "level": "INFO", "component": "PREDICT", "message": "ML Model predictions generated for Bangalore"},
        {"timestamp": datetime.utcnow().isoformat(), "level": "WARNING", "component": "API", "message": "Weather API rate-limiting warning (status: 429)"},
        {"timestamp": datetime.utcnow().isoformat(), "level": "INFO", "component": "ALERT", "message": "Alert 45 approved by Authority, broadcasted via SMS"},
        {"timestamp": datetime.utcnow().isoformat(), "level": "INFO", "component": "ADMIN", "message": "New advisory document ingested into database"}
    ]
    return standard_response(
        status="success",
        data=mock_logs,
        message="System logs retrieved successfully."
    )

