export type GateTier = "block" | "suspect" | "warn" | "fix";
export type GateWorstTier = "block" | "suspect" | "warn" | "fixable" | "clean";
export type GateMode = "off" | "shadow" | "enforce";

export type GateIssue = {
  code: string;
  tier: GateTier;
  field: string;
  message: string;
  evidence: string;
  meta?: Record<string, unknown>;
  fix?: { class: "guarded"; field: string; after: string };
  fixes?: { class: "guarded"; field: string; after: string }[];
};

export type GateResult = {
  id: string;
  fingerprint: string;
  version: string;
  issues: GateIssue[];
  clearedCount: number;
  worstTier: GateWorstTier;
  codes: string[];
};

export type GateAppliedFix = { field: string; codes: string[]; before: string; after: string };

export type GateFixOutcome<T> = {
  fixed: T | null;
  applied: GateAppliedFix[];
  violations: string[];
};

export type GateReportItem = { id: string; codes: string[] };

export type GateReport = {
  mode: GateMode;
  inspected: number;
  autoFixed: GateReportItem[];
  quarantined: GateReportItem[];
  suspectSkipped: GateReportItem[];
  suspectUsed: GateReportItem[];
  warnings: GateReportItem[];
  fixFailed: GateReportItem[];
};

export type GateQuestionLike = { id: string } & Record<string, unknown>;

export const QUALITY_GATE_VERSION: string;
export const GATE_TIERS: GateTier[];
export const GATE_RULES: Record<string, [GateTier, string]>;

export function ruleTier(code: string): GateTier;
export function ruleLabel(code: string): string;
export function contentFingerprint(q: unknown): string;
export function inspectQuestion(q: unknown, options?: { clearances?: Set<string> }): GateResult;
export function codesByTier(result: GateResult): Record<GateTier, string[]>;
export function residualTier(result: GateResult): GateWorstTier;
export function checkFixInvariants(before: unknown, after: unknown): { ok: boolean; violations: string[] };
export function applySafeFixes<T>(q: T, result?: GateResult): GateFixOutcome<T> | null;
export function fixedFieldsToRowPatch(q: unknown, fixed: unknown): Record<string, unknown>;
export function guardedProposals(result: GateResult): { code: string; field: string; after: string }[];
export function applyProposal<T>(q: T, proposal: { field: string; after: string }): T | null;
export function viewLabelsInOption(text: string): string[] | null;
export function statementLabelsInStem(stem: string): Set<string>;
export function explanationFinalValue(explanation: string): number | null;
export function imageUrlsOf(q: unknown): { field: string; url: string }[];
export function checkImages(
  q: unknown,
  fetchFn: (url: string, init: { method: string; signal?: AbortSignal }) => Promise<{ status: number }>,
  options?: { origin?: string; timeoutMs?: number }
): Promise<GateIssue[]>;
export function mergeIssues(result: GateResult, extra: GateIssue[]): GateResult;

export function selectWithGate<T extends GateQuestionLike>(args: {
  candidates: T[];
  count: number;
  select: (pool: T[], count: number) => T[];
  inspect: (q: T) => Promise<GateResult> | GateResult;
  onFixable?: (q: T, result: GateResult) => Promise<T | null>;
  onBlocked?: (q: T, result: GateResult) => Promise<void>;
  onSuspect?: (q: T, result: GateResult) => Promise<void>;
  mode?: GateMode;
  allowSuspectFallback?: boolean;
}): Promise<{ selected: T[]; report: GateReport; wouldChange?: number }>;

export { summarizeGateReport } from "./qualityGateSummary.mjs";
