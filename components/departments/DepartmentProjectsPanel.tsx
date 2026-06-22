"use client";

// ── Department Projects Panel ─────────────────────────────────────────────────
// Departments do NOT own projects. Projects come from global Operations.
// This panel displays assigned projects pulled from Operations.

import { SectionWrapper, StatusBadge } from "@/components/ui";

interface AssignedProject {
  id: string;
  name: string;
  client: string;
  status: "active" | "on-hold" | "completed" | "at-risk";
  milestone: string;
  deliverable: string;
  dependency?: string;
  dueDate: string;
}

// Mock: in production this would be fetched from Operations
const MOCK_PROJECTS: AssignedProject[] = [
  {
    id: "proj-1",
    name: "Website Redesign — Apex Roofing",
    client: "Apex Roofing Co.",
    status: "active",
    milestone: "Design Approval",
    deliverable: "Homepage mockup",
    dueDate: "Jun 15",
  },
  {
    id: "proj-2",
    name: "SEO Launch — Pacific Dental",
    client: "Pacific Dental",
    status: "active",
    milestone: "Technical Audit Complete",
    deliverable: "Keyword strategy doc",
    dependency: "Content team brief",
    dueDate: "Jun 20",
  },
  {
    id: "proj-3",
    name: "PPC Setup — Harbor Auto",
    client: "Harbor Auto",
    status: "at-risk",
    milestone: "Campaign Live",
    deliverable: "Ad copy approved",
    dependency: "Creative assets",
    dueDate: "Jun 12",
  },
  {
    id: "proj-4",
    name: "AI Chatbot — Metro Dental",
    client: "Metro Dental",
    status: "on-hold",
    milestone: "Build Phase",
    deliverable: "Chatbot flow diagram",
    dueDate: "Jul 1",
  },
];

const STATUS_MAP: Record<AssignedProject["status"], { variant: "success" | "warning" | "error" | "info"; label: string }> = {
  active:    { variant: "success", label: "Active"     },
  "on-hold": { variant: "warning", label: "On Hold"    },
  completed: { variant: "info",    label: "Completed"  },
  "at-risk": { variant: "error",   label: "At Risk"    },
};

interface Props {
  accentColor: string;
  /** If the projects module is disabled for this department */
  disabled?: boolean;
}

export default function DepartmentProjectsPanel({ accentColor, disabled }: Props) {
  if (disabled) {
    return (
      <SectionWrapper title="Projects" description="Assigned projects from Operations">
        <div
          className="rounded-lg border p-6 text-center text-sm"
          style={{ borderColor: "var(--rtm-border-light)", color: "var(--rtm-text-muted)", background: "var(--rtm-bg)" }}
        >
          Projects module is disabled for this department.
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper
      title="Assigned Projects"
      description="Projects assigned to this department — sourced from Operations"
      actions={
        <a
          href="/operations"
          className="text-xs font-medium hover:underline"
          style={{ color: accentColor }}
        >
          View in Operations
        </a>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
              {["Project", "Client", "Status", "Milestone", "Deliverable", "Dependency", "Due"].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_PROJECTS.map((row) => {
              const s = STATUS_MAP[row.status];
              return (
                <tr
                  key={row.id}
                  className="hover:bg-slate-50/50 transition-colors"
                  style={{ borderBottom: "1px solid var(--rtm-border-light)" }}
                >
                  <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>
                    {row.name}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                    {row.client}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <StatusBadge variant={s.variant} label={s.label} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                    {row.milestone}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>
                    {row.deliverable}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap text-xs" style={{ color: row.dependency ? "#D97706" : "var(--rtm-text-muted)" }}>
                    {row.dependency ?? "—"}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap font-medium" style={{ color: "var(--rtm-text-secondary)" }}>
                    {row.dueDate}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SectionWrapper>
  );
}
