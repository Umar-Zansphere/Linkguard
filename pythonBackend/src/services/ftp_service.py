import aioftp
import asyncio
from urllib.parse import urlparse
import whois

class FTPAnalysisService:
    async def analyze(self, url: str) -> dict:
        parsed_url = urlparse(url)
        hostname = parsed_url.hostname
        port = parsed_url.port or 21
        
        results = {
            "is_reachable": False,
            "anonymous_login_allowed": False,
            "welcome_message": None,
            "directory_listing_count": 0,
            "dns_whois_info": None,
        }
        
        client = None
        try:
            async def perform_ftp_scan():
                nonlocal client
                
                client = aioftp.Client()
                await client.connect(hostname, port)
                
                results["is_reachable"] = True
                # Get welcome message after successful connection
                results["welcome_message"] = getattr(client, 'welcome_message', None)

                try:
                    await client.login()
                    results["anonymous_login_allowed"] = True
                    listing = await client.list()
                    results["directory_listing_count"] = len(listing)
                except aioftp.errors.StatusCodeError:
                    results["anonymous_login_allowed"] = False

            await asyncio.wait_for(perform_ftp_scan(), timeout=10.0)

        except (ConnectionRefusedError, asyncio.TimeoutError, aioftp.errors.AIOFTPException, OSError) as e:
            results["is_reachable"] = False
            print(f"FTP connection error: {e}")  # For debugging
        
        finally:
            # Proper cleanup - check if client exists and is connected
            if client is not None:
                try:
                    # Check if the client has an active connection
                    if hasattr(client, 'command_connection') and client.command_connection is not None:
                        if not client.command_connection.is_closing():
                            await client.quit()
                    elif hasattr(client, 'path_io') and client.path_io is not None:
                        # Alternative check for older versions
                        await client.quit()
                except Exception as cleanup_error:
                    # If quit fails, just close the connection forcefully
                    print(f"Cleanup error: {cleanup_error}")
                    try:
                        if hasattr(client, 'close'):
                            await client.close()
                    except Exception:
                        pass  # Ignore cleanup errors

        # Get WHOIS info regardless of FTP connection status
        results["dns_whois_info"] = await asyncio.to_thread(self._get_dns_whois, hostname)

        return results

    def _get_dns_whois(self, hostname):
        try:
            w = whois.whois(hostname)
            if not w.creation_date:
                return {"error": "WHOIS data not found"}
            return {"registrar": w.registrar, "creation_date": str(w.creation_date)}
        except Exception as e:
            return {"error": f"WHOIS lookup failed: {str(e)}"}