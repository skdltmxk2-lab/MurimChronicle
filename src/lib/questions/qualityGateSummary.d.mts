export type GateSummaryInput = {
  mode?: "off" | "shadow" | "enforce";
  inspected?: number;
  autoFixed?: unknown[];
  quarantined?: unknown[];
  suspectSkipped?: unknown[];
  suspectUsed?: unknown[];
  warnings?: unknown[];
  downgradeReason?: string | null;
  writeErrors?: number;
};

export function summarizeGateReport(report: GateSummaryInput | null | undefined): string;
