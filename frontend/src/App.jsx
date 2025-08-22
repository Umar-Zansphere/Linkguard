import { useState } from "react";
import { 
  Search, 
  RotateCcw, 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileLock, 
  ScanText, 
  Hash, 
  ExternalLink,
  ChevronDown
} from "lucide-react";

// Helper to format keys into readable labels
const formatLabel = (key) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

// Background Grid Component
function BackgroundGrid() {
  return (
    <div className="absolute inset-0 z-0 opacity-100">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-900" />
    </div>
  );
}

// Scanning Animation Component
function ScanningAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative w-24 h-24">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
        {/* Middle ring */}
        <div className="absolute inset-2 border-4 border-purple-500/40 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        {/* Inner ring */}
        <div className="absolute inset-4 border-4 border-cyan-400/60 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
        {/* Core dot */}
        <div className="absolute inset-8 bg-cyan-400 rounded-full animate-pulse" />
      </div>
      <h3 className="text-xl font-semibold text-cyan-300 tracking-widest">ANALYZING...</h3>
      <p className="text-gray-400">Executing deep cybernetic scan...</p>
    </div>
  );
}

// Risk Gauge Component
function RiskGauge({ score = 0 }) {
  const getColor = (score) => {
    if (score >= 70) return "#ef4444"; // red
    if (score >= 30) return "#facc15"; // yellow
    return "#4ade80"; // green
  };

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
        {/* Background Circle */}
        <circle
          cx="75" 
          cy="75" 
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
        />
        {/* Progress Circle */}
        <circle
          cx="75" 
          cy="75" 
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          style={{
            transition: 'stroke-dashoffset 1s ease-out'
          }}
        />
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center text-4xl font-bold"
        style={{ color }}
      >
        {score}
      </div>
    </div>
  );
}

// Detail Card Component
function DetailCard({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
      <button
        className="flex items-center justify-between w-full text-lg hover:text-cyan-300 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 text-cyan-300">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div 
          className="transform transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        >
          <ChevronDown size={24} />
        </div>
      </button>
      {isOpen && (
        <div className="mt-4 space-y-2">
          {children}
        </div>
      )}
    </div>
  );
}

// Detail Item Component
function DetailItem({ label, value, isLink = false }) {
  if (value === null || typeof value === 'undefined') return null;

  const renderValue = () => {
    if (typeof value === 'boolean') {
      return value ? 
        <CheckCircle className="text-green-400" size={20} /> : 
        <XCircle className="text-red-400" size={20} />;
    }
    if (isLink) {
      return (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-cyan-400 hover:underline flex items-center gap-1"
        >
          View Report <ExternalLink size={14} />
        </a>
      );
    }
    if (typeof value === 'string' && (value.includes('malicious') || value.includes('suspicious'))) {
      return (
        <span className="text-red-400 font-semibold flex items-center gap-2">
          <AlertTriangle size={16} /> {formatLabel(value)}
        </span>
      );
    }
    if (typeof value === 'string' && value.includes('clean')) {
      return (
        <span className="text-green-400 font-semibold flex items-center gap-2">
          <CheckCircle size={16} /> {formatLabel(value)}
        </span>
      );
    }
    return <span className="text-white font-mono text-sm">{String(value)}</span>;
  };

  return (
    <div className="flex justify-between items-center text-sm py-2 border-b border-white/10 last:border-b-0">
      <span className="text-gray-400">{label}</span>
      <div className="ml-4">
        {renderValue()}
      </div>
    </div>
  );
}

