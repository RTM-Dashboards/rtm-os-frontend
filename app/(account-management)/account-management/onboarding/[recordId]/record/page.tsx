"use client";

/**
 * AM Onboarding — Read-only Record View
 *
 * Route: /account-management/onboarding/[recordId]/record
 *
 * This is a CLEAN, READ-ONLY view of a completed or in-progress onboarding
 * record. It is reached by clicking "View Full Record →" from Project Overview
 * or the Task Client Context tab.
 *
 * It is NOT the editable wizard. The editable wizard lives at:
 *   /account-management/onboarding/[recordId]   (unchanged)
 *
 * This page:
 *   - Fetches the record live via /api/onboarding-records?id=<recordId>
 *   - Renders all fields via the shared OnboardingSummaryPanel (mode="standalone")
 *   - Displays record status, completion %, kickoff call date/status (read-only)
 *   - Provides an "Edit in Onboarding Wizard →" link back to the wizard
 *   - Has ZERO editing controls (no Fill it in, Send to Client, Mark Kickoff
 *     Complete, Finish & Prepare, Save All & Complete, or any other action)
 */

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { OnboardingSummaryPanel, buildOnboardingSectionGroups } from "@/components/account-management/OnboardingSummaryPanel";
import type { AMOnboardingRecord } from "@/lib/mock/am-onboarding-store";

