import uvicorn
from app.core.config import settings

if __name__ == "__main__":
    # Localhost config moved to app/core/config.py and backend/.env for easier switching.
    uvicorn.run("app.main:app", host=settings.SERVER_HOST, port=settings.SERVER_PORT, reload=True)
