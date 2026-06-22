// ── RTM OS Billing Action Layer — Mock Data ───────────────────────────────────
// 30 invoices · 15 recurring contracts · 10 activation items
// Collections, revenue, renewals examples

// ── Types ─────────────────────────────────────────────────────────────────────

export type InvoiceType =
  | "Setup Fee"
  | "Monthly Recurring"
  | "Quarterly"
  | "Annual"
  | "One-Time Project"
  | "Renewal"
  | "Upsell"
  | "Cancellation Fee";

export type InvoiceStatus =
  | "Draft"
  | "Pending Approval"
  | "Sent"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled"
  | "Refunded";

export type ActivationStatus =
  | "Not Ready"
  | "Pending Payment"
  | "Ready For Activation"
  | "Activated"
  | "On Hold";

export type CollectionStatus =
  | "Pending"
  | "Reminder Sent"
  | "Contacted"
  | "Payment Arrangement"
  | "Escalated"
  | "Resolved";

export type HoldReason =
  | "Payment Issues"
  | "Missing Contract"
  | "Missing Approval"
  | "Client Hold"
  | "Internal Hold";

export interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  contract: string;
  invoiceType: InvoiceType;
  amount: number;
  dueDate: string;
  status: InvoiceStatus;
  activationStatus: ActivationStatus;
  assignedTo: string;
  department: string;
  notes: string;
  createdDate: string;
  paidDate?: string;
  holdReason?: HoldReason;
}

export interface RecurringContract {
  id: string;
  client: string;
  contractName: string;
  contractTerm: string;
  contractStart: string;
  contractEnd: string;
  monthlyRevenue: number;
  annualValue: number;
  noticePeriod: string;
  autoRenew: boolean;
  status: "Active" | "Paused" | "At Risk" | "Pending Renewal" | "Cancelled";
  servicesIncluded: string;
  assignedAM: string;
}

export interface CollectionItem {
  id: string;
  client: string;
  invoiceNumber: string;
  outstandingAmount: number;
  daysOverdue: number;
  collectionStatus: CollectionStatus;
  assignedTo: string;
  notes: string;
  lastContactDate: string;
  nextFollowUp: string;
}

export interface ActivationQueueItem {
  id: string;
  client: string;
  contract: string;
  revenue: number;
  assignedAM: string;
  departments: string[];
  activationStatus: ActivationStatus;
  readyDate: string;
  contractStatus: "Signed" | "Pending" | "In Review";
  invoiceStatus: InvoiceStatus;
  paymentStatus: "Paid" | "Pending Payment" | "Partial" | "Overdue";
  notes: string;
}

export interface ActivityEvent {
  id: string;
  type:
    | "Invoice Created"
    | "Invoice Sent"
    | "Invoice Paid"
    | "Invoice Overdue"
    | "Collection Updated"
    | "Activation Approved"
    | "Project Activated";
  client: string;
  invoiceNumber?: string;
  amount?: number;
  description: string;
  timestamp: string;
  actor: string;
}

// ── 30 Invoices ───────────────────────────────────────────────────────────────

