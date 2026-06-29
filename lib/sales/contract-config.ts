// RTM OS — Sales Contract Builder Configuration
// All contract clause definitions, status labels, payment terms, term lengths,
// and template structures live here. Zero business literals in any .tsx file.

// ─── Clause & Status Types ────────────────────────────────────────────────────

export type ContractClauseId =
  | "cover"
  | "parties"
  | "services"
  | "investment"
  | "payment-terms"
  | "term-length"
  | "cancellation"
  | "intellectual-property"
  | "confidentiality"
  | "liability"
  | "warranties"
  | "governing-law"
  | "signatures";

export type ContractStatus =
  | "draft"
  | "in-review"
  | "sent"
  | "awaiting-signature"
  | "signed"
  | "declined"
  | "expired"
  | "cancelled";

export type ContractClauseStatus = "empty" | "draft" | "complete" | "locked";

export type PaymentTermOption = "net-15" | "net-30" | "net-45" | "upon-receipt";

export type ContractTermLength =
  | "month-to-month"
  | "3-months"
  | "6-months"
  | "12-months"
  | "24-months";

// ─── Clause Definition ────────────────────────────────────────────────────────

export interface ContractClauseDefinition {
  id: ContractClauseId;
  label: string;
  description: string;
  required: boolean;
  defaultContent: string;
  editable: boolean;
  order: number;
  legalLock: boolean;
}

// ─── All 13 Clause Definitions ────────────────────────────────────────────────

