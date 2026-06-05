const kpis = [
  ["Healthy Clients", "18"],
  ["Needs Attention", "7"],
  ["At Risk Clients", "4"],
  ["Critical Clients", "1"],
  ["Average Health Score", "82%"],
  ["Overdue Check-ins", "6"],
  ["Overdue Reports", "3"],
  ["Churn Risk Clients", "5"],
];

const healthRows = [
  ["Apex Roofing", "Sarah Chen", "92", "Current", "Completed", "Sent", "Healthy", "Jun 2", "Jul 2", "Sep 1", "Healthy"],
  ["Pacific Dental", "Maria Santos", "71", "Current", "In Progress", "Due", "Needs Attention", "May 28", "Jun 11", "Dec 1", "Needs Attention"],
  ["Harbor Auto", "Sarah Chen", "48", "Overdue", "Blocked", "Overdue", "Declining", "May 15", "Jun 10", "Jul 11", "At Risk"],
];

const seasonal = [
  ["Pinnacle HVAC", "HVAC", "Phoenix", "Summer", "AC demand increasing", "Increase cooling repair campaigns"],
  ["Apex Roofing", "Roofing", "Dallas", "Rainy Season", "Storm repair demand increasing", "Promote storm repair services"],
  ["Radiance MedSpa", "MedSpa", "Los Angeles", "Summer", "LHR demand rising", "Refresh Meta creatives and offers"],
];

export default function ClientHealthPage() {
  return (
    <main className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Client Health</h1>
        <p className="text-sm text-slate-500">
          Monitor health scores, risks, seasonal opportunities, AI insights, and retention signals.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        {kpis.map(([label, value]) => (
          <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Client Health Score Center</h2>
        <p className="mt-2 text-sm text-slate-500">
          Scores are based on payment status, deliverables, reporting, check-ins, performance trend, responsiveness, review sentiment, and department completion.
        </p>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-slate-900">Client Health Table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Client", "AM", "Score", "Payment", "Deliverables", "Reporting", "Trend", "Last Check-in", "Next Check-in", "Renewal", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {healthRows.map((row) => (
                <tr key={row[0]} className="border-t">
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className="px-4 py-3 text-slate-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">AI Client Insights</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Lead volume down 28% — review Paid Ads and SEO campaigns.</p>
            <p>No AM check-in in 30 days — schedule client meeting.</p>
            <p>CPL increased 34% — review targeting and landing page.</p>
            <p>Reports overdue — escalate to Reporting.</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Client Action Center</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {["Schedule Check-in", "Create Task", "Escalate Risk", "Send Report", "Open Renewal Review", "Generate AI Summary"].map((action) => (
              <button key={action} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                {action}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-slate-900">Weather & Seasonal Intelligence</h2>
          <p className="text-sm text-slate-500">Seasonal opportunities and campaign recommendations by client industry.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {seasonal.map((row) => (
                <tr key={row[0]} className="border-t">
                  {row.map((cell, index) => (
                    <td key={`season-${row[0]}-${index}`} className="px-4 py-3 text-slate-700">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">At Risk Client Center</h2>
          <p className="mt-2 text-sm text-slate-600">
            Harbor Auto is at risk due to overdue payment and blocked deliverables. Summit Landscaping has renewal risk due to declining performance.
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Escalation Center</h2>
          <p className="mt-2 text-sm text-slate-600">
            Track payment, deliverable, reporting, communication, and renewal-risk escalations.
          </p>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Future Automation</h2>
        <p className="mt-2 text-sm text-slate-500">
          Prepared for AI risk detection, weather intelligence, health score automation, churn prediction, renewal prediction, billing sync, and department task sync.
        </p>
      </section>
    </main>
  );
}
