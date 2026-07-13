"use client";

/**
 * Settings > Forms & Templates > Form Builder
 *
 * Real, working field editor for the AM Onboarding Intake Form schema.
 * Replaces the former ConfigPlaceholder stub.
 *
 * Scope (per spec): list / add / edit / reorder / remove fields.
 * Not a drag-and-drop visual builder - a list-based CRUD admin tool.
 *
 * Persistence: PUT /api/onboarding-field-schema (file-backed JSON store).
 * The AM onboarding wizard reads the same endpoint, so changes here are
 * reflected in the wizard on the next page load without a code deploy.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";

// ── Types (mirrored from API route - no client dependency on API module) ──────

type OnboardingFieldType =
  | "text"
  | "email"
  | "phone"
  | "url"
  | "date"
  | "select"
  | "multiselect"
  | "textarea"
  | "checkbox"
  | "number";

type FieldDefaultAssignee = "am" | "client";

type SalesPrefillKey =
  | "clientName"
  | "email"
  | "industry"
  | "salesOwner"
  | "referralSource"
  | "affiliateName"
  | "monthlyValue"
  | "primaryContact"
  | "phone"
  | "website"
  | "location"
  | "businessSize"
  | "intakeSource"
  | "selectedGoals"
  | "discoveryNotes";

type OnboardingSectionId =
  | "client-basics"
  | "engagement-setup"
  | "service-delivery"
  | "client-assets"
  | "am-internal";

interface AMOnboardingFieldDef {
  id: string;
  label: string;
  description?: string;
  type: OnboardingFieldType;
  required: boolean;
  salesPrefillKey?: SalesPrefillKey;
  defaultAssignee: FieldDefaultAssignee;
  options?: string[];
  placeholder?: string;
  section: OnboardingSectionId;
}

interface AMOnboardingSection {
  id: OnboardingSectionId;
  label: string;
  description: string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const FIELD_TYPES: { value: OnboardingFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "url", label: "URL" },
  { value: "date", label: "Date" },
  { value: "number", label: "Number" },
  { value: "select", label: "Select (single)" },
  { value: "multiselect", label: "Multi-select" },
  { value: "textarea", label: "Text Area" },
  { value: "checkbox", label: "Checkbox" },
];

const SALES_PREFILL_KEYS: SalesPrefillKey[] = [
  "clientName",
  "email",
  "industry",
  "salesOwner",
  "referralSource",
  "affiliateName",
  "monthlyValue",
  "primaryContact",
  "phone",
  "website",
  "location",
  "businessSize",
  "intakeSource",
  "selectedGoals",
  "discoveryNotes",
];

const FIELD_TYPE_NEEDS_OPTIONS: Set<OnboardingFieldType> = new Set([
  "select",
  "multiselect",
]);

// ── Helpers ────────────────────────────────────────────────────────────────────

function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeId(label: string, existing: AMOnboardingFieldDef[]): string {
  const base = slugify(label) || "field";
  const ids = new Set(existing.map((f) => f.id));
  if (!ids.has(base)) return base;
  let i = 2;
  while (ids.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

// ── Empty field draft ──────────────────────────────────────────────────────────

function emptyDraft(section: OnboardingSectionId): Omit<AMOnboardingFieldDef, "id"> {
  return {
    label: "",
    type: "text",
    required: false,
    defaultAssignee: "am",
    section,
    description: "",
    placeholder: "",
    options: [],
  };
}

// ── Save indicator ─────────────────────────────────────────────────────────────

type SaveState = "idle" | "saving" | "saved" | "error";

function SaveBanner({ state, error }: { state: SaveState; error?: string }) {
  if (state === "idle") return null;
  if (state === "saving") {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#1B4FD8]/20 bg-white px-4 py-3 shadow-lg">
        <span className="inline-block w-4 h-4 border-2 border-[#E4E8F0] border-t-[#1B4FD8] rounded-full animate-spin" />
        <span className="text-sm font-semibold text-[#1B4FD8]">Saving...</span>
      </div>
    );
  }
  if (state === "saved") {
    return (
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#059669]/30 bg-white px-4 py-3 shadow-lg">
        <span className="text-[#059669] text-base">✓</span>
        <span className="text-sm font-semibold text-[#059669]">Schema saved</span>
      </div>
    );
  }
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-xl border border-[#DC2626]/30 bg-white px-4 py-3 shadow-lg">
      <span className="text-[#DC2626] text-base">✗</span>
      <span className="text-sm font-semibold text-[#DC2626]">Save failed{error ? `: ${error}` : ""}</span>
    </div>
  );
}

// ── Options editor (for select / multiselect) ──────────────────────────────────

function OptionsEditor({
  options,
  onChange,
}: {
  options: string[];
  onChange: (opts: string[]) => void;
}) {
  const [draft, setDraft] = useState(options.join("\n"));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync from outside if options prop changes (e.g. switching fields)
  const prevOptions = useRef(options);
  if (options !== prevOptions.current) {
    prevOptions.current = options;
    setDraft(options.join("\n"));
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setDraft(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const parsed = val
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      onChange(parsed);
    }, 200);
  }

  return (
    <div>
      <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
        Options <span className="font-normal text-[#9AAABB]">(one per line)</span>
      </label>
      <textarea
        rows={5}
        value={draft}
        onChange={handleChange}
        placeholder={"Option A\nOption B\nOption C"}
        className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30 placeholder:text-[#9AAABB] font-mono"
      />
      <p className="mt-0.5 text-[10px] text-[#9AAABB]">
        {options.length} option{options.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

// ── Field form (add / edit) ────────────────────────────────────────────────────

interface FieldFormProps {
  draft: Omit<AMOnboardingFieldDef, "id">;
  sections: AMOnboardingSection[];
  onChange: (patch: Partial<Omit<AMOnboardingFieldDef, "id">>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isEdit?: boolean;
}

function FieldForm({
  draft,
  sections,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
}: FieldFormProps) {
  const needsOptions = FIELD_TYPE_NEEDS_OPTIONS.has(draft.type);

  return (
    <div className="rounded-xl border border-[#1B4FD8]/20 bg-[#EBF0FD] p-5 space-y-4">
      {/* Label */}
      <div>
        <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
          Label <span className="text-[#DC2626]">*</span>
        </label>
        <input
          type="text"
          value={draft.label}
          onChange={(e) => onChange({ label: e.target.value })}
          placeholder="e.g. Primary Contact Name"
          className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
        />
      </div>

      {/* Type + Section row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
            Type <span className="text-[#DC2626]">*</span>
          </label>
          <select
            value={draft.type}
            onChange={(e) =>
              onChange({
                type: e.target.value as OnboardingFieldType,
                // Clear options if switching away from select types
                options: FIELD_TYPE_NEEDS_OPTIONS.has(
                  e.target.value as OnboardingFieldType
                )
                  ? draft.options ?? []
                  : [],
              })
            }
            className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
          >
            {FIELD_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>
                {ft.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
            Section <span className="text-[#DC2626]">*</span>
          </label>
          <select
            value={draft.section}
            onChange={(e) =>
              onChange({ section: e.target.value as OnboardingSectionId })
            }
            className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
          >
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Required + Default assignee row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
            Default Assignee
          </label>
          <select
            value={draft.defaultAssignee}
            onChange={(e) =>
              onChange({
                defaultAssignee: e.target.value as FieldDefaultAssignee,
              })
            }
            className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
          >
            <option value="am">AM fills in</option>
            <option value="client">Send to Client</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
            Sales Prefill Key
          </label>
          <select
            value={draft.salesPrefillKey ?? ""}
            onChange={(e) =>
              onChange({
                salesPrefillKey: (e.target.value as SalesPrefillKey) || undefined,
              })
            }
            className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
          >
            <option value="">None</option>
            {SALES_PREFILL_KEYS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Required toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={draft.required}
          onChange={(e) => onChange({ required: e.target.checked })}
          className="w-4 h-4 rounded border-[#E4E8F0] text-[#1B4FD8]"
        />
        <span className="text-sm font-medium text-[#0F1C38]">Required field</span>
      </label>

      {/* Placeholder */}
      <div>
        <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
          Placeholder text
        </label>
        <input
          type="text"
          value={draft.placeholder ?? ""}
          onChange={(e) => onChange({ placeholder: e.target.value || undefined })}
          placeholder="Optional hint shown inside the input"
          className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-[#5A6A85] mb-1">
          Help text / description
        </label>
        <textarea
          rows={2}
          value={draft.description ?? ""}
          onChange={(e) =>
            onChange({ description: e.target.value || undefined })
          }
          placeholder="Optional helper text shown below the field"
          className="w-full rounded-lg border border-[#E4E8F0] bg-white px-3 py-2 text-sm text-[#0F1C38] focus:outline-none focus:ring-2 focus:ring-[#1B4FD8]/30"
        />
      </div>

      {/* Options (select / multiselect only) */}
      {needsOptions && (
        <OptionsEditor
          options={draft.options ?? []}
          onChange={(opts) => onChange({ options: opts })}
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!draft.label.trim()}
          className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
          style={{ background: "#1B4FD8" }}
        >
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#E4E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#5A6A85] hover:bg-[#F7F9FC] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Field row ──────────────────────────────────────────────────────────────────

interface FieldRowProps {
  field: AMOnboardingFieldDef;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onRemove: () => void;
}

function FieldRow({
  field,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
}: FieldRowProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-xl border border-[#E4E8F0] bg-white px-4 py-3 flex items-start gap-3">
      {/* Reorder */}
      <div className="flex flex-col gap-0.5 pt-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          title="Move up"
          className="w-6 h-6 flex items-center justify-center rounded text-[#9AAABB] hover:text-[#1B4FD8] hover:bg-[#EBF0FD] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        >
          ▲
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          title="Move down"
          className="w-6 h-6 flex items-center justify-center rounded text-[#9AAABB] hover:text-[#1B4FD8] hover:bg-[#EBF0FD] disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-xs"
        >
          ▼
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-[#0F1C38]">
            {field.label}
          </span>
          {field.required && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-[#DC2626] bg-[#FEE2E2] rounded-full px-1.5 py-0.5">
              Required
            </span>
          )}
          <span className="text-[10px] font-medium text-[#5A6A85] bg-[#F7F9FC] border border-[#E4E8F0] rounded-full px-1.5 py-0.5">
            {FIELD_TYPES.find((ft) => ft.value === field.type)?.label ??
              field.type}
          </span>
          <span className="text-[10px] font-medium text-[#5A6A85] bg-[#F7F9FC] border border-[#E4E8F0] rounded-full px-1.5 py-0.5">
            {field.defaultAssignee === "am" ? "AM fills" : "→ Client"}
          </span>
          {field.salesPrefillKey && (
            <span className="text-[10px] font-medium text-[#1B4FD8] bg-[#EBF0FD] border border-[#1B4FD8]/20 rounded-full px-1.5 py-0.5">
              prefill: {field.salesPrefillKey}
            </span>
          )}
        </div>
        {field.description && (
          <p className="text-xs text-[#9AAABB] mt-0.5 truncate">
            {field.description}
          </p>
        )}
        {FIELD_TYPE_NEEDS_OPTIONS.has(field.type) && (
          <p className="text-[10px] text-[#9AAABB] mt-0.5">
            {field.options?.length ?? 0} option
            {field.options?.length !== 1 ? "s" : ""}
            {field.options && field.options.length > 0
              ? `: ${field.options.slice(0, 3).join(", ")}${field.options.length > 3 ? "..." : ""}`
              : ""}
          </p>
        )}
        <p className="text-[10px] font-mono text-[#9AAABB]/70 mt-0.5">
          id: {field.id}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg border border-[#E4E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#5A6A85] hover:bg-[#F7F9FC] hover:border-[#1B4FD8]/40 hover:text-[#1B4FD8] transition-colors"
        >
          Edit
        </button>
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRemove}
              className="rounded-lg border border-[#DC2626]/30 bg-[#FEE2E2] px-2.5 py-1 text-xs font-semibold text-[#DC2626] hover:bg-[#FCA5A5]/30 transition-colors"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="rounded-lg border border-[#E4E8F0] bg-white px-2 py-1 text-xs font-semibold text-[#9AAABB] hover:bg-[#F7F9FC] transition-colors"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="rounded-lg border border-[#E4E8F0] bg-white px-2.5 py-1 text-xs font-semibold text-[#9AAABB] hover:border-[#DC2626]/30 hover:text-[#DC2626] hover:bg-[#FEE2E2]/30 transition-colors"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

// ── Section panel ──────────────────────────────────────────────────────────────

interface SectionPanelProps {
  section: AMOnboardingSection;
  fields: AMOnboardingFieldDef[];
  allFields: AMOnboardingFieldDef[];
  sections: AMOnboardingSection[];
  onFieldsChange: (updated: AMOnboardingFieldDef[]) => void;
}

function SectionPanel({
  section,
  fields,
  allFields,
  sections,
  onFieldsChange,
}: SectionPanelProps) {
  const [addingField, setAddingField] = useState(false);
  const [addDraft, setAddDraft] = useState<Omit<AMOnboardingFieldDef, "id">>(
    () => emptyDraft(section.id)
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Omit<AMOnboardingFieldDef, "id"> | null>(null);

  // Merge a section's updated fields back into the global field list,
  // preserving order of other sections.
  function mergeBack(
    sectionFields: AMOnboardingFieldDef[]
  ): AMOnboardingFieldDef[] {
    const others = allFields.filter((f) => f.section !== section.id);
    return [...others, ...sectionFields];
  }

  // --- Reorder ---
  function handleMoveUp(index: number) {
    if (index === 0) return;
    const next = [...fields];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onFieldsChange(mergeBack(next));
  }

  function handleMoveDown(index: number) {
    if (index >= fields.length - 1) return;
    const next = [...fields];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onFieldsChange(mergeBack(next));
  }

  // --- Remove ---
  function handleRemove(id: string) {
    onFieldsChange(mergeBack(fields.filter((f) => f.id !== id)));
  }

  // --- Edit ---
  function startEdit(field: AMOnboardingFieldDef) {
    setEditingId(field.id);
    setEditDraft({
      label: field.label,
      description: field.description,
      type: field.type,
      required: field.required,
      salesPrefillKey: field.salesPrefillKey,
      defaultAssignee: field.defaultAssignee,
      options: field.options ? [...field.options] : [],
      placeholder: field.placeholder,
      section: field.section,
    });
    setAddingField(false);
  }

  function submitEdit() {
    if (!editDraft || !editingId) return;
    const updated = fields.map((f) =>
      f.id === editingId
        ? {
            ...f,
            ...editDraft,
            // If section changed, keep id and update section
            section: editDraft.section,
          }
        : f
    );
    // If the section changed, move the field to a different section's sub-list.
    // We handle this by just writing it with the new section; since mergeBack
    // separates by section, it will land in the correct place after next render.
    onFieldsChange(mergeBack(updated));
    setEditingId(null);
    setEditDraft(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  // --- Add ---
  function startAdd() {
    setAddDraft(emptyDraft(section.id));
    setAddingField(true);
    setEditingId(null);
    setEditDraft(null);
  }

  function submitAdd() {
    if (!addDraft.label.trim()) return;
    const id = makeId(addDraft.label, allFields);
    const newField: AMOnboardingFieldDef = {
      id,
      label: addDraft.label.trim(),
      description: addDraft.description || undefined,
      type: addDraft.type,
      required: addDraft.required,
      salesPrefillKey: addDraft.salesPrefillKey || undefined,
      defaultAssignee: addDraft.defaultAssignee,
      options:
        FIELD_TYPE_NEEDS_OPTIONS.has(addDraft.type) &&
        addDraft.options &&
        addDraft.options.length > 0
          ? addDraft.options
          : undefined,
      placeholder: addDraft.placeholder || undefined,
      section: addDraft.section,
    };
    const sectionAfterAdd = [
      ...fields.filter((f) => f.section === addDraft.section),
      newField,
    ];
    // If the section changed (user picked a different section in the form),
    // the field belongs to a different panel - add it to that section's list.
    const otherSectionFields = allFields.filter(
      (f) => f.section !== section.id && f.section !== addDraft.section
    );
    const thisSectionRemainder =
      addDraft.section === section.id
        ? []
        : allFields.filter((f) => f.section === section.id);

    if (addDraft.section === section.id) {
      onFieldsChange(mergeBack([...fields, newField]));
    } else {
      // Field is going to a different section
      const targetSection = allFields.filter(
        (f) => f.section === addDraft.section
      );
      const allUpdated = [
        ...otherSectionFields,
        ...thisSectionRemainder,
        ...targetSection,
        newField,
      ];
      onFieldsChange(allUpdated);
    }

    setAddingField(false);
    setAddDraft(emptyDraft(section.id));
  }

  function cancelAdd() {
    setAddingField(false);
    setAddDraft(emptyDraft(section.id));
  }

  return (
    <div className="rounded-2xl border border-[#E4E8F0] bg-white shadow-sm overflow-hidden">
      {/* Section header */}
      <div className="px-5 py-4 border-b border-[#E4E8F0] bg-[#F4F7FF] flex items-start justify-between">
        <div>
          <h3 className="text-sm font-bold text-[#0F1C38]">{section.label}</h3>
          <p className="text-xs text-[#9AAABB] mt-0.5">{section.description}</p>
          <p className="text-[10px] font-mono text-[#9AAABB]/60 mt-0.5">
            id: {section.id}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <span className="text-xs text-[#5A6A85] font-medium">
            {fields.length} field{fields.length !== 1 ? "s" : ""}
          </span>
          <button
            type="button"
            onClick={startAdd}
            className="rounded-lg border border-[#1B4FD8]/30 bg-[#EBF0FD] px-3 py-1.5 text-xs font-semibold text-[#1B4FD8] hover:bg-[#EBF0FD]/70 transition-colors"
          >
            + Add field
          </button>
        </div>
      </div>

      {/* Fields list */}
      <div className="px-5 py-4 space-y-2">
        {fields.length === 0 && !addingField && (
          <p className="text-sm text-[#9AAABB] italic py-2">
            No fields in this section yet.
          </p>
        )}

        {fields.map((field, index) => (
          <React.Fragment key={field.id}>
            {editingId === field.id && editDraft ? (
              <FieldForm
                draft={editDraft}
                sections={sections}
                onChange={(patch) =>
                  setEditDraft((prev) => (prev ? { ...prev, ...patch } : prev))
                }
                onSubmit={submitEdit}
                onCancel={cancelEdit}
                submitLabel="Save changes"
                isEdit
              />
            ) : (
              <FieldRow
                field={field}
                isFirst={index === 0}
                isLast={index === fields.length - 1}
                onMoveUp={() => handleMoveUp(index)}
                onMoveDown={() => handleMoveDown(index)}
                onEdit={() => startEdit(field)}
                onRemove={() => handleRemove(field.id)}
              />
            )}
          </React.Fragment>
        ))}

        {/* Add form */}
        {addingField && (
          <FieldForm
            draft={addDraft}
            sections={sections}
            onChange={(patch) =>
              setAddDraft((prev) => ({ ...prev, ...patch }))
            }
            onSubmit={submitAdd}
            onCancel={cancelAdd}
            submitLabel="Add field"
          />
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function FormBuilderPage() {
  const [sections, setSections] = useState<AMOnboardingSection[]>([]);
  const [fields, setFields] = useState<AMOnboardingFieldDef[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | undefined>(undefined);
  const saveBannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load schema from API
  const loadSchema = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/onboarding-field-schema");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as {
        sections: AMOnboardingSection[];
        fields: AMOnboardingFieldDef[];
      };
      setSections(data.sections);
      setFields(data.fields);
    } catch (err) {
      setLoadError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchema();
  }, [loadSchema]);

  // Persist schema to API
  async function saveSchema(
    updatedSections: AMOnboardingSection[],
    updatedFields: AMOnboardingFieldDef[]
  ) {
    if (saveBannerTimer.current) clearTimeout(saveBannerTimer.current);
    setSaveState("saving");
    setSaveError(undefined);
    try {
      const res = await fetch("/api/onboarding-field-schema", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: updatedSections,
          fields: updatedFields,
        }),
      });
      if (!res.ok) {
        const errData = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(errData.error ?? `HTTP ${res.status}`);
      }
      setSaveState("saved");
      saveBannerTimer.current = setTimeout(() => setSaveState("idle"), 3000);
    } catch (err) {
      setSaveError(String(err));
      setSaveState("error");
      saveBannerTimer.current = setTimeout(() => setSaveState("idle"), 5000);
    }
  }

  // When fields change (via section panels), save immediately
  function handleFieldsChange(updated: AMOnboardingFieldDef[]) {
    setFields(updated);
    void saveSchema(sections, updated);
  }

  // Fields grouped by section (respecting section order + field array order)
  function fieldsForSection(sectionId: OnboardingSectionId): AMOnboardingFieldDef[] {
    return fields.filter((f) => f.section === sectionId);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1B4FD8] mb-1">
          Settings · Forms &amp; Templates
        </p>
        <h1 className="text-2xl font-bold text-[#0F1C38]">Form Builder</h1>
        <p className="text-sm text-[#5A6A85] mt-1 max-w-2xl">
          Manage the field schema for the{" "}
          <strong>AM Onboarding Intake Form</strong>. Changes take effect in
          the onboarding wizard on the next page load - no code deploy required.
          Fields are grouped by section and rendered in the order shown here.
        </p>
      </div>

      {/* Info banner */}
      <div className="rounded-xl border border-[#1B4FD8]/20 bg-[#EBF0FD] px-5 py-4">
        <p className="text-sm font-semibold text-[#1340B0]">
          How this works
        </p>
        <ul className="mt-1.5 space-y-1">
          {[
            'Use “+ Add field” inside any section to add a new field to the wizard.',
            'Use “Edit” on an existing field to change its label, type, help text, options, or assignee.',
            'Use ▲ / ▼ to reorder fields within a section.',
            'Use “Remove” (with confirmation) to delete a field. Existing stored values for that field become orphaned — safe, just not rendered.',
            'Changes are saved instantly to the file-backed store — no Save button needed.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-[#1B4FD8] mt-0.5 flex-shrink-0">·</span>
              <span className="text-xs text-[#1340B0]">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stats row */}
      {!loading && !loadError && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="rounded-lg border border-[#E4E8F0] bg-white px-4 py-2.5 text-center min-w-[80px]">
            <p className="text-xl font-bold text-[#0F1C38]">{fields.length}</p>
            <p className="text-[11px] text-[#9AAABB]">Total fields</p>
          </div>
          <div className="rounded-lg border border-[#E4E8F0] bg-white px-4 py-2.5 text-center min-w-[80px]">
            <p className="text-xl font-bold text-[#DC2626]">
              {fields.filter((f) => f.required).length}
            </p>
            <p className="text-[11px] text-[#9AAABB]">Required</p>
          </div>
          <div className="rounded-lg border border-[#E4E8F0] bg-white px-4 py-2.5 text-center min-w-[80px]">
            <p className="text-xl font-bold text-[#D97706]">
              {fields.filter((f) => f.defaultAssignee === "client").length}
            </p>
            <p className="text-[11px] text-[#9AAABB]">→ Client default</p>
          </div>
          <div className="rounded-lg border border-[#E4E8F0] bg-white px-4 py-2.5 text-center min-w-[80px]">
            <p className="text-xl font-bold text-[#1B4FD8]">{sections.length}</p>
            <p className="text-[11px] text-[#9AAABB]">Sections</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="rounded-xl border border-[#E4E8F0] bg-white px-6 py-12 text-center">
          <div className="inline-block w-6 h-6 border-2 border-[#E4E8F0] border-t-[#1B4FD8] rounded-full animate-spin mb-3" />
          <p className="text-sm text-[#9AAABB]">Loading field schema...</p>
        </div>
      )}

      {/* Load error */}
      {!loading && loadError && (
        <div className="rounded-xl border border-[#DC2626]/30 bg-[#FEE2E2]/30 px-5 py-4">
          <p className="text-sm font-semibold text-[#DC2626]">
            Failed to load schema
          </p>
          <p className="text-xs text-[#DC2626] mt-0.5">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadSchema()}
            className="mt-3 rounded-lg border border-[#DC2626]/30 px-3 py-1.5 text-xs font-semibold text-[#DC2626] hover:bg-[#FEE2E2]/30 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Section panels */}
      {!loading &&
        !loadError &&
        sections.map((section) => (
          <SectionPanel
            key={section.id}
            section={section}
            fields={fieldsForSection(section.id)}
            allFields={fields}
            sections={sections}
            onFieldsChange={handleFieldsChange}
          />
        ))}

      {/* Orphaned fields (section id not in sections list) */}
      {!loading && !loadError && (() => {
        const knownIds = new Set(sections.map((s) => s.id));
        const orphaned = fields.filter((f) => !knownIds.has(f.section));
        if (orphaned.length === 0) return null;
        return (
          <div className="rounded-xl border border-[#D97706]/30 bg-[#FFFBEB] px-5 py-4">
            <p className="text-sm font-semibold text-[#92400E]">
              Orphaned fields ({orphaned.length})
            </p>
            <p className="text-xs text-[#B45309] mt-0.5">
              These fields reference a section id that no longer exists. They
              will not appear in the wizard until their section is restored or
              they are reassigned via Edit.
            </p>
            <div className="mt-3 space-y-2">
              {orphaned.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center gap-2 rounded-lg border border-[#D97706]/20 bg-white px-3 py-2"
                >
                  <span className="text-sm font-medium text-[#0F1C38]">
                    {f.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#9AAABB]">
                    section: {f.section}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Save indicator */}
      <SaveBanner state={saveState} error={saveError} />
    </div>
  );
}
