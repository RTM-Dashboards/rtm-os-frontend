import type { WorkspaceTask } from "@/components/workspace";

// ── Generic factory ────────────────────────────────────────────────────────────
const mkTask = (
  id: string,
  title: string,
  client: string,
  assignee: string,
  priority: WorkspaceTask["priority"],
  status: WorkspaceTask["status"],
  due: string,
): WorkspaceTask => ({ id, title, client, assignee, priority, status, due });

// ── Account Management ─────────────────────────────────────────────────────────
export const accountManagementTasks: WorkspaceTask[] = [
  mkTask("am-1", "Monthly check-in call — Apex Roofing",      "Apex Roofing",         "Jordan M.", "high",   "in-progress", "Jun 5"),
  mkTask("am-2", "Send Q2 performance summary",                "Sunbelt HVAC",          "Sarah K.",  "high",   "open",        "Jun 6"),
  mkTask("am-3", "Renewal discussion — Pacific Dental",        "Pacific Dental",        "Jordan M.", "medium", "open",        "Jun 8"),
  mkTask("am-4", "Onboarding checklist — Blue Ridge Plumbing", "Blue Ridge Plumbing",   "Alex R.",   "high",   "in-progress", "Jun 5"),
  mkTask("am-5", "Client satisfaction survey — Harbor Auto",   "Harbor Auto",           "Sarah K.",  "low",    "open",        "Jun 10"),
  mkTask("am-6", "Update contact info — Metro Dental",         "Metro Dental",          "Jordan M.", "low",    "done",        "Jun 3"),
  mkTask("am-7", "At-risk review — Cascade Flooring",          "Cascade Flooring",      "Alex R.",   "high",   "blocked",     "Jun 4"),
];

// ── Sales ─────────────────────────────────────────────────────────────────────
export const salesTasks: WorkspaceTask[] = [
  mkTask("sa-1", "Send proposal — Summit Landscaping",   "Summit Landscaping", "Jordan M.", "high",   "in-progress", "Jun 5"),
  mkTask("sa-2", "Follow-up call — Harbor Auto Group",   "Harbor Auto Group",  "Mike T.",   "high",   "open",        "Jun 6"),
  mkTask("sa-3", "Update pipeline stage — Metro Dental", "Metro Dental",       "Jordan M.", "medium", "open",        "Jun 7"),
  mkTask("sa-4", "Discovery call — Cascade Flooring",    "Cascade Flooring",   "Sarah K.",  "medium", "in-progress", "Jun 5"),
  mkTask("sa-5", "Contract sent — Sunstate Solar",       "Sunstate Solar",     "Sarah K.",  "high",   "done",        "Jun 1"),
  mkTask("sa-6", "CRM data cleanup",                     "—",                  "Alex R.",   "low",    "open",        "Jun 9"),
  mkTask("sa-7", "Win/loss analysis — Q1",               "—",                  "Mike T.",   "low",    "done",        "Jun 2"),
];

// ── Billing ───────────────────────────────────────────────────────────────────
export const billingTasks: WorkspaceTask[] = [
  mkTask("bi-1", "Invoice overdue — Green Valley Pools",     "Green Valley Pools",  "Lisa P.",   "high",   "open",        "Jun 5"),
  mkTask("bi-2", "Service renewal — Apex Roofing",           "Apex Roofing",        "Jordan M.", "high",   "in-progress", "Jun 6"),
  mkTask("bi-3", "Cancellation processing — Harbor Auto",    "Harbor Auto",         "Sarah K.",  "high",   "open",        "Jun 5"),
  mkTask("bi-4", "Billing audit — June cycle",               "—",                   "Lisa P.",   "medium", "open",        "Jun 8"),
  mkTask("bi-5", "Offboarding — Sunbelt HVAC",               "Sunbelt HVAC",        "Sarah K.",  "high",   "blocked",     "Jun 4"),
  mkTask("bi-6", "New service activation — Blue Ridge",      "Blue Ridge Plumbing", "Alex R.",   "medium", "done",        "Jun 3"),
  mkTask("bi-7", "Q2 revenue reconciliation",                "—",                   "Lisa P.",   "low",    "open",        "Jun 10"),
];

// ── Content ───────────────────────────────────────────────────────────────────
export const contentTasks: WorkspaceTask[] = [
  mkTask("co-1", "Write blog post — Summit Landscaping",    "Summit Landscaping",  "Alex R.",   "high",   "in-progress", "Jun 6"),
  mkTask("co-2", "Social calendar — Apex Roofing (June)",   "Apex Roofing",        "Sarah K.",  "high",   "open",        "Jun 7"),
  mkTask("co-3", "Email newsletter — Pacific Dental",       "Pacific Dental",      "Jordan M.", "medium", "open",        "Jun 8"),
  mkTask("co-4", "Product description copy — Harbor Auto",  "Harbor Auto",         "Alex R.",   "low",    "done",        "Jun 2"),
  mkTask("co-5", "Landing page copy — Metro Dental",        "Metro Dental",        "Sarah K.",  "medium", "in-progress", "Jun 7"),
  mkTask("co-6", "Photo shoot brief — Blue Ridge",          "Blue Ridge Plumbing", "Alex R.",   "low",    "open",        "Jun 10"),
  mkTask("co-7", "Content audit — Green Valley Pools",      "Green Valley Pools",  "Jordan M.", "high",   "blocked",     "Jun 5"),
];

