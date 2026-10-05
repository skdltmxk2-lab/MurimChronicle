import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import * as core from "../src/lib/homework/core.mjs";

// Exercise the real TypeScript processor. All PDFs, AI responses and DB rows below
// are synthetic in-memory fixtures. RPC mocks model the atomic database contract;
// they do not replace execution of the SQL migration against a PostgreSQL runtime.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const clone = (value) => structuredClone(value);
const ok = (data) => ({ data, error: null });
const ids = { submission: "test-submission", assignment: "test-assignment", material: "test-material", user: "test-user" };
const settingsFixture = { aiEnabled: true, tone: "polite", depth: "hint", styleGuide: "간결하고 차분하게", examples: "" };
const feedbackFixture = (changes = {}) => ({ questionNumber: "1", verdict: "correct", studentWork: "$x=1$", errorStep: "", reason: "조건과 계산이 맞습니다.", hint: "조건을 다시 확인하세요.", comment: "풀이가 맞습니다.", sourcePages: [1], needsReview: false, reviewReason: "", verified: true, ...changes });
const referenceFixture = () => ({ questionNumber: "1", problem: "$x+1=2$", answer: "$x=1$", solution: "$x=2-1=1$", sourcePages: [1], needsReview: false, reviewReason: "" });

function loadTs(relative, overrides, globals = {}) {
  const source = readFileSync(path.join(root, relative), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, {
    module: mod, exports: mod.exports,
    require(name) {
      if (!(name in overrides)) throw new Error(`Unexpected dependency in network-free test: ${name}`);
      return overrides[name];
    },
    Buffer, Uint8Array, Date, Map, Set, JSON, ...globals,
  }, { filename: relative });
  return mod.exports;
}
const types = loadTs("src/types/homework.ts", {});

