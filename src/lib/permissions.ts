export const ROLES = [
  "Dev",
  "Admin",
  "CEO",
  "GM",
  "Finance_Manager",
  "Operations_Manager",
  "Sales_Manager",
  "PR_Manager",
  "User",
] as const;

export type Role = (typeof ROLES)[number];

export const DEPARTMENTS = ["Medical", "Dental"] as const;
export type Department = (typeof DEPARTMENTS)[number];

const norm = (r: string | null | undefined) => (r ?? "").toLowerCase();

export const canManageEverything = (role: string | null) =>
  ["dev", "admin"].includes(norm(role));

export const isExecutive = (role: string | null) =>
  ["ceo", "gm"].includes(norm(role));

export const isManager = (role: string | null) =>
  [
    "finance_manager",
    "operations_manager",
    "sales_manager",
    "pr_manager",
  ].includes(norm(role));

export const canAccessAdmin = (role: string | null) =>
  canManageEverything(role) || isExecutive(role) || isManager(role);

export function canEdit(
  role: string | null,
  section:
    | "products"
    | "departments"
    | "brands"
    | "employees"
    | "orders"
    | "analytics"
    | "inquiries",
): boolean {
  if (canManageEverything(role)) return true;
  if (isExecutive(role)) return section === "orders" || section === "analytics";
  if (isManager(role)) return section === "inquiries" || section === "orders";
  return false;
}

export function visibleSections(role: string | null): Set<string> {
  if (canManageEverything(role) || isExecutive(role)) {
    return new Set([
      "overview",
      "products",
      "departments",
      "brands",
      "customers",
      "orders",
      "employees",
      "payments",
      "account",
    ]);
  }
  if (isManager(role)) {
    return new Set(["overview", "products", "customers", "orders", "account"]);
  }
  return new Set(["account"]);
}

export function managerDepartment(role: string | null): Department | null {
  const r = norm(role);
  if (r === "sales_manager" || r === "pr_manager") return "Medical";
  if (r === "operations_manager" || r === "finance_manager") return "Dental";
  return null;
}