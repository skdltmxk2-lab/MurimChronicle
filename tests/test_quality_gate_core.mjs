// 출제 시점 품질 게이트 코어 테스트 — node tests/test_quality_gate_core.mjs
import assert from "node:assert/strict";
import {
  GATE_RULES,
  applyProposal,
  applySafeFixes,
  checkFixInvariants,
  checkImages,
  codesByTier,
  contentFingerprint,
  explanationFinalValue,
  fixedFieldsToRowPatch,
  guardedProposals,
  inspectQuestion,
  residualTier,
  selectWithGate,
  statementLabelsInStem,
  summarizeGateReport,
  viewLabelsInOption,
} from "../src/lib/questions/qualityGateCore.mjs";
import { normalizeContent, splitRenderBlocks } from "../scripts/lib/render_pipeline.mjs";

// KaTeX 가 한글 글리프 경고를 찍는다 — 테스트 출력 정리
console.warn = () => {};

const options5 = (texts) => texts.map((text, i) => ({ id: String(i + 1), label: "①②③④⑤"[i], text }));

const base = Object.freeze({
  id: "t-base",
  question: "함수 $f(x)=x^2$ 에 대하여 $f'(1)$ 의 값은?",
  contentType: "latex",
  questionType: "multiple_choice",
  options: options5(["$1$", "$2$", "$3$", "$4$", "$5$"]),
  correctOptionId: "2",
  explanation: "$f'(x)=2x$ 이므로 $f'(1)=2$",
  tags: [],
});
const make = (patch) => ({ ...base, ...patch });
const codes = (q) => inspectQuestion(q).codes;
const has = (q, code) => codes(q).includes(code);

let passed = 0;
function test(name, fn) {
  fn();
  passed += 1;
}
async function testAsync(name, fn) {
  await fn();
  passed += 1;
}

// ── 0. 카탈로그 무결성 ───────────────────────────────────────────────────────
test("every rule has a known tier and label", () => {
  for (const [code, [tier, label]] of Object.entries(GATE_RULES)) {
    assert.ok(["block", "suspect", "warn", "fix"].includes(tier), code);
    assert.ok(label && label.length > 0, code);
  }
});

// ── 1. 깨끗한 문항 ───────────────────────────────────────────────────────────
test("clean question has no issues", () => {
  const result = inspectQuestion(base);
  assert.deepEqual(result.codes, [], JSON.stringify(result.issues, null, 1));
  assert.equal(result.worstTier, "clean");
});

// ── 2. block ────────────────────────────────────────────────────────────────
test("correct option outside options → block", () => {
  const result = inspectQuestion(make({ correctOptionId: "9" }));
  assert.ok(result.codes.includes("correct_option_not_in_options"));
  assert.equal(result.worstTier, "block");
});
test("missing correct option → block", () => {
  assert.ok(has(make({ correctOptionId: "" }), "missing_correct_option"));
});
test("empty option → block", () => {
  assert.ok(has(make({ options: options5(["$1$", "", "$3$", "$4$", "$5$"]) }), "empty_option"));
});
test("odd dollar: block when the renderer shows the stray $, suspect when it repairs it", () => {
  const result = inspectQuestion(make({ question: "함수 $f(x)=x^2 에 대하여 $f'(1)$ 의 값은?" }));
  // 렌더러 판본에 따라 다르다: 고아 $ 를 지우는 판본은 repaired(suspect), 그대로 찍는 판본은 block
  if (result.codes.includes("unbalanced_math_delimiter")) {
    assert.equal(result.worstTier, "block");
  } else {
    assert.ok(result.codes.includes("math_delimiter_repaired"), JSON.stringify(result.codes));
    assert.equal(result.worstTier, "suspect");
  }
});
test("KaTeX failure → math_parse_error", () => {
  assert.ok(has(make({ explanation: "$\\notacommand x = 2$ 이다." }), "math_parse_error"));
});
test("macro outside math → latex_macro_outside_math", () => {
  assert.ok(has(make({ question: "\\frac{1}{2} 의 값은?" }), "latex_macro_outside_math"));
});
test("replacement char → block", () => {
  assert.ok(has(make({ question: "함수 � 의 값은?" }), "replacement_char"));
});
test("missing stem → block", () => {
  assert.ok(has(make({ question: "" }), "missing_question"));
});
test("subjective without answer → block", () => {
  assert.ok(has(make({ questionType: "subjective", options: [], correctOptionId: "", answerText: "" }), "missing_subjective_answer"));
});
test("image content type without image → block", () => {
  assert.ok(has(make({ contentType: "image" }), "content_type_image_without_image"));
});
test("snake_case DB row is understood", () => {
  const row = {
    id: "row-1",
    question: base.question,
    content_type: "latex",
    question_type: "multiple_choice",
    options: base.options,
    correct_option_id: "7",
    explanation: base.explanation,
  };
  assert.ok(inspectQuestion(row).codes.includes("correct_option_not_in_options"));
});

