// ─────────────────────────────────────────────────────────────────
// RTM OS — Notification System Types
// ─────────────────────────────────────────────────────────────────

export type NotificationPriority = "Low"| "Medium"| "High"| "Urgent"| "Critical";
export type NotificationStatus   = "Unread"| "Read"| "Acknowledged"| "Resolved"| "Escalated";

export type NotificationType =
  | "Workflow"| "Task"| "Billing"| "Activation"| "Account Management"| "Renewal"| "Cancellation"| "Offboarding"| "Affiliate"| "System";

export type SourceModule =
  | "Workflow Engine"| "Task Engine"| "Client Portfolio"| "Billing"| "Billing Activation"| "Account Management"| "Sales"| "Renewals"| "Cancellations"| "Offboarding"| "Affiliate Management"| "Admin";

export interface RTMNotification {
  id:           string;
  priority:     NotificationPriority;
  type:         NotificationType;
  title:        string;
  description:  string;
  client:       string;
  clientSlug:   string;
  module:       SourceModule;
  createdDate:  string;
  status:       NotificationStatus;
  relatedRoute: string;
  escalation?:  { level: number; daysOpen: number; trigger: string };
}
