import { useEffect, useState } from "react";

/** Current theme, read from the class App.tsx sets on <html>. */
export function useThemeMode(): "dark" | "light" {
  const read = () =>
    document.documentElement.classList.contains("theme-white") ? "light" : "dark";
  const [mode, setMode] = useState<"dark" | "light">(read);
  useEffect(() => {
    const mo = new MutationObserver(() => setMode(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);
  return mode;
}
