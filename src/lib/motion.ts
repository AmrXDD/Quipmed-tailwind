import Lenis from "lenis";
import { gsap } from "gsap";
import { getTier, onTierChange } from "./perf";

/**
 * Motion system — deliberately free of GSAP ScrollTrigger.
 *
 * ScrollTrigger writes history.scrollRestoration on every refresh, and
 * Firefox rate-limits the History API (~200 calls / 10s); once tripped,
 * Firefox refuses pushState and every router link on the site goes dead.
 * Nothing here touches the History API.
 *
 *  - Lenis smooth scroll (full tier only), driven by GSAP's ticker.
 *  - Reveals: `data-reveal="<kind>"` animates in once, when the element
 *    scrolls into view (IntersectionObserver). Kinds mix directions:
 *      left | right | up | down | scale | clip-left | clip-right | clip-up
 *    Optional `data-reveal-delay` (seconds).
 *  - Parallax (full tier only): `data-parallax-x="12"` slides an element
 *    ±12% of its width as its `[data-parallax-root]` crosses the viewport;
 *    `data-parallax-y` is in px; `data-parallax-base` is a fixed % offset.
 *
 * Elements added later (data loading, route changes) are picked up by a
 * MutationObserver that only binds them — it never triggers re-layout.
 */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Belt and braces: ignore redundant writes to history.scrollRestoration,
// which Firefox counts against its History API rate limit.
(function guardScrollRestoration() {
  try {
    const d = Object.getOwnPropertyDescriptor(History.prototype, "scrollRestoration");
    if (!d?.get || !d.set) return;
    Object.defineProperty(window.history, "scrollRestoration", {
      configurable: true,
      get() {
        return d.get!.call(window.history);
      },
      set(v: ScrollRestoration) {
        if (d.get!.call(window.history) !== v) d.set!.call(window.history, v);
      },
    });
  } catch {
    /* non-standard environment */
  }
})();

// ── Smooth scroll ───────────────────────────────────────────────────
let lenis: Lenis | null = null;
let tick: ((time: number) => void) | null = null;

export function getLenis() {
  return lenis;
}

export function startSmoothScroll() {
  if (lenis || getTier() !== "full" || prefersReducedMotion()) return lenis;
  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    anchors: { offset: -96 },
  });
  tick = (time: number) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
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

function presets(scale: number): Record<string, Preset> {
  const x = 90 * scale;
  const y = 70 * scale;
  return {
    left: { from: { x: -x, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 } },
    right: { from: { x, autoAlpha: 0 }, to: { x: 0, autoAlpha: 1 } },
    up: { from: { y, autoAlpha: 0 }, to: { y: 0, autoAlpha: 1 } },
    down: { from: { y: -y * 0.7, autoAlpha: 0 }, to: { y: 0, autoAlpha: 1 } },
    scale: { from: { scale: 0.94, autoAlpha: 0 }, to: { scale: 1, autoAlpha: 1 } },
    "clip-left": { from: { clipPath: "inset(0% 100% 0% 0%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" } },
    "clip-right": { from: { clipPath: "inset(0% 0% 0% 100%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" } },
    "clip-up": { from: { clipPath: "inset(100% 0% 0% 0%)" }, to: { clipPath: "inset(0% 0% 0% 0%)" } },
  };
}

let revealIO: IntersectionObserver | null = null;
let observer: MutationObserver | null = null;
const pending = new Set<HTMLElement>();

function play(el: HTMLElement) {
  pending.delete(el);
  const lite = getTier() === "lite";
  const preset = presets(lite ? 0.5 : 1)[el.dataset.reveal ?? "up"] ?? presets(1).up;
  const isClip = "clipPath" in preset.from;
  gsap.to(el, {
    ...preset.to,
    delay: parseFloat(el.dataset.revealDelay ?? "0") || 0,
    duration: isClip ? (lite ? 1 : 1.4) : lite ? 0.8 : 1.2,
    ease: isClip ? "expo.inOut" : "expo.out",
    clearProps: isClip ? "clipPath" : "transform,opacity,visibility",
  });
}

function bindReveal(el: HTMLElement) {
  if (el.dataset.revealBound || !revealIO) return;
  el.dataset.revealBound = "1";
  const lite = getTier() === "lite";
  const preset = presets(lite ? 0.5 : 1)[el.dataset.reveal ?? "up"] ?? presets(1).up;
  gsap.set(el, preset.from);
  pending.add(el);
  revealIO.observe(el);
}

