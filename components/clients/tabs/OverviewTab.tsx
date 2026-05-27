import type { ClientProfile } from "@/lib/mock/clients";
import { BillingBadge, CampaignBadge, HealthBadge } from "@/components/clients/ClientStatusBadge";

function InfoRow({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide sm:w-40 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-800 dark:text-slate-200">
        {children ?? value}
      </span>
    </div>
  );
}

export default function OverviewTab({ client }: { client: ClientProfile }) {
  const totalMRR = client.services
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + s.monthlyValue, 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      {/* Company details */}
      <div className="xl:col-span-2 space-y-5">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Company Details</h3>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Company" value={client.companyName} />
            <InfoRow label="Domain">
              <a
                href={`https://${client.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {client.domain}
              </a>
            </InfoRow>
            <InfoRow label="Industry" value={client.industry} />
            <InfoRow label="Location" value={client.location} />
            <InfoRow label="Client Since" value={new Date(client.clientSince).toLocaleDateString("en-US", { month: "long", year: "numeric" })} />
            <InfoRow label="Health Status">
              <HealthBadge status={client.healthStatus} />
            </InfoRow>
          </div>
        </div>

        {/* Team assignment */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Team Assignment</h3>
          </div>
          <div className="px-5 py-1">
            <InfoRow label="Account Manager" value={client.assignedAM} />
            <InfoRow label="Sales Rep" value={client.salesRep} />
            <InfoRow label="Primary Contact" value={client.primaryContact} />
            <InfoRow label="Email">
              <a href={`mailto:${client.primaryEmail}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                {client.primaryEmail}
              </a>
            </InfoRow>
            <InfoRow label="Phone">
              <a href={`tel:${client.primaryPhone}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">
                {client.primaryPhone}
              </a>
            </InfoRow>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account Notes</h3>
          </div>
          <div className="px-5 py-4">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {client.notes}
            </p>
            {client.internalNotes && (
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">
                  Internal Note
                </p>
                <p className="text-sm text-amber-900 dark:text-amber-200 leading-relaxed">
                  {client.internalNotes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar summary */}
      <div className="space-y-5">
        {/* Status snapshot */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Status Snapshot</h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Billing</span>
              <BillingBadge status={client.billingStatus} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Campaign</span>
              <CampaignBadge status={client.campaignStatus} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Health</span>
              <HealthBadge status={client.healthStatus} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">Onboarding</span>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                client.onboardingStage === "completed"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : client.onboardingStage === "in_progress"
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              }`}>
                {client.onboardingStage === "completed" ? "Done" : client.onboardingStage === "in_progress" ? "In Progress" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* MRR */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Revenue</h3>
          </div>
          <div className="p-5">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              ${totalMRR.toLocaleString()}
              <span className="text-sm font-normal text-slate-400 ml-1">/mo</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              MRR from {client.services.filter((s) => s.status === "active").length} active services
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Billing cycle</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 capitalize">{client.billingCycle}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Next billing</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {new Date(client.nextBillingDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Quick Links</h3>
          </div>
          <div className="p-5 space-y-2">
            {client.contracts.map((ct) => (
              <a
                key={ct.id}
                href={ct.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {ct.title}
              </a>
            ))}
            {client.onboardingNotesUrl && (
              <a
                href={client.onboardingNotesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Onboarding Notes
              </a>
            )}
            {client.teamworkProjectUrl && (
              <a
                href={client.teamworkProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:underline"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  Teamwork (legacy)
                  <span className="ml-1 text-xs text-slate-400">historical ref</span>
                </span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
