# services/ftp_analysis_service.py

import aioftp
import asyncio
from urllib.parse import urlparse
import httpx

from .base_service import BaseAnalysisService

class FTPAnalysisService(BaseAnalysisService):
    async def analyze(self, url: str) -> dict:
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname
        port = parsed_url.port or 21
        
        # Start with common checks
        ip_address = self._get_ip_address(hostname)
        whois_info, dns_whois_valid = self._check_dns_whois(hostname)
        lexical_analysis = self._perform_lexical_analysis(url)
        
        async with httpx.AsyncClient() as client:
            abuseipdb_result = await self._check_abuseipdb(client, ip_address)

        results = {
            "protocol": "ftp",
            "url": url,
            "ip_address": ip_address,
            "whois_info": whois_info,
            "dns_whois_valid": dns_whois_valid,
            "lexical_analysis": lexical_analysis,
            "abuseipdb": abuseipdb_result,
            "is_reachable": False,
            "anonymous_login_allowed": False,
            "welcome_message": None,
            "directory_listing_count": 0,
        }
        
        ftp_client = None
        try:
            async def perform_ftp_scan():
                nonlocal ftp_client
                
                ftp_client = aioftp.Client()
                await ftp_client.connect(hostname, port)
                
                results["is_reachable"] = True
                results["welcome_message"] = getattr(ftp_client, 'welcome_message', None)

                try:
                    await ftp_client.login()
                    results["anonymous_login_allowed"] = True
                    listing = await ftp_client.list()
                    results["directory_listing_count"] = len(listing)
                except aioftp.errors.StatusCodeError:
                    results["anonymous_login_allowed"] = False

            await asyncio.wait_for(perform_ftp_scan(), timeout=10.0)

        except (ConnectionRefusedError, asyncio.TimeoutError, aioftp.errors.AIOFTPException, OSError):
            results["is_reachable"] = False
        
        finally:
            # --- THIS BLOCK IS THE FIX ---
            #
            # Old incorrect code:
            # if ftp_client is not None and not ftp_client.is_closing():
            #
            # New correct code:
            # We check if the client exists and use the '.is_connected' property,
            # which is the correct attribute in the aioftp library.
            if ftp_client and hasattr(ftp_client, 'is_connected') and ftp_client.is_connected:
                try:
                    await ftp_client.quit()
                except Exception:
                    # If quit fails, ensure the connection is closed.
                    await ftp_client.close()

        return results