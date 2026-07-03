import unittest
import asyncio
from datetime import date
from unittest.mock import MagicMock, AsyncMock, patch

from app.services.weather import WeatherService
from app.services.rag import RagService
from app.models.enums import AdvisoryRole, RiskLevel

# Helper function to run async test cases
def async_test(coro):
    def wrapper(*args, **kwargs):
        return asyncio.run(coro(*args, **kwargs))
    return wrapper

class TestWeatherServiceFallbacks(unittest.TestCase):
    
    @async_test
    async def test_weather_service_primary_success(self):
        """Verify that WeatherService returns Open-Meteo data when successful."""
        mock_open_meteo = AsyncMock()
        mock_open_meteo.fetch_weather_forecast.return_value = {"tempmax": 35.0}
        mock_nasa_power = AsyncMock()

        service = WeatherService()
        service.open_meteo = mock_open_meteo
        service.nasa_power = mock_nasa_power

        data, provider = await service.get_forecast(12.97, 77.59, date.today())
        self.assertEqual(provider, "Open-Meteo")
        self.assertEqual(data["tempmax"], 35.0)
        mock_open_meteo.fetch_weather_forecast.assert_called_once()
        mock_nasa_power.fetch_weather_forecast.assert_not_called()

    @async_test
    async def test_weather_service_fallback_success(self):
        """Verify cascade to NASA Power if Open-Meteo fails."""
        mock_open_meteo = AsyncMock()
        mock_open_meteo.fetch_weather_forecast.side_effect = Exception("Open-Meteo offline")
        mock_nasa_power = AsyncMock()
        mock_nasa_power.fetch_weather_forecast.return_value = {"tempmax": 34.0}

        service = WeatherService()
        service.open_meteo = mock_open_meteo
        service.nasa_power = mock_nasa_power

        data, provider = await service.get_forecast(12.97, 77.59, date.today())
        self.assertEqual(provider, "NASA POWER (Fallback)")
        self.assertEqual(data["tempmax"], 34.0)
        mock_open_meteo.fetch_weather_forecast.assert_called_once()
        mock_nasa_power.fetch_weather_forecast.assert_called_once()

    @async_test
    async def test_weather_service_all_failed(self):
        """Verify exception raised when both weather providers fail."""
        mock_open_meteo = AsyncMock()
        mock_open_meteo.fetch_weather_forecast.side_effect = Exception("Open-Meteo error")
        mock_nasa_power = AsyncMock()
        mock_nasa_power.fetch_weather_forecast.side_effect = Exception("NASA POWER error")

        service = WeatherService()
        service.open_meteo = mock_open_meteo
        service.nasa_power = mock_nasa_power

        with self.assertRaisesRegex(Exception, "All weather providers failed to retrieve forecast data."):
            await service.get_forecast(12.97, 77.59, date.today())


