import logging
from datetime import date, timedelta
from typing import Dict, List
import pandas as pd
import numpy as np
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.weather import IMDWeatherData, AerosolData
from ml.preprocessing.pipeline import DataPreprocessor
from ml.features.builder import FeatureBuilder

logger = logging.getLogger(__name__)

class FeatureBuilderService:
    """
    Service responsible for building model-ready feature vectors for real-time inference,
    reusing the exact validation, cleaning, and feature engineering logic from the ML package.
    """
    def __init__(self):
        self.preprocessor = DataPreprocessor()
        self.builder = FeatureBuilder()

    async def build_inference_vector(
        self, 
        db: AsyncSession, 
        district_id: int, 
        forecast_date: date, 
        live_forecast: Dict[str, float],
        feature_names: List[str]
    ) -> np.ndarray:
        """
        Builds the 1D feature vector for a given district and target date by:
        1. Fetching the preceding 7 days of weather data from the database.
        2. Appending the live API forecast.
        3. Preprocessing the time-series (imputing gaps, capping outliers).
        4. Calculating rolling and lag features using training-serving consistent code.
        """
        # 1. Fetch preceding 7 days from DB (from forecast_date - 7 to forecast_date - 1)
        start_date = forecast_date - timedelta(days=7)
        end_date = forecast_date - timedelta(days=1)
        
        logger.info(f"Querying preceding 7 days of DB observations for district {district_id} (from {start_date} to {end_date})...")
        
        weather_result = await db.execute(
            select(IMDWeatherData).where(
                IMDWeatherData.district_id == district_id,
                IMDWeatherData.date >= start_date,
                IMDWeatherData.date <= end_date
            ).order_by(IMDWeatherData.date)
        )
        weather_records = weather_result.scalars().all()
        
        # 2. Structure DataFrame for preceding 7 days
        # If the DB has gaps, we want to construct exactly 7 rows (setting missing days to NaN so that interpolation can fill them)
        date_range = [start_date + timedelta(days=i) for i in range(7)]
        
        db_records_by_date = {r.date: r for r in weather_records}
        
        hist_rows = []
        for d in date_range:
            rec = db_records_by_date.get(d)
            if rec:
                row = {
                    "date": pd.to_datetime(d),
                    "tempmax": rec.max_temp,
                    "tempmin": rec.min_temp,
                    "temp": rec.mean_temp if rec.mean_temp is not None else (rec.max_temp + rec.min_temp) / 2.0,
                    "humidity": rec.humidity if rec.humidity is not None else 60.0,
                    "precip": rec.rainfall if rec.rainfall is not None else 0.0,
                    "windspeed": rec.wind_speed if rec.wind_speed is not None else 12.0,
                    "sealevelpressure": rec.pressure if rec.pressure is not None else 1010.0,
                    "solarradiation": rec.solar_radiation if rec.solar_radiation is not None else 18.0,
                }
            else:
                # Insert placeholder NaN row to let the cleaner impute it
                logger.warning(f"Database gap found for district {district_id} on date {d}. Inserting NaN row for imputation.")
                row = {
                    "date": pd.to_datetime(d),
                    "tempmax": np.nan, "tempmin": np.nan, "temp": np.nan,
                    "humidity": np.nan, "precip": 0.0, "windspeed": np.nan,
                    "sealevelpressure": np.nan, "solarradiation": np.nan
                }
            hist_rows.append(row)
            
        df_hist = pd.DataFrame(hist_rows)
        
        # 3. Append the target date's live API weather forecast
        forecast_row = pd.DataFrame([{
            "date": pd.to_datetime(forecast_date),
            "tempmax": live_forecast["tempmax"],
            "tempmin": live_forecast["tempmin"],
            "temp": live_forecast["temp"],
            "humidity": live_forecast["humidity"],
            "precip": live_forecast["precip"],
            "windspeed": live_forecast["windspeed"],
            "sealevelpressure": live_forecast["sealevelpressure"],
            "solarradiation": live_forecast["solarradiation"]
        }])
        
        df_merged = pd.concat([df_hist, forecast_row], ignore_index=True)
        
        # Add PM2.5, PM10, AOD placeholder columns for preprocessing schema conformity
        # Since Model A is weather-only, these are ignored by the model, but necessary for pipeline validation.
        df_merged["pm2p5"] = np.nan
        df_merged["pm10"] = np.nan
        df_merged["AOD"] = np.nan
        
        # 4. Clean using preprocessor (sentinels, validation, duplicate checks, interpolations, Winsorization)
        df_cleaned = self.preprocessor.preprocess_realtime_data(
            district_id=district_id,
            weather_df=df_merged,
            aod_df=None
        )
        
        # Make sure dates are datetime objects for FeatureBuilder sorting/calculations
        df_cleaned['date'] = pd.to_datetime(df_cleaned['date'])
        
        # 5. Compute derived features
        df_cleaned['heat_index'] = self.builder.calculate_heat_index(df_cleaned)
        df_features = self.builder.add_time_features(df_cleaned, date_col='date')
        
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
        df_features = self.builder.add_static_features(df_features, district_col='district_id')
        
        # 6. Extract the target forecast date row (the 8th row, i.e., last row)
        target_df = df_features.iloc[[-1]]
        
        logger.info(f"Feature engineering completed. Computed heat_index: {target_df['heat_index'].values[0]:.2f}°C, tempmax_lag_1d: {target_df['tempmax_lag_1d'].values[0]:.2f}°C")
        
        # 7. Select feature columns expected by Model A
        X_infer = target_df[feature_names].values
        return X_infer, float(target_df["heat_index"].values[0])
