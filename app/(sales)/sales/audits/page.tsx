"use client";

import React, { useState } from "react";

// 
// Types
// 

type FindingSeverity = "Critical"| "High"| "Medium"| "Low";
type AuditPriority = "Critical"| "High"| "Medium"| "Low";
type AuditStatus = "Not Started"| "In Progress"| "Completed"| "Needs Review"| "Pending";
type ProposalStatus = "Not Started"| "Draft"| "Sent"| "Accepted"| "In Proposal";

type AuditType =
  | "SEO Technical"| "SEO Content"| "GBP"| "PPC"| "Meta Ads"| "Website"| "Tracking"| "Call Handling"| "Competitor"| "AI Automation"| "Hosting & Infrastructure";

type CommType = "Call Summary"| "Meeting Notes"| "Client Notes"| "Email"| "SMS"| "Follow-Up"| "Action Item";
type Sentiment = "Positive"| "Neutral"| "Negative"| "Mixed";

//  Finding 
interface AuditFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  category: string;
  description: string;
  recommendation: string;
  revenueImpact: number;
  priority: AuditPriority;
}

//  Recommended Service 
interface RecommendedService {
  id: string;
  service: string;
  reason: string;
  impactScore: number;
  priority: AuditPriority;
  department: string;
  estimatedRevenue: number;
  proposalStatus: "Not Added"| "Added";
}

//  Recommended Line Item 
interface RecommendedLineItem {
  id: string;
  lineItem: string;
  category: string;
  department: string;
  setupFee: number;
  recurringFee: number;
  deliveryStandard: string;
  proposalStatus: "Not Added"| "Added";
}

//  Communication 
interface CallSummary {
  id: string;
  callDate: string;
  duration: string;
  participants: string[];
  summary: string;
  sentiment: Sentiment;
  keyTopics: string[];
  concerns: string[];
  actionItems: string[];
  decisions: string[];
  followUpRequired: boolean;
  followUpDate: string;
  projectImpact: string;
  renewalSignals: string[];
  upsellOpportunities: string[];
}

interface Communication {
  id: string;
  type: CommType;
  date: string;
  subject: string;
  body: string;
  from: string;
  sentiment?: Sentiment;
  followUpDate?: string;
  actionItems?: string[];
  callSummary?: CallSummary;
}

//  Competitor 
interface CompetitorEntry {
  name: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  recommendedActions: string[];
}

//  Timeline Event 
interface TimelineEvent {
  id: string;
  date: string;
  event: string;
  type:
    | "audit_created"| "audit_updated"| "finding_added"| "recommendation_added"| "proposal_generated"| "communication_added"| "followup_added"| "status_changed";
  user: string;
  detail?: string;
}

//  Main Audit Record 
interface Audit {
  id: string;
  auditName: string;
  client: string;
  auditType: AuditType;
  createdBy: string;
  createdDate: string;
  priority: AuditPriority;
  status: AuditStatus;
  issuesFound: number;
  revenueOpportunity: number;
  proposalStatus: ProposalStatus;
  industry: string;
  website: string;
  summary: string;
  overallScore: number;
  findings: AuditFinding[];
  recommendedServices: RecommendedService[];
  recommendedLineItems: RecommendedLineItem[];
  communications: Communication[];
  competitors: CompetitorEntry[];
  timeline: TimelineEvent[];
}

// 
// Mock Data — 15 Audits
// 

