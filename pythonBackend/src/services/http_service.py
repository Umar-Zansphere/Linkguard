# services/url_analysis_service.py

import httpx
import tldextract
import socket
import ssl
from datetime import datetime
from bs4 import BeautifulSoup
from urllib.parse import urlparse

from .base_service import BaseAnalysisService
from ..core.exceptions import ServiceError
from ..core.config import settings

class URLAnalysisService(BaseAnalysisService):
    async def analyze_url(self, url: str) -> dict:
        async with httpx.AsyncClient(timeout=10, follow_redirects=True) as client:
            # 1. HTTP-specific check
            final_url, redirect_count, is_reachable, response = await self._check_reachability(client, url)
            
            # 2. Extract components
            parsed_url = urlparse(final_url)
            hostname = parsed_url.hostname
            
            # 3. Run all checks (common and HTTP-specific)
            ip_address = self._get_ip_address(hostname)
            whois_info, dns_whois_valid = self._check_dns_whois(hostname)
            lexical_analysis = self._perform_lexical_analysis(final_url)
            abuseipdb_result = await self._check_abuseipdb(client, ip_address) if ip_address else None

            # HTTP-specific checks
            ssl_info, ssl_valid = self._check_ssl(hostname)
            page_content_analysis = await self._analyze_page_content(response)
            safe_browsing_result = await self._check_safe_browsing(client, final_url)
            virustotal_result = await self._check_virustotal(client, final_url)
            urlscan_result = await self._submit_urlscan(client, final_url)

            return {
                "protocol": "http",
                "url": url,
                "final_url": final_url,
                "protocol_valid": final_url.startswith(("http://", "https://")),
                "syntax_valid": bool(tldextract.extract(final_url).domain),
                "is_reachable": is_reachable,
                "redirect_count": redirect_count,
                "ip_address": ip_address,
                "ssl_valid": ssl_valid,
                "ssl_info": ssl_info,
                "dns_whois_valid": dns_whois_valid,
                "whois_info": whois_info,
                "lexical_analysis": lexical_analysis,
                "page_content_analysis": page_content_analysis,
                "google_safe_browsing": safe_browsing_result,
                "virustotal": virustotal_result,
                "abuseipdb": abuseipdb_result,
                "urlscan": urlscan_result,
            }

    async def _check_reachability(self, client, url):
        try:
            head_resp = await client.head(url, timeout=5)
            # If HEAD is disallowed, try GET
            if head_resp.status_code >= 400:
                 response = await client.get(url, timeout=5)
            else:
                response = head_resp
            
            final_url = str(response.url)
            redirect_count = len(response.history)
            return final_url, redirect_count, True, response
        except httpx.RequestError:
            return url, 0, False, None

    def _check_ssl(self, hostname):
        if not hostname: return {}, False
        try:
            context = ssl.create_default_context()
            with socket.create_connection((hostname, 443), timeout=3) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    
                    cert_expires = datetime.strptime(cert['notAfter'], '%b %d %H:%M:%S %Y %Z')
                    if cert_expires < datetime.now():
                        return {"error": "Certificate expired"}, False
                    
                    return {
                        "issuer": dict(x[0] for x in cert.get('issuer', [])),
                        "subject": dict(x[0] for x in cert.get('subject', [])),
                        "expires": str(cert_expires)
                    }, True
        except Exception:
            return {"error": "SSL validation failed"}, False

    async def _analyze_page_content(self, response):
        if not response or not response.text:
            return None
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        return {
            "has_iframe": bool(soup.find_all('iframe')),
            "has_form_with_password": bool(soup.select('form input[type=password]')),
            "external_links": len([a['href'] for a in soup.find_all('a', href=True) if urlparse(a['href']).hostname]),
        }

    async def _check_safe_browsing(self, client, url):
        # ... (implementation unchanged)
        if not settings.GOOGLE_SAFE_BROWSING_API_KEY: return "key_missing"
        api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.GOOGLE_SAFE_BROWSING_API_KEY}"
        payload = {'client': {'clientId': 'linkguard', 'clientVersion': '1.0'},
                   'threatInfo': {'threatTypes': ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                                  'platformTypes': ["ANY_PLATFORM"],
                                  'threatEntryTypes': ["URL"],
                                  'threatEntries': [{'url': url}]}}
        try:
            resp = await client.post(api_url, json=payload)
            resp.raise_for_status()
            return "malicious" if resp.json().get("matches") else "clean"
        except httpx.RequestError:
            raise ServiceError("Google Safe Browsing API request failed")

    async def _check_virustotal(self, client, url):
        # ... (implementation unchanged)
        if not settings.VIRUSTOTAL_API_KEY: return "key_missing"
        headers = {"x-apikey": settings.VIRUSTOTAL_API_KEY}
        try:
            post_resp = await client.post("https://www.virustotal.com/api/v3/urls", data={"url": url}, headers=headers)
            post_resp.raise_for_status()
            analysis_id = post_resp.json()["data"]["id"]

            report_resp = await client.get(f"https://www.virustotal.com/api/v3/analyses/{analysis_id}", headers=headers)
            report_resp.raise_for_status()
            
            stats = report_resp.json()["data"]["attributes"]["stats"]

            if stats.get("malicious", 0) > 1: return "malicious"
            if stats.get("malicious", 0) > 0 or stats.get("suspicious", 0) > 0: return "suspicious"
            return "clean"

        except (httpx.RequestError, KeyError):
             raise ServiceError("VirusTotal API request failed")

    async def _submit_urlscan(self, client, url):
        # ... (implementation unchanged)
        if not settings.URLSCAN_API_KEY: return "key_missing"
        headers = {"API-Key": settings.URLSCAN_API_KEY, "Content-Type": "application/json"}
        payload = {"url": url, "visibility": "public"}
        try:
            resp = await client.post("https://urlscan.io/api/v1/scan/", headers=headers, json=payload)
            if resp.status_code == 200:
                return {"scan_id": resp.json().get("uuid"), "result_url": resp.json().get("result")}
            return {"error": f"Submission failed with status {resp.status_code}"}
        except httpx.RequestError:
            raise ServiceError("urlscan.io API request failed")