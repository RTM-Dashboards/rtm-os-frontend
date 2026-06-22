"use client";

import React, { useState } from "react";
import { KpiCard } from "@/components/ui";
import { getWorkspace } from "@/lib/workspaces";
import Link from "next/link";

const workspace = getWorkspace("sales")!;

// ─── Types ────────────────────────────────────────────────────────────────────

type LeadStage =
  | "New Lead"
  | "Contact Attempted"
  | "Contacted"
  | "Discovery Scheduled"
  | "Discovery Complete"
  | "Qualified"
  | "Disqualified";

type GHLSyncStatus = "Synced" | "Pending Sync" | "Sync Failed" | "Manual Override";

type OpportunityReadiness =
  | "Not Ready"
  | "Discovery Complete"
  | "Budget Discussed"
  | "Decision Maker Identified"
  | "Business Need Identified"
  | "Qualified"
  | "Ready For Opportunity";

type LeadSource =
  | "Website"
  | "Google Ads"
  | "Meta Ads"
  | "GBP"
  | "LSA"
  | "Referral"
  | "Affiliate"
  | "Partner"
  | "Direct"
  | "Outbound";

interface Lead {
  id: string;
  // Contact info
  name: string;
  businessName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  // GHL fields
  ghlContactId: string;
  ghlAssignedUser: string;
  ghlSource: string;
  ghlCreatedDate: string;
  ghlLastActivityDate: string;
  ghlContactTags: string[];
  ghlContactStatus: string;
  ghlSyncStatus: GHLSyncStatus;
  // Lead fields
  leadSource: LeadSource;
  assignedRep: string;
  stage: LeadStage;
  opportunityReadiness: OpportunityReadiness;
  // Discovery
  discoveryScheduled: boolean;
  discoveryDate: string;
  discoveryNotes: string;
  businessGoals: string[];
  painPoints: string[];
  requestedServices: string[];
  // BANT
  budget: "High" | "Medium" | "Low" | "Unknown";
  authority: "Decision Maker" | "Influencer" | "Unknown";
  need: "High" | "Medium" | "Low";
  timeline: "Immediate" | "1-3 months" | "3-6 months" | "6+ months";
  // Misc
  estimatedValue: number;
  affiliateName: string;
  createdDate: string;
  lastActivity: string;
  notes: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

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
    id: "L004", name: "Tanya Okafor", businessName: "Cascade Flooring", industry: "Home Improvement",
    website: "cascadeflooring.com", email: "tanya@cascadeflooring.com", phone: "(425) 555-0404",
    location: "Seattle, WA",
    ghlContactId: "GHL-CON-0004", ghlAssignedUser: "Alex R.", ghlSource: "Partner",
    ghlCreatedDate: "2024-12-08", ghlLastActivityDate: "2024-12-14", ghlContactTags: ["Flooring", "Partner", "Seattle"],
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
    id: "L005", name: "Dr. Lucia Vega", businessName: "Metro Dental Group", industry: "Dental",
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
    id: "L008", name: "Dr. Aaron Park", businessName: "Apex Dental Partners", industry: "Dental",
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
    id: "L011", name: "Finn O'Brien", businessName: "Iron Forge Fitness", industry: "Fitness",
    website: "ironforgefit.com", email: "finn@ironforgefit.com", phone: "(617) 555-1111",
    location: "Boston, MA",
    ghlContactId: "GHL-CON-0011", ghlAssignedUser: "Alex R.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-12-12", ghlLastActivityDate: "2024-12-16", ghlContactTags: ["Fitness", "Boston", "Meta"],
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
    id: "L012", name: "Natasha Brown", businessName: "Silverstone Law Group", industry: "Legal",
    website: "silverstonelaw.com", email: "nbrown@silverstonelaw.com", phone: "(213) 555-1212",
    location: "Los Angeles, CA",
    ghlContactId: "GHL-CON-0012", ghlAssignedUser: "Mike T.", ghlSource: "LSA",
    ghlCreatedDate: "2024-11-25", ghlLastActivityDate: "2024-12-15", ghlContactTags: ["Legal", "LSA", "Los Angeles", "High Budget"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "LSA", assignedRep: "Mike T.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-02",
    discoveryNotes: "Personal injury firm. Wants LSA + PPC. Ready to move.",
    businessGoals: ["Dominate LSA for personal injury in LA", "50+ inbound calls/mo"],
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
    id: "L016", name: "Diana Pham", businessName: "Luxe Med Spa", industry: "Medical Spa",
    website: "luxemedspa.com", email: "diana@luxemedspa.com", phone: "(310) 555-1616",
    location: "Beverly Hills, CA",
    ghlContactId: "GHL-CON-0016", ghlAssignedUser: "Mike T.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-11-08", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Med Spa", "High Value", "Beverly Hills", "Meta"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Meta Ads", assignedRep: "Mike T.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-11-22",
    discoveryNotes: "High-end med spa. Botox, fillers, lasers. Wants Meta + SEO + Creative.",
    businessGoals: ["Fill Botox appointments 8 weeks out", "Build Instagram brand to 50K"],
    painPoints: ["Inconsistent Meta Ads results", "No creative strategy"],
    requestedServices: ["Meta Ads", "SEO", "Creative", "Reporting"],
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
    id: "L019", name: "Holly Jennings", businessName: "Harvest Table Catering", industry: "Food & Beverage",
    website: "harvesttablecatering.com", email: "holly@harvesttable.com", phone: "(612) 555-2020",
    location: "Minneapolis, MN",
    ghlContactId: "GHL-CON-0019", ghlAssignedUser: "Alex R.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-12-15", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Catering", "Meta", "Minneapolis"],
    ghlContactStatus: "New", ghlSyncStatus: "Pending Sync",
    leadSource: "Meta Ads", assignedRep: "Alex R.", stage: "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Book more corporate events"],
    painPoints: ["No social media strategy"],
    requestedServices: ["Meta Ads", "Creative"],
    budget: "Low", authority: "Decision Maker", need: "Medium", timeline: "3-6 months",
    estimatedValue: 1400, affiliateName: "—",
    createdDate: "2024-12-15", lastActivity: "Today",
    notes: "Meta Ads form fill. Needs initial call.",
  },
  {
    id: "L020", name: "Leila Hassan", businessName: "NovaCare Physical Therapy", industry: "Physical Therapy",
    website: "novacarerehab.com", email: "lhassan@novacare.com", phone: "(404) 555-2222",
    location: "Atlanta, GA",
    ghlContactId: "GHL-CON-0020", ghlAssignedUser: "Sarah K.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-11-29", ghlLastActivityDate: "2024-12-14", ghlContactTags: ["PT", "Affiliate", "Atlanta", "Multi-Location"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-06",
    discoveryNotes: "Multi-location PT clinic. Strong budget. Wants SEO + GBP package.",
    businessGoals: ["Fill all 4 clinics to capacity", "Rank top 5 in Atlanta PT"],
    painPoints: ["Insurance referrals drying up", "Low digital presence"],
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
    id: "L022", name: "Walter Huang", businessName: "Pacific Kitchen & Bath", industry: "Kitchen & Bath Remodeling",
    website: "pacifickitchenbath.com", email: "walter@pacifickb.com", phone: "(206) 555-3333",
    location: "Bellevue, WA",
    ghlContactId: "GHL-CON-0022", ghlAssignedUser: "Jordan M.", ghlSource: "Partner",
    ghlCreatedDate: "2024-11-28", ghlLastActivityDate: "2024-12-15", ghlContactTags: ["Remodeling", "Partner", "Bellevue", "High Value"],
    ghlContactStatus: "Active", ghlSyncStatus: "Manual Override",
    leadSource: "Partner", assignedRep: "Jordan M.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-12-04",
    discoveryNotes: "High-end remodeler. Wants SEO + Web redesign + GBP. Large project.",
    businessGoals: ["Attract luxury homeowners in Bellevue", "Rank for kitchen remodel near Seattle"],
    painPoints: ["Outdated website", "No SEO"],
    requestedServices: ["SEO", "Web", "GBP"],
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
    id: "L024", name: "Erica Walton", businessName: "NextGen Physical Medicine", industry: "Physical Medicine",
    website: "nextgenmed.com", email: "erica@nextgenmed.com", phone: "(615) 555-4848",
    location: "Nashville, TN",
    ghlContactId: "GHL-CON-0024", ghlAssignedUser: "Alex R.", ghlSource: "Google Ads",
    ghlCreatedDate: "2024-11-30", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Physical Medicine", "Google Ads", "Nashville"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Google Ads", assignedRep: "Alex R.", stage: "Discovery Complete",
    opportunityReadiness: "Budget Discussed",
    discoveryScheduled: true, discoveryDate: "2024-12-08",
    discoveryNotes: "Pain management + physical therapy. Wants PPC + SEO + Reporting.",
    businessGoals: ["Fill pain management schedule", "Rank for pain clinic Nashville"],
    painPoints: ["High Google Ads spend with poor ROI"],
    requestedServices: ["PPC", "SEO", "GBP", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 4100, affiliateName: "—",
    createdDate: "2024-11-30", lastActivity: "Today",
    notes: "Google Ads inbound. Budget discussed. Hot lead.",
  },
  {
    id: "L025", name: "Paul Whitmore", businessName: "Keystone Insurance Agency", industry: "Insurance",
    website: "keystoneinsurance.com", email: "paul@keystoneins.com", phone: "(215) 555-2525",
    location: "Philadelphia, PA",
    ghlContactId: "GHL-CON-0025", ghlAssignedUser: "Jordan M.", ghlSource: "Outbound",
    ghlCreatedDate: "2024-11-20", ghlLastActivityDate: "2024-12-03", ghlContactTags: ["Insurance", "Outbound", "Disqualified"],
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
    id: "L028", name: "Kimberly Ross", businessName: "Rosewood Event Venue", industry: "Event Venue",
    website: "rosewoodevents.com", email: "kim@rosewoodevents.com", phone: "(404) 555-5252",
    location: "Atlanta, GA",
    ghlContactId: "GHL-CON-0028", ghlAssignedUser: "Alex R.", ghlSource: "Website",
    ghlCreatedDate: "2024-12-15", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Events", "Website", "Atlanta"],
    ghlContactStatus: "New", ghlSyncStatus: "Pending Sync",
    leadSource: "Website", assignedRep: "Alex R.", stage: "New Lead",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: false, discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Book more weddings and corporate events"],
    painPoints: ["Dependent on The Knot and WeddingWire"],
    requestedServices: ["SEO", "Meta Ads"],
    budget: "Medium", authority: "Decision Maker", need: "Medium", timeline: "3-6 months",
    estimatedValue: 1400, affiliateName: "—",
    createdDate: "2024-12-15", lastActivity: "Today",
    notes: "Website inquiry. First contact pending.",
  },
  {
    id: "L029", name: "Vivian Wu", businessName: "Harmony Pediatric Dentistry", industry: "Pediatric Dentistry",
    website: "harmonypeddentistry.com", email: "vivian@harmonyped.com", phone: "(408) 555-4646",
    location: "San Jose, CA",
    ghlContactId: "GHL-CON-0029", ghlAssignedUser: "Sarah K.", ghlSource: "Affiliate",
    ghlCreatedDate: "2024-11-14", ghlLastActivityDate: "2024-12-17", ghlContactTags: ["Dental", "Affiliate", "San Jose", "Pediatric"],
    ghlContactStatus: "Active", ghlSyncStatus: "Synced",
    leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Qualified",
    opportunityReadiness: "Ready For Opportunity",
    discoveryScheduled: true, discoveryDate: "2024-11-29",
    discoveryNotes: "3-dentist practice. High-growth area. Wants SEO + GBP + PPC.",
    businessGoals: ["Fill 3 dentist chairs daily", "Rank #1 for pediatric dentist San Jose"],
    painPoints: ["New patient acquisition slow", "No PPC strategy"],
    requestedServices: ["SEO", "GBP", "PPC", "Reporting"],
    budget: "High", authority: "Decision Maker", need: "High", timeline: "Immediate",
    estimatedValue: 5200, affiliateName: "Kenji Yamamoto",
    createdDate: "2024-11-14", lastActivity: "Today",
    notes: "Kenji Yamamoto affiliate. Ready for opportunity.",
  },
  {
    id: "L030", name: "Ingrid Larsson", businessName: "NordicFit Personal Training", industry: "Personal Training",
    website: "nordicfit.com", email: "ingrid@nordicfit.com", phone: "(612) 555-5050",
    location: "Minneapolis, MN",
    ghlContactId: "GHL-CON-0030", ghlAssignedUser: "Sarah K.", ghlSource: "Meta Ads",
    ghlCreatedDate: "2024-12-11", ghlLastActivityDate: "2024-12-16", ghlContactTags: ["Fitness", "Meta", "Minneapolis"],
    ghlContactStatus: "Active", ghlSyncStatus: "Sync Failed",
    leadSource: "Meta Ads", assignedRep: "Sarah K.", stage: "Discovery Scheduled",
    opportunityReadiness: "Not Ready",
    discoveryScheduled: true, discoveryDate: "2024-12-22",
    discoveryNotes: "",
    businessGoals: ["Book 20 private clients", "Build online training income"],
    painPoints: ["No online sales funnel", "Relying on word of mouth"],
    requestedServices: ["Meta Ads", "Web", "Creative"],
    budget: "Medium", authority: "Decision Maker", need: "Medium", timeline: "1-3 months",
    estimatedValue: 1800, affiliateName: "—",
    createdDate: "2024-12-11", lastActivity: "Yesterday",
    notes: "Meta form. Discovery next week. GHL sync error.",
  },
];

// ─── Stage Config ─────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<LeadStage, { color: string; bg: string; border: string; order: number }> = {
  "New Lead":            { color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", order: 0 },
  "Contact Attempted":   { color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", order: 1 },
  "Contacted":           { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", order: 2 },
  "Discovery Scheduled": { color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD", order: 3 },
  "Discovery Complete":  { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", order: 4 },
  "Qualified":           { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", order: 5 },
  "Disqualified":        { color: "#94A3B8", bg: "#F1F5F9", border: "#CBD5E1", order: 6 },
};

const GHL_SYNC_CONFIG: Record<GHLSyncStatus, { color: string; bg: string; icon?: string }> = {
  "Synced":          { color: "#059669", bg: "#ECFDF5", icon: "✓" },
  "Pending Sync":    { color: "#D97706", bg: "#FFFBEB" },
  "Sync Failed":     { color: "#DC2626", bg: "#FEF2F2", icon: "✕" },
  "Manual Override": { color: "#7C3AED", bg: "#F5F3FF" },
};

const READINESS_CONFIG: Record<OpportunityReadiness, { color: string; bg: string; order: number }> = {
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Drawer Component ─────────────────────────────────────────────────────────

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "ghl" | "qualification" | "discovery" | "readiness" | "affiliate" | "timeline"
  >("overview");

  const tabs = [
    { key: "overview" as const,      label: "Overview" },
    { key: "ghl" as const,           label: "GHL Contact" },
    { key: "qualification" as const, label: "Qualification" },
    { key: "discovery" as const,     label: "Discovery" },
    { key: "readiness" as const,     label: "Opp Readiness" },
    { key: "affiliate" as const,     label: "Affiliate" },
    { key: "timeline" as const,      label: "Timeline" },
  ];

  const isReadyForOpportunity = lead.opportunityReadiness === "Ready For Opportunity";
  const isQualified = lead.stage === "Qualified";

  const readinessChecklist = [
    { label: "Discovery Complete",        done: lead.opportunityReadiness !== "Not Ready" },
    { label: "Budget Discussed",          done: lead.budget !== "Unknown" },
    { label: "Decision Maker Identified", done: lead.authority === "Decision Maker" },
    { label: "Business Need Identified",  done: lead.need === "High" || lead.need === "Medium" },
    { label: "Lead Qualified",            done: isQualified },
  ];

  const timeline = [
    { date: lead.ghlCreatedDate, event: "GHL Contact Created" },
    { date: lead.createdDate,    event: "Lead Created in RTM" },
    { date: lead.createdDate,    event: `Assigned to ${lead.assignedRep}` },
    ...(lead.discoveryDate ? [{ date: lead.discoveryDate, event: "Discovery Completed" }] : []),
    ...(isQualified ? [{ date: lead.lastActivity, event: "Lead Qualified" }] : []),
    ...(isReadyForOpportunity ? [{ date: lead.lastActivity, event: "Ready For Opportunity" }] : []),
    { date: lead.lastActivity,   event: `Current Stage: ${lead.stage}` },
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
                  🚀 Ready For Opportunity
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
              <Link href="/sales/pipeline"
                className="text-xs px-3 py-1.5 rounded-lg font-bold border"
                style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0" }}>
                Create Opportunity →
              </Link>
            )}
            <button className="rtm-btn-primary text-xs px-3 py-1.5">Edit Lead</button>
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

          {/* ── OVERVIEW ── */}
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
                    <div key={k} className="rounded-lg p-3 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
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
                      <Link href="/sales/pipeline"
                        className="text-xs px-3 py-1.5 rounded-lg font-bold"
                        style={{ background: "#059669", color: "#fff" }}>
                        Create Opportunity
                      </Link>
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
                  {["Assign Sales Rep", "Schedule Discovery", "Create Follow-Up", "Move Stage", "Add Note"].map(a => (
                    <button key={a} className="rtm-btn-secondary text-xs px-3 py-1.5">{a}</button>
                  ))}
                  {isReadyForOpportunity && (
                    <Link href="/sales/pipeline"
                      className="text-xs px-3 py-1.5 rounded-lg font-bold inline-block"
                      style={{ background: workspace.accentColor, color: "#fff" }}>
                      Send To Pipeline →
                    </Link>
                  )}
                </div>
              </section>
            </>
          )}

          {/* ── GHL CONTACT ── */}
          {activeTab === "ghl" && (
            <>
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>GHL Contact Details</h3>
                  {ghlSyncBadge(lead.ghlSyncStatus)}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["GHL Contact ID",    lead.ghlContactId],
                    ["Assigned User",     lead.ghlAssignedUser],
                    ["Lead Source",       lead.ghlSource],
                    ["Contact Status",    lead.ghlContactStatus],
                    ["GHL Created Date",  lead.ghlCreatedDate],
                    ["Last Activity",     lead.ghlLastActivityDate],
                    ["Sync Status",       lead.ghlSyncStatus],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg p-3 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
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
                      style={{ background: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {lead.ghlSyncStatus === "Sync Failed" && (
                <section>
                  <div className="rounded-lg p-4 border" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
                    <p className="text-sm font-bold mb-1" style={{ color: "#DC2626" }}>⚠️ GHL Sync Error</p>
                    <p className="text-xs mb-3" style={{ color: "#B91C1C" }}>
                      This contact failed to sync with GoHighLevel. Review and resolve the sync issue.
                    </p>
                    <button className="text-xs px-3 py-1.5 rounded-lg font-bold"
                      style={{ background: "#DC2626", color: "#fff" }}>
                      Retry Sync
                    </button>
                  </div>
                </section>
              )}

              {lead.ghlSyncStatus === "Manual Override" && (
                <section>
                  <div className="rounded-lg p-4 border" style={{ background: "#F5F3FF", borderColor: "#DDD6FE" }}>
                    <p className="text-sm font-bold mb-1" style={{ color: "#7C3AED" }}>⚡ Manual Override Active</p>
                    <p className="text-xs" style={{ color: "#6D28D9" }}>
                      This contact has a manual sync override. GHL auto-sync is disabled for this record.
                    </p>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── QUALIFICATION ── */}
          {activeTab === "qualification" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>BANT Qualification</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Budget",    value: lead.budget,    icon: "💰", good: lead.budget === "High" || lead.budget === "Medium" },
                    { label: "Authority", value: lead.authority, good: lead.authority === "Decision Maker" },
                    { label: "Need",      value: lead.need,      icon: "🎯", good: lead.need === "High" },
                    { label: "Timeline",  value: lead.timeline,  icon: "📅", good: lead.timeline === "Immediate" || lead.timeline === "1-3 months" },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg p-4 border"
                      style={{ background: item.good ? "#F0FDF4" : "#FEF2F2", borderColor: item.good ? "#A7F3D0" : "#FECACA" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{item.icon}</span>
                        <p className="text-[10px] font-bold uppercase tracking-wide"
                          style={{ color: item.good ? "#15803D" : "#DC2626" }}>{item.label}</p>
                      </div>
                      <p className="text-sm font-bold"
                        style={{ color: item.good ? "#15803D" : "#DC2626" }}>{item.value}</p>
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

          {/* ── DISCOVERY ── */}
          {activeTab === "discovery" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Discovery Management</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    ["Discovery Scheduled", lead.discoveryScheduled ? "Yes" : "No"],
                    ["Discovery Date",      lead.discoveryDate || "Not Scheduled"],
                    ["Assigned Rep",        lead.assignedRep],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg p-3 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
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
                      <li key={g} className="flex items-start gap-2 text-sm" style={{ color: "var(--rtm-text-secondary)" }}>
                        <span className="text-emerald-500 mt-0.5">✓</span>{g}
                      </li>
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
                  {["Schedule Discovery", "Complete Discovery", "Update Notes"].map(a => (
                    <button key={a} className="rtm-btn-secondary text-xs px-3 py-1.5">{a}</button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── OPP READINESS ── */}
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
                        {item.done ? "✓" : "○"}
                      </div>
                      <span className="text-sm font-medium"
                        style={{ color: item.done ? "#15803D" : "var(--rtm-text-secondary)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {isReadyForOpportunity && (
                <section>
                  <div className="rounded-xl p-5 border-2"
                    style={{ background: "#ECFDF5", borderColor: "#059669" }}>
                    <p className="text-sm font-bold mb-1" style={{ color: "#059669" }}>🚀 Ready For Opportunity</p>
                    <p className="text-xs mb-4" style={{ color: "#15803D" }}>
                      All readiness criteria met. Create an opportunity in the Sales Pipeline to advance this lead.
                    </p>
                    <div className="flex gap-2">
                      <Link href="/sales/pipeline"
                        className="text-xs px-4 py-2 rounded-lg font-bold inline-block"
                        style={{ background: "#059669", color: "#fff" }}>
                        Create Opportunity
                      </Link>
                      <Link href="/sales/pipeline"
                        className="text-xs px-4 py-2 rounded-lg font-semibold border inline-block"
                        style={{ background: "#fff", color: "#059669", borderColor: "#A7F3D0" }}>
                        Send To Pipeline →
                      </Link>
                      <Link href="/sales/pipeline"
                        className="text-xs px-4 py-2 rounded-lg font-semibold border inline-block"
                        style={{ background: "#fff", color: "#15803D", borderColor: "#A7F3D0" }}>
                        Open Pipeline →
                      </Link>
                    </div>
                  </div>
                </section>
              )}

              {!isReadyForOpportunity && (
                <section>
                  <div className="rounded-lg p-4 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: "var(--rtm-text-primary)" }}>Next Steps</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>
                      Complete outstanding readiness criteria above before creating an opportunity.
                      Opportunity management happens in <strong>/sales/pipeline</strong>.
                    </p>
                  </div>
                </section>
              )}
            </>
          )}

          {/* ── AFFILIATE ── */}
          {activeTab === "affiliate" && (
            <>
              {lead.affiliateName !== "—" ? (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Attribution</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      ["Affiliate Name",    lead.affiliateName],
                      ["GHL Contact Source", lead.ghlSource],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-lg p-3 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
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
                <div className="rounded-lg p-6 border text-center" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>This lead has no affiliate attribution.</p>
                </div>
              )}
            </>
          )}

          {/* ── TIMELINE ── */}
          {activeTab === "timeline" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Lead Journey</h3>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: "var(--rtm-border)" }} />
                  {timeline.map((item, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className="absolute -left-4 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]"
                        style={{ background: "var(--rtm-surface)", borderColor: workspace.accentColor }}>
                        {(item as { icon?: string; date: string; event: string }).icon ?? "·"}
                      </div>
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
                <div className="rounded-lg p-4 border text-sm"
                  style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                  {lead.notes || "No notes added."}
                </div>
                <button className="mt-2 rtm-btn-secondary text-xs px-3 py-1.5">Add Note</button>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex gap-2">
            <button className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
              style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}>
              Disqualify
            </button>
          </div>
          <div className="flex gap-2">
            <button className="rtm-btn-secondary text-xs px-3 py-1.5">Move Stage</button>
            {isReadyForOpportunity ? (
              <Link href="/sales/pipeline"
                className="text-xs px-3 py-1.5 rounded-lg font-bold inline-block"
                style={{ background: "#059669", color: "#fff" }}>
                Create Opportunity →
              </Link>
            ) : (
              <button className="rtm-btn-primary text-xs px-3 py-1.5" disabled={!isQualified}
                style={{ opacity: isQualified ? 1 : 0.4 }}>
                Create Opportunity
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SalesLeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [stageFilter, setStageFilter]   = useState<LeadStage | "All">("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [syncFilter, setSyncFilter]     = useState<GHLSyncStatus | "All">("All");
  const [searchQuery, setSearchQuery]   = useState("");
  const [showSyncPanel, setShowSyncPanel] = useState(false);

  const filtered = LEADS.filter(l => {
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

  // ── KPI calcs ──
  const newLeads            = LEADS.filter(l => l.stage === "New Lead").length;
  const contactAttempted    = LEADS.filter(l => l.stage === "Contact Attempted").length;
  const discoveryScheduled  = LEADS.filter(l => l.stage === "Discovery Scheduled").length;
  const discoveryComplete   = LEADS.filter(l => l.stage === "Discovery Complete").length;
  const qualifiedLeads      = LEADS.filter(l => l.stage === "Qualified").length;
  const disqualifiedLeads   = LEADS.filter(l => l.stage === "Disqualified").length;
  const readyForOpp         = LEADS.filter(l => l.opportunityReadiness === "Ready For Opportunity").length;
  const ghlSynced           = LEADS.filter(l => l.ghlSyncStatus === "Synced").length;
  const ghlPending          = LEADS.filter(l => l.ghlSyncStatus === "Pending Sync").length;
  const ghlFailed           = LEADS.filter(l => l.ghlSyncStatus === "Sync Failed").length;
  const conversionRate      = Math.round((qualifiedLeads / LEADS.length) * 100);

  const stageCounts = Object.fromEntries(LEAD_STAGES.map(s => [s, LEADS.filter(l => l.stage === s).length]));
  const sources     = Array.from(new Set(LEADS.map(l => l.leadSource)));
  const sourceCounts= Object.fromEntries(sources.map(s => [s, LEADS.filter(l => l.leadSource === s).length]));

  return (
    <div className="space-y-6">
      {selectedLead && <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>
            Lead Management Center
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            GHL contact intake · Lead qualification · Discovery management · Opportunity readiness
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[11px] px-2 py-0.5 rounded font-semibold"
              style={{ background: "#ECFDF5", color: "#059669" }}>
              Lead Management
            </span>
            <span className="text-[11px]" style={{ color: "var(--rtm-text-muted)" }}>·</span>
            <Link href="/sales/pipeline" className="text-[11px] px-2 py-0.5 rounded font-semibold"
              style={{ background: "#EEF2FF", color: "#6366F1" }}>
              Opportunity Management → /sales/pipeline
            </Link>
          </div>
        </div>

        {/* Top Action Bar */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button className="rtm-btn-primary text-sm flex items-center gap-1.5 px-3 py-2">
            <span>＋</span> Add Lead
          </button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">↑ Import Leads</button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">👤 Assign Leads</button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">↓ Export Leads</button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">📊 Lead Sources Report</button>
          <button
            onClick={() => setShowSyncPanel(v => !v)}
            className="text-sm px-3 py-2 rounded-lg font-semibold border transition-colors"
            style={{
              background: showSyncPanel ? "#ECFDF5" : "var(--rtm-surface)",
              color: showSyncPanel ? "#059669" : "var(--rtm-text-primary)",
              borderColor: showSyncPanel ? "#A7F3D0" : "var(--rtm-border)",
            }}>
            🔗 Sync GHL Contacts
          </button>
          <button
            onClick={() => setShowSyncPanel(v => !v)}
            className="text-sm px-3 py-2 rounded-lg font-semibold border transition-colors"
            style={{
              background: ghlFailed > 0 ? "#FEF2F2" : "var(--rtm-surface)",
              color: ghlFailed > 0 ? "#DC2626" : "var(--rtm-text-primary)",
              borderColor: ghlFailed > 0 ? "#FECACA" : "var(--rtm-border)",
            }}>
            {ghlFailed > 0 ? `⚠️ ${ghlFailed} Sync Issues` : "✓ GHL Sync Status"}
          </button>
        </div>
      </div>

      {/* ── GHL Sync Panel ── */}
      {showSyncPanel && (
        <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>GHL Lead Sync Status</h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
                GoHighLevel contact synchronization · Last sync: Today, 9:42 AM
              </p>
            </div>
            <button onClick={() => setShowSyncPanel(false)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)", border: "1px solid var(--rtm-border)" }}>
              Close
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Synced Contacts",  value: ghlSynced,  color: "#059669", bg: "#ECFDF5" },
              { label: "Pending Sync",     value: ghlPending, color: "#D97706", bg: "#FFFBEB" },
              { label: "Sync Failed",      value: ghlFailed,  color: "#DC2626", bg: "#FEF2F2" },
              { label: "Manual Override",  value: LEADS.filter(l => l.ghlSyncStatus === "Manual Override").length, color: "#7C3AED", bg: "#F5F3FF" },
            ].map(item => (
              <div key={item.label} className="rounded-lg p-4 border"
                style={{ background: item.bg, borderColor: `${item.color}30` }}>
                <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</p>
                <p className="text-[10px] font-bold mt-0.5 uppercase tracking-wide" style={{ color: item.color }}>{item.label}</p>
              </div>
            ))}
          </div>

          {ghlFailed > 0 && (
            <div className="rounded-lg p-4 border mb-4" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
              <p className="text-sm font-bold mb-2" style={{ color: "#DC2626" }}>⚠️ Sync Issues Detected</p>
              <div className="space-y-2">
                {LEADS.filter(l => l.ghlSyncStatus === "Sync Failed").map(l => (
                  <div key={l.id} className="flex items-center justify-between text-xs"
                    style={{ color: "#B91C1C" }}>
                    <span>{l.businessName} ({l.ghlContactId})</span>
                    <button className="px-2 py-0.5 rounded font-bold"
                      style={{ background: "#DC2626", color: "#fff" }}>Retry</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {(["Synced", "Pending Sync", "Sync Failed", "Manual Override"] as GHLSyncStatus[]).map(s => (
              <button key={s}
                onClick={() => setSyncFilter(syncFilter === s ? "All" : s)}
                className="text-xs px-3 py-1.5 rounded-lg font-semibold border transition-colors"
                style={{
                  background: syncFilter === s ? GHL_SYNC_CONFIG[s].bg : "var(--rtm-bg)",
                  color: syncFilter === s ? GHL_SYNC_CONFIG[s].color : "var(--rtm-text-muted)",
                  borderColor: syncFilter === s ? GHL_SYNC_CONFIG[s].color : "var(--rtm-border)",
                }}>
                {GHL_SYNC_CONFIG[s].icon} Filter: {s}
              </button>
            ))}
            {syncFilter !== "All" && (
              <button onClick={() => setSyncFilter("All")}
                className="text-xs px-2 py-1 rounded font-semibold"
                style={{ background: "#FEF2F2", color: "#DC2626" }}>
                Clear Sync Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { title: "New Leads",            value: String(newLeads),           icon: "🎯", iconBg: "#EEF2FF", iconColor: "#6366F1", trend: "up" as const,      trendValue: "+5"  },
          { title: "Contact Attempted",    value: String(contactAttempted),   icon: "📞", iconBg: "#F5F3FF", iconColor: "#8B5CF6", trend: "neutral" as const, trendValue: "±0"  },
          { title: "Discovery Scheduled",  value: String(discoveryScheduled), iconBg: "#F0F9FF", iconColor: "#0284C7", trend: "up" as const,      trendValue: "+2"  },
          { title: "Discovery Complete",   value: String(discoveryComplete),  icon: "🔍", iconBg: "#ECFEFF", iconColor: "#0891B2", trend: "up" as const,      trendValue: "+3"  },
          { title: "Qualified Leads",      value: String(qualifiedLeads),     icon: "✅", iconBg: "#FFFBEB", iconColor: "#D97706", trend: "up" as const,      trendValue: "+4"  },
          { title: "Disqualified",         value: String(disqualifiedLeads),  icon: "✕",  iconBg: "#F1F5F9", iconColor: "#94A3B8", trend: "neutral" as const, trendValue: "±0"  },
          { title: "Conversion Rate",      value: `${conversionRate}%`,       icon: "📈", iconBg: "#F0FDF4", iconColor: "#16A34A", trend: "up" as const,      trendValue: "+2%" },
          { title: "GHL Contacts Synced",  value: String(ghlSynced),          icon: "🔗", iconBg: "#ECFDF5", iconColor: "#059669", trend: "up" as const,      trendValue: `+${ghlSynced}` },
        ].map(card => (
          <KpiCard key={card.title} title={card.title} value={card.value}
            icon={<span className="text-lg">{card.icon}</span>}
            iconBg={card.iconBg} iconColor={card.iconColor}
            trend={card.trend} trendValue={card.trendValue} />
        ))}
      </div>

      {/* ── Lead Stage Pipeline ── */}
      <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Lead Stages</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>
              {LEADS.length} total leads · {readyForOpp} ready for opportunity
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/sales/pipeline"
              className="rtm-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
              <span>→</span> Sales Pipeline
            </Link>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {LEAD_STAGES.map(stage => {
            const cfg   = STAGE_CONFIG[stage];
            const count = stageCounts[stage] || 0;
            const isActive = stageFilter === stage;
            return (
              <button key={stage}
                onClick={() => setStageFilter(isActive ? "All" : stage)}
                className="flex-shrink-0 rounded-xl border p-3 text-left min-w-[140px] transition-all"
                style={{
                  background: isActive ? cfg.bg : "var(--rtm-bg)",
                  borderColor: isActive ? cfg.color : "var(--rtm-border)",
                  boxShadow: isActive ? `0 0 0 2px ${cfg.color}30` : undefined,
                }}>
                <p className="text-2xl font-bold mb-1" style={{ color: cfg.color }}>{count}</p>
                <p className="text-[10px] font-bold leading-tight" style={{ color: cfg.color }}>{stage}</p>
              </button>
            );
          })}
        </div>

        {/* Lead → Opportunity Workflow */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--rtm-border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>
            Lead → Opportunity Workflow
          </p>
          <div className="flex items-center gap-1 flex-wrap text-[10px] font-semibold">
            {[
              { label: "Lead Created",         here: true },
              { label: "Assigned",             here: true },
              { label: "Contacted",            here: true },
              { label: "Discovery",            here: true },
              { label: "Qualified",            here: true },
              { label: "Create Opportunity",   here: false },
              { label: "Sales Pipeline",       here: false },
            ].map((step, i, arr) => (
              <span key={step.label} className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded"
                  style={{
                    background: step.here ? "var(--rtm-bg)" : "#EEF2FF",
                    color: step.here ? "var(--rtm-text-secondary)" : "#6366F1",
                    border: step.here ? "1px solid var(--rtm-border)" : "1px solid #C7D2FE",
                    fontWeight: step.here ? 500 : 700,
                  }}>
                  {step.here ? step.label : `→ ${step.label}`}
                </span>
                {i < arr.length - 1 && step.here && arr[i + 1].here && (
                  <span style={{ color: workspace.accentColor }}>→</span>
                )}
              </span>
            ))}
          </div>
          <p className="text-[10px] mt-2" style={{ color: "var(--rtm-text-muted)" }}>
            Leads live here. Opportunities belong in{" "}
            <Link href="/sales/pipeline" className="font-bold underline" style={{ color: "#6366F1" }}>
              /sales/pipeline
            </Link>
          </p>
        </div>
      </div>

      {/* ── Lead Sources ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {sources.sort((a, b) => sourceCounts[b] - sourceCounts[a]).map(source => {
          const color    = SOURCE_COLORS[source] ?? "#64748B";
          const isActive = sourceFilter === source;
          return (
            <button key={source}
              onClick={() => setSourceFilter(isActive ? "All" : source)}
              className="rounded-xl border p-3 text-center transition-all"
              style={{
                background: isActive ? `${color}15` : "var(--rtm-surface)",
                borderColor: isActive ? color : "var(--rtm-border)",
              }}>
              <p className="text-xl font-bold" style={{ color }}>{sourceCounts[source]}</p>
              <p className="text-[10px] font-bold mt-0.5 leading-tight"
                style={{ color: isActive ? color : "var(--rtm-text-muted)" }}>{source}</p>
            </button>
          );
        })}
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>🔍</span>
          <input
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, business, industry, or GHL ID..."
            className="w-full pl-8 pr-4 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          <span>{filtered.length} leads</span>
          {(stageFilter !== "All" || sourceFilter !== "All" || syncFilter !== "All" || searchQuery) && (
            <button
              onClick={() => { setStageFilter("All"); setSourceFilter("All"); setSyncFilter("All"); setSearchQuery(""); }}
              className="px-2 py-1 rounded font-semibold"
              style={{ background: "#FEF2F2", color: "#DC2626" }}>
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* ── Lead Table ── */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--rtm-border)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)" }}>
                {[
                  "Lead Name", "Business Name", "Lead Source", "Assigned Rep",
                  "Lead Stage", "Opp Readiness", "GHL Sync Status",
                  "Created Date", "Last Activity", "Actions",
                ].map(h => (
                  <th key={h}
                    className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
              {filtered.map((lead, i) => {
                const isReady = lead.opportunityReadiness === "Ready For Opportunity";
                return (
                  <tr key={lead.id}
                    className="transition-colors hover:cursor-pointer"
                    style={{ background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}
                    onClick={() => setSelectedLead(lead)}>

                    {/* Lead Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{lead.name}</p>
                      <p className="text-xs font-mono" style={{ color: "var(--rtm-text-muted)" }}>{lead.ghlContactId}</p>
                    </td>

                    {/* Business Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{lead.businessName}</p>
                      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{lead.location}</p>
                    </td>

                    {/* Lead Source */}
                    <td className="px-4 py-3 whitespace-nowrap">{sourceBadge(lead.leadSource)}</td>

                    {/* Assigned Rep */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{lead.assignedRep}</p>
                    </td>

                    {/* Lead Stage */}
                    <td className="px-4 py-3 whitespace-nowrap">{stageBadge(lead.stage)}</td>

                    {/* Opportunity Readiness */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="space-y-1">
                        {readinessBadge(lead.opportunityReadiness)}
                        {isReady && (
                          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                            <Link href="/sales/pipeline"
                              className="text-[10px] px-1.5 py-0.5 rounded font-bold inline-block"
                              style={{ background: "#059669", color: "#fff" }}>
                              Create Opp
                            </Link>
                            <Link href="/sales/pipeline"
                              className="text-[10px] px-1.5 py-0.5 rounded font-semibold border inline-block"
                              style={{ color: "#059669", borderColor: "#A7F3D0", background: "#F0FDF4" }}>
                              Pipeline →
                            </Link>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* GHL Sync Status */}
                    <td className="px-4 py-3 whitespace-nowrap">{ghlSyncBadge(lead.ghlSyncStatus)}</td>

                    {/* Created Date */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{lead.createdDate}</p>
                    </td>

                    {/* Last Activity */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-secondary)" }}>{lead.lastActivity}</p>
                    </td>

                    {/* Actions */}
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
                          <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border shadow-lg z-10 hidden group-hover:block"
                            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                            {["Edit Lead", "Assign Sales Rep", "Schedule Discovery", "Create Follow-Up", "Move Stage", "Retry GHL Sync", "Add Note", "Disqualify"].map(action => (
                              <button key={action}
                                className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                                style={{ color: action === "Disqualify" ? "#DC2626" : "var(--rtm-text-primary)" }}>
                                {action}
                              </button>
                            ))}
                            {isReady && (
                              <Link href="/sales/pipeline"
                                className="block w-full text-left px-3 py-2 text-xs font-bold rounded-b-lg"
                                style={{ color: "#059669", background: "#ECFDF5" }}>
                                🚀 Create Opportunity →
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No leads match your filters.</p>
            <button
              onClick={() => { setStageFilter("All"); setSourceFilter("All"); setSyncFilter("All"); setSearchQuery(""); }}
              className="mt-3 rtm-btn-secondary text-xs px-3 py-1.5">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* ── Bottom Navigation ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Sales Pipeline",  href: "/sales/pipeline",  icon: "📊", desc: "Opportunity management · deal stages · close tracking", color: "#6366F1" },
          { label: "Tasks Center",    href: "/tasks",            icon: "✅", desc: "Follow-ups · discovery reminders · lead tasks",          color: "#0284C7" },
          { label: "Workflows",       href: "/admin/workflows",  icon: "⚙️", desc: "Lead → discovery → qualification automation",          color: "#7C3AED" },
          { label: "Affiliates",      href: "/sales/affiliates", desc: "Affiliate attribution · commission tracking",            color: "#D97706" },
        ].map(item => (
          <Link key={item.label} href={item.href}
            className="rounded-xl border p-4 flex items-start gap-3 transition-all hover:shadow-md"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: `${item.color}15` }}>{item.icon}</div>
            <div className="min-w-0">
              <p className="text-sm font-bold" style={{ color: item.color }}>{item.label} →</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
