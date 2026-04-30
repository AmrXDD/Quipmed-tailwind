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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="min-h-screen bg-navy-900"
    >
      {children}
    </motion.main>
  );
}
