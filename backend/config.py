from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    backend_cors_origins: str = Field(
        default="http://localhost:5173", validation_alias="CORS_ORIGINS"
    )
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000
    log_level: str = "info"
    database_url: str = "sqlite:///./data/todos.db"

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        extra="ignore",
        populate_by_name=True,
    )

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.backend_cors_origins.split(",") if o.strip()]


settings = Settings()
