"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProjectRecord } from "@/lib/sales/project-config";
import { BlueprintShell } from "@/components/sales/task-blueprint/BlueprintShell";

// =============================================================================
// RTM OS — Task Blueprints Page
// Route: /projects/blueprints
// Shows projects pending blueprint generation and allows activating their
// task blueprints via BlueprintShell. No business logic in this file.
// =============================================================================

// ─── Mock Project Data ────────────────────────────────────────────────────────

const MOCK_PROJECTS: ProjectRecord[] = [
  {
    id: "proj-001",
    projectNumber: "PRJ-2025-1041",
    clientName: "Apex Dental Studio",
    contractNumber: "CTR-2025-0041",
    handoffId: "hnd-001",
    proposalId: "prop-001",
    status: "not-started",
    priority: "high",
    phase: "onboarding",
    services: [
      {
        serviceId: "seo",
        serviceName: "SEO",
        department: "SEO",
        assignedTo: null,
        status: "pending",
        startDate: "2025-08-01",
        estimatedCompletionDate: "2025-09-01",
        monthlyValue: 1200,
      },
      {
        serviceId: "gbp",
        serviceName: "Google Business Profile",
        department: "GBP",
        assignedTo: null,
        status: "pending",
        startDate: "2025-08-01",
        estimatedCompletionDate: "2025-08-15",
        monthlyValue: 400,
      },
    ],
    totalMonthlyValue: 1600,
    totalSetupFees: 1250,
    assignedAM: null,
    createdAt: "2025-07-25",
    startDate: "2025-08-01",
    estimatedLaunchDate: "2025-09-01",
    notes: "Client prefers Tuesday kickoff calls.",
  },
  {
    id: "proj-002",
    projectNumber: "PRJ-2025-1042",
    clientName: "Summit Sports Medicine",
    contractNumber: "CTR-2025-0042",
    handoffId: "hnd-002",
    proposalId: "prop-002",
    status: "not-started",
    priority: "critical",
    phase: "onboarding",
    services: [
      {
        serviceId: "ppc",
        serviceName: "Google Ads / PPC",
        department: "PPC",
        assignedTo: null,
        status: "pending",
        startDate: "2025-08-05",
        estimatedCompletionDate: "2025-09-05",
        monthlyValue: 1500,
      },
      {
        serviceId: "meta-ads",
        serviceName: "Meta Ads",
        department: "Meta Ads",
        assignedTo: null,
        status: "pending",
        startDate: "2025-08-05",
        estimatedCompletionDate: "2025-09-05",
        monthlyValue: 900,
      },
    ],
    totalMonthlyValue: 2400,
    totalSetupFees: 1700,
    assignedAM: null,
    createdAt: "2025-07-26",
    startDate: "2025-08-05",
    estimatedLaunchDate: "2025-09-10",
    notes: "Rush onboarding requested.",
  },
  {
    id: "proj-003",
    projectNumber: "PRJ-2025-1043",
    clientName: "Coastal Dermatology Group",
    contractNumber: "CTR-2025-0044",
    handoffId: "hnd-003",
    proposalId: "prop-003",
    status: "not-started",
    priority: "medium",
    phase: "onboarding",
    services: [
      {
        serviceId: "website",
        serviceName: "Website",
        department: "Web Development",
        assignedTo: null,
        status: "pending",
        startDate: "2025-08-10",
        estimatedCompletionDate: "2025-09-15",
        monthlyValue: 0,
      },
      {
        serviceId: "seo",
        serviceName: "SEO",
        department: "SEO",
        assignedTo: null,
        status: "pending",
        startDate: "2025-08-10",
        estimatedCompletionDate: "2025-09-10",
        monthlyValue: 1200,
      },
      {
        serviceId: "lsa",
        serviceName: "Local Service Ads",
        department: "LSA",
        assignedTo: null,
        status: "pending",
        startDate: "2025-08-10",
        estimatedCompletionDate: "2025-09-10",
        monthlyValue: 500,
      },
    ],
    totalMonthlyValue: 1700,
    totalSetupFees: 4500,
    assignedAM: null,
    createdAt: "2025-07-27",
    startDate: "2025-08-10",
    estimatedLaunchDate: "2025-09-20",
    notes: "Website build is the critical path.",
  },
];

// ─── Priority Color Map ───────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  high:     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  medium:   { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  low:      { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
};

// ─── Project Row ──────────────────────────────────────────────────────────────

