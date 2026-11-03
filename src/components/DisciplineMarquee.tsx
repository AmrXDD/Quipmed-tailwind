/**
 * Two oversized rows of type that drift in opposite directions as the
 * page scrolls (GSAP ScrollTrigger scrub via data-parallax-x). One row
 * solid, one outlined — a quiet, editorial break between sections.
 */
export default function DisciplineMarquee({
  top,
  bottom,
}: {
  top: string[];
  bottom: string[];
}) {
  const row = (items: string[]) => {
    const list = items.length ? items : ["QuipMed"];
    // Repeat so the row always overflows the viewport at either extreme.
    const reps = Math.max(3, Math.ceil(12 / list.length));
    return Array.from({ length: reps }, () => list).flat();
  };

  return (
    <section
      aria-hidden="true"
      data-parallax-root
      className="relative overflow-hidden border-t border-line bg-navy-900 py-14 md:py-24"
    >
      <div
        data-parallax-x="-14"
        data-parallax-base="-50"
        className="ml-[50%] flex w-max items-center gap-[0.35em] whitespace-nowrap text-[clamp(2.75rem,8.5vw,8rem)] font-semibold leading-[1] tracking-[-0.045em] text-primary"
      >
        {row(top).map((t, i) => (
          <span key={`t-${i}`} className="flex items-center gap-[0.35em]">
            {t}
            <span className="inline-block h-[0.12em] w-[0.12em] translate-y-[0.1em] bg-scan" />
          </span>
        ))}
      </div>
      <div
        data-parallax-x="14"
        data-parallax-base="-50"
        className="ml-[50%] mt-3 flex w-max items-center gap-[0.35em] whitespace-nowrap text-[clamp(2.75rem,8.5vw,8rem)] font-semibold leading-[1] tracking-[-0.045em] text-transparent [-webkit-text-stroke:1px_var(--line-strong)] md:mt-5"
      >
        {row(bottom).map((t, i) => (
          <span key={`b-${i}`} className="flex items-center gap-[0.35em]">
            {t}
            <span className="inline-block h-[0.12em] w-[0.12em] translate-y-[0.1em] rounded-full border border-line-strong" />
          </span>
        ))}
      </div>
    </section>
  );
}
