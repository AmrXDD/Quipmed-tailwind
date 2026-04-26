/**
 * QuipMed · Supabase auto-seeder
 * ────────────────────────────────────────────────────────────
 * Reads the shared seed dataset and upserts into brands, products,
 * and company_info. Safe to re-run (idempotent — keyed on `slug`).
 *
 * Usage:
 *   1. Create a Supabase project and run supabase/schema.sql in the SQL editor.
 *   2. Copy .env.example → .env and fill SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.
 *   3. `npm run seed`
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import {
  BRANDS,
  PRODUCTS,
  COMPANY_INFO,
  type BrandSeed,
  type ProductSeed,
} from "../src/data/seed-data.ts";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error(
    "✖  Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env",
  );
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function seedBrands(): Promise<Map<string, string>> {
  console.log(`→ Seeding ${BRANDS.length} brands…`);
  const rows = BRANDS.map((b: BrandSeed) => ({
    slug: b.slug,
    name: b.name,
    tagline: b.tagline ?? null,
    description: b.description ?? null,
    website: b.website ?? null,
    country: b.country ?? null,
    sort_order: b.sort_order,
  }));
  const { error } = await supabase
    .from("brands")
    .upsert(rows, { onConflict: "slug" });
  if (error) throw error;

  const { data, error: readErr } = await supabase
    .from("brands")
    .select("id, slug");
  if (readErr) throw readErr;
  const idBySlug = new Map<string, string>();
  for (const row of data ?? []) idBySlug.set(row.slug, row.id);
  console.log(`✔  ${idBySlug.size} brands ready`);
  return idBySlug;
}

async function seedProducts(brandIds: Map<string, string>) {
  console.log(`→ Seeding ${PRODUCTS.length} products…`);
  const rows = PRODUCTS.map((p: ProductSeed) => {
    const brand_id = brandIds.get(p.brand_slug);
    const brand_name =
      BRANDS.find((b) => b.slug === p.brand_slug)?.name ?? null;
    if (!brand_id) {
      console.warn(`  ⚠  Missing brand mapping for ${p.brand_slug}`);
    }
    return {
      slug: p.slug,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory ?? null,
      brand_id: brand_id ?? null,
      brand_name,
      description: p.description ?? null,
      features: p.features ?? [],
      specs: {},
      source_url: p.source_url ?? null,
      featured: p.featured ?? false,
      sort_order: p.sort_order,
    };
  });
  const { error } = await supabase
    .from("products")
    .upsert(rows, { onConflict: "slug" });
  if (error) throw error;
  console.log(`✔  ${rows.length} products upserted`);
}

async function seedCompanyInfo() {
  console.log(`→ Seeding ${Object.keys(COMPANY_INFO).length} company_info rows…`);
  const rows = Object.entries(COMPANY_INFO).map(([key, value]) => ({
    key,
    value,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from("company_info")
    .upsert(rows, { onConflict: "key" });
  if (error) throw error;
  console.log(`✔  company_info synchronised`);
}

(async () => {
  try {
    const brandIds = await seedBrands();
    await seedProducts(brandIds);
    await seedCompanyInfo();
    console.log("\n✅ QuipMed seed complete — catalog live.");
  } catch (err) {
    console.error("✖  Seed failed:", err);
    process.exit(1);
  }
})();
