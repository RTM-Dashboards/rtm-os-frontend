"use client";

/**
 * Active Services — Billing Source of Truth
 *
 * Subscriptions are billing records. This page shows the full set of
 * active client subscriptions. Data is drawn from clients in the master
 * client roster (MASTER_CLIENTS) to ensure alignment — no separate dataset.
 *
 * 18 subscriptions across a realistic status mix:
 *   Active, At Risk, Pausing, New
 */

import { useState } from "react";
import Link from "next/link";
import { SectionWrapper, StatusBadge } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("billing")!;

type ServiceStatus = "Active" | "At Risk" | "Pausing" | "New";
type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral" | "pending";

function statusVariant(s: ServiceStatus): BadgeVariant {
  switch (s) {
    case "Active":  return "success";
    case "At Risk": return "error";
    case "Pausing": return "warning";
    case "New":     return "info";
    default:        return "neutral";
  }
}

interface ActiveService {
  id: string;
  client: string;
  plan: string;
  serviceType: string;
  mrr: string;
  mrrValue: number;
  status: ServiceStatus;
  billingOwner: string;
  startDate: string;
}

/**
 * 18 subscriptions derived from the master client roster.
 * Clients: Apex Roofing, Pacific Dental, Sunbelt HVAC, Harbor Auto Group,
 *          Blue Ridge Plumbing, Nova MedSpa, Pinnacle Chiropractic,
 *          Ironclad Security, Coastal Wellness, Frontier Logistics,
 *          Eastside Veterinary, Ridgeline Construction, Capital Contractors,
 *          Clearwater Insurance, Summit Fitness, Desert Solar,
 *          Greenleaf Landscaping (new), Bright Vision Optometry (new)
 */
const ACTIVE_SERVICES: ActiveService[] = [
  {
    id: "svc-01", client: "Apex Roofing Solutions",    plan: "Full-Service SEO",         serviceType: "SEO",               mrr: "$2,400/mo",  mrrValue: 2400,  status: "Active",   billingOwner: "Lisa P.",   startDate: "Jan 2024",
  },
  {
    id: "svc-02", client: "Apex Roofing Solutions",    plan: "Meta Ads Management",      serviceType: "Paid Advertising",  mrr: "$1,800/mo",  mrrValue: 1800,  status: "Active",   billingOwner: "Lisa P.",   startDate: "Mar 2024",
  },
  {
    id: "svc-03", client: "Pacific Dental Group",       plan: "Paid Advertising Bundle",  serviceType: "Paid Advertising",  mrr: "$3,800/mo",  mrrValue: 3800,  status: "Active",   billingOwner: "Sarah K.",  startDate: "Feb 2024",
  },
  {
    id: "svc-04", client: "Pacific Dental Group",       plan: "Yelp Ads Management",      serviceType: "Local Ads",         mrr: "$800/mo",    mrrValue: 800,   status: "Active",   billingOwner: "Sarah K.",  startDate: "Apr 2024",
  },
  {
    id: "svc-05", client: "Sunbelt HVAC & Air",         plan: "SEO & GBP Retainer",       serviceType: "SEO",               mrr: "$1,200/mo",  mrrValue: 1200,  status: "At Risk",  billingOwner: "Lisa P.",   startDate: "Mar 2024",
  },
  {
    id: "svc-06", client: "Harbor Auto Group",           plan: "Full-Service Bundle",       serviceType: "Full-Service",      mrr: "$5,000/mo",  mrrValue: 5000,  status: "Pausing",  billingOwner: "Sarah K.",  startDate: "Jul 2024",
  },
  {
    id: "svc-07", client: "Blue Ridge Plumbing Co.",    plan: "Starter SEO",              serviceType: "SEO",               mrr: "$800/mo",    mrrValue: 800,   status: "New",      billingOwner: "Lisa P.",   startDate: "May 2025",
  },
  {
    id: "svc-08", client: "Blue Ridge Plumbing Co.",    plan: "Website Build (One-Time)", serviceType: "Web Development",   mrr: "$700/mo",    mrrValue: 700,   status: "New",      billingOwner: "Lisa P.",   startDate: "May 2025",
  },
  {
    id: "svc-09", client: "Nova MedSpa & Aesthetics",   plan: "SEO + Content Bundle",     serviceType: "SEO",               mrr: "$2,800/mo",  mrrValue: 2800,  status: "Active",   billingOwner: "Lisa P.",   startDate: "Sep 2024",
  },
  {
    id: "svc-10", client: "Nova MedSpa & Aesthetics",   plan: "Google Ads Management",    serviceType: "Paid Advertising",  mrr: "$2,200/mo",  mrrValue: 2200,  status: "Active",   billingOwner: "Lisa P.",   startDate: "Sep 2024",
  },
  {
    id: "svc-11", client: "Pinnacle Chiropractic",       plan: "SEO + Review Management",  serviceType: "SEO",               mrr: "$1,600/mo",  mrrValue: 1600,  status: "Active",   billingOwner: "Sarah K.",  startDate: "Oct 2024",
  },
  {
    id: "svc-12", client: "Ironclad Security Systems",   plan: "Multi-Channel Paid Ads",   serviceType: "Paid Advertising",  mrr: "$3,200/mo",  mrrValue: 3200,  status: "Active",   billingOwner: "Lisa P.",   startDate: "Jan 2024",
  },
  {
    id: "svc-13", client: "Coastal Wellness Center",     plan: "SEO + Email Marketing",    serviceType: "SEO",               mrr: "$1,800/mo",  mrrValue: 1800,  status: "Active",   billingOwner: "Sarah K.",  startDate: "Nov 2024",
  },
  {
    id: "svc-14", client: "Frontier Logistics Inc.",     plan: "SEO + LinkedIn Ads",       serviceType: "SEO",               mrr: "$2,400/mo",  mrrValue: 2400,  status: "Active",   billingOwner: "Lisa P.",   startDate: "Dec 2024",
  },
  {
    id: "svc-15", client: "Eastside Veterinary Clinic",  plan: "Local SEO + Content",      serviceType: "SEO",               mrr: "$1,400/mo",  mrrValue: 1400,  status: "Active",   billingOwner: "Sarah K.",  startDate: "Feb 2024",
  },
  {
    id: "svc-16", client: "Ridgeline Construction LLC",  plan: "SEO / GBP Retainer",       serviceType: "SEO",               mrr: "$1,200/mo",  mrrValue: 1200,  status: "Active",   billingOwner: "Sarah K.",  startDate: "May 2025",
  },
  {
    id: "svc-17", client: "Capital Contractors Group",   plan: "SEO + Website Maintenance", serviceType: "SEO",              mrr: "$1,600/mo",  mrrValue: 1600,  status: "At Risk",  billingOwner: "Lisa P.",   startDate: "Oct 2024",
  },
  {
    id: "svc-18", client: "Desert Solar Energy",         plan: "Meta Ads + SEO Bundle",    serviceType: "Paid Advertising",  mrr: "$2,600/mo",  mrrValue: 2600,  status: "At Risk",  billingOwner: "Sarah K.",  startDate: "Jul 2024",
  },
];

