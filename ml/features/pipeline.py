# ml/features/pipeline.py
"""
Feature Engineering Pipeline Orchestrator.
Applies labeling, builds features, splits chronologically, and saves datasets.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Tuple
import pandas as pd
import numpy as np

from ml.config import (
    PROCESSED_CSV,
    MODEL_A_TRAIN_CSV,
    MODEL_A_TEST_CSV,
    MODEL_B_TRAIN_CSV,
    MODEL_B_TEST_CSV,
    FEATURES_REPORT_MD,
    FEATURES_DIR
)
from ml.features.labeler import HeatwaveLabeler
from ml.features.builder import FeatureBuilder

logger = logging.getLogger(__name__)

class FeaturePipeline:
    """
    Coordinates the feature engineering process.
    Produces Model A (meteorological-only) and Model B (meteorological + aerosol) datasets.
    """
    def __init__(self, labeling_option: str = 'A'):
        self.labeler = HeatwaveLabeler()
        self.builder = FeatureBuilder()
        self.labeling_option = labeling_option

    def build_features(self) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame, Dict]:
        """
        Runs the feature engineering pipeline:
        1. Loads preprocessed district-level weather + aerosol dataset.
        2. Applies IMD labeling.
        3. Computes NOAA Heat Index.
        4. Adds temporal (season, month) indicators.
        5. Computes district-grouped lags, rolling averages, rolling max, and trends.
        6. Adds static district physical features (elevation, coastal, hilly).
        7. Splits chronologically into train (2023-2024) and test (2025).
        8. Separates into Model A and Model B feature sets.
        9. Removes lag-induced NaNs.
        10. Saves feature matrices and report.
        """
        logger.info("Starting feature engineering pipeline...")
        
        # 1. Load Preprocessed Data
        if not Path(PROCESSED_CSV).exists():
            raise FileNotFoundError(f"Cleaned dataset not found at {PROCESSED_CSV}. Run Phase 3 pipeline first.")
            
        df_clean = pd.read_csv(PROCESSED_CSV)
        df_clean['date'] = pd.to_datetime(df_clean['date'])
        
        # Sort chronologically per district
        df_clean = df_clean.sort_values(by=['district_id', 'date']).reset_index(drop=True)
        
        # 2. Apply IMD-aligned Labels
        df_labeled = self.labeler.label_dataset(df_clean, labeling_option=self.labeling_option)
        
        # 3. Calculate Heat Index
        df_labeled['heat_index'] = self.builder.calculate_heat_index(df_labeled, temp_col='temp', humidity_col='humidity')
        
        # 4. Add Time Features
        df_features = self.builder.add_time_features(df_labeled, date_col='date')
        
        # 5. Add Rolling & Lag Features
        weather_cols = [
            "tempmax", "tempmin", "temp", "humidity", "precip", 
            "windspeed", "sealevelpressure", "solarradiation", "heat_index"
        ]
        aerosol_cols = ["pm2p5", "pm10", "AOD"]
        
        df_features = self.builder.add_rolling_features(
            df_features, 
            weather_cols=weather_cols, 
            aerosol_cols=aerosol_cols,
            group_col='district_id'
        )
        
        # 6. Add District Static Features
        df_features = self.builder.add_static_features(df_features, district_col='district_id')
        
        # 7. Chronological Train/Test Split (leakage-free)
        # Train: 2023-01-01 to 2024-12-31
        # Test: 2025-01-01 to 2025-06-30
        split_date = pd.Timestamp("2025-01-01")
        df_train_raw = df_features[df_features['date'] < split_date].copy()
        df_test_raw = df_features[df_features['date'] >= split_date].copy()
        
        # 8. Separate Model A and Model B
        # Metadata and labels shared by both
        metadata_cols = ["district_id", "district_name", "latitude", "longitude", "date"]
        label_cols = ["normal_tempmax", "departure", "severity_tier", "heatwave_label"]
        
        # Extract all engineered columns
        all_cols = df_features.columns.tolist()
        
        # Identify aerosol columns and their derived roll/lag features
        aerosol_related = [c for c in all_cols if any(a in c for a in ["pm2p5", "pm10", "AOD"])]
        
        # Model A = All engineered columns EXCEPT aerosol columns
        model_a_cols = [c for c in all_cols if c not in aerosol_related]
        # Model B = All engineered columns (keeps both weather and aerosol)
        model_b_cols = all_cols
        
        df_a_train = df_train_raw[model_a_cols].copy()
        df_a_test = df_test_raw[model_a_cols].copy()
        
        df_b_train = df_train_raw[model_b_cols].copy()
        df_b_test = df_test_raw[model_b_cols].copy()
        
        # 9. Clean up lag-induced NaNs (occurs on the first 2 days of each district's time-series)
        # Drop rows with NaNs in lag columns (e.g. tempmax_lag_2d) to make it model-ready
        # This will drop exactly 2 rows per district from the training set, and 0 from test set (as test has 2024 history populated)
        lag_cols_to_check = ["tempmax_lag_2d"]
        
        a_train_size_before = len(df_a_train)
        df_a_train = df_a_train.dropna(subset=lag_cols_to_check).reset_index(drop=True)
        df_b_train = df_b_train.dropna(subset=lag_cols_to_check).reset_index(drop=True)
        nans_dropped = a_train_size_before - len(df_a_train)
        
        # No NaNs should be in test splits because the preceding history is populated
        df_a_test = df_a_test.dropna(subset=lag_cols_to_check).reset_index(drop=True)
        df_b_test = df_b_test.dropna(subset=lag_cols_to_check).reset_index(drop=True)
        
        logger.info(f"Dropped {nans_dropped} boundary lag rows from the training set.")
        
        # 10. Save Feature Sets
        Path(FEATURES_DIR).mkdir(parents=True, exist_ok=True)
        
        # Convert date to string before saving
        for df_slice in [df_a_train, df_a_test, df_b_train, df_b_test]:
            df_slice['date'] = df_slice['date'].dt.strftime('%Y-%m-%d')
            
        df_a_train.to_csv(MODEL_A_TRAIN_CSV, index=False)
        df_a_test.to_csv(MODEL_A_TEST_CSV, index=False)
        df_b_train.to_csv(MODEL_B_TRAIN_CSV, index=False)
        df_b_test.to_csv(MODEL_B_TEST_CSV, index=False)
        
        logger.info(f"Model A (Weather-only) Saved: {MODEL_A_TRAIN_CSV.name} ({len(df_a_train)} rows), {MODEL_A_TEST_CSV.name} ({len(df_a_test)} rows)")
        logger.info(f"Model B (Weather + Aerosol) Saved: {MODEL_B_TRAIN_CSV.name} ({len(df_b_train)} rows), {MODEL_B_TEST_CSV.name} ({len(df_b_test)} rows)")
        
        # 11. Compile Feature Report
        report = self._generate_report(df_a_train, df_a_test, df_b_train, df_b_test)
        
        return df_a_train, df_a_test, df_b_train, df_b_test, report

    def _generate_report(self, a_train: pd.DataFrame, a_test: pd.DataFrame, b_train: pd.DataFrame, b_test: pd.DataFrame) -> Dict:
        """
        Compiles class balance and split proportions, and saves a markdown report.
        """
        def get_class_stats(df: pd.DataFrame) -> Dict:
            total = len(df)
            hw_count = int((df['heat_label'] if 'heat_label' in df.columns else df['heatwave_label']).sum())
            shw_count = int((df['severity_tier'] == 2).sum())
            return {
                "total": total,
                "heatwave_count": hw_count,
                "severe_heatwave_count": shw_count,
                "normal_count": total - hw_count,
                "heatwave_ratio": float(hw_count / total) if total > 0 else 0.0,
                "severe_heatwave_ratio": float(shw_count / total) if total > 0 else 0.0
            }
            
        report = {
            "labeling_option": self.labeling_option,
            "train_split": get_class_stats(a_train),
            "test_split": get_class_stats(a_test),
            "model_a_features_count": len(a_train.columns) - 9,  # exclude meta/labels (5 meta + 4 label cols)
            "model_b_features_count": len(b_train.columns) - 9,
        }
        
        # Calculate per-district class balance in training set
        dist_stats = {}
        for dist_id, group in a_train.groupby('district_id'):
            hw_cnt = int(group['heatwave_label'].sum())
            dist_stats[int(dist_id)] = {
                "name": str(group['district_name'].iloc[0]),
                "total": len(group),
                "heatwave_count": hw_cnt,
                "heatwave_ratio": float(hw_cnt / len(group))
            }
        report["district_train_stats"] = dist_stats
        
        # Save Markdown Report
        md_content = self._build_markdown_report(report)
        with open(FEATURES_REPORT_MD, 'w', encoding='utf-8') as f:
            f.write(md_content)
        logger.info(f"Features report saved to {FEATURES_REPORT_MD}")
        
        return report

    def _build_markdown_report(self, report: Dict) -> str:
        """
        Generates a clean markdown report for the user.
        """
        train = report["train_split"]
        test = report["test_split"]
        
        md = []
        md.append("# HEWS Feature Engineering & Label Report\n")
        md.append(f"This report outlines the characteristics of the engineered features and class distributions generated under **Labeling Option {report['labeling_option']}**.\n")
        
        md.append("## 1. Feature Matrices Summary")
        md.append(f"- **Model A (Meteorological only) Column Count:** {report['model_a_features_count'] + 9} (including 5 metadata + 4 label columns)")
        md.append(f"- **Model B (Meteorological + Aerosol) Column Count:** {report['model_b_features_count'] + 9} (including 5 metadata + 4 label columns)")
        md.append(f"- **Chronological Train/Test Split Date:** 2025-01-01\n")
        
        md.append("## 2. Dataset Split Sizes and Class Balance")
        md.append("| Metric | Train Split (2023-2024) | Test Split (2025) |")
        md.append("| --- | --- | --- |")
        md.append(f"| **Date Range** | 2023-01-01 to 2024-12-31 | 2025-01-01 to 2025-06-30 |")
        md.append(f"| **Total Rows** | {train['total']} | {test['total']} |")
        md.append(f"| **Normal Days (Class 0)** | {train['normal_count']} | {test['normal_count']} |")
        md.append(f"| **Heatwave Days (Class 1)** | {train['heatwave_count'] - train['severe_heatwave_count']} | {test['heatwave_count'] - test['severe_heatwave_count']} |")
        md.append(f"| **Severe Heatwave Days (Class 2)** | {train['severe_heatwave_count']} | {test['severe_heatwave_count']} |")
        md.append(f"| **Total Heatwaves (Binary 1)** | {train['heatwave_count']} ({train['heatwave_ratio']*100:.2f}%) | {test['heatwave_count']} ({test['heatwave_ratio']*100:.2f}%) |")
        md.append("")
        
        md.append("## 3. Training Set Class Balance by District")
        md.append("| District ID | Name | Total Days | Heatwave Days | Heatwave Ratio |")
        md.append("| --- | --- | --- | --- | --- |")
        for dist_id, stats in report["district_train_stats"].items():
            md.append(f"| {dist_id} | {stats['name']} | {stats['total']} | {stats['heatwave_count']} | {stats['heatwave_ratio']*100:.2f}% |")
        md.append("")
        
        md.append("> [!WARNING]")
        md.append("> **Note on Class Imbalance**")
        md.append(f"> The training set exhibits a heavy class imbalance: **{train['heatwave_ratio']*100:.2f}%** positive heatwave labels.")
        md.append("> Class weight adjustments, SMOTE, or focal loss will be required during Model Training (Phase 5) to address this.")
        
        return "\n".join(md)
