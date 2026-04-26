import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FolderTree, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import type { Department } from "@/lib/types";
import { canEdit } from "@/lib/permissions";

type FormState = {
  name: string;
  slug: string;
  sort_order: string;
};

const EMPTY: FormState = { name: "", slug: "", sort_order: "100" };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function DepartmentsPanel({
  userRole,
}: {
  userRole?: string | null;
}) {
  const writable = canEdit(userRole ?? null, "departments");
  const [rows, setRows] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Department | null>(null);
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
      .from("departments")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) setError(error.message);
    else {
      setRows((data as Department[]) ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const onDelete = async (c: Department) => {
    if (!supabase) return;
    if (
      !confirm(
        `Delete department "${c.name}"? Products in it will be reassigned to "Other".`,
      )
    )
      return;
    setDeletingId(c.id);
    const { error } = await supabase.from("departments").delete().eq("id", c.id);
    if (error) setError(error.message);
    else setRows((prev) => prev.filter((x) => x.id !== c.id));
    setDeletingId(null);
  };

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Department) => {
    setEditing(c);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <FolderTree className="text-cyan-neon" size={22} /> Departments
          </h2>
          <p className="mt-1 text-sm text-slate-light">
            Group products for the public navigation. Products with no
            department are shown under "Other".
          </p>
        </div>
        {writable ? (
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:shadow-neon"
          >
            <Plus size={14} /> New department
          </button>
        ) : (
          <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-light">
            Read only
          </span>
        )}
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-[0.16em] text-slate-mid">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Slug</th>
                <th className="px-5 py-3 font-semibold">Order</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-light">
                    Loading departments…
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-red-400">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-slate-light">
                    No departments yet. Create one to start organizing products.
                  </td>
                </tr>
              )}
              <AnimatePresence initial={false}>
                {rows.map((c) => (
                  <motion.tr
                    key={c.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-5 py-3 font-medium text-white">{c.name}</td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-light">
                      {c.slug}
                    </td>
                    <td className="px-5 py-3 text-slate-light">{c.sort_order}</td>
                    <td className="px-5 py-3 text-right">
                      {writable ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEdit(c)}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-light hover:border-cyan-neon/40 hover:text-white"
                          >
                            <Pencil size={12} /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(c)}
                            disabled={deletingId === c.id}
                            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-light hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                          >
                            {deletingId === c.id ? (
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
          <DepartmentModal
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

function DepartmentModal({
  initial,
  onClose,
  onSaved,
}: {
  initial: Department | null;
  onClose: () => void;
  onSaved: (c: Department, mode: "create" | "update") => void;
}) {
  const [form, setForm] = useState<FormState>(
    initial
      ? {
          name: initial.name,
          slug: initial.slug,
          sort_order: String(initial.sort_order ?? 100),
        }
      : EMPTY,
  );
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErr(null);

    const name = form.name.trim();
    const slug = form.slug.trim() || slugify(name);
    if (!name) {
      setErr("Name is required.");
      return;
    }
    if (!slug) {
      setErr("Slug is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        slug,
        sort_order: form.sort_order ? Number(form.sort_order) : 100,
      };

      if (initial) {
        const { data, error } = await supabase
          .from("departments")
          .update(payload)
          .eq("id", initial.id)
          .select("*")
          .single();
        if (error) throw error;
        onSaved(data as Department, "update");
      } else {
        const { data, error } = await supabase
          .from("departments")
          .insert(payload)
          .select("*")
          .single();
        if (error) throw error;
        onSaved(data as Department, "create");
      }
    } catch (e: any) {
      setErr(e.message ?? "Failed to save department.");
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
            {initial ? "Edit department" : "New department"}
          </h3>
          <button onClick={onClose} className="text-slate-mid hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <Field label="Name" required>
            <input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                setForm((f) => ({
                  ...f,
                  name,
                  slug: f.slug || slugify(name),
                }));
              }}
              className={inputCls}
              placeholder="e.g. Diagnostic Imaging"
            />
          </Field>

          <Field label="Slug">
            <input
              value={form.slug}
              onChange={(e) =>
                setForm((f) => ({ ...f, slug: slugify(e.target.value) }))
              }
              className={inputCls}
              placeholder="auto-generated from name"
            />
          </Field>

          <Field label="Sort order">
            <input
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
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