// ---------------------------------------------------------------------------
// Status color map (read-only badge rendering)
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  "Draft":             { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  "AM In Progress":    { bg: "#EFF6FF", color: "#2563EB", border: "#BFDBFE" },
  "Sent to Client":    { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  "Client Responded":  { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC" },
  "Ready for Kickoff": { bg: "#F0FDF4", color: "#059669", border: "#A7F3D0" },
  "Complete":          { bg: "#ECFDF5", color: "#065F46", border: "#6EE7B7" },
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function OnboardingRecordPage({
  params,
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = use(params);

  const [record, setRecord] = useState<AMOnboardingRecord | null | "loading">("loading");
  const [error, setError] = useState<string | null>(null);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  // Fetch the record by id (not clientId) — direct record lookup
  useEffect(() => {
    let cancelled = false;
    setRecord("loading");
    setError(null);

    fetch(`/api/onboarding-records?id=${encodeURIComponent(recordId)}`, {
      cache: "no-store",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ record: AMOnboardingRecord }>;
      })
      .then((data) => {
        if (!cancelled) setRecord(data.record);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setRecord(null);
          setError(err instanceof Error ? err.message : String(err));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [recordId]);

  // ---------------------------------------------------------------------------
  // PDF download
  // ---------------------------------------------------------------------------

  const handleDownloadPdf = useCallback(async () => {
    if (!record || record === "loading" || record === null) return;
    setIsPdfGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const marginLeft = 20;
      const marginRight = 20;
      const contentWidth = pageWidth - marginLeft - marginRight;
      let y = 20;

      // Helper: add a new page when near the bottom
      const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // Helper: wrap and print text, returning new y position
      const printWrapped = (
        text: string,
        x: number,
        startY: number,
        maxWidth: number,
        lineHeight: number
      ): number => {
        const lines = doc.splitTextToSize(text, maxWidth) as string[];
        lines.forEach((line: string) => {
          checkPageBreak(lineHeight);
          doc.text(line, x, y);
          y += lineHeight;
        });
        return y;
      };

      const clientName = record.salesPrefill.clientName || "Unknown Client";
      const generatedDate = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      // ── Title block ──────────────────────────────────────────────────────
      // Client name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(clientName, marginLeft, y);
      y += 8;

      // Subtitle: Onboarding Record
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text("Onboarding Record", marginLeft, y);
      y += 6;

      // Status + Record ID row
      doc.setFontSize(9);
      doc.text(`Status: ${record.status}   ·   Record ID: ${record.id}`, marginLeft, y);
      y += 5;
      doc.text(`Generated: ${generatedDate}`, marginLeft, y);
      y += 4;

      // Completion
      const totalFields = Object.values(record.fieldAssignments).length;
      const filledFields = Object.values(record.fieldAssignments).filter(
        (a) => a.value.trim().length > 0
      ).length;
      const completionPct = totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;
      doc.text(`Completion: ${completionPct}% (${filledFields} of ${totalFields} fields filled)`, marginLeft, y);
      y += 3;

      // Divider line
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.setLineWidth(0.5);
      doc.line(marginLeft, y, pageWidth - marginRight, y);
      y += 8;

      // ── Sections ─────────────────────────────────────────────────────────
      const sectionGroups = buildOnboardingSectionGroups(record);

      if (sectionGroups.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text("No fields filled in yet.", marginLeft, y);
      } else {
        sectionGroups.forEach((sec) => {
          checkPageBreak(14);

          // Section heading
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59); // slate-800
          doc.text(sec.label.toUpperCase(), marginLeft, y);
          y += 4;

          // Section description (optional)
          if (sec.description) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139);
            printWrapped(sec.description, marginLeft, y, contentWidth, 4);
            y += 2;
          }

          // Fields
          sec.fields.forEach((field) => {
            checkPageBreak(12);

            // Field label
            doc.setFont("helvetica", "bold");
            doc.setFontSize(8);
            doc.setTextColor(100, 116, 139); // slate-500
            doc.text(field.label.toUpperCase(), marginLeft, y);
            y += 4;

            // Field value
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);
            doc.setTextColor(15, 23, 42); // slate-900
            printWrapped(field.value, marginLeft, y, contentWidth, 5);
            y += 3;
          });

          // Section divider
          doc.setDrawColor(241, 245, 249); // slate-100
          doc.setLineWidth(0.3);
          doc.line(marginLeft, y, pageWidth - marginRight, y);
          y += 6;
        });
      }

      // ── Footer on every page ─────────────────────────────────────────────
      const totalPages: number = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(
          `${clientName} — Onboarding Record — Generated ${generatedDate} — Page ${i} of ${totalPages}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: "center" }
        );
      }

      const safeClientName = clientName.replace(/[/\\?%*:|"<>]/g, "-");
      doc.save(`${safeClientName} - Onboarding Record.pdf`);
    } finally {
      setIsPdfGenerating(false);
    }
  }, [record]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------

  if (record === "loading") {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div
          className="rounded-xl border px-6 py-8 text-center"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-muted)",
          }}
        >
          <div className="text-sm">Loading onboarding record…</div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Not found / error state
  // ---------------------------------------------------------------------------

  if (record === null) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div
          className="rounded-xl border px-6 py-8"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <p
            className="text-xs font-black uppercase tracking-wide mb-2"
            style={{ color: "var(--rtm-text-secondary)" }}
          >
            Onboarding Record
          </p>
          <p className="text-sm mb-1" style={{ color: "var(--rtm-text-primary)" }}>
            Record not found.
          </p>
          {error && (
            <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
              {error}
            </p>
          )}
          <Link
            href="/account-management/onboarding"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
          >
            ← Back to Onboarding Queue
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Derived display values
  // ---------------------------------------------------------------------------

  const totalFields = Object.values(record.fieldAssignments).length;
  const filledFields = Object.values(record.fieldAssignments).filter(
    (a) => a.value.trim().length > 0
  ).length;
  const completionPct =
    totalFields > 0 ? Math.round((filledFields / totalFields) * 100) : 0;

  const sc = STATUS_COLORS[record.status] ?? STATUS_COLORS["Draft"];

  // Kickoff call date from fieldAssignments (same source the wizard uses)
  const kickoffDate = record.fieldAssignments["kickoffCallDate"]?.value ?? "";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div
        className="rounded-xl border px-6 py-5"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        {/* Back link + edit link row */}
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <Link
            href="/account-management/onboarding"
            className="inline-flex items-center gap-1 text-xs font-semibold hover:underline"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            ← Onboarding Queue
          </Link>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Download PDF */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isPdfGenerating}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "#059669", color: "#fff" }}
            >
              {isPdfGenerating ? "Generating…" : "⬇ Download PDF"}
            </button>

            <Link
              href={`/account-management/onboarding/${recordId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#2563EB" }}
            >
              Edit in Onboarding Wizard →
            </Link>
          </div>
        </div>

        {/* Title + status row */}
        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1
              className="text-lg font-black tracking-tight"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {record.salesPrefill.clientName || "Onboarding Record"}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Record ID: {record.id}
              {record.salesPrefill.email ? ` · ${record.salesPrefill.email}` : ""}
            </p>
          </div>

          {/* Status badge (read-only) */}
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border flex-shrink-0"
            style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}
          >
            {record.status}
          </span>
        </div>

        {/* Completion + kickoff info row */}
        <div
          className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          {/* Completion */}
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-wide mb-1"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Completion
            </div>
            <div
              className="text-sm font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {completionPct}%
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {filledFields} of {totalFields} fields filled
            </div>
            {/* Simple progress bar */}
            <div
              className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--rtm-border-light)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${completionPct}%`,
                  background: completionPct === 100 ? "#059669" : "#2563EB",
                }}
              />
            </div>
          </div>

          {/* Record created */}
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-wide mb-1"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Created
            </div>
            <div className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
              {new Date(record.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              Updated{" "}
              {new Date(record.updatedAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          {/* Kickoff call (read-only) */}
          <div
            className="rounded-lg px-4 py-3"
            style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}
          >
            <div
              className="text-[10px] font-bold uppercase tracking-wide mb-1"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Kickoff Call
            </div>
            {kickoffDate ? (
              <>
                <div className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                  {kickoffDate}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  Date recorded
                </div>
              </>
            ) : (
              <>
                <div className="text-sm font-bold" style={{ color: "var(--rtm-text-muted)" }}>
                  Not scheduled
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                  No date recorded
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Read-only record content (all sections, all filled fields) ───────── */}
      {/*
        OnboardingSummaryPanel in mode="standalone":
          - Renders all filled fields grouped by section
          - Collapsible sections (expand/collapse without page nav)
          - No "View Full Record →" link in the header (this IS the record page)
          - No editing controls of any kind
      */}
      <OnboardingSummaryPanel
        record={record}
        recordId={recordId}
        mode="standalone"
      />

      {/* ── Footer: edit link for AMs who need to make changes ───────────────── */}
      <div
        className="rounded-xl border px-6 py-4 flex items-center justify-between gap-3 flex-wrap"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          This is a read-only view. To update fields or change record status, use the Onboarding Wizard.
        </p>
        <Link
          href={`/account-management/onboarding/${recordId}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold text-white transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: "#2563EB" }}
        >
          Edit in Onboarding Wizard →
        </Link>
      </div>

    </div>
  );
}
