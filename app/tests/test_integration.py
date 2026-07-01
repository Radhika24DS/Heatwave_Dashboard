import unittest
import datetime
from fastapi.testclient import TestClient
from unittest.mock import patch

from app.main import app
from app.models.enums import UserRole, RiskLevel

MOCK_WEATHER = {
    "tempmax": 38.5,
    "tempmin": 24.0,
    "temp": 30.2,
    "humidity": 65.0,
    "windspeed": 14.2,
    "sealevelpressure": 1009.5,
    "solarradiation": 19.5,
    "precip": 0.0
}

class TestPredictionIntegration(unittest.TestCase):
    def setUp(self):
        timestamp = int(datetime.datetime.now().timestamp())
        self.research_user_payload = {
            "name": "Integration Test Research",
            "email": f"test_research_{timestamp}@ews.org",
            "password": "securepassword123",
            "role": "RESEARCH",
            "is_active": True
        }
        self.public_user_payload = {
            "name": "Integration Test Public",
            "email": f"test_public_{timestamp}@ews.org",
            "password": "securepassword123",
            "role": "PUBLIC",
            "is_active": True
        }

    @patch("app.services.weather.WeatherService.get_forecast")
    def test_complete_integration_flow(self, mock_get_forecast):
        # Set up weather API mock return values
        mock_get_forecast.return_value = (MOCK_WEATHER, "Open-Meteo (Mocked)")
        
        # Use single context manager to keep event loop alive for database connections
        with TestClient(app) as client:
            
            # --- 1. USER REGISTRATION (RESEARCH ROLE) ---
            reg_response = client.post("/api/v1/auth/register", json=self.research_user_payload)
            self.assertEqual(reg_response.status_code, 200)
            reg_data = reg_response.json()
            self.assertEqual(reg_data["status"], "success")
            self.assertEqual(reg_data["data"]["email"], self.research_user_payload["email"])
            self.assertEqual(reg_data["data"]["role"], "RESEARCH")

            # --- 2. USER LOGIN ---
            login_payload = {
                "email": self.research_user_payload["email"],
                "password": self.research_user_payload["password"]
            }
            login_response = client.post("/api/v1/auth/login", json=login_payload)
            self.assertEqual(login_response.status_code, 200)
            login_data = login_response.json()
            self.assertEqual(login_data["status"], "success")
            token = login_data["data"]["access_token"]
            self.assertEqual(login_data["data"]["user"]["role"], "RESEARCH")

            # --- 3. ROLE-GATED ACCESS DENIAL (PUBLIC ROLE) ---
            # Register a PUBLIC user
            client.post("/api/v1/auth/register", json=self.public_user_payload)
            
            # Login public user
            pub_login_payload = {
                "email": self.public_user_payload["email"],
                "password": self.public_user_payload["password"]
            }
            pub_token = client.post("/api/v1/auth/login", json=pub_login_payload).json()["data"]["access_token"]
            
            # Call prediction endpoint with public token (expect 403)
            pub_headers = {"Authorization": f"Bearer {pub_token}"}
            predict_payload = {
                "district_id": 1,
                "forecast_date": (datetime.date.today() + datetime.timedelta(days=1)).isoformat()
            }
            pub_pred_response = client.post("/api/v1/predictions/forecast", json=predict_payload, headers=pub_headers)
            self.assertEqual(pub_pred_response.status_code, 403)
            self.assertIn("Access denied", pub_pred_response.json()["message"])

            # --- 4. END-TO-END PREDICTIONS FLOW (RESEARCH ROLE) ---
            headers = {"Authorization": f"Bearer {token}"}
            pred_response = client.post("/api/v1/predictions/forecast", json=predict_payload, headers=headers)
            self.assertEqual(pred_response.status_code, 200)
            
            json_resp = pred_response.json()
            self.assertEqual(json_resp["status"], "success")
            
            data = json_resp["data"]
            self.assertEqual(data["district_id"], 1)
            self.assertEqual(data["district_name"], "Bangalore")
            
            # Verify forecast fields
            self.assertIn("weather", data)
            self.assertEqual(data["weather"]["tempmax"], MOCK_WEATHER["tempmax"])
            self.assertEqual(data["weather"]["provider"], "Open-Meteo (Mocked)")
            self.assertIn("apparent_heat_index", data["weather"])
            
            # Verify prediction outputs
            self.assertIn("prediction", data)
            self.assertIn("predicted_class", data["prediction"])
            self.assertIn("severity_tier", data["prediction"])
            self.assertIn("risk_score", data["prediction"])
            self.assertIn("risk_percent", data["prediction"])
            self.assertEqual(len(data["prediction"]["probabilities"]), 3)
            
            # Verify alert structure
            self.assertIn("alert", data)
            self.assertIn("alert_level", data["alert"])
            self.assertIn("risk_level", data["alert"])
            self.assertIn("message", data["alert"])
            
            # Verify advisory structure
            self.assertIn("advisory", data)
            self.assertEqual(data["advisory"]["target_demographic"], "PUBLIC, FARMER, TRAVELLER")
            self.assertIn("message", data["advisory"])

if __name__ == '__main__':
    unittest.main()
