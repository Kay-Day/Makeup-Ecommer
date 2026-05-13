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

    class Config:
        env_file = ".env"

settings = Settings()
