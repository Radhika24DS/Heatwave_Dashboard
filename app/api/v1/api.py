from fastapi import APIRouter
from app.api.v1 import (
    districts, auth, predictions, admin_rag, research, 
    alerts_api, admin, profile, public, farmer, traveler, authority
)

api_router = APIRouter()

# Core routes
api_router.include_router(districts.router,    prefix="/districts",   tags=["Districts"])
api_router.include_router(auth.router,         prefix="/auth",        tags=["Authentication"])
api_router.include_router(predictions.router,  prefix="/predictions", tags=["Predictions"])
api_router.include_router(admin_rag.router,    prefix="/rag",         tags=["RAG Admin"])

# New routes
api_router.include_router(research.router,     prefix="/research",    tags=["Research"])
api_router.include_router(alerts_api.router,   prefix="/alerts",      tags=["Alerts"])
api_router.include_router(admin.router,        prefix="/admin",       tags=["Admin"])
api_router.include_router(profile.router,      prefix="/auth",        tags=["Profile"])

# SAMVIT Role-based routes
api_router.include_router(public.router,       prefix="/public",      tags=["Public"])
api_router.include_router(farmer.router,       prefix="/farmer",      tags=["Farmer"])
api_router.include_router(traveler.router,     prefix="/traveler",    tags=["Traveler"])
api_router.include_router(authority.router,   prefix="/authority",   tags=["Authority"])

