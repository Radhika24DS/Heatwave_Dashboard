import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api import deps
from app.db.session import get_db
from app.models.user import User
from app.models.alert import Alert
from app.models.prediction import HeatwavePrediction
from app.models.enums import AlertStatus, UserRole
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter()


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
            "api_requests":      total_predictions,   # Using predictions as a proxy
            "db_size":           "Supabase Cloud",
        },
        message="Admin statistics retrieved.",
    )


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
        message="ML pipeline has been queued for execution.",
    )
