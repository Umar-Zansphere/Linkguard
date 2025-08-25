export default function ScanningAnimation() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-spin" style={{ animationDuration: '3s' }} />
        <div className="absolute inset-2 border-4 border-purple-500/40 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
        <div className="absolute inset-4 border-4 border-cyan-400/60 rounded-full animate-spin" style={{ animationDuration: '1s' }} />
        <div className="absolute inset-8 bg-cyan-400 rounded-full animate-pulse" />
      </div>
      <h3 className="text-xl font-semibold text-cyan-300 tracking-widest">ANALYZING...</h3>
      <p className="text-gray-400">Executing deep cybernetic scan...</p>
    </div>
  );
}