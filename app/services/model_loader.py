import json
import joblib
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.db.session import SessionLocal
from sqlalchemy import select
from app.models.prediction import ModelRegistry

_model = None
_feature_importance = None

async def _load_active_model() -> Any:
    """Load the model marked as active in the `model_registry` table.
    Returns the deserialized model object (e.g., a scikit‑learn pipeline).
    """
    # Asynchronous DB access using async session context manager
    async with SessionLocal() as session:
        stmt = select(ModelRegistry).where(ModelRegistry.is_active == True)
        result = (await session.execute(stmt)).scalar_one_or_none()
        if result is None:
            raise RuntimeError("No active model found in model_registry. Prediction endpoints will return 503.")
        model_path = Path(result.model_path)
        if not model_path.is_file():
            raise FileNotFoundError(f"Model file not found: {model_path}")
        return joblib.load(model_path)

def _load_feature_importance() -> dict:
    """Load the feature importance JSON generated during training."""
    fi_path = Path(settings.BASE_DIR) / "ml" / "artifacts" / "reports" / "feature_importance.json"
    if not fi_path.is_file():
        return {}
    with fi_path.open() as f:
        return json.load(f)

async def get_active_model():
    """Public accessor that lazily loads the model on first call."""
    global _model
    if _model is None:
        _model = await _load_active_model()
    return _model

def get_feature_importance() -> dict:
    """Public accessor for the cached feature importance dictionary."""
    global _feature_importance
    if _feature_importance is None:
        _feature_importance = _load_feature_importance()
    return _feature_importance

async def reload_active_model():
    """Force re‑load of the active model – used after a retrain job finishes."""
    global _model
    _model = await _load_active_model()
    return _model
