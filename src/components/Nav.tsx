import { Link, NavLink, useLocation } from "react-router-dom";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Moon, Phone, ShoppingBag, Sun, X } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";
import { useCompanyInfo, useDepartments, useProducts } from "@/hooks/useSupabase";
import { DepartmentIcon, taglineFor } from "./DepartmentIndex";
import { lockScroll } from "@/lib/motion";

/**
 * Site navigation.
 *
 * A conventional full-width bar (logo left, pages centre, actions right)
 * so it reads instantly for every visitor. The creative layer is quiet:
 *  - a green scan line under the current page that glides to whichever
 *    link you point at, and returns when you leave;
 *  - a hairline along the bottom edge that fills as you read the page;
 *  - Departments opens a full-width panel, not a cramped dropdown.
 * Phones get a "Menu" button (a word, not just an icon) that opens a
 * full-screen menu dropping down from the top, with large links.
 */

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/brands", label: "Brands" },
  { to: "/contact", label: "Contact" },
];

export default function Nav({
  theme,
  toggleTheme,
}: {
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  const location = useLocation();
  const { count, openCart } = useCart();
  const { departments } = useDepartments();
  const { products } = useProducts();
  const c = useCompanyInfo();

  const [scrolled, setScrolled] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  // Close everything on navigation.
  useEffect(() => {
    setDeptOpen(false);
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  // Condense on scroll + reading progress (written straight to the DOM).
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 12);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [location.pathname]);

  // Departments panel: close on outside click or Escape.
  useEffect(() => {
    if (!deptOpen) return;
    const onDown = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setDeptOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDeptOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [deptOpen]);

  // Mobile menu: lock page scroll, close on Escape, hide floating buttons.
  useEffect(() => {
    lockScroll(menuOpen);
    if (menuOpen) document.documentElement.dataset.menu = "open";
    else delete document.documentElement.dataset.menu;
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      delete document.documentElement.dataset.menu;
    };
  }, [menuOpen]);

  const countFor = (id: string) => products.filter((p) => p.department_id === id).length;
  const phoneHref = `tel:${(c.phone ?? "").replace(/\s/g, "")}`;

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50">
      <div
        className={`relative border-b transition-[background-color,border-color] duration-500 ${
          scrolled || deptOpen
            ? "border-line bg-[color-mix(in_srgb,var(--bg-primary)_96%,transparent)]"
            : "border-transparent bg-[var(--bg-primary)]"
        }`}
      >
        <div
          className={`mx-auto flex max-w-[90rem] items-center gap-4 px-5 transition-[height] duration-500 ease-out-expo sm:px-8 lg:px-12 ${
            scrolled ? "h-16" : "h-[76px]"
          }`}
        >
          {/* Logo */}
          <Link to="/" aria-label="QuipMed home" data-nav-logo className="flex h-full shrink-0 items-center">
            <Logo className="block h-8 sm:h-9" tone={theme === "light" ? "dark" : "light"} />
          </Link>

          {/* Pages (desktop) */}
          <DesktopLinks
            pathname={location.pathname}
            deptOpen={deptOpen}
            onToggleDept={() => setDeptOpen((v) => !v)}
          />

          {/* Actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {c.phone && (
              <a
                href={phoneHref}
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-light transition-colors hover:text-primary xl:inline-flex"
              >
                <Phone size={15} className="text-scan" />
                <span className="tnum">{c.phone}</span>
              </a>
            )}

            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-3.5 text-sm font-medium text-primary transition-colors hover:bg-white/[0.06]"
              aria-label={`Quote list, ${count} item${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag size={16} />
              <span className="hidden md:inline">Quote list</span>
              {count > 0 && (
                <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-mint px-1.5 text-[11px] font-semibold text-[#fff]">
                  {count}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="hidden h-11 w-11 place-items-center rounded-full border border-line-strong text-primary transition-colors hover:bg-white/[0.06] sm:grid"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              title={theme === "dark" ? "Light mode" : "Dark mode"}
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <Link
              to="/contact"
              className="hidden h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-[var(--bg-primary)] transition-colors hover:bg-mint-soft hover:text-[#fff] md:inline-flex"
            >
              Request a quote
            </Link>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-4 text-sm font-semibold text-primary lg:hidden"
            >
              {menuOpen ? <X size={16} /> : <MenuGlyph />}
              {menuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>

        {/* Reading progress: the scan line fills as you read. */}
        <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-px overflow-hidden">
          <span
            ref={progressRef}
            className="block h-full w-full origin-left bg-scan"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
      </div>

      {/* Departments panel (desktop) */}
      <AnimatePresence>
        {deptOpen && (
          <motion.div
            id="departments-panel"
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="hidden border-b border-line bg-[var(--bg-primary)] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] lg:block"
            data-lenis-prevent
          >
            <div className="mx-auto grid max-w-[90rem] gap-10 px-12 py-10 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <ul className="grid grid-cols-2 gap-x-8 xl:grid-cols-3">
                {departments.map((d, i) => {
                  const n = countFor(d.id);
                  return (
                    <li key={d.id}>
                      <Link
                        to={`/products?department=${d.slug}`}
                        className="scan-hover group flex h-full gap-4 border-t border-line py-5 pr-2 transition-colors"
                      >
                        <span className="tnum pt-0.5 font-mono text-xs text-slate-mid group-hover:text-scan">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-2.5 text-[17px] font-semibold leading-snug text-primary">
                            <DepartmentIcon slug={d.slug} name={d.name} size={19} className="shrink-0 text-slate-mid transition-colors group-hover:text-scan" />
                            {d.name}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-slate-mid">
                            {taglineFor(d.slug, d.name)}
                          </span>
                          {n > 0 && (
                            <span className="tnum mt-2 block font-mono text-[11px] uppercase tracking-[0.12em] text-slate-mid">
                              {n} product line{n === 1 ? "" : "s"}
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <aside className="hidden flex-col justify-between rounded-2xl border border-line p-6 xl:flex">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid">Not sure where to start?</p>
                  <p className="mt-3 text-[17px] font-medium leading-snug text-primary">
                    Tell us what your facility needs and we&rsquo;ll point you to the right equipment.
                  </p>
                </div>
                <div className="mt-6 space-y-3">
                  <Link to="/products" className="flex items-center justify-between text-sm font-semibold text-primary">
                    Browse all products <ArrowUpRight size={16} className="text-scan" />
                  </Link>
                  <Link to="/contact" className="flex items-center justify-between text-sm font-semibold text-primary">
                    Talk to our team <ArrowUpRight size={16} className="text-scan" />
                  </Link>
                </div>
              </aside>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu: full screen, drops from the top. */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-x-0 bottom-0 overflow-y-auto overscroll-contain bg-[var(--bg-primary)] lg:hidden"
            style={{ top: scrolled ? 64 : 76 }}
            data-lenis-prevent
          >
            <nav aria-label="Main" className="mx-auto max-w-xl px-5 pb-16 pt-6 sm:px-8">
              <ul>
                {LINKS.map((l, i) => (
                  <li key={l.to} className="border-b border-line">
                    <NavLink
                      to={l.to}
                      end={l.to === "/"}
                      className={({ isActive }) =>
                        `flex items-baseline gap-4 py-4 text-[28px] font-semibold tracking-[-0.02em] ${
                          isActive ? "text-primary" : "text-slate-light"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span className={`tnum font-mono text-xs ${isActive ? "text-scan" : "text-slate-mid"}`}>
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {l.label}
                          {isActive && <span className="ml-auto h-2 w-2 self-center rounded-full bg-scan" aria-hidden="true" />}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>

              {departments.length > 0 && (
                <div className="mt-10">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid">Departments</p>
                  <ul className="mt-3 grid gap-1">
                    {departments.map((d) => (
                      <li key={d.id}>
                        <Link
                          to={`/products?department=${d.slug}`}
                          className="flex items-center justify-between rounded-xl px-1 py-3 text-[17px] text-primary"
                        >
                          <span className="flex items-center gap-3">
                            <DepartmentIcon slug={d.slug} name={d.name} size={19} className="shrink-0 text-scan" />
                            {d.name}
                          </span>
                          <ArrowUpRight size={16} className="text-scan" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-10 grid gap-3">
                <Link
                  to="/contact"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-primary text-base font-semibold text-[var(--bg-primary)]"
                >
                  Request a quote
                </Link>
                {c.phone && (
                  <a
                    href={phoneHref}
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-line-strong text-base font-semibold text-primary"
                  >
                    <Phone size={17} className="text-scan" /> Call {c.phone}
                  </a>
                )}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-line-strong text-base font-semibold text-primary"
                >
                  {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
                  {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Desktop page links with the gliding scan-line indicator. */
function DesktopLinks({
  pathname,
  deptOpen,
  onToggleDept,
}: {
  pathname: string;
  deptOpen: boolean;
  onToggleDept: () => void;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const [hovered, setHovered] = useState<string | null>(null);
  const [bar, setBar] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });

  const activeKey =
    LINKS.find((l) => (l.to === "/" ? pathname === "/" : pathname.startsWith(l.to)))?.to ?? null;
  const target = hovered ?? (deptOpen ? "dept" : activeKey);

  const measure = useCallback(() => {
    const list = listRef.current;
    const el = target ? itemRefs.current.get(target) : null;
    if (!list || !el) {
      setBar((b) => ({ ...b, visible: false }));
      return;
    }
    const lr = list.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setBar({ left: r.left - lr.left + 14, width: Math.max(0, r.width - 28), visible: true });
  }, [target]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const setRef = (key: string) => (el: HTMLElement | null) => {
    if (el) itemRefs.current.set(key, el);
    else itemRefs.current.delete(key);
  };

  return (
    <nav aria-label="Main" className="ml-6 hidden h-full lg:block xl:ml-10">
      <ul
        ref={listRef}
        className="relative flex h-full items-center"
        onPointerLeave={() => setHovered(null)}
      >
        <li ref={setRef("dept")} onPointerEnter={() => setHovered("dept")}>
          <button
            type="button"
            onClick={onToggleDept}
            aria-expanded={deptOpen}
            aria-controls="departments-panel"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-[15px] font-medium transition-colors ${
              deptOpen ? "text-primary" : "text-slate-light hover:text-primary"
            }`}
          >
            Departments
            <ChevronDown size={15} className={`transition-transform duration-300 ${deptOpen ? "rotate-180" : ""}`} />
          </button>
        </li>
        {LINKS.map((l) => (
          <li key={l.to} ref={setRef(l.to)} onPointerEnter={() => setHovered(l.to)}>
            <NavLink
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `block px-3.5 py-2 text-[15px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-slate-light hover:text-primary"
                }`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}

        {/* The scan line: sits on the bar's bottom edge, glides between links. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-scan shadow-[0_0_10px_0_var(--scan)] transition-[transform,width,opacity] duration-500 ease-out-expo"
          style={{
            width: bar.width,
            transform: `translateX(${bar.left}px)`,
            opacity: bar.visible ? 1 : 0,
          }}
        />
      </ul>
    </nav>
  );
}

function MenuGlyph() {
  return (
    <span aria-hidden="true" className="flex w-4 flex-col gap-[3px]">
      <span className="h-[1.5px] w-full rounded bg-current" />
      <span className="h-[1.5px] w-full rounded bg-current" />
      <span className="h-[1.5px] w-2/3 rounded bg-current" />
    </span>
  );
}
