from sqlalchemy import BigInteger, ForeignKey, Date, Float, String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from app.db.base_class import Base
from app.models.enums import RiskLevel

class HeatwavePrediction(Base):
    __tablename__ = "heatwave_predictions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    district_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    prediction_date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    forecast_date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False, index=True)
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    model_version: Mapped[str] = mapped_column(String(50), nullable=False)
    shap_values: Mapped[dict] = mapped_column(JSONB, nullable=True)
    confidence: Mapped[float] = mapped_column(Float, nullable=True)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    model_name: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(50), nullable=False)
    algorithm: Mapped[str] = mapped_column(String(100), nullable=False)
    accuracy: Mapped[float] = mapped_column(Float, nullable=True)
    model_path: Mapped[str] = mapped_column(String(512), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    trained_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
