import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface FloatingTagProps {
  icon: ReactNode;
  label: string;
  className?: string;
  /** Delay before the tag fades in (seconds). */
  delay?: number;
  /** Floating bob amplitude. */
  bob?: number;
  /** Floating bob duration. */
  bobDuration?: number;
}

/**
 * Small rounded-rectangle informational tag — used around the hero
 * CT-scan device. Dark navy surface, green medical icon accent,
 * white label. Floats softly and fades in on entry.
 */
export default function FloatingTag({
  icon,
  label,
  className,
  delay = 0,
  bob = 6,
  bobDuration = 5,
}: FloatingTagProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
      className={className}
    >
      <motion.div
        animate={{ y: [-bob, bob, -bob] }}
        transition={{
          duration: bobDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="floating-tag group inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[#141414]/95 px-4 py-2.5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-sm"
      >
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-mint/15 text-mint ring-1 ring-mint/30 transition-all group-hover:bg-mint/25">
          {icon}
        </span>
        <span className="text-sm font-medium tracking-tight text-white">
          {label}
        </span>
      </motion.div>
    </motion.div>
  );
}
