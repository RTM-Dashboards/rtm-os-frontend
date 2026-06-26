"use client";

import { useState } from "react";
import Link from "next/link";

// 
// Task Template Library
// Route: /admin/task-templates
// Master source of task activation for all services sold in RTM OS
// 

//  Types 

type TemplateType =
  | "Setup"| "Onboarding"| "Launch"| "Monthly Management"| "Quarterly Review"| "Renewal"| "Offboarding"| "Cancellation"| "Upsell"| "Budget Reallocation";

type ActivationTrigger =
  | "Proposal Approved"| "Contract Signed"| "Invoice Paid"| "Client Activated"| "Upsell Approved"| "Renewal Signed"| "Cancellation Requested"| "Offboarding Approved";

type Department =
  | "SEO"| "GBP"| "Paid Advertising"| "Meta Ads"| "Reporting"| "Web Development"| "Creative"| "Account Management"| "Billing";

type DependencyStatus = "Required"| "Optional"| "Blocked"| "Waiting"| "Ready";
type TemplateStatus = "Active"| "Inactive"| "Draft";
type TaskPriority = "High"| "Medium"| "Low";

interface TemplateTask {
  name: string;
  department: Department;
  ownerRole: string;
  targetCompletionDays: number;
  priority: TaskPriority;
  dependency: string;
  dueOffset: string;
  status: DependencyStatus;
}

interface TaskTemplate {
  id: string;
  name: string;
  department: Department;
  type: TemplateType;
  mappedLineItem: string;
  taskCount: number;
  targetCompletionDays: number;
  firstResponseSLA: string;
  activationTrigger: ActivationTrigger;
  status: TemplateStatus;
  lastUpdated: string;
  activationReady: boolean;
  tasks: TemplateTask[];
  description: string;
  dependencies: string[];
  monthlyTaskCount: number;
  quarterlyTaskCount: number;
  marginContribution: string;
}

//  Mock Data 

