import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Factory,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Brand } from "@/lib/types";
import { canEdit } from "@/lib/permissions";

const BUCKET = "brand-logos";

type FormState = {
  name: string;
  website_link: string;
  sort_order: string;
};

const EMPTY: FormState = { name: "", website_link: "", sort_order: "100" };

/** Return the path inside BUCKET for a given public URL, or null. */
function extractStoragePath(publicUrl: string | null): string | null {
  if (!publicUrl) return null;
  const marker = `/${BUCKET}/`;
  const idx = publicUrl.indexOf(marker);
  return idx === -1 ? null : publicUrl.slice(idx + marker.length);
}

export default function BrandsPanel({
  userRole,
}: {
  userRole?: string | null;
}) {
  const writable = canEdit(userRole ?? null, "brands");
  const [rows, setRows] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRows = async () => {
    if (!supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setError(error.message);
    else {
      setRows((data as Brand[]) ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const onDelete = async (b: Brand) => {
    if (!supabase) return;
    if (
      !confirm(
        `Delete brand "${b.name}"? Products keep their brand name text but lose the brand link.`,
      )
    )
      return;
    setDeletingId(b.id);
    // clean up storage object if we own it
    const path = extractStoragePath(b.logo_url);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }
    const { error } = await supabase.from("brands").delete().eq("id", b.id);
    if (error) setError(error.message);
    else setRows((prev) => prev.filter((x) => x.id !== b.id));
    setDeletingId(null);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Factory className="text-cyan-neon" size={22} /> Brands
          </h2>
          <p className="mt-1 text-sm text-slate-light">
            Manage manufacturer partners shown on the public site.
          </p>
        </div>
        {writable ? (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:shadow-neon"
          >
            <Plus size={14} /> New brand
          </button>
        ) : (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-light">
            Read only
          </span>
        )}
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-[0.16em] text-slate-mid">
              <tr>
                <th className="px-5 py-3 font-semibold">Logo</th>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Logo URL</th>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-light">
                    Loading brands…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-light">
                    No brands yet. Add one to populate the Home page marquee.
                  </td>
                </tr>
              )}
              <AnimatePresence initial={false}>
                {rows.map((b) => (
                  <motion.tr
                    key={b.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-5 py-3">
                      {b.logo_url ? (
                        <img
                          src={b.logo_url}
                          alt={b.name}
                          className="h-10 w-16 rounded-lg border border-white/10 bg-white/5 object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-10 w-16 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-mid">
                          <ImagePlus size={14} />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium text-white">{b.name}</td>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-mid">
                      <span className="block max-w-[280px] truncate">
                        {b.logo_url ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-light">{b.sort_order}</td>
                    <td className="px-5 py-3 text-right">
                      {writable ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(b)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-light hover:border-cyan-neon/40 hover:text-white"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(b)}
                            disabled={deletingId === b.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-light hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId === b.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Trash2 size={12} />
                            )}
                            Delete
                          </button>
                        </div>
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
          <BrandModal
            initial={editing}
            onClose={() => setModalOpen(false)}
            onSaved={(saved, mode) => {
              setModalOpen(false);
              if (mode === "create") {
                setRows((prev) =>
                  [...prev, saved].sort((a, b) => a.sort_order - b.sort_order),
                );
              } else {
                setRows((prev) =>
                  prev
                    .map((r) => (r.id === saved.id ? saved : r))
                    .sort((a, b) => a.sort_order - b.sort_order),
                );
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function BrandModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Brand | null;
  onClose: () => void;
  onSaved: (b: Brand, mode: "create" | "update") => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          website_link: initial.website_link ?? "",
          sort_order: String(initial.sort_order ?? 100),
        }
      : EMPTY,
  );
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initial?.logo_url ?? null);
  const [removeExisting, setRemoveExisting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setErr("Please choose an image file.");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setErr("Image must be under 2 MB.");
      return;
    }
    setErr(null);
    setFile(f);
    setRemoveExisting(false);
    setPreview(URL.createObjectURL(f));
  };

  const clearLogo = () => {
    setFile(null);
    setPreview(null);
    setRemoveExisting(true);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErr(null);

    const name = form.name.trim();
    if (!name) {
      setErr("Name is required.");
      return;
    }

    setSubmitting(true);
    try {
      let logoUrl: string | null = initial?.logo_url ?? null;

      // If user picked a new file, upload it
      if (file) {
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });
        if (uploadErr) throw uploadErr;
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        logoUrl = data.publicUrl;

        // remove old object if replacing
        const oldPath = extractStoragePath(initial?.logo_url ?? null);
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      } else if (removeExisting) {
        const oldPath = extractStoragePath(initial?.logo_url ?? null);
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
        logoUrl = null;
      }

      const payload = {
        name,
        logo_url: logoUrl,
        website_link: form.website_link.trim() || null,
        sort_order: form.sort_order ? Number(form.sort_order) : 100,
      };

      if (initial) {
        const { data, error } = await supabase
          .from("brands")
          .update(payload)
          .eq("id", initial.id)
          .select("*")
          .single();
        if (error) throw error;
        onSaved(data as Brand, "update");
      } else {
        const { data, error } = await supabase
          .from("brands")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;
        onSaved(data as Brand, "create");
      }
    } catch (e: any) {
      setErr(e.message ?? "Failed to save brand.");
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
        className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-[0_0_60px_-15px_rgba(34,211,238,0.35)]"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-soft">
            {initial ? <Pencil size={14} /> : <Plus size={14} />}
            {initial ? "Edit brand" : "New brand"}
          </h3>
          <button onClick={onClose} className="text-slate-mid hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={inputCls}
              placeholder="e.g. Neusoft"
            />
          </Field>

          <Field label="Logo">
            <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-3">
                {preview ? (
                  <img
                    src={preview}
                    alt="logo preview"
                    className="h-14 w-24 rounded-md bg-white object-contain p-1.5"
                  />
                ) : (
                  <div className="grid h-14 w-24 place-items-center rounded-md border border-dashed border-white/15 bg-white/[0.03] text-slate-mid">
                    <ImagePlus size={18} />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-light hover:border-cyan-neon/40 hover:text-white"
                  >
                    <Upload size={12} />
                    {preview ? "Replace image" : "Upload image"}
                  </button>
                  {preview && (
                    <button
                      type="button"
                      onClick={clearLogo}
                      className="inline-flex items-center gap-1.5 text-[11px] text-slate-mid hover:text-red-300"
                    >
                      <Trash2 size={11} /> Remove
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPick}
                  className="hidden"
                />
              </div>
              <p className="text-[10px] leading-relaxed text-slate-mid">
                PNG / SVG / JPG, max 2 MB. Uploaded to the{" "}
                <code className="rounded bg-white/10 px-1">{BUCKET}</code>{" "}
                bucket.
              </p>
            </div>
          </Field>

          <Field label="Website link (optional)">
            <input
              type="url"
              value={form.website_link}
              onChange={(e) =>
                setForm((f) => ({ ...f, website_link: e.target.value }))
              }
              className={inputCls}
              placeholder="https://brand.example.com"
              autoComplete="url"
            />
          </Field>

          <Field label="Sort order">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) =>
                setForm((f) => ({ ...f, sort_order: e.target.value }))
              }
              className={inputCls}
              placeholder="100"
            />
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
              {submitting ? "Saving" : initial ? "Save changes" : "Create"}
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
