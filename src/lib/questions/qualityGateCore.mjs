// 출제 시점 품질 게이트 — 순수 코어 (설계: DESIGN_quality_gate.md)
//
// 코칭 스튜디오가 문제지를 만들 때 뽑힌 문항을 AI 없이 코드로 검사한다.
//   fix     → 의미가 절대 바뀌지 않는 기계적 수정 (applySafeFixes + checkFixInvariants)
//   block   → 확실한 오류. 격리 + 교체
//   suspect → 의심. 격리하지 않고 이번 문제지에서만 피한다
//   warn    → 인쇄 품질 경고. 배지만
//
// 규칙 로직은 scripts/audit_*_readonly.mjs 의 검사기를 옮겨 왔다(출처를 RULES 주석에 남김).
// 렌더 판정은 앱과 같은 텍스트 파이프라인(scripts/lib/render_pipeline.mjs — 보기 박스 판정은
// src/lib/math/viewBlocks.mjs 를 KaTeXRenderer 와 공유)을 그대로 쓴다.
//
// DB·네트워크 접근 없음. 이미지 확인(checkImages)만 호출자가 fetch 를 주입한다.

import {
  countDollarDelimiters,
  inspectRender,
  isViewMarkerStatementLine,
  normalizeContent,
  splitMath,
  splitMathPreserve,
  splitRenderBlocks,
} from "../../../scripts/lib/render_pipeline.mjs";
import { evalClosedForm } from "./closedForm.mjs";

export const QUALITY_GATE_VERSION = "gate-20261104-v1";

export const GATE_TIERS = ["block", "suspect", "warn", "fix"];
const TIER_RANK = { block: 0, suspect: 1, warn: 2, fix: 3 };

// ─────────────────────────────────────────────────────────────────────────────
// 규칙 카탈로그 — code: [tier, 한국어 설명]
// tier 는 dry-run(설계 §11 단계 2)으로 보정한다. block 은 오탐 0 이 확인된 규칙만.
// ─────────────────────────────────────────────────────────────────────────────
export const GATE_RULES = {
  // 구조 (audit_all_questions_readonly)
  missing_question: ["block", "문제 본문과 이미지가 모두 비어 있음"],
  stem_visually_empty: ["block", "문제 본문이 화면에 아무것도 표시되지 않음"],
  invalid_options_json: ["block", "선지 데이터가 배열이 아님"],
  duplicate_option_id: ["block", "선지 id 중복"],
  missing_correct_option: ["block", "객관식 정답 id 없음"],
  correct_option_not_in_options: ["block", "정답 id가 선지 밖"],
  missing_subjective_answer: ["block", "주관식 정답 없음"],
  missing_answer: ["block", "선지도 정답도 없음"],
  empty_option: ["block", "빈 선지"],
  unusual_option_count: ["suspect", "선지 개수가 비정상(2개 미만 또는 8개 초과)"],
  objective_options_missing: ["suspect", "객관식인데 선지가 없음"],
  explanation_answer_mismatch: ["suspect", "해설의 '정답: n'과 정답 id가 다름"],
  explanation_backtrack: ["suspect", "해설이 중간에 말을 바꿈(정정·답지에 따라 등 초안 흔적)"],
  ocr_artifact: ["suspect", "OCR/원문 변환 흔적이 남아 있음"],
  placeholder_artifact: ["suspect", "OCR 자리표시 토큰이 남아 있음"],
  missing_explanation: ["warn", "해설 없음"],

  // 렌더 (audit_render_breakage / audit_render_readability)
  unbalanced_math_delimiter: ["block", "$ 짝이 안 맞아 수식이 깨짐"],
  math_delimiter_split: ["suspect", "줄·보기 분할이 수식을 갈라 $가 그대로 보임"],
  math_delimiter_repaired: ["suspect", "$ 개수가 홀수(렌더러가 하나를 지워 복구 중 — 주변 수식이 글자로 보일 수 있음)"],
  sub_sup_outside_math: ["suspect", "수식 밖에 ^·_ 가 그대로 보임"],
  math_parse_error: ["block", "수식이 KaTeX로 렌더되지 않음(원문 그대로 표시)"],
  latex_macro_outside_math: ["block", "LaTeX 명령이 수식 밖에서 그대로 보임"],
  replacement_char: ["block", "깨진 글자(�)"],
  mojibake_sequence: ["block", "인코딩이 깨진 글자"],
  won_sign_for_backslash: ["block", "\\ 자리에 ₩ 기호(인코딩 변환 흔적)"],
  control_char_in_text: ["block", "보이지 않는 제어문자(백슬래시가 먹힌 흔적)"],
  content_type_image_without_image: ["block", "이미지 유형인데 문제 이미지가 없음"],
  explanation_content_type_without_image: ["block", "해설이 이미지 유형인데 해설 이미지가 없음"],
  content_type_mixed_without_image: ["suspect", "혼합 유형인데 문제 이미지가 없음"],
  content_type_hides_image: ["suspect", "문제 이미지가 있는데 유형이 latex라 보이지 않음"],
  math_missing_glyph: ["suspect", "수식 안 글자가 렌더되지 않음"],
  hangul_inside_math: ["suspect", "수식 안에 \\text 없이 한글이 있음"],
  bare_latex_word_in_math: ["suspect", "수식 안 명령어의 백슬래시가 빠짐(예: frac)"],
  unbalanced_brace_in_math: ["suspect", "수식 안 중괄호 짝이 안 맞음"],
  left_without_right: ["suspect", "\\left/\\right 짝이 안 맞음"],
  environment_not_closed: ["suspect", "LaTeX 환경(begin/end)이 닫히지 않음"],
  double_escaped_macro: ["suspect", "명령어 앞 백슬래시가 두 번(\\\\frac)"],
  raw_html_tag: ["suspect", "HTML 태그가 그대로 보임"],
  markdown_table_in_text: ["suspect", "마크다운 표 기호가 그대로 보임"],
  authoring_note_visible: ["suspect", "편집 메모가 학생에게 보임"],
  backslash_break_outside_math: ["suspect", "수식 밖 \\\\ 줄바꿈이 그대로 보임"],
  stem_ends_mid_expression: ["suspect", "본문이 연산자·괄호에서 끊김"],
  stem_missing_question_ending: ["suspect", "본문에 질문 어미가 없음(잘림 의심)"],
  figure_reference_without_image: ["suspect", "그림·그래프·표를 언급하는데 이미지가 없음"],
  view_reference_without_view_block: ["suspect", "<보기>를 언급하는데 보기 문장이 없음"],
  duplicate_option_text: ["suspect", "같은 내용의 선지가 2개 이상"],
  options_inlined_in_stem: ["suspect", "선지가 본문 안에도 중복으로 들어 있음"],
  next_stem_inside_option: ["suspect", "선지 안에 다른 문제 본문이 섞임"],

  // 신규 (설계 §3.3) — 표본 보정 전까지 전부 suspect
  view_label_missing: ["suspect", "선지가 가리키는 보기 라벨(ㄱ·ㄴ…)이 본문에 없음"],
  view_block_not_detected: ["suspect", "보기 문장이 있는데 보기 박스로 묶이지 않음"],
  answer_key_mismatch_numeric: ["suspect", "해설의 최종 값이 정답이 아닌 다른 선지와 일치"],
  no_option_matches_explanation: ["suspect", "해설의 최종 값과 일치하는 선지가 없음"],
  option_kind_outlier: ["suspect", "선지 하나만 성격이 다름(다른 문항 내용 혼입 의심)"],
  option_label_position_mismatch: ["suspect", "선지 텍스트 앞 번호가 실제 위치와 다름"],
  print_clip_risk: ["warn", "넓은 수식이 인쇄에서 잘릴 수 있음"],

  // 이미지 (checkImages)
  image_unreachable: ["block", "이미지 파일을 찾을 수 없음(404/403)"],
  image_check_failed: ["warn", "이미지 확인 실패(네트워크)"],

  // 안전 자동수정 (fix)
  html_entity_in_text: ["fix", "HTML 엔티티(&amp; 등)가 그대로 보임"],
  zero_width_char: ["fix", "보이지 않는 폭 0 문자"],
  nbsp_or_exotic_space: ["fix", "특수 공백"],
  blank_line_run: ["fix", "빈 줄이 3개 이상 연속"],
  empty_math_span: ["fix", "빈 수식 구간($ $)"],
  escaped_special_outside_math: ["fix", "수식 밖 \\%·\\& 등에서 백슬래시가 보임"],
  choseong_jamo: ["fix", "보기 라벨이 첫가끝 자모(ᄀ)로 저장됨"],
};