export const invoices: Invoice[] = [
  {
    id: "inv-001",
    invoiceNumber: "INV-0051",
    client: "Apex Roofing",
    contract: "CTR-0201",
    invoiceType: "Setup Fee",
    amount: 1200,
    dueDate: "2025-06-15",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Lisa P.",
    department: "SEO",
    notes: "Setup fee for SEO campaign launch.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-002",
    invoiceNumber: "INV-0052",
    client: "Pacific Dental",
    contract: "CTR-0185",
    invoiceType: "Monthly Recurring",
    amount: 3800,
    dueDate: "2025-06-10",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Sarah K.",
    department: "PPC",
    notes: "June recurring invoice.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-08",
  },
  {
    id: "inv-003",
    invoiceNumber: "INV-0053",
    client: "Sunbelt HVAC",
    contract: "CTR-0192",
    invoiceType: "Monthly Recurring",
    amount: 1200,
    dueDate: "2025-06-12",
    status: "Partially Paid",
    activationStatus: "Pending Payment",
    assignedTo: "Lisa P.",
    department: "Local SEO",
    notes: "Partial payment received — $600 remaining.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-004",
    invoiceNumber: "INV-0054",
    client: "Harbor Auto Group",
    contract: "CTR-0167",
    invoiceType: "Annual",
    amount: 60000,
    dueDate: "2025-06-07",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Sarah K.",
    department: "Multi-Channel",
    notes: "Annual retainer paid in full.",
    createdDate: "2025-05-28",
    paidDate: "2025-06-05",
  },
  {
    id: "inv-005",
    invoiceNumber: "INV-0055",
    client: "Metro Dental",
    contract: "CTR-0210",
    invoiceType: "Setup Fee",
    amount: 800,
    dueDate: "2025-06-16",
    status: "Draft",
    activationStatus: "Not Ready",
    assignedTo: "Lisa P.",
    department: "SEO",
    notes: "Draft — pending final contract review.",
    createdDate: "2025-06-03",
  },
  {
    id: "inv-006",
    invoiceNumber: "INV-0056",
    client: "Blue Ridge Plumbing",
    contract: "CTR-0178",
    invoiceType: "Monthly Recurring",
    amount: 800,
    dueDate: "2025-06-08",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Sarah K.",
    department: "Google Ads",
    notes: "Monthly invoice paid on time.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-07",
  },
  {
    id: "inv-007",
    invoiceNumber: "INV-0057",
    client: "Green Valley Pools",
    contract: "CTR-0189",
    invoiceType: "Monthly Recurring",
    amount: 2200,
    dueDate: "2025-05-20",
    status: "Overdue",
    activationStatus: "On Hold",
    assignedTo: "Lisa P.",
    department: "Social Media",
    notes: "27 days overdue — escalated to collections.",
    createdDate: "2025-05-10",
    holdReason: "Payment Issues",
  },
  {
    id: "inv-008",
    invoiceNumber: "INV-0058",
    client: "Skyline Landscaping",
    contract: "CTR-0197",
    invoiceType: "Monthly Recurring",
    amount: 1500,
    dueDate: "2025-06-18",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Sarah K.",
    department: "Content",
    notes: "Sent June 2. Awaiting payment.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-009",
    invoiceNumber: "INV-0059",
    client: "Cornerstone Flooring",
    contract: "CTR-0156",
    invoiceType: "Monthly Recurring",
    amount: 3200,
    dueDate: "2025-05-01",
    status: "Overdue",
    activationStatus: "On Hold",
    assignedTo: "Lisa P.",
    department: "SEO",
    notes: "47 days overdue — payment arrangement in progress.",
    createdDate: "2025-04-25",
    holdReason: "Payment Issues",
  },
  {
    id: "inv-010",
    invoiceNumber: "INV-0060",
    client: "Summit Pest Control",
    contract: "CTR-0204",
    invoiceType: "Monthly Recurring",
    amount: 1100,
    dueDate: "2025-06-25",
    status: "Partially Paid",
    activationStatus: "Pending Payment",
    assignedTo: "Sarah K.",
    department: "PPC",
    notes: "Partial payment $550 received.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-011",
    invoiceNumber: "INV-0061",
    client: "Ironclad Fitness",
    contract: "CTR-0215",
    invoiceType: "Setup Fee",
    amount: 1500,
    dueDate: "2025-06-22",
    status: "Pending Approval",
    activationStatus: "Not Ready",
    assignedTo: "Lisa P.",
    department: "Web Design",
    notes: "Awaiting internal approval before sending.",
    createdDate: "2025-06-04",
    holdReason: "Missing Approval",
  },
  {
    id: "inv-012",
    invoiceNumber: "INV-0062",
    client: "Crestview Dentistry",
    contract: "CTR-0208",
    invoiceType: "Monthly Recurring",
    amount: 1400,
    dueDate: "2025-06-20",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Sarah K.",
    department: "SEO",
    notes: "Viewed by client — awaiting payment.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-013",
    invoiceNumber: "INV-0063",
    client: "Lakewood Dental",
    contract: "CTR-0212",
    invoiceType: "Quarterly",
    amount: 5400,
    dueDate: "2025-07-01",
    status: "Draft",
    activationStatus: "Not Ready",
    assignedTo: "Lisa P.",
    department: "Multi-Channel",
    notes: "Q3 invoice draft.",
    createdDate: "2025-06-05",
  },
  {
    id: "inv-014",
    invoiceNumber: "INV-0064",
    client: "Rocky Mountain Plumbing",
    contract: "CTR-0199",
    invoiceType: "Monthly Recurring",
    amount: 950,
    dueDate: "2025-06-14",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Sarah K.",
    department: "Local SEO",
    notes: "Paid via ACH.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-12",
  },
  {
    id: "inv-015",
    invoiceNumber: "INV-0065",
    client: "Desert Sun Roofing",
    contract: "CTR-0216",
    invoiceType: "Setup Fee",
    amount: 2000,
    dueDate: "2025-06-28",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Lisa P.",
    department: "SEO",
    notes: "New client — awaiting first payment.",
    createdDate: "2025-06-05",
  },
  {
    id: "inv-016",
    invoiceNumber: "INV-0066",
    client: "City Chiropractic",
    contract: "CTR-0181",
    invoiceType: "Monthly Recurring",
    amount: 1800,
    dueDate: "2025-06-11",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Sarah K.",
    department: "PPC",
    notes: "On-time payment.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-10",
  },
  {
    id: "inv-017",
    invoiceNumber: "INV-0067",
    client: "Tri-State Electrical",
    contract: "CTR-0203",
    invoiceType: "Upsell",
    amount: 4500,
    dueDate: "2025-06-30",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Lisa P.",
    department: "Multi-Channel",
    notes: "Upsell: added web redesign to existing SEO contract.",
    createdDate: "2025-06-03",
  },
  {
    id: "inv-018",
    invoiceNumber: "INV-0068",
    client: "Lakeside Auto",
    contract: "CTR-0175",
    invoiceType: "Monthly Recurring",
    amount: 2600,
    dueDate: "2025-06-09",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Sarah K.",
    department: "Google Ads",
    notes: "Paid via wire transfer.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-08",
  },
  {
    id: "inv-019",
    invoiceNumber: "INV-0069",
    client: "Elevated Remodeling",
    contract: "CTR-0219",
    invoiceType: "One-Time Project",
    amount: 8500,
    dueDate: "2025-06-25",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Lisa P.",
    department: "Web Development",
    notes: "One-time website build project.",
    createdDate: "2025-06-02",
  },
  {
    id: "inv-020",
    invoiceNumber: "INV-0070",
    client: "Prestige Pest Control",
    contract: "CTR-0195",
    invoiceType: "Renewal",
    amount: 14400,
    dueDate: "2025-07-01",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Sarah K.",
    department: "SEO",
    notes: "Annual renewal invoice.",
    createdDate: "2025-06-04",
  },
  {
    id: "inv-021",
    invoiceNumber: "INV-0071",
    client: "Horizon Dental Group",
    contract: "CTR-0221",
    invoiceType: "Monthly Recurring",
    amount: 4200,
    dueDate: "2025-06-13",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Lisa P.",
    department: "Multi-Channel",
    notes: "Large account — premium tier.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-11",
  },
  {
    id: "inv-022",
    invoiceNumber: "INV-0072",
    client: "Grandview Landscaping",
    contract: "CTR-0188",
    invoiceType: "Monthly Recurring",
    amount: 1200,
    dueDate: "2025-05-28",
    status: "Overdue",
    activationStatus: "On Hold",
    assignedTo: "Sarah K.",
    department: "Social Media",
    notes: "10 days overdue — reminder sent.",
    createdDate: "2025-05-20",
    holdReason: "Payment Issues",
  },
  {
    id: "inv-023",
    invoiceNumber: "INV-0073",
    client: "Pacific Eye Center",
    contract: "CTR-0213",
    invoiceType: "Monthly Recurring",
    amount: 2400,
    dueDate: "2025-06-17",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Lisa P.",
    department: "PPC",
    notes: "June invoice sent.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-024",
    invoiceNumber: "INV-0074",
    client: "Sunrise Veterinary",
    contract: "CTR-0205",
    invoiceType: "Quarterly",
    amount: 6300,
    dueDate: "2025-06-30",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Sarah K.",
    department: "Multi-Channel",
    notes: "Q2 invoice.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-025",
    invoiceNumber: "INV-0075",
    client: "Capital City Plumbing",
    contract: "CTR-0198",
    invoiceType: "Monthly Recurring",
    amount: 900,
    dueDate: "2025-06-10",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Lisa P.",
    department: "Local SEO",
    notes: "Paid on time.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-09",
  },
  {
    id: "inv-026",
    invoiceNumber: "INV-0076",
    client: "Ironside HVAC",
    contract: "CTR-0222",
    invoiceType: "Setup Fee",
    amount: 1800,
    dueDate: "2025-07-05",
    status: "Draft",
    activationStatus: "Not Ready",
    assignedTo: "Sarah K.",
    department: "Google Ads",
    notes: "New client setup — contract signed June 3.",
    createdDate: "2025-06-05",
    holdReason: "Missing Contract",
  },
  {
    id: "inv-027",
    invoiceNumber: "INV-0077",
    client: "Metro Law Group",
    contract: "CTR-0211",
    invoiceType: "Monthly Recurring",
    amount: 3500,
    dueDate: "2025-06-14",
    status: "Paid",
    activationStatus: "Activated",
    assignedTo: "Lisa P.",
    department: "PPC",
    notes: "Paid via credit card.",
    createdDate: "2025-06-01",
    paidDate: "2025-06-13",
  },
  {
    id: "inv-028",
    invoiceNumber: "INV-0078",
    client: "Stone Creek Auto",
    contract: "CTR-0190",
    invoiceType: "Cancellation Fee",
    amount: 1500,
    dueDate: "2025-06-20",
    status: "Sent",
    activationStatus: "Not Ready",
    assignedTo: "Sarah K.",
    department: "Billing",
    notes: "Early cancellation fee per contract terms.",
    createdDate: "2025-06-02",
  },
  {
    id: "inv-029",
    invoiceNumber: "INV-0079",
    client: "Emerald City Dental",
    contract: "CTR-0218",
    invoiceType: "Monthly Recurring",
    amount: 2800,
    dueDate: "2025-06-16",
    status: "Sent",
    activationStatus: "Pending Payment",
    assignedTo: "Lisa P.",
    department: "SEO",
    notes: "New client — first recurring invoice.",
    createdDate: "2025-06-01",
  },
  {
    id: "inv-030",
    invoiceNumber: "INV-0080",
    client: "Coastal Fitness Studio",
    contract: "CTR-0223",
    invoiceType: "Upsell",
    amount: 3200,
    dueDate: "2025-07-01",
    status: "Pending Approval",
    activationStatus: "Not Ready",
    assignedTo: "Sarah K.",
    department: "Social Media",
    notes: "Upsell pending manager approval.",
    createdDate: "2025-06-05",
    holdReason: "Missing Approval",
  },
];

