class ScoringService:
    def calculate_risk(self, analysis: dict) -> (int, str):
        score = 0
        
        # Basic checks
        if not analysis["is_reachable"]: score += 50
        if not analysis["protocol_valid"] or not analysis["syntax_valid"]: score += 70

        # Reputation
        if analysis["google_safe_browsing"] == "malicious": score += 100
        if analysis["virustotal"] == "malicious": score += 100
        if analysis["virustotal"] == "suspicious": score += 40

        if analysis.get("abuseipdb") and analysis["abuseipdb"]["abuse_confidence_score"] > 50:
            score += analysis["abuseipdb"]["abuse_confidence_score"]
        
        # SSL
        if not analysis["ssl_valid"]: score += 30

        # WHOIS - recent domains are riskier
        if analysis.get("whois_info", {}).get("creation_date"):
            try:
                creation_date = analysis["whois_info"]["creation_date"]
                if isinstance(creation_date, list): # handle list from whois
                    creation_date = creation_date[0]
                
                from datetime import datetime
                age = (datetime.now() - creation_date).days
                if age < 90: score += 40
                elif age < 365: score += 20
            except:
                pass

        # Content
        content = analysis.get("page_content_analysis")
        if content:
            if content["has_iframe"]: score += 20
            if content["has_form_with_password"] and not analysis["final_url"].startswith("https://"):
                score += 80

        # Lexical
        lex = analysis.get("lexical_analysis")
        if lex:
            if lex["url_length"] > 75: score += 15
            if lex["dot_count"] > 4: score += 20
        
        # Determine verdict
        if score >= 100:
            verdict = "❌ Malicious"
        elif score >= 70:
            verdict = "🚨 High Risk"
        elif score >= 30:
            verdict = "⚠️ Suspicious"
        else:
            verdict = "✅ Safe"
            
        return score, verdict