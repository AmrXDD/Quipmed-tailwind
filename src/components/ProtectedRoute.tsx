import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  children: React.ReactNode;
  requiredRoles?: string[];
  userRole?: string | null;
}

/**
 * Protects admin routes.
 * Relies on the parent <App/> to resolve the user's role and pass it as `userRole`.
 * This component only gates on session presence + role membership.
 */
export default function ProtectedRoute({ children, requiredRoles, userRole }: Props) {
  const [state, setState] = useState<"loading" | "auth" | "anon">("loading");
  const [waitedForRole, setWaitedForRole] = useState(false);
  const location = useLocation();

  // Grace period: when we've confirmed a session but App hasn't passed a role
  // down yet (race right after signInWithPassword → navigate), wait briefly
  // before giving up and redirecting.
  useEffect(() => {
    if (state !== "auth" || userRole) {
      setWaitedForRole(false);
      return;
    }
    const t = setTimeout(() => setWaitedForRole(true), 4000);
    return () => clearTimeout(t);
  }, [state, userRole]);

  useEffect(() => {
    if (!supabase) {
      setState("anon");
      return;
    }

    let cancelled = false;

    // Hard safety net — never stay in "loading" forever.
    const safety = setTimeout(() => {
      if (!cancelled) {
        console.warn("ProtectedRoute: session check timed out, treating as anon.");
        setState("anon");
      }
    }, 5000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }: { data: { session: any } }) => {
        if (cancelled) return;
        clearTimeout(safety);
        setState(session ? "auth" : "anon");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        clearTimeout(safety);
        console.error("Session fetch failed:", err);
        setState("anon");
      });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_evt: string, session: any) => {
        setState(session ? "auth" : "anon");
      },
    );

    return () => {
      cancelled = true;
      clearTimeout(safety);
      sub.subscription.unsubscribe();
    };
  }, []);

  const awaitingRole =
    state === "auth" &&
    requiredRoles &&
    requiredRoles.length > 0 &&
    !userRole &&
    !waitedForRole;

  if (state === "loading" || awaitingRole) {
    return (
      <div className="grid min-h-screen place-items-center bg-navy-900 text-slate-mid">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-sm">
            <span className="h-2 w-2 animate-ping rounded-full bg-cyan-neon" />
            Verifying Access...
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">
            QuipMed Secure Protocol
          </p>
        </div>
      </div>
    );
  }

  if (state === "anon") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Role gate
  if (requiredRoles && requiredRoles.length > 0) {
    const allowed = requiredRoles.map((r) => r.toLowerCase());
    const role = (userRole ?? "").toLowerCase();

    if (role === "dev") return <>{children}</>;

    if (!role) {
      console.warn("Access Denied: authenticated user has no role assigned.");
      return <Navigate to="/" replace />;
    }

    if (!allowed.includes(role)) {
      console.warn(`Access Denied: role "${role}" not in`, allowed);
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
