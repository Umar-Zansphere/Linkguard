import DetailCard from "../DetailCard";
import DetailItem from "../DetailItem";
import { Server } from "lucide-react";

export default function FtpResult({ result }) {
  const { verdict, details, input_string } = result;

  return (
    <div className="w-full max-w-lg text-center animate-in fade-in duration-500">
      <Server className="mx-auto text-cyan-300" size={64} />
      <h2 className="text-4xl font-bold mt-4">FTP Server Analysis</h2>
      <p className="text-gray-400 break-all mt-2">Analysis for: {input_string}</p>
      <div className="mt-8 text-left">
        <DetailCard title="FTP Analysis Details" icon={<Server size={20}/>}>
          <DetailItem label="Verdict" value={verdict} />
          <DetailItem label="Reachable" value={details.is_reachable} />
          <DetailItem label="Anonymous Login" value={details.anonymous_login_allowed} />
          <DetailItem label="Welcome Message" value={details.welcome_message} />
          <DetailItem label="Root File Count" value={details.directory_listing_count} />
          <DetailItem label="Domain Registrar" value={details.dns_whois_info?.registrar} />
        </DetailCard>
      </div>
    </div>
  );
}