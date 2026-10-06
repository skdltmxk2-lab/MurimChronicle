import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

// Execute the actual migrations in an isolated local PostgreSQL-compatible runtime.
// No Supabase credentials, network connections or real student/question data are used.
const require = createRequire(import.meta.url);
let packagePath;
try { packagePath = require.resolve("@electric-sql/pglite"); }
catch { packagePath = require.resolve("../.tmp/homework-pglite/node_modules/@electric-sql/pglite"); }
const { PGlite } = await import(pathToFileURL(packagePath).href);
const db = new PGlite();
let checks = 0;
const value = async (sql, args = []) => (await db.query(sql, args)).rows[0]?.value;
const eq = (actual, expected, label) => { assert.deepEqual(actual, expected, label); checks++; };
const fails = async (sql, args = [], predicate) => { await assert.rejects(db.query(sql, args), predicate); checks++; };
const teacher = randomUUID(), student = randomUUID(), anotherStudent = randomUUID();
const updated = "2026-10-06T01:00:00.000Z";
const ids = ["synthetic-question-B", "synthetic-question-A"];
const references = [
  { questionNumber: "1", problem: "B 문제", answer: "B 정답", solution: "B 해설", sourcePages: [1], needsReview: false, reviewReason: "" },
  { questionNumber: "2", problem: "A 문제", answer: "A 정답", solution: "A 해설", sourcePages: [2, 3], needsReview: false, reviewReason: "" },
];
async function issue(actor, purpose = "material", assignment = null) {
  const id = randomUUID();
  return value("SELECT public.homework_issue_upload($1,$2,$3,$4,$5,$6,$7,$8) AS value", [id, actor, purpose, assignment, `synthetic/${id}.pdf`, "synthetic.pdf", 100, 3]);
}
const generatedSql = "SELECT public.homework_create_generated_material($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb) AS value";
const generatedArgs = (upload, questionIds = ids, versions = [updated, updated], reference = references, actor = teacher) => [upload, actor, "생성 숙제", "homework", "미분학", "합성 테스트", questionIds, versions, JSON.stringify(reference)];
const assignmentSql = "SELECT public.homework_create_assignment($1,$2,$3,$4,$5,$6,$7) AS value";
const assignmentArgs = (material, students = [student]) => [teacher, material, students, "풀이 PDF를 제출하세요", null, true, "review"];
const archiveSql = "SELECT public.homework_archive_material($1,$2,$3) AS value";

