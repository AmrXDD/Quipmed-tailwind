import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Sparkles, X, Layers, ShoppingBag, Zap, MessageSquareQuote, Package } from "lucide-react";
import { useProducts, useDepartments, useBrands } from "@/hooks/useSupabase";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/cart";
import { proxyImage } from "@/lib/img";
import { productImageFor } from "@/data/productImages";
import { expectedSubcategoriesFor } from "@/data/subcategories";

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
  const [subFilter, setSubFilter] = useState<string>(
    searchParams.get("sub") ?? "all",
  );
  const [active, setActive] = useState<Product | null>(null);

  useEffect(() => {
    const param = searchParams.get("department") ?? "all";
    setFilter(param);
    setSubFilter(searchParams.get("sub") ?? "all");
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
    setSubFilter("all");
    searchParams.delete("sub");
    if (next === "all") {
      searchParams.delete("department");
    } else {
      searchParams.set("department", next);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const setSubFilterAndUrl = (next: string) => {
    setSubFilter(next);
    if (next === "all") {
      searchParams.delete("sub");
    } else {
      searchParams.set("sub", next);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const bySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of departments) m.set(d.slug, d.id);
    return m;
  }, [departments]);

  const inDepartment = useMemo(() => {
    let list = products;
    if (brandId) list = list.filter((p) => p.brand_id === brandId);
    if (filter === "all") return list;
    if (filter === OTHER_SLUG) return list.filter((p) => !p.department_id);
    const id = bySlug.get(filter);
    if (!id) return list.filter((p) => !p.department_id);
    return list.filter((p) => p.department_id === id);
  }, [filter, products, bySlug, brandId]);

  // A product's effective sub = its `subcategory` if set, otherwise its `category`.
  const effectiveSub = (p: Product) =>
    (p.subcategory && p.subcategory.trim()) ||
    (p.category && p.category.trim() !== "Uncategorized" ? p.category : null);

  const subsByDept = useMemo(() => {
    const map = new Map<string, string[]>();
    // Seed with canonical taxonomy
    for (const d of departments) {
      map.set(d.slug, [...expectedSubcategoriesFor(d.slug, d.name)]);
    }
    map.set(OTHER_SLUG, []);
    // Merge in subs actually present on products
    for (const p of products) {
      const s = effectiveSub(p);
      if (!s) continue;
      const dept = departments.find((d) => d.id === p.department_id);
      const key = dept ? dept.slug : OTHER_SLUG;
      const arr = map.get(key);
      if (!arr) continue;
      if (!arr.includes(s)) arr.push(s);
    }
    for (const arr of map.values()) arr.sort();
    return map;
  }, [products, departments]);

  const subCount = (deptKey: string, sub: string) => {
    if (deptKey === OTHER_SLUG)
      return products.filter((p) => !p.department_id && effectiveSub(p) === sub).length;
    const id = bySlug.get(deptKey);
    if (!id) return 0;
    return products.filter((p) => p.department_id === id && effectiveSub(p) === sub)
      .length;
  };

  const visible = useMemo(() => {
    if (subFilter === "all") return inDepartment;
    return inDepartment.filter((p) => effectiveSub(p) === subFilter);
  }, [inDepartment, subFilter]);

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
      <div className="mx-auto max-w-[88rem] px-3 sm:px-5 lg:px-6">
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

        <div className="mt-10 flex flex-col items-start gap-6 lg:flex-row lg:gap-8">
          <aside className="relative z-10 w-full shrink-0 self-start lg:w-72">
            <div className="flex flex-col rounded-2xl border border-white/10 bg-navy-800/90 p-3 shadow-[0_4px_30px_rgba(0,0,0,0.25)] backdrop-blur-md">
              <h3 className="mb-3 px-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-mint-soft">
                Departments
              </h3>
              <nav className="space-y-1 pr-1">
                <button
                  onClick={() => setFilterAndUrl("all")}
                  className={[
                    "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                    filter === "all"
                      ? "bg-cyan-neon text-navy-900"
                      : "text-slate-light/85 hover:bg-white/5 hover:text-primary",
                  ].join(" ")}
                >
                  <span>All products</span>
                  <span
                    className={[
                      "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                      filter === "all" ? "bg-navy-900/15 text-navy-900" : "bg-white/5 text-slate-mid",
                    ].join(" ")}
                  >
                    {counts.get("all") ?? 0}
                  </span>
                </button>

                {filters
                  .filter((f) => f.key !== "all")
                  .map((f) => {
                    const isActive = filter === f.key;
                    const subs = subsByDept.get(f.key) ?? [];
                    return (
                      <div key={f.key} className="pt-0.5">
                        <button
                          onClick={() => setFilterAndUrl(f.key)}
                          className={[
                            "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold transition-colors",
                            isActive
                              ? "bg-cyan-neon text-navy-900"
                              : "text-slate-light/85 hover:bg-white/5 hover:text-primary",
                          ].join(" ")}
                        >
                          <span className="truncate">{f.label}</span>
                          <span
                            className={[
                              "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                              isActive ? "bg-navy-900/15 text-navy-900" : "bg-white/5 text-slate-mid",
                            ].join(" ")}
                          >
                            {counts.get(f.key) ?? 0}
                          </span>
                        </button>

                        {isActive && subs.length > 0 && (
                          <ul className="mt-1 ml-2 space-y-0.5 border-l border-white/10 pl-3">
                            <li>
                              <button
                                onClick={() => setSubFilterAndUrl("all")}
                                className={[
                                  "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                                  subFilter === "all"
                                    ? "bg-mint text-navy-900"
                                    : "text-slate-light/70 hover:bg-white/5 hover:text-primary",
                                ].join(" ")}
                              >
                                <span>Show all</span>
                                <span
                                  className={[
                                    "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                    subFilter === "all"
                                      ? "bg-navy-900/15 text-navy-900"
                                      : "bg-white/5 text-slate-mid",
                                  ].join(" ")}
                                >
                                  {inDepartment.length}
                                </span>
                              </button>
                            </li>
                            {subs.map((s) => {
                              const sActive = subFilter === s;
                              return (
                                <li key={s}>
                                  <button
                                    onClick={() => setSubFilterAndUrl(s)}
                                    className={[
                                      "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium transition-colors",
                                      sActive
                                        ? "bg-mint text-navy-900"
                                        : "text-slate-light/70 hover:bg-white/5 hover:text-primary",
                                    ].join(" ")}
                                  >
                                    <span className="truncate">{s}</span>
                                    <span
                                      className={[
                                        "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                                        sActive
                                          ? "bg-navy-900/15 text-navy-900"
                                          : "bg-white/5 text-slate-mid",
                                      ].join(" ")}
                                    >
                                      {subCount(f.key, s)}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    );
                  })}
              </nav>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <LayoutGroup id="product-grid">
              <motion.div
                layout
                className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
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
                      <div className="mb-5 flex h-40 items-center justify-center overflow-hidden rounded-xl bg-white">
                        {(() => {
                          const src = productImageFor(p.slug, p.image_url);
                          return src ? (
                            <img
                              src={proxyImage(src, { w: 480, h: 320 })}
                              alt={p.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <Package size={32} className="text-slate-mid" />
                          );
                        })()}
                      </div>
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
        </div>
      </div>

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
        {(() => {
          const src = productImageFor(product.slug, product.image_url);
          return src ? (
            <div className="mb-6 flex h-64 items-center justify-center overflow-hidden rounded-2xl bg-white">
              <img
                src={proxyImage(src, { w: 960, h: 640 })}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain"
              />
            </div>
          ) : null;
        })()}
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