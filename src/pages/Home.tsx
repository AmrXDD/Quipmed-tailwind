import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import SplitType from "split-type";
import BrandLogoGrid from "@/components/BrandLogoGrid";
import DepartmentIndex from "@/components/DepartmentIndex";
import ValuesList from "@/components/ValuesList";
import DisciplineMarquee from "@/components/DisciplineMarquee";
import { Eyebrow, PrimaryButton, TextLink, useInViewOnce } from "@/components/ui/primitives";
import { useCompanyInfo, useBrands, useProducts, useDepartments } from "@/hooks/useSupabase";
import { markPreloader, usePreloaderLeaving } from "@/lib/preloader";
import { useThemeMode } from "@/lib/theme";
import { useTier } from "@/lib/perf";
import BrainStill from "@/components/BrainStill";
import { BadgeCheck, ShieldCheck, Zap } from "lucide-react";

// If the chunk can't load (e.g. a tab left open across a new deploy),
// show the fallback instead of crashing the page.
type BrainScanProps = React.ComponentProps<typeof import("@/components/BrainScan").default>;
const BrainScan = lazy(() =>
  import("@/components/BrainScan").catch(() => ({
    default: function BrainScanUnavailable(props: BrainScanProps) {
      useEffect(() => props.onReady(), [props]);
      return <>{props.fallback}</>;
    },
  })),
);

const VALUES = [
  {
    Icon: ShieldCheck,
    k: "Reliable",
    d: "Time-tested equipment, validated supply chains and certified manufacturers. We only distribute what we would put our own name behind.",
  },
  {
    Icon: Zap,
    k: "Modern",
    d: "From 4K endoscopy to immersive VR therapy, we bring in the technologies that will shape the next decade of clinical practice in Kuwait.",
  },
  {
    Icon: BadgeCheck,
    k: "Strong",
    d: "Long-term relationships with Neusoft, Allengers, Tuttnauer, EMS Swiss and more, supported by a service team on the ground in Kuwait.",
  },
];

