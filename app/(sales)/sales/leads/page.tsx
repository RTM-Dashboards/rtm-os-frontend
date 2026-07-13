"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { KpiCard } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";
import { CreateOpportunityModal } from "@/components/sales/opportunity/CreateOpportunityModal";
import type { OpportunityRecord } from "@/lib/sales/types";
import { useWidgetPreferences } from "@/components/sales/widgets/useWidgetPreferences";
import { CustomizeViewModal } from "@/components/sales/widgets/CustomizeViewModal";

const workspace = getWorkspace("sales")!;

//  Types ─────────────────────────────────────────────────────────────────────

type LeadStage =
  | "New Lead"| "Contact Attempted"| "Contacted"| "Discovery Scheduled"| "Discovery Complete"| "Qualified"| "Disqualified";

type GHLSyncStatus = "Synced"| "Pending Sync"| "Sync Failed"| "Manual Override";

type OpportunityReadiness =
  | "Not Ready"| "Discovery Complete"| "Budget Discussed"| "Decision Maker Identified"| "Business Need Identified"| "Qualified"| "Ready For Opportunity";

type LeadSource =
  | "Website"| "Google Ads"| "Meta Ads"| "GBP"| "LSA"| "Referral"| "Affiliate"| "Partner"| "Direct"| "Outbound";

interface Lead {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  ghlContactId: string;
  ghlAssignedUser: string;
  ghlSource: string;
  ghlCreatedDate: string;
  ghlLastActivityDate: string;
  ghlContactTags: string[];
  ghlContactStatus: string;
  ghlSyncStatus: GHLSyncStatus;
  leadSource: LeadSource;
  assignedRep: string;
  stage: LeadStage;
  opportunityReadiness: OpportunityReadiness;
  discoveryScheduled: boolean;
  discoveryDate: string;
  discoveryNotes: string;
  businessGoals: string[];
  painPoints: string[];
  requestedServices: string[];
  budget: "High"| "Medium"| "Low"| "Unknown";
  authority: "Decision Maker"| "Influencer"| "Unknown";
  need: "High"| "Medium"| "Low";
  timeline: "Immediate"| "1-3 months"| "3-6 months"| "6+ months";
  estimatedValue: number;
  affiliateName: string;
  createdDate: string;
  lastActivity: string;
  notes: string;
  // Persisted overlay fields
  disqualified?: boolean;
  disqualifiedReason?: string;
}

// LeadStatusRecord mirrors the API shape
interface LeadStatusRecord {
  leadId: string;
  stage?: string;
  assignedRep?: string;
  discoveryScheduled?: boolean;
  discoveryDate?: string;
  discoveryNotes?: string;
  notes?: string;
  disqualified?: boolean;
  disqualifiedReason?: string;
  name?: string;
  businessName?: string;
  industry?: string;
  leadSource?: string;
  updatedAt: string;
}

//  Mock Data ──────────────────────────────────────────────────────────────────

