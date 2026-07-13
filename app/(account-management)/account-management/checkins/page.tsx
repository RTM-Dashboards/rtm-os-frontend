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

const scheduleRows: CheckinRow[] = [
  {
    id: "1",
    client: "Apex Roofing",
    manager: "Jordan M.",
    lastCheckin: "May 5, 2025",
    nextCheckin: "Jun 5, 2025",
    meetingType: "Monthly Call",
    status: "warning",
    statusLabel: "Due Today",
    health: "warning",
    healthLabel: "At Risk",
    priority: "High",
  },
  {
    id: "2",
    client: "Pacific Dental",
    manager: "Jordan M.",
    lastCheckin: "May 6, 2025",
    nextCheckin: "Jun 6, 2025",
    meetingType: "Quarterly Review",
    status: "warning",
    statusLabel: "Tomorrow",
    health: "success",
    healthLabel: "Healthy",
    priority: "Medium",
  },
  {
    id: "3",
    client: "Sunbelt HVAC",
    manager: "Sarah K.",
    lastCheckin: "Apr 15, 2025",
    nextCheckin: "Jun 7, 2025",
    meetingType: "At-Risk Call",
    status: "error",
    statusLabel: "Overdue",
    health: "error",
    healthLabel: "Critical",
    priority: "High",
  },
  {
    id: "4",
    client: "Harbor Auto Group",
    manager: "Mike T.",
    lastCheckin: "May 10, 2025",
    nextCheckin: "Jun 9, 2025",
    meetingType: "Monthly Call",
    status: "info",
    statusLabel: "Scheduled",
    health: "success",
    healthLabel: "Healthy",
    priority: "Low",
  },
  {
    id: "5",
    client: "Metro Dental",
    manager: "Sarah K.",
    lastCheckin: "May 25, 2025",
    nextCheckin: "Jun 10, 2025",
    meetingType: "Onboarding Call",
    status: "info",
    statusLabel: "Scheduled",
    health: "info",
    healthLabel: "New",
    priority: "Medium",
  },
  {
    id: "6",
    client: "Greenfield Landscaping",
    manager: "Mike T.",
    lastCheckin: "Apr 1, 2025",
    nextCheckin: "Jun 12, 2025",
    meetingType: "Monthly Call",
    status: "error",
    statusLabel: "Overdue",
    health: "warning",
    healthLabel: "At Risk",
    priority: "High",
  },
  {
    id: "7",
    client: "Summit Legal Group",
    manager: "Jordan M.",
    lastCheckin: "May 20, 2025",
    nextCheckin: "Jun 14, 2025",
    meetingType: "Monthly Call",
    status: "pending",
    statusLabel: "Upcoming",
    health: "success",
    healthLabel: "Healthy",
    priority: "Low",
  },
];

const clientNotesList: ClientNotes[] = [
  {
    client: "Apex Roofing",
    sections: [
      {
        heading: "Previous Notes",
        content:
          "May check-in: Client expressed concern about campaign reach. Discussed creative refresh. SEO performance up 12% MoM. Team completed 3 of 5 deliverables for the quarter.",
      },
      {
        heading: "Client Concerns",
        content:
          "Lead quality from paid search is below expectations. Client wants more granular monthly reporting. Asked about adding a dedicated account specialist.",
      },
      {
        heading: "Performance Updates",
        content:
          "Google Ads CTR: 3.2% (target 3.5%). Organic traffic: +18% YoY. Conversion rate dipped to 1.8% — landing page A/B test in progress.",
      },
      {
        heading: "Billing Notes",
        content:
          "Invoice #4821 paid on time. Upcoming renewal in 45 days — $3,400/mo retainer. Client is open to a performance add-on if leads improve.",
      },
      {
        heading: "Department Updates",
        content:
          "Creative delivered new ad set June 3. SEO team completing technical audit. Paid search team adjusting bidding strategy this week.",
      },
      {
        heading: "Next Steps",
        content:
          "• Send updated reporting dashboard link before call\n• Prepare lead quality analysis\n• Discuss retainer renewal options\n• Follow up on creative performance post-launch",
      },
    ],
  },
  {
    client: "Sunbelt HVAC",
    sections: [
      {
        heading: "Previous Notes",
        content:
          "April call: Client frustrated with delayed task completions. Relationship is strained. Escalated to senior AM. Seasonal campaign launched late.",
      },
      {
        heading: "Client Concerns",
        content:
          "Tasks not completed on time. No proactive communication from team. ROI unclear — client wants to see direct attribution.",
      },
      {
        heading: "Performance Updates",
        content:
          "Organic rankings improved for 6 target keywords. Paid traffic down 8% due to budget pause. Email open rate: 22%.",
      },
      {
        heading: "Billing Notes",
        content:
          "Invoice #4810 overdue by 12 days. Payment plan discussion needed. Contract up for renewal in 30 days — churn risk flagged.",
      },
      {
        heading: "Department Updates",
        content:
          "Escalation ticket open with ops. Creative team on hold pending client approval. Billing team sent second payment reminder June 2.",
      },
      {
        heading: "Next Steps",
        content:
          "• Immediate outreach — call overdue\n• Prepare retention offer\n• Resolve overdue invoice\n• Deliver task completion report",
      },
    ],
  },
  {
    client: "Pacific Dental",
    sections: [
      {
        heading: "Previous Notes",
        content:
          "Quarterly review went well. Client happy with SEO progress. Discussed adding social media management. No open escalations.",
      },
      {
        heading: "Client Concerns",
        content:
          "Wants faster turnaround on content pieces. Interested in reputation management add-on. Asked about competitor benchmarking reports.",
      },
      {
        heading: "Performance Updates",
        content:
          "Website traffic: +24% QoQ. New patient inquiries up 15%. Google Business Profile views increased 40%.",
      },
      {
        heading: "Billing Notes",
        content:
          "All invoices current. Auto-pay enrolled. Exploring $1,200/mo social add-on — proposal to be sent by June 8.",
      },
      {
        heading: "Department Updates",
        content:
          "Content team delivering 4 blog posts per month. Local SEO optimization complete for 3 locations.",
      },
      {
        heading: "Next Steps",
        content:
          "• Send social media proposal\n• Share competitor benchmarking report\n• Discuss content calendar for Q3\n• Confirm next quarterly review date",
      },
    ],
  },
];

