"use client";

import { motion } from "framer-motion";

export function BeamEffect() {
  return (
    <div className="beam-container pointer-events-none fixed inset-0 overflow-hidden">
      {/* Brilho radial superior para profundidade */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#22c55e15,transparent_70%)]" />

      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "100%", opacity: [0, 0.3, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "linear",
        }}
        className="via-brand-green absolute top-0 h-[2px] w-full bg-gradient-to-r from-transparent to-transparent"
      />
    </div>
  );
}
