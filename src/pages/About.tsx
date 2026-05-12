import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  BadgeCheck,
  Scan,
  Bed,
  Syringe,
  Stethoscope,
  HeartPulse,
  Microscope,
  Linkedin,
  Mail,
  MapPin,
  Briefcase,
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
        <div className="grid gap-4 md:grid-cols-2">
          <MVCard
            icon={<Target size={24} strokeWidth={2.2} />}
            label="Mission"
            n="01"
            gradient="from-cyan-500/20 via-blue-500/10 to-transparent"
            body={c.mission}
          />
          <MVCard
            icon={<Eye size={24} strokeWidth={2.2} />}
            label="Vision"
            n="02"
            gradient="from-mint/20 via-cyan-neon/10 to-transparent"
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
              Icon: ShieldCheck,
              gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
            },
            {
              n: "02",
              k: c.value_02 ?? "Modern",
              d: "From 4K flexible endoscopy to immersive VR therapy — we curate the technologies that will define the next decade of clinical practice.",
              Icon: Zap,
              gradient: "from-mint/20 via-cyan-neon/10 to-transparent",
            },
            {
              n: "03",
              k: c.value_03 ?? "Strong",
              d: "Long-term relationships with Neusoft, Allengers, Tuttnauer, EMS Swiss and 22 other manufacturers — backed by on-the-ground Kuwait service teams.",
              Icon: BadgeCheck,
              gradient: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
            },
          ].map((v, i) => (
            <motion.article
              key={v.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              whileHover={{ y: -4 }}
              className="solution-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-navy-800/70 p-7 shadow-[0_4px_30px_rgba(0,0,0,0.25)] transition-all hover:border-mint-soft/50 hover:bg-navy-800"
            >
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${v.gradient} opacity-60`}
              />
              <div className="relative flex items-start justify-between">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-navy-900 ring-1 ring-mint-soft/50 transition-transform group-hover:scale-110">
                  <v.Icon size={24} strokeWidth={2.2} />
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                  {v.n}
                </span>
              </div>
              <h3 className="relative mt-6 text-xl font-bold leading-tight text-white">
                {v.k}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-white/70">
                {v.d}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Leadership ─────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-navy-800/70 shadow-[0_4px_30px_rgba(0,0,0,0.25)]"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-mint/10 to-transparent opacity-60"
          />
          <div className="relative grid gap-0 md:grid-cols-[1fr_1.2fr]">
            {/* Portrait + per-person LinkedIn pills */}
            <div className="relative isolate aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[560px]">
              <img
                src="/jassim-alkajek.jpg"
                alt="QuipMed leadership team at the Convention Gate"
                className="absolute inset-0 h-full w-full object-cover object-center saturate-[1.05] contrast-[1.02]"
                loading="lazy"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-900/70 via-transparent to-navy-900/30"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-r from-transparent to-navy-800 md:block"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy-800 to-transparent md:hidden"
              />

              {/* Floating LinkedIn pills above each person's head */}
              {LEADERSHIP_PEOPLE.map((p) => (
                <a
                  key={p.name}
                  href={p.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${p.name}'s LinkedIn profile`}
                  className="leadership-pill group/pill absolute -translate-x-1/2 inline-flex max-w-[44vw] items-center gap-2 rounded-full border px-2.5 py-1.5 backdrop-blur-md md:max-w-[200px]"
                  style={{ left: `${p.x}%`, top: `${p.y}%` }}
                >
                  <span className="leadership-pill-icon grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform group-hover/pill:scale-110">
                    <Linkedin size={12} strokeWidth={2.6} />
                  </span>
                  <span className="leadership-pill-text truncate text-[11px] font-semibold leading-tight">
                    {p.name}
                  </span>
                </a>
              ))}
            </div>

            {/* Info */}
            <div className="relative p-8 md:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-mint/30 bg-mint/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-mint-soft">
                <Sparkles size={12} /> Leadership
              </span>
              <h2 className="mt-4 whitespace-nowrap font-bold tracking-tight text-white text-[clamp(1.1rem,3vw,2.25rem)] leading-tight">
                Operations led by{" "}
                <span className="text-mint-soft">Eng. Jassim Al Kajek</span>.
              </h2>
              <p className="mt-5 max-w-xl text-white/70">
                A biomedical engineer with hands-on experience across medical
                equipment procurement, installation and after-sales service in
                Kuwait. Eng. Jassim leads QuipMed&rsquo;s operations end-to-end
                — from manufacturer qualification and tender management to
                on-site commissioning with hospital biomedical teams.
              </p>

              {/* Highlight badges */}
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="leadership-icon-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-navy-900 ring-1 ring-mint-soft/50">
                    <BadgeCheck size={16} strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mint-soft">
                      Background
                    </p>
                    <p className="text-sm font-medium text-white">
                      Biomedical Engineering
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="leadership-icon-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-navy-900 ring-1 ring-mint-soft/50">
                    <MapPin size={16} strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mint-soft">
                      Based in
                    </p>
                    <p className="text-sm font-medium text-white">
                      Kuwait City · GCC region
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="leadership-icon-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-navy-900 ring-1 ring-mint-soft/50">
                    <ShieldCheck size={16} strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mint-soft">
                      Focus areas
                    </p>
                    <p className="text-sm font-medium text-white">
                      Imaging · Surgical · CSSD
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                  <span className="leadership-icon-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-navy-900 ring-1 ring-mint-soft/50">
                    <Briefcase size={16} strokeWidth={2.4} />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mint-soft">
                      Role
                    </p>
                    <p className="text-sm font-medium text-white">
                      Operations & Partnerships
                    </p>
                  </div>
                </li>
              </ul>

              {/* CTAs */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a
                  href="mailto:eng.jassim@quipmed.co"
                  className="inline-flex items-center gap-2 rounded-full bg-mint px-5 py-2.5 text-sm font-semibold text-navy-900 transition-all hover:bg-mint-soft hover:shadow-neon"
                >
                  <Mail size={14} strokeWidth={2.4} />
                  eng.jassim@quipmed.co
                </a>
                <a
                  href="https://www.linkedin.com/in/jassim-alkajek-18947584"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-mint-soft/50 hover:bg-white/10"
                >
                  <Linkedin size={14} strokeWidth={2.4} />
                  LinkedIn
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:border-mint-soft/50 hover:bg-white/10"
                >
                  Meet the team
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
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
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((d, i) => {
            const count = products.filter((p) => p.department_id === d.id).length;
            const meta = getDepartmentMeta(d.slug, d.name);
            const Icon = meta.Icon;
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{
                  duration: 0.5,
                  delay: (i % 3) * 0.08,
                  ease: [0.2, 0.7, 0.2, 1],
                }}
                whileHover={{ y: -4 }}
                className="solution-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-navy-800/70 p-7 shadow-[0_4px_30px_rgba(0,0,0,0.25)] transition-all hover:border-mint-soft/50 hover:bg-navy-800"
              >
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.gradient} opacity-60`}
                />
                <div className="relative flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-navy-900 ring-1 ring-mint-soft/50 transition-transform group-hover:scale-110">
                    <Icon size={24} strokeWidth={2.2} />
                  </span>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="relative mt-6 text-xl font-bold leading-tight text-white">
                  {d.name}
                </h3>
                <p className="relative mt-2 text-sm text-white/70">
                  {meta.tagline}
                </p>
                <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                  <span className="font-semibold text-mint-soft">
                    {count}{" "}
                    <span className="font-normal text-white/60">
                      product line{count === 1 ? "" : "s"}
                    </span>
                  </span>
                  <Link
                    to={`/products?department=${d.slug}`}
                    className="inline-flex items-center gap-1 font-semibold text-white transition-colors hover:text-mint-soft"
                  >
                    Explore
                    <ArrowRight
                      size={12}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </motion.div>
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

const LEADERSHIP_PEOPLE = [
  {
    name: "Eng. Jassim Al Kajek",
    linkedin: "https://www.linkedin.com/in/jassim-alkajek-18947584",
    // % of photo container — sits above the person's head
    x: 22,
    y: 6,
  },
  {
    name: "Mr. Jassim Bin Essa",
    linkedin: "https://www.linkedin.com/in/jasem-bin-essa-46b4a4158",
    x: 50,
    y: 8,
  },
  {
    name: "Eng. Mohamed Rajab",
    linkedin: "https://www.linkedin.com/in/m-rajab-homsi-912332116",
    x: 78,
    y: 10,
  },
];

function MVCard({
  icon,
  label,
  body,
  n,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  body: string;
  n: string;
  gradient: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
      whileHover={{ y: -4 }}
      className="solution-card group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-navy-800/70 p-7 shadow-[0_4px_30px_rgba(0,0,0,0.25)] transition-all hover:border-mint-soft/50 hover:bg-navy-800"
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-60`}
      />
      <div className="relative flex items-start justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-navy-900 ring-1 ring-mint-soft/50 transition-transform group-hover:scale-110">
          {icon}
        </span>
        <span className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white">
          {n}
        </span>
      </div>
      <h3 className="relative mt-6 text-xl font-bold leading-tight text-white">
        {label}
      </h3>
      <p className="relative mt-2 text-sm leading-relaxed text-white/70">
        {body}
      </p>
    </motion.article>
  );
}

