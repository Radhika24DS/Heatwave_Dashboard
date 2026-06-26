import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from app.models.enums import RiskLevel

class HeatwavePredictionBase(BaseModel):
    district_id: int = Field(..., description="ID of the district")
    prediction_date: datetime.date = Field(..., description="Date when the warning system generated prediction")
    forecast_date: datetime.date = Field(..., description="Target date predicted for")
    risk_level: RiskLevel = Field(..., description="Categorized risk assessment level")
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Numerical hazard risk score (0-100)")
    model_version: str = Field(..., max_length=50, description="Version tag of predicting model")
    shap_values: Optional[dict] = Field(None, description="SHAP feature contribution values")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Prediction confidence score")

class HeatwavePredictionCreate(HeatwavePredictionBase):
    pass

class HeatwavePredictionInDBBase(HeatwavePredictionBase):
    id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class HeatwavePrediction(HeatwavePredictionInDBBase):
    pass
