import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Briefcase,
  Loader2,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  DEPARTMENTS,
  ROLES,
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
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchRows = async () => {
    if (!supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error: fetchErr } = await supabase
      .from("profiles")
      .select("id,email,full_name,role,department")
      .order("role", { ascending: true });

    if (fetchErr) setError(fetchErr.message);
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
    const { error: updateErr } = await supabase.from("profiles").update(rest).eq("id", id);
    if (updateErr) setError(updateErr.message);
    else {
      setRows((prev) =>
        prev.map((r) => (r.id === patch.id ? { ...r, ...rest } : r)),
      );
    }
    setSavingId(null);
  };

  const onDelete = async (e: Employee) => {
    if (!supabase) return;
    if (!confirm(`Remove ${e.full_name || e.email || "employee"}?`)) return;
    setSavingId(e.id);
    const { error: delErr } = await supabase.from("profiles").delete().eq("id", e.id);
    if (delErr) setError(delErr.message);
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
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-4 py-2 text-xs font-semibold uppercase text-white transition-all hover:shadow-neon"
        >
          <UserPlus size={14} /> Invite employee
        </button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/5 bg-white/5 text-[11px] uppercase tracking-widest text-slate-mid">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-light">Loading...</td></tr>
            ) : (
              rows.map((e) => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-3 text-white">{e.full_name || "—"}</td>
                  <td className="px-5 py-3 text-slate-light">{e.email}</td>
                  <td className="px-5 py-3">
                    <select
                      value={e.role}
                      onChange={(ev) => updateRow({ id: e.id, role: ev.target.value as Role })}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={e.department ?? ""}
                      onChange={(ev) => updateRow({ id: e.id, department: ev.target.value || null })}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value="">—</option>
                      {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d}</option>))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => onDelete(e)} className="text-slate-mid hover:text-red-400">
                      {savingId === e.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {error && <p className="p-4 text-red-400 text-xs">{error}</p>}
      </div>

      <AnimatePresence>
        {inviteOpen && (
          <InviteModal onClose={() => setInviteOpen(false)} onInvited={() => { setInviteOpen(false); fetchRows(); }} />
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

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-employee", {
        body: { email, full_name: fullName, role, department: dept || null },
      });
      if (error) throw error;
      onInvited(data);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-navy-900 border border-white/10 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between mb-4">
          <h3 className="text-white font-bold">Invite Staff</h3>
          <button onClick={onClose} className="text-white"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className={inputCls} required />
          <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} className={inputCls} />
          <select value={role} onChange={e => setRole(e.target.value as Role)} className={inputCls}>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={dept} onChange={e => setDept(e.target.value)} className={inputCls}>
            <option value="">No Department</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button type="submit" disabled={submitting} className="w-full bg-cyan-neon py-2 rounded-xl text-white font-bold">
            {submitting ? "Sending..." : "Send Invite"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}

const inputCls = "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white focus:outline-none";