function harness(options = {}) {
  const state = {
    settings: clone(settingsFixture),
    submission: { id: ids.submission, assignment_id: ids.assignment, user_id: ids.user, pdf_path: "synthetic-submission.pdf", pdf_pages: 1, ai_status: "pending", ai_error: null, ai_lock_token: null, feedback_revision: 0, draft_feedback: [], published_at: null, published_feedback: null },
    assignment: { id: ids.assignment, material_id: ids.material, ai_enabled: true, release_mode: "auto" },
    material: { id: ids.material, pdf_path: "synthetic-questions.pdf", pdf_pages: 1, question_numbers: ["1"], reference: [referenceFixture()], reference_status: "approved", reference_revision: 7, reference_lock_token: null },
    recipient: { assignment_id: ids.assignment, user_id: ids.user, latest_submission_id: ids.submission },
    aiCalls: [], dbCalls: [], rpcCalls: [], downloads: [],
  };
  options.setup?.(state);
  const tableRows = (name) => {
    const rows = { homework_submissions: state.submission, homework_assignments: state.assignment, homework_materials: state.material, homework_recipients: state.recipient };
    if (!(name in rows)) throw new Error(`Unexpected table: ${name}`);
    return rows[name] ? [rows[name]] : [];
  };

  const db = {
    from(table) {
      const query = { table, operation: "select", values: null, filters: [], selected: false };
      const matches = (row) => query.filters.every(([key, value]) => row[key] === value);
      const execute = () => {
        const rows = tableRows(table).filter(matches);
        state.dbCalls.push(clone(query));
        if (query.operation === "update") {
          if (options.updateError?.(query, state)) return { data: null, error: new Error("synthetic database failure") };
          for (const row of rows) Object.assign(row, clone(query.values));
          return ok(query.selected ? rows.map((row) => ({ id: row.id })) : null);
        }
        return ok(rows.map(clone));
      };
      const chain = {
        select() { query.selected = true; return chain; },
        eq(key, value) { query.filters.push([key, value]); return chain; },
        is(key, value) { query.filters.push([key, value]); return chain; },
        update(values) { query.operation = "update"; query.values = values; return chain; },
        single() { const result = execute(); return Promise.resolve(result.error ? result : ok(result.data[0] ?? null)); },
        then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject); },
      };
      return chain;
    },
    storage: {
      from(bucket) {
        assert.equal(bucket, types.HOMEWORK_BUCKET);
        return { async download(filePath) {
          state.downloads.push(filePath);
          if (options.downloadError) return { data: null, error: new Error("synthetic unavailable file") };
          return ok(new Blob(["%PDF-1.7\nsynthetic fixture"]));
        } };
      },
    },
    async rpc(name, args) {
      state.rpcCalls.push({ name, args: clone(args) });
      if (name === "homework_claim_submission") {
        if (options.claimError) return { data: null, error: new Error("synthetic claim error") };
        if (options.claimDenied || state.submission.published_at || state.recipient.latest_submission_id !== ids.submission) return ok(false);
        Object.assign(state.submission, { ai_status: "processing", ai_lock_token: args.p_lock_token });
        return ok(true);
      }
      if (name === "homework_claim_reference") {
        if (options.claimDenied) return ok(false);
        Object.assign(state.material, { reference_status: "processing", reference_lock_token: args.p_lock_token });
        return ok(true);
      }
      if (name !== "homework_publish_feedback") throw new Error(`Unexpected RPC: ${name}`);
      await options.beforePublish?.(state, args);
      const row = state.submission;
      const canPublish = row.feedback_revision === args.p_expected_revision && row.ai_lock_token === args.p_lock_token && row.ai_status === "draft" && !row.published_at && core.canAutoPublish({
        settings: state.settings,
        assignment: { aiEnabled: state.assignment.ai_enabled, releaseMode: state.assignment.release_mode },
        latest: state.recipient.latest_submission_id === row.id,
        referenceApproved: state.material.reference_status === "approved",
        referenceRevisionMatches: state.material.reference_revision === args.p_reference_revision && row.reference_revision === args.p_reference_revision,
        feedback: row.draft_feedback, numbers: state.material.question_numbers,
      }) && JSON.stringify(row.settings_snapshot) === JSON.stringify(state.settings);
      if (canPublish && options.publicationResult !== false) Object.assign(row, { published_at: "2026-10-06T00:00:00Z", published_feedback: clone(row.draft_feedback), ai_lock_token: null });
      if (options.publicationError) return { data: null, error: new Error("synthetic publication connection error") };
      return ok(canPublish && options.publicationResult !== false);
    },
  };
  let lock = 0;
  const processor = loadTs("src/lib/homework/processor.ts", {
    "@/types/homework": types,
    "@/lib/homework/core.mjs": core,
    "@/lib/ai/gemini": { GEMINI_MODEL: "synthetic-existing-model" },
    "@/lib/homework/server": { loadHomeworkSettings: async () => clone(state.settings) },
    "@/lib/homework/ai": {
      async generateHomeworkFeedback(input) {
        state.aiCalls.push({ kind: "feedback", input: clone(input) });
        await options.duringFeedback?.(state);
        if (options.feedbackError) throw options.feedbackError;
        return clone(options.feedback ?? [feedbackFixture()]);
      },
      async generateHomeworkReference(_pdf, numbers) {
        state.aiCalls.push({ kind: "reference", numbers: [...numbers] });
        await options.duringReference?.(state);
        if (options.referenceError) throw options.referenceError;
        return clone(options.reference ?? [referenceFixture()]);
      },
    },
  }, { crypto: { randomUUID: () => `synthetic-lock-${++lock}` }, process: { env: { GEMINI_API_KEY: options.missingApiKey ? "" : "synthetic-test-key" } } });
  return { state, db, processor, run: () => processor.processHomeworkSubmission(db, ids.submission), runReference: () => processor.processHomeworkReference(db, ids.material) };
}

