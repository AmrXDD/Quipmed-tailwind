import { Link } from "react-router-dom";
import { BadgeCheck, Briefcase, Eye, Linkedin, MapPin, ShieldCheck, Stethoscope, Target, Zap } from "lucide-react";
import DepartmentIndex from "@/components/DepartmentIndex";
import ValuesList from "@/components/ValuesList";
import { Eyebrow, PageHeader, PrimaryButton, TextLink } from "@/components/ui/primitives";
import { useCompanyInfo, useBrands, useProducts, useDepartments } from "@/hooks/useSupabase";

export default function About() {
  const c = useCompanyInfo();
  const { brands } = useBrands();
  const { products } = useProducts();
  const { departments } = useDepartments();

  const values = [
    {
      Icon: ShieldCheck,
      k: c.value_01 || "Reliable",
      d: "Time-tested equipment, validated supply chains and certified partners across 14 countries. We only distribute what we would stake our reputation on.",
    },
    {
      Icon: Zap,
      k: c.value_02 || "Modern",
      d: "From 4K flexible endoscopy to immersive VR therapy, we bring in the technologies that will define the next decade of clinical practice.",
    },
    {
      Icon: BadgeCheck,
      k: c.value_03 || "Strong",
      d: "Long-term relationships with Neusoft, Allengers, Tuttnauer, EMS Swiss and other manufacturers, backed by service teams on the ground in Kuwait.",
    },
  ];

  const stats = [
    { k: "Brand partners", v: brands.length ? String(brands.length) : "—" },
    { k: "Product lines", v: products.length ? String(products.length) : "—" },
    { k: "Departments", v: String(departments.length) },
    { k: "Countries of origin", v: "14" },
  ];

  return (
    <div className="min-h-screen bg-navy-900 pb-28 pt-36">
      {/* ── Header ─────────────────────────────────────── */}
      <section className="mx-auto max-w-[90rem] px-5 sm:px-8 lg:px-12">
        <PageHeader
          eyebrow="About QuipMed"
          title={
            <>
              Connecting the world&rsquo;s best medical technology{" "}
              <span className="text-slate-mid">with Kuwaiti healthcare.</span>
            </>
          }
          lead={c.about}
        />
        <dl className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.k}
              data-reveal="up"
              data-reveal-delay={String(i * 0.08)}
              className={`border-b border-line py-7 md:border-b-0 ${i % 2 === 1 ? "border-l pl-5" : ""} ${i > 0 ? "md:border-l md:pl-6" : ""}`}
            >
              <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid">{s.k}</dt>
              <dd className="tnum mt-2 text-4xl font-medium tracking-[-0.03em] text-primary md:text-5xl">{s.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Mission / Vision ──────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[90rem] px-5 sm:px-8 md:mt-36 lg:px-12">
        <div className="grid border-t border-line md:grid-cols-2">
          {[
            { label: "Mission", body: c.mission, Icon: Target },
            { label: "Vision", body: c.vision, Icon: Eye },
          ].map((m, i) => (
            <article
              key={m.label}
              data-reveal={i === 0 ? "left" : "right"}
              className={`py-12 md:py-16 ${i === 1 ? "border-t border-line md:border-l md:border-t-0 md:pl-12" : "md:pr-12"}`}
            >
              <Eyebrow index={`0${i + 1}`}>{m.label}</Eyebrow>
              <m.Icon aria-hidden="true" strokeWidth={1.25} className="mt-8 h-9 w-9 text-scan" />
              <p className="mt-5 max-w-[30ch] text-balance text-[clamp(1.5rem,2.6vw,2.25rem)] font-medium leading-[1.2] tracking-[-0.02em] text-primary">
                {m.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Values ─────────────────────────────────────── */}
      <section className="mt-12 border-y border-line bg-navy-800 py-24 md:py-32">
        <div className="mx-auto grid max-w-[90rem] gap-14 px-5 sm:px-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:px-12">
          <div className="md:sticky md:top-32 md:self-start">
            <Eyebrow index="03">Values</Eyebrow>
            <h2 data-reveal="clip-left" className="mt-6 max-w-[16ch] text-balance text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-primary">
              Three principles behind every procurement decision.
            </h2>
          </div>
          <ValuesList items={values} />
        </div>
      </section>

      {/* ── Leadership ─────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[90rem] px-5 sm:px-8 md:mt-36 lg:px-12">
        <Eyebrow index="04">Leadership</Eyebrow>
        <div
          data-reveal="clip-up"
          className="mt-8 grid overflow-hidden rounded-[24px] border border-line bg-surface md:grid-cols-[1fr_1.1fr]"
        >
          {/* Portrait + per-person LinkedIn pills */}
          <div data-parallax-root className="relative isolate aspect-[4/5] overflow-hidden md:aspect-auto md:min-h-[600px]">
            <img
              data-parallax-y="36"
              src="/jassim-alkajek.jpg"
              alt="QuipMed leadership team: Eng. Jassim Al Kajek, Mr. Jassim Bin Essa and Eng. Mohamed Rajab"
              className="absolute inset-x-0 -top-[7%] h-[114%] w-full object-cover object-center"
              loading="lazy"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/20"
            />
            {LEADERSHIP_PEOPLE.map((p) => (
              <a
                key={p.name}
                href={p.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${p.name}'s LinkedIn profile`}
                className="leadership-pill group/pill absolute -translate-x-1/2 inline-flex items-center rounded-full border backdrop-blur-md gap-0 p-1 md:gap-2 md:px-2.5 md:py-1.5 md:max-w-[200px]"
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
              >
                <span className="leadership-pill-icon grid h-6 w-6 shrink-0 place-items-center rounded-full transition-transform group-hover/pill:scale-110">
                  <Linkedin size={12} strokeWidth={2.6} />
                </span>
                <span className="leadership-pill-text hidden truncate text-[11px] font-semibold leading-tight md:inline">
                  {p.name}
                </span>
              </a>
            ))}
          </div>

          {/* Mobile-only name strip */}
          <ul className="flex flex-wrap items-center gap-2 border-t border-line p-4 md:hidden">
            {LEADERSHIP_PEOPLE.map((p) => (
              <li key={`m-${p.name}`}>
                <a
                  href={p.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leadership-pill inline-flex items-center gap-2 rounded-full border px-2.5 py-1.5"
                >
                  <span className="leadership-pill-icon grid h-5 w-5 shrink-0 place-items-center rounded-full">
                    <Linkedin size={11} strokeWidth={2.6} />
                  </span>
                  <span className="leadership-pill-text text-[11px] font-semibold leading-tight">{p.name}</span>
                </a>
              </li>
            ))}
          </ul>

          <div className="flex flex-col p-7 md:p-12 lg:p-14">
            <h2 className="text-balance text-[clamp(1.75rem,3.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.03em] text-primary">
              Operations led by Eng.&nbsp;Jassim Al&nbsp;Kajek.
            </h2>
            <p className="mt-6 max-w-[56ch] text-[16px] leading-relaxed text-slate-mid">
              A biomedical engineer with hands-on experience across medical equipment
              procurement, installation and after-sales service in Kuwait. Eng. Jassim leads
              QuipMed&rsquo;s operations end to end, from manufacturer qualification and tender
              management to on-site commissioning with hospital biomedical teams.
            </p>

            <dl className="mt-10 grid grid-cols-1 border-t border-line sm:grid-cols-2">
              {[
                { Icon: BadgeCheck, k: "Background", v: "Biomedical engineering" },
                { Icon: MapPin, k: "Based in", v: "Kuwait City · GCC" },
                { Icon: Stethoscope, k: "Focus areas", v: "Imaging · Surgical · CSSD" },
                { Icon: Briefcase, k: "Role", v: "Operations & partnerships" },
              ].map((r, i) => (
                <div
                  key={r.k}
                  className={`border-b border-line py-5 ${i % 2 === 1 ? "sm:border-l sm:pl-6" : "sm:pr-6"}`}
                >
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-slate-mid">{r.k}</dt>
                  <dd className="mt-1.5 flex items-center gap-2 text-[15px] font-medium text-primary">
                    <r.Icon aria-hidden="true" size={16} strokeWidth={1.5} className="shrink-0 text-scan" />
                    {r.v}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-auto flex flex-wrap items-center gap-x-8 gap-y-4 pt-10">
              <PrimaryButton href="mailto:eng.jassim@quipmed.co">Email Eng. Jassim</PrimaryButton>
              <TextLink href="https://www.linkedin.com/in/jassim-alkajek-18947584" external>
                LinkedIn
              </TextLink>
            </div>
          </div>
        </div>
      </section>

      {/* ── Specialities ───────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[90rem] px-5 sm:px-8 md:mt-36 lg:px-12">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6 md:mb-16">
          <div>
            <Eyebrow index="05">Specialities</Eyebrow>
            <h2 data-reveal="right" className="mt-6 max-w-[18ch] text-balance text-[clamp(2.1rem,4.4vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-primary">
              {departments.length} clinical domain{departments.length === 1 ? "" : "s"}. One trusted partner.
            </h2>
          </div>
          <TextLink to="/products">Full catalogue</TextLink>
        </div>
        <DepartmentIndex departments={departments} products={products} showSubcategories={false} />
      </section>

      {/* ── CTA ────────────────────────────────────────── */}
      <section className="mx-auto mt-24 max-w-[90rem] px-5 sm:px-8 md:mt-36 lg:px-12">
        <div data-reveal="scale" className="grid gap-10 rounded-[24px] bg-primary px-7 py-12 text-[var(--bg-primary)] md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:px-14 md:py-16">
          <div>
            <h2 className="max-w-[18ch] text-balance text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
              Ready to equip your facility?
            </h2>
            <p className="mt-5 max-w-[50ch] text-[16px] leading-relaxed opacity-70">
              Tell us about your clinical requirements. We&rsquo;ll match them with the right
              manufacturer and handle procurement end to end.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--bg-primary)] px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-mint-soft hover:text-white"
          >
            Start a conversation
          </Link>
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
