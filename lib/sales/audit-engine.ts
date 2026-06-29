// RTM OS — Goal-Based Audit Engine
// ─────────────────────────────────────────────────────────────────────────────
// This module is the CORE ENGINE that:
//   1. Reads selected goals
//   2. Loads the Audit Template
//   3. Builds Audit Sections
//   4. Generates Audit Checklist
//   5. Calculates Scores
//   6. Generates Findings
//   7. Marks Ready For Recommendations
//
// The engine is pure — no UI. It receives config + answers → returns AuditResult.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AuditTemplateConfig,
  AuditSectionConfig,
  AuditQuestion,
  FindingSeverity,
  EffortLevel,
  getSectionsForGoals,
  normalizeSectionWeights,
  getScoringThreshold,
  getSeverityConfig,
  resolvePriority,
  RECOMMENDATION_MAPPINGS,
  getDepartmentConfig,
  DEFAULT_AUDIT_TEMPLATE,
  RecommendationMapping,
} from "./audit-config";

// ─── Engine Types ──────────────────────────────────────────────────────────────

export type QuestionAnswer = boolean | string | number | string[];

export interface AuditAnswers {
  [questionKey: string]: QuestionAnswer;
}

// ─── Per-Question Result ───────────────────────────────────────────────────────

export interface AuditQuestionResult {
  question: AuditQuestion;
  answer: QuestionAnswer | null;
  passed: boolean;        // true = good, false = needs attention
  skipped: boolean;       // question not answered
  contribution: number;   // score contribution (0–weight)
}

// ─── Per-Section Result ────────────────────────────────────────────────────────

export interface AuditSectionResult {
  section: AuditSectionConfig;
  questionResults: AuditQuestionResult[];
  rawScore: number;       // 0–100 before weighting
  weightedScore: number;  // contribution to overall score
  findingCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

// ─── Audit Finding ─────────────────────────────────────────────────────────────

export interface AuditFinding {
  id: string;
  sectionId: string;
  sectionLabel: string;
  category: string;
  questionId: string;
  questionLabel: string;
  severity: FindingSeverity;
  priority: "Critical" | "High" | "Medium" | "Low";
  businessImpact: string;
  relatedService: string;
  department: string;
  estimatedEffort: EffortLevel;
  isQuickWin: boolean;          // High impact, low effort
  isRevenueOpportunity: boolean; // estimated revenue > threshold
  estimatedRevenueImpact: number;
}

// ─── Recommendation Readiness ─────────────────────────────────────────────────

export interface RecommendationReady {
  mappingId: string;
  service: string;
  department: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  triggerFindings: AuditFinding[];
  estimatedMonthlyFee: number;
  estimatedTimeline: string;
  totalEstimatedRevenueImpact: number;
  reasoning: string;
}

// ─── Department Summary ────────────────────────────────────────────────────────

export interface DepartmentSummary {
  departmentKey: string;
  departmentLabel: string;
  color: string;
  bg: string;
  border: string;
  findingCount: number;
  criticalCount: number;
  highCount: number;
  recommendedServices: string[];
  estimatedMonthlyRevenue: number;
}

// ─── Full Audit Result ─────────────────────────────────────────────────────────

export interface AuditResult {
  // Metadata
  id: string;
  templateId: string;
  intakeId?: string;
  goalIds: string[];
  goalLabels: string[];
  generatedAt: string;
  status: "Draft" | "Complete" | "Ready For Recommendations";

  // Score
  overallScore: number;
  scoringLabel: string;
  scoringColor: string;
  scoringBg: string;

  // Section Results
  activeSections: AuditSectionConfig[];
  sectionResults: AuditSectionResult[];

  // All Findings
  findings: AuditFinding[];

  // Aggregated counts
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalFindingCount: number;

  // Curated output lists
  criticalFindings: AuditFinding[];
  quickWins: AuditFinding[];
  revenueOpportunities: AuditFinding[];

  // Department summary
  departmentSummary: DepartmentSummary[];