const publishedCalls = (state) => state.rpcCalls.filter((call) => call.name === "homework_publish_feedback");
const assertUnpublished = (state) => { assert.equal(state.submission.published_at, null); assert.equal(state.submission.published_feedback, null); };
const teacherTakeover = (state) => Object.assign(state.submission, { feedback_revision: state.submission.feedback_revision + 1, ai_lock_token: null, ai_status: "draft", ai_error: null, draft_feedback: [feedbackFixture({ comment: "교사가 직접 작성한 피드백" })] });

await test("검토 후 발송 모드는 모든 AI 판정이 검증돼도 공개하지 않는다", async () => {
  const h = harness({ setup: (state) => { state.assignment.release_mode = "review"; } });
  await h.run();
  assertUnpublished(h.state);
  assert.equal(h.state.submission.ai_status, "draft");
  assert.equal(h.state.submission.ai_lock_token, null);
  assert.ok(h.state.submission.draft_feedback.every((row) => row.needsReview && row.reviewReason.includes("선생님 검토")));
});

await test("자동 모드는 최신 제출과 현재 승인 기준·설정으로 작성된 검증 결과만 공개한다", async () => {
  const h = harness();
  await h.run();
  assert.ok(h.state.submission.published_at);
  assert.deepEqual(h.state.submission.published_feedback, [feedbackFixture()]);
  assert.equal(h.state.submission.ai_lock_token, null);
  assert.equal(h.state.submission.ai_model, "synthetic-existing-model");
  assert.equal(publishedCalls(h.state).length, 1);
  assert.equal(publishedCalls(h.state)[0].args.p_expected_revision, 0);
  assert.equal(publishedCalls(h.state)[0].args.p_reference_revision, 7);
});

await test("AI가 시작하기 전 전체·숙제 토글이 꺼져 있으면 자료나 AI를 호출하지 않는다", async () => {
  for (const setup of [(state) => { state.settings.aiEnabled = false; }, (state) => { state.assignment.ai_enabled = false; }]) {
    const h = harness({ setup });
    await h.run();
    assert.equal(h.state.aiCalls.length, 0);
    assert.equal(h.state.downloads.length, 0);
    assert.equal(h.state.submission.ai_status, "disabled");
    assert.equal(h.state.submission.ai_lock_token, null);
    assertUnpublished(h.state);
  }
});

await test("생성 중 전체·숙제 토글이 꺼지거나 새 제출이 생기면 결과 저장과 발송을 중단한다", async () => {
  for (const duringFeedback of [
    (state) => { state.settings.aiEnabled = false; },
    (state) => { state.assignment.ai_enabled = false; },
    (state) => { state.recipient.latest_submission_id = "newer-synthetic-submission"; },
  ]) {
    const h = harness({ duringFeedback });
    await h.run();
    assert.equal(h.state.aiCalls.length, 1);
    assert.deepEqual(h.state.submission.draft_feedback, []);
    assert.equal(h.state.submission.ai_status, "disabled");
    assert.equal(publishedCalls(h.state).length, 0);
    assertUnpublished(h.state);
  }
});

await test("생성 중 말투 설정 변경은 오래된 설정 결과를 검토 대상으로 남긴다", async () => {
  const h = harness({ duringFeedback: (state) => { state.settings.tone = "casual"; } });
  await h.run();
  assertUnpublished(h.state);
  assert.equal(h.state.submission.ai_status, "draft");
  assert.equal(h.state.submission.ai_lock_token, null);
  assert.equal(h.state.submission.settings_snapshot.tone, "polite");
  assert.ok(h.state.submission.draft_feedback[0].needsReview);
  assert.match(h.state.submission.draft_feedback[0].reviewReason, /설정.*변경/);
});

await test("발송 직전 새 제출·토글·기준풀이·모드 변경으로 RPC가 거부하면 안전한 검토 초안만 남긴다", async () => {
  for (const beforePublish of [
    (state) => { state.recipient.latest_submission_id = "newer-synthetic-submission"; },
    (state) => { state.settings.aiEnabled = false; },
    (state) => { state.assignment.ai_enabled = false; },
    (state) => { state.assignment.release_mode = "review"; },
    (state) => { state.material.reference_revision += 1; },
    (state) => { state.material.reference_status = "draft"; },
    (state) => { state.settings.styleGuide = "변경된 말투"; },
  ]) {
    const h = harness({ beforePublish });
    await h.run();
    assertUnpublished(h.state);
    assert.equal(h.state.submission.ai_status, "draft");
    assert.equal(h.state.submission.ai_lock_token, null);
    assert.equal(h.state.submission.draft_feedback[0].needsReview, true);
  }
});

