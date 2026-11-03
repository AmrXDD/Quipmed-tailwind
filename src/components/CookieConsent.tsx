import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { saveConsent, useConsent } from "@/lib/consent";

/**
 * Consent banner. Both choices carry equal visual weight — declining is
 * as easy as accepting. Shown until the visitor decides, and again from
 * the footer's "Cookie settings" link.
 */
export default function CookieConsent() {
  const { decided, settingsOpen, embedsAllowed } = useConsent();
  const [ready, setReady] = useState(false);

  // Wait for the preloader so the banner doesn't sit on top of it.
  useEffect(() => {
    const show = () => setReady(true);
    if (!window.__quipmedPreloader || window.__quipmedPreloader.done) {
      show();
      return;
    }
    window.addEventListener("quipmed:preloader-done", show);
    const t = window.setTimeout(show, 6000);
    return () => {
      window.removeEventListener("quipmed:preloader-done", show);
      window.clearTimeout(t);
    };
  }, []);

  const open = ready && (!decided || settingsOpen);

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby="consent-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-x-3 bottom-3 z-[70] rounded-2xl border border-line-strong bg-[var(--surface-raised)] p-5 text-primary shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] sm:inset-x-auto sm:bottom-5 sm:left-5 sm:w-[25rem]"
        >
          <h2 id="consent-title" className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-mid">
            Cookies &amp; privacy
          </h2>
          <p className="mt-3 text-[13.5px] leading-relaxed text-slate-light">
            No advertising or analytics cookies. We only store what the site needs
            to work. The Google map on our contact page sets its own cookies, so
            it loads only if you allow embeds.{" "}
            <Link to="/cookies" className="underline decoration-line-strong underline-offset-4 hover:decoration-scan">
              Cookie policy
            </Link>
          </p>
          {settingsOpen && decided && (
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-mid">
              Current choice: {embedsAllowed ? "embedded content allowed" : "essential only"}
            </p>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => saveConsent(false)}
              className="rounded-full border border-line-strong px-3 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-white/[0.06] active:scale-[0.99]"
            >
              Essential only
            </button>
            <button
              type="button"
              onClick={() => saveConsent(true)}
              className="rounded-full border border-line-strong px-3 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-white/[0.06] active:scale-[0.99]"
            >
              Allow embeds
            </button>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
