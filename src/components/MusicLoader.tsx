import { motion } from "framer-motion";
import { Music2 } from "lucide-react";

export function MusicLoader() {
  return (
    <div className="relative flex items-center justify-center">
      {/* Glow */}
      <div className="absolute h-16 w-16 rounded-full bg-brand-green/20 blur-xl" />

      {/* Spinner externo */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
        className="absolute h-20 w-20 rounded-full border-2 border-brand-green border-t-transparent"
      />

      {/* Spinner interno (contra-rotação) */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
        className="absolute h-12 w-12 rounded-full border border-white/20 border-b-transparent"
      />

      {/* Ícone */}
      <Music2 className="h-8 w-8 text-brand-green relative z-10" />
    </div>
  );
}