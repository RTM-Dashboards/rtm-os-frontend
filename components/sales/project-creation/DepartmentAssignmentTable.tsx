"use client";

import React from "react";
import {
  ASSIGNMENT_STATUS_COLORS,
  PROJECT_STATUS_LABELS as _unused,
  type ProjectRecord,
  type ProjectServiceAssignment,
} from "@/lib/sales/project-config";

// ─── Mock Team Members per Department ────────────────────────────────────────

const TEAM_BY_DEPARTMENT: Record<string, string[]> = {
  SEO:              ["Alex K.", "Dana W."],
  GBP:              ["Dana W.", "Sara N."],
  PPC:              ["James R.", "Maria S."],
  LSA:              ["Sara N.", "Keisha J."],
  "Meta Ads":       ["Lena P.", "Jared C."],
  "Web Development":["Ethan B.", "Priya N."],
  Content:          ["Maya T.", "Chris A."],
  Reporting:        ["Alexis T.", "Dani O."],
};

function getTeamForDept(department: string): string[] {
  return TEAM_BY_DEPARTMENT[department] ?? [];
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ProjectServiceAssignment["status"] }) {
  const c = ASSIGNMENT_STATUS_COLORS[status];
  const labels: Record<string, string> = {
    pending: "Pending",
    assigned: "Assigned",
    active: "Active",
    complete: "Complete",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: c.color }}
      />
      {labels[status] ?? status}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DepartmentAssignmentTableProps {
  project: ProjectRecord;
  onAssign: (serviceId: string, assignedTo: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DepartmentAssignmentTable({
  project,
  onAssign,
}: DepartmentAssignmentTableProps) {
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 border-b"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
        }}
      >
        <p
          className="text-[11px] font-black uppercase tracking-wider"
          style={{ color: "var(--rtm-text-secondary)" }}
        >
          Department Assignments — {project.services.length} service
          {project.services.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "var(--rtm-bg)",
                borderBottom: "2px solid var(--rtm-border)",
              }}
            >
              {["Service", "Department", "Assigned To", "Status", "Start Date"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"
                    style={{ color: "var(--rtm-text-secondary)" }}
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {project.services.map((svc, i) => {
              const team = getTeamForDept(svc.department);
              const isLast = i === project.services.length - 1;
              return (
                <tr
                  key={svc.serviceId}
                  className="hover:bg-blue-50/30 transition-colors"
                  style={{
                    borderBottom: isLast
                      ? "none"
                      : "1px solid var(--rtm-border-light)",
                  }}
                >
                  {/* Service Name */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {svc.serviceName}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border"
                      style={{
                        background: "#EFF6FF",
                        color: "#1D4ED8",
                        borderColor: "#BFDBFE",
                      }}
                    >
                      {svc.department}
                    </span>
                  </td>

                  {/* Assigned To dropdown */}
                  <td className="px-4 py-3">
                    {team.length > 0 ? (
                      <select
                        value={svc.assignedTo ?? ""}
                        onChange={(e) => {
                          if (e.target.value) {
                            onAssign(svc.serviceId, e.target.value);
                          }
                        }}
                        className="rounded-lg px-2.5 py-1.5 text-xs border outline-none"
                        style={{
                          borderColor: "var(--rtm-border)",
                          background: "var(--rtm-bg)",
                          color: "var(--rtm-text-primary)",
                          minWidth: 130,
                        }}
                      >
                        <option value="">Select team member…</option>
                        {team.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className="text-xs"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        No team defined
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={svc.status} />
                  </td>

                  {/* Start Date */}
                  <td
                    className="px-4 py-3 text-xs"
                    style={{ color: "var(--rtm-text-secondary)" }}
                  >
                    {svc.startDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {project.services.length === 0 && (
          <div
            className="text-center py-12 text-xs"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            No services found on this project.
          </div>
        )}
      </div>
    </div>
  );
}
