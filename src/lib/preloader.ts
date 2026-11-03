import { useEffect, useState } from "react";

/** Bridge to the inline preloader controller in index.html. */
type PreloaderApi = { done: boolean; mark: (stage: "app" | "hero") => void };

declare global {
  interface Window {
    __quipmedPreloader?: PreloaderApi;
  }
}

export function markPreloader(stage: "app" | "hero") {
  window.__quipmedPreloader?.mark(stage);
}

function isLeaving() {
  const p = window.__quipmedPreloader;
  return !p || p.done;
}

/**
 * True once the preloader has started its exit, so intro animations
 * play as the page is revealed rather than behind the loader.
 */
export function usePreloaderLeaving() {
  const [leaving, setLeaving] = useState(isLeaving);
  useEffect(() => {
    if (leaving) return;
    const on = () => setLeaving(true);
    window.addEventListener("quipmed:preloader-leave", on);
    window.addEventListener("quipmed:preloader-done", on);
    // Safety: never hold intro content hidden.
    const t = window.setTimeout(on, 6500);
    return () => {
      window.removeEventListener("quipmed:preloader-leave", on);
      window.removeEventListener("quipmed:preloader-done", on);
      window.clearTimeout(t);
    };
  }, [leaving]);
  return leaving;
}
