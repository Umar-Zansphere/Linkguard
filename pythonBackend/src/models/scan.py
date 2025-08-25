from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Union

# Rename the old AnalysisResult to be specific to HTTP
class HTTPAnalysisResult(BaseModel):
    protocol_valid: bool
    syntax_valid: bool
    is_reachable: bool
    final_url: str
    redirect_count: int
    google_safe_browsing: str
    virustotal: str
    abuseipdb: Optional[Dict] = None
    urlscan: Optional[Dict] = None
    ip_address: Optional[str] = None
    dns_whois_valid: bool
    whois_info: Optional[Dict] = None
    ssl_valid: bool
    ssl_info: Optional[Dict] = None
    page_content_analysis: Optional[Dict] = None
    lexical_analysis: Optional[Dict] = None

class FTPAnalysisResult(BaseModel):
    is_reachable: bool
    anonymous_login_allowed: bool
    welcome_message: Optional[str] = None
    directory_listing_count: int
    dns_whois_info: Optional[Dict] = None

class SSHAnalysisResult(BaseModel):
    is_reachable: bool
    server_banner: Optional[str] = None
    host_key_type: Optional[str] = None
    host_key_fingerprint: Optional[str] = None
    dns_whois_info: Optional[Dict] = None

# The main response can now contain any of our detail models
class ScanResponse(BaseModel):
    input_string: str
    protocol: str
    verdict: str
    risk_score: Optional[int] = None # Risk score is optional now
    details: Union[HTTPAnalysisResult, FTPAnalysisResult, SSHAnalysisResult]