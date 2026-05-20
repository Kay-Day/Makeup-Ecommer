from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://macbookpro@localhost:5432/TMC"
    SECRET_KEY: str = "tmc-medical-secret-key-2024-makeup-ecommerce"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DEEPSEEK_BASE_URL: str = "https://api.deepseek.com"
    DEEPSEEK_DEFAULT_MODEL: str = "deepseek-v4-pro"
    DEEPSEEK_API_KEY: str = ""
    PUBLIC_BASE_URL: str = "http://160.22.107.119:8000"
    # Localhost fallback:
    # PUBLIC_BASE_URL: str = "http://localhost:8000"
    CORS_ORIGINS: str = "http://160.22.107.119,http://160.22.107.119:5173,http://160.22.107.119:5174,http://160.22.107.119:3000"
    SERVER_HOST: str = "0.0.0.0"
    SERVER_PORT: int = 8000

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = ".env"

settings = Settings()
