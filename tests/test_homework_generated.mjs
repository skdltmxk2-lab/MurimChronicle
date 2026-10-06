import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";
import * as standalone from "../src/lib/questions/standaloneCore.mjs";
import * as core from "../src/lib/homework/core.mjs";

// Synthetic questions only. The real TS mapper/generated helpers/server are loaded
// into a VM and all storage/database operations remain in memory.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const json = (value) => JSON.parse(JSON.stringify(value));
const ok = (data) => ({ data, error: null });
function loadTs(relative, overrides) {
  const source = readFileSync(path.join(root, relative), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, {
    module: mod, exports: mod.exports,
    require(name) { if (!(name in overrides)) throw new Error(`Unexpected dependency: ${name}`); return overrides[name]; },
    Date, Map, Set, JSON, Error, TypeError, RangeError, Uint8Array, URLSearchParams, process: { env: {} },
  }, { filename: relative });
  return mod.exports;
}
const types = loadTs("src/types/homework.ts", {});
const coaching = loadTs("src/lib/admin/coaching.ts", { "@/lib/questions/standalone": standalone });
const generated = loadTs("src/lib/homework/generated.ts", {
  "@/lib/admin/coaching": coaching,
  "@/lib/questions/standalone": standalone,
});
const updated = "2026-10-06T01:00:00.000Z";
const row = (id, marker, changes = {}) => ({
  id, subject: "미분학", unit: "미분법", concept: "다항함수 미분", difficulty: "easy", source_type: "manual", pool: "general",
  question: `${marker} 함수 $f(x)=x^2$에 대하여 $f'(1)$의 값을 구하시오.`, content_type: "latex", question_type: "multiple_choice",
  options: [{ id: "a", label: "①", text: "$1$" }, { id: "b", label: "②", text: "$2$" }, { id: "c", label: "③", text: "$3$" }],
  correct_option_id: "b", answer_text: null, explanation: `${marker} $f'(x)=2x$이므로 $f'(1)=2$이다.`, tags: [], quality_status: "approved",
  created_at: updated, updated_at: updated, ...changes,
});
const sourceRows = [row("question-A", "A문항"), row("question-B", "B문항")];
function questionDb(rows = sourceRows, error = null) {
  const calls = [];
  return { calls, from(table) {
    assert.equal(table, "questions");
    const query = { table, ids: [] };
    const chain = {
      select() { return chain; },
      in(column, ids) { assert.equal(column, "id"); query.ids = [...ids]; return chain; },
      then(resolve, reject) { calls.push(query); return Promise.resolve({ data: rows, error }).then(resolve, reject); },
    };
    return chain;
  } };
}

await test("생성 자료는 선택 순서를 보존하며 빈 목록·중복·과다 문제 ID를 거부한다", () => {
  assert.deepEqual(json(generated.validateGeneratedQuestionIds([" question-B ", "question-A"])), ["question-B", "question-A"]);
  for (const value of [[], ["A", " A "], [""], [null], Array.from({ length: 61 }, (_, index) => `question-${index}`), ["x".repeat(201)]]) {
    assert.throws(() => generated.validateGeneratedQuestionIds(value));
  }
});

await test("실제 PDF 페이지 범위를 벗어나거나 문항 연결이 빠진 메타데이터는 거부한다", () => {
  assert.deepEqual(json(generated.validateGeneratedQuestionPages([[2, 1, 2], [3]], 2, 3)), [[1, 2], [3]]);
  for (const pages of [[], [[1]], [[], [2]], [[0], [2]], [[1], [4]], [[1.5], [2]], [["1"], [2]], [null, [2]]]) {
    assert.throws(() => generated.validateGeneratedQuestionPages(pages, 2, 3));
  }
});

await test("DB의 조회 순서가 달라도 선택한 순서대로 문제·정답·해설·PDF 페이지를 연결한다", async () => {
  const db = questionDb(); // DB A,B while user selected B,A.
  const questions = await generated.loadGeneratedHomeworkQuestions(db, ["question-B", "question-A"], [updated, updated]);
  assert.deepEqual(json(questions.map((question) => question.id)), ["question-B", "question-A"]);
  const references = generated.buildGeneratedHomeworkReference(questions, [[1], [2, 3]]);
  assert.deepEqual(json(references.map((reference) => reference.questionNumber)), ["1", "2"]);
  assert.match(references[0].problem, /B문항/);
  assert.match(references[0].solution, /B문항/);
  assert.match(references[1].problem, /A문항/);
  assert.match(references[1].solution, /A문항/);
  assert.equal(references[0].answer, "②. $2$");
  assert.deepEqual(json(references.map((reference) => reference.sourcePages)), [[1], [2, 3]]);
  assert.ok(references.every((reference) => reference.needsReview === true && reference.reviewReason.trim()));
});