// ── Parallax (full tier only) ───────────────────────────────────────
type ParallaxItem = {
  el: HTMLElement;
  root: Element;
  x: number;
  y: number;
  base: number;
  cur: number;
};

const parallaxItems = new Set<ParallaxItem>();
const visibleRoots = new Set<Element>();
let parallaxIO: IntersectionObserver | null = null;
let raf = 0;

function writeTransform(item: ParallaxItem, p: number) {
  item.el.style.transform = `translate3d(${item.base + p * item.x}%, ${p * item.y}px, 0)`;
}

function parallaxFrame() {
  raf = 0;
  if (!visibleRoots.size) return;
  const vh = window.innerHeight;
  parallaxItems.forEach((item) => {
    if (!visibleRoots.has(item.root)) return;
    const r = item.root.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
    const target = progress * 2 - 1;
    item.cur = Number.isNaN(item.cur) ? target : item.cur + (target - item.cur) * 0.12;
    writeTransform(item, item.cur);
  });
  raf = requestAnimationFrame(parallaxFrame);
}

function bindParallax(el: HTMLElement) {
  if (el.dataset.parallaxBound) return;
  el.dataset.parallaxBound = "1";
  const item: ParallaxItem = {
    el,
    root: el.closest("[data-parallax-root]") ?? el,
    x: parseFloat(el.dataset.parallaxX ?? "0"),
    y: parseFloat(el.dataset.parallaxY ?? "0"),
    base: parseFloat(el.dataset.parallaxBase ?? "0"),
    cur: NaN,
  };
  if (getTier() !== "full" || prefersReducedMotion() || !parallaxIO) {
    writeTransform(item, 0); // static resting position
    return;
  }
  parallaxItems.add(item);
  parallaxIO.observe(item.root);
}

function stopParallax() {
  if (raf) cancelAnimationFrame(raf);
  raf = 0;
  parallaxIO?.disconnect();
  parallaxIO = null;
  visibleRoots.clear();
  parallaxItems.forEach((item) => writeTransform(item, 0));
  parallaxItems.clear();
}

// ── Lifecycle ───────────────────────────────────────────────────────
function scan(root: ParentNode) {
  root.querySelectorAll<HTMLElement>("[data-reveal]").forEach(bindReveal);
  root
    .querySelectorAll<HTMLElement>("[data-parallax-x],[data-parallax-y]")
    .forEach(bindParallax);
}

export function startReveals() {
  if (observer || prefersReducedMotion()) return;

  // Huge top margin: anything already *above* the viewport counts as seen,
  // so content you jump past (anchors, back/forward) is never left hidden.
  revealIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        revealIO?.unobserve(e.target);
        play(e.target as HTMLElement);
      });
    },
    { rootMargin: "100000px 0px -10% 0px" },
  );

  if (getTier() === "full") {
    parallaxIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) visibleRoots.add(e.target);
        else visibleRoots.delete(e.target);
      });
      if (visibleRoots.size && !raf) raf = requestAnimationFrame(parallaxFrame);
    });
  }

  scan(document);
  observer = new MutationObserver((records) => {
    for (const r of records) {
      r.addedNodes.forEach((n) => {
        if (n.nodeType !== 1 || !(n as Element).isConnected) return;
        const el = n as HTMLElement;
        if (el.matches?.("[data-reveal]")) bindReveal(el);
        if (el.matches?.("[data-parallax-x],[data-parallax-y]")) bindParallax(el);
        scan(el);
      });
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

/** Forget elements that left the page (after a route change). */
export function pruneMotion() {
  pending.forEach((el) => {
    if (!el.isConnected) {
      revealIO?.unobserve(el);
      pending.delete(el);
    }
  });
  parallaxItems.forEach((item) => {
    if (!item.el.isConnected) {
      parallaxIO?.unobserve(item.root);
      visibleRoots.delete(item.root);
      parallaxItems.delete(item);
    }
  });
}

/** Admin: stop watching the DOM and drop every scroll animation. */
export function stopReveals() {
  observer?.disconnect();
  observer = null;
  revealIO?.disconnect();
  revealIO = null;
  pending.clear();
  stopParallax();
}

// Dropping to lite mid-visit: native scroll, no parallax.
onTierChange((t) => {
  if (t === "lite") {
    stopSmoothScroll();
    stopParallax();
  }
});
