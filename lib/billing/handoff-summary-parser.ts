// RTM OS — Handoff Summary Field Parser
// lib/billing/handoff-summary-parser.ts
//
// Extracts four typed billing values from a HandoffRecord's summaryFields map.
// Called on every POST and PATCH to the sales-handoffs route so that Billing's
// typed columns stay in sync with the display-oriented summaryFields.
//
// Parsing rules:
//   monthly-recurring-revenue  "$3,800/mo"  → 380000 (cents, strip $, commas, /mo)
//   setup-fees                 "$0"         → 0      (cents, strip $, commas)
//   payment-terms              "Net 15"     → "Net 15" (verbatim string)
//   term-length                "12 months"  → 12     (leading integer)
//
// NULL semantics: if a key is absent, the value is empty, or the parse
// produces NaN, the result is null — never 0 as a substitute for unknown.
// NULL means "Billing must enter this manually."

export interface ParsedBillingFields {
  monthlyValueCents: number | null;
  setupFeeCents:     number | null;
  paymentTerms:      string | null;
  termLengthMonths:  number | null;
}

/**
 * Parse a dollar-amount string into integer cents.
 *
 * Accepts: "$3,800/mo", "$500", "$0", "3800"
 * Returns: integer cents, or null if the value is absent / unparseable.
 *
 * Steps:
 *   1. Trim whitespace.
 *   2. Strip trailing "/mo" (case-insensitive).
 *   3. Strip leading "$".
 *   4. Strip commas.
 *   5. parseFloat — if NaN, return null.
 *   6. Multiply by 100 and round to integer cents.
 */
function parseCents(raw: string | undefined | null): number | null {
  if (raw === undefined || raw === null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  let s = trimmed;
  // Strip /mo suffix (case-insensitive)
  s = s.replace(/\/mo$/i, "").trim();
  // Strip leading $
  s = s.replace(/^\$/, "");
  // Strip commas
  s = s.replace(/,/g, "");

  const amount = parseFloat(s);
  if (isNaN(amount)) return null;
  return Math.round(amount * 100);
}

/**
 * Parse a payment-terms string.
 *
 * Returns the trimmed string verbatim, or null if absent / empty.
 */
function parsePaymentTerms(raw: string | undefined | null): string | null {
  if (raw === undefined || raw === null) return null;
  const trimmed = raw.trim();
  return trimmed === "" ? null : trimmed;
}

/**
 * Parse a term-length string into an integer number of months.
 *
 * Accepts: "12 months", "6", "24 months", "1 month"
 * Returns: the leading integer, or null if absent / unparseable.
 */
function parseTermLengthMonths(raw: string | undefined | null): number | null {
  if (raw === undefined || raw === null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  // Extract leading integer (may be followed by " months", " month", etc.)
  const match = /^(\d+)/.exec(trimmed);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return isNaN(n) ? null : n;
}

/**
 * Parse four typed billing values out of a handoff summaryFields map.
 *
 * @param summaryFields  Record<string, string> from HandoffRecord.summaryFields.
 *                       May be an unknown JSON value from Postgres; we coerce
 *                       defensively and treat non-string field values as absent.
 */
export function parseBillingFields(
  summaryFields: unknown
): ParsedBillingFields {
  // Defensively coerce: if it's not a plain object, treat all fields as absent.
  const fields =
    summaryFields !== null &&
    typeof summaryFields === "object" &&
    !Array.isArray(summaryFields)
      ? (summaryFields as Record<string, unknown>)
      : {};

  const get = (key: string): string | null => {
    const v = fields[key];
    return typeof v === "string" ? v : null;
  };

  return {
    monthlyValueCents: parseCents(get("monthly-recurring-revenue")),
    setupFeeCents:     parseCents(get("setup-fees")),
    paymentTerms:      parsePaymentTerms(get("payment-terms")),
    termLengthMonths:  parseTermLengthMonths(get("term-length")),
  };
}
