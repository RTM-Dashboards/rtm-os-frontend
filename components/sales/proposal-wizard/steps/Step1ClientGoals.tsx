"use client";

import React from "react";
import { AUDIT_GOAL_CONFIG, INTAKE_SOURCE_OPTIONS, INDUSTRY_OPTIONS } from "@/lib/sales/intake-config";
import type { ProposalWizardState } from "../ProposalWizard";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Step1ClientGoalsProps {
  state: ProposalWizardState;
  onUpdate: (updates: Partial<ProposalWizardState>) => void;
}

// ─── Field Components ─────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label
      className="block text-[11px] font-bold uppercase tracking-wide mb-1"
      style={{ color: "var(--rtm-text-muted)" }}
    >
      {children}
      {required && (
        <span className="ml-1" style={{ color: "#DC2626" }}>
          *
        </span>
      )}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      >
        <option value="">Select…</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TextareaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
        style={{
          background: "var(--rtm-bg)",
          borderColor: "var(--rtm-border)",
          color: "var(--rtm-text-primary)",
        }}
      />
    </div>
  );
}

function SectionCard({ title, description, children }: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl border"
      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
    >
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: "var(--rtm-border)" }}
      >
        <p className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
          {title}
        </p>
        {description && (
          <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step1ClientGoals({ state, onUpdate }: Step1ClientGoalsProps) {
  const { clientInfo, selectedGoals } = state;

  function updateClientInfo(key: keyof typeof clientInfo, value: string) {
    onUpdate({ clientInfo: { ...clientInfo, [key]: value } });
  }

  function toggleGoal(goalId: string) {
    const current = selectedGoals;
    const updated = current.includes(goalId)
      ? current.filter((g) => g !== goalId)
      : [...current, goalId];
    onUpdate({ selectedGoals: updated });
  }

  const industryOptions = INDUSTRY_OPTIONS.map((i) => ({ value: i, label: i }));
  const sourceOptions = INTAKE_SOURCE_OPTIONS.map((s) => ({ value: s.value, label: s.label }));
  const activeGoals = AUDIT_GOAL_CONFIG.filter((g) => g.active);

  return (
    <div className="space-y-6">
      {/* Section A — Client Information */}
      <SectionCard
        title="Client Information"
        description="Enter the client and contact details for this proposal."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <TextInput
            label="Business Name"
            value={clientInfo.businessName}
            onChange={(v) => updateClientInfo("businessName", v)}
            placeholder="e.g. Metro Dental Group"
            required
          />
          <TextInput
            label="Client / Contact Name"
            value={clientInfo.name}
            onChange={(v) => updateClientInfo("name", v)}
            placeholder="e.g. Dr. Sarah Chen"
            required
          />
          <SelectInput
            label="Industry"
            value={clientInfo.industry}
            onChange={(v) => updateClientInfo("industry", v)}
            options={industryOptions}
          />
          <TextInput
            label="Location (City, State)"
            value={clientInfo.location}
            onChange={(v) => updateClientInfo("location", v)}
            placeholder="e.g. Chicago, IL"
          />
          <TextInput
            label="Website URL"
            value={clientInfo.website}
            onChange={(v) => updateClientInfo("website", v)}
            placeholder="https://www.example.com"
            type="url"
          />
          <SelectInput
            label="Lead Source"
            value={clientInfo.leadSource}
            onChange={(v) => updateClientInfo("leadSource", v)}
            options={sourceOptions}
          />
          <TextInput
            label="Contact Email"
            value={clientInfo.contactEmail}
            onChange={(v) => updateClientInfo("contactEmail", v)}
            placeholder="contact@business.com"
            type="email"
          />
          <TextInput
            label="Contact Phone"
            value={clientInfo.contactPhone}
            onChange={(v) => updateClientInfo("contactPhone", v)}
            placeholder="(555) 555-5555"
            type="tel"
          />
          <div className="sm:col-span-2">
            <TextareaInput
              label="Discovery Notes"
              value={clientInfo.notes}
              onChange={(v) => updateClientInfo("notes", v)}
              placeholder="Key observations from the initial discovery call…"
              rows={4}
            />
          </div>
        </div>
      </SectionCard>

      {/* Section B — Goal Selection */}
      <SectionCard
        title="Goal Selection"
        description="Select one or more goals that reflect what this client wants to achieve. At least one goal is required."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeGoals.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className="text-left rounded-xl border-2 px-4 py-4 transition-all focus:outline-none"
                style={{
                  background: isSelected ? "#EFF6FF" : "var(--rtm-bg)",
                  borderColor: isSelected ? "#1D4ED8" : "var(--rtm-border)",
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span
                    className="text-sm font-bold"
                    style={{
                      color: isSelected ? "#1D4ED8" : "var(--rtm-text-primary)",
                    }}
                  >
                    {goal.label}
                  </span>
                  <div
                    className="w-4 h-4 rounded border-2 flex-shrink-0 mt-0.5 flex items-center justify-center"
                    style={{
                      background: isSelected ? "#1D4ED8" : "transparent",
                      borderColor: isSelected ? "#1D4ED8" : "#D1D5DB",
                    }}
                  >
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path
                          d="M1.5 5L4 7.5L8.5 2.5"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  {goal.description}
                </p>
                <span
                  className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    background: isSelected ? "#DBEAFE" : "#F3F4F6",
                    color: isSelected ? "#1D4ED8" : "#6B7280",
                    borderColor: isSelected ? "#BFDBFE" : "#E5E7EB",
                  }}
                >
                  {goal.category}
                </span>
              </button>
            );
          })}
        </div>

        {selectedGoals.length === 0 && (
          <p
            className="mt-4 text-xs"
            style={{ color: "#DC2626" }}
          >
            At least one goal must be selected to continue.
          </p>
        )}

        {selectedGoals.length > 0 && (
          <div
            className="mt-4 rounded-lg border px-4 py-3"
            style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
          >
            <p className="text-xs font-semibold" style={{ color: "#15803D" }}>
              {selectedGoals.length} goal{selectedGoals.length !== 1 ? "s" : ""} selected
            </p>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
