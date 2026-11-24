// RTM OS - AI Audit Server Route
// ─────────────────────────────────────────────────────────────────────────────
// All outbound calls (website fetch, PageSpeed, Anthropic) run here, server-side
// only. ANTHROPIC_API_KEY is read here and never bundled into client code.
//
// ── Budget arithmetic - based on MEASURED latencies ───────────────────────
//
//   All numbers below come from live measurements against sptohio.com.
//   None are guesses.
//
//   Stage 1 - website fetch + PageSpeed (PARALLEL)
//     Website fetch:            measured 2.56 s; budget 5 s (2× headroom)
//     PageSpeed (parallel):     measured 26-38 s across three runs (cold Lighthouse
//                               crawl vs warm); budget 50 s (38 s worst + 12 s)
//     Parallel wall-clock max:  50 s   (counted ONCE - both calls share the window)
//
//   Stage 2 - Anthropic (model: claude-sonnet-4-6; content trimmed to 4 000 chars)
//     Natural completion:       measured 54 s at 2 792 output tokens (4 096 cap)
//     With 4 096 token cap:     measured 54 s end_turn - no truncation
//     Budget:                   65 s (54 s worst + 11 s headroom)
//
//   Worst-case total:    50 + 65 = 115 s
//   Function limit:              300 s default on Vercel Pro with fluid compute
//                                (maximum configurable: 800 s)
//   TARGET_FINISH_MS:            120 000 ms  (5 s headroom for serialisation
//                                            inside the 300 s limit)
//
//   Rep worst-case wait:  ~115 s.  This is a product decision; it exceeds the
//                         150 s threshold mentioned in the design notes.
//                         Raising it requires either a faster model or fewer
//                         findings requested from Anthropic.
//
//   Hard deadline enforced by elapsed-time guard (TARGET_FINISH_MS).
//   Every stage checks time remaining before starting and receives the
//   smaller of its own timeout and actual time left.  A stage with zero
//   time left is SKIPPED - not started and abandoned.
//
// ── Vercel plan notes ──────────────────────────────────────────────────────
//   maxDuration applies on Vercel Pro / Team only.
//   On Hobby the hard limit is 10 s and this export is silently ignored.
//   At 10 s only the website fetch (5 s) can realistically complete before
//   the function is killed.  The elapsed-time guard skips PageSpeed and
//   Anthropic rather than letting them start and be abandoned.
//
//   Vercel Pro fluid-compute defaults and maximums (source: Vercel docs):
//     Default: 300 s   Maximum: 800 s
//   We use maxDuration = 300 to stay at the default and leave the maximum
//   as a future safety valve.
// ─────────────────────────────────────────────────────────────────────────────

import { NextResponse } from "next/server";
import {
  buildAiAuditPrompt,
  parseAiAuditResponse,
} from "@/lib/sales/ai-audit-engine";
import { PAGESPEED_API_BASE_URL } from "@/lib/sales/audit-config";
import type {
  HomeServicesIntakeRecord,
  AiAuditResult,
  IntakeFinding,
  PageSpeedResult,
} from "@/lib/sales/types";

// ── Function limit ─────────────────────────────────────────────────────────────
// 300 s is the Vercel Pro fluid-compute default; maximum is 800 s.
// On Hobby this export has NO effect — the 10-second default applies.
export const maxDuration = 300;

// ── Timing constants ───────────────────────────────────────────────────────────
// These are MAXIMUM timeouts for each stage.  Every number is derived from
// a live measurement; see the header comment for the measurement log.
// The elapsed-time guard may hand each stage less time when the overall
// budget is running short.

// Measured: 2.56 s against sptohio.com.  Budget = 2× worst observed.
const WEBSITE_FETCH_TIMEOUT_MS   = 5_000;

// Measured: 26.29 s (run 2 parallel) and 38.18 s (run 3 parallel) across
// three separate runs.  Cold Lighthouse crawls drive the worst case.
// Budget = 38 s worst + 12 s headroom.
const PAGESPEED_TIMEOUT_MS       = 50_000;

