// EPIC 05 — Client Profile System Mock Data

export type BillingStatus = "current"| "overdue"| "pending"| "paused"| "cancelled";
export type CampaignStatus = "active"| "paused"| "ended"| "draft";
export type ServiceStatus = "active"| "paused"| "cancelled";
export type DeliverableStatus = "completed"| "in_progress"| "blocked"| "overdue"| "not_started";
export type OnboardingStage = "completed"| "in_progress"| "pending";
export type ClientHealthStatus = "healthy"| "at_risk"| "churned"| "new";

export interface Service {
  id: string;
  name: string;
  status: ServiceStatus;
  startDate: string;
  monthlyValue: number;
  notes?: string;
}

export interface Deliverable {
  id: string;
  title: string;
  department: string;
  status: DeliverableStatus;
  dueDate: string;
  assignee: string;
}

export interface ActivityItem {
  id: string;
  date: string;
  actor: string;
  action: string;
  type: "note"| "task"| "billing"| "campaign"| "onboarding"| "system"| "alert";
}

export interface Contract {
  id: string;
  title: string;
  url: string;
  signedDate: string;
  expiryDate?: string;
}

export interface ClientProfile {
  id: string;
  slug: string;
  companyName: string;
  domain: string;
  industry: string;
  healthStatus: ClientHealthStatus;

  // People
  assignedAM: string;
  salesRep: string;

  // Contact
  primaryContact: string;
  primaryEmail: string;
  primaryPhone: string;

  // Services & billing
  services: Service[];
  billingStatus: BillingStatus;
  billingCycle: "monthly"| "quarterly"| "annual";
  monthlyRecurring: number;
  nextBillingDate: string;

  // Campaigns
  campaignStatus: CampaignStatus;
  activeCampaigns: Array<{
    id: string;
    name: string;
    channel: string;
    status: CampaignStatus;
    budget: number;
    startDate: string;
  }>;

  // Deliverables
  deliverables: Deliverable[];

  // Notes
  notes: string;
  internalNotes?: string;

  // Onboarding
  onboardingStage: OnboardingStage;
  onboardingNotes: string;
  onboardingNotesUrl?: string;
  onboardedDate?: string;

  // Contracts
  contracts: Contract[];

  // Legacy Teamwork reference (historical only)
  teamworkProjectUrl?: string;
  teamworkProjectName?: string;

  // Timeline
  activity: ActivityItem[];

  // Meta
  clientSince: string;
  location: string;
  logo?: string;
  avatarColor: string;
}

