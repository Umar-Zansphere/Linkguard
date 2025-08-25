import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function DetailCard({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
      <button
        className="flex items-center justify-between w-full text-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 text-cyan-300">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown size={24} />
        </div>
      </button>
      {isOpen && <div className="mt-4 space-y-2">{children}</div>}
    </div>
  );
}