  // Recommendation readiness
  recommendations: RecommendationReady[];
  estimatedTotalMonthlyRevenue: number;
  isReadyForRecommendations: boolean;
}

// ─── Engine Configuration ──────────────────────────────────────────────────────

interface AuditEngineOptions {
  quickWinRevenueThreshold?: number;       // default 300
  revenueOpportunityThreshold?: number;    // default 500
  readyForRecsMinScore?: number;           // minimum findings before "ready" (default 1)
}

const DEFAULT_OPTIONS: Required<AuditEngineOptions> = {
  quickWinRevenueThreshold: 300,
  revenueOpportunityThreshold: 500,
  readyForRecsMinScore: 1,
};

// ─── Score Calculation ─────────────────────────────────────────────────────────

function calculateSectionScore(questionResults: AuditQuestionResult[]): number {
  if (questionResults.length === 0) return 100;
  const totalWeight = questionResults
    .filter((qr) => !qr.skipped)
    .reduce((sum, qr) => sum + qr.question.weight, 0);
  if (totalWeight === 0) return 100;
  const earned = questionResults
    .filter((qr) => !qr.skipped)
    .reduce((sum, qr) => sum + qr.contribution, 0);
  return Math.max(0, Math.min(100, Math.round((earned / totalWeight) * 100)));
}

function calculateOverallScore(sectionResults: AuditSectionResult[]): number {
  if (sectionResults.length === 0) return 100;
  const totalWeight = sectionResults.reduce((sum, sr) => sum + sr.section.weight, 0);
  if (totalWeight === 0) return 100;
  const weighted = sectionResults.reduce(
    (sum, sr) => sum + (sr.rawScore * sr.section.weight) / 100,
    0
  );
  return Math.max(0, Math.min(100, Math.round((weighted / totalWeight) * 100)));
}

// ─── Answer Evaluation ────────────────────────────────────────────────────────

function evaluateAnswer(question: AuditQuestion, answer: QuestionAnswer | null): boolean {
  if (answer === null || answer === undefined) return false;
  if (question.type === "binary") return answer === true || answer === "yes" || answer === "Yes";
  if (question.type === "score" || question.type === "count" || question.type === "rating") {
    return typeof answer === "number" && answer >= 70;
  }
  if (question.type === "select") return typeof answer === "string" && answer.trim().length > 0;
  if (question.type === "text" || question.type === "url") {
    return typeof answer === "string" && answer.trim().length > 2;
  }
  if (question.type === "multiselect") return Array.isArray(answer) && answer.length > 0;
  return Boolean(answer);
}

// ─── Finding Generator ────────────────────────────────────────────────────────

function generateFinding(
  question: AuditQuestion,
  section: AuditSectionConfig,
  findingIndex: number,
  options: Required<AuditEngineOptions>
): AuditFinding {
  const priority = resolvePriority(question.severityIfFailed, question.estimatedEffort);
  const severityCfg = getSeverityConfig(question.severityIfFailed);
  const estimatedRevenue = severityCfg.scoreImpact * (question.weight / 10) * 50;

  return {
    id: `finding-${section.key}-${question.key}-${findingIndex}`,
    sectionId: section.id,
    sectionLabel: section.label,
    category: section.category,
    questionId: question.id,
    questionLabel: question.label,
    severity: question.severityIfFailed,
    priority,
    businessImpact: question.businessImpact,
    relatedService: question.relatedService ?? "—",
    department: question.department,
    estimatedEffort: question.estimatedEffort,
    isQuickWin:
      (question.severityIfFailed === "Critical" || question.severityIfFailed === "High") &&
      question.estimatedEffort === "Low" &&
      estimatedRevenue >= options.quickWinRevenueThreshold,
    isRevenueOpportunity: estimatedRevenue >= options.revenueOpportunityThreshold,
    estimatedRevenueImpact: Math.round(estimatedRevenue),
  };
}

// ─── Recommendation Builder ────────────────────────────────────────────────────

function buildRecommendations(findings: AuditFinding[]): RecommendationReady[] {
  const recommendations: RecommendationReady[] = [];
  const usedMappingIds = new Set<string>();

  const activeMappings = RECOMMENDATION_MAPPINGS.filter((m) => m.active);

  for (const mapping of activeMappings) {
    const triggerFindings = findings.filter(
      (f) =>
        f.category === mapping.triggerCategory &&
        mapping.triggerSeverity.includes(f.severity)
    );
    if (triggerFindings.length === 0) continue;
    if (usedMappingIds.has(mapping.id)) continue;

    usedMappingIds.add(mapping.id);
    const totalRevenue = triggerFindings.reduce(
      (sum, f) => sum + f.estimatedRevenueImpact * mapping.revenueImpactMultiplier,
      0
    );
    const deptConfig = getDepartmentConfig(mapping.department);

    recommendations.push({
      mappingId: mapping.id,
      service: mapping.recommendedService,
      department: mapping.department,
      priority: mapping.priority,
      triggerFindings,
      estimatedMonthlyFee: mapping.estimatedMonthlyFee,
      estimatedTimeline: mapping.estimatedTimeline,
      totalEstimatedRevenueImpact: Math.round(totalRevenue / 1000) * 100,
      reasoning: `${triggerFindings.length} ${mapping.triggerCategory} finding${triggerFindings.length !== 1 ? "s" : ""} identified at ${triggerFindings.map((f) => f.severity).join(", ")} severity — ${mapping.recommendedService} recommended to address.`,
    });
  }

  // Sort by priority then by estimated revenue
  const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
  return recommendations.sort((a, b) => {
    const po = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (po !== 0) return po;
    return b.totalEstimatedRevenueImpact - a.totalEstimatedRevenueImpact;
  });
}

// ─── Department Summary Builder ────────────────────────────────────────────────

function buildDepartmentSummary(
  findings: AuditFinding[],
  recommendations: RecommendationReady[]
): DepartmentSummary[] {
  const deptMap = new Map<string, DepartmentSummary>();

  for (const finding of findings) {
    const deptKey = finding.department;
    if (!deptMap.has(deptKey)) {
      const cfg = getDepartmentConfig(deptKey);
      deptMap.set(deptKey, {
        departmentKey: deptKey,
        departmentLabel: cfg?.label ?? deptKey,
        color: cfg?.color ?? "#6B7280",
        bg: cfg?.bg ?? "#F3F4F6",
        border: cfg?.border ?? "#D1D5DB",
        findingCount: 0,
        criticalCount: 0,
        highCount: 0,
        recommendedServices: [],
        estimatedMonthlyRevenue: 0,
      });
    }
    const dept = deptMap.get(deptKey)!;
    dept.findingCount++;
    if (finding.severity === "Critical") dept.criticalCount++;
    if (finding.severity === "High") dept.highCount++;
  }

  for (const rec of recommendations) {
    const deptKey = rec.department;
    if (!deptMap.has(deptKey)) {
      const cfg = getDepartmentConfig(deptKey);
      deptMap.set(deptKey, {
        departmentKey: deptKey,
        departmentLabel: cfg?.label ?? deptKey,
        color: cfg?.color ?? "#6B7280",
        bg: cfg?.bg ?? "#F3F4F6",
        border: cfg?.border ?? "#D1D5DB",
        findingCount: 0,
        criticalCount: 0,
        highCount: 0,
        recommendedServices: [],
        estimatedMonthlyRevenue: 0,
      });
    }
    const dept = deptMap.get(deptKey)!;
    if (!dept.recommendedServices.includes(rec.service)) {
      dept.recommendedServices.push(rec.service);
    }
    dept.estimatedMonthlyRevenue += rec.estimatedMonthlyFee;
  }

  return Array.from(deptMap.values()).sort(
    (a, b) => b.criticalCount - a.criticalCount || b.findingCount - a.findingCount
  );
}

// ─── Mock Answer Generator ─────────────────────────────────────────────────────
// Generates realistic mock answers for demo mode.
// When real intake data is available, answers will come from the intake form.

export function generateMockAnswers(
  sections: AuditSectionConfig[],
  profileType: "struggling" | "average" | "strong" = "average"
): AuditAnswers {
  const answers: AuditAnswers = {};

  // Profiles: struggling (~30% pass), average (~55% pass), strong (~80% pass)
  const passRates = { struggling: 0.28, average: 0.52, strong: 0.78 };
  const passRate = passRates[profileType];

  // Certain questions are always failed in "struggling" or "average" modes
  const alwaysFailInStruggling: string[] = [
    "conversion_tracking", "negative_keywords", "call_tracking_active",
    "pixel_installed", "gbp_claimed_verified", "review_count",
    "pagespeed_mobile", "ssl_valid", "has_clear_cta",
  ];
  const alwaysFailInAverage: string[] = [
    "call_tracking_active", "review_count", "pixel_events_firing",
    "schema_comprehensive", "eeat_signals", "active_campaigns",
  ];

  for (const section of sections) {
    for (const q of section.questions) {
      if (profileType === "struggling" && alwaysFailInStruggling.includes(q.key)) {
        answers[q.key] = false;
      } else if (profileType === "average" && alwaysFailInAverage.includes(q.key)) {
        answers[q.key] = false;
      } else {
        // Randomized with profile weighting, but seeded deterministically for demo
        const seed = q.key.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const rand = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
        answers[q.key] = rand < passRate;
      }
    }
  }
  return answers;
}

// ─── Core Engine Function ──────────────────────────────────────────────────────

export function runAuditEngine(
  goalIds: string[],
  goalLabels: string[],
  answers: AuditAnswers,
  template: AuditTemplateConfig = DEFAULT_AUDIT_TEMPLATE,
  intakeId?: string,
  options: AuditEngineOptions = {}
): AuditResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Step 1: Get active sections for selected goals
  const rawSections = getSectionsForGoals(template, goalIds);
  const activeSections = normalizeSectionWeights(rawSections);

