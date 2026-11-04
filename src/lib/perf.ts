import { useEffect, useState } from "react";

/**
 * Performance tier, decided once at start-up.
 *
 *  full — desktop with a fine pointer, enough CPU/RAM and real GPU-backed
 *         WebGL: 3D brain, smooth scroll, scroll-scrubbed parallax.
 *  lite — phones, tablets, weak or GPU-less machines, reduced motion or
 *         data-saver: pre-rendered brain stills with a CSS scan line,
 *         native scrolling, no parallax, no grain.
 *
 * A "full" machine that still can't hold a smooth frame rate in its
 * first seconds is moved to "lite" at runtime (see watchFrameRate).
 */

export type Tier = "full" | "lite";

let tier: Tier | null = null;
const listeners = new Set<(t: Tier) => void>();

let webglOk: boolean | null = null;

/** Hardware-accelerated WebGL? Probed once; software renderers count as no. */
export function hasHardwareWebGL(): boolean {
  if (webglOk !== null) return webglOk;
  webglOk = false;
  try {
    const c = document.createElement("canvas");
    const opts = { failIfMajorPerformanceCaveat: true } as WebGLContextAttributes;
    const gl = (c.getContext("webgl2", opts) || c.getContext("webgl", opts)) as WebGLRenderingContext | null;
    if (gl) {
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      webglOk = !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    }
  } catch {
    webglOk = false;
  }
  return webglOk;
}

function detect(): Tier {
  const mq = (q: string) => window.matchMedia(q).matches;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 8; // not reported by Firefox/Safari
  const touchFirst = mq("(pointer: coarse)") || mq("(hover: none)");
  const strong =
    !mq("(prefers-reduced-motion: reduce)") &&
    !touchFirst &&
    !nav.connection?.saveData &&
    cores >= 6 &&
    memory >= 4 &&
    hasHardwareWebGL();
  return strong ? "full" : "lite";
}

function apply(t: Tier) {
  tier = t;
  document.documentElement.dataset.tier = t;
  listeners.forEach((fn) => fn(t));
}

export function getTier(): Tier {
  if (!tier) apply(detect());
  return tier as Tier;
}

/** Drop to lite (never back up within a visit). */
export function downgradeToLite(reason: string) {
  if (tier === "lite") return;
  console.info(`[perf] switching to lite mode: ${reason}`);
  apply("lite");
}

export function onTierChange(fn: (t: Tier) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useTier(): Tier {
  const [t, setT] = useState<Tier>(getTier);
  useEffect(() => {
    const off = onTierChange(setT);
    return () => {
      off();
    };
  }, []);
  return t;
}

/**
 * On "full", sample the real frame rate for a few seconds once the page is
 * idle; if it can't hold ~50fps, switch to lite for the rest of the visit.
 */
export function watchFrameRate() {
  if (getTier() !== "full") return;
  let frames = 0;
  let start = 0;
  const step = (t: number) => {
    if (!start) start = t;
    frames++;
    const elapsed = t - start;
    if (document.hidden) return; // background tabs pause frames; don't judge them
    if (elapsed < 2500) requestAnimationFrame(step);
    else if ((frames * 1000) / elapsed < 50) downgradeToLite("low frame rate");
  };
  // Measure after the intro, not during it.
  window.setTimeout(() => requestAnimationFrame(step), 3500);
}
