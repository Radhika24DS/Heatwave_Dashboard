import httpx
import logging
from datetime import date
from typing import Dict
from app.services.weather_providers.base import WeatherProvider

logger = logging.getLogger(__name__)

class NasaPowerProvider(WeatherProvider):
    """
    Fallback Weather Provider using the NASA POWER API.
    Does not require API keys.
    """
    async def fetch_weather_forecast(self, latitude: float, longitude: float, forecast_date: date) -> Dict[str, float]:
        url = "https://power.larc.nasa.gov/api/temporal/daily/point"
        date_str = forecast_date.strftime("%Y%m%d")
        
        params = {
            "parameters": "T2M_MAX,T2M_MIN,T2M,RH2M,PRECTOTCORR,WS10M,PS,ALLSKY_SNDN_SWN",
            "community": "AG",
            "longitude": longitude,
            "latitude": latitude,
            "start": date_str,
            "end": date_str,
            "format": "JSON"
        }
        
        logger.info(f"Fetching NASA POWER forecast fallback for ({latitude}, {longitude}) on {forecast_date}...")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, timeout=12.0)
            if response.status_code != 200:
                logger.error(f"NASA POWER API returned error {response.status_code}: {response.text}")
                raise Exception(f"NASA POWER API error: {response.status_code}")
                
            data = response.json()
            parameters = data.get("properties", {}).get("parameter", {})
            
            def get_val(key, default):
                param_dict = parameters.get(key, {})
                val = param_dict.get(date_str)
                # NASA POWER uses -999.0 or similar as a missing/fill value
                if val is not None and val > -900.0:
                    return float(val)
                return default
                
            # Conversions:
            # - windspeed: WS10M is in m/s. Convert to km/h (multiply by 3.6)
            ws_ms = get_val("WS10M", 3.33)
            windspeed_kmh = ws_ms * 3.6
            
            # - sealevelpressure: PS is surface pressure in kPa. Convert to hPa (multiply by 10)
            ps_kpa = get_val("PS", 101.0)
            pressure_hpa = ps_kpa * 10.0
            
            # - solarradiation: ALLSKY_SNDN_SWN is in MJ/m²/day
            solar_mj = get_val("ALLSKY_SNDN_SWN", 18.0)
            
            result = {
                "tempmax": get_val("T2M_MAX", 35.0),
                "tempmin": get_val("T2M_MIN", 22.0),
                "temp": get_val("T2M", 28.0),
                "humidity": get_val("RH2M", 60.0),
                "windspeed": windspeed_kmh,
                "sealevelpressure": pressure_hpa,
                "solarradiation": solar_mj,
                "precip": get_val("PRECTOTCORR", 0.0)
            }
            
            logger.info(f"NASA POWER forecast fallback retrieved successfully: {result}")
            return result
