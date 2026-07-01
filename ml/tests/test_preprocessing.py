# ml/tests/test_preprocessing.py
"""
Unit tests for the Data Validation, Cleaning, and Preprocessing pipeline.
"""

import unittest
import pandas as pd
import numpy as np
from datetime import datetime

from ml.preprocessing.validator import DataValidator
from ml.preprocessing.cleaner import DataCleaner
from ml.preprocessing.pipeline import DataPreprocessor

class TestValidator(unittest.TestCase):
    def setUp(self):
        self.bounds = {
            "temp": (0.0, 50.0),
            "humidity": (0.0, 100.0)
        }
        self.validator = DataValidator(bounds=self.bounds)

    def test_validate_schema_valid(self):
        df = pd.DataFrame({"temp": [25.0, 30.0], "humidity": [50.0, 60.0]})
        expected = {"temp": "numeric", "humidity": "numeric"}
        is_valid, errors = self.validator.validate_schema(df, expected)
        self.assertTrue(is_valid)
        self.assertEqual(len(errors), 0)

    def test_validate_schema_missing_column(self):
        df = pd.DataFrame({"temp": [25.0, 30.0]})
        expected = {"temp": "numeric", "humidity": "numeric"}
        is_valid, errors = self.validator.validate_schema(df, expected)
        self.assertFalse(is_valid)
        self.assertIn("Missing expected column: 'humidity'", errors[0])

    def test_validate_ranges_valid(self):
        df = pd.DataFrame({"temp": [25.0, 30.0], "humidity": [50.0, 60.0]})
        df_val, report = self.validator.validate_ranges(df)
        self.assertEqual(report["total_violations"], 0)
        self.assertTrue(df_val.notnull().all().all())

    def test_validate_ranges_invalid_replaced_nan(self):
        df = pd.DataFrame({"temp": [25.0, 75.0, -5.0], "humidity": [50.0, 150.0, 60.0]})
        df_val, report = self.validator.validate_ranges(df)
        self.assertEqual(report["total_violations"], 3)
        self.assertEqual(report["violations_by_column"]["temp"]["count"], 2)
        self.assertEqual(report["violations_by_column"]["humidity"]["count"], 1)
        # Check that violators are replaced with NaN
        self.assertTrue(np.isnan(df_val.loc[1, "temp"]))
        self.assertTrue(np.isnan(df_val.loc[2, "temp"]))
        self.assertTrue(np.isnan(df_val.loc[1, "humidity"]))
        # Valid ones should remain
        self.assertEqual(df_val.loc[0, "temp"], 25.0)


