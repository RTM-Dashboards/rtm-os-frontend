// lib/dates.ts
//
// Date arithmetic helpers shared across the application.
// All functions operate on plain YYYY-MM-DD strings and use UTC internally
// so that results are identical regardless of where the server runs.

// ── addBusinessDays ───────────────────────────────────────────────────────────
//
// Adds `days` business days (Mon–Fri) to `dateStr` (YYYY-MM-DD).
//
// OFFSET ZERO RULE:
//   An offset of zero means "the start date itself."  If that date happens to
//   fall on a Saturday or Sunday (e.g. a project launched on a weekend, or a
//   prerequisite closed on a weekend), the result is advanced to the following
//   Monday.  Nobody works on weekends, so a task cannot be "due today" on a
//   non-working day.
//
// COUNTING:
//   After normalising to a weekday (the zero step above), each additional day
//   of offset advances by exactly one working day, skipping Saturday and Sunday.
//
// EXAMPLES (all verified in BD3.1):
//   addBusinessDays("2025-01-10", 1) → "2025-01-13"  (Fri + 1 = Mon)
//   addBusinessDays("2025-01-10", 3) → "2025-01-15"  (Fri + 3 = Wed)
//   addBusinessDays("2025-01-06", 5) → "2025-01-13"  (Mon + 5 = Mon)
//   addBusinessDays("2025-01-09", 7) → "2025-01-20"  (Thu + 7 = Mon, 9 days later)
//   addBusinessDays("2025-01-11", 0) → "2025-01-13"  (Sat → Mon)
//   addBusinessDays("2025-01-08", 0) → "2025-01-08"  (Wed → same day)
//
// RECURRENCE INTERVALS are deliberately NOT routed through this function.
// Monthly/weekly recurrence must stay on calendar intervals so that a 30-day
// repeat does not drift to six weeks.  Use plain calendar arithmetic for those.

export function addBusinessDays(dateStr: string, days: number): string {
  // Parse as UTC midnight to avoid local-offset shifts.
  const d = new Date(dateStr + "T00:00:00Z");

  // Step 0: normalise to the next weekday if the start is on a weekend.
  // dow: 0 = Sun, 6 = Sat (UTC).
  let dow = d.getUTCDay();
  if (dow === 6) {
    // Saturday → Monday (+2)
    d.setUTCDate(d.getUTCDate() + 2);
  } else if (dow === 0) {
    // Sunday → Monday (+1)
    d.setUTCDate(d.getUTCDate() + 1);
  }

  // Step N: advance one working day at a time.
  let remaining = days;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) {
      remaining--;
    }
  }

  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}
