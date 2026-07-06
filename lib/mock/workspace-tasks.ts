import type { WorkspaceTask } from "@/components/workspace";

// ── Generic factory ────────────────────────────────────────────────────────────
const mkTask = (
  id: string,
  title: string,
  client: string,
  project: string,
  department: string,
  service: string,
  source: WorkspaceTask["source"],
  blueprintOrWorkflow: { blueprint?: string; workflow?: string } | null,
  assignee: string,
  priority: WorkspaceTask["priority"],
  status: WorkspaceTask["status"],
  dueDate: string,
  blocker?: string | null,
): WorkspaceTask => ({
  id,
  title,
  client,
  project,
  department,
  service,
  source,
  blueprintSource: blueprintOrWorkflow?.blueprint,
  workflowSource: blueprintOrWorkflow?.workflow,
  assignee,
  priority,
  status,
  dueDate,
  blocker: blocker ?? null,
});

// ── Account Management ─────────────────────────────────────────────────────────
export const accountManagementTasks: WorkspaceTask[] = [
  mkTask("am-1", "Monthly check-in call — Apex Roofing",      "Apex Roofing",       "Apex Roofing — AM Retainer",        "Account Management", "Account Management", "Task Blueprint",     { blueprint: "Monthly Check-in Blueprint" },             "Jordan M.", "High",   "In Progress",  "Jun 5"),
  mkTask("am-2", "Send Q2 performance summary",                "Sunbelt HVAC",       "Sunbelt HVAC — AM Retainer",        "Account Management", "Account Management", "Workflow Automation",{ workflow: "Monthly Reporting Workflow" },               "Sarah K.",  "High",   "Pending",      "Jun 6"),
  mkTask("am-3", "Renewal discussion — Pacific Dental",        "Pacific Dental",     "Pacific Dental — Renewal",          "Account Management", "Account Management", "Workflow Automation",{ workflow: "Renewal Workflow" },                        "Jordan M.", "Medium", "Pending",      "Jun 8"),
  mkTask("am-4", "Onboarding checklist — Blue Ridge Plumbing", "Blue Ridge Plumbing","Blue Ridge Plumbing — Onboarding",  "Account Management", "Account Management", "Task Blueprint",     { blueprint: "Client Onboarding Blueprint" },            "Alex R.",   "High",   "In Progress",  "Jun 5"),
  mkTask("am-5", "Client satisfaction survey — Harbor Auto",   "Harbor Auto",        "Harbor Auto — AM Retainer",         "Account Management", "Account Management", "Manual Task",        null,                                                    "Sarah K.",  "Low",    "Pending",      "Jun 10"),
  mkTask("am-6", "Update contact info — Metro Dental",         "Metro Dental",       "Metro Dental — AM Retainer",        "Account Management", "Account Management", "Manual Task",        null,                                                    "Jordan M.", "Low",    "Done",         "Jun 3"),
  mkTask("am-7", "At-risk review — Cascade Flooring",          "Cascade Flooring",   "Cascade Flooring — Account Review", "Account Management", "Account Management", "Workflow Automation",{ workflow: "At-Risk Client Workflow" },                  "Alex R.",   "High",   "Blocked",      "Jun 4", "Awaiting escalation approval"),
];

