import { useEffect, useRef } from "react";

/**
 * Lite hero: the brain pre-rendered from the real 3D scene (marble and
 * X-ray frames), with the scan line sweeping across and the X-ray layer
 * revealed behind it. Pure Web Animations (clip-path + transform), no
 * WebGL and no per-frame JavaScript — smooth on phones and weak PCs.
 *
 * The readout is updated ten times a second from the animation clock.
 */

// Vertical extent of the brain inside the 1000×1000 renders (alpha bbox).
const TOP = 18.9;
const BOTTOM = 79.8;
const DURATION = 4800;

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function BrainStill({
  theme,
  onReady,
  onScan,
  className = "",
}: {
  theme: "dark" | "light";
  onReady?: () => void;
  onScan?: (progress: number) => void;
  className?: string;
}) {
  const xrayRef = useRef<HTMLImageElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const sculptRef = useRef<HTMLImageElement>(null);

  // Ready once the first frame can be drawn.
  useEffect(() => {
    const img = sculptRef.current;
    if (!img || !onReady) return;
    let done = false;
    const ready = () => {
      if (!done) {
        done = true;
        onReady();
      }
    };
    if (img.complete) ready();
    else {
      img.addEventListener("load", ready, { once: true });
      img.addEventListener("error", ready, { once: true });
    }
    const t = window.setTimeout(ready, 3000);
    return () => window.clearTimeout(t);
  }, [onReady]);

  useEffect(() => {
    const xray = xrayRef.current;
    const line = lineRef.current;
    if (!xray || !line) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const at = (p: number) => TOP + (BOTTOM - TOP) * p;

    if (reduce || typeof xray.animate !== "function") {
      xray.style.clipPath = `inset(0 0 ${100 - at(0.55)}% 0)`;
      line.style.transform = `translateY(${at(0.55)}%)`;
      onScan?.(0.55);
      return;
    }

    const timing: KeyframeAnimationOptions = {
      duration: DURATION,
      iterations: Infinity,
      direction: "alternate",
      easing: "cubic-bezier(0.65, 0, 0.35, 1)",
    };
    const clip = xray.animate(
      [{ clipPath: `inset(0% 0% ${100 - TOP}% 0%)` }, { clipPath: `inset(0% 0% ${100 - BOTTOM}% 0%)` }],
      timing,
    );
    const sweep = line.animate(
      [{ transform: `translateY(${TOP}%)` }, { transform: `translateY(${BOTTOM}%)` }],
      timing,
    );

    const iv = window.setInterval(() => {
      const t = Number(sweep.currentTime ?? 0) % (DURATION * 2);
      const f = t < DURATION ? t / DURATION : 2 - t / DURATION;
      onScan?.(easeInOutCubic(f));
    }, 100);

    return () => {
      clip.cancel();
      sweep.cancel();
      window.clearInterval(iv);
    };
  }, [onScan]);

  const src = (kind: "sculpt" | "xray") => `/hero/brain-${kind}-${theme}.webp`;

  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        ref={sculptRef}
        src={src("sculpt")}
        alt=""
        aria-hidden="true"
        width={1000}
        height={1000}
        decoding="async"
        className="absolute inset-0 h-full w-full select-none object-contain"
        draggable={false}
      />
      <img
        ref={xrayRef}
        src={src("xray")}
        alt=""
        aria-hidden="true"
        width={1000}
        height={1000}
        decoding="async"
        className="absolute inset-0 h-full w-full select-none object-contain"
        style={{ clipPath: `inset(0% 0% ${100 - TOP}% 0%)` }}
        draggable={false}
      />
      {/* Scan line: the element's top edge is the line. */}
      <div
        ref={lineRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[4%] top-0 h-full will-change-transform"
        style={{ transform: `translateY(${TOP}%)` }}
      >
        <span className="block h-px w-full bg-[linear-gradient(90deg,transparent,var(--scan)_16%,var(--scan)_84%,transparent)] shadow-[0_0_14px_1px_var(--scan)]" />
      </div>
    </div>
  );
}
