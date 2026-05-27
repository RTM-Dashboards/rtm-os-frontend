import type { ClientProfile } from "@/lib/mock/clients";

export default function NotesTab({ client }: { client: ClientProfile }) {
  return (
    <div className="space-y-5">
      {/* Account notes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Account Notes</h3>
          <p className="text-xs text-slate-500 mt-0.5">Client-facing notes and account context</p>
        </div>
        <div className="p-5">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {client.notes}
          </p>
        </div>
      </div>

      {/* Internal notes */}
      {client.internalNotes && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-amber-800/40">
          <div className="px-5 py-4 border-b border-amber-100 dark:border-amber-800/30">
            <div className="flex items-center gap-2">
              <span className="text-amber-500">🔒</span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Internal Notes</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium">
                Internal Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Not visible to clients</p>
          </div>
          <div className="p-5 bg-amber-50/30 dark:bg-amber-900/5">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {client.internalNotes}
            </p>
          </div>
        </div>
      )}

      {/* Onboarding notes */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Onboarding Notes</h3>
              {client.onboardedDate && (
                <p className="text-xs text-slate-500 mt-0.5">
                  Onboarded {new Date(client.onboardedDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              )}
            </div>
            {client.onboardingNotesUrl && (
              <a
                href={client.onboardingNotesUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex-shrink-0"
              >
                Open full doc →
              </a>
            )}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${
              client.onboardingStage === "completed"
                ? "bg-emerald-500"
                : client.onboardingStage === "in_progress"
                ? "bg-blue-500"
                : "bg-slate-300"
            }`} />
            <div>
              <span className={`inline-block text-xs font-semibold uppercase tracking-wide mb-2 ${
                client.onboardingStage === "completed"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : client.onboardingStage === "in_progress"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-500"
              }`}>
                {client.onboardingStage === "completed" ? "Onboarding Complete" : client.onboardingStage === "in_progress" ? "Onboarding In Progress" : "Onboarding Pending"}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {client.onboardingNotes}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Teamwork legacy reference */}
      {client.teamworkProjectUrl && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Historical Reference</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                Legacy
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Legacy Teamwork project link — for historical reference only</p>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                  {client.teamworkProjectName}
                </p>
                <p className="text-xs text-slate-400 truncate">{client.teamworkProjectUrl}</p>
              </div>
              <a
                href={client.teamworkProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex-shrink-0 hover:underline"
              >
                Open →
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
