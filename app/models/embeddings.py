from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from app.db.base_class import Base

class Embedding(Base):
    __tablename__ = "embeddings"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    chunk_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("document_chunks.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    # sentence-transformers/all-MiniLM-L6-v2 produces 384 dimensions
    embedding: Mapped[Vector] = mapped_column(Vector(384), nullable=False)
