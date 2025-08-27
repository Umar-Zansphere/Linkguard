// src/components/results/FtpResult.js

import DetailCard from "../DetailCard";
import DetailItem from "../DetailItem";
import SharedAnalysisDetails from "./SharedAnalysisDetails"; // Import the new component
import RiskGauge from "../RiskGauge"; // Import RiskGauge for consistency
import { Server } from "lucide-react";

export default function FtpResult({ result }) {
  // Assuming the API response is now consistent: { verdict, risk_score, details, ... }
  const { verdict, risk_score, details, input_string } = result;
  const cleanVerdict = verdict.replace(/[^a-zA-Z\s]/g, '').trim();

  return (
    <div className="w-full max-w-4xl animate-in fade-in duration-500">
      {/* Consistent Header with Gauge */}
      <div className="text-center mb-8">
        <RiskGauge score={risk_score} />
        <h2 className="text-3xl font-bold mt-4 text-white">{cleanVerdict}</h2>
        <p className="text-gray-400 break-all mt-2 text-sm">Analysis for: {input_string}</p>
      </div>

      {/* Grid layout for consistency with HttpResult */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* FTP-Specific Details */}
        <DetailCard title="FTP Server Details" icon={<Server size={20}/>}>
          <DetailItem label="Reachable" value={details.is_reachable} />
          <DetailItem label="Anonymous Login" value={details.anonymous_login_allowed} />
          <DetailItem label="Welcome Message" value={details.welcome_message} />
          <DetailItem label="Root File Count" value={details.directory_listing_count} />
        </DetailCard>

        {/* Use the new shared component for common details */}
        <SharedAnalysisDetails details={details} />
      </div>
    </div>
  );
}