"use client";

import { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge } from "@/components/ui";
import { WorkspaceHeader } from "@/components/workspace";
import { getWorkspace } from "@/lib/workspaces";

const workspace = getWorkspace("reporting")!;

// ── Types ─────────────────────────────────────────────────────────────────────
type CallClassification =
  | "Qualified Lead"
  | "Booked Lead"
  | "Spam"
  | "Existing Client"
  | "Wrong Number"
  | "Competitor"
  | "Missed Opportunity"
  | "Unqualified"
  | "Follow-Up Required";

type ServiceType =
  | "SEO"
  | "GBP"
  | "PPC"
  | "Meta Ads"
  | "LSA"
  | "Website"
  | "Hosting"
  | "AI Automation"
  | "Custom Service";

type Sentiment = "Positive" | "Neutral" | "Negative";

interface CallRecord {
  id: string;
  client: string;
  serviceType: ServiceType;
  campaign: string;
  department: string;
  location: string;
  leadSource: string;
  callTrackingProvider: string;
  caller: string;
  callerPhone: string;
  date: string;
  time: string;
  duration: string;
  durationSeconds: number;
  classification: CallClassification;
  sentiment: Sentiment;
  leadQualityScore: number;
  summary: string;
  serviceRequested: string;
  bookingOutcome: string;
  budgetMentioned: string;
  objections: string[];
  competitorMention: string;
  actionItems: string[];
  followUpNeeded: boolean;
  renewalSignal: boolean;
  upsellOpportunity: string;
}

