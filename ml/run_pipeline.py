# ml/run_pipeline.py
"""
Execution entry point for the HEWS preprocessing pipeline.
"""

import os
import sys
import logging
from pathlib import Path

# Add project root to path to ensure app packages can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from ml.preprocessing.pipeline import DataPreprocessor
from ml.config import PROCESSED_CSV, QUALITY_REPORT_MD

def main():
    # Set up logging to console
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )
    
    logger = logging.getLogger("run_pipeline")
    logger.info("Initializing HEWS Preprocessing Pipeline Execution...")
    
    try:
        preprocessor = DataPreprocessor()
        df_processed, report = preprocessor.preprocess_historical_data()
        
        logger.info("==================================================")
        logger.info("PREPROCESSING PIPELINE COMPLETED SUCCESSFULLY!")
        logger.info("==================================================")
        logger.info(f"Output rows processed: {report['total_output_rows']}")
        logger.info(f"Row count per district: {report['final_cleaned_rows_per_district']}")
        logger.info(f"Number of districts: {report['total_districts']}")
        logger.info(f"Cleaned dataset saved: {PROCESSED_CSV}")
        logger.info(f"Quality report (Markdown): {QUALITY_REPORT_MD}")
        logger.info("==================================================")
        
    except Exception as e:
        logger.error(f"Failed to execute preprocessing pipeline: {e}", exc_info=True)
        sys.exit(1)

if __name__ == '__main__':
    main()
