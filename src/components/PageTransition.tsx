import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Framer Motion wrapper used with AnimatePresence in App.tsx. A short
 * fade + subtle slide preserves spatial continuity between routes without
 * looking flashy.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
      className="min-h-screen"
    >
      {children}
    </motion.main>
  );
}