await test("교사가 생성 중 직접 첨삭으로 전환하면 늦은 AI 결과가 저장 내용을 덮어쓰지 않는다", async () => {
  const h = harness({ duringFeedback: teacherTakeover });
  await h.run();
  assert.equal(h.state.submission.feedback_revision, 1);
  assert.equal(h.state.submission.draft_feedback[0].comment, "교사가 직접 작성한 피드백");
  assert.equal(h.state.submission.ai_lock_token, null);
  assert.equal(publishedCalls(h.state).length, 0);
  assertUnpublished(h.state);
});

await test("revision이나 작업 lock이 바뀌면 이전 작업이 새 결과와 상태를 변경하지 않는다", async () => {
  for (const duringFeedback of [
    (state) => { state.submission.feedback_revision += 1; state.submission.draft_feedback = [feedbackFixture({ comment: "새 revision 피드백" })]; },
    (state) => { state.submission.ai_lock_token = "new-worker-lock"; state.submission.draft_feedback = [feedbackFixture({ comment: "새 worker 피드백" })]; },
  ]) {
    const h = harness({ duringFeedback });
    await h.run();
    assert.match(h.state.submission.draft_feedback[0].comment, /^새 /);
    assert.equal(h.state.submission.ai_status, "processing");
    assert.equal(publishedCalls(h.state).length, 0);
    assertUnpublished(h.state);
  }
});

await test("발송 거부와 교사 수정이 경합해도 fallback이 교사 초안을 덮어쓰지 않는다", async () => {
  const h = harness({ beforePublish: teacherTakeover });
  await h.run();
  assert.equal(h.state.submission.draft_feedback[0].comment, "교사가 직접 작성한 피드백");
  assert.equal(h.state.submission.feedback_revision, 1);
  assert.equal(h.state.submission.draft_feedback[0].needsReview, false);
  assertUnpublished(h.state);
});

await test("발송 DB 반영 뒤 응답만 실패해도 이미 공개한 결과를 fallback이 변경하지 않는다", async () => {
  const h = harness({ publicationError: true });
  await h.run();
  assert.ok(h.state.submission.published_at);
  assert.deepEqual(h.state.submission.published_feedback, [feedbackFixture()]);
  assert.equal(h.state.submission.draft_feedback[0].needsReview, false);
  assert.equal(h.state.submission.ai_lock_token, null);
});

await test("불확실한 판정·검증 누락·미승인 기준·빈 AI 응답은 자동 모드에서도 공개되지 않는다", async () => {
  for (const options of [
    { feedback: [feedbackFixture({ needsReview: true })] },
    { feedback: [feedbackFixture({ verified: false })] },
    { feedback: [feedbackFixture({ verdict: "unreadable" })] },
    { feedback: [] },
    { setup: (state) => { state.material.reference_status = "draft"; } },
  ]) {
    const h = harness(options);
    await h.run();
    assertUnpublished(h.state);
    assert.equal(h.state.submission.ai_lock_token, null);
  }
});

await test("AI 실패·API key 누락은 공개 없이 복구 가능한 상태와 안전한 오류를 남긴다", async () => {
  for (const options of [{ feedbackError: new Error("API_KEY=synthetic-secret 403") }, { missingApiKey: true }, { downloadError: true }]) {
    const h = harness(options);
    await h.run();
    assert.equal(h.state.submission.ai_status, "failed");
    assert.equal(h.state.submission.ai_lock_token, null);
    assert.ok(h.state.submission.ai_error);
    assert.ok(!h.state.submission.ai_error.includes("synthetic-secret"));
    assert.equal(publishedCalls(h.state).length, 0);
    assertUnpublished(h.state);
  }
});

