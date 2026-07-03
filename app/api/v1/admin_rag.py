import logging
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.enums import UserRole, AdvisoryRole, RiskLevel
from app.models.advisory import Advisory
from app.models.user import User
from app.services.rag import RagService
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)

router = APIRouter()
rag_service = RagService()


class AdvisoryRequest(BaseModel):
    query: str
    role: str = "PUBLIC"
    district_name: str = "Unknown"
    severity_tier: str = "MODERATE"
    alert_level: str = "MODERATE"


@router.post("/ingest", status_code=status.HTTP_200_OK)
async def ingest_documents(
    current_user: User = Depends(deps.require_roles([UserRole.ADMIN])),
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers re-ingestion of advisory documents from Supabase Storage.
    Only accessible by users with the ADMIN role.
    """
    logger.info(f"Admin user '{current_user.email}' triggered document ingestion.")
    
    result = await rag_service.ingest_from_supabase(db=db, admin_user_id=current_user.id)
    
    return standard_response(
        status="success",
        data=result,
        message="Document ingestion process completed."
    )


@router.post("/advisory", status_code=status.HTTP_200_OK)
async def get_rag_advisory(
    payload: AdvisoryRequest,
    current_user: User = Depends(deps.get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generates a RAG-powered advisory for a given district, user role, and risk context.
    Accessible by all authenticated users.
    """
    # Map role string → AdvisoryRole enum (fallback to PUBLIC)
    role_map = {
        "FARMER":    AdvisoryRole.FARMER,
        "TRAVELLER": AdvisoryRole.TRAVELLER,
        "RESEARCH":  AdvisoryRole.RESEARCH,
        "AUTHORITY": AdvisoryRole.AUTHORITY,
        "ADMIN":     AdvisoryRole.ADMIN,
    }
    advisory_role = role_map.get(payload.role.upper(), AdvisoryRole.PUBLIC)

    # Map severity string → RiskLevel enum (fallback to MODERATE)
    risk_map = {
        "LOW":      RiskLevel.LOW,
        "MODERATE": RiskLevel.MODERATE,
        "HIGH":     RiskLevel.HIGH,
        "EXTREME":  RiskLevel.EXTREME,
    }
    risk_level = risk_map.get(payload.alert_level.upper(), RiskLevel.MODERATE)

    advisory = await rag_service.retrieve_and_generate(
        db=db,
        query=payload.query,
        role=advisory_role,
        district_name=payload.district_name,
        current_weather="Weather data unavailable",
        severity_tier=payload.severity_tier,
        alert_level=payload.alert_level,
        risk_level_enum=risk_level,
    )

    if advisory is None:
        return standard_response(
            status="success",
            data={
                "advisory": "Standard precautions apply. Stay hydrated, avoid sun during peak hours, and check on vulnerable individuals.",
                "actions": [
                    "Drink at least 2-3 litres of water per day",
                    "Avoid outdoor activity between 11am–4pm",
                    "Wear light, loose clothing",
                    "Check on elderly neighbours and children",
                ],
                "title": f"General Heatwave Advisory for {payload.district_name}",
                "source": "Fallback",
            },
            message="Advisory generated (fallback).",
        )

    return standard_response(
        status="success",
        data={
            "advisory": advisory.content,
            "title": advisory.title,
            "source": advisory.document_source,
            "actions": [],   # Extracted from advisory text if needed
        },
        message="Advisory generated successfully.",
    )
