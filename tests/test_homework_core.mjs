import assert from "node:assert/strict";
import test from "node:test";
import {
  applyVerification,
  canAutoPublish,
  emptyFeedback,
  normalizeFeedback,
  normalizeReference,
  parseQuestionNumbers,
  validateQuestionNumbers,
  validateSettings,
} from "../src/lib/homework/core.mjs";

const numbers = ["1", "2"];
const settings = { aiEnabled: true, tone: "polite", depth: "hint", styleGuide: "차분하게 설명", examples: "" };
const feedback = (questionNumber, changes = {}) => ({
  questionNumber, verdict: "correct", studentWork: "$x=1$", errorStep: "", reason: "계산과 조건이 맞습니다.",
  hint: "다음 문제에서도 조건을 확인하세요.", comment: "풀이의 조건 확인이 좋습니다.", sourcePages: [1],
  needsReview: false, reviewReason: "", verified: true, ...changes,
});
const reference = (questionNumber, changes = {}) => ({ questionNumber, problem: "$x+1=2$", answer: "$x=1$", solution: "$x=2-1=1$", sourcePages: [1], needsReview: false, reviewReason: "", ...changes });
const gate = (changes = {}) => ({
  settings: { ...settings }, assignment: { aiEnabled: true, releaseMode: "auto" }, latest: true,
  referenceApproved: true, referenceRevisionMatches: true, numbers: [...numbers],
  feedback: numbers.map((number) => feedback(number)), ...changes,
});

await test("문항 범위와 하위 번호를 보존하며 중복·과다·모호한 번호를 거부한다", () => {
  assert.deepEqual(parseQuestionNumbers("1-3, 4(가) 4(나)"), ["1", "2", "3", "4(가)", "4(나)"]);
  assert.throws(() => parseQuestionNumbers("1-3, 2"));
  assert.throws(() => parseQuestionNumbers("1-61"));
  assert.throws(() => parseQuestionNumbers("3-1"));
  assert.throws(() => validateQuestionNumbers([]));
  assert.throws(() => validateQuestionNumbers(["1", " 1 "]));
  assert.throws(() => validateQuestionNumbers(["../1"]));
});

await test("AI 응답 순서에 관계없이 배부 문항과 연결하고 누락 문항을 확인 필요로 남긴다", () => {
  const result = normalizeFeedback([feedback("2")], numbers);
  assert.deepEqual(result.map((row) => row.questionNumber), numbers);
  assert.equal(result[0].verdict, "review");
  assert.equal(result[0].needsReview, true);
  assert.equal(result[0].verified, false);
  assert.equal(result[1].needsReview, false);
  assert.equal(canAutoPublish(gate({ feedback: result })), false);
  assert.deepEqual(normalizeFeedback([feedback("2"), feedback("1")], numbers).map((row) => row.questionNumber), numbers);
});

await test("중복·예상 밖 문항은 안전하게 전체 연결을 검토 대상으로 만든다", () => {
  for (const values of [[feedback("1"), feedback("1"), feedback("2")], [feedback("1"), feedback("2"), feedback("99")], [feedback("1"), null, feedback("2")]]) {
    const result = normalizeFeedback(values, numbers);
    assert.equal(result.length, 2);
    assert.ok(result.every((row) => row.needsReview));
    assert.equal(canAutoPublish(gate({ feedback: result })), false);
  }
});

await test("불분명한 판정·빈 근거·혼합된 잘못된 페이지가 자동 발송되지 않는다", () => {
  for (const changes of [
    { verdict: "unreadable" }, { verdict: "missing" }, { verdict: "review" }, { verdict: "unexpected" },
    { studentWork: "" }, { comment: "  " }, { sourcePages: [] }, { sourcePages: [1, 999] },
    { sourcePages: [1, 0] }, { sourcePages: [1, "2"] }, { sourcePages: [1, 1.5] }, { needsReview: undefined },
  ]) {
    const row = normalizeFeedback([feedback("1", changes)], ["1"])[0];
    assert.equal(row.needsReview, true, JSON.stringify(changes));
    assert.equal(canAutoPublish(gate({ numbers: ["1"], feedback: [row] })), false);
  }
});

