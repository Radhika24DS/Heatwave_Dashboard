import httpx
import logging
from datetime import date
from typing import Dict
from app.services.weather_providers.base import WeatherProvider

logger = logging.getLogger(__name__)

class OpenMeteoProvider(WeatherProvider):
    """
    Weather Provider using the Open-Meteo Free API.
    Does not require API keys.
    """
    async def fetch_weather_forecast(self, latitude: float, longitude: float, forecast_date: date) -> Dict[str, float]:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "start_date": forecast_date.strftime("%Y-%m-%d"),
            "end_date": forecast_date.strftime("%Y-%m-%d"),
            "daily": (
                "temperature_2m_max,"
                "temperature_2m_min,"
                "temperature_2m_mean,"
                "relative_humidity_2m_mean,"
                "precipitation_sum,"
                "wind_speed_10m_max,"
                "pressure_msl_mean,"
                "shortwave_radiation_sum"
            ),
            "timezone": "auto"
        }
        
        logger.info(f"Fetching Open-Meteo forecast for ({latitude}, {longitude}) on {forecast_date}...")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=10.0)
            if response.status_code != 200:
                logger.error(f"Open-Meteo API returned error {response.status_code}: {response.text}")
                raise Exception(f"Open-Meteo API error: {response.status_code}")
                
            data = response.json()
            daily = data.get("daily", {})
            
            # Helper to extract array elements safely
            def get_val(key, default):
                vals = daily.get(key, [])
                if vals and len(vals) > 0 and vals[0] is not None:
                    return float(vals[0])
                return default
                
            # Open-Meteo shortwave_radiation_sum is directly in MJ/m²
            result = {
                "tempmax": get_val("temperature_2m_max", 35.0),
                "tempmin": get_val("temperature_2m_min", 22.0),
                "temp": get_val("temperature_2m_mean", 28.0),
                "humidity": get_val("relative_humidity_2m_mean", 60.0),
                "windspeed": get_val("wind_speed_10m_max", 12.0),
                "sealevelpressure": get_val("pressure_msl_mean", 1010.0),
                "solarradiation": get_val("shortwave_radiation_sum", 18.0),
                "precip": get_val("precipitation_sum", 0.0)
            }
            
            logger.info(f"Open-Meteo forecast retrieved successfully: {result}")
            return result
