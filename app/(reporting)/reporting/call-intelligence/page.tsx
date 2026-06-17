"use client";

import { useState } from "react";

type CallOutcome = "Lead" | "Existing Client" | "Wrong Number" | "Spam" | "Voicemail" | "No Answer";
type CallDirection = "Inbound" | "Outbound";
type CallSentiment = "Positive" | "Neutral" | "Negative";

interface CallRecord {
  id: string;
  client: string;
  caller: string;
  callerPhone: string;
  direction: CallDirection;
  duration: string;
  durationSeconds: number;
  date: string;
  time: string;
  outcome: CallOutcome;
  sentiment: CallSentiment;
  aiSummary: string;
  keywords: string[];
  source: string;
  campaign?: string;
  handled: boolean;
  followUpRequired: boolean;
}

const OUTCOME_CFG: Record<CallOutcome, { bg: string; color: string; border: string }> = {
  Lead:            { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  "Existing Client": { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  "Wrong Number":  { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  Spam:            { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
  Voicemail:       { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  "No Answer":     { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
};

const SENTIMENT_CFG: Record<CallSentiment, { icon: string; color: string }> = {
  Positive: { icon: "😊", color: "#059669" },
  Neutral:  { icon: "😐", color: "#D97706" },
  Negative: { icon: "😞", color: "#DC2626" },
};

const CALLS: CallRecord[] = [
  {
    id: "call-001", client: "Horizon Dental", caller: "Sarah Thompson", callerPhone: "(555) 234-8910",
    direction: "Inbound", duration: "4:32", durationSeconds: 272, date: "2025-07-22", time: "9:14 AM",
    outcome: "Lead", sentiment: "Positive",
    aiSummary: "Caller asked about teeth whitening and new patient specials. Interested in scheduling an appointment. High-intent lead.",
    keywords: ["new patient", "teeth whitening", "pricing", "appointment"],
    source: "Google Ads", campaign: "Horizon Dental — Local Search", handled: true, followUpRequired: true,
  },
  {
    id: "call-002", client: "Summit Auto Group", caller: "Unknown", callerPhone: "(555) 883-0012",
    direction: "Inbound", duration: "0:45", durationSeconds: 45, date: "2025-07-22", time: "10:02 AM",
    outcome: "Spam", sentiment: "Neutral",
    aiSummary: "Automated call detected. No meaningful conversation. Flagged as spam.",
    keywords: [], source: "Direct", handled: false, followUpRequired: false,
  },
  {
    id: "call-003", client: "Prestige Law Group", caller: "Michael Huang", callerPhone: "(555) 771-4456",
    direction: "Inbound", duration: "7:18", durationSeconds: 438, date: "2025-07-22", time: "11:30 AM",
    outcome: "Lead", sentiment: "Positive",
    aiSummary: "Caller is a business owner seeking commercial litigation representation. Mentioned a dispute with a contractor. Requested a consultation.",
    keywords: ["commercial litigation", "business dispute", "consultation", "contract"],
    source: "LSA", handled: true, followUpRequired: true,
  },
  {
    id: "call-004", client: "Maple Ridge Clinic", caller: "Existing Patient", callerPhone: "(555) 330-9812",
    direction: "Inbound", duration: "3:05", durationSeconds: 185, date: "2025-07-22", time: "1:15 PM",
    outcome: "Existing Client", sentiment: "Neutral",
    aiSummary: "Existing patient calling to reschedule an appointment. Not a new lead. Appointment rescheduled for next week.",
    keywords: ["reschedule", "appointment"],
    source: "Google Ads", campaign: "Maple Ridge — Brand", handled: true, followUpRequired: false,
  },
  {
    id: "call-005", client: "GreenLeaf HVAC", caller: "Robert Castillo", callerPhone: "(555) 499-2231",
    direction: "Inbound", duration: "5:50", durationSeconds: 350, date: "2025-07-21", time: "3:45 PM",
    outcome: "Lead", sentiment: "Positive",
    aiSummary: "Homeowner with broken AC unit requesting emergency repair service. High urgency. Lead is qualified — mentioned budget is not a concern.",
    keywords: ["emergency repair", "AC broken", "same day", "quote"],
    source: "LSA", handled: false, followUpRequired: true,
  },
  {
    id: "call-006", client: "BlueSky Roofing", caller: "Anna Perkins", callerPhone: "(555) 667-3312",
    direction: "Inbound", duration: "2:10", durationSeconds: 130, date: "2025-07-21", time: "4:20 PM",
    outcome: "Lead", sentiment: "Neutral",
    aiSummary: "Caller requesting a roofing estimate after storm damage. Interested in insurance claim assistance. Moderate intent.",
    keywords: ["storm damage", "estimate", "insurance", "roofing"],
    source: "Google Ads", campaign: "BlueSky Roofing — Storm Season", handled: true, followUpRequired: true,
  },
  {
    id: "call-007", client: "Prestige Law Group", caller: "Disgruntled Caller", callerPhone: "(555) 102-4455",
    direction: "Inbound", duration: "1:55", durationSeconds: 115, date: "2025-07-21", time: "2:00 PM",
    outcome: "Existing Client", sentiment: "Negative",
    aiSummary: "Existing client expressing frustration about delayed case update. Called three times this week. Escalation risk.",
    keywords: ["complaint", "delayed", "no response", "escalation"],
    source: "Direct", handled: true, followUpRequired: true,
  },
  {
    id: "call-008", client: "Lakeview Orthodontics", caller: "Parent Inquiry", callerPhone: "(555) 890-3341",
    direction: "Inbound", duration: "6:30", durationSeconds: 390, date: "2025-07-20", time: "9:00 AM",
    outcome: "Lead", sentiment: "Positive",
    aiSummary: "Parent calling about braces for a 12-year-old. Asked about payment plans, treatment duration, and first consultation process. Strong lead.",
    keywords: ["braces", "payment plan", "consultation", "child orthodontics"],
    source: "Meta Ads", campaign: "Lakeview Ortho — Family", handled: true, followUpRequired: true,
  },
];

function KpiCard({ label, value, icon, color, sub }: { label: string; value: number | string; icon: string; color: string; sub?: string }) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--rtm-text-secondary)" }}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{sub}</div>}
    </div>
  );
}

export default function CallIntelligencePage() {
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState<CallOutcome | "All">("All");
  const [clientFilter, setClientFilter] = useState("All");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);

  const clients = ["All", ...Array.from(new Set(CALLS.map(c => c.client)))];

  const filtered = CALLS.filter(c => {
    if (outcomeFilter !== "All" && c.outcome !== outcomeFilter) return false;
    if (clientFilter !== "All" && c.client !== clientFilter) return false;
    if (search && !c.caller.toLowerCase().includes(search.toLowerCase()) && !c.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpis = {
    totalCalls: CALLS.length,
    leads: CALLS.filter(c => c.outcome === "Lead").length,
    followUp: CALLS.filter(c => c.followUpRequired && !c.handled).length,
    positive: CALLS.filter(c => c.sentiment === "Positive").length,
    negative: CALLS.filter(c => c.sentiment === "Negative").length,
    avgDuration: Math.round(CALLS.reduce((s, c) => s + c.durationSeconds, 0) / CALLS.length),
  };

  const avgMin = Math.floor(kpis.avgDuration / 60);
  const avgSec = kpis.avgDuration % 60;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1400px] mx-auto">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">📞</span>
                <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>Call Intelligence</h1>
              </div>
              <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                AI-analyzed call recordings, lead scoring, sentiment analysis, and follow-up tracking across all client campaigns.
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                ⬇️ Export Calls
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-[1400px] mx-auto w-full">
        {/* KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          <KpiCard label="Total Calls" value={kpis.totalCalls} icon="📞" color="var(--rtm-blue)" />
          <KpiCard label="Leads Generated" value={kpis.leads} icon="🎯" color="#059669" sub={`${Math.round(kpis.leads / kpis.totalCalls * 100)}% conversion`} />
          <KpiCard label="Follow-Up Needed" value={kpis.followUp} icon="⚠️" color="#DC2626" />
          <KpiCard label="Positive Sentiment" value={kpis.positive} icon="😊" color="#059669" />
          <KpiCard label="Negative Sentiment" value={kpis.negative} icon="😞" color="#DC2626" />
          <KpiCard label="Avg Duration" value={`${avgMin}:${String(avgSec).padStart(2, "0")}`} icon="⏱️" color="#7C3AED" />
        </div>

        <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl mb-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <div className="flex-1 min-w-[200px] relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--rtm-text-muted)" }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by caller or client..." className="w-full pl-9 pr-3 py-2 rounded-lg text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }} />
          </div>
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
            {clients.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value as CallOutcome | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
            {(["All", "Lead", "Existing Client", "Wrong Number", "Spam", "Voicemail", "No Answer"] as (CallOutcome | "All")[]).map(o => <option key={o}>{o}</option>)}
          </select>
          <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>{filtered.length} calls</span>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Call List */}
          <div className="xl:col-span-2 rounded-xl overflow-hidden" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)" }}>
                    {["Caller", "Client", "Date / Time", "Duration", "Source", "Outcome", "Sentiment", "Follow-Up"].map(col => (
                      <th key={col} className="px-3 py-3 text-left text-[11px] font-black uppercase tracking-wider" style={{ color: "var(--rtm-text-secondary)" }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((call, i) => {
                    const oc = OUTCOME_CFG[call.outcome];
                    const sc = SENTIMENT_CFG[call.sentiment];
                    return (
                      <tr key={call.id} onClick={() => setSelectedCall(call)} className="hover:bg-blue-50/30 transition-colors cursor-pointer" style={{ borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)" : "none", background: selectedCall?.id === call.id ? "rgba(59,110,245,0.05)" : undefined }}>
                        <td className="px-3 py-3">
                          <div className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{call.caller}</div>
                          <div className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{call.callerPhone}</div>
                        </td>
                        <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{call.client}</td>
                        <td className="px-3 py-3">
                          <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{call.date}</div>
                          <div className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>{call.time}</div>
                        </td>
                        <td className="px-3 py-3 text-xs font-mono font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{call.duration}</td>
                        <td className="px-3 py-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{call.source}</td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap" style={{ background: oc.bg, color: oc.color, borderColor: oc.border }}>
                            {call.outcome}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="text-base" title={call.sentiment}>{sc.icon}</span>
                        </td>
                        <td className="px-3 py-3">
                          {call.followUpRequired && !call.handled ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>⚠️ Needed</span>
                          ) : call.followUpRequired ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-full font-bold" style={{ background: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>Pending</span>
                          ) : (
                            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Call Detail Panel */}
          <div>
            {selectedCall ? (
              <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>{selectedCall.caller}</div>
                    <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{selectedCall.callerPhone}</div>
                  </div>
                  <button onClick={() => setSelectedCall(null)} className="p-1 rounded hover:bg-gray-100" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Client", value: selectedCall.client },
                    { label: "Date", value: `${selectedCall.date} ${selectedCall.time}` },
                    { label: "Duration", value: selectedCall.duration },
                    { label: "Direction", value: selectedCall.direction },
                    { label: "Source", value: selectedCall.source },
                    { label: "Campaign", value: selectedCall.campaign ?? "Direct" },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg p-2" style={{ background: "var(--rtm-bg)" }}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</div>
                      <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border" style={{ background: OUTCOME_CFG[selectedCall.outcome].bg, color: OUTCOME_CFG[selectedCall.outcome].color, borderColor: OUTCOME_CFG[selectedCall.outcome].border }}>{selectedCall.outcome}</span>
                  <span className="text-base">{SENTIMENT_CFG[selectedCall.sentiment].icon}</span>
                  <span className="text-xs font-semibold" style={{ color: SENTIMENT_CFG[selectedCall.sentiment].color }}>{selectedCall.sentiment}</span>
                </div>

                <div className="rounded-lg p-3" style={{ background: "#ECFEFF", border: "1px solid #A5F3FC" }}>
                  <div className="text-[10px] font-bold uppercase tracking-wide mb-1.5" style={{ color: "#0E7490" }}>🤖 AI Call Summary</div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-primary)" }}>{selectedCall.aiSummary}</p>
                </div>

                {selectedCall.keywords.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--rtm-text-muted)" }}>Keywords Detected</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedCall.keywords.map(k => (
                        <span key={k} className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>{k}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedCall.followUpRequired && (
                  <button className="w-full py-2 rounded-lg text-sm font-bold text-white" style={{ background: "#DC2626" }}>
                    ⚠️ Log Follow-Up Action
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-xl p-8 text-center" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <div className="text-4xl mb-3">📞</div>
                <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>Select a call to view AI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