function ProjectRow({
  project,
  onGenerate,
  isActive,
}: {
  project: ProjectRecord;
  onGenerate: () => void;
  isActive: boolean;
}) {
  const priorityColors = PRIORITY_COLORS[project.priority] ?? PRIORITY_COLORS.low;

  return (
    <tr
      style={{
        borderBottom: "1px solid var(--rtm-border-light)",
        background: isActive ? "var(--rtm-blue-xlight)" : undefined,
      }}
    >
      {/* Project */}
      <td className="px-4 py-3">
        <div
          className="font-semibold text-sm"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          {project.clientName}
        </div>
        <div
          className="text-xs font-mono mt-0.5"
          style={{ color: "var(--rtm-text-muted)" }}
        >
          {project.projectNumber}
        </div>
      </td>

      {/* Contract */}
      <td
        className="px-4 py-3 text-xs font-mono"
        style={{ color: "var(--rtm-text-secondary)" }}
      >
        {project.contractNumber}
      </td>

      {/* Services */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {project.services.map((svc) => (
            <span
              key={svc.serviceId}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
              style={{
                background: "var(--rtm-bg)",
                color: "var(--rtm-text-secondary)",
                border: "1px solid var(--rtm-border)",
              }}
            >
              {svc.serviceName}
            </span>
          ))}
        </div>
      </td>

      {/* Priority */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold"
          style={{
            background: priorityColors.bg,
            color: priorityColors.color,
            border: `1px solid ${priorityColors.border}`,
          }}
        >
          {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)}
        </span>
      </td>

      {/* Start Date */}
      <td
        className="px-4 py-3 text-sm whitespace-nowrap"
        style={{ color: "var(--rtm-text-secondary)" }}
      >
        {project.startDate}
      </td>

      {/* Action */}
      <td className="px-4 py-3 whitespace-nowrap">
        <button
          type="button"
          onClick={onGenerate}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-opacity"
          style={{
            background: isActive ? "#059669" : "var(--rtm-blue)",
            opacity: 1,
          }}
        >
          {isActive ? "Viewing Blueprint" : "Generate Blueprint"}
        </button>
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BlueprintsPage() {
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const activeProject =
    MOCK_PROJECTS.find((p) => p.id === activeProjectId) ?? null;

  function handleGenerate(projectId: string) {
    setActiveProjectId((prev) => (prev === projectId ? null : projectId));
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: "var(--rtm-bg)" }}
    >
      {/* ── Header ── */}
      <div
        className="px-6 pt-6 pb-4"
        style={{
          background: "var(--rtm-surface)",
          borderBottom: "1px solid var(--rtm-border)",
        }}
      >
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb */}
          <div
            className="flex items-center gap-2 text-xs mb-3"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            <Link
              href="/projects"
              className="hover:underline"
              style={{ color: "var(--rtm-blue)" }}
            >
              Global Projects
            </Link>
            <span>/</span>
            <span>Task Blueprints</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1
                className="text-2xl font-black mb-1"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                Task Blueprints
              </h1>
              <p
                className="text-sm"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                Generate and activate task blueprints for new client projects.
                Blueprints produce department task sets from service templates.
              </p>
            </div>
            <Link
              href="/tasks/department-activation"
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{
                background: "var(--rtm-surface)",
                border: "1px solid var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              Department Activation
            </Link>
          </div>

          {/* Workflow indicator */}
          <div
            className="flex flex-wrap items-center gap-2 mt-4 px-4 py-3 rounded-xl text-xs font-semibold"
            style={{
              background: "var(--rtm-blue-xlight)",
              border: "1px solid #BFDBFE",
            }}
          >
            {[
              "Lead",
              "Proposal",
              "Contract",
              "Billing Handoff",
              "Project",
              "Task Blueprint",
              "Department Execution",
            ].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded-full"
                  style={{
                    background:
                      step === "Task Blueprint" ? "var(--rtm-blue)" : "white",
                    color:
                      step === "Task Blueprint" ? "white" : "#1E40AF",
                    border: "1px solid #BFDBFE",
                    fontWeight: step === "Task Blueprint" ? 800 : 600,
                  }}
                >
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span style={{ color: "#93C5FD", fontWeight: 900 }}>
                    &rarr;
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 px-6 py-5 max-w-[1200px] mx-auto w-full">

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Projects Pending Blueprint",
              value: MOCK_PROJECTS.length,
              color: "var(--rtm-blue)",
            },
            {
              label: "Total Services",
              value: MOCK_PROJECTS.reduce((s, p) => s + p.services.length, 0),
              color: "#7C3AED",
            },
            {
              label: "Critical Priority",
              value: MOCK_PROJECTS.filter((p) => p.priority === "critical")
                .length,
              color: "#DC2626",
            },
            {
              label: "Starting This Month",
              value: MOCK_PROJECTS.filter((p) =>
                p.startDate.startsWith("2025-08")
              ).length,
              color: "#059669",
            },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-xl p-4"
              style={{
                background: "var(--rtm-surface)",
                border: "1px solid var(--rtm-border)",
              }}
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-wide mb-1"
                style={{ color: "var(--rtm-text-secondary)" }}
              >
                {k.label}
              </p>
              <p
                className="text-3xl font-black"
                style={{ color: k.color }}
              >
                {k.value}
              </p>
            </div>
          ))}
        </div>

        {/* Project List */}
        <div
          className="rounded-xl overflow-hidden mb-5"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
          }}
        >
          <div
            className="px-5 py-4"
            style={{ borderBottom: "1px solid var(--rtm-border)" }}
          >
            <h2
              className="text-sm font-extrabold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Projects Pending Blueprint Generation
            </h2>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Select a project to generate and activate its task blueprint.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "2px solid var(--rtm-border)",
                }}
              >
                <tr>
                  {[
                    "Project",
                    "Contract",
                    "Services",
                    "Priority",
                    "Start Date",
                    "Action",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wide"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_PROJECTS.map((project) => (
                  <ProjectRow
                    key={project.id}
                    project={project}
                    onGenerate={() => handleGenerate(project.id)}
                    isActive={activeProjectId === project.id}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Blueprint Shell */}
        {activeProject && (
          <div>
            <div
              className="flex items-center gap-2 mb-4 text-xs font-semibold"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              <span>Blueprint for</span>
              <span
                className="font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                {activeProject.clientName}
              </span>
              <button
                type="button"
                onClick={() => setActiveProjectId(null)}
                className="ml-2 px-2 py-0.5 rounded text-xs"
                style={{
                  background: "var(--rtm-bg)",
                  border: "1px solid var(--rtm-border)",
                  color: "var(--rtm-text-muted)",
                }}
              >
                Close
              </button>
            </div>
            <BlueprintShell project={activeProject} />
          </div>
        )}
      </div>
    </div>
  );
}
