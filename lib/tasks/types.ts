// EPIC 06 — Deliverables & Task Management types

export type TaskStatus = "Pending"| "In Progress"| "In Review"| "Blocked"| "Done";

export type TaskPriority = "Low"| "Medium"| "High"| "Critical";

export type Department =
  | "Account Management"| "Sales"| "Billing"| "Content"| "Design"| "SEO"| "Meta Ads & PPC"| "Reporting"| "Local Service Ads"| "IT & Security";

export interface AssignedUser {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
}

export interface Blocker {
  id: string;
  description: string;
  raisedAt: string;
  resolvedAt?: string;
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  department: Department;
  deliverableId: string;
  assignees: AssignedUser[];
  startDate?: string;
  dueDate?: string;
  blockers: Blocker[];
  notes: InternalNote[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  department: Department;
  owner: AssignedUser;
  assignees: AssignedUser[];
  startDate?: string;
  dueDate?: string;
  tasks: Task[];
  blockers: Blocker[];
  notes: InternalNote[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