// ── 15 Recurring Contracts ────────────────────────────────────────────────────

export const recurringContracts: RecurringContract[] = [
  { id: "ctr-001", client: "Pacific Dental",        contractName: "SEO + PPC Retainer",       contractTerm: "12 months", contractStart: "2025-01-01", contractEnd: "2025-12-31", monthlyRevenue: 3800, annualValue: 45600,  noticePeriod: "30 days",  autoRenew: true,  status: "Active",          servicesIncluded: "SEO, PPC, Reporting",         assignedAM: "Marcus T." },
  { id: "ctr-002", client: "Harbor Auto Group",      contractName: "Full-Service Digital",      contractTerm: "24 months", contractStart: "2024-07-01", contractEnd: "2026-06-30", monthlyRevenue: 5000, annualValue: 60000,  noticePeriod: "60 days",  autoRenew: true,  status: "Active",          servicesIncluded: "SEO, PPC, Social, Web",       assignedAM: "Jess L." },
  { id: "ctr-003", client: "Blue Ridge Plumbing",    contractName: "Google Ads Management",     contractTerm: "6 months",  contractStart: "2025-03-01", contractEnd: "2025-08-31", monthlyRevenue: 800,  annualValue: 9600,   noticePeriod: "30 days",  autoRenew: false, status: "Pending Renewal",  servicesIncluded: "Google Ads",                  assignedAM: "Marcus T." },
  { id: "ctr-004", client: "Lakeside Auto",          contractName: "Google Ads + Social",       contractTerm: "12 months", contractStart: "2025-01-01", contractEnd: "2025-12-31", monthlyRevenue: 2600, annualValue: 31200,  noticePeriod: "30 days",  autoRenew: true,  status: "Active",          servicesIncluded: "Google Ads, Social Media",    assignedAM: "Jess L." },
  { id: "ctr-005", client: "Metro Law Group",        contractName: "PPC Retainer",              contractTerm: "12 months", contractStart: "2025-02-01", contractEnd: "2026-01-31", monthlyRevenue: 3500, annualValue: 42000,  noticePeriod: "30 days",  autoRenew: true,  status: "Active",          servicesIncluded: "PPC, Landing Pages",          assignedAM: "Marcus T." },
  { id: "ctr-006", client: "City Chiropractic",      contractName: "PPC + Local SEO",           contractTerm: "12 months", contractStart: "2025-01-01", contractEnd: "2025-12-31", monthlyRevenue: 1800, annualValue: 21600,  noticePeriod: "30 days",  autoRenew: true,  status: "Active",          servicesIncluded: "PPC, Local SEO, GMB",         assignedAM: "Jess L." },
  { id: "ctr-007", client: "Horizon Dental Group",   contractName: "Premium Multi-Channel",     contractTerm: "24 months", contractStart: "2024-06-01", contractEnd: "2026-05-31", monthlyRevenue: 4200, annualValue: 50400,  noticePeriod: "60 days",  autoRenew: true,  status: "Active",          servicesIncluded: "SEO, PPC, Social, Content",   assignedAM: "Marcus T." },
  { id: "ctr-008", client: "Green Valley Pools",     contractName: "Social Media Management",   contractTerm: "6 months",  contractStart: "2025-01-01", contractEnd: "2025-06-30", monthlyRevenue: 2200, annualValue: 26400,  noticePeriod: "30 days",  autoRenew: false, status: "At Risk",          servicesIncluded: "Social Media, Content",       assignedAM: "Jess L." },
  { id: "ctr-009", client: "Prestige Pest Control",  contractName: "SEO Annual Retainer",       contractTerm: "12 months", contractStart: "2024-07-01", contractEnd: "2025-06-30", monthlyRevenue: 1200, annualValue: 14400,  noticePeriod: "30 days",  autoRenew: true,  status: "Pending Renewal",  servicesIncluded: "SEO, Blog Content",           assignedAM: "Marcus T." },
  { id: "ctr-010", client: "Cornerstone Flooring",   contractName: "SEO + Content Bundle",      contractTerm: "12 months", contractStart: "2024-08-01", contractEnd: "2025-07-31", monthlyRevenue: 3200, annualValue: 38400,  noticePeriod: "30 days",  autoRenew: false, status: "At Risk",          servicesIncluded: "SEO, Content, Reporting",     assignedAM: "Jess L." },
  { id: "ctr-011", client: "Capital City Plumbing",  contractName: "Local SEO Package",         contractTerm: "6 months",  contractStart: "2025-04-01", contractEnd: "2025-09-30", monthlyRevenue: 900,  annualValue: 10800,  noticePeriod: "30 days",  autoRenew: false, status: "Active",          servicesIncluded: "Local SEO, GMB, Citations",   assignedAM: "Marcus T." },
  { id: "ctr-012", client: "Sunrise Veterinary",     contractName: "Multi-Channel Quarterly",   contractTerm: "12 months", contractStart: "2025-01-01", contractEnd: "2025-12-31", monthlyRevenue: 2100, annualValue: 25200,  noticePeriod: "30 days",  autoRenew: true,  status: "Active",          servicesIncluded: "PPC, Social, Local SEO",      assignedAM: "Jess L." },
  { id: "ctr-013", client: "Pacific Eye Center",     contractName: "PPC Growth Plan",           contractTerm: "12 months", contractStart: "2025-03-01", contractEnd: "2026-02-28", monthlyRevenue: 2400, annualValue: 28800,  noticePeriod: "30 days",  autoRenew: true,  status: "Active",          servicesIncluded: "PPC, Conversion Tracking",    assignedAM: "Marcus T." },
  { id: "ctr-014", client: "Skyline Landscaping",    contractName: "Content Strategy Retainer", contractTerm: "6 months",  contractStart: "2025-04-01", contractEnd: "2025-09-30", monthlyRevenue: 1500, annualValue: 18000,  noticePeriod: "30 days",  autoRenew: false, status: "Pending Renewal",  servicesIncluded: "Content, Social Media",       assignedAM: "Jess L." },
  { id: "ctr-015", client: "Rocky Mountain Plumbing", contractName: "Local SEO + Ads",          contractTerm: "12 months", contractStart: "2025-02-01", contractEnd: "2026-01-31", monthlyRevenue: 950,  annualValue: 11400,  noticePeriod: "30 days",  autoRenew: true,  status: "Active",          servicesIncluded: "Local SEO, Google Ads",       assignedAM: "Marcus T." },
];

