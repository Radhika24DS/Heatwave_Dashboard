import logging
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.user import User
from app.services.rag import RagService
from app.utils.responses import standard_response

logger = logging.getLogger(__name__)

router = APIRouter()
rag_service = RagService()

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
