import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

/**
 * Route transition that never blocks navigation.
 *
 * The new page renders immediately. On top of it, a curtain carrying the
 * scan line and the destination's name lifts away. The animation is pure
 * CSS (transform), so it runs on the compositor and keeps playing even if
 * the main thread is busy — and nothing waits for it to finish.
 */

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

export default function RouteCurtain() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const [run, setRun] = useState<{ id: number; label: string } | null>(null);

  useEffect(() => {
    if (first.current) {
      first.current = false; // the preloader handles the first load
      return;
    }
    setRun({ id: Date.now(), label: labelFor(pathname) });
  }, [pathname]);

  if (!run) return null;
  return (
    <div
      key={run.id}
      aria-hidden="true"
      className="route-curtain pointer-events-none fixed inset-x-0 top-0 z-[90] grid h-[100svh] place-items-center bg-[var(--bg-secondary)]"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) setRun(null);
      }}
    >
      <span className="route-curtain__label font-mono text-[11px] uppercase tracking-[0.2em] text-slate-mid">
        {run.label}
      </span>
      <span className="absolute inset-x-0 bottom-0 h-px bg-scan shadow-[0_0_14px_1px_var(--scan)]" />
    </div>
  );
}
