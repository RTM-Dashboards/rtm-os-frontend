const kpis = [
  ["Total Open Tasks", "48"],
  ["My Tasks", "12"],
  ["Team Tasks", "31"],
  ["Overdue Tasks", "6"],
  ["Blocked Tasks", "4"],
  ["Waiting For Client", "9"],
  ["Waiting For Department", "7"],
  ["Completed This Week", "18"],
];

const tasks = [
  ["SEO setup checklist", "Pinnacle HVAC", "SEO & Local", "SEO", "Department Launch", "Sarah Chen", "High", "Jun 12", "In Progress", "No"],
  ["GBP access request", "Summit Landscaping", "GBP", "GBP", "Onboarding", "James Rivera", "Medium", "Jun 10", "Waiting For Client", "Yes"],
  ["Meta campaign QA", "NorthStar Dental", "Paid Advertising", "Meta Ads", "Service Activation", "Maria Santos", "High", "Jun 9", "Ready For Review", "No"],
  ["Monthly report draft", "Radiance MedSpa", "Reporting", "Reporting", "Reporting", "Tina Webb", "Low", "Jun 15", "Not Started", "No"],
];

const handoffs = [
  ["AM", "SEO", "Pinnacle HVAC", "SEO launch package", "Client intake complete. Waiting on GSC access.", "In Progress", "Jun 12"],
  ["SEO", "Content", "Summit Landscaping", "Blog content brief", "Target keywords approved.", "Waiting", "Jun 14"],
  ["Paid Ads", "Reporting", "NorthStar Dental", "Campaign summary", "Meta launch complete. Need first-week metrics.", "Ready", "Jun 16"],
];

export default function CentralizedTasksPage() {
  return (
    <main className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Account Management</p>
        <h1 className="text-2xl font-bold text-slate-900">Centralized Tasks</h1>
        <p className="text-sm text-slate-500">
          Shared cross-workspace task hub for onboarding, service activation, department deliverables, audits, reporting, and client requests.
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

      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Task Filters</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          {["Client", "Department", "Service", "Assigned User", "Status", "Priority", "Due Date", "Task Source"].map((filter) => (
            <div key={filter} className="rounded-xl border bg-slate-50 px-3 py-2 text-sm text-slate-500">
              {filter}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-slate-900">Centralized Task Table</h2>
          <p className="text-sm text-slate-500">Tasks shared across Account Management and department workspaces.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["Task", "Client", "Department", "Service", "Source", "Owner", "Priority", "Due", "Status", "Blocker"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tasks.map((row) => (
                <tr key={row[0]} className="border-t">
                  {row.map((cell, index) => (
                    <td key={`${row[0]}-${index}`} className="px-4 py-3 text-slate-700">
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
          <h2 className="text-lg font-bold text-slate-900">Task Detail Panel</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p><strong>Task:</strong> SEO setup checklist</p>
            <p><strong>Client:</strong> Pinnacle HVAC</p>
            <p><strong>Owner:</strong> Sarah Chen</p>
            <p><strong>Dependencies:</strong> GSC access, GBP access, intake notes</p>
            <p><strong>Blockers:</strong> Waiting for Search Console access</p>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Task Comments & Notes</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>SEO updated status to In Progress.</p>
            <p>AM added note: client will send access by Friday.</p>
            <p>Reporting requested performance summary once setup is complete.</p>
            <div className="mt-4 rounded-xl border bg-slate-50 p-3 text-slate-500">Add internal comment...</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-bold text-slate-900">Department Handoff Section</h2>
          <p className="text-sm text-slate-500">Cross-workspace task handoffs and coordination.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["From", "To", "Client", "Task", "Handoff Notes", "Status", "Due Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {handoffs.map((row) => (
                <tr key={row[3]} className="border-t">
                  {row.map((cell, index) => (
                    <td key={`${row[3]}-${index}`} className="px-4 py-3 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {["Add Task", "Assign Task", "Update Status", "Add Comment", "Escalate Blocker", "Mark Ready For Review", "Mark Complete"].map((action) => (
            <button key={action} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
              {action}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