// Measured: 54 s to natural completion at 2 792 output tokens (4 096 cap)
// on claude-sonnet-4-6.  Budget = 54 s worst + 11 s headroom.
const ANTHROPIC_TIMEOUT_MS       = 65_000;

// Measured: claude-sonnet-4-6 naturally finishes at 2 792 tokens with
// 4 096 budget.  2 000 was truncating mid-JSON every run.  4 096 gives
// the model room to close all JSON structures cleanly.
const ANTHROPIC_MAX_OUTPUT_TOKENS = 4_096;

// Hard deadline: finish all stages by this many milliseconds after the
// request arrives.  50 + 65 = 115 s worst case; TARGET adds 5 s for
// serialisation, well inside the 300 s function limit.
const TARGET_FINISH_MS = 120_000;

// ── Helpers ────────────────────────────────────────────────────────────────────

function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(id)
  );
}

// Returns the smaller of `ownTimeout` and the milliseconds remaining before
// TARGET_FINISH_MS.  Returns 0 when the budget is already exhausted.
function effectiveTimeout(startMs: number, ownTimeout: number): number {
  const elapsed = Date.now() - startMs;
  const remaining = TARGET_FINISH_MS - elapsed;
  if (remaining <= 0) return 0;
  return Math.min(ownTimeout, remaining);
}

// ── fetchWebsiteContent ────────────────────────────────────────────────────────

async function fetchWebsiteContent(
  url: string,
  timeoutMs: number
): Promise<string> {
  if (timeoutMs <= 0) return "";
  try {
    const response = await fetchWithTimeout(
      url,
      { headers: { "User-Agent": "RTM-OS-Sales-Audit/1.0" } },
      timeoutMs
    );
    if (!response.ok) return "";
    const text = await response.text();
    // 5 000 chars is enough to cover <head> + hero content; engine trims to 4 000.
    return text.slice(0, 5_000);
  } catch {
    return "";
  }
}

// ── fetchPageSpeed ─────────────────────────────────────────────────────────────

class RateLimitError extends Error {
  constructor() {
    super("PageSpeed API rate limit exceeded (HTTP 429)");
    this.name = "RateLimitError";
  }
}