await test("보류·격리·삭제·외부 지문 참조 문제를 최신 자료처럼 저장하지 않는다", async () => {
  for (const rows of [
    [sourceRows[0]],
    [sourceRows[0], row("question-B", "B문항", { quality_status: "pending" })],
    [sourceRows[0], row("question-B", "B문항", { quality_status: "quarantined" })],
    [sourceRows[0], row("question-B", "B문항", { question: "앞의 1번 문제의 조건을 이용하여 값을 구하시오." })],
  ]) {
    await assert.rejects(generated.loadGeneratedHomeworkQuestions(questionDb(rows), ["question-A", "question-B"], [updated, updated]));
  }
});

await test("문제지 생성 뒤 DB 내용이 수정되면 저장을 막고 시간 표현만 다른 동일 버전은 인정한다", async () => {
  await assert.rejects(generated.loadGeneratedHomeworkQuestions(questionDb([row("question-A", "A문항", { updated_at: "2026-10-06T01:00:01Z" })]), ["question-A"], [updated]), /수정/);
  const same = await generated.loadGeneratedHomeworkQuestions(questionDb([sourceRows[0]]), ["question-A"], ["2026-10-06T10:00:00+09:00"]);
  assert.equal(same[0].id, "question-A");
  for (const versions of [[], [null], ["invalid timestamp"]]) await assert.rejects(generated.loadGeneratedHomeworkQuestions(questionDb([sourceRows[0]]), ["question-A"], versions));
});

await test("이미지 조건·해설이 있는 자료도 교사 확인 안내를 유지하며 주관식 정답을 보존한다", () => {
  const questions = coaching.questionRowsToRecords([
    row("image-question", "이미지문항", { question_image: "https://example.invalid/synthetic-image.png" }),
    row("subjective-question", "주관식문항", { question_type: "subjective", options: [], correct_option_id: "", answer_text: "$2$" }),
  ]);
  const references = generated.buildGeneratedHomeworkReference(questions, [[1], [2]]);
  assert.equal(references[0].needsReview, true);
  assert.match(references[0].reviewReason, /이미지/);
  assert.equal(references[1].answer, "$2$");
  assert.equal(references[1].needsReview, true);
});

const ids = {
  teacher: "11111111-1111-4111-8111-111111111111",
  assignment: "22222222-2222-4222-8222-222222222222",
  material: "33333333-3333-4333-8333-333333333333",
  submission: "44444444-4444-4444-8444-444444444444",
  upload: "55555555-5555-4555-8555-555555555555",
  student: "66666666-6666-4666-8666-666666666666",
};
const nextServer = { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } };
const server = loadTs("src/lib/homework/server.ts", {
  "node:crypto": { randomUUID: () => ids.upload },
  "next/server": nextServer,
  "@/types/homework": types,
  "@/lib/homework/core.mjs": core,
  "@/lib/homework/generated": generated,
  "@/lib/homework/pdf-server": { inspectHomeworkPdf: async (_bytes, pages) => pages },
});

