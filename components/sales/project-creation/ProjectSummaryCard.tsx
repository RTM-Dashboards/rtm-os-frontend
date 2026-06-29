"use client";

import React from "react";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_PRIORITY_LABELS,
  PROJECT_PRIORITY_COLORS,
  PROJECT_PHASES,
  type ProjectRecord,
} from "@/lib/sales/project-config";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatUSD(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function Badge({
  label,
  colors,
}: {
  label: string;
  colors: { bg: string; color: string; border: string };
}) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border"
      style={{ background: colors.bg, color: colors.color, borderColor: colors.border }}
    >
      {label}
    </span>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
      <span className="text-[11px] font-semibold uppercase tracking-wide flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }}>
        {label}
      </span>
      <span className="text-xs font-medium text-right" style={{ color: "var(--rtm-text-primary)" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectSummaryCardProps {
  project: ProjectRecord;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectSummaryCard({ project }: ProjectSummaryCardProps) {
  const statusColors = PROJECT_STATUS_COLORS[project.status];
  const priorityColors = PROJECT_PRIORITY_COLORS[project.priority];
  const departments = Array.from(
    new Set(project.services.map((s) => s.department))
  );

  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      {/* Header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mb-0.5"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              Project Summary
            </p>
            <p
              className="text-base font-black"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {project.clientName}
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--rtm-text-secondary)" }}
            >
              {project.projectNumber}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge label={PROJECT_STATUS_LABELS[project.status]} colors={statusColors} />
            <Badge label={PROJECT_PRIORITY_LABELS[project.priority]} colors={priorityColors} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-2">
        <Row label="Contract Number" value={project.contractNumber || "—"} />
        <Row label="Phase" value={PROJECT_PHASES[project.phase]} />
        <Row label="Start Date" value={formatDate(project.startDate)} />
        <Row label="Est. Launch Date" value={formatDate(project.estimatedLaunchDate)} />
        <Row
          label="Monthly Value"
          value={
            <span className="font-bold" style={{ color: "#059669" }}>
              {formatUSD(project.totalMonthlyValue)}
            </span>
          }
        />
        <Row
          label="Setup Fees"
          value={
            <span className="font-semibold">
              {formatUSD(project.totalSetupFees)}
            </span>
          }
        />
        <Row
          label="Services"
          value={
            <span
              className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px]"
              style={{ background: "#EFF6FF", color: "#1D4ED8" }}
            >
              {project.services.length} service{project.services.length !== 1 ? "s" : ""}
            </span>
          }
        />
        <Row
          label="Departments"
          value={
            <span
              className="inline-flex items-center px-2 py-0.5 rounded font-bold text-[11px]"
              style={{ background: "#FAF5FF", color: "#7C3AED" }}
            >
              {departments.length} department{departments.length !== 1 ? "s" : ""}
            </span>
          }
        />
        <div className="py-2.5">
          <span
            className="text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            Assigned AM
          </span>
          <p
            className="text-xs font-medium mt-1"
            style={{ color: project.assignedAM ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)" }}
          >
            {project.assignedAM ?? "Unassigned"}
          </p>
        </div>
      </div>
    </div>
  );
}
