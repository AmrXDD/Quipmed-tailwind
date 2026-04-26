import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, Loader2, Package, Plus, Search, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Brand, Department } from "@/lib/types";
import { canEdit, managerDepartment } from "@/lib/permissions";
import { proxyImage } from "@/lib/img";

type Product = {
  id: string;
  name: string;
  category: string | null;
  brand: string | null;
  price: number | null;
  stock?: number | null;
  image_url?: string | null;
  description?: string | null;
  is_quotable?: boolean | null;
  department_id?: string | null;
  departments?: { name: string } | null; // Joined data comes back as an object
  created_at?: string;
};

type FormState = {
  name: string;
  brand_id: string;
  category: string;
  price: string;
  stock: string;
  description: string;
  is_quotable: boolean;
  department_id: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  brand_id: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  is_quotable: false,
  department_id: "",
};

export default function ProductsPanel({
  userRole,
}: {
  userRole?: string | null;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const writable = canEdit(userRole ?? null, "products");
  const scopedDeptId = managerDepartment(userRole ?? null);

  const fetchProducts = async () => {
    if (!supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }
    setLoading(true);

    // FIX: select 'department_id' and the joined 'departments(name)' instead of just 'department'
    let q = supabase
      .from("products")
      .select(
        "id,name,category,brand,price,stock,image_url,description,is_quotable,department_id,departments(name),created_at",
      )
      .order("created_at", { ascending: false });

    if (scopedDeptId) {
      // FIX: Filter by the ID column
      q = q.eq("department_id", scopedDeptId);
    }

    const { data, error } = await q;

    if (error) {
      setError(error.message);
    } else {
      setProducts((data as any[]) ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteProduct = async (p: Product) => {
    if (!supabase) return;
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    setDeletingId(p.id);
    try {
      if (p.image_url) {
        const marker = "/product-images/";
        const idx = p.image_url.indexOf(marker);
        if (idx !== -1) {
          const path = p.image_url.slice(idx + marker.length);
          await supabase.storage.from("product-images").remove([path]);
        }
      }
      const { error } = await supabase.from("products").delete().eq("id", p.id);
      if (error) throw error;
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e: any) {
      setError(e.message ?? "Failed to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = products.filter((p) =>
    (p.name + " " + (p.brand ?? "") + " " + (p.category ?? ""))
      .toLowerCase()
      .includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Package className="text-cyan-neon" size={22} /> Products
          </h2>
          <p className="mt-1 text-sm text-slate-light">
            Manage the catalog visible on the public site.
            {scopedDeptId && (
              <span className="ml-2 rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-mint">
                Scoped Access
              </span>
            )}
            {!writable && (
              <span className="ml-2 rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-light">
                Read only
              </span>
            )}
          </p>
        </div>
        {writable && (
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:shadow-neon"
          >
            <Plus size={14} /> New product
          </button>
        )}
      </header>

      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-mid"
          size={16}
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, brand, or category…"
          className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-mid focus:border-cyan-neon/50 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-[0.16em] text-slate-mid">
              <tr>
                <th className="px-5 py-3 font-semibold">Image</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Brand</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Stock</th>
                <th className="px-5 py-3 text-right font-semibold">Price</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-light">
                    Loading products…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-light">
                    No products found.
                  </td>
                </tr>
              )}
              <AnimatePresence initial={false}>
                {filtered.map((p) => (
                  <motion.tr
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-5 py-3">
                      {p.image_url ? (
                        <img
                          src={proxyImage(p.image_url, { w: 80, h: 80 })}
                          alt={p.name}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-mid">
                          <ImagePlus size={14} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-white">
                      <div>
                        {p.name}
                        {p.departments?.name && (
                          <div className="text-[10px] text-cyan-neon/60 uppercase tracking-wider">{p.departments.name}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-light">{p.brand ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-light">{p.category ?? "—"}</td>
                    <td className="px-5 py-3 text-slate-light">{p.stock ?? "—"}</td>
                    <td className="px-5 py-3 text-right font-mono text-cyan-neon">
                      {p.is_quotable ? (
                        <span className="rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-mint">
                          Quote
                        </span>
                      ) : p.price != null ? (
                        `$${p.price.toLocaleString()}`
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {writable ? (
                        <button
                          onClick={() => deleteProduct(p)}
                          disabled={deletingId === p.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-light transition-colors hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                        >
                          {deletingId === p.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Delete
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-mid">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <AddProductModal
            onClose={() => setModalOpen(false)}
            onCreated={() => {
              setModalOpen(false);
              fetchProducts(); // Refresh list to get joined department data
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function AddProductModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: Product) => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const [depts, brs] = await Promise.all([
        supabase
          .from("departments")
          .select("*")
          .order("sort_order", { ascending: true }),
        supabase
          .from("brands")
          .select("*")
          .order("sort_order", { ascending: true }),
      ]);
      if (depts.data) setDepartments(depts.data as Department[]);
      if (brs.data) setBrands(brs.data as Brand[]);
    })();
  }, []);

  const update =
    (k: keyof FormState) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErr(null);

    if (!form.name.trim()) {
      setErr("Name is required.");
      return;
    }
    if (!form.is_quotable && !form.price) {
      setErr("Price is required for non-quotable products.");
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });
        if (uploadErr) throw uploadErr;
        const { data } = supabase.storage.from("product-images").getPublicUrl(path);
        imageUrl = data.publicUrl;
      }

      const selectedBrand = brands.find((b) => b.id === form.brand_id);

      const slugify = (s: string) =>
        s
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
      const baseSlug = slugify(form.name) || "product";
      // Append a short suffix so the unique constraint can't collide on retries.
      const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 7)}`;

      const brandName = selectedBrand?.name ?? null;

      const payload = {
        slug,
        name: form.name.trim(),
        brand_id: form.brand_id || null,
        brand: brandName,
        brand_name: brandName,
        category: form.category.trim() || "Uncategorized",
        price: form.is_quotable ? null : Number(form.price),
        stock: form.stock ? Number(form.stock) : null,
        description: form.description.trim() || null,
        is_quotable: form.is_quotable,
        department_id: form.department_id || null,
        image_url: imageUrl,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("products")
        .insert(payload)
        .select(
          "id,name,category,brand,brand_id,price,stock,image_url,description,is_quotable,department_id,created_at",
        )
        .single();
      if (insertErr) throw insertErr;

      onCreated(inserted as Product);
    } catch (e: any) {
      setErr(e.message ?? "Failed to create product.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.97 }}
        transition={{ type: "spring", damping: 22, stiffness: 240 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-[0_0_60px_-15px_rgba(34,211,238,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-soft">
            <Plus size={14} className="text-cyan-neon" /> New product
          </h3>
          <button
            onClick={onClose}
            className="text-slate-mid transition-colors hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="max-h-[80vh] overflow-y-auto space-y-4 px-6 py-5 custom-scrollbar">
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={update("name")}
              className={inputCls}
              placeholder="e.g. Portable Ultrasound X3"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <select
                value={form.brand_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, brand_id: e.target.value }))
                }
                className={inputCls}
              >
                <option value="">— No brand —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <input
                value={form.category}
                onChange={update("category")}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Department (optional)">
            <select
              value={form.department_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, department_id: e.target.value }))
              }
              className={inputCls}
            >
              <option value="">— Other (no department) —</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </Field>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
            <input
              type="checkbox"
              checked={form.is_quotable}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_quotable: e.target.checked }))
              }
              className="mt-0.5 h-4 w-4 accent-cyan-neon"
            />
            <span className="space-y-1">
              <span className="block text-xs font-semibold text-white">
                MOH Regulated / Request Quote Only
              </span>
              <span className="block text-[11px] text-slate-light">
                Hides price and buttons on the public site. Customers go through
                the inquiry flow instead.
              </span>
            </span>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Field label={form.is_quotable ? "Price (disabled)" : "Price (USD)"}>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.is_quotable ? "" : form.price}
                onChange={update("price")}
                disabled={form.is_quotable}
                className={`${inputCls} ${form.is_quotable ? "opacity-40" : ""}`}
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min="0"
                value={form.stock}
                onChange={update("stock")}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={update("description")}
              rows={3}
              className={`${inputCls} resize-y`}
              placeholder="Short description shown on the public catalogue…"
            />
          </Field>

          <Field label="Product image">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-light transition-colors hover:border-cyan-neon/40 hover:text-white"
              >
                <ImagePlus size={14} />
                {file ? "Change image" : "Attach image"}
              </button>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="h-12 w-12 rounded-lg border border-white/10 object-cover"
                />
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onFile}
                className="hidden"
              />
            </div>
          </Field>

          {err && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {err}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-light hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:shadow-neon disabled:opacity-60"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {submitting ? "Saving" : "Create product"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-mid focus:border-cyan-neon/50 focus:outline-none";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-mid">
        {label} {required && <span className="text-cyan-neon">*</span>}
      </span>
      {children}
    </label>
  );
}