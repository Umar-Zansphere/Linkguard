import HttpResult from "./results/HttpResult";
import FtpResult from "./results/FtpResult";
import SshResult from "./results/SshResult";

export default function ResultDisplay({ result }) {
  const { protocol } = result;

  switch (protocol) {
    case "http": return <HttpResult result={result} />;
    case "ftp": return <FtpResult result={result} />;
    case "ssh": return <SshResult result={result} />;
    default:
      return (
        <div className="text-center p-8 bg-yellow-900/30 rounded-xl border border-yellow-500/50">
          <h3 className="text-2xl font-bold text-yellow-400">Unsupported Result Type</h3>
          <p className="text-yellow-300 mt-2">The analysis returned an unknown protocol type: '{protocol}'</p>
        </div>
      );
  }
}