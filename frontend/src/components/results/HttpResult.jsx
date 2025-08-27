import RiskGauge from "../RiskGauge";
import DetailCard from "../DetailCard";
import DetailItem from "../DetailItem";
import { Shield, FileLock, ScanText, Hash } from "lucide-react";

export default function HttpResult({ result }) {
  const { verdict, risk_score, details, input_string } = result;
  const cleanVerdict = verdict.replace(/[^a-zA-Z\s]/g, '').trim();
  const isCurl = input_string.trim().toLowerCase().startsWith("curl");

  // Reusable date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-500">
      <div className="text-center mb-8">
        <RiskGauge score={risk_score} />
        <h2 className="text-3xl font-bold mt-4 text-white">{cleanVerdict}</h2>
        {isCurl ? (
          <p className="text-gray-400 break-all mt-2 text-sm">
            Analyzed URL from command: <span className="text-cyan-400">{details.final_url}</span>
          </p>
        ) : (
          <p className="text-gray-400 break-all mt-2 text-sm">Analysis for: {input_string}</p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailCard title="Reputation" icon={<Shield size={20} />}>
          <DetailItem label="Google Safe Browsing" value={details.google_safe_browsing} />
          <DetailItem label="VirusTotal" value={details.virustotal} />
          {details.abuseipdb && <DetailItem label="AbuseIPDB Score" value={`${details.abuseipdb.abuse_confidence_score}%`} />}
          {details.urlscan?.result_url && <DetailItem label="UrlScan.io Report" value={details.urlscan.result_url} isLink />}
        </DetailCard>

        <DetailCard title="Domain & SSL" icon={<FileLock size={20} />}>
          <DetailItem label="IP Address" value={details.ip_address} />
          <DetailItem label="SSL Valid" value={details.ssl_valid} />
          {details.whois_info?.registrar && <DetailItem label="Registrar" value={details.whois_info.registrar} />}
          {/* UPDATED: Using the robust formatDate function */}
          {details.whois_info?.creation_date && <DetailItem label="Domain Creation" value={formatDate(details.whois_info.creation_date)} />}
        </DetailCard>
        
        <DetailCard title="Content Analysis" icon={<ScanText size={20} />}>
          <DetailItem label="Reachable" value={details.is_reachable} />
          <DetailItem label="Has iFrame" value={details.page_content_analysis?.has_iframe} />
          <DetailItem label="Password Field in Form" value={details.page_content_analysis?.has_form_with_password} />
        </DetailCard>

        <DetailCard title="Lexical Analysis" icon={<Hash size={20} />}>
          <DetailItem label="URL Length" value={details.lexical_analysis?.url_length} />
          <DetailItem label="Dot Count" value={details.lexical_analysis?.dot_count} />
        </DetailCard>
      </div>
    </div>
  );
}