const LEADS: Lead[] = [
  {
    id: "L001", name: "Marcus Webb", businessName: "Summit Landscaping", industry: "Landscaping",
    website: "summitlandscaping.com", email: "marcus@summitlandscaping.com", phone: "(512) 555-0101",
    location: "Austin, TX",
    ghlContactId: "GHL-CON-0001", ghlAssignedUser: "Jordan M.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-12-01", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Landscaping", "Affiliate", "Austin"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Jordan M.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-10",
    discoveryNotes: "Owner is motivated, has budget, wants full SEO + GBP package.",
    businessGoals: ["Increase local leads by 40%", "Dominate Google Maps in Austin"],
    painPoints: ["No online visibility", "Losing to competitors on Google"],
    requestedServices: ["SEO", "GBP", "Reporting"],
    budget: "Medium", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 2400, affiliateName: "Brandon Ellis",
    createdDate: "2024-12-01", lastActivity: "Today",
    notes: "Very engaged, ready to move forward quickly.",
  },
  {
    id: "L002", name: "Priya Sharma", businessName: "Blue Ridge Plumbing", industry: "Plumbing",
    website: "blueridgeplumbing.com", email: "priya@blueridgeplumbing.com", phone: "(303) 555-0202",
    location: "Denver, CO",
    ghlContactId: "GHL-CON-0002", ghlAssignedUser: "Sarah K.", ghlSource: "Website",
    ghlCreatedDate: "2024-12-05", ghlLastActivityDate: "2024-12-16", ghlContactTags: ["Plumbing", "Denver"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Website", assignedRep: "Sarah K.", stage: "Discovery Scheduled",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: true, discoveryDate: "2024-12-20",
    discoveryNotes: "",
    businessGoals: ["More emergency calls", "Rank #1 for Denver plumber"],
    painPoints: ["Low Google ranking", "No PPC experience"],
    requestedServices: ["SEO", "PPC", "GBP"],
    budget: "Medium", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 1800, affiliateName: "—",
    createdDate: "2024-12-05", lastActivity: "Yesterday",
    notes: "Referred by website contact form.",
  },
  {
    id: "L003", name: "Derek Holt", businessName: "Harbor Auto Group", industry: "Automotive",
    website: "harborautogroup.com", email: "derek@harborautogroup.com", phone: "(619) 555-0303",
    location: "San Diego, CA",
    ghlContactId: "GHL-CON-0003", ghlAssignedUser: "Mike T.", ghlSource: "Outbound",
    ghlCreatedDate: "2024-11-15", ghlLastActivityDate: "2024-12-15", ghlContactTags: ["Automotive", "High Value", "San Diego"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Outbound", assignedRep: "Mike T.", stage: "Discovery Complete",
    opportunityReadiness: "Business Need Identified",
    discoveryScheduled: true, discoveryDate: "2024-11-28",
    discoveryNotes: "Large dealership group. Wants PPC, Meta, and full reporting stack.",
    businessGoals: ["Drive 200+ leads/mo from digital", "Beat Toyota dealership on Google"],
    painPoints: ["Wasted ad spend", "No attribution", "Poor Meta ROI"],
    requestedServices: ["PPC", "Meta Ads", "Reporting", "SEO"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 5000, affiliateName: "—",
    createdDate: "2024-11-15", lastActivity: "2 days ago",
    notes: "High value deal. Discovery complete. Needs qualification.",
  },
  {
    id: "L004", name: "Tanya Okafor", businessName: "Cascade Pest Control", industry: "Pest Control",
    website: "cascadepest.com", email: "tanya@cascadepest.com", phone: "(425) 555-0404",
    location: "Seattle, WA",
    ghlContactId: "GHL-CON-0004", ghlAssignedUser: "Alex R.", ghlSource: "Partner",
    ghlCreatedDate: "2024-12-08", ghlLastActivityDate: "2024-12-14", ghlContactTags: ["Pest Control", "Partner", "Seattle"],
    ghlContactStatus: "Active", ghlSyncStatus: "Pending Sync",
    leadSource: "Partner", assignedRep: "Alex R.", stage: "Discovery Scheduled",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: true, discoveryDate: "2024-12-22",
    discoveryNotes: "",
    businessGoals: ["Grow commercial flooring contracts", "Rank for flooring install near Seattle"],
    painPoints: ["Inconsistent lead flow", "Too dependent on referrals"],
    requestedServices: ["SEO", "Web"],
    budget: "Medium", authority: "Influencer", need: "Medium", timeline: "3-6 months",
    estimatedValue: 3200, affiliateName: "—",
    createdDate: "2024-12-08", lastActivity: "3 days ago",
    notes: "Partner referral via BuildRight network.",
  },
  {
    id: "L005", name: "Lucia Vega", businessName: "Metro Dental Group", industry: "Dental",
    website: "metrodentalgroup.com", email: "lvega@metrodentalgroup.com", phone: "(312) 555-0505",
    location: "Chicago, IL",
    ghlContactId: "GHL-CON-0005", ghlAssignedUser: "Jordan M.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-11-28", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Dental", "Affiliate", "Chicago", "Multi-Location"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Jordan M.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-08",
    discoveryNotes: "3-location dental group. Strong budget. Wants SEO + GBP + PPC.",
    businessGoals: ["Fill schedule for all 3 locations", "Rank top 3 in Chicago dental"],
    painPoints: ["Low Google reviews", "No organic visibility"],
    requestedServices: ["SEO", "GBP", "PPC", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 4500, affiliateName: "Maria Santos",
    createdDate: "2024-11-28", lastActivity: "Today",
    notes: "Affiliate referral from Maria Santos. Hot lead.",
  },
  {
    id: "L006", name: "Brent Calloway", businessName: "Sunstate Solar", industry: "Solar",
    website: "sunstatesolar.com", email: "brent@sunstatesolar.com", phone: "(480) 555-0606",
    location: "Phoenix, AZ",
    ghlContactId: "GHL-CON-0006", ghlAssignedUser: "Sarah K.", ghlSource: "Google Ads",
    ghlCreatedDate: "2024-11-01", ghlLastActivityDate: "2024-12-10", ghlContactTags: ["Solar", "High Score", "Phoenix"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Google Ads", assignedRep: "Sarah K.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-11-20",
    discoveryNotes: "Rapid growth company. Wants LSA + PPC + SEO.",
    businessGoals: ["10x lead volume", "Expand to Tucson market"],
    painPoints: ["Too dependent on Google Ads", "No SEO foundation"],
    requestedServices: ["LSA", "PPC", "SEO", "GBP"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 6000, affiliateName: "—",
    createdDate: "2024-11-01", lastActivity: "1 week ago",
    notes: "Moving to qualified. All readiness criteria met.",
  },
  {
    id: "L007", name: "Grace Lundberg", businessName: "Green Valley Pools", industry: "Pool & Spa",
    website: "greenvalleypools.com", email: "grace@greenvalleypools.com", phone: "(602) 555-0707",
    location: "Scottsdale, AZ",
    ghlContactId: "GHL-CON-0007", ghlAssignedUser: "Alex R.", ghlSource: "Referral",
    ghlCreatedDate: "2024-12-10", ghlLastActivityDate: "2024-12-13", ghlContactTags: ["Pool", "Seasonal", "Scottsdale"],
    ghlContactStatus: "Active", ghlSyncStatus: "Pending Sync",
    leadSource: "Referral", assignedRep: "Alex R.", stage: "Discovery Scheduled",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: true, discoveryDate: "2024-12-19",
    discoveryNotes: "",
    businessGoals: ["Book summer installs 6 months out", "Rank for pool installation Phoenix"],
    painPoints: ["Seasonal business", "No digital presence"],
    requestedServices: ["SEO", "GBP"],
    budget: "Low", authority: "Decision Maker", need: "Medium", timeline: "3-6 months",
    estimatedValue: 2000, affiliateName: "—",
    createdDate: "2024-12-10", lastActivity: "4 days ago",
    notes: "Client referral from Summit Landscaping.",
  },
  {
    id: "L008", name: "Aaron Park", businessName: "Apex Dental Partners", industry: "Dental",
    website: "apexdentalpartners.com", email: "apark@apexdental.com", phone: "(415) 555-0808",
    location: "San Francisco, CA",
    ghlContactId: "GHL-CON-0008", ghlAssignedUser: "Mike T.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-11-20", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["DSO", "Affiliate", "High Value", "Bay Area"],
    ghlContactStatus: "Active", ghlSyncStatus: "Sync Failed",
    leadSource: "Affiliate", assignedRep: "Mike T.", stage: "Discovery Complete",
    opportunityReadiness: "Qualified",
    discoveryScheduled: true, discoveryDate: "2024-12-05",
    discoveryNotes: "DSO with 7 locations. Massive opportunity. Full marketing stack.",
    businessGoals: ["Fill 7 offices to capacity", "Dominate Bay Area dental market"],
    painPoints: ["Fragmented marketing across locations", "No centralized reporting"],
    requestedServices: ["SEO", "GBP", "PPC", "Meta Ads", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 8000, affiliateName: "Tyler Nguyen",
    createdDate: "2024-11-20", lastActivity: "Today",
    notes: "Tyler Nguyen affiliate. Highest value lead. GHL sync error — needs review.",
  },
  {
    id: "L009", name: "Amber Chen", businessName: "Coastal Wellness Spa", industry: "Health & Wellness",
    website: "coastalwellnessspa.com", email: "amber@coastalwellness.com", phone: "(858) 555-0909",
    location: "San Diego, CA",
    ghlContactId: "GHL-CON-0009", ghlAssignedUser: "Jordan M.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-11-18", ghlLastActivityDate: "2024-12-14", ghlContactTags: ["Wellness", "Affiliate", "San Diego"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Jordan M.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-11-30",
    discoveryNotes: "Premium spa. Wants Meta Ads + SEO. Strong budget.",
    businessGoals: ["Fill appointment book 4 weeks out", "Build Instagram following"],
    painPoints: ["Slow weekdays", "No Meta strategy"],
    requestedServices: ["Meta Ads", "SEO", "Creative"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 3800, affiliateName: "Lisa Park",
    createdDate: "2024-11-18", lastActivity: "3 days ago",
    notes: "Lisa Park referral. All readiness criteria met.",
  },
  {
    id: "L010", name: "Carlos Rivera", businessName: "Ridgeline Dentistry", industry: "Dental",
    website: "ridgelinedentistry.com", email: "crivera@ridgelinedentistry.com", phone: "(720) 555-1010",
    location: "Boulder, CO",
    ghlContactId: "GHL-CON-0010", ghlAssignedUser: "Sarah K.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-12-07", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Dental", "Affiliate", "Boulder"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Discovery Scheduled",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: true, discoveryDate: "2024-12-21",
    discoveryNotes: "",
    businessGoals: ["Grow new patient count by 30%", "Rank top 3 in Boulder dental"],
    painPoints: ["Low online reviews", "Minimal SEO"],
    requestedServices: ["SEO", "GBP", "Reporting"],
    budget: "Medium", authority: "Decision Maker", need: "Medium", timeline: "1-3 months",
    estimatedValue: 2200, affiliateName: "Carlos Reyes",
    createdDate: "2024-12-07", lastActivity: "Today",
    notes: "Carlos Reyes affiliate. Needs discovery call.",
  },
  {
    id: "L011", name: "Finn O'Brien", businessName: "Morrison HVAC and Cooling", industry: "HVAC",
    website: "morrisonhvaccooling.com", email: "finn@morrisonhvac.com", phone: "(617) 555-1111",
    location: "Boston, MA",
    ghlContactId: "GHL-CON-0011", ghlAssignedUser: "Alex R.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-12-12", ghlLastActivityDate: "2024-12-16", ghlContactTags: ["HVAC", "Boston", "Meta"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Meta Ads", assignedRep: "Alex R.", stage: "Contacted",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Grow gym membership by 50%", "Build local brand awareness"],
    painPoints: ["Low membership signups", "No digital ads"],
    requestedServices: ["Meta Ads", "SEO"],
    budget: "Low", authority: "Decision Maker", need: "Medium", timeline: "1-3 months",
    estimatedValue: 1500, affiliateName: "—",
    createdDate: "2024-12-12", lastActivity: "Yesterday",
    notes: "Meta Ads inbound. Initial contact made.",
  },
  {
    id: "L012", name: "Natasha Brown", businessName: "Silverstone Roofing LLC", industry: "Roofing",
    website: "silverstroneroofing.com", email: "nbrown@silverstroneroofing.com", phone: "(213) 555-1212",
    location: "Los Angeles, CA",
    ghlContactId: "GHL-CON-0012", ghlAssignedUser: "Mike T.", ghlSource: "LSA",
    ghlCreatedDate: "2024-11-25", ghlLastActivityDate: "2024-12-15", ghlContactTags: ["Roofing", "LSA", "Los Angeles", "High Budget"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "LSA", assignedRep: "Mike T.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-02",
    discoveryNotes: "Roofing contractor. Wants LSA + PPC domination. Ready to move.",
    businessGoals: ["Dominate LSA for roofing in LA", "50+ inbound calls/mo"],
    painPoints: ["High cost per lead", "Google LSA not optimized"],
    requestedServices: ["LSA", "PPC", "GBP"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 4200, affiliateName: "—",
    createdDate: "2024-11-25", lastActivity: "2 days ago",
    notes: "LSA inbound. Strong budget. All readiness criteria met.",
  },
  {
    id: "L013", name: "Ethan Kowalski", businessName: "Peak Performance Chiro", industry: "Chiropractic",
    website: "peakperformancechiro.com", email: "ethan@peakchiro.com", phone: "(503) 555-1313",
    location: "Portland, OR",
    ghlContactId: "GHL-CON-0013", ghlAssignedUser: "Jordan M.", ghlSource: "GBP",
    ghlCreatedDate: "2024-12-14", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Chiropractic", "GBP", "Portland"],
    ghlContactStatus: "New", ghlSyncStatus: "Pending Sync",
    leadSource: "GBP", assignedRep: "Jordan M.", stage: "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More new patient appointments"],
    painPoints: ["No digital marketing"],
    requestedServices: ["SEO", "GBP"],
    budget: "Low", authority: "Unknown", need: "Medium", timeline: "3-6 months",
    estimatedValue: 1200, affiliateName: "—",
    createdDate: "2024-12-14", lastActivity: "Today",
    notes: "GBP inquiry. Fresh lead.",
  },
  {
    id: "L014", name: "Rachel Torres", businessName: "Horizon Roofing Solutions", industry: "Roofing",
    website: "horizonroofing.com", email: "rtorres@horizonroofing.com", phone: "(214) 555-1414",
    location: "Dallas, TX",
    ghlContactId: "GHL-CON-0014", ghlAssignedUser: "Sarah K.", ghlSource: "Google Ads",
    ghlCreatedDate: "2024-11-10", ghlLastActivityDate: "2024-12-16", ghlContactTags: ["Roofing", "Google Ads", "Dallas", "Storm"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Google Ads", assignedRep: "Sarah K.", stage: "Discovery Complete",
    opportunityReadiness: "Budget Discussed",
    discoveryScheduled: true, discoveryDate: "2024-11-25",
    discoveryNotes: "Storm damage roofing. Seasonal spikes. Wants LSA + PPC domination.",
    businessGoals: ["100 calls in storm season", "Rank top LSA for Dallas roofing"],
    painPoints: ["Missed storm season opportunities", "Competitor outspending on LSA"],
    requestedServices: ["LSA", "PPC", "GBP", "SEO"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 3600, affiliateName: "—",
    createdDate: "2024-11-10", lastActivity: "Yesterday",
    notes: "Strong Google Ads lead. Discovery done. Budget discussed.",
  },
  {
    id: "L015", name: "Jake Morrison", businessName: "Morrison HVAC & Cooling", industry: "HVAC",
    website: "morrisonhvac.com", email: "jake@morrisonhvac.com", phone: "(602) 555-1515",
    location: "Phoenix, AZ",
    ghlContactId: "GHL-CON-0015", ghlAssignedUser: "Alex R.", ghlSource: "Referral",
    ghlCreatedDate: "2024-12-01", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["HVAC", "Referral", "Phoenix"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Referral", assignedRep: "Alex R.", stage: "Discovery Complete",
    opportunityReadiness: "Business Need Identified",
    discoveryScheduled: true, discoveryDate: "2024-12-09",
    discoveryNotes: "Family-owned HVAC. Ready to scale. Wants SEO + GBP + PPC.",
    businessGoals: ["Rank #1 for AC repair Phoenix", "Book out install schedule 3 months ahead"],
    painPoints: ["Low Google ranking", "Competitor LSA domination"],
    requestedServices: ["SEO", "GBP", "PPC"],
    budget: "Medium", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 2800, affiliateName: "—",
    createdDate: "2024-12-01", lastActivity: "Today",
    notes: "Client referral. Discovery complete. Business need identified.",
  },
  {
    id: "L016", name: "Diana Pham", businessName: "Luxe Pool and Spa", industry: "Pool & Spa",
    website: "luxepoolandspa.com", email: "diana@luxepoolandspa.com", phone: "(310) 555-1616",
    location: "Beverly Hills, CA",
    ghlContactId: "GHL-CON-0016", ghlAssignedUser: "Mike T.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-11-08", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Pool & Spa", "High Value", "Beverly Hills", "Meta"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Meta Ads", assignedRep: "Mike T.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-11-22",
    discoveryNotes: "High-end pool and spa company. Wants Meta + SEO + GBP to drive installs.",
    businessGoals: ["Fill install schedule 8 weeks out", "Rank #1 for pool installation Beverly Hills"],
    painPoints: ["Inconsistent Meta Ads results", "No SEO strategy"],
    requestedServices: ["Meta Ads", "SEO", "GBP", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 7500, affiliateName: "—",
    createdDate: "2024-11-08", lastActivity: "Today",
    notes: "Premium deal. All readiness criteria met.",
  },
  {
    id: "L017", name: "Tom Nguyen", businessName: "Pacific Pest Control", industry: "Pest Control",
    website: "pacificpest.com", email: "tom@pacificpest.com", phone: "(206) 555-1717",
    location: "Seattle, WA",
    ghlContactId: "GHL-CON-0017", ghlAssignedUser: "Jordan M.", ghlSource: "Website",
    ghlCreatedDate: "2024-12-13", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Pest Control", "Seattle"],
    ghlContactStatus: "New", ghlSyncStatus: "Pending Sync",
    leadSource: "Website", assignedRep: "Jordan M.", stage: "Contact Attempted",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More recurring service accounts"],
    painPoints: ["No online presence"],
    requestedServices: ["SEO", "GBP"],
    budget: "Low", authority: "Unknown", need: "Low", timeline: "6+ months",
    estimatedValue: 900, affiliateName: "—",
    createdDate: "2024-12-13", lastActivity: "Today",
    notes: "Website form fill. Left voicemail.",
  },
  {
    id: "L018", name: "Victor Espinoza", businessName: "Elite Concrete & Masonry", industry: "Construction",
    website: "eliteconcrete.com", email: "victor@eliteconcrete.com", phone: "(702) 555-1919",
    location: "Las Vegas, NV",
    ghlContactId: "GHL-CON-0018", ghlAssignedUser: "Mike T.", ghlSource: "Outbound",
    ghlCreatedDate: "2024-12-09", ghlLastActivityDate: "2024-12-15", ghlContactTags: ["Construction", "Outbound", "Las Vegas"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Outbound", assignedRep: "Mike T.", stage: "Contacted",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More commercial contracts", "Build local brand"],
    painPoints: ["No online reviews", "No website SEO"],
    requestedServices: ["SEO", "Web", "GBP"],
    budget: "Medium", authority: "Decision Maker", need: "Medium", timeline: "3-6 months",
    estimatedValue: 2100, affiliateName: "—",
    createdDate: "2024-12-09", lastActivity: "2 days ago",
    notes: "Cold outbound. Interested but needs follow-up.",
  },
  {
    id: "L019", name: "Holly Jennings", businessName: "Harvest Landscaping", industry: "Landscaping",
    website: "harvestlandscaping.com", email: "holly@harvestlandscaping.com", phone: "(612) 555-2020",
    location: "Minneapolis, MN",
    ghlContactId: "GHL-CON-0019", ghlAssignedUser: "Alex R.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-12-15", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Landscaping", "Meta", "Minneapolis"],
    ghlContactStatus: "New", ghlSyncStatus: "Pending Sync",
    leadSource: "Meta Ads", assignedRep: "Alex R.", stage: "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Grow seasonal residential accounts"],
    painPoints: ["No digital presence"],
    requestedServices: ["SEO", "GBP"],
    budget: "Low", authority: "Decision Maker", need: "Medium", timeline: "3-6 months",
    estimatedValue: 1400, affiliateName: "—",
    createdDate: "2024-12-15", lastActivity: "Today",
    notes: "Meta Ads form fill. Needs initial call.",
  },
  {
    id: "L020", name: "Leila Hassan", businessName: "NovaCare Pest Control", industry: "Pest Control",
    website: "novacarepest.com", email: "lhassan@novacarepest.com", phone: "(404) 555-2222",
    location: "Atlanta, GA",
    ghlContactId: "GHL-CON-0020", ghlAssignedUser: "Sarah K.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-11-29", ghlLastActivityDate: "2024-12-14", ghlContactTags: ["Pest Control", "Affiliate", "Atlanta", "Multi-Location"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-06",
    discoveryNotes: "Multi-location pest control. Strong budget. Wants SEO + GBP package.",
    businessGoals: ["Grow recurring service accounts across 4 locations", "Rank top 5 in Atlanta pest control"],
    painPoints: ["Relying on word of mouth", "Low digital presence"],
    requestedServices: ["SEO", "GBP", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 3300, affiliateName: "Kenji Yamamoto",
    createdDate: "2024-11-29", lastActivity: "3 days ago",
    notes: "Kenji Yamamoto affiliate. Strong qualification.",
  },
  {
    id: "L021", name: "Charlotte Evans", businessName: "Serenity Home Health", industry: "Home Health Care",
    website: "serenityhomehealth.com", email: "charlotte@serenityhh.com", phone: "(757) 555-4444",
    location: "Virginia Beach, VA",
    ghlContactId: "GHL-CON-0021", ghlAssignedUser: "Alex R.", ghlSource: "Referral",
    ghlCreatedDate: "2024-11-27", ghlLastActivityDate: "2024-12-15", ghlContactTags: ["Home Health", "Referral", "Virginia Beach"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Referral", assignedRep: "Alex R.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-05",
    discoveryNotes: "Home health agency serving seniors. Wants SEO + GBP to attract family inquiries.",
    businessGoals: ["100+ family inquiries per month", "Rank for in-home care in Hampton Roads"],
    painPoints: ["No digital presence", "Losing referrals to larger agencies"],
    requestedServices: ["SEO", "GBP", "Web", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 3800, affiliateName: "—",
    createdDate: "2024-11-27", lastActivity: "2 days ago",
    notes: "Physician referral. Qualified. Ready for opportunity.",
  },
  {
    id: "L022", name: "Walter Huang", businessName: "Pacific Plumbing Co.", industry: "Plumbing",
    website: "pacificplumbingco.com", email: "walter@pacificplumbing.com", phone: "(206) 555-3333",
    location: "Bellevue, WA",
    ghlContactId: "GHL-CON-0022", ghlAssignedUser: "Jordan M.", ghlSource: "Partner",
    ghlCreatedDate: "2024-11-28", ghlLastActivityDate: "2024-12-15", ghlContactTags: ["Plumbing", "Partner", "Bellevue", "High Value"],
    ghlContactStatus: "Active", ghlSyncStatus: "Manual Override",
    leadSource: "Partner", assignedRep: "Jordan M.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-04",
    discoveryNotes: "Full-service plumbing company. Wants SEO + LSA + GBP. Strong pipeline.",
    businessGoals: ["Rank for plumber near Bellevue", "Drive emergency call volume"],
    painPoints: ["Competitor LSA domination", "No organic SEO"],
    requestedServices: ["SEO", "LSA", "GBP"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 4800, affiliateName: "—",
    createdDate: "2024-11-28", lastActivity: "2 days ago",
    notes: "Partner referral. Strong qualification. Manual override on GHL sync.",
  },
  {
    id: "L023", name: "Bradley Scott", businessName: "Atlas Electrical Services", industry: "Electrical",
    website: "atlaselectric.com", email: "brad@atlaselectric.com", phone: "(801) 555-2323",
    location: "Salt Lake City, UT",
    ghlContactId: "GHL-CON-0023", ghlAssignedUser: "Mike T.", ghlSource: "LSA",
    ghlCreatedDate: "2024-11-26", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Electrical", "LSA", "Salt Lake City"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "LSA", assignedRep: "Mike T.", stage: "Discovery Complete",
    opportunityReadiness: "Decision Maker Identified",
    discoveryScheduled: true, discoveryDate: "2024-12-03",
    discoveryNotes: "Master electrician. Wants LSA + PPC. Competitor already running LSA.",
    businessGoals: ["Top LSA ranking in SLC", "Emergency call volume"],
    painPoints: ["Competitor dominance on LSA"],
    requestedServices: ["LSA", "PPC", "GBP"],
    budget: "Medium", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 2700, affiliateName: "—",
    createdDate: "2024-11-26", lastActivity: "Today",
    notes: "LSA inbound. Discovery done. Decision maker confirmed.",
  },
  {
    id: "L024", name: "Erica Walton", businessName: "NextGen HVAC Services", industry: "HVAC",
    website: "nextgenhvac.com", email: "erica@nextgenhvac.com", phone: "(615) 555-4848",
    location: "Nashville, TN",
    ghlContactId: "GHL-CON-0024", ghlAssignedUser: "Alex R.", ghlSource: "Google Ads",
    ghlCreatedDate: "2024-11-30", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["HVAC", "Google Ads", "Nashville"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Google Ads", assignedRep: "Alex R.", stage: "Discovery Complete",
    opportunityReadiness: "Budget Discussed",
    discoveryScheduled: true, discoveryDate: "2024-12-08",
    discoveryNotes: "Fast-growing HVAC company. Wants PPC + SEO + LSA to dominate Nashville.",
    businessGoals: ["Fill install and service schedule year-round", "Rank for HVAC Nashville"],
    painPoints: ["High Google Ads spend with poor ROI"],
    requestedServices: ["PPC", "SEO", "LSA", "GBP"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 4100, affiliateName: "—",
    createdDate: "2024-11-30", lastActivity: "Today",
    notes: "Google Ads inbound. Budget discussed. Hot lead.",
  },
  {
    id: "L025", name: "Paul Whitmore", businessName: "Keystone Roofing", industry: "Roofing",
    website: "keystoneroofing.com", email: "paul@keystoneroofing.com", phone: "(215) 555-2525",
    location: "Philadelphia, PA",
    ghlContactId: "GHL-CON-0025", ghlAssignedUser: "Jordan M.", ghlSource: "Outbound",
    ghlCreatedDate: "2024-11-20", ghlLastActivityDate: "2024-12-03", ghlContactTags: ["Roofing", "Outbound", "Disqualified"],
    ghlContactStatus: "Inactive", ghlSyncStatus: "Synced",
    leadSource: "Outbound", assignedRep: "Jordan M.", stage: "Disqualified",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: [], painPoints: [],
    requestedServices: [],
    budget: "Unknown", authority: "Unknown", need: "Low", timeline: "6+ months",
    estimatedValue: 0, affiliateName: "—",
    createdDate: "2024-11-20", lastActivity: "2 weeks ago",
    notes: "Not a fit. Already with large agency. Disqualified.",
    disqualified: true, disqualifiedReason: "Already with large agency",
  },
  {
    id: "L026", name: "Stephanie Lane", businessName: "GreenWave Lawn Care", industry: "Lawn Care",
    website: "greenwavecare.com", email: "slane@greenwave.com", phone: "(615) 555-4040",
    location: "Nashville, TN",
    ghlContactId: "GHL-CON-0026", ghlAssignedUser: "Alex R.", ghlSource: "Google Ads",
    ghlCreatedDate: "2024-12-03", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Lawn Care", "Google Ads", "Nashville"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Google Ads", assignedRep: "Alex R.", stage: "Discovery Complete",
    opportunityReadiness: "Business Need Identified",
    discoveryScheduled: true, discoveryDate: "2024-12-10",
    discoveryNotes: "Regional lawn care company. Wants to expand into Murfreesboro and Brentwood.",
    businessGoals: ["Expand to 3 new markets", "Rank for lawn care in Nashville suburbs"],
    painPoints: ["Limited Google Ads budget utilization", "No LSA"],
    requestedServices: ["LSA", "SEO", "GBP", "PPC"],
    budget: "Medium", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 2400, affiliateName: "—",
    createdDate: "2024-12-03", lastActivity: "Today",
    notes: "Google Ads inbound. Discovery complete. Business need confirmed.",
  },
  {
    id: "L027", name: "Patrick Moon", businessName: "MoonGuard Security Systems", industry: "Security",
    website: "moonguardsecurity.com", email: "patrick@moonguard.com", phone: "(512) 555-5151",
    location: "Austin, TX",
    ghlContactId: "GHL-CON-0027", ghlAssignedUser: "Mike T.", ghlSource: "Outbound",
    ghlCreatedDate: "2024-11-22", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Security", "Outbound", "Austin"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Outbound", assignedRep: "Mike T.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-01",
    discoveryNotes: "Commercial security installs. Wants PPC + SEO. Good pipeline potential.",
    businessGoals: ["100 new commercial accounts/year", "Rank for security systems Austin"],
    painPoints: ["Sales team fully manual", "No inbound leads"],
    requestedServices: ["PPC", "SEO", "GBP"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "1-3 months",
    estimatedValue: 3900, affiliateName: "—",
    createdDate: "2024-11-22", lastActivity: "Today",
    notes: "Cold outbound converted. Ready for opportunity.",
  },
  {
    id: "L028", name: "Kimberly Ross", businessName: "Rosewood Painting Co.", industry: "Painting",
    website: "rosewoodpainting.com", email: "kim@rosewoodpainting.com", phone: "(404) 555-5252",
    location: "Atlanta, GA",
    ghlContactId: "GHL-CON-0028", ghlAssignedUser: "Alex R.", ghlSource: "Website",
    ghlCreatedDate: "2024-12-15", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Painting", "Website", "Atlanta"],
    ghlContactStatus: "New", ghlSyncStatus: "Pending Sync",
    leadSource: "Website", assignedRep: "Alex R.", stage: "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Book more residential and commercial paint jobs"],
    painPoints: ["No online presence", "Dependent on word of mouth"],
    requestedServices: ["SEO", "GBP"],
    budget: "Medium", authority: "Decision Maker", need: "Medium", timeline: "3-6 months",
    estimatedValue: 1400, affiliateName: "—",
    createdDate: "2024-12-15", lastActivity: "Today",
    notes: "Website inquiry. First contact pending.",
  },
  {
    id: "L029", name: "Vivian Wu", businessName: "Harmony Home Services", industry: "Home Services",
    website: "harmonyhomeservices.com", email: "vivian@harmonyhomeservices.com", phone: "(408) 555-4646",
    location: "San Jose, CA",
    ghlContactId: "GHL-CON-0029", ghlAssignedUser: "Sarah K.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-11-14", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Home Services", "Affiliate", "San Jose", "Multi-Service"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-11-29",
    discoveryNotes: "Multi-service home services company. High-growth area. Wants SEO + GBP + PPC.",
    businessGoals: ["Grow service volume 40% in next 6 months", "Rank #1 for home services San Jose"],
    painPoints: ["Inconsistent lead flow", "No PPC strategy"],
    requestedServices: ["SEO", "GBP", "PPC", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 5200, affiliateName: "Kenji Yamamoto",
    createdDate: "2024-11-14", lastActivity: "Today",
    notes: "Kenji Yamamoto affiliate. Ready for opportunity.",
  },
  {
    id: "L030", name: "Ingrid Larsson", businessName: "Nordic Electrical", industry: "Electrical",
    website: "nordicelectrical.com", email: "ingrid@nordicelectrical.com", phone: "(612) 555-5050",
    location: "Minneapolis, MN",
    ghlContactId: "GHL-CON-0030", ghlAssignedUser: "Sarah K.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-12-11", ghlLastActivityDate: "2024-12-16", ghlContactTags: ["Electrical", "Meta", "Minneapolis"],
    ghlContactStatus: "Active", ghlSyncStatus: "Sync Failed",
    leadSource: "Meta Ads", assignedRep: "Sarah K.", stage: "Discovery Scheduled",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: true, discoveryDate: "2024-12-22",
    discoveryNotes: "",
    businessGoals: ["Book more residential electrical jobs", "Rank for electrician Minneapolis"],
    painPoints: ["No online presence", "Relying on word of mouth"],
    requestedServices: ["SEO", "GBP", "LSA"],
    budget: "Medium", authority: "Decision Maker", need: "Medium", timeline: "1-3 months",
    estimatedValue: 1800, affiliateName: "—",
    createdDate: "2024-12-11", lastActivity: "Yesterday",
    notes: "Meta form. Discovery next week. GHL sync error.",
  },
];

//  Merge helper — apply persisted overrides onto a Lead ─────────────────────

function applyOverride(lead: Lead, record: LeadStatusRecord | undefined): Lead {
  if (!record) return lead;
  return {
    ...lead,
    ...(record.stage              !== undefined ? { stage: record.stage as LeadStage }           : {}),
    ...(record.assignedRep        !== undefined ? { assignedRep: record.assignedRep }             : {}),
    ...(record.discoveryScheduled !== undefined ? { discoveryScheduled: record.discoveryScheduled } : {}),
    ...(record.discoveryDate      !== undefined ? { discoveryDate: record.discoveryDate }         : {}),
    ...(record.discoveryNotes     !== undefined ? { discoveryNotes: record.discoveryNotes }       : {}),
    ...(record.notes              !== undefined ? { notes: record.notes }                         : {}),
    ...(record.disqualified       !== undefined ? { disqualified: record.disqualified }           : {}),
    ...(record.disqualifiedReason !== undefined ? { disqualifiedReason: record.disqualifiedReason } : {}),
    ...(record.name               !== undefined ? { name: record.name }                           : {}),
    ...(record.businessName       !== undefined ? { businessName: record.businessName }           : {}),
    ...(record.industry           !== undefined ? { industry: record.industry }                   : {}),
    ...(record.leadSource         !== undefined ? { leadSource: record.leadSource as LeadSource } : {}),
  };
}

//  Stage Config ───────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<LeadStage, { color?: string; bg?: string; border: string; order: number }> = {
  "New Lead":            { color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", order: 0 },
  "Contact Attempted":   { color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", order: 1 },
  "Contacted":           { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", order: 2 },
  "Discovery Scheduled": { color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD", order: 3 },
  "Discovery Complete":  { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", order: 4 },
  "Qualified":           { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", order: 5 },
  "Disqualified":        { color: "#94A3B8", bg: "#F1F5F9", border: "#CBD5E1", order: 6 },
};

const GHL_SYNC_CONFIG: Record<GHLSyncStatus, { color?: string; bg?: string; icon?: string }> = {
  "Synced":          { color: "#059669", bg: "#ECFDF5", icon: "✓"},
  "Pending Sync":    { color: "#D97706", bg: "#FFFBEB"},
  "Sync Failed":     { color: "#DC2626", bg: "#FEF2F2", icon: "✕"},
  "Manual Override": { color: "#7C3AED", bg: "#F5F3FF"},
};

const READINESS_CONFIG: Record<OpportunityReadiness, { color?: string; bg?: string; order: number }> = {
  "Not Ready":                { color: "#94A3B8", bg: "#F1F5F9", order: 0 },
  "Discovery Complete":       { color: "#0284C7", bg: "#F0F9FF", order: 1 },
  "Budget Discussed":         { color: "#0891B2", bg: "#ECFEFF", order: 2 },
  "Decision Maker Identified":{ color: "#7C3AED", bg: "#F5F3FF", order: 3 },
  "Business Need Identified": { color: "#D97706", bg: "#FFFBEB", order: 4 },
  "Qualified":                { color: "#EA580C", bg: "#FFF7ED", order: 5 },
  "Ready For Opportunity":    { color: "#059669", bg: "#ECFDF5", order: 6 },
};

const SOURCE_COLORS: Record<string, string> = {
  Website: "#2563EB", "Google Ads": "#EA4335", "Meta Ads": "#1877F2", GBP: "#34A853",
  LSA: "#FBBC04", Referral: "#9333EA", Affiliate: "#059669", Partner: "#0891B2",
  Direct: "#64748B", Outbound: "#D97706",
};

const LEAD_STAGES: LeadStage[] = [
  "New Lead", "Contact Attempted", "Contacted",
  "Discovery Scheduled", "Discovery Complete", "Qualified", "Disqualified",
];

const SALES_REPS = ["Jordan M.", "Sarah K.", "Mike T.", "Alex R."];
const LEAD_SOURCE_OPTIONS: LeadSource[] = ["Website", "Google Ads", "Meta Ads", "GBP", "LSA", "Referral", "Affiliate", "Partner", "Direct", "Outbound"];

//  Helpers ────────────────────────────────────────────────────────────────────

function stageBadge(stage: LeadStage) {
  const c = STAGE_CONFIG[stage];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border"
      style={{ background: c.bg, color: c.color, borderColor: c.border }}>
      {stage}
    </span>
  );
}

function ghlSyncBadge(status: GHLSyncStatus) {
  const c = GHL_SYNC_CONFIG[status];
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}>
      {c.icon} {status}
    </span>
  );
}

function readinessBadge(readiness: OpportunityReadiness) {
  const c = READINESS_CONFIG[readiness];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold"
      style={{ background: c.bg, color: c.color }}>
      {readiness}
    </span>
  );
}

function sourceBadge(source: string) {
  const color = SOURCE_COLORS[source] ?? "#64748B";
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
      {source}
    </span>
  );
}

function fmt$(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;
}

//  Persistence helper ─────────────────────────────────────────────────────────

async function persistLeadStatus(leadId: string, patch: Partial<LeadStatusRecord>): Promise<void> {
  await fetch("/api/leads-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ leadId, ...patch }),
  });
}

//  Action Modals ──────────────────────────────────────────────────────────────

// Shared modal shell
function ModalShell({ title, subtitle, onClose, children, footer }: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(2px)" }}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>{title}</h2>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">{children}</div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          {footer}
        </div>
      </div>
    </div>
  );
}

// Edit Lead Modal
function EditLeadModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: (patch: Partial<Lead>) => void;
}) {
  const [name, setName] = useState(lead.name);
  const [businessName, setBusinessName] = useState(lead.businessName);
  const [industry, setIndustry] = useState(lead.industry);
  const [leadSource, setLeadSource] = useState<LeadSource>(lead.leadSource);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const patch = { name, businessName, industry, leadSource };
    await persistLeadStatus(lead.id, patch);
    onSave(patch);
    setSaving(false);
  }

  return (
    <ModalShell title="Edit Lead" subtitle={lead.businessName} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="rtm-btn-primary text-sm px-4 py-2 disabled:opacity-40">
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </>}>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Contact Name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Business Name</label>
        <input value={businessName} onChange={e => setBusinessName(e.target.value)} className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Industry</label>
        <input value={industry} onChange={e => setIndustry(e.target.value)} className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Lead Source</label>
        <select value={leadSource} onChange={e => setLeadSource(e.target.value as LeadSource)}
          className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
          {LEAD_SOURCE_OPTIONS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
    </ModalShell>
  );
}

// Assign Sales Rep Modal
function AssignRepModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: (rep: string) => void;
}) {
  const [rep, setRep] = useState(lead.assignedRep);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await persistLeadStatus(lead.id, { assignedRep: rep });
    onSave(rep);
    setSaving(false);
  }

  return (
    <ModalShell title="Assign Sales Rep" subtitle={lead.businessName} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="rtm-btn-primary text-sm px-4 py-2 disabled:opacity-40">
          {saving ? "Saving…" : "Assign Rep"}
        </button>
      </>}>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Currently Assigned</label>
        <p className="text-sm font-semibold mb-3" style={{ color: "var(--rtm-text-primary)" }}>{lead.assignedRep}</p>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Assign To</label>
        <div className="space-y-1.5">
          {SALES_REPS.map(r => (
            <button key={r} onClick={() => setRep(r)}
              className="w-full text-left px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors"
              style={{
                background: rep === r ? "#EFF6FF" : "var(--rtm-surface)",
                borderColor: rep === r ? "#2563EB" : "var(--rtm-border)",
                color: rep === r ? "#2563EB" : "var(--rtm-text-primary)",
              }}>
              {r} {r === lead.assignedRep ? <span className="text-[10px] font-normal text-slate-400">(current)</span> : ""}
            </button>
          ))}
        </div>
      </div>
    </ModalShell>
  );
}

// Schedule / Complete Discovery Modal
function ScheduleDiscoveryModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: (patch: { discoveryScheduled: boolean; discoveryDate: string; discoveryNotes: string }) => void;
}) {
  const [date, setDate] = useState(lead.discoveryDate || "");
  const [notes, setNotes] = useState(lead.discoveryNotes || "");
  const [complete, setComplete] = useState(lead.stage === "Discovery Complete");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const patch = {
      discoveryScheduled: true,
      discoveryDate: date,
      discoveryNotes: notes,
      ...(complete ? { stage: "Discovery Complete" as LeadStage } : { stage: "Discovery Scheduled" as LeadStage }),
    };
    await persistLeadStatus(lead.id, patch);
    onSave({ discoveryScheduled: true, discoveryDate: date, discoveryNotes: notes });
    setSaving(false);
  }

  const title = lead.discoveryScheduled ? "Update Discovery" : "Schedule Discovery";

  return (
    <ModalShell title={title} subtitle={lead.businessName} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !date} className="rtm-btn-primary text-sm px-4 py-2 disabled:opacity-40">
          {saving ? "Saving…" : title}
        </button>
      </>}>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Discovery Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Discovery Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Key insights from the discovery call..."
          className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none resize-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={complete} onChange={e => setComplete(e.target.checked)} />
        <span className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>Mark Discovery as Complete</span>
      </label>
    </ModalShell>
  );
}

// Move Stage Modal
function MoveStageModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: (stage: LeadStage) => void;
}) {
  const [stage, setStage] = useState<LeadStage>(lead.stage);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await persistLeadStatus(lead.id, { stage });
    onSave(stage);
    setSaving(false);
  }

  return (
    <ModalShell title="Move Stage" subtitle={lead.businessName} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving || stage === lead.stage}
          className="rtm-btn-primary text-sm px-4 py-2 disabled:opacity-40">
          {saving ? "Saving…" : "Move Stage"}
        </button>
      </>}>
      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Current: <strong>{lead.stage}</strong></p>
      <div className="space-y-1.5">
        {LEAD_STAGES.map(s => {
          const cfg = STAGE_CONFIG[s];
          return (
            <button key={s} onClick={() => setStage(s)}
              className="w-full text-left px-4 py-2.5 rounded-lg border text-sm font-semibold transition-colors"
              style={{
                background: stage === s ? cfg.bg : "var(--rtm-surface)",
                borderColor: stage === s ? cfg.color : "var(--rtm-border)",
                color: stage === s ? cfg.color : "var(--rtm-text-primary)",
              }}>
              {s} {s === lead.stage ? <span className="text-[10px] font-normal text-slate-400">(current)</span> : ""}
            </button>
          );
        })}
      </div>
    </ModalShell>
  );
}

// Add Note Modal
function AddNoteModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: (notes: string) => void;
}) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!note.trim()) return;
    setSaving(true);
    const timestamp = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    const appended = lead.notes
      ? `${lead.notes}\n[${timestamp}] ${note.trim()}`
      : `[${timestamp}] ${note.trim()}`;
    await persistLeadStatus(lead.id, { notes: appended });
    onSave(appended);
    setSaving(false);
  }

  return (
    <ModalShell title="Add Note" subtitle={lead.businessName} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving || !note.trim()} className="rtm-btn-primary text-sm px-4 py-2 disabled:opacity-40">
          {saving ? "Saving…" : "Add Note"}
        </button>
      </>}>
      {lead.notes && (
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Existing Notes</label>
          <div className="rounded-lg p-3 border text-xs whitespace-pre-wrap max-h-32 overflow-y-auto"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
            {lead.notes}
          </div>
        </div>
      )}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>New Note</label>
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={4}
          placeholder="Enter your note..."
          className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none resize-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
    </ModalShell>
  );
}

