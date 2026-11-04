export type GateSummaryInput = {
  mode?: "off" | "shadow" | "enforce";
  inspected?: number;
  autoFixed?: unknown[];
  quarantined?: unknown[];
  suspectSkipped?: unknown[];
  suspectUsed?: unknown[];
  warnings?: unknown[];
  gateFailed?: unknown[];
  downgradeReason?: string | null;
  writeErrors?: number;
  labels?: Record<string, string>;
};

export function summarizeGateReport(report: GateSummaryInput | null | undefined): string;
