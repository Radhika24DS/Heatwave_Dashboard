from sqlalchemy import BigInteger, ForeignKey, Date, Float, String, DateTime, func, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base

class IMDWeatherData(Base):
    __tablename__ = "imd_weather_data"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    district_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    max_temp: Mapped[float] = mapped_column(Float, nullable=False)
    min_temp: Mapped[float] = mapped_column(Float, nullable=False)
    humidity: Mapped[float] = mapped_column(Float, nullable=True)
    wind_speed: Mapped[float] = mapped_column(Float, nullable=True)
    rainfall: Mapped[float] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("district_id", "date", name="uq_imd_weather_district_date"),
    )

class AerosolData(Base):
    __tablename__ = "aerosol_data"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    district_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("districts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    date: Mapped[Date] = mapped_column(Date, nullable=False, index=True)
    aod_value: Mapped[float] = mapped_column(Float, nullable=True)  # Aerosol Optical Depth
    pm25: Mapped[float] = mapped_column(Float, nullable=True)
    pm10: Mapped[float] = mapped_column(Float, nullable=True)
    source: Mapped[str] = mapped_column(String(100), nullable=True)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("district_id", "date", name="uq_aerosol_district_date"),
    )