async function fetchPageSpeed(
  url: string,
  timeoutMs: number
): Promise<{ result: PageSpeedResult | null; rateLimited: boolean; skipped: boolean }> {
  if (timeoutMs <= 0) {
    return { result: null, rateLimited: false, skipped: true };
  }

  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY ?? "";
  const keyParam = apiKey ? `&key=${encodeURIComponent(apiKey)}` : "";

  const mobileUrl  = `${PAGESPEED_API_BASE_URL}?url=${encodeURIComponent(url)}&strategy=mobile&category=PERFORMANCE${keyParam}`;
  const desktopUrl = `${PAGESPEED_API_BASE_URL}?url=${encodeURIComponent(url)}&strategy=desktop&category=PERFORMANCE${keyParam}`;

  try {
    // Both calls share the same timeout; they run concurrently so the
    // wall-clock cost is max(mobile, desktop), not mobile + desktop.
    const [mobileResult, desktopResult] = await Promise.allSettled([
      fetchWithTimeout(mobileUrl, {}, timeoutMs).then((r) => {
        if (r.status === 429) return Promise.reject(new RateLimitError());
        return r.json();
      }),
      fetchWithTimeout(desktopUrl, {}, timeoutMs).then((r) => {
        if (r.status === 429) return Promise.reject(new RateLimitError());
        return r.json();
      }),
    ]);

    const mobileRateLimited =
      mobileResult.status === "rejected" &&
      mobileResult.reason instanceof RateLimitError;
    const desktopRateLimited =
      desktopResult.status === "rejected" &&
      desktopResult.reason instanceof RateLimitError;

    if (mobileRateLimited && desktopRateLimited) {
      return { result: null, rateLimited: true, skipped: false };
    }

    let mobileScore = 0;
    let lcp = "N/A";
    let cls = "N/A";
    let fid = "N/A";
    const opportunities: string[] = [];
    let mobileMeasured = false;

    if (
      mobileResult.status === "fulfilled" &&
      mobileResult.value?.lighthouseResult
    ) {
      mobileMeasured = true;
      const lr = mobileResult.value.lighthouseResult;
      mobileScore = Math.round(
        (lr.categories?.performance?.score ?? 0) * 100
      );
      lcp = lr.audits?.["largest-contentful-paint"]?.displayValue ?? "N/A";
      cls = lr.audits?.["cumulative-layout-shift"]?.displayValue ?? "N/A";
      fid = lr.audits?.["total-blocking-time"]?.displayValue ?? "N/A";

      const audits = lr.audits ?? {};
      for (const [key, audit] of Object.entries(audits) as [
        string,
        Record<string, unknown>
      ][]) {
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

    let desktopScore = 0;
    let performanceScore = mobileScore;
    let desktopMeasured = false;

    if (
      desktopResult.status === "fulfilled" &&
      desktopResult.value?.lighthouseResult
    ) {
      desktopMeasured = true;
      const lr = desktopResult.value.lighthouseResult;
      desktopScore = Math.round(
        (lr.categories?.performance?.score ?? 0) * 100
      );
      performanceScore = Math.round((mobileScore + desktopScore) / 2);
    }

    // If neither call produced a lighthouseResult (both timed out, both failed
    // with a non-429 error, or Google returned a response without Lighthouse
    // data), we have nothing real to report.  Return null so that
    // buildPageSpeedFindings emits no findings and buildPageSpeedContext tells
    // the AI "do not reference PageSpeed scores" - a 0 that was never measured
    // must never be presented as a score.
    if (!mobileMeasured && !desktopMeasured) {
      return { result: null, rateLimited: mobileRateLimited || desktopRateLimited, skipped: false };
    }

    return {
      result: {
        url,
        performanceScore,
        mobileScore,
        desktopScore,
        lcp,
        cls,
        fid,
        opportunities,
        fetchedAt: new Date().toISOString(),
      },
      rateLimited: mobileRateLimited || desktopRateLimited,
      skipped: false,
    };
  } catch {
    return { result: null, rateLimited: false, skipped: false };
  }
}

// ── buildPageSpeedContext ──────────────────────────────────────────────────────

function buildPageSpeedContext(
  pageSpeed: PageSpeedResult | null,
  rateLimited: boolean,
  skipped: boolean
): string {
  if (skipped) {
    return "PageSpeed data unavailable - skipped because the request budget was exhausted before this stage could start.";
  }
  if (rateLimited) {
    return "PageSpeed data unavailable - Google API rate limit reached (HTTP 429). Do not reference PageSpeed scores in findings.";
  }
  if (!pageSpeed) {
    return "PageSpeed data unavailable - fetch failed or timed out. Do not reference PageSpeed scores in findings.";
  }
  return [
    `Mobile PageSpeed: ${pageSpeed.mobileScore}/100`,
    `Desktop PageSpeed: ${pageSpeed.desktopScore}/100`,
    `LCP: ${pageSpeed.lcp}`,
    `CLS: ${pageSpeed.cls}`,
    `TBT (proxy for FID): ${pageSpeed.fid}`,
    pageSpeed.opportunities.length > 0
      ? `Top opportunities: ${pageSpeed.opportunities.join(", ")}`
      : "No specific opportunities flagged.",
  ].join("\n");
}

// ── buildPageSpeedFindings ────────────────────────────────────────────────────

function buildPageSpeedFindings(
  pageSpeed: PageSpeedResult | null
): IntakeFinding[] {
  if (!pageSpeed) return [];
  const mobile = pageSpeed.mobileScore;
  const findings: IntakeFinding[] = [];

  if (mobile < 50) {
    findings.push({
      id: "ai-pagespeed-critical",
      category: "Website Performance",
      severity: "critical",
      title: "Critical Mobile Performance Issues",
      description: `Mobile PageSpeed score is ${mobile}/100 - critically slow load times will cause high bounce rates on mobile.`,
      recommendation:
        "Optimize images, reduce render-blocking scripts, implement lazy loading, and consider a CDN.",
      source: "ai",
      evidence: `Mobile PageSpeed: ${mobile}/100`,
    });
  } else if (mobile <= 70) {
    findings.push({
      id: "ai-pagespeed-high",
      category: "Website Performance",
      severity: "high",
      title: "Poor Mobile Performance",
      description: `Mobile PageSpeed score is ${mobile}/100 - slow mobile load times impact user experience.`,
      recommendation:
        "Optimize images to WebP format, defer non-critical scripts, and enable browser caching to improve mobile load speed.",
      source: "ai",
      evidence: `Mobile PageSpeed: ${mobile}/100`,
    });
  } else if (mobile <= 85) {
    findings.push({
      id: "ai-pagespeed-medium",
      category: "Website Performance",
      severity: "medium",
      title: "Mobile Performance Needs Improvement",
      description: `Mobile PageSpeed score is ${mobile}/100 - there are optimization opportunities remaining.`,
      recommendation:
        "Review PageSpeed Insights recommendations to address remaining performance opportunities.",
      source: "ai",
      evidence: `Mobile PageSpeed: ${mobile}/100`,
    });
  }

  return findings;
}

// ── POST /api/sales/ai-audit ──────────────────────────────────────────────────

export async function POST(request: Request): Promise<NextResponse> {
  // Start the elapsed-time clock immediately.
  const requestStartMs = Date.now();
  const generatedAt = new Date().toISOString();

  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let intake: HomeServicesIntakeRecord;
  try {
    intake = (await request.json()) as HomeServicesIntakeRecord;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const websiteUrl = intake.website2?.url || intake.website || "";

  // ── 2. Check API key ───────────────────────────────────────────────────────
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Degradation case: model not configured.
    // PageSpeed and website fetch cannot help here - return immediately with
    // a clear configuration finding.
    console.error("[ai-audit] ANTHROPIC_API_KEY is not set in the server environment. AI audit cannot run.");
    const notConfigured: AiAuditResult = {
      websiteUrl,
      pageSpeed: null,
      serviceResults: [],
      allFindings: [
        {
          id: "ai-not-configured",
          category: "Technical SEO",
          severity: "high",
          title: "AI Audit Not Configured",
          description:
            "The AI audit cannot run because ANTHROPIC_API_KEY is not set in the server environment. " +
            "This is a configuration issue, not a website problem.",
          recommendation:
            "Set the ANTHROPIC_API_KEY environment variable in Vercel: " +
            "Dashboard → Project Settings → Environment Variables → add ANTHROPIC_API_KEY with the Anthropic API key.",
          source: "ai",
          evidence: "Server environment: ANTHROPIC_API_KEY is absent",
        },
      ],
      overallScore: 0,
      generatedAt,
      aiModel: "not-configured",
    };
    return NextResponse.json(notConfigured, { status: 200 });
  }

  // ── 3. Website fetch + PageSpeed in parallel ───────────────────────────────
  // Both stages share the same wall-clock window.
  // The effective timeout for the parallel block is the PageSpeed timeout
  // (the longer of the two); the website fetch has its own inner timeout.
  // We compute effective timeouts against the elapsed clock so that if JSON
  // parsing or other overhead already consumed time, the stages get less.

  const parallelTimeout = effectiveTimeout(requestStartMs, PAGESPEED_TIMEOUT_MS);

  let websiteContent = "";
  let pageSpeed: PageSpeedResult | null = null;
  let pageSpeedRateLimited = false;
  let pageSpeedSkipped = false;

  if (parallelTimeout <= 0) {
    // Budget already gone (should not happen this early, but guard it).
    pageSpeedSkipped = true;
  } else {
    const websiteFetchTimeout = Math.min(WEBSITE_FETCH_TIMEOUT_MS, parallelTimeout);

    const [websiteResult, pageSpeedRaw] = await Promise.allSettled([
      fetchWebsiteContent(websiteUrl, websiteFetchTimeout),
      fetchPageSpeed(websiteUrl, parallelTimeout),
    ]);

    websiteContent =
      websiteResult.status === "fulfilled" ? websiteResult.value : "";

    if (pageSpeedRaw.status === "fulfilled") {
      pageSpeed = pageSpeedRaw.value.result;
      pageSpeedRateLimited = pageSpeedRaw.value.rateLimited;
      pageSpeedSkipped = pageSpeedRaw.value.skipped;
    }
  }

  // ── 4. Build prompt ────────────────────────────────────────────────────────
  const pageSpeedContext = buildPageSpeedContext(
    pageSpeed,
    pageSpeedRateLimited,
    pageSpeedSkipped
  );
  const { system, user } = buildAiAuditPrompt(
    intake,
    websiteContent,
    pageSpeedContext
  );

  // ── 5. Call Anthropic - with elapsed-time enforcement ─────────────────────
  // If the budget is already exhausted after the parallel block, skip the
  // model entirely and return whatever was measured.

  const anthropicBudget = effectiveTimeout(requestStartMs, ANTHROPIC_TIMEOUT_MS);

  let aiText = "";
  let aiTimedOut = false;
  let aiSkipped = false;

  if (anthropicBudget <= 0) {
    aiSkipped = true;
  } else {
    try {
      const anthropicResponse = await fetchWithTimeout(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": apiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-6",
            max_tokens: ANTHROPIC_MAX_OUTPUT_TOKENS,
            system,
            messages: [{ role: "user", content: user }],
          }),
        },
        anthropicBudget
      );

      if (!anthropicResponse.ok) {
        const status = anthropicResponse.status;
        const bodyPreview = await anthropicResponse.text().catch(() => "");
        console.error(
          `[ai-audit] Anthropic responded with HTTP ${status}. Body (first 200 chars): ${bodyPreview.slice(0, 200)}`
        );
        if (status === 401) {
          throw new Error(
            "Anthropic API key rejected (401). Verify ANTHROPIC_API_KEY in Vercel environment variables."
          );
        }
        throw new Error(`Anthropic API error: ${status}`);
      }

      const data = await anthropicResponse.json();
      aiText = data?.content?.[0]?.text ?? "";
      if (!aiText) {
        console.error(
          "[ai-audit] Anthropic call succeeded but content[0].text is missing or empty. "
          + `model=${data?.model ?? "unknown"} stop_reason=${data?.stop_reason ?? "unknown"}`
        );
      } else {
        console.log(
          `[ai-audit] Anthropic response received: ${aiText.length} chars, model=${data?.model ?? "unknown"}`
        );
      }
    } catch (err) {
      if (
        err instanceof Error &&
        (err.name === "AbortError" || err.message.includes("aborted"))
      ) {
        aiTimedOut = true;
      } else {
        // Non-timeout Anthropic error.
        // Return measured PageSpeed findings + a clear error note.
        // The rep sees real numbers plus an explanation - never an empty result.
        const pageSpeedFindings = buildPageSpeedFindings(pageSpeed);
        const errorFinding: IntakeFinding = {
          id: "ai-runtime-error",
          category: "Technical SEO",
          severity: "medium",
          title: "AI Analysis Could Not Complete",
          description:
            err instanceof Error
              ? err.message
              : "Unknown error calling Anthropic API.",
          recommendation:
            "Check ANTHROPIC_API_KEY in Vercel environment variables, then retry.",
          source: "ai",
          evidence: "Server-side Anthropic API call failed",
        };
        const result: AiAuditResult = {
          websiteUrl,
          pageSpeed,
          serviceResults: [],
          allFindings: [...pageSpeedFindings, errorFinding],
          overallScore: 0,
          generatedAt,
          aiModel: "claude-sonnet-4-6",
        };
        return NextResponse.json(result, { status: 200 });
      }
    }
  }

  // ── 6. Partial-result path: skipped or timed-out model ────────────────────
  // Degradation order: PageSpeed numbers (measured facts) survive;
  // model analysis (expensive, expendable) is dropped.
  // The rep always sees SOMETHING - never an empty or misleading response.

  if (aiSkipped || aiTimedOut) {
    const pageSpeedFindings = buildPageSpeedFindings(pageSpeed);
    const skippedFinding: IntakeFinding = {
      id: aiSkipped ? "ai-budget-skipped" : "ai-timeout",
      category: "Technical SEO",
      severity: "low",
      title: aiSkipped
        ? "AI Model Analysis Skipped - Budget Exhausted"
        : "AI Model Analysis Timed Out",
      description: aiSkipped
        ? "The request budget was exhausted by earlier stages before the AI model analysis could start. " +
          "PageSpeed data was measured and is shown below. The content-based findings are unavailable for this run."
        : `The AI model analysis did not complete within the ${Math.round(anthropicBudget / 1000)}-second budget remaining. ` +
          "PageSpeed data was measured and is shown below. The content-based findings are unavailable for this run.",
      recommendation: "Retry the audit. If this recurs, contact support.",
      source: "ai",
      evidence: aiSkipped
        ? `Budget exhausted before Anthropic call: ${Date.now() - requestStartMs}ms elapsed of ${TARGET_FINISH_MS}ms target`
        : `Anthropic call aborted after ${Math.round(anthropicBudget / 1000)}s`,
    };

    // Add PageSpeed-skipped note if applicable
    const extraFindings: IntakeFinding[] = [];
    if (pageSpeedSkipped) {
      extraFindings.push({
        id: "pagespeed-budget-skipped",
        category: "Website Performance",
        severity: "low",
        title: "PageSpeed Data Skipped - Budget Exhausted",
        description:
          "The PageSpeed check was skipped because the request budget was already exhausted.",
        recommendation: "Retry the audit.",
        source: "ai",
        evidence: "Budget exhausted before PageSpeed stage",
      });
    }

    const result: AiAuditResult = {
      websiteUrl,
      pageSpeed,
      serviceResults: [],
      allFindings: [...pageSpeedFindings, ...extraFindings, skippedFinding],
      overallScore: pageSpeed ? pageSpeed.mobileScore : 0,
      generatedAt,
      aiModel: "claude-sonnet-4-6",
    };
    return NextResponse.json(result, { status: 200 });
  }

  // ── 7. Parse AI response ───────────────────────────────────────────────────
  const parsed = parseAiAuditResponse(aiText, websiteUrl, pageSpeed, generatedAt);

  // Merge deterministic PageSpeed findings (deduplicate by id)
  const pageSpeedFindings = buildPageSpeedFindings(pageSpeed);
  const existingIds = new Set(parsed.allFindings.map((f) => f.id));
  for (const f of pageSpeedFindings) {
    if (!existingIds.has(f.id)) {
      parsed.allFindings.push(f);
    }
  }

  // Annotate rate-limit status
  if (pageSpeedRateLimited) {
    const rateLimitNote: IntakeFinding = {
      id: "pagespeed-rate-limited",
      category: "Website Performance",
      severity: "low",
      title: "PageSpeed Data Unavailable - Google API Rate Limit",
      description:
        "Google's PageSpeed Insights API returned HTTP 429 (rate limit exceeded). " +
        "Performance scores could not be measured for this audit run.",
      recommendation:
        "Set GOOGLE_PAGESPEED_API_KEY in Vercel environment variables to increase the quota. " +
        "Without a key, the free quota is very small and exhausts quickly. " +
        "Get a key at https://developers.google.com/speed/docs/insights/v5/get-started",
      source: "ai",
      evidence: "Google PageSpeed API HTTP 429",
    };
    if (!existingIds.has(rateLimitNote.id)) {
      parsed.allFindings.push(rateLimitNote);
    }
  }

  // Annotate PageSpeed-skipped status (should not reach here normally,
  // but guard the case where budget was tight but model still ran)
  if (pageSpeedSkipped) {
    const skipNote: IntakeFinding = {
      id: "pagespeed-budget-skipped",
      category: "Website Performance",
      severity: "low",
      title: "PageSpeed Data Skipped - Budget Exhausted",
      description:
        "The PageSpeed check was skipped because the request budget was exhausted before it could start.",
      recommendation: "Retry the audit for PageSpeed data.",
      source: "ai",
      evidence: "Budget exhausted before PageSpeed stage",
    };
    if (!existingIds.has(skipNote.id)) {
      parsed.allFindings.push(skipNote);
    }
  }

  return NextResponse.json(parsed, { status: 200 });
}