// ── Sales ─────────────────────────────────────────────────────────────────────
export const salesTasks: WorkspaceTask[] = [
  mkTask("sa-1",  "Send proposal — Summit Landscaping",                  "Summit Landscaping",   "Sales Pipeline — Q3",       "Sales", "Sales", "Workflow Automation",{ workflow: "Proposal Workflow" },            "Jordan M.", "High",   "In Progress",  "Jun 5"),
  mkTask("sa-2",  "Follow-up call — Harbor Auto Group",                  "Harbor Auto Group",    "Sales Pipeline — Q3",       "Sales", "Sales", "Workflow Automation",{ workflow: "Lead Nurture Workflow" },         "Mike T.",   "High",   "Pending",      "Jun 6"),
  mkTask("sa-3",  "Update pipeline stage — Metro Dental",                "Metro Dental",         "Sales Pipeline — Q3",       "Sales", "Sales", "Manual Task",         null,                                        "Jordan M.", "Medium", "Pending",      "Jun 7"),
  mkTask("sa-4",  "Discovery call — Cascade Flooring",                   "Cascade Flooring",     "Sales Pipeline — Q3",       "Sales", "Sales", "Task Blueprint",      { blueprint: "Discovery Call Blueprint" },   "Sarah K.",  "Medium", "In Progress",  "Jun 5"),
  mkTask("sa-5",  "Contract sent — Sunstate Solar",                      "Sunstate Solar",       "Sales Pipeline — Q3",       "Sales", "Sales", "Workflow Automation", { workflow: "Contract Workflow" },            "Sarah K.",  "High",   "Done",         "Jun 1"),
  mkTask("sa-6",  "CRM data cleanup",                                    "Internal",             "Sales Pipeline — Q3",       "Sales", "Sales", "Manual Task",         null,                                        "Alex R.",   "Low",    "Pending",      "Jun 9"),
  mkTask("sa-7",  "Win/loss analysis — Q1",                              "Internal",             "Sales Pipeline — Q3",       "Sales", "Sales", "Manual Task",         null,                                        "Mike T.",   "Low",    "Done",         "Jun 2"),
  mkTask("sa-8",  "Affiliate Follow-Up — Brandon Ellis (new referrals)", "Internal",             "Sales Pipeline — Q3",       "Sales", "Sales", "Workflow Automation", { workflow: "Affiliate Follow-Up Workflow" }, "Jordan M.", "High",   "Pending",      "Jun 8"),
  mkTask("sa-9",  "Commission Review — Lisa Park (Coastal Wellness Spa)","Coastal Wellness Spa", "Sales Pipeline — Q3",       "Sales", "Sales", "Manual Task",         null,                                        "Sarah K.",  "Medium", "Pending",      "Jun 9"),
  mkTask("sa-10", "Referral Verification — Tyler Nguyen lead",           "Blue Ridge Plumbing",  "Sales Pipeline — Q3",       "Sales", "Sales", "Manual Task",         null,                                        "Mike T.",   "Medium", "Pending",      "Jun 10"),
];

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingTasks: WorkspaceTask[] = [
  mkTask("bi-1", "Invoice overdue — Green Valley Pools",  "Green Valley Pools",  "Billing — Collections",     "Billing", "Billing", "Workflow Automation",{ workflow: "Collections Workflow" },          "Lisa P.",   "High",   "Pending",     "Jun 5"),
  mkTask("bi-2", "Service renewal — Apex Roofing",        "Apex Roofing",        "Billing — Renewals",        "Billing", "Billing", "Workflow Automation",{ workflow: "Renewal Billing Workflow" },      "Jordan M.", "High",   "In Progress", "Jun 6"),
  mkTask("bi-3", "Cancellation processing — Harbor Auto", "Harbor Auto",         "Billing — Cancellations",   "Billing", "Billing", "Task Blueprint",     { blueprint: "Cancellation Blueprint" },      "Sarah K.",  "High",   "Pending",     "Jun 5"),
  mkTask("bi-4", "Billing audit — June cycle",            "Internal",            "Billing — Monthly Cycle",   "Billing", "Billing", "Workflow Automation",{ workflow: "Monthly Billing Workflow" },      "Lisa P.",   "Medium", "Pending",     "Jun 8"),
  mkTask("bi-5", "Offboarding — Sunbelt HVAC",            "Sunbelt HVAC",        "Billing — Offboarding",     "Billing", "Billing", "Task Blueprint",     { blueprint: "Offboarding Blueprint" },       "Sarah K.",  "High",   "Blocked",     "Jun 4", "Legal approval pending"),
  mkTask("bi-6", "New service activation — Blue Ridge",   "Blue Ridge Plumbing", "Billing — Activation",      "Billing", "Billing", "Workflow Automation",{ workflow: "Activation Review Workflow" },    "Alex R.",   "Medium", "Done",        "Jun 3"),
  mkTask("bi-7", "Q2 revenue reconciliation",             "Internal",            "Billing — Monthly Cycle",   "Billing", "Billing", "Manual Task",        null,                                          "Lisa P.",   "Low",    "Pending",     "Jun 10"),
];

