from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, Text, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    prediction_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("heatwave_predictions.id", ondelete="CASCADE"), nullable=True, index=True
    )
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1 to 5 star rating
    comment: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
