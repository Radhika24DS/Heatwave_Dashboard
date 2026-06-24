# app/services/feature_builder.py
"""Service to construct model features from incoming request payloads.
The logic mirrors the feature engineering used during training (see
`ml/data/feature_engineering.py`). For simplicity we perform a minimal
transformation: we expect the payload to already contain the numeric
features required by the model and we convert it into a pandas DataFrame.
If additional preprocessing steps are needed they can be added here.
"""

from __future__ import annotations

from typing import Dict, Any
import pandas as pd

def build_features(payload: Dict[str, Any]) -> pd.DataFrame:
    """Convert raw request payload into a DataFrame suitable for the model.

    Parameters
    ----------
    payload: dict
        Mapping of feature name → value. All values must be JSON‑serialisable
        and ultimately convertible to a numeric type.

    Returns
    -------
    pd.DataFrame
        A single‑row DataFrame with column order matching the training
        feature set.
    """
    # Basic validation – ensure we have a dict and at least one key
    if not isinstance(payload, dict) or not payload:
        raise ValueError("Payload must be a non‑empty dictionary of features.")

    # Convert to DataFrame; pandas will infer numeric dtypes where possible
    df = pd.DataFrame([payload])

    # Ensure column names are strings (pandas will coerce otherwise)
    df.columns = [str(col) for col in df.columns]

    # Placeholder for any additional preprocessing (e.g., scaling, encoding)
    # For now, we assume the model was trained on raw numeric values.
    return df
