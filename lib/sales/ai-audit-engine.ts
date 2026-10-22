// RTM OS — AI Audit Engine
// ─────────────────────────────────────────────────────────────────────────────
// Pure functions: buildAiAuditPrompt, parseAiAuditResponse, getScoreLabel
// Async: fetchWebsiteContent (server-side helper, kept here for tests/imports)
//        runAiAudit (client-callable: delegates to POST /api/sales/ai-audit)
//
// All outbound calls to Anthropic and PageSpeed run server-side inside the
// /api/sales/ai-audit route. ANTHROPIC_API_KEY is never bundled into client code.
//
// All prompt templates and scoring thresholds live in audit-config.ts only.
// No prompt strings are hardcoded here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AI_AUDIT_SYSTEM_PROMPT,
  AI_AUDIT_USER_PROMPT_TEMPLATE,
  getAuditScoreLabel,
} from "./audit-config";


import type {
  HomeServicesIntakeRecord,
  IntakeFinding,
  AiAuditResult,
  AiAuditServiceResult,
  PageSpeedResult,
} from "./types";

// ─── Pure: getScoreLabel ───────────────────────────────────────────────────────

export function getScoreLabel(score: number): string {
  return getAuditScoreLabel(score);
}

// ─── Pure: buildAiAuditPrompt ─────────────────────────────────────────────────

export function buildAiAuditPrompt(
  intake: HomeServicesIntakeRecord,
  websiteContent: string,
  pageSpeedContext: string = "PageSpeed data unavailable."
): { system: string; user: string } {
  const city = intake.masterAddress?.city ?? "Unknown";
  const state = intake.masterAddress?.state ?? "Unknown";
  const goals = intake.primaryGoals?.join(", ") || "Not specified";
  const websiteUrl = intake.website2?.url || intake.website || "Unknown";

  // 4 000 chars covers the full <head> section plus above-the-fold body content on
  // most home-services sites.  Keeping this tight is the single biggest lever
  // for controlling Anthropic output-token count and therefore latency.
  // (8 000 chars drove 2 000+ output tokens and 40+ second completions on real sites.)
  const contentSlice =
    websiteContent.trim().length > 0
      ? websiteContent.slice(0, 4_000)
      : "Website content could not be fetched. Return zero findings and overallScore 0.";

  const marketingLines: string[] = [];

  if (intake.googleAdsActive) {
    const spend = intake.googleAdsSpend ? `$${intake.googleAdsSpend.toLocaleString()}/mo spend` : "active";
    marketingLines.push(`Google Ads: Active (${spend})`);
  } else {
    marketingLines.push("Google Ads: Inactive");
  }

  if (intake.lsaActive) {
    const spend = intake.lsaSpend ? `$${intake.lsaSpend.toLocaleString()}/mo spend` : "active";
    marketingLines.push(`LSA: Active (${spend})`);
  } else {
    marketingLines.push("LSA: Inactive");
  }

  if (intake.metaAdsActive) {
    const spend = intake.metaAdsSpend ? `$${intake.metaAdsSpend.toLocaleString()}/mo spend` : "active";
    marketingLines.push(`Meta Ads: Active (${spend})`);
  } else {
    marketingLines.push("Meta Ads: Inactive");
  }

  if (intake.currentProvider && intake.currentProvider.trim()) {
    marketingLines.push(`Current provider: ${intake.currentProvider}`);
  } else {
    marketingLines.push("Current provider: None");
  }

  const marketingContext = marketingLines.join("\n");

  const user = AI_AUDIT_USER_PROMPT_TEMPLATE
    .replace(/{{BUSINESS_NAME}}/g, intake.businessName || "Unknown")
    .replace(/{{TRADE_TYPE}}/g, intake.tradeType || "Unknown")
    .replace(/{{CITY}}/g, city)
    .replace(/{{STATE}}/g, state)
    .replace(/{{GOALS}}/g, goals)
    .replace(/{{WEBSITE_URL}}/g, websiteUrl)
    .replace(/{{PAGESPEED_CONTEXT}}/g, pageSpeedContext)
    .replace(/{{WEBSITE_CONTENT}}/g, contentSlice)
    .replace(/{{CURRENT_MARKETING_CONTEXT}}/g, marketingContext);

  return { system: AI_AUDIT_SYSTEM_PROMPT, user };
}

