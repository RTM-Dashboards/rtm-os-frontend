// RTM OS — Sales Recommendation Engine
// ─────────────────────────────────────────────────────────────────────────────
// This module is the CORE ENGINE that:
//   1. Consumes AuditResult from the Goal-Based Audit Engine
//   2. Evaluates Recommendation Rules (from recommendation-config.ts)
//   3. Generates Recommended Services with deliverables, timelines, budgets
//   4. Applies Priority Ranking Rules
//   5. Groups recommendations by category
//   6. Calculates Proposal Readiness
//   7. Produces a complete RecommendationResult
//
// The engine is pure — no UI. It receives AuditResult → returns RecommendationResult.
// ─────────────────────────────────────────────────────────────────────────────

import type { AuditResult, AuditFinding } from "./audit-engine";
import type { FindingSeverity } from "./audit-config";
import {
  RECOMMENDATION_RULES,
  SERVICE_CATALOG,
  PRIORITY_RANKING_RULES,
  CONFIDENCE_MODIFIERS,
  RECOMMENDATION_GROUP_CONFIG,
  PROPOSAL_READINESS_CONFIG,
  getGroupConfig,
  getProposalReadinessConfig,
  getPriorityConfig,
  applyPriorityRankingRules,
  type RecommendationRule,
  type ServiceCatalogEntry,
  type RecommendationGroup,
  type RecommendationPriority,
  type ProposalReadiness,
  type AllowedService,
} from "./recommendation-config";

// ─── Engine Output Types ───────────────────────────────────────────────────────

export interface RecommendedDeliverable {
  id: string;
  name: string;
  description?: string;
  estimatedDays: string;
  responsible: string;
}

export interface RecommendationItem {
  // Identity
  id: string;
  ruleId: string;
  sourceAuditId: string;
  sourceFindingIds: string[];

  // Service & Department
  service: AllowedService;
  serviceId: string;
  serviceName: string;
  department: string;
  departmentColor: string;
  departmentBg: string;
  departmentBorder: string;

  // Priority & Severity
  priority: RecommendationPriority;
  severity: FindingSeverity;
  group: RecommendationGroup;

  // Business Context
  businessImpact: string;
  expectedOutcome: string;
  triggerFindings: AuditFinding[];
  triggerFindingCount: number;

  // Deliverables
  deliverables: string[];

  // Financial
  estimatedMonthlyFee: number;
  estimatedSetupFee: number;
  estimatedHoursPerMonth: number;

  // Timeline
  estimatedTimeline: string;
  estimatedTimelineWeeks: string;

  // Dependencies
  dependencies: string[];       // other recommendation IDs
  dependencyServiceNames: string[];

  // Confidence
  confidenceScore: number;       // 0–100
  revenueImpactEstimate: number; // estimated annual revenue opportunity

  // Proposal
  proposalReadiness: ProposalReadiness;

  // Status (default: pending)
  status: RecommendationStatus;

  // Notes
  salesNotes: string;
}

export type RecommendationStatus =
  | "Pending"
  | "Approved for Proposal"
  | "Future Phase"
  | "Optional"
  | "Needs Pricing Review"
  | "Sent to Proposal Builder";

export interface RecommendationGroup_Result {
  group: RecommendationGroup;
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  order: number;
  items: RecommendationItem[];
  totalMonthlyFee: number;
  totalSetupFee: number;
  totalRevenueImpact: number;
}

export interface DepartmentImpact {
  department: string;
  color: string;
  bg: string;
  border: string;
  recommendationCount: number;
  totalMonthlyFee: number;
  totalSetupFee: number;
  services: string[];
  findingCount: number;
  criticalCount: number;
}

export interface ProposalReadinessQueue {
  readiness: ProposalReadiness;
  label: string;
  color: string;
  bg: string;
  border: string;
  items: RecommendationItem[];
  count: number;
}

