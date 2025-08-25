import re
from typing import Optional

def extract_url_from_curl(command: str) -> Optional[str]:
    """
    Extracts the first HTTP/HTTPS URL from a curl command string.
    Handles various quote styles and common flags.
    """
    # This regex looks for http/https followed by non-space characters.
    # It's robust enough for most common curl commands.
    match = re.search(r"https?://[^\s'\"`]+", command)
    if match:
        return match.group(0)
    return None