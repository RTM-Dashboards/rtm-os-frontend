"use client";

import { useState } from "react";

type ReportType = "Monthly SEO" | "Monthly PPC" | "Monthly Meta Ads" | "Monthly LSA" | "Monthly GBP" | "Monthly Yelp" | "QBR" | "Full Service" | "Executive Summary" | "Project Completion" | "Custom";
type DeliveryMethod = "Email" | "Portal" | "Download" | "Auto-Schedule";
type GenerateStep = "configure" | "preview" | "generate";

const REPORT_TYPES: ReportType[] = [
  "Monthly SEO", "Monthly PPC", "Monthly Meta Ads", "Monthly LSA",
  "Monthly GBP", "Monthly Yelp", "QBR", "Full Service",
  "Executive Summary", "Project Completion", "Custom",
];

const CLIENTS = [
  "Horizon Dental", "Maple Ridge Clinic", "Summit Auto Group",
  "Prestige Law Group", "Lakeview Orthodontics", "BlueSky Roofing",
  "National MedGroup", "GreenLeaf HVAC", "Clearwater Spa",
];

const TEMPLATES: Record<ReportType, { sections: string[]; connections: string[] }> = {
  "Monthly SEO":        { sections: ["Executive Summary", "Organic Traffic", "Keyword Rankings", "Technical Audit", "Backlinks", "Next Month Plan"], connections: ["GA4", "GSC", "AgencyAnalytics"] },
  "Monthly PPC":        { sections: ["Executive Summary", "Campaign Performance", "Ad Group Breakdown", "Quality Score", "Budget Utilization", "Next Month Strategy"], connections: ["Google Ads API", "GA4"] },
  "Monthly Meta Ads":   { sections: ["Executive Summary", "Campaign Overview", "Audience Insights", "Creative Performance", "ROAS", "Recommendations"], connections: ["Meta Business API", "GA4"] },
  "Monthly LSA":        { sections: ["LSA Overview", "Lead Summary", "Budget Utilization", "Lead Quality", "Recommendations"], connections: ["LSA API"] },
  "Monthly GBP":        { sections: ["Profile Performance", "Review Summary", "Post Engagement", "Call Tracking", "Competitor Analysis"], connections: ["GBP API"] },
  "Monthly Yelp":       { sections: ["Yelp Overview", "Review Summary", "Page Views", "Calls", "Recommendations"], connections: ["Yelp API"] },
  "QBR":               { sections: ["Quarter Recap", "KPI Achievement", "Revenue Impact", "Project Status", "Upcoming Goals", "Upsell Opportunities"], connections: ["Internal DB", "AgencyAnalytics", "GA4"] },
  "Full Service":       { sections: ["Executive Summary", "SEO", "PPC", "Meta Ads", "LSA", "GBP", "Overall Health", "Next Month Plan"], connections: ["GA4", "Google Ads API", "Meta Business API", "GBP API"] },
  "Executive Summary":  { sections: ["Portfolio Health", "Revenue Snapshot", "Client Risk", "Department Performance", "Open Blockers"], connections: ["Internal DB"] },
  "Project Completion": { sections: ["Project Overview", "Milestones Achieved", "Deliverables", "Client Feedback", "Next Recommendation"], connections: ["Internal DB"] },
  "Custom":             { sections: ["Custom Section 1", "Custom Section 2"], connections: ["Select connections"] },
};

interface RecentReport {
  id: string;
  name: string;
  client: string;
  type: ReportType;
  generatedBy: string;
  generatedAt: string;
  status: "Sent" | "Draft" | "Failed";
}

