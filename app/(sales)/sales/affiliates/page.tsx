"use client";

import React, { useState } from "react";
import { KpiCard, SectionWrapper, StatusBadge, DataTable, ProgressBar } from "@/components/ui";
import type { Column } from "@/components/ui";

//  Types 

type AffiliateType =
  | "Client Referral"| "Strategic Partner"| "Agency Partner"| "Influencer"| "Employee"| "Vendor";

type AffiliateStatus = "Active"| "Pending"| "Suspended"| "Archived";

type PortalStatus = "Invited"| "Active"| "Disabled"| "Pending Setup";

type CommissionModel = "Flat Fee"| "Percentage"| "Tiered"| "Custom";

type CommissionStatus = "Pending"| "Approved"| "Paid"| "Rejected"| "On Hold";

type ReferralPipelineStage =
  | "Lead"| "Qualified"| "Audit"| "Proposal"| "Negotiation"| "Won"| "Lost";

type NoteCategory =
  | "General"| "Referral"| "Commission"| "Portal"| "Relationship";

interface Affiliate extends Record<string, unknown> {
  id: string;
  name: string;
  company: string;
  type: AffiliateType;
  status: AffiliateStatus;
  contactName: string;
  email: string;
  phone: string;
  joinDate: string;
  portalStatus: PortalStatus;
  referralCode: string;
  referralLink: string;
  assignedManager: string;
  referralLeads: number;
  qualifiedLeads: number;
  wonDeals: number;
  revenueGenerated: string;
  commissionOwed: string;
  commissionPaid: string;
  lastReferral: string;
  commissionModel: CommissionModel;
}

interface Referral extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  referral: string;
  submissionDate: string;
  status: ReferralPipelineStage;
  assignedRep: string;
  pipelineStage: ReferralPipelineStage;
  dealValue: string;
  commission: string;
}

interface Commission extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  referral: string;
  dealValue: string;
  commissionType: CommissionModel;
  commissionAmount: string;
  status: CommissionStatus;
  paymentDate: string;
}

interface AffiliateNote extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  category: NoteCategory;
  content: string;
  author: string;
  date: string;
  pinned: boolean;
}

interface PortalUser extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  portalUser: string;
  email: string;
  lastLogin: string;
  status: "Active"| "Disabled"| "Invited"| "Pending";
  role: string;
}

interface ReferralLink extends Record<string, unknown> {
  id: string;
  affiliateId: string;
  referralCode: string;
  referralUrl: string;
  createdDate: string;
  clicks: number;
  leads: number;
  qualified: number;
  won: number;
  revenue: string;
  active: boolean;
}

//  Mock Data 

