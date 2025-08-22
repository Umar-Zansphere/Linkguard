import { motion } from "framer-motion";

export default function ScanningAnimation() {
  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i) => ({
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay: i * 0.1, type: "spring", duration: 1.5, bounce: 0 },
        opacity: { delay: i * 0.1, duration: 0.01 },
      },
    }),
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center">
      <motion.svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        initial="hidden"
        animate="visible"
      >
        {/* Animated concentric circles */}
        {[10, 20, 30].map((radius, i) => (
          <motion.circle
            key={radius}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="rgba(0, 255, 255, 0.5)"
            strokeWidth="2"
            variants={lineVariants}
            custom={i}
          />
        ))}
        {/* Pulsing core */}
        <motion.circle
          cx="50"
          cy="50"
          r="5"
          fill="rgba(0, 255, 255, 1)"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.svg>
      <h3 className="text-xl font-semibold text-cyan-300 tracking-widest">ANALYZING...</h3>
      <p className="text-gray-400">Executing deep cybernetic scan...</p>
    </div>
  );
}