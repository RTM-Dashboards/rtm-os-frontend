// ─────────────────────────────────────────────────────────────────────────────
// RTM OS — Task Collaboration System Types
// ─────────────────────────────────────────────────────────────────────────────

// ── Mention Target ──────────────────────────────────────────────────────────

export type MentionKind = "user"| "department"| "role";

export interface Mention {
  id: string;
  kind: MentionKind;
  label: string; // e.g. "@Jessica Reyes"| "@Billing"| "@SEO Manager"
}

// ── Comment ─────────────────────────────────────────────────────────────────

export type CommentStatus = "Active"| "Resolved"| "Pinned";

export interface CommentAttachment {
  id: string;
  fileName: string;
  fileType: string;
  url: string;
}

export interface CommentReply {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  body: string;
  mentions: Mention[];
  createdAt: string;
}

export interface TaskComment {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  body: string;
  mentions: Mention[];
  attachments: CommentAttachment[];
  status: CommentStatus;
  createdAt: string;
  editedAt?: string;
  replies: CommentReply[];
  pinned: boolean;
  resolved: boolean;
}

// ── Internal Note ────────────────────────────────────────────────────────────

export type InternalNotePriority = "Low"| "Medium"| "High"| "Urgent";

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  department: string;
  priority: InternalNotePriority;
  body: string;
  createdAt: string;
}

// ── Client Note ──────────────────────────────────────────────────────────────

export type ClientCommSource =
  | "Email"| "Phone Call"| "Meeting"| "Slack"| "Text Message"| "Portal";

export interface ClientNote {
  id: string;
  authorId: string;
  authorName: string;
  authorInitials: string;
  authorColor: string;
  source: ClientCommSource;
  body: string;
  createdAt: string;
}

// ── Attachment ───────────────────────────────────────────────────────────────

export type AttachmentCategory =
  | "Report"| "Proposal"| "Contract"| "Creative Asset"| "Screenshot"| "Audit"| "Access Request"| "Spreadsheet"| "Video"| "Other";

export type AttachmentStatus = "Active"| "Superseded"| "Archived";

export type FileType = "pdf"| "docx"| "png"| "jpg"| "mp4"| "xlsx"| "csv"| "zip";

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileType: FileType;
  category: AttachmentCategory;
  uploadedBy: string;
  uploadedByInitials: string;
  uploadedByColor: string;
  uploadDate: string;
  status: AttachmentStatus;
  sizeKB: number;
}

// ── Watcher ──────────────────────────────────────────────────────────────────

export interface TaskWatcher {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  role: string;
  department: string;
  watching: boolean;
}

// ── Approval ─────────────────────────────────────────────────────────────────

export type ApprovalStatus =
  | "Pending Review"| "Pending Approval"| "Approved"| "Rejected"| "Needs Revision";

export interface ApprovalStep {
  id: string;
  stepName: string;
  approver: string;
  approverInitials: string;
  approverColor: string;
  reviewer?: string;
  reviewerInitials?: string;
  reviewerColor?: string;
  status: ApprovalStatus;
  decision?: string;
  notes?: string;
  requestedAt: string;
  completedAt?: string;
}

// ── Activity Event ───────────────────────────────────────────────────────────

export type ActivityEventType =
  | "Task Created"| "Task Assigned"| "Task Reassigned"| "Status Changed"| "Comment Added"| "Attachment Uploaded"| "Approval Requested"| "Approval Completed"| "Dependency Added"| "Dependency Removed"| "Due Date Changed"| "Task Completed"| "Note Added"| "Watcher Added"| "Watcher Removed"| "Mention Added"| "Blocker Added"| "Blocker Resolved";

export interface ActivityEvent {
  id: string;
  eventType: ActivityEventType;
  userId: string;
  userName: string;
  userInitials: string;
  userColor: string;
  timestamp: string;
  notes?: string;
  meta?: Record<string, string>;
}

// ── Dependency ───────────────────────────────────────────────────────────────

export type DependencyStatus =
  | "Satisfied"| "Pending"| "Blocked"| "Escalated";

export type DependencyScope = "Task"| "Milestone"| "Project";

export type DependencyBlockerReason =
  | "Waiting on Client Access"| "Waiting on Billing"| "Waiting on Approval"| "Waiting on Another Task"| "Waiting on Department"| "External Vendor"| "Other";

export interface TaskDependencyItem {
  id: string;
  scope: DependencyScope;
  name: string;
  status: DependencyStatus;
  blockerReason?: DependencyBlockerReason;
  owner: string;
  dueDate?: string;
  notes?: string;
}

// ── Notification Event ───────────────────────────────────────────────────────

export type CollabNotificationType =
  | "Comment Added"| "Mention Added"| "Approval Requested"| "Approval Completed"| "Task Assigned"| "Task Reassigned"| "Dependency Blocked"| "Task Overdue"| "Project Escalated";

export interface CollabNotificationEvent {
  id: string;
  type: CollabNotificationType;
  taskId: string;
  taskName: string;
  projectName: string;
  triggeredBy: string;
  recipient: string;
  timestamp: string;
  read: boolean;
  message: string;
}

// ── Escalation ──────────────────────────────────────────────────────────────

export type EscalationLevel = "L1 - Team"| "L2 - Department Head"| "L3 - Account Manager"| "L4 - Executive"| "L5 - VP / Director";

export type EscalationStatus = "Open"| "In Progress"| "Resolved"| "Escalated Further"| "Closed";

export type EscalationTrigger =
  | "Task Overdue"| "Dependency Blocked"| "Client Access Missing"| "Payment Overdue"| "Client At Risk"| "Approval Bottleneck"| "Performance Issue"| "Missed SLA"| "Cross-Department Delay"| "Manual Escalation";

export interface EscalationRecord {
  id: string;
  level: EscalationLevel;
  assignedTeam: string;
  assignedRole: string;
  assignedUser: string;
  assignedUserInitials: string;
  assignedUserColor: string;
  trigger: EscalationTrigger;
  status: EscalationStatus;
  createdAt: string;
  resolvedAt?: string;
  notes?: string;
  resolvedBy?: string;
}

// ── AI Collaboration Summary ─────────────────────────────────────────────────

export interface AISummaryItem {
  category: "update"| "blocker"| "approval"| "escalation"| "action"| "health";
  text: string;
  urgency: "info"| "warn"| "critical";
}

export interface AICollaborationSummary {
  taskId: string;
  generatedAt: string;
  latestUpdates: AISummaryItem[];
  currentBlockers: AISummaryItem[];
  pendingApprovals: AISummaryItem[];
  recentEscalations: AISummaryItem[];
  recommendedActions: AISummaryItem[];
  projectHealthNotes: AISummaryItem[];
}

// ── Full Task Collaboration Payload ─────────────────────────────────────────

export interface TaskCollaboration {
  taskId: string;
  taskName: string;
  projectId: string;
  projectName: string;
  /** Real engine task ID — links collab data to a live engine Task record */
  engineTaskId?: string;
  comments: TaskComment[];
  internalNotes: InternalNote[];
  clientNotes: ClientNote[];
  attachments: TaskAttachment[];
  watchers: TaskWatcher[];
  approvals: ApprovalStep[];
  activity: ActivityEvent[];
  dependencies: TaskDependencyItem[];
  notifications: CollabNotificationEvent[];
  escalations: EscalationRecord[];
  aiSummary: AICollaborationSummary;
}