// ── Content ───────────────────────────────────────────────────────────────────
export const contentTasks: WorkspaceTask[] = [
  mkTask("co-1", "Write blog post — Summit Landscaping",    "Summit Landscaping",  "Summit Landscaping — Content Retainer",  "Content", "Content", "Workflow Automation",{ workflow: "Monthly Content Workflow" },    "Alex R.",   "High",   "In Progress", "Jun 6"),
  mkTask("co-2", "Social calendar — Apex Roofing (June)",   "Apex Roofing",        "Apex Roofing — Content Retainer",        "Content", "Content", "Task Blueprint",     { blueprint: "Social Calendar Blueprint" }, "Sarah K.",  "High",   "Pending",     "Jun 7"),
  mkTask("co-3", "Email newsletter — Pacific Dental",       "Pacific Dental",      "Pacific Dental — Content Retainer",      "Content", "Content", "Manual Task",        null,                                        "Jordan M.", "Medium", "Pending",     "Jun 8"),
  mkTask("co-4", "Product description copy — Harbor Auto",  "Harbor Auto",         "Harbor Auto — Content Retainer",         "Content", "Content", "Manual Task",        null,                                        "Alex R.",   "Low",    "Done",        "Jun 2"),
  mkTask("co-5", "Landing page copy — Metro Dental",        "Metro Dental",        "Metro Dental — Content Retainer",        "Content", "Content", "Workflow Automation",{ workflow: "SEO Content Production Workflow" }, "Sarah K.", "Medium", "In Progress", "Jun 7"),
  mkTask("co-6", "Photo shoot brief — Blue Ridge",          "Blue Ridge Plumbing", "Blue Ridge Plumbing — Content Retainer", "Content", "Content", "Manual Task",        null,                                        "Alex R.",   "Low",    "Pending",     "Jun 10"),
  mkTask("co-7", "Content audit — Green Valley Pools",      "Green Valley Pools",  "Green Valley Pools — Content Retainer",  "Content", "Content", "Workflow Automation",{ workflow: "Content Audit Workflow" },       "Jordan M.", "High",   "Blocked",     "Jun 5", "Waiting on client assets"),
];

// ── Web Development ────────────────────────────────────────────────────────────
export const webDevTasks: WorkspaceTask[] = [
  mkTask("wd-1", "Homepage redesign — Summit Landscaping",  "Summit Landscaping",  "Summit Landscaping — Web Retainer",  "Web Development", "Web Development", "Task Blueprint",     { blueprint: "Website Redesign Blueprint" },    "Mike T.",   "High",   "In Progress", "Jun 10"),
  mkTask("wd-2", "CRO fixes — Apex Roofing",                "Apex Roofing",        "Apex Roofing — Web Retainer",        "Web Development", "Web Development", "Manual Task",        null,                                           "Jordan M.", "High",   "Pending",     "Jun 8"),
  mkTask("wd-3", "Site speed audit — Pacific Dental",       "Pacific Dental",      "Pacific Dental — Web Retainer",      "Web Development", "Web Development", "Task Blueprint",     { blueprint: "Core Web Vitals Blueprint" },     "Alex R.",   "Medium", "Pending",     "Jun 9"),
  mkTask("wd-4", "Contact form fix — Harbor Auto",          "Harbor Auto",         "Harbor Auto — Web Retainer",         "Web Development", "Web Development", "Manual Task",        null,                                           "Mike T.",   "Low",    "Done",        "Jun 3"),
  mkTask("wd-5", "New service page — Metro Dental",         "Metro Dental",        "Metro Dental — Web Retainer",        "Web Development", "Web Development", "Workflow Automation",{ workflow: "SEO Content Production Workflow" },"Sarah K.",  "Medium", "In Progress", "Jun 8"),
  mkTask("wd-6", "WordPress migration — Blue Ridge",        "Blue Ridge Plumbing", "Blue Ridge Plumbing — Web Retainer", "Web Development", "Web Development", "Manual Task",        null,                                           "Alex R.",   "High",   "Blocked",     "Jun 6", "Waiting on hosting transfer"),
];

