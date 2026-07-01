// RTM OS — AI Audit Engine
// ─────────────────────────────────────────────────────────────────────────────
// Pure functions: buildAiAuditPrompt, parseAiAuditResponse, getScoreLabel
// Async API functions: fetchWebsiteContent, fetchPageSpeed, runAiAudit
//
// All prompt templates and scoring thresholds live in audit-config.ts only.
// No prompt strings are hardcoded here.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AI_AUDIT_SYSTEM_PROMPT,
  AI_AUDIT_USER_PROMPT_TEMPLATE,
  PAGESPEED_API_BASE_URL,
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
  websiteContent: string
): { system: string; user: string } {
  const city = intake.masterAddress?.city ?? "Unknown";
  const state = intake.masterAddress?.state ?? "Unknown";
  const goals = intake.primaryGoals?.join(", ") || "Not specified";
  const websiteUrl = intake.website2?.url || intake.website || "Unknown";

  const contentSlice =
    websiteContent.trim().length > 0
      ? websiteContent.slice(0, 8000)
      : "Website content could not be fetched. Analyze based on business context only.";

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

  // Add PageSpeed-derived findings
  if (pageSpeed !== null) {
    const mobile = pageSpeed.mobileScore;

    if (mobile < 50) {
      allFindings.push({
        id: "ai-pagespeed-critical",
        category: "Website Performance",
        severity: "critical",
        title: "Critical Mobile Performance Issues",
        description: `Mobile PageSpeed score is ${mobile}/100 — critically slow load times will cause high bounce rates on mobile.`,
        recommendation:
          "Optimize images, reduce render-blocking scripts, implement lazy loading, and consider a CDN.",
        source: "ai",
      });
    } else if (mobile <= 70) {
      allFindings.push({
        id: "ai-pagespeed-high",
        category: "Website Performance",
        severity: "high",
        title: "Poor Mobile Performance",
        description: `Mobile PageSpeed score is ${mobile}/100 — slow mobile load times are negatively impacting rankings and user experience.`,
        recommendation:
          "Optimize images to WebP format, defer non-critical scripts, and enable browser caching to improve mobile load speed.",
        source: "ai",
      });
    } else if (mobile <= 85) {
      allFindings.push({
        id: "ai-pagespeed-medium",
        category: "Website Performance",
        severity: "medium",
        title: "Mobile Performance Needs Improvement",
        description: `Mobile PageSpeed score is ${mobile}/100 — there are optimization opportunities that can improve rankings and conversion rates.`,
        recommendation:
          "Review PageSpeed Insights recommendations to address remaining performance opportunities.",
        source: "ai",
      });
    }
  }

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

export async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "RTM-OS-Sales-Audit/1.0",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return "";

    const text = await response.text();
    return text.slice(0, 10000);
  } catch {
    return "";
  }
}

// ─── Async: fetchPageSpeed ─────────────────────────────────────────────────────

export async function fetchPageSpeed(
  url: string
): Promise<PageSpeedResult | null> {
  try {
    const mobileUrl = `${PAGESPEED_API_BASE_URL}?url=${encodeURIComponent(url)}&strategy=mobile&category=PERFORMANCE`;
    const desktopUrl = `${PAGESPEED_API_BASE_URL}?url=${encodeURIComponent(url)}&strategy=desktop&category=PERFORMANCE`;

    const [mobileResult, desktopResult] = await Promise.allSettled([
      fetch(mobileUrl).then((r) => r.json()),
      fetch(desktopUrl).then((r) => r.json()),
    ]);

    // Extract mobile data
    let mobileScore = 0;
    let lcp = "N/A";
    let cls = "N/A";
    let fid = "N/A";
    const opportunities: string[] = [];

    if (mobileResult.status === "fulfilled" && mobileResult.value?.lighthouseResult) {
      const lr = mobileResult.value.lighthouseResult;
      mobileScore = Math.round((lr.categories?.performance?.score ?? 0) * 100);
      lcp = lr.audits?.["largest-contentful-paint"]?.displayValue ?? "N/A";
      cls = lr.audits?.["cumulative-layout-shift"]?.displayValue ?? "N/A";
      fid = lr.audits?.["total-blocking-time"]?.displayValue ?? "N/A";

      // Top 3 opportunities
      const audits = lr.audits ?? {};
      for (const [key, audit] of Object.entries(audits) as [string, Record<string, unknown>][]) {
        if (
          typeof audit.score === "number" &&
          audit.score < 0.9 &&
          audit.details &&
          opportunities.length < 3
        ) {
          const title = typeof audit.title === "string" ? audit.title : key;
          opportunities.push(title);
        }
      }
    }

    // Extract desktop score
    let desktopScore = 0;
    let performanceScore = mobileScore;

    if (desktopResult.status === "fulfilled" && desktopResult.value?.lighthouseResult) {
      const lr = desktopResult.value.lighthouseResult;
      desktopScore = Math.round((lr.categories?.performance?.score ?? 0) * 100);
      performanceScore = Math.round((mobileScore + desktopScore) / 2);
    }

    return {
      url,
      performanceScore,
      mobileScore,
      desktopScore,
      lcp,
      cls,
      fid,
      opportunities,
      fetchedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

// ─── Async: runAiAudit ────────────────────────────────────────────────────────

export async function runAiAudit(
  intake: HomeServicesIntakeRecord
): Promise<AiAuditResult> {
  const websiteUrl = intake.website2?.url || intake.website || "";
  const generatedAt = new Date().toISOString();

  try {
    // Step 1: Fetch website content and PageSpeed in parallel
    const [websiteContentResult, pageSpeedResult] = await Promise.allSettled([
      fetchWebsiteContent(websiteUrl),
      fetchPageSpeed(websiteUrl),
    ]);

    const websiteContent =
      websiteContentResult.status === "fulfilled"
        ? websiteContentResult.value
        : "";
    const pageSpeed =
      pageSpeedResult.status === "fulfilled" ? pageSpeedResult.value : null;

    // Step 2: Build prompt
    const { system, user } = buildAiAuditPrompt(intake, websiteContent);

    // Step 3: Call Anthropic API
    // Headers do NOT include anthropic-version or x-api-key
    // The environment proxy handles authentication automatically
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();

    // Step 4: Extract response text
    const text: string = data?.content?.[0]?.text ?? "";

    // Step 5: Parse and return
    return parseAiAuditResponse(text, websiteUrl, pageSpeed, generatedAt);
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
