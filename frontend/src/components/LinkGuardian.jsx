import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RotateCcw } from "lucide-react";
import ScanningAnimation from "./ScanningAnimation";
import ResultDisplay from "./ResultDisplay";
import BackgroundGrid from "./BackgroundGrid";

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
    <div className="relative w-full max-w-4xl min-h-[600px] flex flex-col items-center justify-center p-6 bg-black/30 rounded-2xl shadow-2xl border border-white/10 overflow-hidden my-8">
      <BackgroundGrid />
      <div className="absolute top-6 text-center z-10">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">
          LinkGuardian
        </h1>
        <p className="text-gray-400 text-sm mt-1">Cybernetic Link Analysis Protocol</p>
      </div>

      <div className="w-full flex-grow flex items-center justify-center z-10">
        <AnimatePresence mode="wait">
          {status === "idle" && (
            <motion.form
              key="idle"
              onSubmit={handleScan}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-xl"
            >
              <div className="relative">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Paste link here to initiate scan..."
                  className="w-full bg-white/5 border border-white/20 rounded-full py-4 pl-6 pr-20 text-lg placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-90 disabled:opacity-50 transition-opacity"
                  disabled={!url.trim()}
                >
                  <Search size={24} />
                </button>
              </div>
            </motion.form>
          )}

          {status === "scanning" && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <ScanningAnimation />
            </motion.div>
          )}

          {(status === "success" || status === "error") && (
            <motion.div
              key="result"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {status === "success" && <ResultDisplay result={result} />}
              {status === "error" && (
                 <div className="text-center p-8 bg-red-900/30 rounded-xl border border-red-500/50 max-w-lg">
                  <h3 className="text-2xl font-bold text-red-400">Analysis Failed</h3>
                  <p className="text-red-300 mt-2">{error}</p>
                </div>
              )}
              <div className="text-center mt-8">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 mx-auto px-6 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-colors"
                >
                  <RotateCcw size={16} /> Scan Another Link
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}