import { NavLink, Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Sun, Moon, ShoppingBag, ChevronDown } from "lucide-react";
import Logo from "./Logo";
import { useCart } from "@/lib/cart";
import { useDepartments, useProducts } from "@/hooks/useSupabase";
import { expectedSubcategoriesFor } from "@/data/subcategories";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/products", label: "Products" },
  { to: "/brands", label: "Brands" },
  { to: "/contact", label: "Contact Us" },
];

export default function Nav({
  theme,
  toggleTheme,
}: {
  theme: "dark" | "light";
  toggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [deptOpen, setDeptOpen] = useState(false);
  const [expandedDept, setExpandedDept] = useState<string | null>(null);
  const location = useLocation();
  const { count, openCart } = useCart();
  const { departments } = useDepartments();
  const { products } = useProducts();
  const deptRef = useRef<HTMLLIElement>(null);

  const subsByDept = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const d of departments) {
      map.set(d.id, [...expectedSubcategoriesFor(d.slug, d.name)]);
    }
    for (const p of products) {
      if (!p.department_id || !p.subcategory) continue;
      const arr = map.get(p.department_id);
      if (!arr) continue;
      if (!arr.includes(p.subcategory)) arr.push(p.subcategory);
    }
    for (const arr of map.values()) arr.sort();
    return map;
  }, [departments, products]);

  useEffect(() => {
    if (!deptOpen) {
      setExpandedDept(null);
      return;
    }
    const onClick = (e: MouseEvent) => {
      if (deptRef.current && !deptRef.current.contains(e.target as Node))
        setDeptOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [deptOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* ── Centered floating pill ───────────────────────── */}
      <div className="pointer-events-none flex justify-center px-4 pt-5">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
          className={[
            "pointer-events-auto flex items-center gap-1 rounded-full border px-2 py-2 shadow-pill backdrop-blur-xl transition-all",
            scrolled || theme === "light"
              ? "border-black/10 bg-white/95"
              : "border-white/10 bg-black/75",
          ].join(" ")}
        >
          {/* Logo — sits inside the pill on the left */}
          <Link
            to="/"
            aria-label="QuipMed home"
            className={[
              "ml-1 mr-2 flex h-9 items-center rounded-full px-3 transition-colors",
              scrolled || theme === "light" ? "text-black" : "text-white",
            ].join(" ")}
          >
            <Logo className="block h-7" tone={scrolled || theme === "light" ? "dark" : "light"} />
          </Link>

          {/* Desktop links */}
          <ul className="hidden items-center gap-0.5 md:flex">
            {/* Departments dropdown (live) */}
            <li className="relative" ref={deptRef}>
              <button
                onClick={() => setDeptOpen((v) => !v)}
                className={[
                  "inline-flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  scrolled || theme === "light"
                    ? "text-black/70 hover:text-black"
                    : "text-white/75 hover:text-white",
                ].join(" ")}
                aria-expanded={deptOpen}
                aria-haspopup="menu"
              >
                Departments
                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    deptOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <AnimatePresence>
                {deptOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18 }}
                    className={[
                      "absolute left-0 top-full mt-2 max-h-[70vh] w-[22rem] overflow-y-auto rounded-2xl border p-2 shadow-pill",
                      scrolled || theme === "light"
                        ? "border-black/15 bg-white"
                        : "border-white/10 bg-black/90 backdrop-blur-xl",
                    ].join(" ")}
                    role="menu"
                  >
                    {departments.length === 0 && (
                      <p
                        className={
                          scrolled || theme === "light"
                            ? "px-3 py-2 text-xs text-black/50"
                            : "px-3 py-2 text-xs text-white/50"
                        }
                      >
                        No departments yet
                      </p>
                    )}
                    {departments.map((d) => {
                      const subs = subsByDept.get(d.id) ?? [];
                      const isExpanded = expandedDept === d.id;
                      return (
                        <div key={d.id} className="mb-1">
                          <div
                            className={[
                              "flex items-center gap-1 rounded-xl pr-1",
                              scrolled || theme === "light"
                                ? "hover:bg-black/5"
                                : "hover:bg-white/5",
                            ].join(" ")}
                          >
                            <Link
                              to={`/products?department=${d.slug}`}
                              onClick={() => setDeptOpen(false)}
                              className={[
                                "flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl px-3 py-2 text-[13px] font-semibold leading-tight",
                                scrolled || theme === "light"
                                  ? "text-black"
                                  : "text-white",
                              ].join(" ")}
                              role="menuitem"
                            >
                              <span className="min-w-0 truncate">{d.name}</span>
                              <span
                                className={[
                                  "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                  scrolled || theme === "light"
                                    ? "bg-mint/15 text-mint"
                                    : "bg-mint/20 text-mint-soft",
                                ].join(" ")}
                              >
                                {subs.length}
                              </span>
                            </Link>
                            {subs.length > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedDept(isExpanded ? null : d.id);
                                }}
                                aria-label={isExpanded ? "Collapse" : "Expand"}
                                aria-expanded={isExpanded}
                                className={[
                                  "grid h-7 w-7 place-items-center rounded-lg transition-colors",
                                  scrolled || theme === "light"
                                    ? "text-black/60 hover:bg-black/10 hover:text-black"
                                    : "text-white/60 hover:bg-white/10 hover:text-white",
                                ].join(" ")}
                              >
                                <ChevronDown
                                  size={14}
                                  className={`transition-transform ${
                                    isExpanded ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            )}
                          </div>
                          <AnimatePresence initial={false}>
                            {isExpanded && subs.length > 0 && (
                              <motion.ul
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className={[
                                  "ml-2 mt-0.5 space-y-0.5 overflow-hidden border-l pl-2",
                                  scrolled || theme === "light"
                                    ? "border-black/10"
                                    : "border-white/10",
                                ].join(" ")}
                              >
                                <li>
                                  <Link
                                    to={`/products?department=${d.slug}`}
                                    onClick={() => setDeptOpen(false)}
                                    className={[
                                      "block rounded-lg px-2.5 py-1.5 text-xs font-medium italic",
                                      scrolled || theme === "light"
                                        ? "text-black/55 hover:bg-black/5 hover:text-black"
                                        : "text-white/55 hover:bg-white/5 hover:text-white",
                                    ].join(" ")}
                                  >
                                    Show all
                                  </Link>
                                </li>
                                {subs.map((s) => (
                                  <li key={s}>
                                    <Link
                                      to={`/products?department=${d.slug}&sub=${encodeURIComponent(s)}`}
                                      onClick={() => setDeptOpen(false)}
                                      className={[
                                        "block rounded-lg px-2.5 py-1.5 text-xs font-medium",
                                        scrolled || theme === "light"
                                          ? "text-black/70 hover:bg-black/5 hover:text-black"
                                          : "text-white/70 hover:bg-white/5 hover:text-white",
                                      ].join(" ")}
                                    >
                                      {s}
                                    </Link>
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    <Link
                      to="/products?department=other"
                      onClick={() => setDeptOpen(false)}
                      className={[
                        "block rounded-xl px-3 py-2 text-sm font-medium",
                        scrolled || theme === "light"
                          ? "text-black/60 hover:bg-black/5 hover:text-black"
                          : "text-white/60 hover:bg-white/5 hover:text-white",
                      ].join(" ")}
                      role="menuitem"
                    >
                      Other
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    [
                      "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? (scrolled || theme === "light")
                          ? "text-white"
                          : "text-black"
                        : (scrolled || theme === "light")
                          ? "text-black/70 hover:text-black"
                          : "text-white/75 hover:text-white",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.span
                          layoutId="nav-active"
                          className="absolute inset-0 -z-10 rounded-full bg-mint"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                      <span className={isActive ? "relative text-white" : "relative"}>
                        {l.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Cart button */}
          <button
            onClick={openCart}
            className={[
              "relative ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-all",
              scrolled || theme === "light"
                ? "bg-black/5 text-black hover:bg-black/10"
                : "bg-white/5 text-white hover:bg-white/10",
            ].join(" ")}
            aria-label="Open cart"
          >
            <ShoppingBag size={16} />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 min-w-[1rem] place-items-center rounded-full bg-cyan-neon px-1 text-[10px] font-bold text-navy-900">
                {count}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={[
              "ml-1 flex h-9 w-9 items-center justify-center rounded-full transition-all",
              (scrolled || theme === "light")
                ? "bg-black/5 text-black hover:bg-black/10"
                : "bg-white/5 text-white hover:bg-white/10",
            ].join(" ")}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Mobile toggle — inside the pill */}
          <button
            className={[
              "grid h-9 w-9 place-items-center rounded-full transition-colors md:hidden",
              (scrolled || theme === "light")
                ? "bg-black/5 text-black hover:bg-black/10"
                : "bg-white/5 text-white hover:bg-white/10",
            ].join(" ")}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </button>
        </motion.nav>
      </div>

      {/* ── Mobile drawer (expands below the pill) ──────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
            className="pointer-events-none mt-3 flex justify-center px-4 md:hidden"
          >
            <ul
              className={[
                "pointer-events-auto flex w-full max-w-sm flex-col gap-1 rounded-3xl border p-3 shadow-pill",
                theme === "light"
                  ? "border-black/15 bg-white"
                  : "border-white/10 bg-black/90 backdrop-blur-xl",
              ].join(" ")}
            >
              {links.map((l) => (
                <li key={l.to}>
                  <NavLink
                    to={l.to}
                    end={l.to === "/"}
                    className={({ isActive }) =>
                      [
                        "block rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-mint text-white"
                          : "text-white/80 hover:bg-white/5 hover:text-white",
                      ].join(" ")
                    }
                  >
                    {l.label}
                  </NavLink>
                </li>
              ))}
              {departments.length > 0 && (
                <li className="pt-1">
                  <p className="px-4 pb-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
                    Departments
                  </p>
                  <ul className="space-y-1">
                    {departments.map((d) => (
                      <li key={d.id}>
                        <Link
                          to={`/products?department=${d.slug}`}
                          className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5 hover:text-white"
                        >
                          {d.name}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link
                        to="/products?department=other"
                        className="block rounded-2xl px-4 py-2.5 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white"
                      >
                        Other
                      </Link>
                    </li>
                  </ul>
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
