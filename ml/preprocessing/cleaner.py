# ml/preprocessing/cleaner.py
"""
Data Cleaning Layer for the HEWS preprocessing pipeline.
Handles sentinel values, unit conversions, duplicate removal, missing value imputation, 
and outlier winsorization.
"""

import logging
from typing import Dict, List, Tuple
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

class DataCleaner:
    """
    Cleans datasets by handling missing values, duplicates, outliers, and units.
    """
    def __init__(self):
        pass

    def parse_dates(self, df: pd.DataFrame, date_col: str, date_format: str = None) -> pd.DataFrame:
        """
        Strips whitespace and parses date column into datetime format.
        """
        df_cleaned = df.copy()
        df_cleaned[date_col] = df_cleaned[date_col].astype(str).str.strip()
        if date_format:
            df_cleaned[date_col] = pd.to_datetime(df_cleaned[date_col], format=date_format, errors='coerce')
        else:
            # Smart auto-detection of format to prevent day/month ambiguity
            def _parse_single_date(val):
                if pd.isna(val) or val == 'nan' or not str(val).strip():
                    return pd.NaT
                val_str = str(val).strip()
                try:
                    # Check if 4-digit year is at the beginning (e.g. 2023-01-02)
                    if val_str[:4].isdigit():
                        return pd.to_datetime(val_str, format='%Y-%m-%d')
                    # Check if 4-digit year is at the end (e.g. 02-01-2023)
                    elif val_str[-4:].isdigit():
                        return pd.to_datetime(val_str, format='%d-%m-%Y')
                    else:
                        return pd.to_datetime(val_str, errors='coerce')
                except Exception:
                    return pd.to_datetime(val_str, errors='coerce')
            
            df_cleaned[date_col] = df_cleaned[date_col].apply(_parse_single_date)
        return df_cleaned

    def handle_sentinels(self, df: pd.DataFrame, columns: List[str], sentinel: float = -9999.0) -> Tuple[pd.DataFrame, int]:
        """
        Replaces sentinel values (like -9999 in AOD) with np.nan.
        
        Returns:
            Tuple of (df_cleaned, count_replaced)
        """
        df_cleaned = df.copy()
        replaced_count = 0
        for col in columns:
            if col in df_cleaned.columns:
                mask = (df_cleaned[col] == sentinel)
                cnt = int(mask.sum())
                if cnt > 0:
                    df_cleaned.loc[mask, col] = np.nan
                    replaced_count += cnt
                    logger.info(f"Replaced {cnt} sentinel values ({sentinel}) in column '{col}' with NaN.")
        return df_cleaned, replaced_count

    def convert_units(
        self, 
        df: pd.DataFrame, 
        temp_cols: List[str] = None, 
        precip_cols: List[str] = None, 
        temp_unit: str = "C", 
        precip_unit: str = "mm"
    ) -> Tuple[pd.DataFrame, Dict]:
        """
        Performs imperial-to-metric unit conversions if configured.
        Supports:
        - Fahrenheit ('F') to Celsius ('C')
        - Inches ('in') to Millimeters ('mm')
        
        Returns:
            Tuple of (df_cleaned, conversions_applied)
        """
        df_cleaned = df.copy()
        conversions = {}
        
        # Temperature conversion (F to C)
        if temp_cols and temp_unit.upper() == "F":
            for col in temp_cols:
                if col in df_cleaned.columns:
                    # Let's verify if values are indeed in Fahrenheit.
                    # As an extra safety check, we convert if max value is > 50 (implausible for C in Karnataka)
                    val_series = pd.to_numeric(df_cleaned[col], errors='coerce')
                    if val_series.max() > 50:
                        df_cleaned[col] = (val_series - 32) * 5 / 9
                        conversions[col] = "F_to_C"
                        logger.info(f"Converted temperature column '{col}' from Fahrenheit to Celsius.")
                        
        # Precipitation conversion (inches to mm)
        if precip_cols and precip_unit.lower() == "in":
            for col in precip_cols:
                if col in df_cleaned.columns:
                    val_series = pd.to_numeric(df_cleaned[col], errors='coerce')
                    df_cleaned[col] = val_series * 25.4
                    conversions[col] = "in_to_mm"
                    logger.info(f"Converted precipitation column '{col}' from inches to millimeters.")
                    
        return df_cleaned, conversions

    def remove_duplicates(self, df: pd.DataFrame, subset: List[str]) -> Tuple[pd.DataFrame, int]:
        """
        Identifies and removes duplicate records based on the specified subset of columns.
        
        Returns:
            Tuple of (df_cleaned, count_dropped)
        """
        df_cleaned = df.copy()
        initial_rows = len(df_cleaned)
        df_cleaned = df_cleaned.drop_duplicates(subset=subset, keep='first')
        dropped_count = initial_rows - len(df_cleaned)
        if dropped_count > 0:
            logger.info(f"Dropped {dropped_count} duplicate rows based on subset {subset}.")
        return df_cleaned, dropped_count

    def impute_missing(self, df: pd.DataFrame, columns_strategies: Dict[str, str], limit_days: int = 3) -> Tuple[pd.DataFrame, Dict]:
        """
        Imputes missing values (NaNs) in the DataFrame using specified strategies per column.
        Strategies:
        - 'interpolate': linear time-series interpolation.
        - 'ffill': forward fill.
        - 'constant_zero': fill with 0.0.
        
        Returns:
            Tuple of (df_cleaned, imputation_report)
        """
        df_cleaned = df.copy()
        report = {}
        
        for col, strategy in columns_strategies.items():
            if col not in df_cleaned.columns:
                continue
                
            nulls_before = int(df_cleaned[col].isnull().sum())
            if nulls_before == 0:
                continue
                
            if strategy == 'interpolate':
                # Linear interpolation with a set limit to avoid drawing straight lines across long gaps
                df_cleaned[col] = df_cleaned[col].interpolate(method='linear', limit=limit_days)
                # Fallback to ffill/bfill for any remaining edge NaNs
                df_cleaned[col] = df_cleaned[col].ffill().bfill()
            elif strategy == 'ffill':
                df_cleaned[col] = df_cleaned[col].ffill().bfill()
            elif strategy == 'constant_zero':
                df_cleaned[col] = df_cleaned[col].fillna(0.0)
                
            nulls_after = int(df_cleaned[col].isnull().sum())
            imputed_count = nulls_before - nulls_after
            if imputed_count > 0:
                report[col] = {
                    "strategy": strategy,
                    "imputed_count": imputed_count,
                    "remaining_nulls": nulls_after
                }
                logger.info(f"Imputed {imputed_count} missing values in '{col}' using '{strategy}'. Remaining nulls: {nulls_after}.")
                
        return df_cleaned, report

    def handle_outliers_iqr(self, df: pd.DataFrame, columns: List[str], k: float = 3.0) -> Tuple[pd.DataFrame, Dict]:
        """
        Mitigates outliers using IQR Winsorization.
        Instead of dropping records which breaks time-series continuity, 
        values beyond Q1 - k*IQR and Q3 + k*IQR are capped at these boundaries.
        
        Returns:
            Tuple of (df_cleaned, winsorize_report)
        """
        df_cleaned = df.copy()
        report = {}
        
        for col in columns:
            if col not in df_cleaned.columns:
                continue
                
            series = pd.to_numeric(df_cleaned[col], errors='coerce')
            q1 = series.quantile(0.25)
            q3 = series.quantile(0.75)
            iqr = q3 - q1
            
            lower_bound = q1 - k * iqr
            upper_bound = q3 + k * iqr
            
            # Count elements that will be capped
            low_outliers = (series < lower_bound).sum()
            high_outliers = (series > upper_bound).sum()
            total_outliers = int(low_outliers + high_outliers)
            
            if total_outliers > 0:
                df_cleaned[col] = np.clip(series, lower_bound, upper_bound)
                report[col] = {
                    "total_capped": total_outliers,
                    "capped_low": int(low_outliers),
                    "capped_high": int(high_outliers),
                    "lower_bound": float(lower_bound),
                    "upper_bound": float(upper_bound)
                }
                logger.info(
                    f"Capped {total_outliers} outliers in '{col}' via Winsorization (IQR multiplier={k}). "
                    f"Bounds: [{lower_bound:.2f}, {upper_bound:.2f}]"
                )
                
        return df_cleaned, report
