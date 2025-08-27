# services/ssh_analysis_service.py

import asyncssh
import asyncio
from urllib.parse import urlparse
import httpx

from .base_service import BaseAnalysisService

class SSHAnalysisService(BaseAnalysisService):
    async def analyze(self, url: str) -> dict:
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname
        port = parsed_url.port or 22

        # Start with common checks
        ip_address = self._get_ip_address(hostname)
        whois_info, dns_whois_valid = self._check_dns_whois(hostname)
        lexical_analysis = self._perform_lexical_analysis(url)

        async with httpx.AsyncClient() as client:
            abuseipdb_result = await self._check_abuseipdb(client, ip_address)

        results = {
            "protocol": "ssh",
            "url": url,
            "ip_address": ip_address,
            "whois_info": whois_info,
            "dns_whois_valid": dns_whois_valid,
            "lexical_analysis": lexical_analysis,
            "abuseipdb": abuseipdb_result,
            "is_reachable": False,
            "server_banner": None,
            "host_key_type": None,
            "host_key_fingerprint": None,
        }

        try:
            conn = await asyncio.wait_for(
                asyncssh.connect(hostname, port, known_hosts=None),
                timeout=5
            )
            results["is_reachable"] = True

            banner = conn.get_extra_info('banner', '')
            results["server_banner"] = banner.decode() if isinstance(banner, bytes) else banner

            server_host_key = conn.get_extra_info('server_host_key')
            if server_host_key:
                results["host_key_type"] = server_host_key.get_name()
                results["host_key_fingerprint"] = server_host_key.get_fingerprint()

            conn.close()

        except (ConnectionRefusedError, asyncio.TimeoutError, asyncssh.Error):
            results["is_reachable"] = False

        return results