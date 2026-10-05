// RTM OS — Invoice Document Route
//
// GET /api/invoices/[id]/document
//
// Returns the invoice as a styled HTML page the browser can print to PDF.
// This is the delivery mechanism for client-facing invoices, replacing the
// previous Stripe-generated PDF flow.
//
// DATA ASSEMBLED:
//   Invoice      — the record itself (amounts, dates, line items, status)
//   Client       — fullName, company, email, phone, address
//   Business     — domain, displayName
//   SalesHandoff — paymentTerms (via invoice.salesHandoffId)
//   company_config — RTM's legal name, address, phone, supportEmail, logoUrl,
//                    taxExemptionText, refundFooter
//   bank_details — accountHolder, bankName, routingNumber, accountNumber,
//                  swiftCode (rendered as a second-page transfer block)
//
// PAYMENT TERMS DECISION:
//   Payment terms live on SalesHandoff and Contract, NOT on Invoice.
//   Invoice carries salesHandoffId. We join through it to get paymentTerms.
//   If salesHandoffId is null (invoice created without a handoff) or the
//   handoff has no paymentTerms, the payment terms section is omitted.
//   Joining through Contract instead was considered but rejected: the
//   Contract is not directly referenced by Invoice, making the join
//   two hops (Invoice → Handoff → Contract). Since the Handoff itself
//   carries paymentTerms (copied from the Contract at handoff creation),
//   one hop (Invoice → Handoff) is sufficient and authoritative.
//
// AUTH:
//   Manager or higher. Invoices are client financial documents.
//   GET /api/invoices is any active user, but this route renders a full
//   client-addressed document with address and amounts — it is more
//   sensitive than a list query. Manager is the role that owns invoice
//   operations in this codebase (POST and PATCH are also Manager).
//   A Member can see invoice status in lists; they should not produce
//   a renderable client document.
//
// BANK TRANSFER BLOCK:
//   The second page of the invoice shows RTM's wire transfer details when
//   bank_details has a row. When no row exists, or all fields are empty,
//   the block is omitted entirely. The reference line uses the invoice number.
//
// PRINT LAYOUT:
//   @media print rules suppress the browser chrome and set A4 margins.
//   Page breaks are avoided inside line item table rows.
//   The page itself uses max-width 800px so screen preview is readable
//   without scrolling horizontally.
//
// ABSENT FIELDS:
//   Omitted, not rendered as empty:
//     - period (periodStart / periodEnd) — absent on all current invoices
//     - payment link (paymentLink) — null today
//     - client phone — optional on the Client record
//     - client email — optional on the Client record
//     - client address — JSON nullable; each component checked individually
//     - company_config defaultPaymentTerms — empty string today; omitted if empty
//     - handoff paymentTerms — null if no handoff or no terms set
//   These are documented in the element-by-element check in R4.
//
// AMOUNTS:
//   All amounts come from the Invoice record directly.
//   The subtotal, tax line, total, and amount-due come from the invoice's
//   own fields (contractAmountCents, setupFeeCents, monthlyValueCents).
//   We do NOT re-sum the line items to derive the total — per the spec,
//   if lines do not sum to the stated total, that is real and must not be
//   hidden. The line items are rendered for transparency; the stated amounts
//   from the invoice record are authoritative.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser, requireRole } from "@/lib/auth";

// ── Money formatter (mirrors formatCents in billing/page.tsx) ─────────────────

