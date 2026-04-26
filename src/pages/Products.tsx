import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Sparkles, X, Layers, ShoppingBag, Zap, MessageSquareQuote, Package } from "lucide-react";
import { useProducts, useDepartments, useBrands } from "@/hooks/useSupabase";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { proxyImage } from "@/lib/img";

const OTHER_SLUG = "other";

const isQuotable = (p: Product) =>
  Boolean(p.is_quotable) || p.price == null || p.price === undefined;

export default function Products() {
  const { products, loading } = useProducts();
  const { departments, loading: departmentsLoading } = useDepartments();
  const { brands } = useBrands();
  const [searchParams, setSearchParams] = useSearchParams();
  const brandId = searchParams.get("brand");
  const [filter, setFilter] = useState<string>(
    searchParams.get("department") ?? "all",
  );
  const [active, setActive] = useState<Product | null>(null);

  useEffect(() => {
    const param = searchParams.get("department") ?? "all";
    setFilter(param);
  }, [searchParams]);

  const activeBrand = useMemo(
    () => brands.find((b) => b.id === brandId) ?? null,
    [brands, brandId],
  );

  const clearBrand = () => {
    searchParams.delete("brand");
    setSearchParams(searchParams, { replace: true });
  };

  const setFilterAndUrl = (next: string) => {
    setFilter(next);
    if (next === "all") {
      searchParams.delete("department");
    } else {
      searchParams.set("department", next);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const bySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of departments) m.set(d.slug, d.id);
    return m;
  }, [departments]);

  const visible = useMemo(() => {
    let list = products;
    if (brandId) list = list.filter((p) => p.brand_id === brandId);
    if (filter === "all") return list;
    if (filter === OTHER_SLUG) return list.filter((p) => !p.department_id);
    const id = bySlug.get(filter);
    if (!id) return list.filter((p) => !p.department_id);
    return list.filter((p) => p.department_id === id);
  }, [filter, products, bySlug, brandId]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    m.set("all", products.length);
    let otherCount = 0;
    const byId = new Map<string, number>();
    for (const p of products) {
      if (!p.department_id) otherCount++;
      else byId.set(p.department_id, (byId.get(p.department_id) ?? 0) + 1);
    }
    m.set(OTHER_SLUG, otherCount);
    for (const d of departments) m.set(d.slug, byId.get(d.id) ?? 0);
    return m;
  }, [products, departments]);

  const filters: { key: string; label: string }[] = [
    { key: "all", label: "All" },
    ...departments.map((d) => ({ key: d.slug, label: d.name })),
    { key: OTHER_SLUG, label: "Other" },
  ];

  return (
    <div className="min-h-screen bg-navy-900 pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        {/* ── Header ──────────────────────────────────────── */}
        <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-neon/25 bg-cyan-neon/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-soft">
              <Layers size={12} /> Catalogue
            </span>
            <h1 className="mt-5 text-[clamp(2rem,4.5vw,4rem)] font-bold leading-[0.98] tracking-tight text-primary">
              Products &amp; Solutions
            </h1>
            <p className="mt-4 max-w-2xl text-slate-mid">
              From diagnostic imaging to life support — QuipMed distributes{" "}
              {products.length}+ curated product lines across {departments.length}{" "}
              departments, sourced from the world&rsquo;s most trusted
              medical-technology partners.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/5 bg-navy-800/60 px-4 py-3 text-sm text-slate-mid">
            <Sparkles size={14} className="text-mint" />
            {loading || departmentsLoading
              ? "Loading catalogue…"
              : `${visible.length} items`}
          </div>
        </header>

        {activeBrand && (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-cyan-neon/25 bg-cyan-neon/5 px-4 py-3 text-sm text-cyan-soft">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-soft/80">
              Brand
            </span>
            <span className="font-semibold text-white">{activeBrand.name}</span>
            <button
              onClick={clearBrand}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-slate-light hover:border-white/30 hover:text-white"
            >
              <X size={12} /> Clear
            </button>
          </div>
        )}

        {/* ── Filter bar ──────────────────────────────────── */}
        <div className="sticky top-20 z-30 -mx-1 mt-10 overflow-x-auto rounded-2xl border border-white/5 bg-navy-800/80 p-1.5 backdrop-blur-md">
          <LayoutGroup id="filter-bar">
            <div className="flex min-w-max gap-1">
              {filters.map((f) => {
                const isActive = filter === f.key;
                return (
                  <button
                    key={f.key}
                    onClick={() => setFilterAndUrl(f.key)}
                    className={[
                      "relative whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                      isActive ? "text-navy-900" : "text-slate-light/70 hover:text-primary",
                    ].join(" ")}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="filter-pill"
                        className="absolute inset-0 -z-10 rounded-xl bg-cyan-neon"
                        transition={{ type: "spring", stiffness: 400, damping: 34 }}
                      />
                    )}
                    {f.label}
                    <span
                      className={[
                        "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                        isActive ? "bg-navy-900/15 text-navy-900" : "bg-white/5 text-slate-mid",
                      ].join(" ")}
                    >
                      {counts.get(f.key) ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        {/* ── Grid ────────────────────────────────────────── */}
        <LayoutGroup id="product-grid">
          <motion.div
            layout
            className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-64 animate-pulse rounded-2xl border border-white/5 bg-navy-800/40"
                />
              ))}
            <AnimatePresence mode="popLayout">
              {!loading && visible.map((p) => (
                <motion.button
                  layout
                  layoutId={`card-${p.id}`}
                  key={p.id}
                  onClick={() => setActive(p)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
                  whileHover={{ y: -6, rotateX: 3, rotateY: -3 }}
                  style={{ transformStyle: "preserve-3d", perspective: 1200 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-navy-800/80 p-6 text-left transition-colors hover:border-cyan-neon/30"
                >
                  {/* image */}
                  <div className="mb-5 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white/[0.03]">
                    {p.image_url ? (
                      <img
                        src={proxyImage(p.image_url, { w: 480, h: 320 })}
                        alt={p.name}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Package size={32} className="text-slate-mid" />
                    )}
                  </div>
                  {/* tag */}
                  <div className="flex items-start justify-between gap-3">
                    <motion.span
                      layoutId={`cat-${p.id}`}
                      className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-mint"
                    >
                      {p.subcategory ?? p.category}
                    </motion.span>
                    {p.featured && (
                      <span className="rounded-full border border-cyan-neon/30 bg-cyan-neon/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-soft">
                        Featured
                      </span>
                    )}
                  </div>
                  <motion.h3
                    layoutId={`name-${p.id}`}
                    className="mt-5 text-lg font-bold leading-tight text-primary transition-colors group-hover:text-cyan-soft"
                  >
                    {p.name}
                  </motion.h3>
                  {p.brand_name && (
                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-mid">
                      by {p.brand_name}
                    </p>
                  )}
                  <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-light/70">
                    {p.description}
                  </p>
                  <div className="mt-6 flex items-center justify-between text-xs text-slate-mid">
                    <span className="inline-flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-mint" />
                      {p.category}
                    </span>
                    <ArrowUpRight
                      size={16}
                      className="text-cyan-neon transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </div>
                  <span className="pointer-events-none absolute -bottom-28 -right-28 h-64 w-64 rounded-full bg-cyan-neon/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>

        {visible.length === 0 && !loading && (
          <div className="mt-20 rounded-2xl border border-white/5 bg-navy-800/40 p-10 text-center text-slate-mid">
            No products in this category yet.
          </div>
        )}
      </div>

      {/* ── Detail modal (layoutId shared with cards) ──── */}
      <AnimatePresence>
        {active && <ProductDetail product={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </div>
  );
}

function ProductDetail({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  if (!product) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 grid place-items-center bg-navy-900/85 p-4 backdrop-blur-md"
      >
        <div className="rounded-2xl border border-white/10 bg-navy-800 px-8 py-6 text-sm text-slate-light">
          Loading product…
        </div>
      </motion.div>
    );
  }

  const features = product?.features ?? [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/85 p-4 backdrop-blur-md md:p-10"
      onClick={onClose}
    >
      <motion.article
        layoutId={`card-${product.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-navy-800 p-8 md:p-10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/5 text-primary ring-1 ring-white/10 hover:bg-white/10"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        {product.image_url && (
          <div className="mb-6 flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.03]">
            <img
              src={proxyImage(product.image_url, { w: 960, h: 640 })}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <motion.span
          layoutId={`cat-${product.id}`}
          className="rounded-full border border-mint/25 bg-mint/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-mint"
        >
          {product?.subcategory ?? product?.category}
        </motion.span>
        <motion.h2
          layoutId={`name-${product.id}`}
          className="mt-5 text-3xl font-bold leading-tight text-primary md:text-4xl"
        >
          {product?.name}
        </motion.h2>
        {product?.brand_name && (
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-slate-mid">
            by {product.brand_name}
          </p>
        )}
        <p className="mt-6 text-base leading-relaxed text-slate-light/80">
          {product?.description}
        </p>

        {!isQuotable(product) ? (
          <p className="mt-6 font-mono text-3xl font-bold text-cyan-neon">
            ${(product.price ?? 0).toLocaleString()}
          </p>
        ) : (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-mint/25 bg-mint/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-mint">
            <MessageSquareQuote size={12} /> Quote on request
          </p>
        )}
        {features.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-soft">
              Key features
            </h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-2 rounded-xl border border-white/5 bg-navy-900/50 px-3 py-2 text-sm text-slate-light/90"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        <ProductCTAs product={product} onClose={onClose} />
        {product.source_url && (
          <div className="mt-4">
            <a
              href={product.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-slate-mid hover:text-cyan-soft"
            >
              Manufacturer info <ArrowUpRight size={12} />
            </a>
          </div>
        )}
      </motion.article>
    </motion.div>
  );
}

function ProductCTAs({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { addItem, openCart } = useCart();
  const quotable = isQuotable(product);

  const requestQuote = () => {
    onClose();
    navigate("/contact", {
      state: {
        product: product.name,
        message: `I am interested in requesting a quote for ${product.name}.`,
      },
    });
  };

  const addToCart = () => {
    if (quotable || product.price == null) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
    });
  };

  const buyNow = () => {
    addToCart();
    onClose();
    openCart();
  };

  if (quotable) {
    return (
      <div className="mt-8">
        <button
          onClick={requestQuote}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-6 py-3 text-sm font-semibold text-navy-900 hover:shadow-neon"
        >
          <MessageSquareQuote size={14} /> Request a quote
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <button
        onClick={addToCart}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/10"
      >
        <ShoppingBag size={14} /> Add to cart
      </button>
      <button
        onClick={buyNow}
        className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-5 py-2.5 text-sm font-semibold text-navy-900 hover:shadow-neon"
      >
        <Zap size={14} /> Buy now
      </button>
    </div>
  );
}
