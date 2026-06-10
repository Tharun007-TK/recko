"""
Application configuration using environment variables
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings"""

    # Supabase Configuration
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    # Service Configuration
    service_name: str = "reconflow-reconciliation"
    debug: bool = False

    # File Configuration
    max_file_size_mb: int = 50
    accepted_file_types: list = [".xlsx", ".xls"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Load settings
settings = Settings()
