import { useState, useEffect } from "react";
import { Search, RotateCcw } from "lucide-react";
// Assuming your other components are in the same folder or a subfolder
import BackgroundGrid from "./BackgroundGrid";
import ScanningAnimation from "./ScanningAnimation";
import ResultDisplay from "./ResultDisplay";

export default function LinkGuardian() {
  const [linkInput, setLinkInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("idle");

  // This hook listens for URLs passed from the extension's context menu
  useEffect(() => {
    if (window.chrome && chrome.storage) {
      chrome.storage.local.get(['urlToScan'], (data) => {
        if (data.urlToScan) {
          setLinkInput(data.urlToScan);
          handleScan(null, data.urlToScan); // Automatically trigger the scan
          chrome.storage.local.remove('urlToScan'); // Clean up the stored URL
        }
      });
    }
  }, []); // The empty array ensures this runs only once when the component mounts

  const handleScan = async (e, directLink = null) => {
    if (e) e.preventDefault();
    const targetLink = directLink || linkInput;
    if (!targetLink.trim() || status === "scanning") return;

    setStatus("scanning");
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/check?link=${encodeURIComponent(targetLink)}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ detail: "An unknown server error" }));
        throw new Error(errorData.detail);
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
    setLinkInput("");
    setResult(null);
    setError(null);
    setStatus("idle");
  };

  // --- CSS CLASSES MODIFIED FOR POPUP VIEW ---
  return (
    // This outer div now fills the 600x650 container from index.html
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center font-sans text-white">
      {/* This div allows for scrolling if content overflows */}
      <div className="relative w-full h-full flex flex-col items-center justify-start p-6 bg-black/30 overflow-y-auto">
        <BackgroundGrid />
        
        {/* Header with reduced padding */}
        <div className="text-center z-10 pt-4 pb-6">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-purple-400">LinkGuardian</h1>
          <p className="text-gray-400 text-sm mt-1">Cybernetic Link Analysis Protocol</p>
        </div>

        {/* Main content area */}
        <div className="w-full flex-grow flex items-center justify-center z-10">
          {status === "idle" && (
            <form onSubmit={handleScan} className="w-full max-w-xl animate-in fade-in duration-500">
              <div className="relative">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  placeholder="Paste any link or curl command..."
                  className="w-full bg-white/5 border border-white/20 rounded-full py-4 pl-6 pr-20 text-lg text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 disabled:opacity-50"
                  disabled={!linkInput.trim()}
                >
                  <Search size={24} />
                </button>
              </div>
            </form>
          )}

          {status === "scanning" && <ScanningAnimation />}

          {status === "success" && result && (
            <div className="w-full flex flex-col items-center">
              <ResultDisplay result={result} />
              <div className="text-center mt-6 mb-4">
                <button onClick={handleReset} className="flex items-center gap-2 mx-auto px-6 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20">
                  <RotateCcw size={16} /> Scan Another
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
             <div className="w-full flex flex-col items-center animate-in fade-in duration-500">
               <div className="text-center p-6 bg-red-900/30 rounded-xl border border-red-500/50 max-w-lg">
                 <h3 className="text-xl font-bold text-red-400">Analysis Failed</h3>
                 <p className="text-red-300 mt-2 text-sm">{error}</p>
               </div>
               <div className="text-center mt-6">
                 <button onClick={handleReset} className="flex items-center gap-2 mx-auto px-6 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20">
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