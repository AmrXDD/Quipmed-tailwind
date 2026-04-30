import { Handshake, Sparkles } from "lucide-react";
import { useBrands, useProducts } from "@/hooks/useSupabase";
import BrandLogoGrid from "@/components/BrandLogoGrid";

export default function Brands() {
  const { brands, loading } = useBrands();
  const { products } = useProducts();

  return (
    <div className="min-h-screen bg-navy-800 pb-24 pt-32">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-neon/25 bg-cyan-neon/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-cyan-soft">
              <Handshake size={12} /> Partnerships
            </span>
            <h1 className="mt-5 text-[clamp(2rem,4.5vw,4rem)] font-bold leading-[0.98] tracking-tight text-primary">
              Our Brand Partners
            </h1>
            <p className="mt-4 max-w-2xl text-slate-mid">
              QuipMed collaborates with {brands.length} world-class
              medical-technology manufacturers across Europe, Asia and the
              Americas — delivering certified innovation to Kuwaiti
              healthcare.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-xl border border-white/5 bg-navy-800/60 px-4 py-3 text-sm text-slate-mid">
            <Sparkles size={14} className="text-mint" />
            {loading
              ? "Loading partners…"
              : `${brands.length} brands · ${products.length} products`}
          </div>
        </header>

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mint-soft">
                Brand Partners
              </h3>
              <p className="mt-2 text-2xl font-bold text-primary md:text-3xl">
                Trusted manufacturers, one click away.
              </p>
            </div>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`sk-${i}`}
                  className="h-32 animate-pulse rounded-xl border border-white/10 bg-white/[0.03]"
                />
              ))}
            </div>
          ) : (
            <BrandLogoGrid brands={brands} />
          )}
        </section>
      </div>
    </div>
  );
}