// ── Mock Call Data ─────────────────────────────────────────────────────────────
const CALLS: CallRecord[] = [
  {
    id: "ci-001",
    client: "Apex Roofing",
    serviceType: "LSA",
    campaign: "Apex Roofing — LSA Emergency",
    department: "Local Service Ads",
    location: "Phoenix, AZ",
    leadSource: "Google LSA",
    callTrackingProvider: "CallRail",
    caller: "David Morales",
    callerPhone: "(602) 441-8821",
    date: "Jun 7, 2025",
    time: "8:14 AM",
    duration: "6:42",
    durationSeconds: 402,
    classification: "Booked Lead",
    sentiment: "Positive",
    leadQualityScore: 95,
    summary: "Homeowner requesting emergency roof repair after storm damage. Highly motivated buyer. Appointment booked for same day estimate.",
    serviceRequested: "Emergency Roof Repair",
    bookingOutcome: "Booked",
    budgetMentioned: "$5,000–$10,000",
    objections: [],
    competitorMention: "None",
    actionItems: ["Send confirmation email", "Assign field crew"],
    followUpNeeded: false,
    renewalSignal: false,
    upsellOpportunity: "Full Roof Replacement",
  },
  {
    id: "ci-002",
    client: "Pacific Dental",
    serviceType: "PPC",
    campaign: "Pacific Dental — New Patient Google Ads",
    department: "Paid Advertising",
    location: "San Diego, CA",
    leadSource: "Google Ads",
    callTrackingProvider: "CallRail",
    caller: "Jennifer Walsh",
    callerPhone: "(619) 330-4491",
    date: "Jun 7, 2025",
    time: "10:30 AM",
    duration: "4:55",
    durationSeconds: 295,
    classification: "Qualified Lead",
    sentiment: "Positive",
    leadQualityScore: 82,
    summary: "New patient inquiry about Invisalign. Interested in consultation. Did not book but requested a callback in two days.",
    serviceRequested: "Invisalign Consultation",
    bookingOutcome: "Callback Requested",
    budgetMentioned: "Not discussed",
    objections: ["Price concern", "Schedule conflict"],
    competitorMention: "Mentioned competitor downtown",
    actionItems: ["Schedule callback for Jun 9", "Send Invisalign pricing sheet"],
    followUpNeeded: true,
    renewalSignal: false,
    upsellOpportunity: "Teeth Whitening Package",
  },
  {
    id: "ci-003",
    client: "Harbor Auto",
    serviceType: "GBP",
    campaign: "Harbor Auto — GBP Organic",
    department: "GBP",
    location: "Seattle, WA",
    leadSource: "Google Business Profile",
    callTrackingProvider: "CallTrackingMetrics",
    caller: "Unknown",
    callerPhone: "(206) 889-0002",
    date: "Jun 7, 2025",
    time: "11:05 AM",
    duration: "0:38",
    durationSeconds: 38,
    classification: "Spam",
    sentiment: "Neutral",
    leadQualityScore: 0,
    summary: "Automated robocall detected. No meaningful conversation. Flagged by AI classifier.",
    serviceRequested: "None",
    bookingOutcome: "N/A",
    budgetMentioned: "None",
    objections: [],
    competitorMention: "None",
    actionItems: ["Block number"],
    followUpNeeded: false,
    renewalSignal: false,
    upsellOpportunity: "None",
  },
  {
    id: "ci-004",
    client: "BlueSky HVAC",
    serviceType: "LSA",
    campaign: "BlueSky HVAC — LSA Seasonal",
    department: "Local Service Ads",
    location: "Houston, TX",
    leadSource: "Google LSA",
    callTrackingProvider: "CallRail",
    caller: "Marcus Johnson",
    callerPhone: "(713) 552-7713",
    date: "Jun 7, 2025",
    time: "1:20 PM",
    duration: "5:15",
    durationSeconds: 315,
    classification: "Booked Lead",
    sentiment: "Positive",
    leadQualityScore: 91,
    summary: "AC unit failure in summer. Urgent service request. Technician dispatched same day. Strong booking signal.",
    serviceRequested: "AC Repair — Emergency",
    bookingOutcome: "Booked",
    budgetMentioned: "Flexible on budget",
    objections: [],
    competitorMention: "None",
    actionItems: ["Dispatch technician", "Send service confirmation"],
    followUpNeeded: false,
    renewalSignal: false,
    upsellOpportunity: "HVAC Maintenance Plan",
  },
  {
    id: "ci-005",
    client: "Metro Dental",
    serviceType: "Meta Ads",
    campaign: "Metro Dental — Meta New Patient",
    department: "Paid Advertising",
    location: "Chicago, IL",
    leadSource: "Meta Ads",
    callTrackingProvider: "CallRail",
    caller: "Samantha Reyes",
    callerPhone: "(312) 445-9921",
    date: "Jun 6, 2025",
    time: "3:45 PM",
    duration: "7:30",
    durationSeconds: 450,
    classification: "Missed Opportunity",
    sentiment: "Negative",
    leadQualityScore: 55,
    summary: "Caller had appointment last month but was never followed up. Expressed frustration. Chose a competitor. Missed opportunity due to lack of follow-up.",
    serviceRequested: "General Dentistry",
    bookingOutcome: "Lost to Competitor",
    budgetMentioned: "Not discussed",
    objections: ["No follow-up received", "Chose competitor"],
    competitorMention: "Smile Design Dental",
    actionItems: ["Escalate to AM", "Review follow-up process", "Improve booking confirmation workflow"],
    followUpNeeded: true,
    renewalSignal: false,
    upsellOpportunity: "None",
  },
  {
    id: "ci-006",
    client: "Summit Landscaping",
    serviceType: "SEO",
    campaign: "Summit Landscaping — Organic SEO",
    department: "SEO",
    location: "Denver, CO",
    leadSource: "Organic Search",
    callTrackingProvider: "CallTrackingMetrics",
    caller: "Patricia Chen",
    callerPhone: "(720) 881-3312",
    date: "Jun 6, 2025",
    time: "9:55 AM",
    duration: "3:22",
    durationSeconds: 202,
    classification: "Qualified Lead",
    sentiment: "Positive",
    leadQualityScore: 74,
    summary: "Homeowner requesting quote for full backyard landscaping project. Budget flexible. Wants consultation within the week.",
    serviceRequested: "Backyard Landscaping Design",
    bookingOutcome: "Consultation Scheduled",
    budgetMentioned: "$8,000–$15,000",
    objections: ["Timing — wants spring install"],
    competitorMention: "None",
    actionItems: ["Send portfolio", "Confirm consultation date"],
    followUpNeeded: false,
    renewalSignal: false,
    upsellOpportunity: "Annual Maintenance Plan",
  },
  {
    id: "ci-007",
    client: "Prestige Auto",
    serviceType: "PPC",
    campaign: "Prestige Auto — Google Ads Brand",
    department: "Paid Advertising",
    location: "Los Angeles, CA",
    leadSource: "Google Ads",
    callTrackingProvider: "CallRail",
    caller: "Existing Customer",
    callerPhone: "(310) 774-2200",
    date: "Jun 6, 2025",
    time: "11:40 AM",
    duration: "2:45",
    durationSeconds: 165,
    classification: "Existing Client",
    sentiment: "Positive",
    leadQualityScore: 0,
    summary: "Existing customer calling to schedule routine service appointment. Not a new lead.",
    serviceRequested: "Oil Change / Routine Service",
    bookingOutcome: "Appointment Booked",
    budgetMentioned: "None",
    objections: [],
    competitorMention: "None",
    actionItems: ["Log service appointment"],
    followUpNeeded: false,
    renewalSignal: true,
    upsellOpportunity: "Extended Warranty Renewal",
  },
  {
    id: "ci-008",
    client: "Skyline Roofing",
    serviceType: "SEO",
    campaign: "Skyline Roofing — Organic",
    department: "SEO",
    location: "Atlanta, GA",
    leadSource: "Organic Search",
    callTrackingProvider: "CallRail",
    caller: "Thomas Brooks",
    callerPhone: "(404) 556-9901",
    date: "Jun 5, 2025",
    time: "2:10 PM",
    duration: "9:05",
    durationSeconds: 545,
    classification: "Booked Lead",
    sentiment: "Positive",
    leadQualityScore: 98,
    summary: "High-value commercial roofing inquiry. Property manager for a 40-unit apartment complex. Requested full roof inspection and replacement quote. Booked site visit.",
    serviceRequested: "Commercial Roof Replacement",
    bookingOutcome: "Site Visit Booked",
    budgetMentioned: "$80,000–$120,000",
    objections: [],
    competitorMention: "Comparing 3 vendors",
    actionItems: ["Prepare commercial proposal", "Send portfolio", "Confirm site visit details"],
    followUpNeeded: true,
    renewalSignal: false,
    upsellOpportunity: "Preventative Maintenance Contract",
  },
  {
    id: "ci-009",
    client: "Coastal Plumbing",
    serviceType: "GBP",
    campaign: "Coastal Plumbing — GBP",
    department: "GBP",
    location: "Tampa, FL",
    leadSource: "Google Business Profile",
    callTrackingProvider: "CallTrackingMetrics",
    caller: "Wrong Number",
    callerPhone: "(813) 000-0000",
    date: "Jun 5, 2025",
    time: "4:30 PM",
    duration: "0:22",
    durationSeconds: 22,
    classification: "Wrong Number",
    sentiment: "Neutral",
    leadQualityScore: 0,
    summary: "Caller looking for a different business. No service interest.",
    serviceRequested: "None",
    bookingOutcome: "N/A",
    budgetMentioned: "None",
    objections: [],
    competitorMention: "None",
    actionItems: [],
    followUpNeeded: false,
    renewalSignal: false,
    upsellOpportunity: "None",
  },
  {
    id: "ci-010",
    client: "Urban Dental",
    serviceType: "Meta Ads",
    campaign: "Urban Dental — Meta Implants",
    department: "Paid Advertising",
    location: "New York, NY",
    leadSource: "Meta Ads",
    callTrackingProvider: "CallRail",
    caller: "Carlos Vega",
    callerPhone: "(212) 885-4401",
    date: "Jun 5, 2025",
    time: "12:20 PM",
    duration: "8:15",
    durationSeconds: 495,
    classification: "Qualified Lead",
    sentiment: "Positive",
    leadQualityScore: 87,
    summary: "Patient inquiry about dental implants. Has insurance. Requested a consultation. High intent — needs implants after extraction last month.",
    serviceRequested: "Dental Implants",
    bookingOutcome: "Consultation Pending",
    budgetMentioned: "Has insurance coverage",
    objections: ["Waiting on insurance confirmation"],
    competitorMention: "None",
    actionItems: ["Send insurance verification form", "Follow up in 3 days"],
    followUpNeeded: true,
    renewalSignal: false,
    upsellOpportunity: "Smile Makeover Package",
  },
];

