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
} from "./types";

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