function serverHarness(options = {}) {
  const state = {
    queries: [], rpcCalls: [], signed: [], downloads: [],
    questions: json(options.questions ?? sourceRows),
    material: { id: ids.material, title: "생성 숙제", kind: "homework", subject: "미분학", description: "", question_numbers: ["1", "2"], pdf_name: "generated.pdf", pdf_path: "synthetic-material.pdf", pdf_size: 8, pdf_pages: 3, source_kind: "unit_mock", source_question_ids: ["question-B", "question-A"], reference: [], reference_status: "draft", reference_revision: 1, archived_at: options.archived ? updated : null, created_at: updated },
    assignment: { id: ids.assignment, material_id: ids.material, instructions: "풀이 제출", due_at: null, ai_enabled: true, release_mode: "review", created_at: updated },
    recipient: { assignment_id: ids.assignment, user_id: ids.student, latest_submission_id: ids.submission },
    submission: { id: ids.submission, assignment_id: ids.assignment, user_id: ids.student, pdf_path: "synthetic-student.pdf", attempt_number: 1, pdf_name: "student.pdf", ai_status: "draft", published_feedback: [{ questionNumber: "1", comment: "이미 공개된 첨삭" }], published_at: updated, created_at: updated },
    ticket: { id: ids.upload, owner_id: ids.teacher, purpose: "material", assignment_id: null, pdf_name: "generated.pdf", pdf_path: "synthetic-material.pdf", pdf_size: 8, pdf_pages: 3, consumed_at: null, created_at: new Date().toISOString() },
  };
  const db = {
    from(table) {
      const query = { table, filters: [], columns: "" };
      const execute = () => {
        state.queries.push(json(query));
        const tableRows = {
          questions: state.questions,
          homework_materials: [state.material], homework_assignments: [state.assignment],
          homework_recipients: [state.recipient], homework_submissions: [state.submission], homework_uploads: [state.ticket],
          profiles: [{ id: ids.student, name: "합성 학생", is_admin: false }, { id: ids.teacher, name: "합성 교사", is_admin: true }],
          app_settings: [{ key: "homework_ai_settings", value: JSON.stringify(types.DEFAULT_HOMEWORK_SETTINGS) }],
        };
        if (!(table in tableRows)) throw new Error(`Unexpected server table: ${table}`);
        const rows = tableRows[table].filter((row) => query.filters.every(([operator, column, value]) => operator === "in" ? value.includes(row[column]) : row[column] === value));
        return ok(json(rows));
      };
      const chain = {
        select(columns) { query.columns = columns; return chain; },
        eq(column, value) { query.filters.push(["eq", column, value]); return chain; },
        is(column, value) { query.filters.push(["is", column, value]); return chain; },
        in(column, value) { query.filters.push(["in", column, [...value]]); return chain; },
        limit() { return chain; }, order() { return chain; },
        maybeSingle() { return Promise.resolve(ok(execute().data[0] ?? null)); },
        then(resolve, reject) { return Promise.resolve(execute()).then(resolve, reject); },
      };
      return chain;
    },
    storage: { from(bucket) {
      assert.equal(bucket, types.HOMEWORK_BUCKET);
      return {
        async download(filePath) { state.downloads.push(filePath); return ok(new Blob(["%PDF-1.7"])); },
        async createSignedUrl(filePath) { state.signed.push(filePath); return ok({ signedUrl: "https://example.invalid/synthetic.pdf" }); },
        async remove() { throw new Error("Archive must not delete PDFs"); },
      };
    } },
    async rpc(name, args) {
      state.rpcCalls.push({ name, args: json(args) });
      if (options.rpcError) return { data: null, error: options.rpcError };
      if (name === "homework_create_generated_material") {
        state.material.reference = json(args.p_reference);
        state.material.source_question_ids = json(args.p_question_ids);
        return ok(ids.material);
      }
      if (name === "homework_archive_material") { state.material.archived_at = args.p_restore ? null : updated; return ok(ids.material); }
      throw new Error(`Unexpected server RPC: ${name}`);
    },
  };
  return { db, state };
}
const generatedBody = (changes = {}) => ({ uploadId: ids.upload, title: "생성 숙제", kind: "homework", subject: "미분학", description: "", questionIds: ["question-B", "question-A"], questionUpdatedAts: [updated, updated], questionPages: [[1], [2, 3]], ...changes });

await test("생성 저장 API는 브라우저가 제공한 정답·승인 상태를 무시하고 DB 기준풀이를 순서대로 저장한다", async () => {
  const h = serverHarness();
  const result = await server.createGeneratedHomeworkMaterial(h.db, ids.teacher, generatedBody({ reference: [{ answer: "브라우저에서 조작한 정답" }], referenceStatus: "approved" }));
  assert.equal(result.ok, true);
  assert.equal(result.material.sourceKind, "unit_mock");
  assert.equal(result.material.referenceStatus, "draft");
  const rpc = h.state.rpcCalls[0];
  assert.equal(rpc.name, "homework_create_generated_material");
  assert.equal(rpc.args.p_actor_id, ids.teacher);
  assert.deepEqual(rpc.args.p_question_ids, ["question-B", "question-A"]);
  assert.deepEqual(rpc.args.p_question_updated_ats, [updated, updated]);
  assert.match(rpc.args.p_reference[0].problem, /B문항/);
  assert.match(rpc.args.p_reference[1].problem, /A문항/);
  assert.ok(rpc.args.p_reference.every((reference) => reference.needsReview === true));
  assert.ok(!JSON.stringify(rpc).includes("브라우저에서 조작"));
});

