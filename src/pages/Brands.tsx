import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Globe, ArrowUpRight, Handshake } from "lucide-react";
import { useBrands, useProducts } from "@/hooks/useSupabase";

export default function Brands() {
  const { brands, loading } = useBrands();
  const { products } = useProducts();

  const countBy = new Map<string, number>();
  for (const p of products) {
    if (!p.brand_name) continue;
    countBy.set(p.brand_name, (countBy.get(p.brand_name) ?? 0) + 1);
  }

  return (
    <div className="min-h-screen bg-navy-900 pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <header>
          <span className="inline-flex items-center gap-2 rounded-full border border-cyan-neon/25 bg-cyan-neon/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-soft">
            <Handshake size={12} /> Partnerships
          </span>
          <h1 className="mt-5 text-[clamp(2rem,4.5vw,4rem)] font-bold leading-[0.98] tracking-tight text-primary">
            Our Brand Partners
          </h1>
          <p className="mt-4 max-w-2xl text-slate-mid">
            QuipMed collaborates with {brands.length} world-class medical-technology
            manufacturers across Europe, Asia and the Americas — delivering
            certified innovation to Kuwaiti healthcare.
          </p>
        </header>

        {loading && (
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`sk-${i}`}
                className="h-64 animate-pulse rounded-2xl border border-white/5 bg-navy-800/40"
              />
            ))}
          </div>
        )}

        {!loading && brands.length === 0 && (
          <div className="mt-20 rounded-2xl border border-white/5 bg-navy-800/40 p-10 text-center text-slate-mid">
            No brands found.
          </div>
        )}

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {!loading && brands.map((b, i) => {
            const count = countBy.get(b.name) ?? 0;
            const initials = b.name
              .split(/\s+/)
              .slice(0, 2)
              .map((w) => w[0])
              .join("")
              .toUpperCase();
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{
                  duration: 0.45,
                  ease: [0.2, 0.7, 0.2, 1],
                  delay: (i % 8) * 0.04,
                }}
                whileHover={{ y: -4 }}
                className="group relative"
              >
                <Link
                  to={`/products?brand=${b.id}`}
                  title={`See ${b.name} products`}
                  className="block overflow-hidden rounded-2xl border border-white/10 bg-black p-6 text-white shadow-card transition-all hover:border-cyan-neon/40"
                >
                <div className="flex items-start justify-between">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 text-lg font-bold text-cyan-neon shadow-inner ring-1 ring-white/10">
                    {initials}
                  </div>
                  <ArrowUpRight
                    size={18}
                    className="text-slate-400 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white"
                  />
                </div>
                <h3 className="mt-5 text-xl font-bold tracking-tight text-white">
                  {b.name}
                </h3>
                {b.tagline && (
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-mint">
                    {b.tagline}
                  </p>
                )}
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-300">
                  {b.description}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-slate-400">
                  {b.country && (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe size={12} />
                      {b.country}
                    </span>
                  )}
                  <span className="rounded-full bg-cyan-neon/15 px-2.5 py-0.5 font-semibold text-cyan-neon">
                    {count} product{count === 1 ? "" : "s"}
                  </span>
                </div>
                <span className="pointer-events-none absolute -bottom-28 -right-28 h-56 w-56 rounded-full bg-cyan-neon/20 opacity-0 blur-3xl transition-opacity group-hover:opacity-80" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
