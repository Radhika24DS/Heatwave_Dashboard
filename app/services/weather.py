import logging
from datetime import date
from typing import Dict, Tuple
from app.services.weather_providers.open_meteo import OpenMeteoProvider
from app.services.weather_providers.nasa_power import NasaPowerProvider

logger = logging.getLogger(__name__)

class WeatherService:
    """
    Unified Service coordinating multiple weather providers with a fallback chain.
    """
    def __init__(self):
        self.open_meteo = OpenMeteoProvider()
        self.nasa_power = NasaPowerProvider()

    async def get_forecast(self, latitude: float, longitude: float, forecast_date: date) -> Tuple[Dict[str, float], str]:
        """
        Retrieves weather forecast for a target date, cascading from Open-Meteo to NASA POWER.
        
        Returns:
            Tuple of (weather_data_dict, provider_name_used)
        """
        # Try Open-Meteo first
        try:
            weather_data = await self.open_meteo.fetch_weather_forecast(latitude, longitude, forecast_date)
            return weather_data, "Open-Meteo"
        except Exception as e:
            logger.warning(f"Open-Meteo forecast fetch failed: {e}. Cascading to NASA POWER fallback...")
            
        # Try NASA POWER fallback
        try:
            weather_data = await self.nasa_power.fetch_weather_forecast(latitude, longitude, forecast_date)
            return weather_data, "NASA POWER (Fallback)"
        except Exception as e:
            logger.error(f"NASA POWER fallback forecast fetch failed: {e}")
            raise Exception("All weather providers failed to retrieve forecast data.")
