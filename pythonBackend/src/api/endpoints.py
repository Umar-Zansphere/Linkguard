from fastapi import APIRouter, Query, HTTPException
from ..services.analysis_service import URLAnalysisService
from ..services.scoring_service import ScoringService
from ..models.scan import ScanResponse

router = APIRouter()
analysis_service = URLAnalysisService()
scoring_service = ScoringService()

@router.get("/check", response_model=ScanResponse)
async def check_url(url: str = Query(..., description="URL to validate")):
    try:
        analysis_details = await analysis_service.analyze_url(url)
        risk_score, verdict = scoring_service.calculate_risk(analysis_details)
        
        return {
            "url": url,
            "verdict": verdict,
            "risk_score": risk_score,
            "details": analysis_details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))