await test("AI 실패 뒤의 catch 처리도 교사가 취소한 작업 상태를 덮어쓰지 않는다", async () => {
  const h = harness({ duringFeedback: teacherTakeover, feedbackError: new Error("synthetic AI failure") });
  await h.run();
  assert.equal(h.state.submission.ai_status, "draft");
  assert.equal(h.state.submission.ai_error, null);
  assert.equal(h.state.submission.draft_feedback[0].comment, "교사가 직접 작성한 피드백");
});

await test("claim 거부·실패는 중복 AI 호출·PDF 다운로드·발송을 만들지 않는다", async () => {
  for (const options of [{ claimDenied: true }, { claimError: true }]) {
    const h = harness(options);
    await h.run();
    assert.equal(h.state.aiCalls.length, 0);
    assert.equal(h.state.downloads.length, 0);
    assert.equal(publishedCalls(h.state).length, 0);
    assert.equal(h.state.submission.ai_status, "pending");
  }
});

await test("AI 기준풀이 생성 결과는 자동 승인하지 않고 새 검토 초안으로만 저장한다", async () => {
  const h = harness({ setup: (state) => { state.material.reference_status = "pending"; } });
  await h.runReference();
  assert.equal(h.state.material.reference_status, "draft");
  assert.equal(h.state.material.reference_revision, 8);
  assert.equal(h.state.material.reference_approved_at, null);
  assert.equal(h.state.material.reference_lock_token, null);
  assert.equal(h.state.aiCalls[0].kind, "reference");
});

await test("기준풀이 생성 중 교사 승인·revision·새 worker 변경을 이전 AI가 덮어쓰지 않는다", async () => {
  for (const duringReference of [
    (state) => { state.material.reference_revision += 1; state.material.reference_lock_token = null; state.material.reference_status = "approved"; state.material.reference = [referenceFixture(), { marker: "teacher-approved" }]; },
    (state) => { state.material.reference_lock_token = "new-reference-worker"; state.material.reference = [{ marker: "new-worker" }]; },
  ]) {
    const h = harness({ duringReference });
    await h.runReference();
    assert.ok(JSON.stringify(h.state.material.reference).includes("marker"));
    assert.notEqual(h.state.material.reference_status, "draft");
  }
});

await test("원본 밖의 기준풀이 페이지 근거는 삭제하고 교사 검토를 요구한다", async () => {
  const h = harness({ reference: [{ ...referenceFixture(), sourcePages: [1, 2] }] });
  await h.runReference();
  assert.equal(h.state.material.reference_status, "draft");
  assert.deepEqual(h.state.material.reference[0].sourcePages, [1]);
  assert.equal(h.state.material.reference[0].needsReview, true);
});

await test("기준풀이 생성 중 AI가 꺼지면 새 결과를 저장하거나 승인하지 않는다", async () => {
  const h = harness({ duringReference: (state) => { state.settings.aiEnabled = false; } });
  const original = clone(h.state.material.reference);
  await h.runReference();
  assert.equal(h.state.material.reference_status, "failed");
  assert.equal(h.state.material.reference_revision, 7);
  assert.deepEqual(h.state.material.reference, original);
  assert.equal(h.state.material.reference_lock_token, null);
});

