import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import SplitType from "split-type";
import {
  Activity,
  ShieldCheck,
  Headset,
  ArrowRight,
  Sparkles,
  Scan,
  Stethoscope,
  Syringe,
  Microscope,
  HeartPulse,
  Bed,
} from "lucide-react";
import ParticleCanvas from "@/components/ParticleCanvas";
import FloatingTag from "@/components/FloatingTag";
import BrandLogoGrid from "@/components/BrandLogoGrid";
import { useCompanyInfo, useBrands, useProducts, useDepartments } from "@/hooks/useSupabase";

export default function Home() {
  const c = useCompanyInfo();
  const { brands } = useBrands();
  const { products } = useProducts();
  const { departments } = useDepartments();

  const subsByDept = (() => {
    const map = new Map<string, string[]>();
    for (const d of departments) map.set(d.id, []);
    for (const p of products) {
      if (!p.department_id || !p.subcategory) continue;
      const arr = map.get(p.department_id);
      if (!arr) continue;
      if (!arr.includes(p.subcategory)) arr.push(p.subcategory);
    }
    for (const arr of map.values()) arr.sort();
    return map;
  })();

  const sloganRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!sloganRef.current) return;
    const split = new SplitType(sloganRef.current, {
      types: "lines,words,chars",
      tagName: "span",
    });
    gsap.set(split.chars, { y: "110%", opacity: 0 });
    const tl = gsap.timeline();
    tl.to(split.chars, {
      y: "0%",
      opacity: 1,
      stagger: 0.02,
      duration: 0.9,
      ease: "expo.out",
      delay: 0.15,
    });
    if (subRef.current) {
      tl.from(
        subRef.current,
        { y: 24, duration: 0.7, ease: "expo.out", clearProps: "transform" },
        "-=0.5",
      );
    }
    return () => {
      split.revert();
    };
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          HERO — Solid navy background, content-first
          ──────────────────────────────────────────────────────── */}
      <section
        className="hero-surface relative isolate flex min-h-[100svh] w-full overflow-hidden"
      >
        {/* subtle dotted grid for texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-dots-dark [background-size:28px_28px] opacity-40"
        />

        {/* ── Content ──────────────────────────────────────── */}
        <div className="relative z-10 flex w-full flex-col justify-center pt-28 md:w-[55%] lg:w-[52%]">
          <div className="px-6 sm:px-10 md:px-14 lg:pl-20 lg:pr-8">
            <motion.span
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-mint-soft/40 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-mint-soft"
            >
              <Sparkles size={12} />
              {c.country} · {c.city}
            </motion.span>

            <h1
              ref={sloganRef}
              className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[1.08] tracking-tight text-white pb-2"
              style={{ paddingBottom: "0.15em" }}
            >
              Leading Medical <br />
              <span className="relative inline-block">
                Innovation
                <span className="text-mint-soft">.</span>
              </span>
            </h1>

            <p
              ref={subRef}
              className="mt-6 max-w-xl text-base leading-relaxed text-white sm:text-lg"
            >
              {c.about}
            </p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="mt-9 flex flex-wrap items-center gap-3"
            >
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 rounded-full bg-mint-soft px-6 py-3 text-sm font-semibold text-navy-900 transition-all hover:bg-white hover:shadow-neon"
              >
                Explore Products
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:border-mint-soft/60 hover:bg-white/10"
              >
                Partner with us
              </Link>
            </motion.div>

            <motion.dl
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6"
            >
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                  Brand Partners
                </dt>
                <dd className="mt-1 font-display text-3xl font-bold text-white">
                  {brands.length}
                  <span className="text-mint-soft">+</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                  Product Lines
                </dt>
                <dd className="mt-1 font-display text-3xl font-bold text-white">
                  {products.length}
                  <span className="text-mint-soft">+</span>
                </dd>
              </div>
              <div>
                <dt className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                  Specialities
                </dt>
                <dd className="mt-1 font-display text-3xl font-bold text-white">
                  6
                </dd>
              </div>
            </motion.dl>
          </div>
        </div>

        {/* ── Right side — CT scan video ────────────────────── */}
        <div className="relative z-0 hidden flex-1 md:block">
          <ParticleCanvas opacity={0.25} density={11000} color="#43B649" />

          {/* soft bloom behind video */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 grid place-items-center"
          >
            <div className="h-[60%] w-[60%] rounded-[48px] bg-gradient-to-br from-cyan-neon/10 via-mint/10 to-transparent blur-3xl" />
          </div>

          {/* CT scan video — centered, black background keyed out via luminance-to-alpha */}
          <div className="absolute inset-0 grid place-items-center">
            {/* SVG filter: maps dark pixels (black bg) to transparent */}
            <svg
              aria-hidden="true"
              width="0"
              height="0"
              style={{ position: "absolute" }}
            >
              <defs>
                <filter id="ctscan-chromakey">
                  <feColorMatrix
                    type="matrix"
                    values="
                      1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      4 4 4 0 -1.2"
                  />
                </filter>
              </defs>
            </svg>
            <div className="relative h-[min(60vh,460px)] w-[min(46vh,360px)]">
              <video
                src="/ct-scan.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                className="h-full w-full rounded-3xl object-cover"
                style={{
                  background: "transparent",
                  filter: "url(#ctscan-chromakey) contrast(1.05) brightness(1.05)",
                }}
              />

              {/* Floating tags — absolute, positioned around the video */}
              <FloatingTag
                icon={<Activity size={15} strokeWidth={2.4} />}
                label={`${brands.length}+ Brand Partners`}
                delay={1.2}
                className="absolute -left-28 -top-6 lg:-left-40"
              />
              <FloatingTag
                icon={<ShieldCheck size={15} strokeWidth={2.4} />}
                label="ISO Approved"
                delay={1.35}
                bob={5}
                bobDuration={6}
                className="absolute -right-24 top-6 lg:-right-36"
              />
              <FloatingTag
                icon={<Headset size={15} strokeWidth={2.4} />}
                label="24/7 Technical"
                delay={1.5}
                bob={7}
                bobDuration={5.5}
                className="absolute -left-28 bottom-4 lg:-left-44"
              />
            </div>
          </div>
        </div>

        {/* ── Mobile hint ────────────────────────────────────── */}
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center md:hidden">
          <div className="rounded-2xl border border-white/15 bg-navy-900/70 px-4 py-3 text-xs text-white/80 backdrop-blur">
            ↓ Scroll to explore
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          OUR SOLUTIONS — six clinical domains
          ──────────────────────────────────────────────────────── */}
      <section
        id="solutions"
        className="relative border-t border-white/5 bg-navy-900 py-20 md:py-28"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-grid-dots-dark [background-size:28px_28px] opacity-40"
        />
        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mint-soft">
                Our Solutions
              </h2>
              <p className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-primary md:text-5xl">
                {departments.length}{" "}
                <span className="text-white">
                  Medical {departments.length === 1 ? "Department" : "Departments"}
                </span>
                <span className="text-mint-soft"> & Healthcare solutions provider</span>
              </p>
              <p className="mt-5 max-w-xl text-primary/65">
                From first diagnosis to recovery, QuipMed curates and supplies
                everything a modern hospital needs — vetted, certified, and
                delivered with white-glove installation.
              </p>
            </div>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-primary transition-all hover:border-mint-soft/40 hover:bg-white/[0.06]"
            >
              See full catalogue
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                  {(subsByDept.get(d.id) ?? []).length > 0 && (
                    <div className="relative mt-5 -mx-1 overflow-x-auto">
                      <div className="flex min-w-max gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5">
                        {(subsByDept.get(d.id) ?? []).map((s) => {
                          const subCount = products.filter(
                            (p) => p.department_id === d.id && p.subcategory === s,
                          ).length;
                          return (
                            <Link
                              key={s}
                              to={`/products?department=${d.slug}&sub=${encodeURIComponent(s)}`}
                              className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-medium text-white/75 transition-colors hover:bg-mint hover:text-navy-900"
                            >
                              {s}
                              <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white/80">
                                {subCount}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="relative mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs">
                    <span className="font-semibold text-mint-soft">
                      {count}{" "}
                      <span className="font-normal text-white/60">
                        product{count === 1 ? "" : "s"}
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
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          VALUES STRIP
          ──────────────────────────────────────────────────────── */}
      <section className="relative border-t border-white/5 bg-navy-900 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-neon">
                Values
              </h2>
              <p className="mt-3 max-w-xl text-3xl font-bold tracking-tight text-primary md:text-4xl">
                What holds the QuipMed promise together.
              </p>
            </div>
            <Link
              to="/products"
              className="text-sm font-medium text-slate-light/80 hover:text-cyan-neon"
            >
              Browse the catalogue →
            </Link>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                n: "01",
                k: "Reliable",
                d: "Time-tested equipment, validated supply chains, and certified partners across 14 countries.",
              },
              {
                n: "02",
                k: "Modern",
                d: "From 4K endoscopy to immersive VR therapy — the latest technologies carefully curated for Kuwaiti healthcare.",
              },
              {
                n: "03",
                k: "Strong",
                d: "Backed by long-term brand relationships with Neusoft, Allengers, Tuttnauer, EMS Swiss and more.",
              },
            ].map((v) => (
              <motion.article
                key={v.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
                className="group relative overflow-hidden rounded-2xl border border-white/5 bg-navy-800/60 p-7 transition-all hover:border-cyan-neon/30"
              >
                <span className="text-xs font-semibold tracking-[0.22em] text-mint">
                  {v.n}
                </span>
                <h3 className="mt-2 text-2xl font-bold text-primary">{v.k}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-mid">
                  {v.d}
                </p>
                <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-cyan-neon/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED BRANDS — dynamic, click-to-filter
          ──────────────────────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-navy-800 py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mint-soft">
                Brand Partners
              </h3>
              <p className="mt-2 text-2xl font-bold text-primary md:text-3xl">
                Trusted manufacturers, one click away.
              </p>
            </div>
            <Link
              to="/brands"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-light hover:border-mint-soft/40 hover:text-white"
            >
              View all brands
              <ArrowRight size={12} />
            </Link>
          </div>

          <BrandLogoGrid brands={brands} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MISSION / CTA
          ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-white/5 bg-navy-900 py-20 md:py-28">
        <div
          className="pointer-events-none absolute inset-0 bg-grid-dots-dark [background-size:26px_26px] opacity-60"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-5 text-center lg:px-8">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-neon">
            Mission
          </h3>
          <blockquote className="mt-6 text-balance text-3xl font-semibold leading-tight text-primary md:text-5xl">
            <span className="text-mint">&ldquo;</span>
            {c.mission}
            <span className="text-mint">&rdquo;</span>
          </blockquote>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-7 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-mint-soft hover:shadow-neon"
            >
              Request a consultation
              <ArrowRight size={16} />
            </Link>
            <a
              href={`mailto:${c.email}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-primary transition-all hover:bg-white/10"
            >
              {c.email}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function getDepartmentMeta(slug: string, name: string) {
  const key = `${slug} ${name}`.toLowerCase();
  if (key.includes("imag") || key.includes("diagnostic"))
    return { Icon: Scan, gradient: "from-cyan-500/20 via-blue-500/10 to-transparent", tagline: "MRI, CT, X-ray, ultrasound and mammography systems." };
  if (key.includes("furniture") || key.includes("physio"))
    return { Icon: Bed, gradient: "from-emerald-500/20 via-teal-500/10 to-transparent", tagline: "Hospital beds, physiotherapy and rehabilitation." };
  if (key.includes("steril") || key.includes("infection"))
    return { Icon: ShieldCheck, gradient: "from-violet-500/20 via-fuchsia-500/10 to-transparent", tagline: "Autoclaves, disinfection and CSSD lines." };
  if (key.includes("surg"))
    return { Icon: Syringe, gradient: "from-rose-500/20 via-orange-500/10 to-transparent", tagline: "OR tables, lights, lasers and endoscopy." };
  if (key.includes("patient") || key.includes("care"))
    return { Icon: Stethoscope, gradient: "from-mint/20 via-cyan-neon/10 to-transparent", tagline: "Wound care, orthopedics and CGM." };
  if (key.includes("life") || key.includes("support") || key.includes("monitor"))
    return { Icon: HeartPulse, gradient: "from-red-500/20 via-pink-500/10 to-transparent", tagline: "Patient monitors, ECG and pulmonary function." };
  return { Icon: Microscope, gradient: "from-mint/20 via-cyan-neon/10 to-transparent", tagline: "Specialty medical equipment." };
}