// Result Display Component
function ResultDisplay({ result }) {
  const { verdict, risk_score, details } = result;
  const cleanVerdict = verdict.replace(/[^a-zA-Z\s]/g, '').trim();

  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-500">
      {/* Main Verdict & Gauge */}
      <div className="text-center mb-8">
        <RiskGauge score={risk_score} />
        <h2 className="text-3xl font-bold mt-4 text-white">{cleanVerdict}</h2>
        <p className="text-gray-400 break-all mt-2 text-sm">Analysis for: {result.url}</p>
        {details.final_url !== result.url && (
          <p className="text-cyan-400 text-sm break-all mt-1">Redirected to: {details.final_url}</p>
        )}
      </div>

      {/* Detail Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailCard title="Reputation" icon={<Shield size={20} />}>
          <DetailItem label="Google Safe Browsing" value={details.google_safe_browsing} />
          <DetailItem label="VirusTotal" value={details.virustotal} />
          {details.abuseipdb && <DetailItem label="AbuseIPDB Score" value={details.abuseipdb.abuse_confidence_score} />}
          {details.urlscan?.result_url && <DetailItem label="UrlScan.io Report" value={details.urlscan.result_url} isLink />}
        </DetailCard>

        <DetailCard title="Domain & SSL" icon={<FileLock size={20} />}>
          <DetailItem label="IP Address" value={details.ip_address} />
          <DetailItem label="SSL Valid" value={details.ssl_valid} />
          {details.whois_info?.registrar && <DetailItem label="Registrar" value={details.whois_info.registrar} />}
          {details.whois_info?.creation_date && (
            <DetailItem 
              label="Domain Age" 
              value={new Date(details.whois_info.creation_date.split(' ')[0]).toLocaleDateString()} 
            />
          )}
          {details.ssl_info?.issuer?.commonName && (
            <DetailItem label="SSL Issuer" value={details.ssl_info.issuer.commonName} />
          )}
        </DetailCard>
        
        <DetailCard title="Content Analysis" icon={<ScanText size={20} />}>
          <DetailItem label="Reachable" value={details.is_reachable} />
          <DetailItem label="Has iFrame" value={details.page_content_analysis?.has_iframe} />
          <DetailItem label="Password Field in Form" value={details.page_content_analysis?.has_form_with_password} />
          <DetailItem label="External Links" value={details.page_content_analysis?.external_links} />
        </DetailCard>

        <DetailCard title="Lexical Analysis" icon={<Hash size={20} />}>
          <DetailItem label="URL Length" value={details.lexical_analysis?.url_length} />
          <DetailItem label="Hostname Length" value={details.lexical_analysis?.hostname_length} />
          <DetailItem label="Dot Count" value={details.lexical_analysis?.dot_count} />
          <DetailItem label="Has IP in Hostname" value={details.lexical_analysis?.has_ip_in_hostname} />
        </DetailCard>
      </div>
    </div>
  );
}

// Main Component
export default function LinkGuardian() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | scanning | success | error

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim() || status === "scanning") return;

    setStatus("scanning");
    setResult(null);
    setError(null);

    try {
      // Use your backend API endpoint
      const res = await fetch(`http://127.0.0.1:8000/api/check?url=${encodeURIComponent(url)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "An unknown server error occurred." }));
        throw new Error(errorData.detail || `Request failed with status ${res.status}`);
      }
      const data = await res.json();
      setResult(data);
      setStatus("success");
    } catch (err) {
      setError(err.message);
      setStatus("error");
      console.error(err);
    }
  };

  const handleReset = () => {
    setUrl("");
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 flex items-center justify-center">
      <div className="relative w-full max-w-6xl min-h-[600px] flex flex-col items-center justify-center p-8 bg-black/30 rounded-2xl shadow-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
        <BackgroundGrid />
        
        {/* Header */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 text-center z-10">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">
            LinkGuardian
          </h1>
          <p className="text-gray-400 text-sm mt-1">Cybernetic Link Analysis Protocol</p>
        </div>

        {/* Main Content */}
        <div className="w-full flex-grow flex items-center justify-center z-10 pt-20 pb-8">
          {status === "idle" && (
            <div className="w-full max-w-xl">
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste link here to initiate scan..."
                  className="w-full bg-white/5 border border-white/20 rounded-full py-4 pl-6 pr-20 text-lg text-gray-400 placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-400 transition-all backdrop-blur-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleScan(e)}
                />
                <button
                  onClick={handleScan}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  disabled={!url.trim()}
                >
                  <Search size={24} />
                </button>
              </div>
            </div>
          )}

          {status === "scanning" && <ScanningAnimation />}

          {status === "success" && result && (
            <div className="w-full flex flex-col items-center">
              <ResultDisplay result={result} />
              <div className="text-center mt-8">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <RotateCcw size={16} /> Scan Another Link
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="w-full flex flex-col items-center">
              <div className="text-center p-8 bg-red-900/30 rounded-xl border border-red-500/50 max-w-lg backdrop-blur-sm">
                <h3 className="text-2xl font-bold text-red-400">Analysis Failed</h3>
                <p className="text-red-300 mt-2">{error}</p>
              </div>
              <div className="text-center mt-8">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors backdrop-blur-sm"
                >
                  <RotateCcw size={16} /> Try Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}