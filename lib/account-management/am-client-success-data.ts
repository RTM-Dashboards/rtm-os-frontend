// ─── RTM OS — Account Management Client Success Mock Data ────────────────────
// Covers: Client Portfolio, Onboarding, Projects, Communications,
//         Client Health, Renewals, Expansion, Cancellations, Offboarding.

// ── Shared Types ──────────────────────────────────────────────────────────────

export type ClientStatus =
  | "Prospect"| "Onboarding"| "Active"| "Expansion"| "Renewal"| "At Risk"| "Cancellation Requested"| "Offboarding"| "Archived";

export type HealthStatus = "Healthy"| "Monitor"| "At Risk"| "Critical";
export type RenewalStatus = "Not Started"| "In Progress"| "Renewed"| "At Risk"| "Declined";
export type OnboardingStatus =
  | "Pending"| "In Progress"| "Waiting On Client"| "Ready To Launch"| "Completed";

export type ProjectStatus =
  | "Planning"| "Active"| "On Hold"| "At Risk"| "Completed"| "Cancelled";

export type CommunicationType =
  | "Call Summary"| "Meeting Notes"| "Client Notes"| "Email"| "SMS"| "Follow-Up"| "Action Item";

export type SentimentType = "Positive"| "Neutral"| "Negative"| "Mixed";
export type ExpansionStatus = "Identified"| "Proposed"| "In Negotiation"| "Closed Won"| "Declined";
export type CancellationStatus = "Submitted"| "Save Attempt"| "Escalated"| "Confirmed"| "Saved";
export type OffboardingStatus = "Initiated"| "In Progress"| "Awaiting Client"| "Completed";

// ── Client Portfolio ──────────────────────────────────────────────────────────

export interface PortfolioClient {
  id: string;
  name: string;
  primaryContact: string;
  accountManager: string;
  services: string[];
  projectCount: number;
  healthScore: number;
  healthStatus: HealthStatus;
  renewalStatus: RenewalStatus;
  mrr: number;
  arr: number;
  status: ClientStatus;
  renewalDate: string;
  startDate: string;
  industry: string;
  location: string;
}

