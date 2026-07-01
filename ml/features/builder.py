# ml/features/builder.py
"""
Feature Builder for the HEWS pipeline.
Derives derived variables, time features, rolling/lag stats, and static district characteristics.
"""

import logging
from typing import List, Dict
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# District static metadata definitions
DISTRICT_STATIC_METADATA = {
    1: {"elevation": 920.0, "is_coastal": 0, "is_hilly": 1},   # Bangalore
    2: {"elevation": 770.0, "is_coastal": 0, "is_hilly": 0},   # Mysore
    3: {"elevation": 750.0, "is_coastal": 0, "is_hilly": 0},   # Belagavi
    4: {"elevation": 400.0, "is_coastal": 0, "is_hilly": 0},   # Kalaburagi
    5: {"elevation": 20.0, "is_coastal": 1, "is_hilly": 0},    # Mangalore
    6: {"elevation": 1090.0, "is_coastal": 0, "is_hilly": 1},  # Chikkamagaluru
    7: {"elevation": 615.0, "is_coastal": 0, "is_hilly": 0},   # Bidar
    8: {"elevation": 600.0, "is_coastal": 0, "is_hilly": 0},   # Davanagere
    9: {"elevation": 20.0, "is_coastal": 1, "is_hilly": 0},    # Udupi
    10: {"elevation": 820.0, "is_coastal": 0, "is_hilly": 0},  # Tumkur
}

