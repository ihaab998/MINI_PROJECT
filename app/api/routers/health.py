from fastapi import APIRouter
from app.core.config import settings, get_supabase_client

router = APIRouter(tags=["Health & System"])


@router.get("/health", summary="Health Check")
def health_check():
    """
    Returns platform operational status, environment, and Supabase client status.
    """
    supabase_connected = get_supabase_client() is not None

    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "environment": settings.ENVIRONMENT,
        "database": {
            "supabase_client": "connected" if supabase_connected else "unconfigured_or_fallback"
        }
    }
