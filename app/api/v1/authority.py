import logging
import csv
import io
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, update

from app.api import deps
from app.db.session import get_db
from app.models.location import District
from app.models.prediction import HeatwavePrediction
from app.models.alert import Alert
from app.models.user import User
from app.models.enums import RiskLevel, AlertStatus, UserRole
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)
router = APIRouter()

class AlertCreateUpdate(BaseModel):
    district_id: int
    risk_level: str
    message: str
    status: str  # DRAFT, SENT, CANCELLED, ACTIVE, RESOLVED

@router.get("/risk-ranking")
async def get_risk_ranking(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.AUTHORITY, UserRole.ADMIN, UserRole.RESEARCH]))
):
    """
    Returns a ranked list of districts sorted by current risk score.
    """
    # Select districts join predictions
    stmt = select(District)
    res = await db.execute(stmt)
    districts = res.scalars().all()
    
    ranking = []
    for d in districts:
        pred_stmt = select(HeatwavePrediction).where(
            HeatwavePrediction.district_id == d.id
        ).order_by(desc(HeatwavePrediction.forecast_date)).limit(1)
        pred = (await db.execute(pred_stmt)).scalars().first()
        
        risk_score = pred.risk_score if pred else 0.1
        risk_lvl = pred.risk_level.value if pred else "LOW"
        recorded_at = pred.created_at.isoformat() if pred else datetime.utcnow().isoformat()
        
        # approximate weather details
        temp = 35.0 + (risk_score * 9.0)
        humidity = 60.0 - (risk_score * 15.0)
        
        ranking.append({
            "district_id": d.id,
            "district_name": d.name,
            "risk_level": risk_lvl,
            "risk_score": round(risk_score, 3),
            "temperature": round(temp, 1),
            "humidity": round(humidity, 1),
            "timestamp": recorded_at
        })
        
    ranking.sort(key=lambda x: x["risk_score"], reverse=True)
    return standard_response(
        status="success",
        data=ranking,
        message="District risk rankings retrieved successfully."
    )

@router.get("/alerts")
async def list_authority_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.AUTHORITY, UserRole.ADMIN]))
):
    """
    Returns all alerts including drafts, sent, resolved, active, and cancelled alerts.
    """
    stmt = select(Alert, District).join(District, Alert.district_id == District.id).order_by(desc(Alert.created_at))
    res = await db.execute(stmt)
    rows = res.all()
    
    data = []
    for alert, district in rows:
        data.append({
            "id": alert.id,
            "district_id": alert.district_id,
            "district_name": district.name,
            "risk_level": alert.risk_level.value,
            "message": alert.message,
            "status": alert.status.value,
            "created_at": alert.created_at.isoformat()
        })
        
    return standard_response(
        status="success",
        data=data,
        message=f"Retrieved {len(data)} authority alerts."
    )

@router.post("/alerts")
async def create_alert(
    payload: AlertCreateUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.AUTHORITY, UserRole.ADMIN]))
):
    """
    Creates a new alert (typically in 'DRAFT' status).
    """
    try:
        risk_lvl = RiskLevel(payload.risk_level.upper())
        status_enum = AlertStatus(payload.status.upper())
    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid enum value: {e}")
        
    # Check district
    d_res = await db.execute(select(District).where(District.id == payload.district_id))
    if not d_res.scalars().first():
        raise HTTPException(status_code=404, detail="District not found.")
        
    alert = Alert(
        district_id=payload.district_id,
        issued_by_user_id=current_user.id,
        risk_level=risk_lvl,
        message=payload.message,
        status=status_enum
    )
    db.add(alert)
    await db.commit()
    await db.refresh(alert)
    
    return standard_response(
        status="success",
        data={
            "id": alert.id,
            "status": alert.status.value,
            "message": alert.message
        },
        message="Alert created successfully."
    )

@router.patch("/alerts/{alert_id}")
async def update_alert(
    alert_id: int,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.AUTHORITY, UserRole.ADMIN]))
):
    """
    Updates an alert message, risk level, or status (draft, sent, cancelled, resolved).
    """
    stmt = select(Alert).where(Alert.id == alert_id)
    res = await db.execute(stmt)
    alert = res.scalars().first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
        
    if "message" in payload:
        alert.message = payload["message"]
        
    if "status" in payload:
        try:
            alert.status = AlertStatus(payload["status"].upper())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid status value.")
            
    if "risk_level" in payload:
        try:
            alert.risk_level = RiskLevel(payload["risk_level"].upper())
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid risk level value.")
            
    await db.commit()
    return standard_response(
        status="success",
        data={
            "id": alert.id,
            "status": alert.status.value,
            "message": alert.message
        },
        message="Alert updated successfully."
    )

@router.get("/reports")
async def download_reports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(deps.require_roles([UserRole.AUTHORITY, UserRole.ADMIN]))
):
    """
    Generates and streams a CSV report containing district risk rankings and active alerts.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write rankings header
    writer.writerow(["--- DISTRICT RISK RANKINGS ---"])
    writer.writerow(["Rank", "District", "Risk Level", "Risk Score", "Temperature (C)", "Humidity (%)", "Timestamp"])
    
    # Rankings data
    res = await db.execute(select(District))
    districts = res.scalars().all()
    ranking = []
    for d in districts:
        pred_stmt = select(HeatwavePrediction).where(
            HeatwavePrediction.district_id == d.id
        ).order_by(desc(HeatwavePrediction.forecast_date)).limit(1)
        pred = (await db.execute(pred_stmt)).scalars().first()
        
        score = pred.risk_score if pred else 0.1
        ranking.append((score, d, pred))
        
    ranking.sort(key=lambda x: x[0], reverse=True)
    
    for idx, (score, d, pred) in enumerate(ranking, 1):
        lvl = pred.risk_level.value if pred else "LOW"
        recorded_at = pred.created_at.isoformat() if pred else ""
        temp = 35.0 + (score * 9.0)
        humidity = 60.0 - (score * 15.0)
        writer.writerow([idx, d.name, lvl, round(score, 3), round(temp, 1), round(humidity, 1), recorded_at])
        
    writer.writerow([])
    writer.writerow(["--- ACTIVE ALERTS HISTORY ---"])
    writer.writerow(["Alert ID", "District", "Risk Level", "Message", "Status", "Issued At"])
    
    alert_stmt = select(Alert, District).join(District, Alert.district_id == District.id).order_by(desc(Alert.created_at))
    alert_res = await db.execute(alert_stmt)
    for alert, district in alert_res.all():
        writer.writerow([alert.id, district.name, alert.risk_level.value, alert.message, alert.status.value, alert.created_at.isoformat()])
        
    output.seek(0)
    
    filename = f"SAMVIT_Authority_Report_{date.today().isoformat()}.csv"
    headers = {
        'Content-Disposition': f'attachment; filename="{filename}"'
    }
    
    return StreamingResponse(io.BytesIO(output.getvalue().encode('utf-8')), media_type="text/csv", headers=headers)
