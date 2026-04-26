import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AtSign, CheckCircle2, KeyRound, Loader2, User, XCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "success"; msg: string }
  | { kind: "error"; msg: string };

export default function AccountSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [currentEmail, setCurrentEmail] = useState<string>("");
  const [currentName, setCurrentName] = useState<string>("");

  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      setCurrentEmail(user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();
      if (data?.full_name) setCurrentName(data.full_name);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
        <p className="mt-1 text-sm text-slate-light">
          Update your profile name, sign-in email, and password.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <UsernameCard
          userId={userId}
          currentName={currentName}
          onSaved={(v) => setCurrentName(v)}
        />
        <EmailCard currentEmail={currentEmail} />
        <PasswordCard />
      </div>
    </div>
  );
}

function UsernameCard({
  userId,
  currentName,
  onSaved,
}: {
  userId: string | null;
  currentName: string;
  onSaved: (v: string) => void;
}) {
  const [name, setName] = useState(currentName);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => setName(currentName), [currentName]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !userId) return;
    if (!name.trim()) {
      setStatus({ kind: "error", msg: "Name cannot be empty." });
      return;
    }
    setStatus({ kind: "loading" });
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() })
      .eq("id", userId);
    if (error) setStatus({ kind: "error", msg: error.message });
    else {
      onSaved(name.trim());
      setStatus({ kind: "success", msg: "Name updated." });
    }
  };

  return (
    <Card icon={<User size={16} />} title="Display name">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your display name"
          />
        </Field>
        <Actions
          status={status}
          label="Save name"
          disabled={name.trim() === currentName.trim()}
        />
      </form>
    </Card>
  );
}

function EmailCard({ currentEmail }: { currentEmail: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const next = email.trim().toLowerCase();
    if (!next || next === currentEmail.toLowerCase()) {
      setStatus({ kind: "error", msg: "Enter a different email address." });
      return;
    }
    setStatus({ kind: "loading" });
    const { error } = await supabase.auth.updateUser({ email: next });
    if (error) setStatus({ kind: "error", msg: error.message });
    else
      setStatus({
        kind: "success",
        msg: "Confirmation sent. Verify the link in both your current and new inbox to finish.",
      });
  };

  return (
    <Card icon={<AtSign size={16} />} title="Email address">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current email">
          <input value={currentEmail} disabled className={`${inputCls} opacity-60`} />
        </Field>
        <Field label="New email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputCls}
            placeholder="you@quipmed.com"
          />
        </Field>
        <Actions status={status} label="Update email" disabled={!email} />
      </form>
    </Card>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    if (next.length < 8) {
      setStatus({ kind: "error", msg: "Password must be at least 8 characters." });
      return;
    }
    if (next !== confirm) {
      setStatus({ kind: "error", msg: "Passwords do not match." });
      return;
    }

    setStatus({ kind: "loading" });

    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (!email) {
      setStatus({ kind: "error", msg: "No active session found." });
      return;
    }

    const { error: verifyErr } = await supabase.auth.signInWithPassword({
      email,
      password: current,
    });
    if (verifyErr) {
      setStatus({ kind: "error", msg: "Current password is incorrect." });
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: next });
    if (error) {
      setStatus({ kind: "error", msg: error.message });
      return;
    }

    setCurrent("");
    setNext("");
    setConfirm("");
    setStatus({ kind: "success", msg: "Password updated." });
  };

  return (
    <Card icon={<KeyRound size={16} />} title="Password">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password">
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputCls}
            autoComplete="current-password"
          />
        </Field>
        <Field label="New password">
          <input
            type="password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            className={inputCls}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirm new password">
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputCls}
            autoComplete="new-password"
          />
        </Field>
        <Actions
          status={status}
          label="Update password"
          disabled={!current || !next || !confirm}
        />
      </form>
    </Card>
  );
}

function Card({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-white/10 bg-white/5 p-6"
    >
      <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-soft">
        <span className="text-cyan-neon">{icon}</span>
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-mid">
        {label}
      </span>
      {children}
    </label>
  );
}

function Actions({
  status,
  label,
  disabled,
}: {
  status: Status;
  label: string;
  disabled?: boolean;
}) {
  const loading = status.kind === "loading";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
      <StatusLine status={status} />
      <button
        type="submit"
        disabled={loading || disabled}
        className="inline-flex items-center gap-2 rounded-full bg-cyan-neon px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-all hover:shadow-neon disabled:opacity-50"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? "Saving" : label}
      </button>
    </div>
  );
}

function StatusLine({ status }: { status: Status }) {
  if (status.kind === "success")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
        <CheckCircle2 size={14} /> {status.msg}
      </span>
    );
  if (status.kind === "error")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-400">
        <XCircle size={14} /> {status.msg}
      </span>
    );
  return <span />;
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-slate-mid focus:border-cyan-neon/50 focus:outline-none";
