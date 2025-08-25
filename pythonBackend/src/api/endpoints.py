from fastapi import APIRouter, Query, HTTPException
from urllib.parse import urlparse
from ..models.scan import ScanResponse
from ..services.http_service import URLAnalysisService as HTTPAnalysisService # Renamed for clarity
from ..services.scoring_service import ScoringService
from ..services.ftp_service import FTPAnalysisService
from ..services.ssh_service import SSHAnalysisService
from ..utils.parser import extract_url_from_curl

router = APIRouter()

# Instantiate all our services
http_service = HTTPAnalysisService()
scoring_service = ScoringService()
ftp_service = FTPAnalysisService()
ssh_service = SSHAnalysisService()

@router.get("/check", response_model=ScanResponse, summary="Analyze a URL, FTP, SSH, or curl link")
async def check_link(link: str = Query(..., description="The link to analyze (e.g., http://a.com, ftp://b.com, ssh://c.com, or a 'curl ...' command)")):
    
    input_string = link
    
    # 1. Check if the input is a curl command
    if link.strip().lower().startswith("curl"):
        extracted_url = extract_url_from_curl(link)
        if not extracted_url:
            raise HTTPException(status_code=400, detail="Could not extract a valid URL from the provided curl command.")
        link = extracted_url # The extracted URL is now the target for analysis

    # 2. Determine the protocol and dispatch to the correct service
    try:
        parsed_url = urlparse(link)
        protocol = parsed_url.scheme
        
        if protocol in ["http", "https"]:
            analysis_details = await http_service.analyze_url(link)
            risk_score, verdict = scoring_service.calculate_risk(analysis_details)
            return ScanResponse(
                input_string=input_string,
                protocol="http",
                verdict=verdict,
                risk_score=risk_score,
                details=analysis_details
            )

        elif protocol == "ftp":
            analysis_details = await ftp_service.analyze(link)
            verdict = "⚠️ Suspicious" if analysis_details["anonymous_login_allowed"] else "ℹ️ Informational"
            return ScanResponse(
                input_string=input_string,
                protocol="ftp",
                verdict=verdict,
                details=analysis_details
            )

        elif protocol == "ssh":
            analysis_details = await ssh_service.analyze(link)
            verdict = "ℹ️ Informational"
            return ScanResponse(
                input_string=input_string,
                protocol="ssh",
                verdict=verdict,
                details=analysis_details
            )

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported protocol: '{protocol}'. Supported protocols are http, https, ftp, ssh.")

    except Exception as e:
        # General error handler
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")