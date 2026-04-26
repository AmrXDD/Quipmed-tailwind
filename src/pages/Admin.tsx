import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { LogOut, Package, Factory, FolderTree, Mail, Inbox, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// Components - Matching your file tree exactly
import Sidebar from "@/components/SideBar";
import ProductsPanel from "@/components/admin/ProductsPanel";
import InquiriesPanel from "@/components/admin/InquiriesPanel";
import BrandsPanel from "@/components/admin/BrandsPanel";
import DepartmentsPanel from "@/components/admin/DepartmentsPanel";
import AccountSettings from "@/components/admin/AccountSettings";
import EmployeesPanel from "@/components/admin/EmployeesPanel";
import { visibleSections } from "@/lib/permissions";

export default function Admin({ userRole }: { userRole: string | null }) {
  const navigate = useNavigate();
  const sections = visibleSections(userRole);

  const signOut = async () => {
    await supabase?.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="flex h-screen w-full bg-navy-900 text-white overflow-hidden">
      <Sidebar userRole={userRole} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="flex shrink-0 items-center justify-between border-b border-white/5 bg-navy-900/80 px-8 py-4 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-soft">
              QuipMed Admin Console
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:block text-right">
              <p className="text-[10px] uppercase tracking-widest text-slate-mid">Role</p>
              <p className="text-xs font-bold text-cyan-neon uppercase">{userRole || "Guest"}</p>
            </div>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-light hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <Routes>
            <Route index element={<OverviewPanel />} />

            {sections.has("products") && (
              <Route path="products" element={<ProductsPanel userRole={userRole} />} />
            )}
            {sections.has("customers") && (
              <Route path="customers" element={<InquiriesPanel />} />
            )}
            {sections.has("brands") && (
              <Route path="brands" element={<BrandsPanel userRole={userRole} />} />
            )}
            {sections.has("departments") && (
              <Route
                path="departments"
                element={<DepartmentsPanel userRole={userRole} />}
              />
            )}
            {sections.has("account") && (
              <Route path="account" element={<AccountSettings />} />
            )}
            {sections.has("orders") && (
              <Route path="orders" element={<Placeholder title="Orders" />} />
            )}
            {sections.has("payments") && (
              <Route path="payments" element={<Placeholder title="Payments" />} />
            )}
            {sections.has("employees") && (
              <Route path="employees" element={<EmployeesPanel />} />
            )}

            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

type Stats = {
  products: number;
  brands: number;
  departments: number;
  inquiries: number;
  newInquiries: number;
  employees: number | null;
  byBrand: { name: string; count: number }[];
  byDepartment: { name: string; count: number }[];
  recentInquiries: { id: string; full_name: string; email: string; subject: string | null; created_at: string }[];
};

function OverviewPanel() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!supabase) {
      setError("Supabase not configured");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [
          productsRes,
          brandsRes,
          deptsRes,
          inqAllRes,
          inqNewRes,
          recentInqRes,
          employeesRes,
        ] = await Promise.all([
          supabase.from("products").select("brand,department_id"),
          supabase.from("brands").select("id,name"),
          supabase.from("departments").select("id,name"),
          supabase.from("inquiries").select("id", { count: "exact", head: true }),
          supabase
            .from("inquiries")
            .select("id", { count: "exact", head: true })
            .eq("status", "new"),
          supabase
            .from("inquiries")
            .select("id,full_name,email,subject,created_at")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("profiles").select("id", { count: "exact", head: true }),
        ]);

        if (cancelled) return;

        const products = productsRes.data ?? [];
        const brands = brandsRes.data ?? [];
        const departments = deptsRes.data ?? [];

        const brandCounts = new Map<string, number>();
        for (const p of products) {
          const k = (p as any).brand ?? "—";
          brandCounts.set(k, (brandCounts.get(k) ?? 0) + 1);
        }
        const byBrand = brands
          .map((b: any) => ({ name: b.name, count: brandCounts.get(b.name) ?? 0 }))
          .sort((a: { count: number }, b: { count: number }) => b.count - a.count);

        const deptCounts = new Map<string, number>();
        for (const p of products) {
          const id = (p as any).department_id;
          if (id) deptCounts.set(id, (deptCounts.get(id) ?? 0) + 1);
        }
        const byDepartment = departments
          .map((d: any) => ({ name: d.name, count: deptCounts.get(d.id) ?? 0 }))
          .sort((a: { count: number }, b: { count: number }) => b.count - a.count);

        setStats({
          products: products.length,
          brands: brands.length,
          departments: departments.length,
          inquiries: inqAllRes.count ?? 0,
          newInquiries: inqNewRes.count ?? 0,
          employees: employeesRes.error ? null : employeesRes.count ?? 0,
          byBrand,
          byDepartment,
          recentInquiries: (recentInqRes.data as any[]) ?? [],
        });
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load analytics");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="mt-1 text-sm text-slate-mid">
          Live snapshot of catalog &amp; customer activity.
        </p>
      </header>

      {loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-white/10 bg-white/5"
            />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {stats && !loading && (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Products"   value={stats.products}    icon={<Package size={16} />} />
            <StatCard label="Brands"     value={stats.brands}      icon={<Factory size={16} />} />
            <StatCard label="Departments" value={stats.departments} icon={<FolderTree size={16} />} />
            <StatCard label="Inquiries"  value={stats.inquiries}   icon={<Mail size={16} />}
                      hint={`${stats.newInquiries} new`} />
            {stats.employees !== null && (
              <StatCard label="Employees" value={stats.employees}  icon={<Users size={16} />} />
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Panel title="Products by brand">
              <BarList items={stats.byBrand} max={Math.max(1, ...stats.byBrand.map((x) => x.count))} />
            </Panel>
            <Panel title="Products by department">
              <BarList items={stats.byDepartment} max={Math.max(1, ...stats.byDepartment.map((x) => x.count))} />
            </Panel>
          </div>

          <Panel title="Recent inquiries" icon={<Inbox size={16} className="text-cyan-neon" />}>
            {stats.recentInquiries.length === 0 ? (
              <p className="text-sm text-slate-mid">No inquiries yet.</p>
            ) : (
              <ul className="divide-y divide-white/5">
                {stats.recentInquiries.map((i) => (
                  <li key={i.id} className="flex items-center justify-between py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">{i.full_name}</p>
                      <p className="truncate text-xs text-slate-mid">
                        {i.subject ?? i.email}
                      </p>
                    </div>
                    <span className="ml-4 shrink-0 text-xs text-slate-mid">
                      {new Date(i.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-navy-800 p-5">
      <div className="flex items-center justify-between text-slate-mid">
        <span className="text-[10px] font-semibold uppercase tracking-widest">{label}</span>
        <span className="text-cyan-neon">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold text-white">{value.toLocaleString()}</p>
      {hint && <p className="mt-1 text-[11px] text-mint">{hint}</p>}
    </div>
  );
}

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-navy-800/60 p-5">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-light">
        {icon} {title}
      </h3>
      {children}
    </section>
  );
}

function BarList({
  items,
  max,
}: {
  items: { name: string; count: number }[];
  max: number;
}) {
  if (items.length === 0)
    return <p className="text-sm text-slate-mid">No data yet.</p>;
  return (
    <ul className="space-y-3">
      {items.map((it) => (
        <li key={it.name}>
          <div className="flex items-center justify-between text-xs">
            <span className="truncate text-slate-light">{it.name}</span>
            <span className="font-mono text-cyan-neon">{it.count}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
            <div
              className="h-full rounded-full bg-cyan-neon/70"
              style={{ width: `${(it.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="h-full flex items-center justify-center border-2 border-dashed border-white/5 rounded-3xl">
      <h2 className="text-xl font-bold text-slate-500">{title} Module Loaded</h2>
    </div>
  );
}