export const CONTRACT_CLAUSES: ContractClauseDefinition[] = [
  {
    id: "cover",
    label: "Cover Page",
    description: "Contract title, client name, contract number, and preparation date.",
    required: true,
    defaultContent: "",
    editable: true,
    order: 1,
    legalLock: false,
  },
  {
    id: "parties",
    label: "Parties",
    description: "Identifies the agency and the client entering into this agreement.",
    required: true,
    defaultContent:
      "This Service Agreement (the \"Agreement\") is entered into as of the Effective Date set forth below, by and between the Agency, a limited liability company duly organized and existing under applicable law (\"Agency\"), and the Client identified on the cover page of this Agreement (\"Client\"). Agency and Client are each referred to herein individually as a \"Party\" and collectively as the \"Parties.\"",
    editable: false,
    order: 2,
    legalLock: true,
  },
  {
    id: "services",
    label: "Scope of Services",
    description: "Auto-populated from proposal recommended services. Not manually editable.",
    required: true,
    defaultContent: "",
    editable: false,
    order: 3,
    legalLock: false,
  },
  {
    id: "investment",
    label: "Investment and Fees",
    description: "Auto-populated from budget optimizer output. Not manually editable.",
    required: true,
    defaultContent: "",
    editable: false,
    order: 4,
    legalLock: false,
  },
  {
    id: "payment-terms",
    label: "Payment Terms",
    description: "Defines payment schedule, due dates, and late payment consequences.",
    required: true,
    defaultContent:
      "Client agrees to pay Agency the fees set forth in this Agreement within thirty (30) days of the invoice date (Net 30). Invoices are issued on the first business day of each month for monthly retainer services, and upon completion of one-time deliverables. Payments not received within thirty (30) days of the invoice date will accrue interest at a rate of one and one-half percent (1.5%) per month. Agency reserves the right to suspend services after thirty (30) days of non-payment without liability.",
    editable: true,
    order: 5,
    legalLock: false,
  },
  {
    id: "term-length",
    label: "Term Length",
    description: "Defines the initial term and renewal conditions of this agreement.",
    required: true,
    defaultContent:
      "This Agreement shall commence on the Effective Date and shall continue for an initial term of twelve (12) months (\"Initial Term\"). Upon expiration of the Initial Term, this Agreement shall automatically renew for successive twelve (12)-month periods (each, a \"Renewal Term\") unless either Party provides written notice of non-renewal at least sixty (60) days prior to the end of the then-current term.",
    editable: true,
    order: 6,
    legalLock: false,
  },
  {
    id: "cancellation",
    label: "Cancellation Policy",
    description:
      "Standard 30-day written notice cancellation language. Locked.",
    required: true,
    defaultContent:
      "Either Party may terminate this Agreement during any Renewal Term by providing thirty (30) days prior written notice to the other Party. Termination during the Initial Term requires sixty (60) days written notice and payment of an early termination fee equal to two (2) months of the then-current monthly retainer. Written notice must be delivered via certified mail or email with read receipt to the address on file. Verbal cancellation requests will not be honored. Agency will continue to provide services and invoice during the applicable notice period. Client remains responsible for all fees incurred through the termination effective date.",
    editable: false,
    order: 7,
    legalLock: true,
  },
  {
    id: "intellectual-property",
    label: "Intellectual Property",
    description: "Standard IP ownership language. Locked.",
    required: true,
    defaultContent:
      "Upon receipt of full payment for all fees due under this Agreement, Agency grants Client a non-exclusive, non-transferable license to use the deliverables produced under this Agreement solely for Client's internal business purposes. All pre-existing intellectual property, tools, methodologies, frameworks, templates, and processes owned by Agency prior to or developed independently of this Agreement shall remain the exclusive property of Agency. Agency retains the right to use anonymized, aggregated performance data and results for internal research, marketing, and case study purposes, provided that no personally identifiable or confidential Client information is disclosed.",
    editable: false,
    order: 8,
    legalLock: true,
  },
  {
    id: "confidentiality",
    label: "Confidentiality",
    description: "Standard NDA language. Locked.",
    required: true,
    defaultContent:
      "Each Party (\"Receiving Party\") agrees to hold in strict confidence all proprietary, technical, financial, operational, and business information disclosed by the other Party (\"Disclosing Party\") in connection with this Agreement (\"Confidential Information\"). The Receiving Party shall not disclose Confidential Information to any third party without the prior written consent of the Disclosing Party, except to employees or contractors who have a need to know and are bound by confidentiality obligations no less restrictive than those set forth herein. This obligation of confidentiality shall survive termination of this Agreement for a period of three (3) years. Confidential Information does not include information that: (a) is or becomes publicly available through no fault of the Receiving Party; (b) was rightfully known to the Receiving Party prior to disclosure; or (c) is required to be disclosed by law or court order.",
    editable: false,
    order: 9,
    legalLock: true,
  },
  {
    id: "liability",
    label: "Limitation of Liability",
    description: "Standard liability cap language. Locked.",
    required: true,
    defaultContent:
      "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL AGENCY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOST REVENUE, LOSS OF DATA, OR BUSINESS INTERRUPTION, EVEN IF AGENCY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. AGENCY'S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATING TO THIS AGREEMENT SHALL NOT EXCEED THE TOTAL FEES PAID BY CLIENT TO AGENCY DURING THE THREE (3) MONTH PERIOD IMMEDIATELY PRECEDING THE EVENT GIVING RISE TO THE CLAIM. THE PARTIES ACKNOWLEDGE THAT THE LIMITATIONS OF LIABILITY SET FORTH IN THIS SECTION REFLECT A REASONABLE ALLOCATION OF RISK AND ARE AN ESSENTIAL ELEMENT OF THE BASIS OF THE BARGAIN BETWEEN THE PARTIES.",
    editable: false,
    order: 10,
    legalLock: true,
  },
  {
    id: "warranties",
    label: "Warranties and Representations",
    description: "Standard warranties language. Locked.",
    required: true,
    defaultContent:
      "Each Party represents and warrants to the other that: (a) it has the full right, power, and authority to enter into this Agreement and to perform its obligations hereunder; (b) the execution and performance of this Agreement does not violate any other agreement to which such Party is bound; and (c) it will comply with all applicable laws and regulations in connection with its performance under this Agreement. Agency further represents that the services will be performed in a professional and workmanlike manner consistent with industry standards. EXCEPT AS EXPRESSLY SET FORTH IN THIS SECTION, AGENCY MAKES NO OTHER WARRANTIES, EXPRESS OR IMPLIED, INCLUDING ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. AGENCY DOES NOT WARRANT SPECIFIC MARKETING RESULTS, SEARCH ENGINE RANKINGS, OR ADVERTISING PERFORMANCE OUTCOMES.",
    editable: false,
    order: 11,
    legalLock: true,
  },
  {
    id: "governing-law",
    label: "Governing Law",
    description: "Specifies the jurisdiction and governing law for this agreement.",
    required: true,
    defaultContent:
      "This Agreement shall be governed by and construed in accordance with the laws of the State of [STATE], without regard to its conflict of laws provisions. Any dispute arising out of or relating to this Agreement that cannot be resolved by good-faith negotiation shall be subject to binding arbitration conducted by a single arbitrator in accordance with the rules of the American Arbitration Association in [CITY, STATE]. Notwithstanding the foregoing, either Party may seek injunctive or other equitable relief in any court of competent jurisdiction to prevent irreparable harm.",
    editable: true,
    order: 12,
    legalLock: false,
  },
  {
    id: "signatures",
    label: "Signatures",
    description: "Signature block for agency representative and client signatory.",
    required: true,
    defaultContent:
      "By signing below, the Parties acknowledge that they have read, understood, and agree to be bound by the terms and conditions of this Agreement.\n\nAGENCY:\n\nSignature: _______________________________\nPrinted Name: ___________________________\nTitle: __________________________________\nDate: ___________________________________\n\nCLIENT:\n\nSignature: _______________________________\nPrinted Name: ___________________________\nTitle: __________________________________\nDate: ___________________________________",
    editable: false,
    order: 13,
    legalLock: false,
  },
];

