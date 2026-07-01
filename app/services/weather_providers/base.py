from abc import ABC, abstractmethod
from datetime import date
from typing import Dict

class WeatherProvider(ABC):
    @abstractmethod
    async def fetch_weather_forecast(self, latitude: float, longitude: float, forecast_date: date) -> Dict[str, float]:
        """
        Fetches daily weather parameters for a given location (lat, lon) and target date.
        
        Returns a dictionary containing:
        - tempmax: float (Celsius)
        - tempmin: float (Celsius)
        - temp: float (Celsius)
        - humidity: float (Percentage, 0-100)
        - windspeed: float (km/h)
        - sealevelpressure: float (hPa / millibars)
        - solarradiation: float (MJ/m2)
        - precip: float (mm)
        """
        pass
