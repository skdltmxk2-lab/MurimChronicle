// Apply an explicitly reviewed private manifest. Default is read-only.
// Raw content, backups and exam identifiers are kept only in --out, outside Git.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const equal=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const contentFields=['question','content_type','question_image','question_type','options','correct_option_id','answer_text','explanation','explanation_content_type','explanation_image'];
export const contentReviewFingerprint=q=>digest(Object.fromEntries(contentFields.map(f=>[f,q[f]])));

export async function applyReviewedBatch(argv=process.argv.slice(2)) {
const arg=(name,fallback)=>{const i=argv.indexOf(name);return i<0?fallback:argv[i+1]};
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');
const file=arg('--patches'),scopeFile=arg('--scope'),outArg=arg('--out');
if(!file||!scopeFile||!outArg)throw Error('Required: --patches PRIVATE.json --scope ID_MANIFEST.json --out PRIVATE_DIRECTORY');
const out=resolve(outArg);mkdirSync(out,{recursive:true});
const patches=JSON.parse(readFileSync(resolve(file),'utf8'));
const scope=JSON.parse(readFileSync(resolve(scopeFile),'utf8'));
const scopeIds=new Set((Array.isArray(scope)?scope:scope.questions).map(q=>typeof q==='string'?q:q.id));
const scopeMap=new Map((Array.isArray(scope)?scope:scope.questions).filter(q=>q&&typeof q==='object').map(q=>[q.id,q]));
const allowedFields=new Set(['question','options','correct_option_id','answer_text','explanation','question_type','content_type','question_image','explanation_content_type','explanation_image','quality_status','quality_reasons','validator_version','validated_at']);
const daily=q=>q.pool==='daily'||(q.tags||[]).some(t=>/^daily$/i.test(t))||/^q-daily-/i.test(q.id||'');
if(new Set(patches.map(p=>p.id)).size!==patches.length)throw Error('Duplicate patch IDs');
for(const p of patches){
 if(!scopeIds.has(p.id)||!p.reason||!p.source?.length)throw Error(`Patch lacks scope or evidence: ${p.id}`);
 if(!Object.keys(p.after||{}).length)throw Error(`Empty patch: ${p.id}`);
 if(!equal(Object.keys(p.before||{}).sort(),Object.keys(p.after).sort()))throw Error(`Before/after field sets differ: ${p.id}`);
 for(const f of Object.keys(p.after))if(!allowedFields.has(f)||!Object.hasOwn(p.before||{},f))throw Error(`Unreviewed field: ${p.id}.${f}`);
}
const env=Object.fromEntries(readFileSync(resolve(arg('--env-file',resolve(root,'.env.local'))),'utf8').split(/\r?\n/).filter(x=>x&&!x.startsWith('#')&&x.includes('=')).map(x=>{const i=x.indexOf('=');return[x.slice(0,i).trim(),x.slice(i+1).trim().replace(/^(['"])(.*)\1$/,'$2')]}));
if(!env.SUPABASE_SERVICE_ROLE_KEY||!env.NEXT_PUBLIC_SUPABASE_URL)throw Error('Missing DB credentials');
const headers={apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:`Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`};
function urlFor(table,params){const url=new URL(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${table}`);for(const[k,v]of Object.entries(params))url.searchParams.set(k,v);return url;}
function examCas(row){
 // PostgreSQL's row version changes on every UPDATE, including edits to fields
 // outside this migration. A short revision filter also works for image exams.
 if(!row.xmin)throw Error('Missing PostgreSQL exam row revision');
 return{id:`eq.${row.id}`,xmin:`eq.${row.xmin}`,select:'id,xmin'};
}
async function request(table,params,body){
 const url=urlFor(table,params);const response=await fetch(url,{method:body?'PATCH':'GET',headers:{...headers,...(body?{'Content-Type':'application/json',Prefer:'return=representation'}:{})},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(60000)});
 if(!response.ok){let code='';try{code=(await response.json()).code||''}catch{}throw Error(`${body?'PATCH':'GET'} ${table}: HTTP ${response.status} ${code}`);}
 return response.json();
}
async function all(table,select,filters={},orderBy='id'){const rows=[];let last;while(true){const page=await request(table,{select,order:`${orderBy}.asc`,limit:'500',...filters,...(last?{[orderBy]:`gt.${last}`}:{})});if(!page.length)break;rows.push(...page);last=page.at(-1)[orderBy];}return rows;}
const runId=new Date().toISOString().replace(/[:.]/g,'-');
const save=(name,data)=>writeFileSync(resolve(out,name),JSON.stringify(data,null,2)+'\n');
const metadata=await all('questions','id,pool,tags,updated_at');
const dailyBefore=metadata.filter(daily);
const metaMap=new Map(metadata.map(q=>[q.id,q]));
const pending=[];const conflicts=[];const masterById=new Map();
for(const p of patches){
 if(!metaMap.has(p.id)||daily(metaMap.get(p.id))){conflicts.push({id:p.id,reason:'missing_or_daily'});continue;}
 const rows=await request('questions',{select:'*',id:`eq.${p.id}`});const q=rows[0];
 masterById.set(p.id,q);
 const reviewed=scopeMap.get(p.id);
 if(!reviewed?.reviewedContentHash||!reviewed.reviewedUpdatedAt){conflicts.push({id:p.id,reason:'missing_frozen_review_fingerprint'});continue;}
 if(Object.entries(p.after).every(([k,v])=>equal(q[k],v))){
  if(contentReviewFingerprint({...q,...p.before})!==reviewed.reviewedContentHash)conflicts.push({id:p.id,reason:'unrelated_content_changed_after_apply'});
  continue;
 }
 if(contentReviewFingerprint(q)!==reviewed.reviewedContentHash||q.updated_at!==reviewed.reviewedUpdatedAt)conflicts.push({id:p.id,reason:'frozen_snapshot_changed'});
 for(const[k,v]of Object.entries(p.before))if(!equal(q[k],v))conflicts.push({id:p.id,field:k,reason:'before_value_changed'});
 pending.push({patch:p,before:q,after:{...p.after,updated_at:new Date().toISOString()}});
}
const fieldMap={question:'question',options:'options',correct_option_id:'correctOptionId',answer_text:'answerText',explanation:'explanation',question_type:'questionType',content_type:'contentType',question_image:'questionImage',explanation_content_type:'explanationContentType',explanation_image:'explanationImage'};
function comparable(field,value){
 if(field==='options')return(value||[]).map(o=>({id:o.id,label:o.label??o.id,text:o.text??'',image:o.image??'',contentType:o.contentType??'latex'}));
 if(field==='question_type')return value??'multiple_choice';
 if(field==='content_type'||field==='explanation_content_type')return value??'latex';
 return value??'';
}
const pmap=new Map(patches.map(p=>[p.id,p]));
const exams=await all('generated_exams','id,xmin,problems,source_question_ids,generation_summary');
const examChanges=[];
for(const exam of exams){
 if(!Array.isArray(exam.problems))continue;
 const removed=[];const problems=[];
 for(const problem of exam.problems){
  const p=pmap.get(problem.id);
  if(!p){problems.push(problem);continue;}
  if(p.after.quality_status==='quarantined'){
   const master=masterById.get(p.id);
   for(const[f,target]of Object.entries(fieldMap))if(!equal(comparable(f,problem[target]),comparable(f,master[f])))conflicts.push({table:'generated_exams',id:exam.id,questionId:p.id,field:target,reason:'quarantine_snapshot_content_drift'});
   removed.push(problem.id);continue;
  }
  const copy={...problem};
  for(const[f,after]of Object.entries(p.after)){
   const target=fieldMap[f];if(!target||equal(problem[target],after))continue;
   if(!equal(problem[target],p.before[f])){conflicts.push({table:'generated_exams',id:exam.id,questionId:p.id,field:target,reason:'snapshot_field_drift'});continue;}
   copy[target]=after;
  }
  problems.push(copy);
 }
 if(equal(problems,exam.problems))continue;
 const after={problems};
 if(removed.length){
  after.source_question_ids=(exam.source_question_ids||[]).filter(id=>!removed.includes(id));
  after.generation_summary={...(exam.generation_summary||{}),selectedCount:problems.length,difficultyCounts:problems.reduce((a,p)=>(a[p.difficulty]=(a[p.difficulty]||0)+1,a),{}),warnings:[...(exam.generation_summary?.warnings||[]),`2026-11-02 B01 검토: 출제 불가 문항 ${removed.length}개 제외`]};
 }
 const params=examCas(exam);
 examChanges.push({before:exam,after,params,removed});
}
// A legacy result without its own examSnapshot falls back to generated_exams.
// Fail closed rather than changing a student's historical question display.
const legacyAttempts=examChanges.length?await all('exam_attempts','attempt_id,exam_id',{'result->>examSnapshot':'is.null'},'attempt_id'):[];
const affectedExamIds=new Set(examChanges.map(e=>e.before.id));
const protectedLegacy=legacyAttempts.filter(a=>affectedExamIds.has(a.exam_id));
for(const a of protectedLegacy)conflicts.push({table:'generated_exams',id:a.exam_id,reason:'legacy_attempt_without_snapshot_requires_preservation'});
// Exercise the exact CAS filters as GETs before any writes. This also catches
// proxy URL limits and DB JSON/array filter syntax without a partial apply.
if(!conflicts.length)for(const change of examChanges){
 try{const rows=await request('generated_exams',change.params);if(rows.length!==1)conflicts.push({table:'generated_exams',id:change.before.id,reason:'cas_preflight_conflict'});}
 catch(error){conflicts.push({table:'generated_exams',id:change.before.id,reason:'cas_preflight_failed',message:error.message});}
}
const plan={mode:argv.includes('--apply')?'apply':argv.includes('--verify')?'verify':'dry-run',manifestDigest:digest(patches),patchCount:patches.length,pendingQuestions:pending.length,examChanges:examChanges.length,removedSnapshots:examChanges.reduce((n,e)=>n+e.removed.length,0),dailyMetadataCount:dailyBefore.length,legacyAttemptConflicts:protectedLegacy.length,conflicts};
save('preflight.private.json',plan);console.log(JSON.stringify(plan));
if(conflicts.length)throw Error('Preflight stopped: no writes');
if(argv.includes('--verify')){if(pending.length||examChanges.length)throw Error('Changes remain unapplied');console.log('Readback verified');return plan;}
if(!argv.includes('--apply'))return plan;
save(`backup-${runId}.private.json`,{questions:pending.map(p=>p.before),exams:examChanges.map(e=>e.before)});
const log=[];const rollback=[];let status='applying';
const persist=()=>save(`receipt-${runId}.private.json`,{...plan,status,log,rollback});
persist();
try{
 for(const change of pending){
  const {patch,before,after}=change;
  const step={table:'questions',id:patch.id,status:'intent',afterRevision:after.updated_at,change};log.push(step);persist();
  const rows=await request('questions',{id:`eq.${patch.id}`,updated_at:`eq.${before.updated_at}`,pool:`eq.${before.pool}`,select:'id,updated_at'},after);
  if(rows.length!==1){if(rows.length===0)step.status='not_applied';persist();throw Error(`Question revision conflict: ${patch.id}`);}
  step.status='applied';step.afterRevision=rows[0].updated_at;persist();
 }
 for(const change of examChanges){
  const step={table:'generated_exams',id:change.before.id,status:'intent',change};log.push(step);persist();
  const rows=await request('generated_exams',change.params,change.after);
  if(rows.length!==1){if(rows.length===0)step.status='not_applied';persist();throw Error('Exam CAS conflict');}
  step.status='applied';step.afterRevision=rows[0].xmin;persist();
 }
 for(const p of patches){const [q]=await request('questions',{id:`eq.${p.id}`,select:Object.keys(p.after).join(',')});for(const[f,v]of Object.entries(p.after))if(!equal(q[f],v))throw Error(`Question readback failed: ${p.id}.${f}`);}
 for(const e of examChanges){const [q]=await request('generated_exams',{id:`eq.${e.before.id}`,select:Object.keys(e.after).join(',')});for(const[f,v]of Object.entries(e.after))if(!equal(q[f],v))throw Error('Exam readback failed');}
 const afterMetadata=await all('questions','id,pool,tags,updated_at');
 if(!equal(dailyBefore,afterMetadata.filter(daily)))throw Error('Daily metadata changed during apply');
 status='verified';persist();
 const receipt={completedAt:new Date().toISOString(),manifestDigest:plan.manifestDigest,questionCount:pending.length,examCount:examChanges.length,removedSnapshots:plan.removedSnapshots,dailyMetadataUnchanged:dailyBefore.length,studentAttemptsWrites:0,verified:true,questions:patches.map(p=>({id:p.id,fields:Object.keys(p.after).map(f=>({field:f,beforeHash:digest(p.before[f]),afterHash:digest(p.after[f])}))}))};
 save('receipt.public.json',receipt);console.log(JSON.stringify({status,questionCount:pending.length,examCount:examChanges.length,removedSnapshots:plan.removedSnapshots}));
}catch(error){
 status='rolling_back';persist();
 for(const step of [...log].reverse()){
  try{
   if(step.status==='not_applied'){rollback.push({table:step.table,id:step.id,status:'not_applied'});persist();continue;}
   const before=Object.fromEntries(Object.keys(step.change.after).map(f=>[f,step.change.before[f]]));
   const expectedAfter=step.table==='questions'?{...step.change.after,updated_at:step.afterRevision}:{...step.change.after,...(step.afterRevision?{xmin:step.afterRevision}:{})};
   const fields=[...new Set([...Object.keys(expectedAfter),...(step.table==='generated_exams'?['xmin']:[])])];
   const readCurrent=async()=>{const [row]=await request(step.table,{id:`eq.${step.id}`,select:fields.join(',')});return row;};
   const match=(row,values)=>row&&Object.entries(values).every(([f,v])=>equal(row[f],v));
   const current=await readCurrent();
   if(step.table==='generated_exams'&&step.status==='intent'&&!step.afterRevision){
    // A readback xmin can belong to a later writer, even if changed fields still
    // equal our values. Do not adopt an unacknowledged revision as our own.
    throw Error('unacknowledged_exam_revision_requires_manual_reconciliation');
   }
   if(step.status==='intent'&&!match(current,expectedAfter)){
    // A timed-out request can still be in flight. Even a current "before" read
    // does not prove it will never commit. Keep its intent for reconciliation.
    throw Error(match(current,before)?'unconfirmed_request_before_state_requires_reconciliation':'unconfirmed_request_or_concurrent_change');
   }
   if(!match(current,expectedAfter))throw Error('owned_after_state_changed; refusing rollback overwrite');
   step.status='rolling_back';persist();
   let rollbackError;
   if(step.table==='questions'){
    try{const rows=await request('questions',{id:`eq.${step.id}`,updated_at:`eq.${step.afterRevision}`,select:'id'},before);if(rows.length!==1)throw Error('rollback revision conflict');}catch(e){rollbackError=e;}
   }else{
    const e=step.change;
    try{const rows=await request('generated_exams',examCas({id:step.id,xmin:step.afterRevision}),before);if(rows.length!==1)throw Error('rollback snapshot conflict');}catch(e){rollbackError=e;}
   }
   const restored=await readCurrent();
   if(!match(restored,before))throw Error(rollbackError?.message||'rollback_readback_failed');
   step.status='restored';
   rollback.push({table:step.table,id:step.id,status:'restored'});
  }catch(e){rollback.push({table:step.table,id:step.id,status:'manual_recovery_required',message:e.message});}
  persist();
 }
 status=rollback.some(r=>!['restored','not_applied'].includes(r.status))?'manual_recovery_required':'rolled_back';persist();throw Error(`${error.message}; ${status}; see private receipt`);
}
}
if(process.argv[1]&&resolve(process.argv[1])===resolve(fileURLToPath(import.meta.url)))await applyReviewedBatch();
