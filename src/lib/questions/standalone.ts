export type StandaloneQuestionInput = {
  concept?: string | null;
  question?: string | null;
  tags?: readonly string[] | null;
};

export type StandaloneQuestionIssueCode =
  | "bundle_marker"
  | "external_question_reference"
  | "stem_starts_mid_sentence"
  | "undefined_projection_space";

export type StandaloneQuestionIssue = {
  code: StandaloneQuestionIssueCode;
  message: string;
};

const BUNDLE_MARKER = /(?:\(|\[)?\s*(?:공통\s*)?지문\s*\d+\s*(?:\)|\])?/;
const NUMBERED_EXTERNAL_REFERENCE =
  /(?:지문|문제|문항)\s*(?:제\s*)?\d+\s*(?:번)?\s*(?:의|에서|와|과|를|을|결과|변환)|\d+\s*번\s*(?:문제|문항)?\s*(?:의|에서|와|과|를|을)/;
const RELATIVE_EXTERNAL_REFERENCE =
  /(?:앞|이전)(?:의|에서|서)?\s*(?:지문|문제|문항|결과|조건|설명)|(?:앞|전)\s*문항/;

function normalize(value: string | null | undefined): string {
  return String(value ?? "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function startsMidSentence(question: string): boolean {
  const text = question
    .replace(/^\s*(?:\d+[.)]\s*)?/, "")
    .replace(/^\s*(?:\\\(|\\\[|\$+)\s*/, "")
    .trim();
  return /^(?:라|라고|이라|이라고)\s*(?:할|하|놓|두)/.test(text);
}

function projectionSpaceIsUndefined(question: string): boolean {
  const text = question.replace(/\$/g, "");
  const mentionsProjection = /정사영|orthogonal\s*projection|P_?\{?W\}?/i.test(text);
  const mentionsW = /(?:^|[^A-Za-z])W(?:[^A-Za-z]|$)/.test(text);
  if (!mentionsProjection || !mentionsW) return false;

  const definesW =
    /W\s*(?:=|:=|는|은|를|을|라|라고|:)/.test(text) ||
    /(?:부분공간|공간|열공간|해공간|평면|직교여공간)(?:을|를)?\s*W\s*(?:라|라고|로|으로|는|은)/.test(
      text
    ) ||
    /부분공간\s*W|subspace\s*W|공간\s*W|집합\s*W/i.test(text);
  return !definesW;
}

export function getStandaloneQuestionIssue(
  input: StandaloneQuestionInput
): StandaloneQuestionIssue | null {
  const concept = normalize(input.concept);
  const question = normalize(input.question);
  const metadata = [concept, ...(input.tags ?? [])].map(normalize).join("\n");

  if (BUNDLE_MARKER.test(metadata)) {
    return {
      code: "bundle_marker",
      message: "묶음 지문 표시가 있어 단독 출제할 수 없습니다.",
    };
  }
  if (NUMBERED_EXTERNAL_REFERENCE.test(question) || RELATIVE_EXTERNAL_REFERENCE.test(question)) {
    return {
      code: "external_question_reference",
      message: "다른 지문이나 문항을 참조해 단독 출제할 수 없습니다.",
    };
  }
  if (startsMidSentence(question)) {
    return {
      code: "stem_starts_mid_sentence",
      message: "문제 본문이 정의 없이 문장 중간에서 시작합니다.",
    };
  }
  if (projectionSpaceIsUndefined(question)) {
    return {
      code: "undefined_projection_space",
      message: "정사영 대상 공간이 문제 본문에 정의되어 있지 않습니다.",
    };
  }
  return null;
}

export function isStandaloneQuestion(input: StandaloneQuestionInput): boolean {
  return getStandaloneQuestionIssue(input) === null;
}

export function assertStandaloneQuestion(input: StandaloneQuestionInput): void {
  const issue = getStandaloneQuestionIssue(input);
  if (!issue) return;
  throw new Error(
    `${issue.message} 필요한 지문과 조건을 문제 본문에 모두 포함한 뒤 저장해 주세요.`
  );
}
