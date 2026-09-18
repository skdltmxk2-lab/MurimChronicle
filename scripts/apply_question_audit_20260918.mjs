// Reviewed content migration. Default is a read-only preflight; --apply is explicit.
// Credentials stay in memory. Backups and exam identifiers must stay out of Git.
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const arg=(name,fallback)=>{const i=process.argv.indexOf(name);return i<0?fallback:process.argv[i+1]};
const root=path.resolve(arg('--root',path.join(path.dirname(fileURLToPath(import.meta.url)),'..')));
const manifestArg=arg('--patches');
if(!manifestArg)throw Error('Pass --patches with the private, reviewed migration manifest. Raw question content is not stored in Git.');
const manifest=path.resolve(manifestArg);
const out=path.resolve(arg('--out',path.join(root,'tmp/audit/content-20260918')));
const req=createRequire(path.join(root,'package.json'));
const {createClient}=req('@supabase/supabase-js');
const env=Object.fromEntries(fs.readFileSync(path.join(root,'.env.local'),'utf8').split(/\r?\n/).filter(l=>l&&!l.startsWith('#')&&l.includes('=')).map(l=>{const i=l.indexOf('=');return[l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^(['"])(.*)\1$/,'$2')]}));
if(!env.SUPABASE_SERVICE_ROLE_KEY)throw Error('Missing service credential');
const db=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const patches=JSON.parse(fs.readFileSync(manifest,'utf8'));
const sorted=v=>Array.isArray(v)?v.map(sorted):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])])):v;
const equal=(a,b)=>JSON.stringify(sorted(a))===JSON.stringify(sorted(b));
const daily=q=>q.pool==='daily'||q.tags?.some(t=>/daily|데일리/i.test(t))||/^daily[-_]/i.test(q.id);
async function all(table){const out=[];for(let start=0;;start+=1000){const {data,error}=await db.from(table).select('*').order('id').range(start,start+999);if(error)throw Error(`${table}: ${error.message}`);out.push(...data);if(data.length<1000)return out}}
fs.mkdirSync(out,{recursive:true});
const questions=await all('questions');
const qmap=new Map(questions.map(q=>[q.id,q]));
const conflicts=[];const pending=[];
for(const patch of patches){
 const q=qmap.get(patch.id);
 if(!q||daily(q)){conflicts.push({id:patch.id,reason:'missing_or_daily'});continue;}
 if(Object.entries(patch.after).every(([k,v])=>equal(q[k],v)))continue;
 for(const [k,v] of Object.entries(patch.before))if(!equal(q[k],v))conflicts.push({id:patch.id,field:k,reason:'concurrent_change'});
 pending.push(patch);
}
const exams=await all('generated_exams');
const fieldMap={difficulty:'difficulty',question:'question',question_image:'questionImage',content_type:'contentType',options:'options',correct_option_id:'correctOptionId',explanation:'explanation',explanation_content_type:'explanationContentType',explanation_image:'explanationImage',question_type:'questionType',answer_text:'answerText'};
const pmap=new Map(patches.map(p=>[p.id,p]));
const quarantined=new Set(patches.filter(p=>p.after.quality_status==='quarantined').map(p=>p.id));
const examChanges=[];
for(const exam of exams){
 if(/daily|데일리/i.test([exam.id,exam.title,exam.mode,...(exam.tags||[])].join(' '))||exam.problems.some(p=>daily(qmap.get(p.id)||{})))continue;
 const removed=[];
 const problems=exam.problems.filter(p=>{if(quarantined.has(p.id)){removed.push(p.id);return false}return true}).map(p=>{
  const copy={...p};
  for(const [field,v] of Object.entries(pmap.get(p.id)?.after||{}))if(fieldMap[field])copy[fieldMap[field]]=v;
  // Previously audited stale explanation in a stored exam; live question is already correct.
  if(p.id==='q-2025-inha-26'&&qmap.has(p.id))copy.explanation=qmap.get(p.id).explanation;
  return copy;
 });
 if(equal(exam.problems,problems))continue;
 const summary={...(exam.generation_summary||{}),selectedCount:problems.length,difficultyCounts:problems.reduce((a,p)=>(a[p.difficulty]=(a[p.difficulty]||0)+1,a),{})};
 if(removed.length)summary.warnings=[...(summary.warnings||[]),`2026-09-18 문항 검수: 정답이 성립하지 않는 ${removed.length}문항을 제외했습니다.`];
 const after={problems,generation_summary:summary,source_question_ids:(exam.source_question_ids||[]).filter(id=>!quarantined.has(id))};
 examChanges.push({id:exam.id,before:{problems:exam.problems,generation_summary:exam.generation_summary,source_question_ids:exam.source_question_ids},after,removed});
}
const plan={questions:patches.length,pendingQuestions:pending.length,exams:examChanges.length,removedInvalidSnapshots:examChanges.reduce((s,e)=>s+e.removed.length,0),dailyQuestions:questions.filter(daily).length,conflicts};
fs.writeFileSync(path.join(out,'database-preflight.json'),JSON.stringify(plan,null,2));
console.log(JSON.stringify(plan));
if(conflicts.length)throw Error('Preflight conflict: no writes performed');
if(process.argv.includes('--verify')){
 if(pending.length||examChanges.length)throw Error('Readback mismatch');
 console.log('Readback verified: all patches applied; exam snapshots synchronized.');process.exit(0);
}
if(!process.argv.includes('--apply'))process.exit(0);
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const backup=path.join(out,`backup-${stamp}.json`);
fs.writeFileSync(backup,JSON.stringify({questions:pending.map(p=>qmap.get(p.id)),exams:examChanges,daily:questions.filter(daily)},null,2));
const log=[];const save=()=>fs.writeFileSync(path.join(out,`applied-${stamp}.json`),JSON.stringify(log,null,2));
for(const patch of pending){
 const previous=qmap.get(patch.id);
 const {data,error}=await db.from('questions').update({...patch.after,updated_at:new Date().toISOString()}).eq('id',patch.id).eq('updated_at',previous.updated_at).eq('pool',previous.pool).select('id');
 if(error||data?.length!==1)throw Error(`Question update stopped: ${patch.id}; ${error?.message||'revision conflict'}`);
 log.push({table:'questions',id:patch.id,fields:Object.keys(patch.after)});save();
 if(log.length%25===0)console.log(`Questions saved: ${log.length}/${pending.length}`);
}
for(const change of examChanges){
 const {data:current,error:readError}=await db.from('generated_exams').select('problems,generation_summary,source_question_ids').eq('id',change.id).single();
 if(readError||!equal(current,change.before))throw Error(`Exam revision changed: ${change.id}`);
 const {data,error}=await db.from('generated_exams').update(change.after).eq('id',change.id).select('id');
 if(error||data?.length!==1)throw Error(`Exam update stopped: ${change.id}; ${error?.message||'missing row'}`);
 log.push({table:'generated_exams',id:change.id,removed:change.removed});save();
}
const fresh=await all('questions');const fresMap=new Map(fresh.map(q=>[q.id,q]));
for(const patch of patches)for(const [k,v] of Object.entries(patch.after))if(!equal(fresMap.get(patch.id)?.[k],v))throw Error(`Readback mismatch ${patch.id}.${k}`);
const dailyChanges=questions.filter(daily).filter(q=>!equal(q,fresMap.get(q.id))).map(q=>q.id);
if(dailyChanges.length)throw Error(`Daily rows changed externally during migration: ${dailyChanges.length}`);
const freshExams=new Map((await all('generated_exams')).map(e=>[e.id,e]));
for(const e of examChanges)for(const [k,v] of Object.entries(e.after))if(!equal(freshExams.get(e.id)?.[k],v))throw Error(`Exam readback mismatch ${e.id}.${k}`);
const result={...plan,completedAt:new Date().toISOString(),backup,verified:true,dailyUnchanged:questions.filter(daily).length,studentAttemptsChanged:0};
fs.writeFileSync(path.join(out,'database-result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));
