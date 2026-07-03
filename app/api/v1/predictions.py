import logging
from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Request, Query, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api import deps
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.models.prediction import HeatwavePrediction
from app.models.location import District
from app.schemas.prediction import PredictionRequest
from app.services.prediction import PredictionService
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)

router = APIRouter()
prediction_service = PredictionService()

@router.post("/forecast")
async def generate_heatwave_forecast(
    request: Request,
    payload: PredictionRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN, UserRole.AUTHORITY, UserRole.RESEARCH])),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates a heatwave risk forecast for a specific district and date.
    Gates access to ADMIN, AUTHORITY, and RESEARCH roles.
    """
    # Default to tomorrow's date if not specified
    forecast_date = payload.forecast_date
    if forecast_date is None:
        forecast_date = date.today() + timedelta(days=1)
        
    client_ip = request.client.host if request.client else None
    
    logger.info(f"User '{current_user.email}' ({current_user.role}) initiated forecast request for district {payload.district_id} on date {forecast_date}")
    
    result = await prediction_service.predict_and_warn(
        db=db,
        district_id=payload.district_id,
        forecast_date=forecast_date,
        user_id=current_user.id,
        user_role=current_user.role,
        client_ip=client_ip,
        background_tasks=background_tasks
    )
    
    return standard_response(
        status="success",
        data=result,
        message="Heatwave forecasting completed successfully."
    )


@router.get("/history")
async def get_prediction_history(
    days: int = Query(30, ge=1, le=90, description="Number of past days to retrieve"),
    district_id: Optional[int] = Query(None, description="Filter by district ID"),
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns historical heatwave predictions for the past N days.
    Optionally filtered by district.
    """
    cutoff = date.today() - timedelta(days=days)

    query = (
        select(HeatwavePrediction, District)
        .join(District, HeatwavePrediction.district_id == District.id)
        .where(HeatwavePrediction.forecast_date >= cutoff)
    )
    if district_id:
        query = query.where(HeatwavePrediction.district_id == district_id)

    query = query.order_by(desc(HeatwavePrediction.forecast_date))
    result = await db.execute(query)
    rows = result.all()

    data = [
        {
            "id":            pred.id,
            "district_id":   district.id,
            "district_name": district.name,
            "forecast_date": pred.forecast_date.isoformat(),
            "predicted_at":  pred.created_at.isoformat(),
            "risk_level":    pred.risk_level.value,
            "risk_score":    round(pred.risk_score, 3),
            "confidence":    round(pred.confidence or 0, 3),
            "model_version": pred.model_version,
        }
        for pred, district in rows
    ]

    return standard_response(
        status="success",
        data=data,
        message=f"Retrieved {len(data)} prediction records for the last {days} days.",
    )

