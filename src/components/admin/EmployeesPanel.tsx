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
  ROLES,
  type Department,
  type Role,
} from "@/lib/permissions";

type Employee = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: Role;
  department: string | null;
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
        `Remove ${e.full_name || e.email || "employee"} from profiles?`,
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
            Manage staff roles and department access.
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
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-light">Loading...</td></tr>
              ) : rows.map((e) => (
                <motion.tr
                  key={e.id}
                  layout
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="px-5 py-3 text-white">{e.full_name || "—"}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-slate-light">{e.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={e.role}
                      onChange={(ev) => updateRow({ id: e.id, role: ev.target.value as Role })}
                      className={selectCls}
                    >
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={e.department ?? ""}
                      onChange={(ev) => updateRow({ id: e.id, department: ev.target.value || null })}
                      className={selectCls}
                    >
                      <option value="">—</option>
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => onDelete(e)} className="text-slate-mid hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {inviteOpen && (
          <InviteModal onClose={() => setInviteOpen(false)} onInvited={() => { setInviteOpen(false); fetchRows(); }} />
        )}
        {editing && (
          <EditNameModal employee={editing} onClose={() => setEditing(null)} onSaved={(full_name) => { updateRow({ id: editing.id, full_name }); setEditing(null); }} />
        )}
      </AnimatePresence>
    </div>
  );
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: (r: any) => void }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<Role>("User");
  const [dept, setDept] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErr(null);
    try {
      const { data, error } = await supabase.functions.invoke("invite-employee", {
        body: { email, full_name: fullName, role, department: dept || null },
      });
      if (error) throw error;
      onInvited(data);
    } catch (err: any) {
      setErr(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <motion.div className="w-full max-w-md bg-navy-900 border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-white font-bold mb-4">Invite Employee</h3>
        <form onSubmit={submit} className="space-y-4">
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} />
          <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} />
          <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputCls}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={dept} onChange={e => setDept(e.target.value)} className={inputCls}>
            <option value="">No Department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          {err && <p className="text-red-400 text-xs">{err}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-cyan-neon py-2 rounded-xl text-white font-bold">
            {submitting ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function EditNameModal({ employee, onClose, onSaved }: { employee: Employee; onClose: () => void; onSaved: (n: string) => void }) {
  const [name, setName] = useState(employee.full_name ?? "");
  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-4" onClick={onClose}>
      <div className="bg-navy-900 border border-white/10 p-6 rounded-2xl" onClick={e => e.stopPropagation()}>
        <input value={name} onChange={e => setName(e.target.value)} className={inputCls} />
        <button onClick={() => onSaved(name)} className="mt-4 w-full bg-cyan-neon py-2 rounded-xl text-white">Save</button>
      </div>
    </motion.div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none";
const selectCls = "rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-semibold text-slate-mid uppercase">{label} {required && "*"}</span>
      {children}
    </label>
  );
}