"use client";

// ─────────────────────────────────────────────────────────────────────────────
// DeptClientDetailDrawer
//
// Shared department-level client detail drawer used by all department Clients
// pages (Web Dev & Design, SEO & Local, Paid Advertising, Reporting, LSA,
// IT & Security).
//
// Shows department-appropriate client information from MASTER_CLIENTS.
// AM-specific fields (activationChecklist, salesStatus, salesOwner,
// commissionStatus) are intentionally excluded — this is a department view.
//
// Monthly value is conditionally shown based on the role prop (manager-only).
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useCallback } from "react";
import type { DeptRole } from "@/components/dept-role-toggle";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DeptClientRecord {
  id: string;
  clientName: string;
  industry?: string;
  currentStatus?: string;
  workflowStatus?: string;
  billingStatus?: string;
  invoiceStatus?: string;
  paymentStatus?: string;
  activeServices?: string[];
  monthlyValue?: number;
  renewalDate?: string;
  renewalStatus?: string;
  clientHealth?: string;
  priority?: string;
  assignedAM?: string;
  lastActivity?: string;
  nextRequiredAction?: string;
  notes?: string;
  email?: string;
}

interface DeptClientDetailDrawerProps {
  client: DeptClientRecord;
  role: DeptRole;
  /** Services relevant to this department — used to filter the service list */
  deptServices?: string[];
  accentColor?: string;
  onClose: () => void;
}

// ── Design tokens ─────────────────────────────────────────────────────────────

const T = {
  surface:   "var(--rtm-surface, #fff)",
  bg:        "var(--rtm-bg, #f8fafc)",
  border:    "var(--rtm-border, #e2e8f0)",
  borderLt:  "var(--rtm-border-light, #f1f5f9)",
  primary:   "var(--rtm-text-primary, #1e293b)",
  secondary: "var(--rtm-text-secondary, #475569)",
  muted:     "var(--rtm-text-muted, #94a3b8)",
  blue:      "var(--rtm-blue, #1d709f)",
  blueBg:    "var(--rtm-blue-xlight, #eff6ff)",
};

// ── Health badge ──────────────────────────────────────────────────────────────

function healthStyle(health?: string, status?: string): { bg: string; color: string; dot: string } {
  const h = health ?? status ?? "";
  if (h === "Excellent" || h === "Good" || h === "Active")
    return { bg: "#dcfce7", color: "#15803d", dot: "#22c55e" };
  if (h === "Fair")
    return { bg: "#fef3c7", color: "#b45309", dot: "#f59e0b" };
  if (h === "At Risk" || h === "Churned" || h === "Inactive")
    return { bg: "#fee2e2", color: "#b91c1c", dot: "#dc2626" };
  return { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" };
}

function HealthBadge({ health, status }: { health?: string; status?: string }) {
  const s = healthStyle(health, status);
  const label = health ?? status ?? "Unknown";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {label}
    </span>
  );
}

// ── Field row ─────────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null;
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "140px 1fr", gap: 8,
      padding: "7px 0", borderBottom: `1px solid ${T.border}`, alignItems: "start",
    }}>
      <span style={{ fontSize: 11, fontWeight: 600, color: T.muted, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: T.primary, wordBreak: "break-word" }}>{value}</span>
    </div>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
        textTransform: "uppercase", color: T.muted, marginBottom: 10,
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Main drawer ───────────────────────────────────────────────────────────────

