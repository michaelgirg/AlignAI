from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time
import uvicorn
from app.routes.api import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="AlignAI API",
    description="AI-powered resume-job description matching and analysis",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    """Application startup event."""
    logger.info("Starting AlignAI backend...")
    logger.info("Initializing services...")
    
    # Log startup completion
    logger.info("AlignAI backend started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown event."""
    logger.info("Shutting down AlignAI backend...")

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to AlignAI API",
        "version": "1.0.0",
        "description": "AI-powered resume-job description matching and analysis",
        "endpoints": {
            "docs": "/docs",
            "health": "/api/v1/health",
            "stats": "/api/v1/stats"
        }
    }

@app.get("/docs")
async def get_docs():
    """Redirect to API documentation."""
    return {"message": "API documentation available at /docs"}

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler."""
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error": str(exc)
        }
    )

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """HTTP exception handler."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )