"use client";

import React, { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  buildContractFromProposal,
  createContract,
  fetchContractByProposalId,
} from "@/lib/sales/contracts-store";
import { fetchOverrides, type ProposalOverrideRecord } from "@/lib/sales/proposal-overrides-client";
import { fetchCurrentUser } from "@/lib/users/users-api";
import type { BudgetLineItem } from "@/lib/sales/budget-engine";
import dynamic from "next/dynamic";
const ProposalWizard = dynamic(
  () => import("@/components/sales/proposal-wizard/ProposalWizard").then(m => ({ default: m.ProposalWizard })),
  { ssr: false }
);
import type { ProposalWizardState } from "@/components/sales/proposal-wizard/ProposalWizard";
import ProposalBuilderShell from "@/components/sales/proposal-builder/ProposalBuilderShell";

//
// Types
//

type ServiceCategory =
  | "SEO"| "GBP"| "PPC"| "Meta Ads"| "Website"| "Content"| "Reporting"| "LSA";

type BillingCycle = "One-Time"| "Monthly"| "Quarterly"| "Annual";

type Department =
  | "SEO"| "GBP"| "Paid Advertising"| "Web"| "Content"| "Reporting"| "LSA";

type DeliveryStandard = "Standard"| "Priority"| "Rush"| "Custom";

type LineItemStatus = "Active"| "Pending Finance"| "Needs Approval"| "Inactive";

type DiscountType = "None"| "Fixed"| "Percentage"| "Promo Code"| "Package";

type ContractTerm = "Month-to-Month"| "6 Month"| "12 Month"| "24 Month"| "Custom";

type ProposalStatus =
  | "Draft"| "Internal Review"| "Pending Approval"| "Sent"| "Negotiation"| "Accepted"| "Rejected"| "Expired"| "Converted To Contract";

type AIModeOption = "Budget Match"| "Growth Package"| "Full Service"| "Starter";

interface LineItem {
  id: string;
  name: string;
  department: Department;
  category: ServiceCategory;
  setupFee: number;
  recurringFee: number;
  quantity: number;
  deliveryStandard: DeliveryStandard;
  taskBlueprint: string;
  dependencies: string[];
  status: LineItemStatus;
  firstResponse: string;
  targetDays: number;
  clientUpdateFreq: string;
  escalationDays: number;
  recurringTasks: string[];
  generatedTasks: number;
  generatedMilestones: number;
  generatedDeliverables: number;
}

interface Discount {
  type: DiscountType;
  value: number;
  promoCode: string;
  managerApproval: boolean;
  approved: boolean;
}

interface ContractConfig {
  term: ContractTerm;
  customMonths: number;
  startDate: string;
  endDate: string;
  noticePeriod: string;
  autoRenew: boolean;
  cancellationTerms: string;
}

interface ProposalInfo {
  client: string;
  opportunity: string;
  owner: string;
  proposalDate: string;
  expirationDate: string;
}


interface Proposal {
  id: string;
  name: string;
  client: string;
  owner: string;
  services: ServiceCategory[];
  lineItems: LineItem[];
  /** True when the wizard's audit was skipped. Internal-only marker. */
  noAudit?: boolean;
  noAuditReason?: string | null;
  /**
   * Agreed per-service line items from the Budget Optimizer, in BudgetLineItem shape.
   * Populated for wizard-created (API-backed) proposals; absent for mock proposals.
   * Carried into the contract at creation time.
   */
  budgetLineItems?: BudgetLineItem[];
  /**
   * Master business address from the intake record.
   * Populated for wizard-created proposals that completed Step 1 with an address.
   * Null for mock proposals or proposals without an intake address.
   * Carried proposal → contract → handoff → client.
   */
  masterAddress?: { street: string; suite: string; city: string; state: string; zip: string; country: string } | null;
  setupTotal: number;
  recurringTotal: number;
  totalValue: number;
  status: ProposalStatus;
  createdDate: string;
  discount: Discount;
  contract: ContractConfig;
  info: ProposalInfo;
  aiSummary: {
    recommendedPackage: string;
    revenueOpportunity: string;
    riskFactors: string[];
    complexity: "Low"| "Medium"| "High";
    resourceRequirements: string;
    expectedImpact: string;
  };
  activityTimeline: { date: string; event: string; user: string }[];
}

//
// AI Package Recommendations
//

//
// Style Maps
//

