// src/components/results/SharedAnalysisDetails.js

import DetailCard from "../DetailCard";
import DetailItem from "../DetailItem";
import { FileLock, Hash, Shield } from "lucide-react";

// This component renders the analysis details that are common across different protocols.
export default function SharedAnalysisDetails({ details }) {
  if (!details) return null;

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      // Handles ISO strings from the new backend
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString; // Fallback for unexpected formats
    }
  };

  return (
    <>
      {/* Card for Domain, IP, and SSL Information */}
      <DetailCard title="Domain & IP" icon={<FileLock size={20} />}>
        <DetailItem label="IP Address" value={details.ip_address} />
        {/* The whois_info object is now consistent across all results */}
        {details.whois_info && (
          <>
            <DetailItem label="Registrar" value={details.whois_info.registrar} />
            <DetailItem label="Domain Creation" value={formatDate(details.whois_info.creation_date)} />
            <DetailItem label="Domain Expiration" value={formatDate(details.whois_info.expiration_date)} />
          </>
        )}
      </DetailCard>

      {/* Card for IP Reputation from AbuseIPDB */}
      {details.abuseipdb && details.abuseipdb.abuse_confidence_score !== undefined && (
        <DetailCard title="IP Reputation" icon={<Shield size={20} />}>
          <DetailItem label="AbuseIPDB Score" value={`${details.abuseipdb.abuse_confidence_score}%`} />
          <DetailItem label="Total Reports" value={details.abuseipdb.total_reports} />
          <DetailItem label="Country" value={details.abuseipdb.country_code} />
        </DetailCard>
      )}

      {/* Card for Lexical Analysis of the URL string */}
      {details.lexical_analysis && (
        <DetailCard title="Lexical Analysis" icon={<Hash size={20} />}>
          <DetailItem label="URL Length" value={details.lexical_analysis.url_length} />
          <DetailItem label="Hostname Length" value={details.lexical_analysis.hostname_length} />
          <DetailItem label="Dot Count" value={details.lexical_analysis.dot_count} />
        </DetailCard>
      )}
    </>
  );
}