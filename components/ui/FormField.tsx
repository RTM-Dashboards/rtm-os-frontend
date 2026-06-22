"use client";

// RTM OS — Standard Form Fields
// Consistent inputs, dropdowns, multi-selects, date pickers, validation, save actions.

import React, { useState, useRef, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BaseFieldProps {
  label: string;
  name?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// ── Label + wrapper ───────────────────────────────────────────────────────────

function FieldWrapper({ label, name, description, error, required, children, className = "" }: BaseFieldProps & { children: React.ReactNode }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={name}
        className="text-xs font-semibold"
        style={{ color: "var(--rtm-text-primary)" }}
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs font-medium" style={{ color: "#DC2626" }}>{error}</p>
      )}
      {description && !error && (
        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{description}</p>
      )}
    </div>
  );
}

const fieldStyle = (error?: string, disabled?: boolean): React.CSSProperties => ({
  background: disabled ? "var(--rtm-bg)" : "var(--rtm-surface)",
  border: `1px solid ${error ? "#FECACA" : "var(--rtm-border)"}`,
  color: "var(--rtm-text-primary)",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  opacity: disabled ? 0.65 : 1,
  cursor: disabled ? "not-allowed" : "text",
  transition: "border-color 0.15s",
});

// ── Text Input ────────────────────────────────────────────────────────────────

export interface TextInputProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "url" | "tel" | "password" | "number";
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export function TextInput({ label, name, description, error, required, disabled, className, value, onChange, placeholder, type = "text", prefix, suffix }: TextInputProps) {
  return (
    <FieldWrapper label={label} name={name} description={description} error={error} required={required} className={className}>
      <div className="relative flex items-center">
        {prefix && (
          <span
            className="absolute left-3 pointer-events-none text-sm"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {prefix}
          </span>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            ...fieldStyle(error, disabled),
            paddingLeft: prefix ? "2.5rem" : undefined,
            paddingRight: suffix ? "2.5rem" : undefined,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--rtm-blue)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = error ? "#FECACA" : "var(--rtm-border)"; }}
        />
        {suffix && (
          <span
            className="absolute right-3 pointer-events-none text-sm"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            {suffix}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────────────

export interface TextareaProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function Textarea({ label, name, description, error, required, disabled, className, value, onChange, placeholder, rows = 4 }: TextareaProps) {
  return (
    <FieldWrapper label={label} name={name} description={description} error={error} required={required} className={className}>
      <textarea
        id={name}
        name={name}
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        style={{ ...fieldStyle(error, disabled), resize: "vertical", cursor: disabled ? "not-allowed" : "text" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--rtm-blue)"; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = error ? "#FECACA" : "var(--rtm-border)"; }}
      />
    </FieldWrapper>
  );
}

// ── Select / Dropdown ─────────────────────────────────────────────────────────

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({ label, name, description, error, required, disabled, className, value, onChange, options, placeholder }: SelectProps) {
  return (
    <FieldWrapper label={label} name={name} description={description} error={error} required={required} className={className}>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          style={{ ...fieldStyle(error, disabled), paddingRight: "2.5rem", appearance: "none", cursor: disabled ? "not-allowed" : "pointer" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--rtm-blue)"; }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = error ? "#FECACA" : "var(--rtm-border)"; }}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "var(--rtm-text-muted)" }}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </FieldWrapper>
  );
}

// ── Multi-Select ──────────────────────────────────────────────────────────────

export interface MultiSelectProps extends BaseFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function MultiSelect({ label, name, description, error, required, disabled, className, value, onChange, options, placeholder = "Select options..." }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (v: string) => {
    if (value.includes(v)) onChange(value.filter((x) => x !== v));
    else onChange([...value, v]);
  };

  const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label);

  return (
    <FieldWrapper label={label} name={name} description={description} error={error} required={required} className={className}>
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setOpen((o) => !o)}
          className="w-full flex items-center justify-between gap-2 text-left"
          style={{ ...fieldStyle(error, disabled), cursor: disabled ? "not-allowed" : "pointer" }}
        >
          <span className="flex-1 truncate text-sm" style={{ color: selectedLabels.length ? "var(--rtm-text-primary)" : "var(--rtm-text-muted)" }}>
            {selectedLabels.length ? selectedLabels.join(", ") : placeholder}
          </span>
          <svg className="w-4 h-4 flex-shrink-0" style={{ color: "var(--rtm-text-muted)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div
            className="absolute z-50 mt-1 w-full rounded-lg border shadow-lg overflow-auto max-h-48"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
          >
            {options.map((o) => {
              const checked = value.includes(o.value);
              return (
                <label
                  key={o.value}
                  className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-sm"
                  style={{ color: "var(--rtm-text-primary)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLLabelElement).style.background = "var(--rtm-bg)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLLabelElement).style.background = "transparent"; }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={o.disabled}
                    onChange={() => toggle(o.value)}
                    className="rounded"
                  />
                  {o.label}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}

// ── Date Picker ───────────────────────────────────────────────────────────────

export interface DatePickerProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
}

export function DatePicker({ label, name, description, error, required, disabled, className, value, onChange, min, max }: DatePickerProps) {
  return (
    <FieldWrapper label={label} name={name} description={description} error={error} required={required} className={className}>
      <input
        id={name}
        name={name}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        style={{ ...fieldStyle(error, disabled), cursor: disabled ? "not-allowed" : "pointer" }}
        onFocus={(e) => { e.currentTarget.style.borderColor = "var(--rtm-blue)"; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = error ? "#FECACA" : "var(--rtm-border)"; }}
      />
    </FieldWrapper>
  );
}

// ── Form actions bar ──────────────────────────────────────────────────────────

interface FormActionsProps {
  onSave?: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saving?: boolean;
  disabled?: boolean;
  align?: "left" | "right";
}

export function FormActions({ onSave, onCancel, saveLabel = "Save", cancelLabel = "Cancel", saving = false, disabled = false, align = "right" }: FormActionsProps) {
  const spinnerStyle: React.CSSProperties = { animation: "spin 1s linear infinite" };
  return (
    <div className={`flex items-center gap-2 pt-2 ${align === "right" ? "justify-end" : ""}`}>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-semibold border transition-all"
          style={{
            background: "var(--rtm-surface)",
            borderColor: "var(--rtm-border)",
            color: "var(--rtm-text-secondary)",
          }}
        >
          {cancelLabel}
        </button>
      )}
      {onSave && (
        <button
          type="submit"
          onClick={onSave}
          disabled={disabled || saving}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: "var(--rtm-blue)",
            color: "#fff",
            opacity: disabled || saving ? 0.6 : 1,
            cursor: disabled || saving ? "not-allowed" : "pointer",
            border: "none",
          }}
        >
          {saving && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" style={spinnerStyle}>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {saving ? "Saving..." : saveLabel}
        </button>
      )}
    </div>
  );
}