const actionItems: ActionItem[] = [
  {
    id: "a1",
    item: "Send updated dashboard link to Apex Roofing",
    client: "Apex Roofing",
    owner: "Jordan M.",
    department: "Account Management",
    dueDate: "Jun 5, 2025",
    status: "warning",
    statusLabel: "Due Today",
  },
  {
    id: "a2",
    item: "Prepare lead quality analysis for Apex Roofing call",
    client: "Apex Roofing",
    owner: "Jordan M.",
    department: "Paid Search",
    dueDate: "Jun 5, 2025",
    status: "warning",
    statusLabel: "Due Today",
  },
  {
    id: "a3",
    item: "Send overdue invoice reminder to Sunbelt HVAC",
    client: "Sunbelt HVAC",
    owner: "Billing Team",
    department: "Billing",
    dueDate: "Jun 5, 2025",
    status: "error",
    statusLabel: "Overdue",
  },
  {
    id: "a4",
    item: "Prepare retention offer for Sunbelt HVAC",
    client: "Sunbelt HVAC",
    owner: "Sarah K.",
    department: "Account Management",
    dueDate: "Jun 6, 2025",
    status: "pending",
    statusLabel: "In Progress",
  },
  {
    id: "a5",
    item: "Send social media add-on proposal to Pacific Dental",
    client: "Pacific Dental",
    owner: "Jordan M.",
    department: "Sales",
    dueDate: "Jun 8, 2025",
    status: "info",
    statusLabel: "Scheduled",
  },
  {
    id: "a6",
    item: "Deliver task completion report to Sunbelt HVAC",
    client: "Sunbelt HVAC",
    owner: "Sarah K.",
    department: "Operations",
    dueDate: "Jun 7, 2025",
    status: "error",
    statusLabel: "Overdue",
  },
  {
    id: "a7",
    item: "Confirm Q3 content calendar with Pacific Dental",
    client: "Pacific Dental",
    owner: "Jordan M.",
    department: "Content",
    dueDate: "Jun 10, 2025",
    status: "neutral",
    statusLabel: "Pending",
  },
];

const followupRows: FollowupRow[] = [
  {
    id: "f1",
    client: "Apex Roofing",
    followupItem: "Retainer renewal discussion",
    owner: "Jordan M.",
    dueDate: "Jun 12, 2025",
    status: "pending",
    statusLabel: "In Progress",
    notes: "Client open to performance add-on. Prepare renewal deck.",
  },
  {
    id: "f2",
    client: "Sunbelt HVAC",
    followupItem: "Churn prevention outreach",
    owner: "Sarah K.",
    dueDate: "Jun 6, 2025",
    status: "error",
    statusLabel: "Urgent",
    notes: "Contract renewal in 30 days. At-risk. Escalated to senior AM.",
  },
  {
    id: "f3",
    client: "Pacific Dental",
    followupItem: "Social media proposal follow-up",
    owner: "Jordan M.",
    dueDate: "Jun 10, 2025",
    status: "info",
    statusLabel: "Scheduled",
    notes: "Proposal sent June 8. Follow up if no response by June 10.",
  },
  {
    id: "f4",
    client: "Harbor Auto Group",
    followupItem: "Confirm creative approval",
    owner: "Mike T.",
    dueDate: "Jun 7, 2025",
    status: "warning",
    statusLabel: "Awaiting Client",
    notes: "Creative submitted May 30. Reminder sent June 2.",
  },
  {
    id: "f5",
    client: "Metro Dental",
    followupItem: "Onboarding milestone review",
    owner: "Sarah K.",
    dueDate: "Jun 14, 2025",
    status: "neutral",
    statusLabel: "Pending",
    notes: "30-day onboarding check. Ensure all integrations are live.",
  },
  {
    id: "f6",
    client: "Greenfield Landscaping",
    followupItem: "Reactivate stalled campaign",
    owner: "Mike T.",
    dueDate: "Jun 8, 2025",
    status: "error",
    statusLabel: "Overdue",
    notes: "Campaign paused April 20. No response from client since.",
  },
];

