// =============================================================================
// lib/mock/am-projects-store.ts  — ENGINE-BACKED SHIM
//
// All functions now delegate to lib/engine/ (the real canonical store).
// Exports the same types and signatures as the previous placeholder so that
// existing callers (onboarding pages) continue to compile without changes.
//
// This file exists purely as a compatibility bridge. New code should import
// directly from lib/engine/.
// =============================================================================

import { ENGINE_STORE, BLUEPRINTS } from "@/lib/engine/mock-data";
import { getProjectsByClient } from "@/lib/engine/index";
import type { Project, Task, Milestone, DepartmentName } from "@/lib/engine/types";

// ── Re-exported types (same shape as before, so callers compile unchanged) ────

export type AMProjectStatus =
  | "Planning"
  | "Active"
  | "On Hold"
  | "Complete"
  | "Cancelled";

export type AMTaskStatus =
  | "Not Started"
  | "In Progress"
  | "Blocked"
  | "Complete";

export type AMTaskPriority = "High" | "Medium" | "Low";

export interface AMTask {
  id:           string;
  projectId:    string;
  service:      string;
  title:        string;
  description:  string;
  status:       AMTaskStatus;
  priority:     AMTaskPriority;
  assignedTo:   string;
  dueDate:      string;
  completedAt:  string | null;
  createdAt:    string;
}

export interface AMProject {
  id:                 string;
  clientId:           string;
  clientName:         string;
  name:               string;
  status:             AMProjectStatus;
  services:           string[];
  tasks:              AMTask[];
  assignedAM:         string;
  onboardingRecordId: string | null;
  createdAt:          string;
  updatedAt:          string;
}

// ── Adapters: engine → AMProject shape ────────────────────────────────────────

/** Map engine TaskStatus → AMTaskStatus */
function mapTaskStatus(s: Task["status"]): AMTaskStatus {
  switch (s) {
    case "Completed":   return "Complete";
    case "In Progress": return "In Progress";
    case "Blocked":     return "Blocked";
    default:            return "Not Started";
  }
}

/** Map engine ProjectStatus → AMProjectStatus */
function mapProjectStatus(s: Project["status"]): AMProjectStatus {
  switch (s) {
    case "In Progress":
    case "Launched":       return "Active";
    case "Completed":      return "Complete";
    case "Cancelled":      return "Cancelled";
    case "Blocked":
    case "Pending Client":
    case "Pending Department": return "On Hold";
    default:               return "Planning";
  }
}

function engineTaskToAMTask(t: Task): AMTask {
  return {
    id:          t.id,
    projectId:   t.projectId,
    service:     t.service,
    title:       t.title,
    description: t.description ?? "",
    status:      mapTaskStatus(t.status),
    priority:    (t.priority === "Urgent" ? "High" : t.priority) as AMTaskPriority,
    assignedTo:  t.assignedUserName ?? "",
    dueDate:     t.dueDate ?? "",
    completedAt: t.completionDate ?? null,
    createdAt:   t.createdAt ?? "",
  };
}

function engineProjectToAM(p: Project): AMProject {
  const tasks = ENGINE_STORE.tasks
    .filter((t) => t.projectId === p.id)
    .map(engineTaskToAMTask);

  // Derive service list from tasks (unique services)
  const services = Array.from(new Set(tasks.map((t) => t.service)));

  return {
    id:                 p.id,
    clientId:           p.clientId ?? "",
    clientName:         p.client,
    name:               p.name,
    status:             mapProjectStatus(p.status),
    services,
    tasks,
    assignedAM:         p.accountManager,
    onboardingRecordId: null,
    createdAt:          p.createdAt,
    updatedAt:          p.updatedAt,
  };
}

// ── Internal counters for new project/task creation ───────────────────────────

let _projSeq = 7000;
let _taskSeq = 7000;
let _msSeq   = 7000;
let _actSeq  = 7000;

