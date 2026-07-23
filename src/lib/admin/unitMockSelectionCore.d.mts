import type { Difficulty } from "@/types/exam";

export const ALL_UNIT_VALUE: "__all_units__";

export type UnitMockSelectionDifficulty = "all" | Difficulty;

export type UnitMockSelectionCandidate = {
  id: string;
  unit: string;
  difficulty: Difficulty;
};

export type UnitMockSelectionOptions = {
  subject: string;
  unit: string;
  units: readonly string[];
  count: number;
  difficulty: UnitMockSelectionDifficulty;
};

export type UnitMockSelectionResult<T extends UnitMockSelectionCandidate> = {
  selected: T[];
  selectedByUnit: Partial<Record<string, number>>;
  selectedByDifficulty: Partial<Record<Difficulty, number>>;
};

export function difficultyFallbackOrder(difficulty: UnitMockSelectionDifficulty): Difficulty[];
export function prioritizedUnitsForSubject(subject: string, units: readonly string[]): string[];
export function balancedUnitTargets(
  subject: string,
  units: readonly string[],
  count: number
): Record<string, number>;
export function mergeUnitMockQuestionIds(...groups: readonly string[][]): string[];
export function selectUnitMockCandidates<T extends UnitMockSelectionCandidate>(
  candidates: T[],
  options: UnitMockSelectionOptions
): UnitMockSelectionResult<T>;
