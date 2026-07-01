# ml/tests/test_feature_engineering.py
"""
Unit tests for the HEWS Feature Engineering and Label Creation pipeline.
"""

import unittest
import pandas as pd
import numpy as np
from datetime import datetime

from ml.features.builder import FeatureBuilder
from ml.features.labeler import HeatwaveLabeler
from ml.features.pipeline import FeaturePipeline

class TestFeatureBuilder(unittest.TestCase):
    def setUp(self):
        self.builder = FeatureBuilder()

    def test_calculate_heat_index_cool(self):
        # 20C and 50% humidity should trigger simple Steadman formula
        df = pd.DataFrame({"temp": [20.0], "humidity": [50.0]})
        hi = self.builder.calculate_heat_index(df, temp_col="temp", humidity_col="humidity")
        # Steadman C conversion should be close to actual temp since humidity is moderate
        self.assertAlmostEqual(hi.iloc[0], 19.5, delta=1.5)

    def test_calculate_heat_index_hot_humid(self):
        # 35C and 70% humidity should trigger the full regression and be much higher
        df = pd.DataFrame({"temp": [35.0], "humidity": [70.0]})
        hi = self.builder.calculate_heat_index(df, temp_col="temp", humidity_col="humidity")
        # In Fahrenheit: 35C = 95F, 70% RH -> HI should be around 120-130F (48-54C)
        self.assertTrue(hi.iloc[0] > 45.0)

    def test_add_time_features(self):
        df = pd.DataFrame({"date": [pd.Timestamp("2023-01-15"), pd.Timestamp("2023-04-15"), pd.Timestamp("2023-07-15")]})
        df_time = self.builder.add_time_features(df, date_col="date")
        
        # Months: Jan = 1, Apr = 4, Jul = 7
        self.assertEqual(list(df_time["month"]), [1, 4, 7])
        
        # Seasons: Jan = 1 (Winter), Apr = 2 (Pre-monsoon), Jul = 3 (Monsoon)
        self.assertEqual(list(df_time["season"]), [1, 2, 3])

    def test_add_rolling_features_leakage_prevention(self):
        # We test that rolling features are grouped correctly and don't leak between districts.
        # We create a dataframe with 2 districts, each having 4 consecutive dates.
        df = pd.DataFrame({
            "district_id": [1, 1, 1, 1, 2, 2, 2, 2],
            "date": pd.to_datetime([
                "2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04",
                "2023-01-01", "2023-01-02", "2023-01-03", "2023-01-04"
            ]),
            # District 1: 10, 20, 30, 40
            # District 2: 100, 200, 300, 400
            "temp": [10.0, 20.0, 30.0, 40.0, 100.0, 200.0, 300.0, 400.0]
        })
        
        df_roll = self.builder.add_rolling_features(df, weather_cols=["temp"], group_col="district_id")
        
        # Lags check for District 1
        self.assertTrue(np.isnan(df_roll.loc[0, "temp_lag_1d"])) # first row of dist 1
        self.assertEqual(df_roll.loc[1, "temp_lag_1d"], 10.0)
        self.assertEqual(df_roll.loc[2, "temp_lag_2d"], 10.0)
        
        # Lags check for District 2 (should NOT leak values 40.0 from District 1 row 3)
        self.assertTrue(np.isnan(df_roll.loc[4, "temp_lag_1d"])) # first row of dist 2
        self.assertEqual(df_roll.loc[5, "temp_lag_1d"], 100.0)
        self.assertEqual(df_roll.loc[6, "temp_lag_2d"], 100.0)
        
        # Rolling mean check
        # District 1 row 2: mean of [10, 20, 30] = 20.0
        self.assertEqual(df_roll.loc[2, "temp_roll_mean_3d"], 20.0)
        # District 2 row 2: mean of [100, 200, 300] = 200.0
        self.assertEqual(df_roll.loc[6, "temp_roll_mean_3d"], 200.0)


class TestLabeler(unittest.TestCase):
    def test_imd_labeling_logic(self):
        labeler = HeatwaveLabeler()
        
        # Let's mock a daily normal profile where normal is 30C
        # We replace the computed normals with a mock series
        labeler.normals = pd.Series([30.0] * 367, index=range(1, 368))
        
        df = pd.DataFrame({
            "district_id": [1, 1, 1, 4], # District 1 (Hilly), District 4 (Plains)
            "date": pd.to_datetime(["2023-05-01", "2023-05-02", "2023-05-03", "2023-05-01"]),
            # tempmax for rows:
            # 0: 32C (Normal: 30C, dep 2C) -> Normal (0)
            # 1: 35C (Normal: 30C, dep 5C) -> Heatwave (1) because temp >= 30 and dep >= 4.5
            # 2: 37C (Normal: 30C, dep 7C) -> Severe Heatwave (2) because temp >= 30 and dep >= 6.5
            # 3: 35C (Normal: 30C, dep 5C) -> Depends on Option A vs B!
            "tempmax": [32.0, 35.0, 37.0, 35.0]
        })
        
        # Option A: Hilly threshold applied to all districts
        df_a = labeler.label_dataset(df, labeling_option='A')
        self.assertEqual(list(df_a["severity_tier"]), [0, 1, 2, 1])
        self.assertEqual(list(df_a["heatwave_label"]), [0, 1, 1, 1])
        
        # Option B: Strict regional thresholds
        # District 4 is Plains (type 'plains'), which requires absolute temp >= 40C
        # Since tempmax=35C is < 40C, row 3 should be Normal (0) in Option B
        df_b = labeler.label_dataset(df, labeling_option='B')
        self.assertEqual(list(df_b["severity_tier"]), [0, 1, 2, 0])
        self.assertEqual(list(df_b["heatwave_label"]), [0, 1, 1, 0])

if __name__ == '__main__':
    unittest.main()
