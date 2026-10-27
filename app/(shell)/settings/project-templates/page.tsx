"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// =============================================================================
// RTM OS — Project Templates
// Route: /settings/project-templates
//
// A project template is a named, ordered set of task-list blueprints applied
// to a project together.  Creating and editing templates lives here.
// Applying a template to a project happens on the project detail page,
// next to the single-blueprint Apply control.
// =============================================================================

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlueprintSlot {
  position:    number;
  blueprintId: string;
  name:        string;
  serviceId:   string;
  department:  string;
  description: string;
}

interface ProjectTemplate {
  id:          string;
  name:        string;
  description: string;
  isActive:    boolean;
  createdAt:   string;
  updatedAt:   string;
  blueprints:  BlueprintSlot[];
}

interface AvailableBlueprint {
  id:         string;
  name:       string;
  serviceId:  string;
  department: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

// ── Editor modal ──────────────────────────────────────────────────────────────

interface EditorModalProps {
  template:           ProjectTemplate | null;  // null = create
  availableBlueprints: AvailableBlueprint[];
  onClose:            () => void;
  onSaved:            () => void;
}

function EditorModal({ template, availableBlueprints, onClose, onSaved }: EditorModalProps) {
  const isEdit = template !== null;

  const [name,        setName]        = useState(template?.name        ?? "");
  const [description, setDescription] = useState(template?.description ?? "");
  const [selected,    setSelected]    = useState<string[]>(
    template?.blueprints.map((b) => b.blueprintId) ?? []
  );
  const [saving,  setSaving]  = useState(false);
  const [errMsg,  setErrMsg]  = useState<string | null>(null);

  const toggleBlueprint = (bpId: string) => {
    setSelected((prev) =>
      prev.includes(bpId) ? prev.filter((x) => x !== bpId) : [...prev, bpId]
    );
  };

  const moveUp   = (idx: number) => {
    if (idx === 0) return;
    setSelected((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const moveDown = (idx: number) => {
    setSelected((prev) => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) { setErrMsg("Name is required."); return; }
    setSaving(true);
    setErrMsg(null);
    try {
      const method = isEdit ? "PATCH" : "POST";
      const body: Record<string, unknown> = {
        name:        name.trim(),
        description,
        blueprintIds: selected,
      };
      if (isEdit) body.id = template!.id;

      const res = await fetch("/api/project-templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok || data.error) {
        setErrMsg(data.error ?? "Save failed.");
      } else {
        onSaved();
        onClose();
      }
    } catch (err) {
      setErrMsg(String(err));
    } finally {
      setSaving(false);
    }
  };

  // Build display map for selected blueprint names
  const bpById = new Map(availableBlueprints.map((b) => [b.id, b]));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-full max-w-xl flex flex-col gap-4 overflow-y-auto"
        style={{
          background: "var(--rtm-surface)",
          border:     "1px solid var(--rtm-border)",
          maxHeight:  "90vh",
        }}
      >
        <h2 className="text-base font-black" style={{ color: "var(--rtm-text-primary)" }}>
          {isEdit ? "Edit Template" : "New Project Template"}
        </h2>

        {/* Name */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Name <span style={{ color: "#DC2626" }}>*</span>
          </label>
          <input
            className="w-full rounded-lg px-3 py-2 text-sm"
            style={{ border: "1px solid var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Home Services Starter"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Description
          </label>
          <textarea
            className="w-full rounded-lg px-3 py-2 text-sm resize-none"
            style={{ border: "1px solid var(--rtm-border)", background: "var(--rtm-bg)", color: "var(--rtm-text-primary)" }}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional — what this template is for"
          />
        </div>

        {/* Blueprint picker */}
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>
            Blueprints — check to include, drag order with arrows
          </label>
          {availableBlueprints.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No blueprints available.</p>
          ) : (
            <div
              className="rounded-lg overflow-y-auto"
              style={{ border: "1px solid var(--rtm-border)", maxHeight: 220 }}
            >
              {availableBlueprints.map((bp) => {
                const checked  = selected.includes(bp.id);
                const position = selected.indexOf(bp.id);
                return (
                  <div
                    key={bp.id}
                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer"
                    style={{
                      borderBottom: "1px solid var(--rtm-border)",
                      background:   checked ? "rgba(59,130,246,0.04)" : "transparent",
                    }}
                    onClick={() => toggleBlueprint(bp.id)}
                  >
                    <input
                      type="checkbox"
                      readOnly
                      checked={checked}
                      className="pointer-events-none"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>
                        {bp.name || bp.serviceId}
                      </p>
                      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{bp.department}</p>
                    </div>
                    {checked && (
                      <div className="flex gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
                        <span className="text-xs font-mono px-1.5 py-0.5 rounded"
                          style={{ background: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}>
                          #{position + 1}
                        </span>
                        <button
                          title="Move up"
                          disabled={position === 0}
                          onClick={() => moveUp(position)}
                          className="text-xs px-1 rounded hover:bg-gray-100"
                          style={{ color: position === 0 ? "var(--rtm-text-muted)" : "var(--rtm-blue)" }}
                        >▲</button>
                        <button
                          title="Move down"
                          disabled={position === selected.length - 1}
                          onClick={() => moveDown(position)}
                          className="text-xs px-1 rounded hover:bg-gray-100"
                          style={{ color: position === selected.length - 1 ? "var(--rtm-text-muted)" : "var(--rtm-blue)" }}
                        >▼</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            {selected.length === 0
              ? "No blueprints selected — template can be saved but cannot be applied."
              : `${plural(selected.length, "blueprint")} selected`}
          </p>
          {/* Show selected order as summary */}
          {selected.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selected.map((id, idx) => {
                const bp = bpById.get(id);
                return (
                  <span key={id} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" }}>
                    {idx + 1}. {bp?.name || id}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {errMsg && (
          <p className="text-xs font-semibold" style={{ color: "#DC2626" }}>{errMsg}</p>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: saving ? "#CBD5E1" : "var(--rtm-blue)",
              color:      saving ? "#94A3B8"  : "#fff",
              cursor:     saving ? "not-allowed" : "pointer",
            }}
          >
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Template"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────────────────

function DeleteModal({
  template,
  onClose,
  onDeleted,
}: {
  template:  ProjectTemplate;
  onClose:   () => void;
  onDeleted: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [errMsg,   setErrMsg]   = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setErrMsg(null);
    try {
      const res = await fetch("/api/project-templates", {
        method:  "DELETE",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ id: template.id }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok || data.error) {
        setErrMsg(data.error ?? "Delete failed.");
      } else {
        onDeleted();
        onClose();
      }
    } catch (err) {
      setErrMsg(String(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="rounded-xl shadow-2xl p-6 w-full max-w-sm"
        style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
      >
        <h2 className="text-base font-black mb-2" style={{ color: "var(--rtm-text-primary)" }}>
          Delete Template
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--rtm-text-secondary)" }}>
          Delete <b>{template.name}</b>? This cannot be undone.
          Projects that had this template applied are not affected.
        </p>
        {errMsg && (
          <p className="text-xs font-semibold mb-3" style={{ color: "#DC2626" }}>{errMsg}</p>
        )}
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
            style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: deleting ? "#CBD5E1" : "#DC2626",
              color:      "#fff",
              cursor:     deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function ProjectTemplatesPage() {
  const [templates,   setTemplates]   = useState<ProjectTemplate[]>([]);
  const [blueprints,  setBlueprints]  = useState<AvailableBlueprint[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [errMsg,      setErrMsg]      = useState<string | null>(null);
  const [editing,     setEditing]     = useState<ProjectTemplate | null | "new">(null);
  const [deleting,    setDeleting]    = useState<ProjectTemplate | null>(null);
  const [expanded,    setExpanded]    = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setErrMsg(null);
    try {
      const [tRes, bRes] = await Promise.all([
        fetch("/api/project-templates",          { cache: "no-store" }),
        fetch("/api/task-blueprints?activeOnly=1", { cache: "no-store" }),
      ]);
      const [tData, bData] = await Promise.all([
        tRes.json() as Promise<{ templates?: ProjectTemplate[]; error?: string }>,
        bRes.json() as Promise<{ blueprints?: Array<{ id: string; name: string; serviceId: string; department: string }>; error?: string }>,
      ]);
      if (tData.error) { setErrMsg(tData.error); return; }
      setTemplates(tData.templates ?? []);
      setBlueprints(
        (bData.blueprints ?? []).map((b) => ({
          id:         b.id,
          name:       b.name,
          serviceId:  b.serviceId,
          department: b.department,
        }))
      );
    } catch (err) {
      setErrMsg(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 max-w-[860px]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-xs mb-1" style={{ color: "var(--rtm-text-muted)" }}>
              <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-blue)" }}>Settings</Link>
              <span>/</span>
              <span>Workflow Configuration</span>
              <span>/</span>
              <span>Project Templates</span>
            </div>
            <h1 className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
              Project Templates
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
              Named sets of task-list blueprints applied to a project together.
              Apply a template from the project detail page.
            </p>
          </div>
          <button
            onClick={() => setEditing("new")}
            className="px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap"
            style={{ background: "var(--rtm-blue)", color: "#fff" }}
          >
            + New Template
          </button>
        </div>

        {errMsg && (
          <div className="rounded-lg p-3 text-sm" style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FCA5A5" }}>
            {errMsg}
          </div>
        )}

        {loading ? (
          <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>Loading…</p>
        ) : templates.length === 0 ? (
          <div className="rounded-xl p-10 text-center" style={{ background: "var(--rtm-surface)", border: "1px dashed var(--rtm-border)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-secondary)" }}>
              No project templates yet.
            </p>
            <p className="text-xs mb-4" style={{ color: "var(--rtm-text-muted)" }}>
              Create one to apply multiple blueprints to a project in one action.
            </p>
            <button
              onClick={() => setEditing("new")}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: "var(--rtm-blue)", color: "#fff" }}
            >
              Create First Template
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {templates.map((t) => {
              const isOpen = expanded.has(t.id);
              const canApply = t.blueprints.length > 0;
              return (
                <div
                  key={t.id}
                  className="rounded-xl"
                  style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
                >
                  {/* Row */}
                  <div className="flex items-center gap-3 px-4 py-3 flex-wrap">
                    <button
                      onClick={() => toggleExpand(t.id)}
                      className="text-xs"
                      style={{ color: "var(--rtm-text-muted)", flexShrink: 0 }}
                    >
                      {isOpen ? "▼" : "▶"}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: "var(--rtm-text-primary)" }}>
                          {t.name}
                        </span>
                        {!t.isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "#F8FAFC", color: "#64748B", border: "1px solid #E2E8F0" }}>
                            Inactive
                          </span>
                        )}
                        {!canApply && (
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: "#FFFBEB", color: "#B45309", border: "1px solid #FDE68A" }}>
                            No blueprints — cannot be applied
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--rtm-text-muted)" }}>
                          {t.description}
                        </p>
                      )}
                      <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                        {plural(t.blueprints.length, "blueprint")}
                      </p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditing(t)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border hover:bg-gray-50"
                        style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleting(t)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold border hover:bg-red-50"
                        style={{ borderColor: "#FCA5A5", color: "#DC2626" }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded blueprint list */}
                  {isOpen && t.blueprints.length > 0 && (
                    <div
                      className="border-t"
                      style={{ borderColor: "var(--rtm-border)" }}
                    >
                      {t.blueprints.map((bp, idx) => (
                        <div
                          key={bp.blueprintId}
                          className="flex items-center gap-3 px-6 py-2.5"
                          style={{
                            borderBottom: idx < t.blueprints.length - 1 ? "1px solid var(--rtm-border)" : undefined,
                            background:   idx % 2 === 0 ? "transparent" : "rgba(0,0,0,0.01)",
                          }}
                        >
                          <span className="text-xs font-mono w-4 text-right" style={{ color: "var(--rtm-text-muted)" }}>
                            {bp.position + 1}.
                          </span>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                              {bp.name || bp.serviceId}
                            </span>
                            <span className="text-xs ml-2" style={{ color: "var(--rtm-text-muted)" }}>
                              {bp.department}
                            </span>
                          </div>
                          <Link
                            href="/tasks/templates"
                            className="text-xs hover:underline"
                            style={{ color: "var(--rtm-blue)", flexShrink: 0 }}
                          >
                            View blueprint
                          </Link>
                        </div>
                      ))}
                    </div>
                  )}
                  {isOpen && t.blueprints.length === 0 && (
                    <div
                      className="border-t px-6 py-3 text-xs"
                      style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-muted)" }}
                    >
                      No blueprints in this template. Edit to add some.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Related links */}
        <div className="rounded-xl p-4" style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "var(--rtm-text-secondary)" }}>Related</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Task Blueprints",  href: "/settings/task-blueprints" },
              { label: "Workflow Templates", href: "/settings/workflow-templates" },
              { label: "Automation Rules",   href: "/settings/automation-rules" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="text-xs hover:underline"
                style={{ color: "var(--rtm-blue)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {editing !== null && (
        <EditorModal
          template={editing === "new" ? null : editing}
          availableBlueprints={blueprints}
          onClose={() => setEditing(null)}
          onSaved={() => { void load(); }}
        />
      )}
      {deleting !== null && (
        <DeleteModal
          template={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={() => { void load(); }}
        />
      )}
    </>
  );
}
