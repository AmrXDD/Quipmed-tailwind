import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Department, Product } from "@/lib/types";

/**
 * Departments as an editorial index — one full-width row per clinical
 * domain, like the contents page of an annual report. Each row is a
 * single link target; subcategory links sit above it in the stacking
 * order so they stay independently clickable.
 */
export default function DepartmentIndex({
  departments,
  products,
  showSubcategories = true,
}: {
  departments: Department[];
  products: Product[];
  showSubcategories?: boolean;
}) {
  const subsFor = (deptId: string) => {
    const subs = new Map<string, number>();
    for (const p of products) {
      if (p.department_id !== deptId || !p.subcategory) continue;
      subs.set(p.subcategory, (subs.get(p.subcategory) ?? 0) + 1);
    }
    return [...subs.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  };

  return (
    <ol className="border-b border-line">
      {departments.map((d, i) => {
        const count = products.filter((p) => p.department_id === d.id).length;
        const subs = showSubcategories ? subsFor(d.id) : [];
        return (
          <li
            key={d.id}
            data-reveal={i % 2 === 0 ? "left" : "right"}
            className="scan-hover group relative border-t border-line transition-colors duration-500 hover:bg-white/[0.025]"
          >
            {/* Whole-row link target (kept outside transformed children). */}
            <Link
              to={`/products?department=${d.slug}`}
              aria-label={`${d.name}: view products`}
              className="absolute inset-0 z-0 rounded-sm"
            />
            <div className="pointer-events-none relative grid grid-cols-[2.75rem_minmax(0,1fr)_auto] items-start gap-x-4 px-1 py-7 sm:grid-cols-[4.5rem_minmax(0,1fr)_auto] md:gap-x-8 md:py-9">
              <span className="tnum pt-1.5 font-mono text-xs text-slate-mid transition-colors duration-500 group-hover:text-scan md:pt-3">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="min-w-0">
                <h3 className="text-[clamp(1.5rem,3.2vw,2.6rem)] font-medium leading-[1.05] tracking-[-0.025em] text-primary transition-transform duration-700 ease-out-expo group-hover:translate-x-2">
                  {d.name}
                </h3>
                <p className="mt-2 max-w-[60ch] text-[15px] text-slate-mid">
                  {taglineFor(d.slug, d.name)}
                </p>
                {subs.length > 0 && (
                  <ul className="pointer-events-auto relative z-10 mt-5 flex flex-wrap gap-x-1 gap-y-1.5">
                    {subs.map(([s, n]) => (
                      <li key={s}>
                        <Link
                          to={`/products?department=${d.slug}&sub=${encodeURIComponent(s)}`}
                          className="inline-flex items-baseline gap-1.5 rounded-md px-2 py-1 text-[13px] text-slate-light/75 transition-colors hover:bg-white/[0.06] hover:text-primary"
                        >
                          {s}
                          <span className="tnum font-mono text-[10px] text-slate-mid">{n}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-4 pt-1 md:pt-2">
                {count > 0 && (
                  <span className="tnum hidden font-mono text-xs text-slate-mid sm:inline">
                    {String(count).padStart(2, "0")} {count === 1 ? "line" : "lines"}
                  </span>
                )}
                <span className="grid h-10 w-10 place-items-center rounded-full border border-line-strong text-primary transition-all duration-500 ease-out-expo group-hover:rotate-45 group-hover:border-transparent group-hover:bg-primary group-hover:text-[var(--bg-primary)] md:h-12 md:w-12">
                  <ArrowUpRight size={18} />
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function taglineFor(slug: string, name: string) {
  const key = `${slug} ${name}`.toLowerCase();
  if (key.includes("imag") || key.includes("diagnostic") || key.includes("radio"))
    return "MRI, CT, X-ray, ultrasound and mammography systems.";
  if (key.includes("furniture") || key.includes("physio") || key.includes("rehab"))
    return "Hospital beds, physiotherapy and rehabilitation.";
  if (key.includes("steril") || key.includes("infection") || key.includes("cssd"))
    return "Autoclaves, disinfection and CSSD lines.";
  if (key.includes("surg") || key.includes("operat"))
    return "Operating tables, lights, lasers and endoscopy.";
  if (key.includes("life") || key.includes("support") || key.includes("monitor") || key.includes("cardio"))
    return "Patient monitors, ECG and pulmonary function.";
  if (key.includes("patient") || key.includes("care") || key.includes("primary"))
    return "Wound care, orthopaedics and continuous glucose monitoring.";
  return "Specialty medical equipment.";
}
