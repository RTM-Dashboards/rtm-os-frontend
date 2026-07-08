// =============================================================================
// RTM OS — Global Projects & Tasks Engine v1
// lib/engine/types.ts
//
// Single source of truth for all type definitions across the engine.
// Every department consumes tasks via filters on these shared types.
// =============================================================================

// ---------------------------------------------------------------------------
// Primitive enumerations
// ---------------------------------------------------------------------------

export type ProjectStatus =
  | "Draft"
  | "Ready to Launch"
  | "Launched"
  | "In Progress"
  | "Pending Client"
  | "Pending Department"
  | "Blocked"
  | "Completed"
  | "Cancelled";

export type ProjectHealth = "Green" | "Yellow" | "Red";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";

export type ServicePackage =
  | "SEO Only"
  | "SEO + GBP"
  | "PPC + Landing Page"
  | "Full Service"
  | "Reporting Only"
  | "Website Build"
  | "AI Automation"
  | "Upsell"
  | "Renewal"
  | "Custom";

export type DepartmentName =
  | "Account Management"
  | "Sales"
  | "Billing"
  | "SEO"
  | "GBP"
  | "PPC"
  | "Meta Ads"
  | "LSA"
  | "Reporting"
  | "Web Development"
  | "Design"
  | "Content"
  | "AI Automation"
  | "IT & Security";

export type MilestoneStatus = "Not Started" | "In Progress" | "Blocked" | "Completed";

export type TaskStatus =
  | "Open"
  | "In Progress"
  | "Waiting"
  | "Review"
  | "Blocked"
  | "Completed"
  | "Cancelled";

export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type TaskSource =
  | "Task Blueprint"
  | "Workflow Automation"
  | "Manual"
  | "Recurring";

export type TaskType =
  | "One-Time"
  | "Recurring"
  | "Milestone"
  | "Approval"
  | "Review"
  | "Renewal"
  | "Offboarding";

export type DependencyType =
  | "Finish-To-Start"
  | "Start-To-Start"
  | "Finish-To-Finish";

export type ActivityEventType =
  | "Project Created"
  | "Task Generated"
  | "Task Assigned"
  | "Task Completed"
  | "Task Blocked"
  | "Milestone Reached"
  | "Department Activated"
  | "Blueprint Applied"
  | "Invoice Paid"
  | "Client Approved"
  | "Blocker Added"
  | "Blocker Resolved"
  | "Status Changed"
  | "Note Added";

// ---------------------------------------------------------------------------
// Supporting interfaces
// ---------------------------------------------------------------------------

export interface AssignedUser {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role?: string;
}

// Task dependency — Task B cannot start until Task A completes (Finish-To-Start)
export interface TaskDependency {
  id: string;
  dependsOnTaskId: string;
  dependsOnTaskName: string;
  type: DependencyType;
  /** "blocked-by" = this task is blocked; "blocking" = this task is blocking another */
  direction: "blocked-by" | "blocking";
  status: TaskStatus;
}

export interface TaskNote {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface TaskAutomationEvent {
  id: string;
  trigger: string;
  action: string;
  executedAt: string;
  result: "Success" | "Failed" | "Skipped";
}

// ---------------------------------------------------------------------------
// Task Blueprint — template that generates department tasks
// ---------------------------------------------------------------------------

export interface BlueprintTask {
  id: string;
  name: string;
  department: DepartmentName;
  ownerRole: string;
  estimatedHours: number;
  priority: TaskPriority;
  /** ID of another BlueprintTask this depends on (within same blueprint) */
  dependsOnId?: string;
  dueDaysOffset: number;
  description?: string;
}

export interface TaskBlueprint {
  id: string;
  name: string;
  department: DepartmentName;
  servicePackage: ServicePackage;
  /** The line-item / service this blueprint maps to */
  mappedLineItem: string;
  description: string;
  activationTrigger: string;
  estimatedTotalHours: number;
  tasks: BlueprintTask[];
  isActive: boolean;
  lastUpdated: string;
  version: string;
}

// ---------------------------------------------------------------------------
// Milestone
// ---------------------------------------------------------------------------

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  owner: string;
  status: MilestoneStatus;
  startDate: string;
  dueDate: string;
  completionDate?: string;
  progress: number;
  /** IDs of tasks that belong to this milestone */
  taskIds: string[];
  /** Blueprint that generated tasks under this milestone */
  blueprintId?: string;
  blockedReason?: string;
}

