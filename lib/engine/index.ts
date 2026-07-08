// =============================================================================
// RTM OS — Global Projects & Tasks Engine v1
// lib/engine/index.ts  — Query helpers / engine API
// =============================================================================

import { ENGINE_STORE } from "./mock-data";
import type {
  Project,
  Milestone,
  Task,
  TaskBlueprint,
  AssignedUser,
  DepartmentName,
  ProjectStatus,
  TaskStatus,
  ProjectHealth,
  TaskSource,
} from "./types";
import type { WorkspaceTask } from "@/components/workspace/WorkspaceTaskPage";

export { ENGINE_STORE };
export * from "./types";
export * from "./mock-data";

// ---------------------------------------------------------------------------
// Project queries
// ---------------------------------------------------------------------------

export function getProject(id: string): Project | undefined {
  return ENGINE_STORE.projects.find((p) => p.id === id);
}

export function getProjects(): Project[] {
  return ENGINE_STORE.projects;
}

export function getProjectsByStatus(status: ProjectStatus): Project[] {
  return ENGINE_STORE.projects.filter((p) => p.status === status);
}

export function getProjectsByHealth(health: ProjectHealth): Project[] {
  return ENGINE_STORE.projects.filter((p) => p.health === health);
}

// ---------------------------------------------------------------------------
// Milestone queries
// ---------------------------------------------------------------------------

export function getMilestonesForProject(projectId: string): Milestone[] {
  return ENGINE_STORE.milestones.filter((m) => m.projectId === projectId);
}

export function getMilestone(id: string): Milestone | undefined {
  return ENGINE_STORE.milestones.find((m) => m.id === id);
}

// ---------------------------------------------------------------------------
// Task queries
// ---------------------------------------------------------------------------

export function getAllTasks(): Task[] {
  return ENGINE_STORE.tasks;
}

export function getTask(id: string): Task | undefined {
  return ENGINE_STORE.tasks.find((t) => t.id === id);
}

export function getTasksForProject(projectId: string): Task[] {
  return ENGINE_STORE.tasks.filter((t) => t.projectId === projectId);
}

export function getTasksForMilestone(milestoneId: string): Task[] {
  return ENGINE_STORE.tasks.filter((t) => t.milestoneId === milestoneId);
}

/** Department workspace filter — single source of truth for all dept task views */
export function getTasksByDepartment(department: DepartmentName): Task[] {
  return ENGINE_STORE.tasks.filter((t) => t.department === department);
}

export function getTasksByStatus(status: TaskStatus): Task[] {
  return ENGINE_STORE.tasks.filter((t) => t.status === status);
}

export function getTasksByAssignee(userId: string): Task[] {
  return ENGINE_STORE.tasks.filter((t) => t.assignedUserId === userId);
}

// ---------------------------------------------------------------------------
// Blueprint queries
// ---------------------------------------------------------------------------

export function getBlueprints(): TaskBlueprint[] {
  return ENGINE_STORE.blueprints;
}

export function getBlueprint(id: string): TaskBlueprint | undefined {
  return ENGINE_STORE.blueprints.find((b) => b.id === id);
}

export function getBlueprintsByDepartment(department: DepartmentName): TaskBlueprint[] {
  return ENGINE_STORE.blueprints.filter((b) => b.department === department);
}

// ---------------------------------------------------------------------------
// User queries
// ---------------------------------------------------------------------------

export function getUser(id: string): AssignedUser | undefined {
  return ENGINE_STORE.users.find((u) => u.id === id);
}

export function getUsers(): AssignedUser[] {
  return ENGINE_STORE.users;
}

// ---------------------------------------------------------------------------
// Engine → WorkspaceTask adapter
// ---------------------------------------------------------------------------

/**
 * Maps an engine Task source to a WorkspaceTaskSource.
 * WorkspaceTaskPage accepts only: "Task Blueprint" | "Workflow Automation" | "Manual Task"
 */
function mapSource(s: TaskSource): WorkspaceTask["source"] {
  if (s === "Task Blueprint") return "Task Blueprint";
  if (s === "Workflow Automation") return "Workflow Automation";
  return "Manual Task";
}

/**
 * Maps an engine TaskStatus to a WorkspaceTaskStatus.
 * WorkspaceTaskPage accepts: "Pending" | "In Progress" | "In Review" | "Blocked" | "Done"
 */
function mapStatus(s: TaskStatus): WorkspaceTask["status"] {
  switch (s) {
    case "Open":      return "Pending";
    case "In Progress": return "In Progress";
    case "Waiting":   return "Pending";
    case "Review":    return "In Review";
    case "Blocked":   return "Blocked";
    case "Completed": return "Done";
    case "Cancelled": return "Done";
    default:          return "Pending";
  }
}

/**
 * Maps an engine TaskPriority to a WorkspaceTaskPriority.
 * WorkspaceTaskPage accepts: "Low" | "Medium" | "High" | "Critical"
 * Engine uses "Urgent" instead of "Critical".
 */
function mapPriority(p: Task["priority"]): WorkspaceTask["priority"] {
  if (p === "Urgent") return "Critical";
  return p as WorkspaceTask["priority"];
}

