# services/base_service.py

import socket
import whois
from urllib.parse import urlparse
import httpx

from ..core.exceptions import ServiceError
from ..core.config import settings

class BaseAnalysisService:
    """
    A base service providing common analysis functionalities for various protocols.
    """
    def _get_ip_address(self, hostname: str) -> str | None:
        """Resolves the IP address for a given hostname."""
        if not hostname:
            return None
        try:
            return socket.gethostbyname(hostname)
        except socket.gaierror:
            return None

    def _check_dns_whois(self, hostname: str) -> tuple[dict, bool]:
        """Performs a WHOIS lookup for the given hostname."""
        if not hostname:
            return {}, False
        try:
            w = whois.whois(hostname)
            if not w.creation_date:
                return {"error": "WHOIS data not found"}, False

            return {
                "registrar": w.registrar,
                "creation_date": w.creation_date,
                "expiration_date": w.expiration_date,
            }, True
        except Exception:
            return {"error": "WHOIS lookup failed"}, False

    def _perform_lexical_analysis(self, url: str) -> dict:
        """Analyzes the lexical characteristics of the URL string."""
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname or ""
        return {
            "url_length": len(url),
            "hostname_length": len(hostname),
            "dot_count": url.count('.'),
            "special_chars": sum(not c.isalnum() for c in url),
            "has_ip_in_hostname": any(char.isdigit() for char in hostname.split('.'))
        }

    async def _check_abuseipdb(self, client: httpx.AsyncClient, ip_address: str) -> dict | str:
        """Checks the IP address against the AbuseIPDB database."""
        if not settings.ABUSEIPDB_API_KEY:
            return "key_missing"
        if not ip_address:
            return {"error": "No IP address provided"}
            
        headers = {'Key': settings.ABUSEIPDB_API_KEY, 'Accept': 'application/json'}
        params = {'ipAddress': ip_address, 'maxAgeInDays': '90'}
        try:
            response = await client.get('https://api.abuseipdb.com/api/v2/check', headers=headers, params=params)
            response.raise_for_status()
            data = response.json().get('data', {})
            return {
                "abuse_confidence_score": data.get("abuseConfidenceScore", 0),
                "total_reports": data.get("totalReports", 0),
                "country_code": data.get("countryCode")
            }
        except (httpx.RequestError, KeyError):
            raise ServiceError("AbuseIPDB API request failed")