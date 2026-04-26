/**
 * Many manufacturer image URLs hot-link-block, return stale CDN
 * tokens, or live behind redirects that fail when fetched directly
 * from the browser. Routing them through images.weserv.nl gives us
 * a stable, CORS-friendly proxy without us having to mirror the
 * binaries into Supabase storage.
 *
 * Local Supabase storage URLs are passed through untouched.
 */
export function proxyImage(
  src?: string | null,
  opts?: { w?: number; h?: number },
): string | undefined {
  if (!src) return undefined;
  // Don't proxy our own storage URLs
  if (src.includes(".supabase.co/storage/")) return src;
  // Don't proxy blob:/data: previews
  if (src.startsWith("blob:") || src.startsWith("data:")) return src;

  const u = src.replace(/^https?:\/\//i, "");
  const params = new URLSearchParams({ url: u });
  if (opts?.w) params.set("w", String(opts.w));
  if (opts?.h) params.set("h", String(opts.h));
  params.set("fit", "cover");
  return `https://images.weserv.nl/?${params.toString()}`;
}
