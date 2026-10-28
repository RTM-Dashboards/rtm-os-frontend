"use client";

import { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge, KpiCard } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("account-management")!;

function PreviewBadge() {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
      style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
    >
      Preview — Target State
    </span>
  );
}

//  Types 

type StatusV = "success"| "warning"| "error"| "info"| "neutral"| "pending";

interface CheckinRow {
  id: string;
  client: string;
  manager: string;
  lastCheckin: string;
  nextCheckin: string;
  meetingType: string;
  status: StatusV;
  statusLabel: string;
  health: StatusV;
  healthLabel: string;
  priority: "High"| "Medium"| "Low";
}

interface NoteSection {
  heading: string;
  content: string;
}

interface ClientNotes {
  client: string;
  sections: NoteSection[];
}

interface ActionItem {
  id: string;
  item: string;
  client: string;
  owner: string;
  department: string;
  dueDate: string;
  status: StatusV;
  statusLabel: string;
}

interface FollowupRow {
  id: string;
  client: string;
  followupItem: string;
  owner: string;
  dueDate: string;
  status: StatusV;
  statusLabel: string;
  notes: string;
}

//  Mock Data 

// Check-in schedule: not yet connected to a real data source.
// The layout and controls are preserved; no invented client data is displayed.
const scheduleRows: CheckinRow[] = [];

// Client notes: not yet connected to a real data source.
const clientNotesList: ClientNotes[] = [];

// Action items: not yet connected to a real data source.
const actionItems: ActionItem[] = [];

// Follow-up rows: not yet connected to a real data source.
const followupRows: FollowupRow[] = [];

// AI summaries: not yet connected to a real data source.
const aiSummaries: Record<string, { points: { icon?: string; label: string; detail: string }[] }> = {};

//  Priority Badge 

const priorityStyles: Record<string, { bg?: string; color?: string; border: string }> = {
  High:   { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA"},
  Medium: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A"},
  Low:    { bg: "#F0FDF4", color: "#15803D", border: "#BBF7D0"},
};

function PriorityBadge({ priority }: { priority: "High"| "Medium"| "Low"}) {
  const s = priorityStyles[priority];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border"style={{ background: s.bg, color: s.color, borderColor: s.border }}
    >
      {priority}
    </span>
  );
}

//  Page 