// ── Collections ───────────────────────────────────────────────────────────────

export const collections: CollectionItem[] = [
  {
    id: "col-001",
    client: "Green Valley Pools",
    invoiceNumber: "INV-0057",
    outstandingAmount: 2200,
    daysOverdue: 27,
    collectionStatus: "Escalated",
    assignedTo: "Lisa P.",
    notes: "Client unreachable by phone. Sent certified letter.",
    lastContactDate: "2025-06-04",
    nextFollowUp: "2025-06-12",
  },
  {
    id: "col-002",
    client: "Cornerstone Flooring",
    invoiceNumber: "INV-0059",
    outstandingAmount: 3200,
    daysOverdue: 47,
    collectionStatus: "Payment Arrangement",
    assignedTo: "Sarah K.",
    notes: "Payment plan agreed: $1,600 on June 15, remainder July 1.",
    lastContactDate: "2025-06-06",
    nextFollowUp: "2025-06-15",
  },
  {
    id: "col-003",
    client: "Grandview Landscaping",
    invoiceNumber: "INV-0072",
    outstandingAmount: 1200,
    daysOverdue: 10,
    collectionStatus: "Reminder Sent",
    assignedTo: "Lisa P.",
    notes: "First reminder email sent June 5.",
    lastContactDate: "2025-06-05",
    nextFollowUp: "2025-06-10",
  },
  {
    id: "col-004",
    client: "Sunbelt HVAC",
    invoiceNumber: "INV-0053",
    outstandingAmount: 600,
    daysOverdue: 5,
    collectionStatus: "Contacted",
    assignedTo: "Sarah K.",
    notes: "Client confirmed balance will be paid by June 15.",
    lastContactDate: "2025-06-07",
    nextFollowUp: "2025-06-15",
  },
  {
    id: "col-005",
    client: "Summit Pest Control",
    invoiceNumber: "INV-0060",
    outstandingAmount: 550,
    daysOverdue: 0,
    collectionStatus: "Pending",
    assignedTo: "Lisa P.",
    notes: "Partial payment received. Balance not yet due.",
    lastContactDate: "2025-06-03",
    nextFollowUp: "2025-06-25",
  },
];

