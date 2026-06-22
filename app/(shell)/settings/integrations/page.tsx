"use client";

import { useState } from "react";

import IntegrationKPICards           from "@/components/integrations/IntegrationKPICards";
import CategoryOverviewCards         from "@/components/integrations/CategoryOverviewCards";
import IntegrationTable              from "@/components/integrations/IntegrationTable";
import ConnectorDrawer               from "@/components/integrations/ConnectorDrawer";
import ClientAssignmentTable         from "@/components/integrations/ClientAssignmentTable";
import DepartmentAssignmentTable     from "@/components/integrations/DepartmentAssignmentTable";
import CallIntelligencePanel         from "@/components/integrations/CallIntelligencePanel";
import WorkflowConnectionsTable      from "@/components/integrations/WorkflowConnectionsTable";
import WebhookManagementTable        from "@/components/integrations/WebhookManagementTable";
import IntegrationHealthPanel        from "@/components/integrations/IntegrationHealthPanel";
import AIRecommendationsPanel        from "@/components/integrations/AIRecommendationsPanel";

import {
  MOCK_INTEGRATIONS,
  MOCK_CLIENT_ASSIGNMENTS,
  MOCK_DEPARTMENT_ASSIGNMENTS,
  MOCK_CALL_INTELLIGENCE,
  MOCK_WORKFLOW_CONNECTIONS,
  MOCK_WEBHOOKS,
  MOCK_AI_RECOMMENDATIONS,
} from "@/lib/integrations/mock-data";

import type { Integration, IntegrationCategory } from "@/lib/integrations/types";

type TabKey =
  | "overview"
  | "registry"
  | "clients"
  | "departments"
  | "call-intelligence"
  | "workflows"
  | "webhooks"
  | "health"
  | "ai-recommendations";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview",           label: "Overview" },
  { key: "registry",           label: "Integration Registry" },
  { key: "clients",            label: "Client Assignment" },
  { key: "departments",        label: "Department Assignment" },
  { key: "call-intelligence",  label: "Call Intelligence" },
  { key: "workflows",          label: "Workflow Connections" },
  { key: "webhooks",           label: "Webhooks" },
  { key: "health",             label: "Health Monitor" },
  { key: "ai-recommendations", label: "AI Recommendations" },
];

export default function IntegrationsPage() {
  const [activeTab, setActiveTab]                       = useState<TabKey>("overview");
  const [selectedIntegration, setSelectedIntegration]   = useState<Integration | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_categoryFilter, setCategoryFilter]            = useState<IntegrationCategory | null>(null);

  const handleCategoryClick = (category: IntegrationCategory) => {
    setCategoryFilter(category);
    setActiveTab("registry");
  };

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "var(--rtm-text-muted)" }}>
            Settings
          </p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Integration Hub
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Dynamic connector framework. Configure, replace, enable, or disable integrations without code changes.
          </p>
        </div>
        <button
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors self-start flex-shrink-0"
          style={{ background: "var(--rtm-blue)" }}
        >
          + Add Integration
        </button>
      </div>

      {/* ── KPI Cards ── */}
      <IntegrationKPICards integrations={MOCK_INTEGRATIONS} />

      {/* ── Tabs ── */}
      <div
        className="flex gap-1 overflow-x-auto pb-0.5"
        style={{ borderBottom: "1px solid var(--rtm-border)" }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors relative flex-shrink-0"
            style={{
              color:         activeTab === tab.key ? "var(--rtm-blue)" : "var(--rtm-text-muted)",
              borderBottom:  activeTab === tab.key ? "2px solid var(--rtm-blue)" : "2px solid transparent",
              marginBottom:  "-1px",
              background:    "transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div>
        {activeTab === "overview" && (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--rtm-text-muted)" }}>
                Integration Categories
              </p>
              <CategoryOverviewCards
                integrations={MOCK_INTEGRATIONS}
                onCategoryClick={handleCategoryClick}
              />
            </div>

            {/* Quick-view registry */}
            <IntegrationTable
              integrations={MOCK_INTEGRATIONS}
              onSelect={(integration) => {
                setSelectedIntegration(integration);
              }}
            />
          </div>
        )}

        {activeTab === "registry" && (
          <IntegrationTable
            integrations={MOCK_INTEGRATIONS}
            onSelect={setSelectedIntegration}
          />
        )}

        {activeTab === "clients" && (
          <ClientAssignmentTable
            assignments={MOCK_CLIENT_ASSIGNMENTS}
            integrations={MOCK_INTEGRATIONS}
          />
        )}

        {activeTab === "departments" && (
          <DepartmentAssignmentTable
            assignments={MOCK_DEPARTMENT_ASSIGNMENTS}
            integrations={MOCK_INTEGRATIONS}
          />
        )}

        {activeTab === "call-intelligence" && (
          <CallIntelligencePanel
            mappings={MOCK_CALL_INTELLIGENCE}
            integrations={MOCK_INTEGRATIONS}
          />
        )}

        {activeTab === "workflows" && (
          <WorkflowConnectionsTable
            connections={MOCK_WORKFLOW_CONNECTIONS}
            integrations={MOCK_INTEGRATIONS}
          />
        )}

        {activeTab === "webhooks" && (
          <WebhookManagementTable webhooks={MOCK_WEBHOOKS} />
        )}

        {activeTab === "health" && (
          <IntegrationHealthPanel integrations={MOCK_INTEGRATIONS} />
        )}

        {activeTab === "ai-recommendations" && (
          <AIRecommendationsPanel
            recommendations={MOCK_AI_RECOMMENDATIONS}
            integrations={MOCK_INTEGRATIONS}
          />
        )}
      </div>

      {/* ── Connector configuration drawer ── */}
      <ConnectorDrawer
        integration={selectedIntegration}
        onClose={() => setSelectedIntegration(null)}
      />
    </div>
  );
}