const aiSummaries: Record<string, { points: { icon?: string; label: string; detail: string }[] }> = {
  "Apex Roofing": {
    points: [
      { icon: "", label: "Performance Change", detail: "CTR dropped 0.3% MoM — landing page A/B test is live but no winner declared yet. Recommend reviewing test results before the call."},
      { icon: "⏳", label: "Delayed Tasks", detail: "2 content deliverables originally due May 28 are pending creative approval. Creative team expects delivery by June 6."},
      { icon: "", label: "Billing", detail: "Invoice #4821 is current. Retainer renewal due in 45 days — client has signaled willingness to expand if lead quality improves."},
      { icon: "", label: "Client Health Risk", detail: "Lead quality complaints logged twice in the past 60 days. Risk of scope reduction if paid search performance doesn't improve this month."},
      { icon: "", label: "Recommended Talking Points", detail: "1. Share A/B test update and timeline for winner declaration.\n2. Present lead quality breakdown by channel.\n3. Introduce retainer renewal with performance add-on option.\n4. Confirm Q3 campaign strategy direction."},
    ],
  },
  "Sunbelt HVAC": {
    points: [
      { icon: "", label: "Performance Change", detail: "Paid traffic down 8% due to budget pause requested by client in May. Organic keywords improving — 6 moved to page 1 this month."},
      { icon: "⏳", label: "Delayed Tasks", detail: "Seasonal campaign launched 9 days late due to creative bottleneck. Task completion rate this period: 58% (target: 85%)."},
      { icon: "", label: "Billing", detail: "Invoice #4810 is 12 days overdue. Client has not responded to two payment reminders. Payment plan may need to be offered."},
      { icon: "", label: "Client Health Risk", detail: "High churn risk. Contract renewal in 30 days. Client expressed dissatisfaction in last two interactions. Senior AM escalation is active."},
      { icon: "", label: "Recommended Talking Points", detail: "1. Acknowledge late campaign launch — take ownership.\n2. Present task completion improvement plan with dates.\n3. Discuss overdue invoice resolution.\n4. Offer retention incentive (e.g., one month fee waiver or free audit).\n5. Reframe organic gains as positive momentum."},
    ],
  },
  "Pacific Dental": {
    points: [
      { icon: "", label: "Performance Change", detail: "Strong quarter — website traffic up 24% QoQ, new patient inquiries up 15%. Google Business Profile optimization delivering above-average results."},
      { icon: "⏳", label: "Delayed Tasks", detail: "No overdue tasks. All content deliverables on schedule. Q2 campaign wrap-up report ready for presentation."},
      { icon: "", label: "Billing", detail: "All invoices paid on time. Auto-pay active. Social media add-on proposal at $1,200/mo is pending client review."},
      { icon: "", label: "Client Health Risk", detail: "No active health risks. Client satisfaction is high. Expansion opportunity flagged — social and reputation management."},
      { icon: "", label: "Recommended Talking Points", detail: "1. Present Q2 performance highlights — lead with the wins.\n2. Introduce social media and reputation management proposals.\n3. Preview Q3 content calendar.\n4. Discuss competitor benchmarking report request."},
    ],
  },
};

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
  const [selectedClient, setSelectedClient] = useState<string>("Apex Roofing");
  const [activeNoteTab, setActiveNoteTab] = useState<number>(0);

  const selectedNotes = clientNotesList.find((n) => n.client === selectedClient);
  const aiSummary = aiSummaries[selectedClient] ?? aiSummaries["Apex Roofing"];

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
            title="Check-ins Due Today"value="3"subtitle="Requires immediate action"trend="neutral"trendValue="1 urgent"trendLabel="flagged high priority"iconBg="#FEF2F2"iconColor="#DC2626"
          />
          <KpiCard
            title="Upcoming Check-ins"value="8"subtitle="Next 7 days"trend="neutral"trendValue="3 this week"trendLabel="scheduled"iconBg="var(--rtm-blue-xlight)"iconColor="var(--rtm-blue)"
          />
          <KpiCard
            title="Overdue Check-ins"value="2"subtitle="Past scheduled date"trend="down"trendValue="+1"trendLabel="vs last week"iconBg="#FEF2F2"iconColor="#DC2626"
          />
          <KpiCard
            title="Completed This Week"value="5"subtitle="Jun 1 – Jun 5"trend="up"trendValue="+2"trendLabel="vs prior week"iconBg="#ECFDF5"iconColor="#059669"
          />
          <KpiCard
            title="Without Recent Contact"value="4"subtitle="No contact 30+ days"trend="down"trendValue="+1"trendLabel="vs last month"iconBg="#FFFBEB"iconColor="#B45309"
          />
          <KpiCard
            title="At-Risk Needing Check-in"value="3"subtitle="Health score critical/at-risk"trend="down"trendValue="High churn risk"trendLabel="this period"iconBg="#FEF2F2"iconColor="#DC2626"
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
          {aiSummary.points.map((point) => (
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
