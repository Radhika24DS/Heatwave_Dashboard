import logging
import math
from datetime import date
from typing import Optional, List
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.api import deps
from app.db.session import get_db
from app.models.location import District
from app.models.prediction import HeatwavePrediction
from app.models.advisory import Advisory
from app.models.enums import AdvisoryRole, RiskLevel
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter()

class RoutePlanRequest(BaseModel):
    from_lat: float
    from_lon: float
    to_lat: float
    to_lon: float

def haversine_distance(lat1, lon1, lat2, lon2):
    """
    Computes distance in km between two lat/lon coordinates.
    """
    R = 6371.0 # Earth radius
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    
    a = math.sin(d_lat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

async def get_route_insights_engine(from_lat: float, from_lon: float, to_lat: float, to_lon: float, db: AsyncSession):
    # 1. Fetch all districts
    res = await db.execute(select(District))
    all_districts = res.scalars().all()
    
    if not all_districts:
        raise HTTPException(status_code=404, detail="No districts configured in database.")

    # 2. Find closest districts to start, end, and midpoint
    # Haversine distance list
    start_distances = []
    end_distances = []
    mid_lat = (from_lat + to_lat) / 2.0
    mid_lon = (from_lon + to_lon) / 2.0
    mid_distances = []
    
    for d in all_districts:
        start_distances.append((haversine_distance(from_lat, from_lon, d.latitude, d.longitude), d))
        end_distances.append((haversine_distance(to_lat, to_lon, d.latitude, d.longitude), d))
        mid_distances.append((haversine_distance(mid_lat, mid_lon, d.latitude, d.longitude), d))
        
    start_distances.sort(key=lambda x: x[0])
    end_distances.sort(key=lambda x: x[0])
    mid_distances.sort(key=lambda x: x[0])
    
    start_district = start_distances[0][1]
    end_district = end_distances[0][1]
    
    # Compile route districts (deduplicated)
    route_districts = [start_district]
    
    # If the distance is significant, add the midpoint district
    distance_total = haversine_distance(from_lat, from_lon, to_lat, to_lon)
    if distance_total > 50:
        mid_district = mid_distances[0][1]
        if mid_district.id != start_district.id and mid_district.id != end_district.id:
            route_districts.append(mid_district)
            
    if end_district.id != start_district.id:
        route_districts.append(end_district)

    # 3. Retrieve latest prediction details for each segment
    route_segments = []
    has_extreme = False
    has_high = False
    highest_temp = 35.0
    
    for d in route_districts:
        pred_stmt = select(HeatwavePrediction).where(
            HeatwavePrediction.district_id == d.id
        ).order_by(desc(HeatwavePrediction.forecast_date)).limit(1)
        
        pred = (await db.execute(pred_stmt)).scalars().first()
        
        risk_lvl = pred.risk_level.value if pred else "LOW"
        risk_score = pred.risk_score if pred else 0.1
        temp = 35.0 + (risk_score * 9.0)
        humidity = 60.0 - (risk_score * 15.0)
        
        if risk_lvl == "EXTREME":
            has_extreme = True
        elif risk_lvl == "HIGH":
            has_high = True
            
        if temp > highest_temp:
            highest_temp = temp
            
        route_segments.append({
            "lat": d.latitude,
            "lon": d.longitude,
            "district_name": d.name,
            "risk_level": risk_lvl,
            "temp": round(temp, 1),
            "humidity": round(humidity, 1)
        })

    # 4. Generate warnings and recommendations
    warnings = []
    best_time = "6 AM - 10 AM"
    
    if has_extreme or highest_temp >= 43:
        warnings.append("⚠️ Extreme heat warning! Road surface temperatures may cause tires or asphalt softening.")
        warnings.append("🚨 Postpone all non-essential road travel during peak heat (11 AM - 4 PM).")
        best_time = "5 AM - 8 AM or after 7 PM"
    elif has_high or highest_temp >= 40:
        warnings.append("⚠️ High heat alert! Avoid two-wheeler or open-vehicle travel between 11 AM and 4 PM.")
        best_time = "6 AM - 9 AM or after 6 PM"
    else:
        warnings.append("✅ Safe journey. Carry drinking water and plan normal travel stops.")

    # Standard hydration warnings
    warnings.append("💧 Drink water and ORS solution every 45-60 minutes regardless of thirst.")
    
    estimated_duration = (distance_total / 60.0) * 60.0 # minutes assuming 60km/h
    
    return {
        "route_segments": route_segments,
        "total_distance": round(distance_total, 1),
        "best_time_to_travel": best_time,
        "warnings": warnings,
        "estimated_duration": int(estimated_duration)
    }

@router.post("/route-plan")
async def create_route_plan(
    payload: RoutePlanRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Computes a route plan between two coordinates and calculates risk levels per segment.
    """
    data = await get_route_insights_engine(
        payload.from_lat, payload.from_lon, payload.to_lat, payload.to_lon, db
    )
    return standard_response(
        status="success",
        data=data,
        message="Route safety plan compiled successfully."
    )

@router.get("/route-insights")
async def get_route_insights(
    from_coords: str = Query(..., alias="from", description="Origin lat,lon coordinates (e.g. 12.97,77.59)"),
    to_coords: str = Query(..., alias="to", description="Destination lat,lon coordinates"),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves route insights via query parameters.
    """
    try:
        f_lat, f_lon = map(float, from_coords.split(','))
        t_lat, t_lon = map(float, to_coords.split(','))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid coordinates format. Expected 'lat,lon'.")
        
    data = await get_route_insights_engine(f_lat, f_lon, t_lat, t_lon, db)
    return standard_response(
        status="success",
        data=data,
        message="Route insights compiled successfully."
    )

@router.get("/advisories")
async def get_traveler_advisories(
    risk_level: str = Query("LOW", description="Risk level filter"),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetches traveler-specific advisories.
    """
    try:
        level_enum = RiskLevel(risk_level.upper())
    except ValueError:
        level_enum = RiskLevel.LOW
        
    stmt = select(Advisory).where(
        Advisory.role == AdvisoryRole.TRAVELLER,
        Advisory.risk_level == level_enum
    )
    res = await db.execute(stmt)
    records = res.scalars().all()
    
    data = [
        {"id": a.id, "title": a.title, "content": a.content, "source": a.document_source}
        for a in records
    ]
    
    if not data:
        data = [{
            "id": 0,
            "title": f"Travel safety guidelines for {risk_level.lower()} risk",
            "content": "Ensure you carry sufficient water, plan shaded rest breaks, and check vehicle AC before departing.",
            "source": "Standard Travel safety Guidelines"
        }]
        
    return standard_response(
        status="success",
        data=data,
        message="Traveler advisories retrieved successfully."
    )
