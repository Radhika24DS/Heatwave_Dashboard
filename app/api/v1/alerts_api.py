import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.api import deps
from app.db.session import get_db
from app.models.alert import Alert
from app.models.location import District
from app.models.user import User
from app.models.enums import AlertStatus, UserRole
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("")
async def list_alerts(
    district_id: Optional[int] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    limit: int = Query(50, le=100),
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns a paginated list of heatwave alerts.
    All authenticated users can view active alerts.
    Authority/Admin can view all statuses.
    """
    query = (
        select(Alert, District)
        .join(District, Alert.district_id == District.id)
    )

    if district_id:
        query = query.where(Alert.district_id == district_id)

    if status_filter:
        try:
            s = AlertStatus(status_filter.upper())
            query = query.where(Alert.status == s)
        except ValueError:
            pass  # Ignore invalid filter values

    query = query.order_by(desc(Alert.created_at)).limit(limit)
    result = await db.execute(query)
    rows = result.all()

    data = [
        {
            "id":            alert.id,
            "district_id":   alert.district_id,
            "district_name": district.name,
            "risk_level":    alert.risk_level.value,
            "message":       alert.message,
            "status":        alert.status.value,
            "issued_at":     alert.created_at.isoformat(),
        }
        for alert, district in rows
    ]

    return standard_response(
        status="success",
        data=data,
        message=f"Retrieved {len(data)} alerts.",
    )


@router.patch("/{alert_id}/resolve")
async def resolve_alert(
    alert_id: int,
    current_user: User = Depends(deps.require_roles([UserRole.AUTHORITY, UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Marks an alert as RESOLVED. Restricted to Authority and Admin roles.
    """
    result = await db.execute(select(Alert).where(Alert.id == alert_id))
    alert = result.scalars().first()

    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    alert.status = AlertStatus.RESOLVED
    await db.commit()

    return standard_response(
        status="success",
        data={"id": alert_id, "status": "RESOLVED"},
        message="Alert resolved successfully.",
    )
