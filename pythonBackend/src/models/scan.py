from pydantic import BaseModel, Field
from typing import Optional, List, Dict

class AnalysisResult(BaseModel):
    # Basic Checks
    protocol_valid: bool
    syntax_valid: bool
    is_reachable: bool
    final_url: str
    redirect_count: int

    # Reputation Checks
    google_safe_browsing: str
    virustotal: str
    abuseipdb: Optional[Dict] = None
    urlscan: Optional[Dict] = None

    # Deeper Analysis
    ip_address: Optional[str] = None
    dns_whois_valid: bool
    whois_info: Optional[Dict] = None
    ssl_valid: bool
    ssl_info: Optional[Dict] = None
    
    # Content Analysis
    page_content_analysis: Optional[Dict] = None
    
    # Lexical Analysis
    lexical_analysis: Optional[Dict] = None


class ScanResponse(BaseModel):
    url: str
    verdict: str
    risk_score: int
    details: AnalysisResult