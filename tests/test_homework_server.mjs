import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import * as core from "../src/lib/homework/core.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nativeRequire = createRequire(import.meta.url);
function loadTs(relative, overrides = {}) {
  const source = readFileSync(path.join(root, relative), "utf8");
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require: name => overrides[name] ?? nativeRequire(name), process, Uint8Array, URLSearchParams, Date, Map, Set }, { filename: relative });
  return mod.exports;
}
const types = loadTs("src/types/homework.ts");
const server = loadTs("src/lib/homework/server.ts", {
  "@/types/homework": types,
  "@/lib/homework/core.mjs": core,
  "@/lib/homework/pdf-server": { inspectHomeworkPdf: async (_bytes, pages) => pages },
  "next/server": { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200 }) } },
});
const actor = "11111111-1111-4111-8111-111111111111";
const assignment = "22222222-2222-4222-8222-222222222222";
const material = "33333333-3333-4333-8333-333333333333";
const submission = "44444444-4444-4444-8444-444444444444";
const upload = "55555555-5555-4555-8555-555555555555";
function mockDb(handler) {
  const calls = []; let signed = 0; let downloaded = 0; let rpc = 0;
  const db = {
    calls,
    from(table) {
      const q = { table, filters: [], operation: "select", values: undefined, columns: "" };
      const chain = {
        select(columns) { q.columns = columns; return chain; },
        eq(column, value) { q.filters.push([column, value]); return chain; },
        in(column, value) { q.filters.push([column, value]); return chain; },
        is(column, value) { q.filters.push([column, value]); return chain; },
        order() { return chain; }, limit() { return chain; },
        update(values) { q.operation = "update"; q.values = values; return chain; },
        insert(values) { q.operation = "insert"; q.values = values; return chain; },
        delete() { q.operation = "delete"; return chain; },
        upsert(values) { q.operation = "upsert"; q.values = values; return chain; },
        maybeSingle() { calls.push(q); return Promise.resolve(handler(q, true)); },
        then(resolve, reject) { calls.push(q); return Promise.resolve(handler(q, false)).then(resolve, reject); },
      };
      return chain;
    },
    storage: { from: () => ({ createSignedUrl: async () => { signed++; return { data: { signedUrl: "private-file" }, error: null }; }, createSignedUploadUrl: async () => { signed++; return { data: { token: "upload-token" }, error: null }; }, download: async () => { downloaded++; return { data: new Blob(["%PDF-1.7"]), error: null }; } }) },
    rpc: async () => { rpc++; return { data: submission, error: null }; },
    counters: () => ({ signed, downloaded, rpc }),
  };
  return db;
}
const result = data => ({ data, error: null });

// Service-role APIs must deny foreign files before creating a signed URL.
const foreignFileDb = mockDb((q, single) => {
  if (q.table === "profiles") return result({ is_admin: false });
  if (q.table === "homework_submissions") {
    assert.ok(q.filters.some(([key, value]) => key === "user_id" && value === actor));
    return result(single ? null : []);
  }
  return result(single ? null : []);
});
await assert.rejects(server.getHomeworkFile(foreignFileDb, actor, new URLSearchParams({ submissionId: submission })), error => error.status === 404);
assert.equal(foreignFileDb.counters().signed, 0);

// Material PDF access through an assignment verifies membership before any file lookup.
const noRecipientDb = mockDb((_q, single) => result(single ? null : []));
await assert.rejects(server.getHomeworkFile(noRecipientDb, actor, new URLSearchParams({ assignmentId: assignment })), error => error.status === 404);
assert.equal(noRecipientDb.counters().signed, 0);
await assert.rejects(server.createHomeworkUpload(noRecipientDb, actor, { purpose: "submission", assignmentId: assignment, name: "work.pdf", size: 8, pages: 1 }), error => error.status === 404);
assert.equal(noRecipientDb.counters().signed, 0);
await assert.rejects(server.createHomeworkUpload(noRecipientDb, actor, { purpose: "material", name: "questions.pdf", size: 8, pages: 1 }), error => error.status === 403);
assert.equal(noRecipientDb.calls.filter(q => q.operation === "insert").length, 0);

// Even a service-role result containing extra columns must not leak drafts or answer references.
const studentDb = mockDb((q) => {
  if (q.table === "homework_recipients") {
    assert.ok(q.filters.some(([key, value]) => key === "user_id" && value === actor));
    return result([{ assignment_id: assignment }]);
  }
  if (q.table === "homework_assignments") return result([{ id: assignment, material_id: material, instructions: "풀이 제출", due_at: null, created_at: "2026-10-06T00:00:00Z" }]);
  if (q.table === "homework_submissions") {
    assert.ok(q.filters.some(([key, value]) => key === "user_id" && value === actor));
    assert.ok(!q.columns.includes("draft_feedback"));
    return result([{ id: submission, assignment_id: assignment, attempt_number: 1, pdf_name: "work.pdf", ai_status: "processing", ai_started_at: null, published_feedback: [{ comment: "unpublished-secret" }], published_at: null, draft_feedback: [{ comment: "draft-secret" }], ai_error: "internal-secret", created_at: "2026-10-06T01:00:00Z" }]);
  }
  if (q.table === "homework_materials") {
    assert.ok(!q.columns.includes("reference"));
    return result([{ id: material, title: "숙제", kind: "homework", subject: "미분학", question_numbers: ["1"], pdf_name: "questions.pdf", reference: [{ answer: "answer-secret" }] }]);
  }
  throw new Error(`Unexpected table: ${q.table}`);
});
const dto = await server.listStudentHomework(studentDb, actor);
assert.equal(dto.homework[0].submissions[0].publishedFeedback, null);
assert.equal(dto.homework[0].submissions[0].isLate, false);
assert.equal(dto.homework[0].submissions[0].aiStatus, "failed", "interrupted processing stops student polling without exposing an error");
for (const secret of ["draft-secret", "answer-secret", "internal-secret", "unpublished-secret", "draftFeedback", "reference"]) assert.ok(!JSON.stringify(dto).includes(secret));

