from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine, SessionLocal
from app.db.base import Base
from app.db.seed import seed_database
from app.api import auth, products, categories, brands, orders, admin

app = FastAPI(title="TMC Medical E-Commerce API", version="1.0.0")

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
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

@app.on_event("startup")
def on_startup():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    # Seed data
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "TMC Medical E-Commerce API", "version": "1.0.0", "docs": "/docs"}
