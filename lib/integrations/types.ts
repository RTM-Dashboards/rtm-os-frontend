// ─── Integration Hub Types ────────────────────────────────────────────────────
// All vendor/connector data is runtime-configurable — nothing is hardcoded.

export type IntegrationCategory =
  | "CRM"
  | "Call Tracking"
  | "Analytics"
  | "Advertising"
  | "Communication"
  | "AI"
  | "Storage"
  | "Reporting"
  | "Custom API";

export type IntegrationStatus =
  | "connected"
  | "disconnected"
  | "pending"
  | "error"
  | "disabled";

export type AuthType =
  | "API Key"
  | "OAuth"
  | "Bearer Token"
  | "Webhook"
  | "Custom";

export type DataSourceObject =
  | "Calls"
  | "Leads"
  | "Opportunities"
  | "Projects"
  | "Reports"
  | "Communications"
  | "Revenue"
  | "Custom Objects";

export type HealthScore = "excellent" | "good" | "fair" | "poor";

export interface Integration {
  id: string;
  name: string;
  category: IntegrationCategory;
  status: IntegrationStatus;
  authType: AuthType;
  apiEndpoint: string;
  owner: string;
  clientsUsing: string[];
  departmentsUsing: string[];
  lastSync: string | null;
  dataObjects: DataSourceObject[];
  description: string;
  isBuiltIn: boolean; // false = admin-added custom connector
  enabled: boolean;
  webhookUrl?: string;
  errorCount: number;
  failedRequests: number;
  healthScore: HealthScore;
  healthPercent: number;
}

export interface ClientIntegrationAssignment {
  clientId: string;
  clientName: string;
  crmIntegrationId: string | null;
  callTrackingIntegrationId: string | null;
  analyticsIntegrationId: string | null;
  advertisingIntegrationId: string | null;
  aiIntegrationId: string | null;
  communicationIntegrationId: string | null;
}

export interface DepartmentIntegrationAssignment {
  departmentId: string;
  departmentName: string;
  connectedIntegrationIds: string[];
  reportsConsuming: string[];
  workflowsConsuming: string[];
}

export interface CallIntelligenceMapping {
  integrationId: string;
  callProviderIntegrationId: string;
  classifications: CallClassification[];
}

export interface CallClassification {
  id: string;
  label: string;
  type: "booked_call" | "qualified_lead" | "spam" | "custom";
  enabled: boolean;
  keywords: string[];
}

export interface WorkflowConnection {
  id: string;
  workflowName: string;
  triggerSource: string;
  dataSource: string;
  connectedIntegrationId: string;
  status: "active" | "paused" | "error";
}

export interface WebhookEntry {
  id: string;
  name: string;
  integrationId: string;
  providerName: string;
  status: "active" | "inactive" | "error";
  lastEvent: string | null;
  errorCount: number;
  endpoint: string;
  events: string[];
}

export interface IntegrationHealthEntry {
  integrationId: string;
  lastSync: string | null;
  errorCount: number;
  failedRequests: number;
  status: IntegrationStatus;
  healthScore: HealthScore;
  healthPercent: number;
  uptimeDays: number;
}

export interface AIRecommendation {
  id: string;
  type: "unused" | "redundant" | "missing" | "improvement";
  title: string;
  description: string;
  affectedIntegrationIds: string[];
  priority: "high" | "medium" | "low";
}
