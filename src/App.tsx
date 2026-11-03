import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";

import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { CartProvider } from "@/lib/cart";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "@/pages/Home";
import About from "@/pages/About";
import Products from "@/pages/Products";
import Brands from "@/pages/Brands";
import Contact from "@/pages/Contact";
import Privacy from "@/pages/legal/Privacy";
import Terms from "@/pages/legal/Terms";
import Cookies from "@/pages/legal/Cookies";
import NotFound from "@/pages/NotFound";
import CookieConsent from "@/components/CookieConsent";
import RouteCurtain from "@/components/PageTransition";
import {
  pruneScrollTriggers,
  scrollToTop,
  startReveals,
  startSmoothScroll,
  stopReveals,
  stopSmoothScroll,
} from "@/lib/motion";
import AdminLogin from "@/pages/AdminLogin";
import Admin from "@/pages/Admin";

import { supabase } from "@/lib/supabaseClient";
import { canAccessAdmin, ROLES } from "@/lib/permissions";

export default function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isLoginPage = location.pathname === "/admin/login";
  const isAdminPathRef = useRef(isAdminPath);
  isAdminPathRef.current = isAdminPath;

  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("theme");
    } catch {
      /* storage blocked */
    }
    return saved === "light" ? "light" : "dark";
  });

  // Resolve the role for a session straight from the profiles table, using
  // the session we were handed. Returns undefined when the lookup failed or
  // timed out, so callers can keep the role they already had.
  const resolveRole = useCallback(
    async (session: any): Promise<string | null | undefined> => {
      if (!session?.user) return null;
      const timeout = new Promise<"timeout">((resolve) =>
        setTimeout(() => resolve("timeout"), 6000),
      );
      const query = supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();
      const res = await Promise.race([query, timeout]);
      if (res === "timeout" || res.error) return undefined;
      return res.data?.role ?? null;
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    let initialHandled = false;
    let lastUserId: string | null = null;

    const safety = setTimeout(() => {
      if (!cancelled && !initialHandled) {
        console.warn("App: initial session check timed out.");
        setLoading(false);
      }
    }, 8000);

    const handleSession = async (session: any) => {
      if (cancelled) return;
      const userId = session?.user?.id ?? null;
      const first = !initialHandled;
      // Only the very first check (or a different user signing in) shows the
      // loading screen. Later auth events must never unmount the admin.
      if (first || userId !== lastUserId) setLoading(isAdminPathRef.current);
      const role = await resolveRole(session);
      if (cancelled) return;
      // A failed/slow lookup keeps the role we already know.
      if (role !== undefined || userId !== lastUserId) setUserRole(role ?? null);
      lastUserId = userId;
      setLoading(false);
      initialHandled = true;
      clearTimeout(safety);
    };

    // IMPORTANT: never await Supabase calls inside onAuthStateChange — the
    // client holds an auth lock while the callback runs, and awaiting another
    // call there deadlocks every request (admin data, saves, etc.).
    // Defer the work to a new task instead.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (event === "SIGNED_OUT") {
        if (!cancelled) {
          lastUserId = null;
          setUserRole(null);
          setLoading(false);
        }
        return;
      }
      // A token refresh doesn't change who you are or your role.
      if (event === "TOKEN_REFRESHED" && initialHandled) return;
      setTimeout(() => void handleSession(session), 0);
    });

    return () => {
      cancelled = true;
      clearTimeout(safety);
      subscription.unsubscribe();
    };
  }, [resolveRole]);

  // Theme management
  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch {
      /* storage blocked */
    }
    if (theme === "light") {
      document.documentElement.classList.add("theme-white");
    } else {
      document.documentElement.classList.remove("theme-white");
    }
  }, [theme]);

  // Smooth scroll + scroll reveals on the public site only; the admin
  // panels keep native scrolling for their own scroll containers.
  useEffect(() => {
    if (isAdminPath) {
      stopSmoothScroll();
      stopReveals();
      return;
    }
    startSmoothScroll();
    startReveals();
  }, [isAdminPath]);

  // New page: start at the top and drop scroll triggers of the old one.
  useEffect(() => {
    if (isAdminPath) return;
    scrollToTop();
    pruneScrollTriggers();
  }, [location.pathname, isAdminPath]);

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

  const routes = (
    <Routes location={location}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/products" element={<Products />} />
      <Route path="/brands" element={<Brands />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />

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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );

  return (
    <CartProvider>
      <div className={theme === "light" ? "theme-white" : ""}>
        {!isAdminPath && <Nav theme={theme} toggleTheme={toggleTheme} />}
        {!isAdminPath && <CartDrawer />}


        {!isAdminPath && <div className="grain" aria-hidden="true" />}

        <main id="main" key={location.pathname} className="min-h-screen bg-navy-900">
          {routes}
        </main>
        {!isAdminPath && <RouteCurtain />}

        {!isAdminPath && <Footer />}
        {!isAdminPath && <WhatsAppButton />}
        <CookieConsent />
      </div>
    </CartProvider>
  );
}