// Disqualify Modal
function DisqualifyModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: (reason: string) => void;
}) {
  const [reason, setReason] = useState(lead.disqualifiedReason || "");
  const [saving, setSaving] = useState(false);

  const REASONS = [
    "Already with another agency",
    "Budget too low",
    "Not a good fit",
    "No decision maker engagement",
    "Unreachable / ghosted",
    "Competitor selected",
    "Other",
  ];

  async function handleSave() {
    setSaving(true);
    await persistLeadStatus(lead.id, {
      stage: "Disqualified",
      disqualified: true,
      disqualifiedReason: reason || "Not specified",
    });
    onSave(reason || "Not specified");
    setSaving(false);
  }

  return (
    <ModalShell title="Disqualify Lead" subtitle={lead.businessName} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving}
          className="text-sm px-4 py-2 rounded-lg font-bold disabled:opacity-40"
          style={{ background: "#DC2626", color: "#fff" }}>
          {saving ? "Saving…" : "Disqualify Lead"}
        </button>
      </>}>
      <div className="rounded-lg p-4 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
        <p className="text-sm font-bold" style={{ color: "#DC2626" }}>⚠ This will move the lead to Disqualified stage.</p>
        <p className="text-xs mt-1" style={{ color: "#B91C1C" }}>This action is persisted but can be reversed via Move Stage.</p>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Disqualification Reason</label>
        <div className="space-y-1.5 mb-3">
          {REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              className="w-full text-left px-3 py-2 rounded-lg border text-xs font-semibold transition-colors"
              style={{
                background: reason === r ? "#FEF2F2" : "var(--rtm-surface)",
                borderColor: reason === r ? "#DC2626" : "var(--rtm-border)",
                color: reason === r ? "#DC2626" : "var(--rtm-text-primary)",
              }}>
              {r}
            </button>
          ))}
        </div>
        <input value={reason} onChange={e => setReason(e.target.value)}
          placeholder="Or type a custom reason..."
          className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
    </ModalShell>
  );
}

