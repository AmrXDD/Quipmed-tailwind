import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  ShieldCheck,
  Sparkles,
  Zap,
  Users,
  Globe2,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { useCompanyInfo, useBrands, useProducts, useDepartments } from "@/hooks/useSupabase";

export default function About() {
  const c = useCompanyInfo();
  const { brands } = useBrands();
  const { products } = useProducts();
  const { departments } = useDepartments();

  return (
    <div className="min-h-screen bg-navy-900 pb-24 pt-32">
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-mint-soft"
        >
          <Sparkles size={12} /> About QuipMed
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-5 max-w-4xl text-[clamp(2.25rem,5vw,4.5rem)] font-bold leading-[0.98] tracking-tight text-primary"
        >
          Connecting the world&rsquo;s best medical technology{" "}
          <span className="text-mint">with Kuwaiti healthcare</span>.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-6 max-w-3xl text-lg leading-relaxed text-primary/70"
        >
          {c.about}
        </motion.p>

        {/* Stats strip */}
        <motion.dl
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 grid grid-cols-2 gap-4 border-t border-white/10 pt-8 md:grid-cols-4"
        >
          {[
            { k: "Brand Partners", v: `${brands.length}+` },
            { k: "Product Lines", v: `${products.length}+` },
            { k: "Specialities", v: String(departments.length) },
            { k: "Countries", v: "14" },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              <dt className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/50">
                {s.k}
              </dt>
              <dd className="mt-1 text-4xl font-bold tracking-tight text-primary">
                {s.v}
              </dd>
            </div>
          ))}
        </motion.dl>
      </section>

      {/* ── Mission / Vision ──────────────────────────── */}
      <section className="mx-auto mt-24 max-w-7xl px-5 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <MVCard
            icon={<Target size={20} />}
            tone="light"
            label="Mission"
            body={c.mission}
          />
          <MVCard
            icon={<Eye size={20} />}
            tone="dark"
            label="Vision"
            body={c.vision}
          />
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-7xl px-5 lg:px-8">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mint">
              Values
            </h2>
            <p className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Three principles that anchor every procurement decision we make.
            </p>
          </div>
        </header>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              k: c.value_01 ?? "Reliable",
              d: "Time-tested equipment, validated supply chains, and certified partners across 14 countries. We only distribute what we would stake our reputation on.",
              icon: <ShieldCheck size={16} />,
            },
            {
              n: "02",
              k: c.value_02 ?? "Modern",
              d: "From 4K flexible endoscopy to immersive VR therapy — we curate the technologies that will define the next decade of clinical practice.",
              icon: <Zap size={16} />,
            },
            {
              n: "03",
              k: c.value_03 ?? "Strong",
              d: "Long-term relationships with Neusoft, Allengers, Tuttnauer, EMS Swiss and 22 other manufacturers — backed by on-the-ground Kuwait service teams.",
              icon: <BadgeCheck size={16} />,
            },
          ].map((v, i) => (
            <motion.article
              key={v.n}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-7 transition-all hover:border-mint/40 hover:bg-white/[0.035]"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-mint/15 text-mint ring-1 ring-mint/30">
                  {v.icon}
                </span>
                <span className="text-xs font-semibold tracking-[0.24em] text-mint">
                  {v.n}
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-bold text-primary">{v.k}</h3>
              <p className="mt-3 text-sm leading-relaxed text-primary/65">
                {v.d}
              </p>
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-mint/15 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Leadership ─────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-7xl px-5 lg:px-8">
        <div className="grid gap-8 overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] md:grid-cols-[1.2fr_1fr]">
          <div className="p-8 md:p-12">
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mint">
              Leadership
            </h2>
            <p className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Operations led by {c.leadership_name}.
            </p>
            <p className="mt-5 max-w-xl text-primary/65">
              {c.leadership_name} oversees procurement, logistics and clinical
              integration as our {c.leadership_title}. Working directly with
              hospital biomedical teams, {c.leadership_name?.split(" ")[0]}{" "}
              ensures every QuipMed delivery is installed, validated and
              supported to the standard Kuwaiti healthcare expects.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-primary hover:bg-mint-soft hover:shadow-neon"
              >
                Meet the team
                <ArrowRight size={14} />
              </Link>
              <a
                href={`mailto:${c.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-white/10"
              >
                {c.email}
              </a>
            </div>
          </div>
          <div className="relative min-h-[260px] bg-mint p-10 md:min-h-full">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_60%)]" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/75">
                  Operations
                </p>
                <p className="mt-3 text-4xl font-bold leading-tight text-primary">
                  {c.leadership_name}
                </p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-[0.18em] text-primary/75">
                  {c.leadership_title}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-3 text-primary">
                <Users size={18} />
                <p className="text-sm font-medium">
                  Based at HQ · {c.city}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specialities ───────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-7xl px-5 lg:px-8">
        <header>
          <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mint">
            Specialities
          </h2>
          <p className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-primary md:text-4xl">
            {departments.length} clinical domain{departments.length === 1 ? "" : "s"}. One trusted partner.
          </p>
        </header>
        <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((d, i) => {
            const count = products.filter((p) => p.department_id === d.id).length;
            return (
              <Link
                key={d.id}
                to={`/products?department=${d.slug}`}
                className="block"
              >
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-10%" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4 transition-all hover:border-mint/30 hover:bg-white/[0.04]"
                >
                  <div>
                    <p className="font-semibold text-primary">{d.name}</p>
                    <p className="text-xs text-primary/50">
                      {count} product line{count === 1 ? "" : "s"}
                    </p>
                  </div>
                  <Globe2
                    size={18}
                    className="text-primary/30 transition-colors group-hover:text-mint"
                  />
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-5xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-10 text-center md:p-14">
          <div className="pointer-events-none absolute inset-0 bg-grid-dots-dark [background-size:24px_24px] opacity-60" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              Ready to equip your facility?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary/65">
              Tell us about your clinical requirements — we&rsquo;ll match them
              with the right brand partner and handle procurement end-to-end.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-mint px-6 py-3 text-sm font-semibold text-primary hover:bg-mint-soft hover:shadow-neon"
              >
                Start a conversation
                <ArrowRight size={14} />
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-primary hover:bg-white/10"
              >
                Browse the catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MVCard({
  icon,
  label,
  body,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
  tone: "light" | "dark";
}) {
  const light = tone === "light";
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5 }}
      className={[
        "relative overflow-hidden rounded-3xl p-8 md:p-10",
        light
          ? "border border-white/10 bg-white text-black"
          : "border border-white/5 bg-navy-900 text-primary ring-1 ring-white/5",
      ].join(" ")}
    >
      <span
        className={[
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em]",
          light ? "bg-navy-900 text-mint" : "bg-mint/15 text-mint",
        ].join(" ")}
      >
        {icon}
        {label}
      </span>
      <p
        className={[
          "mt-6 text-balance text-2xl font-semibold leading-snug md:text-3xl",
          light ? "text-black" : "text-primary",
        ].join(" ")}
      >
        <span className={light ? "text-mint" : "text-mint"}>&ldquo;</span>
        {body}
        <span className={light ? "text-mint" : "text-mint"}>&rdquo;</span>
      </p>
    </motion.article>
  );
}
