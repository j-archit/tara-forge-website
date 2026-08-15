from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    environment: str = "development"
    database_url: str = "postgresql+psycopg://taraforge:local-dev-only@localhost:5432/taraforge"
    vault_path: Path = Path("./vault")
    max_upload_bytes: int = 25 * 1024 * 1024
    minimum_free_bytes: int = Field(default=100 * 1024 * 1024, ge=0)
    login_rate_limit: int = Field(default=10, ge=1)
    login_rate_window_seconds: int = Field(default=15 * 60, ge=1)
    intake_rate_limit: int = Field(default=20, ge=1)
    intake_rate_window_seconds: int = Field(default=60 * 60, ge=1)
    session_cookie_name: str = "tf_admin_session"
    csrf_cookie_name: str = "tf_admin_csrf"
    session_ttl_hours: int = 12
    secure_cookies: bool = False
    allowed_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000", "http://127.0.0.1:3000"]
    )
    cura_engine_binary: str = "CuraEngine"
    slicer_definition_path: Path = Path("./slicing/definitions/forge_printer.json")
    worker_poll_seconds: float = 2.0
    worker_lease_seconds: int = 300
    google_service_account_key_path: Path | None = None
    google_drive_folder_id: str | None = None
    google_sheet_id: str | None = None


@lru_cache
def get_settings() -> Settings:
    return Settings()