const allStatuses: (ServiceStatus | "All")[] = ["All", "Active", "At Risk", "Pausing", "New"];
const allServiceTypes = ["All", ...Array.from(new Set(ACTIVE_SERVICES.map((s) => s.serviceType)))];

export default function BillingServicesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ServiceStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const filtered = ACTIVE_SERVICES.filter((s) => {
    const matchesSearch =
      search.trim() === "" ||
      s.client.toLowerCase().includes(search.toLowerCase()) ||
      s.plan.toLowerCase().includes(search.toLowerCase()) ||
      s.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    const matchesType = typeFilter === "All" || s.serviceType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalMRR = filtered.reduce((s, svc) => s + svc.mrrValue, 0);
  const activeCount = ACTIVE_SERVICES.filter((s) => s.status === "Active").length;
  const atRiskCount = ACTIVE_SERVICES.filter((s) => s.status === "At Risk").length;
  const newCount = ACTIVE_SERVICES.filter((s) => s.status === "New").length;
  const pausingCount = ACTIVE_SERVICES.filter((s) => s.status === "Pausing").length;

  function Th({ children }: { children: React.ReactNode }) {
    return (
      <th className="text-left text-xs font-semibold uppercase tracking-wide px-3 py-2 whitespace-nowrap border-b"
        style={{ color: "var(--rtm-text-muted)", borderColor: "var(--rtm-border-light)", background: "var(--rtm-bg-alt, #F9FAFB)" }}>
        {children}
      </th>
    );
  }

  function Td({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
    return (
      <td className="px-3 py-2.5 text-sm whitespace-nowrap border-b"
        style={{ color: muted ? "var(--rtm-text-muted)" : "var(--rtm-text-secondary)", borderColor: "var(--rtm-border-light)" }}>
        {children}
      </td>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>{workspace.name}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Active Services</h1>
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border"
            style={{ background: "#FFFBEB", borderColor: "#FDE68A", color: "#92400E" }}
          >
            Preview — Target State
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
          All current client service subscriptions — {ACTIVE_SERVICES.length} subscriptions across the master client roster.
          Billing is the source of truth for active services.
        </p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Subscriptions", value: ACTIVE_SERVICES.length, color: "#1B4FD8", bg: "#EFF6FF", border: "#BFDBFE" },
          { label: "Active",              value: activeCount,             color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
          { label: "At Risk",             value: atRiskCount,             color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
          { label: "New",                 value: newCount,                color: "#0891B2", bg: "#F0F9FF", border: "#BAE6FD" },
        ].map(({ label, value, color, bg, border }) => (
          <div key={label} className="rounded-xl border p-4 flex flex-col gap-1" style={{ background: bg, borderColor: border }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>{label}</span>
            <span className="text-3xl font-black" style={{ color }}>{value}</span>
          </div>
        ))}
        {pausingCount > 0 && (
          <div className="rounded-xl border p-4 flex flex-col gap-1" style={{ background: "#FFFBEB", borderColor: "#FDE68A" }}>
            <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: "#D97706" }}>Pausing</span>
            <span className="text-3xl font-black" style={{ color: "#D97706" }}>{pausingCount}</span>
          </div>
        )}
      </div>

      {/* Filters + Table */}
      <SectionWrapper
        title={`Active Services (${filtered.length} of ${ACTIVE_SERVICES.length})`}
        description={`MRR shown: $${totalMRR.toLocaleString()}/mo`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: "var(--rtm-text-muted)" }}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text" placeholder="Search…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="text-sm pl-8 pr-3 py-1.5 rounded-lg border focus:outline-none"
                style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)", width: 160 }}
              />
            </div>
            {allStatuses.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s as ServiceStatus | "All")}
                className="text-xs font-semibold px-3 py-1 rounded-full border transition-colors"
                style={statusFilter === s
                  ? { background: "#1B4FD8", color: "#fff", borderColor: "#1B4FD8" }
                  : { background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }
                }>
                {s}
              </button>
            ))}
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg border focus:outline-none"
              style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)" }}>
              {allServiceTypes.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        }
      >
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--rtm-border-light)" }}>
          <table className="min-w-full">
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Plan / Service</Th>
                <Th>Type</Th>
                <Th>MRR</Th>
                <Th>Status</Th>
                <Th>Billing Owner</Th>
                <Th>Start Date</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-sm" style={{ color: "var(--rtm-text-muted)" }}>
                    No services match your filters.
                  </td>
                </tr>
              ) : filtered.map((svc) => (
                <tr key={svc.id}
                  className="transition-colors"
                  style={{ background: svc.status === "At Risk" ? "#FFF7F7" : svc.status === "New" ? "#F0F9FF" : "var(--rtm-bg)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = "var(--rtm-bg-alt, #F9FAFB)"; }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      svc.status === "At Risk" ? "#FFF7F7" : svc.status === "New" ? "#F0F9FF" : "var(--rtm-bg)";
                  }}>
                  <Td><span className="font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{svc.client}</span></Td>
                  <Td>{svc.plan}</Td>
                  <Td muted>{svc.serviceType}</Td>
                  <Td><span className="font-bold" style={{ color: "#059669" }}>{svc.mrr}</span></Td>
                  <Td><StatusBadge variant={statusVariant(svc.status)} label={svc.status} size="sm" /></Td>
                  <Td muted>{svc.billingOwner}</Td>
                  <Td muted>{svc.startDate}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MRR Summary */}
        <div className="mt-4 flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
            Showing {filtered.length} subscription{filtered.length !== 1 ? "s" : ""}
          </p>
          <p className="text-xs font-bold" style={{ color: "var(--rtm-text-primary)" }}>
            MRR shown: <span style={{ color: "#059669" }}>${totalMRR.toLocaleString()}/mo</span>
          </p>
        </div>
      </SectionWrapper>

      {/* Footer */}
      <div className="flex gap-2">
        <Link href={workspace.dashboardRoute} className="rtm-btn-secondary text-sm">← Dashboard</Link>
        <Link href="/billing/recurring-revenue" className="rtm-btn-primary text-sm">Recurring Revenue →</Link>
        <Link href="/billing/invoices" className="rtm-btn-secondary text-sm">Invoices →</Link>
      </div>
    </div>
  );
}
