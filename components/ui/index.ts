// RTM OS — UI Component Library Index
// All shared UI primitives. Import from "@/components/ui".

export { default as KpiCard } from "./KpiCard";
export type { KpiCardProps, KpiTrend, KpiRisk } from "./KpiCard";

export { default as StatusBadge } from "./StatusBadge";
export type { StatusVariant } from "./StatusBadge";

export { default as DataTable } from "./DataTable";
export type { Column, BulkAction, TableFilter } from "./DataTable";

export { default as PageHeader } from "./PageHeader";
export type { BreadcrumbItem, QuickFilter } from "./PageHeader";

export { default as EmptyState } from "./EmptyState";
export { default as LoadingState } from "./LoadingState";
export { default as SectionWrapper } from "./SectionWrapper";
export { default as MiniSparkline } from "./MiniSparkline";
export { default as BarChart } from "./BarChart";
export { default as DonutChart } from "./DonutChart";
export { default as ActivityFeed } from "./ActivityFeed";
export type { ActivityItem } from "./ActivityFeed";
export { default as AlertBanner } from "./AlertBanner";
export type { AlertItem, AlertSeverity } from "./AlertBanner";
export { default as ProgressBar } from "./ProgressBar";
export { default as QuickActions } from "./QuickActions";
export type { QuickAction } from "./QuickActions";
export { default as TeamWidget } from "./TeamWidget";
export type { TeamMember } from "./TeamWidget";
export { default as MetricRow } from "./MetricRow";
export { default as CampaignCard } from "./CampaignCard";
export type { Campaign } from "./CampaignCard";

// ── New standardized components ──────────────────────────────────────────────

/** Detail drawer — common pattern for all modules */
export { default as DetailDrawer } from "./DetailDrawer";
export type { DetailDrawerProps, DrawerTab, DrawerTabId } from "./DetailDrawer";

/** Action buttons — standardized set (View, Edit, Archive, Delete, etc.) */
export { default as ActionButton } from "./ActionButton";
export {
  ViewButton,
  EditButton,
  ArchiveButton,
  DeleteButton,
  AssignButton,
  ApproveButton,
  RejectButton,
  GenerateButton,
  ExportButton,
} from "./ActionButton";
export type { ActionButtonProps, ActionVariant, ActionSize } from "./ActionButton";

/** Notification toasts — standardized across all modules */
export { NotificationProvider, useNotifications } from "./NotificationToast";
export type { Toast, NotificationType } from "./NotificationToast";

/** AI Summary — consistent layout for all summary types */
export { default as AISummary } from "./AISummary";
export type { AISummaryProps, AISummaryKind, AIInsightItem, AIHealth, AIUrgency } from "./AISummary";

/** Form fields — input, textarea, select, multi-select, date, actions */
export { TextInput, Textarea, Select, MultiSelect, DatePicker, FormActions } from "./FormField";
export type { TextInputProps, TextareaProps, SelectProps, SelectOption, MultiSelectProps, DatePickerProps } from "./FormField";

/** Dashboard shell — standard layout for all dashboards */
export { default as DashboardShell } from "./DashboardShell";
