from fastapi import APIRouter
from app.api.v1 import districts, auth, predictions

api_router = APIRouter()

# Mount specific domain routes. 
# Versioned API path will suffix: /api/v1/districts
api_router.include_router(districts.router, prefix="/districts", tags=["Districts"])
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(predictions.router, prefix="/predictions", tags=["Predictions"])

