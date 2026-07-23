export type StandaloneQuestionInput = {
  concept?: string | null;
  question?: string | null;
  explanation?: string | null;
  tags?: readonly string[] | null;
  qualityStatus?: "pending" | "approved" | "quarantined" | null;
};

export type StandaloneQuestionIssueCode =
  | "bundle_marker"
  | "external_question_reference"
  | "missing_question_body"
  | "stem_starts_mid_sentence"
  | "undefined_projection_space";

export type StandaloneQuestionIssue = {
  code: StandaloneQuestionIssueCode;
  message: string;
};

export const STANDALONE_VALIDATOR_VERSION: string;
export function getStandaloneQuestionIssue(
  input: StandaloneQuestionInput
): StandaloneQuestionIssue | null;
export function isStandaloneQuestion(input: StandaloneQuestionInput): boolean;
export function isPublishableQuestion(input: StandaloneQuestionInput): boolean;
export function assertStandaloneQuestion(input: StandaloneQuestionInput): void;
