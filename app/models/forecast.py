# app/models/forecast.py
"""SQLAlchemy model to store 3‑day forecast predictions.
Each row represents a single forecasted date and its predicted heatwave value.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, Date, Float, DateTime
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Forecast(Base):
    __tablename__ = "forecast"

    id = Column(Integer, primary_key=True, index=True)
    forecast_date = Column(Date, nullable=False, unique=True)
    predicted_value = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    def __repr__(self) -> str:
        return f"<Forecast date={self.forecast_date} value={self.predicted_value}>"
