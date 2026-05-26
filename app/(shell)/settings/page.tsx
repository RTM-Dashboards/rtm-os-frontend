import { PageHeader, SectionWrapper } from "@/components/ui";

interface SettingRow {
  label: string;
  description: string;
  value: string;
}

const generalSettings: SettingRow[] = [
  { label: "Organization Name", description: "Displayed across the platform", value: "RTM Agency" },
  { label: "Default Time Zone", description: "Used for scheduling and reporting", value: "America/Denver (MST)" },
  { label: "Fiscal Year Start", description: "Used in annual reporting", value: "January 1" },
  { label: "Default Currency", description: "Used in billing and reporting", value: "USD ($)" },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Platform configuration and preferences."
        breadcrumb="Admin"
      />

      <div className="space-y-4">
        <SectionWrapper
          title="General"
          description="Core platform settings"
          actions={
            <button className="text-xs font-medium px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Edit
            </button>
          }
        >
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {generalSettings.map((s) => (
              <li key={s.label} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{s.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.description}</p>
                </div>
                <span className="text-sm text-slate-600 dark:text-slate-300 flex-shrink-0">{s.value}</span>
              </li>
            ))}
          </ul>
        </SectionWrapper>

        <SectionWrapper
          title="Notifications"
          description="Alert and notification preferences"
        >
          <div className="space-y-4">
            {[
              { label: "Email Digests", desc: "Weekly summary sent to all admins", enabled: true },
              { label: "Slack Alerts", desc: "Real-time alerts for critical events", enabled: false },
              { label: "Client Report Reminders", desc: "7 days before report due date", enabled: true },
            ].map((pref) => (
              <div key={pref.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{pref.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pref.desc}</p>
                </div>
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                    pref.enabled ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      pref.enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>

        <SectionWrapper title="Integrations" description="Connected services and APIs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: "Google Analytics", connected: true },
              { name: "Google Search Console", connected: true },
              { name: "Meta Business Suite", connected: true },
              { name: "Slack", connected: false },
              { name: "HubSpot", connected: false },
              { name: "Stripe", connected: false },
            ].map((int) => (
              <div
                key={int.name}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {int.name}
                </span>
                <button
                  className={`text-xs font-medium px-2.5 py-1 rounded-md transition-colors ${
                    int.connected
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {int.connected ? "Connected" : "Connect"}
                </button>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </div>
    </>
  );
}
