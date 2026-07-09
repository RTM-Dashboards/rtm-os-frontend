// =============================================================================
// RTM OS — Engine Store API Client
// lib/engine/api.ts
//
// File-backed, cross-route-group reliable helpers for reading and writing
// engine data. All functions go through /api/engine (backed by
// data/engine-store.json) instead of the in-memory ENGINE_STORE singleton.
//
// Use these in "use client" page components instead of importing ENGINE_STORE
// directly. Initialize component state with ENGINE_STORE seed values for the
// first render, then hydrate from the API in useEffect.
// =============================================================================

import type { Project, Task, Milestone, TaskBlueprint, AssignedUser } from "./types";

// ── Base fetch helper ──────────────────────────────────────────────────────────

async function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Engine API ${options?.method ?? "GET"} ${url} → ${res.status}: ${text}`);
  }
  return res;
}

// ── Read helpers ───────────────────────────────────────────────────────────────

/** Fetch full engine store — { projects, milestones, tasks, blueprints, users } */
export async function fetchEngineStore(): Promise<{
  projects:   Project[];
  milestones: Milestone[];
  tasks:      Task[];
  blueprints: TaskBlueprint[];
  users:      AssignedUser[];
}> {
  const res = await apiFetch("/api/engine");
  return res.json() as Promise<{
    projects: Project[];
    milestones: Milestone[];
    tasks: Task[];
    blueprints: TaskBlueprint[];
    users: AssignedUser[];
  }>;
}

export async function fetchProjects(): Promise<Project[]> {
  const res = await apiFetch("/api/engine?resource=projects");
  const data = (await res.json()) as { projects: Project[] };
  return data.projects;
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await apiFetch("/api/engine?resource=tasks");
  const data = (await res.json()) as { tasks: Task[] };
  return data.tasks;
}

export async function fetchMilestones(): Promise<Milestone[]> {
  const res = await apiFetch("/api/engine?resource=milestones");
  const data = (await res.json()) as { milestones: Milestone[] };
  return data.milestones;
}

// ── Write helpers ──────────────────────────────────────────────────────────────

/**
 * Appends new projects, tasks, and/or milestones to the persistent store.
 * Used by the AM activation wizard when creating a new client project.
 */
export async function appendToEngineStore(data: {
  projects?:   Project[];
  milestones?: Milestone[];
  tasks?:      Task[];
}): Promise<{ ok: boolean; projectCount: number; milestoneCount: number; taskCount: number }> {
  const res = await apiFetch("/api/engine", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json() as Promise<{ ok: boolean; projectCount: number; milestoneCount: number; taskCount: number }>;
}

/**
 * Updates a single task's status (and optional completion date) in the store.
 */
export async function updateTaskStatus(
  taskId: string,
  patch: Partial<Pick<Task, "status" | "completionDate" | "updatedAt">>
): Promise<Task> {
  const res = await apiFetch(`/api/engine?resource=tasks&id=${encodeURIComponent(taskId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { task: Task };
  return data.task;
}

/**
 * Updates a single project in the store.
 */
export async function updateProject(
  projectId: string,
  patch: Partial<Project>
): Promise<Project> {
  const res = await apiFetch(`/api/engine?resource=projects&id=${encodeURIComponent(projectId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const data = (await res.json()) as { project: Project };
  return data.project;
}