export function ruleTier(code) {
  return GATE_RULES[code]?.[0] ?? "suspect";
}

export function ruleLabel(code) {
  return GATE_RULES[code]?.[1] ?? code;
}

// ─────────────────────────────────────────────────────────────────────────────
// 입력 정규화 — DB 행(snake_case)과 QuestionRecord(camelCase) 모두 받는다
// ─────────────────────────────────────────────────────────────────────────────
function str(value) {
  return value == null ? "" : String(value);
}

export function toGateQuestion(q) {
  const rawOptions = q?.options;
  return {
    id: str(q?.id),
    question: str(q?.question),
    contentType: str(q?.contentType ?? q?.content_type) || "latex",
    questionImage: str(q?.questionImage ?? q?.question_image).trim(),
    questionType: str(q?.questionType ?? q?.question_type) || "multiple_choice",
    optionsValid: Array.isArray(rawOptions),
    options: Array.isArray(rawOptions)
      ? rawOptions.map((option) => ({
          id: str(option?.id),
          label: str(option?.label),
          text: str(option?.text),
          image: str(option?.image).trim(),
        }))
      : [],
    correctOptionId: str(q?.correctOptionId ?? q?.correct_option_id).trim(),
    answerText: str(q?.answerText ?? q?.answer_text),
    explanation: str(q?.explanation),
    explanationContentType: str(q?.explanationContentType ?? q?.explanation_content_type) || "latex",
    explanationImage: str(q?.explanationImage ?? q?.explanation_image).trim(),
  };
}

function isSubjective(g) {
  return g.questionType === "subjective" || (g.options.length === 0 && g.answerText.trim().length > 0);
}

/** 검사 대상 텍스트 필드 목록. field 이름은 이슈 보고와 수정 적용에 같이 쓴다. */
function textFields(g) {
  return [
    { field: "question", text: g.question, isStem: true },
    ...g.options.map((option, index) => ({ field: `option:${index}`, text: option.text })),
    { field: "explanation", text: g.explanation },
    { field: "answer_text", text: g.answerText },
  ];
}

function excerpt(value, max = 200) {
  const text = str(value).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// ─────────────────────────────────────────────────────────────────────────────
// 내용 지문 — 오탐 해제가 "그 내용"에만 유효하도록 (cyrb53, 순수 JS)
// ─────────────────────────────────────────────────────────────────────────────
function cyrb53(input, seed = 0) {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < input.length; i += 1) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}

export function contentFingerprint(q) {
  const g = toGateQuestion(q);
  const canonical = JSON.stringify([
    g.question,
    g.contentType,
    g.questionImage,
    g.questionType,
    g.options.map((option) => [option.id, option.text, option.image]),
    g.correctOptionId,
    g.answerText,
    g.explanation,
    g.explanationContentType,
    g.explanationImage,
  ]);
  return cyrb53(canonical);
}

