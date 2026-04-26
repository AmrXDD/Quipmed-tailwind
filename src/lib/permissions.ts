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

/** Full, unrestricted admin powers: Dev + Admin. */
export const canManageEverything = (role: string | null) =>
  ["dev", "admin"].includes(norm(role));

/** View-only executives: CEO, GM. Full read, no writes on catalog. */
export const isExecutive = (role: string | null) =>
  ["ceo", "gm"].includes(norm(role));

/** Any manager tier (department-scoped). */
export const isManager = (role: string | null) =>
  [
    "finance_manager",
    "operations_manager",
    "sales_manager",
    "pr_manager",
  ].includes(norm(role));

/** Can this role enter the admin console at all? */
export const canAccessAdmin = (role: string | null) =>
  canManageEverything(role) || isExecutive(role) || isManager(role);

/** Can this role create/edit/delete in the given section? */
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
  // CEO / GM: read-only except for Orders / Analytics
  if (isExecutive(role)) return section === "orders" || section === "analytics";
  // Managers: can only update inquiries / orders in their own lane
  if (isManager(role)) return section === "inquiries" || section === "orders";
  return false;
}

/** Which sidebar sections this role can see. */
export function visibleSections(role: string | null): Set<string> {
  if (canManageEverything(role)) {
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
  if (isExecutive(role)) {
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

/** Map a Manager role to the department scope, if any. */
export function managerDepartment(role: string | null): Department | null {
  const r = norm(role);
  // By convention: Sales/PR Managers own Medical, Ops/Finance own Dental.
  // Adjust here if your org splits differently.
  if (r === "sales_manager" || r === "pr_manager") return "Medical";
  if (r === "operations_manager" || r === "finance_manager") return "Dental";
  return null;
}