class TestCleaner(unittest.TestCase):
    def setUp(self):
        self.cleaner = DataCleaner()

    def test_parse_dates(self):
        df = pd.DataFrame({"time": [" 01-01-2023 ", " 15-02-2023 "]})
        df_parsed = self.cleaner.parse_dates(df, "time", date_format="%d-%m-%Y")
        self.assertEqual(df_parsed.loc[0, "time"], pd.Timestamp("2023-01-01"))
        self.assertEqual(df_parsed.loc[1, "time"], pd.Timestamp("2023-02-15"))

    def test_handle_sentinels(self):
        df = pd.DataFrame({"AOD": [0.45, -9999.0, 0.55]})
        df_clean, count = self.cleaner.handle_sentinels(df, ["AOD"], sentinel=-9999.0)
        self.assertEqual(count, 1)
        self.assertTrue(np.isnan(df_clean.loc[1, "AOD"]))
        self.assertEqual(df_clean.loc[0, "AOD"], 0.45)

    def test_convert_units_fahrenheit_to_celsius(self):
        # 77 Fahrenheit = 25 Celsius, 32 Fahrenheit = 0 Celsius
        df = pd.DataFrame({"tempmax": [77.0, 32.0]})
        # Must pass tempmax as a temp_col, and specify temp_unit='F'
        df_clean, convs = self.cleaner.convert_units(df, temp_cols=["tempmax"], temp_unit="F")
        self.assertIn("tempmax", convs)
        self.assertAlmostEqual(df_clean.loc[0, "tempmax"], 25.0)
        self.assertAlmostEqual(df_clean.loc[1, "tempmax"], 0.0)

    def test_convert_units_inches_to_mm(self):
        df = pd.DataFrame({"precip": [1.0, 2.0]})
        df_clean, convs = self.cleaner.convert_units(df, precip_cols=["precip"], precip_unit="in")
        self.assertIn("precip", convs)
        self.assertAlmostEqual(df_clean.loc[0, "precip"], 25.4)
        self.assertAlmostEqual(df_clean.loc[1, "precip"], 50.8)

    def test_remove_duplicates(self):
        df = pd.DataFrame({
            "date": [pd.Timestamp("2023-01-01"), pd.Timestamp("2023-01-01"), pd.Timestamp("2023-01-02")],
            "val": [1, 2, 3]
        })
        df_clean, count = self.cleaner.remove_duplicates(df, subset=["date"])
        self.assertEqual(count, 1)
        self.assertEqual(len(df_clean), 2)
        self.assertEqual(df_clean.loc[0, "val"], 1)

    def test_impute_missing_interpolate(self):
        # Index-based linear interpolation
        df = pd.DataFrame({"temp": [10.0, np.nan, 30.0]})
        df_clean, report = self.cleaner.impute_missing(df, {"temp": "interpolate"})
        self.assertEqual(report["temp"]["imputed_count"], 1)
        self.assertAlmostEqual(df_clean.loc[1, "temp"], 20.0)

    def test_impute_missing_precip_zero(self):
        df = pd.DataFrame({"precip": [1.5, np.nan, np.nan]})
        df_clean, report = self.cleaner.impute_missing(df, {"precip": "constant_zero"})
        self.assertEqual(report["precip"]["imputed_count"], 2)
        self.assertEqual(df_clean.loc[1, "precip"], 0.0)
        self.assertEqual(df_clean.loc[2, "precip"], 0.0)

    def test_handle_outliers_iqr_winsorize(self):
        # We construct a series with a clear outlier
        data = [10.0, 11.0, 12.0, 10.5, 11.5, 12.5, 100.0]  # 100 is way above Q3 + 3*IQR
        df = pd.DataFrame({"val": data})
        # Q1 = 10.75, Q3 = 12.25, IQR = 1.5
        # Upper Limit = 12.25 + 3.0 * 1.5 = 16.75
        df_clean, report = self.cleaner.handle_outliers_iqr(df, ["val"], k=3.0)
        self.assertEqual(report["val"]["total_capped"], 1)
        self.assertAlmostEqual(df_clean.loc[6, "val"], 16.75)


class TestPreprocessor(unittest.TestCase):
    def test_preprocess_realtime_data(self):
        preprocessor = DataPreprocessor()
        
        # Construct weather mock
        weather_data = {
            "datetime": ["2023-01-01", "2023-01-02", "2023-01-03"],
            "tempmax": [30.0, np.nan, 32.0],
            "tempmin": [20.0, 21.0, 22.0],
            "temp": [25.0, 25.5, 26.0],
            "humidity": [60.0, 62.0, 65.0],
            "precip": [0.0, 5.0, np.nan],
            "windspeed": [10.0, 12.0, 11.0],
            "sealevelpressure": [1013.0, 1012.0, 1014.0],
            "solarradiation": [200.0, 210.0, 205.0],
            "pm2p5": [15.0, 16.0, 15.5],
            "pm10": [30.0, 32.0, 31.0]
        }
        df_w = pd.DataFrame(weather_data)
        
        # Construct AOD mock
        aod_data = {
            "time": ["01-01-2023", "02-01-2023", "03-01-2023"],
            "AOD": [0.35, -9999.0, 0.40]
        }
        df_a = pd.DataFrame(aod_data)
        
        df_processed = preprocessor.preprocess_realtime_data(district_id=1, weather_df=df_w, aod_df=df_a)
        
        # Asserts
        self.assertEqual(len(df_processed), 3)
        self.assertEqual(df_processed.loc[0, "district_id"], 1)
        # Check temperature imputation
        self.assertFalse(df_processed["tempmax"].isnull().any())
        self.assertAlmostEqual(df_processed.loc[1, "tempmax"], 31.0) # linear interpolation between 30 and 32
        # Check precip imputation (precip at index 2 is filled with 0.0)
        self.assertEqual(df_processed.loc[2, "precip"], 0.0)
        # Check AOD sentinel and imputation
        self.assertFalse(df_processed["AOD"].isnull().any())
        self.assertAlmostEqual(df_processed.loc[1, "AOD"], 0.375) # linear interpolation between 0.35 and 0.40

if __name__ == '__main__':
    unittest.main()