const RECENT_REPORTS: RecentReport[] = [
  { id: "r-001", name: "Horizon Dental — Monthly SEO — Jul 2025", client: "Horizon Dental", type: "Monthly SEO", generatedBy: "Aaron Park", generatedAt: "2025-07-22 09:15 AM", status: "Sent" },
  { id: "r-002", name: "Summit Auto Group — Monthly PPC — Jul 2025", client: "Summit Auto Group", type: "Monthly PPC", generatedBy: "Ryan Torres", generatedAt: "2025-07-22 08:45 AM", status: "Sent" },
  { id: "r-003", name: "Prestige Law Group — QBR — Q2 2025", client: "Prestige Law Group", type: "QBR", generatedBy: "Priya Nair", generatedAt: "2025-07-10 10:00 AM", status: "Sent" },
  { id: "r-004", name: "BlueSky Roofing — Monthly Meta Ads — Jul 2025", client: "BlueSky Roofing", type: "Monthly Meta Ads", generatedBy: "Lily Chen", generatedAt: "2025-07-21 02:30 PM", status: "Draft" },
  { id: "r-005", name: "Executive Portfolio Summary — Week 29", client: "All Clients", type: "Executive Summary", generatedBy: "Marcus Webb", generatedAt: "2025-07-21 07:00 AM", status: "Sent" },
  { id: "r-006", name: "GreenLeaf HVAC — Monthly GBP — Jul 2025", client: "GreenLeaf HVAC", type: "Monthly GBP", generatedBy: "Daniel Okonkwo", generatedAt: "2025-07-20 11:00 AM", status: "Failed" },
];