// ── Web Development ────────────────────────────────────────────────────────────
export const webDevTasks: WorkspaceTask[] = [
  mkTask("wd-1", "Homepage redesign — Summit Landscaping",  "Summit Landscaping", "Mike T.",   "high",   "in-progress", "Jun 10"),
  mkTask("wd-2", "CRO fixes — Apex Roofing",                "Apex Roofing",       "Jordan M.", "high",   "open",        "Jun 8"),
  mkTask("wd-3", "Site speed audit — Pacific Dental",       "Pacific Dental",     "Alex R.",   "medium", "open",        "Jun 9"),
  mkTask("wd-4", "Contact form fix — Harbor Auto",          "Harbor Auto",        "Mike T.",   "low",    "done",        "Jun 3"),
  mkTask("wd-5", "New service page — Metro Dental",         "Metro Dental",       "Sarah K.",  "medium", "in-progress", "Jun 8"),
  mkTask("wd-6", "WordPress migration — Blue Ridge",        "Blue Ridge Plumbing","Alex R.",   "high",   "blocked",     "Jun 6"),
];

// ── Design ─────────────────────────────────────────────────────────────────────
export const designTasks: WorkspaceTask[] = [
  mkTask("de-1", "Logo refresh — Apex Roofing",              "Apex Roofing",       "Lisa P.",   "medium", "in-progress", "Jun 9"),
  mkTask("de-2", "Social templates — Pacific Dental",        "Pacific Dental",     "Jordan M.", "high",   "open",        "Jun 7"),
  mkTask("de-3", "Print ad — Harbor Auto Group",             "Harbor Auto",        "Lisa P.",   "low",    "done",        "Jun 2"),
  mkTask("de-4", "Banner ads — Google Ads",                  "—",                  "Sarah K.",  "medium", "open",        "Jun 8"),
  mkTask("de-5", "Infographic — Summit Landscaping",         "Summit Landscaping", "Lisa P.",   "low",    "open",        "Jun 11"),
];

// ── SEO ───────────────────────────────────────────────────────────────────────
export const seoTasks: WorkspaceTask[] = [
  mkTask("se-1", "On-page audit — Apex Roofing",             "Apex Roofing",        "Lisa P.",   "high",   "in-progress", "Jun 6"),
  mkTask("se-2", "Keyword research — Pacific Dental",        "Pacific Dental",      "Jordan M.", "high",   "open",        "Jun 7"),
  mkTask("se-3", "Technical SEO fix — Metro Dental",         "Metro Dental",        "Alex R.",   "medium", "open",        "Jun 8"),
  mkTask("se-4", "Backlink report — Harbor Auto",            "Harbor Auto",         "Sarah K.",  "low",    "done",        "Jun 2"),
  mkTask("se-5", "Content gap analysis — Summit Landscaping","Summit Landscaping",  "Lisa P.",   "medium", "in-progress", "Jun 9"),
  mkTask("se-6", "Schema markup — Blue Ridge",               "Blue Ridge Plumbing", "Alex R.",   "low",    "open",        "Jun 10"),
];

// ── GBP ───────────────────────────────────────────────────────────────────────
export const gbpTasks: WorkspaceTask[] = [
  mkTask("gb-1", "Update photos — Apex Roofing",             "Apex Roofing",       "Sarah K.",  "high",   "open",        "Jun 6"),
  mkTask("gb-2", "Respond to reviews — Pacific Dental",      "Pacific Dental",     "Jordan M.", "high",   "in-progress", "Jun 5"),
  mkTask("gb-3", "Post weekly update — Harbor Auto",         "Harbor Auto",        "Lisa P.",   "medium", "open",        "Jun 7"),
  mkTask("gb-4", "Q&A cleanup — Metro Dental",               "Metro Dental",       "Sarah K.",  "low",    "done",        "Jun 2"),
  mkTask("gb-5", "Category audit — Summit Landscaping",      "Summit Landscaping", "Alex R.",   "medium", "open",        "Jun 9"),
];

// ── Yelp ──────────────────────────────────────────────────────────────────────
export const yelpTasks: WorkspaceTask[] = [
  mkTask("ye-1", "Claim profile — Blue Ridge Plumbing",     "Blue Ridge Plumbing", "Alex R.",   "high",   "open",        "Jun 6"),
  mkTask("ye-2", "Respond to reviews — Apex Roofing",       "Apex Roofing",        "Jordan M.", "high",   "in-progress", "Jun 5"),
  mkTask("ye-3", "Update service list — Pacific Dental",    "Pacific Dental",      "Sarah K.",  "medium", "open",        "Jun 8"),
  mkTask("ye-4", "Photo update — Harbor Auto",              "Harbor Auto",         "Lisa P.",   "low",    "done",        "Jun 3"),
];