export const PORTFOLIO_CLIENTS: PortfolioClient[] = [
  { id: "pc01", name: "Apex Roofing", primaryContact: "Mark Hardin", accountManager: "Sarah Chen", services: ["SEO", "GBP", "Google Ads"], projectCount: 3, healthScore: 92, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 2800, arr: 33600, status: "Active", renewalDate: "2025-09-01", startDate: "2023-09-01", industry: "Roofing", location: "Phoenix, AZ"},
  { id: "pc02", name: "Harbor Auto", primaryContact: "Linda Torres", accountManager: "Sarah Chen", services: ["Google Ads", "SEO"], projectCount: 2, healthScore: 48, healthStatus: "At Risk", renewalStatus: "At Risk", mrr: 3200, arr: 38400, status: "At Risk", renewalDate: "2025-07-11", startDate: "2022-07-11", industry: "Automotive", location: "Seattle, WA"},
  { id: "pc03", name: "Lakeview Dental", primaryContact: "Dr. Sharon Kim", accountManager: "Sarah Chen", services: ["SEO", "Reporting"], projectCount: 2, healthScore: 34, healthStatus: "Critical", renewalStatus: "At Risk", mrr: 2400, arr: 28800, status: "At Risk", renewalDate: "2025-06-30", startDate: "2022-06-30", industry: "Dental", location: "Chicago, IL"},
  { id: "pc04", name: "Blue Sky Solar", primaryContact: "James Brennan", accountManager: "Maria Santos", services: ["SEO", "Meta Ads", "Content", "Design"], projectCount: 4, healthScore: 78, healthStatus: "Monitor", renewalStatus: "In Progress", mrr: 5100, arr: 61200, status: "Onboarding", renewalDate: "2026-01-15", startDate: "2025-01-15", industry: "Solar", location: "San Diego, CA"},
  { id: "pc05", name: "Metro Electrical", primaryContact: "Carlos Reyes", accountManager: "James Park", services: ["PPC", "LSA", "GBP"], projectCount: 3, healthScore: 58, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 3600, arr: 43200, status: "Active", renewalDate: "2025-11-20", startDate: "2023-11-20", industry: "Electrical", location: "Dallas, TX"},
  { id: "pc06", name: "Pinnacle HVAC", primaryContact: "Rachel Moore", accountManager: "James Park", services: ["GBP", "LSA", "SEO"], projectCount: 3, healthScore: 88, healthStatus: "Healthy", renewalStatus: "In Progress", mrr: 4500, arr: 54000, status: "Renewal", renewalDate: "2025-07-01", startDate: "2023-07-01", industry: "HVAC", location: "Houston, TX"},
  { id: "pc07", name: "Summit Landscaping", primaryContact: "Eric Walsh", accountManager: "James Park", services: ["SEO", "Content", "GBP"], projectCount: 2, healthScore: 62, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 2900, arr: 34800, status: "Active", renewalDate: "2025-10-15", startDate: "2023-10-15", industry: "Landscaping", location: "Denver, CO"},
  { id: "pc08", name: "NorthStar Dental", primaryContact: "Dr. Amy Lee", accountManager: "Tina Webb", services: ["SEO", "PPC", "Content"], projectCount: 3, healthScore: 84, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 3800, arr: 45600, status: "Active", renewalDate: "2025-12-01", startDate: "2023-12-01", industry: "Dental", location: "Minneapolis, MN"},
  { id: "pc09", name: "Pacific Dental", primaryContact: "Dr. Brian Ngo", accountManager: "Tina Webb", services: ["SEO", "Reporting", "GBP"], projectCount: 2, healthScore: 71, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 3200, arr: 38400, status: "Active", renewalDate: "2025-08-10", startDate: "2023-08-10", industry: "Dental", location: "Sacramento, CA"},
  { id: "pc10", name: "Radiance MedSpa", primaryContact: "Nicole Hart", accountManager: "Tina Webb", services: ["Meta Ads", "Design", "SEO"], projectCount: 3, healthScore: 80, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 4200, arr: 50400, status: "Active", renewalDate: "2025-11-01", startDate: "2023-11-01", industry: "MedSpa", location: "Miami, FL"},
  { id: "pc11", name: "Urban Fitness Co.", primaryContact: "Dan Mitchell", accountManager: "Sarah Chen", services: ["Meta Ads", "SEO"], projectCount: 2, healthScore: 76, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 2600, arr: 31200, status: "Active", renewalDate: "2025-10-20", startDate: "2023-10-20", industry: "Fitness", location: "Austin, TX"},
  { id: "pc12", name: "Bright Dental Studio", primaryContact: "Dr. Casey Long", accountManager: "Maria Santos", services: ["SEO", "Content", "GBP"], projectCount: 2, healthScore: 82, healthStatus: "Healthy", renewalStatus: "In Progress", mrr: 3400, arr: 40800, status: "Expansion", renewalDate: "2025-07-20", startDate: "2022-07-20", industry: "Dental", location: "Atlanta, GA"},
  { id: "pc13", name: "CloudPath Tech", primaryContact: "Victor Huang", accountManager: "Maria Santos", services: ["SEO", "Content", "PPC", "Reporting"], projectCount: 4, healthScore: 91, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 9800, arr: 117600, status: "Active", renewalDate: "2025-12-31", startDate: "2023-01-01", industry: "Technology", location: "San Francisco, CA"},
  { id: "pc14", name: "GreenLeaf Gardens", primaryContact: "Pam Stevens", accountManager: "James Park", services: ["SEO", "GBP"], projectCount: 1, healthScore: 55, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 1800, arr: 21600, status: "Active", renewalDate: "2025-09-05", startDate: "2024-09-05", industry: "Landscaping", location: "Portland, OR"},
  { id: "pc15", name: "Harbor Eye Care", primaryContact: "Dr. Fiona Chang", accountManager: "Tina Webb", services: ["SEO", "PPC"], projectCount: 2, healthScore: 67, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 2800, arr: 33600, status: "Active", renewalDate: "2025-10-05", startDate: "2023-10-05", industry: "Optometry", location: "Boston, MA"},
  { id: "pc16", name: "Coastal Plumbing Co.", primaryContact: "Tom Caine", accountManager: "Sarah Chen", services: ["SEO", "Meta Ads", "GBP", "LSA"], projectCount: 3, healthScore: 89, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 4500, arr: 54000, status: "Active", renewalDate: "2026-03-15", startDate: "2023-03-15", industry: "Plumbing", location: "Miami, FL"},
  { id: "pc17", name: "Peak Performance HVAC", primaryContact: "Greg Lang", accountManager: "James Park", services: ["Meta Ads", "PPC", "Reporting"], projectCount: 3, healthScore: 43, healthStatus: "Critical", renewalStatus: "At Risk", mrr: 6200, arr: 74400, status: "At Risk", renewalDate: "2025-09-01", startDate: "2022-09-01", industry: "HVAC", location: "Phoenix, AZ"},
  { id: "pc18", name: "Elite Carpet Cleaners", primaryContact: "Wendy Russo", accountManager: "Maria Santos", services: ["GBP", "SEO"], projectCount: 1, healthScore: 73, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 1600, arr: 19200, status: "Active", renewalDate: "2026-02-01", startDate: "2024-02-01", industry: "Cleaning", location: "Nashville, TN"},
  { id: "pc19", name: "Summit Roofing Group", primaryContact: "Paul Grant", accountManager: "Maria Santos", services: ["LSA", "PPC", "GBP"], projectCount: 2, healthScore: 29, healthStatus: "Critical", renewalStatus: "Declined", mrr: 5100, arr: 61200, status: "Cancellation Requested", renewalDate: "2025-08-01", startDate: "2023-06-01", industry: "Roofing", location: "Dallas, TX"},
  { id: "pc20", name: "Luxe Dental Spa", primaryContact: "Dr. Maya Patel", accountManager: "Sarah Chen", services: ["SEO", "Content", "Design"], projectCount: 3, healthScore: 87, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 3800, arr: 45600, status: "Active", renewalDate: "2026-01-10", startDate: "2024-01-10", industry: "Dental", location: "Beverly Hills, CA"},
  { id: "pc21", name: "TrueGrit Construction", primaryContact: "Dale Owens", accountManager: "James Park", services: ["SEO", "PPC"], projectCount: 2, healthScore: 69, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 2400, arr: 28800, status: "Active", renewalDate: "2025-11-30", startDate: "2023-11-30", industry: "Construction", location: "Charlotte, NC"},
  { id: "pc22", name: "FlowState Yoga Studio", primaryContact: "Ava Rivera", accountManager: "Tina Webb", services: ["Meta Ads", "GBP"], projectCount: 1, healthScore: 79, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 1400, arr: 16800, status: "Active", renewalDate: "2026-01-01", startDate: "2024-01-01", industry: "Fitness", location: "Portland, OR"},
  { id: "pc23", name: "BrightPath Tutoring", primaryContact: "Kevin Mack", accountManager: "Sarah Chen", services: ["SEO", "PPC", "Content"], projectCount: 2, healthScore: 60, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 2200, arr: 26400, status: "Active", renewalDate: "2025-08-15", startDate: "2024-02-15", industry: "Education", location: "Chicago, IL"},
  { id: "pc24", name: "Harbor View Realty", primaryContact: "Sandra Chen", accountManager: "James Park", services: ["SEO", "Meta Ads", "Design", "Content"], projectCount: 4, healthScore: 46, healthStatus: "At Risk", renewalStatus: "At Risk", mrr: 7500, arr: 90000, status: "At Risk", renewalDate: "2025-07-01", startDate: "2023-07-01", industry: "Real Estate", location: "Seattle, WA"},
  { id: "pc25", name: "Precision Auto Repair", primaryContact: "Hank Diaz", accountManager: "Maria Santos", services: ["GBP", "SEO", "Reviews"], projectCount: 2, healthScore: 83, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 1800, arr: 21600, status: "Active", renewalDate: "2026-06-01", startDate: "2024-06-01", industry: "Automotive", location: "Nashville, TN"},
  { id: "pc26", name: "Keystone Law Group", primaryContact: "Atty. Drew Park", accountManager: "Tina Webb", services: ["SEO", "Content", "PPC"], projectCount: 3, healthScore: 77, healthStatus: "Healthy", renewalStatus: "In Progress", mrr: 4800, arr: 57600, status: "Renewal", renewalDate: "2025-07-15", startDate: "2022-07-15", industry: "Legal", location: "New York, NY"},
  { id: "pc27", name: "ActiveStep Physical Therapy", primaryContact: "Dr. Lisa Grant", accountManager: "Maria Santos", services: ["SEO", "GBP"], projectCount: 1, healthScore: 75, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 2100, arr: 25200, status: "Active", renewalDate: "2026-02-10", startDate: "2024-02-10", industry: "Healthcare", location: "Columbus, OH"},
  { id: "pc28", name: "Riverstone Remodeling", primaryContact: "Jake Torres", accountManager: "James Park", services: ["LSA", "GBP", "SEO"], projectCount: 2, healthScore: 64, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 2700, arr: 32400, status: "Active", renewalDate: "2025-12-15", startDate: "2023-12-15", industry: "Construction", location: "Phoenix, AZ"},
  { id: "pc29", name: "Golden Gate Urgent Care", primaryContact: "Dr. Mike Vo", accountManager: "Tina Webb", services: ["SEO", "PPC", "Reporting"], projectCount: 3, healthScore: 81, healthStatus: "Healthy", renewalStatus: "Not Started", mrr: 5500, arr: 66000, status: "Active", renewalDate: "2025-11-20", startDate: "2023-11-20", industry: "Healthcare", location: "San Francisco, CA"},
  { id: "pc30", name: "Apex Solar Solutions", primaryContact: "Ravi Kapoor", accountManager: "Sarah Chen", services: ["Meta Ads", "SEO", "Content"], projectCount: 3, healthScore: 72, healthStatus: "Monitor", renewalStatus: "Not Started", mrr: 3900, arr: 46800, status: "Active", renewalDate: "2025-10-01", startDate: "2023-10-01", industry: "Solar", location: "Las Vegas, NV"},
];

// ── Onboarding Center ─────────────────────────────────────────────────────────

