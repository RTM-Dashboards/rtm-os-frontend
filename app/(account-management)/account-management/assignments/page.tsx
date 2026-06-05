const kpis = [
  ["Total Account Managers", "6"],
  ["Unassigned Clients", "4"],
  ["New Clients Awaiting Assignment", "7"],
  ["Avg Accounts / AM", "14"],
  ["Overloaded AMs", "1"],
  ["Underutilized AMs", "2"],
  ["Reassignment Requests", "3"],
  ["At-Risk Accounts", "5"],
];

const clients = [
  ["Pinnacle HVAC Solutions", "Home Services", "SEO, GBP, Google Ads", "$4,500/mo", "Payment Confirmed", "Ready for AM", "Sarah Chen"],
  ["NorthStar Dental", "Healthcare", "Meta Ads, Reporting", "$3,200/mo", "Current", "Intake Pending", "Maria Santos"],
  ["Summit Landscaping", "Home Services", "SEO, LSA", "$2,800/mo", "Payment Confirmed", "Ready for AM", "James Rivera"],
];

const managers = [
  ["Sarah Chen", "12", "1", "2", "1", "3", "4", "72%", "Balanced"],
  ["Maria Santos", "16", "3", "4", "3", "6", "7", "91%", "Overloaded"],
  ["James Rivera", "9", "0", "1", "0", "2", "2", "48%", "Available"],
];

export default function AccountAssignmentsPage() {
  return (
    <main className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Account Assignments</h1>
        <p className="text-sm text-slate-500">
          Manage client assignment, AM workload balancing, and reassignment workflows.
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
        <h2 className="text-lg font-bold text-slate-900">Auto Assignment Recommendation</h2>
        <p className="mt-2 text-sm text-slate-600">
          Sarah Chen is recommended for Pinnacle HVAC Solutions based on balanced workload, home services experience,
          low delayed deliverables, and available onboarding capacity.
        </p>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-slate-900">Client Assignment Queue</h2>
          <p className="text-sm text-slate-500">New and active clients requiring AM assignment.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Client", "Industry", "Services", "Contract", "Billing", "Onboarding", "Recommended AM", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
             {clients.map((row) => (
  <tr key={row[0]} className="border-t">
    {row.map((cell, index) => (
      <td key={`${row[0]}-${index}`} className="px-4 py-3 text-slate-700">
        {cell}
      </td>
    ))}
    <td className="px-4 py-3">
      <button className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
        Assign
      </button>
    </td>
  </tr>
))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-slate-900">Account Manager Workload</h2>
          <p className="text-sm text-slate-500">Capacity scoring for assignment balancing.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["AM", "Active Clients", "Onboarding", "At Risk", "Delayed", "Reports Due", "Check-ins Due", "Capacity", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
           <tbody>
  {managers.map((row) => (
    <tr key={row[0]} className="border-t">
      {row.map((cell, index) => (
        <td key={`manager-${row[0]}-${index}`} className="px-4 py-3 text-slate-700">
          {cell}
        </td>
      ))}
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Manual Reassignment</h2>
          <div className="mt-4 grid gap-3">
            {["Select Client", "Current AM", "New AM", "Reason for Reassignment", "Effective Date"].map((field) => (
              <div key={field}>
                <label className="text-xs font-semibold uppercase text-slate-500">{field}</label>
                <div className="mt-1 rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-500">Mock input</div>
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500">Handoff Notes</label>
              <div className="mt-1 h-24 rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-500">Mock notes area</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Assignment History</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Apex Roofing moved from Maria Santos to Sarah Chen — Workload Balance — Jun 3, 2026</p>
            <p>Harbor Auto assigned to James Rivera — Industry Expertise — Jun 1, 2026</p>
            <p>Radiance MedSpa assigned to Tina Webb — Client Fit — May 29, 2026</p>
          </div>
        </div>
      </section>
    </main>
  );
}
