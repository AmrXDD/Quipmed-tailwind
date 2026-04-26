import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2, AlertTriangle } from "lucide-react";
import { supabase, HAS_SUPABASE } from "@/lib/supabaseClient";
import Logo from "@/components/Logo";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string>("");

  // If a valid session already exists (or SIGNED_IN fires), go to /admin.
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (!cancelled && session) navigate("/admin", { replace: true });
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        if (event === "SIGNED_IN" && session) {
          navigate("/admin", { replace: true });
        }
      },
    );

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setErr("");

    if (!HAS_SUPABASE || !supabase) {
      setErr("Supabase is not configured. Add env vars and restart the dev server.");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        setErr(error.message);
        return;
      }
      if (data?.session) {
        // Auth listener above will navigate, but do it explicitly as a belt-and-braces.
        navigate("/admin", { replace: true });
      } else {
        setErr("Login succeeded but no session was returned. Try again.");
      }
    } catch (ex: any) {
      console.error("Login failure:", ex);
      setErr(ex?.message || "Unexpected login failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-navy-900 px-5">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm rounded-3xl border border-white/10 bg-navy-800/70 p-8 backdrop-blur"
      >
        <form onSubmit={onSubmit} noValidate>
          <Logo className="mx-auto block h-12 w-auto" />
          <h1 className="mt-8 flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-soft">
            <Lock size={14} /> Admin Sign In
          </h1>
          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-mid">
                Email
              </span>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-navy-900/60 px-4 py-3 text-sm text-primary outline-none focus:border-cyan-neon/60 focus:ring-2 focus:ring-cyan-neon/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-mid">
                Password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-xl border border-white/10 bg-navy-900/60 px-4 py-3 text-sm text-primary outline-none focus:border-cyan-neon/60 focus:ring-2 focus:ring-cyan-neon/20"
              />
            </label>
          </div>
          {err && (
            <p className="mt-4 flex items-center gap-2 text-xs text-red-400" role="alert">
              <AlertTriangle size={14} />
              {err}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-cyan-neon px-5 py-3 text-sm font-semibold text-navy-900 transition-all hover:shadow-neon disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
          </button>
          <p className="mt-6 text-center text-xs text-slate-mid">
            Use the Supabase-created user account for this project.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
