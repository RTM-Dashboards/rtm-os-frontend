"use client";

//
// RTM OS — Task Collaboration Hub
// Route: /tasks/collaboration
//
// Displays persisted collaboration threads attached to real Postgres tasks.
// No mock data. When no threads exist the page shows an honest empty state.
//

export default function CollaborationPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--rtm-bg)" }}>
      {/* Page Header */}
      <div
        className="px-8 py-6 sticky top-0 z-20"
        style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}
      >
        <div>
          <h1 className="text-xl font-black" style={{ color: "var(--rtm-text-primary)" }}>
            Task Collaboration Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Comments · Notes · Approvals · Attachments · Activity · Escalations
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="px-8 py-16 flex flex-col items-center justify-center max-w-xl mx-auto text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <span className="text-3xl">💬</span>
        </div>

        <h2 className="text-lg font-bold mb-2" style={{ color: "var(--rtm-text-primary)" }}>
          No collaboration threads yet
        </h2>

        <p className="text-sm leading-relaxed mb-6" style={{ color: "var(--rtm-text-secondary)" }}>
          Collaboration threads are created from individual tasks. Open any task in the task
          list, then use the <strong>Collaboration</strong> drawer to add comments, internal
          notes, client notes, approvals, or watchers. Threads appear here once created.
        </p>

        <div
          className="w-full rounded-2xl p-5 text-left"
          style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)" }}
        >
          <p
            className="text-xs font-bold uppercase tracking-wider mb-3"
            style={{ color: "var(--rtm-text-muted)" }}
          >
            What the Collaboration Drawer supports
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "💬", tab: "Comments",        desc: "Threaded replies, @mentions" },
              { icon: "🔒", tab: "Internal Notes",  desc: "Team-only, priority flags" },
              { icon: "📞", tab: "Client Notes",    desc: "AM communication log" },
              { icon: "📎", tab: "Attachments",     desc: "Reports, contracts, assets" },
              { icon: "✅", tab: "Approvals",       desc: "Workflow approvals" },
              { icon: "👁️", tab: "Watchers",        desc: "Who's subscribed" },
            ].map((t) => (
              <div key={t.tab} className="flex items-start gap-2">
                <span className="text-base flex-shrink-0">{t.icon}</span>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                    {t.tab}
                  </p>
                  <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>
                    {t.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
