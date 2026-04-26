import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  CheckCircle2,
  Loader2,
  Mail,
  Pencil,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  DEPARTMENTS,
  ROLES, // We use the roles imported from permissions.ts
  type Department,
  type Role,
} from "@/lib/permissions";

type Employee = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  department: string | null; // This now stores the UUID string from DB
};

export default function EmployeesPanel() {
  const [rows, setRows] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchRows = async () => {
    if (!supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,department")
      .order("role", { ascending: true });
    if (error) setError(error.message);
    else {
      setRows((data as Employee[]) ?? []);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const updateRow = async (patch: Partial<Employee> & { id: string }) => {
    if (!supabase) return;
    setSavingId(patch.id);
    const { id, ...rest } = patch;
    const { error } = await supabase.from("profiles").update(rest).eq("id", id);
    if (error) setError(error.message);
    else {
      setRows((prev) =>
        prev.map((r) => (r.id === patch.id ? { ...r, ...rest } : r)),
      );
    }
    setSavingId(null);
  };

  const onDelete = async (e: Employee) => {
    if (!supabase) return;
    if (
      !confirm(
        `Remove ${e.full_name || e.email || "employee"} from public.profiles? This does not delete their auth account (do that in Supabase dashboard).`,
      )
    )
      return;
    setSavingId(e.id);
    const { error } = await supabase.from("profiles").delete().eq("id", e.id);
    if (error) setError(error.message);
    else setRows((prev) => prev.filter((r) => r.id !== e.id));
    setSavingId(null);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Briefcase className="text-cyan-neon" size={22} /> Employees
          </h2>
          <p className="mt-1 text-sm text-slate-light">
            Manage staff roles and department access. Invites go out by email.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:shadow-neon"
        >
          <UserPlus size={14} /> Invite employee
        </button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-[0.16em] text-slate-mid">
              <tr>
                <th className="px-5 py-3 font-semibold">Name</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Department</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-light">
                    Loading employees…
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
                    No employees yet. Invite one to get started.
                  </td>
                </tr>
              )}
              <AnimatePresence initial={false}>
                {rows.map((e) => (
                  <motion.tr
                    key={e.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="border-b border-white/5 last:border-0 hover:bg-white/5"
                  >
                    <td className="px-5 py-3 font-medium text-white">
                      {e.full_name || "—"}
                    </td>
                    <td className="px-5 py-3 font-mono text-[11px] text-slate-light">
                      {e.email ?? "—"}
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={e.role}
                        onChange={(ev) =>
                          updateRow({ id: e.id, role: ev.target.value as Role })
                        }
                        disabled={savingId === e.id}
                        className={selectCls}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={e.department ?? ""}
                        onChange={(ev) =>
                          updateRow({
                            id: e.id,
                            department: (ev.target.value || null),
                          })
                        }
                        disabled={savingId === e.id}
                        className={selectCls}
                      >
                        <option value="">—</option>
                        {DEPARTMENTS.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditing(e)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-light hover:border-cyan-neon/40 hover:text-white"
                        >
                          <Pencil size={12} /> Edit name
                        </button>
                        <button
                          onClick={() => onDelete(e)}
                          disabled={savingId === e.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-slate-light hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                        >
                          {savingId === e.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Trash2 size={12} />
                          )}
                          Remove
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {inviteOpen && (
          <InviteModal
            onClose={() => setInviteOpen(false)}
            onInvited={() => {
              setInviteOpen(false);
              fetchRows();
            }}
          />
        )}
        {editing && (
          <EditNameModal
            employee={editing}
            onClose={() => setEditing(null)}
            onSaved={(full_name) => {
              updateRow({ id: editing.id, full_name });
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Invite modal — calls the `invite-employee` Edge Function
   ────────────────────────────────────────────────────────────── */

function InviteModal({
  onClose,
  onInvited,
}: {
  onClose: () => void;
  onInvited: (r: any) => void;
}) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  // ROLES contains: ["Dev", "Admin", "CEO", "GM", "Finance_Manager", etc.]
  const [role, setRole] = useState<Role>("User");
  const [departmentId, setDepartmentId] = useState(""); // Stores the UUID
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setErr(null);
    setSuccess(null);

    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setErr("Enter a valid email.");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-employee", {
        body: {
          email: clean,
          full_name: fullName.trim(),
          role, // Sending the plain role name ("CEO", "Dev", etc.)
          department: departmentId || null, // FIX: Sending the UUID string, not the name
        },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);

      setSuccess(`Invite sent to ${clean}.`);
      onInvited(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to send invite.");
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
            <UserPlus size={14} /> Invite employee
          </h3>
          <button onClick={onClose} className="text-slate-mid hover:text-white">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-5">
          <Field label="Email" required>
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3">
              <Mail size={14} className="text-slate-mid" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm text-white placeholder:text-slate-mid focus:outline-none"
                placeholder="name@quipmed.com"
                autoComplete="email"
              />
            </div>
          </Field>

          <Field label="Full name">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputCls}
              placeholder="Jane Smith"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role" required>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className={inputCls}
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {/* Replaces underscores with spaces for display */}
                    {r.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Department">
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className={inputCls}
              >
                <option value="">—</option>
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </Field>
          </div>

          {err && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {err}
            </p>
          )}
          {success && (
            <p className="inline-flex items-center gap-2 rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-xs text-mint">
              <CheckCircle2 size={14} /> {success}
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
              {submitting ? "Sending" : "Send invite"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Simple rename modal
   ────────────────────────────────────────────────────────────── */

function EditNameModal({
  employee,
  onClose,
  onSaved,
}: {
  employee: Employee;
  onClose: () => void;
  onSaved: (full_name: string) => void;
}) {
  const [name, setName] = useState(employee.full_name ?? "");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-navy-900 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-soft">
            Edit name
          </h3>
          <button onClick={onClose} className="text-slate-mid hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <Field label="Full name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
            />
          </Field>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-light hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              onClick={() => onSaved(name.trim())}
              className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:shadow-neon"
            >
              Save
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-mid focus:border-cyan-neon/50 focus:outline-none";

const selectCls =
  "rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:border-cyan-neon/50 focus:outline-none disabled:opacity-50";

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