  // Step 2: Evaluate each section's questions
  let findingIndex = 0;
  const allFindings: AuditFinding[] = [];
  const sectionResults: AuditSectionResult[] = [];

  for (const section of activeSections) {
    const questionResults: AuditQuestionResult[] = section.questions.map((q) => {
      const answer = answers[q.key] !== undefined ? answers[q.key] : null;
      const skipped = answer === null;
      const passed = skipped ? true : evaluateAnswer(q, answer); // skipped = no penalty
      const contribution = passed ? q.weight : 0;
      return { question: q, answer, passed, skipped, contribution };
    });

    // Generate findings for failed questions
    const sectionFindings: AuditFinding[] = questionResults
      .filter((qr) => !qr.passed && !qr.skipped)
      .map((qr) => generateFinding(qr.question, section, ++findingIndex, opts));

    allFindings.push(...sectionFindings);

    const rawScore = calculateSectionScore(questionResults);
    const weightedScore = (rawScore * section.weight) / 100;

    sectionResults.push({
      section,
      questionResults,
      rawScore,
      weightedScore,
      findingCount: sectionFindings.length,
      criticalCount: sectionFindings.filter((f) => f.severity === "Critical").length,
      highCount: sectionFindings.filter((f) => f.severity === "High").length,
      mediumCount: sectionFindings.filter((f) => f.severity === "Medium").length,
      lowCount: sectionFindings.filter((f) => f.severity === "Low").length,
    });
  }

