from fastapi import APIRouter, HTTPException, Form
from typing import Optional
import logging
from ..models.models import (
    UploadResumeResponse, UploadJobResponse, AnalyzeRequest, 
    AnalyzeResponse, HistoryResponse, HealthResponse
)
from ..services.analysis_service import AnalysisService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["analysis"])
analysis_service = AnalysisService()

@router.post("/upload-resume", response_model=UploadResumeResponse)
async def upload_resume(text: str = Form(...)):
    """Upload resume text for analysis."""
    try:
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Resume text is required")
        
        if len(text) > 50000:  # 50KB limit
            raise HTTPException(status_code=400, detail="Resume text too long (max 50KB)")
        
        result = analysis_service.upload_resume(text)
        return UploadResumeResponse(**result)
        
    except Exception as e:
        logger.error(f"Resume upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")

@router.post("/upload-job", response_model=UploadJobResponse)
async def upload_job_description(text: str = Form(...)):
    """Upload job description text for analysis."""
    try:
        if not text or not text.strip():
            raise HTTPException(status_code=400, detail="Job description text is required")
        
        if len(text) > 20000:  # 20KB limit
            raise HTTPException(status_code=400, detail="Job description text too long (max 20KB)")
        
        result = analysis_service.upload_job_description(text)
        return UploadJobResponse(**result)
        
    except Exception as e:
        logger.error(f"Job description upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to process job description: {str(e)}")

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_resume_jd(request: AnalyzeRequest):
    """Analyze resume against job description."""
    try:
        result = analysis_service.analyze(
            resume_id=request.resume_id,
            jd_id=request.jd_id,
            target_role=request.target_role
        )
        return AnalyzeResponse(analysis=result["analysis"])
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/history", response_model=HistoryResponse)
async def get_analysis_history(limit: int = 20, offset: int = 0):
    """Get analysis history."""
    try:
        if limit < 1 or limit > 100:
            raise HTTPException(status_code=400, detail="Limit must be between 1 and 100")
        if offset < 0:
            raise HTTPException(status_code=400, detail="Offset must be non-negative")
        
        items = analysis_service.get_history(limit=limit, offset=offset)
        return HistoryResponse(items=items)
        
    except Exception as e:
        logger.error(f"Failed to get history: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")

@router.get("/analysis/{analysis_id}")
async def get_analysis(analysis_id: str):
    """Get a specific analysis by ID."""
    try:
        analysis = analysis_service.get_analysis(analysis_id)
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return {"analysis": analysis}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get analysis {analysis_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve analysis: {str(e)}")

@router.delete("/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """Delete an analysis."""
    try:
        success = analysis_service.delete_analysis(analysis_id)
        if not success:
            raise HTTPException(status_code=404, detail="Analysis not found")
        return {"message": "Analysis deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete analysis {analysis_id}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete analysis: {str(e)}")

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    try:
        import time
        start_time = time.time()
        
        # Basic health checks
        stats = analysis_service.get_system_stats()
        
        # Calculate uptime (simplified)
        uptime_sec = int(time.time() - start_time + 1000)  # Mock uptime for demo
        
        return HealthResponse(
            status="ok",
            uptime_sec=uptime_sec
        )
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="error",
            uptime_sec=0
        )

@router.get("/stats")
async def get_system_stats():
    """Get system statistics."""
    try:
        stats = analysis_service.get_system_stats()
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get system stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve system stats: {str(e)}")

@router.post("/reset")
async def reset_system():
    """Reset system data (for testing)."""
    try:
        success = analysis_service.clear_data()
        if success:
            return {"message": "System data cleared successfully"}
        else:
            raise HTTPException(status_code=500, detail="Failed to clear system data")
            
    except Exception as e:
        logger.error(f"System reset failed: {e}")
        raise HTTPException(status_code=500, detail=f"System reset failed: {str(e)}")
