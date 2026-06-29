"use client";

import React, { useState } from "react";
import Link from "next/link";
import { buildProjectFromHandoff, assignDepartment } from "@/lib/sales/project-engine";
import type { HandoffRecord } from "@/lib/sales/handoff-engine";
import type { ProjectRecord } from "@/lib/sales/project-config";
import DepartmentAssignmentTable from "./DepartmentAssignmentTable";
import ProjectSummaryCard from "./ProjectSummaryCard";

// ─── Step Types ───────────────────────────────────────────────────────────────

type PanelStep = "build" | "assign" | "confirm";

const STEP_LABELS: Record<PanelStep, string> = {
  build: "Build",
  assign: "Assign",
  confirm: "Confirm",
};

const STEPS: PanelStep[] = ["build", "assign", "confirm"];

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectCreationPanelProps {
  handoffRecord: HandoffRecord;
  summaryFields: Record<string, string>;
  onProjectCreated: (project: ProjectRecord) => void;
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: PanelStep }) {
  const currentIdx = STEPS.indexOf(current);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const isDone = i < currentIdx;
        const isActive = step === current;
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-all"
                style={{
                  background: isDone
                    ? "#059669"
                    : isActive
                    ? "var(--rtm-blue)"
                    : "var(--rtm-bg)",
                  color: isDone || isActive ? "#fff" : "var(--rtm-text-muted)",
                  borderColor: isDone
                    ? "#059669"
                    : isActive
                    ? "var(--rtm-blue)"
                    : "var(--rtm-border)",
                }}
              >
                {isDone ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{
                  color: isActive ? "var(--rtm-blue)" : isDone ? "#059669" : "var(--rtm-text-muted)",
                }}
              >
                {STEP_LABELS[step]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 mb-4"
                style={{
                  background: i < currentIdx ? "#059669" : "var(--rtm-border)",
                  minWidth: 32,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectCreationPanel({
  handoffRecord,
  summaryFields,
  onProjectCreated,
}: ProjectCreationPanelProps) {
  const [project, setProject] = useState<ProjectRecord | null>(null);
  const [step, setStep] = useState<PanelStep>("build");
  const [isCreating, setIsCreating] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [createdProject, setCreatedProject] = useState<ProjectRecord | null>(null);

  // Step 1 — Build
  function handleCreateProject() {
    setIsCreating(true);
    const built = buildProjectFromHandoff(handoffRecord, summaryFields);
    setProject(built);
    setIsCreating(false);
    setStep("assign");
  }

  // Step 2 — Assign
  function handleAssign(serviceId: string, assignedTo: string) {
    if (!project) return;
    const updated = assignDepartment(project, serviceId, assignedTo);
    setProject(updated);
  }

  function handleProceedToConfirm() {
    setStep("confirm");
  }

  // Step 3 — Confirm
  function handleConfirm() {
    if (!project) return;
    setCreatedProject(project);
    setConfirmed(true);
    onProjectCreated(project);
  }

  // ── Confirmed state ──────────────────────────────────────────────────────

  if (confirmed && createdProject) {
    return (
      <div
        className="rounded-xl border p-6"
        style={{ background: "var(--rtm-surface)", borderColor: "#A7F3D0" }}
      >
        {/* Success banner */}
        <div
          className="flex items-center gap-3 rounded-lg px-4 py-3 border mb-5"
          style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
        >
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#059669" }} />
          <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
            Project {createdProject.projectNumber} created successfully for{" "}
            {createdProject.clientName}.
          </p>
        </div>

        {/* Project summary */}
        <ProjectSummaryCard project={createdProject} />

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <Link
            href={`/projects/${createdProject.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm hover:opacity-90"
            style={{ background: "var(--rtm-blue)" }}
          >
            View Project in Global Projects
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            href="/projects/blueprints"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold border hover:bg-gray-50 transition-colors"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          >
            Generate Task Blueprint
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    );
  }

  // ── Panel ────────────────────────────────────────────────────────────────

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Panel header */}
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Project Creation
            </p>
            <h2
              className="text-base font-black"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Create Project Record
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              Convert this billing handoff into an active project in Global Projects.
            </p>
          </div>
        </div>
        <StepIndicator current={step} />
      </div>

      {/* Step content */}
      <div className="px-6 py-5">

        {/* ── STEP 1: BUILD ── */}
        {step === "build" && (
          <div className="flex flex-col gap-4">
            <div
              className="rounded-lg border p-4"
              style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
            >
              <p
                className="text-xs font-bold mb-3"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                Handoff Summary
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(summaryFields).map(([key, val]) => (
                  <div key={key}>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-wide"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {key.replace(/-/g, " ")}
                    </p>
                    <p
                      className="text-xs font-medium"
                      style={{ color: "var(--rtm-text-primary)" }}
                    >
                      {val || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateProject}
                disabled={isCreating}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "var(--rtm-blue)" }}
              >
                {isCreating ? "Building…" : "Create Project Record"}
                {!isCreating && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: ASSIGN ── */}
        {step === "assign" && project && (
          <div className="flex flex-col gap-4">
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
              Assign a team member to each service. All assignments can be updated later from
              the project detail page.
            </p>
            <DepartmentAssignmentTable project={project} onAssign={handleAssign} />
            <div className="flex justify-end">
              <button
                onClick={handleProceedToConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: "var(--rtm-blue)" }}
              >
                Review and Confirm
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: CONFIRM ── */}
        {step === "confirm" && project && (
          <div className="flex flex-col gap-4">
            <p className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
              Review the project details below. Click{" "}
              <strong>Confirm &amp; Create</strong> to finalize and open the project in
              Global Projects.
            </p>
            <ProjectSummaryCard project={project} />
            <div className="flex items-center justify-between gap-3 mt-2">
              <button
                onClick={() => setStep("assign")}
                className="text-xs font-semibold px-4 py-2 rounded-lg border hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
              >
                Back
              </button>
              <button
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                style={{ background: "#059669" }}
              >
                Confirm and Create Project
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