const STATUS_CFG = {
  Sent:   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  Draft:  { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
  Failed: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
};

export default function GenerateReportPage() {
  const [step, setStep] = useState<GenerateStep>("configure");
  const [reportType, setReportType] = useState<ReportType>("Monthly SEO");
  const [client, setClient] = useState(CLIENTS[0]);
  const [period, setPeriod] = useState("July 2025");
  const [delivery, setDelivery] = useState<DeliveryMethod>("Email");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [includeAISummary, setIncludeAISummary] = useState(true);
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const template = TEMPLATES[reportType];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setGenerated(true);
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      <div className="px-6 pt-6 pb-4" style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🗂️</span>
            <h1 className="text-2xl font-black" style={{ color: "var(--rtm-text-primary)" }}>Generate Report</h1>
          </div>
          <p className="text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
            Configure, preview, and generate reports for any client, service, or period.
          </p>
        </div>
      </div>

      <div className="flex-1 px-6 py-5 max-w-[1200px] mx-auto w-full">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Config Panel */}
          <div className="xl:col-span-2 flex flex-col gap-5">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {(["configure", "preview", "generate"] as GenerateStep[]).map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <button onClick={() => { if (step !== "generate" || !generated) setStep(s); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    style={{ background: step === s ? "var(--rtm-blue)" : "var(--rtm-surface)", color: step === s ? "white" : "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)" }}>
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: step === s ? "rgba(255,255,255,0.3)" : "var(--rtm-bg)" }}>{i + 1}</span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                  {i < 2 && <span style={{ color: "var(--rtm-text-muted)" }}>→</span>}
                </div>
              ))}
            </div>

            {step === "configure" && (
              <div className="rounded-xl p-5 flex flex-col gap-5" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <h2 className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>1. Configure Report</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--rtm-text-secondary)" }}>Report Type</label>
                    <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                      {REPORT_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--rtm-text-secondary)" }}>Client</label>
                    <select value={client} onChange={e => setClient(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                      {CLIENTS.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--rtm-text-secondary)" }}>Reporting Period</label>
                    <input value={period} onChange={e => setPeriod(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }} placeholder="e.g. July 2025" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--rtm-text-secondary)" }}>Delivery Method</label>
                    <select value={delivery} onChange={e => setDelivery(e.target.value as DeliveryMethod)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}>
                      {(["Email", "Portal", "Download", "Auto-Schedule"] as DeliveryMethod[]).map(d => <option key={d}>{d}</option>)}
                    </select>
                  </div>
                  {delivery === "Email" && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--rtm-text-secondary)" }}>Recipient Email(s)</label>
                      <input value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} className="w-full rounded-lg px-3 py-2 text-sm border outline-none" style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }} placeholder="client@example.com, am@rtm.com" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Report Options</label>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "ai", label: "Include AI Summary", sub: "Auto-generated insights and recommendations", value: includeAISummary, set: setIncludeAISummary },
                      { id: "exec", label: "Include Executive Summary", sub: "High-level overview for stakeholders", value: includeExecutiveSummary, set: setIncludeExecutiveSummary },
                    ].map(opt => (
                      <label key={opt.id} className="flex items-start gap-3 p-3 rounded-lg cursor-pointer" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
                        <input type="checkbox" checked={opt.value} onChange={e => opt.set(e.target.checked)} className="mt-0.5" />
                        <div>
                          <div className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{opt.label}</div>
                          <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{opt.sub}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setStep("preview")} className="px-5 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "var(--rtm-blue)" }}>
                    Preview Report →
                  </button>
                </div>
              </div>
            )}

            {step === "preview" && (
              <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <h2 className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>2. Preview Report Structure</h2>
                <div className="rounded-lg p-4" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
                  <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: "var(--rtm-text-secondary)" }}>Report: {client} — {reportType} — {period}</div>
                  <div className="flex flex-col gap-2">
                    {template.sections.map((section, i) => (
                      <div key={section} className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border-light)" }}>
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background: "var(--rtm-blue)" }}>{i + 1}</span>
                        <span className="text-sm font-medium" style={{ color: "var(--rtm-text-primary)" }}>{section}</span>
                      </div>
                    ))}
                    {includeAISummary && (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "#F0FDF4", border: "1px solid #A7F3D0" }}>
                        <span className="text-sm">🤖</span>
                        <span className="text-sm font-medium" style={{ color: "#059669" }}>AI Summary & Recommendations</span>
                      </div>
                    )}
                    {includeExecutiveSummary && (
                      <div className="flex items-center gap-3 p-2.5 rounded-lg" style={{ background: "#FEF9C3", border: "1px solid #FDE68A" }}>
                        <span className="text-sm">📊</span>
                        <span className="text-sm font-medium" style={{ color: "#D97706" }}>Executive Summary</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Data Connections</div>
                  <div className="flex flex-wrap gap-1.5">
                    {template.connections.map(c => (
                      <span key={c} className="text-xs px-2 py-1 rounded font-semibold" style={{ background: "#ECFEFF", color: "#0E7490", border: "1px solid #A5F3FC" }}>{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setStep("configure")} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>← Back</button>
                  <button onClick={() => setStep("generate")} className="px-5 py-2 rounded-lg text-sm font-bold text-white" style={{ background: "var(--rtm-blue)" }}>Generate Report →</button>
                </div>
              </div>
            )}

            {step === "generate" && (
              <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
                <h2 className="text-sm font-black" style={{ color: "var(--rtm-text-primary)" }}>3. Generate & Deliver</h2>
                {!generated ? (
                  <>
                    <div className="rounded-lg p-4" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Client", value: client },
                          { label: "Report Type", value: reportType },
                          { label: "Period", value: period },
                          { label: "Delivery", value: delivery },
                          { label: "AI Summary", value: includeAISummary ? "✅ Included" : "❌ Excluded" },
                          { label: "Executive Summary", value: includeExecutiveSummary ? "✅ Included" : "❌ Excluded" },
                        ].map(item => (
                          <div key={item.label}>
                            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</div>
                            <div className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <button onClick={() => setStep("preview")} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>← Back</button>
                      <button onClick={handleGenerate} disabled={generating} className="px-6 py-2 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: generating ? "#64748B" : "#059669" }}>
                        {generating ? "⏳ Generating..." : "🚀 Generate & Send Report"}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-lg font-black mb-1" style={{ color: "#059669" }}>Report Generated Successfully!</h3>
                    <p className="text-sm mb-4" style={{ color: "var(--rtm-text-secondary)" }}>
                      {client} — {reportType} — {period} has been generated and queued for {delivery}.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "var(--rtm-blue)" }}>Download PDF</button>
                      <button onClick={() => { setStep("configure"); setGenerated(false); }} className="px-4 py-2 rounded-lg text-sm font-semibold border" style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>Generate Another</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Reports */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl p-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
              <h3 className="text-sm font-black mb-3" style={{ color: "var(--rtm-text-primary)" }}>Recent Reports</h3>
              <div className="flex flex-col gap-2">
                {RECENT_REPORTS.map(r => {
                  const sc = STATUS_CFG[r.status];
                  return (
                    <div key={r.id} className="rounded-lg p-3" style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)" }}>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold leading-snug" style={{ color: "var(--rtm-text-primary)" }}>{r.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ml-1 border" style={{ background: sc.bg, color: sc.color, borderColor: sc.border }}>{r.status}</span>
                      </div>
                      <div className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{r.generatedBy} · {r.generatedAt}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
