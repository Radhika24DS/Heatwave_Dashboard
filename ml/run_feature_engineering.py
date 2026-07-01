# ml/run_feature_engineering.py
"""
Execution entry point for the HEWS feature engineering and label creation pipeline.
"""

import os
import sys
import logging
from pathlib import Path

# Add project root to path to ensure app packages can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.features.pipeline import FeaturePipeline
from ml.config import (
    MODEL_A_TRAIN_CSV, 
    MODEL_B_TRAIN_CSV, 
    FEATURES_REPORT_MD
)

def main():
    # Set up logging to console
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    logger = logging.getLogger("run_feature_engineering")
    logger.info("Initializing HEWS Feature Engineering & Labeling Pipeline Execution...")
    
    try:
        # Defaulting to Option A (Hilly/High-Altitude criteria applied to all replicated weather data)
        # to ensure positive samples exist across all districts for training.
        pipeline = FeaturePipeline(labeling_option='A')
        a_train, a_test, b_train, b_test, report = pipeline.build_features()
        
        train = report["train_split"]
        test = report["test_split"]
        
        logger.info("==================================================")
        logger.info("FEATURE ENGINEERING PIPELINE COMPLETED SUCCESSFULLY!")
        logger.info("==================================================")
        logger.info(f"Model A Train Matrix: {MODEL_A_TRAIN_CSV.name} (shape: {a_train.shape})")
        logger.info(f"Model B Train Matrix: {MODEL_B_TRAIN_CSV.name} (shape: {b_train.shape})")
        logger.info(f"Train Date Range: 2023-01-01 to 2024-12-31 ({train['total']} rows)")
        logger.info(f"Test Date Range:  2025-01-01 to 2025-06-30 ({test['total']} rows)")
        logger.info("--------------------------------------------------")
        logger.info("CLASS DISTRIBUTION / HEATWAVE LABELS (Class 1 + 2)")
        logger.info(f"Train Split Heatwaves: {train['heatwave_count']} / {train['total']} ({train['heatwave_ratio']*100:.2f}%)")
        logger.info(f"  - Moderate (Class 1): {train['heatwave_count'] - train['severe_heatwave_count']}")
        logger.info(f"  - Severe   (Class 2): {train['severe_heatwave_count']}")
        logger.info(f"Test Split Heatwaves:  {test['heatwave_count']} / {test['total']} ({test['heatwave_ratio']*100:.2f}%)")
        logger.info(f"  - Moderate (Class 1): {test['heatwave_count'] - test['severe_heatwave_count']}")
        logger.info(f"  - Severe   (Class 2): {test['severe_heatwave_count']}")
        logger.info("--------------------------------------------------")
        logger.info(f"Feature Report Saved:  {FEATURES_REPORT_MD}")
        logger.info("==================================================")
        
    except Exception as e:
        logger.error(f"Failed to execute feature engineering pipeline: {e}", exc_info=True)
        sys.exit(1)

if __name__ == '__main__':
    main()