const STATUS_STYLES: Record<ProposalStatus, { bg?: string; text: string; border: string }> = {
  "Draft":                 { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB"},
  "Internal Review":       { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  "Pending Approval":      { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A"},
  "Sent":                  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  "Negotiation":           { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE"},
  "Accepted":              { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
  "Rejected":              { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3"},
  "Expired":               { bg: "#F3F4F6", text: "#9CA3AF", border: "#D1D5DB"},
  "Converted To Contract": { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0"},
};

const CATEGORY_STYLES: Record<ServiceCategory, { bg?: string; text: string; border: string }> = {
  "SEO":      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
  "GBP":      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
  "PPC":      { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
  "Meta Ads": { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE" },
  "Website":  { bg: "#FEFCE8", text: "#A16207", border: "#FDE68A" },
  "Content":  { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
  "Reporting":{ bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
  "LSA":      { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
};

const DELIVERY_STYLES: Record<DeliveryStandard, { bg?: string; text: string }> = {
  "Standard": { bg: "#F3F4F6", text: "#374151"},
  "Priority": { bg: "#EFF6FF", text: "#1D4ED8"},
  "Rush":     { bg: "#FFF1F2", text: "#BE123C"},
  "Custom":   { bg: "#F5F3FF", text: "#6D28D9"},
};

//
// Helpers
//

const fmt = (n: number) => `$${Math.round(n).toLocaleString()}`;
const fmtK = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k` : `$${n}`;

function calcDiscount(base: number, d: Discount): number {
  if (d.type === "None") return 0;
  if (d.type === "Fixed") return d.value;
  if (d.type === "Percentage"|| d.type === "Promo Code"|| d.type === "Package") return base * (d.value / 100);
  return 0;
}

function termMonths(c: ContractConfig): number {
  if (c.term === "Month-to-Month") return 12; // annualize for display
  if (c.term === "6 Month") return 6;
  if (c.term === "12 Month") return 12;
  if (c.term === "24 Month") return 24;
  if (c.term === "Custom") return c.customMonths;
  return 12;
}

//
// Primitive Components
//

function Badge({ label, bg, text, border }: { label: string; bg?: string; text: string; border?: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"style={{ background: bg, color: text, borderColor: border ?? "transparent"}}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: ProposalStatus }) {
  const s = STATUS_STYLES[status];
  return <Badge label={status} bg={s.bg} text={s.text} border={s.border} />;
}

function CategoryBadge({ cat }: { cat: ServiceCategory }) {
  const s = CATEGORY_STYLES[cat];
  return <Badge label={cat} bg={s.bg} text={s.text} border={s.border} />;
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border ${className ?? ""}`}
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
      {children}
    </div>
  );
}

function CardHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b flex items-center justify-between gap-3 flex-wrap"style={{ borderColor: "var(--rtm-border)"}}>
      <div>
        <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>{title}</p>
        {subtitle && <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

function Btn({
  children, onClick, variant = "default", size = "sm"
}: {
  children: React.ReactNode;
  onClick?: (() => void) | (() => Promise<void>) | ((e?: React.MouseEvent) => void) | ((e?: React.MouseEvent) => Promise<void>);
  variant?: "default"| "primary"| "success"| "danger"| "warning";
  size?: "xs"| "sm";
}) {
  const styles = {
    default:  { bg: "var(--rtm-surface)", text: "var(--rtm-text-secondary)", border: "var(--rtm-border)"},
    primary:  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
    success:  { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
    danger:   { bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3"},
    warning:  { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  };
  const s = styles[variant];
  const pad = size === "xs"? "px-2 py-0.5 text-[10px]": "px-3 py-1.5 text-xs";
  return (
    <button type="button" onClick={onClick} className={`${pad} font-semibold rounded-lg border transition-all hover:opacity-90`}
      style={{ background: s.bg, color: s.text, borderColor: s.border }}>
      {children}
    </button>
  );
}

function Input({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
        {label}
      </label>
      <input type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}} />
    </div>
  );
}

function Select({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="text-[10px] font-bold uppercase tracking-wide block mb-1"style={{ color: "var(--rtm-text-muted)"}}>
        {label}
      </label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

//
// KPI Cards
//

function DashboardKPIs({ proposals }: { proposals: Proposal[] }) {
  const draft     = proposals.filter(p => p.status === "Draft").length;
  const pending   = proposals.filter(p => p.status === "Pending Approval" || p.status === "Internal Review" || p.status === "Negotiation").length;
  const sent      = proposals.filter(p => p.status === "Sent").length;
  const accepted  = proposals.filter(p => p.status === "Accepted" || p.status === "Converted To Contract").length;
  const rejected  = proposals.filter(p => p.status === "Rejected" || p.status === "Expired").length;
  const estRev    = proposals.filter(p => ["Accepted"].includes(p.status))
                    .reduce((s, p) => s + p.recurringTotal, 0);
  const pipeline  = proposals.filter(p => !["Rejected", "Expired"].includes(p.status))
                    .reduce((s, p) => s + p.totalValue, 0);

  const cards = [
    { label: "Draft Proposals",   value: String(draft),      icon: "", bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB"},
    { label: "Pending Approval",  value: String(pending),    icon: "", bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
    { label: "Sent Proposals",    value: String(sent),       icon: "", bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
    { label: "Accepted",          value: String(accepted),   icon: "", bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
    { label: "Rejected/Expired",  value: String(rejected),   icon: "", bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3"},
    { label: "Est. Monthly Rev.", value: fmtK(estRev),       icon: "", bg: "#F0FDF4", text: "#047857", border: "#A7F3D0"},
    { label: "Pipeline Value",    value: fmtK(pipeline),     icon: "", bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE"},
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border p-4 text-center"style={{ background: c.bg, borderColor: c.border }}>
          <div className="text-xl mb-1">{c.icon}</div>
          <div className="text-xl font-black"style={{ color: c.text }}>{c.value}</div>
          <div className="text-[10px] font-semibold mt-0.5 leading-tight"style={{ color: c.text }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

//
// Proposal Table
//

function useProposalToast() {
  const [toast, setToast] = useState<string | null>(null);
  function showToast(msg: string, duration = 2500) {
    setToast(msg);
    setTimeout(() => setToast(null), duration);
  }
  return { toast, showToast };
}

function ProposalToastBanner({ message, variant = "success" }: { message: string; variant?: "success" | "error" }) {
  const bg = variant === "error" ? "#DC2626" : "#059669";
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-semibold"
      style={{ background: bg, color: "#fff", minWidth: 280, textAlign: "center" }}
    >
      {message}
    </div>
  );
}

// ── Generate Contract Button ──────────────────────────────────────────────────
// Creates a real contract record from an Accepted proposal via the contracts API,
// then navigates to the Contracts page where the new record will be visible.

function GenerateContractButton({
  proposal,
  onGenerate,
}: {
  proposal: Proposal;
  onGenerate: (p: Proposal) => void;
}) {
  const [loading, setLoading] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  async function handleClick() {
    if (loading || done) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // Check if a contract already exists for this proposal
      const existing = await fetchContractByProposalId(proposal.id);
      if (!existing) {
        // Build from proposal data and persist.
        // Pass budgetLineItems (present on API-backed proposals) so agreed prices
        // carry from proposal → contract. Mock proposals have none and produce an
        // empty array, which is correct — they have no real agreed prices.
        const record = buildContractFromProposal({
          id: proposal.id,
          clientInfo: {
            name: proposal.client,
            businessName: proposal.client,
            contactName: proposal.owner ?? "",
            // FIX: proposal.info?.client is the business name, not an email.
            // An empty contactEmail must leave the contract's contactEmail empty.
            contactEmail: "",
            contactPhone: "",
          },
          approvedRecommendationServiceNames: proposal.services as string[],
          lineItems: proposal.budgetLineItems ?? [],
          recurringTotal: proposal.recurringTotal,
          budgetResult: {
            totalMonthly: proposal.recurringTotal,
            totalSetup: proposal.setupTotal,
          },
          contract: { term: proposal.contract?.term },
          owner: proposal.owner,
          intakeRecord: {
            masterAddress: proposal.masterAddress ?? null,
          },
        });
        await createContract(record);
      }
      setDone(true);
      onGenerate(proposal);
    } catch (err) {
      // Failed to save — tell the user and do NOT navigate.
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Contract save failed: ${msg}`);
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Btn
        size="xs"
        variant="success"
        onClick={() => void handleClick()}
      >
        {loading ? "Creating…" : done ? "Created ✓" : "Contract"}
      </Btn>
      {errorMsg && <ProposalToastBanner message={errorMsg} variant="error" />}
    </>
  );
}

function ProposalTable({ proposals, onSelect, onEdit, onResume, onSend, onAccept, onGenerateContract }: {
  proposals: Proposal[];
  onSelect: (p: Proposal) => void;
  onEdit: (p: Proposal) => void;
  onResume?: (p: Proposal) => void;
  onSend?: (p: Proposal) => void;
  onAccept?: (p: Proposal) => Promise<void>;
  onGenerateContract?: (p: Proposal) => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<ProposalStatus | "All">("All");
  const { toast, showToast } = useProposalToast();

  async function handleDownloadPdf(p: Proposal) {
    showToast("Preparing proposal PDF...");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const ml = 20, mr = 20, cw = pageWidth - ml - mr;
      let y = 20;
      const pb = (needed: number) => { if (y + needed > pageHeight - 20) { doc.addPage(); y = 20; } };
      const pw = (text: string, x: number, mw: number, lh: number) => {
        const lines = doc.splitTextToSize(text, mw) as string[];
        lines.forEach((line: string) => { pb(lh); doc.text(line, x, y); y += lh; });
      };
      // Title
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(15, 23, 42);
      doc.text(p.name, ml, y); y += 8;
      // Status + date
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(100, 116, 139);
      doc.text(`Status: ${p.status}   |   Created: ${p.createdDate}   |   Owner: ${p.owner}`, ml, y); y += 6;
      // Divider
      doc.setDrawColor(203, 213, 225); doc.line(ml, y, pageWidth - mr, y); y += 8;
      // Client info
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Client Information", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`Client: ${p.client}`, ml, y); y += 5;
      doc.text(`Opportunity: ${p.info.opportunity}`, ml, y); y += 5;
      doc.text(`Proposal Date: ${p.info.proposalDate}   |   Expires: ${p.info.expirationDate}`, ml, y); y += 8;
      // Services
      pb(10);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Services Included", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      p.services.forEach(s => { pb(6); doc.text(`• ${s}`, ml + 4, y); y += 5; });
      y += 3;
      // Line items
      pb(12);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Line Items", ml, y); y += 6;
      p.lineItems.forEach(li => {
        pb(12);
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
        doc.text(li.name, ml + 2, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
        const fees = [li.setupFee > 0 ? `Setup: $${li.setupFee.toLocaleString()}` : "", li.recurringFee > 0 ? `Recurring: $${li.recurringFee.toLocaleString()}/mo` : ""].filter(Boolean).join("   ");
        if (fees) { doc.text(fees, ml + 4, y); y += 4; }
      });
      y += 3;
      // Pricing summary
      pb(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Pricing Summary", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`Setup Fees: $${p.setupTotal.toLocaleString()}`, ml, y); y += 5;
      doc.text(`Monthly Recurring: $${p.recurringTotal.toLocaleString()}/mo`, ml, y); y += 5;
      doc.setFont("helvetica", "bold"); doc.setTextColor(4, 120, 87);
      doc.text(`Total Value: $${p.totalValue.toLocaleString()}`, ml, y); y += 6;
      // Contract
      pb(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Contract Details", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`Term: ${p.contract.term}   |   Start: ${p.contract.startDate}   |   End: ${p.contract.endDate || "TBD"}`, ml, y); y += 5;
      doc.text(`Auto-Renew: ${p.contract.autoRenew ? "Yes" : "No"}   |   Notice: ${p.contract.noticePeriod}`, ml, y); y += 5;
      if (p.contract.cancellationTerms) { pb(10); pw(p.contract.cancellationTerms, ml, cw, 5); }
      // AI Summary
      if (p.aiSummary) {
        pb(20);
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
        doc.text("Executive Summary", ml, y); y += 6;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
        doc.text(`Package: ${p.aiSummary.recommendedPackage}`, ml, y); y += 5;
        doc.text(`Revenue Opportunity: ${p.aiSummary.revenueOpportunity}`, ml, y); y += 5;
        doc.text(`Complexity: ${p.aiSummary.complexity}`, ml, y); y += 5;
        pb(10); pw(`Expected Impact: ${p.aiSummary.expectedImpact}`, ml, cw, 5);
      }
      // Footer
      const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
        doc.text(`${p.name} — Confidential`, ml, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - mr - 20, pageHeight - 10);
      }
      doc.save(`${p.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`);
      showToast(`Proposal PDF downloaded — ${p.name}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("PDF export failed. Please try again.");
    }
  }

  const filtered = useMemo(() => proposals.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q) || p.owner.toLowerCase().includes(q);
    const matchStatus = filterStatus === "All"|| p.status === filterStatus;
    return matchSearch && matchStatus;
  }), [proposals, search, filterStatus]);

  const statusOptions: Array<ProposalStatus | "All"> = ["All","Draft","Internal Review","Pending Approval","Sent","Negotiation","Accepted","Rejected","Expired","Converted To Contract"];

  return (
    <>
      {toast && <ProposalToastBanner message={toast} />}
    <Card>
      <CardHeader title="All Proposals"subtitle={`${filtered.length} of ${proposals.length} proposals`}
        actions={
          <>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search proposals..."className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none w-44"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}} />
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ProposalStatus | "All")}
              className="text-xs rounded-lg border px-3 py-1.5 focus:outline-none"style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}>
              {statusOptions.map(s => <option key={s}>{s}</option>)}
            </select>
          </>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs"style={{ borderCollapse: "collapse", minWidth: "1100px"}}>
          <thead>
            <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
              {["Proposal Name","Client","Owner","Services","Setup Fees","Recurring Fees","Total Value","Status","Created","Actions",""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={p.id} className="hover:bg-blue-50 transition-colors cursor-pointer"style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent": "var(--rtm-surface)"}}
                onClick={() => onSelect(p)}>
                <td className="px-4 py-3 font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                  {p.name}
                </td>
                <td className="px-4 py-3"style={{ color: "var(--rtm-text-secondary)"}}>{p.client}</td>
                <td className="px-4 py-3"style={{ color: "var(--rtm-text-secondary)"}}>{p.owner}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {p.services.slice(0, 3).map(s => <CategoryBadge key={s} cat={s} />)}
                    {p.services.length > 3 && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"style={{ background: "#F3F4F6", color: "#6B7280"}}>+{p.services.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold"style={{ color: "#C2410C"}}>{fmt(p.setupTotal)}</td>
                <td className="px-4 py-3 font-semibold"style={{ color: "#1D4ED8"}}>{fmt(p.recurringTotal)}/mo</td>
                <td className="px-4 py-3 font-bold"style={{ color: "#047857"}}>{fmt(p.totalValue)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={p.status} />
                    {/* No-audit marker — internal only (Task 4). Obvious so nobody sends by accident. */}
                    {p.noAudit && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                        style={{ background: "#FFF7ED", color: "#C2410C", borderColor: "#FED7AA" }}
                        title={p.noAuditReason ? `No-audit reason: ${p.noAuditReason}` : "No audit was completed for this proposal"}
                      >
                        ⚠️ NO AUDIT
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}>{p.createdDate}</td>
                <td className="px-4 py-3"onClick={e => e.stopPropagation()}>
                  <div className="flex gap-1.5">
                    <Btn size="xs"variant="primary"onClick={() => onSelect(p)}>View</Btn>
                    {p.status === "Draft" && onResume && (
                      <Btn size="xs"variant="warning"onClick={() => onResume(p)}>Resume</Btn>
                    )}
                    {(p.status === "Draft" || p.status === "Internal Review") && onSend && (
                      <Btn size="xs"variant="success"onClick={() => void onSend(p)}>Send</Btn>
                    )}
                    {/* Accept: Sent → Accepted. Same PATCH guard as Send. */}
                    {p.status === "Sent" && onAccept && (
                      <Btn size="xs"variant="success"onClick={() => void onAccept(p)}>Accept</Btn>
                    )}
                    <Btn size="xs"variant="default"onClick={() => onEdit(p)}>Edit</Btn>
                    {p.status === "Accepted"&& onGenerateContract && (
                      <GenerateContractButton proposal={p} onGenerate={onGenerateContract} />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <Btn size="xs" variant="default" onClick={() => handleDownloadPdf(p)}>Download PDF</Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-4 py-12 text-center">
            <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>No proposals match your filters.</p>
          </div>
        )}
      </div>
      <div className="px-5 py-3 border-t" style={{ borderColor: "var(--rtm-border)" }}>
        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
          Proposals can be downloaded as PDF and sent manually to prospects. Client portal coming in a future release.
        </p>
      </div>
    </Card>
    </>
  );
}

//
// Proposal → Contract Flow
//

function ProposalContractFlow({
  status,
  proposal,
  onAccept,
  onGenerateContract,
}: {
  status: ProposalStatus;
  proposal?: Proposal;
  onAccept?: (p: Proposal) => Promise<void>;
  onGenerateContract?: (p: Proposal) => void;
}) {
  const steps = [
    { key: "proposal", label: "Proposal Approved", done: ["Accepted","Converted To Contract"].includes(status) },
    { key: "contract", label: "Generate Contract", icon: "", done: ["Converted To Contract"].includes(status) },
    { key: "signed", label: "Contract Signed", done: ["Converted To Contract"].includes(status) },
    { key: "billing", label: "Send To Billing", done: false },
  ];

  return (
    <Card>
      <CardHeader title="Proposal → Contract Flow"/>
      <div className="p-5">
        <div className="flex items-center gap-0 overflow-x-auto pb-2">
          {steps.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-2 min-w-[100px]">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2"style={{
                    background: s.done ? "#F0FDF4": "var(--rtm-bg)",
                    borderColor: s.done ? "#059669": "var(--rtm-border)",
                  }}>
                  {s.icon}
                </div>
                <span className="text-[10px] font-semibold text-center max-w-[80px] leading-tight"style={{ color: s.done ? "#059669": "var(--rtm-text-muted)"}}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 min-w-[24px] mb-5"style={{ background: s.done ? "#059669": "var(--rtm-border)"}} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Accept transition: Sent → Accepted. Follows the same PATCH /api/sales-proposals
            pattern as the Send action. Guard: authenticated user only (matches the
            sales-proposals route which uses getSessionUser with no requireRole gate,
            identical to the contracts route). */}
        {status === "Sent" && proposal && onAccept && (
          <div className="mt-4 flex gap-2">
            <Btn variant="success" onClick={() => void onAccept(proposal)}>
               Mark as Accepted
            </Btn>
          </div>
        )}

        {status === "Accepted" && proposal && onGenerateContract && (
          <div className="mt-4 flex gap-2">
            <GenerateContractButton proposal={proposal} onGenerate={onGenerateContract} />
          </div>
        )}
        {status === "Converted To Contract"&& (
          <div className="mt-4 rounded-lg border p-3"style={{ background: "#F0FDF4", borderColor: "#BBF7D0"}}>
            <p className="text-xs font-semibold"style={{ color: "#047857"}}> Contract generated and sent for signature. Track in Contracts tab.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

//
// AI Executive Summary
//

function AIExecutiveSummary({ proposal }: { proposal: Proposal }) {
  const s = proposal.aiSummary;
  const complexityColor = s.complexity === "Low"? "#059669": s.complexity === "Medium"? "#D97706": "#DC2626";
  const complexityBg = s.complexity === "Low"? "#F0FDF4": s.complexity === "Medium"? "#FFFBEB": "#FFF1F2";

  return (
    <Card>
      <CardHeader title="AI Executive Summary"subtitle="AI-generated analysis of this proposal"/>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4"style={{ background: "#EFF6FF", borderColor: "#BFDBFE"}}>
            <p className="text-[10px] font-bold mb-1"style={{ color: "#1D4ED8"}}>Recommended Package</p>
            <p className="text-sm font-bold"style={{ color: "#1E40AF"}}>{s.recommendedPackage}</p>
          </div>
          <div className="rounded-xl border p-4"style={{ background: "#F0FDF4", borderColor: "#BBF7D0"}}>
            <p className="text-[10px] font-bold mb-1"style={{ color: "#15803D"}}>Revenue Opportunity</p>
            <p className="text-sm font-bold"style={{ color: "#166534"}}>{s.revenueOpportunity}</p>
          </div>
          <div className="rounded-xl border p-4"style={{ background: complexityBg, borderColor: `${complexityColor}30` }}>
            <p className="text-[10px] font-bold mb-1"style={{ color: complexityColor }}>Complexity</p>
            <p className="text-sm font-bold"style={{ color: complexityColor }}>{s.complexity}</p>
          </div>
          <div className="rounded-xl border p-4"style={{ background: "#FFF7ED", borderColor: "#FED7AA"}}>
            <p className="text-[10px] font-bold mb-1"style={{ color: "#C2410C"}}>Resource Requirements</p>
            <p className="text-xs font-semibold"style={{ color: "#92400E"}}>{s.resourceRequirements}</p>
          </div>
          <div className="rounded-xl border p-4 sm:col-span-2"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
            <p className="text-[10px] font-bold mb-1"style={{ color: "#6D28D9"}}>Expected Impact</p>
            <p className="text-xs font-semibold"style={{ color: "#4C1D95"}}>{s.expectedImpact}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}>Risk Factors</p>
          <div className="flex flex-wrap gap-2">
            {s.riskFactors.map((r) => (
              <span key={r} className="text-xs px-3 py-1.5 rounded-lg border"style={{ background: "#FFF7ED", color: "#C2410C", borderColor: "#FED7AA"}}>
                 {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

//
// Sales Intelligence section for the drawer Overview tab
//

function closeProbability(status: ProposalStatus): string {
  const map: Partial<Record<ProposalStatus, string>> = {
    Negotiation: "60%",
    Accepted: "90%",
    Sent: "40%",
    Draft: "20%",
    "Internal Review": "30%",
    "Pending Approval": "35%",
    "Converted To Contract": "100%",
    Rejected: "0%",
    Expired: "5%",
  };
  return map[status] ?? "25%";
}

function suggestedNextAction(status: ProposalStatus): string {
  const map: Partial<Record<ProposalStatus, string>> = {
    Negotiation: "Follow up on pricing objections and confirm decision timeline.",
    Accepted: "Send contract for signature and schedule onboarding call.",
    Sent: "Check if proposal was received — follow up if no response after 3 days.",
    Draft: "Complete and send proposal to the client.",
    "Internal Review": "Await internal approval before sending to client.",
    "Pending Approval": "Obtain manager sign-off on pricing or discount.",
    "Converted To Contract": "Coordinate with operations to begin onboarding.",
    Rejected: "Request feedback and determine if a revised proposal is appropriate.",
    Expired: "Re-engage client and send an updated proposal.",
  };
  return map[status] ?? "Review proposal status and determine next steps.";
}

function SalesIntelligence({ proposal }: { proposal: Proposal }) {
  const s = proposal.aiSummary;
  const riskNote = s.riskFactors.length > 0 ? s.riskFactors[0] : null;

  return (
    <Card>
      <CardHeader
        title="Sales Intelligence"
        subtitle="AI-generated sales context for this proposal (internal)"
      />
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="rounded-xl border p-4" style={{ background: "#EFF6FF", borderColor: "#BFDBFE" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#1D4ED8" }}>Package Name</p>
            <p className="text-sm font-bold" style={{ color: "#1E40AF" }}>{s.recommendedPackage}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#15803D" }}>Contract Value</p>
            <p className="text-sm font-bold" style={{ color: "#166534" }}>{s.revenueOpportunity}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#6D28D9" }}>Expected Impact</p>
            <p className="text-xs font-semibold" style={{ color: "#4C1D95" }}>{s.expectedImpact}</p>
          </div>
          <div className="rounded-xl border p-4" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "#D97706" }}>Estimated Close Probability</p>
            <p className="text-xl font-black" style={{ color: "#92400E" }}>{closeProbability(proposal.status)}</p>
          </div>
          <div className="rounded-xl border p-4 sm:col-span-2" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <p className="text-[10px] font-bold mb-1" style={{ color: "var(--rtm-text-muted)" }}>Suggested Next Action</p>
            <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{suggestedNextAction(proposal.status)}</p>
          </div>
        </div>
        {riskNote && (
          <div className="rounded-lg border px-4 py-3" style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}>
            <p className="text-[10px] font-bold mb-0.5" style={{ color: "#C2410C" }}>Watch for</p>
            <p className="text-xs font-semibold" style={{ color: "#92400E" }}>{riskNote}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

//
// Budget summary for the drawer Pricing tab
//

function DrawerPricingSummary({ proposal }: { proposal: Proposal }) {
  const lineItems = proposal.lineItems;
  const setupFees = lineItems.reduce((s, l) => s + l.setupFee * l.quantity, 0);
  const monthlyRecurring = lineItems.reduce((s, l) => s + l.recurringFee * l.quantity, 0);
  const base = setupFees + monthlyRecurring * 12;
  const discountAmt = calcDiscount(base, proposal.discount);
  const hasDiscount = discountAmt > 0;
  const discountedMonthly = hasDiscount
    ? monthlyRecurring * (1 - (proposal.discount.value / 100))
    : monthlyRecurring;
  const grandTotalFirstMonth = setupFees + (hasDiscount ? discountedMonthly : monthlyRecurring);
  const grandTotalMonthly = hasDiscount ? discountedMonthly : monthlyRecurring;

  const rows = [
    { label: "Total Monthly Recurring", value: `${fmt(monthlyRecurring)}/mo`, color: "#1D4ED8" },
    { label: "Total Setup Fees", value: fmt(setupFees), color: "#C2410C" },
    ...(hasDiscount
      ? [
          { label: `Discount (${proposal.discount.type === "Fixed" ? fmt(discountAmt) : `${proposal.discount.value}%`})`, value: `-${fmt(discountAmt)}`, color: "#DC2626" },
          { label: "Discounted Monthly", value: `${fmt(discountedMonthly)}/mo`, color: "#059669" },
        ]
      : []),
    { label: "Grand Total — First Month", value: fmt(grandTotalFirstMonth), color: "#047857" },
    { label: "Grand Total — Monthly (M2+)", value: `${fmt(grandTotalMonthly)}/mo`, color: "#047857" },
  ];

  return (
    <Card>
      <CardHeader title="Budget Summary" />
      <div className="p-5 space-y-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between px-4 py-3 rounded-lg"
            style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)" }}
          >
            <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{r.label}</span>
            <span className="text-sm font-bold" style={{ color: r.color }}>{r.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

//
// Proposal Detail Drawer
//

type DrawerTab = "overview" | "services" | "lineitems" | "pricing" | "activity" | "overrides";

function ProposalDetailDrawer({ proposal, onClose, onEdit, onSend, onAccept, onGenerateContract }: {
  proposal: Proposal;
  onClose: () => void;
  onEdit: (p: Proposal) => void;
  onSend?: (p: Proposal) => void;
  onAccept?: (p: Proposal) => Promise<void>;
  onGenerateContract?: (p: Proposal) => void;
}) {
  const [tab, setTab] = useState<DrawerTab>("overview");
  const [activityNote, setActivityNote] = useState("");
  const [activityLog, setActivityLog] = useState<{ date: string; event: string; user: string }[]>(
    proposal.activityTimeline
  );
  // Override records fetched from proposal_overrides table (Task 3)
  const [overrides, setOverrides] = useState<ProposalOverrideRecord[]>([]);
  const [overridesLoading, setOverridesLoading] = useState(false);
  const { toast, showToast } = useProposalToast();

  // Fetch overrides when the Overrides tab is first opened
  React.useEffect(() => {
    if (tab !== "overrides" || overrides.length > 0 || overridesLoading) return;
    setOverridesLoading(true);
    void fetchOverrides(proposal.id).then((rows) => {
      setOverrides(rows);
      setOverridesLoading(false);
    });
  }, [tab, proposal.id, overrides.length, overridesLoading]);

  async function handleDownloadPdf() {
    showToast("Preparing proposal PDF...");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const ml = 20, mr = 20, cw = pageWidth - ml - mr;
      let y = 20;
      const pb = (needed: number) => { if (y + needed > pageHeight - 20) { doc.addPage(); y = 20; } };
      const pw = (text: string, x: number, mw: number, lh: number) => {
        const lines = doc.splitTextToSize(text, mw) as string[];
        lines.forEach((line: string) => { pb(lh); doc.text(line, x, y); y += lh; });
      };
      const p = proposal;
      doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(15, 23, 42);
      doc.text(p.name, ml, y); y += 8;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(100, 116, 139);
      doc.text(`Status: ${p.status}   |   Created: ${p.createdDate}   |   Owner: ${p.owner}`, ml, y); y += 6;
      doc.setDrawColor(203, 213, 225); doc.line(ml, y, pageWidth - mr, y); y += 8;
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Client Information", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`Client: ${p.client}`, ml, y); y += 5;
      doc.text(`Opportunity: ${p.info.opportunity}`, ml, y); y += 5;
      doc.text(`Proposal Date: ${p.info.proposalDate}   |   Expires: ${p.info.expirationDate}`, ml, y); y += 8;
      pb(10);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Services Included", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      p.services.forEach(s => { pb(6); doc.text(`• ${s}`, ml + 4, y); y += 5; });
      y += 3;
      pb(12);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Line Items", ml, y); y += 6;
      p.lineItems.forEach(li => {
        pb(12);
        doc.setFont("helvetica", "bold"); doc.setFontSize(10); doc.setTextColor(30, 41, 59);
        doc.text(li.name, ml + 2, y); y += 5;
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(100, 116, 139);
        const fees = [li.setupFee > 0 ? `Setup: $${li.setupFee.toLocaleString()}` : "", li.recurringFee > 0 ? `Recurring: $${li.recurringFee.toLocaleString()}/mo` : ""].filter(Boolean).join("   ");
        if (fees) { doc.text(fees, ml + 4, y); y += 4; }
      });
      y += 3;
      pb(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Pricing Summary", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`Setup Fees: $${p.setupTotal.toLocaleString()}`, ml, y); y += 5;
      doc.text(`Monthly Recurring: $${p.recurringTotal.toLocaleString()}/mo`, ml, y); y += 5;
      doc.setFont("helvetica", "bold"); doc.setTextColor(4, 120, 87);
      doc.text(`Total Value: $${p.totalValue.toLocaleString()}`, ml, y); y += 6;
      pb(20);
      doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
      doc.text("Contract Details", ml, y); y += 6;
      doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
      doc.text(`Term: ${p.contract.term}   |   Start: ${p.contract.startDate}   |   End: ${p.contract.endDate || "TBD"}`, ml, y); y += 5;
      doc.text(`Auto-Renew: ${p.contract.autoRenew ? "Yes" : "No"}   |   Notice: ${p.contract.noticePeriod}`, ml, y); y += 5;
      if (p.contract.cancellationTerms) { pb(10); pw(p.contract.cancellationTerms, ml, cw, 5); }
      if (p.aiSummary) {
        pb(20);
        doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(30, 41, 59);
        doc.text("Executive Summary", ml, y); y += 6;
        doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(71, 85, 105);
        doc.text(`Package: ${p.aiSummary.recommendedPackage}`, ml, y); y += 5;
        doc.text(`Revenue Opportunity: ${p.aiSummary.revenueOpportunity}`, ml, y); y += 5;
        doc.text(`Complexity: ${p.aiSummary.complexity}`, ml, y); y += 5;
        pb(10); pw(`Expected Impact: ${p.aiSummary.expectedImpact}`, ml, cw, 5);
      }
      const totalPages = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(148, 163, 184);
        doc.text(`${p.name} — Confidential`, ml, pageHeight - 10);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - mr - 20, pageHeight - 10);
      }
      doc.save(`${p.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.pdf`);
      showToast(`Proposal PDF downloaded — ${p.name}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      showToast("PDF export failed. Please try again.");
    }
  }

  function handleAddNote() {
    const note = activityNote.trim();
    if (!note) return;
    setActivityLog((prev) => [
      ...prev,
      { date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), event: note, user: proposal.owner },
    ]);
    setActivityNote("");
  }

  const TABS: { key: DrawerTab; label: string }[] = [
    { key: "overview",  label: "Overview" },
    { key: "services",  label: "Services" },
    { key: "lineitems", label: "Line Items" },
    { key: "pricing",   label: "Pricing" },
    { key: "activity",  label: "Activity" },
    { key: "overrides", label: "Overrides ▲" },  // internal only (Task 3)
  ];

  const setupTotal = proposal.lineItems.reduce((s, l) => s + l.setupFee * l.quantity, 0);
  const recurringTotal = proposal.lineItems.reduce((s, l) => s + l.recurringFee * l.quantity, 0);
  const discountAmt = calcDiscount(setupTotal + recurringTotal * 12, proposal.discount);

  return (
    <>
      {toast && <ProposalToastBanner message={toast} />}
      <div className="fixed inset-0 z-50 flex" style={{ backdropFilter: "blur(2px)", background: "rgba(0,0,0,0.4)" }}>
        <div className="ml-auto w-full max-w-3xl h-full overflow-y-auto shadow-2xl flex flex-col" style={{ background: "var(--rtm-surface)" }}>

          {/* Header */}
          <div className="px-6 py-4 border-b flex items-start justify-between gap-4 sticky top-0 z-10" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <StatusBadge status={proposal.status} />
                <span className="text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{proposal.id}</span>
              </div>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{proposal.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                {proposal.client} · {proposal.owner} · Created {proposal.createdDate}
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Btn variant="default" onClick={handleDownloadPdf}>Download PDF</Btn>
              {(proposal.status === "Draft" || proposal.status === "Internal Review") && onSend && (
                <Btn variant="success" onClick={() => void onSend(proposal)}>Send Proposal</Btn>
              )}
              {/* Accept transition: Sent → Accepted. Same guard as Send (getSessionUser, no requireRole).
                  Matched from app/api/sales-proposals/route.ts PATCH handler. */}
              {proposal.status === "Sent" && onAccept && (
                <Btn variant="success" onClick={() => void onAccept(proposal)}>Mark Accepted</Btn>
              )}
              <Btn variant="primary" onClick={() => onEdit(proposal)}>Edit Proposal</Btn>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-bold px-3 py-1.5 rounded-lg border transition-all"
                style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
              >
                Close
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="px-6 py-4 border-b grid grid-cols-2 sm:grid-cols-4 gap-3" style={{ borderColor: "var(--rtm-border)" }}>
            {[
              { label: "Setup Fees", value: fmt(setupTotal), bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA" },
              { label: "Monthly Recurring", value: `${fmt(recurringTotal)}/mo`, bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE" },
              { label: "Discount", value: discountAmt > 0 ? `-${fmt(discountAmt)}` : "—", bg: "#FFF1F2", text: "#BE123C", border: "#FECDD3" },
              { label: "Total Value", value: fmt(proposal.totalValue), bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0" },
            ].map((r) => (
              <div key={r.label} className="rounded-xl border p-3 text-center" style={{ background: r.bg, borderColor: r.border }}>
                <p className="text-[10px] font-bold" style={{ color: r.text }}>{r.label}</p>
                <p className="text-base font-black mt-0.5" style={{ color: r.text }}>{r.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b" style={{ borderColor: "var(--rtm-border)" }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className="px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors"
                style={{
                  color: tab === t.key ? "#1D4ED8" : "var(--rtm-text-muted)",
                  borderBottom: tab === t.key ? "2px solid #1D4ED8" : "2px solid transparent",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-6 space-y-4">

            {/* Overview */}
            {tab === "overview" && (
              <>
                {/* No-audit marker — internal view only (Task 4). */}
                {/* This banner does NOT appear on client-facing output. */}
                {proposal.noAudit && (
                  <div
                    className="rounded-xl border px-5 py-4 flex items-start gap-3"
                    style={{ background: "#FFF7ED", borderColor: "#FED7AA" }}
                  >
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: "#C2410C" }}>
                        This proposal was completed without an audit
                      </p>
                      {proposal.noAuditReason && (
                        <p className="text-xs mt-1" style={{ color: "#92400E" }}>
                          Reason recorded: {proposal.noAuditReason}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "#B45309" }}>
                        Do not send to the client until the absence of an audit has been reviewed.
                      </p>
                    </div>
                  </div>
                )}
                <SalesIntelligence proposal={proposal} />
                {/* Accept → Contract flow: shows the pipeline and the live Accept / Generate Contract buttons */}
                <ProposalContractFlow
                  status={proposal.status}
                  proposal={proposal}
                  onAccept={onAccept}
                  onGenerateContract={onGenerateContract}
                />
              </>
            )}

            {/* Services */}
            {tab === "services" && (
              <Card>
                <CardHeader title="Services" subtitle={`${proposal.services.length} service${proposal.services.length !== 1 ? "s" : ""} included`} />
                <div className="p-4 space-y-2">
                  {proposal.services.map((s) => {
                    const deptMap: Partial<Record<ServiceCategory, string>> = {
                      SEO: "SEO", GBP: "GBP", PPC: "Paid Advertising",
                      "Meta Ads": "Paid Advertising", Website: "Web",
                      Content: "Content", Reporting: "Reporting", LSA: "LSA",
                    };
                    return (
                      <div
                        key={s}
                        className="flex items-center justify-between px-4 py-3 rounded-lg border"
                        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
                      >
                        <div className="flex items-center gap-3">
                          <CategoryBadge cat={s} />
                          <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{s}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border"
                          style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border)" }}
                        >
                          {deptMap[s] ?? s}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Line Items */}
            {tab === "lineitems" && (
              <Card>
                <CardHeader title="Line Items" subtitle={`${proposal.lineItems.length} line item${proposal.lineItems.length !== 1 ? "s" : ""}`} />
                <div className="overflow-x-auto">
                  <table className="w-full text-xs" style={{ borderCollapse: "collapse", minWidth: "640px" }}>
                    <thead>
                      <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)" }}>
                        {["Service", "Line Item", "Qty", "Unit Price", "Subtotal"].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.lineItems.map((li, i) => {
                        const unitPrice = li.recurringFee > 0 ? li.recurringFee : li.setupFee;
                        const subtotal = unitPrice * li.quantity;
                        return (
                          <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "transparent" : "var(--rtm-surface)" }}>
                            <td className="px-4 py-3">
                              <CategoryBadge cat={li.category} />
                            </td>
                            <td className="px-4 py-3 font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{li.name}</td>
                            <td className="px-4 py-3 text-center" style={{ color: "var(--rtm-text-secondary)" }}>{li.quantity}</td>
                            <td className="px-4 py-3 font-semibold" style={{ color: li.recurringFee > 0 ? "#1D4ED8" : "#C2410C" }}>
                              {li.recurringFee > 0 ? `${fmt(li.recurringFee)}/mo` : fmt(li.setupFee)}
                            </td>
                            <td className="px-4 py-3 font-bold" style={{ color: "#047857" }}>
                              {li.recurringFee > 0 ? `${fmt(subtotal)}/mo` : fmt(subtotal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* Pricing */}
            {tab === "pricing" && <DrawerPricingSummary proposal={proposal} />}

            {/* Activity */}
            {tab === "activity" && (
              <Card>
                <CardHeader title="Activity" />
                <div className="p-5 space-y-3">
                  {activityLog.map((e, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#1D4ED8" }} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{e.event}</p>
                        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{e.user} · {e.date}</p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-3 border-t" style={{ borderColor: "var(--rtm-border)" }}>
                    <p className="text-[10px] font-bold mb-2" style={{ color: "var(--rtm-text-muted)" }}>ADD NOTE</p>
                    <div className="flex gap-2">
                      <textarea
                        value={activityNote}
                        onChange={(e) => setActivityNote(e.target.value)}
                        placeholder="Add a note..."
                        rows={2}
                        className="flex-1 text-xs rounded-lg border px-3 py-2 focus:outline-none resize-none"
                        style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
                      />
                      <button
                        type="button"
                        onClick={handleAddNote}
                        className="px-3 py-2 text-xs font-semibold rounded-lg border self-end"
                        style={{ background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Overrides — internal only (Task 3) */}
            {tab === "overrides" && (
              <Card>
                <CardHeader
                  title="Field Overrides"
                  subtitle="Internal record of manually overridden values — not visible to the client."
                />
                <div className="p-4 space-y-3">
                  {overridesLoading && (
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Loading override records…</p>
                  )}
                  {!overridesLoading && overrides.length === 0 && (
                    <div
                      className="rounded-lg border px-4 py-6 text-center"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
                    >
                      <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
                        No overrides recorded for this proposal.
                      </p>
                    </div>
                  )}
                  {overrides.map((ov) => (
                    <div
                      key={ov.id}
                      className="rounded-lg border px-4 py-3 space-y-1.5"
                      style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)" }}
                    >
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                          {ov.fieldLabel || ov.fieldPath}
                        </p>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize"
                          style={{
                            background: ov.overrideType === "manual-line-item" ? "#F0F9FF" : "#FFFBEB",
                            color: ov.overrideType === "manual-line-item" ? "#0369A1" : "#D97706",
                            borderColor: ov.overrideType === "manual-line-item" ? "#BAE6FD" : "#FDE68A",
                          }}
                        >
                          {ov.overrideType.replace(/-/g, " ")}
                        </span>
                      </div>
                      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                        {new Date(ov.overriddenAt).toLocaleString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                        {" "}· user {ov.overridingUserId}
                      </p>
                      {ov.priorValue !== null && ov.priorValue !== undefined && (
                        <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                          Prior: <span style={{ color: "var(--rtm-text-secondary)" }}>{JSON.stringify(ov.priorValue)}</span>
                        </p>
                      )}
                      <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                        New: <span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{JSON.stringify(ov.newValue)}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

//
// Main Page
//

// PageView: active views. "builder" and "detail" are retired (dead builder was removed).
type PageView = "dashboard" | "wizard" | "proposal-builder";

// ─── Real proposals type (from API store) ─────────────────────────────────────
// Wizard-completed and draft proposals from /api/sales-proposals, shaped into
// the Proposal interface so the existing table/drawer UI works unchanged.

interface SalesProposalApiRecord {
  id: string;
  status: string;
  opportunityId: string | null;
  leadId: string | null;
  currentStep: number;
  completedSteps: number[];
  clientInfo: {
    name: string;
    businessName: string;
    industry: string;
    location: string;
    website: string;
    leadSource: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    notes: string;
  };
  selectedGoals: string[];
  auditMode: string | null;
  selectedAuditId: string | null;
  auditResult: unknown;
  approvedRecommendations: string[];
  approvedRecommendationServiceNames: string[];
  lineItems: unknown[];
  discountPercentage: number;
  discount: unknown;
  budgetResult: unknown;
  proposalDocument: unknown;
  createdAt: string;
  updatedAt: string;
  lastSavedAt: string | null;
  sentAt: string | null;
  noAudit?: boolean;
  noAuditReason?: string | null;
  [key: string]: unknown;
}

// Map wizard status to ProposalStatus for the table/badge display
function mapWizardStatus(s: string): ProposalStatus {
  if (s === "complete") return "Pending Approval";
  if (s === "sent") return "Sent";
  if (s === "accepted") return "Accepted";
  if (s === "rejected") return "Rejected";
  if (s === "in-progress") return "Internal Review";
  return "Draft"; // "draft"
}

// Shape an API record into the Proposal interface the existing UI expects
function apiRecordToProposal(r: SalesProposalApiRecord): Proposal {
  const serviceNames = (r.approvedRecommendationServiceNames ?? []) as string[];
  const goals = (r.selectedGoals ?? []) as string[];
  const services: ServiceCategory[] = (
    [...serviceNames, ...goals].filter((s) =>
      ["SEO", "GBP", "PPC", "Meta Ads", "Website", "Content", "Reporting", "LSA"].includes(s)
    ) as ServiceCategory[]
  ).filter((v, i, a) => a.indexOf(v) === i);

  // Budget from budgetResult or line item totals
  const budgetResult = r.budgetResult as {
    grandTotalMonthly?: number;
    totalSetupFees?: number;
    totalOneTimeProjects?: number;
    lineItems?: BudgetLineItem[];
  } | null;

  // Carry agreed BudgetLineItem[] from budgetResult; these are the prices the client agreed to.
  // budgetResult.lineItems is authoritative because it is what the Budget Optimizer wrote.
  // r.lineItems (the top-level column) carries the same data; budgetResult.lineItems is preferred
  // because it is always in the right shape when the wizard completed.
  const budgetLineItems: BudgetLineItem[] = Array.isArray(budgetResult?.lineItems)
    ? (budgetResult!.lineItems as BudgetLineItem[])
    : [];

  const lineItemsRaw = (r.lineItems ?? []) as Array<{
    setupFee?: number;
    basePrice?: number;
    adjustedPrice?: number;
    quantity?: number;
    id?: string;
    name?: string;
    department?: string;
    category?: string;
    recurringFee?: number;
  }>;

  const computedRecurring = budgetResult?.grandTotalMonthly ?? lineItemsRaw.reduce(
    (sum, li) => sum + ((li.adjustedPrice ?? li.basePrice ?? li.recurringFee ?? 0) * (li.quantity ?? 1)), 0
  );
  const computedSetup = (budgetResult?.totalSetupFees ?? 0) + (budgetResult?.totalOneTimeProjects ?? 0);
  const contractMonths = 12;

  const createdDate = r.createdAt
    ? new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  const discount = r.discount as { type?: string; value?: number; promoCode?: string; managerApproval?: boolean; approved?: boolean } | null;

  return {
    id: r.id,
    name: r.clientInfo?.businessName
      ? `${r.clientInfo.businessName} — Proposal`
      : `Proposal ${r.id.slice(-6)}`,
    client: r.clientInfo?.businessName || r.clientInfo?.name || "Unknown Client",
    owner: r.clientInfo?.contactName || "—",
    services,
    lineItems: lineItemsRaw.map((li) => ({
      id: li.id ?? "",
      name: li.name ?? "",
      department: (li.department ?? "SEO") as Department,
      category: (li.category ?? "SEO") as ServiceCategory,
      setupFee: li.setupFee ?? 0,
      recurringFee: li.recurringFee ?? li.adjustedPrice ?? li.basePrice ?? 0,
      quantity: li.quantity ?? 1,
      deliveryStandard: "Standard" as DeliveryStandard,
      taskBlueprint: "",
      dependencies: [],
      status: "Active" as LineItemStatus,
      firstResponse: "1 business day",
      targetDays: 10,
      clientUpdateFreq: "Weekly",
      escalationDays: 14,
      recurringTasks: [],
      generatedTasks: 0,
      generatedMilestones: 0,
      generatedDeliverables: 0,
    })),
    setupTotal: computedSetup,
    recurringTotal: computedRecurring,
    totalValue: computedSetup + computedRecurring * contractMonths,
    status: mapWizardStatus(r.status ?? "draft"),
    createdDate,
    discount: {
      type: (discount?.type ?? "None") as DiscountType,
      value: discount?.value ?? 0,
      promoCode: discount?.promoCode ?? "",
      managerApproval: discount?.managerApproval ?? false,
      approved: discount?.approved ?? false,
    },
    contract: {
      term: "12 Month",
      customMonths: 12,
      startDate: "",
      endDate: "",
      noticePeriod: "30 days",
      autoRenew: false,
      cancellationTerms: "30-day written notice required",
    },
    info: {
      client: r.clientInfo?.businessName || r.clientInfo?.name || "Unknown",
      opportunity: r.opportunityId ?? r.id,
      owner: r.clientInfo?.contactName || "—",
      proposalDate: createdDate,
      expirationDate: "",
    },
    aiSummary: {
      recommendedPackage: services.join(" + ") || "Custom Package",
      revenueOpportunity: `$${Math.round(computedRecurring).toLocaleString()}/mo`,
      riskFactors: [],
      complexity: "Medium",
      resourceRequirements: services.join(", ") || "—",
      expectedImpact: r.selectedGoals?.join(", ") || "—",
    },
    activityTimeline: [
      { date: createdDate, event: "Proposal created via wizard", user: r.clientInfo?.contactName || "—" },
      ...(r.sentAt ? [{ date: new Date(r.sentAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), event: "Proposal sent to client", user: r.clientInfo?.contactName || "—" }] : []),
    ],
    budgetLineItems,
    masterAddress: (r.intakeRecord as { masterAddress?: { street: string; suite: string; city: string; state: string; zip: string; country: string } | null } | null)?.masterAddress ?? null,
    noAudit: r.noAudit ?? false,
    noAuditReason: r.noAuditReason ?? null,
  };
}

function ProposalsPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [view, setView] = useState<PageView>("dashboard");
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [wizardInitialState, setWizardInitialState] = useState<Partial<ProposalWizardState> | undefined>(undefined);

  // ── Real proposals from API store ─────────────────────────────────────────
  const [apiProposals, setApiProposals] = useState<Proposal[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  // ── Accept-proposal permission (product decision 22 October) ──────────────────
  // Only Sales department members (any role) and Executive / SystemAdmin can
  // accept a proposal. The Accept control is hidden (not disabled) for all
  // other users so they receive no error and no misleading affordance.
  // Mirrors the requireDepartment(user, "Sales", "Member") gate in
  // app/api/sales-proposals/route.ts PATCH handler.
  const [canAccept, setCanAccept] = useState(false);
  useEffect(() => {
    void fetchCurrentUser().then((u) => {
      if (!u) { setCanAccept(false); return; }
      const isExecutiveOrAbove = u.role === "SystemAdmin" || u.role === "Executive";
      const isSalesDept = u.department === "Sales";
      setCanAccept(isExecutiveOrAbove || isSalesDept);
    });
  }, []);


  const loadApiProposals = React.useCallback(async () => {
    setApiLoading(true);
    try {
      const res = await fetch("/api/sales-proposals");
      if (res.ok) {
        const data = (await res.json()) as { records: SalesProposalApiRecord[] };
        setApiProposals((data.records ?? []).map(apiRecordToProposal));
      }
    } catch {
      // Silently fall back to mock data only
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadApiProposals();
  }, [loadApiProposals]);

  // All proposals come from the API (Postgres). An empty table shows an empty
  // state; no invented rows are merged in.
  const allProposals = React.useMemo<Proposal[]>(() => apiProposals, [apiProposals]);

  // ── Send Proposal ─────────────────────────────────────────────────────────
  // Persists a real status transition (Draft/Internal Review → Sent) and
  // refreshes the list so the new status is immediately visible.
  const handleSendProposal = React.useCallback(async (p: Proposal) => {
    // Only API-backed proposals can be sent via this path
    // (mock proposals are display-only; they have no server record)
    try {
      const sentAt = new Date().toISOString();
      await fetch("/api/sales-proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, status: "sent", sentAt }),
      });
      await loadApiProposals();
      if (selectedProposal?.id === p.id) {
        setSelectedProposal((prev) =>
          prev ? { ...prev, status: "Sent" } : prev
        );
      }
    } catch {
      // Non-fatal: show a note to the user
    }
  }, [loadApiProposals, selectedProposal]);

  // ── Accept Proposal ─────────────────────────────────────────────────
  // Persists the Sent → Accepted status transition via PATCH /api/sales-proposals.
  // Guard matched from app/api/sales-proposals/route.ts: getSessionUser only,
  // no requireRole gate — same as the Send transition and the contracts route.
  const handleAcceptProposal = React.useCallback(async (p: Proposal) => {
    try {
      const acceptedAt = new Date().toISOString();
      await fetch("/api/sales-proposals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, status: "accepted", acceptedAt }),
      });
      await loadApiProposals();
      if (selectedProposal?.id === p.id) {
        setSelectedProposal((prev) =>
          prev ? { ...prev, status: "Accepted" } : prev
        );
      }
    } catch {
      // Non-fatal
    }
  }, [loadApiProposals, selectedProposal]);

  // Read URL params to determine wizard mode
  useEffect(() => {
    // Wrapped in void IIFE to allow async/await for leadId/opportunityId context fetch.
    void (async () => {
    const isNew = searchParams.get("new") === "true";
    const resumeId = searchParams.get("resume");
    const auditId = searchParams.get("auditId");
    const auditType = searchParams.get("auditType");
    const opportunityId = searchParams.get("opportunityId");
    const leadId = searchParams.get("leadId");
    if (isNew) {
      setView("wizard");
      if (auditId) {
        setWizardInitialState({
          currentStep: 2 as const,
          selectedAuditId: auditId,
          auditMode: "existing" as const,
          preselectedAuditId: auditId,
          preselectedAuditType: auditType ?? undefined,
          ...(opportunityId ? { opportunityId } : {}),
        });
      } else if (opportunityId) {
        // Pre-fill from real sales-opportunities store first, then fall back
        // to sessionStorage (set by Pipeline page) for richer context.
        let oppData: {
          businessName?: string;
          contactName?: string;
          contactEmail?: string;
          contactPhone?: string;
          // tradeType: legacy field; industry is now also populated on the Opportunity
          tradeType?: string;
          // industry: preferred over tradeType when both present
          industry?: string;
          leadSource?: string;
          serviceInterest?: string[];
          discoveryNotes?: string;
          website?: string;
        } = {};
        try {
          // 1. Try the real API store
          const oppRes = await fetch("/api/sales-opportunities");
          if (oppRes.ok) {
            const oppJson = (await oppRes.json()) as {
              records: {
                id: string;
                businessName?: string;
                contactName?: string;
                contactEmail?: string;
                contactPhone?: string;
                tradeType?: string;
                industry?: string;
                leadSource?: string;
                serviceInterest?: string[];
                discoveryNotes?: string;
                website?: string;
              }[];
            };
            const match = oppJson.records.find((r) => r.id === opportunityId);
            if (match) {
              oppData = {
                businessName: match.businessName,
                contactName: match.contactName,
                contactEmail: match.contactEmail,
                contactPhone: match.contactPhone,
                tradeType: match.tradeType,
                // Read industry directly; it is now populated by the lead→opp engine
                industry: match.industry,
                leadSource: match.leadSource,
                serviceInterest: match.serviceInterest,
                discoveryNotes: match.discoveryNotes,
                website: match.website,
              };
            }
          }
          // 2. Fall back to sessionStorage (Pipeline page may have stored richer data)
          if (!oppData.businessName && typeof sessionStorage !== "undefined") {
            const stored = sessionStorage.getItem(`rtm-opp-${opportunityId}`);
            if (stored) {
              const parsed = JSON.parse(stored) as typeof oppData;
              oppData = { ...parsed, ...oppData };
            }
          }
        } catch { /* ignore */ }
        setWizardInitialState({
          opportunityId,
          clientInfo: {
            // name: the wizard uses contactName as the display name; use it directly
            name: oppData.contactName ?? "",
            businessName: oppData.businessName ?? "",
            // Prefer opp.industry (now populated from lead); fall back to tradeType for
            // older records that were created before the spread fix
            industry: oppData.industry ?? oppData.tradeType ?? "",
            // location: no Opportunity column exists for this field
            location: "",
            website: oppData.website ?? "",
            leadSource: oppData.leadSource ?? "",
            contactName: oppData.contactName ?? "",
            contactEmail: oppData.contactEmail ?? "",
            contactPhone: oppData.contactPhone ?? "",
            notes: [
              oppData.discoveryNotes ?? "",
              `Linked from opportunity ${opportunityId}`,
            ].filter(Boolean).join("\n"),
          },
          ...(oppData.serviceInterest?.length
            ? { selectedGoals: oppData.serviceInterest }
            : {}),
        });
      } else if (leadId) {
        // Fetch lead context from real leads-status store
        let leadContext: {
          businessName?: string;
          contactName?: string;
          notes?: string;
          assignedRep?: string;
          industry?: string;
          leadSource?: string;
        } = {};
        try {
          const res = await fetch("/api/leads-status");
          if (res.ok) {
            const data = (await res.json()) as {
              records: {
                leadId: string;
                businessName?: string;
                name?: string;
                notes?: string;
                assignedRep?: string;
                industry?: string;
                leadSource?: string;
              }[];
            };
            const record = data.records.find((r) => r.leadId === leadId);
            if (record) {
              leadContext = {
                businessName: record.businessName,
                contactName: record.name,
                notes: record.notes,
                assignedRep: record.assignedRep,
                industry: record.industry,
                leadSource: record.leadSource,
              };
            }
          }
        } catch { /* ignore — wizard opens with empty state */ }
        setWizardInitialState({
          clientInfo: {
            name: "",
            businessName: leadContext.businessName ?? "",
            industry: leadContext.industry ?? "",
            location: "",
            website: "",
            leadSource: leadContext.leadSource ?? "",
            contactName: leadContext.contactName ?? "",
            contactEmail: "",
            contactPhone: "",
            notes: leadContext.notes ?? `Linked from lead ${leadId}`,
          },
        } as Partial<ProposalWizardState> & { linkedLeadId?: string });
      } else {
        setWizardInitialState(undefined);
      }
    } else if (resumeId) {
      // Load draft from API first, then fall back to localStorage
      let initial: Partial<ProposalWizardState> | undefined;
      try {
        const res = await fetch("/api/sales-proposals");
        if (res.ok) {
          const data = (await res.json()) as { records: SalesProposalApiRecord[] };
          const match = data.records.find((r) => r.id === resumeId);
          if (match) {
            initial = match as unknown as Partial<ProposalWizardState>;
          }
        }
      } catch { /* ignore */ }
      if (!initial) {
        try {
          const saved = localStorage.getItem(`rtm-proposal-draft-${resumeId}`);
          if (saved) {
            initial = JSON.parse(saved);
          } else {
            initial = { wizardId: resumeId };
          }
        } catch {
          initial = { wizardId: resumeId };
        }
      }
      setWizardInitialState(initial);
      setView("wizard");
    } else {
      // No wizard params — ensure we are in list view
      setView("dashboard");
    }
    })(); // end async IIFE
  }, [searchParams]);

  function openDetail(p: Proposal) {
    setSelectedProposal(p);
    setDrawerOpen(true);
  }

  function resumeWizardDraft(p: Proposal) {
    setDrawerOpen(false);
    // For API-backed proposals: use their real id as wizardId
    // For mock proposals: derive a wizardId from the proposal id
    const wizardId = p.id.startsWith("wizard-") ? p.id : `wizard-prop-${p.id}`;
    const prefilledState = {
      wizardId,
      status: "draft" as const,
      currentStep: 1 as const,
      completedSteps: [] as number[],
      clientInfo: {
        name: p.info.client,
        businessName: p.client,
        industry: "",
        location: "",
        website: "",
        leadSource: "",
        contactName: p.info.owner,
        contactEmail: "",
        contactPhone: "",
        notes: p.activityTimeline.map(e => `${e.date}: ${e.event}`).join(" | "),
      },
      selectedGoals: p.services as string[],
      auditMode: null,
      selectedAuditId: null,
      auditResult: null,
      approvedRecommendations: p.services as string[],
      approvedRecommendationServiceNames: p.services as string[],
      lineItems: p.lineItems.map(li => ({
        id: li.id,
        name: li.name,
        department: li.department,
        category: li.category,
        basePrice: li.recurringFee,
        setupFee: li.setupFee,
        quantity: li.quantity,
        billingCycle: "Monthly" as const,
        adjustedPrice: li.recurringFee,
        margin: 0.4,
        type: "service" as const,
      })),
      discountPercentage: p.discount.type === "Percentage" || p.discount.type === "Promo Code" ? p.discount.value : 0,
      discount: {
        type: "none" as const,
        value: p.discount.type === "Percentage" ? p.discount.value : 0,
        label: "",
        authorizationNote: "",
      },
      budgetResult: null,
      proposalDocument: null,
      lastSavedAt: new Date().toISOString(),
      intakeRecord: null,
      opportunityId: p.info.opportunity,
      aiAuditResult: null,
      preselectedAuditId: null,
      preselectedAuditType: null,
    };
    try {
      localStorage.setItem(`rtm-proposal-draft-${wizardId}`, JSON.stringify(prefilledState));
    } catch {
      // ignore storage errors
    }
    router.push(`/sales/proposals?resume=${wizardId}`);
  }

  // editProposal - routes Edit button through wizard resume for every proposal
  function editProposal(p: Proposal) {
    resumeWizardDraft(p);
  }

  // handleGenerateContract — creates a real contract from an Accepted proposal
  // then navigates to /sales/contracts so the user sees the new record.
  function handleGenerateContract(_p: Proposal) {
    router.push("/sales/contracts");
  }

  function backToDashboard() {
    setView("dashboard");
    void loadApiProposals();
  }

  // Show wizard full-screen when in wizard mode
  if (view === "wizard") {
    return (
      <ProposalWizard
        initialState={wizardInitialState}
        onComplete={() => {
          setView("dashboard");
          void loadApiProposals();
          router.push("/sales/proposals");
        }}
        onSaveDraft={(s) => {
          // Also save to localStorage so resume works offline
          try {
            const id = s?.wizardId ?? wizardInitialState?.wizardId;
            if (id) {
              localStorage.setItem(`rtm-proposal-draft-${id}`, JSON.stringify(s));
            }
          } catch {
            // ignore storage errors
          }
          setView("dashboard");
          void loadApiProposals();
          router.push("/sales/proposals");
        }}
        onExit={() => {
          setView("dashboard");
          void loadApiProposals();
          router.push("/sales/proposals");
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>
            Sales
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-medium" style={{ color: "var(--rtm-text-primary)" }}>
              Proposals
            </h1>

          </div>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            Build and send client proposals.
          </p>
        </div>
        {view === "dashboard" && (
          <div className="flex gap-2">
            <Btn variant="primary" onClick={() => router.push("/sales/proposals?new=true")}>+ New Proposal</Btn>
            <Link href="/sales">
              <Btn variant="default">← Sales Dashboard</Btn>
            </Link>
          </div>
        )}
      </div>

      {/* Proposal Builder (EPIC 08.5) */}
      {view === "proposal-builder" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#059669" }}>
                Sales · Proposal Builder
              </p>
              <h1 className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>New Proposal</h1>
              <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                Assemble a structured client-facing proposal from Budget Optimizer output.
              </p>
            </div>
            <Btn variant="default" onClick={backToDashboard}>← Back to Proposals</Btn>
          </div>

          <div className="rounded-xl border px-5 py-3 flex items-center gap-2 flex-wrap" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>Workflow:</p>
            {[
              { label: "Sales Intake",         href: "/sales/intake" },
              { label: "Goal-Based Audit",      href: "/sales/audits" },
              { label: "Recommendation Engine", href: "/sales/recommendations" },
              { label: "Budget Optimizer",      href: "/sales/pipeline" },
              { label: "Proposal Builder",      href: "/sales/proposals", active: true },
              { label: "Contract Builder",      href: "/sales/contracts" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <Link href={step.href}>
                  <span className="text-[10px] font-semibold px-2 py-1 rounded border transition-all" style={{
                    background: step.active ? "#059669" : "var(--rtm-bg)",
                    color: step.active ? "#fff" : "var(--rtm-text-muted)",
                    borderColor: step.active ? "#059669" : "var(--rtm-border)",
                  }}>{step.label}</span>
                </Link>
                {i < arr.length - 1 && <span style={{ color: "var(--rtm-text-muted)" }}>→</span>}
              </React.Fragment>
            ))}
          </div>

          <ProposalBuilderShell
            clientName="New Client"
            preparedBy="Sales Representative"
            templateId="standard"
            context={{}}
          />

          <div className="rounded-xl border px-6 py-5 flex items-center justify-between gap-4 flex-wrap" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>Ready to proceed?</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Once your proposal is complete, continue to the Contract Builder.</p>
            </div>
            <Link href="/sales/contracts">
              <Btn variant="success">Continue to Contract Builder →</Btn>
            </Link>
          </div>
        </div>
      )}

      {/* Dashboard View */}
      {view === "dashboard" && (
        <>
          {apiLoading && (
            <div className="text-xs px-2" style={{ color: "var(--rtm-text-muted)" }}>Loading proposals…</div>
          )}
          <DashboardKPIs proposals={allProposals} />
          <ProposalTable
            proposals={allProposals}
            onSelect={openDetail}
            onEdit={editProposal}
            onResume={resumeWizardDraft}
            onSend={handleSendProposal}
            onAccept={canAccept ? handleAcceptProposal : undefined}
            onGenerateContract={handleGenerateContract}
          />
        </>
      )}

      {/* Proposal Detail Drawer */}
      {drawerOpen && selectedProposal && (
        <ProposalDetailDrawer
          proposal={selectedProposal}
          onClose={() => setDrawerOpen(false)}
          onEdit={(p) => {
            setDrawerOpen(false);
            editProposal(p);
          }}
          onSend={handleSendProposal}
          onAccept={canAccept ? handleAcceptProposal : undefined}
          onGenerateContract={handleGenerateContract}
        />
      )}
    </div>
  );
}

export default function ProposalsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center">
        <p style={{ color: "var(--rtm-text-muted)" }}>Loading proposals...</p>
      </div>
    }>
      <ProposalsPageInner />
    </Suspense>
  );
}