// ── Design ─────────────────────────────────────────────────────────────────────
export const designTasks: WorkspaceTask[] = [
  mkTask("de-1", "Logo refresh — Apex Roofing",              "Apex Roofing",       "Apex Roofing — Brand Refresh",   "Design", "Design", "Task Blueprint",     { blueprint: "Brand Identity Blueprint" }, "Lisa P.",   "Medium", "In Progress", "Jun 9"),
  mkTask("de-2", "Social templates — Pacific Dental",        "Pacific Dental",     "Pacific Dental — Design",        "Design", "Design", "Manual Task",        null,                                      "Jordan M.", "High",   "Pending",     "Jun 7"),
  mkTask("de-3", "Print ad — Harbor Auto Group",             "Harbor Auto",        "Harbor Auto — Design",           "Design", "Design", "Manual Task",        null,                                      "Lisa P.",   "Low",    "Done",        "Jun 2"),
  mkTask("de-4", "Banner ads — Google Ads",                  "Internal",           "Design — Internal Projects",     "Design", "Design", "Task Blueprint",     { blueprint: "PPC Launch Design Blueprint" },"Sarah K.", "Medium", "Pending",     "Jun 8"),
  mkTask("de-5", "Infographic — Summit Landscaping",         "Summit Landscaping", "Summit Landscaping — Design",    "Design", "Design", "Manual Task",        null,                                      "Lisa P.",   "Low",    "Pending",     "Jun 11"),
];

// ── SEO ───────────────────────────────────────────────────────────────────────
export const seoTasks: WorkspaceTask[] = [
  mkTask("se-1", "On-page audit — Apex Roofing",              "Apex Roofing",        "Apex Roofing — SEO Retainer",         "SEO", "SEO", "Task Blueprint",     { blueprint: "SEO Onboarding Blueprint" },          "Lisa P.",   "High",   "In Progress", "Jun 6"),
  mkTask("se-2", "Keyword research — Pacific Dental",         "Pacific Dental",      "Pacific Dental — SEO Retainer",       "SEO", "SEO", "Manual Task",        null,                                               "Jordan M.", "High",   "Pending",     "Jun 7"),
  mkTask("se-3", "Technical SEO fix — Metro Dental",          "Metro Dental",        "Metro Dental — SEO Retainer",         "SEO", "SEO", "Workflow Automation",{ workflow: "Monthly SEO Audit Workflow" },           "Alex R.",   "Medium", "Pending",     "Jun 8"),
  mkTask("se-4", "Backlink report — Harbor Auto",             "Harbor Auto",         "Harbor Auto — SEO Retainer",          "SEO", "SEO", "Workflow Automation",{ workflow: "Monthly Reporting Workflow" },           "Sarah K.",  "Low",    "Done",        "Jun 2"),
  mkTask("se-5", "Content gap analysis — Summit Landscaping", "Summit Landscaping",  "Summit Landscaping — SEO Retainer",   "SEO", "SEO", "Manual Task",        null,                                               "Lisa P.",   "Medium", "In Progress", "Jun 9"),
  mkTask("se-6", "Schema markup — Blue Ridge",                "Blue Ridge Plumbing", "Blue Ridge Plumbing — SEO Retainer",  "SEO", "SEO", "Manual Task",        null,                                               "Alex R.",   "Low",    "Pending",     "Jun 10"),
];

