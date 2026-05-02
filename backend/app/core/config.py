from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://macbookpro@localhost:5432/TMC"
    SECRET_KEY: str = "tmc-medical-secret-key-2024-makeup-ecommerce"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    class Config:
        env_file = ".env"

settings = Settings()