// ── Paid Advertising — Meta Ads ───────────────────────────────────────────────
export const metaAdsTasks: WorkspaceTask[] = [
  mkTask("ma-1", "Launch summer campaign — Harbor Auto",    "Harbor Auto",         "Mike T.",   "high",   "in-progress", "Jun 6"),
  mkTask("ma-2", "Ad creative refresh — Apex Roofing",     "Apex Roofing",        "Sarah K.",  "high",   "open",        "Jun 7"),
  mkTask("ma-3", "Audience update — Pacific Dental",       "Pacific Dental",      "Mike T.",   "medium", "open",        "Jun 8"),
  mkTask("ma-4", "Budget reallocation — Metro Dental",     "Metro Dental",        "Alex R.",   "low",    "done",        "Jun 2"),
  mkTask("ma-5", "Pixel check — Blue Ridge",               "Blue Ridge Plumbing", "Mike T.",   "medium", "open",        "Jun 9"),
];

// ── Paid Advertising — Google Ads ─────────────────────────────────────────────
export const googleAdsTasks: WorkspaceTask[] = [
  mkTask("ga-1", "Negative keyword audit — Harbor Auto",   "Harbor Auto",         "Alex R.",   "high",   "in-progress", "Jun 6"),
  mkTask("ga-2", "Bidding strategy review — Apex Roofing", "Apex Roofing",        "Mike T.",   "high",   "open",        "Jun 7"),
  mkTask("ga-3", "Landing page QA — Pacific Dental",      "Pacific Dental",      "Sarah K.",  "medium", "open",        "Jun 8"),
  mkTask("ga-4", "Ad copy test — Summit Landscaping",     "Summit Landscaping",  "Alex R.",   "medium", "done",        "Jun 3"),
  mkTask("ga-5", "Conversion tracking — Metro Dental",    "Metro Dental",        "Mike T.",   "low",    "open",        "Jun 10"),
];

// ── Reporting ─────────────────────────────────────────────────────────────────
export const reportingTasks: WorkspaceTask[] = [
  mkTask("re-1", "Monthly report — Apex Roofing",          "Apex Roofing",        "Jordan M.", "high",   "in-progress", "Jun 7"),
  mkTask("re-2", "Quarterly summary — Pacific Dental",     "Pacific Dental",      "Sarah K.",  "high",   "open",        "Jun 8"),
  mkTask("re-3", "KPI dashboard setup — Harbor Auto",      "Harbor Auto",         "Alex R.",   "medium", "open",        "Jun 9"),
  mkTask("re-4", "Monthly report — Metro Dental",          "Metro Dental",        "Jordan M.", "medium", "done",        "Jun 3"),
  mkTask("re-5", "Annual review prep — Summit Landscaping","Summit Landscaping",  "Sarah K.",  "low",    "open",        "Jun 12"),
  mkTask("re-6", "Report template refresh",                "—",                   "Alex R.",   "low",    "blocked",     "Jun 6"),
];

// ── Local Service Ads ─────────────────────────────────────────────────────────
export const localServiceAdsTasks: WorkspaceTask[] = [
  mkTask("ls-1", "LSA setup — Blue Ridge Plumbing",        "Blue Ridge Plumbing", "Mike T.",   "high",   "in-progress", "Jun 7"),
  mkTask("ls-2", "Review management — Apex Roofing",       "Apex Roofing",        "Sarah K.",  "high",   "open",        "Jun 8"),
  mkTask("ls-3", "Budget review — Harbor Auto",            "Harbor Auto",         "Mike T.",   "medium", "open",        "Jun 9"),
  mkTask("ls-4", "Lead verification — Pacific Dental",     "Pacific Dental",      "Alex R.",   "medium", "done",        "Jun 2"),
  mkTask("ls-5", "Account dispute — Summit Landscaping",   "Summit Landscaping",  "Sarah K.",  "high",   "blocked",     "Jun 5"),
];

// ── IT & Security ─────────────────────────────────────────────────────────────
export const itSecurityTasks: WorkspaceTask[] = [
  mkTask("it-1", "SSL renewal — Client sites",             "Multiple",            "Mike T.",   "high",   "open",        "Jun 6"),
  mkTask("it-2", "Malware scan — Apex Roofing site",       "Apex Roofing",        "Jordan M.", "high",   "in-progress", "Jun 5"),
  mkTask("it-3", "Firewall rule audit",                    "—",                   "Mike T.",   "medium", "open",        "Jun 8"),
  mkTask("it-4", "Backup verification — Client CMS",       "Multiple",            "Sarah K.",  "medium", "done",        "Jun 2"),
  mkTask("it-5", "2FA rollout — Team accounts",            "—",                   "Mike T.",   "high",   "open",        "Jun 9"),
  mkTask("it-6", "Password manager audit",                 "—",                   "Jordan M.", "low",    "open",        "Jun 10"),
];
