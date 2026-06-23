from fastapi import APIRouter

router = APIRouter()

@router.get("/health", tags=["System"])
async def health_check():
    """
    General service status check. Returns status code 200 with raw status: ok.
    """
    return {"status": "ok"}
