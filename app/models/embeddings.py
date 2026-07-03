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
    # Google Gemini gemini-embedding-2 produces 3072 dimensions
    embedding: Mapped[Vector] = mapped_column(Vector(3072), nullable=False)
