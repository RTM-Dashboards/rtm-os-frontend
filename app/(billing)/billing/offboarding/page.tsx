"use client";

import Link from "next/link";
import { SectionWrapper } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

const triggers = [
  { rule: "Cancellation Request Submitted", action: "Notify Account Manager + Billing Lead",            timing: "Immediate"},
  { rule: "Service Pause Initiated",         action: "Pause all active campaigns, notify dept. leads",   timing: "Same day"},
  { rule: "Final Invoice Sent",              action: "Archive client record, close department tasks",    timing: "On send"},
  { rule: "Offboarding Complete",            action: "Trigger win-back sequence, archive in CRM",        timing: "D+30"},
];

export default function BillingOffboardingPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Offboarding Triggers</h1>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>Automated actions fired during the client offboarding flow.</p>
      </div>

      <div className="rounded-xl border p-5"style={{ background: "#FFFBEB", borderColor: "#D9770620"}}>
        <div className="flex items-start gap-3">
          
          <div>
            <p className="text-sm font-bold"style={{ color: "#D97706"}}>Offboarding Active</p>
            <p className="text-xs mt-1"style={{ color: "#D97706"}}>
              2 clients are currently in the offboarding pipeline. Review the Cancellations page for details.
            </p>
          </div>
        </div>
      </div>

      <SectionWrapper title="Trigger Rules"description="Automated offboarding actions">
        <div className="space-y-3">
          {triggers.map((t, i) => (
            <div key={t.rule} className="flex items-start gap-4 p-4 rounded-lg border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"style={{ background: workspace.accentColor }}>
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{t.rule}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>Action: {t.action}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>Timing: {t.timing}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute}  className="rtm-btn-secondary text-sm inline-flex items-center gap-1">← Dashboard</Link>
        <Link href="/billing/cancellations"className="rtm-btn-secondary text-sm inline-flex items-center gap-1">Cancellations →</Link>
        <Link href={workspace.tasksRoute}      className="rtm-btn-primary  text-sm inline-flex items-center gap-1">Tasks →</Link>
      </div>
    </div>
  );
}
