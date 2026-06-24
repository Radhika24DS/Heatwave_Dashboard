# app/models/model_registry.py
"""SQLAlchemy model to track saved ML models.
Each row stores the path to a joblib file and optionally a JSON file
containing feature‑importance information. Only one model should be
marked as active at a time.
"""

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class ModelRegistry(Base):
    __tablename__ = "model_registry"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String, nullable=False)
    model_path = Column(String, nullable=False)  # absolute or relative path to .joblib file
    feature_importance_path = Column(String, nullable=True)  # optional JSON file
    is_active = Column(Boolean, default=False, nullable=False)
    created_at = Column(String, nullable=False)  # ISO timestamp string
    description = Column(String, nullable=True)

    def __repr__(self) -> str:
        return f"<ModelRegistry id={self.id} name={self.model_name} active={self.is_active}>"