const AFFILIATES: Affiliate[] = [
  {
    id: "aff-001", name: "Marcus Williams", company: "Williams Landscaping", type: "Client Referral",
    status: "Active", contactName: "Marcus Williams", email: "marcus@williamslandscaping.com",
    phone: "(555) 201-3344", joinDate: "Jan 12, 2024", portalStatus: "Active",
    referralCode: "MARC-RTM", referralLink: "https://rtmos.io/ref/MARC-RTM",
    assignedManager: "Jordan M.", referralLeads: 8, qualifiedLeads: 5, wonDeals: 3,
    revenueGenerated: "$14,400/mo", commissionOwed: "$1,200", commissionPaid: "$3,600",
    lastReferral: "May 28, 2025", commissionModel: "Percentage",
  },
  {
    id: "aff-002", name: "Sarah Chen", company: "Chen Digital Agency", type: "Agency Partner",
    status: "Active", contactName: "Sarah Chen", email: "sarah@chendigital.com",
    phone: "(555) 302-8821", joinDate: "Mar 5, 2024", portalStatus: "Active",
    referralCode: "CHEN-RTM", referralLink: "https://rtmos.io/ref/CHEN-RTM",
    assignedManager: "Sarah K.", referralLeads: 14, qualifiedLeads: 9, wonDeals: 6,
    revenueGenerated: "$31,200/mo", commissionOwed: "$2,600", commissionPaid: "$9,800",
    lastReferral: "Jun 1, 2025", commissionModel: "Tiered",
  },
  {
    id: "aff-003", name: "David Torres", company: "Torres Consulting Group", type: "Strategic Partner",
    status: "Active", contactName: "David Torres", email: "d.torres@torresco.com",
    phone: "(555) 411-7765", joinDate: "Feb 18, 2024", portalStatus: "Active",
    referralCode: "TORR-RTM", referralLink: "https://rtmos.io/ref/TORR-RTM",
    assignedManager: "Mike T.", referralLeads: 11, qualifiedLeads: 7, wonDeals: 4,
    revenueGenerated: "$22,000/mo", commissionOwed: "$1,800", commissionPaid: "$5,200",
    lastReferral: "May 31, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-004", name: "Emily Rodriguez", company: "ER Marketing Co.", type: "Influencer",
    status: "Active", contactName: "Emily Rodriguez", email: "emily@ermarketing.co",
    phone: "(555) 522-9980", joinDate: "Apr 2, 2024", portalStatus: "Active",
    referralCode: "ERMT-RTM", referralLink: "https://rtmos.io/ref/ERMT-RTM",
    assignedManager: "Jordan M.", referralLeads: 19, qualifiedLeads: 6, wonDeals: 2,
    revenueGenerated: "$9,600/mo", commissionOwed: "$800", commissionPaid: "$1,600",
    lastReferral: "Jun 2, 2025", commissionModel: "Percentage",
  },
  {
    id: "aff-005", name: "James Patel", company: "Internal", type: "Employee",
    status: "Active", contactName: "James Patel", email: "james@rtmos.com",
    phone: "(555) 633-4412", joinDate: "Jun 1, 2023", portalStatus: "Disabled",
    referralCode: "JAME-RTM", referralLink: "https://rtmos.io/ref/JAME-RTM",
    assignedManager: "Admin", referralLeads: 6, qualifiedLeads: 4, wonDeals: 3,
    revenueGenerated: "$11,200/mo", commissionOwed: "$750", commissionPaid: "$2,250",
    lastReferral: "May 20, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-006", name: "Linda Zhao", company: "Zhao Web Solutions", type: "Vendor",
    status: "Pending", contactName: "Linda Zhao", email: "linda@zhaowebsol.com",
    phone: "(555) 744-1192", joinDate: "May 15, 2025", portalStatus: "Pending Setup",
    referralCode: "ZHAO-RTM", referralLink: "https://rtmos.io/ref/ZHAO-RTM",
    assignedManager: "Sarah K.", referralLeads: 1, qualifiedLeads: 0, wonDeals: 0,
    revenueGenerated: "$0", commissionOwed: "$0", commissionPaid: "$0",
    lastReferral: "—", commissionModel: "Percentage",
  },
  {
    id: "aff-007", name: "Robert Kim", company: "Kim Law Partners", type: "Strategic Partner",
    status: "Active", contactName: "Robert Kim", email: "rkim@kimlawpartners.com",
    phone: "(555) 855-3376", joinDate: "Sep 10, 2023", portalStatus: "Active",
    referralCode: "KIMR-RTM", referralLink: "https://rtmos.io/ref/KIMR-RTM",
    assignedManager: "Jordan M.", referralLeads: 9, qualifiedLeads: 7, wonDeals: 5,
    revenueGenerated: "$26,500/mo", commissionOwed: "$2,200", commissionPaid: "$7,500",
    lastReferral: "May 25, 2025", commissionModel: "Tiered",
  },
  {
    id: "aff-008", name: "Tanya Brooks", company: "Brooks Real Estate", type: "Client Referral",
    status: "Active", contactName: "Tanya Brooks", email: "tanya@brooksrealty.com",
    phone: "(555) 966-8843", joinDate: "Nov 20, 2023", portalStatus: "Active",
    referralCode: "TBRK-RTM", referralLink: "https://rtmos.io/ref/TBRK-RTM",
    assignedManager: "Mike T.", referralLeads: 4, qualifiedLeads: 3, wonDeals: 2,
    revenueGenerated: "$7,800/mo", commissionOwed: "$650", commissionPaid: "$1,300",
    lastReferral: "May 18, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-009", name: "Carlos Mendez", company: "Mendez & Assoc.", type: "Agency Partner",
    status: "Active", contactName: "Carlos Mendez", email: "carlos@mendezassoc.com",
    phone: "(555) 177-2234", joinDate: "Jul 8, 2023", portalStatus: "Active",
    referralCode: "CMND-RTM", referralLink: "https://rtmos.io/ref/CMND-RTM",
    assignedManager: "Sarah K.", referralLeads: 17, qualifiedLeads: 11, wonDeals: 8,
    revenueGenerated: "$44,000/mo", commissionOwed: "$3,600", commissionPaid: "$12,400",
    lastReferral: "Jun 1, 2025", commissionModel: "Tiered",
  },
  {
    id: "aff-010", name: "Patricia Nguyen", company: "NguyenBiz Consulting", type: "Strategic Partner",
    status: "Active", contactName: "Patricia Nguyen", email: "patricia@nguyenbiz.com",
    phone: "(555) 288-5519", joinDate: "Oct 3, 2023", portalStatus: "Invited",
    referralCode: "PNGU-RTM", referralLink: "https://rtmos.io/ref/PNGU-RTM",
    assignedManager: "Jordan M.", referralLeads: 5, qualifiedLeads: 3, wonDeals: 1,
    revenueGenerated: "$3,200/mo", commissionOwed: "$400", commissionPaid: "$400",
    lastReferral: "Apr 30, 2025", commissionModel: "Percentage",
  },
  {
    id: "aff-011", name: "Alex Thornton", company: "Thornton Media Group", type: "Influencer",
    status: "Active", contactName: "Alex Thornton", email: "alex@thorntonmedia.io",
    phone: "(555) 399-6647", joinDate: "Jan 28, 2025", portalStatus: "Active",
    referralCode: "ATHO-RTM", referralLink: "https://rtmos.io/ref/ATHO-RTM",
    assignedManager: "Mike T.", referralLeads: 22, qualifiedLeads: 8, wonDeals: 3,
    revenueGenerated: "$14,700/mo", commissionOwed: "$1,100", commissionPaid: "$2,200",
    lastReferral: "Jun 2, 2025", commissionModel: "Custom",
  },
  {
    id: "aff-012", name: "Diana Foster", company: "Foster Financial", type: "Client Referral",
    status: "Active", contactName: "Diana Foster", email: "diana@fosterfinancial.com",
    phone: "(555) 410-7723", joinDate: "Aug 14, 2023", portalStatus: "Active",
    referralCode: "DFOS-RTM", referralLink: "https://rtmos.io/ref/DFOS-RTM",
    assignedManager: "Sarah K.", referralLeads: 7, qualifiedLeads: 5, wonDeals: 4,
    revenueGenerated: "$18,400/mo", commissionOwed: "$1,400", commissionPaid: "$5,600",
    lastReferral: "May 29, 2025", commissionModel: "Percentage",
  },
  {
    id: "aff-013", name: "Trevor Nash", company: "Nash Tech Ventures", type: "Vendor",
    status: "Suspended", contactName: "Trevor Nash", email: "trevor@nashtechv.com",
    phone: "(555) 521-4418", joinDate: "Dec 5, 2023", portalStatus: "Disabled",
    referralCode: "TNSH-RTM", referralLink: "https://rtmos.io/ref/TNSH-RTM",
    assignedManager: "Jordan M.", referralLeads: 3, qualifiedLeads: 1, wonDeals: 0,
    revenueGenerated: "$0", commissionOwed: "$0", commissionPaid: "$500",
    lastReferral: "Feb 10, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-014", name: "Monica Patel", company: "Patel Healthcare Network", type: "Strategic Partner",
    status: "Active", contactName: "Monica Patel", email: "monica@patelhealthnet.com",
    phone: "(555) 632-8890", joinDate: "May 22, 2024", portalStatus: "Active",
    referralCode: "MPAT-RTM", referralLink: "https://rtmos.io/ref/MPAT-RTM",
    assignedManager: "Mike T.", referralLeads: 12, qualifiedLeads: 9, wonDeals: 6,
    revenueGenerated: "$33,600/mo", commissionOwed: "$2,800", commissionPaid: "$8,400",
    lastReferral: "Jun 1, 2025", commissionModel: "Tiered",
  },
  {
    id: "aff-015", name: "Greg Simmons", company: "Simmons Construction", type: "Client Referral",
    status: "Active", contactName: "Greg Simmons", email: "greg@simmonsconstruct.com",
    phone: "(555) 743-2256", joinDate: "Feb 2, 2024", portalStatus: "Active",
    referralCode: "GSIM-RTM", referralLink: "https://rtmos.io/ref/GSIM-RTM",
    assignedManager: "Sarah K.", referralLeads: 5, qualifiedLeads: 4, wonDeals: 3,
    revenueGenerated: "$13,500/mo", commissionOwed: "$1,050", commissionPaid: "$3,150",
    lastReferral: "May 24, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-016", name: "Natalie Cruz", company: "Cruz Agency Network", type: "Agency Partner",
    status: "Active", contactName: "Natalie Cruz", email: "natalie@cruzagency.net",
    phone: "(555) 854-9981", joinDate: "Apr 17, 2024", portalStatus: "Active",
    referralCode: "NCRZ-RTM", referralLink: "https://rtmos.io/ref/NCRZ-RTM",
    assignedManager: "Jordan M.", referralLeads: 16, qualifiedLeads: 10, wonDeals: 7,
    revenueGenerated: "$38,500/mo", commissionOwed: "$3,100", commissionPaid: "$9,300",
    lastReferral: "Jun 2, 2025", commissionModel: "Tiered",
  },
  {
    id: "aff-017", name: "Brandon Hughes", company: "Hughes Dental Network", type: "Strategic Partner",
    status: "Pending", contactName: "Brandon Hughes", email: "brandon@hughesdental.com",
    phone: "(555) 965-3347", joinDate: "May 29, 2025", portalStatus: "Pending Setup",
    referralCode: "BHUG-RTM", referralLink: "https://rtmos.io/ref/BHUG-RTM",
    assignedManager: "Mike T.", referralLeads: 0, qualifiedLeads: 0, wonDeals: 0,
    revenueGenerated: "$0", commissionOwed: "$0", commissionPaid: "$0",
    lastReferral: "—", commissionModel: "Percentage",
  },
  {
    id: "aff-018", name: "Cindy Wallace", company: "Wallace Staffing Group", type: "Client Referral",
    status: "Active", contactName: "Cindy Wallace", email: "cindy@wallacestaffing.com",
    phone: "(555) 176-6612", joinDate: "Jul 19, 2023", portalStatus: "Active",
    referralCode: "CWAL-RTM", referralLink: "https://rtmos.io/ref/CWAL-RTM",
    assignedManager: "Sarah K.", referralLeads: 6, qualifiedLeads: 4, wonDeals: 3,
    revenueGenerated: "$12,600/mo", commissionOwed: "$900", commissionPaid: "$3,600",
    lastReferral: "May 22, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-019", name: "Eric Johnson", company: "Johnson Growth Media", type: "Influencer",
    status: "Active", contactName: "Eric Johnson", email: "eric@johnsongrowth.com",
    phone: "(555) 287-4478", joinDate: "Mar 11, 2025", portalStatus: "Active",
    referralCode: "EJOH-RTM", referralLink: "https://rtmos.io/ref/EJOH-RTM",
    assignedManager: "Jordan M.", referralLeads: 31, qualifiedLeads: 9, wonDeals: 4,
    revenueGenerated: "$19,200/mo", commissionOwed: "$1,500", commissionPaid: "$3,000",
    lastReferral: "Jun 2, 2025", commissionModel: "Custom",
  },
  {
    id: "aff-020", name: "Lauren Castillo", company: "Castillo Insurance Group", type: "Strategic Partner",
    status: "Active", contactName: "Lauren Castillo", email: "lauren@castilloins.com",
    phone: "(555) 398-1139", joinDate: "Jun 5, 2023", portalStatus: "Active",
    referralCode: "LCAT-RTM", referralLink: "https://rtmos.io/ref/LCAT-RTM",
    assignedManager: "Mike T.", referralLeads: 10, qualifiedLeads: 8, wonDeals: 6,
    revenueGenerated: "$29,400/mo", commissionOwed: "$2,400", commissionPaid: "$8,800",
    lastReferral: "May 30, 2025", commissionModel: "Tiered",
  },
  {
    id: "aff-021", name: "Derek Powell", company: "Powell Tech Solutions", type: "Vendor",
    status: "Active", contactName: "Derek Powell", email: "derek@powelltechsol.com",
    phone: "(555) 509-2214", joinDate: "Aug 29, 2023", portalStatus: "Active",
    referralCode: "DPOW-RTM", referralLink: "https://rtmos.io/ref/DPOW-RTM",
    assignedManager: "Sarah K.", referralLeads: 4, qualifiedLeads: 3, wonDeals: 2,
    revenueGenerated: "$8,200/mo", commissionOwed: "$700", commissionPaid: "$1,400",
    lastReferral: "May 17, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-022", name: "Olivia Bennett", company: "Bennett Coaching Network", type: "Influencer",
    status: "Active", contactName: "Olivia Bennett", email: "olivia@bennettcoach.net",
    phone: "(555) 610-8876", joinDate: "Feb 7, 2025", portalStatus: "Invited",
    referralCode: "OBEN-RTM", referralLink: "https://rtmos.io/ref/OBEN-RTM",
    assignedManager: "Jordan M.", referralLeads: 13, qualifiedLeads: 4, wonDeals: 1,
    revenueGenerated: "$4,500/mo", commissionOwed: "$350", commissionPaid: "$350",
    lastReferral: "May 26, 2025", commissionModel: "Percentage",
  },
  {
    id: "aff-023", name: "Hector Reyes", company: "Reyes Property Group", type: "Client Referral",
    status: "Archived", contactName: "Hector Reyes", email: "hector@reyesproperty.com",
    phone: "(555) 721-3341", joinDate: "Mar 3, 2023", portalStatus: "Disabled",
    referralCode: "HREY-RTM", referralLink: "https://rtmos.io/ref/HREY-RTM",
    assignedManager: "Mike T.", referralLeads: 2, qualifiedLeads: 1, wonDeals: 1,
    revenueGenerated: "$2,400/mo", commissionOwed: "$0", commissionPaid: "$1,200",
    lastReferral: "Jan 15, 2025", commissionModel: "Flat Fee",
  },
  {
    id: "aff-024", name: "Stacey Morgan", company: "Morgan HR Solutions", type: "Strategic Partner",
    status: "Active", contactName: "Stacey Morgan", email: "stacey@morganhr.com",
    phone: "(555) 832-6607", joinDate: "Sep 25, 2023", portalStatus: "Active",
    referralCode: "SMRG-RTM", referralLink: "https://rtmos.io/ref/SMRG-RTM",
    assignedManager: "Sarah K.", referralLeads: 8, qualifiedLeads: 6, wonDeals: 4,
    revenueGenerated: "$19,600/mo", commissionOwed: "$1,600", commissionPaid: "$6,400",
    lastReferral: "May 28, 2025", commissionModel: "Tiered",
  },
  {
    id: "aff-025", name: "Kyle Fischer", company: "Fischer Auto Group", type: "Client Referral",
    status: "Active", contactName: "Kyle Fischer", email: "kyle@fischerauto.com",
    phone: "(555) 943-4493", joinDate: "Nov 11, 2023", portalStatus: "Active",
    referralCode: "KFIS-RTM", referralLink: "https://rtmos.io/ref/KFIS-RTM",
    assignedManager: "Jordan M.", referralLeads: 6, qualifiedLeads: 5, wonDeals: 4,
    revenueGenerated: "$21,600/mo", commissionOwed: "$1,750", commissionPaid: "$5,250",
    lastReferral: "Jun 1, 2025", commissionModel: "Percentage",
  },
];

