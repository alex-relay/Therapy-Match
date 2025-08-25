from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    db_user: str = Field(alias="DB_USER")
    db_password: str = Field(alias="DB_PASSWORD")
    db_host: str = Field(alias="DB_HOST")
    db_port: int = Field(alias="DB_PORT")
    db_name: str = Field(alias="DB_NAME")

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

DATABASE_URL = (
    f"postgresql+psycopg2://{settings.db_user}:{settings.db_password}"
    f"@{settings.db_host}:{settings.db_port}/{settings.db_name}"
)
