# ml/preprocessing/pipeline.py
"""
Pipeline Orchestrator for the HEWS preprocessing pipeline.
Integrates validation, cleaning, and replication to district scopes.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Tuple, List
import pandas as pd
import numpy as np
import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from ml.config import (
    KARNATAKA_CSV, 
    METEOROLOGICAL_CSV, 
    PROCESSED_CSV, 
    QUALITY_REPORT_JSON, 
    QUALITY_REPORT_MD
)
from ml.preprocessing.validator import DataValidator
from ml.preprocessing.cleaner import DataCleaner

logger = logging.getLogger(__name__)

# Static fallback districts in case database connection fails or is not configured
FALLBACK_DISTRICTS = [
    {"id": 1, "name": "Bangalore", "latitude": 12.9716, "longitude": 77.5946},
    {"id": 2, "name": "Mysore", "latitude": 12.2958, "longitude": 76.6394},
    {"id": 3, "name": "Belagavi", "latitude": 15.8497, "longitude": 74.4977},
    {"id": 4, "name": "Kalaburagi", "latitude": 17.3297, "longitude": 76.8343},
    {"id": 5, "name": "Mangalore", "latitude": 12.9141, "longitude": 74.8560},
    {"id": 6, "name": "Chikkamagaluru", "latitude": 13.3161, "longitude": 75.7720},
    {"id": 7, "name": "Bidar", "latitude": 17.9104, "longitude": 77.5199},
    {"id": 8, "name": "Davanagere", "latitude": 14.4644, "longitude": 75.9218},
    {"id": 9, "name": "Udupi", "latitude": 13.3409, "longitude": 74.7421},
    {"id": 10, "name": "Tumkur", "latitude": 13.3379, "longitude": 77.1173},
]

class DataPreprocessor:
    """
    Main orchestrator for validating and cleaning historical and real-time datasets.
    """
    def __init__(self):
        self.validator = DataValidator()
        self.cleaner = DataCleaner()

    async def _fetch_districts_from_db(self) -> List[Dict]:
        """
        Attempts to fetch seeded districts from the database.
        """
        try:
            from app.core.config import settings
            from app.models.location import District
            
            engine = create_async_engine(settings.DATABASE_URL, echo=False)
            SessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False)
            
            async with SessionLocal() as session:
                result = await session.execute(select(District))
                districts = result.scalars().all()
                
            await engine.dispose()
            
            if districts:
                return [{"id": d.id, "name": d.name, "latitude": d.latitude, "longitude": d.longitude} for d in districts]
        except Exception as e:
            logger.warning(f"Could not fetch districts from DB: {e}. Using static fallback districts.")
            
        return FALLBACK_DISTRICTS

    def preprocess_historical_data(self) -> Tuple[pd.DataFrame, Dict]:
        """
        Full workflow for historical training data preprocessing.
        1. Loads raw Meteorological and Aerosol CSV datasets.
        2. Merges them on date.
        3. Converts sentinel values (-9999) to NaNs.
        4. Validates ranges and marks violators as NaNs.
        5. Removes duplicates.
        6. Imputes missing values via linear time-series interpolation.
        7. Caps outliers using IQR Winsorization.
        8. Reconciles single-point to multi-district scope.
        9. Saves processed data and quality report.
        """
        logger.info("Starting historical data preprocessing...")
        
        # 1. Load Raw Datasets
        if not Path(KARNATAKA_CSV).exists():
            raise FileNotFoundError(f"Aerosol raw dataset not found at {KARNATAKA_CSV}")
        if not Path(METEOROLOGICAL_CSV).exists():
            raise FileNotFoundError(f"Meteorological raw dataset not found at {METEOROLOGICAL_CSV}")
            
        df_aod = pd.read_csv(KARNATAKA_CSV)
        df_weather = pd.read_csv(METEOROLOGICAL_CSV)
        
        # 2. Date parsing and standardization
        df_aod = self.cleaner.parse_dates(df_aod, 'time', date_format='%d-%m-%Y')
        df_weather = self.cleaner.parse_dates(df_weather, 'datetime', date_format='%Y-%m-%d')
        
        # Rename date columns to 'date' for merging
        df_aod = df_aod.rename(columns={'time': 'date'})
        df_weather = df_weather.rename(columns={'datetime': 'date'})
        
        # 3. Merge datasets (inner join based on overlapping dates)
        df_merged = pd.merge(df_weather, df_aod[['date', 'AOD']], on='date', how='inner')
        df_merged = df_merged.sort_values(by='date').reset_index(drop=True)
        
        initial_row_count = len(df_merged)
        logger.info(f"Merged datasets. Initial rows: {initial_row_count} (date range: {df_merged['date'].min().date()} to {df_merged['date'].max().date()})")
        
        # 4. Handle known sentinels (-9999 in AOD)
        df_cleaned, sentinels_replaced = self.cleaner.handle_sentinels(df_merged, columns=['AOD'], sentinel=-9999.0)
        
        # 5. Schema check configuration
        expected_schema = {
            "tempmax": "numeric", "tempmin": "numeric", "temp": "numeric", 
            "humidity": "numeric", "precip": "numeric", "windspeed": "numeric", 
            "sealevelpressure": "numeric", "solarradiation": "numeric", 
            "pm2p5": "numeric", "pm10": "numeric", "AOD": "numeric"
        }
        schema_valid, schema_errors = self.validator.validate_schema(df_cleaned, expected_schema)
        if not schema_valid:
            logger.error(f"Schema validation failed: {schema_errors}")
            raise ValueError(f"Schema validation failed: {schema_errors}")
            
        # 6. Physical boundary validation (replaces range violators with NaN)
        df_validated, validation_report = self.validator.validate_ranges(df_cleaned)
        
        # 7. Unit conversion check (Historical datasets are metric, but utility is called for validation)
        df_cleaned_units, conversions = self.cleaner.convert_units(
            df_validated, 
            temp_cols=["tempmax", "tempmin", "temp"], 
            precip_cols=["precip"], 
            temp_unit="C", 
            precip_unit="mm"
        )
        
        # 8. Duplicate removal
        df_no_dups, duplicates_dropped = self.cleaner.remove_duplicates(df_cleaned_units, subset=['date'])
        
        # 9. Imputation strategies
        imputation_strategies = {
            "tempmax": "interpolate",
            "tempmin": "interpolate",
            "temp": "interpolate",
            "humidity": "interpolate",
            "windspeed": "interpolate",
            "sealevelpressure": "interpolate",
            "solarradiation": "interpolate",
            "pm2p5": "interpolate",
            "pm10": "interpolate",
            "AOD": "interpolate",
            "precip": "constant_zero"
        }
        df_imputed, imputation_report = self.cleaner.impute_missing(df_no_dups, imputation_strategies, limit_days=3)
        
        # 10. Outlier Winsorization
        columns_to_winsorize = [
            "tempmax", "tempmin", "temp", "humidity", "windspeed", 
            "sealevelpressure", "solarradiation", "pm2p5", "pm10", "AOD"
        ]
        df_final_clean, outlier_report = self.cleaner.handle_outliers_iqr(df_imputed, columns_to_winsorize, k=3.0)
        
        # 11. Reconcile scope: fetch districts and replicate
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
        if loop.is_running():
            # In an active event loop, run as future
            districts = loop.run_until_complete(self._fetch_districts_from_db())
        else:
            districts = asyncio.run(self._fetch_districts_from_db())
            
        logger.info(f"Reconciling scope. Replicating data across {len(districts)} districts.")
        
        replicated_dfs = []
        # Specify target columns to retain
        keep_cols = [
            "date", "tempmax", "tempmin", "temp", "humidity", 
            "precip", "windspeed", "sealevelpressure", "solarradiation", 
            "pm2p5", "pm10", "AOD"
        ]
        df_base = df_final_clean[keep_cols].copy()
        
        for district in districts:
            df_dist = df_base.copy()
            df_dist["district_id"] = district["id"]
            df_dist["district_name"] = district["name"]
            df_dist["latitude"] = district["latitude"]
            df_dist["longitude"] = district["longitude"]
            replicated_dfs.append(df_dist)
            
        df_district_level = pd.concat(replicated_dfs, ignore_index=True)
        
        # Rearrange columns logically
        columns_order = [
            "district_id", "district_name", "latitude", "longitude", "date",
            "tempmax", "tempmin", "temp", "humidity", "precip", "windspeed",
            "sealevelpressure", "solarradiation", "pm2p5", "pm10", "AOD"
        ]
        df_district_level = df_district_level[columns_order]
        
        # Convert date to string format for saving
        df_district_level['date'] = df_district_level['date'].dt.strftime('%Y-%m-%d')
        
        # 12. Save Cleaned Dataset
        Path(PROCESSED_CSV).parent.mkdir(parents=True, exist_ok=True)
        df_district_level.to_csv(PROCESSED_CSV, index=False)
        logger.info(f"Cleaned dataset saved to {PROCESSED_CSV} ({len(df_district_level)} rows).")
        
        # 13. Compile Data Quality Report
        quality_report = {
            "initial_merged_rows": initial_row_count,
            "final_cleaned_rows_per_district": len(df_final_clean),
            "total_districts": len(districts),
            "total_output_rows": len(df_district_level),
            "duplicates_dropped": duplicates_dropped,
            "sentinels_replaced_nan": sentinels_replaced,
            "range_validation": validation_report,
            "conversions_applied": conversions,
            "imputations": imputation_report,
            "outliers_winsorized": outlier_report
        }
        
        self._save_quality_report(quality_report)
        
        return df_district_level, quality_report

    def preprocess_realtime_data(self, district_id: int, weather_df: pd.DataFrame, aod_df: pd.DataFrame = None) -> pd.DataFrame:
        """
        Cleaning logic called by the real-time API prediction flow.
        Applies identical validation and cleaning steps to a single-district real-time stream.
        """
        logger.info(f"Preprocessing real-time data for district ID {district_id}...")
        
        df_w = weather_df.copy()
        
        # Parse Dates
        df_w = self.cleaner.parse_dates(df_w, 'datetime' if 'datetime' in df_w.columns else 'date')
        df_w = df_w.rename(columns={'datetime': 'date'} if 'datetime' in df_w.columns else {})
        
        # Handle AOD if provided
        if aod_df is not None and not aod_df.empty:
            df_a = aod_df.copy()
            df_a = self.cleaner.parse_dates(df_a, 'time' if 'time' in df_a.columns else 'date')
            df_a = df_a.rename(columns={'time': 'date'} if 'time' in df_a.columns else {})
            # Merge
            df_merged = pd.merge(df_w, df_a[['date', 'AOD']], on='date', how='left')
        else:
            df_merged = df_w
            if 'AOD' not in df_merged.columns:
                df_merged['AOD'] = np.nan
                
        df_merged = df_merged.sort_values(by='date').reset_index(drop=True)
        
        # Sentinel Replacement
        df_cleaned, _ = self.cleaner.handle_sentinels(df_merged, columns=['AOD'], sentinel=-9999.0)
        
        # Range bounds validation (sets violators to NaN)
        df_validated, _ = self.validator.validate_ranges(df_cleaned)
        
        # Duplicate removal
        df_no_dups, _ = self.cleaner.remove_duplicates(df_validated, subset=['date'])
        
        # Imputations
        imputation_strategies = {
            "tempmax": "interpolate", "tempmin": "interpolate", "temp": "interpolate",
            "humidity": "interpolate", "windspeed": "interpolate", "sealevelpressure": "interpolate",
            "solarradiation": "interpolate", "pm2p5": "interpolate", "pm10": "interpolate",
            "AOD": "interpolate", "precip": "constant_zero"
        }
        df_imputed, _ = self.cleaner.impute_missing(df_no_dups, imputation_strategies, limit_days=3)
        
        # Outliers Winsorization
        columns_to_winsorize = [
            "tempmax", "tempmin", "temp", "humidity", "windspeed", 
            "sealevelpressure", "solarradiation", "pm2p5", "pm10", "AOD"
        ]
        df_final, _ = self.cleaner.handle_outliers_iqr(df_imputed, columns_to_winsorize, k=3.0)
        
        # Add metadata
        df_final["district_id"] = district_id
        
        return df_final

    def _save_quality_report(self, report: Dict) -> None:
        """
        Saves the quality report in JSON and Markdown formats.
        """
        # Save JSON
        Path(QUALITY_REPORT_JSON).parent.mkdir(parents=True, exist_ok=True)
        with open(QUALITY_REPORT_JSON, 'w') as f:
            json.dump(report, f, indent=4)
        logger.info(f"JSON quality report saved to {QUALITY_REPORT_JSON}")
        
        # Generate and Save Markdown
        md_content = self._generate_markdown_report(report)
        with open(QUALITY_REPORT_MD, 'w', encoding='utf-8') as f:
            f.write(md_content)
        logger.info(f"Markdown quality report saved to {QUALITY_REPORT_MD}")

    def _generate_markdown_report(self, report: Dict) -> str:
        """
        Constructs a beautiful Markdown data quality report.
        """
        range_val = report["range_validation"]
        imputations = report["imputations"]
        outliers = report["outliers_winsorized"]
        
        md = []
        md.append("# HEWS Data Preprocessing Quality Report\n")
        md.append("This report summarizes the outcome of the validation and cleaning pipeline executed on the raw historical Karnataka weather and aerosol datasets.\n")
        
        md.append("## Executive Summary")
        md.append(f"- **Initial Merged Rows (Overlap):** {report['initial_merged_rows']}")
        md.append(f"- **Cleaned Rows per District:** {report['final_cleaned_rows_per_district']}")
        md.append(f"- **Total Seeded Districts:** {report['total_districts']}")
        md.append(f"- **Total Rows in Output (District Scope):** {report['total_output_rows']}")
        md.append(f"- **Duplicates Dropped:** {report['duplicates_dropped']}")
        md.append(f"- **Aerosol AOD -9999 Sentinels Replaced with NaN:** {report['sentinels_replaced_nan']}\n")
        
        md.append("## 1. Range Validation Violations Capped")
        md.append("Values outside of standard physical boundaries were marked as `NaN` and subsequently imputed. Actual range violations caught (excluding -9999 sentinels):")
        if range_val["total_violations"] == 0:
            md.append("- **No range validation violations detected in the datasets.**\n")
        else:
            md.append(f"- **Total Violations Count:** {range_val['total_violations']}\n")
            md.append("| Column | Violations Count | Observed Range | Expected Bounds |")
            md.append("| --- | --- | --- | --- |")
            for col, details in range_val["violations_by_column"].items():
                md.append(f"| {col} | {details['count']} | [{details['min_observed']:.2f}, {details['max_observed']:.2f}] | {details['bounds']} |")
            md.append("")
            
        md.append("## 2. Missing Values Imputed")
        md.append("Strategies applied: linear interpolation (max 3 days limit) or zero-filling for precipitation.")
        if not imputations:
            md.append("- **No missing values required imputation.**\n")
        else:
            md.append("| Column | Strategy | Imputed Count | Remaining NaNs |")
            md.append("| --- | --- | --- | --- |")
            for col, details in imputations.items():
                md.append(f"| {col} | {details['strategy']} | {details['imputed_count']} | {details['remaining_nulls']} |")
            md.append("")
            
        md.append("## 3. Outlier Winsorization")
        md.append("Outliers beyond `Q1 - 3*IQR` and `Q3 + 3*IQR` were capped (Winsorized) to preserve chronological consistency without dropping records.")
        if not outliers:
            md.append("- **No outliers detected or capped.**\n")
        else:
            md.append("| Column | Capped Count | Capped Low | Capped High | Winsorization Bounds |")
            md.append("| --- | --- | --- | --- | --- |")
            for col, details in outliers.items():
                md.append(f"| {col} | {details['total_capped']} | {details['capped_low']} | {details['capped_high']} | [{details['lower_bound']:.2f}, {details['upper_bound']:.2f}] |")
            md.append("")
            
        return "\n".join(md)