export const MOCK_CLIENTS: ClientProfile[] = [
  {
    id: "c001",
    slug: "apex-roofing",
    companyName: "Apex Roofing Solutions",
    domain: "apexroofing.com",
    industry: "Home Services – Roofing",
    healthStatus: "healthy",
    assignedAM: "Jordan M.",
    salesRep: "Mike T.",
    primaryContact: "David Harper",
    primaryEmail: "david@apexroofing.com",
    primaryPhone: "(602) 555-0142",
    services: [
      { id: "s1", name: "SEO / GBP Management", status: "active", startDate: "2023-03-01", monthlyValue: 1800 },
      { id: "s2", name: "Meta Ads Management", status: "active", startDate: "2023-03-01", monthlyValue: 2400 },
      { id: "s3", name: "Content Writing", status: "active", startDate: "2023-06-01", monthlyValue: 800 },
      { id: "s4", name: "Monthly Reporting", status: "active", startDate: "2023-03-01", monthlyValue: 350 },
    ],
    billingStatus: "current",
    billingCycle: "monthly",
    monthlyRecurring: 5350,
    nextBillingDate: "2025-06-01",
    campaignStatus: "active",
    activeCampaigns: [
      { id: "cp1", name: "Summer Roofing Push", channel: "Meta Ads", status: "active", budget: 3500, startDate: "2025-05-01"},
      { id: "cp2", name: "Storm Damage LSA", channel: "Local Service Ads", status: "active", budget: 2000, startDate: "2025-04-15"},
    ],
    deliverables: [
      { id: "d1", title: "May SEO Report", department: "SEO", status: "completed", dueDate: "2025-05-31", assignee: "Lisa P."},
      { id: "d2", title: "2x Blog Posts – June", department: "Content", status: "in_progress", dueDate: "2025-06-10", assignee: "Alex R."},
      { id: "d3", title: "Ad Creative Refresh", department: "Design", status: "in_progress", dueDate: "2025-06-05", assignee: "Casey L."},
      { id: "d4", title: "GBP Posts – June", department: "SEO", status: "not_started", dueDate: "2025-06-07", assignee: "Lisa P."},
    ],
    notes: "High-value client. Storm season drives spike in leads — coordinate ads + LSA ahead of July. David prefers weekly email updates, not calls.",
    internalNotes: "Potential upsell: website redesign Q3 2025. Sales follow-up scheduled.",
    onboardingStage: "completed",
    onboardingNotes: "Full onboarding completed March 2023. GBP claimed and optimized. Meta pixel installed. All access verified.",
    onboardingNotesUrl: "https://docs.google.com/document/d/apex-roofing-onboarding",
    onboardedDate: "2023-03-15",
    contracts: [
      { id: "ct1", title: "Master Service Agreement", url: "https://drive.google.com/file/apex-msa", signedDate: "2023-03-01"},
      { id: "ct2", title: "Addendum – Content Package", url: "https://drive.google.com/file/apex-addendum-content", signedDate: "2023-06-01"},
    ],
    teamworkProjectUrl: "https://teamwork.com/projects/apexroofing",
    teamworkProjectName: "Apex Roofing – Legacy",
    activity: [
      { id: "a1", date: "2025-05-28", actor: "Jordan M.", action: "Sent May performance report to David Harper", type: "task"},
      { id: "a2", date: "2025-05-22", actor: "System", action: "Invoice #1042 processed – $5,350", type: "billing"},
      { id: "a3", date: "2025-05-15", actor: "Jordan M.", action: "Added note: Client requested storm-season campaign push for July", type: "note"},
      { id: "a4", date: "2025-05-01", actor: "Mike T.", action: "Launched Summer Roofing Push campaign on Meta", type: "campaign"},
      { id: "a5", date: "2025-04-30", actor: "Jordan M.", action: "Quarterly review call completed – NPS: 9", type: "note"},
      { id: "a6", date: "2025-04-01", actor: "System", action: "Invoice #1039 processed – $5,350", type: "billing"},
    ],
    clientSince: "2023-03-01",
    location: "Phoenix, AZ",
    avatarColor: "#6366f1",
  },
  {
    id: "c002",
    slug: "sunbelt-hvac",
    companyName: "Sunbelt HVAC & Air",
    domain: "sunbelthvac.com",
    industry: "Home Services – HVAC",
    healthStatus: "at_risk",
    assignedAM: "Sarah K.",
    salesRep: "Jordan M.",
    primaryContact: "Linda Torres",
    primaryEmail: "linda@sunbelthvac.com",
    primaryPhone: "(713) 555-0198",
    services: [
      { id: "s1", name: "SEO / GBP Management", status: "active", startDate: "2022-08-01", monthlyValue: 1600 },
      { id: "s2", name: "Meta Ads Management", status: "paused", startDate: "2022-08-01", monthlyValue: 1800, notes: "Paused per client request – budget review"},
      { id: "s3", name: "Review Management", status: "active", startDate: "2023-01-01", monthlyValue: 400 },
    ],
    billingStatus: "overdue",
    billingCycle: "monthly",
    monthlyRecurring: 2000,
    nextBillingDate: "2025-05-01",
    campaignStatus: "paused",
    activeCampaigns: [],
    deliverables: [
      { id: "d1", title: "May SEO Report", department: "SEO", status: "overdue", dueDate: "2025-05-31", assignee: "Lisa P."},
      { id: "d2", title: "GBP Posts – May", department: "SEO", status: "overdue", dueDate: "2025-05-15", assignee: "Lisa P."},
    ],
    notes: "Client flagged as at-risk. Invoice overdue by 30 days. Campaigns paused. Sarah to make personal outreach call this week.",
    onboardingStage: "completed",
    onboardingNotes: "Onboarded August 2022. Initial GBP had ownership dispute — resolved by Sept 2022.",
    onboardedDate: "2022-08-20",
    contracts: [
      { id: "ct1", title: "Master Service Agreement", url: "https://drive.google.com/file/sunbelt-msa", signedDate: "2022-08-01"},
    ],
    teamworkProjectUrl: "https://teamwork.com/projects/sunbelthvac",
    teamworkProjectName: "Sunbelt HVAC – Legacy",
    activity: [
      { id: "a1", date: "2025-05-27", actor: "Sarah K.", action: "Flagged as at-risk — invoice 30+ days overdue", type: "alert"},
      { id: "a2", date: "2025-05-20", actor: "System", action: "Auto-reminder sent for overdue invoice #982", type: "billing"},
      { id: "a3", date: "2025-05-10", actor: "Sarah K.", action: "Called Linda — no answer. Left voicemail.", type: "note"},
      { id: "a4", date: "2025-04-28", actor: "System", action: "Meta Ads campaign paused per client instruction", type: "campaign"},
      { id: "a5", date: "2025-04-01", actor: "System", action: "Invoice #982 issued – $2,000 (unpaid)", type: "billing"},
    ],
    clientSince: "2022-08-01",
    location: "Houston, TX",
    avatarColor: "#f59e0b",
  },
  {
    id: "c003",
    slug: "pacific-dental",
    companyName: "Pacific Dental Group",
    domain: "pacificdentalgroup.com",
    industry: "Healthcare – Dentistry",
    healthStatus: "healthy",
    assignedAM: "Jordan M.",
    salesRep: "Sarah K.",
    primaryContact: "Dr. Karen Yee",
    primaryEmail: "karen@pacificdentalgroup.com",
    primaryPhone: "(858) 555-0233",
    services: [
      { id: "s1", name: "SEO / GBP Management", status: "active", startDate: "2021-05-01", monthlyValue: 2200 },
      { id: "s2", name: "Website Maintenance", status: "active", startDate: "2021-05-01", monthlyValue: 600 },
      { id: "s3", name: "Monthly Reporting", status: "active", startDate: "2021-05-01", monthlyValue: 350 },
      { id: "s4", name: "Content Writing", status: "active", startDate: "2022-01-01", monthlyValue: 1200 },
      { id: "s5", name: "Yelp Ads Management", status: "active", startDate: "2023-03-01", monthlyValue: 800 },
    ],
    billingStatus: "current",
    billingCycle: "monthly",
    monthlyRecurring: 5150,
    nextBillingDate: "2025-06-01",
    campaignStatus: "active",
    activeCampaigns: [
      { id: "cp1", name: "Invisalign Promo – Q2", channel: "Meta Ads", status: "active", budget: 2500, startDate: "2025-04-01"},
    ],
    deliverables: [
      { id: "d1", title: "May SEO Report", department: "SEO", status: "completed", dueDate: "2025-05-31", assignee: "Lisa P."},
      { id: "d2", title: "June Blog – Invisalign FAQ", department: "Content", status: "in_progress", dueDate: "2025-06-08", assignee: "Alex R."},
      { id: "d3", title: "Website Speed Audit", department: "IT", status: "not_started", dueDate: "2025-06-15", assignee: "Dev Team"},
    ],
    notes: "Long-term client since 2021. Very organized — Karen prefers detailed monthly reports. Looking to add a second location in 2025.",
    onboardingStage: "completed",
    onboardingNotes: "Onboarded May 2021. Three GBP locations set up. HIPAA-aware content guidelines established.",
    onboardingNotesUrl: "https://docs.google.com/document/d/pacific-dental-onboarding",
    onboardedDate: "2021-05-12",
    contracts: [
      { id: "ct1", title: "Master Service Agreement", url: "https://drive.google.com/file/pacific-dental-msa", signedDate: "2021-05-01"},
      { id: "ct2", title: "Yelp Ads Addendum", url: "https://drive.google.com/file/pacific-dental-yelp", signedDate: "2023-03-01"},
    ],
    teamworkProjectUrl: "https://teamwork.com/projects/pacificdentalgroup",
    teamworkProjectName: "Pacific Dental – Legacy",
    activity: [
      { id: "a1", date: "2025-05-29", actor: "System", action: "Monthly report auto-generated and sent to Dr. Yee", type: "task"},
      { id: "a2", date: "2025-05-22", actor: "System", action: "Invoice #2201 processed – $5,150", type: "billing"},
      { id: "a3", date: "2025-05-15", actor: "Jordan M.", action: "Discussed second location expansion timeline — Q4 2025 target", type: "note"},
      { id: "a4", date: "2025-04-01", actor: "Mike T.", action: "Launched Invisalign Q2 campaign on Meta", type: "campaign"},
    ],
    clientSince: "2021-05-01",
    location: "San Diego, CA",
    avatarColor: "#10b981",
  },
  {
    id: "c004",
    slug: "blue-ridge-plumbing",
    companyName: "Blue Ridge Plumbing Co.",
    domain: "blueridgeplumbing.com",
    industry: "Home Services – Plumbing",
    healthStatus: "new",
    assignedAM: "Alex R.",
    salesRep: "Mike T.",
    primaryContact: "Tom Briscoe",
    primaryEmail: "tom@blueridgeplumbing.com",
    primaryPhone: "(828) 555-0077",
    services: [
      { id: "s1", name: "SEO / GBP Management", status: "active", startDate: "2025-05-01", monthlyValue: 1500 },
      { id: "s2", name: "Website Build", status: "active", startDate: "2025-05-01", monthlyValue: 2500, notes: "One-time build + handoff"},
    ],
    billingStatus: "current",
    billingCycle: "monthly",
    monthlyRecurring: 1500,
    nextBillingDate: "2025-06-01",
    campaignStatus: "draft",
    activeCampaigns: [],
    deliverables: [
      { id: "d1", title: "Website Wireframes", department: "Design", status: "in_progress", dueDate: "2025-06-10", assignee: "Casey L."},
      { id: "d2", title: "GBP Initial Setup", department: "SEO", status: "completed", dueDate: "2025-05-15", assignee: "Lisa P."},
      { id: "d3", title: "Keyword Research", department: "SEO", status: "completed", dueDate: "2025-05-20", assignee: "Lisa P."},
      { id: "d4", title: "Content Audit", department: "Content", status: "not_started", dueDate: "2025-06-20", assignee: "Alex R."},
    ],
    notes: "New client — onboarded May 2025. Website build in progress. Tom is responsive and engaged.",
    onboardingStage: "in_progress",
    onboardingNotes: "Access credentials received. GBP claimed. Website kickoff call completed 05/08. Design in progress.",
    onboardingNotesUrl: "https://docs.google.com/document/d/blue-ridge-onboarding",
    onboardedDate: "2025-05-08",
    contracts: [
      { id: "ct1", title: "Master Service Agreement", url: "https://drive.google.com/file/blue-ridge-msa", signedDate: "2025-05-01"},
    ],
    activity: [
      { id: "a1", date: "2025-05-28", actor: "Casey L.", action: "Started website wireframe design", type: "task"},
      { id: "a2", date: "2025-05-20", actor: "Lisa P.", action: "Completed keyword research and GBP optimization", type: "task"},
      { id: "a3", date: "2025-05-08", actor: "Alex R.", action: "Onboarding kickoff call — all access received", type: "onboarding"},
      { id: "a4", date: "2025-05-01", actor: "Mike T.", action: "Closed deal — Blue Ridge Plumbing signed", type: "onboarding"},
    ],
    clientSince: "2025-05-01",
    location: "Asheville, NC",
    avatarColor: "#3b82f6",
  },
  {
    id: "c005",
    slug: "harbor-auto",
    companyName: "Harbor Auto Group",
    domain: "harborautogroup.com",
    industry: "Automotive – Dealership",
    healthStatus: "at_risk",
    assignedAM: "Sarah K.",
    salesRep: "Jordan M.",
    primaryContact: "Frank Deluca",
    primaryEmail: "frank@harborauto.com",
    primaryPhone: "(619) 555-0311",
    services: [
      { id: "s1", name: "Meta Ads Management", status: "active", startDate: "2022-11-01", monthlyValue: 4500 },
      { id: "s2", name: "SEO / GBP Management", status: "active", startDate: "2022-11-01", monthlyValue: 2000 },
      { id: "s3", name: "Content Writing", status: "paused", startDate: "2023-02-01", monthlyValue: 900, notes: "On hold — client requested pause for Q2"},
    ],
    billingStatus: "pending",
    billingCycle: "monthly",
    monthlyRecurring: 6500,
    nextBillingDate: "2025-06-01",
    campaignStatus: "active",
    activeCampaigns: [
      { id: "cp1", name: "Summer Sale – Used Inventory", channel: "Meta Ads", status: "active", budget: 8000, startDate: "2025-05-15"},
    ],
    deliverables: [
      { id: "d1", title: "May Ads Report", department: "Meta Ads", status: "in_progress", dueDate: "2025-05-31", assignee: "Mike T."},
      { id: "d2", title: "Ad Creative – Summer Sale", department: "Design", status: "completed", dueDate: "2025-05-14", assignee: "Casey L."},
      { id: "d3", title: "June GBP Posts", department: "SEO", status: "not_started", dueDate: "2025-06-07", assignee: "Lisa P."},
    ],
    notes: "At-risk due to content package dispute. Frank unhappy with Q1 content quality. Sarah escalating. Ad performance is strong — use as retention point.",
    onboardingStage: "completed",
    onboardingNotes: "Onboarded Nov 2022. Multi-location GBP (3 lots). Meta pixel installed on main site.",
    onboardedDate: "2022-11-18",
    contracts: [
      { id: "ct1", title: "Master Service Agreement", url: "https://drive.google.com/file/harbor-auto-msa", signedDate: "2022-11-01"},
    ],
    teamworkProjectUrl: "https://teamwork.com/projects/harborautogroup",
    teamworkProjectName: "Harbor Auto – Legacy",
    activity: [
      { id: "a1", date: "2025-05-26", actor: "Sarah K.", action: "Escalation raised — content quality complaint from Frank", type: "alert"},
      { id: "a2", date: "2025-05-15", actor: "Mike T.", action: "Launched Summer Sale Meta campaign — $8k budget", type: "campaign"},
      { id: "a3", date: "2025-05-10", actor: "Sarah K.", action: "Call with Frank — reviewed Q1 performance. Content concerns logged.", type: "note"},
      { id: "a4", date: "2025-04-28", actor: "Alex R.", action: "Content package paused per client request", type: "system"},
    ],
    clientSince: "2022-11-01",
    location: "San Diego, CA",
    avatarColor: "#ef4444",
  },
];

export function getClientBySlug(slug: string): ClientProfile | undefined {
  return MOCK_CLIENTS.find((c) => c.slug === slug);
}

export function getClientById(id: string): ClientProfile | undefined {
  return MOCK_CLIENTS.find((c) => c.id === id);
}
