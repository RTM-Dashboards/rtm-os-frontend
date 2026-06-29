// RTM OS — Sales Contract Engine
// Pure functions only. No React. No UI imports.

import {
  CONTRACT_CLAUSES,
  CONTRACT_TEMPLATES,
  type ContractClauseId,
  type ContractClauseStatus,
  type ContractStatus,
  type PaymentTermOption,
  type ContractTermLength,
} from "./contract-config";

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ContractClause {
  id: ContractClauseId;
  label: string;
  content: string;
  status: ContractClauseStatus;
  editable: boolean;
  legalLock: boolean;
  order: number;
}

export interface ContractDocument {
  id: string;
  contractNumber: string;
  clientName: string;
  preparedBy: string;
  createdAt: string;
  status: ContractStatus;
  templateId: string;
  paymentTerm: PaymentTermOption;
  termLength: ContractTermLength;
  clauses: ContractClause[];
  completionPercentage: number;
  readyForSend: boolean;
  proposalId?: string;
}

// ─── Contract Number Generation ───────────────────────────────────────────────

export function generateContractNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(1000 + Math.random() * 9000));
  return `CTR-${year}-${seq}`;
}

// ─── Completion Computation ───────────────────────────────────────────────────

export function computeContractCompletion(clauses: ContractClause[]): number {
  const required = clauses.filter((c) => {
    const def = CONTRACT_CLAUSES.find((d) => d.id === c.id);
    return def?.required === true;
  });
  if (required.length === 0) return 0;
  const complete = required.filter((c) => c.status === "complete" || c.status === "locked");
  return Math.round((complete.length / required.length) * 100);
}

export function computeReadyForSend(clauses: ContractClause[]): boolean {
  const required = clauses.filter((c) => {
    const def = CONTRACT_CLAUSES.find((d) => d.id === c.id);
    return def?.required === true;
  });
  return required.every((c) => c.status === "complete" || c.status === "locked");
}

// ─── Build Clauses from Template ─────────────────────────────────────────────

function buildClauses(templateClauseIds: ContractClauseId[]): ContractClause[] {
  const result: ContractClause[] = [];
  for (const clauseId of templateClauseIds) {
    const def = CONTRACT_CLAUSES.find((d) => d.id === clauseId);
    if (!def) continue;
    const initialStatus: ContractClauseStatus = def.legalLock
      ? "locked"
      : def.defaultContent.trim().length > 0 &&
        !def.editable &&
        !["services", "investment", "cover", "signatures"].includes(def.id)
      ? "complete"
      : "empty";
    result.push({
      id: def.id,
      label: def.label,
      content: def.defaultContent,
      status: initialStatus,
      editable: def.editable,
      legalLock: def.legalLock,
      order: def.order,
    });
  }
  return result.sort((a, b) => a.order - b.order);
}

// ─── Build Contract from Template ────────────────────────────────────────────

export function buildContractFromTemplate(
  templateId: string,
  clientName: string,
  preparedBy: string
): ContractDocument {
  const template = CONTRACT_TEMPLATES.find((t) => t.id === templateId) ?? CONTRACT_TEMPLATES[0];
  const clauses = buildClauses(template.clauses);
  const now = new Date().toISOString();

  const doc: ContractDocument = {
    id: `contract-${Date.now()}`,
    contractNumber: generateContractNumber(),
    clientName,
    preparedBy,
    createdAt: now,
    status: "draft",
    templateId: template.id,
    paymentTerm: template.defaultPaymentTerm,
    termLength: template.defaultTermLength,
    clauses,
    completionPercentage: 0,
    readyForSend: false,
  };

  doc.completionPercentage = computeContractCompletion(doc.clauses);
  doc.readyForSend = computeReadyForSend(doc.clauses);

  return doc;
}

// ─── Build Contract with Context ─────────────────────────────────────────────

export function buildContractWithContext(
  templateId: string,
  clientName: string,
  preparedBy: string,
  context: {
    services?: string[];
    investmentSummary?: string;
    proposalId?: string;
  }
): ContractDocument {
  const base = buildContractFromTemplate(templateId, clientName, preparedBy);

  const updatedClauses = base.clauses.map((clause): ContractClause => {
    if (clause.id === "services" && context.services && context.services.length > 0) {
      const servicesList = context.services
        .map((s, i) => `${i + 1}. ${s}`)
        .join("\n");
      const content =
        `Agency agrees to provide the following services to Client during the term of this Agreement:\n\n${servicesList}\n\nThe scope of each service, including deliverables, timelines, and performance benchmarks, is described in the applicable service schedule or statement of work attached hereto and incorporated by reference.`;
      return { ...clause, content, status: "complete" };
    }

    if (clause.id === "investment" && context.investmentSummary) {
      const content =
        `In consideration of the services described herein, Client agrees to pay Agency the fees as follows:\n\n${context.investmentSummary}\n\nAll fees are exclusive of applicable taxes. Agency reserves the right to adjust fees upon sixty (60) days prior written notice at the time of any Renewal Term.`;
      return { ...clause, content, status: "complete" };
    }

    return clause;
  });

  const doc: ContractDocument = {
    ...base,
    clauses: updatedClauses,
    proposalId: context.proposalId,
  };

  doc.completionPercentage = computeContractCompletion(doc.clauses);
  doc.readyForSend = computeReadyForSend(doc.clauses);

  return doc;
}

// ─── Update Contract Clause ───────────────────────────────────────────────────

export function updateContractClause(
  contract: ContractDocument,
  clauseId: ContractClauseId,
  content: string
): ContractDocument {
  const updatedClauses = contract.clauses.map((clause): ContractClause => {
    if (clause.id !== clauseId) return clause;
    const newStatus: ContractClauseStatus =
      content.trim().length === 0 ? "empty" : "complete";
    return { ...clause, content, status: newStatus };
  });

  const updated: ContractDocument = {
    ...contract,
    clauses: updatedClauses,
  };
  updated.completionPercentage = computeContractCompletion(updated.clauses);
  updated.readyForSend = computeReadyForSend(updated.clauses);

  return updated;
}

// ─── Update Contract Terms ────────────────────────────────────────────────────

export function updateContractTerms(
  contract: ContractDocument,
  updates: Partial<Pick<ContractDocument, "paymentTerm" | "termLength">>
): ContractDocument {
  return { ...contract, ...updates };
}