// ─── Status Labels & Colors ───────────────────────────────────────────────────

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  draft: "Draft",
  "in-review": "In Review",
  sent: "Sent",
  "awaiting-signature": "Awaiting Signature",
  signed: "Signed",
  declined: "Declined",
  expired: "Expired",
  cancelled: "Cancelled",
};

export const CONTRACT_STATUS_COLORS: Record<ContractStatus, string> = {
  draft: "var(--rtm-text-muted)",
  "in-review": "#D97706",
  sent: "#2563EB",
  "awaiting-signature": "#0891B2",
  signed: "#059669",
  declined: "#DC2626",
  expired: "#9CA3AF",
  cancelled: "#6B7280",
};

// ─── Payment Terms ────────────────────────────────────────────────────────────

export const PAYMENT_TERM_OPTIONS: Record<PaymentTermOption, string> = {
  "net-15": "Net 15 — Due within 15 days of invoice",
  "net-30": "Net 30 — Due within 30 days of invoice",
  "net-45": "Net 45 — Due within 45 days of invoice",
  "upon-receipt": "Due upon receipt",
};

// ─── Term Lengths ─────────────────────────────────────────────────────────────

export const CONTRACT_TERM_LENGTHS: Record<ContractTermLength, string> = {
  "month-to-month": "Month-to-Month",
  "3-months": "3-Month Initial Term",
  "6-months": "6-Month Initial Term",
  "12-months": "12-Month Initial Term",
  "24-months": "24-Month Initial Term",
};

// ─── Contract Templates ───────────────────────────────────────────────────────

export interface ContractTemplate {
  id: string;
  label: string;
  description: string;
  clauses: ContractClauseId[];
  defaultPaymentTerm: PaymentTermOption;
  defaultTermLength: ContractTermLength;
}

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: "standard",
    label: "Standard Service Agreement",
    description:
      "Full 12-month service agreement with all standard clauses. Recommended for most engagements.",
    clauses: [
      "cover",
      "parties",
      "services",
      "investment",
      "payment-terms",
      "term-length",
      "cancellation",
      "intellectual-property",
      "confidentiality",
      "liability",
      "warranties",
      "governing-law",
      "signatures",
    ],
    defaultPaymentTerm: "net-30",
    defaultTermLength: "12-months",
  },
  {
    id: "month-to-month",
    label: "Month-to-Month Agreement",
    description:
      "Flexible month-to-month service agreement. Suitable for trial engagements or short-term projects.",
    clauses: [
      "cover",
      "parties",
      "services",
      "investment",
      "payment-terms",
      "term-length",
      "cancellation",
      "intellectual-property",
      "confidentiality",
      "liability",
      "warranties",
      "governing-law",
      "signatures",
    ],
    defaultPaymentTerm: "net-30",
    defaultTermLength: "month-to-month",
  },
];
