"use client";

import { StatusBadge, ProgressBar, SectionWrapper } from "@/components/ui";
import type { StatusVariant } from "@/components/ui";
import type { OnboardingQueueItem, LaunchReadiness } from "@/lib/account-management/dashboard-data";

interface Props {
  items: OnboardingQueueItem[];
}

function readinessVariant(r: LaunchReadiness): StatusVariant {
  switch (r) {
    case "Payment Confirmed": return "info";
    case "Ready to Launch":   return "success";
    case "Blocked":           return "error";
    case "In Progress":       return "pending";
    case "Awaiting Launch":   return "neutral";
  }
}

function priorityColor(p: OnboardingQueueItem["priority"]) {
  switch (p) {
    case "Critical": return "#DC2626";
    case "High":     return "#D97706";
    case "Medium":   return "#1B4FD8";
    case "Low":      return "#94A3B8";
  }
}

export default function OnboardingQueue({ items }: Props) {
  const paymentConfirmed = items.filter((i) => i.paymentStatus === "Confirmed");
  const awaitingLaunch   = items.filter((i) => i.launchReadiness === "Awaiting Launch");
  const readyToLaunch    = items.filter((i) => i.launchReadiness === "Ready to Launch");
  const blocked          = items.filter((i) => i.launchReadiness === "Blocked");

  return (
    <div className="space-y-4">
      {/* ── Summary stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Payment Confirmed", count: paymentConfirmed.length, color: "#1B4FD8", bg: "var(--rtm-blue-xlight)", border: "var(--rtm-blue-light)"},
          { label: "Awaiting Launch",   count: awaitingLaunch.length,   color: "#D97706",  bg: "#FFFBEB",              border: "#FDE68A"},
          { label: "Ready to Launch",   count: readyToLaunch.length,    color: "#059669",  bg: "#ECFDF5",              border: "#A7F3D0"},
          { label: "Blocked Launches",  count: blocked.length,          color: "#DC2626",  bg: "#FEF2F2",              border: "#FECACA"},
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border p-4 flex flex-col gap-1"style={{ background: s.bg, borderColor: s.border }}
          >
            <span className="text-2xl font-bold"style={{ color: s.color }}>{s.count}</span>
            <span className="text-xs font-semibold"style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Queue rows ── */}
      <SectionWrapper title="Onboarding & Launch Queue"description="All active onboarding clients">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border p-4 space-y-3"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                      {item.clientName}
                    </p>
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded"style={{ background: priorityColor(item.priority) + "18", color: priorityColor(item.priority) }}
                    >
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                    AM: {item.assignedAM} · {item.services.join(", ")} · Target: {item.targetLaunchDate}
                  </p>
                </div>
                <StatusBadge variant={readinessVariant(item.launchReadiness)} label={item.launchReadiness} size="sm"/>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                  <span>Onboarding progress</span>
                  <span className="font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                    {item.completedSteps}/{item.totalSteps} steps
                  </span>
                </div>
                <ProgressBar
                  value={item.completedSteps}
                  max={item.totalSteps}
                  color={
                    item.launchReadiness === "Blocked"? "#EF4444":
                    item.launchReadiness === "Ready to Launch"? "#10B981":
                    "var(--rtm-blue)"}
                  height={5}
                />
              </div>

              {item.blockedReason && (
                <div
                  className="flex items-start gap-2 rounded-lg px-3 py-2 text-xs"style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA"}}
                >
                  <span className="flex-shrink-0 mt-0.5 text-warning-600">!</span>
                  <span>{item.blockedReason}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionWrapper>
    </div>
  );
}
