"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import HandoffShell from "@/components/sales/billing-handoff/HandoffShell";
import ProjectCreationPanel from "@/components/sales/project-creation/ProjectCreationPanel";
import ProjectSummaryCard from "@/components/sales/project-creation/ProjectSummaryCard";
import type { ProjectRecord } from "@/lib/sales/project-config";
import {
  getAllHandoffs,
  getHandoffById,
  getHandoffListStatus,
  updateHandoffInStore,
  type HandoffListStatus,
} from "@/lib/sales/handoff-store";
import type { HandoffRecord } from "@/lib/sales/handoff-engine";
import {
  HANDOFF_STATUS_LABELS,
  HANDOFF_STATUS_COLORS,
} from "@/lib/sales/handoff-config";

// ─── Status display helpers ───────────────────────────────────────────────────

const LIST_STATUS_CONFIG: Record<
  HandoffListStatus,
  { bg: string; color: string; border: string }
> = {
  "Not Started": { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  "In Progress": { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  "Submitted":   { bg: "#F0F9FF", color: "#0369A1", border: "#BAE6FD" },
  "Complete":    { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0" },
};

// ─── Workflow breadcrumb (shared between modes) ───────────────────────────────

function WorkflowBreadcrumb({ active }: { active: string }) {
  const steps = [
    "Sales Intake",
    "Goal Audit",
    "Recommendations",
    "Budget Optimizer",
    "Proposal Builder",
    "Contract Builder",
    "Billing Handoff",
  ];
  return (
    <div
      className="rounded-xl border p-3"
      style={{ background: "#F0FDF4", borderColor: "#A7F3D0" }}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-2"
        style={{ color: "#059669" }}
      >
        Sales Workflow
      </p>
      <div className="flex items-center gap-1 flex-wrap">
        {steps.map((step, i) => (
          <React.Fragment key={step}>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded"
              style={{
                background:
                  step === active
                    ? "#059669"
                    : steps.indexOf(step) < steps.indexOf(active)
                    ? "#DCFCE7"
                    : "#F1F5F9",
                color:
                  step === active
                    ? "#fff"
                    : steps.indexOf(step) < steps.indexOf(active)
                    ? "#15803D"
                    : "#64748B",
              }}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span className="text-slate-300 text-xs">→</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ─── Request Invoice Banner ───────────────────────────────────────────────────

interface RequestInvoiceBannerProps {
  contractSigned: boolean;
  autoExpanded: boolean;
  contractId: string | null;
  handoffNumber: string;
}

function RequestInvoiceBanner({
  contractSigned,
  autoExpanded,
  contractId,
  handoffNumber,
}: RequestInvoiceBannerProps) {
  const bannerRef = useRef<HTMLDivElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (autoExpanded && bannerRef.current) {
      bannerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [autoExpanded]);

  if (submitted) {
    return (
      <div
        ref={bannerRef}
        className="rounded-xl border px-6 py-5 flex items-center gap-4"
        style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
      >
        <span
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ background: "#059669" }}
        />
        <div>
          <p className="text-sm font-bold" style={{ color: "#065F46" }}>
            Invoice request submitted to Billing Team.
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#047857" }}>
            The Billing team will generate the invoice and activate the account.
            {contractId ? ` Contract: ${contractId}` : ""} · Handoff: {handoffNumber}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={bannerRef}
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: contractSigned ? "#A7F3D0" : "#E2E8F0",
        background: contractSigned ? "#F0FDF4" : "#F8FAFC",
      }}
    >
      <div className="px-6 py-5">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <p
              className="text-[10px] font-bold uppercase tracking-widest mb-1"
              style={{ color: contractSigned ? "#059669" : "#94A3B8" }}
            >
              Billing Action
            </p>
            <h2
              className="text-lg font-bold mb-1"
              style={{ color: contractSigned ? "#065F46" : "#64748B" }}
            >
              Ready to Request Invoice
            </h2>
            <p className="text-sm" style={{ color: contractSigned ? "#047857" : "#94A3B8" }}>
              {contractSigned
                ? "Submit this signed contract to Billing to generate the client invoice."
                : "Waiting on contract signature before invoice can be requested."}
            </p>
            {contractId && (
              <p
                className="text-xs mt-1.5 font-mono"
                style={{ color: contractSigned ? "#059669" : "#94A3B8" }}
              >
                Contract: {contractId}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {contractSigned ? (
              <button
                onClick={() => setSubmitted(true)}
                className="px-5 py-2.5 rounded-lg font-bold text-sm border transition-all hover:opacity-90"
                style={{ background: "#059669", color: "#fff", borderColor: "#047857" }}
              >
                Request Invoice — Submit to Billing Team
              </button>
            ) : (
              <div
                className="px-5 py-2.5 rounded-lg font-bold text-sm border"
                style={{
                  background: "#E2E8F0",
                  color: "#94A3B8",
                  borderColor: "#CBD5E1",
                  cursor: "not-allowed",
                }}
              >
                Request Invoice — Submit to Billing Team
              </div>
            )}
            {!contractSigned && (
              <p className="text-[11px]" style={{ color: "#94A3B8" }}>
                Waiting on contract signature.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Collapsible checklist wrapper ───────────────────────────────────────────

function CollapsibleChecklist({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
      >
        <span
          className="text-sm font-semibold"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          View Full Handoff Checklist
        </span>
        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform"
          style={{
            color: "var(--rtm-text-muted)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ─── MODE A: List View ────────────────────────────────────────────────────────

function HandoffListView() {
  const router = useRouter();
  const handoffs = getAllHandoffs();

  const statusCfg = LIST_STATUS_CONFIG;

  return (
    <div className="min-h-screen space-y-6 pb-12" style={{ background: "var(--rtm-bg)" }}>
      {/* Page header */}
      <div className="px-6 pt-6">
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: "#059669" }}
        >
          Sales
        </p>
        <h1 className="text-2xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          Billing Handoffs
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          Handoff records created from signed contracts. Click a row to view the checklist and
          submit to Billing.
        </p>
      </div>

      <div className="px-6">
        <WorkflowBreadcrumb active="Billing Handoff" />
      </div>

      <div className="px-6">
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "var(--rtm-border)" }}
        >
          {/* Table header */}
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                All Handoffs
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {handoffs.length} record{handoffs.length !== 1 ? "s" : ""} — created when Request
                Invoice is clicked on a signed contract
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table
              className="w-full text-xs"
              style={{ borderCollapse: "collapse", minWidth: "900px" }}
            >
              <thead>
                <tr
                  style={{
                    background: "var(--rtm-bg)",
                    borderBottom: "1px solid var(--rtm-border)",
                  }}
                >
                  {[
                    "Client",
                    "Contract",
                    "Handoff ID",
                    "Status",
                    "Checklist Progress",
                    "Prepared By",
                    "Created",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                      style={{ color: "var(--rtm-text-muted)" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {handoffs.map((handoff, i) => {
                  const listStatus = getHandoffListStatus(handoff);
                  const sc = statusCfg[listStatus];
                  const completed = handoff.checklist.filter(
                    (e) => e.status === "complete"
                  ).length;
                  const total = handoff.checklist.length;

                  return (
                    <tr
                      key={handoff.id}
                      style={{
                        borderBottom: "1px solid var(--rtm-border-light)",
                        background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        router.push(`/sales/handoffs?handoffId=${handoff.id}`)
                      }
                    >
                      <td
                        className="px-4 py-3 font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {handoff.clientName}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[11px]"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {handoff.contractNumber}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[11px] font-semibold"
                        style={{ color: "var(--rtm-text-primary)" }}
                      >
                        {handoff.handoffNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold border"
                          style={{
                            background: sc.bg,
                            color: sc.color,
                            borderColor: sc.border,
                          }}
                        >
                          {listStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: "var(--rtm-border)", minWidth: 60 }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${handoff.completionPercentage}%`,
                                background:
                                  handoff.completionPercentage === 100
                                    ? "#059669"
                                    : handoff.completionPercentage >= 50
                                    ? "#3B82F6"
                                    : "#F59E0B",
                              }}
                            />
                          </div>
                          <span
                            className="text-[10px] font-semibold whitespace-nowrap"
                            style={{ color: "var(--rtm-text-muted)" }}
                          >
                            {completed} of {total}
                          </span>
                        </div>
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--rtm-text-secondary)" }}
                      >
                        {handoff.preparedBy}
                      </td>
                      <td
                        className="px-4 py-3 whitespace-nowrap"
                        style={{ color: "var(--rtm-text-muted)" }}
                      >
                        {new Date(handoff.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/sales/handoffs?handoffId=${handoff.id}`);
                          }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"
                          style={{
                            background: "#059669",
                            color: "#fff",
                            borderColor: "#047857",
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {handoffs.length === 0 && (
            <div className="px-5 py-12 text-center">
              <p
                className="text-sm font-semibold"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                No handoff records yet.
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Handoffs are created when you click Request Invoice on a signed contract.
              </p>
              <Link
                href="/sales/contracts"
                className="inline-block mt-4 text-xs font-bold px-4 py-2 rounded-lg border"
                style={{ background: "#059669", color: "#fff", borderColor: "#047857" }}
              >
                Go to Contracts
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MODE B: Detail View ──────────────────────────────────────────────────────

function HandoffDetailView({
  handoffId,
  action,
}: {
  handoffId: string;
  action: string | null;
}) {
  const handoff = getHandoffById(handoffId);
  const [handoffSubmitted, setHandoffSubmitted] = useState(false);
  const [createdProject, setCreatedProject] = useState<ProjectRecord | null>(null);

  if (!handoff) {
    return (
      <div className="min-h-screen space-y-6 pb-12 px-6 pt-6" style={{ background: "var(--rtm-bg)" }}>
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/sales/handoffs"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{
              background: "var(--rtm-surface)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Back to Handoffs
          </Link>
        </div>
        <p style={{ color: "var(--rtm-text-muted)" }}>
          Handoff record not found: {handoffId}
        </p>
      </div>
    );
  }

  const autoExpand = action === "request-invoice";
  const contractSignedEntry = handoff.checklist.find((e) => e.id === "contract-signed");
  const contractSigned = contractSignedEntry?.status === "complete";

  const summaryFields = handoff.summaryFields;

  function handleHandoffSubmit() {
    setHandoffSubmitted(true);
  }

  function handleProjectCreated(project: ProjectRecord) {
    setCreatedProject(project);
  }

  return (
    <div className="min-h-screen space-y-6 pb-12" style={{ background: "var(--rtm-bg)" }}>
      {/* Page header with breadcrumb back link */}
      <div className="px-6 pt-6 space-y-3">
        <div className="flex items-center gap-2">
          <Link
            href="/sales/handoffs"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors hover:bg-gray-50"
            style={{
              background: "var(--rtm-surface)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Handoffs
          </Link>
          <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            /
          </span>
          <span
            className="text-xs font-semibold font-mono"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {handoff.handoffNumber}
          </span>
        </div>

        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: "#059669" }}
          >
            Sales · Billing Handoff
          </p>
          <h1
            className="text-2xl font-bold"
            style={{ color: "var(--rtm-text-primary)" }}
          >
            {handoff.clientName}
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            {handoff.contractNumber} · {handoff.handoffNumber} · Prepared by{" "}
            {handoff.preparedBy}
          </p>
        </div>
      </div>

      <div className="px-6">
        <WorkflowBreadcrumb active="Billing Handoff" />
      </div>

      <div className="px-6 space-y-5">
        {/* Request Invoice Banner */}
        <RequestInvoiceBanner
          contractSigned={contractSigned}
          autoExpanded={autoExpand}
          contractId={handoff.contractNumber}
          handoffNumber={handoff.handoffNumber}
        />

        {/* Collapsed Checklist */}
        <CollapsibleChecklist>
          <div style={{ borderTop: "1px solid var(--rtm-border)" }}>
            <HandoffShell
              clientName={handoff.clientName}
              contractNumber={handoff.contractNumber}
              contractId={handoff.contractId}
              preparedBy={handoff.preparedBy}
              initialSummaryFields={summaryFields}
              onSubmitted={handleHandoffSubmit}
            />
          </div>
        </CollapsibleChecklist>

        {/* Project Creation (shown after handoff submitted) */}
        {handoffSubmitted && (
          <div className="space-y-4">
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

            {createdProject && (
              <div
                className="flex items-center justify-between gap-4 rounded-lg px-4 py-3 border"
                style={{ background: "#ECFDF5", borderColor: "#A7F3D0" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: "#059669" }}
                  />
                  <p className="text-xs font-semibold" style={{ color: "#065F46" }}>
                    Project {createdProject.projectNumber} created successfully.
                  </p>
                </div>
                <Link
                  href={`/projects/${createdProject.id}`}
                  className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg border hover:opacity-80 transition-opacity"
                  style={{ background: "#059669", color: "#fff", borderColor: "#059669" }}
                >
                  View Project in Global Projects →
                </Link>
              </div>
            )}

            {!createdProject && (
              <ProjectCreationPanel
                handoffRecord={handoff}
                summaryFields={summaryFields}
                onProjectCreated={handleProjectCreated}
              />
            )}

            {createdProject && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ProjectSummaryCard project={createdProject} />
                <div
                  className="rounded-xl border p-5 flex flex-col justify-between"
                  style={{
                    background: "var(--rtm-surface)",
                    borderColor: "var(--rtm-border)",
                  }}
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
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: "var(--rtm-text-secondary)" }}
                    >
                      Apply a Task Blueprint to the new project to auto-generate all department
                      tasks, assign owners, and set dependencies.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 mt-5">
                    <Link
                      href="/projects/blueprints"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
                      style={{ background: "var(--rtm-blue)" }}
                    >
                      Generate Task Blueprint
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <Link
                      href={`/projects/${createdProject.id}`}
                      className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold border hover:bg-gray-50 transition-colors"
                      style={{
                        borderColor: "var(--rtm-border)",
                        color: "var(--rtm-text-primary)",
                      }}
                    >
                      View Project in Global Projects →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Demo advance helper */}
        {!handoffSubmitted && (
          <div
            className="rounded-xl border px-5 py-4 flex items-center justify-between gap-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div>
              <p
                className="text-xs font-bold"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                Handoff submitted? Advance to project creation.
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                Once the billing handoff checklist is complete and submitted, create the project
                to begin delivery.
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
        )}
      </div>
    </div>
  );
}

// ─── Inner page (needs useSearchParams) ──────────────────────────────────────

function HandoffsPageInner() {
  const searchParams = useSearchParams();
  const handoffId = searchParams.get("handoffId");
  const action = searchParams.get("action");

  if (handoffId) {
    return <HandoffDetailView handoffId={handoffId} action={action} />;
  }

  return <HandoffListView />;
}

// ─── Root export with Suspense boundary ──────────────────────────────────────

export default function HandoffsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center">
          <p style={{ color: "var(--rtm-text-muted)" }}>Loading handoffs...</p>
        </div>
      }
    >
      <HandoffsPageInner />
    </Suspense>
  );
}