const MOCK_AUDITS: Audit[] = [
  // 1 — SEO Technical
  {
    id: "aud-001",
    auditName: "SEO Technical Audit — Metro Dental",
    client: "Metro Dental Group",
    auditType: "SEO Technical",
    createdBy: "Jordan M.",
    createdDate: "Jun 5, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 9,
    revenueOpportunity: 4800,
    proposalStatus: "Draft",
    industry: "Dental",
    website: "metrodentalgroup.com",
    summary: "Strong technical foundation with critical issues in duplicate pages and orphan content suppressing rankings.",
    overallScore: 82,
    findings: [
      { id: "f001-1", title: "Duplicate Location Pages", severity: "Critical", category: "Technical SEO", description: "3 location pages share identical content causing keyword cannibalization.", recommendation: "Consolidate or canonicalize duplicate location pages.", revenueImpact: 1200, priority: "High"},
      { id: "f001-2", title: "Orphan Pages", severity: "High", category: "Internal Linking", description: "5 service pages have zero internal links.", recommendation: "Add internal links to orphan service pages from sitemap and hub pages.", revenueImpact: 800, priority: "High"},
      { id: "f001-3", title: "Missing Meta Descriptions", severity: "Medium", category: "On-Page SEO", description: "9 pages missing meta descriptions reducing CTR.", recommendation: "Write unique, compelling meta descriptions for all pages.", revenueImpact: 400, priority: "Medium"},
      { id: "f001-4", title: "Broken Internal Links", severity: "Medium", category: "Technical SEO", description: "4 broken internal links degrading crawl budget.", recommendation: "Fix or redirect all broken links.", revenueImpact: 300, priority: "Medium"},
      { id: "f001-5", title: "Missing Meta Pixel", severity: "High", category: "Tracking", description: "No Meta Pixel installed — no remarketing capability.", recommendation: "Install Meta Pixel with standard events.", revenueImpact: 1200, priority: "High"},
      { id: "f001-6", title: "Thin Content on Service Pages", severity: "High", category: "Content", description: "Service pages averaging 180 words — below threshold.", recommendation: "Expand service pages to 800+ words.", revenueImpact: 900, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs001-1", service: "SEO Monthly Management", reason: "Ongoing content and technical optimization required.", impactScore: 92, priority: "High", department: "SEO", estimatedRevenue: 1200, proposalStatus: "Not Added"},
      { id: "rs001-2", service: "Tracking & Analytics Setup", reason: "Missing Meta Pixel and form tracking.", impactScore: 88, priority: "High", department: "Reporting", estimatedRevenue: 700, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li001-1", lineItem: "SEO Setup & Onboarding", category: "SEO", department: "SEO", setupFee: 1500, recurringFee: 0, deliveryStandard: "12 days", proposalStatus: "Not Added"},
      { id: "li001-2", lineItem: "SEO Monthly Management", category: "SEO", department: "SEO", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
      { id: "li001-3", lineItem: "Tracking & Analytics Setup", category: "Reporting", department: "Reporting", setupFee: 700, recurringFee: 0, deliveryStandard: "8 days", proposalStatus: "Not Added"},
    ],
    communications: [
      {
        id: "comm-001-1",
        type: "Call Summary",
        date: "Jun 3, 2025",
        subject: "Pre-Audit Discovery Call",
        body: "Discussed current SEO challenges, patient acquisition goals, and 3-location expansion plans.",
        from: "Jordan M.",
        sentiment: "Positive",
        callSummary: {
          id: "cs-001-1",
          callDate: "Jun 3, 2025",
          duration: "32 min",
          participants: ["Jordan M.", "Dr. Sarah Chen (Owner)", "Mike Lee (Marketing)"],
          summary: "Pre-audit discovery call to understand current pain points. Client expressed frustration with low organic visibility despite having a modern website. Discussed 3-location expansion and desire to dominate local dental searches.",
          sentiment: "Positive",
          keyTopics: ["Organic traffic decline", "3-location expansion", "Competitor ranking above them", "Budget for SEO"],
          concerns: ["Budget approval timeline", "Staff time for content creation"],
          actionItems: ["Send audit scope document", "Schedule follow-up after audit completion", "Prepare competitor comparison"],
          decisions: ["Agreed to full SEO technical and content audit", "Budget range confirmed: $1,000–$1,500/mo"],
          followUpRequired: true,
          followUpDate: "Jun 10, 2025",
          projectImpact: "High — expansion plans create urgency for multi-location SEO strategy.",
          renewalSignals: ["Expressed interest in 12-month agreement"],
          upsellOpportunities: ["PPC for new location launches", "GBP optimization across all 3 locations"],
        },
      },
      {
        id: "comm-001-2",
        type: "Email",
        date: "Jun 6, 2025",
        subject: "Audit Complete — Findings Summary",
        body: "Hi Dr. Chen, I've completed your SEO technical audit and found 9 issues including 2 critical items affecting all 3 locations. I'd love to walk you through the findings and recommended action plan.",
        from: "Jordan M.",
        sentiment: "Neutral",
      },
      {
        id: "comm-001-3",
        type: "Follow-Up",
        date: "Jun 10, 2025",
        subject: "Follow-Up: Audit Review Call",
        body: "Schedule audit review call to present findings and recommended service package.",
        from: "Jordan M.",
        followUpDate: "Jun 10, 2025",
        actionItems: ["Send calendar invite", "Prepare proposal draft", "Compile competitor data"],
      },
    ],
    competitors: [
      {
        name: "Chicago Smile Dental",
        strengths: ["1,200+ Google reviews", "Top Local Service Ads position", "Weekly blog publishing"],
        weaknesses: ["Slow mobile page speed (54 mobile score)", "No dedicated service area pages"],
        opportunities: ["Underserving pediatric dental content", "No Instagram presence"],
        threats: ["Already ranking #1 for 'chicago dentist' — established authority"],
        recommendedActions: ["Target pediatric dental keywords they ignore", "Build GBP posting strategy to outpace their reviews", "Create location-specific landing pages"],
      },
    ],
    timeline: [
      { id: "tl-001-1", date: "Jun 3, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M.", detail: "SEO Technical Audit created from discovery call."},
      { id: "tl-001-2", date: "Jun 3, 2025", event: "Communication Added", type: "communication_added", user: "Jordan M.", detail: "Pre-Audit Discovery Call summary logged."},
      { id: "tl-001-3", date: "Jun 5, 2025", event: "Audit Updated", type: "audit_updated", user: "Jordan M.", detail: "6 findings added during site crawl."},
      { id: "tl-001-4", date: "Jun 5, 2025", event: "Finding Added", type: "finding_added", user: "Jordan M.", detail: "Critical: Duplicate Location Pages"},
      { id: "tl-001-5", date: "Jun 5, 2025", event: "Recommendation Added", type: "recommendation_added", user: "AI Engine", detail: "SEO Monthly Management + Tracking Setup recommended."},
      { id: "tl-001-6", date: "Jun 6, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Status updated to Completed."},
      { id: "tl-001-7", date: "Jun 6, 2025", event: "Communication Added", type: "communication_added", user: "Jordan M.", detail: "Email sent: Audit Complete — Findings Summary."},
    ],
  },

  // 2 — GBP Audit
  {
    id: "aud-002",
    auditName: "GBP Audit — Harbor Auto",
    client: "Harbor Auto Group",
    auditType: "GBP",
    createdBy: "Mike T.",
    createdDate: "Jun 6, 2025",
    priority: "Critical",
    status: "Completed",
    issuesFound: 14,
    revenueOpportunity: 8500,
    proposalStatus: "Sent",
    industry: "Automotive",
    website: "harborautogroup.com",
    summary: "GBP profile severely underperforming. Only 31 reviews, 3.8 avg rating, and 6 months without posts. Competitors dominating local pack.",
    overallScore: 28,
    findings: [
      { id: "f002-1", title: "Critically Low Review Volume", severity: "Critical", category: "GBP Reviews", description: "Only 31 reviews vs competitor average of 340. Missing local pack for primary dealer terms.", recommendation: "Launch aggressive review generation campaign targeting 100+ reviews in 90 days.", revenueImpact: 3200, priority: "Critical"},
      { id: "f002-2", title: "No GBP Posts in 6 Months", severity: "High", category: "GBP Posts", description: "GBP profile shows zero engagement activity — algorithmic ranking signal lost.", recommendation: "Post weekly inventory highlights and promotional offers.", revenueImpact: 1800, priority: "High"},
      { id: "f002-3", title: "Only 6 Photos Uploaded", severity: "Critical", category: "GBP Photos", description: "Competitors average 120+ photos. Google deprioritizes low-photo profiles.", recommendation: "Upload 50+ high-quality dealership photos immediately.", revenueImpact: 1200, priority: "Critical"},
      { id: "f002-4", title: "Missing Secondary Categories", severity: "High", category: "GBP Categories", description: "Only primary category set. Missing 8 relevant service categories.", recommendation: "Add all relevant secondary categories for services, parts, and financing.", revenueImpact: 900, priority: "High"},
      { id: "f002-5", title: "No Q&A Section", severity: "Medium", category: "GBP Q&A", description: "Zero Q&A answers. Competitors have 15–30 answered questions.", recommendation: "Seed and answer 15 high-value dealership questions.", revenueImpact: 400, priority: "Medium"},
    ],
    recommendedServices: [
      { id: "rs002-1", service: "GBP Optimization", reason: "Profile critically underperforming — immediate intervention required.", impactScore: 97, priority: "Critical", department: "GBP", estimatedRevenue: 500, proposalStatus: "Added"},
      { id: "rs002-2", service: "Review Generation Campaign", reason: "31 reviews vs 340 competitor avg — urgent gap.", impactScore: 95, priority: "Critical", department: "GBP", estimatedRevenue: 800, proposalStatus: "Added"},
    ],
    recommendedLineItems: [
      { id: "li002-1", lineItem: "GBP Setup & Optimization", category: "GBP", department: "GBP", setupFee: 350, recurringFee: 0, deliveryStandard: "3 days", proposalStatus: "Added"},
      { id: "li002-2", lineItem: "GBP Monthly Management", category: "GBP", department: "GBP", setupFee: 0, recurringFee: 500, deliveryStandard: "Ongoing", proposalStatus: "Added"},
      { id: "li002-3", lineItem: "Review Generation Setup", category: "GBP", department: "GBP", setupFee: 450, recurringFee: 300, deliveryStandard: "5 days", proposalStatus: "Added"},
    ],
    communications: [
      {
        id: "comm-002-1",
        type: "Call Summary",
        date: "Jun 4, 2025",
        subject: "Initial Discovery — GBP Concerns",
        body: "Client expressed concern about losing walk-in traffic to competing dealerships. Suspects GBP is underperforming.",
        from: "Mike T.",
        sentiment: "Negative",
        callSummary: {
          id: "cs-002-1",
          callDate: "Jun 4, 2025",
          duration: "24 min",
          participants: ["Mike T.", "Robert Harbor (Owner)"],
          summary: "Owner shared frustration about declining showroom walk-ins. Mentioned a competitor opened nearby and believes they're losing GBP traffic. Agreed to a GBP audit immediately.",
          sentiment: "Negative",
          keyTopics: ["Declining walk-ins", "Competitor GBP dominance", "Review velocity", "Photo quality"],
          concerns: ["Staff time to gather photos", "Worried about negative reviews"],
          actionItems: ["Complete GBP audit within 48 hours", "Prepare competitor GBP comparison", "Draft review request email template"],
          decisions: ["GBP audit approved", "Budget approved for GBP overhaul"],
          followUpRequired: true,
          followUpDate: "Jun 8, 2025",
          projectImpact: "High — directly tied to showroom traffic loss.",
          renewalSignals: ["Mentioned 3-year relationship and loyalty"],
          upsellOpportunities: ["Website redesign (site is 7 years old)", "PPC for inventory"],
        },
      },
      {
        id: "comm-002-2",
        type: "Action Item",
        date: "Jun 6, 2025",
        subject: "GBP Audit Action Items",
        body: "1. Upload 50 photos\n2. Enable review request automation\n3. Begin weekly GBP posting\n4. Add secondary categories",
        from: "Mike T.",
        actionItems: ["Upload 50 photos", "Enable review request automation", "Begin weekly GBP posting", "Add secondary categories"],
      },
    ],
    competitors: [
      {
        name: "Pacific Toyota San Diego",
        strengths: ["2,400+ reviews", "4.9 avg rating", "Top LSA", "100+ GBP photos", "Daily posts"],
        weaknesses: ["Slow finance application flow", "No EV-specific content"],
        opportunities: ["EV transition content", "Military discount campaign"],
        threats: ["Established review dominance would take 18+ months to overcome"],
        recommendedActions: ["Focus on service center GBP as secondary profile", "Launch LSA immediately", "Differentiate on financing specials in posts"],
      },
    ],
    timeline: [
      { id: "tl-002-1", date: "Jun 4, 2025", event: "Audit Created", type: "audit_created", user: "Mike T.", detail: "GBP Audit created from discovery call."},
      { id: "tl-002-2", date: "Jun 6, 2025", event: "Audit Updated", type: "audit_updated", user: "Mike T.", detail: "5 critical GBP findings documented."},
      { id: "tl-002-3", date: "Jun 6, 2025", event: "Status Changed", type: "status_changed", user: "Mike T.", detail: "Status updated to Completed."},
      { id: "tl-002-4", date: "Jun 6, 2025", event: "Proposal Generated", type: "proposal_generated", user: "Mike T.", detail: "Proposal sent to client."},
    ],
  },

  // 3 — PPC Audit
  {
    id: "aud-003",
    auditName: "PPC Audit — Sunstate Solar",
    client: "Sunstate Solar",
    auditType: "PPC",
    createdBy: "Sarah K.",
    createdDate: "May 30, 2025",
    priority: "Critical",
    status: "Completed",
    issuesFound: 11,
    revenueOpportunity: 6200,
    proposalStatus: "Accepted",
    industry: "Solar",
    website: "sunstatesolar.com",
    summary: "PPC tracking completely broken. Google Ads conversions firing 0 despite active campaigns. Budget being wasted with no measurable ROI.",
    overallScore: 34,
    findings: [
      { id: "f003-1", title: "Broken Conversion Tracking", severity: "Critical", category: "PPC Tracking", description: "Conversion tags present but firing zero events. Cannot measure any campaign performance.", recommendation: "Rebuild conversion tracking from scratch via GTM.", revenueImpact: 2400, priority: "Critical"},
      { id: "f003-2", title: "No Negative Keyword List", severity: "Critical", category: "PPC Structure", description: "Zero negative keywords. Budget wasting on irrelevant queries like 'solar system planets' and 'solar charger'.", recommendation: "Build 300+ solar-specific negative keywords immediately.", revenueImpact: 1800, priority: "Critical"},
      { id: "f003-3", title: "Single Broad Match Campaign", severity: "High", category: "PPC Structure", description: "All keywords in one broad match campaign. No intent segmentation.", recommendation: "Restructure into residential, commercial, and brand campaigns.", revenueImpact: 1200, priority: "High"},
      { id: "f003-4", title: "Homepage as Landing Page", severity: "High", category: "Landing Pages", description: "All paid traffic directed to homepage. No dedicated solar estimate landing page.", recommendation: "Build dedicated solar estimate funnel landing page.", revenueImpact: 800, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs003-1", service: "PPC Campaign Rebuild", reason: "Existing account structure is costing 60-70% wasted spend.", impactScore: 98, priority: "Critical", department: "Paid Advertising", estimatedRevenue: 1500, proposalStatus: "Added"},
      { id: "rs003-2", service: "Tracking & Analytics Setup", reason: "No measurable attribution on any spend.", impactScore: 97, priority: "Critical", department: "Reporting", estimatedRevenue: 700, proposalStatus: "Added"},
    ],
    recommendedLineItems: [
      { id: "li003-1", lineItem: "PPC Campaign Setup", category: "PPC", department: "Paid Advertising", setupFee: 1200, recurringFee: 0, deliveryStandard: "14 days", proposalStatus: "Added"},
      { id: "li003-2", lineItem: "PPC Monthly Management", category: "PPC", department: "Paid Advertising", setupFee: 0, recurringFee: 1500, deliveryStandard: "Ongoing", proposalStatus: "Added"},
      { id: "li003-3", lineItem: "Tracking & Analytics Setup", category: "Reporting", department: "Reporting", setupFee: 700, recurringFee: 0, deliveryStandard: "8 days", proposalStatus: "Added"},
    ],
    communications: [
      {
        id: "comm-003-1",
        type: "Meeting Notes",
        date: "May 28, 2025",
        subject: "PPC Performance Review Meeting",
        body: "Client shared $8,000/mo PPC spend with zero attributed leads in GA4. Concerned about ROI. Requested full audit.",
        from: "Sarah K.",
        sentiment: "Negative",
        actionItems: ["Complete PPC audit", "Pull 90-day search query report", "Identify wasted spend"],
      },
    ],
    competitors: [],
    timeline: [
      { id: "tl-003-1", date: "May 30, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K.", detail: "PPC Audit created after performance review meeting."},
      { id: "tl-003-2", date: "May 31, 2025", event: "Finding Added", type: "finding_added", user: "Sarah K.", detail: "Critical: Broken Conversion Tracking identified."},
      { id: "tl-003-3", date: "Jun 1, 2025", event: "Status Changed", type: "status_changed", user: "Sarah K.", detail: "Status updated to Completed."},
      { id: "tl-003-4", date: "Jun 2, 2025", event: "Proposal Generated", type: "proposal_generated", user: "Sarah K.", detail: "Proposal sent and accepted."},
    ],
  },

  // 4 — Meta Ads Audit
  {
    id: "aud-004",
    auditName: "Meta Ads Audit — Coastal Wellness Spa",
    client: "Coastal Wellness Spa",
    auditType: "Meta Ads",
    createdBy: "Sarah K.",
    createdDate: "Jun 1, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 7,
    revenueOpportunity: 3900,
    proposalStatus: "Draft",
    industry: "Health & Wellness",
    website: "coastalwellnessspa.com",
    summary: "No Meta Ads presence while 4 competitors run active visual campaigns. Pixel installed but no events configured. High-value audience untapped.",
    overallScore: 45,
    findings: [
      { id: "f004-1", title: "No Active Meta Campaigns", severity: "Critical", category: "Meta Ads", description: "Zero Meta Ads campaigns while 4 competitors run active campaigns targeting same audience.", recommendation: "Launch retargeting and prospecting campaigns immediately.", revenueImpact: 1800, priority: "Critical"},
      { id: "f004-2", title: "Pixel Installed — No Events", severity: "High", category: "Meta Tracking", description: "Meta Pixel present but firing zero custom events.", recommendation: "Configure ViewContent, Lead, Contact, and Purchase events.", revenueImpact: 900, priority: "High"},
      { id: "f004-3", title: "No Custom Audiences Built", severity: "High", category: "Meta Audiences", description: "No website visitor, customer, or lookalike audiences created.", recommendation: "Build 5 core audiences: website visitors, bookers, high-value, lookalikes.", revenueImpact: 700, priority: "High"},
      { id: "f004-4", title: "No Retargeting Strategy", severity: "High", category: "Meta Strategy", description: "Spa booking intent visitors not being retargeted.", recommendation: "Build 7-day, 14-day, and 30-day retargeting funnels.", revenueImpact: 500, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs004-1", service: "Meta Ads Setup & Launch", reason: "Competitors running visual campaigns — immediate gap.", impactScore: 94, priority: "High", department: "Paid Advertising", estimatedRevenue: 900, proposalStatus: "Not Added"},
      { id: "rs004-2", service: "Meta Ads Monthly Management", reason: "Ongoing creative rotation and audience optimization.", impactScore: 88, priority: "High", department: "Paid Advertising", estimatedRevenue: 1200, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li004-1", lineItem: "Meta Ads Account Setup", category: "Meta Ads", department: "Paid Advertising", setupFee: 900, recurringFee: 0, deliveryStandard: "10 days", proposalStatus: "Not Added"},
      { id: "li004-2", lineItem: "Meta Ads Monthly Management", category: "Meta Ads", department: "Paid Advertising", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
      { id: "li004-3", lineItem: "Meta Pixel & Events Setup", category: "Tracking", department: "Reporting", setupFee: 400, recurringFee: 0, deliveryStandard: "5 days", proposalStatus: "Not Added"},
    ],
    communications: [
      {
        id: "comm-004-1",
        type: "Email",
        date: "Jun 2, 2025",
        subject: "Meta Ads Audit Complete",
        body: "Hi team, audit reveals significant opportunity — 4 competitors running Meta campaigns and we have zero presence. Ready to walk through the plan.",
        from: "Sarah K.",
        sentiment: "Positive",
      },
    ],
    competitors: [
      {
        name: "Serenity Day Spa SD",
        strengths: ["Active Instagram Reels ads", "Strong lookalike audience", "Weekly promotional offers"],
        weaknesses: ["Poor landing page experience", "No remarketing sequences"],
        opportunities: ["Couples packages not being advertised by competitors"],
        threats: ["Running Meta ads for 18+ months — strong pixel data advantage"],
        recommendedActions: ["Launch with video creative to compete with Reels", "Target couples packages as differentiator"],
      },
    ],
    timeline: [
      { id: "tl-004-1", date: "Jun 1, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K."},
      { id: "tl-004-2", date: "Jun 1, 2025", event: "Finding Added", type: "finding_added", user: "Sarah K.", detail: "Critical: No Active Meta Campaigns"},
      { id: "tl-004-3", date: "Jun 2, 2025", event: "Status Changed", type: "status_changed", user: "Sarah K.", detail: "Completed."},
    ],
  },

  // 5 — Website Audit
  {
    id: "aud-005",
    auditName: "Website Audit — Iron Mark Fitness",
    client: "Iron Mark Fitness",
    auditType: "Website",
    createdBy: "Mike T.",
    createdDate: "May 18, 2025",
    priority: "Critical",
    status: "Completed",
    issuesFound: 18,
    revenueOpportunity: 7500,
    proposalStatus: "Accepted",
    industry: "Fitness",
    website: "ironmarkfit.com",
    summary: "Severe website performance failures. PageSpeed 21 desktop / 11 mobile. Autoplay video causing LCP failure. 22 broken links. Site requires major overhaul.",
    overallScore: 24,
    findings: [
      { id: "f005-1", title: "PageSpeed 21/100 Desktop", severity: "Critical", category: "Performance", description: "Autoplay video on homepage causing LCP of 6.4s. Major conversion killer.", recommendation: "Remove autoplay video. Defer non-critical JS. Compress all images.", revenueImpact: 2800, priority: "Critical"},
      { id: "f005-2", title: "22 Broken Internal Links", severity: "Critical", category: "Technical", description: "22 broken links across class schedule and membership pages from site migration.", recommendation: "Implement 301 redirects for all broken URLs.", revenueImpact: 1400, priority: "Critical"},
      { id: "f005-3", title: "14 Pages Blocked by Robots.txt", severity: "Critical", category: "Crawlability", description: "Class and membership pages accidentally blocked from indexing.", recommendation: "Review and update robots.txt directives.", revenueImpact: 1200, priority: "Critical"},
      { id: "f005-4", title: "Not Mobile Responsive", severity: "Critical", category: "Mobile UX", description: "Tap targets too small. Content overflows on mobile. 70% of traffic is mobile.", recommendation: "Full mobile responsive redesign required.", revenueImpact: 2100, priority: "Critical"},
    ],
    recommendedServices: [
      { id: "rs005-1", service: "Website Redesign", reason: "Site requires complete rebuild — beyond repair.", impactScore: 99, priority: "Critical", department: "Web", estimatedRevenue: 5000, proposalStatus: "Added"},
      { id: "rs005-2", service: "SEO Setup & Onboarding", reason: "Post-redesign SEO foundation required.", impactScore: 90, priority: "High", department: "SEO", estimatedRevenue: 1500, proposalStatus: "Added"},
    ],
    recommendedLineItems: [
      { id: "li005-1", lineItem: "Website Redesign", category: "Web", department: "Web", setupFee: 5000, recurringFee: 0, deliveryStandard: "60 days", proposalStatus: "Added"},
      { id: "li005-2", lineItem: "Website Maintenance (Monthly)", category: "Web", department: "Web", setupFee: 0, recurringFee: 250, deliveryStandard: "Ongoing", proposalStatus: "Added"},
    ],
    communications: [],
    competitors: [
      {
        name: "Boston CrossFit Hub",
        strengths: ["Fast website (92 mobile speed)", "Strong Instagram presence", "4.9 star GBP"],
        weaknesses: ["No PPC presence", "Limited blog content"],
        opportunities: ["Corporate wellness — neither competitor targets it"],
        threats: ["Strong brand recognition in Boston CrossFit community"],
        recommendedActions: ["Redesign to outperform on mobile speed", "Launch corporate wellness package"],
      },
    ],
    timeline: [
      { id: "tl-005-1", date: "May 18, 2025", event: "Audit Created", type: "audit_created", user: "Mike T."},
      { id: "tl-005-2", date: "May 19, 2025", event: "Finding Added", type: "finding_added", user: "Mike T.", detail: "Critical: PageSpeed 21/100"},
      { id: "tl-005-3", date: "May 20, 2025", event: "Status Changed", type: "status_changed", user: "Mike T.", detail: "Completed."},
      { id: "tl-005-4", date: "May 22, 2025", event: "Proposal Generated", type: "proposal_generated", user: "Mike T.", detail: "Proposal accepted."},
    ],
  },

  // 6 — Tracking Audit
  {
    id: "aud-006",
    auditName: "Tracking Audit — Blue Ridge Plumbing",
    client: "Blue Ridge Plumbing",
    auditType: "Tracking",
    createdBy: "Sarah K.",
    createdDate: "Jun 7, 2025",
    priority: "High",
    status: "In Progress",
    issuesFound: 8,
    revenueOpportunity: 3100,
    proposalStatus: "Not Started",
    industry: "Plumbing",
    website: "blueridgeplumbing.com",
    summary: "No call tracking, missing GTM, no Meta Pixel, and form submissions not tracked. Cannot attribute any lead source.",
    overallScore: 22,
    findings: [
      { id: "f006-1", title: "No Call Tracking", severity: "Critical", category: "Call Tracking", description: "Zero call tracking despite phone being the primary lead channel for plumbing.", recommendation: "Install dynamic number insertion across all pages.", revenueImpact: 1200, priority: "Critical"},
      { id: "f006-2", title: "No GTM Container", severity: "High", category: "Tag Management", description: "No Google Tag Manager. Managing tracking tags inline — fragile and incomplete.", recommendation: "Install GTM and migrate all tracking tags.", revenueImpact: 700, priority: "High"},
      { id: "f006-3", title: "Form Submissions Not Tracked", severity: "High", category: "Conversion Tracking", description: "Contact form on Contact page has no tracking event configured.", recommendation: "Add form submission event trigger in GTM.", revenueImpact: 600, priority: "High"},
      { id: "f006-4", title: "No Meta Pixel", severity: "High", category: "Meta Tracking", description: "No Meta Pixel — cannot run any Meta remarketing.", recommendation: "Install Meta Pixel with Lead and Contact events.", revenueImpact: 600, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs006-1", service: "Tracking & Analytics Setup", reason: "Zero attribution currently — critical for lead-based business.", impactScore: 98, priority: "Critical", department: "Reporting", estimatedRevenue: 700, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li006-1", lineItem: "Tracking & Analytics Setup", category: "Reporting", department: "Reporting", setupFee: 700, recurringFee: 0, deliveryStandard: "8 days", proposalStatus: "Not Added"},
      { id: "li006-2", lineItem: "Call Tracking Setup", category: "Reporting", department: "Reporting", setupFee: 300, recurringFee: 150, deliveryStandard: "3 days", proposalStatus: "Not Added"},
    ],
    communications: [
      {
        id: "comm-006-1",
        type: "Client Notes",
        date: "Jun 7, 2025",
        subject: "Tracking Audit Notes",
        body: "Client running $2,500/mo in PPC with no way to measure leads. Owner unaware of tracking gaps. Needs education on attribution.",
        from: "Sarah K.",
      },
    ],
    competitors: [],
    timeline: [
      { id: "tl-006-1", date: "Jun 7, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K."},
      { id: "tl-006-2", date: "Jun 7, 2025", event: "Finding Added", type: "finding_added", user: "Sarah K.", detail: "Critical: No Call Tracking"},
    ],
  },

  // 7 — Call Handling Audit
  {
    id: "aud-007",
    auditName: "Call Handling Audit — NovaCare PT",
    client: "NovaCare Physical Therapy",
    auditType: "Call Handling",
    createdBy: "Jordan M.",
    createdDate: "Jun 3, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 6,
    revenueOpportunity: 4200,
    proposalStatus: "Draft",
    industry: "Physical Therapy",
    website: "novacarerehab.com",
    summary: "Call handling audit reveals front desk missing 34% of inbound calls during peak hours. No call script, no call tracking, no missed call follow-up automation.",
    overallScore: 41,
    findings: [
      { id: "f007-1", title: "34% Missed Call Rate", severity: "Critical", category: "Call Handling", description: "34% of inbound calls go unanswered during peak hours (11am-2pm). Each missed call estimated $280 lifetime value.", recommendation: "Implement after-hours voicemail automation and overflow routing.", revenueImpact: 2100, priority: "Critical"},
      { id: "f007-2", title: "No Call Script in Use", severity: "High", category: "Call Quality", description: "Front desk staff have no standardized intake script. Inconsistent patient experience.", recommendation: "Develop and train call intake script with key qualification questions.", revenueImpact: 900, priority: "High"},
      { id: "f007-3", title: "No Missed Call Follow-Up", severity: "High", category: "Lead Recovery", description: "Missed calls receive no automatic follow-up. Lost leads never recovered.", recommendation: "Implement missed call SMS automation within 5 minutes.", revenueImpact: 800, priority: "High"},
      { id: "f007-4", title: "No Call Recording or Scoring", severity: "Medium", category: "Call Intelligence", description: "Cannot review call quality or train staff without recordings.", recommendation: "Enable call recording and monthly call scoring reviews.", revenueImpact: 400, priority: "Medium"},
    ],
    recommendedServices: [
      { id: "rs007-1", service: "Call Intelligence Setup", reason: "34% missed call rate = direct revenue loss.", impactScore: 96, priority: "Critical", department: "Reporting", estimatedRevenue: 800, proposalStatus: "Not Added"},
      { id: "rs007-2", service: "GBP Optimization", reason: "Multi-location PT with low review volume.", impactScore: 88, priority: "High", department: "GBP", estimatedRevenue: 500, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li007-1", lineItem: "Call Tracking & Intelligence Setup", category: "Reporting", department: "Reporting", setupFee: 600, recurringFee: 200, deliveryStandard: "5 days", proposalStatus: "Not Added"},
      { id: "li007-2", lineItem: "Missed Call SMS Automation", category: "Automation", department: "AI Automation", setupFee: 800, recurringFee: 150, deliveryStandard: "7 days", proposalStatus: "Not Added"},
    ],
    communications: [
      {
        id: "comm-007-1",
        type: "Call Summary",
        date: "Jun 1, 2025",
        subject: "Call Audit Discovery — Front Desk Issues",
        body: "GM mentioned front desk overwhelmed. Agreed to call handling audit.",
        from: "Jordan M.",
        sentiment: "Neutral",
        callSummary: {
          id: "cs-007-1",
          callDate: "Jun 1, 2025",
          duration: "18 min",
          participants: ["Jordan M.", "Lisa Torres (GM)"],
          summary: "GM acknowledged they're losing patients due to missed calls at lunch. No system in place. Excited about automation solution.",
          sentiment: "Positive",
          keyTopics: ["Missed call volume", "Front desk staffing", "Automation options"],
          concerns: ["Cost of new system", "Staff adoption"],
          actionItems: ["Pull 30-day call log from phone provider", "Present automation options", "Prepare ROI calculation for missed calls"],
          decisions: ["Call handling audit approved"],
          followUpRequired: true,
          followUpDate: "Jun 5, 2025",
          projectImpact: "High — each recovered missed call = ~$280 LTV.",
          renewalSignals: ["GM mentioned annual budget review in August — timing opportunity"],
          upsellOpportunities: ["AI chat widget", "Online booking integration", "GBP optimization"],
        },
      },
    ],
    competitors: [],
    timeline: [
      { id: "tl-007-1", date: "Jun 3, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M."},
      { id: "tl-007-2", date: "Jun 3, 2025", event: "Communication Added", type: "communication_added", user: "Jordan M.", detail: "Discovery call summary logged."},
      { id: "tl-007-3", date: "Jun 4, 2025", event: "Finding Added", type: "finding_added", user: "Jordan M.", detail: "Critical: 34% Missed Call Rate"},
      { id: "tl-007-4", date: "Jun 5, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Completed."},
    ],
  },

  // 8 — Competitor Audit
  {
    id: "aud-008",
    auditName: "Competitor Audit — Summit Landscaping",
    client: "Summit Landscaping",
    auditType: "Competitor",
    createdBy: "Jordan M.",
    createdDate: "May 24, 2025",
    priority: "Medium",
    status: "Completed",
    issuesFound: 5,
    revenueOpportunity: 2800,
    proposalStatus: "Draft",
    industry: "Landscaping",
    website: "summitlandscaping.com",
    summary: "Competitors ranking for 220+ keywords this client doesn't target. Three competitors running aggressive seasonal PPC. Client has content advantages unexploited.",
    overallScore: 58,
    findings: [
      { id: "f008-1", title: "220+ Competitor Keyword Gaps", severity: "High", category: "Keyword Strategy", description: "Competitors collectively rank for 220 keywords where client has zero presence.", recommendation: "Build targeted keyword strategy to capture top 50 gap opportunities.", revenueImpact: 1200, priority: "High"},
      { id: "f008-2", title: "No Seasonal PPC Presence", severity: "High", category: "Competitive PPC", description: "3 competitors running spring/summer PPC campaigns. Client missing peak season revenue.", recommendation: "Launch seasonal PPC for spring/summer landscape installation.", revenueImpact: 900, priority: "High"},
      { id: "f008-3", title: "Weak Review Volume vs Competitors", severity: "Medium", category: "GBP", description: "Client: 47 reviews. Competitor avg: 120 reviews. Losing local search to review-rich competitors.", recommendation: "Launch review generation campaign targeting 150 reviews in 6 months.", revenueImpact: 700, priority: "Medium"},
    ],
    recommendedServices: [
      { id: "rs008-1", service: "SEO Monthly Management", reason: "220+ keyword gaps require structured content strategy.", impactScore: 91, priority: "High", department: "SEO", estimatedRevenue: 1200, proposalStatus: "Not Added"},
      { id: "rs008-2", service: "PPC Campaign Setup", reason: "Missing peak season paid presence vs 3 competitors.", impactScore: 86, priority: "High", department: "Paid Advertising", estimatedRevenue: 1200, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li008-1", lineItem: "SEO Monthly Management", category: "SEO", department: "SEO", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
      { id: "li008-2", lineItem: "Keyword Strategy & Research", category: "SEO", department: "SEO", setupFee: 500, recurringFee: 0, deliveryStandard: "6 days", proposalStatus: "Not Added"},
    ],
    communications: [],
    competitors: [
      {
        name: "Austin Pro Landscapes",
        strengths: ["Top 3 for all major landscaping terms", "Active PPC", "148 Google reviews", "4.7 avg"],
        weaknesses: ["No blog content", "Weak GBP posting"],
        opportunities: ["Irrigation and drainage specialty — competitor ignores it"],
        threats: ["Established local brand — 12 years in market"],
        recommendedActions: ["Target irrigation + drainage specialty keywords", "Build seasonal content calendar competitor lacks"],
      },
      {
        name: "Green Thumb Austin",
        strengths: ["Strong seasonal PPC", "Great before/after Instagram"],
        weaknesses: ["Poor website — 2019 design", "Low review volume (32 reviews)"],
        opportunities: ["Review generation will quickly outpace them"],
        threats: ["Active paid advertising in peak season"],
        recommendedActions: ["Compete on review volume", "Match and beat their PPC during spring season"],
      },
    ],
    timeline: [
      { id: "tl-008-1", date: "May 24, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M."},
      { id: "tl-008-2", date: "May 26, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Completed."},
    ],
  },

  // 9 — AI Automation Audit
  {
    id: "aud-009",
    auditName: "AI Automation Audit — Westbrook Law",
    client: "Westbrook Law Group",
    auditType: "AI Automation",
    createdBy: "Sarah K.",
    createdDate: "Jun 4, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 9,
    revenueOpportunity: 5600,
    proposalStatus: "Draft",
    industry: "Legal",
    website: "westbrooklawgroup.com",
    summary: "Law firm relying entirely on manual intake processes. Missing automated lead nurturing, chatbot, appointment booking automation, and CRM integration.",
    overallScore: 19,
    findings: [
      { id: "f009-1", title: "No Lead Nurturing Automation", severity: "Critical", category: "Automation", description: "New leads receive manual email outreach 2–3 days after inquiry. Competitors follow up within minutes.", recommendation: "Build automated 5-step lead nurturing sequence triggered at inquiry.", revenueImpact: 2200, priority: "Critical"},
      { id: "f009-2", title: "No Chatbot or AI Assistant", severity: "High", category: "AI Automation", description: "Website has no live chat or AI assistant. Visitors with urgent legal questions leave immediately.", recommendation: "Deploy AI chat widget with legal intake qualification flow.", revenueImpact: 1400, priority: "High"},
      { id: "f009-3", title: "No Appointment Booking Automation", severity: "High", category: "Automation", description: "Consultations scheduled manually by phone only. Friction causing lost leads.", recommendation: "Integrate online booking with automated calendar sync.", revenueImpact: 1100, priority: "High"},
      { id: "f009-4", title: "No CRM Integration", severity: "High", category: "CRM", description: "No CRM in use. Leads tracked in spreadsheets. Cannot measure conversion rates.", recommendation: "Implement CRM with lead tracking and automated pipeline stages.", revenueImpact: 900, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs009-1", service: "AI Automation Setup", reason: "Manual intake losing leads to automated competitors.", impactScore: 97, priority: "Critical", department: "AI Automation", estimatedRevenue: 2500, proposalStatus: "Not Added"},
      { id: "rs009-2", service: "CRM Setup & Integration", reason: "No lead tracking or pipeline visibility.", impactScore: 90, priority: "High", department: "AI Automation", estimatedRevenue: 1200, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li009-1", lineItem: "AI Automation Setup", category: "Automation", department: "AI Automation", setupFee: 2500, recurringFee: 500, deliveryStandard: "21 days", proposalStatus: "Not Added"},
      { id: "li009-2", lineItem: "CRM Setup & Configuration", category: "CRM", department: "AI Automation", setupFee: 1200, recurringFee: 200, deliveryStandard: "14 days", proposalStatus: "Not Added"},
      { id: "li009-3", lineItem: "AI Chatbot Implementation", category: "Automation", department: "AI Automation", setupFee: 1500, recurringFee: 300, deliveryStandard: "10 days", proposalStatus: "Not Added"},
    ],
    communications: [
      {
        id: "comm-009-1",
        type: "Meeting Notes",
        date: "Jun 2, 2025",
        subject: "AI Automation Discovery Meeting",
        body: "Managing partner expressed interest in automating intake. Currently losing 3–4 consultation opportunities per week to slow follow-up. Ready to invest in solution.",
        from: "Sarah K.",
        sentiment: "Positive",
        actionItems: ["Prepare automation ROI model", "Demo AI chatbot options", "CRM comparison doc"],
      },
    ],
    competitors: [],
    timeline: [
      { id: "tl-009-1", date: "Jun 4, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K."},
      { id: "tl-009-2", date: "Jun 5, 2025", event: "Status Changed", type: "status_changed", user: "Sarah K.", detail: "Completed."},
    ],
  },

  // 10 — Hosting & Infrastructure Audit
  {
    id: "aud-010",
    auditName: "Hosting & Infrastructure Audit — Harbor Auto",
    client: "Harbor Auto Group",
    auditType: "Hosting & Infrastructure",
    createdBy: "Mike T.",
    createdDate: "Jun 8, 2025",
    priority: "Critical",
    status: "In Progress",
    issuesFound: 12,
    revenueOpportunity: 3800,
    proposalStatus: "Not Started",
    industry: "Automotive",
    website: "harborautogroup.com",
    summary: "Website hosted on 7-year-old shared hosting plan. No CDN, expired SSL certificate, no automated backups, and multiple security vulnerabilities identified.",
    overallScore: 18,
    findings: [
      { id: "f010-1", title: "Expired SSL Certificate", severity: "Critical", category: "SSL", description: "SSL certificate expired 14 days ago. Browsers displaying 'Not Secure' warning. 68% of visitors leaving immediately.", recommendation: "Renew SSL certificate immediately. Enable auto-renewal.", revenueImpact: 2100, priority: "Critical"},
      { id: "f010-2", title: "No Automated Backups", severity: "Critical", category: "Backups", description: "Last manual backup performed 11 months ago. Site rebuild cost estimated $8,000+ if lost.", recommendation: "Enable daily automated backups to off-site location.", revenueImpact: 800, priority: "Critical"},
      { id: "f010-3", title: "No CDN Configured", severity: "High", category: "Performance", description: "All assets served from origin server. 8x slower for users outside 50-mile radius.", recommendation: "Configure Cloudflare CDN with edge caching.", revenueImpact: 500, priority: "High"},
      { id: "f010-4", title: "Outdated WordPress Core", severity: "Critical", category: "Security", description: "WordPress 5.2.8 — 3 major versions behind. 14 known vulnerabilities unpatched.", recommendation: "Update WordPress core, all plugins, and theme immediately.", revenueImpact: 400, priority: "Critical"},
      { id: "f010-5", title: "Shared Hosting Plan", severity: "High", category: "Hosting", description: "Shared hosting causing slow server response time of 1.8s. 'Noisy neighbor' risk.", recommendation: "Migrate to managed WordPress hosting or VPS.", revenueImpact: 0, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs010-1", service: "Hosting Migration & Setup", reason: "Expired SSL and shared hosting causing critical performance issues.", impactScore: 99, priority: "Critical", department: "Web", estimatedRevenue: 1200, proposalStatus: "Not Added"},
      { id: "rs010-2", service: "Website Security & Maintenance", reason: "14 known vulnerabilities need immediate patching.", impactScore: 97, priority: "Critical", department: "Web", estimatedRevenue: 350, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li010-1", lineItem: "Hosting Migration", category: "Hosting", department: "Web", setupFee: 800, recurringFee: 0, deliveryStandard: "5 days", proposalStatus: "Not Added"},
      { id: "li010-2", lineItem: "Managed Hosting (Monthly)", category: "Hosting", department: "Web", setupFee: 0, recurringFee: 150, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
      { id: "li010-3", lineItem: "SSL Certificate & Cloudflare Setup", category: "Security", department: "Web", setupFee: 400, recurringFee: 0, deliveryStandard: "2 days", proposalStatus: "Not Added"},
      { id: "li010-4", lineItem: "Website Security & Maintenance (Monthly)", category: "Security", department: "Web", setupFee: 0, recurringFee: 250, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
    ],
    communications: [
      {
        id: "comm-010-1",
        type: "Client Notes",
        date: "Jun 8, 2025",
        subject: "Hosting Audit — Urgent SSL Issue",
        body: "Discovered expired SSL while reviewing site. Immediately notified client. Owner unaware. Requesting emergency fix approval.",
        from: "Mike T.",
      },
    ],
    competitors: [],
    timeline: [
      { id: "tl-010-1", date: "Jun 8, 2025", event: "Audit Created", type: "audit_created", user: "Mike T."},
      { id: "tl-010-2", date: "Jun 8, 2025", event: "Finding Added", type: "finding_added", user: "Mike T.", detail: "Critical: Expired SSL Certificate"},
    ],
  },

  // 11 — SEO Content Audit
  {
    id: "aud-011",
    auditName: "SEO Content Audit — Summit Landscaping",
    client: "Summit Landscaping",
    auditType: "SEO Content",
    createdBy: "Jordan M.",
    createdDate: "Jun 2, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 7,
    revenueOpportunity: 3200,
    proposalStatus: "Draft",
    industry: "Landscaping",
    website: "summitlandscaping.com",
    summary: "No blog, thin service pages averaging 150 words, and zero location-specific content. Competitors publishing 12,000+ searchable seasonal content monthly.",
    overallScore: 31,
    findings: [
      { id: "f011-1", title: "No Blog or Content Hub", severity: "Critical", category: "Content Strategy", description: "Zero blog posts. Competitors capturing 8,000+ seasonal searches monthly with content strategy.", recommendation: "Launch content hub with monthly seasonal articles.", revenueImpact: 1400, priority: "Critical"},
      { id: "f011-2", title: "Thin Service Pages", severity: "High", category: "Content Quality", description: "All service pages under 150 words — insufficient for ranking.", recommendation: "Rewrite all service pages to 700+ words with FAQ schema.", revenueImpact: 900, priority: "High"},
      { id: "f011-3", title: "Missing Location Pages", severity: "High", category: "Local Content", description: "No service area pages for Round Rock, Cedar Park, or Georgetown.", recommendation: "Create dedicated service area landing pages for 3 expansion markets.", revenueImpact: 900, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs011-1", service: "SEO Monthly Management", reason: "Content gaps require ongoing strategy.", impactScore: 92, priority: "High", department: "SEO", estimatedRevenue: 1200, proposalStatus: "Not Added"},
      { id: "rs011-2", service: "Content Writing (Monthly)", reason: "Blog content needed to capture seasonal traffic.", impactScore: 85, priority: "High", department: "SEO", estimatedRevenue: 700, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li011-1", lineItem: "SEO Setup & Onboarding", category: "SEO", department: "SEO", setupFee: 1500, recurringFee: 0, deliveryStandard: "12 days", proposalStatus: "Not Added"},
      { id: "li011-2", lineItem: "Content Writing (4 Articles/mo)", category: "Content", department: "SEO", setupFee: 0, recurringFee: 700, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
    ],
    communications: [],
    competitors: [],
    timeline: [
      { id: "tl-011-1", date: "Jun 2, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M."},
      { id: "tl-011-2", date: "Jun 3, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Completed."},
    ],
  },

  // 12 — GBP Audit
  {
    id: "aud-012",
    auditName: "GBP Audit — NovaCare PT",
    client: "NovaCare Physical Therapy",
    auditType: "GBP",
    createdBy: "Jordan M.",
    createdDate: "Jun 3, 2025",
    priority: "High",
    status: "Completed",
    issuesFound: 9,
    revenueOpportunity: 4100,
    proposalStatus: "Draft",
    industry: "Physical Therapy",
    website: "novacarerehab.com",
    summary: "4 locations averaging only 22 reviews each. 2 locations not appearing in local pack at all. No GBP posts from any location.",
    overallScore: 38,
    findings: [
      { id: "f012-1", title: "2 Locations Not in Local Pack", severity: "Critical", category: "GBP Rankings", description: "Westside and Downtown locations not appearing in top 7 for physical therapy searches.", recommendation: "GBP optimization + citation building + review velocity strategy per location.", revenueImpact: 2000, priority: "Critical"},
      { id: "f012-2", title: "22 Avg Reviews Per Location", severity: "High", category: "GBP Reviews", description: "Below benchmark of 75+ reviews for PT practice to rank in local pack.", recommendation: "Implement post-visit review automation for all 4 locations.", revenueImpact: 1400, priority: "High"},
      { id: "f012-3", title: "Zero GBP Posts Across All Locations", severity: "High", category: "GBP Posts", description: "No GBP posts from any of the 4 locations — losing engagement ranking signal.", recommendation: "Weekly location-specific posts: staff spotlights, treatment tips, insurance info.", revenueImpact: 700, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs012-1", service: "GBP Optimization", reason: "4 locations, 2 not ranking — urgent GBP intervention.", impactScore: 96, priority: "Critical", department: "GBP", estimatedRevenue: 500, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li012-1", lineItem: "GBP Monthly Management (4 Locations)", category: "GBP", department: "GBP", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
      { id: "li012-2", lineItem: "GBP Setup & Optimization", category: "GBP", department: "GBP", setupFee: 350, recurringFee: 0, deliveryStandard: "3 days", proposalStatus: "Not Added"},
    ],
    communications: [],
    competitors: [],
    timeline: [
      { id: "tl-012-1", date: "Jun 3, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M."},
      { id: "tl-012-2", date: "Jun 4, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Completed."},
    ],
  },

  // 13 — PPC Audit
  {
    id: "aud-013",
    auditName: "PPC Audit — Metro Dental",
    client: "Metro Dental Group",
    auditType: "PPC",
    createdBy: "Jordan M.",
    createdDate: "Jun 5, 2025",
    priority: "High",
    status: "Needs Review",
    issuesFound: 6,
    revenueOpportunity: 3400,
    proposalStatus: "Not Started",
    industry: "Dental",
    website: "metrodentalgroup.com",
    summary: "Single broad match PPC campaign with no landing pages and missing call tracking. All traffic sent to homepage. Campaign restructure required.",
    overallScore: 44,
    findings: [
      { id: "f013-1", title: "No Dedicated Landing Pages", severity: "Critical", category: "Landing Pages", description: "All paid traffic directed to homepage. No service-specific conversion path.", recommendation: "Build dedicated landing pages for cosmetic, emergency, and implant services.", revenueImpact: 1600, priority: "Critical"},
      { id: "f013-2", title: "No Negative Keywords", severity: "High", category: "PPC Structure", description: "Zero negative keyword list. Wasting budget on DIY dental and dental school searches.", recommendation: "Build 200+ dental-specific negative keyword list.", revenueImpact: 1000, priority: "High"},
      { id: "f013-3", title: "Phone Calls Only Tracked", severity: "High", category: "PPC Tracking", description: "Form submissions and appointment bookings not tracked in Google Ads.", recommendation: "Add conversion actions for forms and appointment booking in GTM.", revenueImpact: 800, priority: "High"},
    ],
    recommendedServices: [
      { id: "rs013-1", service: "PPC Campaign Restructure", reason: "Current structure wasting 40%+ of budget.", impactScore: 93, priority: "High", department: "Paid Advertising", estimatedRevenue: 1200, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li013-1", lineItem: "PPC Campaign Setup", category: "PPC", department: "Paid Advertising", setupFee: 1200, recurringFee: 0, deliveryStandard: "14 days", proposalStatus: "Not Added"},
      { id: "li013-2", lineItem: "PPC Monthly Management", category: "PPC", department: "Paid Advertising", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
    ],
    communications: [],
    competitors: [],
    timeline: [
      { id: "tl-013-1", date: "Jun 5, 2025", event: "Audit Created", type: "audit_created", user: "Jordan M."},
      { id: "tl-013-2", date: "Jun 7, 2025", event: "Status Changed", type: "status_changed", user: "Jordan M.", detail: "Needs Review — awaiting campaign data."},
    ],
  },

  // 14 — Meta Ads Audit
  {
    id: "aud-014",
    auditName: "Meta Ads Audit — Iron Mark Fitness",
    client: "Iron Mark Fitness",
    auditType: "Meta Ads",
    createdBy: "Mike T.",
    createdDate: "May 20, 2025",
    priority: "Medium",
    status: "Completed",
    issuesFound: 5,
    revenueOpportunity: 2600,
    proposalStatus: "Draft",
    industry: "Fitness",
    website: "ironmarkfit.com",
    summary: "Meta Pixel installed with ViewContent only. No campaigns running. Competitor has zero paid presence — window of opportunity to dominate.",
    overallScore: 51,
    findings: [
      { id: "f014-1", title: "Pixel Has Only ViewContent Event", severity: "High", category: "Meta Tracking", description: "Pixel installed but missing Lead, Contact, and trial signup events.", recommendation: "Configure Lead and Purchase events for proper campaign optimization.", revenueImpact: 800, priority: "High"},
      { id: "f014-2", title: "No Meta Campaigns Active", severity: "High", category: "Meta Ads", description: "Zero Meta campaigns while gym memberships have high visual ad affinity.", recommendation: "Launch free trial offer campaign targeting fitness interest audience.", revenueImpact: 1200, priority: "High"},
      { id: "f014-3", title: "No Lookalike Audiences", severity: "Medium", category: "Meta Audiences", description: "No customer email list uploaded for lookalike expansion.", recommendation: "Upload customer list and build 1% lookalike for prospecting.", revenueImpact: 600, priority: "Medium"},
    ],
    recommendedServices: [
      { id: "rs014-1", service: "Meta Ads Monthly Management", reason: "Competitor has no paid presence — first-mover advantage.", impactScore: 88, priority: "High", department: "Paid Advertising", estimatedRevenue: 1200, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li014-1", lineItem: "Meta Ads Setup", category: "Meta Ads", department: "Paid Advertising", setupFee: 900, recurringFee: 0, deliveryStandard: "10 days", proposalStatus: "Not Added"},
      { id: "li014-2", lineItem: "Meta Ads Monthly Management", category: "Meta Ads", department: "Paid Advertising", setupFee: 0, recurringFee: 1200, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
    ],
    communications: [],
    competitors: [],
    timeline: [
      { id: "tl-014-1", date: "May 20, 2025", event: "Audit Created", type: "audit_created", user: "Mike T."},
      { id: "tl-014-2", date: "May 21, 2025", event: "Status Changed", type: "status_changed", user: "Mike T.", detail: "Completed."},
    ],
  },

  // 15 — Hosting & Infrastructure Audit
  {
    id: "aud-015",
    auditName: "Hosting & Infrastructure Audit — Westbrook Law",
    client: "Westbrook Law Group",
    auditType: "Hosting & Infrastructure",
    createdBy: "Sarah K.",
    createdDate: "Jun 5, 2025",
    priority: "Medium",
    status: "Pending",
    issuesFound: 4,
    revenueOpportunity: 1800,
    proposalStatus: "Not Started",
    industry: "Legal",
    website: "westbrooklawgroup.com",
    summary: "Law firm website on entry-level hosting with no security monitoring, no backup strategy, and performance degrading under traffic spikes.",
    overallScore: 44,
    findings: [
      { id: "f015-1", title: "No Security Monitoring", severity: "High", category: "Security", description: "No malware scanning, security alerts, or firewall configured.", recommendation: "Enable security monitoring with daily malware scans and firewall.", revenueImpact: 600, priority: "High"},
      { id: "f015-2", title: "No Backup Strategy", severity: "High", category: "Backups", description: "Last backup 4 months ago. No automated backup schedule.", recommendation: "Configure daily automated backups to off-site storage.", revenueImpact: 700, priority: "High"},
      { id: "f015-3", title: "Performance Degrades Under Load", severity: "Medium", category: "Performance", description: "Server response time spikes to 3.2s during business hours. Shared hosting limitation.", recommendation: "Migrate to managed hosting or dedicated VPS.", revenueImpact: 500, priority: "Medium"},
    ],
    recommendedServices: [
      { id: "rs015-1", service: "Hosting Migration & Managed Hosting", reason: "Current hosting is a liability for a law firm handling sensitive client data.", impactScore: 91, priority: "High", department: "Web", estimatedRevenue: 150, proposalStatus: "Not Added"},
    ],
    recommendedLineItems: [
      { id: "li015-1", lineItem: "Hosting Migration", category: "Hosting", department: "Web", setupFee: 800, recurringFee: 0, deliveryStandard: "5 days", proposalStatus: "Not Added"},
      { id: "li015-2", lineItem: "Managed Hosting (Monthly)", category: "Hosting", department: "Web", setupFee: 0, recurringFee: 150, deliveryStandard: "Ongoing", proposalStatus: "Not Added"},
      { id: "li015-3", lineItem: "Security Monitoring (Monthly)", category: "Security", department: "Web", setupFee: 200, recurringFee: 100, deliveryStandard: "3 days", proposalStatus: "Not Added"},
    ],
    communications: [],
    competitors: [],
    timeline: [
      { id: "tl-015-1", date: "Jun 5, 2025", event: "Audit Created", type: "audit_created", user: "Sarah K."},
    ],
  },
];

// 
// Color Helpers
// 

const SEVERITY_COLORS: Record<FindingSeverity, { bg?: string; text: string; border: string }> = {
  Critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA"},
  High:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  Medium:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A"},
  Low:      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
};

const PRIORITY_COLORS: Record<AuditPriority, { bg?: string; text: string; border: string }> = {
  Critical: { bg: "#FEF2F2", text: "#DC2626", border: "#FECACA"},
  High:     { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
  Medium:   { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A"},
  Low:      { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
};

const AUDIT_STATUS_COLORS: Record<AuditStatus, { bg?: string; text: string; border: string }> = {
  "Not Started":  { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB"},
  "Pending":      { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  "In Progress":  { bg: "#F0F9FF", text: "#0369A1", border: "#BAE6FD"},
  "Completed":    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
  "Needs Review": { bg: "#FFF7ED", text: "#C2410C", border: "#FED7AA"},
};

const PROPOSAL_STATUS_COLORS: Record<ProposalStatus, { bg?: string; text: string; border: string }> = {
  "Not Started": { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB"},
  "Draft":       { bg: "#FFFBEB", text: "#D97706", border: "#FDE68A"},
  "Sent":        { bg: "#EFF6FF", text: "#1D4ED8", border: "#BFDBFE"},
  "Accepted":    { bg: "#F0FDF4", text: "#15803D", border: "#BBF7D0"},
  "In Proposal": { bg: "#F5F3FF", text: "#7C3AED", border: "#DDD6FE"},
};

const AUDIT_TYPE_META: Record<AuditType, { icon?: string; color?: string; bg?: string; border: string }> = {
  "SEO Technical":          { icon: "",  color: "#1D4ED8", bg: "#EFF6FF",  border: "#BFDBFE"},
  "SEO Content":            { icon: "",  color: "#059669", bg: "#F0FDF4",  border: "#BBF7D0"},
  "GBP":                    { icon: "",  color: "#D97706", bg: "#FFFBEB",  border: "#FDE68A"},
  "PPC":                    { icon: "",  color: "#C2410C", bg: "#FFF7ED",  border: "#FED7AA"},
  "Meta Ads":               { icon: "",  color: "#1877F2", bg: "#EFF6FF",  border: "#BFDBFE"},
  "Website":                { icon: "",  color: "#7C3AED", bg: "#F5F3FF",  border: "#DDD6FE"},
  "Tracking":               { icon: "",  color: "#0369A1", bg: "#F0F9FF",  border: "#BAE6FD"},
  "Call Handling":          { icon: "",  color: "#BE123C", bg: "#FFF1F2",  border: "#FECDD3"},
  "Competitor":             { icon: "",  color: "#6D28D9", bg: "#F5F3FF",  border: "#DDD6FE"},
  "AI Automation":          { icon: "",  color: "#0F766E", bg: "#F0FDFA",  border: "#99F6E4"},
  "Hosting & Infrastructure": { icon: "", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A"},
};

const COMM_TYPE_META: Record<CommType, { icon?: string; color?: string; bg?: string }> = {
  "Call Summary":  { icon: "", color: "#0369A1", bg: "#F0F9FF"},
  "Meeting Notes": { icon: "", color: "#7C3AED", bg: "#F5F3FF"},
  "Client Notes":  { icon: "", color: "#D97706", bg: "#FFFBEB"},
  "Email":         { icon: "", color: "#059669", bg: "#F0FDF4"},
  "SMS":           { icon: "", color: "#1D4ED8", bg: "#EFF6FF"},
  "Follow-Up":     { icon: "", color: "#C2410C", bg: "#FFF7ED"},
  "Action Item":   { icon: "", color: "#15803D", bg: "#F0FDF4"},
};

const TIMELINE_META: Record<TimelineEvent["type"], { icon?: string; color?: string }> = {
  audit_created:        { icon: "", color: "#1D4ED8"},
  audit_updated:        { icon: "", color: "#D97706"},
  finding_added:        { icon: "", color: "#DC2626"},
  recommendation_added: { icon: "", color: "#7C3AED"},
  proposal_generated:   { icon: "", color: "#059669"},
  communication_added:  { icon: "", color: "#0369A1"},
  followup_added:       { icon: "", color: "#C2410C"},
  status_changed:       { icon: "", color: "#6B7280"},
};

const SENTIMENT_COLORS: Record<Sentiment, { bg?: string; text: string }> = {
  Positive: { bg: "#F0FDF4", text: "#15803D"},
  Neutral:  { bg: "#F3F4F6", text: "#6B7280"},
  Negative: { bg: "#FEF2F2", text: "#DC2626"},
  Mixed:    { bg: "#FFFBEB", text: "#D97706"},
};

function scoreColor(score: number): string {
  if (score >= 80) return "#15803D";
  if (score >= 60) return "#D97706";
  if (score >= 40) return "#EA580C";
  return "#DC2626";
}
function scoreBg(score: number): string {
  if (score >= 80) return "#F0FDF4";
  if (score >= 60) return "#FFFBEB";
  if (score >= 40) return "#FFF7ED";
  return "#FEF2F2";
}

// 
// Shared UI Components
// 

function Badge({
  label,
  bg,
  text,
  border,
}: {
  label: string;
  bg?: string;
  text: string;
  border?: string;
}) {
  return (
    <span
      className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"style={{ background: bg, color: text, borderColor: border ?? "transparent"}}
    >
      {label}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const c = SEVERITY_COLORS[severity];
  return <Badge label={severity} bg={c.bg} text={c.text} border={c.border} />;
}

function PriorityBadge({ priority }: { priority: AuditPriority }) {
  const c = PRIORITY_COLORS[priority];
  return <Badge label={priority} bg={c.bg} text={c.text} border={c.border} />;
}

function AuditStatusBadge({ status }: { status: AuditStatus }) {
  const c = AUDIT_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const c = PROPOSAL_STATUS_COLORS[status];
  return <Badge label={status} bg={c.bg} text={c.text} border={c.border} />;
}

function AuditTypeBadge({ type }: { type: AuditType }) {
  const m = AUDIT_TYPE_META[type];
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"style={{ background: m.bg, color: m.color, borderColor: m.border }}
    >
      <span>{m.icon}</span>
      <span>{type}</span>
    </span>
  );
}

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-black border-4 flex-shrink-0"style={{
        width: size,
        height: size,
        fontSize: size < 44 ? 11 : 14,
        background: scoreBg(score),
        borderColor: scoreColor(score),
        color: scoreColor(score),
        boxShadow: `0 0 0 2px ${scoreBg(score)}`,
      }}
    >
      {score}
    </div>
  );
}

// 
// KPI Cards
// 

function KPICards({ audits }: { audits: Audit[] }) {
  const total = audits.length;
  const pending = audits.filter((a) => a.status === "Pending"|| a.status === "Not Started").length;
  const completed = audits.filter((a) => a.status === "Completed").length;
  const highPriorityFindings = audits.reduce(
    (sum, a) => sum + a.findings.filter((f) => f.severity === "Critical"|| f.severity === "High").length,
    0
  );
  const proposalOpportunities = audits.filter(
    (a) => a.proposalStatus === "Draft"|| a.proposalStatus === "Not Started").length;
  const estimatedRevenue = audits.reduce((sum, a) => sum + a.revenueOpportunity, 0);

  const cards = [
    { label: "Total Audits", value: total, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE"},
    { label: "Pending Audits", value: pending, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A"},
    { label: "Completed Audits", value: completed, color: "#15803D", bg: "#F0FDF4", border: "#BBF7D0"},
    { label: "High Priority Findings", value: highPriorityFindings, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
    { label: "Proposal Opportunities", value: proposalOpportunities, icon: "", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE"},
    { label: "Revenue Opportunity", value: `$${estimatedRevenue.toLocaleString()}`, icon: "", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border p-5 text-center"style={{ background: c.bg, borderColor: c.border }}
        >
          <div className="text-2xl mb-1">{c.icon}</div>
          <div className="text-2xl font-black"style={{ color: c.color }}>
            {c.value}
          </div>
          <div
            className="text-[10px] font-semibold mt-1 leading-tight"style={{ color: c.color }}
          >
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// 
// Sales Flow Banner
// 

function SalesFlowBanner() {
  const steps = [
    { label: "Audit Results", active: true },
    { label: "AI Recommendations"},
    { label: "Proposal Builder", icon: ""},
    { label: "Line Items"},
    { label: "Contracts"},
    { label: "Billing"},
    { label: "Projects"},
  ];
  return (
    <div
      className="rounded-xl border p-4 overflow-x-auto"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
    >
      <p
        className="text-[10px] font-bold uppercase tracking-widest mb-3"style={{ color: "var(--rtm-text-muted)"}}
      >
        RTM OS Sales Flow
      </p>
      <div className="flex items-center gap-0 min-w-max">
        {steps.map((s, i) => (
          <React.Fragment key={s.label}>
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-base border-2"style={{
                  background: s.active ? "#EFF6FF": "var(--rtm-bg)",
                  borderColor: s.active ? "#1D4ED8": "var(--rtm-border)",
                  boxShadow: s.active ? "0 0 0 3px #BFDBFE": undefined,
                }}
              >
                {s.icon}
              </div>
              <span
                className="text-[9px] font-bold text-center leading-tight"style={{
                  color: s.active ? "#1D4ED8": "var(--rtm-text-muted)",
                  maxWidth: 70,
                }}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className="w-8 h-0.5 mb-4 flex-shrink-0"style={{ background: "var(--rtm-border)"}}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// 
// Audit Table
// 

function AuditTable({
  audits,
  onSelect,
}: {
  audits: Audit[];
  onSelect: (a: Audit) => void;
}) {
  return (
    <div
      className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}
    >
      <div className="overflow-x-auto">
        <table
          className="w-full text-sm"style={{ borderCollapse: "collapse", minWidth: 1300 }}
        >
          <thead>
            <tr
              style={{
                background: "var(--rtm-surface)",
                borderBottom: "1px solid var(--rtm-border)",
              }}
            >
              {[
                "Audit Name",
                "Client",
                "Audit Type",
                "Created By",
                "Created Date",
                "Priority",
                "Status",
                "Issues Found",
                "Revenue Opportunity",
                "Proposal Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {audits.map((a, i) => (
              <tr
                key={a.id}
                className="cursor-pointer transition-colors"style={{
                  borderBottom: "1px solid var(--rtm-border-light)",
                  background:
                    i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)",
                }}
                onClick={() => onSelect(a)}
              >
                <td className="px-4 py-3">
                  <p
                    className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}
                  >
                    {a.auditName}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p
                    className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}
                  >
                    {a.client}
                  </p>
                  <p
                    className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {a.industry}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <AuditTypeBadge type={a.auditType} />
                </td>
                <td
                  className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}
                >
                  {a.createdBy}
                </td>
                <td
                  className="px-4 py-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}
                >
                  {a.createdDate}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={a.priority} />
                </td>
                <td className="px-4 py-3">
                  <AuditStatusBadge status={a.status} />
                </td>
                <td className="px-4 py-3">
                  {a.issuesFound > 0 ? (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"style={{ background: "#FEF2F2", color: "#DC2626"}}
                    >
                      {a.issuesFound}
                    </span>
                  ) : (
                    <span
                      className="text-xs"style={{ color: "#15803D"}}
                    >
                      None
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className="text-xs font-bold"style={{ color: "#059669"}}
                  >
                    ${a.revenueOpportunity.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <ProposalStatusBadge status={a.proposalStatus} />
                </td>
                <td
                  className="px-4 py-3"onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onSelect(a)}
                    className="text-xs px-3 py-1.5 rounded-lg font-semibold border"style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      borderColor: "#BFDBFE",
                    }}
                  >
                    View Audit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 
// Drawer Tabs
// 

type DrawerTab =
  | "overview"| "findings"| "ai-recommendations"| "recommended-services"| "recommended-line-items"| "client-communications"| "competitor-analysis"| "proposal-preview"| "activity-timeline";

//  Overview Tab 
function OverviewTab({ audit }: { audit: Audit }) {
  const typeMeta = AUDIT_TYPE_META[audit.auditType];
  const criticalFindings = audit.findings.filter((f) => f.severity === "Critical").length;
  const highFindings = audit.findings.filter((f) => f.severity === "High").length;
  const renewalSignals = audit.communications.flatMap(
    (c) => c.callSummary?.renewalSignals ?? []
  );
  const upsellSignals = audit.communications.flatMap(
    (c) => c.callSummary?.upsellOpportunities ?? []
  );

  return (
    <div className="space-y-5">
      {/* Audit type + score */}
      <div className="flex items-start gap-4">
        <ScoreRing score={audit.overallScore} size={72} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <AuditTypeBadge type={audit.auditType} />
            <AuditStatusBadge status={audit.status} />
            <ProposalStatusBadge status={audit.proposalStatus} />
          </div>
          <p
            className="text-sm font-bold mb-1"style={{ color: "var(--rtm-text-primary)"}}
          >
            {audit.auditName}
          </p>
          <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
            {audit.summary}
          </p>
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Issues Found", value: audit.issuesFound, color: "#DC2626", bg: "#FEF2F2", border: "#FECACA"},
          { label: "Critical Findings", value: criticalFindings, color: "#BE123C", bg: "#FFF1F2", border: "#FECDD3"},
          { label: "High Findings", value: highFindings, color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA"},
          { label: "Revenue Opportunity", value: `$${audit.revenueOpportunity.toLocaleString()}`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border p-4 text-center"style={{ background: c.bg, borderColor: c.border }}
          >
            <div
              className="text-xl font-black"style={{ color: c.color }}
            >
              {c.value}
            </div>
            <div
              className="text-[10px] font-semibold mt-0.5"style={{ color: c.color }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Audit details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Client", value: audit.client },
          { label: "Industry", value: audit.industry },
          { label: "Website", value: audit.website },
          { label: "Audit Type", value: audit.auditType },
          { label: "Created By", value: audit.createdBy },
          { label: "Created Date", value: audit.createdDate },
          { label: "Priority", value: audit.priority },
          { label: "Proposal Status", value: audit.proposalStatus },
        ].map((row) => (
          <div
            key={row.label}
            className="rounded-lg border p-3"style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
            }}
          >
            <p
              className="text-[10px] font-bold uppercase tracking-wide mb-0.5"style={{ color: "var(--rtm-text-muted)"}}
            >
              {row.label}
            </p>
            <p
              className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}
            >
              {row.value}
            </p>
          </div>
        ))}
      </div>

      {/* Communication Intelligence */}
      {(renewalSignals.length > 0 || upsellSignals.length > 0) && (
        <div className="rounded-xl border overflow-hidden"style={{ borderColor: "#DDD6FE"}}>
          <div
            className="px-4 py-3 border-b"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}
          >
            <p className="text-sm font-bold"style={{ color: "#6D28D9"}}>
               Communication Intelligence
            </p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renewalSignals.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#059669"}}
                >
                   Renewal Signals
                </p>
                {renewalSignals.map((s, i) => (
                  <p
                    key={i}
                    className="text-xs mb-1"style={{ color: "#047857"}}
                  >
                    • {s}
                  </p>
                ))}
              </div>
            )}
            {upsellSignals.length > 0 && (
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#D97706"}}
                >
                   Upsell Signals
                </p>
                {upsellSignals.map((s, i) => (
                  <p
                    key={i}
                    className="text-xs mb-1"style={{ color: "#92400E"}}
                  >
                    • {s}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Executive Summary */}
      <div
        className="rounded-xl border p-5"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}
      >
        <div className="flex items-center gap-2 mb-3">
          
          <p className="text-sm font-bold"style={{ color: "#6D28D9"}}>
            AI Executive Summary
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs"style={{ color: "#4C1D95"}}>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Top Findings</p>
            {audit.findings.slice(0, 3).map((f) => (
              <p key={f.id} className="mb-0.5">• {f.title}</p>
            ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Business Risks</p>
            {audit.findings
              .filter((f) => f.severity === "Critical")
              .slice(0, 3)
              .map((f) => (
                <p key={f.id} className="mb-0.5">• {f.description.slice(0, 60)}…</p>
              ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Recommended Package</p>
            {audit.recommendedServices.slice(0, 3).map((s) => (
              <p key={s.id} className="mb-0.5">• {s.service}</p>
            ))}
          </div>
          <div>
            <p className="font-bold mb-1 text-[10px] uppercase tracking-wide">Estimated Revenue Opportunity</p>
            <p className="text-lg font-black"style={{ color: "#6D28D9"}}>
              ${audit.revenueOpportunity.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

//  Findings Tab 
function FindingsTab({ audit }: { audit: Audit }) {
  const critical = audit.findings.filter((f) => f.severity === "Critical");
  const high = audit.findings.filter((f) => f.severity === "High");
  const medium = audit.findings.filter((f) => f.severity === "Medium");
  const low = audit.findings.filter((f) => f.severity === "Low");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Critical", value: critical.length, c: SEVERITY_COLORS.Critical },
          { label: "High", value: high.length, c: SEVERITY_COLORS.High },
          { label: "Medium", value: medium.length, c: SEVERITY_COLORS.Medium },
          { label: "Low", value: low.length, c: SEVERITY_COLORS.Low },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border p-4 text-center"style={{ background: card.c.bg, borderColor: card.c.border }}
          >
            <div
              className="text-2xl font-black"style={{ color: card.c.text }}
            >
              {card.value}
            </div>
            <div
              className="text-[10px] font-semibold mt-0.5"style={{ color: card.c.text }}
            >
              {card.label} Findings
            </div>
          </div>
        ))}
      </div>

      {audit.findings.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"style={{ background: "#F0FDF4", borderColor: "#BBF7D0"}}
        >
          <p className="text-3xl mb-2"></p>
          <p className="text-sm font-semibold"style={{ color: "#15803D"}}>
            No findings recorded for this audit.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {audit.findings.map((f) => {
            const c = SEVERITY_COLORS[f.severity];
            return (
              <div
                key={f.id}
                className="rounded-xl border overflow-hidden"style={{ borderColor: c.border }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-3"style={{
                    background: c.bg,
                    borderBottom: `1px solid ${c.border}`,
                  }}
                >
                  <SeverityBadge severity={f.severity} />
                  <PriorityBadge priority={f.priority} />
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"style={{
                      background: "#EFF6FF",
                      color: "#1D4ED8",
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    {f.category}
                  </span>
                  <p
                    className="font-bold text-sm flex-1"style={{ color: "var(--rtm-text-primary)"}}
                  >
                    {f.title}
                  </p>
                  {f.revenueImpact > 0 && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"style={{
                        background: "#ECFDF5",
                        color: "#059669",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      ${f.revenueImpact.toLocaleString()} opportunity
                    </span>
                  )}
                </div>
                <div
                  className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"style={{ background: "var(--rtm-bg)"}}
                >
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}
                    >
                      Issue
                    </p>
                    <p
                      className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}
                    >
                      {f.description}
                    </p>
                  </div>
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}
                    >
                       Recommendation
                    </p>
                    <p
                      className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}
                    >
                      {f.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

//  AI Recommendations Tab 
function AIRecommendationsTab({ audit }: { audit: Audit }) {
  return (
    <div className="space-y-5">
      <div
        className="rounded-xl border p-5"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}
      >
        <div className="flex items-start gap-3">
          
          <div>
            <p className="text-base font-bold"style={{ color: "#6D28D9"}}>
              AI Recommendation Engine
            </p>
            <p className="text-xs mt-0.5"style={{ color: "#7C3AED"}}>
              Based on {audit.findings.length} audit findings across {audit.auditType} — generating service recommendations with priority ranking, estimated impact, and revenue opportunity.
            </p>
          </div>
        </div>
      </div>

      {audit.recommendedServices.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
        >
          <p className="text-3xl mb-2"></p>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
            AI recommendations not yet generated for this audit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {audit.recommendedServices.map((s) => {
            const pc = PRIORITY_COLORS[s.priority];
            return (
              <div
                key={s.id}
                className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between flex-wrap gap-2"style={{ background: pc.bg, borderBottom: `1px solid ${pc.border}` }}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <PriorityBadge priority={s.priority} />
                    <p
                      className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}
                    >
                      {s.service}
                    </p>
                    <Badge
                      label={s.department}text="#1D4ED8"border="#BFDBFE"/>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-full"style={{ background: "#F5F3FF", color: "#6D28D9", border: "1px solid #DDD6FE"}}
                    >
                      Impact: {s.impactScore}/100
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"style={{ background: "#ECFDF5", color: "#059669", border: "1px solid #A7F3D0"}}
                    >
                      ${s.estimatedRevenue.toLocaleString()}/mo
                    </span>
                  </div>
                </div>
                <div
                  className="p-4"style={{ background: "var(--rtm-bg)"}}
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide mb-1"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    Why Recommended
                  </p>
                  <p
                    className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}
                  >
                    {s.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

//  Recommended Services Tab 
function RecommendedServicesTab({ audit }: { audit: Audit }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}
      >
        <div
          className="px-4 py-3 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
        >
          <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
             Service Recommendation Panel
          </p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            {audit.recommendedServices.length} services recommended based on audit findings
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"style={{ borderCollapse: "collapse", minWidth: 800 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "1px solid var(--rtm-border-light)",
                }}
              >
                {["Recommended Service", "Reason", "Impact Score", "Priority", "Department", "Est. Revenue", "Add To Proposal"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.recommendedServices.map((s, i) => (
                <tr
                  key={s.id}
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)",
                  }}
                >
                  <td
                    className="px-3 py-2 font-semibold"style={{ color: "var(--rtm-text-primary)"}}
                  >
                    {s.service}
                  </td>
                  <td
                    className="px-3 py-2"style={{ color: "var(--rtm-text-secondary)", maxWidth: 220 }}
                  >
                    {s.reason}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="font-black text-xs"style={{ color: "#6D28D9"}}
                    >
                      {s.impactScore}/100
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <PriorityBadge priority={s.priority} />
                  </td>
                  <td className="px-3 py-2">
                    <Badge label={s.department}text="#1D4ED8"border="#BFDBFE"/>
                  </td>
                  <td
                    className="px-3 py-2 font-bold"style={{ color: "#059669"}}
                  >
                    ${s.estimatedRevenue.toLocaleString()}/mo
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        setAdded((prev) => {
                          const n = new Set(prev);
                          if (n.has(s.id)) n.delete(s.id);
                          else n.add(s.id);
                          return n;
                        })
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded border"style={{
                        background: added.has(s.id) ? "#ECFDF5": "#EFF6FF",
                        color: added.has(s.id) ? "#059669": "#1D4ED8",
                        borderColor: added.has(s.id) ? "#A7F3D0": "#BFDBFE",
                      }}
                    >
                      {added.has(s.id) ? "Added": "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

//  Recommended Line Items Tab 
function RecommendedLineItemsTab({ audit }: { audit: Audit }) {
  const [added, setAdded] = useState<Set<string>>(new Set());
  const setupTotal = audit.recommendedLineItems
    .filter((li) => added.has(li.id))
    .reduce((s, li) => s + li.setupFee, 0);
  const recurringTotal = audit.recommendedLineItems
    .filter((li) => added.has(li.id))
    .reduce((s, li) => s + li.recurringFee, 0);

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}
      >
        <div
          className="px-4 py-3 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
        >
          <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
             Line Item Recommendation Panel
          </p>
          <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
            {audit.recommendedLineItems.length} line items recommended · {added.size} selected
          </p>
        </div>
        <div className="overflow-x-auto">
          <table
            className="w-full text-xs"style={{ borderCollapse: "collapse", minWidth: 900 }}
          >
            <thead>
              <tr
                style={{
                  background: "var(--rtm-bg)",
                  borderBottom: "1px solid var(--rtm-border-light)",
                }}
              >
                {["Line Item", "Category", "Department", "Setup Fee", "Recurring Fee", "Delivery Standard", "Add To Proposal"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap"style={{ color: "var(--rtm-text-muted)"}}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.recommendedLineItems.map((li, i) => (
                <tr
                  key={li.id}
                  style={{
                    borderBottom: "1px solid var(--rtm-border-light)",
                    background: i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)",
                  }}
                >
                  <td
                    className="px-3 py-2 font-semibold"style={{ color: "var(--rtm-text-primary)"}}
                  >
                    {li.lineItem}
                  </td>
                  <td className="px-3 py-2">
                    <Badge label={li.category}text="#1D4ED8"border="#BFDBFE"/>
                  </td>
                  <td className="px-3 py-2"style={{ color: "var(--rtm-text-secondary)"}}>{li.department}</td>
                  <td className="px-3 py-2 font-bold"style={{ color: li.setupFee > 0 ? "#C2410C": "#9CA3AF"}}>
                    {li.setupFee > 0 ? `$${li.setupFee.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 font-bold"style={{ color: li.recurringFee > 0 ? "#1D4ED8": "#9CA3AF"}}>
                    {li.recurringFee > 0 ? `$${li.recurringFee.toLocaleString()}/mo` : "—"}
                  </td>
                  <td className="px-3 py-2"style={{ color: "#1D4ED8"}}>{li.deliveryStandard}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() =>
                        setAdded((prev) => {
                          const n = new Set(prev);
                          if (n.has(li.id)) n.delete(li.id);
                          else n.add(li.id);
                          return n;
                        })
                      }
                      className="text-[10px] font-bold px-2 py-1 rounded border"style={{
                        background: added.has(li.id) ? "#ECFDF5": "#EFF6FF",
                        color: added.has(li.id) ? "#059669": "#1D4ED8",
                        borderColor: added.has(li.id) ? "#A7F3D0": "#BFDBFE",
                      }}
                    >
                      {added.has(li.id) ? "Added": "Add"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {added.size > 0 && (
              <tfoot>
                <tr style={{ background: "#ECFDF5", borderTop: "2px solid #A7F3D0"}}>
                  <td colSpan={3} className="px-3 py-2.5 text-xs font-bold"style={{ color: "#059669"}}>Selected Totals</td>
                  <td className="px-3 py-2.5 text-sm font-black"style={{ color: "#C2410C"}}>
                    {setupTotal > 0 ? `$${setupTotal.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-sm font-black"style={{ color: "#1D4ED8"}}>
                    {recurringTotal > 0 ? `$${recurringTotal.toLocaleString()}/mo` : "—"}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}

//  Client Communications Tab 
function ClientCommunicationsTab({ audit }: { audit: Audit }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const lastComm = audit.communications[0];
  const openConcerns = audit.communications.flatMap((c) => c.callSummary?.concerns ?? []);
  const pendingFollowUps = audit.communications.filter((c) => c.type === "Follow-Up");
  const pendingActions = audit.communications.flatMap((c) => c.actionItems ?? []);
  const renewalSignals = audit.communications.flatMap((c) => c.callSummary?.renewalSignals ?? []);
  const upsellSignals = audit.communications.flatMap((c) => c.callSummary?.upsellOpportunities ?? []);

  return (
    <div className="space-y-5">
      {/* Communication Intelligence Panel */}
      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "#DDD6FE"}}>
        <div className="px-4 py-3 border-b"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
          <p className="text-sm font-bold"style={{ color: "#6D28D9"}}> Communication Intelligence Panel</p>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Last Communication", value: lastComm ? `${lastComm.type} — ${lastComm.date}` : "None", color: "#1D4ED8", bg: "#EFF6FF"},
            { label: "Open Concerns", value: openConcerns.length, color: "#C2410C", bg: "#FFF7ED"},
            { label: "Pending Follow-Ups", value: pendingFollowUps.length, color: "#D97706", bg: "#FFFBEB"},
            { label: "Pending Action Items", value: pendingActions.length, color: "#059669", bg: "#ECFDF5"},
          ].map((card) => (
            <div key={card.label} className="rounded-lg border p-3"style={{ background: card.bg, borderColor: `${card.color}30` }}>
              <div
                className="text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mb-0.5"style={{ background: `${card.color}20`, color: card.color }}
              >
                {String(card.label).slice(0, 2).toUpperCase()}
              </div>
              <div className="text-sm font-black"style={{ color: card.color }}>{card.value}</div>
              <div className="text-[10px] font-semibold mt-0.5"style={{ color: card.color }}>{card.label}</div>
            </div>
          ))}
        </div>
        {(renewalSignals.length > 0 || upsellSignals.length > 0) && (
          <div className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renewalSignals.length > 0 && (
              <div className="rounded-lg border p-3"style={{ background: "#F0FDF4", borderColor: "#BBF7D0"}}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#15803D"}}> Renewal Signals</p>
                {renewalSignals.map((s, i) => (
                  <p key={i} className="text-xs mb-0.5"style={{ color: "#047857"}}>• {s}</p>
                ))}
              </div>
            )}
            {upsellSignals.length > 0 && (
              <div className="rounded-lg border p-3"style={{ background: "#FFFBEB", borderColor: "#FDE68A"}}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#D97706"}}> Upsell Signals</p>
                {upsellSignals.map((s, i) => (
                  <p key={i} className="text-xs mb-0.5"style={{ color: "#92400E"}}>• {s}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Growth Opportunities */}
      <div className="rounded-xl border p-4"style={{ background: "#ECFDF5", borderColor: "#A7F3D0"}}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "#059669"}}> Growth Opportunities</p>
        <div className="flex flex-wrap gap-2">
          {audit.communications.flatMap((c) => c.callSummary?.upsellOpportunities ?? []).length === 0 ? (
            <p className="text-xs"style={{ color: "#047857"}}>No growth opportunities identified yet from communications.</p>
          ) : (
            audit.communications.flatMap((c) => c.callSummary?.upsellOpportunities ?? []).map((opp, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg font-semibold"style={{ background: "#D1FAE5", color: "#059669"}}>
                {opp}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Upcoming Meetings placeholder */}
      <div className="rounded-xl border p-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: "var(--rtm-text-muted)"}}> Upcoming Meetings</p>
        {pendingFollowUps.length === 0 ? (
          <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>No upcoming meetings scheduled.</p>
        ) : (
          pendingFollowUps.map((fu) => (
            <div key={fu.id} className="flex items-center gap-3 py-1">
              
              <p className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{fu.subject}</p>
              <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{fu.followUpDate}</span>
            </div>
          ))
        )}
      </div>

      {/* AI Call Intelligence */}
      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "#BAE6FD"}}>
        <div className="px-4 py-3 border-b"style={{ background: "#F0F9FF", borderColor: "#BAE6FD"}}>
          <p className="text-sm font-bold"style={{ color: "#0369A1"}}> AI Call Intelligence</p>
          <p className="text-xs mt-0.5"style={{ color: "#0284C7"}}>Future integrations: CallRail · GoHighLevel · Twilio · Zoom · Google Meet · Microsoft Teams</p>
        </div>
        <div className="p-4">
          {audit.communications.filter((c) => c.callSummary).length === 0 ? (
            <p className="text-xs text-center py-4"style={{ color: "var(--rtm-text-muted)"}}>No call summaries recorded for this audit.</p>
          ) : (
            <div className="space-y-4">
              {audit.communications
                .filter((c) => c.callSummary)
                .map((c) => {
                  const cs = c.callSummary!;
                  const sc = SENTIMENT_COLORS[cs.sentiment];
                  return (
                    <div key={c.id} className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
                      <div
                        className="px-4 py-3 flex items-center justify-between cursor-pointer"style={{ background: "var(--rtm-surface)", borderBottom: "1px solid var(--rtm-border)"}}
                        onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                      >
                        <div className="flex items-center gap-3 flex-wrap">
                          
                          <p className="font-semibold text-sm"style={{ color: "var(--rtm-text-primary)"}}>{c.subject}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"style={{ background: sc.bg, color: sc.text }}>
                            Sentiment: {cs.sentiment}
                          </span>
                          <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{cs.callDate} · {cs.duration}</span>
                        </div>
                        <span style={{ color: "var(--rtm-text-muted)"}}>{expanded === c.id ? "": ""}</span>
                      </div>
                      {expanded === c.id && (
                        <div className="p-4 space-y-4"style={{ background: "var(--rtm-bg)"}}>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { label: "Call Date", value: cs.callDate },
                              { label: "Duration", value: cs.duration },
                              { label: "Follow-Up Required", value: cs.followUpRequired ? `Yes — ${cs.followUpDate}` : "No"},
                              { label: "Project Impact", value: cs.projectImpact },
                            ].map((row) => (
                              <div key={row.label} className="rounded-lg border p-2"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
                                <p className="text-[10px] font-bold uppercase"style={{ color: "var(--rtm-text-muted)"}}>{row.label}</p>
                                <p className="text-xs font-semibold mt-0.5"style={{ color: "var(--rtm-text-primary)"}}>{row.value}</p>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase mb-1"style={{ color: "var(--rtm-text-muted)"}}>Participants</p>
                            <div className="flex flex-wrap gap-1">
                              {cs.participants.map((p) => (
                                <Badge key={p} label={p}text="#1D4ED8"border="#BFDBFE"/>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase mb-1"style={{ color: "var(--rtm-text-muted)"}}>Summary</p>
                            <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{cs.summary}</p>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                              { label: "Key Topics", items: cs.keyTopics, color: "#1D4ED8", bg: "#EFF6FF"},
                              { label: "Concerns", items: cs.concerns, color: "#DC2626", bg: "#FEF2F2"},
                              { label: "Action Items", items: cs.actionItems, color: "#059669", bg: "#F0FDF4"},
                              { label: "Decisions", items: cs.decisions, color: "#7C3AED", bg: "#F5F3FF"},
                              { label: "Renewal Signals", items: cs.renewalSignals, color: "#15803D", bg: "#ECFDF5"},
                              { label: "Upsell Opportunities", items: cs.upsellOpportunities, color: "#D97706", bg: "#FFFBEB"},
                            ].map((section) => (
                              <div key={section.label} className="rounded-lg border p-3"style={{ background: section.bg, borderColor: `${section.color}30` }}>
                                <p className="text-[10px] font-bold uppercase mb-1"style={{ color: section.color }}>{section.label}</p>
                                {section.items.length === 0 ? (
                                  <p className="text-[10px]"style={{ color: section.color }}>—</p>
                                ) : (
                                  section.items.map((item, idx) => (
                                    <p key={idx} className="text-xs mb-0.5"style={{ color: section.color }}>• {item}</p>
                                  ))
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* All Communications */}
      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
        <div className="px-4 py-3 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}> All Communications</p>
        </div>
        {audit.communications.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-2xl mb-2"></p>
            <p className="text-sm"style={{ color: "var(--rtm-text-muted)"}}>No communications recorded for this audit.</p>
          </div>
        ) : (
          <div className="divide-y"style={{ borderColor: "var(--rtm-border-light)"}}>
            {audit.communications.map((comm) => {
              const meta = COMM_TYPE_META[comm.type];
              return (
                <div key={comm.id} className="p-4"style={{ background: "var(--rtm-bg)"}}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"style={{ background: meta.bg }}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge label={comm.type} bg={meta.bg ?? "#F8FAFC"} text={meta.color ?? "var(--rtm-text-secondary)"} />
                        <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{comm.date}</span>
                        <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>· {comm.from}</span>
                        {comm.sentiment && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"style={{ background: SENTIMENT_COLORS[comm.sentiment].bg, color: SENTIMENT_COLORS[comm.sentiment].text }}>
                            {comm.sentiment}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold mb-1"style={{ color: "var(--rtm-text-primary)"}}>{comm.subject}</p>
                      <p className="text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{comm.body}</p>
                      {comm.followUpDate && (
                        <p className="text-[10px] mt-1 font-semibold"style={{ color: "#C2410C"}}> Follow-up: {comm.followUpDate}</p>
                      )}
                      {comm.actionItems && comm.actionItems.length > 0 && (
                        <div className="mt-2">
                          <p className="text-[10px] font-bold uppercase mb-1"style={{ color: "var(--rtm-text-muted)"}}>Action Items</p>
                          {comm.actionItems.map((item, idx) => (
                            <p key={idx} className="text-[10px]"style={{ color: "#059669"}}> {item}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

//  Competitor Analysis Tab 
function CompetitorAnalysisTab({ audit }: { audit: Audit }) {
  if (audit.competitors.length === 0) {
    return (
      <div className="rounded-xl border p-10 text-center"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <p className="text-3xl mb-2"></p>
        <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-muted)"}}>No competitor data for this audit.</p>
        <p className="text-xs mt-1"style={{ color: "var(--rtm-text-muted)"}}>Run a Competitor Audit to populate this section.</p>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {audit.competitors.map((comp) => (
        <div key={comp.name} className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
          <div className="px-4 py-3 border-b flex items-center gap-3"style={{ background: "#F5F3FF", borderColor: "#DDD6FE"}}>
            
            <p className="text-sm font-bold"style={{ color: "#6D28D9"}}>{comp.name}</p>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Strengths", items: comp.strengths, color: "#15803D", bg: "#F0FDF4", icon: ""},
              { label: "Weaknesses", items: comp.weaknesses, color: "#DC2626", bg: "#FEF2F2"},
              { label: "Opportunities", items: comp.opportunities, color: "#D97706", bg: "#FFFBEB"},
              { label: "Threats", items: comp.threats, color: "#7C3AED", bg: "#F5F3FF"},
              { label: "Recommended Actions", items: comp.recommendedActions, color: "#0369A1", bg: "#F0F9FF"},
            ].map((section) => (
              <div key={section.label} className="rounded-lg border p-3"style={{ background: section.bg, borderColor: `${section.color}30` }}>
                <p className="text-[10px] font-bold uppercase tracking-wide mb-2"style={{ color: section.color }}>
                  {section.icon} {section.label}
                </p>
                {section.items.map((item) => (
                  <p key={item} className="text-xs mb-0.5"style={{ color: section.color }}>• {item}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

//  Proposal Preview Tab 
function ProposalPreviewTab({ audit }: { audit: Audit }) {
  const setupTotal = audit.recommendedLineItems.reduce((s, li) => s + li.setupFee, 0);
  const recurringTotal = audit.recommendedLineItems.reduce((s, li) => s + li.recurringFee, 0);
  const annualValue = recurringTotal * 12 + setupTotal;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border p-5"style={{ background: "#ECFDF5", borderColor: "#A7F3D0"}}>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-base font-bold"style={{ color: "#059669"}}> Proposal Preview</p>
            <p className="text-xs mt-0.5"style={{ color: "#047857"}}>Mock preview — based on all recommended services and line items from this audit.</p>
          </div>
          <div className="flex gap-2">
            <button
              className="text-sm px-4 py-2 rounded-lg font-bold"style={{ background: "#059669", color: "#fff"}}
              onClick={() => alert("[Mock] Generating full proposal...")}
            >
              Generate Proposal →
            </button>
            <button
              className="text-sm px-3 py-2 rounded-lg font-semibold border"style={{ background: "#fff", color: "#059669", borderColor: "#A7F3D0"}}
              onClick={() => alert("[Mock] Exporting proposal PDF...")}
            >
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Recommended Services", value: audit.recommendedServices.length, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE"},
          { label: "Setup Fees", value: `$${setupTotal.toLocaleString()}`, color: "#C2410C", bg: "#FFF7ED", border: "#FED7AA"},
          { label: "Estimated Monthly", value: `$${recurringTotal.toLocaleString()}/mo`, color: "#1D4ED8", bg: "#EFF6FF", border: "#BFDBFE"},
          { label: "Projected Package Value", value: `$${annualValue.toLocaleString()}/yr`, color: "#059669", bg: "#ECFDF5", border: "#A7F3D0"},
        ].map((card) => (
          <div key={card.label} className="rounded-xl border p-4 text-center"style={{ background: card.bg, borderColor: card.border }}>
            <div className="text-xl font-black"style={{ color: card.color }}>{card.value}</div>
            <div className="text-[10px] font-semibold mt-0.5"style={{ color: card.color }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
        <div className="px-4 py-3 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}> Recommended Services</p>
        </div>
        <div className="divide-y"style={{ borderColor: "var(--rtm-border-light)"}}>
          {audit.recommendedServices.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 px-4 py-3"style={{ background: i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)"}}>
              <PriorityBadge priority={s.priority} />
              <p className="flex-1 text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{s.service}</p>
              <Badge label={s.department}text="#1D4ED8"border="#BFDBFE"/>
              <span className="text-xs font-bold"style={{ color: "#059669"}}>${s.estimatedRevenue.toLocaleString()}/mo</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden"style={{ borderColor: "var(--rtm-border)"}}>
        <div className="px-4 py-3 border-b"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}> Recommended Line Items</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs"style={{ borderCollapse: "collapse", minWidth: 700 }}>
            <thead>
              <tr style={{ background: "var(--rtm-bg)", borderBottom: "1px solid var(--rtm-border-light)"}}>
                {["Line Item", "Category", "Setup Fee", "Recurring Fee", "Delivery"].map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide"style={{ color: "var(--rtm-text-muted)"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {audit.recommendedLineItems.map((li, i) => (
                <tr key={li.id} style={{ borderBottom: "1px solid var(--rtm-border-light)", background: i % 2 === 0 ? "var(--rtm-bg)": "var(--rtm-surface)"}}>
                  <td className="px-3 py-2 font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{li.lineItem}</td>
                  <td className="px-3 py-2"><Badge label={li.category}text="#1D4ED8"border="#BFDBFE"/></td>
                  <td className="px-3 py-2 font-bold"style={{ color: li.setupFee > 0 ? "#C2410C": "#9CA3AF"}}>
                    {li.setupFee > 0 ? `$${li.setupFee.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-3 py-2 font-bold"style={{ color: li.recurringFee > 0 ? "#1D4ED8": "#9CA3AF"}}>
                    {li.recurringFee > 0 ? `$${li.recurringFee.toLocaleString()}/mo` : "—"}
                  </td>
                  <td className="px-3 py-2"style={{ color: "#1D4ED8"}}>{li.deliveryStandard}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#ECFDF5", borderTop: "2px solid #A7F3D0"}}>
                <td colSpan={2} className="px-3 py-2.5 text-xs font-bold"style={{ color: "#059669"}}>Package Totals</td>
                <td className="px-3 py-2.5 text-sm font-black"style={{ color: "#C2410C"}}>
                  {setupTotal > 0 ? `$${setupTotal.toLocaleString()}` : "—"}
                </td>
                <td className="px-3 py-2.5 text-sm font-black"style={{ color: "#1D4ED8"}}>
                  {recurringTotal > 0 ? `$${recurringTotal.toLocaleString()}/mo` : "—"}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

//  Activity Timeline Tab 
function ActivityTimelineTab({ audit }: { audit: Audit }) {
  return (
    <div className="space-y-3">
      {audit.timeline.length === 0 ? (
        <div className="rounded-xl border p-10 text-center"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
          <p className="text-3xl mb-2"></p>
          <p className="text-sm font-semibold"style={{ color: "var(--rtm-text-muted)"}}>No timeline events yet.</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5"style={{ background: "var(--rtm-border)"}} />
          <div className="space-y-3">
            {audit.timeline.map((event) => {
              const meta = TIMELINE_META[event.type];
              return (
                <div key={event.id} className="flex items-start gap-4 relative pl-12">
                  <div
                    className="absolute left-3 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"style={{ background: meta.color, top: 2, fontSize: 10 }}
                  >
                    {meta.icon}
                  </div>
                  <div
                    className="flex-1 rounded-xl border p-3"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{event.event}</p>
                      <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{event.date} · {event.user}</span>
                    </div>
                    {event.detail && (
                      <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>{event.detail}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// 
// Audit Detail Drawer
// 

function AuditDetailDrawer({
  audit,
  onClose,
}: {
  audit: Audit;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>("overview");

  const tabs: { key: DrawerTab; label: string; icon?: string }[] = [
    { key: "overview", label: "Overview"},
    { key: "findings", label: "Findings"},
    { key: "ai-recommendations", label: "AI Recommendations"},
    { key: "recommended-services", label: "Recommended Services"},
    { key: "recommended-line-items", label: "Recommended Line Items"},
    { key: "client-communications", label: "Client Communications"},
    { key: "competitor-analysis", label: "Competitor Analysis"},
    { key: "proposal-preview", label: "Proposal Preview"},
    { key: "activity-timeline", label: "Activity Timeline"},
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40 backdrop-blur-sm"onClick={onClose} />
      <div
        className="w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden"style={{ background: "var(--rtm-bg)", borderLeft: "1px solid var(--rtm-border)"}}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5 border-b flex-shrink-0"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <AuditTypeBadge type={audit.auditType} />
              <AuditStatusBadge status={audit.status} />
              <PriorityBadge priority={audit.priority} />
              <ProposalStatusBadge status={audit.proposalStatus} />
            </div>
            <h2 className="text-xl font-bold"style={{ color: "var(--rtm-text-primary)"}}>
              {audit.auditName}
            </h2>
            <p className="text-sm mt-0.5"style={{ color: "var(--rtm-text-secondary)"}}>
              {audit.client} · {audit.industry} · {audit.website} · {audit.createdBy} · {audit.createdDate}
            </p>
            <p className="text-xs mt-1 italic"style={{ color: "var(--rtm-text-muted)"}}>
              {audit.summary}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <ScoreRing score={audit.overallScore} size={56} />
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-lg"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-muted)"}}
            >
              
            </button>
          </div>
        </div>

        {/* Quick stats bar */}
        <div
          className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
        >
          {[
            { label: "Issues", value: ` ${audit.issuesFound}`, color: "#DC2626"},
            { label: "Revenue Opp.", value: ` $${audit.revenueOpportunity.toLocaleString()}`, color: "#059669"},
            { label: "Services Rec.", value: ` ${audit.recommendedServices.length}`, color: "#7C3AED"},
            { label: "Line Items", value: ` ${audit.recommendedLineItems.length}`, color: "#1D4ED8"},
            { label: "Communications", value: ` ${audit.communications.length}`, color: "#0369A1"},
            { label: "Competitors", value: ` ${audit.competitors.length}`, color: "#6D28D9"},
            { label: "Timeline Events", value: ` ${audit.timeline.length}`, color: "#6B7280"},
          ].map((s) => (
            <div
              key={s.label}
              className="flex-shrink-0 px-4 py-2 text-center border-r"style={{ borderColor: "var(--rtm-border)"}}
            >
              <div className="text-xs font-black"style={{ color: s.color }}>{s.value}</div>
              <div className="text-[9px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div
          className="flex gap-0 border-b flex-shrink-0 overflow-x-auto"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-surface)"}}
        >
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className="px-3 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1"style={{
                borderBottomColor: activeTab === t.key ? "#1D4ED8": "transparent",
                color: activeTab === t.key ? "#1D4ED8": "var(--rtm-text-muted)",
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview"&& <OverviewTab audit={audit} />}
          {activeTab === "findings"&& <FindingsTab audit={audit} />}
          {activeTab === "ai-recommendations"&& <AIRecommendationsTab audit={audit} />}
          {activeTab === "recommended-services"&& <RecommendedServicesTab audit={audit} />}
          {activeTab === "recommended-line-items"&& <RecommendedLineItemsTab audit={audit} />}
          {activeTab === "client-communications"&& <ClientCommunicationsTab audit={audit} />}
          {activeTab === "competitor-analysis"&& <CompetitorAnalysisTab audit={audit} />}
          {activeTab === "proposal-preview"&& <ProposalPreviewTab audit={audit} />}
          {activeTab === "activity-timeline"&& <ActivityTimelineTab audit={audit} />}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
        >
          <p className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
            {audit.auditName} · Score: {audit.overallScore}/100 · {audit.issuesFound} issues · ${audit.revenueOpportunity.toLocaleString()} revenue opportunity
          </p>
          <div className="flex gap-2">
            <button
              className="text-sm px-3 py-1.5 rounded-lg font-semibold border"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", borderColor: "var(--rtm-border)"}}
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="text-sm px-4 py-1.5 rounded-lg font-bold"style={{ background: "#059669", color: "#fff"}}
              onClick={() => setActiveTab("proposal-preview")}
            >
              Generate Proposal →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 
// Main Page
// 

export default function AuditIntelligenceCenterPage() {
  const [selectedAudit, setSelectedAudit] = useState<Audit | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AuditStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<AuditType | "All">("All");

  const filtered = MOCK_AUDITS.filter((a) => {
    if (statusFilter !== "All"&& a.status !== statusFilter) return false;
    if (typeFilter !== "All"&& a.auditType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.auditName.toLowerCase().includes(q) ||
        a.client.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.createdBy.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalRevOpp = MOCK_AUDITS.reduce((s, a) => s + a.revenueOpportunity, 0);

  return (
    <div className="space-y-6">
      {selectedAudit && (
        <AuditDetailDrawer
          audit={selectedAudit}
          onClose={() => setSelectedAudit(null)}
        />
      )}

      {/* Page Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "#1D4ED8"}}>
            Sales
          </p>
          <h1 className="text-2xl font-medium tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Audits
          </h1>
          <p className="text-sm mt-1 max-w-2xl"style={{ color: "var(--rtm-text-muted)"}}>
            Review client audits, identify issues, generate recommendations, and build proposals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className="text-sm px-3 py-2 rounded-lg font-bold border"style={{ background: "#1D4ED8", color: "#fff", borderColor: "#1D4ED8"}}
            onClick={() => { window.location.href = "/sales/intake?source=new-audit"; }}
          >
            New Audit
          </button>
          <button
            className="text-sm px-3 py-2 rounded-lg font-semibold border"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)"}}
            onClick={() => alert("[Mock] Generating Recommendations...")}
          >
            Generate Recommendations
          </button>
          <button
            className="text-sm px-3 py-2 rounded-lg font-semibold border"style={{ background: "#ECFDF5", color: "#059669", borderColor: "#A7F3D0"}}
            onClick={() => alert("[Mock] Generating Proposal Package...")}
          >
            Generate Proposal
          </button>
          <button
            className="text-sm px-3 py-2 rounded-lg font-semibold border"style={{ background: "var(--rtm-surface)", color: "var(--rtm-text-primary)", borderColor: "var(--rtm-border)"}}
            onClick={() => alert("[Mock] Exporting Audits...")}
          >
            Export
          </button>
        </div>
      </div>

      {/* Workflow Breadcrumb */}
      <div className="rounded-xl border p-4 overflow-x-auto"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <div className="flex items-center justify-between mb-2">
          <a href="/sales/intake" className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>← Sales Intake</a>
          <a href="/sales/recommendations" className="text-xs font-semibold"style={{ color: "#059669"}}>Continue to Recommendations →</a>
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {[
            { label: "Sales Intake",    href: "/sales/intake",          active: false },
            { label: "Goal Audit",       href: "/sales/audits",          active: true  },
            { label: "Recommendations", href: "/sales/recommendations", active: false },
            { label: "Budget Optimizer",href: "/sales/budget-optimizer",active: false },
            { label: "Proposal Builder",href: "/sales/proposals",       active: false },
            { label: "Contract Builder",href: "/sales/contracts",       active: false },
            { label: "Billing Handoff", href: "/sales/handoffs",        active: false },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <a href={step.href}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all"
                style={{
                  background: step.active ? "#1D4ED8" : "var(--rtm-bg)",
                  color: step.active ? "#fff" : "var(--rtm-text-muted)",
                  borderColor: step.active ? "#1D4ED8" : "var(--rtm-border)",
                }}>
                {step.label}
              </a>
              {i < arr.length - 1 && <span className="text-xs" style={{ color: "var(--rtm-border)" }}>→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards audits={MOCK_AUDITS} />

      {/* Revenue Opportunity Banner */}
      <div
        className="rounded-xl border p-4 flex items-center justify-between flex-wrap gap-4"style={{ background: "#ECFDF5", borderColor: "#A7F3D0"}}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest"style={{ color: "#059669"}}>Estimated Revenue Opportunity</p>
          <p className="text-3xl font-black mt-0.5"style={{ color: "#059669"}}>${totalRevOpp.toLocaleString()}</p>
          <p className="text-xs mt-0.5"style={{ color: "#047857"}}>
            Across all {MOCK_AUDITS.length} audits · Based on AI-recommended services and findings
          </p>
        </div>
        <button
          className="text-sm px-4 py-2 rounded-lg font-bold"style={{ background: "#059669", color: "#fff"}}
          onClick={() => alert("[Mock] Generating all proposals...")}
        >
          Generate All Proposals →
        </button>
      </div>

      {/* Audit Types Filter */}
      <div className="rounded-xl border p-4"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}>
        <p className="text-xs font-bold uppercase tracking-widest mb-3"style={{ color: "var(--rtm-text-muted)"}}>
          Audit Types
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTypeFilter("All")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"style={{
              background: typeFilter === "All"? "#EFF6FF": "var(--rtm-bg)",
              color: typeFilter === "All"? "#1D4ED8": "var(--rtm-text-muted)",
              borderColor: typeFilter === "All"? "#BFDBFE": "var(--rtm-border)",
            }}
          >
            All Types
          </button>
          {(Object.keys(AUDIT_TYPE_META) as AuditType[]).filter(t => t !== "AI Automation").map((type) => {
            const m = AUDIT_TYPE_META[type];
            return (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? "All": type)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold"style={{
                  background: typeFilter === type ? m.bg : "var(--rtm-bg)",
                  color: typeFilter === type ? m.color : "var(--rtm-text-muted)",
                  borderColor: typeFilter === type ? m.border : "var(--rtm-border)",
                }}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Status Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 relative"style={{ minWidth: 240 }}>
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"style={{ color: "var(--rtm-text-muted)"}}></span>
          <input
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            placeholder="Search audits by name, client, industry, or sales rep..."className="w-full pl-8 pr-4 py-2 rounded-lg border text-sm outline-none"style={{
              background: "var(--rtm-surface)",
              borderColor: "var(--rtm-border)",
              color: "var(--rtm-text-primary)",
            }}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(["All", "Not Started", "Pending", "In Progress", "Completed", "Needs Review"] as (AuditStatus | "All")[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className="text-xs px-3 py-1.5 rounded-lg font-semibold border whitespace-nowrap"style={{
                background:
                  statusFilter === s
                    ? s === "All"? "#EFF6FF": AUDIT_STATUS_COLORS[s as AuditStatus].bg
                    : "var(--rtm-surface)",
                color:
                  statusFilter === s
                    ? s === "All"? "#1D4ED8": AUDIT_STATUS_COLORS[s as AuditStatus].text
                    : "var(--rtm-text-muted)",
                borderColor:
                  statusFilter === s
                    ? s === "All"? "#BFDBFE": AUDIT_STATUS_COLORS[s as AuditStatus].border
                    : "var(--rtm-border)",
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="text-xs flex-shrink-0"style={{ color: "var(--rtm-text-muted)"}}>
          {filtered.length} audit{filtered.length !== 1 ? "s": ""}
        </div>
      </div>

      {/* Audit Table */}
      <AuditTable audits={filtered} onSelect={setSelectedAudit} />

      {/* Score Legend */}
      <div
        className="rounded-xl border p-4 flex items-center gap-6 flex-wrap"style={{ background: "var(--rtm-surface)", borderColor: "var(--rtm-border)"}}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest"style={{ color: "var(--rtm-text-muted)"}}>
          Score Legend
        </p>
        {[
          { range: "80–100", label: "Strong", color: "#15803D", bg: "#F0FDF4"},
          { range: "60–79", label: "Good", color: "#D97706", bg: "#FFFBEB"},
          { range: "40–59", label: "Needs Work", color: "#EA580C", bg: "#FFF7ED"},
          { range: "0–39", label: "Critical", color: "#DC2626", bg: "#FEF2F2"},
        ].map((item) => (
          <div key={item.range} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black"style={{ background: item.bg, color: item.color }}
            >
              {item.range.split("–")[0]}
            </div>
            <span className="text-xs font-semibold"style={{ color: item.color }}>
              {item.range} — {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
