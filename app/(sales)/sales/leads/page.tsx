"use client";

import React, { useState } from "react";
import { KpiCard, StatusBadge, ProgressBar } from "@/components/ui";
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
  | "Audit Requested"
  | "Audit In Progress"
  | "Proposal Opportunity"
  | "Lost"
  | "Disqualified";

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

type DiscoveryStatus = "Not Scheduled" | "Scheduled" | "Completed" | "No Show";
type AuditStatus = "Not Requested" | "Requested" | "In Progress" | "Completed" | "N/A";

interface Lead {
  id: string;
  name: string;
  businessName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  location: string;
  leadSource: LeadSource;
  assignedRep: string;
  stage: LeadStage;
  opportunityScore: number;
  estimatedValue: number;
  discoveryStatus: DiscoveryStatus;
  discoveryDate: string;
  discoveryNotes: string;
  businessGoals: string[];
  painPoints: string[];
  requestedServices: string[];
  auditStatus: AuditStatus;
  affiliateSource: string;
  affiliateName: string;
  affiliateCode: string;
  commissionEligible: boolean;
  potentialCommission: number;
  createdDate: string;
  lastActivity: string;
  budget: "High" | "Medium" | "Low" | "Unknown";
  authority: "Decision Maker" | "Influencer" | "Unknown";
  need: "High" | "Medium" | "Low";
  timeline: "Immediate" | "1-3 months" | "3-6 months" | "6+ months";
  competitors: string[];
  currentChannels: string[];
  notes: string;
}

// ─── Mock Data (50+ leads) ────────────────────────────────────────────────────