export default function DeptClientDetailDrawer({
  client,
  role,
  deptServices,
  accentColor = T.blue,
  onClose,
}: DeptClientDetailDrawerProps) {
  // Close on Escape
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  const isManager = role === "manager";

  // Filter services to dept-relevant ones if deptServices provided
  const displayServices = deptServices && deptServices.length > 0
    ? (client.activeServices ?? []).filter((s) => deptServices.includes(s))
    : (client.activeServices ?? []);

  // Fall back to all services if none matched (e.g. LSA/IT which show all clients)
  const servicesLabel = displayServices.length > 0
    ? displayServices.join(", ")
    : (client.activeServices ?? []).join(", ") || "—";

  return (
    // Backdrop
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 500,
        background: "rgba(14, 32, 85, 0.4)",
        backdropFilter: "blur(3px)",
        display: "flex", justifyContent: "flex-end",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Drawer panel */}
      <div
        style={{
          width: "100%", maxWidth: 560, height: "100%",
          display: "flex", flexDirection: "column",
          background: T.surface,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div style={{
          flexShrink: 0, padding: "18px 22px",
          background: T.bg, borderBottom: `1px solid ${T.border}`,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, justifyContent: "space-between" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Dept accent label */}
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.07em",
                textTransform: "uppercase", color: accentColor, marginBottom: 4,
              }}>
                Client Detail
              </div>
              <h2 style={{
                fontSize: 17, fontWeight: 800, color: T.primary,
                lineHeight: 1.25, margin: 0, wordBreak: "break-word",
              }}>
                {client.clientName}
              </h2>
              {client.industry && (
                <p style={{ fontSize: 12, color: T.secondary, margin: "4px 0 0" }}>
                  {client.industry}
                </p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                <HealthBadge health={client.clientHealth} status={client.currentStatus} />
                {client.priority && client.priority !== "Normal" && (
                  <span style={{
                    padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: client.priority === "High" || client.priority === "Critical" ? "#fee2e2" : "#fef3c7",
                    color: client.priority === "High" || client.priority === "Critical" ? "#b91c1c" : "#b45309",
                  }}>
                    {client.priority} Priority
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close drawer"
              style={{
                width: 32, height: 32, borderRadius: 7, border: `1px solid ${T.border}`,
                background: "transparent", cursor: "pointer", color: T.muted,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = T.border)}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="1" y1="1" x2="13" y2="13" />
                <line x1="13" y1="1" x2="1" y2="13" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "22px 22px" }}>

          {/* Manager-only financial section */}
          {isManager && client.monthlyValue !== undefined && (
            <div style={{
              marginBottom: 22,
              background: T.blueBg, border: `1px solid #bfdbfe`,
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: T.blue, marginBottom: 6 }}>
                Financial Summary — Manager View
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 2 }}>Monthly Value</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.blue }}>
                    ${client.monthlyValue.toLocaleString()}
                    <span style={{ fontSize: 11, fontWeight: 400, marginLeft: 4, color: T.muted }}>/mo</span>
                  </div>
                </div>
                {client.billingStatus && (
                  <div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 2 }}>Billing Status</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{client.billingStatus}</div>
                  </div>
                )}
                {client.paymentStatus && client.paymentStatus !== "N/A" && (
                  <div>
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, marginBottom: 2 }}>Payment</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.primary }}>{client.paymentStatus}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Not manager — financial data gated */}
          {!isManager && (
            <div style={{
              marginBottom: 22,
              background: "#f8fafc", border: `1px solid ${T.border}`,
              borderRadius: 10, padding: "12px 14px",
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <p style={{ fontSize: 12, color: T.secondary, margin: 0 }}>
                Financial details (monthly value, billing status) are visible in Manager View only.
              </p>
            </div>
          )}

          {/* Client Overview */}
          <Section title="Client Overview">
            <Field label="Client Name" value={client.clientName} />
            <Field label="Industry" value={client.industry} />
            <Field label="Overall Status" value={client.currentStatus} />
            <Field label="Client Health" value={<HealthBadge health={client.clientHealth} status={client.currentStatus} />} />
            <Field label="Active Services" value={servicesLabel || undefined} />
            <Field label="Assigned AM" value={client.assignedAM} />
          </Section>

          {/* Account Status */}
          <Section title="Account Status">
            <Field label="Workflow Status" value={client.workflowStatus} />
            <Field label="Renewal Date" value={client.renewalDate} />
            <Field label="Renewal Status" value={client.renewalStatus} />
            <Field label="Priority" value={client.priority} />
          </Section>

          {/* Activity */}
          <Section title="Recent Activity">
            <Field label="Last Activity" value={client.lastActivity} />
            <Field label="Next Action" value={client.nextRequiredAction} />
          </Section>

          {/* Notes */}
          {client.notes && (
            <Section title="Notes">
              <div style={{
                background: T.bg, border: `1px solid ${T.border}`,
                borderRadius: 8, padding: "12px 14px",
                fontSize: 12, color: T.primary, lineHeight: 1.6,
                whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {client.notes}
              </div>
            </Section>
          )}

          {/* Source note */}
          <div style={{
            background: "#f0f9ff", border: "1px solid #bae6fd",
            borderRadius: 8, padding: "10px 14px",
            fontSize: 11, color: "#0c4a6e", lineHeight: 1.5,
          }}>
            <strong>Source of truth:</strong> Client data is sourced from MASTER_CLIENTS.
            This is a department-scoped view — AM-specific fields are not shown here.
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={{
          flexShrink: 0, padding: "10px 22px",
          background: T.bg, borderTop: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          gap: 8,
        }}>
          <button
            onClick={onClose}
            style={{
              padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
              border: `1px solid ${T.border}`, background: T.surface,
              color: T.secondary, cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
