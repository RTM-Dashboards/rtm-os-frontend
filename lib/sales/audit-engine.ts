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
  CITATION_SCORING_WEIGHTS,
  CITATION_PLATFORM_CATEGORY_MAP,
  NAP_COMPARISON_RULES,
  KEYWORD_TEMPLATES,
  SEASONAL_KEYWORD_MODIFIERS,
  MARKETING_CHANNEL_ASSESSMENTS,
  WEBSITE_ASSESSMENT_RULES,
} from "./audit-config";
import { LISTING_PLATFORM_DEFINITIONS } from "./intake-config";
import type {
  HomeServicesIntakeRecord,
  NAPComparison,
  CitationAuditResult,
  KeywordSuggestion,
  CompetitorAnalysis,
  CurrentMarketingAssessment,
  WebsiteAssessment,
  IntakeFinding,
  IntakeAuditResult,
} from "./types";

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

// ─── Intake-Based Audit Functions ───────────────────────────────────────────

// ─── String normalization helpers ────────────────────────────────────────────

function normalizePhone(val: string): string {
  return val.replace(/[\s\-\.\(\)\+]/g, "").toLowerCase();
}

function normalizeAddress(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/\bstreet\b/g, "st")
    .replace(/\bavenue\b/g, "ave")
    .replace(/\bboulevard\b/g, "blvd")
    .replace(/\bdrive\b/g, "dr")
    .replace(/\broad\b/g, "rd")
    .replace(/\bcourt\b/g, "ct")
    .replace(/\bsuite\b/g, "ste")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeName(val: string): string {
  return val
    .toLowerCase()
    .trim()
    .replace(/,?\s*llc\.?$/i, "")
    .replace(/,?\s*inc\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

// ─── compareNAP ───────────────────────────────────────────────────────────────

export function compareNAP(
  masterValue: string,
  listedValue: string,
  field: "name" | "address" | "phone"
): NAPComparison {
  if (!listedValue || listedValue.trim() === "") {
    return {
      field,
      masterValue,
      listedValue,
      status: "not-listed",
      notes: `No ${field} listed on this platform.`,
    };
  }

  let normalizedMaster: string;
  let normalizedListed: string;

  if (field === "phone") {
    normalizedMaster = normalizePhone(masterValue);
    normalizedListed = normalizePhone(listedValue);
  } else if (field === "address") {
    normalizedMaster = normalizeAddress(masterValue);
    normalizedListed = normalizeAddress(listedValue);
  } else {
    normalizedMaster = normalizeName(masterValue);
    normalizedListed = normalizeName(listedValue);
  }

  if (normalizedMaster === normalizedListed) {
    return { field, masterValue, listedValue, status: "exact", notes: "Values match after normalization." };
  }

  const distance = levenshtein(normalizedMaster, normalizedListed);
  if (distance <= NAP_COMPARISON_RULES.majorMismatchThreshold) {
    return {
      field,
      masterValue,
      listedValue,
      status: "minor-variation",
      notes: `Minor variation detected (edit distance: ${distance}). Verify and correct if needed.`,
    };
  }

  return {
    field,
    masterValue,
    listedValue,
    status: "major-mismatch",
    notes: `Significant mismatch detected. Update ${field} on this platform to match the master record.`,
  };
}

// ─── runCitationAudit ────────────────────────────────────────────────────────

export function runCitationAudit(
  intake: HomeServicesIntakeRecord
): CitationAuditResult[] {
  const masterName = intake.businessName ?? "";
  const masterAddress = [
    intake.masterAddress?.street,
    intake.masterAddress?.city,
    intake.masterAddress?.state,
    intake.masterAddress?.zip,
  ]
    .filter(Boolean)
    .join(" ");
  const masterPhone = intake.phone ?? "";

  return LISTING_PLATFORM_DEFINITIONS.map((platform) => {
    const listed = (intake.listingPlatforms ?? []).find(
      (p) => p.platformId === platform.id
    );

    if (!listed || !listed.url) {
      return {
        platformId: platform.id,
        platformLabel: platform.label,
        url: "",
        isListed: false,
        napComparisons: [],
        overallStatus: "not-listed" as const,
        score: 0,
        recommendations: [
          `List your business on ${platform.label} to improve citation coverage.`,
        ],
      };
    }

    const nameComp = compareNAP(masterName, listed.nameAsListed ?? "", "name");
    const addressComp = compareNAP(masterAddress, listed.addressAsListed ?? "", "address");
    const phoneComp = compareNAP(masterPhone, listed.phoneAsListed ?? "", "phone");

    const comparisons = [nameComp, addressComp, phoneComp];
    const consistentCount = comparisons.filter((c) => c.status === "exact").length;

    let score = 0;
    if (consistentCount === 3) score = 100;
    else if (consistentCount === 2) score = 66;
    else if (consistentCount === 1) score = 33;
    else score = 0;

    const hasAnyMismatch = comparisons.some(
      (c) => c.status === "major-mismatch" || c.status === "minor-variation"
    );
    const overallStatus: CitationAuditResult["overallStatus"] = hasAnyMismatch
      ? "inconsistent"
      : score === 100
      ? "consistent"
      : "needs-verification";

    const recs: string[] = [];
    comparisons.forEach((c) => {
      if (c.status === "major-mismatch") {
        recs.push(`Update ${c.field} on ${platform.label} to match master record: "${c.masterValue}".`);
      } else if (c.status === "minor-variation") {
        recs.push(`Verify ${c.field} on ${platform.label} — minor variation detected.`);
      } else if (c.status === "not-listed") {
        recs.push(`Add ${c.field} to ${platform.label} listing.`);
      }
    });

    return {
      platformId: platform.id,
      platformLabel: platform.label,
      url: listed.url,
      isListed: true,
      napComparisons: comparisons,
      overallStatus,
      score,
      recommendations: recs,
    };
  });
}

// ─── computeCitationScore ────────────────────────────────────────────────────

export function computeCitationScore(
  citationResults: CitationAuditResult[]
): number {
  let total = 0;
  for (const result of citationResults) {
    const weight = CITATION_SCORING_WEIGHTS[result.platformId] ?? 0;
    total += result.score * (weight / 100);
  }
  return Math.max(0, Math.min(100, Math.round(total)));
}

// ─── suggestKeywords ─────────────────────────────────────────────────────────

export function suggestKeywords(
  intake: HomeServicesIntakeRecord
): KeywordSuggestion[] {
  const suggestions: KeywordSuggestion[] = [];
  const seen = new Set<string>();

  const tradeType = intake.tradeType ?? "";
  const primaryCity = intake.masterAddress?.city ?? "";
  const templates = KEYWORD_TEMPLATES[tradeType] ?? KEYWORD_TEMPLATES["Other Home Services"] ?? [];

  function addKeyword(
    kw: string,
    type: KeywordSuggestion["type"],
    priority: KeywordSuggestion["priority"],
    rationale: string
  ) {
    const normalized = kw.toLowerCase().trim();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      suggestions.push({ keyword: kw, type, priority, rationale });
    }
  }

  // Primary keywords from templates
  templates.forEach((template, idx) => {
    const kw = template.replace(/\{city\}/g, primaryCity).replace(/\{service\}/g, tradeType);
    const priority: KeywordSuggestion["priority"] = idx < 5 ? "high" : "medium";
    addKeyword(kw, "primary", priority, `Core service keyword for ${tradeType} in ${primaryCity}.`);
  });

  // Local keywords for additional service area cities
  const additionalCities = (intake.serviceArea ?? []).filter(
    (city) => city.toLowerCase() !== primaryCity.toLowerCase() && city.trim() !== ""
  );
  additionalCities.forEach((city) => {
    templates.slice(0, 3).forEach((template) => {
      const kw = template.replace(/\{city\}/g, city).replace(/\{service\}/g, tradeType);
      addKeyword(kw, "local", "medium", `Local service keyword for ${tradeType} in ${city}.`);
    });
  });

  // Seasonal keywords
  const seasonal = intake.seasonalConsiderations ?? "";
  if (seasonal) {
    const seasonalLower = seasonal.toLowerCase();
    const seasonalKey =
      seasonalLower.includes("spring") || seasonalLower.includes("summer")
        ? "spring-summer"
        : seasonalLower.includes("fall") || seasonalLower.includes("winter")
        ? "fall-winter"
        : seasonalLower.includes("weather") || seasonalLower.includes("storm")
        ? "weather-dependent"
        : null;
    if (seasonalKey && SEASONAL_KEYWORD_MODIFIERS[seasonalKey]) {
      SEASONAL_KEYWORD_MODIFIERS[seasonalKey].forEach((mod) => {
        const kw = `${tradeType.toLowerCase()} ${mod} ${primaryCity}`.trim();
        addKeyword(kw, "seasonal", "medium", `Seasonal modifier: ${mod}.`);
      });
    }
  }

  // Competitor keywords
  (intake.competitors ?? []).forEach((comp) => {
    if (comp.name) {
      addKeyword(
        `${comp.name} alternative`,
        "competitor",
        "low",
        `Competitor comparison keyword for ${comp.name}.`
      );
    }
  });

  return suggestions;
}

// ─── assessCurrentMarketing ──────────────────────────────────────────────────

export function assessCurrentMarketing(
  intake: HomeServicesIntakeRecord
): CurrentMarketingAssessment[] {
  const channels: Array<{
    id: string;
    isActive: boolean;
    spend: number;
    inactivePriority: "high" | "medium" | "low";
  }> = [
    { id: "google-ads", isActive: intake.googleAdsActive ?? false, spend: intake.googleAdsSpend ?? 0, inactivePriority: "high" },
    { id: "lsa",        isActive: intake.lsaActive ?? false,        spend: intake.lsaSpend ?? 0,       inactivePriority: "high" },
    { id: "meta-ads",   isActive: intake.metaAdsActive ?? false,   spend: intake.metaAdsSpend ?? 0,   inactivePriority: "medium" },
  ];

  return channels.map((ch) => {
    const config = MARKETING_CHANNEL_ASSESSMENTS[ch.id];
    const stateConfig = ch.isActive ? config.active : config.inactive;
    return {
      channelId: ch.id,
      channelLabel: config.channelLabel,
      isActive: ch.isActive,
      currentSpend: ch.spend,
      assessment: stateConfig.assessment,
      recommendation: stateConfig.recommendation,
      priority: ch.isActive ? ("medium" as const) : ch.inactivePriority,
    };
  });
}

// ─── assessWebsite ───────────────────────────────────────────────────────────

export function assessWebsite(
  intake: HomeServicesIntakeRecord
): WebsiteAssessment {
  const w = intake.website2;
  const hasWebsite = w?.hasWebsite === "yes";
  const interestedInRedesign = w?.interestedInRedesign === "yes";
  const interestedInNewBuild = w?.interestedInNewBuild === "yes";
  const hasHostingAccess = w?.hasHostingAccess === "yes";
  const hasDomainAccess = w?.hasDomainAccess === "yes";
  const lastUpdated = w?.lastUpdated ?? "";

  const OLD_WEBSITE_VALUES = ["2 or more years", "Not sure", "7+ years", "4-6 years", "Unknown"];
  const isOldWebsite = OLD_WEBSITE_VALUES.includes(lastUpdated);

  const recs: string[] = [];
  let topPriority: WebsiteAssessment["priority"] = "low";

  const setPriority = (p: WebsiteAssessment["priority"]) => {
    const order: Record<WebsiteAssessment["priority"], number> = { critical: 0, high: 1, medium: 2, low: 3 };
    if (order[p] < order[topPriority]) topPriority = p;
  };

  if (!hasWebsite) {
    recs.push(WEBSITE_ASSESSMENT_RULES.noWebsite.recommendation);
    setPriority(WEBSITE_ASSESSMENT_RULES.noWebsite.severity);
  }
  if (hasWebsite && interestedInRedesign) {
    recs.push(WEBSITE_ASSESSMENT_RULES.interestedInRedesign.recommendation);
    setPriority(WEBSITE_ASSESSMENT_RULES.interestedInRedesign.severity);
  }
  if (hasWebsite && isOldWebsite && !interestedInRedesign) {
    recs.push(WEBSITE_ASSESSMENT_RULES.oldWebsite.recommendation);
    setPriority(WEBSITE_ASSESSMENT_RULES.oldWebsite.severity);
  }
  if (hasWebsite && !hasHostingAccess) {
    recs.push(WEBSITE_ASSESSMENT_RULES.noHostingAccess.recommendation);
    setPriority(WEBSITE_ASSESSMENT_RULES.noHostingAccess.severity);
  }
  if (hasWebsite && !hasDomainAccess) {
    recs.push(WEBSITE_ASSESSMENT_RULES.noDomainAccess.recommendation);
    setPriority(WEBSITE_ASSESSMENT_RULES.noDomainAccess.severity);
  }

  return {
    hasWebsite,
    url: w?.url ?? "",
    platform: w?.platform ?? "",
    lastUpdated,
    hasHostingAccess,
    hasDomainAccess,
    interestedInRedesign,
    interestedInNewBuild,
    recommendations: recs,
    priority: topPriority,
  };
}

// ─── generateCitationFindings ────────────────────────────────────────────────
// Generates one IntakeFinding per applicable rule-matching category per
// platform. Category strings come from CITATION_PLATFORM_CATEGORY_MAP so they
// exactly match the triggerCategories values in RECOMMENDATION_RULES. A GBP
// issue produces findings under "GBP" and "Local SEO"; a Facebook issue
// produces a finding under "Meta Ads"; etc.

export function generateCitationFindings(
  citationResults: CitationAuditResult[]
): IntakeFinding[] {
  const findings: IntakeFinding[] = [];

  citationResults.forEach((result, idx) => {
    if (result.overallStatus === "consistent") return;

    const weight = CITATION_SCORING_WEIGHTS[result.platformId] ?? 0;
    const severity: IntakeFinding["severity"] =
      weight >= 15 ? "high" : weight >= 8 ? "medium" : "low";

    // Look up rule-matching categories for this platform from the config map.
    // Fall back to "Local SEO" if the platform is unknown so nothing is silently
    // dropped — every known platform in CITATION_SCORING_WEIGHTS has an entry.
    const categories = CITATION_PLATFORM_CATEGORY_MAP[result.platformId] ?? ["Local SEO"];

    if (result.overallStatus === "not-listed") {
      categories.forEach((category) => {
        findings.push({
          id: `citation-finding-${result.platformId}-${idx}-${category}`,
          category,
          severity,
          title: `${result.platformLabel} — Not Listed`,
          description: `Business is not listed on ${result.platformLabel}. Missing citations reduce local search visibility.`,
          recommendation: `Create a listing on ${result.platformLabel} and ensure NAP information matches the master record.`,
          source: "intake",
        });
      });
    } else {
      const mismatchedFields = result.napComparisons
        .filter((c) => c.status === "major-mismatch" || c.status === "minor-variation")
        .map((c) => c.field)
        .join(", ");

      categories.forEach((category) => {
        findings.push({
          id: `citation-finding-${result.platformId}-${idx}-${category}`,
          category,
          severity,
          title: `${result.platformLabel} — NAP Inconsistency`,
          description: `NAP inconsistency detected on ${result.platformLabel}. Mismatched fields: ${mismatchedFields}.`,
          recommendation: result.recommendations.join(" "),
          source: "intake",
        });
      });
    }
  });

  return findings;
}

// ─── convertWebsiteAssessmentToFindings ──────────────────────────────────────
// Pure conversion function. Maps a WebsiteAssessment to AuditFinding-compatible
// IntakeFinding objects using real rule-taxonomy category strings. Returns an
// empty array when no actionable issues are found. Severity and recommendation
// text are taken directly from the assessment — no new logic is invented here.

export function convertWebsiteAssessmentToFindings(
  assessment: WebsiteAssessment
): IntakeFinding[] {
  // No findings when no actionable recommendations were generated by assessWebsite.
  if (!assessment.recommendations || assessment.recommendations.length === 0) {
    return [];
  }

  const findings: IntakeFinding[] = [];

  // Use "Website Performance" for critical/high issues (no website, redesign
  // needed, old site) and "Website" for medium/low access issues.  Both exist
  // in the real rule taxonomy and map to different RECOMMENDATION_RULES.
  const primaryCategory =
    assessment.priority === "critical" || assessment.priority === "high"
      ? "Website Performance"
      : "Website";

  // A missing website or a critical website issue warrants a finding under
  // both "Website Performance" and "Website" so that every matching rule fires.
  const categories: string[] =
    assessment.priority === "critical"
      ? ["Website Performance", "Website"]
      : [primaryCategory];

  const recommendationText = assessment.recommendations.join(" ");

  const descriptionText = !assessment.hasWebsite
    ? "No website detected from intake data. A professional website is required for local search visibility and lead capture."
    : assessment.interestedInRedesign
    ? "Client has requested a website redesign. Current site is not meeting conversion or SEO goals."
    : `Website concern identified (priority: ${assessment.priority}). ${assessment.recommendations[0]}`;

  categories.forEach((category) => {
    findings.push({
      id: `website-finding-${category.replace(/\s+/g, "-").toLowerCase()}`,
      category,
      severity: assessment.priority,
      title: !assessment.hasWebsite
        ? "No Website Detected"
        : assessment.interestedInRedesign
        ? "Website Redesign Requested"
        : "Website Concern Identified",
      description: descriptionText,
      recommendation: recommendationText,
      source: "intake",
    });
  });

  return findings;
}

// ─── convertMarketingAssessmentToFindings ─────────────────────────────────────
// Pure conversion function. Maps each CurrentMarketingAssessment channel to
// IntakeFinding objects using real rule-taxonomy category strings. Only channels
// with an actionable gap (inactive high-priority channel, or active channel that
// needs optimization) are converted. Category strings match triggerCategories
// in RECOMMENDATION_RULES exactly. Multiple categories per channel produce one
// finding per category so every relevant rule can match.

export function convertMarketingAssessmentToFindings(
  assessments: CurrentMarketingAssessment[]
): IntakeFinding[] {
  const findings: IntakeFinding[] = [];

  // Channel ID -> rule-matching category strings from the real taxonomy.
  // LSA maps to ["PPC", "Local SEO", "GBP"] to match the existing LSA rule at
  // triggerCategories: ["PPC", "Local SEO", "GBP"] in recommendation-config.ts.
  const channelCategoryMap: Record<string, string[]> = {
    "google-ads": ["PPC", "Paid Media"],
    "lsa":        ["PPC", "Local SEO", "GBP"],
    "meta-ads":   ["Meta Ads"],
  };

  for (const assessment of assessments) {
    // Include findings for:
    //   - Inactive channels (clear gap — competitor opportunity being missed)
    //   - Active channels with medium+ priority (optimization is a real finding)
    const isActionable =
      !assessment.isActive ||
      (assessment.isActive && (assessment.priority === "high" || assessment.priority === "medium"));

    if (!isActionable) continue;

    const categories = channelCategoryMap[assessment.channelId] ?? [];
    if (categories.length === 0) continue;

    const severity: IntakeFinding["severity"] = assessment.isActive
      ? assessment.priority === "high" ? "high" : "medium"
      : assessment.priority === "high" ? "high" : "medium";

    const title = assessment.isActive
      ? `${assessment.channelLabel} — Active, Needs Optimization`
      : `${assessment.channelLabel} — Inactive`;

    categories.forEach((category) => {
      findings.push({
        id: `marketing-finding-${assessment.channelId}-${category.replace(/\s+/g, "-").toLowerCase()}`,
        category,
        severity,
        title,
        description: assessment.assessment,
        recommendation: assessment.recommendation,
        source: "intake",
      });
    });
  }

  return findings;
}

// ─── runIntakeAudit ──────────────────────────────────────────────────────────

export function runIntakeAudit(
  intake: HomeServicesIntakeRecord,
  clientName: string
): IntakeAuditResult {
  const citationAudit = runCitationAudit(intake);
  const citationScore = computeCitationScore(citationAudit);
  const keywordSuggestions = suggestKeywords(intake);
  const competitorAnalysis: CompetitorAnalysis[] = (intake.competitors ?? []).map((c) => ({
    competitorName: c.name,
    competitorCity: c.city,
    competitorWebsite: c.website ?? "",
    notes: "",
  }));
  const currentMarketingAssessment = assessCurrentMarketing(intake);
  const websiteAssessment = assessWebsite(intake);

  // Assemble the full findings union:
  //   1. Citation findings — now categorized by platform using CITATION_PLATFORM_CATEGORY_MAP
  //   2. Website findings — mapped to "Website Performance" / "Website" rule categories
  //   3. Marketing findings — mapped to channel-specific rule categories
  const overallFindings = [
    ...generateCitationFindings(citationAudit),
    ...convertWebsiteAssessmentToFindings(websiteAssessment),
    ...convertMarketingAssessmentToFindings(currentMarketingAssessment),
  ];

  return {
    intakeId: "",
    clientName,
    tradeType: intake.tradeType ?? "",
    masterAddress: intake.masterAddress ?? {
      street: "",
      suite: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
    citationAudit,
    citationScore,
    keywordSuggestions,
    competitorAnalysis,
    currentMarketingAssessment,
    websiteAssessment,
    overallFindings,
    generatedAt: new Date().toISOString(),
  };
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
  CITATION_SCORING_WEIGHTS,
  CITATION_PLATFORM_CATEGORY_MAP,
  NAP_COMPARISON_RULES,
  KEYWORD_TEMPLATES,
  SEASONAL_KEYWORD_MODIFIERS,
  MARKETING_CHANNEL_ASSESSMENTS,
  WEBSITE_ASSESSMENT_RULES,
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
  MarketingChannelAssessmentConfig,
  WebsiteAssessmentRule,
} from "./audit-config";

export type {
  NAPComparison,
  CitationAuditResult,
  KeywordSuggestion,
  CompetitorAnalysis,
  CurrentMarketingAssessment,
  WebsiteAssessment,
  IntakeFinding,
  IntakeAuditResult,
} from "./types";

// ─── Audit Request Engine Functions ───────────────────────────────────────────

import {
  SERVICE_TO_DEPARTMENT_MAP,
  MANUAL_SCORECARD_CATEGORIES,
  MOCK_DEPARTMENT_REVIEWERS,
  AUDIT_REQUEST_SLA_HOURS,
} from "./audit-config";
import type {
  AuditRequestStatus,
  ReviewerFindingActionType,
  ReviewerFindingAction,
  DepartmentReview,
  ManualAuditRequest,
  HybridAuditRequest,
  HybridReadinessSummary,
} from "./types";

export function generateAuditRequestId(prefix: "AUD" | "HYB"): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${rand}`;
}

function getSlaDeadline(): string {
  const d = new Date();
  d.setHours(d.getHours() + AUDIT_REQUEST_SLA_HOURS);
  return d.toISOString();
}

function getDepartmentForService(serviceId: string): string {
  return SERVICE_TO_DEPARTMENT_MAP[serviceId] ?? "SEO";
}

function getUniqueDepartments(services: string[]): string[] {
  const depts = services.map(getDepartmentForService);
  return Array.from(new Set(depts));
}

export function createManualAuditRequest(
  opportunityId: string,
  clientName: string,
  requestedServices: string[],
  requestedBy: string
): ManualAuditRequest {
  const department = getDepartmentForService(requestedServices[0] ?? "");
  const categories = MANUAL_SCORECARD_CATEGORIES[department] ?? [];
  const scorecard: Record<string, number> = {};
  const scorecardNotes: Record<string, string> = {};
  categories.forEach((c) => {
    scorecard[c.id] = 0;
    scorecardNotes[c.id] = "";
  });

  const reviewers = MOCK_DEPARTMENT_REVIEWERS[department] ?? [];
  return {
    id: generateAuditRequestId("AUD"),
    opportunityId,
    clientName,
    requestedServices,
    assignedReviewer: reviewers[0] ?? null,
    department,
    status: "pending-assignment",
    scorecard,
    scorecardNotes,
    submittedFindings: null,
    requestedBy,
    requestedAt: new Date().toISOString(),
    dueAt: getSlaDeadline(),
    completedAt: null,
  };
}

function scoreToSeverity(score: number): IntakeFinding["severity"] {
  if (score < 30) return "critical";
  if (score < 50) return "high";
  if (score < 65) return "medium";
  return "low";
}

export function submitManualAuditScorecard(
  request: ManualAuditRequest,
  scorecard: Record<string, number>,
  scorecardNotes: Record<string, string>,
  submittedBy: string
): ManualAuditRequest {
  const categories = MANUAL_SCORECARD_CATEGORIES[request.department] ?? [];
  const findings: IntakeFinding[] = categories
    .filter((c) => (scorecard[c.id] ?? 0) < 60)
    .map((c): IntakeFinding => ({
      id: `manual-finding-${request.id}-${c.id}`,
      category: request.department,
      severity: scoreToSeverity(scorecard[c.id] ?? 0),
      title: `${c.label} — Below Threshold`,
      description: `Score: ${scorecard[c.id] ?? 0}/100. ${c.description}`,
      recommendation: scorecardNotes[c.id]
        ? scorecardNotes[c.id]
        : `Improve ${c.label.toLowerCase()} to reach a score of 60 or above.`,
      source: "manual",
    }));

  return {
    ...request,
    scorecard: { ...scorecard },
    scorecardNotes: { ...scorecardNotes },
    submittedFindings: findings,
    status: "finalized",
    completedAt: new Date().toISOString(),
  };
}

function filterFindingsForDepartment(
  findings: IntakeFinding[],
  department: string
): IntakeFinding[] {
  const keywords = department.toLowerCase().split(/[\s/]+/);
  return findings.filter((f) => {
    const text = (f.category + " " + f.title + " " + f.description).toLowerCase();
    return keywords.some((kw) => text.includes(kw));
  });
}

export function createHybridAuditRequest(
  opportunityId: string,
  clientName: string,
  requestedServices: string[],
  requestedBy: string,
  intakeAuditResult: import("./types").IntakeAuditResult
): HybridAuditRequest {
  const departments = getUniqueDepartments(requestedServices);
  const allFindings = intakeAuditResult.overallFindings;

  const departmentReviews: DepartmentReview[] = departments.map((dept): DepartmentReview => {
    const reviewers = MOCK_DEPARTMENT_REVIEWERS[dept] ?? [];
    const deptFindings = filterFindingsForDepartment(allFindings, dept);
    return {
      department: dept,
      assignedReviewer: reviewers[0] ?? null,
      status: "ai-complete-pending-review",
      slaDeadline: getSlaDeadline(),
      aiFindings: deptFindings.length > 0 ? deptFindings : allFindings.slice(0, 2),
      reviewerActions: [],
      addedFindings: [],
      finalizedFindings: null,
      finalizedAt: null,
      finalizedBy: null,
    };
  });

  return {
    id: generateAuditRequestId("HYB"),
    opportunityId,
    clientName,
    intakeAuditResult,
    departmentReviews,
    requestedBy,
    requestedAt: new Date().toISOString(),
  };
}

export function applyReviewerAction(
  review: DepartmentReview,
  findingId: string,
  actionType: ReviewerFindingActionType,
  reviewerNote: string,
  reviewerName: string,
  updates?: { severity?: string; description?: string; recommendation?: string }
): DepartmentReview {
  const action: ReviewerFindingAction = {
    findingId,
    actionType,
    reviewerNote,
    updatedSeverity: (updates?.severity as ReviewerFindingAction["updatedSeverity"]) ?? null,
    updatedDescription: updates?.description ?? null,
    updatedRecommendation: updates?.recommendation ?? null,
    actionedAt: new Date().toISOString(),
    actionedBy: reviewerName,
  };

  const newStatus: AuditRequestStatus =
    review.status === "ai-complete-pending-review" ? "in-progress" : review.status;

  return {
    ...review,
    status: newStatus,
    reviewerActions: [...review.reviewerActions, action],
  };
}

export function addCustomFinding(
  review: DepartmentReview,
  finding: IntakeFinding,
  _addedBy: string
): DepartmentReview {
  const newStatus: AuditRequestStatus =
    review.status === "ai-complete-pending-review" ? "in-progress" : review.status;
  return {
    ...review,
    status: newStatus,
    addedFindings: [...review.addedFindings, finding],
  };
}

export function finalizeDepartmentReview(
  review: DepartmentReview,
  finalizedBy: string
): DepartmentReview {
  const overriddenIds = new Set(
    review.reviewerActions
      .filter((a) => a.actionType === "overridden")
      .map((a) => a.findingId)
  );
  const modifiedMap = new Map(
    review.reviewerActions
      .filter((a) => a.actionType === "modified")
      .map((a) => [a.findingId, a])
  );

  const finalizedFromAI: IntakeFinding[] = review.aiFindings
    .filter((f) => !overriddenIds.has(f.id))
    .map((f): IntakeFinding => {
      const mod = modifiedMap.get(f.id);
      if (!mod) return f;
      return {
        ...f,
        severity: (mod.updatedSeverity as IntakeFinding["severity"]) ?? f.severity,
        description: mod.updatedDescription ?? f.description,
        recommendation: mod.updatedRecommendation ?? f.recommendation,
      };
    });

  const overrideFindings: IntakeFinding[] = review.reviewerActions
    .filter((a) => a.actionType === "overridden")
    .map((a): IntakeFinding => {
      const original = review.aiFindings.find((f) => f.id === a.findingId);
      return {
        id: `override-${a.findingId}`,
        category: original?.category ?? review.department,
        severity: (a.updatedSeverity as IntakeFinding["severity"]) ?? (original?.severity ?? "medium"),
        title: `${original?.title ?? "Finding"} (Reviewer Override)`,
        description: a.updatedDescription ?? original?.description ?? "",
        recommendation: a.updatedRecommendation ?? original?.recommendation ?? "",
        source: "manual",
      };
    });

  const finalizedFindings = [
    ...finalizedFromAI,
    ...overrideFindings,
    ...review.addedFindings,
  ];

  return {
    ...review,
    status: "finalized",
    finalizedFindings,
    finalizedAt: new Date().toISOString(),
    finalizedBy,
  };
}

// ─── Reopen Finalized Manual Audit Request ────────────────────────────────────
// Pure function — never mutates input.
// Returns a new ManualAuditRequest with status reset to 'in-progress',
// completedAt cleared, and all prior scorecard/scorecardNotes values preserved
// as the starting point for editing. submittedFindings are retained until
// the request is re-finalized via submitManualAuditScorecard.

export function reopenManualAuditRequest(
  request: ManualAuditRequest,
  reopenedBy: string
): ManualAuditRequest {
  void reopenedBy; // available for audit logging when backend is wired
  return {
    ...request,
    status: "in-progress",
    completedAt: null,
  };
}

export function computeHybridReadiness(
  request: HybridAuditRequest
): HybridReadinessSummary {
  const now = new Date();
  const total = request.departmentReviews.length;
  let finalized = 0;
  let overdue = 0;

  for (const r of request.departmentReviews) {
    if (r.status === "finalized") {
      finalized++;
    } else if (
      (r.status === "ai-complete-pending-review" || r.status === "in-progress") &&
      new Date(r.slaDeadline) < now
    ) {
      overdue++;
    }
  }

  const pending = total - finalized;
  let statusLabel: string;
  if (finalized === total) {
    statusLabel = "Fully Reviewed";
  } else if (finalized === 0) {
    statusLabel = "AI Only — Pending Review";
  } else {
    statusLabel = `Partially Reviewed — ${finalized} of ${total} departments complete`;
  }

  return {
    totalDepartments: total,
    finalizedCount: finalized,
    pendingCount: pending,
    overdueCount: overdue,
    statusLabel,
    isFullyReviewed: finalized === total,
  };
}

export interface EffectiveFinding extends IntakeFinding {
  isPendingReview: boolean;
  departmentSource: string;
}

export function getEffectiveFindingsForProposal(
  request: HybridAuditRequest
): EffectiveFinding[] {
  const result: EffectiveFinding[] = [];
  for (const review of request.departmentReviews) {
    const isFinalized = review.status === "finalized";
    const findings = isFinalized
      ? (review.finalizedFindings ?? review.aiFindings)
      : review.aiFindings;

    for (const f of findings) {
      result.push({
        ...f,
        isPendingReview: !isFinalized,
        departmentSource: review.department,
      });
    }
  }
  return result;
}

export type {
  AuditRequestStatus,
  ReviewerFindingActionType,
  ReviewerFindingAction,
  DepartmentReview,
  ManualAuditRequest,
  HybridAuditRequest,
  HybridReadinessSummary,
} from "./types";

export type {
  ScorecardCategory,
} from "./audit-config";

export {
  AUDIT_REQUEST_MODE_LABELS,
  AUDIT_REQUEST_STATUS_LABELS,
  AUDIT_REQUEST_STATUS_COLORS,
  SERVICE_TO_DEPARTMENT_MAP,
  AUDIT_REQUEST_SLA_HOURS,
  MANUAL_SCORECARD_CATEGORIES,
  MOCK_DEPARTMENT_REVIEWERS,
} from "./audit-config";