// ── 3. guarded (자동 적용 안 함, 수정안만) ───────────────────────────────────
test("won sign → block with guarded proposal", () => {
  const result = inspectQuestion(make({ question: "₩frac{1}{2} 의 값은?" }));
  assert.ok(result.codes.includes("won_sign_for_backslash"));
  const proposals = guardedProposals(result);
  assert.equal(proposals[0].after, "\\frac{1}{2} 의 값은?");
});
test("control char eaten backslash → proposal restores macro", () => {
  const result = inspectQuestion(make({ explanation: "$\theta = 2$ 이다" })); // JS \t + heta
  assert.ok(result.codes.includes("control_char_in_text"));
  const proposal = guardedProposals(result).find((p) => p.code === "control_char_in_text");
  assert.equal(proposal.after, "$\\theta = 2$ 이다");
});

// ── 4. fix (안전 자동수정) ───────────────────────────────────────────────────
test("html entity decoded outside math only, math untouched", () => {
  const q = make({ question: "$a+b$ 와 A &amp; B 의 값은?" });
  const result = inspectQuestion(q);
  assert.equal(result.worstTier, "fixable");
  const outcome = applySafeFixes(q, result);
  assert.ok(outcome && outcome.fixed, JSON.stringify(outcome));
  assert.equal(outcome.fixed.question, "$a+b$ 와 A & B 의 값은?");
  assert.deepEqual(inspectQuestion(outcome.fixed).codes, []);
});
test("entity inside math is not touched", () => {
  const q = make({ question: "$\\begin{matrix} 1 & 2 \\end{matrix}$ 와 &lt;x&gt; 의 값은?" });
  const outcome = applySafeFixes(q);
  assert.ok(outcome?.fixed, JSON.stringify(outcome));
  assert.ok(outcome.fixed.question.startsWith("$\\begin{matrix} 1 & 2 \\end{matrix}$"));
  assert.ok(outcome.fixed.question.includes("<x>"));
});
test("zero width, nbsp, escaped special, empty math, blank lines all fixed", () => {
  const q = make({
    question: "함수​ $f(x)=x^2$ 에서 확률 50\\% 일 때 $ $ 값은?",
    explanation: "$f'(x)=2x$ 이므로\n\n\n\n$f'(1)=2$",
  });
  const result = inspectQuestion(q);
  const tiers = codesByTier(result);
  for (const code of ["zero_width_char", "nbsp_or_exotic_space", "escaped_special_outside_math", "empty_math_span", "blank_line_run"]) {
    assert.ok(tiers.fix.includes(code), `${code} missing: ${JSON.stringify(tiers)}`);
  }
  const outcome = applySafeFixes(q, result);
  assert.ok(outcome?.fixed, JSON.stringify(outcome));
  assert.ok(!outcome.fixed.question.includes("​"));
  assert.ok(outcome.fixed.question.includes("50%"));
  assert.ok(!/\n\n\n/.test(outcome.fixed.explanation));
  assert.equal(inspectQuestion(outcome.fixed).worstTier, "clean");
});
test("fixes are idempotent", () => {
  const q = make({ question: "A &amp; B​ 의 값은?" });
  const once = applySafeFixes(q).fixed;
  assert.equal(applySafeFixes(once), null);
});
test("choseong jamo labels normalized", () => {
  const q = make({ question: "<보기>\nᄀ. 참이다\nᄂ. 거짓이다\n옳은 것은?" });
  assert.ok(codes(q).includes("choseong_jamo"));
  const fixed = applySafeFixes(q)?.fixed;
  assert.ok(fixed && fixed.question.includes("ㄱ. 참이다"));
});
test("invariants reject a change to digits or math", () => {
  assert.ok(!checkFixInvariants(base, make({ question: base.question.replace("x^2", "x^3") })).ok);
  assert.ok(!checkFixInvariants(make({ question: "A &amp; B 50 의 값은?" }), make({ question: "A & B 51 의 값은?" })).ok);
  assert.ok(!checkFixInvariants(base, make({ correctOptionId: "3" })).ok);
});
test("fix does not run when the question is otherwise blocked (residual tier)", () => {
  const q = make({ question: "A &amp; B 의 값은?", correctOptionId: "9" });
  assert.equal(residualTier(inspectQuestion(q)), "block");
});
test("row patch carries only changed fields", () => {
  const row = { id: "r", question: "A &amp; B 의 값은?", options: base.options, correct_option_id: "2", explanation: base.explanation };
  const outcome = applySafeFixes(row);
  assert.deepEqual(Object.keys(fixedFieldsToRowPatch(row, outcome.fixed)), ["question"]);
});