export default function AccountCheckinsPage() {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [activeNoteTab, setActiveNoteTab] = useState<number>(0);

  const selectedNotes = clientNotesList.find((n) => n.client === selectedClient);
  const aiSummary = aiSummaries[selectedClient] ?? null;

  return (
    <div className="space-y-8">
      {/*  Header  */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: workspace.accentColor }}>
          {workspace.name}
        </p>
        <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
          Check-ins
        </h1>
        <div className="mt-2"><PreviewBadge /></div>
        <p className="text-sm mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
          Client communication and follow-up workspace.
        </p>
      </div>

      {/* 
          1. Check-in KPI Cards
       */}
      {/* Check-in KPI Cards */}
      <section>
        <h2 className="text-sm font-semibold mb-3"style={{ color: "var(--rtm-text-secondary)"}}>
          Check-in KPI Cards
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <KpiCard
            title="Check-ins Due Today" value="—" subtitle="Not yet connected" trend="neutral" trendValue="" trendLabel="" iconBg="#FEF2F2" iconColor="#DC2626"
          />
          <KpiCard
            title="Upcoming Check-ins" value="—" subtitle="Not yet connected" trend="neutral" trendValue="" trendLabel="" iconBg="var(--rtm-blue-xlight)" iconColor="var(--rtm-blue)"
          />
          <KpiCard
            title="Overdue Check-ins" value="—" subtitle="Not yet connected" trend="neutral" trendValue="" trendLabel="" iconBg="#FEF2F2" iconColor="#DC2626"
          />
          <KpiCard
            title="Completed This Week" value="—" subtitle="Not yet connected" trend="neutral" trendValue="" trendLabel="" iconBg="#ECFDF5" iconColor="#059669"
          />
          <KpiCard
            title="Without Recent Contact" value="—" subtitle="Not yet connected" trend="neutral" trendValue="" trendLabel="" iconBg="#FFFBEB" iconColor="#B45309"
          />
          <KpiCard
            title="At-Risk Needing Check-in" value="—" subtitle="Not yet connected" trend="neutral" trendValue="" trendLabel="" iconBg="#FEF2F2" iconColor="#DC2626"
          />
        </div>
      </section>

      {/* 
          2. Check-in Schedule Table
       */}
      <SectionWrapper
        title="Check-in Schedule"description={`${scheduleRows.length} clients · select a row to load notes and AI prep`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)"}}>
                {["Client","Account Manager","Last Check-in","Next Check-in","Meeting Type","Status","Client Health","Priority","Action"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold uppercase tracking-wide pb-2 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scheduleRows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer transition-colors duration-100"style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: selectedClient === row.client ? "var(--rtm-blue-xlight)": "transparent",
                  }}
                  onClick={() => {
                    setSelectedClient(row.client);
                    setActiveNoteTab(0);
                  }}
                >
                  <td className="py-3 pr-4 font-semibold whitespace-nowrap"style={{ color: "var(--rtm-text-primary)"}}>
                    {row.client}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {row.manager}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {row.lastCheckin}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {row.nextCheckin}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {row.meetingType}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge variant={row.status} label={row.statusLabel} size="sm"/>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge variant={row.health} label={row.healthLabel} size="sm"/>
                  </td>
                  <td className="py-3 pr-4">
                    <PriorityBadge priority={row.priority} />
                  </td>
                  <td className="py-3">
                    <button
                      className="text-xs font-semibold px-3 py-1 rounded-md border transition-colors"style={{
                        background: "var(--rtm-blue-xlight)",
                        color: "var(--rtm-blue)",
                        borderColor: "var(--rtm-blue-light)",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedClient(row.client);
                        setActiveNoteTab(0);
                      }}
                    >
                      Open
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* 
          3. Check-in Notes Workspace
       */}
      <SectionWrapper
        title="Check-in Notes Workspace"description={`Viewing: ${selectedClient}`}
      >
        {selectedNotes ? (
          <div>
            {/* Tab bar */}
            <div className="flex flex-wrap gap-1 mb-5 border-b pb-3"style={{ borderColor: "var(--rtm-border)"}}>
              {selectedNotes.sections.map((sec, idx) => (
                <button
                  key={sec.heading}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold transition-colors"style={
                    activeNoteTab === idx
                      ? { background: workspace.accentColor, color: "#fff"}
                      : { background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}
                  }
                  onClick={() => setActiveNoteTab(idx)}
                >
                  {sec.heading}
                </button>
              ))}
            </div>

            {/* Active note content */}
            {selectedNotes.sections[activeNoteTab] && (
              <div
                className="rounded-xl p-5 border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
              >
                <p className="text-xs font-bold uppercase tracking-widest mb-2"style={{ color: workspace.accentColor }}>
                  {selectedNotes.sections[activeNoteTab].heading}
                </p>
                <p
                  className="text-sm whitespace-pre-line leading-relaxed"style={{ color: "var(--rtm-text-primary)"}}
                >
                  {selectedNotes.sections[activeNoteTab].content}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm py-6 text-center"style={{ color: "var(--rtm-text-muted)"}}>
            No notes available for <strong>{selectedClient}</strong>. Select a different client from the schedule above.
          </div>
        )}
      </SectionWrapper>

      {/* 
          4. Check-in Action Items
       */}
      <SectionWrapper
        title="Check-in Action Items"description={`${actionItems.length} open items across ${[...new Set(actionItems.map((a) => a.client))].length} clients`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)"}}>
                {["Action Item","Client","Owner","Department","Due Date","Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold uppercase tracking-wide pb-2 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {actionItems.map((item) => (
                <tr key={item.id} style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  <td className="py-3 pr-4 max-w-xs"style={{ color: "var(--rtm-text-primary)"}}>
                    {item.item}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap font-medium"style={{ color: "var(--rtm-text-secondary)"}}>
                    {item.client}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {item.owner}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>
                    {item.department}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {item.dueDate}
                  </td>
                  <td className="py-3">
                    <StatusBadge variant={item.status} label={item.statusLabel} size="sm"/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/* 
          5. AI Check-in Preparation
       */}
      <SectionWrapper
        title="AI Check-in Preparation"description={`Smart briefing for ${selectedClient} — generated from account data`}
      >
        <div
          className="rounded-xl p-4 mb-5 flex items-center gap-3"style={{ background: "var(--rtm-blue-xlight)", borderLeft: `4px solid ${workspace.accentColor}` }}
        >
          
          <p className="text-xs font-semibold"style={{ color: workspace.accentColor }}>
            AI Summary for <strong>{selectedClient}</strong> — based on performance data, task history, billing records, and client health signals.
          </p>
        </div>

        <div className="space-y-4">
          {(aiSummary?.points ?? []).map((point) => (
            <div
              key={point.label}
              className="flex gap-4 p-4 rounded-xl border"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border-light)"}}
            >
              <span className="text-2xl flex-shrink-0">{point.icon}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>
                  {point.label}
                </p>
                <p className="text-sm whitespace-pre-line leading-relaxed"style={{ color: "var(--rtm-text-primary)"}}>
                  {point.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] mt-4"style={{ color: "var(--rtm-text-muted)"}}>
           AI summaries are generated from mock data for demonstration purposes. Switch the client context using the schedule table above.
        </p>
      </SectionWrapper>

      {/* 
          6. Follow-up Tracker
       */}
      <SectionWrapper
        title="Follow-up Tracker"description={`${followupRows.length} open follow-up items`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--rtm-border)"}}>
                {["Client","Follow-up Item","Owner","Due Date","Status","Notes"].map((h) => (
                  <th
                    key={h}
                    className="text-left text-[11px] font-semibold uppercase tracking-wide pb-2 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {followupRows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid var(--rtm-border-light)"}}>
                  <td className="py-3 pr-4 whitespace-nowrap font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                    {row.client}
                  </td>
                  <td className="py-3 pr-4 max-w-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                    {row.followupItem}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {row.owner}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap"style={{ color: "var(--rtm-text-secondary)"}}>
                    {row.dueDate}
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge variant={row.status} label={row.statusLabel} size="sm"/>
                  </td>
                  <td className="py-3 max-w-xs text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                    {row.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/*  Footer nav  */}
      <div className="flex gap-2 pt-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm inline-flex items-center gap-1">
          ← Dashboard
        </Link>
        <Link href={workspace.tasksRoute} className="rtm-btn-primary text-sm inline-flex items-center gap-1">
          Tasks →
        </Link>
      </div>
    </div>
  );
}
