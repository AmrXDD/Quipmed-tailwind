import { motion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Route transition: a curtain rises from the bottom behind a scan line,
 * names the destination, then lifts away to reveal the new page.
 *
 * Used as the keyed child of <AnimatePresence mode="wait">: the "cover"
 * panel plays on exit, the "reveal" panel plays on enter.
 */

const EASE = [0.76, 0, 0.24, 1] as const;

const LABELS: Record<string, string> = {
  "/": "Home",
  "/about": "About",
  "/products": "Products",
  "/brands": "Brands",
  "/contact": "Contact",
  "/privacy": "Privacy policy",
  "/terms": "Terms of use",
  "/cookies": "Cookie policy",
};

export function labelFor(path: string) {
  return LABELS[path] ?? "QuipMed";
}

export default function PageTransition({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <>
      {/* Content fades and settles on enter, dims on exit. */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] } }}
        exit={{ opacity: 0.4, y: -24, transition: { duration: 0.55, ease: EASE } }}
      >
        {children}
      </motion.div>

      {/* Cover: rises on exit. Leading edge carries the scan line. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] h-[100svh] bg-[var(--bg-secondary)]"
        initial={{ y: "100%" }}
        animate={{ y: "100%" }}
        exit={{ y: "0%", transition: { duration: 0.6, ease: EASE } }}
      >
        {/* Line only exists while the curtain moves, so nothing peeks at rest. */}
        <motion.span
          className="absolute inset-x-0 top-0 h-px bg-scan shadow-[0_0_14px_1px_var(--scan)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 1, transition: { duration: 0 } }}
        />
      </motion.div>

      {/* Reveal: starts covering, lifts away on enter, with the label. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 z-[90] grid h-[100svh] place-items-center bg-[var(--bg-secondary)]"
        initial={{ y: "0%" }}
        animate={{ y: "-100%", transition: { duration: 0.75, delay: 0.15, ease: EASE } }}
        exit={{ y: "-100%" }}
      >
        <motion.span
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, transition: { duration: 0.3, delay: 0.1 } }}
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-mid"
        >
          {label}
        </motion.span>
        <motion.span
          className="absolute inset-x-0 bottom-0 h-px bg-scan shadow-[0_0_14px_1px_var(--scan)]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0, transition: { duration: 0.15, delay: 0.85 } }}
        />
      </motion.div>
    </>
  );
}
