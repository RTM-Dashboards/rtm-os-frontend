// RTM OS — Task Blueprint Configuration
// All blueprint template definitions live here only.
// Zero task definitions in any .tsx file.

// ─── Status Types ─────────────────────────────────────────────────────────────

export type BlueprintTaskStatus = "pending" | "active" | "skipped" | "complete";

// ─── Priority Types ───────────────────────────────────────────────────────────

export type BlueprintTaskPriority = "critical" | "high" | "medium" | "low";

// ─── Task Types ───────────────────────────────────────────────────────────────

export type BlueprintTaskType =
  | "setup"
  | "onboarding"
  | "recurring"
  | "reporting"
  | "review"
  | "handoff";

// ─── Blueprint Task Interface ─────────────────────────────────────────────────

export interface BlueprintTask {
  id: string;
  name: string;
  description: string;
  type: BlueprintTaskType;
  priority: BlueprintTaskPriority;
  estimatedHours: number;
  dueDaysFromStart: number;
  department: string;
  assignedRole: string;
  dependencies: string[];
  recurring: boolean;
  recurringInterval?: "day" | "week" | "month";
}

// ─── Service Blueprint Interface ──────────────────────────────────────────────

export interface ServiceBlueprint {
  serviceId: string;
  serviceName: string;
  department: string;
  tasks: BlueprintTask[];
}

// ─── Generated Task Interface ─────────────────────────────────────────────────

export interface GeneratedTask {
  id: string;
  blueprintTaskId: string;
  projectId: string;
  clientName: string;
  serviceId: string;
  serviceName: string;
  department: string;
  name: string;
  description: string;
  type: BlueprintTaskType;
  priority: BlueprintTaskPriority;
  status: BlueprintTaskStatus;
  assignedTo: string | null;
  assignedRole: string;
  estimatedHours: number;
  dueDate: string;
  recurring: boolean;
  recurringInterval?: string;
  createdAt: string;
}

// ─── Status Labels ────────────────────────────────────────────────────────────

export const BLUEPRINT_TASK_STATUS_LABELS: Record<BlueprintTaskStatus, string> = {
  pending:  "Pending",
  active:   "Active",
  skipped:  "Skipped",
  complete: "Complete",
};

// ─── Status Colors (semantic tokens only) ────────────────────────────────────

export const BLUEPRINT_TASK_STATUS_COLORS: Record<
  BlueprintTaskStatus,
  { bg: string; color: string; border: string }
