import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function DetailCard({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(true);

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/5 p-4 rounded-xl border border-white/10"
    >
      <button
        className="flex items-center justify-between w-full text-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 text-cyan-300">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <motion.div animate={{ rotate: isOpen ? 0 : -90 }}>
          <ChevronDown size={24} />
        </motion.div>
      </button>
      {isOpen && (
        <motion.div
          className="mt-4 space-y-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}