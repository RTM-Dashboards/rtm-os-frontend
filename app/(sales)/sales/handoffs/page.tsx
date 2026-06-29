"use client";

import React, { useState } from "react";
import Link from "next/link";
import HandoffShell from "@/components/sales/billing-handoff/HandoffShell";
import ProjectCreationPanel from "@/components/sales/project-creation/ProjectCreationPanel";
import ProjectSummaryCard from "@/components/sales/project-creation/ProjectSummaryCard";
import { buildHandoffRecord } from "@/lib/sales/handoff-engine";
import type { ProjectRecord } from "@/lib/sales/project-config";

// ─── Stable handoff seed data ─────────────────────────────────────────────────
// All business literals live here only, not in any child component.

const HANDOFF_CLIENT        = "Summit Landscaping";
const HANDOFF_CONTRACT_NUM  = "CTR-2025-0041";
const HANDOFF_CONTRACT_ID   = "ctr-0041";
const HANDOFF_PREPARED_BY   = "Jake Monroe";

const HANDOFF_SUMMARY_FIELDS: Record<string, string> = {
  "client-name":                "Summit Landscaping",
  "contract-number":            "CTR-2025-0041",
  "services-sold":              "SEO, Google Business Profile, Reporting",
  "monthly-recurring-revenue":  "$2,400/mo",
  "setup-fees":                 "$0",
  "payment-terms":              "Net 15",
  "term-length":                "12 months",
  "departments":                "SEO Team, GBP Team, Analytics",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HandoffsPage() {
  // Track whether the handoff shell has been submitted.
  // HandoffShell manages its own internal state; we detect submission via a
  // wrapper approach using a stable HandoffRecord for the project panel.
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const [createdProject, setCreatedProject] = useState<ProjectRecord | null>(null);

  // Build a stable HandoffRecord for the ProjectCreationPanel.
  // This mirrors the same seed data passed to HandoffShell.
  const handoffRecord = buildHandoffRecord(
    HANDOFF_CLIENT,
    HANDOFF_CONTRACT_NUM,
    HANDOFF_CONTRACT_ID,
    HANDOFF_PREPARED_BY,
    HANDOFF_SUMMARY_FIELDS
  );

  function handleHandoffSubmit() {
    setHandoffSubmitted(true);
  }

  function handleProjectCreated(project: ProjectRecord) {
    setCreatedProject(project);
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--rtm-bg)" }}>

      {/* ── Handoff Shell ── */}
      <HandoffShell
        clientName={HANDOFF_CLIENT}
        contractNumber={HANDOFF_CONTRACT_NUM}
        contractId={HANDOFF_CONTRACT_ID}
        preparedBy={HANDOFF_PREPARED_BY}
        initialSummaryFields={HANDOFF_SUMMARY_FIELDS}
        onSubmitted={handleHandoffSubmit}
      />

      {/* ── Project Creation Section ── */}
      {handoffSubmitted && (
        <div className="max-w-screen-xl mx-auto px-6 pb-12 space-y-4">

          {/* Section divider */}
          <div
            className="flex items-center gap-3 py-2"
            style={{ borderTop: "2px solid var(--rtm-border)" }}
          >
            <div>
              <p
                className="text-[11px] font-bold uppercase tracking-widest"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Next Step
              </p>
              <h2
                className="text-lg font-black"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                Create Project
              </h2>
            </div>
            <span
              className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
            >
              Sales → Delivery Handoff
            </span>
          </div>

          {/* Success banner when project exists */}
          {createdProject && (
            <div
              className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 border"
              style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: "#059669" }} />
                <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
                  Project {createdProject.projectNumber} created successfully.
                </p>
              </div>
              <Link
                href={`/projects/${createdProject.id}`}
                className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                style={{
                  background: "#059669",
                  color: "#fff",
                  borderColor: "#059669",
                }}
              >
                View Project in Global Projects →
              </Link>
            </div>
          )}

          {/* If project not yet created: show creation panel */}
          {!createdProject && (
            <ProjectCreationPanel
              handoffRecord={handoffRecord}
              summaryFields={HANDOFF_SUMMARY_FIELDS}
              onProjectCreated={handleProjectCreated}
            />
          )}

          {/* If project already created: show read-only summary + links */}
          {createdProject && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ProjectSummaryCard project={createdProject} />

              {/* Next step CTA */}
              <div
                className="rounded-xl border p-5 flex flex-col justify-between"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
              >
                <div>
                  <p
                    className="text-[11px] font-bold uppercase tracking-widest mb-1"
                    style={{ color: "var(--rtm-text-muted)" }}
                  >
                    Next Step
                  </p>
                  <h3
                    className="text-base font-black mb-2"
                    style={{ color: "var(--rtm-text-primary)" }}
                  >
                    Generate Task Blueprint
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-secondary)" }}>
                    Apply a Task Blueprint to the new project to auto-generate all department
                    tasks, assign owners, and set dependencies. This kicks off the execution
                    phase.
                  </p>
                </div>
                <div className="flex flex-col gap-2 mt-5">
                  <Link
                    href="/projects/blueprints"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                    style={{ background: "var(--rtm-blue)" }}
                  >
                    Generate Task Blueprint
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    href={`/projects/${createdProject.id}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                  >
                    View Project in Global Projects →
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Simulate Submit button (for demo, shown when not yet submitted) ── */}
      {!handoffSubmitted && (
        <div className="max-w-screen-xl mx-auto px-6 pb-6">
          <div
            className="rounded-xl border px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div>
              <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                Handoff submitted? Advance to project creation.
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                Once the billing handoff checklist is complete and submitted, create the
                project to begin delivery.
              </p>
            </div>
            <button
              onClick={handleHandoffSubmit}
              className="flex-shrink-0 text-xs font-bold px-4 py-2 rounded-lg text-white shadow-sm hover:opacity-90 transition-opacity"
              style={{ background: "var(--rtm-blue)" }}
            >
              Handoff Submitted — Create Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