// Create Follow-Up Modal (creates a real engine task via /api/pending-sales-tasks)
function CreateFollowUpModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: () => void;
}) {
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  const defaultDate = `${tomorrow.getUTCFullYear()}-${String(tomorrow.getUTCMonth() + 1).padStart(2, "0")}-${String(tomorrow.getUTCDate()).padStart(2, "0")}`;

  const [title, setTitle] = useState(`Follow-Up: ${lead.businessName}`);
  const [dueDate, setDueDate] = useState(defaultDate);
  const [priority, setPriority] = useState<"Low" | "Medium" | "High" | "Critical">("High");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim() || !dueDate) { setError("Title and due date are required."); return; }
    setSaving(true);
    setError("");
    const task = {
      id: `lead-fu-${lead.id}-${Date.now()}`,
      title: title.trim(),
      client: lead.businessName,
      project: `Lead ${lead.id}`,
      department: "Sales",
      service: "Sales Follow-Up",
      source: "Manual Task" as const,
      assignee: lead.assignedRep,
      priority,
      dueDate,
      status: "Pending" as const,
      blocker: null,
      owner: lead.assignedRep,
      due: dueDate,
      blueprintSource: undefined,
      workflowSource: undefined,
      // Extra context carried in description-style fields
      ...(notes.trim() ? { blocker: notes.trim() } : {}),
    };
    try {
      const res = await fetch("/api/pending-sales-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error("API error");
      onSave();
    } catch {
      setError("Failed to create task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

  return (
    <ModalShell title="Create Follow-Up Task" subtitle={`${lead.businessName} · Assigned to ${lead.assignedRep}`} onClose={onClose}
      footer={<>
        <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="rtm-btn-primary text-sm px-4 py-2 disabled:opacity-40">
          {saving ? "Creating…" : "Create Task"}
        </button>
      </>}>
      {error && (
        <div className="rounded-lg p-3 border text-xs font-semibold" style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#DC2626" }}>{error}</div>
      )}
      <div className="rounded-lg p-3 border text-xs" style={{ background: "#F0FDF4", borderColor: "#A7F3D0", color: "#15803D" }}>
        ✓ This task will appear on the <strong>Sales Tasks</strong> page after creation.
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Task Title</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Priority</label>
          <select value={priority} onChange={e => setPriority(e.target.value as typeof priority)}
            className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
            {PRIORITIES.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Notes (optional)</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="What needs to happen on this follow-up?"
          className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none resize-none"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg p-2 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="font-bold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>Assigned To</p>
          <p style={{ color: "var(--rtm-text-primary)" }}>{lead.assignedRep}</p>
        </div>
        <div className="rounded-lg p-2 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <p className="font-bold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>Lead</p>
          <p style={{ color: "var(--rtm-text-primary)" }}>{lead.businessName}</p>
        </div>
      </div>
    </ModalShell>
  );
}

// Action modal union type
type ActiveModal =
  | { type: "editLead"; lead: Lead }
  | { type: "assignRep"; lead: Lead }
  | { type: "scheduleDiscovery"; lead: Lead }
  | { type: "moveStage"; lead: Lead }
  | { type: "addNote"; lead: Lead }
  | { type: "disqualify"; lead: Lead }
  | { type: "createFollowUp"; lead: Lead };

//  Drawer Component ───────────────────────────────────────────────────────────

function LeadDrawer({ lead, onClose, onAction, onCreateOpportunity }: {
  lead: Lead;
  onClose: () => void;
  onAction: (modal: ActiveModal) => void;
  onCreateOpportunity: (lead: Lead) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "ghl" | "qualification" | "discovery" | "readiness" | "affiliate" | "timeline"
  >("overview");

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "ghl" as const, label: "GHL Contact" },
    { key: "qualification" as const, label: "Qualification" },
    { key: "discovery" as const, label: "Discovery" },
    { key: "readiness" as const, label: "Opp Readiness" },
    { key: "affiliate" as const, label: "Affiliate" },
    { key: "timeline" as const, label: "Timeline" },
  ];

  const isReadyForOpportunity = lead.opportunityReadiness === "Ready For Opportunity";
  const isQualified = lead.stage === "Qualified";

  const readinessChecklist = [
    { label: "Discovery Complete", done: lead.opportunityReadiness !== "Not Ready" },
    { label: "Budget Discussed", done: lead.budget !== "Unknown" },
    { label: "Decision Maker Identified", done: lead.authority === "Decision Maker" },
    { label: "Business Need Identified", done: lead.need === "High" || lead.need === "Medium" },
    { label: "Lead Qualified", done: isQualified },
  ];

  const timeline = [
    { date: lead.ghlCreatedDate, event: "GHL Contact Created" },
    { date: lead.createdDate, event: "Lead Created in RTM" },
    { date: lead.createdDate, event: `Assigned to ${lead.assignedRep}` },
    ...(lead.discoveryDate ? [{ date: lead.discoveryDate, event: "Discovery Completed" }] : []),
    ...(isQualified ? [{ date: lead.lastActivity, event: "Lead Qualified" }] : []),
    ...(isReadyForOpportunity ? [{ date: lead.lastActivity, event: "Ready For Opportunity" }] : []),
    { date: lead.lastActivity, event: `Current Stage: ${lead.stage}` },
  ];

  const quickActions: { label: string; modal: ActiveModal["type"] }[] = [
    { label: "Assign Sales Rep", modal: "assignRep" },
    { label: "Schedule Discovery", modal: "scheduleDiscovery" },
    { label: "Create Follow-Up", modal: "createFollowUp" },
    { label: "Move Stage", modal: "moveStage" },
    { label: "Add Note", modal: "addNote" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[720px] h-full flex flex-col shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {stageBadge(lead.stage)}
              {ghlSyncBadge(lead.ghlSyncStatus)}
              {isReadyForOpportunity && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>
                  ✓ Ready For Opportunity
                </span>
              )}
              {lead.disqualified && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA" }}>
                  Disqualified{lead.disqualifiedReason ? `: ${lead.disqualifiedReason}` : ""}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold truncate" style={{ color: "var(--rtm-text-primary)" }}>{lead.businessName}</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>
              {lead.name} · {lead.industry} · {lead.location}
            </p>
            <p className="text-xs mt-0.5 font-mono" style={{ color: "var(--rtm-text-muted)" }}>
              GHL: {lead.ghlContactId}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            {isReadyForOpportunity && (
              <button onClick={() => onCreateOpportunity(lead)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold border"
                style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
                Create Opportunity →
              </button>
            )}
            <button onClick={() => onAction({ type: "editLead", lead })}
              className="rtm-btn-primary text-xs px-3 py-1.5">Edit Lead</button>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className="px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2"
              style={{
                borderBottomColor: activeTab === t.key ? workspace.accentColor : "transparent",
                color: activeTab === t.key ? workspace.accentColor : "var(--rtm-text-muted)",
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">

          {/* OVERVIEW */}
          {activeTab === "overview" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Lead Overview</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Lead Name", lead.name],
                    ["Business Name", lead.businessName],
                    ["Industry", lead.industry],
                    ["Website", lead.website],
                    ["Email", lead.email],
                    ["Phone", lead.phone],
                    ["Location", lead.location],
                    ["Lead Source", lead.leadSource],
                    ["Assigned Rep", lead.assignedRep],
                    ["Created Date", lead.createdDate],
                    ["Last Activity", lead.lastActivity],
                    ["Est. Monthly Value", `${fmt$(lead.estimatedValue)}/mo`],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg p-3 border"
                      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{k}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>{v}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Opportunity Readiness</h3>
                <div className="rounded-lg p-4 border flex items-center justify-between"
                  style={{ background: isReadyForOpportunity ? "#ECFDF5" : "var(--rtm-surface)", borderColor: isReadyForOpportunity ? "#A7F3D0" : "var(--rtm-border)" }}>
                  <div>
                    {readinessBadge(lead.opportunityReadiness)}
                    <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                      {isReadyForOpportunity ? "This lead is ready to become an opportunity." : "Complete discovery and qualification steps to advance."}
                    </p>
                  </div>
                  {isReadyForOpportunity && (
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <button onClick={() => onCreateOpportunity(lead)}
                        className="text-xs px-3 py-1.5 rounded-lg font-bold"
                        style={{ background: "#059669", color: "#fff" }}>
                        Create Opportunity
                      </button>
                      <Link href="/sales/pipeline"
                        className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
                        style={{ background: "#fff", color: "#059669", borderColor: "#A7F3D0" }}>
                        Open Pipeline →
                      </Link>
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map(a => (
                    <button key={a.label}
                      onClick={() => onAction({ type: a.modal, lead } as ActiveModal)}
                      className="rtm-btn-secondary text-xs px-3 py-1.5">{a.label}</button>
                  ))}
                  {isReadyForOpportunity && (
                    <button onClick={() => onCreateOpportunity(lead)}
                      className="text-xs px-3 py-1.5 rounded-lg font-bold inline-block"
                      style={{ background: workspace.accentColor, color: "#fff" }}>
                      Send To Pipeline →
                    </button>
                  )}
                </div>
              </section>
            </>
          )}

          {/* GHL CONTACT */}
          {activeTab === "ghl" && (
            <>
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>GHL Contact Details</h3>
                  {ghlSyncBadge(lead.ghlSyncStatus)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["GHL Contact ID", lead.ghlContactId],
                    ["Assigned User", lead.ghlAssignedUser],
                    ["Lead Source", lead.ghlSource],
                    ["Contact Status", lead.ghlContactStatus],
                    ["GHL Created Date", lead.ghlCreatedDate],
                    ["Last Activity", lead.ghlLastActivityDate],
                    ["Sync Status", lead.ghlSyncStatus],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg p-3 border"
                      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{k}</p>
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--rtm-text-primary)" }}>{v}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>GHL Contact Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.ghlContactTags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}>{tag}</span>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* QUALIFICATION */}
          {activeTab === "qualification" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>BANT Qualification</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Budget", value: lead.budget, icon: "💰", good: lead.budget === "High" || lead.budget === "Medium" },
                    { label: "Authority", value: lead.authority, good: lead.authority === "Decision Maker" },
                    { label: "Need", value: lead.need, icon: "🎯", good: lead.need === "High" },
                    { label: "Timeline", value: lead.timeline, icon: "⏰", good: lead.timeline === "Immediate" || lead.timeline === "1-3 months" },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg p-4 border"
                      style={{ background: item.good ? "#F0FDF4" : "#FEF2F2", borderColor: item.good ? "#A7F3D0" : "#FECACA" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: item.good ? "#15803D" : "#DC2626" }}>{item.label}</p>
                      <p className="text-sm font-bold" style={{ color: item.good ? "#15803D" : "#DC2626" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>
              {lead.requestedServices.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Requested Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {lead.requestedServices.map(s => (
                      <span key={s} className="text-xs px-2.5 py-1 rounded-full font-semibold border"
                        style={{ background: "#EFF6FF", color: "#2563EB", borderColor: "#BFDBFE" }}>{s}</span>
                    ))}
                  </div>
                </section>
              )}
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Estimated Monthly Value</h3>
                <div className="rounded-lg p-4 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  <p className="text-2xl font-bold" style={{ color: workspace.accentColor }}>
                    {fmt$(lead.estimatedValue)}<span className="text-sm font-normal text-slate-400">/mo</span>
                  </p>
                </div>
              </section>
            </>
          )}

          {/* DISCOVERY */}
          {activeTab === "discovery" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Discovery Management</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    ["Discovery Scheduled", lead.discoveryScheduled ? "Yes" : "No"],
                    ["Discovery Date", lead.discoveryDate || "Not Scheduled"],
                    ["Assigned Rep", lead.assignedRep],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg p-3 border"
                      style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{k}</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{v as string}</p>
                    </div>
                  ))}
                </div>
              </section>
              {lead.discoveryNotes && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Discovery Notes</h3>
                  <div className="rounded-lg p-4 border text-sm"
                    style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                    {lead.discoveryNotes}
                  </div>
                </section>
              )}
              {lead.businessGoals.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Business Goals</h3>
                  <ul className="space-y-1.5">
                    {lead.businessGoals.map(g => (
                      <li key={g} className="flex items-start gap-2 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>✓ {g}</li>
                    ))}
                  </ul>
                </section>
              )}
              {lead.painPoints.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Pain Points</h3>
                  <ul className="space-y-1.5">
                    {lead.painPoints.map(p => (
                      <li key={p} className="flex items-start gap-2 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                        <span className="text-amber-500 mt-0.5">!</span>{p}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <section>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => onAction({ type: "scheduleDiscovery", lead })}
                    className="rtm-btn-secondary text-xs px-3 py-1.5">
                    {lead.discoveryScheduled ? "Update Discovery" : "Schedule Discovery"}
                  </button>
                  <button onClick={() => onAction({ type: "scheduleDiscovery", lead })}
                    className="rtm-btn-secondary text-xs px-3 py-1.5">Complete Discovery</button>
                  <button onClick={() => onAction({ type: "addNote", lead })}
                    className="rtm-btn-secondary text-xs px-3 py-1.5">Update Notes</button>
                </div>
              </section>
            </>
          )}

          {/* OPP READINESS */}
          {activeTab === "readiness" && (
            <>
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Opportunity Readiness</h3>
                  {readinessBadge(lead.opportunityReadiness)}
                </div>
                <div className="space-y-2">
                  {readinessChecklist.map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg border"
                      style={{ background: item.done ? "#F0FDF4" : "var(--rtm-surface)", borderColor: item.done ? "#A7F3D0" : "var(--rtm-border)" }}>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: item.done ? "#059669" : "#E2E8F0", color: item.done ? "#fff" : "#94A3B8" }}>
                        {item.done ? "✓" : ""}
                      </div>
                      <span className="text-sm font-medium" style={{ color: item.done ? "#15803D" : "var(--rtm-text-secondary)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>
              {isReadyForOpportunity && (
                <section>
                  <div className="rounded-xl p-5 border-2" style={{ background: "#ECFDF5", borderColor: "#059669" }}>
                    <p className="text-sm font-bold mb-1" style={{ color: "#059669" }}>✓ Ready For Opportunity</p>
                    <p className="text-xs mb-4" style={{ color: "#15803D" }}>
                      All readiness criteria met. Create an opportunity in the Sales Pipeline to advance this lead.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => onCreateOpportunity(lead)}
                        className="text-xs px-4 py-2 rounded-lg font-bold"
                        style={{ background: "#059669", color: "#fff" }}>
                        Create Opportunity
                      </button>
                      <Link href="/sales/pipeline"
                        className="text-xs px-4 py-2 rounded-lg font-semibold border inline-block"
                        style={{ background: "#fff", color: "#059669", borderColor: "#A7F3D0" }}>
                        Open Pipeline →
                      </Link>
                    </div>
                  </div>
                </section>
              )}
            </>
          )}

          {/* AFFILIATE */}
          {activeTab === "affiliate" && (
            <>
              {lead.affiliateName !== "—" ? (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Attribution</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Affiliate Name", lead.affiliateName],
                      ["GHL Contact Source", lead.ghlSource],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg p-3 border"
                        style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{k}</p>
                        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{v as string}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <Link href="/sales/affiliates" className="rtm-btn-primary text-xs px-3 py-1.5 inline-block">
                      Open Affiliate Record →
                    </Link>
                  </div>
                </section>
              ) : (
                <div className="rounded-lg p-6 border text-center"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>This lead has no affiliate attribution.</p>
                </div>
              )}
            </>
          )}

          {/* TIMELINE */}
          {activeTab === "timeline" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Lead Journey</h3>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: "var(--rtm-border)" }} />
                  {timeline.map((item, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className="absolute -left-4 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]"
                        style={{ background: "var(--rtm-surface)", borderColor: workspace.accentColor }}>·</div>
                      <div className="flex-1 rounded-lg p-3 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{item.event}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Notes</h3>
                <div className="rounded-lg p-4 border text-sm whitespace-pre-wrap"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                  {lead.notes || "No notes added."}
                </div>
                <button onClick={() => onAction({ type: "addNote", lead })}
                  className="mt-2 rtm-btn-secondary text-xs px-3 py-1.5">Add Note</button>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex gap-2">
            <button onClick={() => onAction({ type: "disqualify", lead })}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
              style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}>
              Disqualify
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onAction({ type: "moveStage", lead })}
              className="rtm-btn-secondary text-xs px-3 py-1.5">Move Stage</button>
            {isReadyForOpportunity ? (
              <button onClick={() => onCreateOpportunity(lead)}
                className="text-xs px-3 py-1.5 rounded-lg font-bold"
                style={{ background: "#059669", color: "#fff" }}>
                Create Opportunity →
              </button>
            ) : (
              <button className="rtm-btn-primary text-xs px-3 py-1.5" disabled={!isQualified}
                style={{ opacity: isQualified ? 1 : 0.4 }}
                onClick={isQualified ? () => onCreateOpportunity(lead) : undefined}>
                Create Opportunity
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

//  Main Page ──────────────────────────────────────────────────────────────────

const MODAL_INDUSTRY_OPTIONS = [
  "Home Services", "Healthcare", "Legal", "Automotive",
  "Fitness", "Dental", "Real Estate", "Restaurant",
  "Retail", "Technology", "Financial Services", "Other",
];

const MODAL_SOURCE_OPTIONS = [
  "Affiliate", "Referral", "Partner", "Website",
  "Google Ads", "Meta Ads", "Outbound", "Direct",
];

const MODAL_ASSIGNED_REPS = ["Jordan M.", "Sarah K.", "Mike T.", "Alex R."];

interface AddLeadFormState {
  businessName: string;
  contactName: string;
  industry: string;
  location: string;
  leadSource: string;
  assignedRep: string;
  contactEmail: string;
  contactPhone: string;
  notes: string;
}

const EMPTY_ADD_LEAD_FORM: AddLeadFormState = {
  businessName: "", contactName: "",
  industry: MODAL_INDUSTRY_OPTIONS[0], location: "",
  leadSource: MODAL_SOURCE_OPTIONS[0], assignedRep: MODAL_ASSIGNED_REPS[0],
  contactEmail: "", contactPhone: "", notes: "",
};

function AddLeadModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (lead: Lead) => void;
}) {
  const [form, setForm] = useState<AddLeadFormState>({ ...EMPTY_ADD_LEAD_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof AddLeadFormState, string>>>({});

  function set<K extends keyof AddLeadFormState>(key: K, value: AddLeadFormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof AddLeadFormState, string>> = {};
    if (!form.businessName.trim()) newErrors.businessName = "Required";
    if (!form.contactName.trim()) newErrors.contactName = "Required";
    return Object.keys(newErrors).length === 0 ? true : (setErrors(newErrors), false);
  }

  function handleSubmit() {
    if (!validate()) return;
    const newLead: Lead = {
      id: `L${String(Date.now()).slice(-6)}`,
      name: form.contactName, businessName: form.businessName,
      industry: form.industry, website: "", email: form.contactEmail,
      phone: form.contactPhone, location: form.location,
      ghlContactId: "—", ghlAssignedUser: form.assignedRep,
      ghlSource: form.leadSource, ghlCreatedDate: new Date().toISOString().split("T")[0],
      ghlLastActivityDate: new Date().toISOString().split("T")[0],
      ghlContactTags: [], ghlContactStatus: "New", ghlSyncStatus: "Pending Sync",
      leadSource: form.leadSource as LeadSource, assignedRep: form.assignedRep,
      stage: "New Lead", opportunityReadiness: "Not Ready",
      discoveryScheduled: false, discoveryDate: "", discoveryNotes: "",
      businessGoals: [], painPoints: [], requestedServices: [],
      budget: "Unknown", authority: "Unknown", need: "Low", timeline: "6+ months",
      estimatedValue: 0, affiliateName: "—",
      createdDate: new Date().toISOString().split("T")[0], lastActivity: "Just now",
      notes: form.notes,
    };
    onAdd(newLead);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
      <div className="w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Add Lead</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Create a new lead manually</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>✕</button>
        </div>
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Business Name <span style={{ color: "#DC2626" }}>*</span></label>
            <input value={form.businessName} onChange={e => set("businessName", e.target.value)} placeholder="e.g. Summit Landscaping"
            className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
            style={{ background: "var(--rtm-surface)", borderColor: errors.businessName ? "#DC2626" : "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            {errors.businessName && <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>{errors.businessName}</p>}
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Contact Name <span style={{ color: "#DC2626" }}>*</span></label>
            <input value={form.contactName} onChange={e => set("contactName", e.target.value)} placeholder="e.g. Marcus Webb"
              className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
              style={{ background: "var(--rtm-surface)", borderColor: errors.contactName ? "#DC2626" : "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            {errors.contactName && <p className="text-[10px] mt-0.5" style={{ color: "#DC2626" }}>{errors.contactName}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Industry</label>
              <select value={form.industry} onChange={e => set("industry", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                {MODAL_INDUSTRY_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Location</label>
              <input value={form.location} onChange={e => set("location", e.target.value)} placeholder="e.g. Austin, TX"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Lead Source</label>
              <select value={form.leadSource} onChange={e => set("leadSource", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                {MODAL_SOURCE_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Assigned Rep</label>
              <select value={form.assignedRep} onChange={e => set("assignedRep", e.target.value)}
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
                {MODAL_ASSIGNED_REPS.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Email</label>
              <input type="email" value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} placeholder="contact@business.com"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Phone</label>
              <input value={form.contactPhone} onChange={e => set("contactPhone", e.target.value)} placeholder="(555) 555-5555"
                className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
                style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any additional notes..." rows={3}
              className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none resize-none"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
          <button onClick={handleSubmit} className="rtm-btn-primary text-sm px-4 py-2">Add Lead</button>
        </div>
      </div>
    </div>
  );
}

// Toast
interface ToastMsg { id: number; text: string; variant: "success" | "info" | "danger"; }

function Toast({ msg, onDismiss }: { msg: ToastMsg; onDismiss: () => void }) {
  useEffect(() => { const t = setTimeout(onDismiss, 4000); return () => clearTimeout(t); }, [onDismiss]);
  const bg = msg.variant === "success" ? "#F0FDF4" : msg.variant === "danger" ? "#FEF2F2" : "#EFF6FF";
  const text = msg.variant === "success" ? "#15803D" : msg.variant === "danger" ? "#DC2626" : "#1D4ED8";
  const border = msg.variant === "success" ? "#A7F3D0" : msg.variant === "danger" ? "#FECACA" : "#BFDBFE";
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg"
      style={{ background: bg, borderColor: border, minWidth: 280, maxWidth: 400 }}>
      <p className="text-sm font-semibold" style={{ color: text }}>{msg.text}</p>
      <button onClick={onDismiss} className="font-bold text-lg" style={{ color: text }}>×</button>
    </div>
  );
}

function ToastContainer({ toasts, dismiss }: { toasts: ToastMsg[]; dismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map(t => <Toast key={t.id} msg={t} onDismiss={() => dismiss(t.id)} />)}
    </div>
  );
}

// Import Leads Modal
function ImportLeadsModal({ onClose, onImport }: {
  onClose: () => void;
  onImport: (mockCount: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Import Leads</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Upload a CSV file to import leads in bulk</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-colors"
            style={{ borderColor: dragging ? "#2563EB" : "var(--rtm-border)", background: dragging ? "#EFF6FF" : "var(--rtm-surface)" }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
            onClick={() => fileRef.current?.click()}>
            <p className="text-sm font-semibold" style={{ color: dragging ? "#1D4ED8" : "var(--rtm-text-secondary)" }}>
              {fileName ? fileName : "Drop a CSV file here or click to browse"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Accepted format: .csv</p>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }} />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
          <button onClick={() => onImport(Math.floor(Math.random() * 8) + 3)}
            className="text-sm px-4 py-2 rounded-lg font-bold" style={{ background: "#2563EB", color: "#fff" }}>Import</button>
        </div>
      </div>
    </div>
  );
}

// Assign Leads Modal (bulk)
const ASSIGN_REPS = ["Jordan M.", "Sarah K.", "Mike T.", "Alex R."];

function AssignLeadsModal({ leads, onClose, onAssign }: {
  leads: Lead[];
  onClose: () => void;
  onAssign: (leadIds: string[], rep: string) => void;
}) {
  const unassigned = leads.filter(l => !l.assignedRep || l.assignedRep === "—");
  const candidates = unassigned.length > 0 ? unassigned : leads.slice(0, 5);
  const [selectedIds, setSelectedIds] = useState<string[]>(candidates.map(l => l.id));
  const [rep, setRep] = useState(ASSIGN_REPS[0]);
  function toggleLead(id: string) { setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]); }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}>
      <div className="w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Assign Leads</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>Bulk-assign leads to a sales rep</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-lg font-bold"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)" }}>✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-1" style={{ color: "var(--rtm-text-muted)" }}>Assign To Rep</label>
            <select value={rep} onChange={e => setRep(e.target.value)}
              className="w-full text-sm rounded-lg border px-3 py-2 focus:outline-none"
              style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}>
              {ASSIGN_REPS.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wide block mb-2" style={{ color: "var(--rtm-text-muted)" }}>Select Leads ({selectedIds.length} selected)</label>
            <div className="space-y-1 max-h-52 overflow-y-auto rounded-lg border" style={{ borderColor: "var(--rtm-border)" }}>
              {candidates.map(l => (
                <label key={l.id} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:opacity-80"
                  style={{ background: selectedIds.includes(l.id) ? "#EFF6FF" : "var(--rtm-surface)" }}>
                  <input type="checkbox" checked={selectedIds.includes(l.id)} onChange={() => toggleLead(l.id)} />
                  <div>
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{l.businessName}</p>
                    <p className="text-[10px]" style={{ color: "var(--rtm-text-muted)" }}>{l.name} · {l.stage}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg font-semibold border"
            style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)" }}>Cancel</button>
          <button onClick={() => onAssign(selectedIds, rep)} disabled={selectedIds.length === 0}
            className="text-sm px-4 py-2 rounded-lg font-bold disabled:opacity-40"
            style={{ background: "#059669", color: "#fff" }}>Assign</button>
        </div>
      </div>
    </div>
  );
}

// Main page inner component
function SalesLeadsPageInner() {
  const searchParams = useSearchParams();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [stageFilter, setStageFilter] = useState<LeadStage | "All">("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [syncFilter, setSyncFilter] = useState<GHLSyncStatus | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSyncPanel, setShowSyncPanel] = useState(false);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const toastCounter = useRef(0);
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [showCustomizeView, setShowCustomizeView] = useState(false);
  const { isVisible, widgetOrder } = useWidgetPreferences("leads");
  const [showCreateOpportunityModal, setShowCreateOpportunityModal] = useState(false);
  const [selectedLeadForOpportunity, setSelectedLeadForOpportunity] = useState<{
    id: string; clientName: string; businessName: string; contactName: string;
    contactPhone: string; contactEmail: string; leadSource: string; assignedRep: string; notes: string;
  } | null>(null);
  const [opportunityCreatedLeadIds, setOpportunityCreatedLeadIds] = useState<Set<string>>(new Set());
  const [activeModal, setActiveModal] = useState<ActiveModal | null>(null);

  // Hydrate lead overrides from the file-backed API on mount (seed-then-hydrate pattern)
  useEffect(() => {
    fetch("/api/leads-status")
      .then(r => r.ok ? r.json() as Promise<{ records: LeadStatusRecord[] }> : Promise.reject(r.status))
      .then(({ records }) => {
        if (!Array.isArray(records) || records.length === 0) return;
        const byId = new Map(records.map(r => [r.leadId, r]));
        setLeads(prev => prev.map(l => applyOverride(l, byId.get(l.id))));
      })
      .catch(err => console.error("[Leads] Failed to hydrate lead status overrides:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-open Add Lead modal when ?action=add-lead is in the URL
  useEffect(() => {
    if (searchParams.get("action") === "add-lead") setShowAddLeadModal(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addToast(text: string, variant: ToastMsg["variant"] = "success") {
    toastCounter.current += 1;
    const id = toastCounter.current;
    setToasts(prev => [...prev, { id, text, variant }]);
  }

  function dismissToast(id: number) { setToasts(prev => prev.filter(t => t.id !== id)); }

  // Generic lead updater — applies a partial patch to the in-memory lead and closes any modal
  function patchLead(leadId: string, patch: Partial<Lead>) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ...patch } : l));
    // If the open drawer has this lead, update it too
    setSelectedLead(prev => prev?.id === leadId ? { ...prev, ...patch } : prev);
  }

  // Action handlers
  function handleEditLead(patch: Partial<Lead>) {
    if (!activeModal || activeModal.type !== "editLead") return;
    patchLead(activeModal.lead.id, patch);
    setActiveModal(null);
    addToast("Lead updated successfully");
  }

  function handleAssignRep(rep: string) {
    if (!activeModal || activeModal.type !== "assignRep") return;
    patchLead(activeModal.lead.id, { assignedRep: rep });
    setActiveModal(null);
    addToast(`Lead assigned to ${rep}`);
  }

  function handleScheduleDiscovery(patch: { discoveryScheduled: boolean; discoveryDate: string; discoveryNotes: string }) {
    if (!activeModal || activeModal.type !== "scheduleDiscovery") return;
    const stagePatch = patch.discoveryDate ? {} : {};
    patchLead(activeModal.lead.id, { ...patch, ...stagePatch });
    setActiveModal(null);
    addToast("Discovery updated successfully");
  }

  function handleMoveStage(stage: LeadStage) {
    if (!activeModal || activeModal.type !== "moveStage") return;
    patchLead(activeModal.lead.id, { stage });
    setActiveModal(null);
    addToast(`Lead moved to ${stage}`);
  }

  function handleAddNote(notes: string) {
    if (!activeModal || activeModal.type !== "addNote") return;
    patchLead(activeModal.lead.id, { notes });
    setActiveModal(null);
    addToast("Note added successfully");
  }

  function handleDisqualify(reason: string) {
    if (!activeModal || activeModal.type !== "disqualify") return;
    patchLead(activeModal.lead.id, { stage: "Disqualified", disqualified: true, disqualifiedReason: reason });
    setActiveModal(null);
    addToast("Lead disqualified");
  }

  function handleFollowUpCreated() {
    setActiveModal(null);
    addToast("Follow-up task created — visible on Sales Tasks");
  }

  function handleImportLeads(mockCount: number) {
    const mockBatch: Lead[] = Array.from({ length: mockCount }, (_, i) => ({
      id: `LIMP${Date.now()}${i}`,
      name: `Imported Contact ${i + 1}`, businessName: `Imported Business ${i + 1}`,
      industry: "Home Services", website: "", email: `contact${i + 1}@imported.com`,
      phone: "", location: "—", ghlContactId: "—", ghlAssignedUser: ASSIGN_REPS[0],
      ghlSource: "Website", ghlCreatedDate: new Date().toISOString().split("T")[0],
      ghlLastActivityDate: new Date().toISOString().split("T")[0],
      ghlContactTags: [], ghlContactStatus: "New", ghlSyncStatus: "Pending Sync" as GHLSyncStatus,
      leadSource: "Website" as LeadSource, assignedRep: ASSIGN_REPS[0],
      stage: "New Lead" as LeadStage, opportunityReadiness: "Not Ready" as OpportunityReadiness,
      discoveryScheduled: false, discoveryDate: "", discoveryNotes: "",
      businessGoals: [], painPoints: [], requestedServices: [],
      budget: "Unknown" as const, authority: "Unknown" as const, need: "Low" as const, timeline: "6+ months" as const,
      estimatedValue: 0, affiliateName: "—", createdDate: new Date().toISOString().split("T")[0],
      lastActivity: "Just now", notes: "Imported via CSV",
    }));
    setLeads(prev => [...mockBatch, ...prev]);
    setShowImportModal(false);
    addToast(`${mockCount} leads imported successfully`);
  }

  function handleAssignLeads(leadIds: string[], rep: string) {
    setLeads(prev => prev.map(l => leadIds.includes(l.id) ? { ...l, assignedRep: rep } : l));
    setShowAssignModal(false);
    addToast(`${leadIds.length} lead${leadIds.length !== 1 ? "s" : ""} assigned to ${rep}`);
  }

  function handleExportLeads() {
    addToast("Exporting leads...", "info");
    setTimeout(() => addToast(`${leads.length} leads exported successfully`), 1000);
  }

  function handleRetrySync(leadId: string) {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, ghlSyncStatus: "Synced" as GHLSyncStatus } : l));
    addToast("GHL sync resolved successfully");
  }

  function handleCreateOpportunityFromLead(lead: Lead) {
    setSelectedLeadForOpportunity({
      id: lead.id, clientName: lead.name, businessName: lead.businessName,
      contactName: lead.name, contactPhone: lead.phone, contactEmail: lead.email,
      leadSource: lead.leadSource, assignedRep: lead.assignedRep, notes: lead.discoveryNotes,
    });
    setShowCreateOpportunityModal(true);
  }

  async function handleOpportunityCreated(opp: OpportunityRecord) {
    // Persist to file-backed store so Pipeline page can read it
    try {
      await fetch("/api/sales-opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(opp),
      });
    } catch (err) {
      console.error("[Leads] Failed to persist opportunity:", err);
    }
    if (opp.leadId) {
      setOpportunityCreatedLeadIds(prev => new Set([...prev, opp.leadId as string]));
    }
    setShowCreateOpportunityModal(false);
    setSelectedLeadForOpportunity(null);
    addToast("Opportunity created — now visible on Pipeline");
  }

  const filtered = leads.filter(l => {
    if (stageFilter !== "All" && l.stage !== stageFilter) return false;
    if (sourceFilter !== "All" && l.leadSource !== sourceFilter) return false;
    if (syncFilter !== "All" && l.ghlSyncStatus !== syncFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.businessName.toLowerCase().includes(q) ||
        l.name.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q) ||
        l.ghlContactId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // KPI calcs
  const newLeads = leads.filter(l => l.stage === "New Lead").length;
  const contactAttempted = leads.filter(l => l.stage === "Contact Attempted").length;
  const discoveryScheduled = leads.filter(l => l.stage === "Discovery Scheduled").length;
  const discoveryComplete = leads.filter(l => l.stage === "Discovery Complete").length;
  const qualifiedLeads = leads.filter(l => l.stage === "Qualified").length;
  const disqualifiedLeads = leads.filter(l => l.stage === "Disqualified").length;
  const readyForOpp = leads.filter(l => l.opportunityReadiness === "Ready For Opportunity").length;
  const ghlSynced = leads.filter(l => l.ghlSyncStatus === "Synced").length;
  const ghlPending = leads.filter(l => l.ghlSyncStatus === "Pending Sync").length;
  const ghlFailed = leads.filter(l => l.ghlSyncStatus === "Sync Failed").length;
  const conversionRate = leads.length > 0 ? Math.round((qualifiedLeads / leads.length) * 100) : 0;

  const stageCounts = Object.fromEntries(LEAD_STAGES.map(s => [s, leads.filter(l => l.stage === s).length]));
  const sources = Array.from(new Set(leads.map(l => l.leadSource)));
  const sourceCounts = Object.fromEntries(sources.map(s => [s, leads.filter(l => l.leadSource === s).length]));

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} dismiss={dismissToast} />

      {/* Lead Drawer */}
      {selectedLead && (
        <LeadDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onAction={modal => setActiveModal(modal)}
          onCreateOpportunity={handleCreateOpportunityFromLead}
        />
      )}

      {/* Action Modals */}
      {activeModal?.type === "editLead" && (
        <EditLeadModal lead={activeModal.lead} onClose={() => setActiveModal(null)} onSave={handleEditLead} />
      )}
      {activeModal?.type === "assignRep" && (
        <AssignRepModal lead={activeModal.lead} onClose={() => setActiveModal(null)} onSave={handleAssignRep} />
      )}
      {activeModal?.type === "scheduleDiscovery" && (
        <ScheduleDiscoveryModal lead={activeModal.lead} onClose={() => setActiveModal(null)} onSave={handleScheduleDiscovery} />
      )}
      {activeModal?.type === "moveStage" && (
        <MoveStageModal lead={activeModal.lead} onClose={() => setActiveModal(null)} onSave={handleMoveStage} />
      )}
      {activeModal?.type === "addNote" && (
        <AddNoteModal lead={activeModal.lead} onClose={() => setActiveModal(null)} onSave={handleAddNote} />
      )}
      {activeModal?.type === "disqualify" && (
        <DisqualifyModal lead={activeModal.lead} onClose={() => setActiveModal(null)} onSave={handleDisqualify} />
      )}
      {activeModal?.type === "createFollowUp" && (
        <CreateFollowUpModal lead={activeModal.lead} onClose={() => setActiveModal(null)} onSave={handleFollowUpCreated} />
      )}

      {/* Add Lead Modal */}
      {showAddLeadModal && (
        <AddLeadModal
          onClose={() => setShowAddLeadModal(false)}
          onAdd={newLead => { setLeads(prev => [newLead, ...prev]); setShowAddLeadModal(false); addToast("Lead added successfully"); }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && (
        <ImportLeadsModal onClose={() => setShowImportModal(false)} onImport={handleImportLeads} />
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <AssignLeadsModal leads={leads} onClose={() => setShowAssignModal(false)} onAssign={handleAssignLeads} />
      )}

      {/* Customize View Modal */}
      {showCustomizeView && (
        <CustomizeViewModal pageId="leads" onClose={() => setShowCustomizeView(false)} />
      )}

      {/* Create Opportunity Modal */}
      {showCreateOpportunityModal && (
        <CreateOpportunityModal
          leadData={selectedLeadForOpportunity ?? undefined}
          onCreated={handleOpportunityCreated}
          onClose={() => { setShowCreateOpportunityModal(false); setSelectedLeadForOpportunity(null); }}
        />
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
          <h1 className="text-2xl font-medium tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Leads</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-muted)" }}>
            Lead qualification, discovery management, and opportunity readiness.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button onClick={() => setShowAddLeadModal(true)} className="rtm-btn-primary text-sm flex items-center gap-1.5 px-3 py-2">Add Lead</button>
          <button onClick={() => setShowImportModal(true)} className="rtm-btn-secondary text-sm px-3 py-2">Import Leads</button>
          <button onClick={() => setShowAssignModal(true)} className="rtm-btn-secondary text-sm px-3 py-2">Assign Leads</button>
          <button onClick={handleExportLeads} className="rtm-btn-secondary text-sm px-3 py-2">Export Leads</button>
          <button onClick={() => setShowCustomizeView(true)} className="rtm-btn-secondary text-sm px-3 py-2">Customize View</button>
          <button onClick={() => setShowSyncPanel(v => !v)}
            className="text-sm px-3 py-2 rounded-lg font-semibold border transition-colors"
            style={{
              background: showSyncPanel ? "#ECFDF5" : "var(--rtm-surface)",
              color: showSyncPanel ? "#059669" : "var(--rtm-text-primary)",
              borderColor: showSyncPanel ? "#A7F3D0" : "var(--rtm-border)",
            }}>
            Sync Status
          </button>
        </div>
      </div>

      {/* GHL Sync Panel */}
      {showSyncPanel && (
        <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>GHL Lead Sync Status</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>GoHighLevel contact synchronization · Last sync: Today, 9:42 AM</p>
            </div>
            <button onClick={() => setShowSyncPanel(false)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}>
              Close
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Synced Contacts", value: ghlSynced, color: "#059669" },
              { label: "Pending Sync", value: ghlPending, color: "#D97706" },
              { label: "Sync Failed", value: ghlFailed, color: "#DC2626" },
              { label: "Manual Override", value: leads.filter(l => l.ghlSyncStatus === "Manual Override").length, color: "#7C3AED" },
            ].map(item => (
              <div key={item.label} className="rounded-lg p-4 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wide" style={{ color: "var(--rtm-text-muted)" }}>{item.label}</p>
              </div>
            ))}
          </div>
          {ghlFailed > 0 && (
            <div className="rounded-lg p-4 border mb-4" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "#DC2626" }}>⚠ Sync Issues Detected</p>
              <div className="space-y-2">
                {leads.filter(l => l.ghlSyncStatus === "Sync Failed").map(l => (
                  <div key={l.id} className="flex items-center justify-between text-xs" style={{ color: "#B91C1C" }}>
                    <span>{l.businessName} ({l.ghlContactId})</span>
                    <button onClick={() => handleRetrySync(l.id)} className="px-2 py-0.5 rounded font-bold" style={{ background: "#DC2626", color: "#fff" }}>Retry</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      {(() => {
        const widgetData: Record<string, { title: string; value: string; trend: "up" | "down" | "neutral"; trendValue: string }> = {
          "leads-new":                { title: "New Leads",           value: String(newLeads),           trend: "up",      trendValue: "+5" },
          "leads-contact-attempted":  { title: "Contact Attempted",   value: String(contactAttempted),   trend: "neutral", trendValue: "±0" },
          "leads-contacted":          { title: "Contacted",           value: String(leads.filter(l => l.stage === "Contacted").length), trend: "up", trendValue: "+1" },
          "leads-discovery-scheduled":{ title: "Discovery Scheduled", value: String(discoveryScheduled), trend: "up",      trendValue: "+2" },
          "leads-discovery-complete": { title: "Discovery Complete",  value: String(discoveryComplete),  trend: "up",      trendValue: "+3" },
          "leads-qualified":          { title: "Qualified",           value: String(qualifiedLeads),     trend: "up",      trendValue: "+4" },
          "leads-disqualified":       { title: "Disqualified",        value: String(disqualifiedLeads),  trend: "neutral", trendValue: "±0" },
          "leads-conversion":         { title: "Conversion Rate",     value: `${conversionRate}%`,       trend: "up",      trendValue: "+2%" },
          "leads-ghl-contacts":       { title: "GHL Contacts",        value: String(ghlSynced),          trend: "up",      trendValue: `+${ghlSynced}` },
        };
        const visibleCards = widgetOrder.filter(id => isVisible(id) && widgetData[id]).map(id => ({ id, ...widgetData[id] }));
        if (visibleCards.length === 0) return null;
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {visibleCards.map(card => (
              <KpiCard key={card.id} title={card.title} value={card.value}
                iconBg="var(--rtm-bg)" iconColor="var(--rtm-text-muted)"
                trend={card.trend} trendValue={card.trendValue} />
            ))}
          </div>
        );
      })()}

      {/* Lead Stage Pipeline */}
      <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Lead Stages</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {LEADS.length} total leads · {readyForOpp} ready for opportunity
            </p>
          </div>
          <Link href="/sales/pipeline" className="rtm-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
            → Sales Pipeline
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {LEAD_STAGES.map(stage => {
            const cfg = STAGE_CONFIG[stage];
            const count = stageCounts[stage] || 0;
            const isActive = stageFilter === stage;
            return (
              <button key={stage} onClick={() => setStageFilter(isActive ? "All" : stage)}
                className="flex-shrink-0 rounded-xl border p-3 text-left min-w-[140px] transition-all"
                style={{
                  background: "var(--rtm-bg)",
                  borderColor: isActive ? cfg.color : "var(--rtm-border)",
                  boxShadow: isActive ? `0 0 0 2px ${cfg.color}30` : undefined,
                }}>
                <p className="text-2xl font-bold mb-1" style={{ color: cfg.color }}>{count}</p>
                <p className="text-[10px] font-bold leading-tight" style={{ color: "var(--rtm-text-muted)" }}>{stage}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lead Sources */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {sources.sort((a, b) => sourceCounts[b] - sourceCounts[a]).map(source => {
          const isActive = sourceFilter === source;
          return (
            <button key={source} onClick={() => setSourceFilter(isActive ? "All" : source)}
              className="rounded-xl border p-3 text-center transition-all"
              style={{
                background: "var(--rtm-surface)",
                borderColor: isActive ? "var(--rtm-text-secondary)" : "var(--rtm-border)",
              }}>
              <p className="text-xl font-bold" style={{ color: "var(--rtm-text-primary)" }}>{sourceCounts[source]}</p>
              <p className="text-[10px] font-semibold mt-0.5 leading-tight" style={{ color: "var(--rtm-text-muted)" }}>{source}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>🔍</span>
          <input value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, business, industry, or GHL ID..."
            className="w-full pl-8 pr-4 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }} />
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          <span>{filtered.length} leads</span>
          {(stageFilter !== "All" || sourceFilter !== "All" || syncFilter !== "All" || searchQuery) && (
            <button onClick={() => { setStageFilter("All"); setSourceFilter("All"); setSyncFilter("All"); setSearchQuery(""); }}
              className="px-2 py-1 rounded font-semibold" style={{ background: "#FEF2F2", color: "#DC2626" }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Lead Table */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                {["Lead Name", "Business Name", "Lead Source", "Assigned Rep", "Lead Stage", "Opp Readiness", "Created Date", "Last Activity", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
              {filtered.map((lead, i) => (
                <tr key={lead.id} className="transition-colors hover:cursor-pointer"
                  style={{ background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}
                  onClick={() => setSelectedLead(lead)}>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{lead.name}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{lead.businessName}</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{lead.location}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{sourceBadge(lead.leadSource)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{lead.assignedRep}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{stageBadge(lead.stage)}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-1">
                      {readinessBadge(lead.opportunityReadiness)}
                      {opportunityCreatedLeadIds.has(lead.id) && (
                        <span className="block text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0" }}>
                          Opportunity Created
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{lead.createdDate}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{lead.lastActivity}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelectedLead(lead)}
                        className="text-xs px-2 py-1 rounded font-semibold"
                        style={{ background: "var(--rtm-bg)", color: workspace.accentColor, border: `1px solid ${workspace.accentColor}30` }}>
                        View
                      </button>
                      <div className="relative group">
                        <button className="text-xs px-2 py-1 rounded font-semibold"
                          style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}>
                          ···
                        </button>
                        <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border shadow-lg z-10 hidden group-hover:block"
                          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                          {(
                            [
                              { label: "Edit Lead", modal: "editLead" as const },
                              { label: "Assign Sales Rep", modal: "assignRep" as const },
                              { label: "Schedule Discovery", modal: "scheduleDiscovery" as const },
                              { label: "Create Follow-Up", modal: "createFollowUp" as const },
                              { label: "Move Stage", modal: "moveStage" as const },
                              { label: "Add Note", modal: "addNote" as const },
                              { label: "Disqualify", modal: "disqualify" as const },
                            ] as { label: string; modal: ActiveModal["type"] }[]
                          ).map(action => (
                            <button key={action.label}
                              onClick={e => { e.stopPropagation(); setActiveModal({ type: action.modal, lead } as ActiveModal); }}
                              className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50 first:rounded-t-lg"
                              style={{ color: action.modal === "disqualify" ? "#DC2626" : "var(--rtm-text-primary)" }}>
                              {action.label}
                            </button>
                          ))}
                          <button
                            className="block w-full text-left px-3 py-2 text-xs font-bold"
                            style={{ color: "#059669", background: opportunityCreatedLeadIds.has(lead.id) ? "#F0FDF4" : "#ECFDF5" }}
                            onClick={e => { e.stopPropagation(); handleCreateOpportunityFromLead(lead); }}>
                            {opportunityCreatedLeadIds.has(lead.id) ? "Create Another Opportunity" : "Create Opportunity"}
                          </button>
                          <Link href={`/sales/intake?leadId=${lead.id}`}
                            className="block w-full text-left px-3 py-2 text-xs font-bold rounded-b-lg"
                            style={{ color: "#2563EB", background: "#EFF6FF" }}
                            onClick={e => e.stopPropagation()}>
                            Start Intake
                          </Link>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No leads match your filters.</p>
            <button onClick={() => { setStageFilter("All"); setSourceFilter("All"); setSyncFilter("All"); setSearchQuery(""); }}
              className="mt-3 rtm-btn-secondary text-xs px-3 py-1.5">Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SalesLeadsPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center">
        <p style={{ color: "var(--rtm-text-muted)" }}>Loading leads...</p>
      </div>
    }>
      <SalesLeadsPageInner />
    </Suspense>
  );
}