const REFERRALS: Referral[] = [
  { id: "ref-001", affiliateId: "aff-002", referral: "Summit Plumbing Co.", submissionDate: "Jun 1, 2025", status: "Qualified", assignedRep: "Jordan M.", pipelineStage: "Qualified", dealValue: "$2,400/mo", commission: "$480"},
  { id: "ref-002", affiliateId: "aff-009", referral: "Bay Area Dental", submissionDate: "May 30, 2025", status: "Proposal", assignedRep: "Sarah K.", pipelineStage: "Proposal", dealValue: "$4,800/mo", commission: "$1,200"},
  { id: "ref-003", affiliateId: "aff-001", referral: "Pacific Roofing Inc.", submissionDate: "May 28, 2025", status: "Won", assignedRep: "Mike T.", pipelineStage: "Won", dealValue: "$3,200/mo", commission: "$640"},
  { id: "ref-004", affiliateId: "aff-016", referral: "Harbor HVAC", submissionDate: "Jun 2, 2025", status: "Lead", assignedRep: "Jordan M.", pipelineStage: "Lead", dealValue: "TBD", commission: "TBD"},
  { id: "ref-005", affiliateId: "aff-014", referral: "Metro MedSpa", submissionDate: "May 31, 2025", status: "Audit", assignedRep: "Sarah K.", pipelineStage: "Audit", dealValue: "$5,500/mo", commission: "$1,375"},
  { id: "ref-006", affiliateId: "aff-007", referral: "Coastal Law Firm", submissionDate: "May 25, 2025", status: "Negotiation", assignedRep: "Mike T.", pipelineStage: "Negotiation", dealValue: "$6,200/mo", commission: "$1,550"},
  { id: "ref-007", affiliateId: "aff-020", referral: "Sunrise Insurance", submissionDate: "May 22, 2025", status: "Won", assignedRep: "Jordan M.", pipelineStage: "Won", dealValue: "$3,800/mo", commission: "$760"},
  { id: "ref-008", affiliateId: "aff-019", referral: "TechVibe Agency", submissionDate: "Jun 2, 2025", status: "Lead", assignedRep: "Sarah K.", pipelineStage: "Lead", dealValue: "TBD", commission: "TBD"},
  { id: "ref-009", affiliateId: "aff-024", referral: "Northside Auto Repair", submissionDate: "May 28, 2025", status: "Qualified", assignedRep: "Mike T.", pipelineStage: "Qualified", dealValue: "$1,800/mo", commission: "$360"},
  { id: "ref-010", affiliateId: "aff-004", referral: "Lux Beauty Studio", submissionDate: "Jun 2, 2025", status: "Lost", assignedRep: "Jordan M.", pipelineStage: "Lost", dealValue: "$2,100/mo", commission: "$0"},
];

const COMMISSIONS: Commission[] = [
  { id: "com-001", affiliateId: "aff-009", referral: "Bay Area Chiro", dealValue: "$3,600/mo", commissionType: "Tiered", commissionAmount: "$1,080", status: "Approved", paymentDate: "Jun 15, 2025"},
  { id: "com-002", affiliateId: "aff-002", referral: "Pacific Spine Clinic", dealValue: "$4,200/mo", commissionType: "Tiered", commissionAmount: "$1,260", status: "Paid", paymentDate: "May 15, 2025"},
  { id: "com-003", affiliateId: "aff-001", referral: "Valley Pool Service", dealValue: "$2,200/mo", commissionType: "Percentage", commissionAmount: "$440", status: "Paid", paymentDate: "Apr 15, 2025"},
  { id: "com-004", affiliateId: "aff-016", referral: "Summit Electrical", dealValue: "$1,900/mo", commissionType: "Tiered", commissionAmount: "$380", status: "Pending", paymentDate: "—"},
  { id: "com-005", affiliateId: "aff-014", referral: "Premier Dental Group", dealValue: "$5,800/mo", commissionType: "Tiered", commissionAmount: "$1,740", status: "Approved", paymentDate: "Jun 15, 2025"},
  { id: "com-006", affiliateId: "aff-007", referral: "Bayside Law", dealValue: "$4,400/mo", commissionType: "Tiered", commissionAmount: "$1,320", status: "Paid", paymentDate: "May 15, 2025"},
  { id: "com-007", affiliateId: "aff-020", referral: "Liberty Insurance", dealValue: "$3,000/mo", commissionType: "Tiered", commissionAmount: "$600", status: "Paid", paymentDate: "Apr 15, 2025"},
  { id: "com-008", affiliateId: "aff-005", referral: "Greenfield Pest Control", dealValue: "$1,400/mo", commissionType: "Flat Fee", commissionAmount: "$500", status: "Paid", paymentDate: "Apr 1, 2025"},
  { id: "com-009", affiliateId: "aff-015", referral: "Ridge Custom Homes", dealValue: "$2,800/mo", commissionType: "Flat Fee", commissionAmount: "$750", status: "Pending", paymentDate: "—"},
  { id: "com-010", affiliateId: "aff-013", referral: "Horizon Tech", dealValue: "$1,200/mo", commissionType: "Flat Fee", commissionAmount: "$300", status: "Rejected", paymentDate: "—"},
];

const NOTES: AffiliateNote[] = [
  { id: "note-001", affiliateId: "aff-002", category: "Relationship", content: "Sarah is a top performer. Has quarterly meeting preference. Has referred 3 healthcare clients this month.", author: "Jordan M.", date: "Jun 2, 2025", pinned: true },
  { id: "note-002", affiliateId: "aff-002", category: "Commission", content: "Tiered commission upgraded to 30% at 5+ wins after negotiation May 2025.", author: "Sarah K.", date: "May 10, 2025", pinned: false },
  { id: "note-003", affiliateId: "aff-009", category: "Referral", content: "Carlos refers primarily healthcare and professional services clients — high quality pipeline.", author: "Sarah K.", date: "May 28, 2025", pinned: true },
  { id: "note-004", affiliateId: "aff-013", category: "General", content: "Account suspended due to dispute over commission terms. Awaiting resolution.", author: "Admin", date: "Mar 5, 2025", pinned: false },
  { id: "note-005", affiliateId: "aff-019", category: "Portal", content: "Portal setup completed. Eric prefers the dashboard analytics view.", author: "Mike T.", date: "Mar 14, 2025", pinned: false },
];

const PORTAL_USERS: PortalUser[] = [
  { id: "pu-001", affiliateId: "aff-002", portalUser: "Sarah Chen", email: "sarah@chendigital.com", lastLogin: "Jun 2, 2025", status: "Active", role: "Partner Admin"},
  { id: "pu-002", affiliateId: "aff-009", portalUser: "Carlos Mendez", email: "carlos@mendezassoc.com", lastLogin: "Jun 1, 2025", status: "Active", role: "Partner Admin"},
  { id: "pu-003", affiliateId: "aff-001", portalUser: "Marcus Williams", email: "marcus@williamslandscaping.com", lastLogin: "May 30, 2025", status: "Active", role: "Affiliate Member"},
  { id: "pu-004", affiliateId: "aff-007", portalUser: "Robert Kim", email: "rkim@kimlawpartners.com", lastLogin: "May 25, 2025", status: "Active", role: "Partner Admin"},
  { id: "pu-005", affiliateId: "aff-014", portalUser: "Monica Patel", email: "monica@patelhealthnet.com", lastLogin: "Jun 1, 2025", status: "Active", role: "Partner Admin"},
  { id: "pu-006", affiliateId: "aff-010", portalUser: "Patricia Nguyen", email: "patricia@nguyenbiz.com", lastLogin: "—", status: "Invited", role: "Affiliate Member"},
  { id: "pu-007", affiliateId: "aff-022", portalUser: "Olivia Bennett", email: "olivia@bennettcoach.net", lastLogin: "—", status: "Invited", role: "Affiliate Member"},
  { id: "pu-008", affiliateId: "aff-013", portalUser: "Trevor Nash", email: "trevor@nashtechv.com", lastLogin: "Feb 8, 2025", status: "Disabled", role: "Affiliate Member"},
];