function formatCents(cents: number): string {
  const dollars = cents / 100;
  return `$${dollars.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

// ── Date formatter ────────────────────────────────────────────────────────────

function fmtDate(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const date = typeof d === "string" ? new Date(d) : d;
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// ── HTML escape ───────────────────────────────────────────────────────────────

function esc(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ── Line item type (BudgetLineItem shape from the handoff / invoice) ──────────

interface BudgetLineItem {
  serviceId?:      string;
  label?:          string;
  department?:     string;
  quantity?:       number;
  unitMonthlyPrice?: number;
  setupFee?:       number;
  monthlySubtotal?: number;
  setupSubtotal?:  number;
  isRecurring?:    boolean;
}

// ── Address helper ────────────────────────────────────────────────────────────

interface MasterAddress {
  street?:  string;
  suite?:   string;
  city?:    string;
  state?:   string;
  zip?:     string;
  country?: string;
}

function renderAddress(addr: MasterAddress | null | undefined): string {
  if (!addr || typeof addr !== "object") return "";
  const parts: string[] = [];
  if (addr.street?.trim()) parts.push(esc(addr.street.trim()));
  if (addr.suite?.trim())  parts.push(esc(addr.suite.trim()));
  const cityLine = [addr.city, addr.state, addr.zip].filter(Boolean).map(s => esc(s!.trim())).join(", ");
  if (cityLine) parts.push(cityLine);
  if (addr.country?.trim() && addr.country.trim().toUpperCase() !== "US" && addr.country.trim().toUpperCase() !== "USA") {
    parts.push(esc(addr.country.trim()));
  }
  return parts.join("<br>");
}

// ── HTML builder ──────────────────────────────────────────────────────────────

interface BankDetails {
  accountHolder: string;
  bankName:      string;
  routingNumber: string;
  accountNumber: string;
  swiftCode:     string;
}

interface InvoiceDocData {
  invoice: {
    id:                  string;
    invoiceNumber:       string;
    contractAmountCents: number;
    setupFeeCents:       number;
    monthlyValueCents:   number;
    invoiceStatus:       string;
    paymentStatus:       string;
    dueDate:             Date;
    createdAt:           Date;
    lineItems:           unknown;
    periodStart:         string | null;
    periodEnd:           string | null;
    paymentLink:         string | null;
  };
  client: {
    fullName:  string;
    company:   string;
    email:     string;
    phone:     string;
    address:   unknown;
  } | null;
  business: {
    domain:      string;
    displayName: string;
  } | null;
  config: {
    legalName:          string;
    address:            string;
    phone:              string;
    supportEmail:       string;
    logoUrl:            string;
    taxExemptionText:   string;
    refundFooter:       string;
    defaultPaymentTerms: string;
  };
  paymentTerms: string | null;
  bankDetails:  BankDetails | null;
}

function buildHtml(data: InvoiceDocData): string {
  const { invoice, client, business, config, paymentTerms, bankDetails } = data;

  const invoiceNumber  = esc(invoice.invoiceNumber);
  const issueDate      = fmtDate(invoice.createdAt) ?? "";
  const dueDate        = fmtDate(invoice.dueDate)   ?? "Due on receipt";
  const amountDue      = formatCents(invoice.contractAmountCents);
  const subtotal       = formatCents(invoice.contractAmountCents);
  const total          = formatCents(invoice.contractAmountCents);

  // Company (RTM) details
  const rtmName     = esc(config.legalName   || "Realtime Marketing");
  const rtmAddress  = esc(config.address     || "");
  const rtmPhone    = esc(config.phone       || "");
  const rtmEmail    = esc(config.supportEmail || "");
  const rtmLogoUrl  = config.logoUrl || "/rtm-logo.png";
  const taxText     = esc(config.taxExemptionText || "Customer is tax exempt");
  const refundFooter = esc(config.refundFooter || "");
  const configTerms  = config.defaultPaymentTerms?.trim() || null;

  // Effective payment terms: handoff > company config > omit
  const effectiveTerms = paymentTerms?.trim() || configTerms || null;

  // Client details
  const billToName    = esc(client?.company  || client?.fullName || "");
  const billToContact = esc(client?.fullName || "");
  const billToEmail   = esc(client?.email   || "");
  const billToPhone   = esc(client?.phone   || "");
  const billToAddr    = renderAddress(client?.address as MasterAddress | null);
  const domain        = esc(business?.domain || "");

  // Period (omit if absent)
  const hasPeriod = !!(invoice.periodStart && invoice.periodEnd);
  const periodStr = hasPeriod
    ? `${esc(invoice.periodStart!)} to ${esc(invoice.periodEnd!)}`
    : null;

  // Payment link (omit if null)
  const payLink = invoice.paymentLink?.trim() || null;

  // Line items
  const lineItems: BudgetLineItem[] = Array.isArray(invoice.lineItems)
    ? (invoice.lineItems as BudgetLineItem[])
    : [];

  // Build line item rows
  const lineRows = lineItems.map((li) => {
    const label    = esc(li.label       || li.serviceId || "Service");
    const qty      = li.quantity ?? 1;
    const isRecurring = li.isRecurring !== false;

    // Unit price: use unitMonthlyPrice for recurring, setupFee for one-time
    const unitCents = isRecurring
      ? (li.unitMonthlyPrice ?? 0)
      : (li.setupFee ?? 0);

    // Amount: use the stored subtotal if present
    const amountCents = isRecurring
      ? (li.monthlySubtotal ?? li.setupSubtotal ?? unitCents * qty)
      : (li.setupSubtotal   ?? li.monthlySubtotal ?? unitCents * qty);

    const unitFmt   = formatCents(unitCents);
    const amtFmt    = formatCents(amountCents);
    const periodCell = (hasPeriod && periodStr) ? `<td class="td">${periodStr}</td>` : "";
    const typeLabel  = isRecurring ? "Monthly" : "One-time";

    return `
      <tr>
        <td class="td">${label}<br><span class="type-tag">${typeLabel}</span></td>
        <td class="td td-num">${qty}</td>
        <td class="td td-num">${unitFmt}</td>
        ${periodCell}
        <td class="td td-num">${amtFmt}</td>
      </tr>`;
  }).join("");

  const periodHeader = hasPeriod ? `<th class="th">Period</th>` : "";

  // Show line items section only when there are items
  const lineSection = lineItems.length > 0 ? `
    <table class="line-table">
      <thead>
        <tr>
          <th class="th">Description</th>
          <th class="th th-num">Qty</th>
          <th class="th th-num">Unit Price</th>
          ${periodHeader}
          <th class="th th-num">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${lineRows}
      </tbody>
    </table>` : `
    <p class="no-items">No line items on this invoice.</p>`;

  // Totals block (always shown — amounts come from invoice record)
  const totalsBlock = `
    <table class="totals-table">
      <tr>
        <td class="tot-label">Subtotal</td>
        <td class="tot-val">${subtotal}</td>
      </tr>
      <tr>
        <td class="tot-label">Tax</td>
        <td class="tot-val tot-exempt">${taxText}</td>
      </tr>
      <tr class="tot-total-row">
        <td class="tot-label tot-total-label">Total</td>
        <td class="tot-val tot-total-val">${total}</td>
      </tr>
      <tr class="tot-due-row">
        <td class="tot-label tot-due-label">Amount Due</td>
        <td class="tot-val tot-due-val">${amountDue}</td>
      </tr>
    </table>`;

  // Optional sections
  const payLinkSection = payLink ? `
    <div class="pay-link-box">
      <strong>Pay online:</strong>
      <a href="${esc(payLink)}">${esc(payLink)}</a>
    </div>` : "";

  const payTermsSection = effectiveTerms ? `
    <p class="pay-terms"><strong>Payment terms:</strong> ${esc(effectiveTerms)}</p>` : "";

  const domainSection = domain ? `
    <p class="bill-domain"><strong>Domain:</strong> ${domain}</p>` : "";

  const billToContactLine  = (billToContact && billToContact !== billToName)
    ? `<p class="bill-contact">${billToContact}</p>` : "";
  const billToEmailLine    = billToEmail  ? `<p class="bill-contact">${billToEmail}</p>` : "";
  const billToPhoneLine    = billToPhone  ? `<p class="bill-contact">${billToPhone}</p>` : "";
  const billToAddrSection  = billToAddr   ? `<div class="bill-addr">${billToAddr}</div>` : "";

  // Transfer block (second page): rendered when bank details exist and any field is non-empty.
  const hasBankDetails = !!(bankDetails && (
    bankDetails.accountHolder.trim() ||
    bankDetails.bankName.trim()      ||
    bankDetails.routingNumber.trim() ||
    bankDetails.accountNumber.trim() ||
    bankDetails.swiftCode.trim()
  ));

  const transferBlock = hasBankDetails ? `
    <div class="transfer-section" style="page-break-before: always;">
      <h2 class="transfer-title">Wire Transfer Details</h2>
      <p class="transfer-note">
        To pay by bank transfer, use the details below. Include the invoice number as the reference.
      </p>
      <table class="transfer-table">
        <tbody>
          <tr>
            <td class="transfer-label">Account Holder</td>
            <td class="transfer-val">${esc(bankDetails!.accountHolder)}</td>
          </tr>
          <tr>
            <td class="transfer-label">Bank Name</td>
            <td class="transfer-val">${esc(bankDetails!.bankName)}</td>
          </tr>
          <tr>
            <td class="transfer-label">Routing Number</td>
            <td class="transfer-val">${esc(bankDetails!.routingNumber)}</td>
          </tr>
          <tr>
            <td class="transfer-label">Account Number</td>
            <td class="transfer-val">${esc(bankDetails!.accountNumber)}</td>
          </tr>
          <tr>
            <td class="transfer-label">SWIFT Code</td>
            <td class="transfer-val">${esc(bankDetails!.swiftCode)}</td>
          </tr>
          <tr class="transfer-ref-row">
            <td class="transfer-label">Reference</td>
            <td class="transfer-val transfer-ref-val">${invoiceNumber}</td>
          </tr>
        </tbody>
      </table>
      <p class="transfer-footer">
        Please include <strong>${invoiceNumber}</strong> as the payment reference so we can
        match your transfer. Questions? Contact us at <strong>${rtmEmail}</strong>.
      </p>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Invoice ${invoiceNumber}</title>
  <style>
    /* ── Reset & base ──────────────────────────────────────────────────── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      font-size: 14px;
      color: #1a1a1a;
      background: #fff;
    }

    /* ── Page shell ────────────────────────────────────────────────────── */
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 48px 64px;
    }

    /* ── Print ─────────────────────────────────────────────────────────── */
    @page {
      size: A4;
      margin: 18mm 18mm 22mm 18mm;
    }
    @media print {
      body { background: #fff; }
      .page { max-width: none; padding: 0; margin: 0; }
      .no-print { display: none !important; }
      tr { page-break-inside: avoid; }
    }

    /* ── Header ────────────────────────────────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 28px;
    }
    .logo-block img {
      height: 48px;
      width: auto;
      display: block;
      margin-bottom: 10px;
    }
    .logo-block .rtm-name {
      font-size: 15px;
      font-weight: 700;
      color: #111;
      margin-bottom: 2px;
    }
    .logo-block .rtm-meta {
      font-size: 12px;
      color: #555;
      line-height: 1.6;
    }
    .invoice-meta {
      text-align: right;
    }
    .invoice-meta .inv-label {
      font-size: 28px;
      font-weight: 800;
      color: #1a1a1a;
      letter-spacing: -0.5px;
    }
    .invoice-meta .inv-number {
      font-size: 14px;
      color: #555;
      margin-top: 4px;
    }
    .invoice-meta .inv-status {
      display: inline-block;
      margin-top: 8px;
      padding: 3px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #f0fdf4;
      color: #15803d;
      border: 1px solid #a7f3d0;
    }

    /* ── Amount due callout ─────────────────────────────────────────────── */
    .amount-due-callout {
      background: #f0fdf4;
      border: 1.5px solid #a7f3d0;
      border-radius: 10px;
      padding: 18px 24px;
      margin-bottom: 32px;
      display: flex;
      align-items: baseline;
      gap: 16px;
      flex-wrap: wrap;
    }
    .adc-label {
      font-size: 13px;
      font-weight: 600;
      color: #15803d;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .adc-amount {
      font-size: 32px;
      font-weight: 800;
      color: #065f46;
      letter-spacing: -1px;
    }
    .adc-due {
      font-size: 13px;
      color: #047857;
      margin-left: auto;
    }

    /* ── Pay-online link ────────────────────────────────────────────────── */
    .pay-link-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 28px;
      font-size: 13px;
    }
    .pay-link-box a {
      color: #1d4ed8;
      text-decoration: underline;
    }

    /* ── Billing addresses ──────────────────────────────────────────────── */
    .addr-row {
      display: flex;
      gap: 48px;
      margin-bottom: 32px;
    }
    .addr-block {
      flex: 1;
    }
    .addr-block .addr-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6b7280;
      margin-bottom: 8px;
    }
    .addr-block .company-name {
      font-size: 15px;
      font-weight: 700;
      color: #111;
      margin-bottom: 3px;
    }
    .bill-contact {
      font-size: 13px;
      color: #444;
      line-height: 1.6;
    }
    .bill-addr {
      font-size: 13px;
      color: #444;
      line-height: 1.6;
      margin-top: 4px;
    }
    .bill-domain {
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
      font-family: ui-monospace, monospace;
    }

    /* ── Invoice dates row ─────────────────────────────────────────────── */
    .dates-row {
      display: flex;
      gap: 32px;
      margin-bottom: 32px;
      background: #f9fafb;
      border-radius: 8px;
      padding: 14px 20px;
    }
    .date-item .date-label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      margin-bottom: 3px;
    }
    .date-item .date-val {
      font-size: 14px;
      font-weight: 600;
      color: #111;
    }

    /* ── Payment terms ──────────────────────────────────────────────────── */
    .pay-terms {
      font-size: 13px;
      color: #444;
      margin-bottom: 24px;
    }

    /* ── Line items table ───────────────────────────────────────────────── */
    .section-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: #6b7280;
      margin-bottom: 10px;
    }
    .line-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .th {
      text-align: left;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #6b7280;
      padding: 8px 10px;
      border-bottom: 1.5px solid #e5e7eb;
      background: #f9fafb;
    }
    .th-num { text-align: right; }
    .td {
      font-size: 13px;
      color: #1a1a1a;
      padding: 10px 10px;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    .td-num { text-align: right; font-variant-numeric: tabular-nums; }
    .type-tag {
      font-size: 10px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .no-items {
      font-size: 13px;
      color: #9ca3af;
      font-style: italic;
      margin-bottom: 28px;
    }

    /* ── Totals ─────────────────────────────────────────────────────────── */
    .totals-table {
      width: 100%;
      max-width: 320px;
      margin-left: auto;
      border-collapse: collapse;
      margin-bottom: 32px;
    }
    .tot-label {
      font-size: 13px;
      color: #6b7280;
      padding: 6px 8px 6px 0;
      text-align: right;
      width: 60%;
    }
    .tot-val {
      font-size: 13px;
      color: #1a1a1a;
      padding: 6px 0 6px 16px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .tot-exempt {
      font-size: 12px;
      color: #6b7280;
      font-style: italic;
    }
    .tot-total-row td { border-top: 1.5px solid #e5e7eb; padding-top: 10px; }
    .tot-total-label { font-weight: 700; color: #111; font-size: 14px; }
    .tot-total-val   { font-weight: 700; color: #111; font-size: 14px; }
    .tot-due-row td  { padding-top: 6px; }
    .tot-due-label {
      font-weight: 800;
      color: #065f46;
      font-size: 15px;
    }
    .tot-due-val {
      font-weight: 800;
      color: #065f46;
      font-size: 15px;
    }

    /* ── Footer ─────────────────────────────────────────────────────────── */
    .footer {
      border-top: 1.5px solid #e5e7eb;
      padding-top: 24px;
      margin-top: 8px;
    }
    .footer-contact {
      font-size: 12px;
      color: #6b7280;
      margin-bottom: 12px;
      line-height: 1.6;
    }
    .footer-refund {
      font-size: 11px;
      color: #9ca3af;
      line-height: 1.6;
      border-top: 1px solid #f3f4f6;
      padding-top: 12px;
      margin-top: 12px;
    }

    /* ── Print button (hidden on print) ─────────────────────────────────── */
    .print-btn {
      display: block;
      margin: 0 auto 32px;
      padding: 10px 28px;
      background: #1d4ed8;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.2px;
    }
    .print-btn:hover { background: #1e40af; }

    /* ── Transfer block ─────────────────────────────────────────────────── */
    .transfer-section {
      margin-top: 48px;
      padding-top: 32px;
      border-top: 2px solid #e5e7eb;
    }
    .transfer-title {
      font-size: 16px;
      font-weight: 700;
      color: #111;
      margin-bottom: 8px;
    }
    .transfer-note {
      font-size: 13px;
      color: #555;
      margin-bottom: 20px;
    }
    .transfer-table {
      width: 100%;
      max-width: 480px;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .transfer-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      color: #6b7280;
      padding: 8px 0;
      width: 40%;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: top;
    }
    .transfer-val {
      font-size: 13px;
      color: #1a1a1a;
      padding: 8px 0 8px 16px;
      border-bottom: 1px solid #f3f4f6;
      font-variant-numeric: tabular-nums;
    }
    .transfer-ref-row .transfer-label,
    .transfer-ref-row .transfer-val {
      border-bottom: none;
      padding-top: 14px;
      font-weight: 700;
    }
    .transfer-ref-val {
      color: #1d4ed8;
      font-weight: 700;
    }
    .transfer-footer {
      font-size: 12px;
      color: #6b7280;
      line-height: 1.6;
      border-top: 1px solid #f3f4f6;
      padding-top: 12px;
      margin-top: 8px;
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Print button — hidden when printing -->
    <div class="no-print" style="text-align:center; margin-bottom: 28px;">
      <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
    </div>

    <!-- Header: RTM logo + legal name on left; INVOICE label + number on right -->
    <div class="header">
      <div class="logo-block">
        <img src="${esc(rtmLogoUrl)}" alt="${rtmName} logo" onerror="this.style.display='none'">
        <p class="rtm-name">${rtmName}</p>
        <div class="rtm-meta">
          ${rtmAddress ? rtmAddress.replace(/\n/g, "<br>") + "<br>" : ""}
          ${rtmPhone   ? rtmPhone + "<br>"  : ""}
          ${rtmEmail   ? rtmEmail           : ""}
        </div>
      </div>
      <div class="invoice-meta">
        <p class="inv-label">INVOICE</p>
        <p class="inv-number">${invoiceNumber}</p>
        <span class="inv-status">${esc(invoice.invoiceStatus)}</span>
      </div>
    </div>

    <!-- Amount due callout — prominent near top -->
    <div class="amount-due-callout">
      <span class="adc-label">Amount Due</span>
      <span class="adc-amount">${amountDue}</span>
      <span class="adc-due">Due: ${dueDate}</span>
    </div>

    <!-- Pay-online link (omitted if null) -->
    ${payLinkSection}

    <!-- Billing addresses -->
    <div class="addr-row">
      <div class="addr-block">
        <p class="addr-title">From</p>
        <p class="company-name">${rtmName}</p>
        <div class="rtm-meta">
          ${rtmAddress ? rtmAddress.replace(/\n/g, "<br>") + "<br>" : ""}
          ${rtmPhone   ? rtmPhone + "<br>" : ""}
          ${rtmEmail   ? rtmEmail         : ""}
        </div>
      </div>
      <div class="addr-block">
        <p class="addr-title">Bill To</p>
        ${billToName    ? `<p class="company-name">${billToName}</p>` : ""}
        ${billToContactLine}
        ${billToAddrSection}
        ${billToEmailLine}
        ${billToPhoneLine}
        ${domainSection}
      </div>
    </div>

    <!-- Invoice dates -->
    <div class="dates-row">
      <div class="date-item">
        <p class="date-label">Invoice Date</p>
        <p class="date-val">${issueDate}</p>
      </div>
      <div class="date-item">
        <p class="date-label">Due Date</p>
        <p class="date-val">${dueDate}</p>
      </div>
      ${invoiceNumber ? `<div class="date-item">
        <p class="date-label">Invoice #</p>
        <p class="date-val">${invoiceNumber}</p>
      </div>` : ""}
    </div>

    <!-- Payment terms (omitted if absent) -->
    ${payTermsSection}

    <!-- Line items -->
    <p class="section-title">Services</p>
    ${lineSection}

    <!-- Totals -->
    ${totalsBlock}

    <!-- Footer: contact info + refund note -->
    <div class="footer">
      <p class="footer-contact">
        Questions? Contact us at <strong>${rtmEmail}</strong>${rtmPhone ? ` or <strong>${rtmPhone}</strong>` : ""}.
      </p>
      ${refundFooter ? `<p class="footer-refund">${refundFooter}</p>` : ""}
    </div>

    <!-- Wire transfer block (second page, omitted when no bank details) -->
    ${transferBlock}

  </div>
</body>
</html>`;
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // Auth: Manager or higher (see header comment for reasoning).
  const { user, error, status } = await getSessionUser(req);
  if (error) return NextResponse.json({ error }, { status: status! });

  const gate = requireRole(user!, "Manager");
  if (gate) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Invoice id is required." }, { status: 400 });
  }

  // ── Fetch invoice ────────────────────────────────────────────────────────
  let invoice: Awaited<ReturnType<typeof prisma.invoice.findUnique>>;
  try {
    invoice = await prisma.invoice.findUnique({ where: { id } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  if (!invoice) {
    // Honest 404: do not return a blank page
    return new NextResponse(
      `<!DOCTYPE html><html><head><title>Invoice Not Found</title></head><body style="font-family:sans-serif;padding:48px;max-width:600px;margin:0 auto"><h1 style="color:#dc2626">Invoice Not Found</h1><p>No invoice with id <code>${esc(id)}</code> was found.</p><p><a href="/billing/invoices">← Back to Invoices</a></p></body></html>`,
      {
        status: 404,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }

  // ── Fetch company config ──────────────────────────────────────────────────
  let configRow: Awaited<ReturnType<typeof prisma.companyConfig.findUnique>>;
  try {
    configRow = await prisma.companyConfig.findUnique({ where: { id: 1 } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const config = {
    legalName:           configRow?.legalName           || "",
    address:             configRow?.address             || "",
    phone:               configRow?.phone               || "",
    supportEmail:        configRow?.supportEmail        || "",
    logoUrl:             configRow?.logoUrl             || "/rtm-logo.png",
    taxExemptionText:    configRow?.taxExemptionText    || "Customer is tax exempt",
    refundFooter:        configRow?.refundFooter        || "",
    defaultPaymentTerms: configRow?.defaultPaymentTerms || "",
  };

  // ── Fetch client ──────────────────────────────────────────────────────────
  let clientRow: Awaited<ReturnType<typeof prisma.client.findUnique>> | null = null;
  if (invoice.clientId) {
    try {
      clientRow = await prisma.client.findUnique({ where: { id: invoice.clientId } });
    } catch {
      // best-effort: render without client data
    }
  }

  // ── Fetch business ────────────────────────────────────────────────────────
  let businessRow: Awaited<ReturnType<typeof prisma.business.findUnique>> | null = null;
  if (invoice.businessId) {
    try {
      businessRow = await prisma.business.findUnique({ where: { id: invoice.businessId } });
    } catch {
      // best-effort
    }
  }

  // ── Fetch payment terms via salesHandoffId ────────────────────────────────
  // Invoice → SalesHandoff.paymentTerms (one hop, authoritative).
  // If the handoff is absent or has no paymentTerms, falls through to config.
  let paymentTerms: string | null = null;
  if (invoice.salesHandoffId) {
    try {
      const handoff = await prisma.salesHandoff.findUnique({
        where: { id: invoice.salesHandoffId },
        select: { paymentTerms: true },
      });
      paymentTerms = handoff?.paymentTerms?.trim() || null;
    } catch {
      // best-effort
    }
  }

  // ── Fetch bank details ──────────────────────────────────────────────────────
  // Best-effort: if the row is absent or the fetch fails, the transfer block
  // is omitted and the rest of the document still renders.
  // Account number is NOT logged or interpolated into any error string.
  let bankDetailsData: BankDetails | null = null;
  try {
    const bdRow = await prisma.bankDetails.findUnique({ where: { id: 1 } });
    if (bdRow) {
      bankDetailsData = {
        accountHolder: bdRow.accountHolder,
        bankName:      bdRow.bankName,
        routingNumber: bdRow.routingNumber,
        accountNumber: bdRow.accountNumber,
        swiftCode:     bdRow.swiftCode,
      };
    }
  } catch {
    // best-effort: render without transfer block
  }

  // ── Build and return HTML ─────────────────────────────────────────────────
  const html = buildHtml({
    invoice: {
      id:                  invoice.id,
      invoiceNumber:       invoice.invoiceNumber,
      contractAmountCents: invoice.contractAmountCents,
      setupFeeCents:       invoice.setupFeeCents,
      monthlyValueCents:   invoice.monthlyValueCents,
      invoiceStatus:       invoice.invoiceStatus,
      paymentStatus:       invoice.paymentStatus,
      dueDate:             invoice.dueDate,
      createdAt:           invoice.createdAt,
      lineItems:           invoice.lineItems,
      periodStart:         invoice.periodStart ?? null,
      periodEnd:           invoice.periodEnd   ?? null,
      paymentLink:         invoice.paymentLink ?? null,
    },
    client: clientRow
      ? {
          fullName: clientRow.fullName,
          company:  clientRow.company,
          email:    clientRow.email,
          phone:    clientRow.phone,
          address:  clientRow.address,
        }
      : null,
    business: businessRow
      ? {
          domain:      businessRow.domain,
          displayName: businessRow.displayName,
        }
      : null,
    config,
    paymentTerms,
    bankDetails: bankDetailsData,
  });

  return new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
