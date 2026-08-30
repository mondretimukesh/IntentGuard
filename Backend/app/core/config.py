import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow"
    )

    PROJECT_NAME: str = "IntentShield CTI Backend"
    VERSION: str = "1.4.0"
    API_V1_STR: str = "/api"

    # JWT Security
    SECRET_KEY: str = "intentguard_super_secret_jwt_key_secure_and_reliable_2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./intentguard.db"
    SYNC_DATABASE_URL: str = "sqlite:///./intentguard.db"

    # Celery & Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"

    # Storage (Local fallback / S3 / MinIO)
    STORAGE_TYPE: str = "local"  # "local" or "s3"
    UPLOAD_DIR: str = "./uploads"
    EXPORT_DIR: str = "./exports"
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET_NAME: str = "intentguard-apks"
    MINIO_SECURE: bool = False

    # Default Seed Admin
    DEFAULT_ADMIN_EMAIL: str = "admin@intentguard.sec"
    DEFAULT_ADMIN_PASSWORD: str = "AdminPassword123!"
    DEFAULT_ADMIN_NAME: str = "Bharath (Lead Admin)"

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "*"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()