> = {
  pending:  { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
  active:   { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  skipped:  { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  complete: { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0" },
};

// ─── Priority Colors ──────────────────────────────────────────────────────────

export const BLUEPRINT_PRIORITY_COLORS: Record<
  BlueprintTaskPriority,
  { bg: string; color: string; border: string }
> = {
  critical: { bg: "#FEF2F2", color: "#DC2626", border: "#FECACA" },
  high:     { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA" },
  medium:   { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  low:      { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" },
};

// ─── Type Labels ──────────────────────────────────────────────────────────────

export const BLUEPRINT_TASK_TYPE_LABELS: Record<BlueprintTaskType, string> = {
  setup:      "Setup",
  onboarding: "Onboarding",
  recurring:  "Recurring",
  reporting:  "Reporting",
  review:     "Review",
  handoff:    "Handoff",
};

// ─── Service Blueprints ───────────────────────────────────────────────────────
// All 7 service blueprints. Each defines the task templates for a service.

export const SERVICE_BLUEPRINTS: ServiceBlueprint[] = [
  // ── SEO ──────────────────────────────────────────────────────────────────
  {
    serviceId: "seo",
    serviceName: "SEO",
    department: "SEO",
    tasks: [
      {
        id: "seo-001",
        name: "Technical SEO Audit",
        description: "Comprehensive audit of site structure, crawlability, indexation, and technical health.",
        type: "setup",
        priority: "high",
        estimatedHours: 4,
        dueDaysFromStart: 3,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: [],
        recurring: false,
      },
      {
        id: "seo-002",
        name: "Keyword Research and Mapping",
        description: "Identify target keywords and map them to site pages for optimized content strategy.",
        type: "setup",
        priority: "high",
        estimatedHours: 6,
        dueDaysFromStart: 7,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: ["seo-001"],
        recurring: false,
      },
      {
        id: "seo-003",
        name: "On-Page Optimization",
        description: "Apply keyword mapping to meta titles, descriptions, headings, and on-page content.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 8,
        dueDaysFromStart: 14,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: ["seo-002"],
        recurring: false,
      },
      {
        id: "seo-004",
        name: "Monthly SEO Report",
        description: "Monthly performance report covering rankings, traffic, and key SEO metrics.",
        type: "reporting",
        priority: "medium",
        estimatedHours: 2,
        dueDaysFromStart: 30,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: [],
        recurring: true,
        recurringInterval: "month",
      },
      {
        id: "seo-005",
        name: "Backlink Audit",
        description: "Analyze existing backlink profile, identify toxic links, and outline link acquisition targets.",
        type: "setup",
        priority: "medium",
        estimatedHours: 3,
        dueDaysFromStart: 10,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: ["seo-001"],
        recurring: false,
      },
    ],
  },

  // ── Google Business Profile ───────────────────────────────────────────────
  {
    serviceId: "gbp",
    serviceName: "Google Business Profile",
    department: "GBP",
    tasks: [
      {
        id: "gbp-001",
        name: "GBP Profile Verification",
        description: "Verify ownership and access to the client Google Business Profile listing.",
        type: "setup",
        priority: "critical",
        estimatedHours: 2,
        dueDaysFromStart: 2,
        department: "GBP",
        assignedRole: "GBP Specialist",
        dependencies: [],
        recurring: false,
      },
      {
        id: "gbp-002",
        name: "Profile Optimization",
        description: "Fully optimize the GBP listing including categories, services, hours, photos, and description.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 3,
        dueDaysFromStart: 5,
        department: "GBP",
        assignedRole: "GBP Specialist",
        dependencies: ["gbp-001"],
        recurring: false,
      },
      {
        id: "gbp-003",
        name: "Review Response Setup",
        description: "Configure review response workflows and provide initial responses to existing reviews.",
        type: "setup",
        priority: "medium",
        estimatedHours: 1,
        dueDaysFromStart: 7,
        department: "GBP",
        assignedRole: "GBP Specialist",
        dependencies: ["gbp-001"],
        recurring: false,
      },
      {
        id: "gbp-004",
        name: "Monthly GBP Report",
        description: "Monthly report covering profile views, search terms, direction requests, and call metrics.",
        type: "reporting",
        priority: "medium",
        estimatedHours: 1,
        dueDaysFromStart: 30,
        department: "GBP",
        assignedRole: "GBP Specialist",
        dependencies: [],
        recurring: true,
        recurringInterval: "month",
      },
    ],
  },

  // ── PPC / Google Ads ─────────────────────────────────────────────────────
  {
    serviceId: "ppc",
    serviceName: "Google Ads / PPC",
    department: "PPC",
    tasks: [
      {
        id: "ppc-001",
        name: "Campaign Structure Setup",
        description: "Build campaign and ad group structure aligned to client services and target geography.",
        type: "setup",
        priority: "critical",
        estimatedHours: 6,
        dueDaysFromStart: 3,
        department: "PPC",
        assignedRole: "PPC Specialist",
        dependencies: [],
        recurring: false,
      },
      {
        id: "ppc-002",
        name: "Ad Copy Creation",
        description: "Write responsive search ads, headlines, and descriptions for each ad group.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 4,
        dueDaysFromStart: 5,
        department: "PPC",
        assignedRole: "PPC Specialist",
        dependencies: ["ppc-001"],
        recurring: false,
      },
      {
        id: "ppc-003",
        name: "Conversion Tracking Setup",
        description: "Implement and verify conversion tracking via Google Tag Manager and Google Ads.",
        type: "setup",
        priority: "critical",
        estimatedHours: 2,
        dueDaysFromStart: 3,
        department: "PPC",
        assignedRole: "PPC Specialist",
        dependencies: [],
        recurring: false,
      },
      {
        id: "ppc-004",
        name: "Campaign Launch",
        description: "Activate campaigns, set bidding strategies, and confirm ads are serving correctly.",
        type: "onboarding",
        priority: "critical",
        estimatedHours: 2,
        dueDaysFromStart: 7,
        department: "PPC",
        assignedRole: "PPC Specialist",
        dependencies: ["ppc-001", "ppc-002", "ppc-003"],
        recurring: false,
      },
      {
        id: "ppc-005",
        name: "Weekly PPC Performance Review",
        description: "Review campaign performance, adjust bids, pause underperforming ads, and note optimizations.",
        type: "review",
        priority: "high",
        estimatedHours: 1,
        dueDaysFromStart: 7,
        department: "PPC",
        assignedRole: "PPC Specialist",
        dependencies: ["ppc-004"],
        recurring: true,
        recurringInterval: "week",
      },
    ],
  },

  // ── Local Service Ads ─────────────────────────────────────────────────────
  {
    serviceId: "lsa",
    serviceName: "Local Service Ads",
    department: "LSA",
    tasks: [
      {
        id: "lsa-001",
        name: "LSA Account Setup and Verification",
        description: "Create and verify the Local Services Ads account including business license and insurance documents.",
        type: "setup",
        priority: "critical",
        estimatedHours: 3,
        dueDaysFromStart: 2,
        department: "LSA",
        assignedRole: "LSA Specialist",
        dependencies: [],
        recurring: false,
      },
      {
        id: "lsa-002",
        name: "Service Area Configuration",
        description: "Define service areas, job types, and business hours within the LSA account.",
        type: "setup",
        priority: "high",
        estimatedHours: 2,
        dueDaysFromStart: 3,
        department: "LSA",
        assignedRole: "LSA Specialist",
        dependencies: ["lsa-001"],
        recurring: false,
      },
      {
        id: "lsa-003",
        name: "Budget Configuration",
        description: "Set weekly budget, lead volume targets, and bid strategy for the LSA campaign.",
        type: "setup",
        priority: "high",
        estimatedHours: 1,
        dueDaysFromStart: 3,
        department: "LSA",
        assignedRole: "LSA Specialist",
        dependencies: ["lsa-001"],
        recurring: false,
      },
      {
        id: "lsa-004",
        name: "Monthly LSA Report",
        description: "Monthly report covering lead volume, cost per lead, and disputed lead analysis.",
        type: "reporting",
        priority: "medium",
        estimatedHours: 1,
        dueDaysFromStart: 30,
        department: "LSA",
        assignedRole: "LSA Specialist",
        dependencies: [],
        recurring: true,
        recurringInterval: "month",
      },
    ],
  },

  // ── Meta Ads ─────────────────────────────────────────────────────────────
  {
    serviceId: "meta-ads",
    serviceName: "Meta Ads",
    department: "Meta Ads",
    tasks: [
      {
        id: "meta-001",
        name: "Ad Account Setup",
        description: "Create or access the Meta Business Manager and configure the ad account structure.",
        type: "setup",
        priority: "critical",
        estimatedHours: 2,
        dueDaysFromStart: 2,
        department: "Meta Ads",
        assignedRole: "Meta Ads Specialist",
        dependencies: [],
        recurring: false,
      },
      {
        id: "meta-002",
        name: "Pixel Installation and Verification",
        description: "Install Meta Pixel on the client website and verify event tracking is firing correctly.",
        type: "setup",
        priority: "critical",
        estimatedHours: 2,
        dueDaysFromStart: 3,
        department: "Meta Ads",
        assignedRole: "Meta Ads Specialist",
        dependencies: ["meta-001"],
        recurring: false,
      },
      {
        id: "meta-003",
        name: "Audience Research and Setup",
        description: "Define core and lookalike audiences based on client demographics, interests, and website behavior.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 4,
        dueDaysFromStart: 5,
        department: "Meta Ads",
        assignedRole: "Meta Ads Specialist",
        dependencies: ["meta-002"],
        recurring: false,
      },
      {
        id: "meta-004",
        name: "Ad Creative Development",
        description: "Develop static and video ad creatives including copy, imagery, and call-to-action variants.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 6,
        dueDaysFromStart: 7,
        department: "Meta Ads",
        assignedRole: "Meta Ads Specialist",
        dependencies: ["meta-003"],
        recurring: false,
      },
      {
        id: "meta-005",
        name: "Campaign Launch",
        description: "Publish campaigns, configure objectives, placements, and budgets. Confirm delivery and initial metrics.",
        type: "onboarding",
        priority: "critical",
        estimatedHours: 2,
        dueDaysFromStart: 7,
        department: "Meta Ads",
        assignedRole: "Meta Ads Specialist",
        dependencies: ["meta-003", "meta-004"],
        recurring: false,
      },
    ],
  },

  // ── Website ───────────────────────────────────────────────────────────────
  {
    serviceId: "website",
    serviceName: "Website",
    department: "Web Development",
    tasks: [
      {
        id: "web-001",
        name: "Discovery and Requirements",
        description: "Conduct discovery call, document site structure, content needs, and technical requirements.",
        type: "setup",
        priority: "critical",
        estimatedHours: 4,
        dueDaysFromStart: 3,
        department: "Web Development",
        assignedRole: "Lead Developer",
        dependencies: [],
        recurring: false,
      },
      {
        id: "web-002",
        name: "Wireframe and Design Mockup",
        description: "Create low-fidelity wireframes and high-fidelity design mockups for client review and approval.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 12,
        dueDaysFromStart: 10,
        department: "Web Development",
        assignedRole: "UI/UX Designer",
        dependencies: ["web-001"],
        recurring: false,
      },
      {
        id: "web-003",
        name: "Development Sprint 1",
        description: "Build core site architecture, homepage, navigation, and primary service pages.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 20,
        dueDaysFromStart: 21,
        department: "Web Development",
        assignedRole: "Lead Developer",
        dependencies: ["web-002"],
        recurring: false,
      },
      {
        id: "web-004",
        name: "Development Sprint 2",
        description: "Build secondary pages, contact forms, integrations, and mobile optimization.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 20,
        dueDaysFromStart: 28,
        department: "Web Development",
        assignedRole: "Lead Developer",
        dependencies: ["web-003"],
        recurring: false,
      },
      {
        id: "web-005",
        name: "QA and Testing",
        description: "Cross-browser and mobile QA, form testing, performance checks, and accessibility review.",
        type: "review",
        priority: "critical",
        estimatedHours: 6,
        dueDaysFromStart: 30,
        department: "Web Development",
        assignedRole: "QA Reviewer",
        dependencies: ["web-004"],
        recurring: false,
      },
      {
        id: "web-006",
        name: "Launch and Handoff",
        description: "Deploy to production, configure DNS, verify live site, and hand off credentials and documentation.",
        type: "handoff",
        priority: "critical",
        estimatedHours: 2,
        dueDaysFromStart: 35,
        department: "Web Development",
        assignedRole: "Lead Developer",
        dependencies: ["web-005"],
        recurring: false,
      },
    ],
  },

  // ── SEO AI Search Visibility ──────────────────────────────────────────────
  {
    serviceId: "seo-ai-search",
    serviceName: "SEO AI Search Visibility",
    department: "SEO",
    tasks: [
      {
        id: "ai-001",
        name: "AI Search Visibility Audit",
        description: "Audit current brand presence in AI-generated search responses and identify content gaps.",
        type: "setup",
        priority: "high",
        estimatedHours: 3,
        dueDaysFromStart: 5,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: [],
        recurring: false,
      },
      {
        id: "ai-002",
        name: "Content Optimization for AI Search",
        description: "Optimize existing content and create structured data to improve AI search citation probability.",
        type: "onboarding",
        priority: "high",
        estimatedHours: 6,
        dueDaysFromStart: 14,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: ["ai-001"],
        recurring: false,
      },
      {
        id: "ai-003",
        name: "Monthly AI Search Report",
        description: "Monthly report tracking AI search visibility, citation frequency, and brand mention metrics.",
        type: "reporting",
        priority: "medium",
        estimatedHours: 1,
        dueDaysFromStart: 30,
        department: "SEO",
        assignedRole: "SEO Specialist",
        dependencies: [],
        recurring: true,
        recurringInterval: "month",
      },
    ],
  },
];