// ── 5. suspect (기존) ────────────────────────────────────────────────────────
test("duplicate option text → suspect", () => {
  const result = inspectQuestion(make({ options: options5(["$1$", "$2$", "$2$", "$4$", "$5$"]) }));
  assert.ok(result.codes.includes("duplicate_option_text"));
  assert.equal(result.worstTier, "suspect");
});
test("explanation 정답 marker disagrees → explanation_answer_mismatch", () => {
  assert.ok(has(make({ explanation: "$f'(1)=2$ 이다. 정답: ④" }), "explanation_answer_mismatch"));
});
test("figure reference without image → suspect", () => {
  assert.ok(has(make({ question: "다음 그림과 같이 $f(x)$ 의 그래프가 주어질 때 $f(1)$ 의 값은?" }), "figure_reference_without_image"));
});
test("stem cut mid expression → suspect", () => {
  assert.ok(has(make({ question: "함수 $f(x)=x^2$ 에 대하여 f(1) =" }), "stem_ends_mid_expression"));
});

// ── 6. 신규: 보기 라벨 (N1·N2) ───────────────────────────────────────────────
const viewOptions = options5(["ㄱ", "ㄴ", "ㄱ, ㄴ", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ"]);
test("viewLabelsInOption parses combos", () => {
  assert.deepEqual(viewLabelsInOption("ㄱ, ㄴ"), ["ㄱ", "ㄴ"]);
  assert.deepEqual(viewLabelsInOption("$\\text{ㄱ, ㄷ}$"), ["ㄱ", "ㄷ"]);
  assert.deepEqual(viewLabelsInOption("(가), (나)"), ["가", "나"]);
  assert.deepEqual(viewLabelsInOption("ㄱ, ㄴ, ㄷ 모두"), ["ㄱ", "ㄴ", "ㄷ"]);
  assert.equal(viewLabelsInOption("$2$"), null);
  assert.equal(viewLabelsInOption("가장 큰 값"), null);
});
test("statementLabelsInStem finds line-head and parenthesized labels", () => {
  const found = statementLabelsInStem("<보기>\nㄱ. 첫 문장\nㄴ. 둘째 문장\n(ㄷ) 셋째 문장");
  assert.deepEqual([...found].sort(), ["ㄱ", "ㄴ", "ㄷ"]);
});
test("option references a label missing from 보기 → view_label_missing", () => {
  const q = make({
    question: "다음 <보기> 중 옳은 것을 모두 고른 것은?\n<보기>\nㄱ. $f$ 는 연속이다.\nㄴ. $f$ 는 미분가능하다.",
    options: viewOptions,
    correctOptionId: "3",
    explanation: "ㄱ, ㄴ 모두 옳다.",
  });
  const result = inspectQuestion(q);
  const issue = result.issues.find((i) => i.code === "view_label_missing");
  assert.ok(issue, JSON.stringify(result.codes));
  assert.deepEqual(issue.meta.missing, ["ㄷ"]);
});
test("complete 보기 → no view issues", () => {
  const q = make({
    question: "다음 <보기> 중 옳은 것을 모두 고른 것은?\n<보기>\nㄱ. $f$ 는 연속이다.\nㄴ. $f$ 는 미분가능하다.\nㄷ. $f$ 는 유계이다.",
    options: viewOptions,
    correctOptionId: "5",
    explanation: "ㄱ, ㄴ, ㄷ 모두 옳다.",
  });
  const result = inspectQuestion(q);
  assert.ok(!result.codes.includes("view_label_missing"), JSON.stringify(result.codes));
  assert.ok(!result.codes.includes("view_block_not_detected"), JSON.stringify(result.codes));
});
test("label statements without a 보기 box → view_block_not_detected", () => {
  const q = make({
    question: "옳은 것을 모두 고른 것은?\nㄱ. $f$ 는 연속이다.\nㄴ. $f$ 는 미분가능하다.\nㄷ. $f$ 는 유계이다.",
    options: viewOptions,
    correctOptionId: "5",
    explanation: "모두 옳다.",
  });
  // 렌더러가 보기 박스를 만들면 이슈가 없어야 하고, 못 만들면 이슈가 나야 한다 (렌더러 판본 무관)
  const boxed = splitRenderBlocks(normalizeContent(q.question)).some((block) => block.type === "view");
  assert.equal(has(q, "view_block_not_detected"), !boxed, JSON.stringify(codes(q)));
});
// 실데이터 사례 (2026-08-25 뱅크 스냅샷에서 오프라인 dry-run 으로 발견)
test("real case q-white-final-a-r04-10: option 'ㄱ,다' typo → missing 다 + proposal ㄱ,ㄷ", () => {
  const q = make({
    id: "q-white-final-a-r04-10",
    question:
      "$2 \\times 2$ 행렬 $A$ 에 대하여 $A^{2}=4I$ 일 때, 다음 중 옳은 것을 모두 고르면?\n\nㄱ. $A$ 는 $\\operatorname{rank}$ 는 2 이다.\nㄴ. $\\operatorname{det} A=4$ 이면 $A$ 는 대각행렬이다.\nㄷ. $\\operatorname{det} A=-4$ 이면 $\\operatorname{tr} A=0$ 이다.\nㄹ. $\\operatorname{tr}\\left(A^{3}\\right)=0$ 이면 $\\operatorname{det} A=-4$ 이다.",
    options: options5(["ㄱ,ㄴ", "ㄱ,다", "ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ", "ㄱ, ㄴ, ㄷ, ㄹ"]),
    correctOptionId: "2",
    explanation: "ㄱ, ㄷ 이 옳다.",
  });
  const result = inspectQuestion(q);
  const issue = result.issues.find((i) => i.code === "view_label_missing");
  assert.ok(issue, JSON.stringify(result.codes));
  assert.deepEqual(issue.meta.missing, ["다"]);
  const proposals = guardedProposals(result);
  assert.deepEqual(proposals, [{ code: "view_label_missing", field: "option:1", after: "ㄱ,ㄷ" }]);
  const applied = applyProposal(q, proposals[0]);
  assert.equal(applied.options[1].text, "ㄱ,ㄷ");
  assert.ok(!inspectQuestion(applied).codes.includes("view_label_missing"));
});
test("real case q-2019-kookmin-13: statements without 보기 box → proposal inserts <보기>", () => {
  const q = make({
    id: "q-2019-kookmin-13",
    question:
      "$n\\times n$행렬 $A$가 역행렬을 가질 때, 다음 중 **틀린** 것은?\n\nㄱ. $A$의 행렬식 값 $\\det(A)$은 $0$이 아니다.\nㄴ. $Ax=b$는 $\\mathbb{R}^n$의 모든 벡터 $b$에 대해 두 개 이상의 해를 가진다.\nㄷ. $A$의 열벡터들은 일차독립이다.\nㄹ. $A$의 계수 $\\text{rank}(A)=n$이다.",
    options: options5(["ㄱ", "ㄴ", "ㄷ", "ㄹ"]).slice(0, 4),
    correctOptionId: "2",
    explanation: "ㄴ 은 틀렸다. 해가 유일하다.",
  });
  const result = inspectQuestion(q);
  const boxed = splitRenderBlocks(normalizeContent(q.question)).some((block) => block.type === "view");
  if (boxed) {
    // 렌더러가 이미 박스로 그린다(2026-11-02 fbeaae00 이후) — 이슈가 없어야 한다
    assert.ok(!result.codes.includes("view_block_not_detected"), JSON.stringify(result.codes));
    return;
  }
  assert.ok(result.codes.includes("view_block_not_detected"), JSON.stringify(result.codes));
  const [proposal] = guardedProposals(result);
  assert.ok(proposal && proposal.after.includes("\n<보기>\nㄱ."), JSON.stringify(proposal));
  const applied = applyProposal(q, proposal);
  assert.ok(!inspectQuestion(applied).codes.includes("view_block_not_detected"));
});
test("보기 in an image is not judged", () => {
  const q = make({ question: "<보기> 중 옳은 것은?", questionImage: "https://x/y.png", contentType: "mixed", options: viewOptions, correctOptionId: "1" });
  assert.ok(!has(q, "view_label_missing"));
});

// ── 7. 신규: 해설 값 ↔ 정답 (N3) ─────────────────────────────────────────────
test("explanationFinalValue reads marker or last equation", () => {
  assert.equal(explanationFinalValue("따라서 답은 $3$ 이다."), 3);
  assert.equal(explanationFinalValue("$f'(1)=2$"), 2);
  assert.equal(explanationFinalValue("$\\therefore a+b=\\dfrac{1}{2}$"), 0.5);
  assert.equal(explanationFinalValue("설명만 있다."), null);
});
test("explanation value matches a different option → answer_key_mismatch_numeric", () => {
  const result = inspectQuestion(make({ explanation: "계산하면 $f'(1)=3$" }));
  const issue = result.issues.find((i) => i.code === "answer_key_mismatch_numeric");
  assert.ok(issue, JSON.stringify(result.codes));
  assert.equal(issue.meta.matchedPosition, 3);
});
test("explanation value matches no option → no_option_matches_explanation", () => {
  assert.ok(has(make({ explanation: "계산하면 $f'(1)=7$" }), "no_option_matches_explanation"));
});
test("non-numeric options skip N3", () => {
  const q = make({ options: options5(["$x$", "$2$", "$3$", "$4$", "$5$"]), explanation: "$f'(1)=7$" });
  assert.ok(!has(q, "no_option_matches_explanation"));
});

// ── 8. 신규: 선지 성격·번호 (N4·N5) ──────────────────────────────────────────
test("one option carrying a long Korean sentence → option_kind_outlier", () => {
  const q = make({ options: options5(["$1$", "$2$", "$3$", "$4$", "다음 물음에 답하시오 함수의 그래프를 그리면 어떻게 되는가"]) });
  assert.ok(has(q, "option_kind_outlier"), JSON.stringify(codes(q)));
});
test("option text with wrong leading number → option_label_position_mismatch", () => {
  assert.ok(has(make({ options: options5(["③ $1$", "$2$", "$3$", "$4$", "$5$"]) }), "option_label_position_mismatch"));
});

// ── 9. 지문·해제 ─────────────────────────────────────────────────────────────
test("fingerprint is stable and changes with content", () => {
  assert.equal(contentFingerprint(base), contentFingerprint({ ...base }));
  assert.notEqual(contentFingerprint(base), contentFingerprint(make({ explanation: base.explanation + " " })));
  assert.notEqual(contentFingerprint(base), contentFingerprint(make({ correctOptionId: "3" })));
  // camel/snake 같은 내용이면 같은 지문
  const row = { id: base.id, question: base.question, content_type: "latex", question_type: "multiple_choice", options: base.options, correct_option_id: "2", explanation: base.explanation };
  assert.equal(contentFingerprint(base), contentFingerprint(row));
});
test("clearance suppresses only the cleared code for that fingerprint", () => {
  const q = make({ id: "t-c", options: options5(["$1$", "$2$", "$2$", "$4$", "$5$"]) });
  const fp = contentFingerprint(q);
  const cleared = inspectQuestion(q, { clearances: new Set([`t-c|duplicate_option_text|${fp}`]) });
  assert.ok(!cleared.codes.includes("duplicate_option_text"));
  assert.equal(cleared.clearedCount, 1);
  const changed = make({ id: "t-c", options: options5(["$1$", "$2$", "$2$", "$4$", "$6$"]) });
  assert.ok(inspectQuestion(changed, { clearances: new Set([`t-c|duplicate_option_text|${fp}`]) }).codes.includes("duplicate_option_text"));
});

// ── 10. 선택 래퍼 ────────────────────────────────────────────────────────────
const firstN = (pool, n) => pool.slice(0, n);
const good = (id) => make({ id });
const bad = (id) => make({ id, correctOptionId: "9" });
const sus = (id) => make({ id, options: options5(["$1$", "$2$", "$2$", "$4$", "$5$"]) });
const fixable = (id) => make({ id, question: "A &amp; B 의 값은?" });
const gateInspect = async (q) => inspectQuestion(q);

await testAsync("enforce: blocked replaced, suspect skipped, order kept", async () => {
  const blockedCalls = [];
  const suspectCalls = [];
  const { selected, report } = await selectWithGate({
    candidates: [bad("b1"), good("g1"), sus("s1"), good("g2"), good("g3"), good("g4")],
    count: 3,
    select: firstN,
    inspect: gateInspect,
    onBlocked: async (q) => blockedCalls.push(q.id),
    onSuspect: async (q) => suspectCalls.push(q.id),
  });
  assert.deepEqual(selected.map((q) => q.id), ["g1", "g2", "g3"]);
  assert.deepEqual(blockedCalls, ["b1"]);
  assert.deepEqual(suspectCalls, ["s1"]);
  assert.deepEqual(report.quarantined.map((x) => x.id), ["b1"]);
  assert.deepEqual(report.suspectSkipped.map((x) => x.id), ["s1"]);
  assert.equal(report.suspectUsed.length, 0);
});
await testAsync("enforce: suspect used only when clean ones run out", async () => {
  const { selected, report } = await selectWithGate({
    candidates: [good("g1"), sus("s1"), bad("b1"), good("g2")],
    count: 3,
    select: firstN,
    inspect: gateInspect,
  });
  assert.deepEqual(selected.map((q) => q.id), ["g1", "s1", "g2"]);
  assert.deepEqual(report.suspectUsed.map((x) => x.id), ["s1"]);
});
await testAsync("enforce: suspect fallback can be disabled", async () => {
  const { selected } = await selectWithGate({
    candidates: [good("g1"), sus("s1"), good("g2")],
    count: 3,
    select: firstN,
    inspect: gateInspect,
    allowSuspectFallback: false,
  });
  assert.deepEqual(selected.map((q) => q.id), ["g1", "g2"]);
});
await testAsync("enforce: fixable question replaced by its fixed version", async () => {
  const { selected, report } = await selectWithGate({
    candidates: [fixable("f1"), good("g1")],
    count: 2,
    select: firstN,
    inspect: gateInspect,
    onFixable: async (q, result) => applySafeFixes(q, result)?.fixed ?? null,
  });
  assert.equal(selected[0].id, "f1");
  assert.equal(selected[0].question, "A & B 의 값은?");
  assert.deepEqual(report.autoFixed.map((x) => x.id), ["f1"]);
});
await testAsync("enforce: failed fix keeps the question (cosmetic issue only)", async () => {
  const { selected, report } = await selectWithGate({
    candidates: [fixable("f1")],
    count: 1,
    select: firstN,
    inspect: gateInspect,
    onFixable: async () => null,
  });
  assert.deepEqual(selected.map((q) => q.id), ["f1"]);
  assert.deepEqual(report.fixFailed.map((x) => x.id), ["f1"]);
});
await testAsync("enforce: never returns blocked, no duplicates, ≤ count, each inspected once", async () => {
  let inspections = 0;
  const candidates = [];
  for (let i = 0; i < 30; i += 1) candidates.push(i % 3 === 0 ? bad(`b${i}`) : i % 5 === 0 ? sus(`s${i}`) : good(`g${i}`));
  const { selected } = await selectWithGate({
    candidates,
    count: 12,
    select: (pool, n) => [...pool].reverse().slice(0, n), // 다른 결정적 선택기
    inspect: async (q) => {
      inspections += 1;
      return inspectQuestion(q);
    },
  });
  const ids = selected.map((q) => q.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.length <= 12);
  assert.ok(ids.every((id) => !id.startsWith("b")));
  assert.ok(inspections <= candidates.length);
});
await testAsync("shadow: selection unchanged, report says what would happen", async () => {
  let writes = 0;
  const { selected, report, wouldChange } = await selectWithGate({
    candidates: [bad("b1"), good("g1"), sus("s1")],
    count: 2,
    select: firstN,
    inspect: gateInspect,
    onBlocked: async () => { writes += 1; },
    onSuspect: async () => { writes += 1; },
    onFixable: async () => { writes += 1; return null; },
    mode: "shadow",
  });
  assert.deepEqual(selected.map((q) => q.id), ["b1", "g1"]);
  assert.equal(writes, 0);
  assert.deepEqual(report.quarantined.map((x) => x.id), ["b1"]);
  assert.equal(wouldChange, 1);
});
await testAsync("off: plain select, nothing inspected", async () => {
  const { selected, report } = await selectWithGate({
    candidates: [bad("b1"), good("g1")],
    count: 1,
    select: firstN,
    inspect: async () => { throw new Error("must not inspect"); },
    mode: "off",
  });
  assert.deepEqual(selected.map((q) => q.id), ["b1"]);
  assert.equal(report.inspected, 0);
});
await testAsync("shadow: a question that crashes the inspector stays selected and is reported", async () => {
  const poison = make({ id: "p1", question: { toString: "x" } }); // String(value) 가 던지는 JSON 값
  assert.throws(() => inspectQuestion(poison));
  const { selected, report } = await selectWithGate({
    candidates: [poison, good("g1")],
    count: 2,
    select: firstN,
    inspect: gateInspect,
    mode: "shadow",
  });
  assert.deepEqual(selected.map((q) => q.id), ["p1", "g1"]);
  assert.equal(report.inspected, 2);
  assert.deepEqual(report.gateFailed.map((x) => [x.id, x.stage]), [["p1", "inspect"]]);
  assert.ok(report.gateFailed[0].error.length > 0);
});
await testAsync("enforce: inspector and write crashes never stop the selection", async () => {
  const fail = async () => { throw new Error("rpc down"); };
  const { selected, report } = await selectWithGate({
    candidates: [good("g1"), bad("b1"), sus("s1"), fixable("f1"), good("g2"), good("g3")],
    count: 3,
    select: firstN,
    inspect: async (q) => {
      if (q.id === "g1") throw new Error("boom");
      return inspectQuestion(q);
    },
    onBlocked: fail,
    onSuspect: fail,
    onFixable: fail,
  });
  assert.deepEqual(selected.map((q) => q.id), ["g1", "f1", "g2"]);
  assert.deepEqual(report.quarantined.map((x) => x.id), ["b1"]);
  assert.deepEqual(report.fixFailed.map((x) => x.id), ["f1"]);
  assert.deepEqual(report.gateFailed.map((x) => [x.id, x.stage]), [["g1", "inspect"], ["b1", "quarantine"], ["s1", "suspect"], ["f1", "autofix"]]);
});

// ── 11. 이미지 확인 ──────────────────────────────────────────────────────────
await testAsync("image 404 → block, network error → warn, relative path needs origin", async () => {
  const q = make({ questionImage: "https://cdn/x.png", contentType: "mixed", explanationImage: "https://cdn/y.png" });
  const issues = await checkImages(q, async (url) => {
    if (url.endsWith("x.png")) return { status: 404 };
    throw new Error("ECONNRESET");
  });
  assert.deepEqual(issues.map((i) => [i.code, i.tier]), [["image_unreachable", "block"], ["image_check_failed", "warn"]]);
  const relative = make({ questionImage: "/white/a.png", contentType: "mixed" });
  assert.deepEqual(await checkImages(relative, async () => ({ status: 404 })), []);
  assert.equal((await checkImages(relative, async () => ({ status: 404 }), { origin: "https://routrans.com" }))[0].code, "image_unreachable");
});
await testAsync("malformed relative image → check failed, never throws", async () => {
  for (const url of ["//", "//[", "//a b/c.png", "/\\"]) {
    const q = make({ questionImage: url, contentType: "mixed" });
    const issues = await checkImages(q, async () => ({ status: 200 }), { origin: "https://routrans.com" });
    assert.deepEqual(issues.map((i) => i.code), ["image_check_failed"], url);
  }
});

test("summary line for notices", () => {
  assert.equal(summarizeGateReport(null), "");
  assert.equal(summarizeGateReport({ mode: "off", inspected: 5 }), "");
  assert.equal(
    summarizeGateReport({ mode: "enforce", inspected: 12, autoFixed: [{ id: "a", codes: [] }], quarantined: [{ id: "b", codes: [] }], suspectSkipped: [], suspectUsed: [], warnings: [] }),
    "품질 검사 12문항 · 자동 수정 1 · 오류로 교체 1"
  );
  assert.equal(
    summarizeGateReport({ mode: "shadow", inspected: 3, quarantined: [{ id: "b", codes: [] }], suspectSkipped: [], downgradeReason: "migration_missing" }),
    "품질 검사(검사만) 3문항 · 실제 모드였다면 교체 1 · DB 준비 전이라 검사만 실행"
  );
  assert.equal(
    summarizeGateReport({
      mode: "shadow",
      inspected: 4,
      warnings: [{ id: "a", codes: ["missing_explanation"] }, { id: "b", codes: ["image_check_failed"] }, { id: "c", codes: ["missing_explanation"] }, { id: "d", codes: ["new_rule"] }],
      gateFailed: [{ id: "e", stage: "inspect", error: "x" }],
      labels: { new_rule: "새 규칙" },
    }),
    "품질 검사(검사만) 4문항 · 해설 없음 2 · 이미지 확인 실패 1 · 새 규칙 1 · 검사 오류 1"
  );
});

console.log(`quality gate core: ${passed} cases passed`);
