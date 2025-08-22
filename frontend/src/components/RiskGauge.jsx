import { motion } from "framer-motion";

const getColor = (score) => {
  if (score >= 70) return "#ef4444"; // red-500
  if (score >= 30) return "#facc15"; // yellow-400
  return "#4ade80"; // green-400
};

export default function RiskGauge({ score = 0 }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (score / 100) * circumference;
  const color = getColor(score);

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full" viewBox="0 0 150 150">
        {/* Background Circle */}
        <circle
          cx="75" cy="75" r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="10"
        />
        {/* Progress Circle */}
        <motion.circle
          cx="75" cy="75" r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          transform="rotate(-90 75 75)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-4xl font-bold"
        style={{ color }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        {score}
      </motion.div>
    </div>
  );
}