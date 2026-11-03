import { useBrands, useProducts } from "@/hooks/useSupabase";
import BrandLogoGrid from "@/components/BrandLogoGrid";
import { PageHeader } from "@/components/ui/primitives";

export default function Brands() {
  const { brands, loading } = useBrands();
  const { products } = useProducts();

  return (
    <div className="min-h-screen bg-navy-900 pb-28 pt-36">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <PageHeader
          eyebrow="Manufacturers"
          title="Our brand partners"
          lead={`QuipMed works with ${brands.length || "leading"} medical-technology manufacturers across Europe, Asia and the Americas, bringing certified equipment to healthcare in Kuwait.`}
          aside={
            <p className="tnum font-mono text-[11px] uppercase tracking-[0.14em] text-slate-mid">
              {loading
                ? "Loading partners…"
                : `${String(brands.length).padStart(2, "0")} brands · ${String(products.length).padStart(2, "0")} products`}
            </p>
          }
        />

        <section className="mt-12" aria-label="Brand logos">
          {loading ? (
            <div className="grid animate-pulse grid-cols-2 overflow-hidden rounded-[20px] bg-white/[0.04] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={`sk-${i}`} className="h-32 border-b border-r border-line md:h-36" />
              ))}
            </div>
          ) : (
            <div data-reveal="clip-up">
              <BrandLogoGrid brands={brands} />
            </div>
          )}
          <p className="mt-6 max-w-[70ch] text-xs leading-relaxed text-slate-mid">
            Brand names and logos are trademarks of their respective owners and are shown to
            identify the products we supply. Logos link to each manufacturer&rsquo;s own website.
          </p>
        </section>
      </div>
    </div>
  );
}
