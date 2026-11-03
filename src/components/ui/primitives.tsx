import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/** Small mono label that sits above headings: "01 — Solutions". */
export function Eyebrow({
  index,
  children,
  className = "",
}: {
  index?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-mid ${className}`}
    >
      {index && <span className="tnum text-scan">{index}</span>}
      {index && <span aria-hidden="true" className="h-px w-6 bg-line-strong" />}
      <span>{children}</span>
    </p>
  );
}

/** Adds `is-in` once the element enters the viewport (for .scan-once). */
export function useInViewOnce<T extends Element>(margin = "-15% 0px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [inView, margin]);
  return { ref, inView };
}

const btnBase =
  "group inline-flex items-center gap-2.5 rounded-full text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-300 ease-out-expo active:scale-[0.98]";

/** Primary action: solid ink pill with a sliding arrow. */
export function PrimaryButton({
  to,
  href,
  children,
  onClick,
  type,
  disabled,
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const cls = `${btnBase} bg-primary py-3 pl-6 pr-3 text-[var(--bg-primary)] hover:bg-mint-soft hover:text-white disabled:opacity-60`;
  const inner = (
    <>
      {children}
      <span className="grid h-7 w-7 place-items-center overflow-hidden rounded-full bg-[var(--bg-primary)] text-primary">
        <ArrowRight
          size={14}
          className="transition-transform duration-500 ease-out-expo group-hover:translate-x-[3px]"
        />
      </span>
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  if (href) return <a href={href} className={cls}>{inner}</a>;
  return (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled} className={cls}>
      {inner}
    </button>
  );
}

/** Tertiary action: underlined text link with an arrow. */
export function TextLink({
  to,
  href,
  external,
  children,
  className = "",
}: {
  to?: string;
  href?: string;
  external?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const cls = `group inline-flex items-center gap-1.5 text-sm font-semibold text-primary ${className}`;
  const inner = (
    <>
      <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover:bg-[length:100%_1px]">
        {children}
      </span>
      {external ? (
        <ArrowUpRight size={14} className="text-scan transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      ) : (
        <ArrowRight size={14} className="text-scan transition-transform duration-300 group-hover:translate-x-0.5" />
      )}
    </>
  );
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return (
    <a
      href={href}
      className={cls}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {inner}
    </a>
  );
}

/** Page header used on inner pages (About, Products, Brands, Contact, legal). */
export function PageHeader({
  eyebrow,
  title,
  lead,
  aside,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <header className="grid gap-8 border-b border-line pb-12 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-6 max-w-4xl text-balance text-[clamp(2.4rem,5.2vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em] text-primary">
          {title}
        </h1>
        {lead && (
          <p className="mt-6 max-w-[62ch] text-pretty text-[17px] leading-relaxed text-slate-mid">
            {lead}
          </p>
        )}
      </div>
      {aside && <div className="md:pb-2">{aside}</div>}
    </header>
  );
}