// ─────────────────────────────────────────────────────────────────────────────
// 필드 단위 검사
// ─────────────────────────────────────────────────────────────────────────────
const CONTROL_CHAR_RX = /[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/;
const CONTROL_ESCAPE_TAILS = {
  "\u0009": { letter: "t", rx: /^(?:heta|imes|ext(?:bf|it|rm)?|an|o|frac|au|riangle|imath)/ },
  "\u0008": { letter: "b", rx: /^(?:eta|egin|inom|ar(?![a-z])|mod|ullet|ot(?![a-z]))/ },
  "\u000C": { letter: "f", rx: /^(?:rac|orall|loor|rown)/ },
  "\u000B": { letter: "v", rx: /^(?:ec(?![a-z])|arepsilon|arphi|dots|space)/ },
};
const REPLACEMENT_RX = /�/;
const MOJIBAKE_RX = /[ÃÂ][\u0080-¿]|â\u0080[\u0090-\u009F]/;
const WON_SIGN_RX = /₩/;
const ZERO_WIDTH_RX = /[­​-‏⁠﻿]/g;
const EXOTIC_SPACE_RX = /[   -   　]/g;
const HTML_ENTITY_RX = /&(?:nbsp|amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g;
const RAW_HTML_RX =
  /<\/?(?:p|br|hr|div|span|b|i|u|s|sub|sup|table|thead|tbody|tr|td|th|em|strong|img|ul|ol|li|font|center|small|mark|code|pre)\b[^>]*>/i;
const SAFE_ESCAPED_SPECIAL_RX = /(?<!\\)\\([<>&%#])/g;
const SUB_SUP_OUTSIDE_MATH_RX = /[\^_](?=[A-Za-z0-9{(])/;
const DOUBLE_ESCAPED_MACRO_RX =
  /(?<!\\)\\\\(?:frac|dfrac|tfrac|sqrt|text|textbf|mathbb|mathbf|mathrm|mathcal|operatorname|begin|end|binom|overline|underline)\s*[{[]/;
// audit_render_breakage 의 큐레이션 목록 — 수식 밖에서 보이면 확실히 깨진 명령어
const MACRO_OUTSIDE_MATH_RX =
  /\\(?:frac|dfrac|tfrac|sqrt|int|iint|iiint|oint|sum|prod|lim|log|ln|sin|cos|tan|sec|csc|cot|det|dim|ker|rank|min|max|inf|sup|left|right|begin|end|mathbb|mathbf|mathrm|mathcal|text|textbf|displaystyle|cdot|cdots|ldots|vdots|ddots|times|div|pm|mp|leq|geq|neq|approx|equiv|infty|alpha|beta|gamma|delta|theta|lambda|mu|pi|sigma|phi|omega|Delta|Gamma|Lambda|Sigma|Phi|Omega|partial|nabla|vec|hat|bar|overline|underline|binom|matrix|pmatrix|bmatrix|vmatrix|array)(?![a-zA-Z])/;
const UNAMBIGUOUS_MACRO_WORDS = [
  "dfrac", "tfrac", "sqrt", "displaystyle", "operatorname", "Rightarrow", "Leftarrow",
  "leftarrow", "rightarrow", "Leftrightarrow", "leftrightarrow", "cdots", "ldots", "vdots",
  "ddots", "varphi", "varepsilon", "infty", "partial", "nabla", "mathbb", "mathrm",
  "mathbf", "mathcal", "overline", "underline", "iint", "oint", "qquad", "forall", "exists",
];
const BARE_MACRO_WORD_RX = new RegExp(
  `(?<![\\\\A-Za-z])(${UNAMBIGUOUS_MACRO_WORDS.join("|")})(?![A-Za-z])`,
);
const TEXT_WRAPPER_RX =
  /\\(?:text|textbf|textit|textrm|textsf|textnormal|mbox|hbox|mathrm|operatorname)\s*\{[^{}]*\}/g;
const HANGUL_RX = /[가-힣]/;
const MARKDOWN_TABLE_RX = /\|[^\n|]*\|[^\n|]*\|/;
const AUTHORING_NOTE_RX = /검토\s*필요|재확인\s*필요|확인\s*바람|TODO|FIXME/;
const SOURCE_ASIDE_RX =
  /원\s*PDF|원문\s*(?:표기|기준|에서는)|출제\s*오류|오타\s*(?:추정|로)|해설\s*기준으로|편집자?\s*주|\(주:/;
const OCR_ARTIFACT_RX =
  /!\[[^\]]*\]\(|cdn\.mathpix|@@SECTION|\\section\*|\\begin\{tabular\}|해설\s*참고|풀이\s*참고|검산\s*후|답지\s*(?:결과|따라)|\bwait\b/i;
const PLACEHOLDER_RX = /\\check\{\}|\\check\{m\}/;
const DANGLING_TAIL_RX = /[+\-*/=<>^_(\[{,·:;\\|~]$/;
const SENTENCE_END_RX =
  /(?:[?？!！.。]|하시오|구하시오|하라|구하라|쓰시오|고르시오|답하시오|것은|값은|얼마인가|무엇인가|구하면|주어진다|하시오\.|오|다|가|요|\]|\)|:)$/;
const CHOSEONG_RX = /[ᄀ-ᄒ](?![ᅡ-ᆧ])/;

function environmentStackProblem(text) {
  const stack = [];
  for (const match of String(text).matchAll(/\\(begin|end)\{([a-zA-Z*]+)\}/g)) {
    if (match[1] === "begin") stack.push(match[2]);
    else if (stack.pop() !== match[2]) return true;
  }
  return stack.length > 0;
}

function push(issues, code, field, evidence, extra) {
  issues.push({
    code,
    tier: ruleTier(code),
    field,
    message: ruleLabel(code),
    evidence: excerpt(evidence),
    ...(extra ?? {}),
  });
}

function checkField(issues, field, rawText, { isStem = false, hasImage = false } = {}) {
  const text = str(rawText);
  if (!text.trim()) return;

  const report = inspectRender(text);
  const literal = report.literalText;

  // ── 인코딩
  if (REPLACEMENT_RX.test(text)) push(issues, "replacement_char", field, text);
  if (MOJIBAKE_RX.test(text)) push(issues, "mojibake_sequence", field, text);
  if (WON_SIGN_RX.test(text)) {
    push(issues, "won_sign_for_backslash", field, text, {
      fix: { class: "guarded", field, after: text.replace(/₩/g, "\\") },
    });
  }
  if (CONTROL_CHAR_RX.test(text)) {
    let proposal = text;
    let recoverable = true;
    proposal = proposal.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u007F]/g, (ch, offset) => {
      const tail = CONTROL_ESCAPE_TAILS[ch];
      if (tail && tail.rx.test(text.slice(offset + 1))) return `\\${tail.letter}`;
      recoverable = false;
      return ch;
    });
    push(issues, "control_char_in_text", field, text, recoverable
      ? { fix: { class: "guarded", field, after: proposal } }
      : undefined);
  }
  ZERO_WIDTH_RX.lastIndex = 0;
  if (ZERO_WIDTH_RX.test(text)) push(issues, "zero_width_char", field, text);
  EXOTIC_SPACE_RX.lastIndex = 0;
  if (EXOTIC_SPACE_RX.test(text)) push(issues, "nbsp_or_exotic_space", field, text);
  if (CHOSEONG_RX.test(text)) push(issues, "choseong_jamo", field, text);

  // ── 수식 밖(보이는 글자)
  HTML_ENTITY_RX.lastIndex = 0;
  if (HTML_ENTITY_RX.test(literal)) push(issues, "html_entity_in_text", field, literal);
  if (RAW_HTML_RX.test(literal)) push(issues, "raw_html_tag", field, literal);
  SAFE_ESCAPED_SPECIAL_RX.lastIndex = 0;
  if (SAFE_ESCAPED_SPECIAL_RX.test(literal)) push(issues, "escaped_special_outside_math", field, literal);
  const macro = literal.match(MACRO_OUTSIDE_MATH_RX);
  if (macro) push(issues, "latex_macro_outside_math", field, literal, { meta: { macro: macro[0] } });
  if (/\\\\/.test(literal)) push(issues, "backslash_break_outside_math", field, literal);
  if (MARKDOWN_TABLE_RX.test(literal)) push(issues, "markdown_table_in_text", field, literal);
  if (AUTHORING_NOTE_RX.test(literal) || (field !== "explanation" && SOURCE_ASIDE_RX.test(literal))) {
    push(issues, "authoring_note_visible", field, literal);
  }
  if (OCR_ARTIFACT_RX.test(text)) push(issues, "ocr_artifact", field, text);
  if (PLACEHOLDER_RX.test(text)) push(issues, "placeholder_artifact", field, text);
  if (DOUBLE_ESCAPED_MACRO_RX.test(text)) push(issues, "double_escaped_macro", field, text);
  if (/\n[ \t]*\n[ \t]*\n/.test(text)) push(issues, "blank_line_run", field, text);

  // ── 수식 구분자
  // 렌더러(normalizeMathDelimiters)는 고아 `$` 하나를 지워 피해를 줄인다. 그래서 저장값이
  // 홀수여도 화면에 `$` 가 남지 않을 수 있다 — 그 경우는 "복구됨"(의심)으로, 화면에 `$` 가
  // 실제로 보이는 경우만 깨짐으로 본다.
  const rawDollars = countDollarDelimiters(text);
  if (/(?<!\\)\$/.test(literal)) {
    push(issues, rawDollars % 2 === 1 ? "unbalanced_math_delimiter" : "math_delimiter_split", field, text, {
      meta: { dollarCount: rawDollars },
    });
  } else if (rawDollars % 2 === 1) {
    push(issues, "math_delimiter_repaired", field, text, { meta: { dollarCount: rawDollars } });
  }
  if (SUB_SUP_OUTSIDE_MATH_RX.test(literal)) push(issues, "sub_sup_outside_math", field, literal);

  // ── 수식 구간
  if (report.mathErrors.length > 0) {
    push(issues, "math_parse_error", field, report.mathErrors[0].math, {
      meta: { katexError: report.mathErrors[0].message, count: report.mathErrors.length },
    });
  }
  if (report.glyphWarnings.length > 0) {
    push(issues, "math_missing_glyph", field, report.glyphWarnings[0].math, {
      meta: { chars: [...new Set(report.glyphWarnings.map((w) => w.char))] },
    });
  }
  let hangulReported = false;
  let braceReported = false;
  let leftRightReported = false;
  let bareReported = false;
  // 빈 수식은 저장값 기준(자동수정 대상), 나머지 구간 검사는 화면에 그려지는 정규화 결과 기준
  if (splitMathPreserve(text).some((segment) => segment.math && !segment.text.trim())) {
    push(issues, "empty_math_span", field, text);
  }
  for (const segment of splitMathPreserve(report.normalized)) {
    if (!segment.math) continue;
    const body = segment.text;
    if (!body.trim()) continue;
    if (!hangulReported && HANGUL_RX.test(body.replace(TEXT_WRAPPER_RX, ""))) {
      push(issues, "hangul_inside_math", field, body);
      hangulReported = true;
    }
    const opens = (body.match(/(?<!\\)\{/g) ?? []).length;
    const closes = (body.match(/(?<!\\)\}/g) ?? []).length;
    if (!braceReported && opens !== closes) {
      push(issues, "unbalanced_brace_in_math", field, body, { meta: { opens, closes } });
      braceReported = true;
    }
    const lefts = (body.match(/\\left(?![a-zA-Z])/g) ?? []).length;
    const rights = (body.match(/\\right(?![a-zA-Z])/g) ?? []).length;
    if (!leftRightReported && lefts !== rights) {
      push(issues, "left_without_right", field, body, { meta: { lefts, rights } });
      leftRightReported = true;
    }
    const withoutEnv = body.replace(/\\(?:begin|end)\s*\{[a-zA-Z*]+\}/g, " ");
    const bare = withoutEnv.match(BARE_MACRO_WORD_RX);
    if (!bareReported && bare) {
      push(issues, "bare_latex_word_in_math", field, body, { meta: { word: bare[1] } });
      bareReported = true;
    }
  }
  if (environmentStackProblem(text)) push(issues, "environment_not_closed", field, text);

  // ── 인쇄 잘림 (N6)
  if ((report.layouts ?? []).some((layout) => layout.scrollable && layout.wide)) {
    push(issues, "print_clip_risk", field, text);
  }

  // ── 본문 전용
  if (isStem) {
    const visible = report.plainText.replace(/\s+/g, " ").trim();
    if (!visible && report.mathSegments.length === 0 && !hasImage) {
      push(issues, "stem_visually_empty", field, text);
    }
    const tail = text.trim();
    const asksSomewhere = /[?？]|하시오|구하시오|고르시오|고른\s*것|하라|쓰시오/.test(tail);
    if (DANGLING_TAIL_RX.test(tail)) {
      push(issues, "stem_ends_mid_expression", field, text);
    } else if (visible.length > 0 && !SENTENCE_END_RX.test(visible) && !asksSomewhere && !hasImage) {
      push(issues, "stem_missing_question_ending", field, text);
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 보기 라벨 (N1·N2)
// ─────────────────────────────────────────────────────────────────────────────
const VIEW_LABELS = ["ㄱ", "ㄴ", "ㄷ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "가", "나", "다", "라", "마", "바", "사", "아"];
const VIEW_LABEL_CLASS = "ㄱㄴㄷㄹㅁㅂㅅㅇ가나다라마바사아";

function toCompatJamo(text) {
  return str(text).replace(/[ᄀ-ᄒ](?![ᅡ-ᆧ])/g, (ch) => {
    const map = { "ᄀ": "ㄱ", "ᄂ": "ㄴ", "ᄃ": "ㄷ", "ᄅ": "ㄹ", "ᄆ": "ㅁ", "ᄇ": "ㅂ", "ᄉ": "ㅅ", "ᄋ": "ㅇ" };
    return map[ch] ?? ch;
  });
}

/** 수식 표기를 걷어낸 선지 텍스트 (\text{ㄱ}, $…$ 등) */
function plainOptionText(text) {
  return toCompatJamo(text)
    .replace(/\\text(?:bf|rm)?\s*\{([^{}]*)\}/g, "$1")
    .replace(/\$/g, "")
    .replace(/\\[,;:! ]|\\quad|\\qquad/g, " ")
    .trim();
}

/**
 * 선지가 "ㄱ, ㄷ" / "(가), (나)" / "ㄱ, ㄴ, ㄷ 모두" 같은 보기 라벨 조합이면 그 라벨들을,
 * 아니면 null 을 돌려준다.
 */
export function viewLabelsInOption(text) {
  const plain = plainOptionText(text)
    .replace(/\s*(?:만|뿐|모두|이다|입니다|이고|와|과)\s*$/g, "")
    .trim();
  if (!plain) return null;
  if (!new RegExp(`^(?:\\(?[${VIEW_LABEL_CLASS}]\\)?)(?:\\s*[,，、및와과]\\s*\\(?[${VIEW_LABEL_CLASS}]\\)?)*$`).test(plain)) {
    return null;
  }
  return [...plain.matchAll(new RegExp(`[${VIEW_LABEL_CLASS}]`, "g"))].map((m) => m[0]);
}

/** 본문에서 진술 라벨로 쓰인 글자들 (줄 머리의 "ㄱ." "(가)" 와 줄 안의 "(ㄱ)") */
export function statementLabelsInStem(stem) {
  const normalized = normalizeContent(toCompatJamo(stem));
  const found = new Set();
  const lineHead = new RegExp(`^\\s*(?:\\(([${VIEW_LABEL_CLASS}])\\)|([${VIEW_LABEL_CLASS}])\\s*[.)])\\s*\\S`);
  const inlineParen = new RegExp(`\\(([${VIEW_LABEL_CLASS}])\\)\\s*\\S`, "g");
  for (const line of normalized.split("\n")) {
    const literalLine = splitMath(line)
      .map((segment) => (segment.math ? " ⟨식⟩ " : segment.text))
      .join("");
    const head = literalLine.match(lineHead);
    if (head) found.add(head[1] ?? head[2]);
    for (const match of literalLine.matchAll(inlineParen)) found.add(match[1]);
  }
  // 수식 안 \text{ㄱ. } 라벨
  for (const match of normalized.matchAll(new RegExp(`\\\\text\\{\\s*\\(?([${VIEW_LABEL_CLASS}])\\)?\\s*[.)]`, "g"))) {
    found.add(match[1]);
  }
  return found;
}

function checkViewLabels(issues, g) {
  if (isSubjective(g) || g.options.length < 3) return;
  const perOption = g.options.map((option) => (option.image ? null : viewLabelsInOption(option.text)));
  // 선지가 (최대 1개 — "없다" 같은 선지 — 를 빼고) 전부 라벨 조합일 때만 보기형 문제로 본다
  const labelOptions = perOption.filter((labels) => labels !== null);
  if (labelOptions.length < 3 || labelOptions.length < g.options.length - 1) return;
  if (g.questionImage) return; // 보기가 그림 안에 있을 수 있다
  const referenced = new Set(labelOptions.flat());
  const present = statementLabelsInStem(g.question);
  const missing = [...referenced].filter((label) => !present.has(label));
  if (missing.length > 0) {
    // 수정안: 빠진 라벨이 같은 자리의 짝 라벨(다↔ㄷ, 가↔ㄱ …)로 본문에 있으면 OCR 오타로 보고
    // 선지 쪽 글자를 바꾸는 안을 낸다. 사람이 확인 후 적용(guarded).
    const fixes = [];
    if (missing.every((label) => present.has(LABEL_COUNTERPART[label]))) {
      g.options.forEach((option, index) => {
        const labels = perOption[index];
        if (!labels || !labels.some((label) => missing.includes(label))) return;
        let after = option.text;
        for (const label of missing) after = after.split(label).join(LABEL_COUNTERPART[label]);
        if (after !== option.text) fixes.push({ class: "guarded", field: `option:${index}`, after });
      });
    }
    push(issues, "view_label_missing", "question", g.question, {
      meta: { missing: missing.sort((a, b) => VIEW_LABELS.indexOf(a) - VIEW_LABELS.indexOf(b)), present: [...present] },
      ...(fixes.length ? { fixes } : {}),
    });
    return;
  }
  // N2: 라벨 문장은 다 있는데 렌더 결과 보기 박스가 없다
  const normalized = normalizeContent(g.question);
  const blocks = splitRenderBlocks(normalized);
  const hasViewBlock = blocks.some((block) => block.type === "view");
  if (!hasViewBlock) {
    const statementLines = normalized.split("\n").filter((line) => isViewMarkerStatementLine(line, true)).length;
    const proposal = proposeViewTitle(g.question);
    push(issues, "view_block_not_detected", "question", g.question, {
      meta: { statementLines },
      ...(proposal ? { fix: { class: "guarded", field: "question", after: proposal } } : {}),
    });
  }
}

const LABEL_COUNTERPART = {
  "ㄱ": "가", "ㄴ": "나", "ㄷ": "다", "ㄹ": "라", "ㅁ": "마", "ㅂ": "바", "ㅅ": "사", "ㅇ": "아",
  "가": "ㄱ", "나": "ㄴ", "다": "ㄷ", "라": "ㄹ", "마": "ㅁ", "바": "ㅂ", "사": "ㅅ", "아": "ㅇ",
};

/**
 * 첫 진술 줄 앞에 "<보기>" 제목 줄을 넣는 수정안. 넣은 결과가 실제로 보기 박스로
 * 렌더될 때만 돌려준다. 수식·진술 내용은 건드리지 않는다.
 */
function proposeViewTitle(stem) {
  const lines = str(stem).split("\n");
  const lineHead = new RegExp(`^\\s*(?:\\(([${VIEW_LABEL_CLASS}])\\)|([${VIEW_LABEL_CLASS}])\\s*[.)])\\s*\\S`);
  const first = lines.findIndex((line) => lineHead.test(toCompatJamo(line)));
  if (first < 0) return null;
  const before = lines.slice(0, first);
  while (before.length && !before[before.length - 1].trim()) before.pop();
  const proposal = [...before, "", "<보기>", ...lines.slice(first)].join("\n").replace(/^\n+/, "");
  const blocks = splitRenderBlocks(normalizeContent(proposal));
  return blocks.some((block) => block.type === "view") ? proposal : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 해설 답 ↔ 정답 (N3) + 기존 explanation_answer_mismatch
// ─────────────────────────────────────────────────────────────────────────────
const CIRCLED = "①②③④⑤⑥⑦⑧⑨";

function explanationAnswerMarker(explanation) {
  const rx = /(?:정답|답)\s*[:：]\s*\(?\s*([1-9][0-9]?|[①②③④⑤⑥⑦⑧⑨])\s*\)?/g;
  const answers = [...str(explanation).matchAll(rx)].map((match) => {
    const index = CIRCLED.indexOf(match[1]);
    return index >= 0 ? String(index + 1) : match[1];
  });
  return answers.length ? answers[answers.length - 1] : "";
}

/** 정답 id 가 "1"~"9" 가 아니면 위치 번호로 바꿔 비교한다 */
function correctPosition(g) {
  const index = g.options.findIndex((option) => option.id === g.correctOptionId || option.label === g.correctOptionId);
  return index >= 0 ? String(index + 1) : "";
}

function numbersAgree(a, b) {
  if (Number.isInteger(a) && Number.isInteger(b)) return a === b;
  return Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));
}

/**
 * 해설의 최종 값: 마지막 "답/정답: <식>" 또는 해설 마지막 수식의 마지막 '=' 오른쪽.
 * 평가 불가면 null.
 */
export function explanationFinalValue(explanation) {
  const text = str(explanation);
  if (!text.trim()) return null;
  const candidates = [];
  // ① 명시적 "답은 $값$" / "정답: $값$"
  const marker = [...text.matchAll(/(?:정답|답)\s*(?:은|는)?\s*[:：]?\s*\$([^$]+)\$/g)];
  if (marker.length) candidates.push(marker[marker.length - 1][1]);
  // ② 괄호 밖(깊이 0)의 마지막 수식. '=' 가 있으면 우변, 없으면 수식 전체
  //    ("…이므로 합 $4$", "최댓값 $\sqrt 2$" 처럼 최종값을 말로 받아 쓰는 해설이 많다).
  //    괄호 안 수식은 "(대칭으로 …=0)" 같은 곁가지 메모라 최종값이 아니다. "참고" 뒤도 제외.
  let depth = 0;
  let afterNote = false;
  let lastSpan = null;
  for (const segment of splitMathPreserve(text)) {
    if (!segment.math) {
      for (const ch of segment.text) {
        if (ch === "(" || ch === "（") depth += 1;
        else if ((ch === ")" || ch === "）") && depth > 0) depth -= 1;
      }
      if (/참고|cf\.|주의/.test(segment.text)) afterNote = true;
      continue;
    }
    if (depth === 0 && !afterNote && segment.text.trim()) lastSpan = segment.text;
  }
  if (lastSpan) {
    const lastLine = lastSpan.split(/\\\\/).pop() ?? lastSpan;
    const parts = lastLine.split(/=(?![^{]*\})/);
    candidates.push(parts[parts.length - 1]);
  }
  for (const candidate of candidates) {
    const value = evalValue(candidate);
    if (value !== null) return value;
  }
  return null;
}

/**
 * evalClosedForm 앞 전처리. schoolMockCore.normalizeMathText 는 `\sqrt 2+1` 을 sqrt(2+1) 로,
 * `\sqrt 2\pi` 를 sqrt(2pi) 로 읽는다(중괄호 없는 근호의 인자를 공백 전까지 통째로 잡음).
 * 여기서 인자를 숫자 하나·문자 하나·\pi 로 한정해 중괄호를 씌운다.
 */
function evalValue(text) {
  const prepared = str(text)
    .replace(/&/g, "")
    .replace(/\\(?:therefore|quad|qquad|displaystyle|left|right)/g, "")
    .replace(/\\sqrt\s*(\d+(?:\.\d+)?|[a-zA-Z]|\\pi)/g, "\\sqrt{$1}")
    .replace(/(?:\\cdot|\.)\s*$/, "");
  if (/\\sqrt\s*\[/.test(prepared)) return null; // n제곱근은 평가기 밖
  return evalClosedForm(prepared);
}

/** 진술 판정형·개수형 해설 — 최종 수식값이 선지값이 아니다 */
function isStatementStyleExplanation(explanation) {
  const text = str(explanation);
  const verdicts = (text.match(/참|거짓|옳다|옳지\s*않다|틀리다|✓|✗/g) ?? []).length;
  if (verdicts >= 2) return true;
  if (/\d+\s*개\s*[.)]?\s*$/.test(text.trim())) return true;
  const labels = (text.match(/(?:^|\s)(?:\([1-9가-다ㄱ-ㄷ]\)|[ㄱㄴㄷㄹ]\.)/g) ?? []).length;
  return labels >= 2;
}

// 해설이 중간에 말을 바꾸는 초안 흔적 — "정정: …", "답지에 따라", "결과 정리하면" 등.
// 정답·해설 중 하나가 틀렸을 가능성이 높다 (실DB 사례: q-daily-int-r30-5, q-2025-sejong-07).
const EXPLANATION_BACKTRACK_RX = [
  /정정\s*[:：]/,
  /재검토/,
  /다시\s*(?:계산|보면|풀면)/,
  /답지(?:에|의)?\s*(?:결과|따라|기준)/,
  /실제\s*(?:답|정답)/,
  /부호와\s*약분/,
  /결과\s*정리하면/,
  /\$\s*\?\s*(?:실제|다시|아니|→)/,
  /잠깐|검산\s*후|출제\s*의도상/,
  /\bwait\b/i,
];

function checkExplanationBacktrack(issues, g) {
  const text = g.explanation;
  if (!text.trim()) return;
  const hits = EXPLANATION_BACKTRACK_RX.filter((rx) => rx.test(text)).map((rx) => text.match(rx)[0]);
  if (hits.length) push(issues, "explanation_backtrack", "explanation", text, { meta: { phrases: hits } });
}

function checkAnswerAgainstExplanation(issues, g) {
  checkExplanationBacktrack(issues, g);
  if (isSubjective(g) || g.options.length < 3) return;
  const correctPos = correctPosition(g);
  const marker = explanationAnswerMarker(g.explanation);
  if (marker && correctPos && marker !== correctPos) {
    push(issues, "explanation_answer_mismatch", "explanation", g.explanation, {
      meta: { correctPosition: correctPos, explanationMarker: marker },
    });
    return;
  }
  // "답: 4" 처럼 번호 표기가 있으면 위에서 번호로 대조했다 — 값 대조는 하지 않는다(4가 번호인지 값인지 모호)
  if (marker) return;
  if (isStatementStyleExplanation(g.explanation)) return;
  const optionValues = g.options.map((option) => (option.image ? null : evalValue(option.text)));
  if (optionValues.some((value) => value === null)) return; // 선지가 전부 닫힌 수치일 때만
  const derived = explanationFinalValue(g.explanation);
  if (derived === null) return;
  const matches = optionValues
    .map((value, index) => (numbersAgree(value, derived) ? index : -1))
    .filter((index) => index >= 0);
  const correctIndex = Number(correctPos) - 1;
  if (matches.includes(correctIndex)) return;
  if (matches.length === 1) {
    push(issues, "answer_key_mismatch_numeric", "correct_option_id", g.explanation, {
      meta: { derived, matchedPosition: matches[0] + 1, correctPosition: correctPos },
    });
  } else if (matches.length === 0) {
    push(issues, "no_option_matches_explanation", "explanation", g.explanation, {
      meta: { derived, optionValues },
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 선지 (구조 + N4·N5)
// ─────────────────────────────────────────────────────────────────────────────
const NEXT_STEM_RX =
  /\[[0-9]+\s*~\s*[0-9]+\]\s*아래\s*글|아래\s*글을\s*읽고\s*물음|다음\s*(?:문제|물음|조건|그림|글)을?\s*(?:읽고|보고|구하|답하)/;

function literalHangulCount(text) {
  return splitMath(str(text))
    .filter((segment) => !segment.math)
    .map((segment) => segment.text)
    .join("")
    .replace(/\\text\s*\{[^{}]*\}/g, "")
    .match(/[가-힣]/g)?.length ?? 0;
}

function checkOptions(issues, g) {
  if (!g.optionsValid) {
    push(issues, "invalid_options_json", "options", "");
    return;
  }
  const ids = g.options.map((option) => option.id).filter(Boolean);
  if (new Set(ids).size !== ids.length) push(issues, "duplicate_option_id", "options", ids.join(","));

  const subjective = isSubjective(g);
  if (subjective) {
    if (!g.answerText.trim()) push(issues, "missing_subjective_answer", "answer_text", "");
    return;
  }
  if (g.options.length === 0) {
    if (!g.answerText.trim()) push(issues, "missing_answer", "correct_option_id", "");
    else push(issues, "objective_options_missing", "options", "");
    return;
  }
  if (!g.correctOptionId) push(issues, "missing_correct_option", "correct_option_id", "");
  else if (!g.options.some((option) => option.id === g.correctOptionId)) {
    push(issues, "correct_option_not_in_options", "correct_option_id", g.correctOptionId, {
      meta: { optionIds: g.options.map((option) => option.id) },
    });
  }
  if (g.options.length < 2 || g.options.length > 8) {
    push(issues, "unusual_option_count", "options", String(g.options.length));
  }

  const seen = new Map();
  g.options.forEach((option, index) => {
    if (!option.text.trim() && !option.image) push(issues, "empty_option", `option:${index}`, "");
    const key = option.text.replace(/\s+/g, "").replace(/^\$|\$$/g, "");
    if (key) {
      if (seen.has(key)) push(issues, "duplicate_option_text", `option:${index}`, option.text, { meta: { duplicateOf: seen.get(key) } });
      else seen.set(key, index);
    }
    if (NEXT_STEM_RX.test(option.text)) push(issues, "next_stem_inside_option", `option:${index}`, option.text);
    // N5: 선지 텍스트 앞에 남은 번호가 위치와 다름
    const head = option.text.trim().match(/^(?:([①②③④⑤⑥⑦⑧⑨])|\(([1-9])\)|([1-9])\.)\s+/);
    if (head) {
      const labelPos = head[1] ? CIRCLED.indexOf(head[1]) + 1 : Number(head[2] ?? head[3]);
      if (labelPos !== index + 1) {
        push(issues, "option_label_position_mismatch", `option:${index}`, option.text, {
          meta: { labelPosition: labelPos, actualPosition: index + 1 },
        });
      }
    }
  });

  // N4: 하나만 성격이 다른 선지
  if (g.options.length >= 4 && g.options.every((option) => !option.image)) {
    const hangul = g.options.map((option) => literalHangulCount(option.text));
    const outliers = hangul.map((count, index) => (count >= 15 ? index : -1)).filter((index) => index >= 0);
    const shortOthers = hangul.filter((count) => count <= 2).length;
    if (outliers.length === 1 && shortOthers === g.options.length - 1) {
      push(issues, "option_kind_outlier", `option:${outliers[0]}`, g.options[outliers[0]].text);
    }
  }

  // 선지가 본문에도 중복으로 들어 있음
  const optionsArePointers = g.options.every((option) =>
    /^(?:[①②③④⑤⑥⑦⑧⑨](?:\s*[,，]\s*[①②③④⑤⑥⑦⑧⑨])*(?:\s*(?:만|뿐|모두))?|모두[^\n]{0,12})$/u.test(option.text.trim()),
  );
  const circledInStem = (g.question.match(/[①②③④⑤⑥⑦⑧⑨]/g) ?? []).length;
  if (circledInStem >= 3 && !optionsArePointers) {
    push(issues, "options_inlined_in_stem", "question", g.question, { meta: { circledInStem } });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 그림·보기 참조, 콘텐츠 유형
// ─────────────────────────────────────────────────────────────────────────────
const FIGURE_REFERENCE_RX =
  /(?:다음|아래|위)\s*(?:그림|그래프|도형|표)|그림과\s*같|그래프가?\s*(?:주어|나타)|도형과\s*같|그림에서|(?<![가-힣])표에서|그림\s*[1-9]|<그림/;

function checkReferencesAndTypes(issues, g) {
  const stem = g.question;
  const hasImage = Boolean(g.questionImage);
  const hasDrawnMath = /\\begin\{(?:tikzpicture|picture|array|tabular)\}/.test(stem);
  if (FIGURE_REFERENCE_RX.test(stem) && !hasImage && !hasDrawnMath) {
    push(issues, "figure_reference_without_image", "question_image", stem);
  }
  const mentionsView = /<\s*보기\s*>|\[\s*보기\s*\]|보기\s*(?:에서|중|의|를|가)/.test(stem);
  if (mentionsView && !hasImage) {
    const normalized = normalizeContent(stem);
    const blocks = splitRenderBlocks(normalized);
    const statementLines = normalized.split("\n").filter((line) => isViewMarkerStatementLine(line, true)).length;
    const hasViewBlock = blocks.some((block) => block.type === "view") || statementLines >= 2;
    const viewMeansOptions = /보기\s*(?:중|에서|의)/.test(stem) && statementLines === 0 && g.options.length > 0;
    if (!hasViewBlock && !viewMeansOptions) push(issues, "view_reference_without_view_block", "question", stem);
  }
  if (g.contentType === "image" && !hasImage) push(issues, "content_type_image_without_image", "content_type", stem);
  if (g.contentType === "mixed" && !hasImage) push(issues, "content_type_mixed_without_image", "content_type", stem);
  if (g.contentType === "latex" && hasImage) push(issues, "content_type_hides_image", "content_type", g.questionImage);
  if (g.explanationContentType === "image" && !g.explanationImage) {
    push(issues, "explanation_content_type_without_image", "explanation_content_type", g.explanation);
  }
  if (!g.explanation.trim() && !g.explanationImage) push(issues, "missing_explanation", "explanation", "");
}

// ─────────────────────────────────────────────────────────────────────────────
// 메인 검사
// ─────────────────────────────────────────────────────────────────────────────
function worstTierOf(issues) {
  let worst = "clean";
  let rank = 99;
  for (const issue of issues) {
    const r = TIER_RANK[issue.tier] ?? 99;
    if (r < rank) {
      rank = r;
      worst = issue.tier === "fix" ? "fixable" : issue.tier;
    }
  }
  return worst;
}

/**
 * @param q DB 행 또는 QuestionRecord
 * @param options.clearances Set("questionId|code|fingerprint") — 사람이 오탐으로 해제한 이슈
 */
export function inspectQuestion(q, options = {}) {
  const g = toGateQuestion(q);
  const fingerprint = contentFingerprint(q);
  const issues = [];

  if (!g.question.trim() && !g.questionImage) push(issues, "missing_question", "question", "");
  for (const item of textFields(g)) {
    checkField(issues, item.field, item.text, { isStem: item.isStem, hasImage: Boolean(g.questionImage) });
  }
  checkOptions(issues, g);
  checkReferencesAndTypes(issues, g);
  checkViewLabels(issues, g);
  checkAnswerAgainstExplanation(issues, g);

  const clearances = options.clearances;
  const effective = clearances
    ? issues.filter((issue) => !clearances.has(`${g.id}|${issue.code}|${fingerprint}`))
    : issues;
  const cleared = issues.length - effective.length;

  return {
    id: g.id,
    fingerprint,
    version: QUALITY_GATE_VERSION,
    issues: effective,
    clearedCount: cleared,
    worstTier: worstTierOf(effective),
    codes: [...new Set(effective.map((issue) => issue.code))],
  };
}

/** 등급별 코드 목록 */
export function codesByTier(result) {
  const out = { block: [], suspect: [], warn: [], fix: [] };
  for (const issue of result.issues) {
    if (!out[issue.tier].includes(issue.code)) out[issue.tier].push(issue.code);
  }
  return out;
}

/** 수정 불가 시 남는 등급 (fix 이슈는 미관상 문제라 수정 실패해도 통과로 본다) */
export function residualTier(result) {
  return worstTierOf(result.issues.filter((issue) => issue.tier !== "fix"));
}

// ─────────────────────────────────────────────────────────────────────────────
// 안전 자동수정
// ─────────────────────────────────────────────────────────────────────────────
function decodeEntity(entity) {
  const named = { "&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": "\"", "&apos;": "'" };
  if (named[entity]) return named[entity];
  const num = entity.match(/^&#(\d+);$/);
  const hex = entity.match(/^&#x([0-9a-fA-F]+);$/);
  const code = num ? Number(num[1]) : hex ? parseInt(hex[1], 16) : NaN;
  if (!Number.isFinite(code) || code < 0x20 || code === 0x7f || code > 0x10ffff) return entity;
  return String.fromCodePoint(code);
}

/** 수식 밖 구간에만 fn 적용 */
function mapLiteral(text, fn) {
  return splitMathPreserve(text)
    .map((segment) => (segment.math ? segment.raw : fn(segment.raw)))
    .join("");
}

const FIXERS = {
  html_entity_in_text: (text) => mapLiteral(text, (part) => part.replace(HTML_ENTITY_RX, decodeEntity)),
  zero_width_char: (text) => text.replace(ZERO_WIDTH_RX, ""),
  nbsp_or_exotic_space: (text) => text.replace(EXOTIC_SPACE_RX, " "),
  blank_line_run: (text) => text.replace(/\n(?:[ \t]*\n){2,}/g, "\n\n"),
  empty_math_span: (text) =>
    splitMathPreserve(text)
      .map((segment) => (segment.math && !segment.text.trim() ? " " : segment.raw))
      .join(""),
  escaped_special_outside_math: (text) => mapLiteral(text, (part) => part.replace(SAFE_ESCAPED_SPECIAL_RX, "$1")),
  choseong_jamo: (text) => toCompatJamo(text),
};
// 적용 순서: 보이지 않는 문자 → 공백 → 엔티티 → 이스케이프 → 빈 수식 → 빈 줄
const FIX_ORDER = [
  "zero_width_char",
  "nbsp_or_exotic_space",
  "choseong_jamo",
  "html_entity_in_text",
  "escaped_special_outside_math",
  "empty_math_span",
  "blank_line_run",
];

function getField(g, field) {
  if (field.startsWith("option:")) return g.options[Number(field.slice(7))]?.text ?? "";
  return { question: g.question, explanation: g.explanation, answer_text: g.answerText }[field] ?? "";
}

function withFieldValue(q, field, value) {
  const next = { ...q };
  if (field.startsWith("option:")) {
    const index = Number(field.slice(7));
    next.options = (q.options ?? []).map((option, i) => (i === index ? { ...option, text: value } : option));
    return next;
  }
  if (field === "question") next.question = value;
  else if (field === "explanation") next.explanation = value;
  else if (field === "answer_text") {
    if ("answer_text" in q) next.answer_text = value;
    else next.answerText = value;
  }
  return next;
}

/** 수식 구간 서명 (공백 제거, 빈 구간 제외) */
function mathSignature(text) {
  return splitMathPreserve(str(text))
    .filter((segment) => segment.math && segment.text.trim())
    .map((segment) => segment.text.replace(/\s+/g, ""))
    .join("\u0001");
}

/** 수식 밖 숫자열 (엔티티 제거 후) */
function literalDigits(text) {
  return splitMath(str(text))
    .filter((segment) => !segment.math)
    .map((segment) => segment.text.replace(HTML_ENTITY_RX, ""))
    .join("")
    .replace(/[^0-9]/g, "");
}

/**
 * 수정 전후 불변식 (설계 §4.2)
 */
export function checkFixInvariants(before, after) {
  const a = toGateQuestion(before);
  const b = toGateQuestion(after);
  const violations = [];
  if (a.options.length !== b.options.length) violations.push("option_count");
  if (a.options.some((option, i) => option.id !== b.options[i]?.id)) violations.push("option_ids");
  if (a.options.some((option, i) => option.image !== b.options[i]?.image)) violations.push("option_images");
  if (a.correctOptionId !== b.correctOptionId) violations.push("correct_option_id");
  if (a.questionImage !== b.questionImage || a.explanationImage !== b.explanationImage) violations.push("images");
  if (a.contentType !== b.contentType || a.explanationContentType !== b.explanationContentType) violations.push("content_types");
  const fieldsA = textFields(a);
  const fieldsB = textFields(b);
  fieldsA.forEach((item, i) => {
    const other = fieldsB[i]?.text ?? "";
    if (mathSignature(item.text) !== mathSignature(other)) violations.push(`math_signature:${item.field}`);
    if (literalDigits(item.text) !== literalDigits(other)) violations.push(`literal_digits:${item.field}`);
  });
  const resultAfter = inspectQuestion(after);
  const resultBefore = inspectQuestion(before);
  if (resultAfter.issues.some((issue) => issue.tier === "block") &&
      !resultBefore.issues.some((issue) => issue.tier === "block")) {
    violations.push("introduced_block");
  }
  const beforeFix = resultBefore.issues.filter((issue) => issue.tier === "fix").length;
  const afterFix = resultAfter.issues.filter((issue) => issue.tier === "fix").length;
  if (afterFix >= beforeFix) violations.push("no_progress");
  const newCodes = resultAfter.codes.filter((code) => !resultBefore.codes.includes(code));
  if (newCodes.length) violations.push(`new_issues:${newCodes.join(",")}`);
  return { ok: violations.length === 0, violations };
}

/**
 * fix 등급 이슈를 전부 적용한다.
 *  - 적용할 fix 가 없으면 null
 *  - 불변식 실패면 { fixed: null, violations } (수정하지 않음)
 *  - 성공이면 { fixed, applied }
 * 반환 fixed 는 입력과 같은 모양이다.
 *
 * DB 에 저장할 때는 반드시 **DB 행(snake_case)** 을 넣는다. QuestionRecord 는 fromQuestionDb 가
 * 주관식의 선지를 비우고 answerText 를 선지에서 끌어오므로, 레코드로 만든 패치를 쓰면
 * DB 의 원래 선지가 지워질 수 있다.
 */
export function applySafeFixes(q, result = inspectQuestion(q)) {
  const fixIssues = result.issues.filter((issue) => issue.tier === "fix" && FIXERS[issue.code]);
  if (fixIssues.length === 0) return null;
  const g = toGateQuestion(q);
  const fieldsToFix = new Map();
  for (const issue of fixIssues) {
    if (!fieldsToFix.has(issue.field)) fieldsToFix.set(issue.field, new Set());
    fieldsToFix.get(issue.field).add(issue.code);
  }
  let next = q;
  const applied = [];
  for (const [field, codes] of fieldsToFix) {
    const before = getField(g, field);
    let value = before;
    for (const code of FIX_ORDER) {
      if (codes.has(code)) value = FIXERS[code](value);
    }
    if (value !== before) {
      next = withFieldValue(next, field, value);
      applied.push({ field, codes: [...codes], before, after: value });
    }
  }
  if (applied.length === 0) return null;
  const invariants = checkFixInvariants(q, next);
  if (!invariants.ok) return { fixed: null, applied, violations: invariants.violations };
  // 멱등성: 한 번 더 돌려도 바뀌지 않아야 한다
  const again = applySafeFixes(next);
  if (again && again.fixed) return { fixed: null, applied, violations: ["not_idempotent"] };
  return { fixed: next, applied, violations: [] };
}

/** DB update 용: 수정된 필드만 snake_case 로 */
export function fixedFieldsToRowPatch(q, fixed) {
  const a = toGateQuestion(q);
  const b = toGateQuestion(fixed);
  const patch = {};
  if (a.question !== b.question) patch.question = b.question;
  if (a.explanation !== b.explanation) patch.explanation = b.explanation;
  if (a.answerText !== b.answerText) patch.answer_text = b.answerText;
  if (a.options.some((option, i) => option.text !== b.options[i].text)) {
    patch.options = (fixed.options ?? []).map((option) => ({ ...option }));
  }
  return patch;
}

/** guarded 수정안 목록 (자동 적용하지 않고 로그에 저장) */
export function guardedProposals(result) {
  const out = [];
  for (const issue of result.issues) {
    const fixes = [...(issue.fix ? [issue.fix] : []), ...(issue.fixes ?? [])];
    for (const fix of fixes) {
      if (fix.class === "guarded") out.push({ code: issue.code, field: fix.field ?? issue.field, after: fix.after });
    }
  }
  return out;
}

/**
 * guarded 수정안을 문항에 적용한 사본 (검토 화면의 "수정안 적용"). 적용 후 불변식 중
 * 구조(선지 수·id·정답·이미지)만 확인한다 — 수정안은 글자를 바꾸는 것이 목적이므로
 * 수식 서명·숫자 불변식은 적용하지 않는다.
 */
export function applyProposal(q, proposal) {
  const next = withFieldValue(q, proposal.field, proposal.after);
  const a = toGateQuestion(q);
  const b = toGateQuestion(next);
  const structuralOk =
    a.options.length === b.options.length &&
    a.options.every((option, i) => option.id === b.options[i].id && option.image === b.options[i].image) &&
    a.correctOptionId === b.correctOptionId &&
    a.questionImage === b.questionImage &&
    a.explanationImage === b.explanationImage;
  return structuralOk ? next : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 이미지 확인 (N7) — fetch 주입
// ─────────────────────────────────────────────────────────────────────────────
export function imageUrlsOf(q) {
  const g = toGateQuestion(q);
  const urls = [];
  if (g.questionImage) urls.push({ field: "question_image", url: g.questionImage });
  if (g.explanationImage) urls.push({ field: "explanation_image", url: g.explanationImage });
  g.options.forEach((option, index) => {
    if (option.image) urls.push({ field: `option_image:${index}`, url: option.image });
  });
  return urls.filter((item) => !item.url.startsWith("data:"));
}

/**
 * @param fetchFn (url, init) => Promise<{ status:number }>
 * @param options.origin 상대 경로 이미지 기준 주소
 */
export async function checkImages(q, fetchFn, options = {}) {
  const timeoutMs = options.timeoutMs ?? 3000;
  const issues = [];
  for (const item of imageUrlsOf(q)) {
    let url = item.url;
    if (url.startsWith("/")) {
      if (!options.origin) continue;
      url = new URL(url, options.origin).toString();
    }
    try {
      const controller = typeof AbortController === "function" ? new AbortController() : null;
      const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
      let response;
      try {
        response = await fetchFn(url, { method: "HEAD", signal: controller?.signal });
      } finally {
        if (timer) clearTimeout(timer);
      }
      if ([403, 404, 410].includes(response.status)) {
        push(issues, "image_unreachable", item.field, item.url, { meta: { status: response.status } });
      } else if (response.status >= 400) {
        push(issues, "image_check_failed", item.field, item.url, { meta: { status: response.status } });
      }
    } catch (error) {
      push(issues, "image_check_failed", item.field, item.url, { meta: { error: String(error?.message ?? error) } });
    }
  }
  return issues;
}

/** 이미지 이슈를 기존 검사 결과에 합친다 */
export function mergeIssues(result, extraIssues) {
  if (!extraIssues.length) return result;
  const issues = [...result.issues, ...extraIssues];
  return { ...result, issues, worstTier: worstTierOf(issues), codes: [...new Set(issues.map((i) => i.code))] };
}

// ─────────────────────────────────────────────────────────────────────────────
// 선택 래퍼 (설계 §6.1)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * @param args.candidates 후보 배열 (호출자가 섞은 순서 유지)
 * @param args.count 필요한 문항 수
 * @param args.select (pool, count) => picked[] — 결정적이어야 한다(같은 pool → 같은 결과)
 * @param args.inspect async (q) => result  (호출자가 메모·이미지 검사를 붙인다)
 * @param args.onFixable async (q, result) => fixedQ | null   (DB 저장까지. null = 수정 실패)
 * @param args.onBlocked async (q, result) => void   (격리)
 * @param args.onSuspect async (q, result) => void   (의심 기록)
 * @param args.mode "off" | "shadow" | "enforce"
 * @param args.allowSuspectFallback 깨끗한 후보가 모자랄 때 의심 문항 사용 (D2)
 */
export async function selectWithGate(args) {
  const {
    candidates,
    count,
    select,
    inspect,
    onFixable = async () => null,
    onBlocked = async () => {},
    onSuspect = async () => {},
    mode = "enforce",
    allowSuspectFallback = true,
  } = args;

  const report = {
    mode,
    inspected: 0,
    autoFixed: [],
    quarantined: [],
    suspectSkipped: [],
    suspectUsed: [],
    warnings: [],
    fixFailed: [],
  };

  if (mode === "off") return { selected: select(candidates, count), report };

  const results = new Map(); // id → result
  const inspectOnce = async (q) => {
    if (results.has(q.id)) return results.get(q.id);
    const result = await inspect(q);
    results.set(q.id, result);
    report.inspected += 1;
    return result;
  };

  if (mode === "shadow") {
    const picked = select(candidates, count);
    for (const q of picked) {
      const result = await inspectOnce(q);
      const byTier = codesByTier(result);
      if (byTier.block.length) report.quarantined.push({ id: q.id, codes: byTier.block });
      else if (byTier.suspect.length) report.suspectSkipped.push({ id: q.id, codes: byTier.suspect });
      if (byTier.fix.length) report.autoFixed.push({ id: q.id, codes: byTier.fix });
      if (byTier.warn.length) report.warnings.push({ id: q.id, codes: byTier.warn });
    }
    return { selected: picked, report, wouldChange: report.quarantined.length + report.suspectSkipped.length };
  }

  const blocked = new Set();
  const suspect = new Set();
  const fixedById = new Map();
  const handled = new Set();

  const classify = async (q) => {
    if (handled.has(q.id)) return;
    handled.add(q.id);
    const result = await inspectOnce(q);
    const byTier = codesByTier(result);
    const residual = residualTier(result);
    if (residual === "block") {
      // 격리할 문항은 고치지 않는다 — 미관 수정은 나중에 사람이 고칠 때 함께
      blocked.add(q.id);
      report.quarantined.push({ id: q.id, codes: byTier.block });
      await onBlocked(q, result);
      return;
    }
    if (byTier.fix.length) {
      const fixed = await onFixable(q, result);
      if (fixed) {
        fixedById.set(q.id, fixed);
        report.autoFixed.push({ id: q.id, codes: byTier.fix });
      } else {
        report.fixFailed.push({ id: q.id, codes: byTier.fix });
      }
    }
    if (residual === "suspect") {
      suspect.add(q.id);
      await onSuspect(q, result);
    }
    if (byTier.warn.length) report.warnings.push({ id: q.id, codes: byTier.warn });
  };

  const runPhase = async (allowSuspect) => {
    // 매 반복 rejected 가 늘거나 종료하므로 후보 수 + 1 회 안에 끝난다
    for (let guard = 0; guard <= candidates.length + 1; guard += 1) {
      const pool = candidates.filter(
        (q) => !blocked.has(q.id) && (allowSuspect || !suspect.has(q.id)),
      );
      const picked = select(pool, count);
      let changed = false;
      for (const q of picked) {
        if (!handled.has(q.id)) {
          await classify(q);
          if (blocked.has(q.id) || (!allowSuspect && suspect.has(q.id))) changed = true;
        }
      }
      if (!changed) return picked;
    }
    return select(
      candidates.filter((q) => !blocked.has(q.id) && (allowSuspect || !suspect.has(q.id))),
      count,
    );
  };

  let picked = await runPhase(false);
  if (picked.length < count && allowSuspectFallback && suspect.size > 0) {
    picked = await runPhase(true);
  }
  for (const q of picked) {
    if (suspect.has(q.id)) {
      report.suspectUsed.push({ id: q.id, codes: codesByTier(results.get(q.id)).suspect });
    }
  }
  const pickedIds = new Set(picked.map((q) => q.id));
  for (const id of suspect) {
    if (!pickedIds.has(id)) report.suspectSkipped.push({ id, codes: codesByTier(results.get(id)).suspect });
  }
  // 경고는 실제로 쓰인 문항만 보고한다. 자동수정은 DB 에 이미 반영됐으므로 전부 보고한다.
  report.warnings = report.warnings.filter((item) => pickedIds.has(item.id));
  return { selected: picked.map((q) => fixedById.get(q.id) ?? q), report };
}


// 화면 알림용 요약은 클라이언트 번들에서도 쓰므로 import 없는 별도 모듈에 둔다.
export { summarizeGateReport } from "./qualityGateSummary.mjs";
