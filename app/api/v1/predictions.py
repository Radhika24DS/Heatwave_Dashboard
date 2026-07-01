import logging
from datetime import date, timedelta
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
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
        client_ip=client_ip
    )
    
    return standard_response(
        status="success",
        data=result,
        message="Heatwave forecasting completed successfully."
    )
