from sqlalchemy import BigInteger, String, Text, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base
from app.models.enums import AdvisoryRole, RiskLevel

class Advisory(Base):
    __tablename__ = "advisories"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    role: Mapped[AdvisoryRole] = mapped_column(Enum(AdvisoryRole), nullable=False)
    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    document_source: Mapped[str] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
