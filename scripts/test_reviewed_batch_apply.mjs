// Integration tests against a local fake REST DB, never the configured service.
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {mkdtempSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {applyReviewedBatch,contentReviewFingerprint} from './content_review/apply_reviewed_batch.mjs';
const temp=mkdtempSync(resolve(tmpdir(),'cbt-batch-test-'));
const fixture=()=>({questions:[
 {id:'q-1',pool:'general',tags:[],updated_at:'2026-01-01T00:00:00Z',question:'old one'},
 {id:'q-2',pool:'general',tags:[],updated_at:'2026-01-01T00:00:00Z',question:'old two'},
 {id:'q-daily-1',pool:'daily',tags:['daily'],updated_at:'2026-01-01T00:00:00Z',question:'daily'}
],generated_exams:[{id:'exam-1',xmin:'100',title:'original title',problems:[{id:'q-1',question:'old one'},{id:'q-2',question:'old two'}],source_question_ids:['q-1','q-2'],generation_summary:{selectedCount:2}}],exam_attempts:[]});
let state,failOnQuestion=null,conflictOnExam=false,conflictTitleOnExam=false,dropAfterWrite=null,writes=0,revision=100;
function matches(row,params){
 for(const [key,value] of params){
  if(['select','order','limit'].includes(key))continue;
  if(value.startsWith('gt.')){if(!(row[key]>value.slice(3)))return false;continue;}
  const jsonPath=/^(.+?)(->>|->)(.+)$/.exec(key);
  let actual=row[key];
  if(jsonPath){
   const object=row[jsonPath[1]],part=jsonPath[3],present=object&&Object.hasOwn(object,part),v=present?object[part]:undefined;
   actual=!present?undefined:jsonPath[2]==='->>'?(v==null?null:typeof v==='object'?JSON.stringify(v):String(v)):(v===null?{jsonNull:true}:v);
  }
  if(value==='is.null'){if(actual!=null)return false;continue;}
  if(!value.startsWith('eq.'))throw Error('Unknown filter');
  const expected=value.slice(3);
  if(typeof actual==='object'){
   const encoded=key==='source_question_ids'?'{'+actual.map(x=>'"'+x+'"').join(',')+'}':JSON.stringify(actual);
   if(encoded!==expected)return false;
  }else if(String(actual)!==expected)return false;
 }
 return true;
}
const server=createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://local'),table=url.pathname.split('/').at(-1);let rows=state[table];
  if(!rows){res.writeHead(404);return res.end('{}');}
  if(req.method==='PATCH'){
   let raw='';for await(const chunk of req)raw+=chunk;
   const body=JSON.parse(raw);
   if(table==='questions'&&url.searchParams.get('id')===`eq.${failOnQuestion}`&&body.question?.startsWith('new')){res.writeHead(500);return res.end('{"code":"injected_failure"}');}
   if(table==='generated_exams'&&conflictOnExam){state.generated_exams[0].problems[1].question='concurrent edit';state.generated_exams[0].xmin=String(++revision);conflictOnExam=false;}
   if(table==='generated_exams'&&conflictTitleOnExam){state.generated_exams[0].title='concurrent title';state.generated_exams[0].xmin=String(++revision);conflictTitleOnExam=false;}
   rows=rows.filter(row=>matches(row,url.searchParams));for(const row of rows){Object.assign(row,body);if(table==='generated_exams')row.xmin=String(++revision);writes++;}
   if(rows.length&&dropAfterWrite===table){dropAfterWrite=null;req.socket.destroy();return;}
  }else rows=rows.filter(row=>matches(row,url.searchParams));
  const select=url.searchParams.get('select');
  if(select&&select!=='*')rows=rows.map(row=>Object.fromEntries(select.split(',').map(k=>[k,row[k]])));
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify(rows));
 }catch(error){res.writeHead(500);res.end(JSON.stringify({code:'fake_server_error'}));}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const env=resolve(temp,'env');writeFileSync(env,`NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:${server.address().port}\nSUPABASE_SERVICE_ROLE_KEY=fake-local-only\n`);
