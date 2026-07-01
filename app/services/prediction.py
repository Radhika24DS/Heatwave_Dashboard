import json
import logging
from datetime import date
from typing import Dict, Tuple
import joblib
import numpy as np
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.location import District
from app.models.prediction import HeatwavePrediction
from app.models.forecast import Forecast
from app.models.alert import Alert
from app.models.log import SystemLog
from app.models.enums import RiskLevel, AlertStatus
from app.services.weather import WeatherService
from app.services.features import FeatureBuilderService

logger = logging.getLogger(__name__)

class PredictionService:
    """
    Core service managing model execution, threshold adjustments,
    alert classification, and database audit logs.
    """
    _pipeline = None

    def __init__(self):
        self.weather_service = WeatherService()
        self.feature_service = FeatureBuilderService()

    @classmethod
    def get_pipeline(cls):
        """
        Retrieves the preloaded model pipeline, caching it as a class attribute.
        """
        if cls._pipeline is None:
            logger.info(f"Loading serialized model pipeline from {settings.FINAL_PIPELINE_PATH}...")
            try:
                cls._pipeline = joblib.load(settings.FINAL_PIPELINE_PATH)
                logger.info("Pipeline loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load pipeline from {settings.FINAL_PIPELINE_PATH}: {e}", exc_info=True)
                raise RuntimeError("Failed to initialize heatwave forecasting model.")
        return cls._pipeline

    async def predict_and_warn(
        self,
        db: AsyncSession,
        district_id: int,
        forecast_date: date,
        user_id: int = None,
        client_ip: str = None
    ) -> Dict:
        """
        Orchestrates weather forecast retrieval, feature engineering, classification,
        safety-net alert elevation, and persistence.
        """
        pipeline = self.get_pipeline()
        
        # 1. Fetch District coordinates
        result = await db.execute(select(District).where(District.id == district_id))
        district = result.scalars().first()
        if not district:
            logger.error(f"Prediction requested for non-existent district ID {district_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"District with ID {district_id} not found."
            )
            
        # 2. Retrieve live API forecast (with NASA POWER fallback)
        weather_data, provider_used = await self.weather_service.get_forecast(
            latitude=district.latitude,
            longitude=district.longitude,
            forecast_date=forecast_date
        )
        
        # 3. Build features using training-serving consistent pipeline
        X_infer, target_heat_index = await self.feature_service.build_inference_vector(
            db=db,
            district_id=district_id,
            forecast_date=forecast_date,
            live_forecast=weather_data,
            feature_names=pipeline.feature_names
        )
        
        # 4. Model prediction with decision thresholds
        scaler = pipeline.named_steps['scaler']
        model = pipeline.named_steps['classifier']
        
        X_scaled = scaler.transform(X_infer)
        y_prob = model.predict_proba(X_scaled)
        
        # Pad classes to 3 (Normal, Moderate, Severe) if necessary
        if y_prob.shape[1] < 3:
            full_prob = np.zeros((len(y_prob), 3))
            for idx, c in enumerate(model.classes_):
                full_prob[:, int(c)] = y_prob[:, idx]
            y_prob_eval = full_prob
        else:
            y_prob_eval = y_prob
            
        p0, p1, p2 = y_prob_eval[0]
        
        # Extract deployed thresholds (Moderate=0.20, Severe=0.16)
        t_mod = getattr(pipeline, "threshold_moderate", 0.20)
        t_sev = getattr(pipeline, "threshold_severe", 0.16)
        
        if p2 >= t_sev:
            predicted_class = 2
            severity_tier = "Severe"
        elif p1 >= t_mod:
            predicted_class = 1
            severity_tier = "Moderate"
        else:
            predicted_class = 0
            severity_tier = "Normal"
            
        confidence = float(y_prob_eval[0][predicted_class])
        risk_score = float(p1 + p2)  # Probability of any heatwave
        
        # 5. Apply proposed Alert Level & Safety-Net Mapping
        tempmax = weather_data["tempmax"]
        
        alert_level = "Normal"
        risk_level_enum = RiskLevel.LOW
        
        if predicted_class == 0:
            if tempmax >= 37.0 or target_heat_index >= 40.0:
                alert_level = "Watch"
                risk_level_enum = RiskLevel.MODERATE
            else:
                alert_level = "Normal"
                risk_level_enum = RiskLevel.LOW
        elif predicted_class == 1:
            if tempmax >= 40.0 or target_heat_index >= 45.0:
                alert_level = "Warning"
                risk_level_enum = RiskLevel.HIGH
            else:
                alert_level = "Watch"
                risk_level_enum = RiskLevel.MODERATE
        elif predicted_class == 2:
            if tempmax >= 43.0 or target_heat_index >= 48.0:
                alert_level = "Extreme"
                risk_level_enum = RiskLevel.EXTREME
            else:
                alert_level = "Warning"
                risk_level_enum = RiskLevel.HIGH
                
        # 6. Database Persistence
        
        # A. Store Prediction in heatwave_predictions
        prediction_rec = HeatwavePrediction(
            district_id=district_id,
            prediction_date=date.today(),
            forecast_date=forecast_date,
            risk_level=risk_level_enum,
            risk_score=risk_score,
            model_version="1.0.0",
            shap_values=None,
            confidence=confidence
        )
        db.add(prediction_rec)
        
        # B. Upsert Forecast in forecast table
        forecast_stmt = select(Forecast).where(Forecast.forecast_date == forecast_date)
        forecast_result = await db.execute(forecast_stmt)
        forecast_rec = forecast_result.scalars().first()
        
        if forecast_rec:
            forecast_rec.predicted_value = risk_score
        else:
            forecast_rec = Forecast(
                forecast_date=forecast_date,
                predicted_value=risk_score
            )
            db.add(forecast_rec)
            
        # C. Store Alert if risk level is not LOW
        alert_message = ""
        if risk_level_enum != RiskLevel.LOW:
            alert_message = (
                f"Heatwave {alert_level} issued for {district.name} on {forecast_date}. "
                f"Predicted tempmax: {tempmax:.1f}°C, apparent heat index: {target_heat_index:.1f}°C. "
                f"Public Risk Category: {risk_level_enum.value}."
            )
            alert_rec = Alert(
                district_id=district_id,
                issued_by_user_id=user_id,
                risk_level=risk_level_enum,
                message=alert_message,
                status=AlertStatus.ACTIVE
            )
            db.add(alert_rec)
            
        # D. Log the API call in system_logs (reconciled table name from migrations)
        log_details = {
            "endpoint": "/api/v1/predictions/forecast",
            "district_id": district_id,
            "district_name": district.name,
            "forecast_date": forecast_date.isoformat(),
            "provider": provider_used,
            "predicted_class": predicted_class,
            "severity_tier": severity_tier,
            "risk_score": risk_score,
            "alert_level": alert_level,
            "tempmax": tempmax,
            "apparent_heat_index": target_heat_index
        }
        log_rec = SystemLog(
            user_id=user_id,
            action="HEATWAVE_FORECAST_PREDICT",
            details=json.dumps(log_details),
            ip_address=client_ip
        )
        db.add(log_rec)
        
        try:
            await db.commit()
            await db.refresh(prediction_rec)
            logger.info(f"Prediction successfully persisted for district {district.name} on {forecast_date}.")
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to persist prediction / alert records to DB: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database write operation failed during forecasting."
            )
            
        # 7. Construct Placeholder Advisory (full RAG comes in Phase 7)
        advisory_msg = (
            "1. Hydration: Drink plenty of water throughout the day. Avoid alcohol and caffeine.\n"
            "2. Shading: Stay indoors or under heavy shade during peak sunshine hours (11:00 AM - 4:00 PM).\n"
            "3. Agriculture & Animal Welfare: Schedule farming activities in early morning. Ensure cattle have wet bedding, shade, and fresh drinking water."
        )
        
        response_payload = {
            "district_id": district.id,
            "district_name": district.name,
            "forecast_date": forecast_date.isoformat(),
            "weather": {
                "tempmax": tempmax,
                "tempmin": weather_data["tempmin"],
                "temp": weather_data["temp"],
                "humidity": weather_data["humidity"],
                "windspeed": weather_data["windspeed"],
                "sealevelpressure": weather_data["sealevelpressure"],
                "solarradiation": weather_data["solarradiation"],
                "precip": weather_data["precip"],
                "apparent_heat_index": target_heat_index,
                "provider": provider_used
            },
            "prediction": {
                "predicted_class": predicted_class,
                "severity_tier": severity_tier,
                "risk_score": risk_score,
                "risk_percent": risk_score * 100,
                "probabilities": [float(p) for p in y_prob_eval[0]],
                "confidence": confidence,
                "model_version": "1.0.0"
            },
            "alert": {
                "alert_level": alert_level,
                "risk_level": risk_level_enum.value,
                "message": alert_message if alert_message else "No active heatwave warnings."
            },
            "advisory": {
                "target_demographic": "PUBLIC, FARMER, TRAVELLER",
                "message": advisory_msg,
                "source": "HEWS Climatological Standard Advisory Placeholder"
            }
        }
        
        return response_payload
