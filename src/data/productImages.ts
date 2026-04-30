/**
 * Per-product image overrides — high-quality manufacturer product photos
 * scraped from official sources. Used as a fallback in <Products /> when
 * the product row in Supabase has no image_url.
 *
 * Keys are product `slug` values from seed-data.ts. URLs are pushed
 * through `proxyImage()` (images.weserv.nl) at render time so hot-link
 * blocking doesn't break them.
 */
export const PRODUCT_IMAGE_OVERRIDES: Record<string, string> = {
  // ── Diagnostic Imaging ─────────────────────────────────────
  "neusoft-mri":
    "https://www-dcdn.neusoftmedical.com/files/691158f4cad897a83e8a441c.jpg",
  "neusoft-ct":
    "https://www-dcdn.neusoftmedical.com/files/69e1e0b9cad897a83e8a44d5.jpg",
  "neusoft-petct":
    "https://www-dcdn.neusoftmedical.com/files/681b38f6e4b01a95b30a9306.jpg",
  "neusoft-xray":
    "https://www-dcdn.neusoftmedical.com/files/66acdb91e4b0ec3e6115339b.png",

  // ── Medical Furniture & Physiotherapy ─────────────────────
  "gram-biocompact":
    "https://gram-bioline.com/media/th4b55oq/biocompact-ii-rr310-glass-door-refrigerator-side-view-closed-doorpng.png",

  // ── Surgical Solutions ─────────────────────────────────────
  "nouvag-highsurg30":
    "https://nouvag.com/fileadmin/user_upload/images/products/REF_3360_HighSurg30_2800x1600.jpg",
  "nouvag-liposuction":
    "https://nouvag.com/fileadmin/_processed_/5/5/csm_REF_3392_Lipocart-Set_2800x1600_01_95f39c69fa.webp",
  "nouvag-tcm3000":
    "https://nouvag.com/fileadmin/user_upload/images/products/REF_3280_TCM3000BL-Dermatom_2800x1600.jpg",
  "mectron-piezosurgery":
    "https://medical.mectron.com/wp-content/uploads/2022/10/PIEZOSURGERY-plus.jpg",
  "limmer-laser":
    "https://limmerlaser.de/images/CO2-Laser-UNILAS-Touch_1000px_heller2.jpg",
  "led-electrosurgery":
    "https://www.led.it/wp-content/uploads/2016/05/electra_square-800x600.jpg",
  "ig-surgical-tables":
    "https://www.ig-medical.com/uploads/products/7998501.png",
  "ig-surgical-lights":
    "https://www.ig-medical.com/uploads/products/4761349.jpg",
  "baldus-n2o":
    "https://baldus-sedation.com/wp-content/uploads/2025/02/baldus-touch-nitrous-oxide-sedation-1.webp",
  "ams-sutures":
    "https://wordpress.amsltd.com/wp-content/uploads/2025/07/Adva-Grip-Suture-Page-1024x455.jpeg",

  // ── Patient Care ───────────────────────────────────────────
  "chrisofix-orthopedic":
    "https://chrisofix.com/wp-content/uploads/2007/11/REF_10-400x284.png",

  // ── Life Support ───────────────────────────────────────────
  "ig-patient-monitors":
    "https://www.ig-medical.com/uploads/products/7034975.png",
  "chest-pft":
    "https://www.chest-mi.co.jp/assets/pc_img/en/product/index/contents_img_01.jpg",
};

export function productImageFor(
  slug: string | undefined | null,
  existing: string | null | undefined,
): string | null {
  if (existing) return existing;
  if (!slug) return null;
  return PRODUCT_IMAGE_OVERRIDES[slug] ?? null;
}