// ── GBP ───────────────────────────────────────────────────────────────────────
export const gbpTasks: WorkspaceTask[] = [
  mkTask("gb-1", "Update photos — Apex Roofing",             "Apex Roofing",       "Apex Roofing — GBP Management",       "GBP", "GBP", "Manual Task",        null,                                               "Sarah K.",  "High",   "Pending",     "Jun 6"),
  mkTask("gb-2", "Respond to reviews — Pacific Dental",      "Pacific Dental",     "Pacific Dental — GBP Management",     "GBP", "GBP", "Workflow Automation",{ workflow: "Review Response Workflow" },             "Jordan M.", "High",   "In Progress", "Jun 5"),
  mkTask("gb-3", "Post weekly update — Harbor Auto",         "Harbor Auto",        "Harbor Auto — GBP Management",        "GBP", "GBP", "Workflow Automation",{ workflow: "GBP Monthly Posting Workflow" },         "Lisa P.",   "Medium", "Pending",     "Jun 7"),
  mkTask("gb-4", "Q&A cleanup — Metro Dental",               "Metro Dental",       "Metro Dental — GBP Management",       "GBP", "GBP", "Manual Task",        null,                                               "Sarah K.",  "Low",    "Done",        "Jun 2"),
  mkTask("gb-5", "Category audit — Summit Landscaping",      "Summit Landscaping", "Summit Landscaping — GBP Management", "GBP", "GBP", "Task Blueprint",     { blueprint: "GBP Onboarding Blueprint" },           "Alex R.",   "Medium", "Pending",     "Jun 9"),
];

// ── Yelp ──────────────────────────────────────────────────────────────────────
export const yelpTasks: WorkspaceTask[] = [
  mkTask("ye-1", "Claim profile — Blue Ridge Plumbing",     "Blue Ridge Plumbing", "Blue Ridge Plumbing — Yelp",    "SEO", "Yelp", "Task Blueprint",     { blueprint: "Yelp Onboarding Blueprint" },    "Alex R.",   "High",   "Pending",     "Jun 6"),
  mkTask("ye-2", "Respond to reviews — Apex Roofing",       "Apex Roofing",        "Apex Roofing — Yelp",           "SEO", "Yelp", "Workflow Automation",{ workflow: "Review Response Workflow" },       "Jordan M.", "High",   "In Progress", "Jun 5"),
  mkTask("ye-3", "Update service list — Pacific Dental",    "Pacific Dental",      "Pacific Dental — Yelp",         "SEO", "Yelp", "Manual Task",        null,                                          "Sarah K.",  "Medium", "Pending",     "Jun 8"),
  mkTask("ye-4", "Photo update — Harbor Auto",              "Harbor Auto",         "Harbor Auto — Yelp",            "SEO", "Yelp", "Manual Task",        null,                                          "Lisa P.",   "Low",    "Done",        "Jun 3"),
];

// ── Paid Advertising — Meta Ads ───────────────────────────────────────────────
export const metaAdsTasks: WorkspaceTask[] = [
  mkTask("ma-1", "Launch summer campaign — Harbor Auto",    "Harbor Auto",         "Harbor Auto — Meta Ads",        "Meta Ads", "Meta Ads", "Task Blueprint",     { blueprint: "Meta Ads Campaign Launch Blueprint" }, "Mike T.",   "High",   "In Progress", "Jun 6"),
  mkTask("ma-2", "Ad creative refresh — Apex Roofing",     "Apex Roofing",        "Apex Roofing — Meta Ads",       "Meta Ads", "Meta Ads", "Manual Task",        null,                                                "Sarah K.",  "High",   "Pending",     "Jun 7"),
  mkTask("ma-3", "Audience update — Pacific Dental",       "Pacific Dental",      "Pacific Dental — Meta Ads",     "Meta Ads", "Meta Ads", "Manual Task",        null,                                                "Mike T.",   "Medium", "Pending",     "Jun 8"),
  mkTask("ma-4", "Budget reallocation — Metro Dental",     "Metro Dental",        "Metro Dental — Meta Ads",       "Meta Ads", "Meta Ads", "Manual Task",        null,                                                "Alex R.",   "Low",    "Done",        "Jun 2"),
  mkTask("ma-5", "Pixel check — Blue Ridge",               "Blue Ridge Plumbing", "Blue Ridge Plumbing — Meta Ads","Meta Ads", "Meta Ads", "Workflow Automation",{ workflow: "Meta Ads Onboarding Workflow" },         "Mike T.",   "Medium", "Pending",     "Jun 9"),
];