try {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE SCHEMA storage;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users(id),is_admin boolean NOT NULL DEFAULT false,name text);
    CREATE TABLE public.app_settings(key text PRIMARY KEY,value text NOT NULL,updated_at timestamptz DEFAULT now());
    CREATE TABLE public.questions(id text PRIMARY KEY,quality_status text NOT NULL,updated_at timestamptz);
    CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text NOT NULL,name text NOT NULL);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON storage.objects TO anon,authenticated,service_role;
    GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated,service_role;
  `);
  await db.query("INSERT INTO auth.users(id) SELECT unnest($1::uuid[])", [[teacher, student, anotherStudent]]);
  await db.query("INSERT INTO public.profiles(id,is_admin,name) SELECT id,id=$1,'합성 테스트' FROM auth.users", [teacher]);
  await db.query("INSERT INTO public.questions(id,quality_status,updated_at) SELECT unnest($1::text[]),'approved',$2::timestamptz", [ids, updated]);
  const baseMigration = await readFile(new URL("../supabase/migrations/20261006_homework.sql", import.meta.url), "utf8");
  const newMigration = await readFile(new URL("../supabase/migrations/20261006_homework_generated.sql", import.meta.url), "utf8");
  await db.exec(baseMigration);
  await db.exec(newMigration);
  await db.exec(newMigration);
  checks++;

  const upload = await issue(teacher);
  const material = await value(generatedSql, generatedArgs(upload));
  assert.ok(material); checks++;
  const saved = (await db.query("SELECT source_kind,source_question_ids,question_numbers,reference,reference_status,reference_revision,reference_approved_at,archived_at,pdf_path FROM public.homework_materials WHERE id=$1", [material])).rows[0];
  eq(saved.source_kind, "unit_mock", "generated material origin");
  eq(saved.source_question_ids, ids, "source selection order preserved");
  eq(saved.question_numbers, ["1", "2"], "worksheet numbering is sequential");
  eq(saved.reference.map((row) => row.questionNumber), ["1", "2"], "reference numbering matches the worksheet");
  eq(saved.reference.map((row) => row.answer), ["B 정답", "A 정답"], "answers are attached to ordered sources");
  eq(saved.reference.map((row) => row.sourcePages), [[1], [2, 3]], "actual PDF pages preserved");
  assert.ok(saved.reference.every((row) => row.needsReview === true)); checks++;
  eq(saved.reference_status, "draft", "generated reference needs teacher approval");
  eq(saved.reference_approved_at, null, "generated reference never auto-approved");
  eq(saved.reference_revision, 1, "initial generated reference revision");
  eq(saved.archived_at, null, "new generated material remains visible");
  eq(await value("SELECT consumed_at IS NOT NULL AS value FROM public.homework_uploads WHERE id=$1", [upload]), true, "uploaded PDF consumed once");
  await fails(generatedSql, generatedArgs(upload));

  const invalidCases = [
    { questionIds: [ids[0], ids[0]] },
    { questionIds: [ids[0], "missing-question"] },
    { versions: [updated] },
    { versions: ["2026-10-06T01:00:01Z", updated] },
    { reference: [references[0]] },
    { reference: [{ ...references[0], sourcePages: [4] }, references[1]] },
  ];
  for (const invalid of invalidCases) {
    const ticket = await issue(teacher);
    await fails(generatedSql, generatedArgs(ticket, invalid.questionIds ?? ids, invalid.versions ?? [updated, updated], invalid.reference ?? references));
    eq(await value("SELECT consumed_at IS NULL AS value FROM public.homework_uploads WHERE id=$1", [ticket]), true, "invalid source or metadata never consumes upload");
  }
  const changed = await issue(teacher);
  await db.query("UPDATE public.questions SET updated_at=updated_at+interval '1 second' WHERE id=$1", [ids[0]]);
  await fails(generatedSql, generatedArgs(changed));
  eq(await value("SELECT consumed_at IS NULL AS value FROM public.homework_uploads WHERE id=$1", [changed]), true, "source modification during server-to-RPC window rejected");
  await db.query("UPDATE public.questions SET updated_at=$2::timestamptz,quality_status='quarantined' WHERE id=$1", [ids[0], updated]);
  await fails(generatedSql, generatedArgs(await issue(teacher)));
  await db.query("UPDATE public.questions SET quality_status='approved' WHERE id=$1", [ids[0]]);
  await fails(generatedSql, generatedArgs(await issue(teacher), ids, [updated, updated], references, student));

  const assignment = await value(assignmentSql, assignmentArgs(material));
  const first = await value("SELECT public.homework_finalize_submission($1,$2) AS value", [await issue(student, "submission", assignment), student]);
  await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES ('homework-pdfs',$1)", [saved.pdf_path]);
  eq(await value(archiveSql, [material, teacher, false]), material, "archive returns material id");
  eq(await value("SELECT archived_at IS NOT NULL AS value FROM public.homework_materials WHERE id=$1", [material]), true, "library deletion is archive");
  eq(await value("SELECT count(*)::integer AS value FROM public.homework_materials WHERE id=$1", [material]), 1, "assigned material retained");
  eq(await value("SELECT count(*)::integer AS value FROM public.homework_assignments WHERE id=$1", [assignment]), 1, "existing assignment retained");
  eq(await value("SELECT latest_submission_id AS value FROM public.homework_recipients WHERE assignment_id=$1 AND user_id=$2", [assignment, student]), first, "existing latest attempt retained");
  eq(await value("SELECT count(*)::integer AS value FROM public.homework_submissions WHERE id=$1", [first]), 1, "submitted work retained");
  eq(await value("SELECT reference AS value FROM public.homework_materials WHERE id=$1", [material]), saved.reference, "teacher references retained");
  eq(await value("SELECT count(*)::integer AS value FROM storage.objects WHERE bucket_id='homework-pdfs' AND name=$1", [saved.pdf_path]), 1, "private PDF retained");
  await fails(assignmentSql, assignmentArgs(material, [anotherStudent]));

  // Students already assigned the material may continue submitting after library archive.
  await db.query("UPDATE public.homework_submissions SET created_at=now()-interval '61 seconds' WHERE id=$1", [first]);
  const second = await value("SELECT public.homework_finalize_submission($1,$2) AS value", [await issue(student, "submission", assignment), student]);
  assert.ok(second && second !== first); checks++;
  eq(await value("SELECT count(*)::integer AS value FROM public.homework_submissions WHERE assignment_id=$1", [assignment]), 2, "archive preserves resubmission history");
  await fails(archiveSql, [material, student, true]);
  eq(await value(archiveSql, [material, teacher, true]), material, "undo archive returns same material");
  eq(await value("SELECT archived_at AS value FROM public.homework_materials WHERE id=$1", [material]), null, "undo archive restores visibility");
  assert.ok(await value(assignmentSql, assignmentArgs(material, [anotherStudent]))); checks++;

  for (const signature of [
    "public.homework_create_generated_material(uuid,uuid,text,text,text,text,text[],text[],jsonb)",
    "public.homework_archive_material(uuid,uuid,boolean)",
  ]) {
    eq(await value("SELECT has_function_privilege('authenticated',$1,'EXECUTE') AS value", [signature]), false, "browser RPC denied");
    eq(await value("SELECT has_function_privilege('anon',$1,'EXECUTE') AS value", [signature]), false, "anonymous RPC denied");
    eq(await value("SELECT has_function_privilege('service_role',$1,'EXECUTE') AS value", [signature]), true, "service RPC allowed");
  }
  console.log(`generated homework PostgreSQL checks passed: ${checks}`);
} finally {
  await db.close();
}
