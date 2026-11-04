import type { LucideIcon } from "lucide-react";

/** Numbered values, set as a quiet list with hairline dividers. */
export default function ValuesList({
  items,
}: {
  items: { k: string; d: string; Icon?: LucideIcon }[];
}) {
  return (
    <ol>
      {items.map((v, i) => (
        <li
          key={v.k}
          data-reveal={i % 2 === 0 ? "right" : "left"}
          className="grid grid-cols-[4rem_minmax(0,1fr)] gap-x-6 border-t border-line py-10 first:border-t-0 first:pt-0 md:grid-cols-[6rem_minmax(0,1fr)] md:py-14"
        >
          <span className="tnum font-mono text-sm text-scan">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <h3 className="flex items-center gap-[0.4em] text-[clamp(1.75rem,3vw,2.6rem)] font-medium leading-none tracking-[-0.03em] text-primary">
              {v.Icon && <v.Icon aria-hidden="true" strokeWidth={1.25} className="h-[0.8em] w-[0.8em] shrink-0 text-scan" />}
              {v.k}
            </h3>
            <p className="mt-5 max-w-[48ch] text-pretty text-[16px] leading-relaxed text-slate-mid">
              {v.d}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
