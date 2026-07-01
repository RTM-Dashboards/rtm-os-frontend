"use client";

import Link from "next/link";

export default function RecommendationsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <p
          className="text-[11px] font-bold uppercase tracking-widest mb-1"
          style={{ color: "#7C3AED" }}
        >
          Sales
        </p>
        <h1
          className="text-2xl font-medium tracking-tight"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Recommendations
        </h1>
      </div>

      {/* Redirect notice card */}
      <div
        className="rounded-xl border p-8 max-w-2xl"
        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}
      >
        <p
          className="text-lg font-bold mb-3"
          style={{ color: "var(--rtm-text-primary)" }}
        >
          Recommendations are part of the Proposal Builder
        </p>
        <p
          className="text-sm mb-6 leading-relaxed"
          style={{ color: "var(--rtm-text-secondary)" }}
        >
          Recommendations are generated automatically in Step 3 of the Proposal Builder wizard,
          based on the client audit results. To view or manage recommendations for a specific
          client, start or resume a proposal from the Proposals page.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link
            href="/sales/proposals"
            className="text-sm px-4 py-2 rounded-lg font-bold"
            style={{ background: "#7C3AED", color: "#fff" }}
          >
            Go to Proposals
          </Link>
          <Link
            href="/sales/proposals?new=true"
            className="text-sm px-4 py-2 rounded-lg font-semibold border"
            style={{
              background: "var(--rtm-bg)",
              color: "var(--rtm-text-secondary)",
              borderColor: "var(--rtm-border)",
            }}
          >
            Start New Proposal
          </Link>
        </div>
      </div>
    </div>
  );
}
