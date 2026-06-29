# app/models/forecast.py
"""SQLAlchemy model to store 3‑day forecast predictions.
Each row represents a single forecasted date and its predicted heatwave value.
"""

from datetime import date, datetime
from sqlalchemy import BigInteger, Date, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base

class Forecast(Base):
    __tablename__ = "forecast"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    forecast_date: Mapped[date] = mapped_column(Date, nullable=False, unique=True, index=True)
    predicted_value: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    def __repr__(self) -> str:
        return f"<Forecast date={self.forecast_date} value={self.predicted_value}>"
