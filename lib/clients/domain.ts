// RTM OS — Domain normalisation utility
//
// Business records are keyed by domain. This function produces the canonical
// form used on every write and every lookup so that the same site always maps
// to the same row regardless of how the caller spells it.
//
// Normalisation rules (applied in order):
//   1. Trim surrounding whitespace.
//   2. Lowercase the entire string.
//   3. Strip any URL scheme (https://, http://, ftp://, etc.).
//   4. Strip the www. prefix (one level only — www2. is kept as-is).
//   5. Strip a trailing slash.
//
// Examples:
//   "https://WWW.Company-A.com/"  →  "company-a.com"
//   "HTTP://Example.COM"          →  "example.com"
//   "www.test-co.com"             →  "test-co.com"
//   "company-b.com"               →  "company-b.com"

export function normalizeDomain(raw: string): string {
  let domain = raw.trim().toLowerCase();

  // Strip scheme
  const schemeEnd = domain.indexOf("://");
  if (schemeEnd !== -1) {
    domain = domain.slice(schemeEnd + 3);
  }

  // Strip www. prefix
  if (domain.startsWith("www.")) {
    domain = domain.slice(4);
  }

  // Strip trailing slash
  if (domain.endsWith("/")) {
    domain = domain.slice(0, -1);
  }

  return domain;
}
