const getColor = (score) => {
  if (score >= 70) return "#ef4444"; // red
  if (score >= 30) return "#facc15"; // yellow
  return "#4ade80"; // green
};

export default function RiskGauge({ score = 0 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={radius} fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="8" />
        <circle
          cx="75" cy="75" r={radius} fill="none" stroke={color}
          strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference}
          style={{ strokeDashoffset: progress, transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-4xl font-bold" style={{ color }}>
        {score}
      </div>
    </div>
  );
}