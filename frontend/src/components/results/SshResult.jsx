import DetailCard from "../DetailCard";
import DetailItem from "../DetailItem";
import { Terminal } from "lucide-react";

export default function SshResult({ result }) {
  const { verdict, details, input_string } = result;

  return (
    <div className="w-full max-w-lg text-center animate-in fade-in duration-500">
      <Terminal className="mx-auto text-cyan-300" size={64} />
      <h2 className="text-4xl font-bold mt-4">SSH Server Analysis</h2>
      <p className="text-gray-400 break-all mt-2">Analysis for: {input_string}</p>
      <div className="mt-8 text-left">
        <DetailCard title="SSH Analysis Details" icon={<Terminal size={20}/>}>
          <DetailItem label="Verdict" value={verdict} />
          <DetailItem label="Reachable" value={details.is_reachable} />
          <DetailItem label="Server Banner" value={details.server_banner} />
          <DetailItem label="Host Key Type" value={details.host_key_type} />
          <DetailItem label="Key Fingerprint" value={details.host_key_fingerprint} />
          <DetailItem label="Domain Registrar" value={details.dns_whois_info?.registrar} />
        </DetailCard>
      </div>
    </div>
  );
}