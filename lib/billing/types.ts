// ─── Billing Dashboard Types ───────────────────────────────────────────────

export type CampaignStatus = "active" | "paused" | "pending" | "cancelled";
export type BillingStatus = "current" | "past_due" | "overdue" | "pending" | "cancelled";
export type InvoiceStatus = "paid" | "pending" | "overdue" | "draft" | "void";
export type RiskLevel = "low" | "medium" | "high" | "critical";
export type RenewalStatus = "on_track" | "at_risk" | "renewed" | "churned" | "pending";

export interface ActiveCampaign extends Record<string, unknown> {
  id: string;
  client: string;
  services: string[];
  monthlyRevenue: number;
  campaignStatus: CampaignStatus;
  billingStatus: BillingStatus;
  startDate: string;
  renewalDate: string;
  assignedAM: string;
}

export interface Invoice extends Record<string, unknown> {
  id: string;
  invoiceNumber: string;
  client: string;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  startDate: string;
}

export interface OverdueAccount extends Record<string, unknown> {
  id: string;
  client: string;
  daysOverdue: number;
  amount: number;
  riskLevel: RiskLevel;
  startDate: string;
}

export interface RenewalQueueItem extends Record<string, unknown> {
  id: string;
  client: string;
  renewalDate: string;
  contractValue: number;
  startDate: string;
  assignedAM: string;
  status: RenewalStatus;
}

export interface BillingKPIs {
  mrr: number;
  mrrTrend: number;
  outstandingInvoices: number;
  outstandingCount: number;
  overdueAccounts: number;
  overdueCount: number;
  upcomingRenewals: number;
  renewalCount: number;
  collectedThisMonth: number;
  collectedTrend: number;
}