const REFERRAL_LINKS: ReferralLink[] = [
  { id: "rl-001", affiliateId: "aff-002", referralCode: "CHEN-RTM", referralUrl: "https://rtmos.io/ref/CHEN-RTM", createdDate: "Mar 5, 2024", clicks: 342, leads: 14, qualified: 9, won: 6, revenue: "$31,200/mo", active: true },
  { id: "rl-002", affiliateId: "aff-009", referralCode: "CMND-RTM", referralUrl: "https://rtmos.io/ref/CMND-RTM", createdDate: "Jul 8, 2023", clicks: 519, leads: 17, qualified: 11, won: 8, revenue: "$44,000/mo", active: true },
  { id: "rl-003", affiliateId: "aff-016", referralCode: "NCRZ-RTM", referralUrl: "https://rtmos.io/ref/NCRZ-RTM", createdDate: "Apr 17, 2024", clicks: 288, leads: 16, qualified: 10, won: 7, revenue: "$38,500/mo", active: true },
  { id: "rl-004", affiliateId: "aff-014", referralCode: "MPAT-RTM", referralUrl: "https://rtmos.io/ref/MPAT-RTM", createdDate: "May 22, 2024", clicks: 201, leads: 12, qualified: 9, won: 6, revenue: "$33,600/mo", active: true },
  { id: "rl-005", affiliateId: "aff-020", referralCode: "LCAT-RTM", referralUrl: "https://rtmos.io/ref/LCAT-RTM", createdDate: "Jun 5, 2023", clicks: 187, leads: 10, qualified: 8, won: 6, revenue: "$29,400/mo", active: true },
  { id: "rl-006", affiliateId: "aff-013", referralCode: "TNSH-RTM", referralUrl: "https://rtmos.io/ref/TNSH-RTM", createdDate: "Dec 5, 2023", clicks: 44, leads: 3, qualified: 1, won: 0, revenue: "$0", active: false },
];

//  Status Variant Helpers 

function affiliateStatusVariant(s: AffiliateStatus): "success"| "pending"| "error"| "neutral"{
  const map: Record<AffiliateStatus, "success"| "pending"| "error"| "neutral"> = {
    Active: "success", Pending: "pending", Suspended: "error", Archived: "neutral",
  };
  return map[s];
}

function portalStatusVariant(s: PortalStatus): "success"| "info"| "neutral"| "pending"{
  const map: Record<PortalStatus, "success"| "info"| "neutral"| "pending"> = {
    Active: "success", Invited: "info", Disabled: "neutral", "Pending Setup": "pending",
  };
  return map[s];
}

function commissionStatusVariant(s: CommissionStatus): "pending"| "info"| "success"| "error"| "warning"{
  const map: Record<CommissionStatus, "pending"| "info"| "success"| "error"| "warning"> = {
    Pending: "pending", Approved: "info", Paid: "success", Rejected: "error", "On Hold": "warning",
  };
  return map[s];
}

function referralStageVariant(s: ReferralPipelineStage): "neutral"| "info"| "pending"| "warning"| "success"| "error"{
  const map: Record<ReferralPipelineStage, "neutral"| "info"| "pending"| "warning"| "success"| "error"> = {
    Lead: "neutral", Qualified: "info", Audit: "pending", Proposal: "warning",
    Negotiation: "warning", Won: "success", Lost: "error",
  };
  return map[s];
}