const SERVICE_TO_BLUEPRINT: Record<string, string> = {
  "seo / gbp":        "bp-001",
  "seo":              "bp-001",
  "gbp":              "bp-002",
  "google ads":       "bp-003",
  "ppc":              "bp-003",
  "meta ads":         "bp-006",
  "facebook ads":     "bp-006",
  "website build":    "bp-007",
  "website redesign": "bp-007",
  "monthly reporting":"bp-005",
  "reporting":        "bp-005",
};

function blueprintIdsForServices(services: string[]): string[] {
  const ids = new Set<string>(["bp-004"]);
  for (const svc of services) {
    const key = svc.toLowerCase().trim();
    for (const [pattern, bpId] of Object.entries(SERVICE_TO_BLUEPRINT)) {
      if (key.includes(pattern)) { ids.add(bpId); break; }
    }
  }
  return Array.from(ids);
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns all engine projects that have a clientId (AM-created).
 * Adapts them to AMProject shape for callers that still use that type.
 */
export function getAllProjects(): AMProject[] {
  return ENGINE_STORE.projects
    .filter((p) => !!p.clientId)
    .map(engineProjectToAM);
}

export function getProjectById(id: string): AMProject | undefined {
  const p = ENGINE_STORE.projects.find((ep) => ep.id === id);
  return p ? engineProjectToAM(p) : undefined;
}

export function getProjectByClientId(clientId: string): AMProject | undefined {
  const matches = getProjectsByClient(clientId);
  return matches.length > 0 ? engineProjectToAM(matches[0]) : undefined;
}

/**
 * Creates a real engine Project + Tasks + Milestone for the given client.
 * Returns the existing project (as AMProject) if one already exists.
 */
export function createProject(
  clientId: string,
  clientName: string,
  assignedAM: string,
  activeServices: string[],
  _onboardingRecordId: string | null = null
): AMProject {
  // Guard: return existing if already activated
  const existing = getProjectByClientId(clientId);
  if (existing) return existing;

  const now       = new Date().toISOString();
  const today     = now.split("T")[0];
  const projectId = `proj-shim-${++_projSeq}`;
  const msId      = `ms-shim-${++_msSeq}`;

  const bpIds    = blueprintIdsForServices(activeServices);
  const taskIds: string[] = [];
  const tasks: Task[]    = [];

  for (const bpId of bpIds) {
    const bp = BLUEPRINTS.find((b) => b.id === bpId);
    if (!bp) continue;
    for (const bpt of bp.tasks) {
      const tid = `tsk-shim-${++_taskSeq}`;
      taskIds.push(tid);
      tasks.push({
        id:             tid,
        projectId,
        milestoneId:    msId,
        blueprintId:    bpId,
        title:          bpt.name,
        type:           "One-Time",
        source:         "Task Blueprint",
        department:     bpt.department as DepartmentName,
        service:        bp.mappedLineItem,
        assignedUserName: assignedAM || "Unassigned",
        createdById:    "u3",
        createdByName:  "AM Onboarding",
        status:         "Open",
        priority:       bpt.priority,
        dueDate:        new Date(Date.now() + bpt.dueDaysOffset * 86400000).toISOString().split("T")[0],
        estimatedHours: bpt.estimatedHours,
        dependencies:   [],
        notes:          [],
        files:          [],
        automationHistory: [],
        createdAt:      now,
        updatedAt:      now,
        clientName,
        projectName:    `${clientName} — Onboarding`,
        description:    bpt.description,
      });
    }
  }

  const deptSet = new Set(tasks.map((t) => t.department));
  const departments = Array.from(deptSet).map((dept) => ({
    department: dept,
    owner:      assignedAM || "Unassigned",
    taskIds:    tasks.filter((t) => t.department === dept).map((t) => t.id),
    escalationStatus: "None" as const,
  }));

  const milestone: Milestone = {
    id:         msId,
    projectId,
    name:       "Onboarding Launch",
    owner:      assignedAM,
    status:     "In Progress",
    startDate:  today,
    dueDate:    new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    progress:   0,
    taskIds,
    blueprintId: "bp-004",
  };

  const project: Project = {
    id:              projectId,
    name:            `${clientName} — Onboarding`,
    client:          clientName,
    clientSlug:      clientId,
    clientId,
    servicePackage:  "Custom",
    contractSummary: `Services: ${activeServices.join(", ")}. Created ${today}.`,
    owner:           assignedAM,
    accountManager:  assignedAM,
    departments,
    launchDate:      new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
    status:          "In Progress",
    health:          "Green",
    priority:        "High",
    milestoneIds:    [msId],
    taskIds,
    activityLog: [
      {
        id:          `act-shim-${++_actSeq}`,
        projectId,
        eventType:   "Project Created",
        description: `Project created via AM Onboarding. Services: ${activeServices.join(", ")}.`,
        actorName:   assignedAM,
        timestamp:   now,
      },
    ],
    notes:     `Created by AM Onboarding workflow for ${clientName}.`,
    createdAt: now,
    updatedAt: now,
  };

  ENGINE_STORE.projects.push(project);
  ENGINE_STORE.tasks.push(...tasks);
  ENGINE_STORE.milestones.push(milestone);

  return engineProjectToAM(project);
}

export function updateProject(updated: AMProject): void {
  const ep = ENGINE_STORE.projects.find((p) => p.id === updated.id);
  if (!ep) return;
  ep.updatedAt = new Date().toISOString();
}

export function updateTaskStatus(
  projectId: string,
  taskId: string,
  status: AMTaskStatus
): void {
  const task = ENGINE_STORE.tasks.find((t) => t.id === taskId && t.projectId === projectId);
  if (!task) return;
  task.status = status === "Complete"
    ? "Completed"
    : status === "In Progress"
    ? "In Progress"
    : status === "Blocked"
    ? "Blocked"
    : "Open";
  if (status === "Complete") task.completionDate = new Date().toISOString().split("T")[0];
  task.updatedAt = new Date().toISOString();
}

// ── Display helpers (kept for callers that still use them) ─────────────────────

export interface ProjectStatusMeta {
  color:  string;
  bg:     string;
  border: string;
  dot:    string;
  label:  string;
}

export function getProjectStatusMeta(status: AMProjectStatus): ProjectStatusMeta {
  switch (status) {
    case "Active":
      return { color: "#065F46", bg: "#D1FAE5", border: "#6EE7B7", dot: "#10B981", label: "Active" };
    case "Planning":
      return { color: "#1E40AF", bg: "#DBEAFE", border: "#93C5FD", dot: "#3B82F6", label: "Planning" };
    case "On Hold":
      return { color: "#92400E", bg: "#FEF3C7", border: "#FCD34D", dot: "#F59E0B", label: "On Hold" };
    case "Complete":
      return { color: "#374151", bg: "#F3F4F6", border: "#D1D5DB", dot: "#9CA3AF", label: "Complete" };
    case "Cancelled":
      return { color: "#991B1B", bg: "#FEE2E2", border: "#FCA5A5", dot: "#EF4444", label: "Cancelled" };
    default:
      return { color: "#374151", bg: "#F3F4F6", border: "#D1D5DB", dot: "#9CA3AF", label: status };
  }
}

export interface TaskStatusMeta {
  color:  string;
  bg:     string;
  border: string;
}

export function getTaskStatusMeta(status: AMTaskStatus): TaskStatusMeta {
  switch (status) {
    case "Complete":    return { color: "#065F46", bg: "#D1FAE5", border: "#6EE7B7" };
    case "In Progress": return { color: "#1E40AF", bg: "#DBEAFE", border: "#93C5FD" };
    case "Blocked":     return { color: "#991B1B", bg: "#FEE2E2", border: "#FCA5A5" };
    default:            return { color: "#475569", bg: "#F1F5F9", border: "#CBD5E1" };
  }
}