// ── 10 Activation Queue Items ─────────────────────────────────────────────────

export const activationQueue: ActivationQueueItem[] = [
  {
    id: "act-001",
    client: "Desert Sun Roofing",
    contract: "CTR-0216",
    revenue: 2000,
    assignedAM: "Marcus T.",
    departments: ["SEO", "Content"],
    activationStatus: "Ready For Activation",
    readyDate: "2025-06-10",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    notes: "Setup fee paid. Ready for onboarding kickoff.",
  },
  {
    id: "act-002",
    client: "Apex Roofing",
    contract: "CTR-0201",
    revenue: 2400,
    assignedAM: "Jess L.",
    departments: ["SEO", "Google Ads"],
    activationStatus: "Pending Payment",
    readyDate: "2025-06-15",
    contractStatus: "Signed",
    invoiceStatus: "Sent",
    paymentStatus: "Pending Payment",
    notes: "Awaiting setup fee payment. Invoice sent June 1.",
  },
  {
    id: "act-003",
    client: "Crestview Dentistry",
    contract: "CTR-0208",
    revenue: 1400,
    assignedAM: "Marcus T.",
    departments: ["SEO"],
    activationStatus: "Pending Payment",
    readyDate: "2025-06-22",
    contractStatus: "Signed",
    invoiceStatus: "Sent",
    paymentStatus: "Pending Payment",
    notes: "Client viewed invoice. Awaiting payment.",
  },
  {
    id: "act-004",
    client: "Tri-State Electrical",
    contract: "CTR-0203",
    revenue: 4500,
    assignedAM: "Jess L.",
    departments: ["Multi-Channel", "Web Design"],
    activationStatus: "Pending Payment",
    readyDate: "2025-07-01",
    contractStatus: "Signed",
    invoiceStatus: "Sent",
    paymentStatus: "Pending Payment",
    notes: "Upsell package pending payment.",
  },
  {
    id: "act-005",
    client: "Elevated Remodeling",
    contract: "CTR-0219",
    revenue: 8500,
    assignedAM: "Marcus T.",
    departments: ["Web Development"],
    activationStatus: "Pending Payment",
    readyDate: "2025-06-28",
    contractStatus: "Signed",
    invoiceStatus: "Sent",
    paymentStatus: "Pending Payment",
    notes: "Website build project. Awaiting 50% deposit.",
  },
  {
    id: "act-006",
    client: "Pacific Eye Center",
    contract: "CTR-0213",
    revenue: 2400,
    assignedAM: "Jess L.",
    departments: ["PPC"],
    activationStatus: "Ready For Activation",
    readyDate: "2025-06-08",
    contractStatus: "Signed",
    invoiceStatus: "Paid",
    paymentStatus: "Paid",
    notes: "Ready — waiting for AM assignment confirmation.",
  },
  {
    id: "act-007",
    client: "Ironclad Fitness",
    contract: "CTR-0215",
    revenue: 1500,
    assignedAM: "Marcus T.",
    departments: ["Web Design", "Social Media"],
    activationStatus: "Not Ready",
    readyDate: "2025-06-30",
    contractStatus: "In Review",
    invoiceStatus: "Pending Approval",
    paymentStatus: "Pending Payment",
    notes: "Invoice pending internal approval.",
  },
  {
    id: "act-008",
    client: "Emerald City Dental",
    contract: "CTR-0218",
    revenue: 2800,
    assignedAM: "Jess L.",
    departments: ["SEO", "Content"],
    activationStatus: "Pending Payment",
    readyDate: "2025-06-20",
    contractStatus: "Signed",
    invoiceStatus: "Sent",
    paymentStatus: "Pending Payment",
    notes: "New client — first month invoice sent.",
  },
  {
    id: "act-009",
    client: "Lakewood Dental",
    contract: "CTR-0212",
    revenue: 5400,
    assignedAM: "Marcus T.",
    departments: ["Multi-Channel", "PPC", "SEO"],
    activationStatus: "Not Ready",
    readyDate: "2025-07-05",
    contractStatus: "In Review",
    invoiceStatus: "Draft",
    paymentStatus: "Pending Payment",
    notes: "Contract still being reviewed by legal.",
  },
  {
    id: "act-010",
    client: "Ironside HVAC",
    contract: "CTR-0222",
    revenue: 1800,
    assignedAM: "Jess L.",
    departments: ["Google Ads"],
    activationStatus: "On Hold",
    readyDate: "2025-07-08",
    contractStatus: "Signed",
    invoiceStatus: "Draft",
    paymentStatus: "Pending Payment",
    notes: "On hold — missing business verification documents.",
  },
];

