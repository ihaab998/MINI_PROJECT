import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from supabase import create_client, Client


class Settings(BaseSettings):
    PROJECT_NAME: str = "Universal Longitudinal Health Record API"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"

    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_DB_URL: Optional[str] = None
    SUPABASE_STORAGE_BUCKET: str = "medical-documents"
    GEMINI_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

# Lazy Supabase Client initialization
_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """
    Returns an initialized Supabase Client.
    Returns None if SUPABASE_URL or SUPABASE_KEY is missing/placeholder.
    """
    global _supabase_client

    if _supabase_client is not None:
        return _supabase_client

    url = settings.SUPABASE_URL
    key = settings.SUPABASE_KEY

    if url and key and url != "https://your-supabase-project-id.supabase.co":
        try:
            _supabase_client = create_client(url, key)
            return _supabase_client
        except Exception as e:
            print(f"[WARNING] Failed to initialize Supabase client: {e}")
            return None
    
    return None