// ─── Pure: parseAiAuditResponse ───────────────────────────────────────────────

export function parseAiAuditResponse(
  rawResponse: string,
  websiteUrl: string,
  pageSpeed: PageSpeedResult | null,
  generatedAt: string
): AiAuditResult {
  // Strip accidental markdown fences
  let cleaned = rawResponse.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");

  let parsed: {
    serviceResults?: AiAuditServiceResult[];
    overallScore?: number;
  } = {};

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const errorFinding: IntakeFinding = {
      id: "ai-parse-error",
      category: "Technical SEO",
      severity: "medium",
      title: "Audit Analysis Incomplete",
      description:
        "The AI analysis could not be parsed. The intake-based audit is still available.",
      recommendation:
        "Review the intake audit findings for initial recommendations.",
      source: "intake",
      evidence: "AI response was not valid JSON",
    };
    return {
      websiteUrl,
      pageSpeed,
      serviceResults: [],
      allFindings: [errorFinding],
      overallScore: 0,
      generatedAt,
      aiModel: "claude-sonnet-4-6",
    };
  }

  const serviceResults: AiAuditServiceResult[] = (parsed.serviceResults ?? []).map(
    (sr, sIdx) => {
      const findings: IntakeFinding[] = (sr.findings ?? []).map(
        (f: IntakeFinding, fIdx: number) => ({
          ...f,
          id: f.id || `ai-${sr.serviceId}-${sIdx}-${fIdx}`,
          source: "ai" as const,
        })
      );
      return {
        serviceId: sr.serviceId,
        serviceLabel: sr.serviceLabel,
        findings,
        summary: sr.summary,
        score: sr.score,
        scoreLabel: sr.scoreLabel || getAuditScoreLabel(sr.score),
      };
    }
  );

  const allFindings: IntakeFinding[] = serviceResults.flatMap((sr) => sr.findings);

  return {
    websiteUrl,
    pageSpeed,
    serviceResults,
    allFindings,
    overallScore: typeof parsed.overallScore === "number" ? parsed.overallScore : 0,
    generatedAt,
    aiModel: "claude-sonnet-4-6",
  };
}

// ─── Async: fetchWebsiteContent ───────────────────────────────────────────────
// Server-side helper kept for tests and the API route.
// Do not call this from client components.

export async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8_000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RTM-OS-Sales-Audit/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return "";

    const text = await response.text();
    return text.slice(0, 10_000);
  } catch {
    return "";
  }
}

// ─── Async: runAiAudit ────────────────────────────────────────────────────────
// Called from AiAuditPanel (client component).
// Delegates entirely to POST /api/sales/ai-audit so that:
//   - ANTHROPIC_API_KEY stays server-side only
//   - PageSpeed calls run server-side with proper timeouts
//   - Anthropic headers (x-api-key, anthropic-version) are set correctly

export async function runAiAudit(
  intake: HomeServicesIntakeRecord
): Promise<AiAuditResult> {
  const websiteUrl = intake.website2?.url || intake.website || "";
  const generatedAt = new Date().toISOString();

  try {
    const response = await fetch("/api/sales/ai-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(intake),
    });

    if (!response.ok) {
      throw new Error(`Audit API error: ${response.status}`);
    }

    return (await response.json()) as AiAuditResult;
  } catch (err) {
    const errMsg =
      err instanceof Error ? err.message : "Unknown error during AI audit.";

    const errorFinding: IntakeFinding = {
      id: "ai-runtime-error",
      category: "Technical SEO",
      severity: "medium",
      title: "AI Audit Could Not Complete",
      description: `The AI audit encountered an error: ${errMsg}`,
      recommendation:
        "Use the Intake Audit tab to review findings generated from intake data, or try again.",
      source: "intake",
      evidence: "Client-side fetch to /api/sales/ai-audit failed",
    };

    return {
      websiteUrl,
      pageSpeed: null,
      serviceResults: [],
      allFindings: [errorFinding],
      overallScore: 0,
      generatedAt,
      aiModel: "claude-sonnet-4-6",
    };
  }
}