export default function Home() {
  const c = useCompanyInfo();
  const { brands } = useBrands();
  const { products } = useProducts();
  const { departments } = useDepartments();
  const theme = useThemeMode();
  const tier = useTier();
  const leaving = usePreloaderLeaving();

  const titleRef = useRef<HTMLHeadingElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const sliceRef = useRef<HTMLSpanElement>(null);
  const depthRef = useRef<HTMLSpanElement>(null);

  // Headline: lines rise out of a mask once the preloader starts leaving.
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    if (window.__quipmedPreloader?.done) return; // client-side navigation: no intro
    gsap.set(introRef.current?.children ?? [], { opacity: 0, y: 18 });
    let split: SplitType | null = null;
    let cancelled = false;
    // Split after fonts load so line breaks match the final layout.
    document.fonts.ready.then(() => {
      if (cancelled) return;
      split = new SplitType(el, { types: "lines,words", tagName: "span" });
      gsap.set(split.words, { yPercent: 110 });
    });
    return () => {
      cancelled = true;
      split?.revert();
    };
  }, []);

  useEffect(() => {
    if (!leaving || !titleRef.current) return;
    if (!titleRef.current.querySelector(".word")) {
      gsap.set(introRef.current?.children ?? [], { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }
    const words = titleRef.current.querySelectorAll(".word");
    const tl = gsap.timeline({ delay: 0.25 });
    tl.to(words, { yPercent: 0, duration: 1.15, ease: "expo.out", stagger: 0.06 });
    if (introRef.current) {
      tl.to(
        introRef.current.children,
        { opacity: 1, y: 0, duration: 0.9, ease: "expo.out", stagger: 0.08, clearProps: "transform" },
        "-=0.8",
      );
    }
    return () => {
      tl.kill();
    };
  }, [leaving]);

  const onBrainReady = useCallback(() => markPreloader("hero"), []);

  // Arriving from another page: start the 3D scene after the route curtain
  // has lifted, so its one-off GPU warm-up never lands on the click.
  // On first load the preloader covers it, so start immediately.
  const [sceneOn, setSceneOn] = useState(() => !window.__quipmedPreloader?.done);
  useEffect(() => {
    if (sceneOn) return;
    const t = window.setTimeout(() => setSceneOn(true), 950);
    return () => window.clearTimeout(t);
  }, [sceneOn]);

  // CT readout, written straight to the DOM every frame.
  const onScan = useCallback((p: number) => {
    const slice = Math.round(p * 159) + 1;
    if (sliceRef.current) sliceRef.current.textContent = String(slice).padStart(3, "0");
    if (depthRef.current)
      depthRef.current.textContent = `${(64 - p * 128).toFixed(1).padStart(5, " ")} mm`;
  }, []);

  const mission = useInViewOnce<HTMLQuoteElement>();

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          HERO
          ──────────────────────────────────────────────────────── */}
      <section className="hero-surface relative isolate overflow-hidden">
        <div className="mx-auto grid min-h-[100svh] max-w-[90rem] grid-cols-1 content-center items-center gap-y-6 px-5 pb-40 pt-28 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] lg:gap-x-4 lg:px-12 lg:pb-36">
          <div className="relative z-10">
            <h1
              ref={titleRef}
              className="text-[clamp(3rem,7.2vw,7rem)] font-semibold leading-[0.9] tracking-[-0.045em] text-primary [&_.line]:-mb-[0.2em] [&_.line]:overflow-hidden [&_.line]:pb-[0.2em] [&_.word]:!overflow-visible [&_.word]:!pb-0 [&_.word]:!leading-[0.9]"
            >
              Leading medical innovation.
            </h1>

            <div ref={introRef}>
              <p className="mt-8 max-w-[44ch] text-pretty text-[17px] leading-relaxed text-slate-mid sm:text-lg">
                {c.about}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                <PrimaryButton to="/products">Explore products</PrimaryButton>
                <TextLink to="/contact">Partner with us</TextLink>
              </div>
            </div>
          </div>

          {/* Brain under the scanner */}
          <div className="relative mx-auto aspect-square w-full max-w-[34rem] lg:max-w-none">
            {tier === "full" ? (
              // Full: the live 3D scene. The matching still stands in while
              // its code loads and right after an in-app visit to Home.
              <Suspense fallback={<BrainStill theme={theme} className="absolute inset-0" />}>
                {sceneOn ? (
                  <BrainScan
                    theme={theme}
                    onReady={onBrainReady}
                    onScan={onScan}
                    className="absolute inset-0"
                    fallback={<BrainStill theme={theme} onReady={onBrainReady} onScan={onScan} className="absolute inset-0" />}
                  />
                ) : (
                  <BrainStill theme={theme} onScan={onScan} className="absolute inset-0" />
                )}
              </Suspense>
            ) : (
              // Lite: pre-rendered stills + CSS scan. No WebGL is downloaded.
              <BrainStill theme={theme} onReady={onBrainReady} onScan={onScan} className="absolute inset-0" />
            )}

            {/* Readout, set like the corner annotations on a scan film */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-2 top-2 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid sm:inset-x-6 sm:top-6"
            >
              <span>CT · Axial</span>
              <span className="tnum">
                Slice <span ref={sliceRef} className="text-primary">001</span> / 160
              </span>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-2 bottom-2 flex justify-between font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid sm:inset-x-6 sm:bottom-6"
            >
              <span>
                Z <span ref={depthRef} className="tnum whitespace-pre text-primary">64.0 mm</span>
              </span>
              <span>Diagnostic imaging</span>
            </div>
          </div>
        </div>

        {/* Key figures */}
        <div className="absolute inset-x-0 bottom-0 z-10 border-t border-line">
          <dl className="mx-auto grid max-w-[90rem] grid-cols-3 px-5 sm:px-8 lg:grid-cols-4 lg:px-12">
            {[
              { k: "Brand partners", v: brands.length },
              { k: "Product lines", v: products.length },
              { k: "Departments", v: departments.length },
            ].map((s, i) => (
              <div
                key={s.k}
                className={`py-5 lg:py-6 ${i > 0 ? "border-l border-line pl-4 sm:pl-6" : ""}`}
              >
                <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid">
                  {s.k}
                </dt>
                <dd className="tnum mt-1.5 text-2xl font-medium tracking-tight text-primary sm:text-3xl">
                  {s.v > 0 ? s.v : "—"}
                </dd>
              </div>
            ))}
            <div className="hidden items-end justify-end py-6 lg:flex">
              <a
                href="#solutions"
                className="group inline-flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid transition-colors hover:text-primary"
              >
                Scroll
                <span className="relative block h-8 w-px overflow-hidden bg-line-strong">
                  <span className="absolute inset-x-0 top-0 h-3 animate-[scroll-cue_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite] bg-scan" />
                </span>
              </a>
            </div>
          </dl>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          01 — SOLUTIONS
          ──────────────────────────────────────────────────────── */}
      <section id="solutions" className="relative bg-navy-900 pb-24 pt-24 md:pb-36 md:pt-36">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-end">
            <div>
              <Eyebrow index="01">Solutions</Eyebrow>
              <h2 data-reveal="left" className="mt-6 max-w-[16ch] text-balance text-[clamp(2.1rem,4.4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-primary">
                Everything a modern hospital needs, from diagnosis to recovery.
              </h2>
            </div>
            <div data-reveal="right" data-reveal-delay="0.1" className="md:justify-self-end">
              <p className="max-w-[46ch] text-pretty text-[17px] leading-relaxed text-slate-mid">
                {departments.length} clinical departments, each sourced from
                manufacturers we have vetted ourselves and delivered with
                installation and after-sales support.
              </p>
              <TextLink to="/products" className="mt-6">
                See the full catalogue
              </TextLink>
            </div>
          </div>

          <div className="mt-16 md:mt-24">
            <DepartmentIndex departments={departments} products={products} />
          </div>
        </div>
      </section>

      <DisciplineMarquee
        top={departments.map((d) => d.name)}
        bottom={brands.length ? brands.map((b) => b.name) : departments.map((d) => d.name)}
      />

      {/* ════════════════════════════════════════════════════════
          02 — VALUES
          ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-navy-800 py-24 md:py-36">
        <div className="mx-auto grid max-w-[90rem] gap-14 px-5 sm:px-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-12">
          <div className="md:sticky md:top-32 md:self-start">
            <Eyebrow index="02">Values</Eyebrow>
            <h2 data-reveal="clip-left" className="mt-6 max-w-[14ch] text-balance text-[clamp(2.1rem,4.4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-primary">
              What holds the QuipMed promise together.
            </h2>
          </div>
          <ValuesList
            items={VALUES.map((v, i) => ({ k: c[`value_0${i + 1}`] || v.k, d: v.d, Icon: v.Icon }))}
          />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          03 — BRAND PARTNERS
          ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-navy-900 py-24 md:py-32">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow index="03">Manufacturers</Eyebrow>
              <h2 data-reveal="right" className="mt-6 max-w-[18ch] text-balance text-[clamp(2.1rem,4.4vw,3.9rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-primary">
                The brands behind the equipment.
              </h2>
            </div>
            <TextLink to="/brands">All brands</TextLink>
          </div>
          <div data-reveal="clip-up">
            <BrandLogoGrid brands={brands} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          04 — MISSION
          ──────────────────────────────────────────────────────── */}
      <section className="border-t border-line bg-navy-900 py-28 md:py-40">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
          <Eyebrow index="04">Mission</Eyebrow>
          <blockquote
            ref={mission.ref}
            className={`scan-once mt-10 max-w-[34ch] text-balance text-[clamp(1.7rem,3.3vw,3rem)] font-medium leading-[1.14] tracking-[-0.025em] text-primary ${mission.inView ? "is-in" : ""}`}
          >
            {c.mission}
          </blockquote>
          <div data-reveal="right" className="mt-14 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-10">
            <PrimaryButton to="/contact">Request a consultation</PrimaryButton>
            <TextLink href={`mailto:${c.email}`}>{c.email}</TextLink>
          </div>
        </div>
      </section>
    </>
  );
}
