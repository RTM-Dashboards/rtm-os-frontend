"use client";

import React, { useState } from "react";
import type { CommunicationLogEntry, CommunicationLogEntryType } from "@/lib/sales/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddLogEntryModalProps {
  opportunityId: string;
  onSubmit: (entry: Omit<CommunicationLogEntry, "id" | "opportunityId" | "loggedAt">) => void;
  onClose: () => void;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_OPTIONS: { value: CommunicationLogEntryType; label: string }[] = [
  { value: "call", label: "Call" },
  { value: "call-transcript", label: "Call Transcript" },
  { value: "email", label: "Email" },
  { value: "meeting-notes", label: "Meeting Notes" },
  { value: "sms", label: "SMS" },
  { value: "note", label: "Note" },
];

const TITLE_PLACEHOLDERS: Record<CommunicationLogEntryType, string> = {
  call: "e.g. Discovery call — June 12",
  "call-transcript": "e.g. Intro call transcript — June 12",
  email: "e.g. Follow-up email re: pricing",
  "meeting-notes": "e.g. In-person meeting — budget review",
  sms: "e.g. Quick check-in text — June 14",
  note: "e.g. Internal note on next steps",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function AddLogEntryModal({ opportunityId: _opportunityId, onSubmit, onClose }: AddLogEntryModalProps) {
  const [type, setType] = useState<CommunicationLogEntryType>("call");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [fullContent, setFullContent] = useState("");
  const [participants, setParticipants] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [attachmentNote, setAttachmentNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const showDuration = type === "call" || type === "meeting-notes";
  const showTranscriptProminent = type === "call-transcript";

  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    if (!type) newErrors.type = "Entry type is required.";
    if (!title.trim()) newErrors.title = "Title is required.";
    if (!summary.trim()) newErrors.summary = "Summary is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSubmit({
      type,
      title: title.trim(),
      summary: summary.trim(),
      fullContent: fullContent.trim(),
      loggedBy: "Jordan M.",
      participants: participants
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean),
      durationMinutes:
        showDuration && durationMinutes.trim()
          ? parseInt(durationMinutes.trim(), 10)
          : null,
      attachmentNote: attachmentNote.trim(),
    });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ pointerEvents: "none" }}
      >
        <div
          className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            background: "var(--rtm-surface)",
            border: "1px solid var(--rtm-border)",
            maxHeight: "90vh",
            pointerEvents: "auto",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
          >
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "#059669" }}
              >
                Communication Log
              </p>
              <h2
                className="text-base font-bold mt-0.5"
                style={{ color: "var(--rtm-text-primary)" }}
              >
                Add Log Entry
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
              style={{ background: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
            >
              x
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Entry Type */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Entry Type <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CommunicationLogEntryType)}
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: errors.type ? "#DC2626" : "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-[10px] mt-1" style={{ color: "#DC2626" }}>
                  {errors.type}
                </p>
              )}
            </div>

            {/* Title */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Title <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={TITLE_PLACEHOLDERS[type]}
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: errors.title ? "#DC2626" : "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
              {errors.title && (
                <p className="text-[10px] mt-1" style={{ color: "#DC2626" }}>
                  {errors.title}
                </p>
              )}
            </div>

            {/* Summary */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Summary <span style={{ color: "#DC2626" }}>*</span>
              </label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief summary of what was discussed or communicated"
                rows={3}
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none resize-none"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: errors.summary ? "#DC2626" : "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
              {errors.summary && (
                <p className="text-[10px] mt-1" style={{ color: "#DC2626" }}>
                  {errors.summary}
                </p>
              )}
            </div>

            {/* Full Content / Transcript */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                {showTranscriptProminent ? "Full Transcript" : "Additional Notes"}
                <span className="ml-1 font-normal normal-case" style={{ color: "var(--rtm-text-muted)" }}>
                  (optional)
                </span>
              </label>
              <textarea
                value={fullContent}
                onChange={(e) => setFullContent(e.target.value)}
                placeholder={
                  showTranscriptProminent
                    ? "Paste the full call transcript here, or any additional detail"
                    : "Any additional detail, context, or follow-up notes"
                }
                rows={showTranscriptProminent ? 8 : 3}
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none resize-none font-mono"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-secondary)",
                }}
              />
            </div>

            {/* Participants */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Participants
                <span className="ml-1 font-normal normal-case" style={{ color: "var(--rtm-text-muted)" }}>
                  (optional, comma-separated)
                </span>
              </label>
              <input
                type="text"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                placeholder="e.g. Jordan M., Marcus Webb"
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
            </div>

            {/* Duration (conditional) */}
            {showDuration && (
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                  style={{ color: "var(--rtm-text-muted)" }}
                >
                  Duration (minutes)
                  <span className="ml-1 font-normal normal-case" style={{ color: "var(--rtm-text-muted)" }}>
                    (optional)
                  </span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
                  style={{
                    background: "var(--rtm-bg)",
                    borderColor: "var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
              </div>
            )}

            {/* Attachment Note */}
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-wide mb-1.5"
                style={{ color: "var(--rtm-text-muted)" }}
              >
                Attachment Note
                <span className="ml-1 font-normal normal-case" style={{ color: "var(--rtm-text-muted)" }}>
                  (optional)
                </span>
              </label>
              <input
                type="text"
                value={attachmentNote}
                onChange={(e) => setAttachmentNote(e.target.value)}
                placeholder="Note about any attached file (e.g. recording link, document name)"
                className="w-full text-xs rounded-lg border px-3 py-2 focus:outline-none"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: "var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-5 py-4 border-t flex-shrink-0"
            style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)" }}
          >
            <button
              onClick={onClose}
              className="text-xs font-semibold px-4 py-2 rounded-lg border"
              style={{
                background: "var(--rtm-surface)",
                color: "var(--rtm-text-secondary)",
                borderColor: "var(--rtm-border)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="text-xs font-bold px-5 py-2 rounded-lg border transition-opacity hover:opacity-90"
              style={{
                background: "#059669",
                color: "#fff",
                borderColor: "#047857",
              }}
            >
              Save Entry
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