const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: "tt-001",
    name: "SEO Setup Template",
    department: "SEO",
    type: "Setup",
    mappedLineItem: "SEO Setup",
    taskCount: 6,
    targetCompletionDays: 14,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Invoice Paid",
    status: "Active",
    lastUpdated: "2025-07-20",
    activationReady: true,
    description: "Full technical and access setup for new SEO clients.",
    dependencies: ["Website Access", "GA4 Access"],
    monthlyTaskCount: 14,
    quarterlyTaskCount: 14,
    marginContribution: "High",
    tasks: [
      { name: "Website Access", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "GA4 Access", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 1, priority: "High", dependency: "Website Access", dueOffset: "Day 1", status: "Required"},
      { name: "GSC Access", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 1, priority: "High", dependency: "GA4 Access", dueOffset: "Day 1", status: "Required"},
      { name: "Technical Audit", department: "SEO", ownerRole: "SEO Lead", targetCompletionDays: 5, priority: "High", dependency: "GSC Access", dueOffset: "Day 3", status: "Required"},
      { name: "Keyword Research", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 6, priority: "High", dependency: "Technical Audit", dueOffset: "Day 5", status: "Required"},
      { name: "Baseline Report", department: "SEO", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "Medium", dependency: "Keyword Research", dueOffset: "Day 7", status: "Required"},
    ],
  },
  {
    id: "tt-002",
    name: "SEO Monthly Template",
    department: "SEO",
    type: "Monthly Management",
    mappedLineItem: "SEO Monthly",
    taskCount: 8,
    targetCompletionDays: 20,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Client Activated",
    status: "Active",
    lastUpdated: "2025-07-18",
    activationReady: true,
    description: "Recurring monthly SEO deliverables for active clients.",
    dependencies: ["SEO Setup Template"],
    monthlyTaskCount: 20,
    quarterlyTaskCount: 60,
    marginContribution: "High",
    tasks: [
      { name: "Rankings Review", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Content Optimization", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 4, priority: "High", dependency: "Rankings Review", dueOffset: "Day 3", status: "Required"},
      { name: "Backlink Analysis", department: "SEO", ownerRole: "SEO Lead", targetCompletionDays: 2, priority: "Medium", dependency: "None", dueOffset: "Day 5", status: "Optional"},
      { name: "Technical Health Check", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Day 7", status: "Required"},
      { name: "GSC Data Pull", department: "SEO", ownerRole: "SEO Specialist", targetCompletionDays: 1, priority: "Medium", dependency: "None", dueOffset: "Day 2", status: "Required"},
      { name: "Page Speed Review", department: "Web Development", ownerRole: "Dev", targetCompletionDays: 1, priority: "Low", dependency: "Technical Health Check", dueOffset: "Day 10", status: "Optional"},
      { name: "Monthly Report Draft", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 3, priority: "High", dependency: "GSC Data Pull", dueOffset: "Day 25", status: "Required"},
      { name: "Report Delivery", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Monthly Report Draft", dueOffset: "Day 28", status: "Required"},
    ],
  },
  {
    id: "tt-003",
    name: "GBP Launch Template",
    department: "GBP",
    type: "Launch",
    mappedLineItem: "GBP Optimization",
    taskCount: 6,
    targetCompletionDays: 10,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Invoice Paid",
    status: "Active",
    lastUpdated: "2025-07-22",
    activationReady: true,
    description: "Google Business Profile optimization and launch process.",
    dependencies: ["GBP Access"],
    monthlyTaskCount: 10,
    quarterlyTaskCount: 10,
    marginContribution: "High",
    tasks: [
      { name: "GBP Access", department: "GBP", ownerRole: "GBP Specialist", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Location Verification", department: "GBP", ownerRole: "GBP Specialist", targetCompletionDays: 1, priority: "High", dependency: "GBP Access", dueOffset: "Day 2", status: "Required"},
      { name: "Category Optimization", department: "GBP", ownerRole: "GBP Specialist", targetCompletionDays: 2, priority: "High", dependency: "Location Verification", dueOffset: "Day 3", status: "Required"},
      { name: "Service Optimization", department: "GBP", ownerRole: "GBP Specialist", targetCompletionDays: 2, priority: "High", dependency: "Category Optimization", dueOffset: "Day 4", status: "Required"},
      { name: "Photo Upload", department: "Creative", ownerRole: "Creative Specialist", targetCompletionDays: 2, priority: "Medium", dependency: "Service Optimization", dueOffset: "Day 5", status: "Optional"},
      { name: "Baseline Report", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "Medium", dependency: "Photo Upload", dueOffset: "Day 7", status: "Required"},
    ],
  },
  {
    id: "tt-004",
    name: "GBP Monthly Template",
    department: "GBP",
    type: "Monthly Management",
    mappedLineItem: "GBP Monthly Management",
    taskCount: 6,
    targetCompletionDays: 8,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Client Activated",
    status: "Active",
    lastUpdated: "2025-07-15",
    activationReady: true,
    description: "Recurring Google Business Profile management tasks.",
    dependencies: ["GBP Launch Template"],
    monthlyTaskCount: 8,
    quarterlyTaskCount: 24,
    marginContribution: "High",
    tasks: [
      { name: "Post Publishing (4x)", department: "GBP", ownerRole: "GBP Specialist", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Weekly", status: "Required"},
      { name: "Review Response", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Weekly", status: "Required"},
      { name: "Q&A Monitoring", department: "GBP", ownerRole: "GBP Specialist", targetCompletionDays: 1, priority: "Medium", dependency: "None", dueOffset: "Day 5", status: "Required"},
      { name: "Insights Pull", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 1, priority: "Medium", dependency: "None", dueOffset: "Day 25", status: "Required"},
      { name: "Photo Refresh", department: "Creative", ownerRole: "Creative Specialist", targetCompletionDays: 2, priority: "Low", dependency: "None", dueOffset: "Day 15", status: "Optional"},
      { name: "Monthly Report", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 2, priority: "High", dependency: "Insights Pull", dueOffset: "Day 28", status: "Required"},
    ],
  },
  {
    id: "tt-005",
    name: "PPC Launch Template",
    department: "Paid Advertising",
    type: "Launch",
    mappedLineItem: "PPC Management",
    taskCount: 6,
    targetCompletionDays: 18,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Invoice Paid",
    status: "Active",
    lastUpdated: "2025-07-21",
    activationReady: true,
    description: "Google Ads PPC campaign setup and launch.",
    dependencies: ["Account Access", "Conversion Tracking"],
    monthlyTaskCount: 18,
    quarterlyTaskCount: 18,
    marginContribution: "High",
    tasks: [
      { name: "Account Access", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Conversion Tracking", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 3, priority: "High", dependency: "Account Access", dueOffset: "Day 2", status: "Required"},
      { name: "Campaign Setup", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 8, priority: "High", dependency: "Conversion Tracking", dueOffset: "Day 5", status: "Required"},
      { name: "Audience Setup", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 2, priority: "High", dependency: "Campaign Setup", dueOffset: "Day 6", status: "Required"},
      { name: "Landing Page Review", department: "Web Development", ownerRole: "Dev", targetCompletionDays: 2, priority: "High", dependency: "Campaign Setup", dueOffset: "Day 6", status: "Required"},
      { name: "Launch Approval", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Landing Page Review", dueOffset: "Day 7", status: "Required"},
    ],
  },
  {
    id: "tt-006",
    name: "PPC Monthly Template",
    department: "Paid Advertising",
    type: "Monthly Management",
    mappedLineItem: "PPC Monthly Management",
    taskCount: 7,
    targetCompletionDays: 15,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Client Activated",
    status: "Active",
    lastUpdated: "2025-07-10",
    activationReady: true,
    description: "Recurring Google Ads management and optimization tasks.",
    dependencies: ["PPC Launch Template"],
    monthlyTaskCount: 15,
    quarterlyTaskCount: 45,
    marginContribution: "High",
    tasks: [
      { name: "Bid Management", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 3, priority: "High", dependency: "None", dueOffset: "Weekly", status: "Required"},
      { name: "Ad Copy Refresh", department: "Creative", ownerRole: "Copywriter", targetCompletionDays: 2, priority: "Medium", dependency: "None", dueOffset: "Day 10", status: "Optional"},
      { name: "Negative Keyword Review", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 1, priority: "Medium", dependency: "None", dueOffset: "Day 5", status: "Required"},
      { name: "Quality Score Audit", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 2, priority: "Medium", dependency: "None", dueOffset: "Day 7", status: "Optional"},
      { name: "Budget Pacing Review", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 15", status: "Required"},
      { name: "Performance Report", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 3, priority: "High", dependency: "Budget Pacing Review", dueOffset: "Day 25", status: "Required"},
      { name: "Client Call Prep", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Performance Report", dueOffset: "Day 27", status: "Required"},
    ],
  },
  {
    id: "tt-007",
    name: "Meta Ads Launch Template",
    department: "Meta Ads",
    type: "Launch",
    mappedLineItem: "Meta Ads Management",
    taskCount: 7,
    targetCompletionDays: 16,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Invoice Paid",
    status: "Active",
    lastUpdated: "2025-07-19",
    activationReady: true,
    description: "Meta (Facebook/Instagram) ads campaign setup and launch.",
    dependencies: ["Business Manager Access", "Pixel Setup"],
    monthlyTaskCount: 16,
    quarterlyTaskCount: 16,
    marginContribution: "High",
    tasks: [
      { name: "Business Manager Access", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Pixel Setup", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 2, priority: "High", dependency: "Business Manager Access", dueOffset: "Day 2", status: "Required"},
      { name: "Audience Research", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 3, priority: "High", dependency: "Pixel Setup", dueOffset: "Day 3", status: "Required"},
      { name: "Creative Brief", department: "Creative", ownerRole: "Creative Lead", targetCompletionDays: 2, priority: "High", dependency: "Audience Research", dueOffset: "Day 4", status: "Required"},
      { name: "Ad Creative Production", department: "Creative", ownerRole: "Designer", targetCompletionDays: 4, priority: "High", dependency: "Creative Brief", dueOffset: "Day 6", status: "Required"},
      { name: "Campaign Setup", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 3, priority: "High", dependency: "Ad Creative Production", dueOffset: "Day 7", status: "Required"},
      { name: "Launch Approval", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Campaign Setup", dueOffset: "Day 7", status: "Required"},
    ],
  },
  {
    id: "tt-008",
    name: "Meta Ads Monthly Template",
    department: "Meta Ads",
    type: "Monthly Management",
    mappedLineItem: "Meta Ads Monthly",
    taskCount: 6,
    targetCompletionDays: 14,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Client Activated",
    status: "Active",
    lastUpdated: "2025-07-12",
    activationReady: true,
    description: "Recurring Meta Ads management and creative refresh.",
    dependencies: ["Meta Ads Launch Template"],
    monthlyTaskCount: 14,
    quarterlyTaskCount: 42,
    marginContribution: "High",
    tasks: [
      { name: "Campaign Optimization", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 3, priority: "High", dependency: "None", dueOffset: "Weekly", status: "Required"},
      { name: "Creative Refresh", department: "Creative", ownerRole: "Designer", targetCompletionDays: 3, priority: "Medium", dependency: "None", dueOffset: "Day 10", status: "Optional"},
      { name: "Audience Update", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 2, priority: "Medium", dependency: "None", dueOffset: "Day 7", status: "Optional"},
      { name: "Budget Review", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 15", status: "Required"},
      { name: "Performance Report", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 3, priority: "High", dependency: "Budget Review", dueOffset: "Day 25", status: "Required"},
      { name: "Report Delivery", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Performance Report", dueOffset: "Day 28", status: "Required"},
    ],
  },
  {
    id: "tt-009",
    name: "Reporting Setup Template",
    department: "Reporting",
    type: "Setup",
    mappedLineItem: "Reporting Dashboard",
    taskCount: 5,
    targetCompletionDays: 8,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Invoice Paid",
    status: "Active",
    lastUpdated: "2025-07-17",
    activationReady: true,
    description: "Reporting dashboard configuration and initial baseline setup.",
    dependencies: ["GA4 Access", "All Channel Access"],
    monthlyTaskCount: 8,
    quarterlyTaskCount: 8,
    marginContribution: "Medium",
    tasks: [
      { name: "Dashboard Configuration", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 3, priority: "High", dependency: "None", dueOffset: "Day 2", status: "Required"},
      { name: "Data Source Connection", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "High", dependency: "Dashboard Configuration", dueOffset: "Day 3", status: "Required"},
      { name: "KPI Definition", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Test Report Generation", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 1, priority: "Medium", dependency: "Data Source Connection", dueOffset: "Day 5", status: "Required"},
      { name: "Client Report Walkthrough", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Test Report Generation", dueOffset: "Day 7", status: "Required"},
    ],
  },
  {
    id: "tt-010",
    name: "Reporting Monthly Template",
    department: "Reporting",
    type: "Monthly Management",
    mappedLineItem: "Monthly Reporting",
    taskCount: 4,
    targetCompletionDays: 6,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Client Activated",
    status: "Active",
    lastUpdated: "2025-07-08",
    activationReady: true,
    description: "Monthly reporting deliverable generation and delivery.",
    dependencies: ["Reporting Setup Template"],
    monthlyTaskCount: 6,
    quarterlyTaskCount: 18,
    marginContribution: "Medium",
    tasks: [
      { name: "Data Collection", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Day 23", status: "Required"},
      { name: "Report Draft", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "High", dependency: "Data Collection", dueOffset: "Day 25", status: "Required"},
      { name: "AM Review", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Report Draft", dueOffset: "Day 26", status: "Required"},
      { name: "Report Delivery", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "AM Review", dueOffset: "Day 28", status: "Required"},
    ],
  },
  {
    id: "tt-011",
    name: "Website Build Template",
    department: "Web Development",
    type: "Setup",
    mappedLineItem: "Landing Page Build",
    taskCount: 9,
    targetCompletionDays: 40,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Contract Signed",
    status: "Active",
    lastUpdated: "2025-07-14",
    activationReady: true,
    description: "Full website/landing page build from brief to launch.",
    dependencies: ["Design Brief", "Client Content"],
    monthlyTaskCount: 40,
    quarterlyTaskCount: 40,
    marginContribution: "High",
    tasks: [
      { name: "Discovery Brief", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Wireframe", department: "Web Development", ownerRole: "Web Designer", targetCompletionDays: 6, priority: "High", dependency: "Discovery Brief", dueOffset: "Day 4", status: "Required"},
      { name: "Client Wireframe Approval", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Wireframe", dueOffset: "Day 6", status: "Required"},
      { name: "Design Mockup", department: "Creative", ownerRole: "Designer", targetCompletionDays: 8, priority: "High", dependency: "Client Wireframe Approval", dueOffset: "Day 10", status: "Required"},
      { name: "Client Design Approval", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Design Mockup", dueOffset: "Day 12", status: "Required"},
      { name: "Development", department: "Web Development", ownerRole: "Developer", targetCompletionDays: 16, priority: "High", dependency: "Client Design Approval", dueOffset: "Day 20", status: "Required"},
      { name: "QA & Testing", department: "Web Development", ownerRole: "QA", targetCompletionDays: 4, priority: "High", dependency: "Development", dueOffset: "Day 24", status: "Required"},
      { name: "Client Review", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "QA & Testing", dueOffset: "Day 26", status: "Required"},
      { name: "Launch", department: "Web Development", ownerRole: "Developer", targetCompletionDays: 1, priority: "High", dependency: "Client Review", dueOffset: "Day 28", status: "Required"},
    ],
  },
  {
    id: "tt-012",
    name: "Creative Production Template",
    department: "Creative",
    type: "Setup",
    mappedLineItem: "Creative Package",
    taskCount: 6,
    targetCompletionDays: 20,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Contract Signed",
    status: "Active",
    lastUpdated: "2025-07-11",
    activationReady: true,
    description: "Creative asset production for ad campaigns and brand assets.",
    dependencies: ["Creative Brief", "Brand Assets"],
    monthlyTaskCount: 20,
    quarterlyTaskCount: 20,
    marginContribution: "Medium",
    tasks: [
      { name: "Creative Brief Review", department: "Creative", ownerRole: "Creative Lead", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Concept Development", department: "Creative", ownerRole: "Creative Lead", targetCompletionDays: 4, priority: "High", dependency: "Creative Brief Review", dueOffset: "Day 3", status: "Required"},
      { name: "Client Concept Approval", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Concept Development", dueOffset: "Day 5", status: "Required"},
      { name: "Asset Production", department: "Creative", ownerRole: "Designer", targetCompletionDays: 10, priority: "High", dependency: "Client Concept Approval", dueOffset: "Day 12", status: "Required"},
      { name: "QA", department: "Creative", ownerRole: "Creative Lead", targetCompletionDays: 2, priority: "Medium", dependency: "Asset Production", dueOffset: "Day 14", status: "Required"},
      { name: "Asset Delivery", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "QA", dueOffset: "Day 15", status: "Required"},
    ],
  },
  {
    id: "tt-013",
    name: "Client Onboarding Template",
    department: "Account Management",
    type: "Onboarding",
    mappedLineItem: "Client Onboarding",
    taskCount: 8,
    targetCompletionDays: 6,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Invoice Paid",
    status: "Active",
    lastUpdated: "2025-07-23",
    activationReady: true,
    description: "Complete client onboarding from payment to kickoff call.",
    dependencies: ["Signed Contract", "Invoice Paid"],
    monthlyTaskCount: 6,
    quarterlyTaskCount: 6,
    marginContribution: "Medium",
    tasks: [
      { name: "Assign Account Manager", department: "Account Management", ownerRole: "Director", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Welcome Email", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Assign Account Manager", dueOffset: "Day 1", status: "Required"},
      { name: "Onboarding Questionnaire", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Welcome Email", dueOffset: "Day 2", status: "Required"},
      { name: "Access Collection", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Onboarding Questionnaire", dueOffset: "Day 3", status: "Required"},
      { name: "Schedule Kickoff Call", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Access Collection", dueOffset: "Day 3", status: "Required"},
      { name: "Internal Kickoff Brief", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Schedule Kickoff Call", dueOffset: "Day 5", status: "Required"},
      { name: "Kickoff Call", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Internal Kickoff Brief", dueOffset: "Day 7", status: "Required"},
      { name: "Activate Department Templates", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Kickoff Call", dueOffset: "Day 7", status: "Required"},
    ],
  },
  {
    id: "tt-014",
    name: "Renewal Process Template",
    department: "Account Management",
    type: "Renewal",
    mappedLineItem: "Contract Renewal",
    taskCount: 6,
    targetCompletionDays: 4,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Renewal Signed",
    status: "Active",
    lastUpdated: "2025-07-16",
    activationReady: true,
    description: "Client contract renewal tasks from review to signed agreement.",
    dependencies: ["Contract Expiry Date"],
    monthlyTaskCount: 0,
    quarterlyTaskCount: 4,
    marginContribution: "Low",
    tasks: [
      { name: "Renewal Notice — 60 Days", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day -60", status: "Required"},
      { name: "Performance Review Prep", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day -45", status: "Required"},
      { name: "Renewal Proposal", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Performance Review Prep", dueOffset: "Day -30", status: "Required"},
      { name: "Renewal Call", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Renewal Proposal", dueOffset: "Day -20", status: "Required"},
      { name: "Contract Sent", department: "Billing", ownerRole: "Billing Specialist", targetCompletionDays: 1, priority: "High", dependency: "Renewal Call", dueOffset: "Day -14", status: "Required"},
      { name: "Contract Signed — Confirm", department: "Billing", ownerRole: "Billing Specialist", targetCompletionDays: 1, priority: "High", dependency: "Contract Sent", dueOffset: "Day -7", status: "Required"},
    ],
  },
  {
    id: "tt-015",
    name: "Cancellation Process Template",
    department: "Account Management",
    type: "Cancellation",
    mappedLineItem: "Cancellation Request",
    taskCount: 5,
    targetCompletionDays: 3,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Cancellation Requested",
    status: "Active",
    lastUpdated: "2025-07-09",
    activationReady: true,
    description: "Structured cancellation management and exit tasks.",
    dependencies: ["Cancellation Request Received"],
    monthlyTaskCount: 0,
    quarterlyTaskCount: 3,
    marginContribution: "Low",
    tasks: [
      { name: "Cancellation Acknowledgement", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Retention Call", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Cancellation Acknowledgement", dueOffset: "Day 2", status: "Required"},
      { name: "Exit Survey", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "Medium", dependency: "Retention Call", dueOffset: "Day 3", status: "Optional"},
      { name: "Billing Stop", department: "Billing", ownerRole: "Billing Specialist", targetCompletionDays: 1, priority: "High", dependency: "Retention Call", dueOffset: "Day 5", status: "Required"},
      { name: "Trigger Offboarding Template", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Billing Stop", dueOffset: "Day 5", status: "Required"},
    ],
  },
  {
    id: "tt-016",
    name: "Offboarding Process Template",
    department: "Account Management",
    type: "Offboarding",
    mappedLineItem: "Offboarding Process",
    taskCount: 7,
    targetCompletionDays: 5,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Offboarding Approved",
    status: "Active",
    lastUpdated: "2025-07-07",
    activationReady: true,
    description: "Full client offboarding including access removal and final reporting.",
    dependencies: ["Cancellation Process Template"],
    monthlyTaskCount: 0,
    quarterlyTaskCount: 5,
    marginContribution: "Low",
    tasks: [
      { name: "Final Report Generation", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Access Transfer", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 2", status: "Required"},
      { name: "Campaign Pause/Stop", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Domain/Asset Release", department: "Web Development", ownerRole: "Developer", targetCompletionDays: 1, priority: "Medium", dependency: "Access Transfer", dueOffset: "Day 3", status: "Required"},
      { name: "Internal Debrief Note", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "Medium", dependency: "Final Report Generation", dueOffset: "Day 3", status: "Optional"},
      { name: "Close Client Record", department: "Billing", ownerRole: "Billing Specialist", targetCompletionDays: 1, priority: "High", dependency: "Final Report Generation", dueOffset: "Day 5", status: "Required"},
      { name: "NPS / Exit Survey Send", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "Low", dependency: "Close Client Record", dueOffset: "Day 5", status: "Optional"},
    ],
  },
  {
    id: "tt-017",
    name: "Budget Reallocation Template",
    department: "Paid Advertising",
    type: "Budget Reallocation",
    mappedLineItem: "Budget Change Request",
    taskCount: 5,
    targetCompletionDays: 4,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Upsell Approved",
    status: "Active",
    lastUpdated: "2025-07-06",
    activationReady: true,
    description: "Tasks triggered when a client reallocates budget between channels.",
    dependencies: ["Client Approval", "Current Budget Snapshot"],
    monthlyTaskCount: 4,
    quarterlyTaskCount: 4,
    marginContribution: "Medium",
    tasks: [
      { name: "Budget Change Documentation", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Reallocate Campaign Budgets", department: "Paid Advertising", ownerRole: "PPC Manager", targetCompletionDays: 1, priority: "High", dependency: "Budget Change Documentation", dueOffset: "Day 2", status: "Required"},
      { name: "Confirm Meta Budget Change", department: "Meta Ads", ownerRole: "Meta Ads Manager", targetCompletionDays: 1, priority: "High", dependency: "Budget Change Documentation", dueOffset: "Day 2", status: "Required"},
      { name: "Internal Notification", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "Medium", dependency: "Reallocate Campaign Budgets", dueOffset: "Day 2", status: "Optional"},
      { name: "Client Budget Confirmation", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Internal Notification", dueOffset: "Day 3", status: "Required"},
    ],
  },
  {
    id: "tt-018",
    name: "Upsell Activation Template",
    department: "Account Management",
    type: "Upsell",
    mappedLineItem: "Upsell Service",
    taskCount: 6,
    targetCompletionDays: 5,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Upsell Approved",
    status: "Active",
    lastUpdated: "2025-07-05",
    activationReady: true,
    description: "Tasks to activate a new service add-on for an existing client.",
    dependencies: ["Upsell Proposal Signed", "Invoice Paid"],
    monthlyTaskCount: 5,
    quarterlyTaskCount: 5,
    marginContribution: "High",
    tasks: [
      { name: "Upsell Confirmation Note", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "New Service Invoice", department: "Billing", ownerRole: "Billing Specialist", targetCompletionDays: 1, priority: "High", dependency: "Upsell Confirmation Note", dueOffset: "Day 1", status: "Required"},
      { name: "Scope Alignment Call", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "New Service Invoice", dueOffset: "Day 2", status: "Required"},
      { name: "Trigger Service Setup Template", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Scope Alignment Call", dueOffset: "Day 3", status: "Required"},
      { name: "Department Capacity Update", department: "Account Management", ownerRole: "Director", targetCompletionDays: 1, priority: "Medium", dependency: "Trigger Service Setup Template", dueOffset: "Day 3", status: "Optional"},
      { name: "Internal Team Notification", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "Low", dependency: "Department Capacity Update", dueOffset: "Day 3", status: "Optional"},
    ],
  },
  {
    id: "tt-019",
    name: "Strategy Consulting Template",
    department: "Account Management",
    type: "Quarterly Review",
    mappedLineItem: "Strategy Consulting",
    taskCount: 5,
    targetCompletionDays: 6,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Invoice Paid",
    status: "Active",
    lastUpdated: "2025-07-04",
    activationReady: false,
    description: "Quarterly strategy review and planning session for premium clients.",
    dependencies: ["All Monthly Reports", "Q Data Pull"],
    monthlyTaskCount: 0,
    quarterlyTaskCount: 6,
    marginContribution: "High",
    tasks: [
      { name: "Q Data Aggregation", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "Strategy Deck Prep", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 2, priority: "High", dependency: "Q Data Aggregation", dueOffset: "Day 3", status: "Required"},
      { name: "Internal Strategy Review", department: "Account Management", ownerRole: "Director", targetCompletionDays: 1, priority: "High", dependency: "Strategy Deck Prep", dueOffset: "Day 4", status: "Required"},
      { name: "Strategy Session Call", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Internal Strategy Review", dueOffset: "Day 7", status: "Required"},
      { name: "Action Plan Delivery", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Strategy Session Call", dueOffset: "Day 8", status: "Required"},
    ],
  },
  {
    id: "tt-020",
    name: "Quarterly Business Review Template",
    department: "Account Management",
    type: "Quarterly Review",
    mappedLineItem: "QBR Session",
    taskCount: 6,
    targetCompletionDays: 8,
    firstResponseSLA: "1 Business Day",
    activationTrigger: "Client Activated",
    status: "Draft",
    lastUpdated: "2025-07-02",
    activationReady: false,
    description: "Full quarterly business review with performance, roadmap, and retention focus.",
    dependencies: ["All Channel Data", "Q Revenue Report"],
    monthlyTaskCount: 0,
    quarterlyTaskCount: 8,
    marginContribution: "High",
    tasks: [
      { name: "QBR Data Pull", department: "Reporting", ownerRole: "Reporting Specialist", targetCompletionDays: 2, priority: "High", dependency: "None", dueOffset: "Day 1", status: "Required"},
      { name: "QBR Deck", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 3, priority: "High", dependency: "QBR Data Pull", dueOffset: "Day 3", status: "Required"},
      { name: "Director Review", department: "Account Management", ownerRole: "Director", targetCompletionDays: 1, priority: "High", dependency: "QBR Deck", dueOffset: "Day 5", status: "Required"},
      { name: "QBR Meeting", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "Director Review", dueOffset: "Day 7", status: "Required"},
      { name: "Follow-Up Action Plan", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "High", dependency: "QBR Meeting", dueOffset: "Day 8", status: "Required"},
      { name: "Roadmap Update", department: "Account Management", ownerRole: "Account Manager", targetCompletionDays: 1, priority: "Medium", dependency: "Follow-Up Action Plan", dueOffset: "Day 10", status: "Optional"},
    ],
  },
];

//  Design helpers 

const DEPT_COLORS: Record<Department, { bg?: string; color?: string; border: string }> = {
  "SEO":                { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE"},
  "GBP":                { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  "Paid Advertising":   { bg: "#FFF7ED", color: "#C2410C", border: "#FED7AA"},
  "Meta Ads":           { bg: "#FAF5FF", color: "#7C3AED", border: "#DDD6FE"},
  "Reporting":          { bg: "#ECFEFF", color: "#0891B2", border: "#A5F3FC"},
  "Web Development":    { bg: "#F0FDF4", color: "#16A34A", border: "#BBF7D0"},
  "Creative":           { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3"},
  "Account Management": { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
  "Billing":            { bg: "#F8FAFC", color: "#475569", border: "#CBD5E1"},
};

const TYPE_COLORS: Record<TemplateType, { bg?: string; color?: string }> = {
  "Setup":               { bg: "#EFF6FF", color: "#1D4ED8"},
  "Onboarding":          { bg: "#ECFDF5", color: "#059669"},
  "Launch":              { bg: "#FFF7ED", color: "#C2410C"},
  "Monthly Management":  { bg: "#FAF5FF", color: "#7C3AED"},
  "Quarterly Review":    { bg: "#ECFEFF", color: "#0891B2"},
  "Renewal":             { bg: "#F0FDF4", color: "#16A34A"},
  "Offboarding":         { bg: "#FFF1F2", color: "#BE123C"},
  "Cancellation":        { bg: "#FEF2F2", color: "#DC2626"},
  "Upsell":              { bg: "#FFFBEB", color: "#D97706"},
  "Budget Reallocation": { bg: "#F8FAFC", color: "#475569"},
};

const TRIGGER_COLORS: Record<ActivationTrigger, { bg?: string; color?: string }> = {
  "Proposal Approved":      { bg: "#EFF6FF", color: "#1D4ED8"},
  "Contract Signed":        { bg: "#ECFDF5", color: "#059669"},
  "Invoice Paid":           { bg: "#FFF7ED", color: "#C2410C"},
  "Client Activated":       { bg: "#FAF5FF", color: "#7C3AED"},
  "Upsell Approved":        { bg: "#FFFBEB", color: "#D97706"},
  "Renewal Signed":         { bg: "#F0FDF4", color: "#16A34A"},
  "Cancellation Requested": { bg: "#FFF1F2", color: "#BE123C"},
  "Offboarding Approved":   { bg: "#FEF2F2", color: "#DC2626"},
};

const STATUS_COLORS: Record<TemplateStatus, { bg?: string; color?: string; border: string }> = {
  "Active":   { bg: "#ECFDF5", color: "#059669", border: "#A7F3D0"},
  "Inactive": { bg: "#F8FAFC", color: "#94A3B8", border: "#CBD5E1"},
  "Draft":    { bg: "#FFFBEB", color: "#D97706", border: "#FDE68A"},
};

const DEP_STATUS_COLORS: Record<DependencyStatus, { bg?: string; color?: string }> = {
  "Required": { bg: "#EFF6FF", color: "#1D4ED8"},
  "Optional": { bg: "#F0FDF4", color: "#16A34A"},
  "Blocked":  { bg: "#FEF2F2", color: "#DC2626"},
  "Waiting":  { bg: "#FFFBEB", color: "#D97706"},
  "Ready":    { bg: "#ECFDF5", color: "#059669"},
};

const PRIORITY_COLORS: Record<TaskPriority, { bg?: string; color?: string }> = {
  "High":   { bg: "#FEF2F2", color: "#DC2626"},
  "Medium": { bg: "#FFFBEB", color: "#D97706"},
  "Low":    { bg: "#F8FAFC", color: "#94A3B8"},
};

//  Sub-components 

function DeptBadge({ dept }: { dept: Department }) {
  const c = DEPT_COLORS[dept];
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {dept}
    </span>
  );
}

function TypeBadge({ type }: { type: TemplateType }) {
  const c = TYPE_COLORS[type];
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {type}
    </span>
  );
}

function TriggerBadge({ trigger }: { trigger: ActivationTrigger }) {
  const c = TRIGGER_COLORS[trigger];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
       {trigger}
    </span>
  );
}

function StatusBadge({ status }: { status: TemplateStatus }) {
  const c = STATUS_COLORS[status];
  return (
    <span
      className="inline-flex items-center text-[11px] font-bold px-2.5 py-0.5 rounded-full"style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}
    >
      {status}
    </span>
  );
}

function DepStatusBadge({ status }: { status: DependencyStatus }) {
  const c = DEP_STATUS_COLORS[status];
  return (
    <span
      className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const c = PRIORITY_COLORS[priority];
  return (
    <span
      className="inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full"style={{ background: c.bg, color: c.color }}
    >
      {priority}
    </span>
  );
}

//  Template Detail Drawer 

function TemplateDrawer({
  template,
  onClose,
}: {
  template: TaskTemplate;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<
    "overview"| "tasks"| "dependencies"| "workload"| "activation"| "notes">("overview");

  const tabs = [
    { id: "overview"as const, label: "Overview"},
    { id: "tasks"as const, label: `Tasks (${template.taskCount})` },
    { id: "dependencies"as const, label: "Dependencies"},
    { id: "workload"as const, label: "SLA & Throughput"},
    { id: "activation"as const, label: "Activation Rules"},
    { id: "notes"as const, label: "Notes"},
  ];

  const dc = DEPT_COLORS[template.department];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"style={{ background: "rgba(0,0,0,0.35)"}}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="h-full w-full max-w-2xl flex flex-col overflow-hidden shadow-2xl"style={{ background: "var(--rtm-surface)"}}
      >
        {/* Drawer header */}
        <div
          className="flex items-start justify-between px-6 py-5"style={{ borderBottom: "1px solid var(--rtm-border)", background: dc.bg }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <TypeBadge type={template.type} />
              <StatusBadge status={template.status} />
              {template.activationReady && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                   Activation Ready
                </span>
              )}
            </div>
            <h2 className="text-lg font-extrabold mt-1"style={{ color: "var(--rtm-text-primary)"}}>
              {template.name}
            </h2>
            <p className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
              {template.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-lg hover:opacity-70 transition-opacity"style={{ background: "rgba(0,0,0,0.08)", color: "var(--rtm-text-primary)"}}
          >
            ×
          </button>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-4 gap-0"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          {[
            { label: "Tasks", value: template.taskCount },
            { label: "Target Days", value: `${template.targetCompletionDays}d` },
            { label: "Department", value: template.department.split("")[0] },
            { label: "Trigger", value: template.activationTrigger.split("")[0] + "…"},
          ].map((s, i) => (
            <div
              key={s.label}
              className="px-4 py-3 text-center"style={{
                borderRight: i < 3 ? "1px solid var(--rtm-border)": undefined,
                background: "var(--rtm-bg)",
              }}
            >
              <div className="text-lg font-black"style={{ color: "var(--rtm-text-primary)"}}>{s.value}</div>
              <div className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto"style={{ borderBottom: "1px solid var(--rtm-border)"}}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-3 text-xs font-bold whitespace-nowrap transition-colors flex-shrink-0"style={{
                color: activeTab === tab.id ? "var(--rtm-blue)": "var(--rtm-text-secondary)",
                borderBottom: activeTab === tab.id ? "2px solid var(--rtm-blue)": "2px solid transparent",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview */}
          {activeTab === "overview"&& (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Mapped Line Item</div>
                  <div className="font-bold"style={{ color: "var(--rtm-text-primary)"}}>{template.mappedLineItem}</div>
                </div>
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Department</div>
                  <DeptBadge dept={template.department} />
                </div>
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Activation Trigger</div>
                  <TriggerBadge trigger={template.activationTrigger} />
                </div>
                <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                  <div className="text-[10px] font-bold uppercase tracking-wider mb-2"style={{ color: "var(--rtm-text-muted)"}}>Last Updated</div>
                  <div className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{template.lastUpdated}</div>
                </div>
              </div>

              {/* Flow preview */}
              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>Activation Flow</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: template.mappedLineItem },
                    { label: "↓", arrow: true },
                    { label: template.name },
                    { label: "↓", arrow: true },
                    { label: `${template.taskCount} Tasks Generated` },
                    { label: "↓", arrow: true },
                    { label: template.department },
                  ].map((step, i) =>
                    step.arrow ? (
                      <span key={i} className="text-lg font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</span>
                    ) : (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold"style={{ background: dc.bg, color: dc.color, border: `1px solid ${dc.border}` }}
                      >
                        {step.label}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tasks */}
          {activeTab === "tasks"&& (
            <div className="space-y-3">
              <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
                Task Breakdown — {template.taskCount} tasks · {template.targetCompletionDays}d total
              </div>
              <div className="overflow-x-auto rounded-xl"style={{ border: "1px solid var(--rtm-border)"}}>
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                      {["Task Name", "Department", "Owner Role", "Hours", "Priority", "Dep.", "Due", "Status"].map((col) => (
                        <th key={col} className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-muted)"}}>
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {template.tasks.map((task, i) => (
                      <tr
                        key={task.name}
                        style={{ borderBottom: i < template.tasks.length - 1 ? "1px solid var(--rtm-border-light)": "none"}}
                      >
                        <td className="px-3 py-2.5">
                          <span className="font-semibold text-xs"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</span>
                        </td>
                        <td className="px-3 py-2.5"><DeptBadge dept={task.department} /></td>
                        <td className="px-3 py-2.5 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>{task.ownerRole}</td>
                        <td className="px-3 py-2.5 text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>{task.targetCompletionDays}d</td>
                        <td className="px-3 py-2.5"><PriorityBadge priority={task.priority} /></td>
                        <td className="px-3 py-2.5 text-xs"style={{ color: "var(--rtm-text-muted)"}}>{task.dependency === "None"? "—": task.dependency.slice(0, 16) + (task.dependency.length > 16 ? "…": "")}</td>
                        <td className="px-3 py-2.5 text-xs font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{task.dueOffset}</td>
                        <td className="px-3 py-2.5"><DepStatusBadge status={task.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Dependencies */}
          {activeTab === "dependencies"&& (
            <div className="space-y-4">
              <div className="text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>Template Dependencies</div>
              <div className="space-y-2">
                {template.dependencies.map((dep) => (
                  <div
                    key={dep}
                    className="flex items-center justify-between px-4 py-3 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                  >
                    <div className="flex items-center gap-2">
                      
                      <span className="text-sm font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{dep}</span>
                    </div>
                    <DepStatusBadge status="Required"/>
                  </div>
                ))}
              </div>

              <div className="text-xs font-bold mt-4"style={{ color: "var(--rtm-text-primary)"}}>Task-Level Dependencies</div>
              <div className="space-y-1.5">
                {template.tasks.map((task) => (
                  <div
                    key={task.name}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border-light)"}}
                  >
                    <div className="flex-1 text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</div>
                    <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                      {task.dependency === "None"? "No dependency": `Depends on: ${task.dependency}`}
                    </div>
                    <DepStatusBadge status={task.status} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Workload */}
          {activeTab === "workload"&& (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Target Completion (Setup)", value: `${template.targetCompletionDays}d` },
                  { label: "First Response SLA", value: template.firstResponseSLA },
                  { label: "Monthly Tasks", value: template.monthlyTaskCount },
                  { label: "Quarterly Tasks", value: template.quarterlyTaskCount, icon: ""},
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl p-4 flex items-center gap-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                  >
                    <span className="text-2xl">{stat.icon}</span>
                    <div>
                      <div className="text-xl font-black"style={{ color: "var(--rtm-text-primary)"}}>{stat.value}</div>
                      <div className="text-[10px] font-semibold mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>Department SLA Commitment</div>
                <div className="flex items-center justify-between">
                  <DeptBadge dept={template.department} />
                  <div className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                    {template.targetCompletionDays}d setup · {template.monthlyTaskCount} tasks/mo
                  </div>
                </div>
              </div>

              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-2"style={{ color: "var(--rtm-text-primary)"}}>Margin Contribution</div>
                <span
                  className="text-sm font-bold px-3 py-1.5 rounded-lg"style={{
                    background: template.marginContribution === "High"? "#ECFDF5": template.marginContribution === "Medium"? "#FFFBEB": "#FEF2F2",
                    color: template.marginContribution === "High"? "#059669": template.marginContribution === "Medium"? "#D97706": "#DC2626",
                  }}
                >
                  {template.marginContribution}
                </span>
              </div>
            </div>
          )}

          {/* Activation Rules */}
          {activeTab === "activation"&& (
            <div className="space-y-4">
              <div
                className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "2px solid var(--rtm-border)"}}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>Trigger Event</div>
                <TriggerBadge trigger={template.activationTrigger} />
              </div>

              <div className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>Required Conditions</div>
                <ul className="space-y-2">
                  {template.dependencies.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm"style={{ color: "var(--rtm-text-primary)"}}>
                       {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl p-5"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-[10px] font-bold uppercase tracking-wider mb-3"style={{ color: "var(--rtm-text-muted)"}}>Activation Status</div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"style={{ background: template.activationReady ? "#10B981": "#F59E0B"}}
                  />
                  <span className="font-bold text-sm"style={{ color: "var(--rtm-text-primary)"}}>
                    {template.activationReady ? "Activation Ready": "Needs Configuration"}
                  </span>
                </div>
              </div>

              <div className="rounded-xl p-5"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}>
                <div className="text-xs font-bold mb-2"style={{ color: "#1D4ED8"}}>Example Rule</div>
                <div className="font-mono text-xs leading-relaxed"style={{ color: "#1E40AF"}}>
                  WHEN {template.activationTrigger}<br />
                  AND mapped_line_item = "{template.mappedLineItem}"<br />
                  THEN activate "{template.name}"<br />
                  → generate {template.taskCount} tasks<br />
                  → assign to {template.department}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {activeTab === "notes"&& (
            <div className="space-y-4">
              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-2"style={{ color: "var(--rtm-text-primary)"}}>Template Notes</div>
                <textarea
                  className="w-full text-sm p-2 rounded-lg resize-none outline-none"rows={5}
                  placeholder="Add notes about this template..."style={{
                    background: "var(--rtm-surface)",
                    border: "1px solid var(--rtm-border)",
                    color: "var(--rtm-text-primary)",
                  }}
                />
              </div>
              <div className="rounded-xl p-4"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}>
                <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>Activity Log</div>
                <div className="space-y-2">
                  {[
                    { action: "Template updated", by: "Admin", date: template.lastUpdated },
                    { action: "Template activated", by: "System", date: "2025-07-01"},
                    { action: "Template created", by: "Admin", date: "2025-06-15"},
                  ].map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs"style={{ color: "var(--rtm-text-secondary)"}}>
                      
                      <span className="font-semibold">{log.action}</span>
                      <span>by {log.by}</span>
                      <span className="ml-auto"style={{ color: "var(--rtm-text-muted)"}}>{log.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer footer */}
        <div
          className="px-6 py-4 flex items-center gap-2 flex-wrap"style={{ borderTop: "1px solid var(--rtm-border)"}}
        >
          <button
            className="px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "var(--rtm-blue)"}}
          >
            Edit Template
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          >
            Clone Template
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
          >
            Map Line Item
          </button>
          <button
            className="ml-auto px-4 py-2 rounded-lg text-sm font-semibold"style={{ color: "var(--rtm-text-muted)"}}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

//  Main Page 

export default function TaskTemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState<Department | "All">("All");
  const [filterType, setFilterType] = useState<TemplateType | "All">("All");
  const [filterStatus, setFilterStatus] = useState<TemplateStatus | "All">("All");
  const [activeSection, setActiveSection] = useState<"templates"| "preview"| "import">("templates");
  const [previewLineItem, setPreviewLineItem] = useState("SEO Monthly");

  //  Derived data 

  const totalTemplates = TASK_TEMPLATES.length;
  const activeTemplates = TASK_TEMPLATES.filter((t) => t.status === "Active").length;
  const inactiveTemplates = TASK_TEMPLATES.filter((t) => t.status === "Inactive").length;
  const activationReady = TASK_TEMPLATES.filter((t) => t.activationReady).length;
  const totalTasksDefined = TASK_TEMPLATES.reduce((s, t) => s + t.taskCount, 0);
  const mappedLineItems = new Set(TASK_TEMPLATES.map((t) => t.mappedLineItem)).size;
  const deptsCovered = new Set(TASK_TEMPLATES.map((t) => t.department)).size;

  //  Filter 

  const filtered = TASK_TEMPLATES.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.mappedLineItem.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q);
    const matchDept = filterDept === "All"|| t.department === filterDept;
    const matchType = filterType === "All"|| t.type === filterType;
    const matchStatus = filterStatus === "All"|| t.status === filterStatus;
    return matchSearch && matchDept && matchType && matchStatus;
  });

  //  Preview 

  const previewTemplate = TASK_TEMPLATES.find(
    (t) => t.mappedLineItem.toLowerCase() === previewLineItem.toLowerCase()
  ) ?? TASK_TEMPLATES[0];

  const PREVIEW_LINE_ITEMS = [
    "SEO Monthly",
    "GBP Optimization",
    "PPC Management",
    "Meta Ads Management",
    "Reporting Dashboard",
    "Landing Page Build",
    "Creative Package",
    "Client Onboarding",
  ];

  const DEPARTMENTS_LIST: Department[] = [
    "SEO", "GBP", "Paid Advertising", "Meta Ads",
    "Reporting", "Web Development", "Creative", "Account Management", "Billing",
  ];

  const TEMPLATE_TYPES: TemplateType[] = [
    "Setup", "Onboarding", "Launch", "Monthly Management",
    "Quarterly Review", "Renewal", "Offboarding", "Cancellation",
    "Upsell", "Budget Reallocation",
  ];

  const STATUSES: TemplateStatus[] = ["Active", "Inactive", "Draft"];

  return (
    <div className="space-y-6">
      {/*  Page header  */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"style={{ color: "var(--rtm-blue)"}}>
            Task Operations
          </p>
          <h1 className="text-2xl font-bold tracking-tight"style={{ color: "var(--rtm-text-primary)"}}>
            Task Template Library
          </h1>
          <p className="text-sm mt-1 max-w-xl"style={{ color: "var(--rtm-text-secondary)"}}>
            Manage activation templates, delivery templates, onboarding templates, and recurring service templates. Master source of task activation for all services sold in RTM OS.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90"style={{ background: "var(--rtm-blue)"}}
          >
            + New Task Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
            onClick={() => setActiveSection("import")}
          >
            ↑ Import Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
            ↓ Export Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             Clone Template
          </button>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             Activation Mapping
          </button>
          <Link
            href="/tasks/workload-planning"className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)", background: "var(--rtm-surface)"}}
          >
             Dept. Throughput View
          </Link>
        </div>
      </div>

      {/*  Operational bridge banner  */}
      <div
        className="rounded-xl p-4 flex flex-wrap items-center gap-3"style={{ background: "#EFF6FF", border: "1px solid #BFDBFE"}}
      >
        
        <div className="flex-1 min-w-0">
          <div className="text-xs font-black uppercase tracking-wider mb-1"style={{ color: "#1D4ED8"}}>
            Operational Bridge
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold"style={{ color: "#1E40AF"}}>
            {[
              "Finance Line Items",
              "→",
              "Proposal Generator",
              "→",
              "Contract Generator",
              "→",
              "Billing",
              "→",
              "Activation Engine",
              "→",
              "Department Throughput",
              "→",
              "Client Delivery",
            ].map((step, i) =>
              step === "→"? (
                <span key={i} className="text-blue-400 font-black">{step}</span>
              ) : (
                <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-blue-200">{step}</span>
              )
            )}
          </div>
        </div>
      </div>

      {/*  KPI cards  */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {[
          { label: "Total Templates", value: totalTemplates, color: "var(--rtm-blue)", bg: "var(--rtm-blue-light)"},
          { label: "Active Templates", value: activeTemplates, color: "#059669", bg: "#ECFDF5"},
          { label: "Inactive Templates", value: inactiveTemplates, color: "#94A3B8", bg: "#F8FAFC"},
          { label: "Mapped Line Items", value: mappedLineItems, color: "#7C3AED", bg: "#FAF5FF"},
          { label: "Unmapped Items", value: 4, color: "#D97706", bg: "#FFFBEB"},
          { label: "Total Tasks Defined", value: totalTasksDefined, color: "#0891B2", bg: "#ECFEFF"},
          { label: "Depts. Covered", value: deptsCovered, color: "#16A34A", bg: "#F0FDF4"},
          { label: "Activation Ready", value: activationReady, color: "#C2410C", bg: "#FFF7ED"},
        ].map(({ label, value, color, bg }) => (
          <div
            key={label}
            className="rounded-xl p-3 text-center"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div className="text-2xl font-black"style={{ color }}>{value}</div>
            <div className="text-[10px] font-semibold mt-1 leading-tight"style={{ color: "var(--rtm-text-secondary)"}}>{label}</div>
          </div>
        ))}
      </div>

      {/*  Section tabs  */}
      <div className="flex gap-1 p-1 rounded-xl"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)", width: "fit-content"}}>
        {(["templates", "preview", "import"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className="px-4 py-2 rounded-lg text-sm font-bold capitalize transition-colors"style={{
              background: activeSection === s ? "var(--rtm-blue)": "transparent",
              color: activeSection === s ? "#fff": "var(--rtm-text-secondary)",
            }}
          >
            {s === "templates"? "Templates": s === "preview"? "Preview Flow": "↑ Import / Upload"}
          </button>
        ))}
      </div>

      {/*  */}
      {/* SECTION: Templates table */}
      {/*  */}
      {activeSection === "templates"&& (
        <div className="space-y-4">
          {/* Filters */}
          <div
            className="rounded-xl px-4 py-3 flex flex-wrap items-center gap-3"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"style={{ color: "var(--rtm-text-muted)"}} fill="none"stroke="currentColor"viewBox="0 0 24 24">
                <path strokeLinecap="round"strokeLinejoin="round"strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"placeholder="Search templates..."value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg outline-none"style={{
                  background: "var(--rtm-bg)",
                  border: "1px solid var(--rtm-border)",
                  color: "var(--rtm-text-primary)",
                }}
              />
            </div>

            {/* Department filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value as Department | "All")}
              className="text-sm px-3 py-2 rounded-lg outline-none"style={{
                background: "var(--rtm-bg)",
                border: "1px solid var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="All">All Departments</option>
              {DEPARTMENTS_LIST.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as TemplateType | "All")}
              className="text-sm px-3 py-2 rounded-lg outline-none"style={{
                background: "var(--rtm-bg)",
                border: "1px solid var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="All">All Types</option>
              {TEMPLATE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as TemplateStatus | "All")}
              className="text-sm px-3 py-2 rounded-lg outline-none"style={{
                background: "var(--rtm-bg)",
                border: "1px solid var(--rtm-border)",
                color: "var(--rtm-text-primary)",
              }}
            >
              <option value="All">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <span className="text-xs font-semibold ml-auto"style={{ color: "var(--rtm-text-muted)"}}>
              {filtered.length} of {totalTemplates} templates
            </span>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1100px]">
                <thead>
                  <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                    {[
                      "Template Name",
                      "Department",
                      "Type",
                      "Mapped Line Item",
                      "Tasks",
                      "Target Days",
                      "Activation Trigger",
                      "Status",
                      "Last Updated",
                      "Actions",
                    ].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((template, i) => (
                    <tr
                      key={template.id}
                      className="hover:bg-blue-50/20 transition-colors"style={{
                        borderBottom: i < filtered.length - 1 ? "1px solid var(--rtm-border-light)": "none",
                      }}
                    >
                      {/* Template Name */}
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="text-left font-bold hover:underline"style={{ color: "var(--rtm-blue)"}}
                        >
                          {template.name}
                        </button>
                        <div className="text-[10px] mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                          {template.description.slice(0, 40)}…
                        </div>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3">
                        <DeptBadge dept={template.department} />
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3">
                        <TypeBadge type={template.type} />
                      </td>

                      {/* Mapped Line Item */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>
                          {template.mappedLineItem}
                        </span>
                      </td>

                      {/* Task Count */}
                      <td className="px-4 py-3">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                        >
                          {template.taskCount} tasks
                        </span>
                      </td>

                      {/* Target Completion Days */}
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                          {template.targetCompletionDays}d
                        </span>
                      </td>

                      {/* Activation Trigger */}
                      <td className="px-4 py-3">
                        <TriggerBadge trigger={template.activationTrigger} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={template.status} />
                      </td>

                      {/* Last Updated */}
                      <td className="px-4 py-3">
                        <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                          {template.lastUpdated}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTemplate(template)}
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                          >
                            View
                          </button>
                          <button
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                          >
                            Edit
                          </button>
                          <button
                            className="text-[11px] font-semibold px-2 py-1 rounded-lg hover:opacity-80 transition-opacity border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-secondary)"}}
                          >
                            
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div className="py-12 text-center"style={{ color: "var(--rtm-text-muted)"}}>
                
                <div className="text-sm font-semibold">No templates match your filters.</div>
              </div>
            )}

            <div
              className="px-5 py-3 flex items-center justify-between"style={{ borderTop: "1px solid var(--rtm-border-light)"}}
            >
              <span className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                Showing {filtered.length} of {totalTemplates} task templates
              </span>
              <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
                {totalTasksDefined} total tasks defined across all templates
              </span>
            </div>
          </div>

          {/*  Activation Rules summary  */}
          <div
            className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div
              className="px-5 py-4 flex items-center gap-2"style={{ background: "#FFFBEB", borderBottom: "1px solid #FDE68A"}}
            >
              
              <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
                Activation Rules Engine
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500r-800">
                {totalTemplates} rules configured
              </span>
            </div>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  trigger: "Invoice Paid",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Invoice Paid"),
                  color: "#C2410C",
                  bg: "#FFF7ED",
                  border: "#FED7AA",
                  icon: "",
                },
                {
                  trigger: "Contract Signed",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Contract Signed"),
                  color: "#059669",
                  bg: "#ECFDF5",
                  border: "#A7F3D0",
                  icon: "",
                },
                {
                  trigger: "Client Activated",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Client Activated"),
                  color: "#7C3AED",
                  bg: "#FAF5FF",
                  border: "#DDD6FE",
                  icon: "",
                },
                {
                  trigger: "Offboarding Approved",
                  templates: TASK_TEMPLATES.filter((t) => t.activationTrigger === "Offboarding Approved"),
                  color: "#DC2626",
                  bg: "#FEF2F2",
                  border: "#FECACA",
                  icon: "",
                },
              ].map((rule) => (
                <div
                  key={rule.trigger}
                  className="rounded-xl overflow-hidden"style={{ border: `1px solid ${rule.border}` }}
                >
                  <div className="px-4 py-3"style={{ background: rule.bg }}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{rule.icon}</span>
                      <span className="text-xs font-black"style={{ color: rule.color }}>
                        {rule.trigger}
                      </span>
                    </div>
                    <div className="text-[10px]"style={{ color: rule.color }}>
                      Activates {rule.templates.length} template{rule.templates.length !== 1 ? "s": ""}
                    </div>
                  </div>
                  <div className="px-4 py-2 space-y-1"style={{ background: "white"}}>
                    {rule.templates.slice(0, 3).map((t) => (
                      <div key={t.id} className="text-[11px] font-medium flex items-center gap-1"style={{ color: "var(--rtm-text-secondary)"}}>
                        <span style={{ color: rule.color }}>→</span> {t.name}
                      </div>
                    ))}
                    {rule.templates.length > 3 && (
                      <div className="text-[10px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>
                        +{rule.templates.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/*  Department workload summary  */}
          <div
            className="rounded-xl overflow-hidden"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <div
              className="px-5 py-4"style={{ borderBottom: "1px solid var(--rtm-border)"}}
            >
              <h2 className="text-sm font-extrabold"style={{ color: "var(--rtm-text-primary)"}}>
                 Department Throughput Summary
              </h2>
              <p className="text-xs mt-0.5"style={{ color: "var(--rtm-text-muted)"}}>
                Tasks generated per department from all active templates.
              </p>
            </div>
            <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {DEPARTMENTS_LIST.map((dept) => {
                const deptTemplates = TASK_TEMPLATES.filter((t) => t.department === dept && t.status === "Active");
                const totalTasks = deptTemplates.reduce((s, t) => s + t.monthlyTaskCount, 0);
                const c = DEPT_COLORS[dept];
                return (
                  <div
                    key={dept}
                    className="rounded-xl p-3 text-center"style={{ background: c.bg, border: `1px solid ${c.border}` }}
                  >
                    <div className="text-xl font-black"style={{ color: c.color }}>{totalTasks}</div>
                    <div className="text-[10px] font-bold mt-0.5"style={{ color: c.color }}>tasks/mo</div>
                    <div className="text-[10px] mt-1 font-semibold"style={{ color: "var(--rtm-text-secondary)"}}>{dept}</div>
                    <div className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{deptTemplates.length} templates</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/*  */}
      {/* SECTION: Template Preview Flow */}
      {/*  */}
      {activeSection === "preview"&& (
        <div className="space-y-6">
          <div
            className="rounded-xl p-5"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <h2 className="text-sm font-extrabold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
               Template Preview Flow
            </h2>
            <p className="text-xs mb-4"style={{ color: "var(--rtm-text-secondary)"}}>
              Select a line item to preview its mapped template, generated tasks, and department assignment.
            </p>

            {/* Line item selector */}
            <div className="flex flex-wrap gap-2 mb-6">
              {PREVIEW_LINE_ITEMS.map((item) => (
                <button
                  key={item}
                  onClick={() => setPreviewLineItem(item)}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border"style={{
                    background: previewLineItem === item ? "var(--rtm-blue)": "var(--rtm-bg)",
                    color: previewLineItem === item ? "#fff": "var(--rtm-text-primary)",
                    borderColor: previewLineItem === item ? "var(--rtm-blue)": "var(--rtm-border)",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Flow visualization */}
            <div className="flex flex-col items-center gap-3">
              {/* Step 1: Line Item */}
              <div
                className="w-full max-w-md rounded-xl p-4 flex items-center gap-4"style={{ background: "#EFF6FF", border: "2px solid #BFDBFE"}}
              >
                
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider"style={{ color: "#1D4ED8"}}>Selected Line Item</div>
                  <div className="text-lg font-black"style={{ color: "#1D4ED8"}}>{previewLineItem}</div>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-2xl font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</div>

              {/* Step 2: Template */}
              <div
                className="w-full max-w-md rounded-xl p-4 flex items-center gap-4"style={{ background: "#FAF5FF", border: "2px solid #DDD6FE"}}
              >
                
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider"style={{ color: "#7C3AED"}}>Mapped Template</div>
                  <div className="text-lg font-black"style={{ color: "#7C3AED"}}>{previewTemplate.name}</div>
                  <TypeBadge type={previewTemplate.type} />
                </div>
              </div>

              {/* Arrow */}
              <div className="text-2xl font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</div>

              {/* Step 3: Tasks */}
              <div
                className="w-full max-w-md rounded-xl p-4"style={{ background: "#ECFDF5", border: "2px solid #A7F3D0"}}
              >
                <div className="flex items-center gap-3 mb-3">
                  
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider"style={{ color: "#059669"}}>Tasks Generated</div>
                    <div className="text-lg font-black"style={{ color: "#059669"}}>{previewTemplate.taskCount} Tasks</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {previewTemplate.tasks.map((task) => (
                    <div
                      key={task.name}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white">
                      <span className="text-xs font-semibold"style={{ color: "var(--rtm-text-primary)"}}>{task.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px]"style={{ color: "var(--rtm-text-muted)"}}>{task.targetCompletionDays}d</span>
                        <PriorityBadge priority={task.priority} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div className="text-2xl font-black"style={{ color: "var(--rtm-text-muted)"}}>↓</div>

              {/* Step 4: Department */}
              <div
                className="w-full max-w-md rounded-xl p-4 flex items-center gap-4"style={{
                  background: DEPT_COLORS[previewTemplate.department].bg,
                  border: `2px solid ${DEPT_COLORS[previewTemplate.department].border}`,
                }}
              >
                
                <div>
                  <div
                    className="text-[10px] font-bold uppercase tracking-wider"style={{ color: DEPT_COLORS[previewTemplate.department].color }}
                  >
                    Department Assignment
                  </div>
                  <div
                    className="text-lg font-black"style={{ color: DEPT_COLORS[previewTemplate.department].color }}
                  >
                    {previewTemplate.department}
                  </div>
                  <div className="text-xs mt-1"style={{ color: "var(--rtm-text-secondary)"}}>
                    Target: {previewTemplate.targetCompletionDays}d · {previewTemplate.monthlyTaskCount} tasks/mo
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Workload planning card */}
          <div
            className="rounded-xl p-5"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <h2 className="text-sm font-extrabold mb-4"style={{ color: "var(--rtm-text-primary)"}}>
               SLA Overview — {previewTemplate.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Target Completion", value: `${previewTemplate.targetCompletionDays}d` },
                { label: "First Response SLA", value: previewTemplate.firstResponseSLA },
                { label: "Monthly Tasks", value: previewTemplate.monthlyTaskCount },
                { label: "Quarterly Tasks", value: previewTemplate.quarterlyTaskCount, icon: ""},
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl p-4 flex items-center gap-3"style={{ background: "var(--rtm-bg)", border: "1px solid var(--rtm-border)"}}
                >
                  <span className="text-xl">{stat.icon}</span>
                  <div>
                    <div className="text-lg font-black"style={{ color: "var(--rtm-text-primary)"}}>{stat.value}</div>
                    <div className="text-[10px] font-semibold"style={{ color: "var(--rtm-text-muted)"}}>{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/*  */}
      {/* SECTION: Import / Upload */}
      {/*  */}
      {activeSection === "import"&& (
        <div className="space-y-6">
          <div
            className="rounded-xl p-6"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
          >
            <h2 className="text-sm font-extrabold mb-1"style={{ color: "var(--rtm-text-primary)"}}>
              ↑ Import Task Templates
            </h2>
            <p className="text-xs mb-6"style={{ color: "var(--rtm-text-secondary)"}}>
              Upload a CSV, XLSX, or JSON file to bulk import task templates.
            </p>

            {/* File drop area */}
            <div
              className="rounded-xl border-2 border-dashed p-10 flex flex-col items-center justify-center gap-3 text-center cursor-pointer hover:opacity-80 transition-opacity"style={{ borderColor: "var(--rtm-border)", background: "var(--rtm-bg)"}}
            >
              
              <div className="font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                Drop your file here or click to browse
              </div>
              <div className="text-xs"style={{ color: "var(--rtm-text-muted)"}}>
                Supported formats: CSV, XLSX, JSON
              </div>
              <div className="flex gap-2 mt-2">
                {["CSV", "XLSX", "JSON"].map((fmt) => (
                  <span
                    key={fmt}
                    className="text-xs font-bold px-3 py-1 rounded-full"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)"}}
                  >
                    .{fmt.toLowerCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Expected columns */}
            <div className="mt-6">
              <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
                Expected Columns
              </div>
              <div className="overflow-x-auto rounded-xl"style={{ border: "1px solid var(--rtm-border)"}}>
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr style={{ background: "var(--rtm-bg)", borderBottom: "2px solid var(--rtm-border)"}}>
                      {["Column", "Type", "Required", "Example"].map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider"style={{ color: "var(--rtm-text-secondary)"}}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { column: "Template Name", type: "string", required: true, example: "SEO Setup Template"},
                      { column: "Task Name", type: "string", required: true, example: "Technical Audit"},
                      { column: "Department", type: "enum", required: true, example: "SEO"},
                      { column: "Hours", type: "number", required: true, example: "5"},
                      { column: "Priority", type: "enum", required: true, example: "High"},
                      { column: "Dependency", type: "string", required: false, example: "GSC Access"},
                      { column: "Activation Trigger", type: "enum", required: true, example: "Invoice Paid"},
                      { column: "Template Type", type: "enum", required: true, example: "Setup"},
                      { column: "Mapped Line Item", type: "string", required: true, example: "SEO Setup"},
                      { column: "Due Offset", type: "string", required: false, example: "Day 3"},
                    ].map((row, i) => (
                      <tr
                        key={row.column}
                        style={{ borderBottom: i < 9 ? "1px solid var(--rtm-border-light)": "none"}}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold"style={{ color: "var(--rtm-text-primary)"}}>
                          {row.column}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded"style={{ background: "var(--rtm-bg)", color: "var(--rtm-text-secondary)", border: "1px solid var(--rtm-border)"}}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {row.required ? (
                            <span className="text-[11px] font-bold text-green-600"> Required</span>
                          ) : (
                            <span className="text-[11px] text-gray-400">Optional</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs font-mono"style={{ color: "var(--rtm-text-muted)"}}>
                          {row.example}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Download template */}
            <div className="mt-4 flex items-center gap-3">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"style={{ background: "var(--rtm-blue)"}}
              >
                ↓ Download CSV Template
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              >
                ↓ Download XLSX Template
              </button>
              <button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border"style={{ borderColor: "var(--rtm-border)", color: "var(--rtm-text-primary)"}}
              >
                ↓ Download JSON Schema
              </button>
            </div>
          </div>
        </div>
      )}

      {/*  Module integration links  */}
      <div
        className="rounded-xl p-4"style={{ background: "var(--rtm-surface)", border: "1px solid var(--rtm-border)"}}
      >
        <div className="text-xs font-bold mb-3"style={{ color: "var(--rtm-text-primary)"}}>
           Module Integrations
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Finance / Line Items", href: "/billing"},
            { label: "Proposal Generator", href: "/billing/proposals"},
            { label: "Contract Generator", href: "/billing/contracts"},
            { label: "Billing", href: "/billing"},
            { label: "Activation Engine", href: "/billing/activation"},
            { label: "Task Engine", href: "/tasks"},
            { label: "Onboarding", href: "/account-management/onboarding"},
            { label: "Workflows", href: "/admin/workflows"},
            { label: "Clients", href: "/clients"},
          ].map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:opacity-80 transition-opacity"style={{ background: "var(--rtm-blue-light)", color: "var(--rtm-blue)", borderColor: "#BFDBFE"}}
            >
              {r.label}
              <svg width="10"height="10"viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10"y1="14"x2="21"y2="3"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      {/*  Template Detail Drawer  */}
      {selectedTemplate && (
        <TemplateDrawer
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