const LEADS: Lead[] = [
  {
    id: "L001", name: "Marcus Webb", businessName: "Summit Landscaping", industry: "Landscaping",
    website: "summitlandscaping.com", email: "marcus@summitlandscaping.com", phone: "(512) 555-0101",
    location: "Austin, TX", leadSource: "Affiliate", assignedRep: "Jordan M.", stage: "Proposal Opportunity",
    opportunityScore: 87, estimatedValue: 2400, discoveryStatus: "Completed", discoveryDate: "2024-12-10",
    discoveryNotes: "Owner is motivated, has budget, wants full SEO + GBP package.",
    businessGoals: ["Increase local leads by 40%", "Dominate Google Maps in Austin"],
    painPoints: ["No online visibility", "Losing to competitors on Google"],
    requestedServices: ["SEO", "GBP", "Reporting"],
    auditStatus: "In Progress", affiliateSource: "Affiliate", affiliateName: "Brandon Ellis",
    affiliateCode: "BE-2024", commissionEligible: true, potentialCommission: 240,
    createdDate: "2024-12-01", lastActivity: "Today", budget: "Medium", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["GreenEdge", "LawnPro"], currentChannels: ["Facebook", "Word of mouth"],
    notes: "Very engaged, ready to move forward quickly.",
  },
  {
    id: "L002", name: "Priya Sharma", businessName: "Blue Ridge Plumbing", industry: "Plumbing",
    website: "blueridgeplumbing.com", email: "priya@blueridgeplumbing.com", phone: "(303) 555-0202",
    location: "Denver, CO", leadSource: "Website", assignedRep: "Sarah K.", stage: "Discovery Scheduled",
    opportunityScore: 62, estimatedValue: 1800, discoveryStatus: "Scheduled", discoveryDate: "2024-12-20",
    discoveryNotes: "",
    businessGoals: ["More emergency calls", "Rank #1 for Denver plumber"],
    painPoints: ["Low Google ranking", "No PPC experience"],
    requestedServices: ["SEO", "PPC", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-05", lastActivity: "Yesterday", budget: "Medium", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["Denver Drain", "RotoRooter"], currentChannels: ["Yelp", "Thumbtack"],
    notes: "Referred by website contact form.",
  },
  {
    id: "L003", name: "Derek Holt", businessName: "Harbor Auto Group", industry: "Automotive",
    website: "harborautogroup.com", email: "derek@harborautogroup.com", phone: "(619) 555-0303",
    location: "San Diego, CA", leadSource: "Outbound", assignedRep: "Mike T.", stage: "Audit In Progress",
    opportunityScore: 91, estimatedValue: 5000, discoveryStatus: "Completed", discoveryDate: "2024-11-28",
    discoveryNotes: "Large dealership group. Wants PPC, Meta, and full reporting stack.",
    businessGoals: ["Drive 200+ leads/mo from digital", "Beat Toyota dealership on Google"],
    painPoints: ["Wasted ad spend", "No attribution", "Poor Meta ROI"],
    requestedServices: ["PPC", "Meta Ads", "Reporting", "SEO"],
    auditStatus: "In Progress", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-15", lastActivity: "2 days ago", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["AutoNation", "Hendrick"], currentChannels: ["Google Ads", "Facebook"],
    notes: "High value deal. Needs full audit before proposal.",
  },
  {
    id: "L004", name: "Tanya Okafor", businessName: "Cascade Flooring", industry: "Home Improvement",
    website: "cascadeflooring.com", email: "tanya@cascadeflooring.com", phone: "(425) 555-0404",
    location: "Seattle, WA", leadSource: "Partner", assignedRep: "Alex R.", stage: "Discovery Scheduled",
    opportunityScore: 48, estimatedValue: 3200, discoveryStatus: "Scheduled", discoveryDate: "2024-12-22",
    discoveryNotes: "",
    businessGoals: ["Grow commercial flooring contracts", "Rank for flooring install near Seattle"],
    painPoints: ["Inconsistent lead flow", "Too dependent on referrals"],
    requestedServices: ["SEO", "Web"],
    auditStatus: "Not Requested", affiliateSource: "Partner", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-08", lastActivity: "3 days ago", budget: "Medium", authority: "Influencer",
    need: "Medium", timeline: "3-6 months", competitors: ["FloorCraft", "Empire"], currentChannels: ["Instagram"],
    notes: "Partner referral via BuildRight network.",
  },
  {
    id: "L005", name: "Dr. Lucia Vega", businessName: "Metro Dental Group", industry: "Dental",
    website: "metrodentalgroup.com", email: "lvega@metrodentalgroup.com", phone: "(312) 555-0505",
    location: "Chicago, IL", leadSource: "Affiliate", assignedRep: "Jordan M.", stage: "Proposal Opportunity",
    opportunityScore: 79, estimatedValue: 4500, discoveryStatus: "Completed", discoveryDate: "2024-12-08",
    discoveryNotes: "3-location dental group. Strong budget. Wants SEO + GBP + PPC.",
    businessGoals: ["Fill schedule for all 3 locations", "Rank top 3 in Chicago dental"],
    painPoints: ["Low Google reviews", "No organic visibility"],
    requestedServices: ["SEO", "GBP", "PPC", "Reporting"],
    auditStatus: "Requested", affiliateSource: "Affiliate", affiliateName: "Maria Santos",
    affiliateCode: "MS-2024", commissionEligible: true, potentialCommission: 450,
    createdDate: "2024-11-28", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Aspen Dental", "ClearChoice"], currentChannels: ["Google Ads", "Yelp"],
    notes: "Affiliate referral from Maria Santos. Hot lead.",
  },
  {
    id: "L006", name: "Brent Calloway", businessName: "Sunstate Solar", industry: "Solar",
    website: "sunstatesolar.com", email: "brent@sunstatesolar.com", phone: "(480) 555-0606",
    location: "Phoenix, AZ", leadSource: "Google Ads", assignedRep: "Sarah K.", stage: "Proposal Opportunity",
    opportunityScore: 95, estimatedValue: 6000, discoveryStatus: "Completed", discoveryDate: "2024-11-20",
    discoveryNotes: "Rapid growth company. Wants LSA + PPC + SEO.",
    businessGoals: ["10x lead volume", "Expand to Tucson market"],
    painPoints: ["Too dependent on Google Ads", "No SEO foundation"],
    requestedServices: ["LSA", "PPC", "SEO", "GBP"],
    auditStatus: "Completed", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-01", lastActivity: "1 week ago", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["SunPower", "Vivint"], currentChannels: ["Google Ads"],
    notes: "Moving to proposal phase. Audit complete.",
  },
  {
    id: "L007", name: "Grace Lundberg", businessName: "Green Valley Pools", industry: "Pool & Spa",
    website: "greenvalleypools.com", email: "grace@greenvalleypools.com", phone: "(602) 555-0707",
    location: "Scottsdale, AZ", leadSource: "Referral", assignedRep: "Alex R.", stage: "Discovery Scheduled",
    opportunityScore: 41, estimatedValue: 2000, discoveryStatus: "Scheduled", discoveryDate: "2024-12-19",
    discoveryNotes: "",
    businessGoals: ["Book summer installs 6 months out", "Rank for pool installation Phoenix"],
    painPoints: ["Seasonal business", "No digital presence"],
    requestedServices: ["SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Referral", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-10", lastActivity: "4 days ago", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["PoolCo", "AZ Pools"], currentChannels: ["Word of mouth"],
    notes: "Client referral from Summit Landscaping.",
  },
  {
    id: "L008", name: "Dr. Aaron Park", businessName: "Apex Dental Partners", industry: "Dental",
    website: "apexdentalpartners.com", email: "apark@apexdental.com", phone: "(415) 555-0808",
    location: "San Francisco, CA", leadSource: "Affiliate", assignedRep: "Mike T.", stage: "Audit In Progress",
    opportunityScore: 88, estimatedValue: 8000, discoveryStatus: "Completed", discoveryDate: "2024-12-05",
    discoveryNotes: "DSO with 7 locations. Massive opportunity. Full marketing stack.",
    businessGoals: ["Fill 7 offices to capacity", "Dominate Bay Area dental market"],
    painPoints: ["Fragmented marketing across locations", "No centralized reporting"],
    requestedServices: ["SEO", "GBP", "PPC", "Meta Ads", "Reporting"],
    auditStatus: "In Progress", affiliateSource: "Affiliate", affiliateName: "Tyler Nguyen",
    affiliateCode: "TN-2024", commissionEligible: true, potentialCommission: 800,
    createdDate: "2024-11-20", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Smile Brands", "Pacific Dental"], currentChannels: ["Google Ads", "Instagram"],
    notes: "Tyler Nguyen affiliate. Highest value lead in pipeline.",
  },
  {
    id: "L009", name: "Amber Chen", businessName: "Coastal Wellness Spa", industry: "Health & Wellness",
    website: "coastalwellnessspa.com", email: "amber@coastalwellness.com", phone: "(858) 555-0909",
    location: "San Diego, CA", leadSource: "Affiliate", assignedRep: "Jordan M.", stage: "Proposal Opportunity",
    opportunityScore: 82, estimatedValue: 3800, discoveryStatus: "Completed", discoveryDate: "2024-11-30",
    discoveryNotes: "Premium spa. Wants Meta Ads + SEO. Strong budget.",
    businessGoals: ["Fill appointment book 4 weeks out", "Build Instagram following"],
    painPoints: ["Slow weekdays", "No Meta strategy"],
    requestedServices: ["Meta Ads", "SEO", "Creative"],
    auditStatus: "Requested", affiliateSource: "Affiliate", affiliateName: "Lisa Park",
    affiliateCode: "LP-2024", commissionEligible: true, potentialCommission: 380,
    createdDate: "2024-11-18", lastActivity: "3 days ago", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["Massage Envy", "Hand & Stone"], currentChannels: ["Instagram", "Yelp"],
    notes: "Lisa Park referral. Audit requested.",
  },
  {
    id: "L010", name: "Carlos Rivera", businessName: "Ridgeline Dentistry", industry: "Dental",
    website: "ridgelinedentistry.com", email: "crivera@ridgelinedentistry.com", phone: "(720) 555-1010",
    location: "Boulder, CO", leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Discovery Scheduled",
    opportunityScore: 55, estimatedValue: 2200, discoveryStatus: "Scheduled", discoveryDate: "2024-12-21",
    discoveryNotes: "",
    businessGoals: ["Grow new patient count by 30%", "Rank top 3 in Boulder dental"],
    painPoints: ["Low online reviews", "Minimal SEO"],
    requestedServices: ["SEO", "GBP", "Reporting"],
    auditStatus: "Not Requested", affiliateSource: "Affiliate", affiliateName: "Carlos Reyes",
    affiliateCode: "CR-2024", commissionEligible: true, potentialCommission: 220,
    createdDate: "2024-12-07", lastActivity: "Today", budget: "Medium", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["Boulder Dental", "Aspen Smiles"], currentChannels: ["Google My Business"],
    notes: "Carlos Reyes affiliate. Needs discovery call.",
  },
  {
    id: "L011", name: "Finn O'Brien", businessName: "Iron Forge Fitness", industry: "Fitness",
    website: "ironforgefit.com", email: "finn@ironforgefit.com", phone: "(617) 555-1111",
    location: "Boston, MA", leadSource: "Meta Ads", assignedRep: "Alex R.", stage: "Contacted",
    opportunityScore: 38, estimatedValue: 1500, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Grow gym membership by 50%", "Build local brand awareness"],
    painPoints: ["Low membership signups", "No digital ads"],
    requestedServices: ["Meta Ads", "SEO"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-12", lastActivity: "Yesterday", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["Planet Fitness", "Equinox"], currentChannels: ["Instagram"],
    notes: "Meta Ads inbound. Initial contact made.",
  },
  {
    id: "L012", name: "Natasha Brown", businessName: "Silverstone Law Group", industry: "Legal",
    website: "silverstonelaw.com", email: "nbrown@silverstonelaw.com", phone: "(213) 555-1212",
    location: "Los Angeles, CA", leadSource: "LSA", assignedRep: "Mike T.", stage: "Qualified",
    opportunityScore: 76, estimatedValue: 4200, discoveryStatus: "Completed", discoveryDate: "2024-12-02",
    discoveryNotes: "Personal injury firm. Wants LSA + PPC. Ready to move.",
    businessGoals: ["Dominate LSA for personal injury in LA", "50+ inbound calls/mo"],
    painPoints: ["High cost per lead", "Google LSA not optimized"],
    requestedServices: ["LSA", "PPC", "GBP"],
    auditStatus: "Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-25", lastActivity: "2 days ago", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Jacoby & Meyers", "Morgan & Morgan"], currentChannels: ["LSA", "Google Ads"],
    notes: "LSA inbound. Strong budget. Audit requested.",
  },
  {
    id: "L013", name: "Ethan Kowalski", businessName: "Peak Performance Chiro", industry: "Chiropractic",
    website: "peakperformancechiro.com", email: "ethan@peakchiro.com", phone: "(503) 555-1313",
    location: "Portland, OR", leadSource: "GBP", assignedRep: "Jordan M.", stage: "New Lead",
    opportunityScore: 29, estimatedValue: 1200, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More new patient appointments"],
    painPoints: ["No digital marketing"],
    requestedServices: ["SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-14", lastActivity: "Today", budget: "Low", authority: "Unknown",
    need: "Medium", timeline: "3-6 months", competitors: ["HealthSource"], currentChannels: ["GBP"],
    notes: "GBP inquiry. Fresh lead.",
  },
  {
    id: "L014", name: "Rachel Torres", businessName: "Horizon Roofing Solutions", industry: "Roofing",
    website: "horizonroofing.com", email: "rtorres@horizonroofing.com", phone: "(214) 555-1414",
    location: "Dallas, TX", leadSource: "Google Ads", assignedRep: "Sarah K.", stage: "Audit In Progress",
    opportunityScore: 84, estimatedValue: 3600, discoveryStatus: "Completed", discoveryDate: "2024-11-25",
    discoveryNotes: "Storm damage roofing. Seasonal spikes. Wants LSA + PPC domination.",
    businessGoals: ["100 calls in storm season", "Rank top LSA for Dallas roofing"],
    painPoints: ["Missed storm season opportunities", "Competitor outspending on LSA"],
    requestedServices: ["LSA", "PPC", "GBP", "SEO"],
    auditStatus: "In Progress", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-10", lastActivity: "Yesterday", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Storm Guard", "Owens Corning"], currentChannels: ["Google Ads", "LSA"],
    notes: "Strong Google Ads lead. Audit underway.",
  },
  {
    id: "L015", name: "Jake Morrison", businessName: "Morrison HVAC & Cooling", industry: "HVAC",
    website: "morrisonhvac.com", email: "jake@morrisonhvac.com", phone: "(602) 555-1515",
    location: "Phoenix, AZ", leadSource: "Referral", assignedRep: "Alex R.", stage: "Discovery Complete",
    opportunityScore: 68, estimatedValue: 2800, discoveryStatus: "Completed", discoveryDate: "2024-12-09",
    discoveryNotes: "Family-owned HVAC. Ready to scale. Wants SEO + GBP + PPC.",
    businessGoals: ["Rank #1 for AC repair Phoenix", "Book out install schedule 3 months ahead"],
    painPoints: ["Low Google ranking", "Competitor LSA domination"],
    requestedServices: ["SEO", "GBP", "PPC"],
    auditStatus: "Not Requested", affiliateSource: "Referral", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-01", lastActivity: "Today", budget: "Medium", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["George Brazil", "ARS"], currentChannels: ["Yelp", "Nextdoor"],
    notes: "Client referral. Discovery complete. Move to audit.",
  },
  {
    id: "L016", name: "Diana Pham", businessName: "Luxe Med Spa", industry: "Medical Spa",
    website: "luxemedspa.com", email: "diana@luxemedspa.com", phone: "(310) 555-1616",
    location: "Beverly Hills, CA", leadSource: "Meta Ads", assignedRep: "Mike T.", stage: "Proposal Opportunity",
    opportunityScore: 90, estimatedValue: 7500, discoveryStatus: "Completed", discoveryDate: "2024-11-22",
    discoveryNotes: "High-end med spa. Botox, fillers, lasers. Wants Meta + SEO + Creative.",
    businessGoals: ["Fill Botox appointments 8 weeks out", "Build Instagram brand to 50K"],
    painPoints: ["Inconsistent Meta Ads results", "No creative strategy"],
    requestedServices: ["Meta Ads", "SEO", "Creative", "Reporting"],
    auditStatus: "Completed", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-08", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["LaserAway", "Ideal Image"], currentChannels: ["Instagram", "Meta Ads"],
    notes: "Premium deal. Audit complete. Proposal ready.",
  },
  {
    id: "L017", name: "Tom Nguyen", businessName: "Pacific Pest Control", industry: "Pest Control",
    website: "pacificpest.com", email: "tom@pacificpest.com", phone: "(206) 555-1717",
    location: "Seattle, WA", leadSource: "Website", assignedRep: "Jordan M.", stage: "Contact Attempted",
    opportunityScore: 22, estimatedValue: 900, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More recurring service accounts"],
    painPoints: ["No online presence"],
    requestedServices: ["SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-13", lastActivity: "Today", budget: "Low", authority: "Unknown",
    need: "Low", timeline: "6+ months", competitors: ["Orkin", "Terminix"], currentChannels: ["None"],
    notes: "Website form fill. Left voicemail.",
  },
  {
    id: "L018", name: "Sandra Kim", businessName: "Bright Minds Tutoring", industry: "Education",
    website: "brightmindstutoring.com", email: "sandra@brightmindstutoring.com", phone: "(408) 555-1818",
    location: "San Jose, CA", leadSource: "Google Ads", assignedRep: "Sarah K.", stage: "Lost",
    opportunityScore: 15, estimatedValue: 800, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More student enrollments"],
    painPoints: ["Too expensive per lead"],
    requestedServices: ["SEO"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-30", lastActivity: "1 week ago", budget: "Low", authority: "Decision Maker",
    need: "Low", timeline: "6+ months", competitors: ["Kumon", "Sylvan"], currentChannels: ["Google Ads"],
    notes: "Went with competitor. Price objection.",
  },
  {
    id: "L019", name: "Victor Espinoza", businessName: "Elite Concrete & Masonry", industry: "Construction",
    website: "eliteconcrete.com", email: "victor@eliteconcrete.com", phone: "(702) 555-1919",
    location: "Las Vegas, NV", leadSource: "Outbound", assignedRep: "Mike T.", stage: "Contacted",
    opportunityScore: 51, estimatedValue: 2100, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More commercial contracts", "Build local brand"],
    painPoints: ["No online reviews", "No website SEO"],
    requestedServices: ["SEO", "Web", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-09", lastActivity: "2 days ago", budget: "Medium", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["Cemex", "CRH"], currentChannels: ["Word of mouth"],
    notes: "Cold outbound. Interested but needs follow-up.",
  },
  {
    id: "L020", name: "Holly Jennings", businessName: "Harvest Table Catering", industry: "Food & Beverage",
    website: "harvesttablecatering.com", email: "holly@harvesttable.com", phone: "(612) 555-2020",
    location: "Minneapolis, MN", leadSource: "Meta Ads", assignedRep: "Alex R.", stage: "New Lead",
    opportunityScore: 33, estimatedValue: 1400, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Book more corporate events"],
    painPoints: ["No social media strategy"],
    requestedServices: ["Meta Ads", "Creative"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-15", lastActivity: "Today", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["D'Amico", "Crave"], currentChannels: ["Facebook"],
    notes: "Meta Ads form fill. Needs initial call.",
  },
  {
    id: "L021", name: "Ryan Castillo", businessName: "Prestige Auto Detailing", industry: "Automotive Services",
    website: "prestigeautodetail.com", email: "ryan@prestigeauto.com", phone: "(469) 555-2121",
    location: "Plano, TX", leadSource: "GBP", assignedRep: "Jordan M.", stage: "Contact Attempted",
    opportunityScore: 27, estimatedValue: 1100, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More 5-star reviews", "Dominate GBP in Plano"],
    painPoints: ["Low GBP ranking", "Few online reviews"],
    requestedServices: ["GBP", "SEO"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-11", lastActivity: "Yesterday", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["DetailXPerts"], currentChannels: ["GBP"],
    notes: "GBP click. Attempted contact twice.",
  },
  {
    id: "L022", name: "Leila Hassan", businessName: "NovaCare Physical Therapy", industry: "Physical Therapy",
    website: "novacarerehab.com", email: "lhassan@novacare.com", phone: "(404) 555-2222",
    location: "Atlanta, GA", leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Qualified",
    opportunityScore: 73, estimatedValue: 3300, discoveryStatus: "Completed", discoveryDate: "2024-12-06",
    discoveryNotes: "Multi-location PT clinic. Strong budget. Wants SEO + GBP package.",
    businessGoals: ["Fill all 4 clinics to capacity", "Rank top 5 in Atlanta PT"],
    painPoints: ["Insurance referrals drying up", "Low digital presence"],
    requestedServices: ["SEO", "GBP", "Reporting"],
    auditStatus: "Requested", affiliateSource: "Affiliate", affiliateName: "Kenji Yamamoto",
    affiliateCode: "KY-2024", commissionEligible: true, potentialCommission: 330,
    createdDate: "2024-11-29", lastActivity: "3 days ago", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["ATI PT", "Select Medical"], currentChannels: ["Doctor referrals", "GBP"],
    notes: "Kenji Yamamoto affiliate. Strong qualification.",
  },
  {
    id: "L023", name: "Bradley Scott", businessName: "Atlas Electrical Services", industry: "Electrical",
    website: "atlaselectric.com", email: "brad@atlaselectric.com", phone: "(801) 555-2323",
    location: "Salt Lake City, UT", leadSource: "LSA", assignedRep: "Mike T.", stage: "Audit Requested",
    opportunityScore: 78, estimatedValue: 2700, discoveryStatus: "Completed", discoveryDate: "2024-12-03",
    discoveryNotes: "Master electrician. Wants LSA + PPC. Competitor already running LSA.",
    businessGoals: ["Top LSA ranking in SLC", "Emergency call volume"],
    painPoints: ["Competitor dominance on LSA"],
    requestedServices: ["LSA", "PPC", "GBP"],
    auditStatus: "Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-26", lastActivity: "Today", budget: "Medium", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Mr. Electric", "Mister Sparky"], currentChannels: ["LSA"],
    notes: "LSA inbound. Audit requested by rep.",
  },
  {
    id: "L024", name: "Olivia Chan", businessName: "Bliss Beauty Bar", industry: "Beauty & Personal Care",
    website: "blissbeautybar.com", email: "olivia@blissbeauty.com", phone: "(562) 555-2424",
    location: "Long Beach, CA", leadSource: "Meta Ads", assignedRep: "Alex R.", stage: "Discovery Scheduled",
    opportunityScore: 44, estimatedValue: 1600, discoveryStatus: "Scheduled", discoveryDate: "2024-12-23",
    discoveryNotes: "",
    businessGoals: ["Grow salon bookings 30%", "Build Instagram following"],
    painPoints: ["Slow Tuesdays and Wednesdays", "No paid social strategy"],
    requestedServices: ["Meta Ads", "Creative"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-10", lastActivity: "2 days ago", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["Drybar", "Great Clips"], currentChannels: ["Instagram", "Booksy"],
    notes: "Meta Ads form fill. Discovery scheduled.",
  },
  {
    id: "L025", name: "Paul Whitmore", businessName: "Keystone Insurance Agency", industry: "Insurance",
    website: "keystoneinsurance.com", email: "paul@keystoneins.com", phone: "(215) 555-2525",
    location: "Philadelphia, PA", leadSource: "Outbound", assignedRep: "Jordan M.", stage: "Disqualified",
    opportunityScore: 5, estimatedValue: 0, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: [], painPoints: [],
    requestedServices: [],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-20", lastActivity: "2 weeks ago", budget: "Unknown", authority: "Unknown",
    need: "Low", timeline: "6+ months", competitors: [], currentChannels: [],
    notes: "Not a fit. Already with large agency. Disqualified.",
  },
  {
    id: "L026", name: "Monica Delgado", businessName: "SunKissed Tanning Studio", industry: "Beauty",
    website: "sunkissedtan.com", email: "monica@sunkissedtan.com", phone: "(813) 555-2626",
    location: "Tampa, FL", leadSource: "Website", assignedRep: "Sarah K.", stage: "New Lead",
    opportunityScore: 31, estimatedValue: 1000, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Increase monthly memberships"],
    painPoints: ["Low online visibility"],
    requestedServices: ["SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-15", lastActivity: "Today", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["Sun Tan City"], currentChannels: ["Facebook"],
    notes: "Website contact form. Needs outreach.",
  },
  {
    id: "L027", name: "Owen Fletcher", businessName: "Redwood Tree Service", industry: "Tree Service",
    website: "redwoodtreeservice.com", email: "owen@redwoodtree.com", phone: "(916) 555-2727",
    location: "Sacramento, CA", leadSource: "Referral", assignedRep: "Mike T.", stage: "Contacted",
    opportunityScore: 47, estimatedValue: 1700, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Book out spring removal season"],
    painPoints: ["Seasonal revenue gaps", "No Google presence"],
    requestedServices: ["SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Referral", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-08", lastActivity: "Yesterday", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["Davey Tree", "SavATree"], currentChannels: ["Yelp"],
    notes: "Client referral. Initial conversation had.",
  },
  {
    id: "L028", name: "Isabelle Moreau", businessName: "EuroVision Optometry", industry: "Optometry",
    website: "eurovisionoptometry.com", email: "imoreau@eurovision.com", phone: "(303) 555-2828",
    location: "Denver, CO", leadSource: "Google Ads", assignedRep: "Alex R.", stage: "Audit Requested",
    opportunityScore: 69, estimatedValue: 2500, discoveryStatus: "Completed", discoveryDate: "2024-12-07",
    discoveryNotes: "French-owned optometry practice. Wants SEO + GBP to compete with LensCrafters.",
    businessGoals: ["Rank above LensCrafters in Denver", "More exam bookings"],
    painPoints: ["Low GBP reviews", "No SEO investment"],
    requestedServices: ["SEO", "GBP", "Web"],
    auditStatus: "Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-27", lastActivity: "3 days ago", budget: "Medium", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["LensCrafters", "Target Optical"], currentChannels: ["Google Ads"],
    notes: "Google Ads inbound. Audit requested.",
  },
  {
    id: "L029", name: "Curtis Blake", businessName: "TurboKlean Pressure Washing", industry: "Cleaning Services",
    website: "turboklean.com", email: "curtis@turboklean.com", phone: "(904) 555-2929",
    location: "Jacksonville, FL", leadSource: "LSA", assignedRep: "Jordan M.", stage: "Discovery Complete",
    opportunityScore: 59, estimatedValue: 1900, discoveryStatus: "Completed", discoveryDate: "2024-12-11",
    discoveryNotes: "Residential + commercial pressure washing. Wants LSA + GBP. Good candidate.",
    businessGoals: ["Fill calendar year-round", "Rank #1 LSA in Jacksonville"],
    painPoints: ["Slow winter months"],
    requestedServices: ["LSA", "GBP", "SEO"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-04", lastActivity: "Today", budget: "Medium", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["Fish Window Cleaning"], currentChannels: ["LSA", "Nextdoor"],
    notes: "LSA inbound. Discovery done. Move to audit.",
  },
  {
    id: "L030", name: "Nadia Petrov", businessName: "Stellar Cosmetic Dermatology", industry: "Dermatology",
    website: "stellarderm.com", email: "nadia@stellarderm.com", phone: "(305) 555-3030",
    location: "Miami, FL", leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Proposal Opportunity",
    opportunityScore: 93, estimatedValue: 9500, discoveryStatus: "Completed", discoveryDate: "2024-11-18",
    discoveryNotes: "Top cosmetic dermatologist in Miami. Huge opportunity. Full marketing stack.",
    businessGoals: ["Dominate Miami cosmetic derm market", "Build $200K/mo practice"],
    painPoints: ["Slow new patient acquisition", "Competition from plastic surgeons"],
    requestedServices: ["SEO", "Meta Ads", "PPC", "GBP", "Reporting", "Creative"],
    auditStatus: "Completed", affiliateSource: "Affiliate", affiliateName: "Sofia Reyes",
    affiliateCode: "SR-2024", commissionEligible: true, potentialCommission: 950,
    createdDate: "2024-11-05", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Miami Dermatology", "SkinCare Center"], currentChannels: ["Instagram", "Google Ads"],
    notes: "Sofia Reyes affiliate. Highest score in pipeline. Proposal ready.",
  },
  {
    id: "L031", name: "Derek Sullivan", businessName: "First Choice Windows", industry: "Windows & Doors",
    website: "firstchoicewindows.com", email: "derek@firstchoicewindows.com", phone: "(704) 555-3131",
    location: "Charlotte, NC", leadSource: "Google Ads", assignedRep: "Mike T.", stage: "Contacted",
    opportunityScore: 54, estimatedValue: 2300, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More replacement window leads"],
    painPoints: ["High Google Ads CPC", "No SEO"],
    requestedServices: ["SEO", "PPC"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-09", lastActivity: "Yesterday", budget: "Medium", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["Renewal by Andersen", "Pella"], currentChannels: ["Google Ads"],
    notes: "Google Ads click. Spoke briefly. Follow-up needed.",
  },
  {
    id: "L032", name: "Carmen Ortega", businessName: "Zen Acupuncture Wellness", industry: "Acupuncture",
    website: "zenacupuncturewellness.com", email: "carmen@zenacupuncture.com", phone: "(323) 555-3232",
    location: "Los Angeles, CA", leadSource: "Meta Ads", assignedRep: "Alex R.", stage: "New Lead",
    opportunityScore: 36, estimatedValue: 1300, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Grow patient base by 40%"],
    painPoints: ["Low online visibility", "No digital ads experience"],
    requestedServices: ["Meta Ads", "SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-15", lastActivity: "Today", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["Yelp acupuncture"], currentChannels: ["Instagram"],
    notes: "Meta form fill. Needs first contact.",
  },
  {
    id: "L033", name: "Walter Huang", businessName: "Pacific Kitchen & Bath", industry: "Kitchen & Bath Remodeling",
    website: "pacifickitchenbath.com", email: "walter@pacifickb.com", phone: "(206) 555-3333",
    location: "Bellevue, WA", leadSource: "Partner", assignedRep: "Jordan M.", stage: "Qualified",
    opportunityScore: 71, estimatedValue: 4800, discoveryStatus: "Completed", discoveryDate: "2024-12-04",
    discoveryNotes: "High-end remodeler. Wants SEO + Web redesign + GBP. Large project.",
    businessGoals: ["Attract luxury homeowners in Bellevue", "Rank for kitchen remodel near Seattle"],
    painPoints: ["Outdated website", "No SEO"],
    requestedServices: ["SEO", "Web", "GBP"],
    auditStatus: "Requested", affiliateSource: "Partner", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-28", lastActivity: "2 days ago", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["Kitchen Craft", "Case Design"], currentChannels: ["Houzz"],
    notes: "Partner referral. Strong qualification. Audit requested.",
  },
  {
    id: "L034", name: "Melanie Brooks", businessName: "TruBalance Financial Planning", industry: "Financial Services",
    website: "trubalancefinancial.com", email: "melanie@trubalance.com", phone: "(617) 555-3434",
    location: "Boston, MA", leadSource: "Outbound", assignedRep: "Sarah K.", stage: "Contact Attempted",
    opportunityScore: 24, estimatedValue: 2000, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More high-net-worth client inquiries"],
    painPoints: ["No digital marketing"],
    requestedServices: ["SEO", "Web"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-12", lastActivity: "Yesterday", budget: "Medium", authority: "Unknown",
    need: "Low", timeline: "6+ months", competitors: ["Fidelity", "Vanguard Advisors"], currentChannels: ["LinkedIn"],
    notes: "Cold outbound. No response yet.",
  },
  {
    id: "L035", name: "James Holloway", businessName: "Diamond Fence & Deck", industry: "Fencing & Decking",
    website: "diamondfencedeck.com", email: "james@diamondfence.com", phone: "(614) 555-3535",
    location: "Columbus, OH", leadSource: "Website", assignedRep: "Mike T.", stage: "Discovery Scheduled",
    opportunityScore: 57, estimatedValue: 2000, discoveryStatus: "Scheduled", discoveryDate: "2024-12-24",
    discoveryNotes: "",
    businessGoals: ["Book 6+ months of projects", "Rank for fence installation Columbus"],
    painPoints: ["Slow winter season", "Low GBP ranking"],
    requestedServices: ["SEO", "GBP", "PPC"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-10", lastActivity: "3 days ago", budget: "Medium", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["Lowes Fence Installation"], currentChannels: ["Nextdoor"],
    notes: "Website form. Discovery scheduled.",
  },
  {
    id: "L036", name: "Alexis Turner", businessName: "Pinnacle Orthodontics", industry: "Orthodontics",
    website: "pinnacleortho.com", email: "alexis@pinnacleortho.com", phone: "(480) 555-3636",
    location: "Mesa, AZ", leadSource: "Affiliate", assignedRep: "Alex R.", stage: "Audit In Progress",
    opportunityScore: 85, estimatedValue: 5500, discoveryStatus: "Completed", discoveryDate: "2024-11-26",
    discoveryNotes: "Ortho practice wanting to compete with Invisalign providers online. Solid budget.",
    businessGoals: ["Fill braces and Invisalign schedule", "Rank top 3 Mesa orthodontist"],
    painPoints: ["Low online reviews", "No PPC"],
    requestedServices: ["SEO", "GBP", "PPC", "Reporting"],
    auditStatus: "In Progress", affiliateSource: "Affiliate", affiliateName: "Amanda Hill",
    affiliateCode: "AH-2024", commissionEligible: true, potentialCommission: 550,
    createdDate: "2024-11-12", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Smile Direct", "Invisalign providers"], currentChannels: ["Google Ads"],
    notes: "Amanda Hill affiliate. Audit in progress.",
  },
  {
    id: "L037", name: "Roberto Fuentes", businessName: "Clearwater Pool Service", industry: "Pool Service",
    website: "clearwaterpoolservice.com", email: "roberto@clearwaterpool.com", phone: "(813) 555-3737",
    location: "Tampa, FL", leadSource: "GBP", assignedRep: "Jordan M.", stage: "Contact Attempted",
    opportunityScore: 30, estimatedValue: 1200, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More recurring maintenance contracts"],
    painPoints: ["Low GBP visibility"],
    requestedServices: ["GBP", "SEO"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-12", lastActivity: "Today", budget: "Low", authority: "Unknown",
    need: "Medium", timeline: "3-6 months", competitors: ["Pool Corp"], currentChannels: ["GBP"],
    notes: "GBP click. Attempted contact.",
  },
  {
    id: "L038", name: "Wendy Nakamura", businessName: "Bloom Floral Design Studio", industry: "Florist",
    website: "bloomfloralstudio.com", email: "wendy@bloomfloral.com", phone: "(503) 555-3838",
    location: "Portland, OR", leadSource: "Meta Ads", assignedRep: "Sarah K.", stage: "Lost",
    opportunityScore: 12, estimatedValue: 600, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More wedding bookings"],
    painPoints: ["Budget too small for full services"],
    requestedServices: ["Meta Ads"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-01", lastActivity: "1 week ago", budget: "Low", authority: "Decision Maker",
    need: "Low", timeline: "6+ months", competitors: ["Teleflora"], currentChannels: ["Instagram"],
    notes: "Budget too small. Lost.",
  },
  {
    id: "L039", name: "Frank Davidson", businessName: "UrbanEdge Barbershop", industry: "Barbershop",
    website: "urbanedgebarber.com", email: "frank@urbanedge.com", phone: "(214) 555-3939",
    location: "Dallas, TX", leadSource: "Referral", assignedRep: "Mike T.", stage: "Contacted",
    opportunityScore: 42, estimatedValue: 1500, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Grow 3 locations", "Online booking increase"],
    painPoints: ["Manual booking", "No digital strategy"],
    requestedServices: ["SEO", "GBP", "Meta Ads"],
    auditStatus: "Not Requested", affiliateSource: "Referral", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-07", lastActivity: "2 days ago", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["Sport Clips", "Floyd's"], currentChannels: ["Instagram", "Word of mouth"],
    notes: "Client referral. Initial call done.",
  },
  {
    id: "L040", name: "Stephanie Lane", businessName: "GreenWave Lawn Care", industry: "Lawn Care",
    website: "greenwavecare.com", email: "slane@greenwave.com", phone: "(615) 555-4040",
    location: "Nashville, TN", leadSource: "Google Ads", assignedRep: "Alex R.", stage: "Discovery Complete",
    opportunityScore: 66, estimatedValue: 2400, discoveryStatus: "Completed", discoveryDate: "2024-12-10",
    discoveryNotes: "Regional lawn care company. Wants to expand into Murfreesboro and Brentwood.",
    businessGoals: ["Expand to 3 new markets", "Rank for lawn care in Nashville suburbs"],
    painPoints: ["Limited Google Ads budget utilization", "No LSA"],
    requestedServices: ["LSA", "SEO", "GBP", "PPC"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-03", lastActivity: "Today", budget: "Medium", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["TruGreen", "Lawn Doctor"], currentChannels: ["Google Ads", "Door knocking"],
    notes: "Google Ads inbound. Discovery complete. Good fit.",
  },
  {
    id: "L041", name: "Nico Bergman", businessName: "Arctic Ice & Refrigeration", industry: "Commercial Refrigeration",
    website: "arcticiceref.com", email: "nico@arcticice.com", phone: "(907) 555-4141",
    location: "Anchorage, AK", leadSource: "Outbound", assignedRep: "Jordan M.", stage: "New Lead",
    opportunityScore: 19, estimatedValue: 1500, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More commercial contracts"],
    painPoints: ["No digital presence"],
    requestedServices: ["Web", "SEO"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-14", lastActivity: "Today", budget: "Low", authority: "Unknown",
    need: "Low", timeline: "6+ months", competitors: [], currentChannels: ["None"],
    notes: "Cold outbound. First contact pending.",
  },
  {
    id: "L042", name: "Pamela Strickland", businessName: "Lifetime Vision Care", industry: "Optometry",
    website: "lifetimevisioncare.com", email: "pam@lifetimevision.com", phone: "(501) 555-4242",
    location: "Little Rock, AR", leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Contacted",
    opportunityScore: 53, estimatedValue: 2100, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Fill exam schedule", "More contact lens orders online"],
    painPoints: ["Losing patients to Walmart Vision"],
    requestedServices: ["SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Affiliate", affiliateName: "David Marsh",
    affiliateCode: "DM-2024", commissionEligible: true, potentialCommission: 210,
    createdDate: "2024-12-08", lastActivity: "Yesterday", budget: "Medium", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["Walmart Vision", "MyEyeDr"], currentChannels: ["Word of mouth"],
    notes: "David Marsh affiliate. Initial call scheduled.",
  },
  {
    id: "L043", name: "Hector Sandoval", businessName: "RapidWrap Auto Vinyl", industry: "Auto Wraps",
    website: "rapidwrap.com", email: "hector@rapidwrap.com", phone: "(702) 555-4343",
    location: "Las Vegas, NV", leadSource: "Website", assignedRep: "Mike T.", stage: "Discovery Scheduled",
    opportunityScore: 49, estimatedValue: 1700, discoveryStatus: "Scheduled", discoveryDate: "2024-12-21",
    discoveryNotes: "",
    businessGoals: ["More commercial wrap orders", "Rank for fleet wraps Las Vegas"],
    painPoints: ["No SEO", "Dependent on word of mouth"],
    requestedServices: ["SEO", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-09", lastActivity: "3 days ago", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["Wrap Bullys", "SignsNow"], currentChannels: ["Word of mouth"],
    notes: "Website contact. Discovery scheduled.",
  },
  {
    id: "L044", name: "Charlotte Evans", businessName: "Serenity Home Health", industry: "Home Health Care",
    website: "serenityhomehealth.com", email: "charlotte@serenityhh.com", phone: "(757) 555-4444",
    location: "Virginia Beach, VA", leadSource: "Referral", assignedRep: "Alex R.", stage: "Qualified",
    opportunityScore: 74, estimatedValue: 3800, discoveryStatus: "Completed", discoveryDate: "2024-12-05",
    discoveryNotes: "Home health agency serving seniors. Wants SEO + GBP to attract family inquiries.",
    businessGoals: ["100+ family inquiries per month", "Rank for in-home care in Hampton Roads"],
    painPoints: ["No digital presence", "Losing referrals to larger agencies"],
    requestedServices: ["SEO", "GBP", "Web", "Reporting"],
    auditStatus: "Requested", affiliateSource: "Referral", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-27", lastActivity: "2 days ago", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["Visiting Angels", "Comfort Keepers"], currentChannels: ["Doctor referrals"],
    notes: "Physician referral. Qualified. Audit requested.",
  },
  {
    id: "L045", name: "Travis Coleman", businessName: "Iron Horse Auto Repair", industry: "Auto Repair",
    website: "ironhorseauto.com", email: "travis@ironhorseauto.com", phone: "(918) 555-4545",
    location: "Tulsa, OK", leadSource: "GBP", assignedRep: "Jordan M.", stage: "New Lead",
    opportunityScore: 26, estimatedValue: 1000, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More oil change and repair bookings"],
    painPoints: ["Losing to dealership service centers"],
    requestedServices: ["GBP", "SEO"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-14", lastActivity: "Today", budget: "Low", authority: "Unknown",
    need: "Medium", timeline: "3-6 months", competitors: ["Jiffy Lube", "Firestone"], currentChannels: ["GBP"],
    notes: "GBP inquiry. Fresh.",
  },
  {
    id: "L046", name: "Vivian Wu", businessName: "Harmony Pediatric Dentistry", industry: "Pediatric Dentistry",
    website: "harmonypeddentistry.com", email: "vivian@harmonyped.com", phone: "(408) 555-4646",
    location: "San Jose, CA", leadSource: "Affiliate", assignedRep: "Sarah K.", stage: "Proposal Opportunity",
    opportunityScore: 86, estimatedValue: 5200, discoveryStatus: "Completed", discoveryDate: "2024-11-29",
    discoveryNotes: "3-dentist practice. High-growth area. Wants SEO + GBP + PPC.",
    businessGoals: ["Fill 3 dentist chairs daily", "Rank #1 for pediatric dentist San Jose"],
    painPoints: ["New patient acquisition slow", "No PPC strategy"],
    requestedServices: ["SEO", "GBP", "PPC", "Reporting"],
    auditStatus: "Completed", affiliateSource: "Affiliate", affiliateName: "Kenji Yamamoto",
    affiliateCode: "KY-2024", commissionEligible: true, potentialCommission: 520,
    createdDate: "2024-11-14", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["Smile Pediatric", "Kids Dental"], currentChannels: ["Yelp", "Google Ads"],
    notes: "Kenji Yamamoto affiliate. Proposal ready.",
  },
  {
    id: "L047", name: "Dominic Ferrara", businessName: "Terracotta Italian Kitchen", industry: "Restaurant",
    website: "terracottakitchen.com", email: "dom@terracottakitchen.com", phone: "(312) 555-4747",
    location: "Chicago, IL", leadSource: "Meta Ads", assignedRep: "Mike T.", stage: "Contact Attempted",
    opportunityScore: 20, estimatedValue: 700, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["More reservations", "Build GBP reviews"],
    painPoints: ["Slow weeknight traffic"],
    requestedServices: ["Meta Ads", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-13", lastActivity: "Yesterday", budget: "Low", authority: "Decision Maker",
    need: "Low", timeline: "3-6 months", competitors: ["Olive Garden", "local Italian"], currentChannels: ["OpenTable", "Yelp"],
    notes: "Meta form. Small deal. Low priority.",
  },
  {
    id: "L048", name: "Erica Walton", businessName: "NextGen Physical Medicine", industry: "Physical Medicine",
    website: "nextgenmed.com", email: "erica@nextgenmed.com", phone: "(615) 555-4848",
    location: "Nashville, TN", leadSource: "Google Ads", assignedRep: "Alex R.", stage: "Audit Requested",
    opportunityScore: 80, estimatedValue: 4100, discoveryStatus: "Completed", discoveryDate: "2024-12-08",
    discoveryNotes: "Pain management + physical therapy. Wants PPC + SEO + Reporting.",
    businessGoals: ["Fill pain management schedule", "Rank for pain clinic Nashville"],
    painPoints: ["High Google Ads spend with poor ROI"],
    requestedServices: ["PPC", "SEO", "GBP", "Reporting"],
    auditStatus: "Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-30", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "Immediate", competitors: ["NovaCare", "HealthSouth"], currentChannels: ["Google Ads", "Insurance referrals"],
    notes: "Google Ads inbound. Audit requested. Hot lead.",
  },
  {
    id: "L049", name: "Ray Thornton", businessName: "SkyHigh Window Cleaning", industry: "Window Cleaning",
    website: "skyhighwindows.com", email: "ray@skyhighwindows.com", phone: "(303) 555-4949",
    location: "Denver, CO", leadSource: "LSA", assignedRep: "Jordan M.", stage: "Contacted",
    opportunityScore: 45, estimatedValue: 1600, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Commercial building contracts"],
    painPoints: ["No digital marketing"],
    requestedServices: ["LSA", "GBP"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-09", lastActivity: "2 days ago", budget: "Low", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["Fish Window Cleaning"], currentChannels: ["LSA"],
    notes: "LSA inbound. Initial contact made.",
  },
  {
    id: "L050", name: "Ingrid Larsson", businessName: "NordicFit Personal Training", industry: "Personal Training",
    website: "nordicfit.com", email: "ingrid@nordicfit.com", phone: "(612) 555-5050",
    location: "Minneapolis, MN", leadSource: "Meta Ads", assignedRep: "Sarah K.", stage: "Discovery Scheduled",
    opportunityScore: 50, estimatedValue: 1800, discoveryStatus: "Scheduled", discoveryDate: "2024-12-22",
    discoveryNotes: "",
    businessGoals: ["Book 20 private clients", "Build online training income"],
    painPoints: ["No online sales funnel", "Relying on word of mouth"],
    requestedServices: ["Meta Ads", "Web", "Creative"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-11", lastActivity: "Yesterday", budget: "Medium", authority: "Decision Maker",
    need: "Medium", timeline: "1-3 months", competitors: ["Anytime Fitness", "Orange Theory"], currentChannels: ["Instagram"],
    notes: "Meta form. Discovery next week.",
  },
  {
    id: "L051", name: "Patrick Moon", businessName: "MoonGuard Security Systems", industry: "Security",
    website: "moonguardsecurity.com", email: "patrick@moonguard.com", phone: "(512) 555-5151",
    location: "Austin, TX", leadSource: "Outbound", assignedRep: "Mike T.", stage: "Proposal Opportunity",
    opportunityScore: 77, estimatedValue: 3900, discoveryStatus: "Completed", discoveryDate: "2024-12-01",
    discoveryNotes: "Commercial security installs. Wants PPC + SEO. Good pipeline potential.",
    businessGoals: ["100 new commercial accounts/year", "Rank for security systems Austin"],
    painPoints: ["Sales team fully manual", "No inbound leads"],
    requestedServices: ["PPC", "SEO", "GBP"],
    auditStatus: "Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-11-22", lastActivity: "Today", budget: "High", authority: "Decision Maker",
    need: "High", timeline: "1-3 months", competitors: ["ADT", "Vivint"], currentChannels: ["Cold calls"],
    notes: "Cold outbound converted. Proposal opportunity.",
  },
  {
    id: "L052", name: "Kimberly Ross", businessName: "Rosewood Event Venue", industry: "Event Venue",
    website: "rosewoodevents.com", email: "kim@rosewoodevents.com", phone: "(404) 555-5252",
    location: "Atlanta, GA", leadSource: "Website", assignedRep: "Alex R.", stage: "New Lead",
    opportunityScore: 34, estimatedValue: 1400, discoveryStatus: "Not Scheduled", discoveryDate: "",
    discoveryNotes: "",
    businessGoals: ["Book more weddings and corporate events"],
    painPoints: ["Dependent on The Knot and WeddingWire"],
    requestedServices: ["SEO", "Meta Ads"],
    auditStatus: "Not Requested", affiliateSource: "Direct", affiliateName: "—",
    affiliateCode: "", commissionEligible: false, potentialCommission: 0,
    createdDate: "2024-12-15", lastActivity: "Today", budget: "Medium", authority: "Decision Maker",
    need: "Medium", timeline: "3-6 months", competitors: ["The Knot venues"], currentChannels: ["The Knot", "WeddingWire"],
    notes: "Website inquiry. First contact pending.",
  },
];

const leadsData: Lead[] = LEADS;

// ─── Stage Config ─────────────────────────────────────────────────────────────

const STAGE_CONFIG: Record<LeadStage, { color: string; bg: string; border: string; order: number }> = {
  "New Lead":            { color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE", order: 0 },
  "Contact Attempted":   { color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", order: 1 },
  "Contacted":           { color: "#0891B2", bg: "#ECFEFF", border: "#A5F3FC", order: 2 },
  "Discovery Scheduled": { color: "#0284C7", bg: "#F0F9FF", border: "#BAE6FD", order: 3 },
  "Discovery Complete":  { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", order: 4 },
  "Qualified":           { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", order: 5 },
  "Audit Requested":     { color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA", order: 6 },
  "Audit In Progress":   { color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", order: 7 },
  "Proposal Opportunity":{ color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", order: 8 },
  "Lost":                { color: "#64748B", bg: "#F8FAFC", border: "#E2E8F0", order: 9 },
  "Disqualified":        { color: "#94A3B8", bg: "#F1F5F9", border: "#CBD5E1", order: 10 },
};

const SOURCE_COLORS: Record<string, string> = {
  Website: "#2563EB", "Google Ads": "#EA4335", "Meta Ads": "#1877F2", GBP: "#34A853",
  LSA: "#FBBC04", Referral: "#9333EA", Affiliate: "#059669", Partner: "#0891B2",
  Direct: "#64748B", Outbound: "#D97706",
};

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

function sourceBadge(source: string) {
  const color = SOURCE_COLORS[source] ?? "#64748B";
  return (
    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border"
      style={{ background: `${color}15`, color, borderColor: `${color}30` }}>
      {source}
    </span>
  );
}

function scoreBadge(score: number) {
  const { color, label } =
    score >= 80 ? { color: "#059669", label: "Excellent" } :
    score >= 60 ? { color: "#D97706", label: "Good" } :
    score >= 40 ? { color: "#0284C7", label: "Moderate" } :
    { color: "#DC2626", label: "Poor" };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      <span className="text-[11px] font-bold w-6 text-right" style={{ color }}>{score}</span>
      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: `${color}15`, color }}>{label}</span>
    </div>
  );
}

function fmt$(v: number) {
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`;
}

// ─── Drawer Component ─────────────────────────────────────────────────────────

function LeadDrawer({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "qualification" | "discovery" | "audit" | "opportunity" | "affiliate" | "tasks" | "timeline">("overview");

  const tabs = [
    { key: "overview" as const, label: "Overview" },
    { key: "qualification" as const, label: "Qualification" },
    { key: "discovery" as const, label: "Discovery" },
    { key: "audit" as const, label: "Audit Readiness" },
    { key: "opportunity" as const, label: "Opportunity" },
    { key: "affiliate" as const, label: "Affiliate" },
    { key: "tasks" as const, label: "Tasks" },
    { key: "timeline" as const, label: "Timeline" },
  ];

  const auditChecklist = [
    { label: "Discovery Completed", done: lead.discoveryStatus === "Completed" },
    { label: "Business Goals Identified", done: lead.businessGoals.length > 0 },
    { label: "Requested Services Identified", done: lead.requestedServices.length > 0 },
    { label: "Website Reviewed", done: !!lead.website },
    { label: "Lead Qualified", done: ["Qualified", "Audit Requested", "Audit In Progress", "Proposal Opportunity"].includes(lead.stage) },
    { label: "Decision Maker Identified", done: lead.authority === "Decision Maker" },
    { label: "Budget Discussed", done: lead.budget !== "Unknown" },
    { label: "Ready For Audit", done: lead.opportunityScore >= 60 },
  ];
  const readyCount = auditChecklist.filter(i => i.done).length;

  const services = [
    { name: "SEO", monthly: 1200, score: 85, likelihood: "High", priority: "P1" },
    { name: "GBP", monthly: 400, score: 78, likelihood: "High", priority: "P1" },
    { name: "PPC", monthly: 800, score: 65, likelihood: "Medium", priority: "P2" },
    { name: "Meta Ads", monthly: 700, score: 60, likelihood: "Medium", priority: "P2" },
    { name: "LSA", monthly: 500, score: 55, likelihood: "Medium", priority: "P2" },
    { name: "Reporting", monthly: 300, score: 90, likelihood: "High", priority: "P1" },
    { name: "Web", monthly: 600, score: 45, likelihood: "Low", priority: "P3" },
    { name: "Creative", monthly: 450, score: 40, likelihood: "Low", priority: "P3" },
  ].filter(s => lead.requestedServices.includes(s.name));

  const taskTypes = [
    { label: "Lead Follow-Up", due: "Today", status: "pending" },
    { label: "Schedule Discovery", due: "Tomorrow", status: lead.discoveryStatus === "Scheduled" ? "done" : "pending" },
    { label: "Discovery Reminder", due: lead.discoveryDate || "TBD", status: lead.discoveryStatus === "Completed" ? "done" : "pending" },
    { label: "Create Audit", due: "+3 days", status: lead.auditStatus === "Not Requested" ? "pending" : "done" },
    { label: "Proposal Preparation", due: "+7 days", status: lead.stage === "Proposal Opportunity" ? "in-progress" : "pending" },
  ];

  const timeline = [
    { date: lead.createdDate, event: "Lead Created", icon: "🎯" },
    { date: lead.createdDate, event: `Assigned to ${lead.assignedRep}`, icon: "👤" },
    ...(lead.discoveryDate ? [{ date: lead.discoveryDate, event: "Discovery Completed", icon: "🔍" }] : []),
    ...(lead.auditStatus !== "Not Requested" ? [{ date: lead.lastActivity, event: "Audit Requested", icon: "📋" }] : []),
    { date: lead.lastActivity, event: `Stage: ${lead.stage}`, icon: "📍" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="w-[720px] h-full flex flex-col shadow-2xl overflow-hidden"
        style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)" }}>

        {/* Drawer Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"
          style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)" }}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              {stageBadge(lead.stage)}
              <span className="text-xs font-semibold px-2 py-0.5 rounded"
                style={{ background: "#F0FDF4", color: "#15803D" }}>
                Score: {lead.opportunityScore}
              </span>
            </div>
            <h2 className="text-xl font-bold truncate" style={{ color: "var(--rtm-text-primary)" }}>{lead.businessName}</h2>
            <p className="text-sm mt-0.5" style={{ color: "var(--rtm-text-secondary)" }}>{lead.name} · {lead.industry} · {lead.location}</p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <button className="rtm-btn-primary text-xs px-3 py-1.5">Edit Lead</button>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"
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

        {/* Drawer Body */}
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
                    ["Created Date", lead.createdDate],
                    ["Assigned Sales Rep", lead.assignedRep],
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
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  {["Assign Sales Rep", "Schedule Discovery", "Create Audit", "Create Follow-Up", "Move Stage", "Add Note"].map(a => (
                    <button key={a} className="rtm-btn-secondary text-xs px-3 py-1.5">{a}</button>
                  ))}
                  <button className="rtm-btn-primary text-xs px-3 py-1.5">Convert To Opportunity</button>
                </div>
              </section>
            </>
          )}

          {/* ── QUALIFICATION ── */}
          {activeTab === "qualification" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>BANT Score</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Budget", value: lead.budget, icon: "💰", good: lead.budget === "High" || lead.budget === "Medium" },
                    { label: "Authority", value: lead.authority, icon: "👤", good: lead.authority === "Decision Maker" },
                    { label: "Need", value: lead.need, icon: "🎯", good: lead.need === "High" },
                    { label: "Timeline", value: lead.timeline, icon: "📅", good: lead.timeline === "Immediate" || lead.timeline === "1-3 months" },
                  ].map(item => (
                    <div key={item.label} className="rounded-lg p-4 border" style={{ background: item.good ? "#F0FDF4" : "#FEF2F2", borderColor: item.good ? "#A7F3D0" : "#FECACA" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span>{item.icon}</span>
                        <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: item.good ? "#15803D" : "#DC2626" }}>{item.label}</p>
                      </div>
                      <p className="text-sm font-bold" style={{ color: item.good ? "#15803D" : "#DC2626" }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Opportunity Score</h3>
                <div className="rounded-lg p-4 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  {scoreBadge(lead.opportunityScore)}
                  <p className="mt-3 text-xs" style={{ color: "var(--rtm-text-secondary)" }}>
                    Based on budget, authority, need, timeline, and discovery progress.
                  </p>
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Competitors</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.competitors.length > 0 ? lead.competitors.map(c => (
                    <span key={c} className="text-xs px-2 py-1 rounded border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>{c}</span>
                  )) : <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>No competitors identified.</p>}
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Current Marketing Channels</h3>
                <div className="flex flex-wrap gap-2">
                  {lead.currentChannels.length > 0 ? lead.currentChannels.map(c => (
                    <span key={c} className="text-xs px-2 py-1 rounded border" style={{ background: "var(--rtm-bg)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>{c}</span>
                  )) : <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>None identified.</p>}
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
                    ["Discovery Status", lead.discoveryStatus],
                    ["Discovery Date", lead.discoveryDate || "Not Scheduled"],
                    ["Assigned Sales Rep", lead.assignedRep],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg p-3 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{k}</p>
                      <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{v}</p>
                    </div>
                  ))}
                </div>
              </section>
              {lead.discoveryNotes && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Discovery Notes</h3>
                  <div className="rounded-lg p-4 border text-sm" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
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
                <div className="flex flex-wrap gap-2">
                  {["Schedule Discovery", "Complete Discovery", "Update Notes"].map(a => (
                    <button key={a} className="rtm-btn-secondary text-xs px-3 py-1.5">{a}</button>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* ── AUDIT READINESS ── */}
          {activeTab === "audit" && (
            <>
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Readiness Checklist</h3>
                  <span className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: readyCount >= 6 ? "#ECFDF5" : "#FFFBEB", color: readyCount >= 6 ? "#059669" : "#D97706" }}>
                    {readyCount}/{auditChecklist.length} Ready
                  </span>
                </div>
                <div className="space-y-2">
                  {auditChecklist.map(item => (
                    <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg border"
                      style={{ background: item.done ? "#F0FDF4" : "var(--rtm-surface)", borderColor: item.done ? "#A7F3D0" : "var(--rtm-border)" }}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0`}
                        style={{ background: item.done ? "#059669" : "#E2E8F0", color: item.done ? "#fff" : "#94A3B8" }}>
                        {item.done ? "✓" : "○"}
                      </div>
                      <span className="text-sm font-medium" style={{ color: item.done ? "#15803D" : "var(--rtm-text-secondary)" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <div className="flex flex-wrap gap-2">
                  <button className="rtm-btn-primary text-xs px-3 py-1.5">Create Audit</button>
                  <button className="rtm-btn-secondary text-xs px-3 py-1.5">Assign Auditor</button>
                  <Link href="/sales/audits" className="rtm-btn-secondary text-xs px-3 py-1.5">Open Audit Center →</Link>
                </div>
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Audit Status</h3>
                <div className="rounded-lg p-4 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{lead.auditStatus}</p>
                </div>
              </section>
            </>
          )}

          {/* ── OPPORTUNITY ANALYSIS ── */}
          {activeTab === "opportunity" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Service Opportunity Analysis</h3>
                {services.length > 0 ? (
                  <div className="space-y-2">
                    {services.map(s => (
                      <div key={s.name} className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                        <div className="w-16 flex-shrink-0">
                          <span className="text-xs font-bold px-2 py-0.5 rounded"
                            style={{ background: "#EFF6FF", color: "#2563EB" }}>{s.name}</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{fmt$(s.monthly)}/mo</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                              style={{ background: s.likelihood === "High" ? "#ECFDF5" : s.likelihood === "Medium" ? "#FFFBEB" : "#F1F5F9", color: s.likelihood === "High" ? "#059669" : s.likelihood === "Medium" ? "#D97706" : "#64748B" }}>
                              {s.likelihood}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#EEF2FF", color: "#6366F1" }}>{s.priority}</span>
                          </div>
                          <div className="h-1.5 rounded-full bg-slate-100">
                            <div className="h-full rounded-full" style={{ width: `${s.score}%`, background: s.score >= 70 ? "#059669" : s.score >= 50 ? "#D97706" : "#94A3B8" }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>No services identified yet. Complete discovery to generate opportunity analysis.</p>
                )}
              </section>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Pipeline Value</h3>
                <div className="rounded-lg p-4 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  <p className="text-2xl font-bold" style={{ color: workspace.accentColor }}>{fmt$(lead.estimatedValue)}<span className="text-sm font-normal text-slate-400">/mo</span></p>
                  <p className="text-xs mt-1" style={{ color: "var(--rtm-text-muted)" }}>Estimated monthly recurring value</p>
                </div>
              </section>
              <section>
                <div className="flex flex-wrap gap-2">
                  <button className="rtm-btn-primary text-xs px-3 py-1.5">Convert To Opportunity</button>
                  <button className="rtm-btn-secondary text-xs px-3 py-1.5">Create Audit</button>
                  <Link href="/sales/proposals" className="rtm-btn-secondary text-xs px-3 py-1.5">Open Proposal Center →</Link>
                </div>
              </section>
            </>
          )}

          {/* ── AFFILIATE ── */}
          {activeTab === "affiliate" && (
            <>
              {lead.affiliateName !== "—" ? (
                <>
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Affiliate Attribution</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Affiliate Name", lead.affiliateName],
                        ["Referral Code", lead.affiliateCode],
                        ["Referral Source", lead.affiliateSource],
                        ["Commission Eligible", lead.commissionEligible ? "Yes" : "No"],
                        ["Potential Commission", `${fmt$(lead.potentialCommission)}`],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-lg p-3 border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                          <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: "var(--rtm-text-muted)" }}>{k}</p>
                          <p className="text-sm font-semibold" style={{ color: k === "Commission Eligible" && v === "Yes" ? "#059669" : "var(--rtm-text-primary)" }}>{v as string}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <section>
                    <Link href="/sales/affiliates" className="rtm-btn-primary text-xs px-3 py-1.5 inline-block">Open Affiliate Record →</Link>
                  </section>
                </>
              ) : (
                <div className="rounded-lg p-6 border text-center" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                  <p className="text-sm" style={{ color: "var(--rtm-text-muted)" }}>This lead has no affiliate attribution.</p>
                </div>
              )}
            </>
          )}

          {/* ── TASKS ── */}
          {activeTab === "tasks" && (
            <>
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--rtm-text-muted)" }}>Task Integration</h3>
                  <Link href="/tasks" className="text-xs font-semibold" style={{ color: workspace.accentColor }}>View All Tasks →</Link>
                </div>
                <div className="space-y-2">
                  {taskTypes.map(t => (
                    <div key={t.label} className="flex items-center gap-3 p-3 rounded-lg border" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0`}
                        style={{ background: t.status === "done" ? "#059669" : t.status === "in-progress" ? "#D97706" : "#6366F1" }} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{t.label}</p>
                        <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>Due: {t.due}</p>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded capitalize"
                        style={{ background: t.status === "done" ? "#ECFDF5" : t.status === "in-progress" ? "#FFFBEB" : "#EEF2FF", color: t.status === "done" ? "#059669" : t.status === "in-progress" ? "#D97706" : "#6366F1" }}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <div className="flex flex-wrap gap-2">
                  <Link href="/notifications" className="rtm-btn-secondary text-xs px-3 py-1.5">View Notifications →</Link>
                  <Link href="/admin/workflows" className="rtm-btn-secondary text-xs px-3 py-1.5">View Workflows →</Link>
                </div>
              </section>
            </>
          )}

          {/* ── TIMELINE ── */}
          {activeTab === "timeline" && (
            <>
              <section>
                <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--rtm-text-muted)" }}>Lead Timeline</h3>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2 top-0 bottom-0 w-px" style={{ background: "var(--rtm-border)" }} />
                  {timeline.map((item, i) => (
                    <div key={i} className="relative flex items-start gap-3">
                      <div className="absolute -left-4 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[10px]"
                        style={{ background: "var(--rtm-surface)", borderColor: workspace.accentColor }}>{item.icon}</div>
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
                <div className="rounded-lg p-4 border text-sm" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)" }}>
                  {lead.notes || "No notes added."}
                </div>
                <button className="mt-2 rtm-btn-secondary text-xs px-3 py-1.5">Add Note</button>
              </section>
            </>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"
          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
          <div className="flex gap-2">
            <button className="rtm-btn-secondary text-xs px-3 py-1.5">Mark Lost</button>
            <button className="text-xs px-3 py-1.5 rounded-lg font-semibold border"
              style={{ color: "#DC2626", borderColor: "#FECACA", background: "#FEF2F2" }}>Disqualify</button>
          </div>
          <div className="flex gap-2">
            <button className="rtm-btn-secondary text-xs px-3 py-1.5">Move Stage</button>
            <button className="rtm-btn-primary text-xs px-3 py-1.5">Convert To Opportunity</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SalesLeadsPage() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [stageFilter, setStageFilter] = useState<LeadStage | "All">("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const allStages: LeadStage[] = [
    "New Lead", "Contact Attempted", "Contacted", "Discovery Scheduled",
    "Discovery Complete", "Qualified", "Audit Requested", "Audit In Progress",
    "Proposal Opportunity", "Lost", "Disqualified",
  ];

  const filtered = leadsData.filter(l => {
    if (stageFilter !== "All" && l.stage !== stageFilter) return false;
    if (sourceFilter !== "All" && l.leadSource !== sourceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return l.businessName.toLowerCase().includes(q) || l.name.toLowerCase().includes(q) || l.industry.toLowerCase().includes(q);
    }
    return true;
  });

  // KPI calcs
  const newLeads = leadsData.filter(l => l.stage === "New Lead").length;
  const qualifiedLeads = leadsData.filter(l => ["Qualified", "Audit Requested", "Audit In Progress", "Proposal Opportunity"].includes(l.stage)).length;
  const discoveryScheduled = leadsData.filter(l => l.discoveryStatus === "Scheduled").length;
  const auditsRequested = leadsData.filter(l => l.auditStatus === "Requested").length;
  const auditsInProgress = leadsData.filter(l => l.auditStatus === "In Progress").length;
  const proposalOpps = leadsData.filter(l => l.stage === "Proposal Opportunity").length;
  const closed = leadsData.filter(l => !["Lost", "Disqualified"].includes(l.stage)).length;
  const conversionRate = Math.round((proposalOpps / leadsData.length) * 100);
  const pipelineValue = leadsData.filter(l => !["Lost", "Disqualified"].includes(l.stage)).reduce((a, l) => a + l.estimatedValue, 0);

  // Pipeline counts
  const stageCounts = Object.fromEntries(allStages.map(s => [s, leadsData.filter(l => l.stage === s).length]));

  const sources = Array.from(new Set(leadsData.map(l => l.leadSource)));
  const sourceCounts = Object.fromEntries(sources.map(s => [s, leadsData.filter(l => l.leadSource === s).length]));

  return (
    <div className="space-y-6">
      {selectedLead && <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />}

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: workspace.accentColor }}>Sales</p>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--rtm-text-primary)" }}>Lead Management Center</h1>
          <p className="text-sm mt-1" style={{ color: "var(--rtm-text-secondary)" }}>
            Manage lead qualification, assignments, discovery, audit readiness, and opportunity creation.
          </p>
        </div>
        {/* Top Action Bar */}
        <div className="flex flex-wrap gap-2 flex-shrink-0">
          <button className="rtm-btn-primary text-sm flex items-center gap-1.5 px-3 py-2">
            <span>＋</span> Add Lead
          </button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">↑ Import Leads</button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">👤 Assign Leads</button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">🔎 Create Audit</button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">↓ Export Leads</button>
          <button className="rtm-btn-secondary text-sm px-3 py-2">📊 Lead Sources Report</button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { title: "New Leads",           value: String(newLeads),          icon: "🎯", iconBg: "#EEF2FF", iconColor: "#6366F1", trend: "up" as const,      trendValue: "+5" },
          { title: "Qualified Leads",     value: String(qualifiedLeads),    icon: "✅", iconBg: "#ECFDF5", iconColor: "#059669", trend: "up" as const,      trendValue: "+3" },
          { title: "Discovery Scheduled", value: String(discoveryScheduled),icon: "📅", iconBg: "#F0F9FF", iconColor: "#0284C7", trend: "neutral" as const, trendValue: "±0" },
          { title: "Audits Requested",    value: String(auditsRequested),   icon: "📋", iconBg: "#FFF7ED", iconColor: "#EA580C", trend: "up" as const,      trendValue: "+2" },
          { title: "Audits In Progress",  value: String(auditsInProgress),  icon: "🔍", iconBg: "#FEF2F2", iconColor: "#DC2626", trend: "up" as const,      trendValue: "+1" },
          { title: "Proposal Opps",       value: String(proposalOpps),      icon: "💼", iconBg: "#F5F3FF", iconColor: "#7C3AED", trend: "up" as const,      trendValue: "+2" },
          { title: "Conversion Rate",     value: `${conversionRate}%`,      icon: "📈", iconBg: "#F0FDF4", iconColor: "#16A34A", trend: "up" as const,      trendValue: "+2%" },
          { title: "Pipeline Value",      value: `${fmt$(pipelineValue)}/mo`,icon: "💰",iconBg: "#FFFBEB", iconColor: "#D97706", trend: "up" as const,      trendValue: "+$4K" },
        ].map(card => (
          <KpiCard key={card.title} title={card.title} value={card.value}
            icon={<span className="text-lg">{card.icon}</span>}
            iconBg={card.iconBg} iconColor={card.iconColor}
            trend={card.trend} trendValue={card.trendValue} />
        ))}
      </div>

      {/* Lead Pipeline */}
      <div className="rounded-xl border p-5" style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--rtm-text-primary)" }}>Lead Pipeline</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--rtm-text-muted)" }}>{leadsData.length} total leads across all stages</p>
          </div>
          <div className="flex gap-2">
            <Link href="/sales/proposals" className="rtm-btn-secondary text-xs px-3 py-1.5">Proposal Center →</Link>
            <Link href="/admin/workflows" className="rtm-btn-secondary text-xs px-3 py-1.5">Workflows →</Link>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {allStages.map(stage => {
            const cfg = STAGE_CONFIG[stage];
            const count = stageCounts[stage] || 0;
            const isActive = stageFilter === stage;
            return (
              <button key={stage} onClick={() => setStageFilter(isActive ? "All" : stage)}
                className="flex-shrink-0 rounded-xl border p-3 text-left min-w-[130px] transition-all"
                style={{
                  background: isActive ? cfg.bg : "var(--rtm-bg)",
                  borderColor: isActive ? cfg.color : "var(--rtm-border)",
                  boxShadow: isActive ? `0 0 0 2px ${cfg.color}30` : undefined,
                }}>
                <p className="text-2xl font-bold mb-1" style={{ color: cfg.color }}>{count}</p>
                <p className="text-[10px] font-bold leading-tight" style={{ color: cfg.color }}>{stage}</p>
                {count > 0 && (
                  <p className="text-[10px] mt-1" style={{ color: "var(--rtm-text-muted)" }}>
                    {fmt$(leadsData.filter(l => l.stage === stage).reduce((a, l) => a + l.estimatedValue, 0))}/mo
                  </p>
                )}
              </button>
            );
          })}
        </div>

        {/* Workflow Representation */}
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--rtm-border)" }}>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--rtm-text-muted)" }}>Revenue Lifecycle</p>
          <div className="flex items-center gap-1 flex-wrap text-[10px] font-semibold" style={{ color: "var(--rtm-text-muted)" }}>
            {["Lead Created", "Assigned", "Discovery Scheduled", "Discovery Complete", "Qualified", "Audit Requested", "Audit Complete", "Proposal Created"].map((step, i, arr) => (
              <span key={step} className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded" style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)" }}>{step}</span>
                {i < arr.length - 1 && <span style={{ color: workspace.accentColor }}>→</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Lead Sources */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
        {sources.sort((a, b) => sourceCounts[b] - sourceCounts[a]).map(source => {
          const color = SOURCE_COLORS[source] ?? "#64748B";
          const isActive = sourceFilter === source;
          return (
            <button key={source} onClick={() => setSourceFilter(isActive ? "All" : source)}
              className="rounded-xl border p-3 text-center transition-all"
              style={{
                background: isActive ? `${color}15` : "var(--rtm-surface)",
                borderColor: isActive ? color : "var(--rtm-border)",
              }}>
              <p className="text-xl font-bold" style={{ color }}>{sourceCounts[source]}</p>
              <p className="text-[10px] font-bold mt-0.5 leading-tight" style={{ color: isActive ? color : "var(--rtm-text-muted)" }}>{source}</p>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--rtm-text-muted)" }}>🔍</span>
          <input value={searchQuery} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search leads by name, business, or industry..."
            className="w-full pl-8 pr-4 py-2 rounded-lg border text-sm outline-none transition-colors"
            style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)" }}
          />
        </div>
        <div className="flex items-center gap-2 text-xs" style={{ color: "var(--rtm-text-muted)" }}>
          <span>{filtered.length} leads</span>
          {(stageFilter !== "All" || sourceFilter !== "All" || searchQuery) && (
            <button onClick={() => { setStageFilter("All"); setSourceFilter("All"); setSearchQuery(""); }}
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
                {[
                  "Lead Name", "Business Name", "Industry", "Lead Source",
                  "Assigned Rep", "Stage", "Opp Score", "Est. Value",
                  "Discovery", "Audit", "Affiliate", "Created", "Last Activity", "Actions",
                ].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"
                    style={{ color: "var(--rtm-text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: "var(--rtm-border)" }}>
              {filtered.map((lead, i) => (
                <tr key={lead.id}
                  className="transition-colors hover:cursor-pointer"
                  style={{ background: i % 2 === 0 ? "var(--rtm-bg)" : "var(--rtm-surface)" }}
                  onClick={() => setSelectedLead(lead)}>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{lead.name}</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{lead.phone}</p>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-sm" style={{ color: "var(--rtm-text-primary)" }}>{lead.businessName}</p>
                    <p className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>{lead.location}</p>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-xs px-2 py-0.5 rounded" style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)" }}>
                      {lead.industry}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">{sourceBadge(lead.leadSource)}</td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-xs font-semibold" style={{ color: "var(--rtm-text-primary)" }}>{lead.assignedRep}</p>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">{stageBadge(lead.stage)}</td>

                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 min-w-[60px]">
                        <div className="h-full rounded-full"
                          style={{ width: `${lead.opportunityScore}%`, background: lead.opportunityScore >= 70 ? "#059669" : lead.opportunityScore >= 50 ? "#D97706" : "#94A3B8" }} />
                      </div>
                      <span className="text-xs font-bold w-6 flex-shrink-0" style={{ color: lead.opportunityScore >= 70 ? "#059669" : lead.opportunityScore >= 50 ? "#D97706" : "#94A3B8" }}>
                        {lead.opportunityScore}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="text-sm font-bold" style={{ color: workspace.accentColor }}>{fmt$(lead.estimatedValue)}<span className="text-xs font-normal text-slate-400">/mo</span></p>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {(() => {
                      const ds = lead.discoveryStatus;
                      const v = ds === "Completed" ? { bg: "#ECFDF5", c: "#059669" } : ds === "Scheduled" ? { bg: "#F0F9FF", c: "#0284C7" } : { bg: "#F8FAFC", c: "#94A3B8" };
                      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: v.bg, color: v.c }}>{ds}</span>;
                    })()}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {(() => {
                      const as = lead.auditStatus;
                      const v = as === "Completed" ? { bg: "#ECFDF5", c: "#059669" } : as === "In Progress" ? { bg: "#FEF2F2", c: "#DC2626" } : as === "Requested" ? { bg: "#FFF7ED", c: "#EA580C" } : { bg: "#F8FAFC", c: "#94A3B8" };
                      return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: v.bg, color: v.c }}>{as}</span>;
                    })()}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {lead.affiliateName !== "—" ? (
                      <span className="text-xs font-semibold" style={{ color: "#059669" }}>{lead.affiliateName}</span>
                    ) : (
                      <span className="text-xs" style={{ color: "var(--rtm-text-muted)" }}>—</span>
                    )}
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
                        <div className="absolute right-0 top-full mt-1 w-40 rounded-lg border shadow-lg z-10 hidden group-hover:block"
                          style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)" }}>
                          {["Edit Lead", "Assign Sales Rep", "Schedule Discovery", "Create Audit", "Create Follow-Up", "Move Stage", "Convert To Opportunity", "Mark Lost", "Add Note"].map(action => (
                            <button key={action} className="block w-full text-left px-3 py-2 text-xs hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
                              style={{ color: action === "Mark Lost" ? "#DC2626" : "var(--rtm-text-primary)" }}>
                              {action}
                            </button>
                          ))}
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
            <p className="text-3xl mb-2">🎯</p>
            <p className="text-sm font-semibold" style={{ color: "var(--rtm-text-muted)" }}>No leads match your filters.</p>
            <button onClick={() => { setStageFilter("All"); setSourceFilter("All"); setSearchQuery(""); }}
              className="mt-3 rtm-btn-secondary text-xs px-3 py-1.5">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Bottom Integration Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tasks Center", href: "/tasks", icon: "✅", desc: "Follow-ups, reminders, discovery tasks", color: "#6366F1" },
          { label: "Notifications", href: "/notifications", icon: "🔔", desc: "New leads, discovery due, audit requests", color: "#0284C7" },
          { label: "Workflows", href: "/admin/workflows", icon: "⚙️", desc: "Lead → Audit → Proposal automation", color: "#7C3AED" },
          { label: "Proposal Center", href: "/sales/proposals", icon: "📝", desc: "Convert opportunities to proposals", color: "#D97706" },
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