export interface OnboardingRecord {
  id: string;
  client: string;
  contract: string;
  servicesPurchased: string[];
  assignedDepartments: string[];
  onboardingStatus: OnboardingStatus;
  activationStatus: "Not Started"| "In Progress"| "Complete";
  projectCreationStatus: "Not Created"| "Created"| "Launched";
  assignedAM: string;
  startDate: string;
  targetDate: string;
  completedSteps: number;
  totalSteps: number;
  blockers: string[];
}

export const ONBOARDING_RECORDS: OnboardingRecord[] = [
  { id: "ob01", client: "Blue Sky Solar", contract: "Contract #2025-001", servicesPurchased: ["SEO", "Meta Ads", "Content", "Design"], assignedDepartments: ["SEO", "Paid Ads", "Content", "Design"], onboardingStatus: "In Progress", activationStatus: "In Progress", projectCreationStatus: "Created", assignedAM: "Maria Santos", startDate: "2025-01-15", targetDate: "2025-02-28", completedSteps: 6, totalSteps: 10, blockers: ["Brand kit pending from client"] },
  { id: "ob02", client: "Metro Electrical", contract: "Contract #2025-002", servicesPurchased: ["PPC", "LSA", "GBP"], assignedDepartments: ["Paid Ads", "LSA", "SEO & Local"], onboardingStatus: "Waiting On Client", activationStatus: "Not Started", projectCreationStatus: "Created", assignedAM: "James Park", startDate: "2025-01-20", targetDate: "2025-03-01", completedSteps: 3, totalSteps: 9, blockers: ["Client not responding for 2 weeks", "LSA verification docs missing"] },
  { id: "ob03", client: "Precision Auto Repair", contract: "Contract #2024-187", servicesPurchased: ["GBP", "SEO", "Reviews"], assignedDepartments: ["SEO & Local", "Reputation"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Maria Santos", startDate: "2024-05-15", targetDate: "2024-06-15", completedSteps: 8, totalSteps: 8, blockers: [] },
  { id: "ob04", client: "Apex Solar Solutions", contract: "Contract #2023-112", servicesPurchased: ["Meta Ads", "SEO", "Content"], assignedDepartments: ["Paid Ads", "SEO", "Content"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Sarah Chen", startDate: "2023-10-01", targetDate: "2023-11-01", completedSteps: 10, totalSteps: 10, blockers: [] },
  { id: "ob05", client: "BrightPath Tutoring", contract: "Contract #2024-034", servicesPurchased: ["SEO", "PPC", "Content"], assignedDepartments: ["SEO", "Paid Ads", "Content"], onboardingStatus: "In Progress", activationStatus: "In Progress", projectCreationStatus: "Created", assignedAM: "Sarah Chen", startDate: "2024-02-15", targetDate: "2024-03-30", completedSteps: 5, totalSteps: 8, blockers: ["Landing page design blocked on brand assets"] },
  { id: "ob06", client: "FlowState Yoga Studio", contract: "Contract #2024-001", servicesPurchased: ["Meta Ads", "GBP"], assignedDepartments: ["Paid Ads", "SEO & Local"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Tina Webb", startDate: "2024-01-01", targetDate: "2024-01-31", completedSteps: 7, totalSteps: 7, blockers: [] },
  { id: "ob07", client: "Riverstone Remodeling", contract: "Contract #2023-245", servicesPurchased: ["LSA", "GBP", "SEO"], assignedDepartments: ["LSA", "SEO & Local"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "James Park", startDate: "2023-12-15", targetDate: "2024-01-31", completedSteps: 9, totalSteps: 9, blockers: [] },
  { id: "ob08", client: "Harbor Eye Care", contract: "Contract #2023-178", servicesPurchased: ["SEO", "PPC"], assignedDepartments: ["SEO", "Paid Ads"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Tina Webb", startDate: "2023-10-05", targetDate: "2023-11-15", completedSteps: 8, totalSteps: 8, blockers: [] },
  { id: "ob09", client: "ActiveStep Physical Therapy", contract: "Contract #2024-042", servicesPurchased: ["SEO", "GBP"], assignedDepartments: ["SEO & Local"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Maria Santos", startDate: "2024-02-10", targetDate: "2024-03-10", completedSteps: 7, totalSteps: 7, blockers: [] },
  { id: "ob10", client: "Elite Carpet Cleaners", contract: "Contract #2024-028", servicesPurchased: ["GBP", "SEO"], assignedDepartments: ["SEO & Local"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Maria Santos", startDate: "2024-02-01", targetDate: "2024-02-28", completedSteps: 6, totalSteps: 6, blockers: [] },
  { id: "ob11", client: "Keystone Law Group", contract: "Contract #2022-089", servicesPurchased: ["SEO", "Content", "PPC"], assignedDepartments: ["SEO", "Content", "Paid Ads"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Tina Webb", startDate: "2022-07-15", targetDate: "2022-08-31", completedSteps: 10, totalSteps: 10, blockers: [] },
  { id: "ob12", client: "GreenLeaf Gardens", contract: "Contract #2024-115", servicesPurchased: ["SEO", "GBP"], assignedDepartments: ["SEO & Local"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "James Park", startDate: "2024-09-05", targetDate: "2024-10-05", completedSteps: 6, totalSteps: 6, blockers: [] },
  { id: "ob13", client: "TrueGrit Construction", contract: "Contract #2023-241", servicesPurchased: ["SEO", "PPC"], assignedDepartments: ["SEO", "Paid Ads"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "James Park", startDate: "2023-11-30", targetDate: "2024-01-15", completedSteps: 8, totalSteps: 8, blockers: [] },
  { id: "ob14", client: "Golden Gate Urgent Care", contract: "Contract #2023-223", servicesPurchased: ["SEO", "PPC", "Reporting"], assignedDepartments: ["SEO", "Paid Ads", "Reporting"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Tina Webb", startDate: "2023-11-20", targetDate: "2023-12-31", completedSteps: 10, totalSteps: 10, blockers: [] },
  { id: "ob15", client: "Luxe Dental Spa", contract: "Contract #2024-010", servicesPurchased: ["SEO", "Content", "Design"], assignedDepartments: ["SEO", "Content", "Design"], onboardingStatus: "Completed", activationStatus: "Complete", projectCreationStatus: "Launched", assignedAM: "Sarah Chen", startDate: "2024-01-10", targetDate: "2024-02-28", completedSteps: 9, totalSteps: 9, blockers: [] },
];

// ── Active Projects ────────────────────────────────────────────────────────────

export interface ActiveProject {
  id: string;
  name: string;
  client: string;
  departments: string[];
  milestones: string[];
  launchStatus: ProjectStatus;
  dependencies: string[];
  completionPct: number;
  blockedTasks: number;
  escalations: number;
  approvalsPending: number;
  dueDate: string;
  accountManager: string;
}

export const ACTIVE_PROJECTS: ActiveProject[] = [
  { id: "pr01", name: "SEO + GBP Launch", client: "Apex Roofing", departments: ["SEO & Local"], milestones: ["Keyword Research", "On-Page Optimization", "GBP Audit", "Go-Live"], launchStatus: "Active", dependencies: [], completionPct: 75, blockedTasks: 0, escalations: 0, approvalsPending: 1, dueDate: "2025-07-15", accountManager: "Sarah Chen"},
  { id: "pr02", name: "Google Ads Campaign", client: "Apex Roofing", departments: ["Paid Ads"], milestones: ["Campaign Setup", "Ad Copy Review", "Landing Page", "Launch"], launchStatus: "Active", dependencies: [], completionPct: 60, blockedTasks: 0, escalations: 0, approvalsPending: 0, dueDate: "2025-07-01", accountManager: "Sarah Chen"},
  { id: "pr03", name: "Website Redesign", client: "Harbor Auto", departments: ["Design", "Web Development"], milestones: ["Discovery", "Wireframes", "Design Review", "Dev Build", "QA", "Launch"], launchStatus: "At Risk", dependencies: ["Client brand approval"], completionPct: 35, blockedTasks: 2, escalations: 1, approvalsPending: 2, dueDate: "2025-07-10", accountManager: "Sarah Chen"},
  { id: "pr04", name: "SEO Foundation", client: "Blue Sky Solar", departments: ["SEO"], milestones: ["Site Audit", "Content Plan", "Link Building", "Go-Live"], launchStatus: "Active", dependencies: [], completionPct: 50, blockedTasks: 0, escalations: 0, approvalsPending: 0, dueDate: "2025-08-01", accountManager: "Maria Santos"},
  { id: "pr05", name: "Meta Ads Campaign", client: "Blue Sky Solar", departments: ["Paid Ads"], milestones: ["Pixel Setup", "Audience Build", "Creative Review", "Launch"], launchStatus: "Active", dependencies: ["Brand kit delivery"], completionPct: 30, blockedTasks: 1, escalations: 0, approvalsPending: 1, dueDate: "2025-07-20", accountManager: "Maria Santos"},
  { id: "pr06", name: "PPC Campaigns", client: "Metro Electrical", departments: ["Paid Ads", "LSA"], milestones: ["Account Setup", "Campaign Build", "Ad Copy", "Launch"], launchStatus: "On Hold", dependencies: ["LSA docs from client", "Ad account access"], completionPct: 20, blockedTasks: 3, escalations: 1, approvalsPending: 0, dueDate: "2025-07-15", accountManager: "James Park"},
  { id: "pr07", name: "GBP Optimization", client: "Pinnacle HVAC", departments: ["SEO & Local"], milestones: ["Audit", "Optimization", "Photo Upload", "Posts Live"], launchStatus: "Active", dependencies: [], completionPct: 85, blockedTasks: 0, escalations: 0, approvalsPending: 0, dueDate: "2025-06-30", accountManager: "James Park"},
  { id: "pr08", name: "LSA Setup", client: "Pinnacle HVAC", departments: ["LSA"], milestones: ["License Verification", "Profile Setup", "Budget Config", "Go-Live"], launchStatus: "Active", dependencies: [], completionPct: 90, blockedTasks: 0, escalations: 0, approvalsPending: 1, dueDate: "2025-06-25", accountManager: "James Park"},
  { id: "pr09", name: "SEO + Content Program", client: "NorthStar Dental", departments: ["SEO", "Content"], milestones: ["Keyword Strategy", "Content Calendar", "Monthly Blogs", "Reporting"], launchStatus: "Active", dependencies: [], completionPct: 70, blockedTasks: 0, escalations: 0, approvalsPending: 0, dueDate: "2025-08-15", accountManager: "Tina Webb"},
  { id: "pr10", name: "PPC Lead Generation", client: "NorthStar Dental", departments: ["Paid Ads"], milestones: ["Campaign Setup", "Landing Pages", "Call Tracking", "Launch"], launchStatus: "Active", dependencies: [], completionPct: 65, blockedTasks: 1, escalations: 0, approvalsPending: 0, dueDate: "2025-07-31", accountManager: "Tina Webb"},
  { id: "pr11", name: "Meta Ads Launch", client: "Radiance MedSpa", departments: ["Paid Ads", "Design"], milestones: ["Creative Brief", "Ad Design", "Campaign Setup", "Launch"], launchStatus: "Active", dependencies: [], completionPct: 80, blockedTasks: 0, escalations: 0, approvalsPending: 1, dueDate: "2025-07-01", accountManager: "Tina Webb"},
  { id: "pr12", name: "SEO Content Program", client: "Radiance MedSpa", departments: ["SEO", "Content"], milestones: ["Audit", "Content Strategy", "Monthly Delivery", "Reporting"], launchStatus: "Active", dependencies: [], completionPct: 55, blockedTasks: 0, escalations: 0, approvalsPending: 0, dueDate: "2025-09-01", accountManager: "Tina Webb"},
  { id: "pr13", name: "Full Digital Overhaul", client: "CloudPath Tech", departments: ["SEO", "Content", "Paid Ads", "Reporting"], milestones: ["Strategy", "SEO Setup", "Ad Launch", "Q1 Report"], launchStatus: "Active", dependencies: [], completionPct: 88, blockedTasks: 0, escalations: 0, approvalsPending: 0, dueDate: "2025-07-30", accountManager: "Maria Santos"},
  { id: "pr14", name: "Harbor View Realty Campaign", client: "Harbor View Realty", departments: ["SEO", "Meta Ads", "Design"], milestones: ["Market Research", "Ad Creative", "Campaign Build", "Launch"], launchStatus: "At Risk", dependencies: ["CRM API key", "Client ad approvals"], completionPct: 25, blockedTasks: 4, escalations: 2, approvalsPending: 3, dueDate: "2025-07-01", accountManager: "James Park"},
  { id: "pr15", name: "SEO Foundation", client: "Keystone Law Group", departments: ["SEO", "Content"], milestones: ["Technical Audit", "Content Plan", "Link Outreach", "Q3 Reporting"], launchStatus: "Active", dependencies: [], completionPct: 72, blockedTasks: 0, escalations: 0, approvalsPending: 0, dueDate: "2025-08-30", accountManager: "Tina Webb"},
];

// ── Communications ─────────────────────────────────────────────────────────────

export interface CommunicationEntry {
  id: string;
  client: string;
  accountManager: string;
  type: CommunicationType;
  date: string;
  subject: string;
  summary: string;
  followUpRequired: boolean;
  followUpDate?: string;
  actionItems: string[];
  sentiment: SentimentType;
  openConcerns: string[];
  /** MASTER_CLIENTS id — set when this communication maps to a real engine client */
  clientId?: string;
  /** Engine Project id — set when this communication is associated with a specific project */
  engineProjectId?: string;
}

export const COMMUNICATIONS: CommunicationEntry[] = [
  { id: "cm01", clientId: "pc01", client: "Apex Roofing", accountManager: "Sarah Chen", type: "Call Summary", date: "2025-06-02", subject: "Monthly Strategy Call", summary: "Client happy with lead volume. Discussed storm season opportunity for LSA expansion. Agreed to send upsell proposal.", followUpRequired: true, followUpDate: "2025-06-09", actionItems: ["Send LSA upsell proposal", "Prepare storm season ad creative brief"], sentiment: "Positive", openConcerns: [] },
  { id: "cm02", clientId: "pc02", client: "Harbor Auto", accountManager: "Sarah Chen", type: "Call Summary", date: "2025-05-15", subject: "Performance Review Call", summary: "Client expressed frustration with lead volume decline. Payment still overdue. Promised to follow up on both payment and a strategy update.", followUpRequired: true, followUpDate: "2025-06-10", actionItems: ["Send payment reminder", "Prepare lead quality analysis", "Escalate to billing"], sentiment: "Negative", openConcerns: ["Overdue payment $3,200", "Lead volume down 28% MoM"] },
  { id: "cm03", clientId: "pc03", client: "Lakeview Dental", accountManager: "Sarah Chen", type: "Email", date: "2025-05-28", subject: "Renewal Discussion", summary: "Emailed client about upcoming renewal. No response yet. Renewal is June 30. Payment also overdue.", followUpRequired: true, followUpDate: "2025-06-10", actionItems: ["Follow up via phone", "Prepare renewal brief", "Escalate to manager if no response by Jun 12"], sentiment: "Neutral", openConcerns: ["No response to renewal email", "Payment 45 days overdue"] },
  { id: "cm04", clientId: "pc06", client: "Pinnacle HVAC", accountManager: "James Park", type: "Meeting Notes", date: "2025-06-01", subject: "Q2 Renewal Planning Meeting", summary: "Very productive meeting. Client wants to expand GBP + LSA for summer. Strong interest in new analytics reporting.", followUpRequired: true, followUpDate: "2025-06-15", actionItems: ["Send expanded GBP/LSA proposal", "Schedule analytics report demo"], sentiment: "Positive", openConcerns: [] },
  { id: "cm05", clientId: "pc08", client: "NorthStar Dental", accountManager: "Tina Webb", type: "Client Notes", date: "2025-06-03", subject: "Post-Campaign Check-in", summary: "Client very happy with new patient acquisition from PPC. Asked about expanding to additional locations.", followUpRequired: true, followUpDate: "2025-06-20", actionItems: ["Prepare multi-location expansion brief"], sentiment: "Positive", openConcerns: [] },
  { id: "cm06", clientId: "pc05", client: "Metro Electrical", accountManager: "James Park", type: "Follow-Up", date: "2025-06-04", subject: "Onboarding Asset Request Follow-Up", summary: "Third follow-up attempt for missing LSA docs. Client says they are working on it.", followUpRequired: true, followUpDate: "2025-06-11", actionItems: ["Final follow-up before escalation"], sentiment: "Neutral", openConcerns: ["LSA verification docs missing for 3 weeks"] },
  { id: "cm07", client: "Harbor View Realty", accountManager: "James Park", type: "Email", date: "2025-05-30", subject: "CRM Integration Issue", summary: "Client unhappy with lead tracking. CRM API key still not provided. Escalated to manager.", followUpRequired: true, followUpDate: "2025-06-10", actionItems: ["Escalate CRM API issue", "Send interim manual tracking report"], sentiment: "Negative", openConcerns: ["CRM API key not provided", "Lead tracking broken", "Client threatening review reduction"] },
  { id: "cm08", clientId: "pc13", client: "CloudPath Tech", accountManager: "Maria Santos", type: "Meeting Notes", date: "2025-06-03", subject: "Q2 Strategy & LinkedIn Ads Review", summary: "Excellent meeting. Client approved Q2 expansion into LinkedIn Ads. Budget increased to $12K/mo.", followUpRequired: false, actionItems: ["Set up LinkedIn Ads account", "Send updated contract addendum"], sentiment: "Positive", openConcerns: [] },
  { id: "cm09", client: "Radiance MedSpa", accountManager: "Tina Webb", type: "SMS", date: "2025-06-01", subject: "Quick Check-in", summary: "Text from client asking about summer Meta Ads promotion timeline. Confirmed launch by July 1.", followUpRequired: false, actionItems: [], sentiment: "Positive", openConcerns: [] },
  { id: "cm10", client: "Peak Performance HVAC", accountManager: "James Park", type: "Action Item", date: "2025-06-04", subject: "Overdue Report Escalation", summary: "Reports now 2 months overdue. AM is preparing reports. Client has not been contacted in 25 days.", followUpRequired: true, followUpDate: "2025-06-08", actionItems: ["Send June report immediately", "Book makeup call with client", "Escalate delayed reporting to team lead"], sentiment: "Negative", openConcerns: ["2 monthly reports overdue", "No client contact in 25 days"] },
  // Engine-backed entries: linked to real MASTER_CLIENTS and engine Projects
  { id: "cm11", clientId: "mc004", engineProjectId: "proj-am-mc004", client: "Blue Ridge Plumbing Co.", accountManager: "Alex R.", type: "Call Summary", date: "2025-05-08", subject: "Kickoff Call — SEO / GBP + Website Build", summary: "Completed onboarding kickoff. Confirmed service scope: SEO/GBP and Website Build. Access requests sent for GA4, GSC, and website CMS. Website wireframe review scheduled for late May.", followUpRequired: true, followUpDate: "2025-05-15", actionItems: ["Send access request links", "Schedule wireframe review", "Assign SEO specialist"], sentiment: "Positive", openConcerns: [] },
  { id: "cm12", clientId: "mc011", engineProjectId: "proj-am-mc011", client: "Ridgeline Construction LLC", accountManager: "Alex R.", type: "Follow-Up", date: "2025-05-27", subject: "Access Credentials Follow-Up", summary: "Second follow-up for GBP admin access and Search Console credentials. Client says credentials are with their IT team. SEO work is blocked until access is granted.", followUpRequired: true, followUpDate: "2025-06-03", actionItems: ["Send credential request template", "Escalate if no response by June 3", "Document blocker in project record"], sentiment: "Neutral", openConcerns: ["GBP admin access not yet provided", "Search Console pending IT team handoff"] },
];

// ── AI Communication Intelligence ────────────────────────────────────────────

export interface ClientAIIntel {
  clientId: string;
  client: string;
  lastCommunication: string;
  pendingFollowUps: number;
  openConcerns: string[];
  actionItems: string[];
  renewalSignals: string;
  upsellSignals: string;
  sentiment: SentimentType;
  growthOpportunities: string[];
}

export const AI_CLIENT_INTEL: ClientAIIntel[] = [
  { clientId: "pc01", client: "Apex Roofing", lastCommunication: "2025-06-02", pendingFollowUps: 1, openConcerns: [], actionItems: ["Send LSA upsell proposal"], renewalSignals: "Positive — Client engaged, no churn signals", upsellSignals: "High — Storm season creates $800/mo LSA opportunity", sentiment: "Positive", growthOpportunities: ["LSA expansion", "Call Tracking add-on", "Storm season content"] },
  { clientId: "pc02", client: "Harbor Auto", lastCommunication: "2025-05-15", pendingFollowUps: 3, openConcerns: ["Overdue payment", "Lead decline"], actionItems: ["Send payment reminder", "Prepare lead analysis"], renewalSignals: "At Risk — Renewal in 37 days with unresolved payment", upsellSignals: "Low — Must resolve payment before expansion", sentiment: "Negative", growthOpportunities: ["Display Ads if payment resolved"] },
  { clientId: "pc03", client: "Lakeview Dental", lastCommunication: "2025-05-28", pendingFollowUps: 2, openConcerns: ["No renewal response", "Payment 45 days overdue"], actionItems: ["Call client immediately", "Escalate to management"], renewalSignals: "Critical — Renewal June 30, no response to outreach", upsellSignals: "None — Must stabilize account first", sentiment: "Negative", growthOpportunities: [] },
  { clientId: "pc06", client: "Pinnacle HVAC", lastCommunication: "2025-06-01", pendingFollowUps: 1, openConcerns: [], actionItems: ["Send GBP/LSA expansion proposal"], renewalSignals: "Strong — Client wants to expand, renewal in 25 days", upsellSignals: "High — GBP + Analytics expansion worth $1,200/mo", sentiment: "Positive", growthOpportunities: ["GBP expansion", "Analytics Reporting Pro", "Reputation Management"] },
  { clientId: "pc13", client: "CloudPath Tech", lastCommunication: "2025-06-03", pendingFollowUps: 0, openConcerns: [], actionItems: ["Set up LinkedIn Ads account"], renewalSignals: "Excellent — Client increasing budget, no renewal risk", upsellSignals: "Confirmed — LinkedIn Ads $2,400/mo approved", sentiment: "Positive", growthOpportunities: ["LinkedIn Ads", "Programmatic Display", "CRO consulting"] },
];

// ── Client Health Center ───────────────────────────────────────────────────────

export interface ClientHealth {
  clientId: string;
  client: string;
  accountManager: string;
  healthScore: number;
  healthStatus: HealthStatus;
  communicationHealth: "Strong"| "Good"| "Weak"| "Poor";
  projectHealth: "On Track"| "Monitor"| "Delayed"| "Blocked";
  billingHealth: "Current"| "Overdue"| "At Risk"| "Failed";
  renewalRisk: "Low"| "Medium"| "High"| "Critical";
  escalationRisk: "Low"| "Medium"| "High"| "Critical";
  clientEngagement: "High"| "Medium"| "Low"| "Unresponsive";
  lastHealthReview: string;
  aiInsights: string;
}

export const CLIENT_HEALTH: ClientHealth[] = [
  { clientId: "pc01", client: "Apex Roofing", accountManager: "Sarah Chen", healthScore: 92, healthStatus: "Healthy", communicationHealth: "Strong", projectHealth: "On Track", billingHealth: "Current", renewalRisk: "Low", escalationRisk: "Low", clientEngagement: "High", lastHealthReview: "2025-06-02", aiInsights: "Strong performer. Storm season creates expansion opportunity. Recommend LSA upsell conversation."},
  { clientId: "pc02", client: "Harbor Auto", accountManager: "Sarah Chen", healthScore: 48, healthStatus: "At Risk", communicationHealth: "Weak", projectHealth: "Delayed", billingHealth: "Overdue", renewalRisk: "High", escalationRisk: "High", clientEngagement: "Low", lastHealthReview: "2025-05-15", aiInsights: "Payment overdue. Lead quality concerns. Renewal in 37 days. Immediate intervention required."},
  { clientId: "pc03", client: "Lakeview Dental", accountManager: "Sarah Chen", healthScore: 34, healthStatus: "Critical", communicationHealth: "Poor", projectHealth: "Blocked", billingHealth: "Overdue", renewalRisk: "Critical", escalationRisk: "Critical", clientEngagement: "Unresponsive", lastHealthReview: "2025-05-28", aiInsights: "Account in critical state. Payment 45 days overdue. Renewal June 30. No response to outreach."},
  { clientId: "pc04", client: "Blue Sky Solar", accountManager: "Maria Santos", healthScore: 78, healthStatus: "Monitor", communicationHealth: "Good", projectHealth: "On Track", billingHealth: "Current", renewalRisk: "Low", escalationRisk: "Low", clientEngagement: "Medium", lastHealthReview: "2025-06-01", aiInsights: "Onboarding progressing well but brand kit delay may push project timeline."},
  { clientId: "pc05", client: "Metro Electrical", accountManager: "James Park", healthScore: 58, healthStatus: "Monitor", communicationHealth: "Weak", projectHealth: "Blocked", billingHealth: "Current", renewalRisk: "Medium", escalationRisk: "Medium", clientEngagement: "Low", lastHealthReview: "2025-06-04", aiInsights: "Onboarding stalled. LSA docs missing. Client slow to respond. PPC campaign on hold."},
  { clientId: "pc06", client: "Pinnacle HVAC", accountManager: "James Park", healthScore: 88, healthStatus: "Healthy", communicationHealth: "Strong", projectHealth: "On Track", billingHealth: "Current", renewalRisk: "Low", escalationRisk: "Low", clientEngagement: "High", lastHealthReview: "2025-06-01", aiInsights: "Strong account. Renewal conversation underway. High expansion probability for GBP and analytics."},
  { clientId: "pc13", client: "CloudPath Tech", accountManager: "Maria Santos", healthScore: 91, healthStatus: "Healthy", communicationHealth: "Strong", projectHealth: "On Track", billingHealth: "Current", renewalRisk: "Low", escalationRisk: "Low", clientEngagement: "High", lastHealthReview: "2025-06-03", aiInsights: "Flagship client. Budget increasing. LinkedIn Ads approved. No risk signals."},
  { clientId: "pc17", client: "Peak Performance HVAC", accountManager: "James Park", healthScore: 43, healthStatus: "Critical", communicationHealth: "Poor", projectHealth: "Delayed", billingHealth: "Current", renewalRisk: "High", escalationRisk: "High", clientEngagement: "Unresponsive", lastHealthReview: "2025-06-04", aiInsights: "2 consecutive overdue reports. No client contact in 25 days. Escalation required immediately."},
  { clientId: "pc24", client: "Harbor View Realty", accountManager: "James Park", healthScore: 46, healthStatus: "At Risk", communicationHealth: "Weak", projectHealth: "Blocked", billingHealth: "Current", renewalRisk: "High", escalationRisk: "High", clientEngagement: "Low", lastHealthReview: "2025-05-30", aiInsights: "CRM integration stalled. Lead tracking broken. Client frustrated. VP escalation in progress."},
  { clientId: "pc08", client: "NorthStar Dental", accountManager: "Tina Webb", healthScore: 84, healthStatus: "Healthy", communicationHealth: "Strong", projectHealth: "On Track", billingHealth: "Current", renewalRisk: "Low", escalationRisk: "Low", clientEngagement: "High", lastHealthReview: "2025-06-03", aiInsights: "Strong performance. Multi-location expansion interest. Good candidate for expansion proposal."},
];

// ── Renewals (extended) ────────────────────────────────────────────────────────

export interface RenewalRecord {
  id: string;
  client: string;
  renewalWindow: string;
  renewalDate: string;
  daysRemaining: number;
  renewalStatus: RenewalStatus;
  renewalRisk: "Low"| "Medium"| "High"| "Critical";
  assignedOwner: string;
  nextAction: string;
  contractValue: string;
  mrr: number;
}

export const RENEWAL_RECORDS: RenewalRecord[] = [
  { id: "rn01", client: "Lakeview Dental", renewalWindow: "Jun 1 – Jun 30", renewalDate: "2025-06-30", daysRemaining: 26, renewalStatus: "At Risk", renewalRisk: "Critical", assignedOwner: "Sarah Chen", nextAction: "Executive retention call — immediate", contractValue: "$28,800/yr", mrr: 2400 },
  { id: "rn02", client: "Harbor View Realty", renewalWindow: "Jun 1 – Jul 1", renewalDate: "2025-07-01", daysRemaining: 27, renewalStatus: "At Risk", renewalRisk: "Critical", assignedOwner: "James Park", nextAction: "Resolve CRM issue; schedule retention call", contractValue: "$90,000/yr", mrr: 7500 },
  { id: "rn03", client: "Harbor Auto", renewalWindow: "Jun 11 – Jul 11", renewalDate: "2025-07-11", daysRemaining: 37, renewalStatus: "At Risk", renewalRisk: "High", assignedOwner: "Sarah Chen", nextAction: "Resolve payment; send performance update", contractValue: "$38,400/yr", mrr: 3200 },
  { id: "rn04", client: "Pinnacle HVAC", renewalWindow: "Jun 1 – Jul 1", renewalDate: "2025-07-01", daysRemaining: 27, renewalStatus: "In Progress", renewalRisk: "Low", assignedOwner: "James Park", nextAction: "Send GBP expansion proposal with renewal", contractValue: "$54,000/yr", mrr: 4500 },
  { id: "rn05", client: "Keystone Law Group", renewalWindow: "Jun 15 – Jul 15", renewalDate: "2025-07-15", daysRemaining: 41, renewalStatus: "In Progress", renewalRisk: "Medium", assignedOwner: "Tina Webb", nextAction: "Prepare Q2 performance deck", contractValue: "$57,600/yr", mrr: 4800 },
  { id: "rn06", client: "Bright Dental Studio", renewalWindow: "Jun 20 – Jul 20", renewalDate: "2025-07-20", daysRemaining: 46, renewalStatus: "In Progress", renewalRisk: "Low", assignedOwner: "Maria Santos", nextAction: "Book renewal call; propose content upsell", contractValue: "$40,800/yr", mrr: 3400 },
  { id: "rn07", client: "BrightPath Tutoring", renewalWindow: "Jul 15 – Aug 15", renewalDate: "2025-08-15", daysRemaining: 72, renewalStatus: "Not Started", renewalRisk: "Medium", assignedOwner: "Sarah Chen", nextAction: "Send renewal intro email", contractValue: "$26,400/yr", mrr: 2200 },
  { id: "rn08", client: "Pacific Dental", renewalWindow: "Jul 10 – Aug 10", renewalDate: "2025-08-10", daysRemaining: 67, renewalStatus: "Not Started", renewalRisk: "Medium", assignedOwner: "Tina Webb", nextAction: "Book check-in and initiate renewal conversation", contractValue: "$38,400/yr", mrr: 3200 },
  { id: "rn09", client: "Peak Performance HVAC", renewalWindow: "Aug 1 – Sep 1", renewalDate: "2025-09-01", daysRemaining: 89, renewalStatus: "At Risk", renewalRisk: "High", assignedOwner: "James Park", nextAction: "Immediate contact — reports overdue", contractValue: "$74,400/yr", mrr: 6200 },
  { id: "rn10", client: "Apex Roofing", renewalWindow: "Aug 1 – Sep 1", renewalDate: "2025-09-01", daysRemaining: 89, renewalStatus: "Not Started", renewalRisk: "Low", assignedOwner: "Sarah Chen", nextAction: "Initiate renewal + upsell conversation", contractValue: "$33,600/yr", mrr: 2800 },
];

// ── Expansion Opportunities ────────────────────────────────────────────────────

export interface ExpansionOpportunity {
  id: string;
  client: string;
  opportunity: string;
  recommendedServices: string[];
  estimatedRevenue: number;
  confidenceScore: number;
  status: ExpansionStatus;
  assignedOwner: string;
  notes: string;
}

export const EXPANSION_OPPORTUNITIES: ExpansionOpportunity[] = [
  { id: "ex01", client: "Apex Roofing", opportunity: "Storm Season LSA Expansion", recommendedServices: ["LSA", "Call Tracking"], estimatedRevenue: 800, confidenceScore: 92, status: "Proposed", assignedOwner: "Sarah Chen", notes: "Storm season demand surge. High probability of approval."},
  { id: "ex02", client: "Pinnacle HVAC", opportunity: "GBP + Analytics Upgrade", recommendedServices: ["GBP Enhanced", "Analytics Pro"], estimatedRevenue: 1200, confidenceScore: 95, status: "In Negotiation", assignedOwner: "James Park", notes: "Client verbally agreed. Sending formal proposal June 15."},
  { id: "ex03", client: "NorthStar Dental", opportunity: "Multi-Location Expansion", recommendedServices: ["SEO", "PPC", "GBP"], estimatedRevenue: 3800, confidenceScore: 78, status: "Identified", assignedOwner: "Tina Webb", notes: "2 new locations opening Q3. High expansion potential."},
  { id: "ex04", client: "CloudPath Tech", opportunity: "LinkedIn Ads Program", recommendedServices: ["LinkedIn Ads", "Content"], estimatedRevenue: 2400, confidenceScore: 98, status: "Closed Won", assignedOwner: "Maria Santos", notes: "Client approved. Campaign starting July 1."},
  { id: "ex05", client: "Radiance MedSpa", opportunity: "Summer Promotions Campaign", recommendedServices: ["Meta Ads", "SMS Marketing"], estimatedRevenue: 900, confidenceScore: 85, status: "Proposed", assignedOwner: "Tina Webb", notes: "Summer seasonal demand for MedSpa services. Proposal sent."},
  { id: "ex06", client: "Keystone Law Group", opportunity: "Reputation Management Add-on", recommendedServices: ["Reputation Management", "Reviews"], estimatedRevenue: 600, confidenceScore: 70, status: "Identified", assignedOwner: "Tina Webb", notes: "Client has low review count. Opportunity to differentiate."},
  { id: "ex07", client: "Bright Dental Studio", opportunity: "Content Marketing Expansion", recommendedServices: ["Content", "Email Marketing"], estimatedRevenue: 800, confidenceScore: 80, status: "In Negotiation", assignedOwner: "Maria Santos", notes: "Client wants blog + newsletter program. Budget confirmed."},
  { id: "ex08", client: "Harbor Auto", opportunity: "Display Ads Recovery Program", recommendedServices: ["Display Ads", "Remarketing"], estimatedRevenue: 600, confidenceScore: 45, status: "Identified", assignedOwner: "Sarah Chen", notes: "Low confidence due to payment issues. Flagged pending resolution."},
  { id: "ex09", client: "Golden Gate Urgent Care", opportunity: "Telehealth Marketing Program", recommendedServices: ["SEO", "Content", "Paid Social"], estimatedRevenue: 1500, confidenceScore: 75, status: "Proposed", assignedOwner: "Tina Webb", notes: "Telehealth expansion. Client interested in building digital trust content."},
  { id: "ex10", client: "Coastal Plumbing Co.", opportunity: "Emergency Services Ads", recommendedServices: ["PPC", "LSA"], estimatedRevenue: 1000, confidenceScore: 88, status: "Identified", assignedOwner: "Sarah Chen", notes: "High-intent emergency search traffic. LSA + PPC combo recommended."},
];

// ── Cancellation Center ────────────────────────────────────────────────────────

export interface CancellationRecord {
  id: string;
  client: string;
  reason: string;
  riskLevel: "Low"| "Medium"| "High"| "Critical";
  saveAttemptStatus: "Not Started"| "In Progress"| "Escalated"| "Successful"| "Failed";
  assignedOwner: string;
  status: CancellationStatus;
  requestDate: string;
  mrr: number;
  notes: string;
}

export const CANCELLATION_RECORDS: CancellationRecord[] = [
  { id: "ca01", client: "Summit Roofing Group", reason: "Budget disputes and poor lead volume", riskLevel: "Critical", saveAttemptStatus: "Escalated", assignedOwner: "Maria Santos", status: "Escalated", requestDate: "2025-05-20", mrr: 5100, notes: "Client threatening cancellation. Director intervention in progress."},
  { id: "ca02", client: "Harbor Auto", reason: "Dissatisfied with lead quality — considering in-house marketing", riskLevel: "High", saveAttemptStatus: "In Progress", assignedOwner: "Sarah Chen", status: "Save Attempt", requestDate: "2025-06-01", mrr: 3200, notes: "Save attempt underway. Performance review call scheduled June 10."},
  { id: "ca03", client: "Lakeview Dental", reason: "Financial challenges; uncertain about ROI", riskLevel: "Critical", saveAttemptStatus: "In Progress", assignedOwner: "Sarah Chen", status: "Save Attempt", requestDate: "2025-06-03", mrr: 2400, notes: "Payment overdue. Renewal at risk. Executive retention call needed."},
  { id: "ca04", client: "Metro Electrical", reason: "Onboarding stalled — considering alternative agency", riskLevel: "Medium", saveAttemptStatus: "In Progress", assignedOwner: "James Park", status: "Save Attempt", requestDate: "2025-06-04", mrr: 3600, notes: "Client frustrated with delayed onboarding. AM working on resolution."},
  { id: "ca05", client: "Peak Performance HVAC", reason: "No contact in 25 days; missed reports", riskLevel: "High", saveAttemptStatus: "Not Started", assignedOwner: "James Park", status: "Submitted", requestDate: "2025-06-05", mrr: 6200, notes: "Client sent cancellation warning email. No AM response yet."},
];

// ── Offboarding Center ─────────────────────────────────────────────────────────

export interface OffboardingRecord {
  id: string;
  client: string;
  offboardingProject: string;
  assetTransfer: "Not Started"| "In Progress"| "Complete";
  accessRemoval: "Not Started"| "In Progress"| "Complete";
  finalBilling: "Pending"| "Sent"| "Paid"| "Waived";
  archiveStatus: "Not Archived"| "In Progress"| "Archived";
  status: OffboardingStatus;
  assignedOwner: string;
  startDate: string;
  targetDate: string;
  notes: string;
}

export const OFFBOARDING_RECORDS: OffboardingRecord[] = [
  { id: "of01", client: "TechForward Inc.", offboardingProject: "TechForward Offboarding Q1", assetTransfer: "Complete", accessRemoval: "Complete", finalBilling: "Paid", archiveStatus: "Archived", status: "Completed", assignedOwner: "Sarah Chen", startDate: "2025-03-01", targetDate: "2025-03-31", notes: "Clean offboarding. Client moved services in-house."},
  { id: "of02", client: "Summit Roofing Group", offboardingProject: "Summit Roofing Cancellation", assetTransfer: "In Progress", accessRemoval: "Not Started", finalBilling: "Pending", archiveStatus: "Not Archived", status: "In Progress", assignedOwner: "Maria Santos", startDate: "2025-06-01", targetDate: "2025-06-30", notes: "Assets being compiled. Access removal pending final billing."},
  { id: "of03", client: "Harbor Bakery Group", offboardingProject: "Harbor Bakery Exit", assetTransfer: "Complete", accessRemoval: "In Progress", finalBilling: "Sent", archiveStatus: "In Progress", status: "In Progress", assignedOwner: "James Park", startDate: "2025-04-15", targetDate: "2025-05-15", notes: "Final billing sent. Access removal in progress across 4 platforms."},
  { id: "of04", client: "Westside Pet Clinic", offboardingProject: "Westside Pet Clinic Wrap-Up", assetTransfer: "Not Started", accessRemoval: "Not Started", finalBilling: "Pending", archiveStatus: "Not Archived", status: "Initiated", assignedOwner: "Tina Webb", startDate: "2025-06-05", targetDate: "2025-07-05", notes: "Client confirmed cancellation. Offboarding project just initiated."},
  { id: "of05", client: "Lakefront Realty", offboardingProject: "Lakefront Exit Q4", assetTransfer: "Complete", accessRemoval: "Complete", finalBilling: "Paid", archiveStatus: "Archived", status: "Completed", assignedOwner: "Maria Santos", startDate: "2024-12-01", targetDate: "2024-12-31", notes: "Smooth exit. Client satisfied with offboarding process."},
];

// ── Department Coordination ────────────────────────────────────────────────────

export interface DepartmentStatus {
  department: string;
  openTasks: number;
  blockedWork: number;
  upcomingDeliverables: string[];
  dependencies: string[];
  escalations: number;
}

export const DEPARTMENT_STATUS: DepartmentStatus[] = [
  { department: "SEO", openTasks: 14, blockedWork: 2, upcomingDeliverables: ["Harbor Auto monthly report", "Pinnacle HVAC GBP audit"], dependencies: ["Client website access for BrightPath"], escalations: 0 },
  { department: "Paid Ads", openTasks: 11, blockedWork: 3, upcomingDeliverables: ["Metro Electrical campaign setup", "Harbor View Realty ads launch"], dependencies: ["Metro Electrical LSA docs", "Harbor View CRM API"], escalations: 1 },
  { department: "Content", openTasks: 8, blockedWork: 1, upcomingDeliverables: ["NorthStar Dental blog post", "Apex Solar Q3 calendar"], dependencies: [], escalations: 0 },
  { department: "Design", openTasks: 6, blockedWork: 2, upcomingDeliverables: ["Harbor Auto landing page", "Blue Sky Solar ad creative"], dependencies: ["Harbor Auto brand approval", "Blue Sky brand kit"], escalations: 1 },
  { department: "Reporting", openTasks: 9, blockedWork: 0, upcomingDeliverables: ["Peak HVAC June report (overdue)", "CloudPath Q2 executive report"], dependencies: [], escalations: 0 },
  { department: "LSA", openTasks: 5, blockedWork: 1, upcomingDeliverables: ["Pinnacle HVAC LSA go-live"], dependencies: ["Metro Electrical license verification"], escalations: 0 },
  { department: "SEO & Local", openTasks: 7, blockedWork: 1, upcomingDeliverables: ["Riverstone GBP update", "GreenLeaf local citations"], dependencies: [], escalations: 0 },
];

// ── Communication helpers ─────────────────────────────────────────────────────

/**
 * Returns all communication entries associated with a given client.
 * Matches on clientId (MASTER_CLIENTS or PORTFOLIO_CLIENTS id) or
 * falls back to case-insensitive name match.
 */
export function getCommunicationsByClient(
  clientIdOrName: string
): CommunicationEntry[] {
  return COMMUNICATIONS.filter(
    (c) =>
      c.clientId === clientIdOrName ||
      c.client.toLowerCase() === clientIdOrName.toLowerCase()
  );
}

/**
 * Returns all communication entries linked to a specific engine project.
 */
export function getCommunicationsByProject(
  engineProjectId: string
): CommunicationEntry[] {
  return COMMUNICATIONS.filter((c) => c.engineProjectId === engineProjectId);
}
