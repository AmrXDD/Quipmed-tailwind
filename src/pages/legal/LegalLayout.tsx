import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Eyebrow } from "@/components/ui/primitives";

export const LEGAL_EFFECTIVE_DATE = "3 November 2026";

export type LegalSection = { id: string; title: string; body: ReactNode };

const DOCS = [
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of use" },
  { to: "/cookies", label: "Cookie policy" },
];

/** Shared shell for the legal pages: sticky contents + numbered sections. */
export default function LegalLayout({
  eyebrow,
  title,
  intro,
  sections,
  current,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  sections: LegalSection[];
  current: string;
}) {
  const [active, setActive] = useState(sections[0]?.id);
  const ids = sections.map((s) => s.id).join(",");

  useEffect(() => {
    document.title = `${title} · QuipMed`;
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top) setActive(top.target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    ids.split(",").forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      io.disconnect();
      document.title = "QuipMed · Leading Medical Innovation";
    };
  }, [ids, title]);

  return (
    <div className="min-h-screen bg-navy-900 pb-28 pt-36">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <header className="border-b border-line pb-12">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-[clamp(2.4rem,5.2vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-primary">
            {title}
          </h1>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid">
            Effective {LEGAL_EFFECTIVE_DATE}
          </p>
        </header>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-14 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-20">
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <nav aria-label="Legal documents" className="flex flex-wrap gap-2 lg:flex-col lg:gap-0">
              {DOCS.map((d) => (
                <Link
                  key={d.to}
                  to={d.to}
                  aria-current={current === d.to ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm transition-colors lg:rounded-none lg:border-0 lg:border-l lg:px-4 lg:py-2.5 ${
                    current === d.to
                      ? "border-scan font-semibold text-primary"
                      : "border-line text-slate-mid hover:text-primary"
                  }`}
                >
                  {d.label}
                </Link>
              ))}
            </nav>
            <nav aria-label="On this page" className="mt-10 hidden lg:block">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid">
                On this page
              </p>
              <ol className="mt-4 space-y-1">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`flex gap-3 py-1 text-[13px] leading-snug transition-colors ${
                        active === s.id ? "text-primary" : "text-slate-mid hover:text-primary"
                      }`}
                    >
                      <span className={`tnum font-mono text-[11px] ${active === s.id ? "text-scan" : ""}`}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <article className="legal-prose min-w-0 max-w-[72ch]">
            <div className="text-[17px] leading-relaxed text-slate-light">{intro}</div>
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`}>
                <h2 id={`${s.id}-h`}>
                  <span className="tnum mr-3 font-mono text-sm font-normal text-scan">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {s.title}
                </h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}
