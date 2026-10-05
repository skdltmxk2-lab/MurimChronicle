import type { HomeworkAssignment, HomeworkFeedback, HomeworkReference, HomeworkSettings } from "../../types/homework";
export function validateQuestionNumbers(value: unknown): string[];
export function parseQuestionNumbers(input: string): string[];
export function normalizeReference(value: unknown, numbers: string[]): HomeworkReference[];
export function normalizeFeedback(value: unknown, numbers: string[]): HomeworkFeedback[];
export function emptyFeedback(questionNumber: string): HomeworkFeedback;
export function validateSettings(value: unknown): HomeworkSettings;
export function applyVerification(feedback: HomeworkFeedback[], verification: unknown): HomeworkFeedback[];
export function canAutoPublish(input: { settings: HomeworkSettings; assignment: Pick<HomeworkAssignment, "aiEnabled" | "releaseMode">; latest: boolean; referenceApproved: boolean; referenceRevisionMatches: boolean; feedback: HomeworkFeedback[]; numbers: string[] }): boolean;
