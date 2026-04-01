import os
import logging
from typing import List
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import settings, init_db
from routers import items, communities, collections, media, community_items

# Structured Logging Setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("trumpet")

app = FastAPI(
    title="Trumpet API",
    description="Python-based backend for the Trumpet library system (Azure-ready)",
    version="1.0.1"
)

# CORS (In production, restrict this to your actual frontend URL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(items.router)
app.include_router(communities.router)
app.include_router(collections.router)
app.include_router(community_items.router)

# Media Serving Logic: Azure Redirect vs Local Static Files
if settings.AZURE_STORAGE_CONNECTION_STRING:
    app.include_router(media.router)  # Handles /media requests via Azure Blob Storage
else:
    # Local fallback for development
    resources_path = settings.RESOURCES_PATH
    if not os.path.isabs(resources_path):
        resources_path = os.path.abspath(os.path.join(os.getcwd(), resources_path))
    
    if os.path.exists(resources_path):
        app.mount("/media", StaticFiles(directory=resources_path), name="media")
        logger.info(f"Serving local media from: {resources_path}")
    else:
        logger.warning(f"Resources path not found: {resources_path}")

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Completed request: {request.method} {request.url.path} - Status: {response.status_code}")
    return response

# Health Check Endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Standard Azure Health probe endpoint.
    Returns 200 if the app is healthy.
    """
    return {"status": "healthy", "version": "1.0.1"}

@app.get("/")
async def root():
    return {"message": "Trumpet Python API is running in Production Mode", "docs": "/docs", "health": "/health"}

@app.on_event("startup")
def on_startup():
    logger.info("Initializing Trumpet Python Backend...")
    # Inspecting database to verify table names at runtime
    from sqlalchemy import inspect
    from database import engine
    from models.item import Item
    inspector = inspect(engine)
    logger.info(f"Existing tables in database: {inspector.get_table_names()}")
    logger.info(f"Configured Item table name: {Item.__tablename__}")

if __name__ == "__main__":
    import uvicorn
    # Local dev entry point
    uvicorn.run(app, host="0.0.0.0", port=8000)
