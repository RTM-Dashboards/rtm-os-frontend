// RTM OS — Shared Auth Vocabulary
//
// SINGLE SOURCE OF TRUTH for role, status, and department string unions.
//
// Rules:
//   - No Prisma enums (project convention: plain strings, enforced at the
//     TypeScript/server layer).
//   - No Zod. Validation uses Array.includes() against the arrays exported here.
//   - Import from here; do not redeclare these unions elsewhere.
//
// ── Role hierarchy (highest to lowest) ────────────────────────────────────────
//   SystemAdmin (4)  technical owner, unrestricted
//   Executive   (3)  business leadership, all departments
//   Manager     (2)  one department only
//   Member      (1)  read-only access, no role-setting ability
//
// ── Departments ───────────────────────────────────────────────────────────────
//   Ten departments, exactly as named in lib/workspace-people.ts.
//   The DEPARTMENTS array is the canonical validate-against list for the
//   PATCH /api/users route and for every future route that accepts a department.

// ── UserRole ──────────────────────────────────────────────────────────────────

export type UserRole = "SystemAdmin" | "Executive" | "Manager" | "Member";

export const VALID_ROLES: readonly UserRole[] = [
  "SystemAdmin",
  "Executive",
  "Manager",
  "Member",
] as const;

// ── UserStatus ────────────────────────────────────────────────────────────────

export type UserStatus = "pending" | "active" | "disabled";

export const VALID_STATUSES: readonly UserStatus[] = [
  "pending",
  "active",
  "disabled",
] as const;

// ── Departments ───────────────────────────────────────────────────────────────
// Sourced from lib/workspace-people.ts (the 9 profile.department values) plus
// "IT & Security" (matches the IT & Security section's department value in that
// same file). These are the ten canonical department names for this application.
//
// Verified against lib/workspace-people.ts lines 80, 275, 463, 651, 822,
// 993, 1171, 1342, 1513, 1684.

export type Department =
  | "Account Management"
  | "Sales"
  | "Billing"
  | "Content"
  | "Web Development & Design"
  | "SEO & Local"
  | "Paid Advertising"
  | "Reporting"
  | "Local Service Ads"
  | "IT & Security";

export const VALID_DEPARTMENTS: readonly Department[] = [
  "Account Management",
  "Sales",
  "Billing",
  "Content",
  "Web Development & Design",
  "SEO & Local",
  "Paid Advertising",
  "Reporting",
  "Local Service Ads",
  "IT & Security",
] as const;

// ── Role rank ─────────────────────────────────────────────────────────────────
// Higher number = higher privilege. Used for tier comparisons.
// Executive slots between SystemAdmin and Manager.

export const ROLE_RANK: Record<UserRole, number> = {
  Member:      1,
  Manager:     2,
  Executive:   3,
  SystemAdmin: 4,
} as const;

// ── Named vocabulary lookup ───────────────────────────────────────────────────
//
// Use requireDept() and requireRole_() to resolve a named department or role
// constant from the vocabulary arrays WITHOUT positional indexing.
//
// Both functions throw at module-load time if the name is absent, so a
// rename or typo surfaces immediately as a startup error rather than
// silently returning undefined and granting or denying access by accident.
//
// Usage (replaces positional patterns like VALID_DEPARTMENTS[0]):
//   const SALES_DEPT = requireDept("Sales");
//   const AM_DEPT    = requireDept("Account Management");

export function requireDept(name: Department): Department {
  if (!(VALID_DEPARTMENTS as readonly string[]).includes(name)) {
    throw new Error(
      `[vocab] Department "${name}" is not in VALID_DEPARTMENTS. ` +
      `Known values: ${VALID_DEPARTMENTS.join(", ")}`
    );
  }
  return name;
}

export function requireRole_(name: UserRole): UserRole {
  if (!(VALID_ROLES as readonly string[]).includes(name)) {
    throw new Error(
      `[vocab] Role "${name}" is not in VALID_ROLES. ` +
      `Known values: ${VALID_ROLES.join(", ")}`
    );
  }
  return name;
}