function getDepartmentMeta(slug: string, name: string) {
  const s = (slug || name || "").toLowerCase();
  if (s.includes("radio") || s.includes("imag"))
    return {
      Icon: Scan,
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      tagline: "MRI, CT, X-ray, ultrasound and mammography systems.",
    };
  if (s.includes("rehab") || s.includes("bed") || s.includes("physio"))
    return {
      Icon: Bed,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      tagline: "Hospital beds, physiotherapy and rehabilitation.",
    };
  if (s.includes("steril") || s.includes("infection") || s.includes("cssd"))
    return {
      Icon: ShieldCheck,
      gradient: "from-violet-500/20 via-fuchsia-500/10 to-transparent",
      tagline: "Autoclaves, disinfection and CSSD lines.",
    };
  if (s.includes("surg") || s.includes("operat") || s.includes("endo"))
    return {
      Icon: Syringe,
      gradient: "from-rose-500/20 via-orange-500/10 to-transparent",
      tagline: "OR tables, lights, lasers and endoscopy.",
    };
  if (s.includes("primary") || s.includes("general") || s.includes("care"))
    return {
      Icon: Stethoscope,
      gradient: "from-mint/20 via-cyan-neon/10 to-transparent",
      tagline: "Wound care, orthopedics and CGM.",
    };
  if (s.includes("cardio") || s.includes("monitor") || s.includes("pulmo"))
    return {
      Icon: HeartPulse,
      gradient: "from-red-500/20 via-pink-500/10 to-transparent",
      tagline: "Patient monitors, ECG and pulmonary function.",
    };
  return {
    Icon: Microscope,
    gradient: "from-mint/20 via-cyan-neon/10 to-transparent",
    tagline: "Specialty medical equipment.",
  };
}