await test("교사용 기준풀이도 누락과 잘못된 페이지를 검토 없이 승인 가능한 결과로 만들지 않는다", () => {
  for (const changes of [{ answer: "" }, { solution: "" }, { problem: "" }, { sourcePages: [] }, { sourcePages: [1, 999] }, { needsReview: undefined }]) {
    assert.equal(normalizeReference([reference("1", changes)], ["1"])[0].needsReview, true);
  }
  assert.ok(normalizeReference([reference("1"), reference("1")], numbers).every((row) => row.needsReview));
});

await test("두 번째 검증은 누락·중복·불일치·문자열 boolean을 승인하지 않는다", () => {
  const rows = numbers.map((number) => feedback(number, { verified: false }));
  const onlyFirst = applyVerification(rows, [{ questionNumber: "1", agrees: true, readable: true }]);
  assert.equal(onlyFirst[0].verified, true);
  assert.equal(onlyFirst[1].verified, false);
  assert.equal(onlyFirst[1].needsReview, true);
  assert.equal(canAutoPublish(gate({ feedback: onlyFirst })), false);
  for (const checks of [
    [{ questionNumber: "1", agrees: true, readable: true }, { questionNumber: "1", agrees: true, readable: true }],
    [{ questionNumber: "1", agrees: true, readable: true }, { questionNumber: "99", agrees: true, readable: true }],
    [{ questionNumber: "1", agrees: "true", readable: true }, { questionNumber: "2", agrees: true, readable: false }],
  ]) assert.ok(applyVerification(rows, checks).every((row) => !row.verified && row.needsReview));
});

await test("두 번째 검증의 동의가 원래의 판독·문항 연결 불확실성을 지우지 않는다", () => {
  const row = feedback("1", { needsReview: true, verified: false, reviewReason: "부호 판독 어려움" });
  const checked = applyVerification([row], [{ questionNumber: "1", agrees: true, readable: true }])[0];
  assert.equal(checked.verified, true);
  assert.equal(checked.needsReview, true);
  assert.equal(checked.reviewReason, "부호 판독 어려움");
  assert.equal(canAutoPublish(gate({ numbers: ["1"], feedback: [checked] })), false);
});

await test("자동 발송은 최신 제출·현재 승인 기준·두 AI 토글·자동 모드를 모두 요구한다", () => {
  assert.equal(canAutoPublish(gate()), true);
  for (const changes of [
    { settings: { ...settings, aiEnabled: false } },
    { assignment: { aiEnabled: false, releaseMode: "auto" } },
    { assignment: { aiEnabled: true, releaseMode: "review" } },
    { latest: false }, { referenceApproved: false }, { referenceRevisionMatches: false },
    { feedback: [feedback("1")] }, { feedback: [feedback("2"), feedback("1")] },
  ]) assert.equal(canAutoPublish(gate(changes)), false, JSON.stringify(changes));
});

await test("자동 발송 gate는 확인 표시만 있고 실제 문항·풀이 근거가 없는 피드백을 거부한다", () => {
  for (const changes of [{ verified: false }, { needsReview: true }, { comment: "" }, { studentWork: "" }, { sourcePages: [] }, { verdict: "unreadable" }]) {
    assert.equal(canAutoPublish(gate({ feedback: [feedback("1", changes), feedback("2")] })), false);
  }
  assert.equal(canAutoPublish(gate({ feedback: [feedback("1", { sourcePages: [1, 999] }), feedback("2")] })), false, "잘못된 페이지가 포함되면 자동 발송을 허용하면 안 됩니다.");
});

await test("설정 boolean과 말투·길이를 검증하고 새 수동 피드백은 확인 필요 상태로 시작한다", () => {
  assert.deepEqual(validateSettings({ ...settings, styleGuide: "  차분하게 설명  " }), settings);
  for (const changes of [{ aiEnabled: "false" }, { tone: "unknown" }, { depth: "unknown" }, { styleGuide: "x".repeat(5001) }, { examples: "x".repeat(10001) }]) assert.throws(() => validateSettings({ ...settings, ...changes }));
  const row = emptyFeedback("1");
  assert.equal(row.questionNumber, "1");
  assert.equal(row.verified, false);
  assert.equal(row.needsReview, true);
  assert.equal(canAutoPublish(gate({ numbers: ["1"], feedback: [row] })), false);
});
