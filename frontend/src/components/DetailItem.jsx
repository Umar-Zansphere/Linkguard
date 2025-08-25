import { CheckCircle, XCircle, AlertTriangle, ExternalLink } from "lucide-react";

const formatLabel = (key) => {
  if (typeof key !== 'string') return key;
  return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function DetailItem({ label, value, isLink = false }) {
  if (value === null || typeof value === 'undefined' || value === '') return null;

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
    if (typeof value === 'string' && (value.includes('malicious') || value.includes('suspicious') || value.includes('Suspicious'))) {
      return <span className="text-yellow-400 font-semibold flex items-center gap-2"><AlertTriangle size={16} /> {formatLabel(value)}</span>;
    }
    if (typeof value === 'string' && (value.includes('clean') || value.includes('Safe') || value.includes('Informational'))) {
      return <span className="text-green-400 font-semibold flex items-center gap-2"><CheckCircle size={16} /> {formatLabel(value)}</span>;
    }
    return <span className="text-white font-mono break-all">{String(value)}</span>;
  };

  return (
    <div className="flex justify-between items-center text-sm py-2 border-b border-white/10 last:border-b-0">
      <span className="text-gray-400 mr-4">{label}</span>
      <div className="text-right">{renderValue()}</div>
    </div>
  );
}