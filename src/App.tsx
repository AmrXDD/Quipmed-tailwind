import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { AnimatePresence } from "framer-motion";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart";
import PageTransition from "@/components/PageTransition";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Brands from "@/pages/Brands";
import Contact from "@/pages/Contact";
import AdminLogin from "@/pages/AdminLogin";
import Admin from "@/pages/Admin";

import { supabase, getUserProfile } from "@/lib/supabaseClient";
import { canAccessAdmin, ROLES } from "@/lib/permissions";

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isLoginPage = location.pathname === "/admin/login";

  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("theme");
    return (saved as "dark" | "light") || "dark";
  });

  // Resolve the role for a given session. If the profiles table has a row,
  // use that. Otherwise any authenticated user defaults to "Dev" (full access).
  const resolveRole = useCallback(async (session: any): Promise<string | null> => {
    if (!session?.user) return null;
    const timeout = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 5000),
    );
    const profile = await Promise.race([getUserProfile(), timeout]);

    if (profile?.role) return profile.role;

    console.warn(
      `No profile row for ${session.user?.email} — defaulting to Dev.`,
    );
    return "Dev";
  }, []);

  useEffect(() => {
    let cancelled = false;
    let initialHandled = false;

    // Safety net: if neither getSession nor INITIAL_SESSION resolves, stop loading.
    const safety = setTimeout(() => {
      if (!cancelled && !initialHandled) {
        console.warn("App: initial session check timed out.");
        setLoading(false);
      }
    }, 8000);

    const handleSession = async (session: any, tag: string) => {
      if (cancelled) return;
      console.log(`Auth [${tag}]`, session ? `session for ${session.user?.email}` : "no session");
      // Gate the UI until the role is resolved — prevents ProtectedRoute from
      // rendering with a stale null userRole during the SIGNED_IN → navigate
      // race right after login.
      setLoading(true);
      const role = await resolveRole(session);
      if (cancelled) return;
      setUserRole(role);
      setLoading(false);
      initialHandled = true;
      clearTimeout(safety);
    };

    // Drive session state off the listener — it fires INITIAL_SESSION on subscribe
    // once the stored session has been rehydrated, avoiding the getSession race.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        if (event === "SIGNED_OUT") {
          if (!cancelled) {
            setUserRole(null);
            setLoading(false);
          }
          return;
        }
        // INITIAL_SESSION, SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED → re-resolve.
        void handleSession(session, event);
      },
    );

    // Fallback: if the listener doesn't fire fast enough, do a direct read.
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (!initialHandled) void handleSession(session, "getSession");
    });

    return () => {
      cancelled = true;
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, [resolveRole]);

  // Theme management
  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("theme-white");
    } else {
      document.documentElement.classList.remove("theme-white");
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // ── LOADING STATE ──────────────────────────────────────────────
  // If we are on an admin path and still loading, show the terminal loader
  if (loading && isAdminPath && !isLoginPage) {
    return (
      <div className="h-screen bg-navy-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-1 w-32 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-full origin-left animate-progress bg-cyan-neon" />
          </div>
          <div className="text-cyan-neon uppercase tracking-[0.3em] text-[10px] font-bold font-mono">
            Verifying Terminal Access...
          </div>
        </div>
      </div>
    );
  }

  return (
    <CartProvider>
      <div className={theme === "light" ? "theme-white" : ""}>
        {!isAdminPath && <Nav theme={theme} toggleTheme={toggleTheme} />}
        {!isAdminPath && <CartDrawer />}

        <AnimatePresence mode="wait">
          <Routes location={location} key={isAdminPath ? "admin-root" : location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/about" element={<PageTransition><About /></PageTransition>} />
            <Route path="/products" element={<PageTransition><Products /></PageTransition>} />
            <Route path="/brands" element={<PageTransition><Brands /></PageTransition>} />
            <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />

            <Route path="/admin/login" element={<AdminLogin />} />

            <Route
              path="/admin/*"
              element={
                <ProtectedRoute
                  requiredRoles={ROLES.filter((r) => canAccessAdmin(r))}
                  userRole={userRole}
                >
                  <Admin userRole={userRole} />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AnimatePresence>

        {!isAdminPath && <Footer />}
      </div>
    </CartProvider>
  );
}