export interface RecommendationSummary {
  totalRecommendations: number;
  totalMonthlyRevenue: number;
  totalSetupRevenue: number;
  totalAnnualRevenue: number;
  totalEstimatedHours: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  readyForProposalCount: number;
  needsReviewCount: number;
  quickWinCount: number;
  criticalFixCount: number;
  revenueOpportunityCount: number;
  avgConfidenceScore: number;
}

export interface PriorityMatrixItem {
  recommendationId: string;
  serviceName: string;
  priority: RecommendationPriority;
  effort: "Low" | "Medium" | "High";
  impact: "Low" | "Medium" | "High";
  revenueImpact: number;
  group: RecommendationGroup;
}

export interface RecommendationResult {
  // Identity
  id: string;
  sourceAuditId: string;
  sourceIntakeId?: string;
  goalIds: string[];
  goalLabels: string[];
  generatedAt: string;
  status: "Draft" | "Complete" | "Proposal Ready";

  // Audit context
  auditScore: number;
  auditScoringLabel: string;
  totalAuditFindings: number;
  criticalAuditFindings: number;

  // All recommendations flat list
  recommendations: RecommendationItem[];

  // Grouped
  groups: RecommendationGroup_Result[];

  // Department impact
  departmentImpact: DepartmentImpact[];

  // Proposal readiness queue
  proposalReadinessQueue: ProposalReadinessQueue[];

  // Priority matrix
  priorityMatrix: PriorityMatrixItem[];

  // Summary
  summary: RecommendationSummary;

  // Proposal continuity
  isReadyForBudgetOptimizer: boolean;
}

// ─── Engine Options ────────────────────────────────────────────────────────────

interface RecommendationEngineOptions {
  contractMonths?: number;     // default 12
  includeOptionalPhase?: boolean; // default true
}

const DEFAULT_ENGINE_OPTIONS: Required<RecommendationEngineOptions> = {
  contractMonths: 12,
  includeOptionalPhase: true,
};

// ─── Finding Category Matcher ──────────────────────────────────────────────────

function findingsMatchRule(
  findings: AuditFinding[],
  rule: RecommendationRule
): AuditFinding[] {
  const { triggerCategories, triggerSeverities } = rule.conditions;
  return findings.filter((f) => {
    const categoryMatch = !triggerCategories || triggerCategories.includes(f.category);
    const severityMatch = !triggerSeverities || triggerSeverities.includes(f.severity);
    return categoryMatch && severityMatch;
  });
}

// ─── Confidence Score Calculator ───────────────────────────────────────────────

