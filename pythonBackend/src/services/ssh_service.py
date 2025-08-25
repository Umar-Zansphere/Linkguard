import asyncssh
import asyncio
from urllib.parse import urlparse
import whois


class SSHAnalysisService:
    async def analyze(self, url: str) -> dict:
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname
        port = parsed_url.port or 22

        results = {
            "is_reachable": False,
            "server_banner": None,
            "host_key_type": None,
            "host_key_fingerprint": None,
            "dns_whois_info": None,
        }

        try:
            # Connect to the SSH server to grab its banner and host key
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

        results["dns_whois_info"] = await asyncio.to_thread(self._get_dns_whois, hostname)

        return results

    def _get_dns_whois(self, hostname):
        try:
            w = whois.whois(hostname)
            return {"registrar": w.registrar, "creation_date": str(w.creation_date)}
        except Exception:
            return {"error": "WHOIS lookup failed"}
