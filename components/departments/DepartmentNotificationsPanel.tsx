"use client";

// ── Department Notifications Panel ────────────────────────────────────────────
// Pulls from Notification Center. Displays unread, pending, and department
// alerts (department, workflow, escalation alerts).

import { SectionWrapper, StatusBadge } from "@/components/ui";

type NotifType = "department" | "workflow" | "escalation" | "task" | "system";
type NotifStatus = "unread" | "pending" | "read";

interface DepartmentNotification {
  id: string;
  title: string;
  body: string;
  type: NotifType;
  status: NotifStatus;
  timestamp: string;
  priority: "high" | "medium" | "low";
}

const MOCK_NOTIFICATIONS: DepartmentNotification[] = [
  { id: "n-1", title: "Report overdue — Summit Landscaping",       body: "Monthly SEO report is 7 days overdue. Escalation triggered.",         type: "escalation", status: "unread",  timestamp: "Jun 7 · 9:12am",  priority: "high"   },
  { id: "n-2", title: "Workflow completed — Monthly Delivery",     body: "Monthly delivery workflow completed for 12 clients.",                  type: "workflow",   status: "unread",  timestamp: "Jun 7 · 8:00am",  priority: "medium" },
  { id: "n-3", title: "Integration sync error — SEMrush",          body: "SEMrush data sync failed for Pacific Dental. Retry scheduled.",        type: "department", status: "pending", timestamp: "Jun 6 · 4:30pm",  priority: "high"   },
  { id: "n-4", title: "New task assigned — Technical Audit",       body: "Technical SEO audit assigned to you for Pacific Dental.",              type: "task",       status: "unread",  timestamp: "Jun 6 · 2:15pm",  priority: "medium" },
  { id: "n-5", title: "Escalation created — GBP Suspension",      body: "GBP suspension escalation opened for Harbor Auto. Action required.",   type: "escalation", status: "unread",  timestamp: "Jun 3 · 11:40am", priority: "high"   },
  { id: "n-6", title: "Workflow alert — Automation error",         body: "Meta campaign launch workflow failed for Metro Dental.",               type: "workflow",   status: "pending", timestamp: "Jun 2 · 3:00pm",  priority: "high"   },
  { id: "n-7", title: "Department alert — KPI below target",       body: "Organic traffic growth is at +2% vs +15% target for this period.",    type: "department", status: "read",    timestamp: "Jun 1 · 9:00am",  priority: "low"    },
];

const TYPE_STYLE: Record<NotifType, { bg: string; color: string; label: string }> = {
  department: { bg: "#EFF6FF", color: "#1D4ED8", label: "Department" },
  workflow:   { bg: "#F5F3FF", color: "#7C3AED", label: "Workflow"   },
  escalation: { bg: "#FEF2F2", color: "#DC2626", label: "Escalation" },
  task:       { bg: "#ECFDF5", color: "#059669", label: "Task"       },
  system:     { bg: "#F8FAFC", color: "#64748B", label: "System"     },
};

const STATUS_MAP = {
  unread:  { variant: "info"    as const, label: "Unread"  },
  pending: { variant: "pending" as const, label: "Pending" },
  read:    { variant: "neutral" as const, label: "Read"    },
};

interface Props {
  accentColor: string;
  disabled?: boolean;
}

export default function DepartmentNotificationsPanel({ accentColor, disabled }: Props) {
  if (disabled) {
    return (
      <SectionWrapper title="Notifications" description="Department notifications from Notification Center">
        <div
          className="rounded-lg border p-6 text-center text-sm"
          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)", background: "var(--rtm-bg)" }}
        >
          Notifications module is disabled for this department.
        </div>
      </SectionWrapper>
    );
  }

  const unread  = MOCK_NOTIFICATIONS.filter((n) => n.status === "unread");
  const pending = MOCK_NOTIFICATIONS.filter((n) => n.status === "pending");
  const alerts  = MOCK_NOTIFICATIONS.filter((n) => n.type === "department" || n.type === "workflow" || n.type === "escalation");

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {(
          [
            { label: "Unread",           value: unread.length,  color: "#2563EB", bg: "#EFF6FF" },
            { label: "Pending",          value: pending.length, color: "#D97706", bg: "#FFFBEB" },
            { label: "Dept / WF Alerts", value: alerts.length,  color: "#DC2626", bg: "#FEF2F2" },
          ] as { label: string; value: number; color: string; bg: string }[]
        ).map((s) => (
          <div key={s.label} className="rounded-xl border p-4 text-center" style={{ background: s.bg, borderColor: "var(--rtm-border-light)" }}>
            <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: s.color }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notification list */}
      <SectionWrapper
        title="Notification Center"
        description="Department, workflow, and escalation alerts — from Notification Center"
        actions={
          <a className="text-xs font-medium hover:underline" href="/notifications" style={{ color: accentColor }}>
            View all notifications
          </a>
        }
      >
        <div className="space-y-3">
          {MOCK_NOTIFICATIONS.map((notif) => {
            const ts = TYPE_STYLE[notif.type];
            const st = STATUS_MAP[notif.status];
            return (
              <div
                key={notif.id}
                className="flex items-start gap-3 p-4 rounded-lg border transition-colors hover:opacity-90"
                style={{
                  background: notif.status === "read" ? "var(--rtm-bg)" : `${ts.color}06`,
                  borderColor: notif.status === "read" ? "var(--rtm-border-light)" : `${ts.color}30`,
                }}
              >
                {/* Type badge */}
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap flex-shrink-0 mt-0.5"
                  style={{ background: ts.bg, color: ts.color }}
                >
                  {ts.label}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {notif.title}
                  </p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--rtm-text-muted)" }}>
                    {notif.body}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                    {notif.timestamp}
                  </p>
                </div>

                <StatusBadge variant={st.variant} label={st.label} size="sm" />
              </div>
            );
          })}
        </div>
      </SectionWrapper>
    </div>
  );
}