// ── Paid Advertising — Google Ads ─────────────────────────────────────────────
export const googleAdsTasks: WorkspaceTask[] = [
  mkTask("ga-1", "Negative keyword audit — Harbor Auto",   "Harbor Auto",         "Harbor Auto — Google Ads",        "PPC", "PPC", "Manual Task",        null,                                              "Alex R.",   "High",   "In Progress", "Jun 6"),
  mkTask("ga-2", "Bidding strategy review — Apex Roofing", "Apex Roofing",        "Apex Roofing — Google Ads",       "PPC", "PPC", "Task Blueprint",     { blueprint: "PPC Campaign Launch Blueprint" },    "Mike T.",   "High",   "Pending",     "Jun 7"),
  mkTask("ga-3", "Landing page QA — Pacific Dental",       "Pacific Dental",      "Pacific Dental — Google Ads",     "PPC", "PPC", "Manual Task",        null,                                              "Sarah K.",  "Medium", "Pending",     "Jun 8"),
  mkTask("ga-4", "Ad copy test — Summit Landscaping",      "Summit Landscaping",  "Summit Landscaping — Google Ads", "PPC", "PPC", "Manual Task",        null,                                              "Alex R.",   "Medium", "Done",        "Jun 3"),
  mkTask("ga-5", "Conversion tracking — Metro Dental",     "Metro Dental",        "Metro Dental — Google Ads",       "PPC", "PPC", "Workflow Automation",{ workflow: "PPC Onboarding Workflow" },            "Mike T.",   "Low",    "Pending",     "Jun 10"),
];

// ── Reporting ─────────────────────────────────────────────────────────────────
export const reportingTasks: WorkspaceTask[] = [
  mkTask("re-1", "Monthly report — Apex Roofing",           "Apex Roofing",       "Apex Roofing — Reporting",        "Reporting", "Reporting", "Workflow Automation",{ workflow: "Monthly Reporting Workflow" },     "Jordan M.", "High",   "In Progress", "Jun 7"),
  mkTask("re-2", "Quarterly summary — Pacific Dental",      "Pacific Dental",     "Pacific Dental — Reporting",      "Reporting", "Reporting", "Task Blueprint",     { blueprint: "Reporting Setup Blueprint" },    "Sarah K.",  "High",   "Pending",     "Jun 8"),
  mkTask("re-3", "KPI dashboard setup — Harbor Auto",       "Harbor Auto",        "Harbor Auto — Reporting",         "Reporting", "Reporting", "Task Blueprint",     { blueprint: "Reporting Setup Blueprint" },    "Alex R.",   "Medium", "Pending",     "Jun 9"),
  mkTask("re-4", "Monthly report — Metro Dental",           "Metro Dental",       "Metro Dental — Reporting",        "Reporting", "Reporting", "Workflow Automation",{ workflow: "Monthly Reporting Workflow" },     "Jordan M.", "Medium", "Done",        "Jun 3"),
  mkTask("re-5", "Annual review prep — Summit Landscaping", "Summit Landscaping", "Summit Landscaping — Reporting",  "Reporting", "Reporting", "Manual Task",        null,                                          "Sarah K.",  "Low",    "Pending",     "Jun 12"),
  mkTask("re-6", "Report template refresh",                 "Internal",           "Reporting — Internal Projects",   "Reporting", "Reporting", "Manual Task",        null,                                          "Alex R.",   "Low",    "Blocked",     "Jun 6", "Waiting on design assets"),
];

