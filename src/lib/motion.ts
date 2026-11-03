import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Motion system.
 *
 * - Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger reads
 *   the same scroll position on the same frame.
 * - A reveal manager: any element with `data-reveal="<kind>"` animates in
 *   when it scrolls into view. Kinds deliberately mix directions so the
 *   page doesn't move as one block:
 *     left | right | up | down | scale | clip-left | clip-right | clip-up
 *   Optional `data-reveal-delay` (seconds).
 * - Scrubbed parallax: `data-parallax-x="12"` slides an element by ±12%
 *   of its width across the viewport; negative values go the other way.
 *   `data-parallax-y` does the same vertically (in px).
 *
 * Elements added later (data loading, route changes) are picked up by a
 * MutationObserver, so components only need the data attributes.
 */

/** Diagnostic switches, only honoured together with ?debug=clicks. */
export const debugOff = (flag: string) =>
  typeof location !== "undefined" &&
  location.search.includes("debug=clicks") &&
  location.search.includes(flag);

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

export function getLenis() {
  return lenis;
}

/**
 * Smooth scroll makes scrolling depend on JavaScript frame rate. On an
 * ordinary office PC that turns into lag and delayed clicks, so it only
 * runs on machines that report enough headroom, and switches itself off
 * if the first seconds show it can't keep up.
 */
function deviceCanSmoothScroll() {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches; // touch: native is best
  return !coarse && cores >= 8 && memory >= 8;
}

function probeFrameRate(onSlow: () => void) {
  let frames = 0;
  const start = performance.now();
  const step = () => {
    frames++;
    const elapsed = performance.now() - start;
    if (elapsed < 2000) requestAnimationFrame(step);
    else if ((frames * 1000) / elapsed < 50) onSlow();
  };
  requestAnimationFrame(step);
}

export function startSmoothScroll() {
  if (lenis || prefersReducedMotion() || !deviceCanSmoothScroll() || debugOff("nolenis")) return lenis;
  lenis = new Lenis({
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    anchors: { offset: -96 },
  });
  lenis.on("scroll", ScrollTrigger.update);
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  probeFrameRate(() => {
    console.info("[motion] low frame rate, using native scrolling");
    stopSmoothScroll();
  });
  return lenis;
}

export function stopSmoothScroll() {
  if (tick) gsap.ticker.remove(tick);
  tick = null;
  lenis?.destroy();
  lenis = null;
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
  else window.scrollTo(0, 0);
}

/** Pause page scrolling (modals, drawers). */
export function lockScroll(locked: boolean) {
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

// ── Reveals ─────────────────────────────────────────────────────────
type Preset = { from: gsap.TweenVars; to: gsap.TweenVars };

const EASE = "expo.out";
const PRESETS: Record<string, Preset> = {
  left: { from: { x: -90, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 } },
  right: { from: { x: 90, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 } },
  up: { from: { y: 70, autoAlpha: 0 }, to: { y: 0, autoAlpha: 1 } },
  down: { from: { y: -50, autoAlpha: 0 }, to: { y: 0, autoAlpha: 1 } },
  scale: { from: { scale: 0.92, autoAlpha: 0 }, to: { scale: 1, autoAlpha: 1 } },
  "clip-left": {
    from: { clipPath: "inset(0% 100% 0% 0%)" },
    to: { clipPath: "inset(0% 0% 0% 0%)" },
  },
  "clip-right": {
    from: { clipPath: "inset(0% 0% 0% 100%)" },
    to: { clipPath: "inset(0% 0% 0% 0%)" },
  },
  "clip-up": {
    from: { clipPath: "inset(100% 0% 0% 0%)" },
    to: { clipPath: "inset(0% 0% 0% 0%)" },
  },
};

const DONE = "revealBound";

function bindReveal(el: HTMLElement) {
  if (el.dataset[DONE]) return;
  el.dataset[DONE] = "1";
  const preset = PRESETS[el.dataset.reveal ?? "up"] ?? PRESETS.up;
  const delay = parseFloat(el.dataset.revealDelay ?? "0") || 0;
  const isClip = "clipPath" in preset.from;
  gsap.set(el, preset.from);
  ScrollTrigger.create({
    trigger: el,
    start: "top 90%",
    once: true,
    onEnter: () =>
      gsap.to(el, {
        ...preset.to,
        delay,
        duration: isClip ? 1.4 : 1.2,
        ease: isClip ? "expo.inOut" : EASE,
        clearProps: isClip ? "clipPath" : "transform",
      }),
  });
}

function bindParallax(el: HTMLElement) {
  if (el.dataset.parallaxBound) return;
  el.dataset.parallaxBound = "1";
  const x = parseFloat(el.dataset.parallaxX ?? "0");
  const y = parseFloat(el.dataset.parallaxY ?? "0");
  const base = parseFloat(el.dataset.parallaxBase ?? "0");
  gsap.fromTo(
    el,
    { xPercent: base - x, y: -y },
    {
      xPercent: base + x,
      y,
      ease: "none",
      scrollTrigger: {
        trigger: el.closest("[data-parallax-root]") ?? el,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    },
  );
}

function scan(root: ParentNode) {
  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(bindReveal);
  root
    .querySelectorAll<HTMLElement>("[data-parallax-x],[data-parallax-y]")
    .forEach(bindParallax);
}

let observer: MutationObserver | null = null;
let refreshQueued = false;

function queueRefresh() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

export function startReveals() {
  if (observer || debugOff("noreveal")) return;
  if (prefersReducedMotion()) return;
  scan(document);
  observer = new MutationObserver((records) => {
    let added = false;
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n.nodeType !== 1) return;
        const el = n as HTMLElement;
        if (el.matches?.("[data-reveal]")) bindReveal(el);
        if (el.matches?.("[data-parallax-x],[data-parallax-y]")) bindParallax(el);
        scan(el);
        added = true;
      });
    }
    if (added) queueRefresh();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/** Admin: stop watching the DOM and drop every scroll animation. */
export function stopReveals() {
  observer?.disconnect();
  observer = null;
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

/** Drop triggers whose elements left the page (after a route change). */
export function pruneScrollTriggers() {
  ScrollTrigger.getAll().forEach((t) => {
    const trg = t.trigger as Element | undefined;
    if (trg && !document.body.contains(trg)) t.kill();
  });
  queueRefresh();
}
