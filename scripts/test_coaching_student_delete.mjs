import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
function load(file, overrides = {}, globals = {}) {
  const source = ts.transpileModule(readFileSync(resolve(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, require: id => overrides[id] ?? require(id), console, Response, ...globals,
  });
  return exports;
}
const studentId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const teacherId = 'teacher-a';
let authorized = true, responseStatus = 401, dbError = null, calls = [];
let rows = [];
const supabase = {
  from(table) {
    calls.push(['from', table]);
    const filters = [];
    return {
      delete() { calls.push(['delete']); return this; },
      eq(key, value) { filters.push([key, value]); calls.push(['eq', key, value]); return this; },
      select() { return this; },
      async maybeSingle() {
        if (dbError) return { data: null, error: dbError };
        const index = rows.findIndex(row => filters.every(([key, value]) => row[key] === value));
        return { data: index < 0 ? null : rows.splice(index, 1)[0], error: null };
      },
    };
  },
};
const helpers = load('src/lib/admin/coachingStudents.ts');
const { DELETE } = load('app/api/admin/coaching/students/[studentId]/route.ts', {
  '@/lib/auth/requireAdmin': { requireAdmin: async () => authorized
    ? { ok: true, userId: teacherId, supabase }
    : { ok: false, response: Response.json({ ok: false }, { status: responseStatus }) } },
  '@/lib/admin/coachingStudents': helpers,
}, { console: { error() {} } });
const request = id => DELETE(new Request('https://example.test/api/students', { method: 'DELETE' }), {
  params: Promise.resolve({ studentId: id }),
});
for (const status of [401, 403]) {
  authorized = false; responseStatus = status; calls = [];
  assert.equal((await request(studentId)).status, status);
  assert.equal(calls.length, 0, 'unauthorized requests must never query the database');
}
authorized = true;
assert.equal((await request('invalid')).status, 400);
assert.equal(calls.length, 0);
rows = [{ id: studentId, teacher_id: 'teacher-b' }];
assert.equal((await request(studentId)).status, 404);
assert.equal(rows.length, 1, 'another teacher’s student must survive');
rows.push({ id: studentId, teacher_id: teacherId });
const deleted = await request(studentId);
assert.equal(deleted.status, 200);
assert.equal((await deleted.json()).deletedStudentId, studentId);
assert.equal(rows.length, 1);
assert.equal(rows[0].teacher_id, 'teacher-b');
assert.equal((await request(studentId)).status, 404);
dbError = { code: '23503', message: 'private database details' };
const failure = await request(studentId);
assert.equal(failure.status, 500);
assert.ok(!(await failure.text()).includes('private database details'));

// Exercise the real picker handlers with an in-memory hook host and mocked HTTP.
let state = [], cursor = 0, effects = [], confirmed = true, httpFails = false;
let selections = [], requests = [];
const alice = { id: studentId, name: '테스트 학생 A', memo: '', isActive: true };
const bob = { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', name: '테스트 학생 B', memo: '', isActive: true };
let selectedIds = [alice.id, bob.id];
const react = {
  useState(initial) {
    const index = cursor++;
    if (!(index in state)) state[index] = initial;
    return [state[index], value => { state[index] = typeof value === 'function' ? value(state[index]) : value; }];
  },
  useMemo(fn) { return fn(); },
  useCallback(fn) { return fn; },
  useRef(value) { return { current: value }; },
  useEffect(fn) { effects.push(fn); },
};
const { CoachingStudentPicker } = load('src/components/admin/coaching/CoachingStudentPicker.tsx', {
  react,
  '@/lib/api/adminFetch': { adminFetch: async (url, init) => {
    requests.push({ url, method: init?.method || 'GET' });
    if (init?.method === 'DELETE') return Response.json(
      httpFails ? { ok: false, message: '삭제 실패 테스트' } : { ok: true, deletedStudentId: alice.id },
      { status: httpFails ? 500 : 200 }
    );
    return Response.json({ ok: true, students: [alice, bob] });
  } },
}, { window: { confirm: () => confirmed } });
function render() {
  cursor = 0; effects = [];
  return CoachingStudentPicker({ selectedStudentIds: selectedIds, onStudentsChange(students) {
    selectedIds = Array.from(students, s => s.id); selections.push([...selectedIds]);
  } });
}
function nodes(tree) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(nodes);
  return [tree, ...nodes(tree.props?.children)];
}
const deleteButton = tree => nodes(tree).find(n => n.type === 'button' && n.props['aria-label'] === `${alice.name} 학생 삭제`);
render(); effects[0]();
await new Promise(resolve => setTimeout(resolve, 0));
let tree = render();
assert.ok(deleteButton(tree));
assert.ok(!nodes(tree).filter(n => n.type === 'label').some(n => nodes(n).some(c => c.type === 'button')), 'delete must not toggle the checkbox');
confirmed = false;
await deleteButton(tree).props.onClick();
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(requests.filter(r => r.method === 'DELETE').length, 0);
confirmed = true; httpFails = true;
deleteButton(tree).props.onClick();
await new Promise(resolve => setTimeout(resolve, 0));
tree = render();
assert.ok(deleteButton(tree), 'failure must retain the student');
assert.deepEqual(selectedIds, [alice.id, bob.id]);
httpFails = false;
deleteButton(tree).props.onClick();
const pending = render();
assert.ok(nodes(pending).filter(n => n.type === 'input' && n.props.type === 'checkbox').every(n => n.props.disabled));
await new Promise(resolve => setTimeout(resolve, 0));
tree = render();
assert.ok(!deleteButton(tree), 'success must remove the student');
assert.deepEqual(selectedIds, [bob.id], 'only the deleted student leaves the selection');
async function resetPicker(ids) {
  state = []; selectedIds = ids;
  render(); effects[0]();
  await new Promise(resolve => setTimeout(resolve, 0));
  return render();
}
tree = await resetPicker([alice.id]);
deleteButton(tree).props.onClick();
await new Promise(resolve => setTimeout(resolve, 0));
assert.deepEqual(selectedIds, [], 'deleting the last selection must not select somebody else');
tree = await resetPicker([bob.id]);
const priorChanges = selections.length;
deleteButton(tree).props.onClick();
await new Promise(resolve => setTimeout(resolve, 0));
assert.deepEqual(selectedIds, [bob.id]);
assert.equal(selections.length, priorChanges, 'deleting an unselected student must not reset the parent’s exam');
console.log('PASS: student delete authorization, ownership, validation, errors, cancellation, pending state and selection cleanup');
