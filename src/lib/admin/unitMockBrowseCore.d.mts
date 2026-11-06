export const BROWSE_DEFAULT_LIMIT: 30;
export const BROWSE_MAX_LIMIT: 60;
export const BROWSE_QUERY_MAX_LENGTH: 100;
export const BROWSE_PREVIEW_LENGTH: 320;

export type BrowseRowLike = {
  id: string;
  unit: string;
  difficulty: string;
  concept?: string | null;
  question?: string | null;
  tags?: readonly string[] | null;
};

export function normalizeBrowseQuery(value: unknown): string;
export function matchesBrowseQuery(row: BrowseRowLike, query: unknown): boolean;
export function compareBrowseRows(
  units: readonly string[]
): (left: BrowseRowLike, right: BrowseRowLike) => number;
export function clampBrowseLimit(value: unknown): number;
export function clampBrowseOffset(value: unknown): number;
export function countBrowseRowsByUnit(rows: readonly { unit: string }[]): Record<string, number>;
export function browsePreviewText(text: unknown, max?: number): string;
