const kpis = [
  "Awaiting Payment",
  "Payment Confirmed",
  "Ready For Onboarding",
  "Assigned To AM",
  "Intake In Progress",
  "Service Activation Pending",
  "Department Launch Pending",
  "Onboarding Complete",
  "Delayed Onboardings",
];

const sections = [
  "Onboarding Pipeline",
  "Client Onboarding Intake",
  "Client Onboarding Notes",
  "Asset Collection Center",
  "Service Activation Center",
  "Recommended Service Activations",
  "Department Launch Center",
  "Onboarding Tasks",
  "Client Readiness Score",
];

export default function AccountManagementOnboardingPage() {
  return (
    <main className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
          Account Management
        </p>
        <h1 className="text-2xl font-bold text-slate-900">Client Onboarding</h1>
        <p className="text-sm text-slate-500">
          Manage onboarding from payment confirmation through service activation and department launch.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {kpis.map((item, index) => (
          <div key={item} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">{item}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{index + 2}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Onboarding Pipeline</h2>
        <p className="mt-3 text-sm text-slate-600">
          Closed Won → Billing Review → Awaiting Payment → Payment Confirmed → Ready For Onboarding → Assigned To AM → Intake In Progress → Service Activation → Department Launch → Onboarding Complete
        </p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {sections.slice(1).map((title) => (
          <div key={title} className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              Mock workspace area for {title.toLowerCase()}.
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
