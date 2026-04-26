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
  Layers,
} from "lucide-react";
import ParticleCanvas from "@/components/ParticleCanvas";
import FloatingTag from "@/components/FloatingTag";
import { useCompanyInfo, useBrands, useProducts, useDepartments } from "@/hooks/useSupabase";

export default function Home() {
  const c = useCompanyInfo();
  const { brands } = useBrands();
  const { products } = useProducts();
  const { departments } = useDepartments();

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
              className="text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-tight text-white"
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

          {/* CT scan video — centered, transparent background */}
          <div className="absolute inset-0 grid place-items-center">
            <div className="relative h-[min(60vh,460px)] w-[min(46vh,360px)]">
              <video
                src="/ct-scan.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                aria-hidden="true"
                className="h-full w-full rounded-3xl object-cover mix-blend-screen"
                style={{ background: "transparent" }}
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
        className="relative border-t border-white/5 bg-black py-20 md:py-28"
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
                {departments.length} clinical {departments.length === 1 ? "domain" : "domains"}.{" "}
                <br className="hidden md:block" />
                <span className="text-mint-soft">End-to-end coverage.</span>
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
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] p-7 transition-all hover:border-mint-soft/40 hover:bg-white/[0.04]"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-primary ring-1 ring-mint-soft/40 transition-transform group-hover:scale-110">
                      <Layers size={20} strokeWidth={2.2} />
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold leading-tight text-primary">
                    {d.name}
                  </h3>
                  <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                    <span className="font-semibold text-mint-soft">
                      {count}{" "}
                      <span className="font-normal text-primary/50">
                        product{count === 1 ? "" : "s"}
                      </span>
                    </span>
                    <Link
                      to={`/products?department=${d.slug}`}
                      className="inline-flex items-center gap-1 text-primary/70 transition-colors hover:text-mint-soft"
                    >
                      Explore
                      <ArrowRight
                        size={12}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  </div>
                  <span className="pointer-events-none absolute -bottom-28 -right-28 h-56 w-56 rounded-full bg-mint/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />
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

          {brands.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-center text-sm text-slate-mid">
              No brand partners listed yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {brands.map((b) => (
                <div
                  key={b.id}
                  className="group relative flex h-32 flex-col items-center justify-between rounded-xl border border-white/10 bg-black p-3 text-center transition-all hover:-translate-y-0.5 hover:border-mint-soft/40 [.theme-white_&]:border-black/10 [.theme-white_&]:bg-white [.theme-white_&]:hover:border-mint-soft/60"
                >
                  <Link
                    to={`/products?brand=${b.id}`}
                    title={`See ${b.name} products`}
                    className="flex flex-1 w-full items-center justify-center"
                  >
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.name}
                        loading="lazy"
                        className="block h-10 max-h-10 w-full max-w-[140px] object-contain opacity-90 transition-opacity group-hover:opacity-100"
                      />
                    ) : (
                      <span className="flex items-center gap-2 text-sm font-semibold text-white group-hover:text-white [.theme-white_&]:text-black">
                        <span className="h-2 w-2 rounded-full bg-mint" />
                        <span className="whitespace-nowrap tracking-tight">
                          {b.name}
                        </span>
                      </span>
                    )}
                  </Link>

                  {b.website_link && (
                    <a
                      href={b.website_link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 transition-colors hover:border-mint-soft/50 hover:text-white [.theme-white_&]:border-black/15 [.theme-white_&]:bg-black/5 [.theme-white_&]:text-black/70 [.theme-white_&]:hover:text-black"
                    >
                      Visit <ArrowRight size={10} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
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