function calculateConfidenceScore(
  baseScore: number,
  triggerFindings: AuditFinding[],
  goalIds: string[],
  rule: RecommendationRule
): number {
  let score = baseScore;

  if (CONFIDENCE_MODIFIERS.find((m) => m.id === "cm-1")?.active) {
    if (triggerFindings.length >= 3) score += 5;
  }
  if (CONFIDENCE_MODIFIERS.find((m) => m.id === "cm-2")?.active) {
    if (triggerFindings.every((f) => f.severity === "Critical")) score += 4;
  }
  if (CONFIDENCE_MODIFIERS.find((m) => m.id === "cm-3")?.active) {
    if (triggerFindings.some((f) => f.isQuickWin)) score += 3;
  }
  if (CONFIDENCE_MODIFIERS.find((m) => m.id === "cm-4")?.active) {
    if (triggerFindings.length === 1 && triggerFindings[0].severity === "Low") score -= 8;
  }
  if (CONFIDENCE_MODIFIERS.find((m) => m.id === "cm-5")?.active) {
    const severities = new Set(triggerFindings.map((f) => f.severity));
    if (severities.size >= 3) score -= 3;
  }
  if (CONFIDENCE_MODIFIERS.find((m) => m.id === "cm-6")?.active) {
    if (rule.conditions.goalIds && rule.conditions.goalIds.some((g) => goalIds.includes(g))) {
      score += 4;
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Revenue Impact Estimator ─────────────────────────────────────────────────

function estimateRevenueImpact(
  service: ServiceCatalogEntry,
  triggerFindings: AuditFinding[],
  revenueMultiplier: number,
  contractMonths: number
): number {
  const findingImpact = triggerFindings.reduce(
    (sum, f) => sum + f.estimatedRevenueImpact,
    0
  );
  const baseRevenue = service.monthlyFee * contractMonths + service.setupFee;
  return Math.round(baseRevenue + (findingImpact * revenueMultiplier) / 1000);
}

// ─── Effort Level Estimator ───────────────────────────────────────────────────

function estimateEffortLevel(hours: number): "Low" | "Medium" | "High" {
  if (hours <= 8) return "Low";
  if (hours <= 20) return "Medium";
  return "High";
}

// ─── Impact Level Estimator ───────────────────────────────────────────────────

function estimateImpactLevel(
  revenueImpact: number,
  severity: FindingSeverity
): "Low" | "Medium" | "High" {
  if (severity === "Critical" || revenueImpact >= 15000) return "High";
  if (severity === "High" || revenueImpact >= 8000) return "Medium";
  return "Low";
}

// ─── Core Engine ───────────────────────────────────────────────────────────────

export function runRecommendationEngine(
  auditResult: AuditResult,
  options: RecommendationEngineOptions = {}
): RecommendationResult {
  const opts = { ...DEFAULT_ENGINE_OPTIONS, ...options };

  // Step 1: Get active rules
  const activeRules = RECOMMENDATION_RULES
    .filter((r) => r.active)
    .sort((a, b) => a.order - b.order);

  // Step 2: Build recommendation items from rules
  const recommendations: RecommendationItem[] = [];
  const usedRuleIds = new Set<string>();
  const ruleIdToRecId = new Map<string, string>();

  for (const rule of activeRules) {
    // Skip optional phase if not included
    if (!opts.includeOptionalPhase && rule.group === "Optional Future Phase") continue;

    // Find matching findings
    const triggerFindings = findingsMatchRule(auditResult.findings, rule);

    // Skip rules with no matching findings
    if (triggerFindings.length === 0) continue;

    // Check minimum finding count
    if (rule.conditions.minFindingCount && triggerFindings.length < rule.conditions.minFindingCount) continue;

    // Skip if already used
    if (usedRuleIds.has(rule.id)) continue;
    usedRuleIds.add(rule.id);

    // Lookup service from catalog
    const service = SERVICE_CATALOG.find((s) => s.id === rule.serviceId);
    if (!service || !service.active) continue;

    // Calculate confidence
    const confidenceScore = calculateConfidenceScore(
      rule.confidenceBase,
      triggerFindings,
      auditResult.goalIds,
      rule
    );

    // Calculate revenue impact
    const revenueImpactEstimate = estimateRevenueImpact(
      service,
      triggerFindings,
      rule.revenueMultiplier,
      opts.contractMonths
    );

    // Determine final priority using priority ranking rules
    const priority = applyPriorityRankingRules(rule.group, rule.severity);

    const recId = `rec-${rule.id}-${Date.now()}-${recommendations.length}`;
    ruleIdToRecId.set(rule.id, recId);

    const rec: RecommendationItem = {
      id: recId,
      ruleId: rule.id,
      sourceAuditId: auditResult.id,
      sourceFindingIds: triggerFindings.map((f) => f.id),

      service: service.service,
      serviceId: service.id,
      serviceName: service.name,
      department: service.department,
      departmentColor: service.departmentColor,
      departmentBg: service.departmentBg,
      departmentBorder: service.departmentBorder,

      priority,
      severity: rule.severity,
      group: rule.group,

      businessImpact: rule.businessImpact,
      expectedOutcome: rule.expectedOutcome,
      triggerFindings,
      triggerFindingCount: triggerFindings.length,

      deliverables: service.deliverables,

      estimatedMonthlyFee: service.monthlyFee,
      estimatedSetupFee: service.setupFee,
      estimatedHoursPerMonth: service.estimatedHoursPerMonth,

      estimatedTimeline: rule.estimatedTimeline,
      estimatedTimelineWeeks: service.estimatedTimelineWeeks,

      dependencies: rule.dependencies, // will be resolved to IDs below
      dependencyServiceNames: [], // will be populated below

      confidenceScore,
      revenueImpactEstimate,

      proposalReadiness: rule.proposalReadiness,
      status: "Pending",
      salesNotes: "",
    };

    recommendations.push(rec);
  }

  // Step 3: Resolve dependency IDs → service names
  for (const rec of recommendations) {
    rec.dependencyServiceNames = rec.dependencies
      .map((depRuleId) => {
        const depRec = recommendations.find((r) => r.ruleId === depRuleId);
        return depRec?.serviceName ?? "";
      })
      .filter(Boolean);
  }

  // Step 4: Sort all recommendations
  const priorityOrder: Record<RecommendationPriority, number> = {
    Critical: 0, High: 1, Medium: 2, Low: 3,
  };
  recommendations.sort((a, b) => {
    const pd = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pd !== 0) return pd;
    return b.revenueImpactEstimate - a.revenueImpactEstimate;
  });

  // Step 5: Group recommendations
  const groups: RecommendationGroup_Result[] = RECOMMENDATION_GROUP_CONFIG
    .sort((a, b) => a.order - b.order)
    .map((gc) => {
      const items = recommendations.filter((r) => r.group === gc.key);
      return {
        group: gc.key,
        label: gc.label,
        description: gc.description,
        color: gc.color,
        bg: gc.bg,
        border: gc.border,
        order: gc.order,
        items,
        totalMonthlyFee: items.reduce((s, r) => s + r.estimatedMonthlyFee, 0),
        totalSetupFee: items.reduce((s, r) => s + r.estimatedSetupFee, 0),
        totalRevenueImpact: items.reduce((s, r) => s + r.revenueImpactEstimate, 0),
      };
    })
    .filter((g) => g.items.length > 0);

  // Step 6: Department impact
  const deptMap = new Map<string, DepartmentImpact>();
  for (const rec of recommendations) {
    const deptKey = rec.department;
    if (!deptMap.has(deptKey)) {
      deptMap.set(deptKey, {
        department: deptKey,
        color: rec.departmentColor,
        bg: rec.departmentBg,
        border: rec.departmentBorder,
        recommendationCount: 0,
        totalMonthlyFee: 0,
        totalSetupFee: 0,
        services: [],
        findingCount: 0,
        criticalCount: 0,
      });
    }
    const dept = deptMap.get(deptKey)!;
    dept.recommendationCount++;
    dept.totalMonthlyFee += rec.estimatedMonthlyFee;
    dept.totalSetupFee += rec.estimatedSetupFee;
    if (!dept.services.includes(rec.serviceName)) dept.services.push(rec.serviceName);
    dept.findingCount += rec.triggerFindingCount;
    dept.criticalCount += rec.triggerFindings.filter((f) => f.severity === "Critical").length;
  }
  const departmentImpact = Array.from(deptMap.values()).sort(
    (a, b) => b.criticalCount - a.criticalCount || b.totalMonthlyFee - a.totalMonthlyFee
  );

  // Step 7: Proposal readiness queue
  const proposalReadinessQueue: ProposalReadinessQueue[] = PROPOSAL_READINESS_CONFIG
    .sort((a, b) => a.order - b.order)
    .map((pc) => {
      const items = recommendations.filter((r) => r.proposalReadiness === pc.key);
      return {
        readiness: pc.key,
        label: pc.label,
        color: pc.color,
        bg: pc.bg,
        border: pc.border,
        items,
        count: items.length,
      };
    })
    .filter((q) => q.count > 0);

  // Step 8: Priority matrix
  const priorityMatrix: PriorityMatrixItem[] = recommendations.map((rec) => ({
    recommendationId: rec.id,
    serviceName: rec.serviceName,
    priority: rec.priority,
    effort: estimateEffortLevel(rec.estimatedHoursPerMonth),
    impact: estimateImpactLevel(rec.revenueImpactEstimate, rec.severity),
    revenueImpact: rec.revenueImpactEstimate,
    group: rec.group,
  }));

  // Step 9: Summary
  const summary: RecommendationSummary = {
    totalRecommendations: recommendations.length,
    totalMonthlyRevenue: recommendations.reduce((s, r) => s + r.estimatedMonthlyFee, 0),
    totalSetupRevenue: recommendations.reduce((s, r) => s + r.estimatedSetupFee, 0),
    totalAnnualRevenue: recommendations.reduce(
      (s, r) => s + r.estimatedMonthlyFee * opts.contractMonths + r.estimatedSetupFee,
      0
    ),
    totalEstimatedHours: recommendations.reduce((s, r) => s + r.estimatedHoursPerMonth, 0),
    criticalCount: recommendations.filter((r) => r.priority === "Critical").length,
    highCount: recommendations.filter((r) => r.priority === "High").length,
    mediumCount: recommendations.filter((r) => r.priority === "Medium").length,
    lowCount: recommendations.filter((r) => r.priority === "Low").length,
    readyForProposalCount: recommendations.filter((r) => r.proposalReadiness === "Ready for Proposal").length,
    needsReviewCount: recommendations.filter(
      (r) => r.proposalReadiness === "Needs Review" || r.proposalReadiness === "Needs Pricing"
    ).length,
    quickWinCount: recommendations.filter((r) => r.group === "Quick Wins").length,
    criticalFixCount: recommendations.filter((r) => r.group === "Critical Fixes").length,
    revenueOpportunityCount: recommendations.filter((r) => r.group === "Revenue Opportunities").length,
    avgConfidenceScore:
      recommendations.length > 0
        ? Math.round(
            recommendations.reduce((s, r) => s + r.confidenceScore, 0) / recommendations.length
          )
        : 0,
  };

  const isReadyForBudgetOptimizer = summary.readyForProposalCount > 0;

  const status: RecommendationResult["status"] =
    summary.readyForProposalCount >= 3
      ? "Proposal Ready"
      : recommendations.length > 0
      ? "Complete"
      : "Draft";

  return {
    id: `recs-${auditResult.id}-${Date.now()}`,
    sourceAuditId: auditResult.id,
    sourceIntakeId: auditResult.intakeId,
    goalIds: auditResult.goalIds,
    goalLabels: auditResult.goalLabels,
    generatedAt: new Date().toISOString(),
    status,

    auditScore: auditResult.overallScore,
    auditScoringLabel: auditResult.scoringLabel,
    totalAuditFindings: auditResult.totalFindingCount,
    criticalAuditFindings: auditResult.criticalCount,

    recommendations,
    groups,
    departmentImpact,
    proposalReadinessQueue,
    priorityMatrix,
    summary,
    isReadyForBudgetOptimizer,
  };
}

// ─── Demo Generator ────────────────────────────────────────────────────────────
// Called from the UI with a completed AuditResult.

export function generateRecommendationsFromAudit(
  auditResult: AuditResult,
  contractMonths: number = 12
): RecommendationResult {
  return runRecommendationEngine(auditResult, {
    contractMonths,
    includeOptionalPhase: true,
  });
}

// ─── Re-export config types used by UI ───────────────────────────────────────

export {
  RECOMMENDATION_RULES,
  SERVICE_CATALOG,
  RECOMMENDATION_GROUP_CONFIG,
  PROPOSAL_READINESS_CONFIG,
  PRIORITY_CONFIG,
  PRIORITY_RANKING_RULES,
  CONFIDENCE_MODIFIERS,
  getGroupConfig,
  getProposalReadinessConfig,
  getPriorityConfig,
  applyPriorityRankingRules,
  type RecommendationRule,
  type ServiceCatalogEntry,
  type RecommendationGroup,
  type RecommendationPriority,
  type ProposalReadiness,
  type AllowedService,
  type GroupConfig,
  type PriorityConfig,
  type ProposalReadinessConfig,
} from "./recommendation-config";
