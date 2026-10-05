import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// Optional local test dependency, intentionally separate from application packages:
// npm install --prefix .tmp/homework-pglite --no-save --package-lock=false --ignore-scripts @electric-sql/pglite
// node tests/test_homework_sql.mjs
const require = createRequire(import.meta.url);
let packagePath;
try { packagePath = require.resolve('@electric-sql/pglite'); }
catch { packagePath = require.resolve('../.tmp/homework-pglite/node_modules/@electric-sql/pglite'); }
const { PGlite } = await import(pathToFileURL(packagePath).href);

const db = new PGlite();
let checks = 0;
const value = async (sql,args=[]) => (await db.query(sql,args)).rows[0]?.value;
const eq = (a,b,label) => { assert.equal(a,b,label); checks++; };
async function fails(sql,args,message) { await assert.rejects(db.query(sql,args),error => error.message.includes(message)); checks++; }
const teacher = randomUUID(), teacher2 = randomUUID(), student = randomUUID(), student2 = randomUUID(), stranger = randomUUID();
const issue = async (actor,purpose,assignmentId=null) => {
  const id = randomUUID();
  return value('SELECT public.homework_issue_upload($1,$2,$3,$4,$5,$6,$7,$8) AS value',[id,actor,purpose,assignmentId,`test/${id}.pdf`,'test.pdf',100,2]);
};
const createAssignment = (actor,material,students=[student],auto=true) => value('SELECT public.homework_create_assignment($1,$2,$3,$4,$5,$6,$7) AS value',[actor,material,students,'풀이 제출',null,true,auto?'auto':'review']);
const submit = async (actor,assignment) => value('SELECT public.homework_finalize_submission($1,$2) AS value',[await issue(actor,'submission',assignment),actor]);
const markAiDraft = async (id,{revision=0,referenceRevision=1,feedback,lock=randomUUID()}={}) => {
  const settings = await value("SELECT value::jsonb AS value FROM public.app_settings WHERE key='homework_ai_settings'");
  await db.query("UPDATE public.homework_submissions SET draft_feedback=$2::jsonb,feedback_revision=$3,reference_revision=$4,settings_snapshot=$5::jsonb,ai_status='draft',ai_lock_token=$6,published_feedback=NULL,published_at=NULL WHERE id=$1",[id,JSON.stringify(feedback??readyFeedback),revision,referenceRevision,JSON.stringify(settings),lock]);
  return lock;
};
const publish = (id,lock,revision=0,referenceRevision=1) => value('SELECT public.homework_publish_feedback($1,$2,$3,$4) AS value',[id,revision,lock,referenceRevision]);
const readyFeedback = [{questionNumber:'1',verdict:'correct',studentWork:'x=1',errorStep:'',reason:'계산이 맞습니다.',hint:'',comment:'식을 잘 정리했어요.',sourcePages:[1],needsReview:false,reviewReason:'',verified:true}];