// ── Activity Timeline ─────────────────────────────────────────────────────────

export const activityTimeline: ActivityEvent[] = [
  { id: "evt-001", type: "Invoice Paid",       client: "Pacific Dental",        invoiceNumber: "INV-0052", amount: 3800,  description: "Invoice INV-0052 paid via ACH.",                          timestamp: "2025-06-08T14:22:00", actor: "Sarah K." },
  { id: "evt-002", type: "Activation Approved", client: "Pacific Dental",                                               description: "Client activation approved. Pushed to onboarding.",          timestamp: "2025-06-08T14:35:00", actor: "Lisa P." },
  { id: "evt-003", type: "Invoice Paid",       client: "Harbor Auto Group",     invoiceNumber: "INV-0054", amount: 60000, description: "Annual invoice INV-0054 paid via wire transfer.",           timestamp: "2025-06-05T10:10:00", actor: "Sarah K." },
  { id: "evt-004", type: "Project Activated",  client: "Harbor Auto Group",                                             description: "Project activated. AM assigned, task blueprints generated.",  timestamp: "2025-06-05T11:00:00", actor: "Marcus T." },
  { id: "evt-005", type: "Invoice Overdue",    client: "Green Valley Pools",    invoiceNumber: "INV-0057", amount: 2200,  description: "Invoice INV-0057 is 27 days overdue. Escalated.",           timestamp: "2025-06-06T09:00:00", actor: "System" },
  { id: "evt-006", type: "Collection Updated", client: "Cornerstone Flooring",  invoiceNumber: "INV-0059",              description: "Payment arrangement agreed: $1,600 + $1,600 split.",         timestamp: "2025-06-06T15:45:00", actor: "Sarah K." },
  { id: "evt-007", type: "Invoice Created",    client: "Desert Sun Roofing",    invoiceNumber: "INV-0065", amount: 2000,  description: "Setup fee invoice created for new client.",                 timestamp: "2025-06-05T09:30:00", actor: "Lisa P." },
  { id: "evt-008", type: "Invoice Sent",       client: "Desert Sun Roofing",    invoiceNumber: "INV-0065",              description: "Invoice INV-0065 sent via email.",                           timestamp: "2025-06-05T09:35:00", actor: "Lisa P." },
  { id: "evt-009", type: "Invoice Paid",       client: "City Chiropractic",     invoiceNumber: "INV-0066", amount: 1800,  description: "Monthly invoice paid on time.",                            timestamp: "2025-06-10T08:55:00", actor: "Sarah K." },
  { id: "evt-010", type: "Invoice Created",    client: "Coastal Fitness Studio", invoiceNumber: "INV-0080", amount: 3200, description: "Upsell invoice created — pending approval.",               timestamp: "2025-06-05T16:00:00", actor: "Lisa P." },
];

