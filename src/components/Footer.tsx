import { Link } from "react-router-dom";
import { ArrowUpRight, Download } from "lucide-react";
import { useCompanyInfo } from "@/hooks/useSupabase";
import { openConsentSettings } from "@/lib/consent";
import { useThemeMode } from "@/lib/theme";
import { BRAIN_MODEL_CREDIT as M } from "@/data/credits";
import Logo from "./Logo";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/brands", label: "Brands" },
  { to: "/contact", label: "Contact" },
];

const LEGAL = [
  { to: "/privacy", label: "Privacy policy" },
  { to: "/terms", label: "Terms of use" },
  { to: "/cookies", label: "Cookie policy" },
];

export default function Footer() {
  const c = useCompanyInfo();
  const theme = useThemeMode();
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-line bg-navy-900">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        {/* Statement row */}
        <div className="grid gap-12 border-b border-line py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:py-20">
          <div data-reveal="left">
            <Logo className="block h-12" tone={theme === "light" ? "dark" : "light"} />
            <p className="mt-8 max-w-[44ch] text-[15px] leading-relaxed text-slate-mid">
              {c.about}
            </p>
          </div>
          <div data-reveal="right" className="flex flex-col items-start justify-between gap-8 md:items-end">
            <a
              href={`mailto:${c.email}`}
              className="group inline-flex items-center gap-3 text-[clamp(1.4rem,2.6vw,2.2rem)] font-medium tracking-[-0.02em] text-primary"
            >
              {c.email}
              <ArrowUpRight size={22} className="text-scan transition-transform duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
            <a
              href="/QuipMed-Company-Profile.pdf"
              download="QuipMed-Company-Profile.pdf"
              className="inline-flex items-center gap-2.5 rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/[0.06]"
            >
              <Download size={15} /> Company profile (PDF)
            </a>
          </div>
        </div>

        {/* Directory row */}
        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
          <FooterCol title="Navigate">
            {NAV.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-slate-light/80 transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </FooterCol>

          <FooterCol title="Visit">
            <li className="max-w-[28ch] text-slate-light/80">{c.address}</li>
            <li className="text-slate-light/80">{c.hours_weekdays}</li>
          </FooterCol>

          <FooterCol title="Contact">
            <li>
              <a href={`tel:${c.phone?.replace(/\s/g, "")}`} className="tnum text-slate-light/80 transition-colors hover:text-primary">
                {c.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${c.email}`} className="text-slate-light/80 transition-colors hover:text-primary">
                {c.email}
              </a>
            </li>
            {c.linkedin && (
              <li>
                <a href={c.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-light/80 transition-colors hover:text-primary">
                  LinkedIn
                </a>
              </li>
            )}
          </FooterCol>

          <FooterCol title="Legal">
            {LEGAL.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-slate-light/80 transition-colors hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={openConsentSettings}
                className="text-slate-light/80 transition-colors hover:text-primary"
              >
                Cookie settings
              </button>
            </li>
          </FooterCol>
        </div>

        {/* Legal line */}
        <div className="flex flex-col gap-3 border-t border-line pb-24 pt-7 font-mono lg:pb-7 lg:pr-20 text-[11px] uppercase tracking-[0.1em] text-slate-mid lg:flex-row lg:items-center lg:justify-between">
          <p>
            © {year} {c.name} · <span dir="rtl" lang="ar" className="normal-case tracking-normal">{c.name_ar}</span> · All rights reserved
          </p>
          <p className="normal-case tracking-normal">
            3D model:{" "}
            <a href={M.url} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-primary">
              &ldquo;{M.title}&rdquo;
            </a>{" "}
            by{" "}
            <a href={M.authorUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-primary">
              {M.author}
            </a>
            ,{" "}
            <a href={M.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-2 hover:text-primary">
              {M.license}
            </a>
            , modified
          </p>
          <p className="flex items-center gap-2">
            Designed &amp; developed by
            <a
              href="https://amrstudio.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 normal-case tracking-normal text-slate-light transition-colors hover:text-primary"
            >
              <StudioMark />
              <span className="font-sans text-[12.5px] font-medium">amrstudio.dev</span>
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-mid">
        {title}
      </h2>
      <ul className="mt-5 space-y-2.5 text-[15px]">{children}</ul>
    </div>
  );
}

/**
 * Amr Studio mark: italic serif "a" inside a gradient ring.
 * Drawn in CSS so it stays sharp at any size and follows the theme.
 */
function StudioMark() {
  const ring =
    "conic-gradient(from 0deg, #ff5a2c 0%, #ff7a45 22%, #e0607a 36%, #7c3aed 50%, #5b8df5 62%, #22d3ee 75%, #a3aaa3 88%, #ff5a2c 100%)";
  const mask = "radial-gradient(farthest-side, transparent calc(100% - 2.6px), #000 calc(100% - 2.2px))";
  return (
    <span aria-hidden="true" className="relative inline-grid h-[18px] w-[18px] shrink-0 place-items-center">
      <span
        className="absolute inset-0 rounded-full transition-transform duration-700 ease-out-expo group-hover:rotate-180"
        style={{ background: ring, WebkitMask: mask, mask }}
      />
      <span
        className="-mt-px text-[11px] italic leading-none text-primary"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
      >
        a
      </span>
    </span>
  );
}