// ---------------------------------------------------------------------------
// Task — the atomic unit of work
// ---------------------------------------------------------------------------

export interface Task {
  /** Globally unique task ID */
  id: string;
  projectId: string;
  milestoneId?: string;
  blueprintId?: string;
  blueprintTaskId?: string;

  // Classification
  title: string;
  description?: string;
  type: TaskType;
  source: TaskSource;
  department: DepartmentName;
  service: string;

  // People
  assignedUserId?: string;
  assignedUserName?: string;
  createdById: string;
  createdByName: string;

  // Lifecycle
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  startDate?: string;
  completionDate?: string;
  estimatedHours: number;

  // Relations
  dependencies: TaskDependency[];
  notes: TaskNote[];
  files: string[];
  automationHistory: TaskAutomationEvent[];

  // Audit
  createdAt: string;
  updatedAt: string;

  // Denormalised for fast list rendering (populated at generation time)
  clientName: string;
  projectName: string;
}

// ---------------------------------------------------------------------------
// Department section inside a project
// ---------------------------------------------------------------------------

export interface ProjectDepartment {
  department: DepartmentName;
  owner: string;
  /** Task IDs assigned to this department within this project */
  taskIds: string[];
  escalationStatus: "None" | "Escalated" | "Critical";
  delayReason?: string;
}

// ---------------------------------------------------------------------------
// Activity timeline entry
// ---------------------------------------------------------------------------

export interface ActivityEntry {
  id: string;
  projectId: string;
  eventType: ActivityEventType;
  description: string;
  actorName: string;
  timestamp: string;
  relatedTaskId?: string;
  relatedMilestoneId?: string;
}

// ---------------------------------------------------------------------------
// Project — top-level object
// ---------------------------------------------------------------------------

export interface Project {
  id: string;
  name: string;

  // Client & contract
  client: string;
  clientSlug: string;
  /** References MASTER_CLIENTS[].id — undefined when no MC record exists */
  clientId?: string;
  servicePackage: ServicePackage;
  contractSummary: string;

  // Ownership
  owner: string;
  accountManager: string;

  // Departments activated on this project
  departments: ProjectDepartment[];

  // Scheduling
  launchDate: string;
  completionDate?: string;

  // State
  status: ProjectStatus;
  health: ProjectHealth;
  priority: ProjectPriority;

  // Children (IDs only — look up in flat stores)
  milestoneIds: string[];
  taskIds: string[];

  // Activity
  activityLog: ActivityEntry[];

  notes?: string;
  /**
   * Communication log entry IDs from lib/account-management/am-client-success-data.ts
   * that are associated with this project.
   * Use getCommunicationsByProject(project.id) for the full records.
   */
  communicationLog?: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// Engine store shape (mock database)
// ---------------------------------------------------------------------------

export interface EngineStore {
  projects: Project[];
  milestones: Milestone[];
  blueprints: TaskBlueprint[];
  tasks: Task[];
  users: AssignedUser[];
}

// ---------------------------------------------------------------------------
// Department workspace filter spec
// ---------------------------------------------------------------------------

export interface DepartmentWorkspaceFilter {
  department: DepartmentName;
  label: string;
  route: string;
}

export const DEPARTMENT_WORKSPACE_FILTERS: DepartmentWorkspaceFilter[] = [
  { department: "Sales",              label: "Sales Task View",              route: "/sales/tasks"             },
  { department: "Billing",            label: "Billing Task View",            route: "/billing/billing/tasks"   },
  { department: "Account Management", label: "Account Management Task View", route: "/account-management/account-management/tasks" },
  { department: "SEO",                label: "SEO Task View",                route: "/seo-local/seo-local/seo/tasks" },
  { department: "PPC",                label: "PPC Task View",                route: "/ppc/ppc/tasks"           },
  { department: "Meta Ads",           label: "Meta Ads Task View",           route: "/meta-ads/meta-ads/tasks" },
  { department: "Reporting",          label: "Reporting Task View",          route: "/reporting/reporting/tasks" },
  { department: "Web Development",    label: "Web Dev Task View",            route: "/web-development-design/web-development-design/web-development/tasks" },
  { department: "Design",             label: "Design Task View",             route: "/web-development-design/web-development-design/design/tasks" },
  { department: "Content",            label: "Content Task View",            route: "/content/content/tasks"   },
];