try {
  await db.exec(`
    CREATE ROLE anon;
    CREATE ROLE authenticated;
    CREATE ROLE service_role BYPASSRLS;
    CREATE SCHEMA auth;
    CREATE SCHEMA storage;
    CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE TABLE public.profiles(id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,is_admin boolean NOT NULL DEFAULT false,name text DEFAULT '테스트');
    CREATE TABLE public.app_settings(key text PRIMARY KEY,value text NOT NULL,updated_at timestamptz DEFAULT now());
    CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text NOT NULL,name text NOT NULL);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    GRANT ALL ON storage.objects TO anon,authenticated,service_role;
    CREATE POLICY older_broad_policy ON storage.objects FOR ALL TO public USING (true) WITH CHECK (true);
    GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated,service_role;
  `);
  await db.query('INSERT INTO auth.users(id) SELECT unnest($1::uuid[])',[ [teacher,teacher2,student,student2] ]);
  await db.query('INSERT INTO public.profiles(id,is_admin) SELECT id,id=ANY($1::uuid[]) FROM auth.users',[ [teacher,teacher2] ]);
  const migration = await readFile(new URL('../supabase/migrations/20261006_homework.sql',import.meta.url),'utf8');
  await db.exec(migration);
  await db.exec(migration);
  console.log('Postgres migration applied twice successfully');

  const tables = ['homework_materials','homework_assignments','homework_recipients','homework_submissions','homework_uploads'];
  for (const table of tables) {
    eq(await value('SELECT has_table_privilege($1,$2,$3) AS value',['authenticated',`public.${table}`,'SELECT']),false,`${table} browser SELECT denied`);
    eq(await value('SELECT has_table_privilege($1,$2,$3) AS value',['anon',`public.${table}`,'INSERT']),false,`${table} anonymous INSERT denied`);
    eq(await value('SELECT has_table_privilege($1,$2,$3) AS value',['service_role',`public.${table}`,'SELECT,INSERT,UPDATE,DELETE']),true,`${table} service privileges`);
    eq(await value('SELECT relrowsecurity AS value FROM pg_class WHERE oid=$1::regclass',[`public.${table}`]),true,`${table} RLS enabled`);
  }
  const functions = (await db.query("SELECT oid,proname FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname LIKE 'homework_%'")).rows;
  for (const fn of functions) {
    eq(await value('SELECT has_function_privilege($1,$2,$3) AS value',['authenticated',fn.oid,'EXECUTE']),false,`${fn.proname} browser execution denied`);
    eq(await value('SELECT has_function_privilege($1,$2,$3) AS value',['anon',fn.oid,'EXECUTE']),false,`${fn.proname} anonymous execution denied`);
    eq(await value('SELECT has_function_privilege($1,$2,$3) AS value',['service_role',fn.oid,'EXECUTE']),true,`${fn.proname} service execution allowed`);
  }
  await db.exec('SET ROLE authenticated');
  await fails('SELECT * FROM public.homework_materials',[],'permission denied');
  await fails('SELECT public.homework_claim_reference($1,$2)',[randomUUID(),randomUUID()],'permission denied');
  await db.exec('RESET ROLE');
  eq(await value("SELECT public AS value FROM storage.buckets WHERE id='homework-pdfs'"),false,'private bucket');
  await db.exec("INSERT INTO storage.objects(bucket_id,name) VALUES ('homework-pdfs','private.pdf'),('assets','public.png')");
  for (const role of ['anon','authenticated']) {
    await db.exec(`SET ROLE ${role}`);
    eq(await value("SELECT count(*)::integer AS value FROM storage.objects WHERE bucket_id='homework-pdfs'"),0,`${role} cannot read homework objects despite broad older policy`);
    eq(await value("SELECT count(*)::integer AS value FROM storage.objects WHERE bucket_id='assets'"),1,`${role} other bucket read preserved`);
    await fails("INSERT INTO storage.objects(bucket_id,name) VALUES ('homework-pdfs','unsigned.pdf')",[],'row-level security');
    await fails("UPDATE storage.objects SET bucket_id='homework-pdfs' WHERE bucket_id='assets'",[],'row-level security');
    eq((await db.query("UPDATE storage.objects SET name='tampered.pdf' WHERE bucket_id='homework-pdfs' RETURNING name")).rows.length,0,`${role} cannot overwrite homework`);
    eq((await db.query("DELETE FROM storage.objects WHERE bucket_id='homework-pdfs' RETURNING id")).rows.length,0,`${role} cannot delete homework`);
    await db.exec('RESET ROLE');
  }
  await db.exec('SET ROLE service_role');
  eq(await value("SELECT count(*)::integer AS value FROM storage.objects WHERE bucket_id='homework-pdfs'"),1,'service can read private homework');
  await db.query("INSERT INTO storage.objects(bucket_id,name) VALUES ('homework-pdfs','signed-upload.pdf')");
  eq(await value("SELECT count(*)::integer AS value FROM storage.objects WHERE bucket_id='homework-pdfs'"),2,'service/signed upload bypass role can insert homework');
  await db.exec('RESET ROLE');

  await fails('SELECT public.homework_issue_upload($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),student,'material',null,'test/no.pdf','no.pdf',100,2],'HOMEWORK_FORBIDDEN');
  const materialUpload = await issue(teacher,'material');
  const material = await value('SELECT public.homework_create_material($1,$2,$3,$4,$5,$6,$7) AS value',[materialUpload,teacher,'PDF 숙제','homework','미분학','', ['1']]);
  assert.ok(material); checks++;
  await fails('SELECT public.homework_create_material($1,$2,$3,$4,$5,$6,$7)',[materialUpload,teacher,'중복','homework','','',['1']],'HOMEWORK_UPLOAD_INVALID');
  await fails('SELECT public.homework_create_assignment($1,$2,$3,$4,$5,$6,$7)',[student,material,[student],'',null,true,'auto'],'HOMEWORK_FORBIDDEN');
  await fails('SELECT public.homework_create_assignment($1,$2,$3,$4,$5,$6,$7)',[teacher,material,[stranger],'',null,true,'auto'],'HOMEWORK_STUDENTS_INVALID');
  await fails('SELECT public.homework_create_assignment($1,$2,$3,$4,$5,$6,$7)',[teacher,material,[teacher],'',null,true,'auto'],'HOMEWORK_STUDENTS_INVALID');
  const assignment = await createAssignment(teacher2,material,[student,student,student2]);
  eq(await value('SELECT count(*)::integer AS value FROM public.homework_recipients WHERE assignment_id=$1',[assignment]),2,'deduped recipients, shared staff admin');
  eq(await value('SELECT due_at IS NULL AS value FROM public.homework_assignments WHERE id=$1',[assignment]),true,'deadline optional');
  await fails('SELECT public.homework_issue_upload($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),student,'submission',randomUUID(),'test/foreign.pdf','foreign.pdf',100,2],'HOMEWORK_FORBIDDEN');
  const upload = await issue(student,'submission',assignment);
  await fails('SELECT public.homework_finalize_submission($1,$2)',[upload,student2],'HOMEWORK_UPLOAD_INVALID');
  const first = await value('SELECT public.homework_finalize_submission($1,$2) AS value',[upload,student]);
  eq(await value('SELECT attempt_number AS value FROM public.homework_submissions WHERE id=$1',[first]),1,'first attempt');
  await fails('SELECT public.homework_finalize_submission($1,$2)',[upload,student],'HOMEWORK_UPLOAD_INVALID');
  const retryTicket = await issue(student,'submission',assignment);
  await fails('SELECT public.homework_finalize_submission($1,$2)',[retryTicket,student],'HOMEWORK_SUBMISSION_RATE');
  await db.query("UPDATE public.homework_submissions SET created_at=now()-interval '61 seconds' WHERE id=$1",[first]);
  const second = await value('SELECT public.homework_finalize_submission($1,$2) AS value',[retryTicket,student]);
  eq(await value('SELECT attempt_number AS value FROM public.homework_submissions WHERE id=$1',[second]),2,'resubmit increments attempt');
  eq(await value('SELECT latest_submission_id AS value FROM public.homework_recipients WHERE assignment_id=$1 AND user_id=$2',[assignment,student]),second,'latest pointer');
  await db.query("UPDATE public.homework_materials SET reference_status='approved',reference_revision=1 WHERE id=$1",[material]);

  const staleLock = await markAiDraft(first);
  eq(await publish(first,staleLock),false,'old submission automatic publish blocked');
  await fails('SELECT public.homework_save_feedback($1,$2,$3,$4,$5)',[first,teacher,JSON.stringify(readyFeedback),0,true],'HOMEWORK_STALE_SUBMISSION');
  const lock = await markAiDraft(second);
  eq(await publish(second,randomUUID()),false,'wrong worker token blocked');
  eq(await publish(second,lock,5),false,'wrong edit revision blocked');
  eq(await publish(second,lock,0,2),false,'wrong reference revision blocked');
  await db.query('UPDATE public.homework_assignments SET ai_enabled=false WHERE id=$1',[assignment]);
  eq(await publish(second,lock),false,'assignment toggle off');
  await db.query('UPDATE public.homework_assignments SET ai_enabled=true,release_mode=$2 WHERE id=$1',[assignment,'review']);
  eq(await publish(second,lock),false,'teacher approval mode blocks auto');
  await db.query("UPDATE public.homework_assignments SET release_mode='auto' WHERE id=$1",[assignment]);
  const originalSettings = await value("SELECT value AS value FROM public.app_settings WHERE key='homework_ai_settings'");
  await db.query("UPDATE public.app_settings SET value=jsonb_set(value::jsonb,'{aiEnabled}','false')::text WHERE key='homework_ai_settings'");
  eq(await publish(second,lock),false,'global toggle off');
  await db.query("UPDATE public.app_settings SET value=$1 WHERE key='homework_ai_settings'",[originalSettings]);
  await db.query("UPDATE public.app_settings SET value=jsonb_set(value::jsonb,'{tone}','\"casual\"')::text WHERE key='homework_ai_settings'");
  eq(await publish(second,lock),false,'tone changes block stale draft publication');
  await db.query("UPDATE public.app_settings SET value=$1 WHERE key='homework_ai_settings'",[originalSettings]);
  await db.query("UPDATE public.homework_materials SET reference_status='draft' WHERE id=$1",[material]);
  eq(await publish(second,lock),false,'unapproved reference blocks');
  await db.query("UPDATE public.homework_materials SET reference_status='approved' WHERE id=$1",[material]);

  for (const [label,feedback] of [
    ['missing verdict',[{...readyFeedback[0],verdict:'missing'}]],
    ['unreadable verdict',[{...readyFeedback[0],verdict:'unreadable'}]],
    ['empty work',[{...readyFeedback[0],studentWork:''}]],
    ['empty page',[{...readyFeedback[0],sourcePages:[]}]],
    ['out of range page',[{...readyFeedback[0],sourcePages:[3]}]],
    ['fractional page',[{...readyFeedback[0],sourcePages:[1.2]}]],
    ['review required',[{...readyFeedback[0],needsReview:true}]],
    ['unverified',[{...readyFeedback[0],verified:false}]],
    ['empty comment',[{...readyFeedback[0],comment:''}]],
    ['wrong question',[{...readyFeedback[0],questionNumber:'2'}]],
  ]) {
    const badLock = await markAiDraft(second,{feedback});
    eq(await publish(second,badLock),false,label);
  }
  const goodLock = await markAiDraft(second);
  eq(await publish(second,goodLock),true,'eligible automatic feedback published');
  eq(await publish(second,goodLock),false,'automatic duplicate publication blocked');
  eq(await value('SELECT published_feedback=$2::jsonb AS value FROM public.homework_submissions WHERE id=$1',[second,JSON.stringify(readyFeedback)]),true,'published immutable snapshot copied');

  const unreadable = [{...readyFeedback[0],verdict:'unreadable',studentWork:'',sourcePages:[],comment:'다시 촬영해서 제출해 주세요.'}];
  eq(await value('SELECT public.homework_save_feedback($1,$2,$3,$4,$5) AS value',[second,teacher2,JSON.stringify(unreadable),0,true]),1,'manual reviewed unreadable feedback publishes');
  await fails('SELECT public.homework_save_feedback($1,$2,$3,$4,$5)',[second,teacher,JSON.stringify(readyFeedback),0,false],'HOMEWORK_REVISION_CONFLICT');
  await fails('SELECT public.homework_save_feedback($1,$2,$3,$4,$5)',[second,student,JSON.stringify(readyFeedback),1,false],'HOMEWORK_FORBIDDEN');
  eq(await value('SELECT public.homework_save_feedback($1,$2,$3,$4,$5) AS value',[second,teacher,JSON.stringify(readyFeedback),1,false]),2,'save correction without republish');
  eq(await value('SELECT published_feedback=$2::jsonb AS value FROM public.homework_submissions WHERE id=$1',[second,JSON.stringify(unreadable)]),true,'saving draft retains published snapshot');

  const studentTwo = await submit(student2,assignment);
  const firstClaim = randomUUID();
  eq(await value('SELECT public.homework_claim_submission($1,$2) AS value',[studentTwo,firstClaim]),true,'pending job claimed');
  eq(await value('SELECT public.homework_claim_submission($1,$2) AS value',[studentTwo,randomUUID()]),false,'active job cannot be claimed twice');
  await db.query("UPDATE public.homework_submissions SET ai_started_at=now()-interval '16 minutes' WHERE id=$1",[studentTwo]);
  eq(await value('SELECT public.homework_claim_submission($1,$2) AS value',[studentTwo,randomUUID()]),true,'stale processing job recoverable');

  // Issue ticket quotas are enforced atomically before signing or storing a PDF.
  await db.query("UPDATE public.homework_uploads SET created_at=now()-interval '2 hours' WHERE owner_id=$1",[student]);
  for (let i=0;i<10;i++) await issue(student,'submission',assignment);
  await fails('SELECT public.homework_issue_upload($1,$2,$3,$4,$5,$6,$7,$8)',[randomUUID(),student,'submission',assignment,'test/over-limit.pdf','test.pdf',100,2],'HOMEWORK_UPLOAD_RATE');

  await db.query('DELETE FROM auth.users WHERE id=$1',[student2]);
  eq(await value('SELECT count(*)::integer AS value FROM public.homework_recipients WHERE user_id=$1',[student2]),0,'account deletion removes recipients');
  eq(await value('SELECT count(*)::integer AS value FROM public.homework_submissions WHERE user_id=$1',[student2]),0,'account deletion removes submissions');
  console.log(`PGlite Postgres homework checks passed (${checks} assertions)`);
} catch (error) {
  console.error('PGlite homework verification failed:',error.message,{position:error.position,internalPosition:error.internalPosition,where:error.where,internalQuery:error.internalQuery});
  process.exitCode=1;
} finally { await db.close(); }
