import type { ReactNode } from "react";
import { saveConsent, useConsent, readConsent } from "@/lib/consent";

/**
 * Holds back third-party embeds until the visitor allows them.
 * Until then it shows a placeholder with a one-click opt-in and an
 * external link that works without loading anything on this page.
 */
export default function ConsentGate({
  provider,
  externalHref,
  externalLabel,
  children,
}: {
  provider: string;
  externalHref: string;
  externalLabel: string;
  children: ReactNode;
}) {
  const { embedsAllowed } = useConsent();
  if (embedsAllowed) return <>{children}</>;

  const decided = readConsent() !== null;
  return (
    <div className="flex h-full w-full flex-col items-start justify-end gap-4 bg-[var(--bg-tertiary)] p-6 sm:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid">
        {provider} · not loaded
      </p>
      <p className="max-w-[42ch] text-sm leading-relaxed text-slate-light">
        This map is provided by {provider}, which sets its own cookies.
        {decided ? " You chose essential cookies only." : ""} Load it here, or
        open it on {provider} instead.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={() => saveConsent(true)}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--bg-primary)] transition-colors hover:bg-mint-soft hover:text-white"
        >
          Load map
        </button>
        <a
          href={externalHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/[0.06]"
        >
          {externalLabel}
        </a>
      </div>
    </div>
  );
}
