from datetime import datetime
from sqlalchemy import BigInteger, ForeignKey, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base_class import Base

class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    uploaded_by_user_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(512), nullable=False)  # Supabase Storage path
    category: Mapped[str] = mapped_column(String(100), nullable=False)      # e.g., PUBLIC, FARMER, TRAVELLER
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
