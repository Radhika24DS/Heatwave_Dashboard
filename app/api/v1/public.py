import logging
from datetime import date, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api import deps
from app.db.session import get_db
from app.models.location import District
from app.models.prediction import HeatwavePrediction
from app.models.advisory import Advisory
from app.models.enums import AdvisoryRole, RiskLevel
from app.services.prediction import PredictionService
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter()
prediction_service = PredictionService()

@router.get("/risk")
async def get_public_risk(
    district: str = Query(..., description="District ID or Name"),
    background_tasks: BackgroundTasks = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns current heatwave risk information, weather metrics, 3-day forecast,
    and all districts risk map details.
    """
    # 1. Locate District
    if district.isdigit():
        stmt = select(District).where(District.id == int(district))
    else:
        stmt = select(District).where(District.name.ilike(f"%{district}%"))
    
    res = await db.execute(stmt)
    dist = res.scalars().first()
    if not dist:
        raise HTTPException(status_code=404, detail=f"District '{district}' not found.")

    # 2. Get today's risk score and weather (cached or predicted)
    today = date.today()
    
    # Check cache for today
    cache_stmt = select(HeatwavePrediction).where(
        HeatwavePrediction.district_id == dist.id,
        HeatwavePrediction.forecast_date == today
    ).order_by(desc(HeatwavePrediction.created_at)).limit(1)
    
    cache_res = await db.execute(cache_stmt)
    cached_pred = cache_res.scalars().first()
    
    if cached_pred:
        # Retrieve today's risk
        risk_level = cached_pred.risk_level.value
        risk_score = cached_pred.risk_score
        temp = 38.5  # default fallbacks
        humidity = 60.0
        wind = 12.0
        apparent_heat_index = 41.0
        
        # Pull live weather details from prediction if we had cached them or query prediction service
        try:
            pred_res = await prediction_service.predict_and_warn(
                db=db, district_id=dist.id, forecast_date=today, background_tasks=background_tasks
            )
            temp = pred_res["weather"]["tempmax"]
            humidity = pred_res["weather"]["humidity"]
            wind = pred_res["weather"]["windspeed"]
            apparent_heat_index = pred_res["weather"]["apparent_heat_index"]
        except Exception:
            pass
    else:
        # Generate prediction on the fly
        try:
            pred_res = await prediction_service.predict_and_warn(
                db=db, district_id=dist.id, forecast_date=today, background_tasks=background_tasks
            )
            risk_level = pred_res["alert"]["risk_level"]
            risk_score = pred_res["prediction"]["risk_score"]
            temp = pred_res["weather"]["tempmax"]
            humidity = pred_res["weather"]["humidity"]
            wind = pred_res["weather"]["windspeed"]
            apparent_heat_index = pred_res["weather"]["apparent_heat_index"]
        except Exception as e:
            logger.error(f"Failsafe prediction fallback: {e}")
            risk_level = "LOW"
            risk_score = 0.1
            temp = 35.0
            humidity = 55.0
            wind = 10.0
            apparent_heat_index = 37.0

    # 3. Compile 3-Day Forecast
    forecast = []
    for i in range(3):
        f_date = today + timedelta(days=i)
        
        # Check cache
        fc_stmt = select(HeatwavePrediction).where(
            HeatwavePrediction.district_id == dist.id,
            HeatwavePrediction.forecast_date == f_date
        ).order_by(desc(HeatwavePrediction.created_at)).limit(1)
        fc_res = await db.execute(fc_stmt)
        fc_pred = fc_res.scalars().first()
        
        if fc_pred:
            forecast.append({
                "date": f_date.isoformat(),
                "risk_level": fc_pred.risk_level.value,
                "temp_min": 24.0,  # Failsafe defaults
                "temp_max": 24.0 + (fc_pred.risk_score * 15.0),
                "humidity": 60.0,
                "weather_icon": "sun" if fc_pred.risk_level != RiskLevel.LOW else "cloud-sun"
            })
        else:
            # Predict or mock forecast detail
            try:
                pred_res = await prediction_service.predict_and_warn(
                    db=db, district_id=dist.id, forecast_date=f_date, background_tasks=background_tasks
                )
                forecast.append({
                    "date": f_date.isoformat(),
                    "risk_level": pred_res["alert"]["risk_level"],
                    "temp_min": pred_res["weather"]["tempmin"],
                    "temp_max": pred_res["weather"]["tempmax"],
                    "humidity": pred_res["weather"]["humidity"],
                    "weather_icon": "sun" if pred_res["alert"]["risk_level"] in ["HIGH", "EXTREME"] else "cloud-sun"
                })
            except Exception:
                forecast.append({
                    "date": f_date.isoformat(),
                    "risk_level": "LOW",
                    "temp_min": 22.0,
                    "temp_max": 35.0,
                    "humidity": 55.0,
                    "weather_icon": "cloud-sun"
                })

    # 4. Gather Map Data (latest prediction for each district)
    map_data = []
    all_districts_res = await db.execute(select(District))
    all_districts = all_districts_res.scalars().all()
    
    for d in all_districts:
        d_stmt = select(HeatwavePrediction).where(
            HeatwavePrediction.district_id == d.id
        ).order_by(desc(HeatwavePrediction.forecast_date)).limit(1)
        d_pred = (await db.execute(d_stmt)).scalars().first()
        
        map_data.append({
            "district_id": d.id,
            "district_name": d.name,
            "latitude": d.latitude,
            "longitude": d.longitude,
            "risk_level": d_pred.risk_level.value if d_pred else "LOW",
            "temperature": 35.0 + ((d_pred.risk_score * 10) if d_pred else 0)
        })

    return standard_response(
        status="success",
        data={
            "district_id": dist.id,
            "district_name": dist.name,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "temperature": temp,
            "humidity": humidity,
            "wind": wind,
            "apparent_heat_index": apparent_heat_index,
            "forecast": forecast,
            "map_data": map_data
        },
        message="Risk data retrieved successfully."
    )

@router.get("/advisories")
async def get_public_advisories(
    risk_level: str = Query("LOW", description="Risk level (LOW, MODERATE, HIGH, EXTREME)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetches generic health advisories filtered by risk level.
    """
    try:
        level_enum = RiskLevel(risk_level.upper())
    except ValueError:
        level_enum = RiskLevel.LOW
        
    stmt = select(Advisory).where(
        Advisory.role == AdvisoryRole.PUBLIC,
        Advisory.risk_level == level_enum
    )
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    data = [
        {"id": a.id, "title": a.title, "content": a.content, "source": a.document_source}
        for a in records
    ]
    
    # Fallback standard advisory if DB is empty
    if not data:
        data = [{
            "id": 0,
            "title": f"{risk_level.capitalize()} Risk Advisory",
            "content": "Drink water regularly, stay in shaded areas during peak hours, and check on elderly neighbors.",
            "source": "Standard Guidelines"
        }]
        
    return standard_response(
        status="success",
        data=data,
        message=f"Retrieved {len(data)} public advisories."
    )

@router.get("/forecast")
async def get_public_forecast_only(
    district: str = Query(..., description="District ID or Name"),
    db: AsyncSession = Depends(get_db)
):
    """
    Dedicated 3-day forecast endpoint.
    """
    if district.isdigit():
        stmt = select(District).where(District.id == int(district))
    else:
        stmt = select(District).where(District.name.ilike(f"%{district}%"))
    
    res = await db.execute(stmt)
    dist = res.scalars().first()
    if not dist:
        raise HTTPException(status_code=404, detail="District not found.")
        
    # Query forecast predictions
    today = date.today()
    forecast = []
    
    for i in range(3):
        f_date = today + timedelta(days=i)
        stmt = select(HeatwavePrediction).where(
            HeatwavePrediction.district_id == dist.id,
            HeatwavePrediction.forecast_date == f_date
        ).order_by(desc(HeatwavePrediction.created_at)).limit(1)
        
        pred = (await db.execute(stmt)).scalars().first()
        
        forecast.append({
            "date": f_date.isoformat(),
            "risk_level": pred.risk_level.value if pred else "LOW",
            "temp_max": 35.0 + (pred.risk_score * 8.0 if pred else 0),
            "humidity": 60.0
        })
        
    return standard_response(
        status="success",
        data=forecast,
        message="3-day forecast retrieved successfully."
    )
