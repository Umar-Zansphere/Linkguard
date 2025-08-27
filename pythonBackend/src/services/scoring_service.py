from datetime import datetime

class ScoringService:
    def calculate_risk(self, analysis: dict) -> tuple[int, str]:
        score = 0
        protocol = analysis.get("protocol")

        # --- SCORE CALCULATION (APPLIES TO ALL PROTOCOLS) ---

        if not analysis.get("is_reachable"): score += 50
        
        # Reputation Scores (common to all)
        abuseipdb_info = analysis.get("abuseipdb", {})
        if isinstance(abuseipdb_info, dict):
            confidence = abuseipdb_info.get("abuse_confidence_score", 0)
            if confidence > 80:
                score += 100 # High confidence is a strong signal
            elif confidence > 50:
                score += 50

        # WHOIS Age (common to all)
        whois_info = analysis.get("whois_info", {})
        if isinstance(whois_info, dict) and whois_info.get("creation_date"):
            try:
                creation_date = whois_info["creation_date"]
                if isinstance(creation_date, list):
                    creation_date = creation_date[0]
                
                # datetime objects are returned directly now
                age = (datetime.now() - creation_date).days
                if age < 90: score += 40
                elif age < 365: score += 20
            except (TypeError, ValueError):
                pass # Ignore parsing errors

        # --- HTTP-SPECIFIC SCORES ---
        if protocol == 'http':
            if not analysis.get("protocol_valid", True) or not analysis.get("syntax_valid", True): score += 70
            if analysis.get("google_safe_browsing") == "malicious": score += 100
            if analysis.get("virustotal") == "malicious": score += 100
            if analysis.get("virustotal") == "suspicious": score += 40
            if not analysis.get("ssl_valid", True): score += 30
            
            content = analysis.get("page_content_analysis")
            if content:
                if content.get("has_iframe"): score += 20
                if content.get("has_form_with_password") and not analysis.get("final_url", "").startswith("https://"):
                    score += 80

        # --- FTP-SPECIFIC SCORES ---
        if protocol == 'ftp':
            if analysis.get("anonymous_login_allowed"):
                # This is a risk factor, but not inherently malicious, so add a moderate score.
                score += 15

        # --- VERDICT DETERMINATION ---
        
        # Cap the score to a reasonable max
        score = min(score, 150) 
        
        verdict = ""
        if score >= 100:
            verdict = "❌ Malicious"
        elif score >= 70:
            verdict = "🚨 High Risk"
        elif score >= 30:
            verdict = "⚠️ Suspicious"
        else:
            # This is the crucial logic change
            if protocol in ['ftp', 'ssh']:
                verdict = "✅ Informational" # Low risk for FTP/SSH is informational
            else:
                verdict = "✅ Safe" # Low risk for HTTP is safe

        # Final risk score for the gauge (0-100)
        final_risk_score = min(score, 100)
            
        return final_risk_score, verdict