/**
 * Converts a single engine Task to a WorkspaceTask for display in workspace pages.
 */
export function taskToWorkspaceTask(t: Task): WorkspaceTask {
  return {
    id: t.id,
    title: t.title,
    client: t.clientName,
    project: t.projectName,
    department: t.department,
    service: t.service,
    source: mapSource(t.source),
    blueprintSource: t.blueprintId,
    assignee: t.assignedUserName ?? "Unassigned",
    priority: mapPriority(t.priority),
    status: mapStatus(t.status),
    dueDate: t.dueDate,
    blocker: t.status === "Blocked" ? (t.notes?.[0]?.body ?? "Blocked") : null,
  };
}

/**
 * Returns engine tasks for a department, adapted to WorkspaceTask shape.
 * This is the primary data source for all workspace Tasks pages.
 */
export function getWorkspaceTasksByDepartment(department: DepartmentName): WorkspaceTask[] {
  return getTasksByDepartment(department).map(taskToWorkspaceTask);
}

// ---------------------------------------------------------------------------
// Client-scoped queries (Phase 2 — MASTER_CLIENTS integration)
// ---------------------------------------------------------------------------

/**
 * Returns all projects associated with a given MASTER_CLIENTS id.
 * Matches on the optional clientId field.
 */
export function getProjectsByClient(clientId: string): Project[] {
  return ENGINE_STORE.projects.filter((p) => p.clientId === clientId);
}

/**
 * Returns all tasks for a given MASTER_CLIENTS id, via clientId on their parent project.
 */
export function getTasksByClient(clientId: string): Task[] {
  const projectIds = new Set(getProjectsByClient(clientId).map((p) => p.id));
  return ENGINE_STORE.tasks.filter((t) => projectIds.has(t.projectId));
}

/**
 * Returns all tasks for a client matched by client name (case-insensitive).
 * Useful when clientId is not yet set on a project.
 */
export function getTasksByClientName(clientName: string): Task[] {
  const lower = clientName.toLowerCase();
  return ENGINE_STORE.tasks.filter((t) => t.clientName.toLowerCase() === lower);
}

/**
 * Returns all projects matched by client name (case-insensitive).
 */
export function getProjectsByClientName(clientName: string): Project[] {
  const lower = clientName.toLowerCase();
  return ENGINE_STORE.projects.filter((p) => p.client.toLowerCase() === lower);
}

// ---------------------------------------------------------------------------
// KPI helpers
// ---------------------------------------------------------------------------

export function getProjectKPIs() {
  const projects = ENGINE_STORE.projects;
  const tasks = ENGINE_STORE.tasks;
  return {
    total:          projects.length,
    active:         projects.filter((p) => p.status === "In Progress" || p.status === "Launched").length,
    blocked:        projects.filter((p) => p.status === "Blocked" || p.status === "Pending Client").length,
    completed:      projects.filter((p) => p.status === "Completed").length,
    healthGreen:    projects.filter((p) => p.health === "Green").length,
    healthYellow:   projects.filter((p) => p.health === "Yellow").length,
    healthRed:      projects.filter((p) => p.health === "Red").length,
    totalTasks:     tasks.length,
    openTasks:      tasks.filter((t) => t.status !== "Completed" && t.status !== "Cancelled").length,
    blockedTasks:   tasks.filter((t) => t.status === "Blocked").length,
    completedTasks: tasks.filter((t) => t.status === "Completed").length,
    tasksWithDeps:  tasks.filter((t) => t.dependencies.length > 0).length,
  };
}

export function getDepartmentTaskKPIs(department: DepartmentName) {
  const tasks = getTasksByDepartment(department);
  return {
    total:     tasks.length,
    open:      tasks.filter((t) => t.status === "Open").length,
    inProgress:tasks.filter((t) => t.status === "In Progress").length,
    review:    tasks.filter((t) => t.status === "Review").length,
    blocked:   tasks.filter((t) => t.status === "Blocked").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
    waiting:   tasks.filter((t) => t.status === "Waiting").length,
  };
}

// ---------------------------------------------------------------------------
// Dependency graph helpers
// ---------------------------------------------------------------------------

/**
 * Returns tasks that block the given task (Finish-To-Start upstream deps).
 */
export function getBlockingTasks(task: Task): Task[] {
  return task.dependencies
    .filter((d) => d.direction === "blocked-by")
    .map((d) => getTask(d.dependsOnTaskId))
    .filter((t): t is Task => t !== undefined);
}

/**
 * Returns true when all upstream dependencies are Completed.
 */
export function isTaskUnblocked(task: Task): boolean {
  const blockers = getBlockingTasks(task);
  return blockers.every((t) => t.status === "Completed");
}

// ---------------------------------------------------------------------------
// Communication log helpers (cross-references lib/account-management)
// ---------------------------------------------------------------------------

/**
 * Returns communication entry IDs associated with a project's client.
 * Requires lib/account-management/am-client-success-data to be imported at call site.
 * Engine projects store an optional communicationLog[] of cm-ids on the Project object.
 */
export function getCommunicationIdsForProject(project: Project): string[] {
  return project.communicationLog ?? [];
}