// ── Revenue Summary ───────────────────────────────────────────────────────────

export const revenueSummary = {
  mrr: 94800,
  arr: 1137600,
  newRevenue: 12600,
  expansionRevenue: 26100,
  revenueAtRisk: 18200,
  collectedThisMonth: 87400,
  outstandingBalance: 13500,
  projectedRevenue: 102400,
  revenueByDepartment: [
    { department: "SEO",           revenue: 28400 },
    { department: "PPC / Google Ads", revenue: 31200 },
    { department: "Social Media",  revenue: 14800 },
    { department: "Web Dev",       revenue: 9600 },
    { department: "Content",       revenue: 6400 },
    { department: "Multi-Channel", revenue: 4400 },
  ],
  revenueByService: [
    { service: "Monthly Recurring", revenue: 68400 },
    { service: "Setup Fees",        revenue: 8200 },
    { service: "Quarterly",         revenue: 11700 },
    { service: "Annual",            revenue: 60000 },
    { service: "One-Time",          revenue: 8500 },
    { service: "Upsell",            revenue: 7700 },
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 81200 },
    { month: "Feb", revenue: 83400 },
    { month: "Mar", revenue: 86100 },
    { month: "Apr", revenue: 88700 },
    { month: "May", revenue: 91300 },
    { month: "Jun", revenue: 94800 },
  ],
};

