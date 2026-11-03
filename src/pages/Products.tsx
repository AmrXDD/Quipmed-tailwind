import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowUpRight, X, ShoppingBag, MessageSquareQuote, Package } from "lucide-react";
import { PageHeader } from "@/components/ui/primitives";
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
    <div className="min-h-screen bg-navy-900 pb-28 pt-36">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <PageHeader
          eyebrow="Catalogue"
          title="Products & solutions"
          lead={
            <>
              From diagnostic imaging to life support: {products.length} product lines across{" "}
              {departments.length} departments, from manufacturers we have vetted ourselves.
            </>
          }
          aside={
            <p className="tnum font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid" aria-live="polite">
              {loading || departmentsLoading
                ? "Loading catalogue…"
                : `Showing ${String(visible.length).padStart(2, "0")} of ${String(products.length).padStart(2, "0")}`}
            </p>
          }
        />

        {activeBrand && (
          <div className="mt-8 flex items-center gap-3 rounded-xl border border-line-strong px-4 py-3 text-sm">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid">
              Brand
            </span>
            <span className="font-semibold text-white">{activeBrand.name}</span>
            <button
              onClick={clearBrand}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1 text-xs font-medium text-slate-light transition-colors hover:text-primary"
            >
              <X size={12} /> Clear
            </button>
          </div>
        )}

        <div className="mt-12 flex flex-col items-start gap-10 lg:flex-row lg:gap-12">
          <aside className="relative z-10 w-full shrink-0 self-start lg:sticky lg:top-28 lg:w-64">
            <div className="flex flex-col">
              <h3 className="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-mid">
                Departments
              </h3>
              <nav className="space-y-1 pr-1">
                <button
                  onClick={() => setFilterAndUrl("all")}
                  className={[
                    "relative flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                    filter === "all"
                      ? "bg-white/[0.06] text-primary before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-scan"
                      : "text-slate-light/75 hover:bg-white/[0.04] hover:text-primary",
                  ].join(" ")}
                >
                  <span>All products</span>
                  <span
                    className={[
                      "tnum font-mono text-[11px]",
                      "text-slate-mid",
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
                            "relative flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                            isActive
                              ? "bg-white/[0.06] text-primary before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:rounded-full before:bg-scan"
                              : "text-slate-light/75 hover:bg-white/[0.04] hover:text-primary",
                          ].join(" ")}
                        >
                          <span className="truncate">{f.label}</span>
                          <span
                            className={[
                              "tnum font-mono text-[11px]",
                              "text-slate-mid",
                            ].join(" ")}
                          >
                            {counts.get(f.key) ?? 0}
                          </span>
                        </button>

                        {isActive && subs.length > 0 && (
                          <ul className="mb-2 ml-3 mt-1 space-y-0.5 border-l border-line pl-3">
                            <li>
                              <button
                                onClick={() => setSubFilterAndUrl("all")}
                                className={[
                                  "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors",
                                  subFilter === "all"
                                    ? "text-primary"
                                    : "text-slate-light/65 hover:text-primary",
                                ].join(" ")}
                              >
                                <span>Show all</span>
                                <span
                                  className={[
                                    "tnum font-mono text-[11px]",
                                    "text-slate-mid",
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
                                      "flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors",
                                      sActive
                                        ? "text-primary"
                                        : "text-slate-light/65 hover:text-primary",
                                    ].join(" ")}
                                  >
                                    <span className="truncate">{s}</span>
                                    <span
                                      className={[
                                        "tnum font-mono text-[11px]",
                                        "text-slate-mid",
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
                className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3"
              >
                {loading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <div key={`sk-${i}`} className="animate-pulse">
                      <div className="aspect-[4/3] rounded-[18px] bg-white/[0.04]" />
                      <div className="mt-5 h-3 w-24 rounded bg-white/[0.05]" />
                      <div className="mt-3 h-5 w-3/4 rounded bg-white/[0.06]" />
                      <div className="mt-3 h-3 w-full rounded bg-white/[0.04]" />
                    </div>
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
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      className="group flex flex-col text-left outline-none"
                    >
                      {/* Specimen plate: product on a paper-white field */}
                      <div className="scan-hover relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-[18px] bg-[#f4f5f2] ring-1 ring-black/5 transition-shadow duration-500 group-hover:shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)] group-focus-visible:ring-2 group-focus-visible:ring-scan">
                        {(() => {
                          const src = productImageFor(p.slug, p.image_url);
                          return src ? (
                            <img
                              src={proxyImage(src, { w: 640, h: 480 })}
                              alt={p.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-contain p-7 mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover:scale-[1.04]"
                            />
                          ) : (
                            <Package size={30} strokeWidth={1.5} className="text-black/30" />
                          );
                        })()}
                        <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.14em] text-black/45">
                          {p.brand_name ?? "QuipMed"}
                        </span>
                        {p.featured && (
                          <span className="absolute right-4 top-4 rounded-[4px] bg-[#0b0c0b] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.14em] text-[#f4f5f2]">
                            Featured
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col px-1 pt-5">
                        <motion.span
                          layoutId={`cat-${p.id}`}
                          className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid"
                        >
                          {p.subcategory ?? p.category}
                        </motion.span>
                        <motion.h3
                          layoutId={`name-${p.id}`}
                          className="mt-2 text-[19px] font-medium leading-snug tracking-[-0.01em] text-primary"
                        >
                          {p.name}
                        </motion.h3>
                        <p className="mb-5 mt-2 line-clamp-2 text-sm leading-relaxed text-slate-mid">
                          {p.description}
                        </p>
                        <span className="mt-auto flex items-center justify-between border-t border-line pt-4 text-[13px] font-semibold text-primary">
                          <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-500 ease-out-expo group-hover:bg-[length:100%_1px]">
                            View details
                          </span>
                          <ArrowUpRight
                            size={16}
                            className="text-scan transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                          />
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            </LayoutGroup>

            {visible.length === 0 && !loading && (
              <div className="rounded-[18px] border border-dashed border-line-strong px-8 py-16 text-center">
                <p className="text-lg font-medium text-primary">Nothing listed here yet.</p>
                <p className="mx-auto mt-2 max-w-[42ch] text-sm text-slate-mid">
                  We may still be able to source it. Tell us what you need and we&rsquo;ll check with our manufacturers.
                </p>
                <Link to="/contact" className="mt-6 inline-block text-sm font-semibold text-primary underline decoration-line-strong underline-offset-4 hover:decoration-scan">
                  Ask about a product
                </Link>
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
        className="relative mx-auto max-w-3xl overflow-hidden rounded-[24px] border border-line bg-[var(--surface-raised)] p-6 md:p-10"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-[#0b0c0b] text-[#f4f5f2] transition-transform hover:rotate-90"
          aria-label="Close"
        >
          <X size={16} />
        </button>
        {(() => {
          const src = productImageFor(product.slug, product.image_url);
          return src ? (
            <div className="mb-8 flex aspect-[16/10] items-center justify-center overflow-hidden rounded-[18px] bg-[#f4f5f2]">
              <img
                src={proxyImage(src, { w: 960, h: 640 })}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain p-8 mix-blend-multiply"
              />
            </div>
          ) : null;
        })()}
        <motion.span
          layoutId={`cat-${product.id}`}
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid"
        >
          {product?.subcategory ?? product?.category}
        </motion.span>
        <motion.h2
          layoutId={`name-${product.id}`}
          className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.025em] text-primary md:text-[2.6rem]"
        >
          {product?.name}
        </motion.h2>
        {product?.brand_name && (
          <p className="mt-2 text-[15px] text-slate-mid">by {product.brand_name}</p>
        )}
        <p className="mt-6 text-base leading-relaxed text-slate-light/80">
          {product?.description}
        </p>

        {!isQuotable(product) ? (
          <p className="mt-6">
            <span className="tnum font-mono text-3xl font-medium text-primary">
              ${(product.price ?? 0).toLocaleString()}
            </span>
            <span className="ml-3 text-xs text-slate-mid">Indicative · excl. taxes, delivery &amp; installation</span>
          </p>
        ) : (
          <p className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-scan">
            <MessageSquareQuote size={12} /> Quote on request
          </p>
        )}
        {features.length > 0 && (
          <div className="mt-8">
            <h3 className="font-mono text-[11px] font-medium uppercase tracking-[0.14em] text-slate-mid">
              Key features
            </h3>
            <ul className="mt-3 grid gap-x-8 sm:grid-cols-2">
              {features.map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 border-t border-line py-3 text-sm text-slate-light/90"
                >
                  <span className="mt-[0.6em] h-px w-3 shrink-0 bg-scan" />
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
              className="inline-flex items-center gap-2 text-xs text-slate-mid transition-colors hover:text-primary"
            >
              Manufacturer info <ArrowUpRight size={12} />
            </a>
          </div>
        )}
        <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-slate-mid">
          Specifications and images come from the manufacturer, are for reference and may change.
          Availability in Kuwait is subject to regulatory approval. A sale is confirmed only by a
          written quotation. <Link to="/terms" className="underline underline-offset-2 hover:text-primary">Terms of use</Link>
        </p>
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
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-[var(--bg-primary)] transition-colors hover:bg-mint-soft hover:text-white active:scale-[0.98]"
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
        className="inline-flex items-center gap-2 rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-white/[0.06]"
      >
        <ShoppingBag size={14} /> Add to quote list
      </button>
      <button
        onClick={buyNow}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[var(--bg-primary)] transition-colors hover:bg-mint-soft hover:text-white active:scale-[0.98]"
      >
        <MessageSquareQuote size={14} /> Add &amp; review list
      </button>
    </div>
  );
}