function aiHarness(options = {}) {
  const raw = feedbackFixture();
  delete raw.verified; // The first AI response has no authority to verify itself.
  const responses = [
    options.analysis ?? { feedback: [raw] },
    options.style ?? { comments: [{ questionNumber: "1", comment: "조건 확인을 잘했어요." }] },
    options.verification ?? { checks: [{ questionNumber: "1", agrees: true, readable: true, reason: "" }] },
  ];
  const calls = [];
  const ai = loadTs("src/lib/homework/ai.ts", {
    "@/lib/homework/core.mjs": core,
    "@/lib/ai/gemini": {
      GEMINI_MODEL: "synthetic-existing-model",
      gemini: { models: { async generateContent(request) {
        assert.equal(request.model, "synthetic-existing-model");
        const index = calls.length;
        calls.push(clone(request));
        if (index >= responses.length) throw new Error("Unexpected additional AI request");
        return { text: JSON.stringify(responses[index]), candidates: [{ finishReason: options.truncateAt === index ? "MAX_TOKENS" : "STOP" }] };
      } } },
    },
  });
  const input = {
    questionPdf: Buffer.from("%PDF-1.7 synthetic questions"),
    submissionPdf: Buffer.from("%PDF-1.7 synthetic work"),
    numbers: ["1"], reference: [referenceFixture()], referenceApproved: options.referenceApproved ?? true,
    settings: clone(settingsFixture), submissionPages: 1,
  };
  return { calls, run: () => ai.generateHomeworkFeedback(input) };
}

await test("실제 AI 흐름은 말투 변환의 extra fields로 판정·풀이 근거를 바꾸지 않고 최종 문장을 원본과 재검증한다", async () => {
  const h = aiHarness({ style: { comments: [{ questionNumber: "1", comment: "차분하게 조건을 확인했어요.", verdict: "incorrect", studentWork: "조작된 근거" }] } });
  const rows = await h.run();
  assert.equal(rows[0].verdict, "correct");
  assert.equal(rows[0].studentWork, "$x=1$");
  assert.equal(rows[0].comment, "차분하게 조건을 확인했어요.");
  assert.equal(rows[0].verified, true);
  assert.equal(rows[0].needsReview, false);
  assert.equal(h.calls.length, 3);
  const verificationParts = h.calls[2].contents[0].parts;
  assert.equal(verificationParts.filter((part) => part.inlineData?.mimeType === "application/pdf").length, 2);
  assert.ok(verificationParts.some((part) => part.text?.includes(rows[0].comment)));
});

await test("실제 AI 흐름에서 말투 결과 누락·중복은 분석 초안을 보존하고 교사 검토를 요구한다", async () => {
  for (const comments of [[], [{ questionNumber: "99", comment: "잘못 연결된 문장" }], [{ questionNumber: "1", comment: "첫 문장" }, { questionNumber: "1", comment: "중복 문장" }]]) {
    const h = aiHarness({ style: { comments } });
    const rows = await h.run();
    assert.equal(rows[0].comment, "풀이가 맞습니다.");
    assert.equal(rows[0].needsReview, true);
    assert.equal(core.canAutoPublish({ settings: settingsFixture, assignment: { aiEnabled: true, releaseMode: "auto" }, latest: true, referenceApproved: true, referenceRevisionMatches: true, numbers: ["1"], feedback: rows }), false);
  }
});

await test("실제 AI 흐름의 최종 검증 불일치·미승인 기준·원본 밖 페이지는 자동 승인이 되지 않는다", async () => {
  for (const options of [
    { verification: { checks: [{ questionNumber: "1", agrees: false, readable: true, reason: "원본과 다른 오류 지적" }] } },
    { verification: { checks: [{ questionNumber: "1", agrees: true, readable: false, reason: "필기 판독 어려움" }] } },
    { verification: { checks: [] } },
    { referenceApproved: false },
    { analysis: { feedback: [feedbackFixture({ sourcePages: [1, 2] })] } },
  ]) {
    const rows = await aiHarness(options).run();
    assert.equal(rows[0].needsReview, true);
    assert.ok(rows[0].reviewReason);
    if (options.analysis) assert.deepEqual(Array.from(rows[0].sourcePages), [1]);
  }
});

await test("잘린 AI 응답은 내용이 JSON처럼 보여도 승인·발송 가능한 결과로 반환하지 않는다", async () => {
  const h = aiHarness({ truncateAt: 0 });
  await assert.rejects(h.run(), /AI 응답.*끝까지/);
  assert.equal(h.calls.length, 1);
});