// ── Local Service Ads ─────────────────────────────────────────────────────────
export const localServiceAdsTasks: WorkspaceTask[] = [
  mkTask("ls-1", "LSA setup — Blue Ridge Plumbing",        "Blue Ridge Plumbing", "Blue Ridge Plumbing — LSA Launch", "LSA", "LSA", "Task Blueprint",     { blueprint: "LSA Onboarding Blueprint" },   "Mike T.",   "High",   "In Progress", "Jun 7"),
  mkTask("ls-2", "Review management — Apex Roofing",       "Apex Roofing",        "Apex Roofing — LSA Management",    "LSA", "LSA", "Workflow Automation",{ workflow: "Review Response Workflow" },     "Sarah K.",  "High",   "Pending",     "Jun 8"),
  mkTask("ls-3", "Budget review — Harbor Auto",            "Harbor Auto",         "Harbor Auto — LSA Management",     "LSA", "LSA", "Manual Task",        null,                                        "Mike T.",   "Medium", "Pending",     "Jun 9"),
  mkTask("ls-4", "Lead verification — Pacific Dental",     "Pacific Dental",      "Pacific Dental — LSA Management",  "LSA", "LSA", "Manual Task",        null,                                        "Alex R.",   "Medium", "Done",        "Jun 2"),
  mkTask("ls-5", "Account dispute — Summit Landscaping",   "Summit Landscaping",  "Summit Landscaping — LSA",         "LSA", "LSA", "Manual Task",        null,                                        "Sarah K.",  "High",   "Blocked",     "Jun 5", "Escalated to Google Support"),
];

// ── Cross-department pending Sales tasks queue ────────────────────────────────
// Module-level mutable queue. Other modules (e.g. Billing Invoices) push tasks
// here so they are visible on the Sales Tasks page when it next mounts.
// Intentionally mutable — this is the cross-workspace signal store.
export const pendingSalesTasks: WorkspaceTask[] = [];

export function addPendingSalesTask(task: WorkspaceTask): void {
  pendingSalesTasks.push(task);
}

// ── IT & Security ─────────────────────────────────────────────────────────────
export const itSecurityTasks: WorkspaceTask[] = [
  mkTask("it-1", "SSL renewal — Client sites",             "Multiple Clients",    "Infrastructure — Security",       "IT & Security", "IT & Security", "Workflow Automation",{ workflow: "Certificate Renewal Workflow" }, "Mike T.",   "High",   "Pending",     "Jun 6"),
  mkTask("it-2", "Malware scan — Apex Roofing site",       "Apex Roofing",        "Apex Roofing — IT Security",      "IT & Security", "IT & Security", "Task Blueprint",     { blueprint: "Security Audit Blueprint" },   "Jordan M.", "High",   "In Progress", "Jun 5"),
  mkTask("it-3", "Firewall rule audit",                    "Internal",            "Infrastructure — Security",       "IT & Security", "IT & Security", "Manual Task",        null,                                         "Mike T.",   "Medium", "Pending",     "Jun 8"),
  mkTask("it-4", "Backup verification — Client CMS",       "Multiple Clients",    "Infrastructure — Security",       "IT & Security", "IT & Security", "Workflow Automation",{ workflow: "Backup Verification Workflow" }, "Sarah K.",  "Medium", "Done",        "Jun 2"),
  mkTask("it-5", "2FA rollout — Team accounts",            "Internal",            "Infrastructure — Security",       "IT & Security", "IT & Security", "Task Blueprint",     { blueprint: "Access Review Blueprint" },    "Mike T.",   "High",   "Pending",     "Jun 9"),
  mkTask("it-6", "Password manager audit",                 "Internal",            "Infrastructure — Security",       "IT & Security", "IT & Security", "Manual Task",        null,                                         "Jordan M.", "Low",    "Pending",     "Jun 10"),
];