class TestRagServiceFallbacks(unittest.TestCase):

    @patch("app.services.rag.create_client")
    @patch("app.services.rag.GoogleGenerativeAIEmbeddings")
    @patch("app.services.rag.ChatGoogleGenerativeAI")
    @async_test
    async def test_rag_embedding_failure_fallback(self, mock_llm, mock_embeddings, mock_supabase):
        """Verify that RagService handles Gemini embedding failures gracefully and returns None."""
        service = RagService()
        db_mock = AsyncMock()
        
        # Mock embedding query to raise an exception
        service.embeddings.embed_query.side_effect = Exception("API Key Expired")

        advisory = await service.retrieve_and_generate(
            db=db_mock,
            query="heatwave tips",
            role=AdvisoryRole.PUBLIC,
            district_name="Bengaluru",
            current_weather="Hot",
            severity_tier="Warning",
            alert_level="Warning",
            risk_level_enum=RiskLevel.HIGH
        )
        self.assertIsNone(advisory)
        db_mock.execute.assert_not_called()

    @patch("app.services.rag.create_client")
    @patch("app.services.rag.GoogleGenerativeAIEmbeddings")
    @patch("app.services.rag.ChatGoogleGenerativeAI")
    @async_test
    async def test_rag_no_relevant_context_fallback(self, mock_llm, mock_embeddings, mock_supabase):
        """Verify that fallback advisory content is saved when similarity search yields no results."""
        service = RagService()
        db_mock = AsyncMock()
        mock_result = MagicMock()
        # Database returns zero relevant chunks
        mock_result.fetchall.return_value = []
        db_mock.execute.return_value = mock_result

        service.embeddings.embed_query.return_value = [0.1] * 768

        advisory = await service.retrieve_and_generate(
            db=db_mock,
            query="heatwave safety",
            role=AdvisoryRole.PUBLIC,
            district_name="Mysuru",
            current_weather="Hot",
            severity_tier="Warning",
            alert_level="Warning",
            risk_level_enum=RiskLevel.HIGH
        )

        self.assertIsNotNone(advisory)
        self.assertIn("Please take standard precautions for a Warning heatwave.", advisory.content)
        self.assertIn("Fallback (No relevant documents retrieved)", advisory.document_source)
        db_mock.add.assert_called_once_with(advisory)
        db_mock.commit.assert_called_once()

    @patch("app.services.rag.create_client")
    @patch("app.services.rag.GoogleGenerativeAIEmbeddings")
    @patch("app.services.rag.ChatGoogleGenerativeAI")
    @async_test
    async def test_rag_llm_invocation_failure_fallback(self, mock_llm, mock_embeddings, mock_supabase):
        """Verify that fallback advisory is saved if Gemini LLM synthesis fails."""
        service = RagService()
        db_mock = AsyncMock()
        mock_row = MagicMock()
        mock_row.content = "Stay in the shade."
        mock_row.filename = "SafetyGuide.pdf"
        mock_row.category = "PUBLIC"
        mock_row.similarity = 0.8
        
        mock_result = MagicMock()
        mock_result.fetchall.return_value = [mock_row]
        db_mock.execute.return_value = mock_result

        service.embeddings.embed_query.return_value = [0.1] * 768
        
        # Mock LLM generation fail
        service.llm.invoke.side_effect = Exception("Gemini Rate Limit Exceeded")

        advisory = await service.retrieve_and_generate(
            db=db_mock,
            query="heatwave precautions",
            role=AdvisoryRole.PUBLIC,
            district_name="Mysuru",
            current_weather="Hot",
            severity_tier="Warning",
            alert_level="Warning",
            risk_level_enum=RiskLevel.HIGH
        )

        self.assertIsNotNone(advisory)
        self.assertIn("Standard precautions apply. Stay hydrated and avoid peak heat.", advisory.content)
        self.assertIn("Fallback (LLM Error)", advisory.document_source)
        db_mock.add.assert_called_once_with(advisory)
        db_mock.commit.assert_called_once()

    @patch("app.services.rag.create_client")
    @patch("app.services.rag.GoogleGenerativeAIEmbeddings")
    @patch("app.services.rag.ChatGoogleGenerativeAI")
    @async_test
    async def test_rag_category_filtering_public(self, mock_llm, mock_embeddings, mock_supabase):
        """Verify PUBLIC role restricts search categories strictly to public."""
        service = RagService()
        db_mock = AsyncMock()
        mock_result = MagicMock()
        mock_result.fetchall.return_value = []
        db_mock.execute.return_value = mock_result

        service.embeddings.embed_query.return_value = [0.1] * 768

        await service.retrieve_and_generate(
            db=db_mock,
            query="help",
            role=AdvisoryRole.PUBLIC,
            district_name="Mysuru",
            current_weather="Hot",
            severity_tier="Warning",
            alert_level="Warning",
            risk_level_enum=RiskLevel.HIGH
        )

        called_args, called_kwargs = db_mock.execute.call_args
        params = called_args[1]
        self.assertIn("categories", params)
        self.assertEqual(params["categories"], ("PUBLIC",))

    @patch("app.services.rag.create_client")
    @patch("app.services.rag.GoogleGenerativeAIEmbeddings")
    @patch("app.services.rag.ChatGoogleGenerativeAI")
    @async_test
    async def test_rag_category_filtering_admin(self, mock_llm, mock_embeddings, mock_supabase):
        """Verify ADMIN role permits search categories from public, farmer, and traveller documents."""
        service = RagService()
        db_mock = AsyncMock()
        mock_result = MagicMock()
        mock_result.fetchall.return_value = []
        db_mock.execute.return_value = mock_result

        service.embeddings.embed_query.return_value = [0.1] * 768

        await service.retrieve_and_generate(
            db=db_mock,
            query="help",
            role=AdvisoryRole.ADMIN,
            district_name="Mysuru",
            current_weather="Hot",
            severity_tier="Warning",
            alert_level="Warning",
            risk_level_enum=RiskLevel.HIGH
        )

        called_args, called_kwargs = db_mock.execute.call_args
        params = called_args[1]
        self.assertIn("categories", params)
        self.assertEqual(set(params["categories"]), {"PUBLIC", "FARMER", "TRAVELLER"})

if __name__ == '__main__':
    unittest.main()
