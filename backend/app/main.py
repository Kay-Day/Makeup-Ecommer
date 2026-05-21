from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.db.database import engine, SessionLocal
from app.db.base import Base
from app.db.seed import seed_database
from app.db.schema_sync import sync_runtime_schema
from app.api import auth, products, categories, brands, orders, admin, content, uploads, notifications, chatbot, wishlist, banners, combos, payments
from app.core.config import settings

app = FastAPI(title="TMC Medical E-Commerce API", version="1.0.0")

upload_dir = Path(__file__).resolve().parents[1] / "uploads"
upload_dir.mkdir(parents=True, exist_ok=True)

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(brands.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(content.router, prefix="/api")
app.include_router(uploads.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(chatbot.router, prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(banners.router, prefix="/api")
app.include_router(combos.router, prefix="/api")
app.include_router(payments.router, prefix="/api")
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")

@app.on_event("startup")
def on_startup():
    if settings.AUTO_CREATE_TABLES:
        Base.metadata.create_all(bind=engine)
        sync_runtime_schema(engine)
        print("Database schema is ready.")

    if settings.AUTO_SEED_DATABASE:
        db = SessionLocal()
        try:
            seed_database(db)
            print("Database seed is ready.")
        finally:
            db.close()

@app.get("/")
def root():
    return {"message": "TMC Medical E-Commerce API", "version": "1.0.0", "docs": "/docs"}
