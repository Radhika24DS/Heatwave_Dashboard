'''ml/config.py
Configuration constants for the ML pipeline.
'''

import os
from pathlib import Path

# Base project directory (this file's parent.parent)
BASE_DIR = Path(__file__).resolve().parent.parent

# Data directories
RAW_DATA_DIR = BASE_DIR / "ml" / "data" / "raw"
PROCESSED_DATA_DIR = BASE_DIR / "ml" / "data" / "processed"
ARTIFACTS_DIR = BASE_DIR / "ml" / "artifacts"
REPORTS_DIR = ARTIFACTS_DIR / "reports"
MODELS_DIR = ARTIFACTS_DIR / "models"

# Ensure directories exist
for d in [RAW_DATA_DIR, PROCESSED_DATA_DIR, REPORTS_DIR, MODELS_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Expected raw filenames
KARNATAKA_CSV = RAW_DATA_DIR / "karnataka.csv"
METEOROLOGICAL_CSV = RAW_DATA_DIR / "Meteorological_Karnataka.csv"

# Output files
PROCESSED_CSV = PROCESSED_DATA_DIR / "cleaned_karnataka_dataset.csv"
QUALITY_REPORT_JSON = REPORTS_DIR / "data_quality_report.json"
QUALITY_REPORT_MD = REPORTS_DIR / "data_quality_report.md"

# Feature directories and outputs
FEATURES_DIR = BASE_DIR / "ml" / "data" / "features"
MODEL_A_TRAIN_CSV = FEATURES_DIR / "model_a_train.csv"
MODEL_A_TEST_CSV = FEATURES_DIR / "model_a_test.csv"
MODEL_B_TRAIN_CSV = FEATURES_DIR / "model_b_train.csv"
MODEL_B_TEST_CSV = FEATURES_DIR / "model_b_test.csv"
FEATURES_REPORT_MD = REPORTS_DIR / "features_report.md"

# Model training outputs
FINAL_PIPELINE_PATH = MODELS_DIR / "pipeline.joblib"
SHAP_PLOT_A = REPORTS_DIR / "shap_model_a.png"
SHAP_PLOT_B = REPORTS_DIR / "shap_model_b.png"

# Random seed for reproducibility
RANDOM_SEED = 42

# Train/val split
TRAIN_RATIO = 0.8

# Physical bounds for validation
VALIDATION_BOUNDS = {
    "tempmax": (0.0, 60.0),       # C
    "tempmin": (0.0, 60.0),       # C
    "temp": (0.0, 60.0),          # C
    "humidity": (0.0, 100.0),     # %
    "windspeed": (0.0, 150.0),    # km/h
    "sealevelpressure": (900.0, 1080.0), # hPa
    "solarradiation": (0.0, 1200.0), # W/m2
    "precip": (0.0, 500.0),       # mm
    "pm2p5": (0.0, 1000.0),       # ug/m3
    "pm10": (0.0, 1000.0),        # ug/m3
    "AOD": (0.0, 5.0),            # Aerosol Optical Depth
}
