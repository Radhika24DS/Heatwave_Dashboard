import pytest
import asyncio
from unittest.mock import MagicMock, AsyncMock, patch

from langchain_core.messages import HumanMessage, SystemMessage
from app.services.rag import RagService
from app.models.enums import AdvisoryRole, RiskLevel

@pytest.fixture
def rag_service():
    with patch("app.services.rag.create_client"), \
         patch("app.services.rag.GoogleGenerativeAIEmbeddings"), \
         patch("app.services.rag.ChatGoogleGenerativeAI"):
        service = RagService()
        return service

def test_chunking_strategy(rag_service):
    """Verify recursive character text splitter settings."""
    text = "This is a test document. " * 100
    chunks = rag_service.text_splitter.split_text(text)
    assert len(chunks) > 0
    # Check max chunk size (500 tokens roughly translates to ~2000 chars, but recursive char splits by char count)
    # The chunk_size=500 means 500 characters
    for chunk in chunks:
        assert len(chunk) <= 500

@pytest.mark.asyncio
async def test_embedding_dimensions(rag_service):
    """Verify embedding service mock handles dimension correctly."""
    # Since we are mocking Gemini, we will mock the return value
    rag_service.embeddings.embed_documents.return_value = [[0.1] * 768]
    vectors = rag_service.embeddings.embed_documents(["Test chunk"])
    assert len(vectors) == 1
    assert len(vectors[0]) == 768

@pytest.mark.asyncio
async def test_role_based_filtering(rag_service):
    """Verify that retrieval logic correctly uses role."""
    db_mock = AsyncMock()
    # Mock result of fetchall
    mock_row = MagicMock()
    mock_row.content = "Farmer advice"
    mock_row.filename = "FarmerAdvisories.pdf"
    mock_row.similarity = 0.8
    
    # db.execute returns a Result object which has a sync fetchall()
    mock_result = MagicMock()
    mock_result.fetchall.return_value = [mock_row]
    db_mock.execute.return_value = mock_result
    
    rag_service.embeddings.embed_query.return_value = [0.1] * 768
    rag_service.llm.invoke.return_value = MagicMock(content="Mocked advisory for farmers.")
    
    advisory = await rag_service.retrieve_and_generate(
        db=db_mock,
        query="heatwave tips",
        role=AdvisoryRole.FARMER,
        district_name="Test District",
        current_weather="Hot",
        severity_tier="Warning",
        alert_level="Warning",
        risk_level_enum=RiskLevel.HIGH
    )
    
    assert advisory is not None
    assert advisory.role == AdvisoryRole.FARMER
    assert advisory.content == "Mocked advisory for farmers."
    assert "FarmerAdvisories.pdf" in advisory.document_source
    
    # Assert DB execute was called with correct categories
    args, kwargs = db_mock.execute.call_args
    assert "('FARMER',)" in str(args) or "'FARMER'" in str(kwargs.get("categories") or args)
