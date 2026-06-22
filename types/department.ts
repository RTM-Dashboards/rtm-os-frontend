// ── Department Architecture Types ─────────────────────────────────────────────
// Configuration-driven department model. No code changes are needed to add new
// departments — add an entry to the departments registry instead.

// ─── Module Identifiers ───────────────────────────────────────────────────────

export type DepartmentModuleId =
  | "projects"
  | "tasks"
  | "reports"
  | "audits"
  | "escalations"
  | "notifications"
  | "workflows"
  | "integrations"
  | "knowledge-base"
  | "custom";

// ─── KPI Definition ───────────────────────────────────────────────────────────

export type KpiMetricType = "number" | "percentage" | "currency" | "duration" | "count";
export type KpiReportingFrequency = "daily" | "weekly" | "monthly" | "quarterly";
export type KpiTrendDirection = "up-good" | "down-good" | "neutral";

export interface DepartmentKpiDef {
  id: string;
  name: string;
  metricType: KpiMetricType;
  /** Display unit appended to value, e.g. "%" or "x" */
  unit?: string;
  target: string;
  warningThreshold: string;
  criticalThreshold: string;
  /** Which Integration Hub source provides this data */
  dataSource: string;
  reportingFrequency: KpiReportingFrequency;
  /** Show on the department dashboard KPI row */
  dashboardVisible: boolean;
  trendDirection: KpiTrendDirection;
}

// ─── Integration Reference ────────────────────────────────────────────────────

export type IntegrationRole = "primary" | "required" | "optional" | "reporting-only";

export interface DepartmentIntegrationRef {
  /** Matches an entry in the Integration Hub */
  integrationId: string;
  displayName: string;
  category: string;
  role: IntegrationRole;
}

// ─── Workflow Reference ───────────────────────────────────────────────────────

export interface DepartmentWorkflowRef {
  workflowId: string;
  displayName: string;
  description: string;
}

// ─── Report Reference ─────────────────────────────────────────────────────────

export interface DepartmentReportRef {
  reportId: string;
  displayName: string;
  frequency: KpiReportingFrequency;
  source: string;
}

// ─── Role Definition ──────────────────────────────────────────────────────────

export type DepartmentRoleType =
  | "member"
  | "lead"
  | "manager"
  | "operations-support"
  | "executive";

export interface DepartmentRole {
  id: string;
  name: string;
  type: DepartmentRoleType;
  description: string;
}

// ─── Module Config ────────────────────────────────────────────────────────────

export interface DepartmentModuleConfig {
  id: DepartmentModuleId;
  label: string;
  enabled: boolean;
  /** Route within the department, e.g. "/tasks" */
  route?: string;
}

// ─── Department Profile ───────────────────────────────────────────────────────

export type DepartmentStatus = "active" | "inactive" | "pending-setup";
export type DepartmentType = "core" | "service" | "support" | "executive";

export interface DepartmentConfig {
  // ── Identity ──────────────────────────────────────────────────────────────
  /** Unique machine-readable slug matching the URL segment */
  id: string;
  /** Display name */
  name: string;
  /** Short description */
  description: string;
  /** Department type for grouping and display */
  departmentType: DepartmentType;
  /** Active status */
  status: DepartmentStatus;
  /** Department owner / manager name */
  owner: string;
  /** Accent color for theming */
  accentColor: string;

  // ── Routing ───────────────────────────────────────────────────────────────
  /** Base route, e.g. /departments/seo */
  baseRoute: string;
  /** Workspace route where this department lives (may differ from baseRoute) */
  workspaceSlug?: string;

  // ── Modules ───────────────────────────────────────────────────────────────
  /** Which modules are enabled / disabled for this department */
  modules: DepartmentModuleConfig[];

  // ── KPIs ──────────────────────────────────────────────────────────────────
  /** KPIs come from Settings → Departments, not from code */
  kpis: DepartmentKpiDef[];

  // ── Integrations ──────────────────────────────────────────────────────────
  /** Pulled from Integration Hub — no hardcoded providers */
  integrations: DepartmentIntegrationRef[];

  // ── Reports ───────────────────────────────────────────────────────────────
  /** Pulled from Reporting & Intelligence */
  reports: DepartmentReportRef[];

  // ── Workflows ─────────────────────────────────────────────────────────────
  /** Pulled from Workflow Engine */
  workflows: DepartmentWorkflowRef[];

  // ── Roles ─────────────────────────────────────────────────────────────────
  roles: DepartmentRole[];
}
