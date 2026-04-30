"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export const MotionFadeIn = ({ children }: { children: ReactNode }) => (
  <motion.div
    className="flex min-h-full w-full flex-col items-center justify-center"
    initial={{ opacity: 0, scale: 0.95, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);
