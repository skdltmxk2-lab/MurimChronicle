export type ViewRenderBlock = { type: "normal" | "view"; text: string; showTitle?: boolean };
export const VIEW_MARKER: string;
export const VIEW_MARKER_LINE_RX: RegExp;
export const VIEW_TITLE_LINE_RX: RegExp;
export const STATEMENT_LINE_RX: RegExp;
export function statementBreakOffsets(content: string): number[];
export function breakStatementLists(content: string): string;
export function isViewMarkerStatementLine(line: string, allowPlainLabels?: boolean): boolean;
export function splitRenderBlocks(content: string, options?: { viewBoxes?: boolean }): ViewRenderBlock[];
