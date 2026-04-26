import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard, CreditCard, ShoppingBag,
  Users, UserCircle, Package, UserCog,
  FolderTree, Factory // Added icons for the missing panels
} from "lucide-react";

export default function Sidebar({ userRole }: { userRole: string | null }) {
  const location = useLocation();

  const menuItems = [
    { name: "Overview", path: "/admin", icon: <LayoutDashboard size={18} />, roles: ["any"] },
    { name: "Products", path: "/admin/products", icon: <Package size={18} />, roles: ["any"] },
    { name: "Departments", path: "/admin/departments", icon: <FolderTree size={18} />, roles: ["any"] },
    { name: "Brands", path: "/admin/brands", icon: <Factory size={18} />, roles: ["any"] }, // ADDED
    { name: "Customers", path: "/admin/customers", icon: <Users size={18} />, roles: ["any"] },
    { name: "Orders", path: "/admin/orders", icon: <ShoppingBag size={18} />, roles: ["any"] },
    { name: "Payments", path: "/admin/payments", icon: <CreditCard size={18} />, roles: ["Dev", "CEO", "GM", "Finance_Manager", "admin"] },
    { name: "Employees", path: "/admin/employees", icon: <UserCog size={18} />, roles: ["Dev", "CEO", "GM", "admin"] },
    { name: "Account", path: "/admin/account", icon: <UserCircle size={18} />, roles: ["any"] },
  ];

  return (
    <aside className="w-64 bg-navy-900 border-r border-white/5 flex flex-col h-screen p-6 shrink-0">
      <div className="mb-10 text-cyan-neon font-bold tracking-tighter text-2xl uppercase">QUIPMED</div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          // Normalize check to prevent role-casing bugs
          const hasAccess = item.roles.includes("any") ||
            item.roles.some(r => r.toLowerCase() === (userRole || "").toLowerCase());

          if (!hasAccess) return null;

          // Match both the exact path and sub-paths for active state
          const active = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${active
                ? "bg-cyan-neon text-navy-900 shadow-[0_0_15px_rgba(0,255,255,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
            >
              {item.icon}
              <span className="text-sm font-semibold">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/5">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active Terminal</p>
        <p className="text-xs font-bold text-cyan-neon mt-1 truncate">{userRole || "Guest"}</p>
      </div>
    </aside>
  );
}