// ── AI Billing Summary (static mock) ─────────────────────────────────────────

export const aiBillingSummary = {
  revenueRisks: [
    "Green Valley Pools — $2,200 overdue 27 days. Unresponsive. Escalation recommended.",
    "Cornerstone Flooring — $3,200 overdue 47 days. Payment arrangement in place but high risk.",
    "Grandview Landscaping — $1,200 overdue 10 days. First reminder sent.",
  ],
  outstandingCollections: [
    "Total outstanding: $7,750 across 5 accounts.",
    "2 accounts at high risk — Green Valley Pools, Cornerstone Flooring.",
    "1 payment arrangement active — Cornerstone Flooring.",
  ],
  upcomingRenewals: [
    "Blue Ridge Plumbing — 6-month contract ends Aug 31. No auto-renew set.",
    "Prestige Pest Control — Annual renewal due Jul 1. $14,400 renewal invoice sent.",
    "Skyline Landscaping — 6-month contract ends Sep 30. Renewal discussion needed.",
  ],
  revenueOpportunities: [
    "Tri-State Electrical — Upsell $4,500 pending payment. High close probability.",
    "Coastal Fitness Studio — $3,200 upsell pending approval.",
    "Elevated Remodeling — $8,500 one-time project invoiced. Strong expansion opportunity.",
  ],
  activationBottlenecks: [
    "4 clients pending payment before activation can proceed.",
    "2 clients on hold — Ironclad Fitness (missing approval), Ironside HVAC (missing documents).",
    "Lakewood Dental — contract still in legal review.",
  ],
  recommendedActions: [
    "Escalate Green Valley Pools to senior collections team.",
    "Follow up on Apex Roofing setup fee — due June 15.",
    "Approve Ironclad Fitness invoice to unblock activation.",
    "Initiate Blue Ridge Plumbing renewal conversation this week.",
    "Confirm Pacific Eye Center activation with assigned AM.",
  ],
};
