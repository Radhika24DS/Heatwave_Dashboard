# ml/preprocessing/validator.py
"""
Data Validation Layer for the HEWS preprocessing pipeline.
Checks schemas, data types, and validates that values fall within acceptable physical limits.
"""

import logging
from typing import Dict, Tuple, List
import pandas as pd
import numpy as np
from ml.config import VALIDATION_BOUNDS

logger = logging.getLogger(__name__)

class DataValidator:
    """
    Validates input schemas, data types, and range bounds of weather and aerosol datasets.
    """
    def __init__(self, bounds: Dict[str, Tuple[float, float]] = None):
        self.bounds = bounds or VALIDATION_BOUNDS

    def validate_schema(self, df: pd.DataFrame, expected_columns: Dict[str, str]) -> Tuple[bool, List[str]]:
        """
        Validates that all expected columns are present in the DataFrame.
        expected_columns: dict mapping column name to expected broad type ('numeric', 'datetime', 'string')
        
        Returns:
            Tuple of (is_valid, error_messages)
        """
        errors = []
        is_valid = True
        
        for col, col_type in expected_columns.items():
            if col not in df.columns:
                errors.append(f"Missing expected column: '{col}'")
                is_valid = False
                continue
                
            # Basic type check warnings/conversions
            if col_type == 'numeric':
                try:
                    # Test if it can be represented numerically
                    pd.to_numeric(df[col], errors='raise')
                except Exception:
                    errors.append(f"Column '{col}' contains non-numeric values and cannot be converted.")
                    is_valid = False
            elif col_type == 'datetime':
                # Just a warning or check if it can be parsed as date
                pass
                
        return is_valid, errors

    def validate_ranges(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict]:
        """
        Checks if numerical values fall within physical bounds.
        Replaces violating out-of-bound values with np.nan so that they can be imputed later.
        
        Returns:
            Tuple of (cleaned_df, report_dict)
        """
        df_validated = df.copy()
        report = {
            "total_violations": 0,
            "violations_by_column": {}
        }
        
        for col, limit in self.bounds.items():
            if col not in df_validated.columns:
                continue
                
            min_val, max_val = limit
            # Coerce column to numeric first to ensure range checking works
            col_series = pd.to_numeric(df_validated[col], errors='coerce')
            
            # Find elements out of bounds (excluding NaNs)
            out_of_bounds_mask = (col_series < min_val) | (col_series > max_val)
            
            # Specifically exclude sentinel -9999 from the validation report if present, 
            # because sentinels will be explicitly handled in cleaning. But if we detect it,
            # we count it as a sentinel violation. Let's filter -9999 from range check 
            # so we only report actual physical anomalies.
            sentinel_mask = (col_series == -9999)
            range_violation_mask = out_of_bounds_mask & ~sentinel_mask
            
            violations_count = int(range_violation_mask.sum())
            
            if violations_count > 0:
                violating_values = col_series[range_violation_mask]
                report["total_violations"] += violations_count
                report["violations_by_column"][col] = {
                    "count": violations_count,
                    "min_observed": float(violating_values.min()),
                    "max_observed": float(violating_values.max()),
                    "bounds": limit
                }
                logger.warning(
                    f"Column '{col}' has {violations_count} values outside bounds {limit}. "
                    f"Observed min: {violating_values.min()}, max: {violating_values.max()}. "
                    "Replacing violating values with NaN."
                )
                
                # Replace out of bounds with NaN (sentinels are also replaced with NaN, but reported separately in cleaning)
                df_validated.loc[range_violation_mask, col] = np.nan
                
        return df_validated, report
