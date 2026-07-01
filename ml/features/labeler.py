# ml/features/labeler.py
"""
IMD-aligned Heatwave Labeler.
Computes daily climatological temperature normals and applies multi-tier IMD heatwave criteria.
"""

import logging
from pathlib import Path
from typing import Dict, Tuple
import pandas as pd
import numpy as np

from ml.config import METEOROLOGICAL_CSV

logger = logging.getLogger(__name__)

# District-to-region types mapping
DISTRICT_REGIONS = {
    1: "hilly",        # Bangalore
    2: "plains",       # Mysore
    3: "plains",       # Belagavi
    4: "plains",       # Kalaburagi
    5: "coastal",      # Mangalore
    6: "hilly",        # Chikkamagaluru
    7: "plains",       # Bidar
    8: "plains",       # Davanagere
    9: "coastal",      # Udupi
    10: "plains",      # Tumkur
}

class HeatwaveLabeler:
    """
    Computes climatological normals and generates heatwave labels and severity tiers
    based on official IMD criteria.
    """
    def __init__(self, raw_weather_path: str = None):
        self.raw_weather_path = raw_weather_path or str(METEOROLOGICAL_CSV)
        self.normals = self._compute_climatological_normals()

    def _compute_climatological_normals(self) -> pd.Series:
        """
        Computes day-of-year climatological normal maximum temperatures 
        using the full 5-year weather dataset, smoothed with a 15-day centered rolling mean.
        """
        logger.info(f"Computing climatological normals from {self.raw_weather_path}...")
        if not Path(self.raw_weather_path).exists():
            raise FileNotFoundError(f"Raw meteorological weather file not found at {self.raw_weather_path}")
            
        df_weather = pd.read_csv(self.raw_weather_path)
        df_weather['parsed_date'] = pd.to_datetime(df_weather['datetime'].str.strip(), format='%Y-%m-%d')
        df_weather['day_of_year'] = df_weather['parsed_date'].dt.dayofyear
        
        # Calculate mean for each day of year across all years (2021-2025)
        daily_means = df_weather.groupby('day_of_year')['tempmax'].mean()
        
        # Ensure 366 days are covered (leap year handling)
        if len(daily_means) < 366:
            # Reindex to full 1-366 range, filling with interpolation if missing
            daily_means = daily_means.reindex(range(1, 367)).interpolate()
            
        # Apply circular padding (wrap-around at year end) for centered rolling window smoothing
        padded = pd.concat([daily_means.iloc[-7:], daily_means, daily_means.iloc[:7]])
        smoothed_padded = padded.rolling(window=15, center=True).mean()
        
        # Slice out original 366 days
        smoothed_normals = smoothed_padded.iloc[7:-7]
        
        logger.info("Successfully computed smoothed climatological normals.")
        return smoothed_normals

    def label_dataset(self, df: pd.DataFrame, labeling_option: str = 'A') -> pd.DataFrame:
        """
        Applies IMD rules to a preprocessed DataFrame.
        Adds columns:
        - 'normal_tempmax': The baseline climatological mean for that day of the year.
        - 'departure': The actual max temperature deviation from normal.
        - 'severity_tier': 0 (Normal), 1 (Heatwave), 2 (Severe Heatwave).
        - 'heatwave_label': Binary label (1 if severity_tier >= 1, else 0).
        
        labeling_option: 
          - 'A': Applies Hilly criteria (absolute threshold >= 30C) to all records.
                 This is recommended since all districts replicate Bangalore's weather.
          - 'B': Applies strict regional criteria (Plains: >=40C, Coastal: >=37C, Hilly: >=30C).
        """
        df_labeled = df.copy()
        
        # Ensure date is parsed
        dates = pd.to_datetime(df_labeled['date'])
        df_labeled['day_of_year'] = dates.dt.dayofyear
        
        # Map day-of-year normals
        df_labeled['normal_tempmax'] = df_labeled['day_of_year'].map(self.normals)
        df_labeled['departure'] = df_labeled['tempmax'] - df_labeled['normal_tempmax']
        
        # Initialize severity and label columns
        df_labeled['severity_tier'] = 0
        df_labeled['heatwave_label'] = 0
        
        # Helper to compute severity tier for a single row
        def get_row_severity(row):
            dist_id = int(row['district_id'])
            region_type = DISTRICT_REGIONS.get(dist_id, "plains")
            temp = row['tempmax']
            dep = row['departure']
            
            # 1. Determine thresholds based on option
            if labeling_option == 'A':
                # Force Hilly region criteria to get positive samples
                abs_threshold = 30.0
                hw_abs_threshold = 37.0
                shw_abs_threshold = 40.0
            else:
                # Strict regional classification
                if region_type == "hilly":
                    abs_threshold = 30.0
                    hw_abs_threshold = 37.0
                    shw_abs_threshold = 40.0
                elif region_type == "coastal":
                    abs_threshold = 37.0
                    hw_abs_threshold = 39.0
                    shw_abs_threshold = 41.0
                else:  # plains
                    abs_threshold = 40.0
                    hw_abs_threshold = 45.0
                    shw_abs_threshold = 47.0
            
            # 2. Evaluate IMD heatwave criteria
            # Check Severe Heatwave first (absolute threshold OR departure)
            if temp >= shw_abs_threshold or (temp >= abs_threshold and dep >= 6.5):
                return 2
            # Check regular Heatwave next (absolute threshold OR departure)
            elif temp >= hw_abs_threshold or (temp >= abs_threshold and dep >= 4.5):
                return 1
                    
            return 0

        # Apply labeling row-wise
        df_labeled['severity_tier'] = df_labeled.apply(get_row_severity, axis=1)
        df_labeled['heatwave_label'] = (df_labeled['severity_tier'] >= 1).astype(int)
        
        # Clean up temporary column
        df_labeled = df_labeled.drop(columns=['day_of_year'])
        
        return df_labeled