class FeatureBuilder:
    """
    Computes custom heat indexes, rolling window time-series statistics, 
    lags, temporal indicators, and static district features.
    """
    def __init__(self):
        pass

    def calculate_heat_index(self, df: pd.DataFrame, temp_col: str = 'temp', humidity_col: str = 'humidity') -> pd.Series:
        """
        Calculates Heat Index (Apparent Temperature) in Celsius using the standard
        NOAA National Weather Service (NWS) Rothfusz regression equation.
        """
        tc = df[temp_col].values
        rh = df[humidity_col].values
        
        # Convert Celsius to Fahrenheit
        tf = tc * 1.8 + 32
        
        # 1. Steadman simple formula (used for cooler values)
        hi_simple = 0.5 * (tf + 61.0 + ((tf - 68.0) * 1.2) + (rh * 0.094))
        
        # 2. Full Rothfusz regression equation
        hi_reg = (-42.379 + 2.04901523 * tf + 10.14333127 * rh - 
                  0.22475541 * tf * rh - 0.00683783 * (tf ** 2) - 
                  0.05481717 * (rh ** 2) + 0.00122874 * (tf ** 2) * rh + 
                  0.00085282 * tf * (rh ** 2) - 0.00000199 * (tf ** 2) * (rh ** 2))
                  
        # Adjustments
        # Adjustment 1: Low humidity (RH < 13% and 80 <= TF <= 112)
        adj_low = ((13 - rh) / 4) * np.sqrt(np.clip(17 - np.abs(tf - 95), 0, None) / 17)
        # Adjustment 2: High humidity (RH > 85% and 80 <= TF <= 87)
        adj_high = ((rh - 85) / 10) * ((87 - tf) / 5)
        
        hi_reg_adjusted = hi_reg.copy()
        low_rh_mask = (rh < 13) & (tf >= 80) & (tf <= 112)
        hi_reg_adjusted[low_rh_mask] -= adj_low[low_rh_mask]
        
        high_rh_mask = (rh > 85) & (tf >= 80) & (tf <= 87)
        hi_reg_adjusted[high_rh_mask] += adj_high[high_rh_mask]
        
        # Select which formula to use
        hi_f = np.zeros_like(tf)
        
        # If TF < 80, we use Steadman simple formula
        cool_mask = tf < 80.0
        hi_f[cool_mask] = hi_simple[cool_mask]
        
        # If TF >= 80, if simple formula >= 80, use regression. Else use simple.
        warm_mask = ~cool_mask
        use_simple_warm = (hi_simple < 80.0) & warm_mask
        use_reg_warm = (hi_simple >= 80.0) & warm_mask
        
        hi_f[use_simple_warm] = hi_simple[use_simple_warm]
        hi_f[use_reg_warm] = hi_reg_adjusted[use_reg_warm]
        
        # Convert back to Celsius
        hi_c = (hi_f - 32) / 1.8
        
        return pd.Series(hi_c, index=df.index, name="heat_index")

    def add_time_features(self, df: pd.DataFrame, date_col: str = 'date') -> pd.DataFrame:
        """
        Adds temporal features: day_of_year, month, and season indicators.
        Seasons: 
          - 1: Winter (Jan - Feb)
          - 2: Summer/Pre-monsoon (Mar - May) -> Key heatwave season in Karnataka
          - 3: Monsoon (Jun - Sep)
          - 4: Post-monsoon (Oct - Dec)
        """
        df_out = df.copy()
        dates = pd.to_datetime(df_out[date_col])
        
        df_out['day_of_year'] = dates.dt.dayofyear
        df_out['month'] = dates.dt.month
        
        def determine_season(m):
            if m in [1, 2]:
                return 1
            elif m in [3, 4, 5]:
                return 2
            elif m in [6, 7, 8, 9]:
                return 3
            else:
                return 4
                
        df_out['season'] = df_out['month'].apply(determine_season)
        return df_out

    def add_rolling_features(
        self, 
        df: pd.DataFrame, 
        weather_cols: List[str], 
        aerosol_cols: List[str] = None, 
        group_col: str = 'district_id'
    ) -> pd.DataFrame:
        """
        Calculates lag and rolling statistics grouped by district to prevent boundary leakage.
        Calculates:
        - 1-day and 2-day lags
        - 3-day and 7-day rolling means
        - 3-day rolling maxes
        - Trends (deviation from 3-day mean)
        """
        # Ensure DataFrame is sorted chronologically per district
        df_out = df.sort_values(by=[group_col, 'date']).reset_index(drop=True)
        
        grouped = df_out.groupby(group_col)
        
        # Apply weather rolling features
        for col in weather_cols:
            if col not in df_out.columns:
                continue
                
            # Lags
            df_out[f"{col}_lag_1d"] = grouped[col].shift(1)
            df_out[f"{col}_lag_2d"] = grouped[col].shift(2)
            
            # Rolling statistics (min_periods=1 ensures we get values for start of series)
            df_out[f"{col}_roll_mean_3d"] = grouped[col].transform(lambda x: x.rolling(window=3, min_periods=1).mean())
            df_out[f"{col}_roll_mean_7d"] = grouped[col].transform(lambda x: x.rolling(window=7, min_periods=1).mean())
            df_out[f"{col}_roll_max_3d"] = grouped[col].transform(lambda x: x.rolling(window=3, min_periods=1).max())
            
            # Trend (change relative to recent mean)
            df_out[f"{col}_trend_3d"] = df_out[col] - df_out[f"{col}_roll_mean_3d"]
            
        # Apply aerosol rolling features if available
        if aerosol_cols:
            for col in aerosol_cols:
                if col not in df_out.columns:
                    continue
                df_out[f"{col}_lag_1d"] = grouped[col].shift(1)
                df_out[f"{col}_lag_2d"] = grouped[col].shift(2)
                df_out[f"{col}_roll_mean_3d"] = grouped[col].transform(lambda x: x.rolling(window=3, min_periods=1).mean())
                df_out[f"{col}_roll_mean_7d"] = grouped[col].transform(lambda x: x.rolling(window=7, min_periods=1).mean())
                
        return df_out

    def add_static_features(self, df: pd.DataFrame, district_col: str = 'district_id') -> pd.DataFrame:
        """
        Adds static district geographical metadata (elevation, coastal status, hilly status).
        """
        df_out = df.copy()
        
        elevations = []
        coastal_flags = []
        hilly_flags = []
        
        for dist_id in df_out[district_col]:
            meta = DISTRICT_STATIC_METADATA.get(int(dist_id), {"elevation": 500.0, "is_coastal": 0, "is_hilly": 0})
            elevations.append(meta["elevation"])
            coastal_flags.append(meta["is_coastal"])
            hilly_flags.append(meta["is_hilly"])
            
        df_out["elevation"] = elevations
        df_out["is_coastal"] = coastal_flags
        df_out["is_hilly"] = hilly_flags
        
        return df_out