// An upload belonging to another homework cannot be consumed, even if it belongs to this user.
const wrongAssignmentDb = mockDb((q, single) => {
  if (q.table === "homework_recipients") return result({ assignment_id: assignment, user_id: actor });
  if (q.table === "homework_uploads") {
    assert.ok(q.filters.some(([key, value]) => key === "owner_id" && value === actor));
    return result({ id: upload, owner_id: actor, assignment_id: material, pdf_path: "owned-file", pdf_size: 8, pdf_pages: 1, consumed_at: null, created_at: new Date().toISOString() });
  }
  return result(single ? null : []);
});
await assert.rejects(server.finalizeHomeworkSubmission(wrongAssignmentDb, actor, assignment, { uploadId: upload }), error => error.status === 400);
assert.equal(wrongAssignmentDb.counters().rpc, 0);

// Teacher review must be preserved for unreadable work; AI normalizers must not re-flag it.
function feedbackDb(conflict = false) {
  const db = mockDb((q, single) => {
    if (q.table === "homework_submissions") return result({ assignment_id: assignment, pdf_pages: 1 });
    if (q.table === "homework_assignments") return result([{ id: assignment, material_id: material, instructions: "", due_at: null, ai_enabled: true, release_mode: "review", created_at: "2026-10-06T00:00:00Z" }]);
    if (q.table === "homework_materials") return result([{ id: material, title: "숙제", kind: "homework", question_numbers: ["1"], pdf_name: "questions.pdf", pdf_size: 8, pdf_pages: 1, reference_status: "draft", reference_revision: 0, created_at: "2026-10-06T00:00:00Z" }]);
    if (q.table === "homework_recipients") return result([{ assignment_id: assignment, latest_submission_id: submission }]);
    return result(single ? null : []);
  });
  db.rpc = async (name, args) => {
    assert.equal(name, "homework_save_feedback");
    assert.equal(args.p_actor_id, actor);
    assert.equal(args.p_expected_revision, 3);
    assert.equal(args.p_feedback[0].needsReview, false);
    assert.equal(args.p_feedback[0].verdict, "unreadable");
    assert.equal(args.p_feedback[0].studentWork, "");
    return conflict ? { data: null, error: { code: "40001", message: "HOMEWORK_REVISION_CONFLICT" } } : result(4);
  };
  return db;
}
const manualFeedback = [{ questionNumber: "1", verdict: "unreadable", studentWork: "", errorStep: "", reason: "", hint: "", comment: "풀이가 흐려서 확인하기 어려워요. 다시 촬영해서 올려 주세요.", sourcePages: [], needsReview: false, reviewReason: "", verified: true }];
const savedFeedback = await server.saveHomeworkFeedback(feedbackDb(), actor, submission, { feedback: manualFeedback, revision: 3, publish: true });
assert.equal(savedFeedback.revision, 4);
await assert.rejects(server.saveHomeworkFeedback(feedbackDb(true), actor, submission, { feedback: manualFeedback, revision: 3, publish: true }), error => error.status === 409);
await assert.rejects(server.saveHomeworkFeedback(feedbackDb(), actor, submission, { feedback: [{ ...manualFeedback[0], verified: false }], revision: 3, publish: true }), error => error.status === 400);
await assert.rejects(server.saveHomeworkFeedback(feedbackDb(), actor, submission, { feedback: [manualFeedback[0], manualFeedback[0]], revision: 3, publish: false }), error => error.status === 400);

const clock = Date.parse("2026-10-06T03:00:00Z");
const timestamp = minutesAgo => new Date(clock - minutesAgo * 60_000).toISOString();
assert.equal(server.homeworkProcessingState("pending", null, timestamp(14), clock).status, "pending");
assert.equal(server.homeworkProcessingState("pending", null, timestamp(16), clock).status, "failed");
assert.equal(server.homeworkProcessingState("processing", null, timestamp(1), clock).status, "failed");
assert.equal(server.homeworkProcessingState("processing", timestamp(14), timestamp(60), clock).status, "processing");
assert.equal(server.homeworkProcessingState("processing", timestamp(16), timestamp(60), clock).status, "failed");
assert.equal(server.homeworkProcessingState("draft", null, timestamp(60), clock).status, "draft");
assert.equal(server.homeworkProcessingState("disabled", null, timestamp(60), clock).status, "disabled");
const stoppedMaterial = server.mapMaterial({ id: material, title: "자료", reference_status: "processing", reference_started_at: null, created_at: new Date().toISOString() });
assert.equal(stoppedMaterial.referenceStatus, "failed");
assert.ok(stoppedMaterial.referenceError.includes("중단"));

// Database errors are mapped to safe actionable messages rather than returning provider details.
const safe = server.homeworkErrorResponse(new Error("provider-secret"));
assert.equal(safe.status, 500);
assert.ok(!JSON.stringify(safe).includes("provider-secret"));
assert.throws(() => server.checkDatabase({ code: "PGRST202", message: "internal details" }), error => error.status === 503 && !/internal details|Supabase|\.sql/.test(error.message));
console.log("homework server ownership and privacy checks passed");
