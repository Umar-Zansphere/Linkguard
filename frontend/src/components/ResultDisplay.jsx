import { motion } from "framer-motion";
import RiskGauge from "./RiskGauge";
import DetailCard from "./DetailCard";
import { 
  Shield, CheckCircle, XCircle, AlertTriangle, Globe, Server, Clock, Calendar, 
  FileLock, Fingerprint, Code, Link as LinkIcon, ScanText, ExternalLink, Hash
} from "lucide-react";

// Helper to format keys into readable labels
const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function ResultDisplay({ result }) {
  const { verdict, risk_score, details } = result;

  // Remove emoji from verdict string
  const cleanVerdict = verdict.replace(/[^a-zA-Z\s]/g, '').trim();

  return (
    <motion.div
      className="w-full max-w-3xl"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.2 }
        }
      }}
    >
      {/* Main Verdict & Gauge */}
      <motion.div className="text-center" variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
        <RiskGauge score={risk_score} />
        <h2 className="text-4xl font-bold mt-4">{cleanVerdict}</h2>
        <p className="text-gray-400 break-all mt-2">Analysis for: {result.url}</p>
        {details.final_url !== result.url && (
            <p className="text-cyan-400 text-sm break-all">Redirected to: {details.final_url}</p>
        )}
      </motion.div>

      {/* Detail Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <DetailCard title="Reputation" icon={<Shield />}>
          <DetailItem label="Google Safe Browsing" value={details.google_safe_browsing} />
          <DetailItem label="VirusTotal" value={details.virustotal} />
          {details.abuseipdb && <DetailItem label="AbuseIPDB Score" value={details.abuseipdb.abuse_confidence_score} />}
          {details.urlscan?.result_url && <DetailItem label="UrlScan.io Report" value={details.urlscan.result_url} isLink />}
        </DetailCard>

        <DetailCard title="Domain & SSL" icon={<FileLock />}>
          <DetailItem label="IP Address" value={details.ip_address} />
          <DetailItem label="SSL Valid" value={details.ssl_valid} />
          {details.whois_info?.registrar && <DetailItem label="Registrar" value={details.whois_info.registrar} />}
          {details.whois_info?.creation_date && <DetailItem label="Domain Age" value={new Date(details.whois_info.creation_date.split(' ')[0]).toLocaleDateString()} />}
          {details.ssl_info?.issuer?.commonName && <DetailItem label="SSL Issuer" value={details.ssl_info.issuer.commonName} />}
        </DetailCard>
        
        <DetailCard title="Content Analysis" icon={<ScanText />}>
          <DetailItem label="Reachable" value={details.is_reachable} />
          <DetailItem label="Has iFrame" value={details.page_content_analysis?.has_iframe} />
          <DetailItem label="Password Field in Form" value={details.page_content_analysis?.has_form_with_password} />
          <DetailItem label="External Links" value={details.page_content_analysis?.external_links} />
        </DetailCard>

        <DetailCard title="Lexical Analysis" icon={<Hash />}>
          <DetailItem label="URL Length" value={details.lexical_analysis?.url_length} />
          <DetailItem label="Hostname Length" value={details.lexical_analysis?.hostname_length} />
          <DetailItem label="Dot Count" value={details.lexical_analysis?.dot_count} />
          <DetailItem label="Has IP in Hostname" value={details.lexical_analysis?.has_ip_in_hostname} />
        </DetailCard>
      </div>
    </motion.div>
  );
}

// Sub-component for rendering individual details
const DetailItem = ({ label, value, isLink = false }) => {
  if (value === null || typeof value === 'undefined') return null;

  const renderValue = () => {
    if (typeof value === 'boolean') {
      return value ? <CheckCircle className="text-green-400" size={20} /> : <XCircle className="text-red-400" size={20} />;
    }
    if (isLink) {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
          View Report <ExternalLink size={14} />
        </a>
      );
    }
    if (typeof value === 'string' && (value.includes('malicious') || value.includes('suspicious'))) {
      return <span className="text-red-400 font-semibold flex items-center gap-2"><AlertTriangle size={16} /> {formatLabel(value)}</span>;
    }
     if (typeof value === 'string' && value.includes('clean')) {
      return <span className="text-green-400 font-semibold flex items-center gap-2"><CheckCircle size={16} /> {formatLabel(value)}</span>;
    }
    return <span className="text-white font-mono">{String(value)}</span>;
  };

  return (
    <div className="flex justify-between items-center text-sm py-2 border-b border-white/10">
      <span className="text-gray-400">{label}</span>
      {renderValue()}
    </div>
  );
};