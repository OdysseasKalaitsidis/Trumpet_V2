import os
import logging
from typing import List
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import settings, init_db
from routers import items, communities, collections, media

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
app.include_router(media.router)  # Handles /media requests via Azure Blob Storage
app.include_router(community_items.router)

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
    # SQLModel will use existing tables in trumpet.db, no need to init_db() unless migrations needed
    pass

if __name__ == "__main__":
    import uvicorn
    # Local dev entry point
    uvicorn.run(app, host="0.0.0.0", port=8000)