// ── Classification config ─────────────────────────────────────────────────────
const classificationConfig: Record<CallClassification, { bg: string; color: string; border: string }> = {
  "Qualified Lead":      { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
  "Booked Lead":         { bg: "#D1FAE5", color: "#065F46", border: "#6EE7B7" },
  Spam:                  { bg: "#F8FAFC", color: "#94A3B8", border: "#E2E8F0" },
  "Existing Client":     { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  "Wrong Number":        { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  Competitor:            { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  "Missed Opportunity":  { bg: "#FEF2F2", color: "#B91C1C", border: "#FECACA" },
  Unqualified:           { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  "Follow-Up Required":  { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A" },
};

const classificationVariant: Record<CallClassification, "success" | "warning" | "error" | "info" | "pending" | "neutral"> = {
  "Qualified Lead":      "success",
  "Booked Lead":         "success",
  Spam:                  "neutral",
  "Existing Client":     "info",
  "Wrong Number":        "error",
  Competitor:            "warning",
  "Missed Opportunity":  "error",
  Unqualified:           "neutral",
  "Follow-Up Required":  "warning",
};

const sentimentColor: Record<Sentiment, string> = {
  Positive: "#059669",
  Neutral:  "#D97706",
  Negative: "#DC2626",
};

// ── Client Performance Data ───────────────────────────────────────────────────
const clientPerformance = [
  { client: "Apex Roofing",       totalCalls: 48, qualifiedLeads: 31, bookedLeads: 22, bookingPct: 71, spamPct: 8,  missedOpp: 3, qualityScore: 88, topServices: ["LSA", "SEO"],       trend: "up" },
  { client: "Pacific Dental",     totalCalls: 62, qualifiedLeads: 44, bookedLeads: 28, bookingPct: 64, spamPct: 12, missedOpp: 7, qualityScore: 79, topServices: ["PPC", "Meta Ads"],   trend: "up" },
  { client: "Harbor Auto",        totalCalls: 35, qualifiedLeads: 20, bookedLeads: 14, bookingPct: 70, spamPct: 15, missedOpp: 4, qualityScore: 74, topServices: ["GBP"],              trend: "down" },
  { client: "BlueSky HVAC",       totalCalls: 55, qualifiedLeads: 40, bookedLeads: 33, bookingPct: 83, spamPct: 5,  missedOpp: 2, qualityScore: 92, topServices: ["LSA"],              trend: "up" },
  { client: "Metro Dental",       totalCalls: 41, qualifiedLeads: 25, bookedLeads: 16, bookingPct: 64, spamPct: 9,  missedOpp: 8, qualityScore: 68, topServices: ["Meta Ads", "PPC"],  trend: "down" },
  { client: "Summit Landscaping", totalCalls: 28, qualifiedLeads: 18, bookedLeads: 11, bookingPct: 61, spamPct: 10, missedOpp: 5, qualityScore: 71, topServices: ["SEO"],              trend: "neutral" },
  { client: "Prestige Auto",      totalCalls: 50, qualifiedLeads: 32, bookedLeads: 24, bookingPct: 75, spamPct: 7,  missedOpp: 3, qualityScore: 83, topServices: ["PPC", "GBP"],       trend: "up" },
  { client: "Skyline Roofing",    totalCalls: 33, qualifiedLeads: 22, bookedLeads: 18, bookingPct: 82, spamPct: 6,  missedOpp: 1, qualityScore: 91, topServices: ["SEO"],              trend: "up" },
  { client: "Urban Dental",       totalCalls: 47, qualifiedLeads: 30, bookedLeads: 19, bookingPct: 63, spamPct: 11, missedOpp: 6, qualityScore: 75, topServices: ["Meta Ads"],         trend: "down" },
];

// ── Service Performance Data ──────────────────────────────────────────────────
const servicePerformance: Array<{ service: ServiceType; calls: number; qualifiedLeads: number; bookedLeads: number; bookingPct: number; leadQuality: number; revenueOpportunity: string }> = [
  { service: "SEO",          calls: 142, qualifiedLeads: 98, bookedLeads: 67, bookingPct: 68, leadQuality: 80, revenueOpportunity: "$142,000" },
  { service: "GBP",          calls: 88,  qualifiedLeads: 55, bookedLeads: 38, bookingPct: 69, leadQuality: 74, revenueOpportunity: "$76,000" },
  { service: "PPC",          calls: 195, qualifiedLeads: 141, bookedLeads: 98, bookingPct: 69, leadQuality: 82, revenueOpportunity: "$218,000" },
  { service: "Meta Ads",     calls: 118, qualifiedLeads: 79, bookedLeads: 51, bookingPct: 65, leadQuality: 77, revenueOpportunity: "$104,000" },
  { service: "LSA",          calls: 167, qualifiedLeads: 130, bookedLeads: 104, bookingPct: 80, leadQuality: 89, revenueOpportunity: "$261,000" },
  { service: "Website",      calls: 42,  qualifiedLeads: 28, bookedLeads: 18, bookingPct: 64, leadQuality: 70, revenueOpportunity: "$38,000" },
  { service: "Hosting",      calls: 12,  qualifiedLeads: 5,  bookedLeads: 2,  bookingPct: 40, leadQuality: 55, revenueOpportunity: "$8,000" },
  { service: "AI Automation", calls: 24, qualifiedLeads: 18, bookedLeads: 14, bookingPct: 78, leadQuality: 85, revenueOpportunity: "$44,000" },
];

type ActiveView = "calls" | "client" | "service";

export default function CallIntelligencePage() {
  const [activeView, setActiveView] = useState<ActiveView>("calls");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [filterClient, setFilterClient] = useState("All");
  const [filterService, setFilterService] = useState<ServiceType | "All">("All");
  const [filterClassification, setFilterClassification] = useState<CallClassification | "All">("All");
  const [search, setSearch] = useState("");

  const clients = ["All", ...Array.from(new Set(CALLS.map((c) => c.client)))];
  const services: Array<ServiceType | "All"> = ["All", "SEO", "GBP", "PPC", "Meta Ads", "LSA", "Website", "Hosting", "AI Automation"];
  const classifications: Array<CallClassification | "All"> = [
    "All", "Qualified Lead", "Booked Lead", "Spam", "Existing Client", "Wrong Number", "Competitor", "Missed Opportunity", "Unqualified", "Follow-Up Required",
  ];

  const filteredCalls = CALLS.filter((c) => {
    if (filterClient !== "All" && c.client !== filterClient) return false;
    if (filterService !== "All" && c.serviceType !== filterService) return false;
    if (filterClassification !== "All" && c.classification !== filterClassification) return false;
    if (search && !c.caller.toLowerCase().includes(search.toLowerCase()) && !c.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const kpis = {
    totalCalls: CALLS.length,
    qualifiedLeads: CALLS.filter((c) => c.classification === "Qualified Lead" || c.classification === "Booked Lead").length,
    bookedLeads: CALLS.filter((c) => c.classification === "Booked Lead").length,
    bookingPct: Math.round((CALLS.filter((c) => c.classification === "Booked Lead").length / CALLS.length) * 100),
    missedOpportunities: CALLS.filter((c) => c.classification === "Missed Opportunity").length,
    avgQualityScore: Math.round(CALLS.filter((c) => c.leadQualityScore > 0).reduce((sum, c) => sum + c.leadQualityScore, 0) / CALLS.filter((c) => c.leadQualityScore > 0).length),
    spam: CALLS.filter((c) => c.classification === "Spam" || c.classification === "Wrong Number").length,
    followUpNeeded: CALLS.filter((c) => c.followUpNeeded).length,
  };

  const views: { id: ActiveView; label: string }[] = [
    { id: "calls", label: "Call Log" },
    { id: "client", label: "Client Dashboard" },
    { id: "service", label: "Service Dashboard" },
  ];

  return (
    <div className="space-y-6">
      <WorkspaceHeader
        workspace={workspace}
        subtitle="AI-powered call analysis, classification, and performance intelligence across all clients and service types."
      />

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Total Calls"
          value={String(kpis.totalCalls)}
          subtitle="This period"
          iconBg="#EFF6FF"
          iconColor="#1D4ED8"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>}
        />
        <KpiCard
          title="Qualified Leads"
          value={String(kpis.qualifiedLeads)}
          subtitle={`${kpis.bookedLeads} booked`}
          trend="up"
          trendValue="12%"
          iconBg="#ECFDF5"
          iconColor="#059669"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KpiCard
          title="Booking Rate"
          value={`${kpis.bookingPct}%`}
          subtitle="Booked / Total calls"
          trend="up"
          trendValue="3%"
          iconBg="#F5F3FF"
          iconColor="#7C3AED"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
        />
        <KpiCard
          title="Avg Lead Quality"
          value={`${kpis.avgQualityScore}/100`}
          subtitle="AI quality score"
          trend="up"
          trendValue="4pts"
          iconBg="#FFF7ED"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
        />
        <KpiCard
          title="Missed Opportunities"
          value={String(kpis.missedOpportunities)}
          subtitle="Recoverable"
          trend="down"
          trendValue="2"
          iconBg="#FEF2F2"
          iconColor="#DC2626"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
        <KpiCard
          title="Follow-Up Needed"
          value={String(kpis.followUpNeeded)}
          subtitle="Requires action"
          iconBg="#FFFBEB"
          iconColor="#D97706"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
        />
        <KpiCard
          title="Spam / Wrong Number"
          value={String(kpis.spam)}
          subtitle={`${Math.round((kpis.spam / kpis.totalCalls) * 100)}% of total`}
          iconBg="#F8FAFC"
          iconColor="#64748B"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>}
        />
        <KpiCard
          title="Upsell Signals"
          value={String(CALLS.filter((c) => c.upsellOpportunity !== "None").length)}
          subtitle="Identified by AI"
          iconBg="#F5F3FF"
          iconColor="#6D28D9"
          icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      {/* View Tabs */}
      <div className="border-b" style={{ borderColor: "var(--rtm-border-light)" }}>
        <nav className="-mb-px flex gap-1">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className="whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
              style={{
                borderColor: activeView === v.id ? "#0F766E" : "transparent",
                color: activeView === v.id ? "#0F766E" : "var(--rtm-text-muted)",
              }}
            >
              {v.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Call Log View ── */}
      {activeView === "calls" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl border" style={{ background: "var(--rtm-bg-secondary)", borderColor: "var(--rtm-border-light)" }}>
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--rtm-text-muted)" }}><circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35" /></svg>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search calls..." className="w-full pl-9 pr-3 py-2 rounded-lg border text-sm outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }} />
            </div>
            <select value={filterClient} onChange={(e) => setFilterClient(e.target.value)} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
              {clients.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select value={filterService} onChange={(e) => setFilterService(e.target.value as ServiceType | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
              {services.map((s) => <option key={s}>{s}</option>)}
            </select>
            <select value={filterClassification} onChange={(e) => setFilterClassification(e.target.value as CallClassification | "All")} className="rounded-lg px-2 py-1.5 text-xs border outline-none" style={{ borderColor: "var(--rtm-border-light)", background: "var(--rtm-surface)" }}>
              {classifications.map((c) => <option key={c}>{c}</option>)}
            </select>
            <span className="text-xs font-semibold ml-auto" style={{ color: "var(--rtm-text-muted)" }}>{filteredCalls.length} calls</span>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Call Table */}
            <div className="xl:col-span-2">
              <SectionWrapper title="Call Log" description="AI-analyzed calls grouped by client, service, and classification">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[900px]">
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                        {["Caller", "Client", "Service", "Lead Source", "Date", "Duration", "AI Classification", "Quality", "Follow-Up"].map((h) => (
                          <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCalls.map((call) => {
                        const cfg = classificationConfig[call.classification];
                        return (
                          <tr
                            key={call.id}
                            onClick={() => setSelectedCall(call)}
                            className="hover:bg-slate-50/50 transition-colors cursor-pointer"
                            style={{
                              borderBottom: "1px solid var(--rtm-border-light)",
                              background: selectedCall?.id === call.id ? "var(--rtm-blue-light)" : undefined,
                            }}
                          >
                            <td className="py-2.5 px-3">
                              <div className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{call.caller}</div>
                              <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{call.callerPhone}</div>
                            </td>
                            <td className="py-2.5 px-3 text-xs font-medium whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{call.client}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{call.serviceType}</span>
                            </td>
                            <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{call.leadSource}</td>
                            <td className="py-2.5 px-3">
                              <div className="text-xs font-medium whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{call.date}</div>
                              <div className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{call.time}</div>
                            </td>
                            <td className="py-2.5 px-3 text-xs font-mono whitespace-nowrap" style={{ color: "var(--rtm-text-secondary)" }}>{call.duration}</td>
                            <td className="py-2.5 px-3 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                                {call.classification}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {call.leadQualityScore > 0 ? (
                                <span
                                  className="text-xs font-bold"
                                  style={{ color: call.leadQualityScore >= 80 ? "#059669" : call.leadQualityScore >= 60 ? "#D97706" : "#DC2626" }}
                                >
                                  {call.leadQualityScore}
                                </span>
                              ) : (
                                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              {call.followUpNeeded ? (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#FEF2F2", color: "#DC2626" }}>Yes</span>
                              ) : (
                                <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionWrapper>
            </div>

            {/* Call Detail Panel */}
            <div>
              {selectedCall ? (
                <SectionWrapper title="AI Call Analysis" description={selectedCall.client}>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-base" style={{ color: "var(--rtm-text-primary)" }}>{selectedCall.caller}</div>
                        <div className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{selectedCall.callerPhone}</div>
                      </div>
                      <button onClick={() => setSelectedCall(null)} className="text-sm px-1.5 py-0.5 rounded" style={{ color: "var(--rtm-text-muted)" }}>✕</button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border" style={{ background: classificationConfig[selectedCall.classification].bg, color: classificationConfig[selectedCall.classification].color, borderColor: classificationConfig[selectedCall.classification].border }}>{selectedCall.classification}</span>
                      <span className="text-xs font-semibold" style={{ color: sentimentColor[selectedCall.sentiment] }}>{selectedCall.sentiment}</span>
                    </div>

                    {/* AI Summary */}
                    <div className="rounded-lg p-3" style={{ background: "#ECFEFF", border: "1px solid #A5F3FC" }}>
                      <div className="text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "#0E7490" }}>AI Call Summary</div>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--rtm-text-primary)" }}>{selectedCall.summary}</p>
                    </div>

                    {/* Call Metadata */}
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Service", value: selectedCall.serviceType },
                        { label: "Lead Source", value: selectedCall.leadSource },
                        { label: "Location", value: selectedCall.location },
                        { label: "Duration", value: selectedCall.duration },
                        { label: "Booking Outcome", value: selectedCall.bookingOutcome },
                        { label: "Quality Score", value: selectedCall.leadQualityScore > 0 ? `${selectedCall.leadQualityScore}/100` : "N/A" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg p-2.5" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                          <div className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</div>
                          <div className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Analysis fields */}
                    {[
                      { label: "Service Requested", value: selectedCall.serviceRequested },
                      { label: "Budget Mentioned", value: selectedCall.budgetMentioned },
                      { label: "Competitor Mention", value: selectedCall.competitorMention },
                      ...(selectedCall.upsellOpportunity !== "None" ? [{ label: "Upsell Opportunity", value: selectedCall.upsellOpportunity }] : []),
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center py-1.5" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                        <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</span>
                        <span className="text-xs font-medium" style={{ color: "var(--rtm-text-primary)" }}>{item.value}</span>
                      </div>
                    ))}

                    {selectedCall.objections.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>Objections Raised</div>
                        {selectedCall.objections.map((obj) => (
                          <div key={obj} className="text-xs px-2 py-1 rounded mb-1" style={{ background: "#FEF2F2", color: "#B91C1C" }}>{obj}</div>
                        ))}
                      </div>
                    )}

                    {selectedCall.actionItems.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "var(--rtm-text-muted)" }}>Action Items</div>
                        {selectedCall.actionItems.map((item) => (
                          <div key={item} className="flex items-start gap-2 text-xs mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#0F766E" }} />
                            {item}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap pt-1">
                      <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#0F766E", background: "#0F766E15", borderColor: "#0F766E40" }}>Log Action</button>
                      {selectedCall.followUpNeeded && (
                        <button className="text-xs font-semibold px-3 py-2 rounded-lg border" style={{ color: "#D97706", background: "#D9770615", borderColor: "#D9770640" }}>Create Follow-Up</button>
                      )}
                    </div>
                  </div>
                </SectionWrapper>
              ) : (
                <SectionWrapper title="AI Call Analysis" description="Select a call to view full AI analysis">
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--rtm-bg-secondary)", border: "1px solid var(--rtm-border-light)" }}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: "var(--rtm-text-muted)" }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Select a call to view AI analysis, classification, and action items.</p>
                  </div>
                </SectionWrapper>
              )}

              {/* Classification Legend */}
              <div className="mt-4">
                <SectionWrapper title="Classification Legend" description="AI classification types">
                  <div className="space-y-1.5">
                    {(Object.keys(classificationConfig) as CallClassification[]).map((cls) => {
                      const cfg = classificationConfig[cls];
                      return (
                        <div key={cls} className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                          <span className="text-xs" style={{ color: "var(--rtm-text-secondary)" }}>{cls}</span>
                        </div>
                      );
                    })}
                  </div>
                </SectionWrapper>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Client Dashboard View ── */}
      {activeView === "client" && (
        <SectionWrapper title="Client Call Dashboard" description="Call performance, lead quality, and booking rates per client">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {["Client", "Total Calls", "Qualified Leads", "Booked Leads", "Booking %", "Spam %", "Missed Opp.", "Lead Quality Score", "Top Services", "Trend"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientPerformance.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    <td className="py-2.5 px-3 font-semibold whitespace-nowrap" style={{ color: "var(--rtm-text-primary)" }}>{row.client}</td>
                    <td className="py-2.5 px-3 text-center font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{row.totalCalls}</td>
                    <td className="py-2.5 px-3 text-center font-semibold" style={{ color: "#059669" }}>{row.qualifiedLeads}</td>
                    <td className="py-2.5 px-3 text-center font-bold" style={{ color: "#065F46" }}>{row.bookedLeads}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm font-bold" style={{ color: row.bookingPct >= 70 ? "#059669" : row.bookingPct >= 60 ? "#D97706" : "#DC2626" }}>
                        {row.bookingPct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm font-bold" style={{ color: row.spamPct > 12 ? "#DC2626" : "#64748B" }}>{row.spamPct}%</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm font-bold" style={{ color: row.missedOpp > 5 ? "#DC2626" : "#D97706" }}>{row.missedOpp}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full" style={{ background: "var(--rtm-border-light)", maxWidth: 60 }}>
                          <div className="h-full rounded-full" style={{ width: `${row.qualityScore}%`, background: row.qualityScore >= 80 ? "#059669" : row.qualityScore >= 65 ? "#D97706" : "#DC2626" }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: row.qualityScore >= 80 ? "#059669" : row.qualityScore >= 65 ? "#D97706" : "#DC2626" }}>{row.qualityScore}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {row.topServices.map((s) => (
                          <span key={s} className="text-xs px-1.5 py-0.5 rounded" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm font-bold" style={{ color: row.trend === "up" ? "#059669" : row.trend === "down" ? "#DC2626" : "#D97706" }}>
                        {row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionWrapper>
      )}

      {/* ── Service Dashboard View ── */}
      {activeView === "service" && (
        <SectionWrapper title="Service Performance Dashboard" description="Call volume, lead quality, and revenue opportunity by service type">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                  {["Service Type", "Total Calls", "Qualified Leads", "Booked Leads", "Booking %", "Lead Quality", "Revenue Opportunity"].map((h) => (
                    <th key={h} className="text-left py-2.5 px-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {servicePerformance.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors" style={{ borderBottom: "1px solid var(--rtm-border-light)" }}>
                    <td className="py-2.5 px-3">
                      <span className="text-sm font-semibold px-2 py-1 rounded-full" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>{row.service}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{row.calls}</td>
                    <td className="py-2.5 px-3 text-center font-semibold" style={{ color: "#059669" }}>{row.qualifiedLeads}</td>
                    <td className="py-2.5 px-3 text-center font-bold" style={{ color: "#065F46" }}>{row.bookedLeads}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="text-sm font-bold" style={{ color: row.bookingPct >= 75 ? "#059669" : row.bookingPct >= 65 ? "#D97706" : "#DC2626" }}>
                        {row.bookingPct}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 rounded-full" style={{ background: "var(--rtm-border-light)", width: 64 }}>
                          <div className="h-full rounded-full" style={{ width: `${row.leadQuality}%`, background: row.leadQuality >= 80 ? "#059669" : row.leadQuality >= 65 ? "#D97706" : "#DC2626" }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: row.leadQuality >= 80 ? "#059669" : row.leadQuality >= 65 ? "#D97706" : "#DC2626" }}>{row.leadQuality}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold" style={{ color: "#059669" }}>{row.revenueOpportunity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Service Summary Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mt-6 pt-6" style={{ borderTop: "1px solid var(--rtm-border-light)" }}>
            {[
              { label: "Highest Volume", value: "PPC", sub: "195 calls", color: "#1D4ED8", bg: "#EFF6FF" },
              { label: "Best Booking Rate", value: "LSA", sub: "80% booked", color: "#065F46", bg: "#D1FAE5" },
              { label: "Highest Revenue Opp.", value: "LSA", sub: "$261,000", color: "#059669", bg: "#ECFDF5" },
              { label: "Highest Lead Quality", value: "LSA", sub: "Score: 89", color: "#7C3AED", bg: "#F5F3FF" },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border p-4" style={{ background: card.bg, borderColor: `${card.color}30` }}>
                <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: card.color }}>{card.label}</div>
                <div className="text-xl font-bold" style={{ color: card.color }}>{card.value}</div>
                <div className="text-xs mt-0.5" style={{ color: card.color }}>{card.sub}</div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}
    </div>
  );
}