  // Step 3: Calculate overall score
  const overallScore = calculateOverallScore(sectionResults);
  const threshold = getScoringThreshold(overallScore);

  // Step 4: Sort findings by severity order
  const severityOrder: Record<FindingSeverity, number> = {
    Critical: 0, High: 1, Medium: 2, Low: 3,
  };
  allFindings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  // Step 5: Build curated lists
  const criticalFindings = allFindings.filter((f) => f.severity === "Critical");
  const quickWins = allFindings.filter((f) => f.isQuickWin);
  const revenueOpportunities = allFindings
    .filter((f) => f.isRevenueOpportunity)
    .sort((a, b) => b.estimatedRevenueImpact - a.estimatedRevenueImpact)
    .slice(0, 10);

  // Step 6: Build recommendations
  const recommendations = buildRecommendations(allFindings);

  // Step 7: Build department summary
  const departmentSummary = buildDepartmentSummary(allFindings, recommendations);

  // Step 8: Determine recommendation readiness
  const isReadyForRecommendations = allFindings.length >= opts.readyForRecsMinScore;
  const estimatedTotalMonthlyRevenue = recommendations.reduce(
    (sum, r) => sum + r.estimatedMonthlyFee,
    0
  );

  const status: AuditResult["status"] = isReadyForRecommendations
    ? "Ready For Recommendations"
    : allFindings.length > 0
    ? "Complete"
    : "Draft";

  return {
    id: `audit-${Date.now()}`,
    templateId: template.id,
    intakeId,
    goalIds,
    goalLabels,
    generatedAt: new Date().toISOString(),
    status,

    overallScore,
    scoringLabel: threshold.label,
    scoringColor: threshold.color,
    scoringBg: threshold.bg,

    activeSections,
    sectionResults,

    findings: allFindings,
    criticalCount: allFindings.filter((f) => f.severity === "Critical").length,
    highCount: allFindings.filter((f) => f.severity === "High").length,
    mediumCount: allFindings.filter((f) => f.severity === "Medium").length,
    lowCount: allFindings.filter((f) => f.severity === "Low").length,
    totalFindingCount: allFindings.length,

    criticalFindings,
    quickWins,
    revenueOpportunities,

    departmentSummary,
    recommendations,
    estimatedTotalMonthlyRevenue,
    isReadyForRecommendations,
  };
}

// ─── Demo: Generate Audit For Intake ─────────────────────────────────────────
// Called from the UI with selected goals + optional answers from intake form.

export function generateAuditForIntake(
  goalIds: string[],
  goalLabels: string[],
  intakeAnswers?: AuditAnswers,
  intakeId?: string
): AuditResult {
  const sections = getSectionsForGoals(DEFAULT_AUDIT_TEMPLATE, goalIds);
  const answers = intakeAnswers ?? generateMockAnswers(sections, "average");
  return runAuditEngine(goalIds, goalLabels, answers, DEFAULT_AUDIT_TEMPLATE, intakeId);
}

// ─── Re-export config helpers used by UI ─────────────────────────────────────

export {
  getScoringThreshold,
  getSeverityConfig,
  getDepartmentConfig,
  SCORING_THRESHOLDS,
  SEVERITY_CONFIG,
  EFFORT_CONFIG,
  DEPARTMENT_CONFIG,
  RECOMMENDATION_MAPPINGS,
  DEFAULT_AUDIT_TEMPLATE,
  getSectionsForGoals,
} from "./audit-config";

export type {
  AuditSectionConfig,
  AuditQuestion,
  AuditTemplateConfig,
  FindingSeverity,
  EffortLevel,
  ScoringThreshold,
  SeverityConfig,
  DepartmentConfig,
  RecommendationMapping,
} from "./audit-config";
