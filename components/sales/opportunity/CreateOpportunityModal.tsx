"use client";

import React, { useState } from "react";
import {
  TRADE_TYPES,
  OPPORTUNITY_PRIORITIES,
} from "@/lib/sales/intake-config";
import type { OpportunityRecord } from "@/lib/sales/types";
import {
  createOpportunityFromLead,
  createOpportunityManual,
} from "@/lib/sales/opportunity-engine";

// ─── Props ────────────────────────────────────────────────────────────────────

interface LeadData {
  id: string;
  clientName: string;
  businessName: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  leadSource: string;
  assignedRep: string;
  notes: string;
}

interface CreateOpportunityModalProps {
  leadData?: LeadData;
  onCreated: (opportunity: OpportunityRecord) => void;
  onClose: () => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ASSIGNED_REPS = ["Jordan M.", "Sarah K.", "Mike T.", "Alex R."];

const LEAD_SOURCE_OPTIONS = [
  "Direct Sales",
  "Affiliate",
  "Referral",
  "Partner",
  "Website",
  "Google Ads",
  "Meta Ads",
  "Local Service Ads",
  "Google Business Profile",
  "Cold Outreach",
  "Other",
];

const SERVICE_CATALOG = [
  "SEO",
  "GBP",
  "PPC",
  "LSA",
  "Meta Ads",
  "Website",
  "Content",
];

// ─── Form State ───────────────────────────────────────────────────────────────

interface FormState {
  businessName: string;
  contactName: string;
  tradeType: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  leadSource: string;
  assignedRep: string;
  serviceInterest: string[];
  estimatedMonthlyValue: string;
  expectedCloseDate: string;
  priority: string;
  discoveryNotes: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CreateOpportunityModal({
  leadData,
  onCreated,
  onClose,
}: CreateOpportunityModalProps) {
  const [form, setForm] = useState<FormState>({
    businessName: leadData?.businessName ?? "",
    contactName: leadData?.contactName ?? "",
    tradeType: "",
    location: "",
    contactPhone: leadData?.contactPhone ?? "",
    contactEmail: leadData?.contactEmail ?? "",
    leadSource: leadData?.leadSource ?? "",
    assignedRep: leadData?.assignedRep ?? ASSIGNED_REPS[0],
    serviceInterest: [],
    estimatedMonthlyValue: "",
    expectedCloseDate: "",
    priority: "Medium",
    discoveryNotes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [created, setCreated] = useState<OpportunityRecord | null>(null);

  const prefilled = !!leadData;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleService(svc: string) {
    setForm((prev) => ({
      ...prev,
      serviceInterest: prev.serviceInterest.includes(svc)
        ? prev.serviceInterest.filter((s) => s !== svc)
        : [...prev.serviceInterest, svc],
    }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.businessName.trim()) e.businessName = "Required";
    if (!form.contactName.trim()) e.contactName = "Required";
    if (!form.tradeType) e.tradeType = "Required";
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return false;
    }
    return true;
  }

  function handleSubmit() {
    if (!validate()) return;

    let opp: OpportunityRecord;

    if (leadData) {
      opp = createOpportunityFromLead({
        id: leadData.id,
        clientName: leadData.clientName,
        businessName: form.businessName,
        contactName: form.contactName,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        leadSource: form.leadSource,
        assignedRep: form.assignedRep,
        notes: form.discoveryNotes,
      });
      // Patch extra fields
      opp = {
        ...opp,
        tradeType: form.tradeType,
        serviceInterest: form.serviceInterest,
        estimatedMonthlyValue: parseFloat(form.estimatedMonthlyValue) || 0,
        expectedCloseDate: form.expectedCloseDate,
        priority: form.priority,
      };
    } else {
      opp = createOpportunityManual({
        businessName: form.businessName,
        contactName: form.contactName,
        tradeType: form.tradeType,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        leadSource: form.leadSource,
        assignedRep: form.assignedRep,
        serviceInterest: form.serviceInterest,
        estimatedMonthlyValue: parseFloat(form.estimatedMonthlyValue) || 0,
        expectedCloseDate: form.expectedCloseDate,
        priority: form.priority,
        discoveryNotes: form.discoveryNotes,
      });
    }

    setCreated(opp);
    onCreated(opp);
  }

  // ─── Shared Input Style ───────────────────────────────────────────────────

  const inputStyle = {
    background: "var(--rtm-surface)",
    borderColor: "var(--rtm-border)",
    color: "var(--rtm-text-primary)",
  };

  const errorInputStyle = {
    background: "var(--rtm-surface)",
    borderColor: "#DC2626",
    color: "var(--rtm-text-primary)",
  };

  function fieldLabel(label: string, required?: boolean) {
    return (
      <label
        className="block text-[10px] font-bold uppercase tracking-wide mb-1"
        style={{ color: "var(--rtm-text-muted)" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "#DC2626" }}>
            *
          </span>
        )}
      </label>
    );
  }

  function prefilledBadge() {
    return (
      <span
        className="ml-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}
      >
        Pre-filled
      </span>
    );
  }

  // ─── Success State ─────────────────────────────────────────────────────────

  if (created) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
          style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}
        >
          <div className="px-6 py-8 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "#ECFDF5" }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12L10 17L19 7"
                  stroke="#059669"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2
              className="text-lg font-bold mb-1"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              Opportunity Created
            </h2>
            <p className="text-sm mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
              {created.opportunityNumber} — {created.businessName}
            </p>
            <p className="text-xs mb-6" style={{ color: "var(--rtm-text-muted)" }}>
              Start the proposal to complete the client intake.
            </p>
            <div className="flex gap-3 justify-center">
              <a
                href={`/sales/proposals?new=true&opportunityId=${created.id}`}
                className="text-sm px-5 py-2.5 rounded-lg font-bold text-white"
                style={{ background: "#2563EB" }}
              >
                Start Proposal
              </a>
              <button
                onClick={onClose}
                className="text-sm px-5 py-2.5 rounded-lg font-semibold border"
                style={{
                  background: "var(--rtm-bg)",
                  color: "var(--rtm-text-secondary)",
                  borderColor: "var(--rtm-border)",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Form ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: "var(--rtm-bg)",
          border: "1px solid var(--rtm-border)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <div>
            <h2
              className="text-base font-bold"
              style={{ color: "var(--rtm-text-primary)" }}
            >
              {prefilled ? "Create Opportunity from Lead" : "New Opportunity"}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {prefilled
                ? "Lead data has been pre-filled below."
                : "Create a new opportunity manually."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">

          {/* Business Name */}
          <div>
            {fieldLabel("Business Name", true)}
            {prefilled && prefilledBadge()}
            <input
              value={form.businessName}
              onChange={(e) => set("businessName", e.target.value)}
              placeholder="e.g. Summit Landscaping"
              className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none mt-1"
              style={errors.businessName ? errorInputStyle : inputStyle}
            />
            {errors.businessName && (
              <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>
                {errors.businessName}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Contact Name */}
            <div>
              {fieldLabel("Contact Name", true)}
              {prefilled && prefilledBadge()}
              <input
                value={form.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="e.g. Marcus Webb"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none mt-1"
                style={errors.contactName ? errorInputStyle : inputStyle}
              />
              {errors.contactName && (
                <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>
                  {errors.contactName}
                </p>
              )}
            </div>

            {/* Trade Type */}
            <div>
              {fieldLabel("Trade / Service Type", true)}
              <select
                value={form.tradeType}
                onChange={(e) => set("tradeType", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={errors.tradeType ? errorInputStyle : inputStyle}
              >
                <option value="">Select trade type...</option>
                {TRADE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.tradeType && (
                <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>
                  {errors.tradeType}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Location */}
            <div>
              {fieldLabel("Location — City, State")}
              <input
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
                placeholder="e.g. Austin, TX"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={inputStyle}
              />
            </div>

            {/* Contact Phone */}
            <div>
              {fieldLabel("Contact Phone")}
              {prefilled && prefilledBadge()}
              <input
                value={form.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="(555) 555-5555"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none mt-1"
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Contact Email */}
            <div>
              {fieldLabel("Contact Email")}
              {prefilled && prefilledBadge()}
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                placeholder="contact@business.com"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none mt-1"
                style={inputStyle}
              />
            </div>

            {/* Lead Source */}
            <div>
              {fieldLabel("Lead Source")}
              {prefilled && prefilledBadge()}
              <select
                value={form.leadSource}
                onChange={(e) => set("leadSource", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none mt-1"
                style={inputStyle}
              >
                <option value="">Select source...</option>
                {LEAD_SOURCE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Assigned Rep */}
            <div>
              {fieldLabel("Assigned Rep")}
              {prefilled && prefilledBadge()}
              <select
                value={form.assignedRep}
                onChange={(e) => set("assignedRep", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none mt-1"
                style={inputStyle}
              >
                {ASSIGNED_REPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              {fieldLabel("Priority")}
              <select
                value={form.priority}
                onChange={(e) => set("priority", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={inputStyle}
              >
                {OPPORTUNITY_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Service Interest */}
          <div>
            {fieldLabel("Service Interest")}
            <div className="flex flex-wrap gap-2 mt-1">
              {SERVICE_CATALOG.map((svc) => {
                const selected = form.serviceInterest.includes(svc);
                return (
                  <button
                    key={svc}
                    type="button"
                    onClick={() => toggleService(svc)}
                    className="text-xs px-3 py-1.5 rounded-full border font-semibold transition-colors"
                    style={{
                      background: selected ? "#EFF6FF" : "var(--rtm-bg)",
                      color: selected ? "#2563EB" : "var(--rtm-text-secondary)",
                      borderColor: selected ? "#2563EB" : "var(--rtm-border)",
                    }}
                  >
                    {svc}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Estimated Monthly Value */}
            <div>
              {fieldLabel("Estimated Monthly Value (USD)")}
              <div className="relative">
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  $
                </span>
                <input
                  type="number"
                  min="0"
                  value={form.estimatedMonthlyValue}
                  onChange={(e) => set("estimatedMonthlyValue", e.target.value)}
                  placeholder="0"
                  className="w-full text-sm rounded-lg border pl-7 pr-3 py-2 focus:outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Expected Close Date */}
            <div>
              {fieldLabel("Expected Close Date")}
              <input
                type="date"
                value={form.expectedCloseDate}
                onChange={(e) => set("expectedCloseDate", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Discovery Notes */}
          <div>
            {fieldLabel("Discovery Notes")}
            <textarea
              value={form.discoveryNotes}
              onChange={(e) => set("discoveryNotes", e.target.value)}
              placeholder="Key points from discovery call or initial contact..."
              rows={3}
              className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none resize-none"
              style={inputStyle}
            />
          </div>

          {/* GHL Sync Row */}
          <div
            className="rounded-xl border p-4"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className="text-sm font-semibold"
                    style={{ color: "var(--rtm-text-secondary)" }}
                  >
                    Sync to GHL
                  </span>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: "#F1F5F9",
                      color: "#94A3B8",
                      border: "1px solid #CBD5E1",
                    }}
                  >
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                  Requires GHL integration to be configured.
                </p>
              </div>
              {/* Disabled toggle */}
              <div className="flex-shrink-0">
                <div
                  className="relative w-10 h-6 rounded-full cursor-not-allowed"
                  style={{ background: "#CBD5E1" }}
                  title="Coming Soon"
                >
                  <div
                    className="absolute top-1 left-1 w-4 h-4 rounded-full"
                    style={{ background: "#fff" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 border-t flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
        >
          <button
            onClick={onClose}
            className="text-sm px-4 py-2 rounded-lg font-semibold border"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="text-sm px-4 py-2 rounded-lg font-bold text-white"
            style={{ background: "#2563EB" }}
          >
            Create Opportunity
          </button>
        </div>
      </div>
    </div>
  );
}