await test("생성 저장 API는 오래된 문제 버전·PDF 페이지 연결 오류를 ticket 소비 전에 거부한다", async () => {
  for (const changes of [{ questionUpdatedAts: [updated, "2026-10-06T01:00:01Z"] }, { questionPages: [[1], [4]] }, { questionIds: ["question-A", "question-A"] }]) {
    const h = serverHarness();
    await assert.rejects(server.createGeneratedHomeworkMaterial(h.db, ids.teacher, generatedBody(changes)), (error) => [400, 409].includes(error.status));
    assert.equal(h.state.rpcCalls.length, 0);
  }
  const rpcRace = serverHarness({ rpcError: { message: "HOMEWORK_QUESTIONS_CHANGED", code: "P0001" } });
  await assert.rejects(server.createGeneratedHomeworkMaterial(rpcRace.db, ids.teacher, generatedBody()), (error) => error.status === 409);
});

await test("archive는 인증된 actor와 복구 여부를 RPC에 전달하고 삭제된 자료를 복구할 수 있다", async () => {
  const h = serverHarness();
  assert.deepEqual(json(await server.archiveHomeworkMaterial(h.db, ids.teacher, ids.material)), { ok: true, id: ids.material });
  assert.deepEqual(h.state.rpcCalls[0].args, { p_material_id: ids.material, p_actor_id: ids.teacher, p_restore: false });
  assert.ok(h.state.material.archived_at);
  const restored = await server.archiveHomeworkMaterial(h.db, ids.teacher, ids.material, true);
  assert.equal(restored.material.archivedAt, null);
  assert.equal(h.state.material.archived_at, null);
  assert.equal(h.state.downloads.length, 0);
});

await test("삭제한 자료는 자료함에서만 사라지고 기존 배부 화면에는 그대로 남는다", async () => {
  const h = serverHarness({ archived: true });
  const admin = await server.listHomeworkAdmin(h.db);
  assert.deepEqual(json(admin.materials), []);
  assert.equal(admin.assignments.length, 1);
  assert.equal(admin.assignments[0].material.id, ids.material);
  assert.equal(admin.assignments[0].material.archivedAt, updated);
  const libraryQuery = h.state.queries.find((query) => query.table === "homework_materials" && query.filters.some(([, column]) => column === "archived_at"));
  assert.ok(libraryQuery);
  assert.ok(h.state.queries.some((query) => query.table === "homework_materials" && query.filters.some(([, column]) => column === "id") && !query.filters.some(([, column]) => column === "archived_at")));
});

await test("archive 뒤에도 배부받은 학생이 문제 PDF·제출 PDF·공개 첨삭을 확인할 수 있다", async () => {
  const h = serverHarness({ archived: true });
  const student = await server.listStudentHomework(h.db, ids.student);
  assert.equal(student.homework[0].id, ids.assignment);
  assert.equal(student.homework[0].submissions[0].publishedFeedback[0].comment, "이미 공개된 첨삭");
  const problem = await server.getHomeworkFile(h.db, ids.student, new URLSearchParams({ assignmentId: ids.assignment }));
  const submitted = await server.getHomeworkFile(h.db, ids.student, new URLSearchParams({ submissionId: ids.submission }));
  assert.equal(problem.ok, true);
  assert.equal(submitted.ok, true);
  assert.deepEqual(h.state.signed, ["synthetic-material.pdf", "synthetic-student.pdf"]);
  assert.ok(!h.state.queries.some((query) => query.filters.some(([, column]) => column === "archived_at")));
});

await test("생성 저장·archive·restore 라우트는 관리자 인증이 없으면 입력 처리도 실행하지 않는다", async () => {
  const deny = { ok: false, response: { status: 403, body: { ok: false } } };
  const overrides = { "next/server": nextServer, "@/lib/auth/requireAdmin": { requireAdmin: async () => deny }, "@/lib/homework/server": server };
  const generatedRoute = loadTs("app/api/admin/homework/materials/generated/route.ts", overrides);
  const archiveRoute = loadTs("app/api/admin/homework/materials/[id]/route.ts", overrides);
  const request = { json: async () => { throw new Error("Denied user body must not be processed"); } };
  const context = { params: Promise.resolve({ id: ids.material }) };
  assert.equal(await generatedRoute.POST(request), deny.response);
  assert.equal(await archiveRoute.DELETE(request, context), deny.response);
  assert.equal(await archiveRoute.PATCH(request, context), deny.response);
});
