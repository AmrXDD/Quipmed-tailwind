import { useEffect, useState } from "react";
import { COMPANY_INFO, CATEGORIES } from "@/data/seed-data";
import type { Brand, Product, Department } from "@/lib/types";
import { supabase, HAS_SUPABASE, getUserProfile } from "@/lib/supabaseClient";

export { supabase, HAS_SUPABASE, getUserProfile };

// ── Fallback shapers ──────────────────────────────────────────
const now = new Date().toISOString();

const fallbackDepartments = (): Department[] =>
  CATEGORIES.map((c, i) => ({
    id: `seed-dept-${i}`,
    slug: c.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    name: c,
    sort_order: (i + 1) * 10,
    created_at: now,
  }));

// ── Hooks ─────────────────────────────────────────────────────
export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState<boolean>(HAS_SUPABASE);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      if (!error && data) setBrands(data as Brand[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { brands, loading };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(HAS_SUPABASE);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (!error && data) setProducts(data as Product[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { products, loading };
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>(fallbackDepartments());
  const [loading, setLoading] = useState<boolean>(HAS_SUPABASE);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("sort_order", { ascending: true });
      if (cancelled) return;
      if (!error && data && data.length) setDepartments(data as Department[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { departments, loading };
}

export function useCompanyInfo(): Record<string, string> {
  const [info, setInfo] = useState<Record<string, string>>({ ...COMPANY_INFO });

  useEffect(() => {
    let cancelled = false;
    if (!supabase) return;
    (async () => {
      const { data, error } = await supabase.from("company_info").select("key,value");
      if (cancelled || error || !data) return;
      const merged: Record<string, string> = { ...COMPANY_INFO };
      for (const row of data as { key: string; value: string }[]) {
        if (row?.key) merged[row.key] = row.value ?? "";
      }
      setInfo(merged);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return info;
}