function affiliateTypeColor(t: AffiliateType): { bg: string; text: string; border: string } {
  const map: Record<AffiliateType, { bg: string; text: string; border: string }> = {
    "Client Referral":  { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
    "Strategic Partner": { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0"},
    "Agency Partner":   { bg: "#F5F3FF", text: "#6D28D9", border: "#DDD6FE"},
    "Influencer":       { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
    "Employee":         { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD"},
    "Vendor":           { bg: "#FAFAF9", text: "#44403C", border: "#D6D3D1"},
  };
  return map[t];
}

//  KPI Computations 

const activeAffiliates = AFFILIATES.filter((a) => a.status === "Active").length;
const referralLeadsTotal = AFFILIATES.reduce((s, a) => s + a.referralLeads, 0);
const qualifiedReferralsTotal = AFFILIATES.reduce((s, a) => s + a.qualifiedLeads, 0);
const closedWonTotal = AFFILIATES.reduce((s, a) => s + a.wonDeals, 0);

const referralRevenueTotal = AFFILIATES.reduce((s, a) => {
  const n = parseFloat(String(a.revenueGenerated).replace(/[^0-9.]/g, ""));
  return s + (isNaN(n) ? 0 : n);
}, 0);

const pendingCommissionsTotal = AFFILIATES.reduce((s, a) => {
  const n = parseFloat(String(a.commissionOwed).replace(/[^0-9.]/g, ""));
  return s + (isNaN(n) ? 0 : n);
}, 0);

const paidCommissionsTotal = AFFILIATES.reduce((s, a) => {
  const n = parseFloat(String(a.commissionPaid).replace(/[^0-9.]/g, ""));
  return s + (isNaN(n) ? 0 : n);
}, 0);

const avgAffiliateValue = closedWonTotal > 0
  ? referralRevenueTotal / closedWonTotal
  : 0;

//  Table Columns 

const affiliateDirectoryColumns: Column<Affiliate>[] = [
  {
    key: "name", header: "Affiliate Name", width: "160px",
    render: (v) => <span className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</span>,
  },
  { key: "company", header: "Company", width: "160px", render: (v) => <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{String(v)}</span> },
  {
    key: "type", header: "Affiliate Type", width: "140px",
    render: (v) => {
      const c = affiliateTypeColor(v as AffiliateType);
      return <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"style={{ background: c.bg, color: c.text, borderColor: c.border }}>{String(v)}</span>;
    },
  },
  {
    key: "status", header: "Status", width: "100px",
    render: (v) => <StatusBadge variant={affiliateStatusVariant(v as AffiliateStatus)} label={String(v)} size="sm"/>,
  },
  { key: "referralLeads", header: "Ref. Leads", width: "90px", render: (v) => <span className="font-bold text-xs"style={{ color: "#2563EB"}}>{String(v)}</span> },
  { key: "qualifiedLeads", header: "Qualified", width: "90px", render: (v) => <span className="font-bold text-xs"style={{ color: "#7C3AED"}}>{String(v)}</span> },
  { key: "wonDeals", header: "Won Deals", width: "90px", render: (v) => <span className="font-bold text-xs"style={{ color: "#059669"}}>{String(v)}</span> },
  { key: "revenueGenerated", header: "Revenue", width: "110px", render: (v) => <span className="font-semibold text-xs"style={{ color: "#059669"}}>{String(v)}</span> },
  { key: "commissionOwed", header: "Comm. Owed", width: "110px", render: (v) => <span className="font-semibold text-xs"style={{ color: "#D97706"}}>{String(v)}</span> },
  { key: "commissionPaid", header: "Comm. Paid", width: "110px", render: (v) => <span className="font-semibold text-xs"style={{ color: "#059669"}}>{String(v)}</span> },
  {
    key: "portalStatus", header: "Portal Status", width: "120px",
    render: (v) => <StatusBadge variant={portalStatusVariant(v as PortalStatus)} label={String(v)} size="sm"/>,
  },
  { key: "lastReferral", header: "Last Referral", width: "110px", render: (v) => <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{String(v)}</span> },
];

const referralsTableColumns: Column<Referral>[] = [
  { key: "referral", header: "Referral", width: "160px", render: (v) => <span className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</span> },
  { key: "submissionDate", header: "Submission Date", width: "130px"},
  {
    key: "pipelineStage", header: "Pipeline Stage", width: "120px",
    render: (v) => <StatusBadge variant={referralStageVariant(v as ReferralPipelineStage)} label={String(v)} size="sm"/>,
  },
  { key: "assignedRep", header: "Sales Rep", width: "110px"},
  { key: "dealValue", header: "Deal Value", width: "110px", render: (v) => <span className="font-semibold text-xs"style={{ color: "#059669"}}>{String(v)}</span> },
  { key: "commission", header: "Commission", width: "100px", render: (v) => <span className="font-semibold text-xs"style={{ color: "#D97706"}}>{String(v)}</span> },
];

const commissionsTableColumns: Column<Commission>[] = [
  { key: "referral", header: "Referral", width: "160px", render: (v) => <span className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</span> },
  { key: "dealValue", header: "Deal Value", width: "100px", render: (v) => <span className="font-semibold text-xs"style={{ color: "#059669"}}>{String(v)}</span> },
  { key: "commissionType", header: "Commission Type", width: "130px"},
  { key: "commissionAmount", header: "Amount", width: "100px", render: (v) => <span className="font-bold text-xs"style={{ color: "#D97706"}}>{String(v)}</span> },
  {
    key: "status", header: "Status", width: "110px",
    render: (v) => <StatusBadge variant={commissionStatusVariant(v as CommissionStatus)} label={String(v)} size="sm"/>,
  },
  { key: "paymentDate", header: "Payment Date", width: "120px", render: (v) => <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{String(v)}</span> },
];

const referralLinkColumns: Column<ReferralLink>[] = [
  { key: "referralCode", header: "Referral Code", width: "120px", render: (v) => <span className="font-mono font-bold text-xs px-2 py-0.5 rounded"style={{ background: "var(--rtm-bg)", color: "var(--rtm-blue)"}}>{String(v)}</span> },
  { key: "referralUrl", header: "Referral URL", width: "220px", render: (v) => <span className="text-xs truncate max-w-[200px] block"style={{ color: "#2563EB"}}>{String(v)}</span> },
  { key: "createdDate", header: "Created", width: "110px"},
  { key: "clicks", header: "Clicks", width: "80px", render: (v) => <span className="font-bold text-xs"style={{ color: "#2563EB"}}>{String(v)}</span> },
  { key: "leads", header: "Leads", width: "70px", render: (v) => <span className="font-bold text-xs"style={{ color: "#7C3AED"}}>{String(v)}</span> },
  { key: "qualified", header: "Qualified", width: "80px", render: (v) => <span className="font-bold text-xs"style={{ color: "#0891B2"}}>{String(v)}</span> },
  { key: "won", header: "Won", width: "70px", render: (v) => <span className="font-bold text-xs"style={{ color: "#059669"}}>{String(v)}</span> },
  { key: "revenue", header: "Revenue", width: "110px", render: (v) => <span className="font-semibold text-xs"style={{ color: "#059669"}}>{String(v)}</span> },
  {
    key: "active", header: "Status", width: "90px",
    render: (v) => <StatusBadge variant={v ? "success": "neutral"} label={v ? "Active": "Inactive"} size="sm"/>,
  },
];

const portalUsersColumns: Column<PortalUser>[] = [
  { key: "portalUser", header: "Portal User", width: "140px", render: (v) => <span className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{String(v)}</span> },
  { key: "email", header: "Email", width: "200px", render: (v) => <span className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{String(v)}</span> },
  { key: "lastLogin", header: "Last Login", width: "120px", render: (v) => <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{String(v)}</span> },
  {
    key: "status", header: "Status", width: "110px",
    render: (v) => {
      const variant = v === "Active"? "success": v === "Invited"? "info": v === "Pending"? "pending": "neutral";
      return <StatusBadge variant={variant as "success"| "info"| "pending"| "neutral"} label={String(v)} size="sm"/>;
    },
  },
  { key: "role", header: "Role", width: "140px", render: (v) => <span className="text-xs font-medium"style={{ color: "var(--rtm-text-secondary)"}}>{String(v)}</span> },
];

//  Affiliate Profile Drawer 

interface AffiliateDrawerProps {
  affiliate: Affiliate | null;
  onClose: () => void;
}

function AffiliateDrawer({ affiliate, onClose }: AffiliateDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview"| "referrals"| "commissions"| "links"| "portal"| "notes">("overview");

  if (!affiliate) return null;

  const affiliateReferrals = REFERRALS.filter((r) => r.affiliateId === affiliate.id);
  const affiliateCommissions = COMMISSIONS.filter((c) => c.affiliateId === affiliate.id);
  const affiliateNotes = NOTES.filter((n) => n.affiliateId === affiliate.id);
  const affiliatePortalUsers = PORTAL_USERS.filter((p) => p.affiliateId === affiliate.id);
  const affiliateLinks = REFERRAL_LINKS.filter((l) => l.affiliateId === affiliate.id);

  const typeColors = affiliateTypeColor(affiliate.type);

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: "overview", label: "Overview"},
    { key: "referrals", label: `Referrals (${affiliateReferrals.length})` },
    { key: "commissions", label: `Commissions (${affiliateCommissions.length})` },
    { key: "links", label: "Ref. Links"},
    { key: "portal", label: "Portal Access"},
    { key: "notes", label: `Notes (${affiliateNotes.length})` },
  ];

  const conversionRate = affiliate.referralLeads > 0
    ? Math.round((affiliate.wonDeals / affiliate.referralLeads) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(15,28,56,0.35)"}} onClick={onClose}>
      <div
        className="relative h-full w-full max-w-2xl flex flex-col overflow-hidden"style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)"}}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5"style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="text-lg font-bold"style={{ color: "var(--rtm-text-primary)"}}>{affiliate.name}</h2>
              <StatusBadge variant={affiliateStatusVariant(affiliate.status)} label={affiliate.status} size="sm"/>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border"style={{ background: typeColors.bg, color: typeColors.text, borderColor: typeColors.border }}>{affiliate.type}</span>
            </div>
            <p className="text-sm"style={{ color: "var(--rtm-text-secondary)"}}>{affiliate.company} · {affiliate.assignedManager}</p>
            <p className="text-xs mt-0.5 font-mono"style={{ color: "var(--rtm-text-muted)"}}>Code: {affiliate.referralCode}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-lg font-bold transition-colors hover:bg-red-50"style={{ color: "var(--rtm-text-muted)"}}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto px-6 pt-3 pb-0 gap-1"style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-3 py-2 text-xs font-semibold rounded-t-lg whitespace-nowrap transition-colors"style={{
                background: activeTab === tab.key ? "var(--rtm-bg)": "transparent",
                color: activeTab === tab.key ? "var(--rtm-blue)": "var(--rtm-text-muted)",
                borderBottom: activeTab === tab.key ? "2px solid var(--rtm-blue)": "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/*  Overview Tab  */}
          {activeTab === "overview"&& (
            <>
              {/* Affiliate Details */}
              <div className="rounded-xl border p-5 space-y-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Affiliate Overview</p>
                <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                  {[
                    ["Affiliate Name", affiliate.name],
                    ["Company", affiliate.company],
                    ["Type", affiliate.type],
                    ["Contact Name", affiliate.contactName],
                    ["Email", affiliate.email],
                    ["Phone", affiliate.phone],
                    ["Join Date", affiliate.joinDate],
                    ["Assigned Manager", affiliate.assignedManager],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                      <p className="text-xs font-medium"style={{ color: "var(--rtm-text-primary)"}}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t"style={{ borderColor: "var(--rtm-border)"}}>
                  <p className="text-[10px] font-semibold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}>Referral Link</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-1 rounded"style={{ background: "var(--rtm-bg)", color: "#2563EB"}}>{affiliate.referralLink}</span>
                    <button className="text-xs font-semibold px-2 py-1 rounded border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert(`[Mock] Copied: ${affiliate.referralLink}`)}>Copy</button>
                  </div>
                </div>
              </div>

              {/* Referral Performance */}
              <div className="rounded-xl border p-5 space-y-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Referral Performance</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Referral Leads", value: String(affiliate.referralLeads), color: "#2563EB"},
                    { label: "Qualified Leads", value: String(affiliate.qualifiedLeads), color: "#7C3AED"},
                    { label: "Won Deals", value: String(affiliate.wonDeals), color: "#059669"},
                    { label: "Conversion Rate", value: `${conversionRate}%`, color: "#0891B2"},
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg p-3 text-center"style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                      <p className="text-xl font-bold"style={{ color }}>{value}</p>
                      <p className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { label: "Revenue Generated", value: affiliate.revenueGenerated, color: "#059669"},
                    { label: "Avg. Deal Value (est)", value: affiliate.wonDeals > 0 ? `$${Math.round(parseFloat(String(affiliate.revenueGenerated).replace(/[^0-9.]/g, "")) / affiliate.wonDeals).toLocaleString()}/mo` : "—", color: "#D97706"},
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg p-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                      <p className="text-xs font-semibold mb-0.5"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                      <p className="text-lg font-bold"style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>Pipeline Conversion</span>
                    <span className="text-xs font-bold"style={{ color: conversionRate >= 40 ? "#059669": "#D97706"}}>{conversionRate}%</span>
                  </div>
                  <ProgressBar value={conversionRate} color={conversionRate >= 40 ? "bg-emerald-500": "bg-amber-500"} height={6} />
                </div>
              </div>

              {/* Commission Summary */}
              <div className="rounded-xl border p-5 space-y-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Commission Summary</p>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>Commission Model:</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"style={{ background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE"}}>{affiliate.commissionModel}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Commission Owed", value: affiliate.commissionOwed, color: "#D97706"},
                    { label: "Commission Paid", value: affiliate.commissionPaid, color: "#059669"},
                  ].map(({ label, value, color }) => (
                    <div key={label} className="rounded-lg p-3 text-center"style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                      <p className="text-xl font-bold"style={{ color }}>{value}</p>
                      <p className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/*  Referrals Tab  */}
          {activeTab === "referrals"&& (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Referral History</p>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert("[Mock] Generate Referral Link")}>+ Referral Link</button>
              </div>
              {affiliateReferrals.length > 0 ? (
                <DataTable columns={referralsTableColumns} data={affiliateReferrals} />
              ) : (
                <div className="py-8 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>No referrals on record for this affiliate.</div>
              )}
            </div>
          )}

          {/*  Commissions Tab  */}
          {activeTab === "commissions"&& (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Commission History</p>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0"}} onClick={() => alert("[Mock] Record Payment")}>Record Payment</button>
              </div>
              {affiliateCommissions.length > 0 ? (
                <DataTable columns={commissionsTableColumns} data={affiliateCommissions} />
              ) : (
                <div className="py-8 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>No commissions on record for this affiliate.</div>
              )}
            </div>
          )}

          {/*  Referral Links Tab  */}
          {activeTab === "links"&& (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Referral Links</p>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert("[Mock] Generate New Link")}>Generate Link</button>
              </div>
              {affiliateLinks.length > 0 ? (
                <div className="space-y-3">
                  {affiliateLinks.map((link) => (
                    <div key={link.id} className="rounded-xl border p-4 space-y-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sm px-2 py-1 rounded"style={{ background: "var(--rtm-bg)", color: "#2563EB"}}>{link.referralCode}</span>
                        <div className="flex gap-2">
                          <StatusBadge variant={link.active ? "success": "neutral"} label={link.active ? "Active": "Inactive"} size="sm"/>
                          {["Copy", "Regenerate", ...(link.active ? ["Deactivate"] : ["Activate"])].map((action) => (
                            <button key={action} className="text-xs font-semibold px-2 py-1 rounded border"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}} onClick={() => alert(`[Mock] ${action}: ${link.referralCode}`)}>
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs truncate"style={{ color: "#2563EB"}}>{link.referralUrl}</p>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { label: "Clicks", value: link.clicks, color: "#2563EB"},
                          { label: "Leads", value: link.leads, color: "#7C3AED"},
                          { label: "Qualified", value: link.qualified, color: "#0891B2"},
                          { label: "Won", value: link.won, color: "#059669"},
                          { label: "Revenue", value: link.revenue, color: "#059669"},
                        ].map(({ label, value, color }) => (
                          <div key={label} className="text-center">
                            <p className="text-base font-bold"style={{ color }}>{value}</p>
                            <p className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>No referral links generated for this affiliate.</div>
              )}
            </div>
          )}

          {/*  Portal Access Tab  */}
          {activeTab === "portal"&& (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Portal Access Management</p>
                <div className="flex gap-2">
                  <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert("[Mock] Invite Portal User")}>Invite User</button>
                  <StatusBadge variant={portalStatusVariant(affiliate.portalStatus)} label={affiliate.portalStatus} size="sm"/>
                </div>
              </div>
              {affiliatePortalUsers.length > 0 ? (
                <>
                  <DataTable columns={portalUsersColumns} data={affiliatePortalUsers} />
                  <div className="flex flex-wrap gap-2 pt-1">
                    {["Reset Access", "Disable Access", "Enable Access"].map((action) => (
                      <button key={action} className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}} onClick={() => alert(`[Mock] ${action}`)}>
                        {action}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>No portal users configured. Invite a user to grant portal access.</div>
              )}
            </div>
          )}

          {/*  Notes Tab  */}
          {activeTab === "notes"&& (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>Affiliate Notes</p>
                <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert("[Mock] Add Note")}>Add Note</button>
              </div>
              {affiliateNotes.length > 0 ? (
                <div className="space-y-3">
                  {affiliateNotes.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).map((note) => {
                    const catColors: Record<NoteCategory, { bg: string; text: string }> = {
                      General: { bg: "#F8FAFC", text: "#475569"},
                      Referral: { bg: "#EFF6FF", text: "#1D4ED8"},
                      Commission: { bg: "#FFFBEB", text: "#B45309"},
                      Portal: { bg: "#F5F3FF", text: "#6D28D9"},
                      Relationship: { bg: "#ECFDF5", text: "#065F46"},
                    };
                    const cc = catColors[note.category];
                    return (
                      <div key={note.id} className="rounded-xl border p-4 space-y-2"style={{ background: note.pinned ? "#FFFBEB": "var(--rtm-surface)", borderColor: note.pinned ? "#FDE68A": "var(--rtm-border)"}}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {note.pinned && <span className="text-xs font-semibold text-amber-600">Pinned</span>}
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: cc.bg, color: cc.text }}>{note.category}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{note.author} · {note.date}</span>
                            {["Edit", "Pin", "Delete"].map((a) => (
                              <button key={a} className="text-[10px] font-semibold px-1.5 py-0.5 rounded"style={{ color: "var(--rtm-text-muted)"}} onClick={() => alert(`[Mock] ${a} note`)}>{a}</button>
                            ))}
                          </div>
                        </div>
                        <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{note.content}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>No notes for this affiliate yet.</div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="px-6 py-4 flex flex-wrap gap-2"style={{ background: "var(--rtm-surface)", borderTop: "1px solid var(--rtm-border)"}}>
          {[
            { label: "Edit Affiliate", color: "#7C3AED"},
            { label: "Generate Referral Link", color: "#2563EB"},
            { label: "Record Payment", color: "#059669"},
            { label: "Create Task", color: "#D97706"},
            { label: "Add Note", color: "#0891B2"},
          ].map(({ label, color }) => (
            <button
              key={label}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all hover:opacity-90"style={{ background: `${color}10`, color, borderColor: `${color}35` }}
              onClick={() => alert(`[Mock] ${label}: ${affiliate.name}`)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

//  Row Action Menu 

interface RowActionsProps {
  affiliate: Affiliate;
  onView: () => void;
}

function RowActions({ affiliate, onView }: RowActionsProps) {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: "View Affiliate",         action: onView },
    { label: "Edit Affiliate",         action: () => alert(`[Mock] Edit: ${affiliate.name}`) },
    { label: "View Referrals",         action: () => alert(`[Mock] View Referrals: ${affiliate.name}`) },
    { label: "Generate Referral Link", action: () => alert(`[Mock] Generate Link: ${affiliate.referralCode}`) },
    { label: "View Commissions",       action: () => alert(`[Mock] View Commissions: ${affiliate.name}`) },
    { label: "Record Payment",         action: () => alert(`[Mock] Record Payment: ${affiliate.name}`) },
    { label: affiliate.portalStatus === "Disabled"? "Enable Portal": "Disable Portal", action: () => alert(`[Mock] Toggle Portal: ${affiliate.name}`) },
    { label: "Add Note",               action: () => alert(`[Mock] Add Note: ${affiliate.name}`) },
  ];

  return (
    <div className="relative">
      <button
        className="text-xs font-semibold px-2 py-1 rounded border transition-colors"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}}
        onClick={() => setOpen((p) => !p)}
      >
        ⋯ Actions
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10"onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-20 w-48 rounded-xl border shadow-lg overflow-hidden"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
          >
            {actions.map(({ label, action }) => (
              <button
                key={label}
                className="w-full text-left px-4 py-2.5 text-xs font-medium transition-colors hover:bg-blue-50"style={{ color: "var(--rtm-text-secondary)"}}
                onClick={() => { setOpen(false); action(); }}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

//  Workflow Attribution 

const WORKFLOW_STEPS = [
  { label: "Affiliate Referral", color: "#94A3B8", desc: "Affiliate submits referral"},
  { label: "Lead",               color: "#2563EB", desc: "Lead created in CRM"},
  { label: "Audit",              color: "#7C3AED", desc: "Discovery & audit phase"},
  { label: "Proposal",           color: "#0891B2", desc: "Proposal sent to prospect"},
  { label: "Invoice Paid",       color: "#D97706", desc: "Deal closed + payment"},
  { label: "Commission Created", color: "#6366F1", desc: "Commission record created"},
  { label: "Commission Paid",    color: "#059669", desc: "Payout issued to affiliate"},
];

//  Main Page Component 

export default function AffiliatesPage() {
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [statusFilter, setStatusFilter] = useState<AffiliateStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<AffiliateType | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const toggle = (s: string) => setActiveSection((p) => (p === s ? null : s));

  const filteredAffiliates = AFFILIATES.filter((a) => {
    const matchStatus = statusFilter === "All"|| a.status === statusFilter;
    const matchType = typeFilter === "All"|| a.type === typeFilter;
    const matchSearch = !searchQuery ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  // Counts by type
  const typeCounts: Record<AffiliateType, number> = {
    "Client Referral": 0, "Strategic Partner": 0, "Agency Partner": 0,
    "Influencer": 0, "Employee": 0, "Vendor": 0,
  };
  AFFILIATES.forEach((a) => { typeCounts[a.type]++; });

  // Workflow revenue attribution
  const workflowStats = {
    totalReferrals: referralLeadsTotal,
    qualifiedRate: referralLeadsTotal > 0 ? Math.round((qualifiedReferralsTotal / referralLeadsTotal) * 100) : 0,
    winRate: qualifiedReferralsTotal > 0 ? Math.round((closedWonTotal / qualifiedReferralsTotal) * 100) : 0,
  };

  return (
    <div className="space-y-6">

      {/*  Page Header  */}
      <div
        className="rounded-xl px-6 py-5 flex items-center gap-4"style={{
          background: "linear-gradient(135deg, #05966918 0%, #05966908 100%)",
          border: "1px solid #05966930",
        }}
      >
        
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5"style={{ color: "#059669"}}>Sales</p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>Affiliate Management</h1>
          <p className="text-sm mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
            Manage affiliates, referral performance, commissions, payouts, and affiliate portal access.
          </p>
        </div>
      </div>

      {/*  Top Action Bar  */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: "Add Affiliate",        color: "#059669"},
          { label: "Generate Referral Link", color: "#2563EB"},
          { label: "Export Affiliates",     color: "#7C3AED"},
          { label: "Commission Report",    color: "#D97706"},
          { label: "Affiliate Portal Access", color: "#0891B2"},
        ].map(({ label, color }) => (
          <button
            key={label}
            className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all hover:opacity-90"style={{ background: `${color}12`, color, borderColor: `${color}40` }}
            onClick={() => alert(`[Mock] ${label}`)}
          >
            {label}
          </button>
        ))}
      </div>

      {/*  KPI Cards  */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Active Affiliates"value={String(activeAffiliates)}
          trend="up"trendValue="3"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>}
        />
        <KpiCard
          title="Referral Leads"value={String(referralLeadsTotal)}
          trend="up"trendValue="12"iconBg="#EFF6FF"iconColor="#2563EB"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
        />
        <KpiCard
          title="Qualified Referrals"value={String(qualifiedReferralsTotal)}
          trend="up"trendValue="8"iconBg="#F5F3FF"iconColor="#7C3AED"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Closed Won Deals"value={String(closedWonTotal)}
          trend="up"trendValue="4"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>}
        />
        <KpiCard
          title="Referral Revenue"value={`$${Math.round(referralRevenueTotal / 1000)}k/mo`}
          trend="up"trendValue="18%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Pending Commissions"value={`$${Math.round(pendingCommissionsTotal).toLocaleString()}`}
          iconBg="#FFFBEB"iconColor="#D97706"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <KpiCard
          title="Paid Commissions"value={`$${Math.round(paidCommissionsTotal).toLocaleString()}`}
          trend="up"trendValue="22%"iconBg="#ECFDF5"iconColor="#059669"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
        />
        <KpiCard
          title="Avg. Affiliate Value"value={`$${Math.round(avgAffiliateValue / 100) * 100}/mo`}
          iconBg="#EFF6FF"iconColor="#2563EB"icon={<svg className="w-5 h-5"fill="none"stroke="currentColor"viewBox="0 0 24 24"><path strokeLinecap="round"strokeLinejoin="round"strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>}
        />
      </div>

      {/*  Affiliate Type Breakdown  */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {(Object.keys(typeCounts) as AffiliateType[]).map((type) => {
          const c = affiliateTypeColor(type);
          return (
            <div key={type} className="rounded-xl border p-3 text-center cursor-pointer transition-all hover:shadow-md"style={{ background: c.bg, borderColor: c.border }} onClick={() => setTypeFilter(typeFilter === type ? "All": type)}>
              <p className="text-xl font-bold"style={{ color: c.text }}>{typeCounts[type]}</p>
              <p className="text-[10px] font-semibold mt-0.5 leading-tight"style={{ color: c.text }}>{type}</p>
            </div>
          );
        })}
      </div>

      {/*  Workflow Attribution  */}
      <SectionWrapper
        title="Referral Workflow Attribution"description="End-to-end affiliate referral flow from submission to commission payout">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {WORKFLOW_STEPS.map((step, i) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-1 min-w-[90px]">
                  <div className="rounded-lg px-3 py-2 text-center w-full"style={{ background: `${step.color}12`, border: `1.5px solid ${step.color}35` }}>
                    <p className="text-[10px] font-bold"style={{ color: step.color }}>{step.label}</p>
                    <p className="text-[9px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{step.desc}</p>
                  </div>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && <span className="text-sm"style={{ color: "var(--rtm-border)"}}>→</span>}
              </React.Fragment>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total Referrals Submitted", value: String(workflowStats.totalReferrals), color: "#2563EB"},
              { label: "Qualification Rate", value: `${workflowStats.qualifiedRate}%`, color: "#7C3AED"},
              { label: "Referral Win Rate", value: `${workflowStats.winRate}%`, color: "#059669"},
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-lg p-3 text-center"style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
                <p className="text-2xl font-bold"style={{ color }}>{value}</p>
                <p className="text-xs font-medium mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </SectionWrapper>

      {/*  Affiliate Directory  */}
      <SectionWrapper
        title="Affiliate Directory"description="All affiliate partners with performance metrics, commission status, and portal access"actions={
          <div className="flex gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0"}} onClick={() => alert("[Mock] Add Affiliate")}> Add Affiliate</button>
          </div>
        }
      >
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"placeholder="Search affiliates..."value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rtm-input text-sm w-56"style={{ fontSize: "12px", padding: "6px 12px"}}
          />
          <div className="flex gap-1 flex-wrap">
            {(["All", "Active", "Pending", "Suspended", "Archived"] as (AffiliateStatus | "All")[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"style={{
                  background: statusFilter === s ? (s === "All"? "#1E293B": s === "Active"? "#059669": s === "Pending"? "#3B82F6": s === "Suspended"? "#DC2626": "#64748B") : "var(--rtm-surface)",
                  color: statusFilter === s ? "#fff": "var(--rtm-text-secondary)",
                  borderColor: statusFilter === s ? "transparent": "var(--rtm-border)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {(["All", "Client Referral", "Agency Partner", "Strategic Partner", "Influencer", "Employee", "Vendor"] as (AffiliateType | "All")[]).map((t) => {
              const c = t !== "All"? affiliateTypeColor(t) : null;
              return (
                <button
                  key={t}
                  onClick={() => setTypeFilter(t)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"style={{
                    background: typeFilter === t ? (c?.bg ?? "#1E293B") : "var(--rtm-surface)",
                    color: typeFilter === t ? (c?.text ?? "#fff") : "var(--rtm-text-secondary)",
                    borderColor: typeFilter === t ? (c?.border ?? "transparent") : "var(--rtm-border)",
                  }}
                >
                  {t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table with Actions */}
        <div className="overflow-x-auto rounded-xl border"style={{ borderColor: "var(--rtm-border)"}}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
                {affiliateDirectoryColumns.map((col) => (
                  <th key={String(col.key)} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)", ...(col.width ? { width: col.width } : {}) }}>
                    {col.header}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)", width: "120px"}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAffiliates.map((aff, rowIdx) => (
                <tr
                  key={aff.id}
                  style={{ background: rowIdx % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)"}}
                >
                  {affiliateDirectoryColumns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-xs align-middle"style={{ color: "var(--rtm-text-secondary)"}}>
                      {col.render ? col.render(aff[col.key], aff) : String(aff[col.key])}
                    </td>
                  ))}
                  <td className="px-4 py-3 align-middle">
                    <RowActions affiliate={aff} onView={() => setSelectedAffiliate(aff)} />
                  </td>
                </tr>
              ))}
              {filteredAffiliates.length === 0 && (
                <tr>
                  <td colSpan={affiliateDirectoryColumns.length + 1} className="px-4 py-8 text-center text-sm"style={{ color: "var(--rtm-text-muted)"}}>
                    No affiliates match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs mt-2"style={{ color: "var(--rtm-text-muted)"}}>
          Showing {filteredAffiliates.length} of {AFFILIATES.length} affiliates
        </p>
      </SectionWrapper>

      {/*  Referral Tracking  */}
      <SectionWrapper
        title="Referral Tracking"description="All referrals across the pipeline with stage, rep assignment, and commission status"actions={
          <button className="rtm-btn-secondary text-sm"onClick={() => toggle("referralTracking")}>
            {activeSection === "referralTracking"? "Collapse": "Expand"}
          </button>
        }
      >
        {/* Pipeline Stage Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["Lead", "Qualified", "Audit", "Proposal", "Negotiation", "Won", "Lost"] as ReferralPipelineStage[]).map((stage) => {
            const count = REFERRALS.filter((r) => r.pipelineStage === stage).length;
            return (
              <div key={stage} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                <StatusBadge variant={referralStageVariant(stage)} label={stage} size="sm"/>
                <span className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{count}</span>
              </div>
            );
          })}
        </div>
        {activeSection === "referralTracking"? (
          <DataTable columns={referralsTableColumns} data={REFERRALS} />
        ) : (
          <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>
            {REFERRALS.length} referrals tracked · Click Expand to view full table
          </p>
        )}
      </SectionWrapper>

      {/*  Commission Tracking  */}
      <SectionWrapper
        title="Commission Tracking"description="All commission records across affiliates with approval status and payment dates"actions={
          <div className="flex gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0"}} onClick={() => alert("[Mock] Bulk Approve")}>Bulk Approve</button>
            <button className="rtm-btn-secondary text-sm"onClick={() => toggle("commissions")}>
              {activeSection === "commissions"? "Collapse": "Expand"}
            </button>
          </div>
        }
      >
        {/* Commission Status Summary */}
        <div className="flex flex-wrap gap-2 mb-4">
          {(["Pending", "Approved", "Paid", "Rejected", "On Hold"] as CommissionStatus[]).map((s) => {
            const count = COMMISSIONS.filter((c) => c.status === s).length;
            const totalAmt = COMMISSIONS.filter((c) => c.status === s).reduce((sum, c) => {
              const n = parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, ""));
              return sum + (isNaN(n) ? 0 : n);
            }, 0);
            return (
              <div key={s} className="flex items-center gap-2 px-3 py-2 rounded-lg border"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                <StatusBadge variant={commissionStatusVariant(s)} label={s} size="sm"/>
                <span className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{count}</span>
                {totalAmt > 0 && <span className="text-xs font-semibold"style={{ color: "#D97706"}}>${totalAmt.toLocaleString()}</span>}
              </div>
            );
          })}
        </div>
        {activeSection === "commissions"? (
          <DataTable columns={commissionsTableColumns} data={COMMISSIONS} />
        ) : (
          <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>
            {COMMISSIONS.length} commission records · ${Math.round(pendingCommissionsTotal).toLocaleString()} pending · Click Expand to view all
          </p>
        )}
      </SectionWrapper>

      {/*  Referral Link Management  */}
      <SectionWrapper
        title="Referral Link Management"description="All affiliate referral links with click tracking, lead attribution, and performance metrics"actions={
          <div className="flex gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert("[Mock] Generate New Link")}>Generate Link</button>
            <button className="rtm-btn-secondary text-sm"onClick={() => toggle("referralLinks")}>
              {activeSection === "referralLinks"? "Collapse": "Expand"}
            </button>
          </div>
        }
      >
        {activeSection === "referralLinks"? (
          <DataTable columns={referralLinkColumns} data={REFERRAL_LINKS} />
        ) : (
          <div className="flex flex-wrap gap-3 py-1">
            {REFERRAL_LINKS.map((link) => (
              <div key={link.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                <span className="font-mono font-bold text-xs"style={{ color: "#2563EB"}}>{link.referralCode}</span>
                <StatusBadge variant={link.active ? "success": "neutral"} label={link.active ? "Active": "Off"} size="sm"/>
                <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>{link.leads} leads · {link.won} won</span>
              </div>
            ))}
          </div>
        )}
      </SectionWrapper>

      {/*  Portal Access Management  */}
      <SectionWrapper
        title="Affiliate Portal Access"description="Manage portal user access, login status, and roles across all affiliate accounts"actions={
          <div className="flex gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert("[Mock] Invite Portal User")}>Invite User</button>
            <button className="rtm-btn-secondary text-sm"onClick={() => toggle("portalAccess")}>
              {activeSection === "portalAccess"? "Collapse": "Expand"}
            </button>
          </div>
        }
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            { label: "Active", count: PORTAL_USERS.filter((p) => p.status === "Active").length, variant: "success"as const },
            { label: "Invited", count: PORTAL_USERS.filter((p) => p.status === "Invited").length, variant: "info"as const },
            { label: "Disabled", count: PORTAL_USERS.filter((p) => p.status === "Disabled").length, variant: "neutral"as const },
          ].map(({ label, count, variant }) => (
            <div key={label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
              <StatusBadge variant={variant} label={label} size="sm"/>
              <span className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{count}</span>
            </div>
          ))}
        </div>
        {activeSection === "portalAccess"? (
          <>
            <DataTable columns={portalUsersColumns} data={PORTAL_USERS} />
            <div className="flex flex-wrap gap-2 pt-3">
              {["Reset All Access", "Disable Inactive", "Bulk Invite", "Export Portal Users"].map((action) => (
                <button key={action} className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}} onClick={() => alert(`[Mock] ${action}`)}>
                  {action}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>
            {PORTAL_USERS.length} portal users · {PORTAL_USERS.filter((p) => p.status === "Active").length} active · Click Expand to manage
          </p>
        )}
      </SectionWrapper>

      {/*  Payout Management  */}
      <SectionWrapper
        title="Payout Management"description="Review pending commissions and record affiliate payouts"actions={
          <div className="flex gap-2">
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0"}} onClick={() => alert("[Mock] Process Bulk Payout")}>Process Payouts</button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Ready to Pay", value: `$${COMMISSIONS.filter((c) => c.status === "Approved").reduce((s, c) => { const n = parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "")); return s + (isNaN(n) ? 0 : n); }, 0).toLocaleString()}`, color: "#059669", desc: "Approved commissions"},
            { label: "Awaiting Approval", value: `$${COMMISSIONS.filter((c) => c.status === "Pending").reduce((s, c) => { const n = parseFloat(String(c.commissionAmount).replace(/[^0-9.]/g, "")); return s + (isNaN(n) ? 0 : n); }, 0).toLocaleString()}`, color: "#D97706", desc: "Pending review"},
            { label: "Total Paid YTD", value: `$${Math.round(paidCommissionsTotal).toLocaleString()}`, color: "#2563EB", desc: "Paid commissions total"},
          ].map(({ label, value, color, desc }) => (
            <div key={label} className="rounded-xl border p-4"style={{ background: `${color}08`, borderColor: `${color}25` }}>
              <p className="text-2xl font-bold"style={{ color }}>{value}</p>
              <p className="text-xs font-semibold mt-0.5"style={{ color: "var(--rtm-text-primary)"}}>{label}</p>
              <p className="text-[10px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{desc}</p>
            </div>
          ))}
        </div>
        <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border)"}}>
                {["Affiliate", "Commission Model", "Owed", "Paid", "Status", "Action"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AFFILIATES.filter((a) => a.status === "Active"&& parseFloat(String(a.commissionOwed).replace(/[^0-9.]/g, "")) > 0).map((aff, i) => (
                <tr key={aff.id} style={{ background: i % 2 === 0 ? "var(--rtm-surface)": "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)"}}>
                  <td className="px-4 py-3 text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{aff.name}</td>
                  <td className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{aff.commissionModel}</td>
                  <td className="px-4 py-3 text-xs font-bold"style={{ color: "#D97706"}}>{aff.commissionOwed}</td>
                  <td className="px-4 py-3 text-xs font-semibold"style={{ color: "#059669"}}>{aff.commissionPaid}</td>
                  <td className="px-4 py-3"><StatusBadge variant="pending"label="Pending"size="sm"/></td>
                  <td className="px-4 py-3">
                    <button className="text-xs font-semibold px-3 py-1 rounded border"style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0"}} onClick={() => alert(`[Mock] Record Payment: ${aff.name}`)}>Pay Now</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionWrapper>

      {/*  Task Integration  */}
      <SectionWrapper
        title="Task Integration"description="Create and manage affiliate-related tasks linked to /tasks"actions={
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A"}} onClick={() => alert("[Mock] View All Tasks → /tasks")}>View Tasks →</button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { title: "Affiliate Follow-Up", desc: "Sarah Chen — Commission review overdue", dueDate: "Jun 5, 2025", priority: "High", assigned: "Jordan M.", color: "#DC2626"},
            { title: "Commission Review", desc: "Mendez & Assoc. — Q2 tiered commission calculation", dueDate: "Jun 10, 2025", priority: "Medium", assigned: "Sarah K.", color: "#D97706"},
            { title: "Payout Approval", desc: "Batch payout — 3 approved commissions pending", dueDate: "Jun 15, 2025", priority: "High", assigned: "Admin", color: "#DC2626"},
            { title: "Portal Access Setup", desc: "Brandon Hughes — New partner portal onboarding", dueDate: "Jun 8, 2025", priority: "Medium", assigned: "Mike T.", color: "#D97706"},
            { title: "Affiliate Onboarding", desc: "Linda Zhao — Complete affiliate agreement + setup", dueDate: "Jun 12, 2025", priority: "Low", assigned: "Sarah K.", color: "#059669"},
          ].map((task) => (
            <div key={task.title} className="rounded-xl border p-4 flex items-start justify-between gap-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
              <div className="min-w-0">
                <p className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{task.title}</p>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{task.desc}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"style={{ background: `${task.color}12`, color: task.color }}>{task.priority}</span>
                  <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>Due {task.dueDate} · {task.assigned}</span>
                </div>
              </div>
              <button className="text-xs font-semibold px-2 py-1 rounded border flex-shrink-0"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}} onClick={() => alert(`[Mock] View Task: ${task.title}`)}>
                View
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-3">
          <button className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all"style={{ background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A"}} onClick={() => alert("[Mock] Create Task → /tasks")}>
             Create Task
          </button>
          <button className="text-sm font-semibold px-4 py-2 rounded-lg border transition-all"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}} onClick={() => alert("[Mock] Navigate → /tasks")}>
            View All Tasks →
          </button>
        </div>
      </SectionWrapper>

      {/*  Notification Integration  */}
      <SectionWrapper
        title="Notification Center"description="Recent affiliate-related notifications and alerts linked to /notifications"actions={
          <button className="text-xs font-semibold px-3 py-1.5 rounded-lg border"style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE"}} onClick={() => alert("[Mock] View All → /notifications")}>View All →</button>
        }
      >
        <div className="space-y-2">
          {[
            { icon: "", title: "New Referral Submitted", desc: "Sarah Chen referred Harbor HVAC — review pending", time: "2 hours ago", color: "#2563EB", unread: true },
            { icon: "", title: "Commission Approval Needed", desc: "Bay Area Dental — $1,260 commission awaiting approval", time: "4 hours ago", color: "#D97706", unread: true },
            { icon: "", title: "Affiliate Portal Activated", desc: "Monica Patel completed portal setup", time: "Yesterday", color: "#059669", unread: false },
            { icon: "", title: "Payout Due", desc: "Monthly payout cycle — 3 affiliates ready for payment", time: "Jun 12, 2025", color: "#7C3AED", unread: true },
            { icon: "", title: "New Affiliate Application", desc: "Brandon Hughes — Hughes Dental Network submitted application", time: "May 29, 2025", color: "#0891B2", unread: false },
          ].map((notif) => (
            <div key={notif.title} className="flex items-start gap-3 px-4 py-3 rounded-xl border"style={{ background: notif.unread ? `${notif.color}05` : "var(--rtm-surface)", borderColor: notif.unread ? `${notif.color}25` : "var(--rtm-border)"}}>
              <span className="text-lg flex-shrink-0">{notif.icon}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{notif.title}</p>
                  {notif.unread && <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"style={{ background: notif.color }} />}
                </div>
                <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{notif.desc}</p>
              </div>
              <span className="text-[10px] flex-shrink-0"style={{ color: "var(--rtm-text-muted)"}}>{notif.time}</span>
            </div>
          ))}
        </div>
      </SectionWrapper>

      {/*  Affiliate Profile Drawer  */}
      <AffiliateDrawer
        affiliate={selectedAffiliate}
        onClose={() => setSelectedAffiliate(null)}
      />
    </div>
  );
}
