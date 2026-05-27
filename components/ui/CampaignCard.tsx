import StatusBadge from "./StatusBadge";
import type { StatusVariant } from "./StatusBadge";
import ProgressBar from "./ProgressBar";

export interface Campaign {
  name: string;
  client: string;
  type: string;
  status: StatusVariant;
  statusLabel: string;
  budget?: string;
  spent?: string;
  progress?: number;
  metric?: string;
  metricLabel?: string;
  startDate?: string;
  endDate?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign: c }: CampaignCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700 transition-all">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{c.name}</p>
          <p className="text-xs text-slate-500 truncate">{c.client} · {c.type}</p>
        </div>
        <StatusBadge variant={c.status} label={c.statusLabel} size="sm" />
      </div>
      {c.progress !== undefined && (
        <div className="mb-3">
          <ProgressBar value={c.progress} color={c.status === "success" ? "bg-emerald-500" : "bg-indigo-500"} height={5} />
          <p className="text-xs text-slate-400 mt-1">{c.progress}% complete</p>
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-slate-500">
        {c.budget && <span>Budget: <strong className="text-slate-700 dark:text-slate-300">{c.budget}</strong></span>}
        {c.metric && <span>{c.metricLabel || "Metric"}: <strong className="text-slate-700 dark:text-slate-300">{c.metric}</strong></span>}
      </div>
      {(c.startDate || c.endDate) && (
        <p className="text-xs text-slate-400 mt-1">{c.startDate} → {c.endDate}</p>
      )}
    </div>
  );
}
