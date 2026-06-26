"use client";

import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// Provider Templates — Integration Hub
// ─────────────────────────────────────────────────────────────────────────────

interface Provider {
  id: string;
  name: string;
  category: string;
  authMethod: string;
  description: string;
  status: "available" | "beta" | "coming-soon";
}

const PROVIDERS: Provider[] = [
  { id: "ga4",       name: "Google Analytics 4",       category: "Analytics",       authMethod: "OAuth",       description: "Website traffic, goals, and conversion data.",          status: "available" },
  { id: "gsc",       name: "Google Search Console",    category: "SEO",             authMethod: "OAuth",       description: "Organic search impressions, clicks, and positions.",     status: "available" },
  { id: "gads",      name: "Google Ads",               category: "Paid Media",      authMethod: "OAuth",       description: "PPC campaign performance, spend, and conversions.",      status: "available" },
  { id: "gbp",       name: "Google Business Profile",  category: "Local",           authMethod: "OAuth",       description: "Reviews, calls, directions, and local presence.",        status: "available" },
  { id: "meta",      name: "Meta Business Suite",      category: "Paid Media",      authMethod: "OAuth",       description: "Facebook and Instagram ads performance.",                status: "available" },
  { id: "callrail",  name: "CallRail",                 category: "Call Tracking",   authMethod: "API Key",     description: "Call tracking, recording, and analytics.",              status: "available" },
  { id: "ghl",       name: "GoHighLevel",              category: "CRM",             authMethod: "API Key",     description: "CRM, pipeline, and automation.",                         status: "available" },
  { id: "lsa",       name: "Google Local Services Ads", category: "Local",          authMethod: "OAuth",       description: "LSA performance and lead data.",                         status: "available" },
  { id: "openai",    name: "OpenAI",                   category: "AI",              authMethod: "API Key",     description: "AI summaries, analysis, and recommendations.",           status: "available" },
  { id: "slack",     name: "Slack",                    category: "Notifications",   authMethod: "OAuth",       description: "Team notifications and alerts.",                         status: "available" },
  { id: "stripe",    name: "Stripe",                   category: "Billing",         authMethod: "API Key",     description: "Payments, invoices, and subscriptions.",                 status: "available" },
  { id: "gsheets",   name: "Google Sheets",            category: "Data",            authMethod: "OAuth",       description: "Manual data inputs and reporting exports.",              status: "available" },
  { id: "twilio",    name: "Twilio",                   category: "Communications",  authMethod: "API Key",     description: "SMS and voice communications.",                          status: "beta" },
  { id: "salesforce", name: "Salesforce",              category: "CRM",             authMethod: "OAuth",       description: "Enterprise CRM sync.",                                   status: "coming-soon" },
  { id: "hubspot",   name: "HubSpot",                  category: "CRM",             authMethod: "OAuth",       description: "CRM and marketing automation.",                          status: "coming-soon" },
  { id: "powerbi",   name: "Power BI",                 category: "Business Intelligence", authMethod: "OAuth", description: "Advanced business intelligence reporting.",              status: "coming-soon" },
];

const STATUS_STYLES = {
  available:    { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0", label: "Available" },
  beta:         { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE", label: "Beta" },
  "coming-soon": { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0", label: "Coming Soon" },
};

const categories = [...new Set(PROVIDERS.map((p) => p.category))].sort();

export default function ProviderTemplatesPage() {
  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
        <Link href="/settings" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>Settings</Link>
        <span>›</span>
        <Link href="/settings/integrations" className="hover:underline" style={{ color: "var(--rtm-text-muted)" }}>Integrations</Link>
        <span>›</span>
        <span style={{ color: "var(--rtm-text-secondary)" }}>Provider Templates</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Provider Templates
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--rtm-text-muted)" }}>
            {PROVIDERS.length} pre-built integration templates. Select a provider to configure a new connection.
          </p>
        </div>
        <Link
          href="/settings/integrations/add"
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white flex-shrink-0"
          style={{ background: "var(--rtm-blue)" }}
        >
          Custom Connection
        </Link>
      </div>

      {/* Provider grid by category */}
      {categories.map((cat) => {
        const providers = PROVIDERS.filter((p) => p.category === cat);
        return (
          <section key={cat}>
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ color: "var(--rtm-text-muted)" }}
            >
              {cat}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => {
                const s = STATUS_STYLES[provider.status];
                return (
                  <div
                    key={provider.id}
                    className="rounded-xl border p-4"
                    style={{
                      background: "var(--rtm-surface)",
                      borderColor: "var(--rtm-border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>
                        {provider.name}
                      </p>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                      >
                        {s.label}
                      </span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: "var(--rtm-text-muted)" }}>
                      {provider.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md"
                        style={{
                          background: "var(--rtm-bg)",
                          color: "var(--rtm-text-muted)",
                          border: "1px solid var(--rtm-border)",
                        }}
                      >
                        {provider.authMethod}
                      </span>
                      {provider.status === "available" && (
                        <Link
                          href="/settings/integrations/add"
                          className="text-xs font-semibold hover:underline"
                          style={{ color: "var(--rtm-blue)" }}
                        >
                          Connect
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