const patch=(id,before,after)=>({id,before:{question:before},after:{question:after},reason:'reviewed test fixture',source:[{path:'fixture.pdf',page:1,sha256:'fixture'}]});
const patches=[patch('q-1','old one','new one'),patch('q-2','old two','new two')];
let count=0;
async function run(name,data=patches,options=[]){
 const folder=resolve(temp,name);const manifest=resolve(temp,`${name}.json`),scope=resolve(temp,`${name}-scope.json`);
 writeFileSync(manifest,JSON.stringify(data));writeFileSync(scope,JSON.stringify(fixture().questions.map(q=>({id:q.id,reviewedContentHash:contentReviewFingerprint(q),reviewedUpdatedAt:q.updated_at}))));
 try{await applyReviewedBatch(['--patches',manifest,'--scope',scope,'--out',folder,'--env-file',env,...options]);return{ok:true,folder};}
 catch(error){return{ok:false,stderr:error.stack,folder};}
}
try{
 state=fixture();writes=0;let result=await run('dry');assert(result.ok,result.stderr);assert.equal(writes,0);count++;
 state=fixture();writes=0;result=await run('apply',patches,['--apply']);assert(result.ok,result.stderr);assert.equal(state.questions[0].question,'new one');assert.equal(state.generated_exams[0].problems[1].question,'new two');assert.equal(state.questions[2].question,'daily');assert(JSON.parse(readFileSync(resolve(result.folder,'receipt.public.json'))).verified);count++;
 writes=0;result=await run('verify',patches,['--verify']);assert(result.ok,result.stderr);assert.equal(writes,0);count++;
 state=fixture();state.questions[0].question='concurrent';writes=0;result=await run('stale',patches,['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();state.questions[0].explanation='concurrent unrelated content';writes=0;result=await run('other-content',patches,['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();state.questions[0].updated_at='2026-02-01T00:00:00Z';writes=0;result=await run('revision',patches,['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();state.generated_exams[0].problems[0].question='drift';writes=0;result=await run('drift',patches,['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();writes=0;result=await run('daily',[patch('q-daily-1','daily','new daily')],['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();writes=0;const extra=structuredClone(patches);extra[0].before.explanation='unmodified field';result=await run('extra-before',extra,['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();writes=0;state.exam_attempts.push({attempt_id:'legacy-1',exam_id:'exam-1',result:{examSnapshot:null}});result=await run('legacy-null',patches,['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();writes=0;state.exam_attempts.push({attempt_id:'legacy-1',exam_id:'exam-1',result:{}});result=await run('legacy-missing',patches,['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 state=fixture();writes=0;failOnQuestion='q-2';result=await run('failure',patches,['--apply']);assert(!result.ok);assert.equal(state.questions[0].question,'old one');assert.equal(state.questions[1].question,'old two');assert.equal(state.generated_exams[0].problems[0].question,'old one');failOnQuestion=null;count++;
 state=fixture();writes=0;conflictOnExam=true;result=await run('exam-concurrent',patches,['--apply']);assert(!result.ok);assert.equal(state.questions[0].question,'old one');assert.equal(state.generated_exams[0].problems[1].question,'concurrent edit');count++;
 state=fixture();writes=0;conflictTitleOnExam=true;result=await run('exam-title-concurrent',patches,['--apply']);assert(!result.ok);assert.equal(state.questions[0].question,'old one');assert.equal(state.generated_exams[0].title,'concurrent title');assert.equal(state.generated_exams[0].problems[0].question,'old one');count++;
 state=fixture();writes=0;dropAfterWrite='questions';result=await run('question-response-lost',patches,['--apply']);assert(!result.ok);assert(result.stderr.includes('rolled_back'),result.stderr);assert.equal(state.questions[0].question,'old one');assert.equal(state.questions[1].question,'old two');count++;
 state=fixture();writes=0;dropAfterWrite='generated_exams';result=await run('exam-response-lost',patches,['--apply']);assert(!result.ok);assert(result.stderr.includes('manual_recovery_required'),result.stderr);assert.equal(state.questions[0].question,'old one');assert.equal(state.generated_exams[0].problems[0].question,'new one');count++;
 state=fixture();writes=0;const quarantine={id:'q-1',before:{quality_status:null,quality_reasons:null},after:{quality_status:'quarantined',quality_reasons:['test']},reason:'reviewed fixture',source:[{path:'fixture.pdf',page:1,sha256:'fixture'}]};
 state.questions[0].quality_status=null;state.questions[0].quality_reasons=null;
 result=await run('quarantine',[quarantine],['--apply']);assert(result.ok,result.stderr);assert.equal(state.generated_exams[0].problems.length,1);assert.deepEqual(state.generated_exams[0].source_question_ids,['q-2']);assert.equal(state.generated_exams[0].generation_summary.selectedCount,1);count++;
 state=fixture();state.questions[0].quality_status=null;state.questions[0].quality_reasons=null;state.generated_exams[0].problems[0].question='independently edited snapshot';writes=0;result=await run('quarantine-drift',[quarantine],['--apply']);assert(!result.ok);assert.equal(writes,0);count++;
 console.log(`reviewed batch apply: ${count} integration cases passed`);
}finally{await new Promise(r=>server.close(r));}
