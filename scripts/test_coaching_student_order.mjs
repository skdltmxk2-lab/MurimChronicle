import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import ts from 'typescript';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, '..');
function load(file, overrides = {}) {
  const source = ts.transpileModule(readFileSync(resolve(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, require: id => overrides[id] ?? require(id), Response, console });
  return exports;
}
const order = load('src/lib/admin/coachingStudentOrder.ts');
const helpers = load('src/lib/admin/coachingStudents.ts');
const ids = ['aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc'];
const roster = ids.map((id, index) => ({ id, teacher_id: 'teacher-a', name: ['가빈', '민정', '태원'][index], is_active: true }));
const active = roster.map(row => ({ ...row, isActive: row.is_active }));
const asIds = rows => Array.from(rows, row => row.id);
assert.deepEqual(Array.from(order.moveCoachingStudent(ids, ids[0], ids[2])), [ids[1], ids[2], ids[0]]);
assert.deepEqual(Array.from(order.moveCoachingStudent(ids, ids[2], ids[0])), [ids[2], ids[0], ids[1]]);
assert.deepEqual(Array.from(order.moveCoachingStudent(ids, 'missing', ids[0])), ids);
assert.deepEqual(asIds(order.sortCoachingStudents(active, [ids[2], ids[0], ids[1]])), [ids[2], ids[0], ids[1]]);
assert.deepEqual(asIds(order.sortCoachingStudents(active, [ids[2], 'deleted'])), [ids[2], ids[0], ids[1]]);
assert.deepEqual(asIds(order.sortCoachingStudents([{ ...active[0], isActive: false }, active[1]], [ids[0], ids[1]])), [ids[1], ids[0]]);
assert.deepEqual(Array.from(order.parseStudentOrder('not json')), []);
assert.deepEqual(Array.from(order.parseStudentOrder('[1]')), []);

let authorized = true, userId = 'teacher-a', saveError = null, readError = null;
const settings = new Map([['search_engine', 'concept']]);
let writes = 0;
const supabase = {
  from(table) {
    const filters = [];
    const query = {
      select() { return this; },
      eq(key, value) { filters.push([key, value]); return this; },
      order() { return this; },
      then(resolve) { resolve({ data: roster.filter(row => filters.every(([key, value]) => row[key] === value)), error: readError }); },
      async maybeSingle() { return { data: settings.has(filters[0][1]) ? { value: settings.get(filters[0][1]) } : null, error: readError }; },
      async upsert(row) { writes++; if (!saveError) settings.set(row.key, row.value); return { error: saveError }; },
    };
    assert.ok(['coaching_students', 'app_settings'].includes(table));
    return query;
  },
};
const overrides = {
  '@/lib/admin/coachingStudentOrder': order,
  '@/lib/admin/coachingStudents': helpers,
  '@/lib/auth/requireAdmin': { requireAdmin: async () => authorized
    ? { ok: true, userId, supabase }
    : { ok: false, response: Response.json({ ok: false }, { status: 401 }) } },
};
const { PUT } = load('app/api/admin/coaching/students/order/route.ts', overrides);
const { GET } = load('app/api/admin/coaching/students/route.ts', overrides);
const put = body => PUT(new Request('https://example.test/order', { method: 'PUT', body: JSON.stringify(body) }));
authorized = false;
assert.equal((await put({ studentIds: ids })).status, 401);
assert.equal(writes, 0);
authorized = true;
for (const studentIds of [null, [], ['invalid'], [ids[0], ids[0]], 'not-an-array']) {
  assert.equal((await put({ studentIds })).status, 400);
}
assert.equal(writes, 0);
assert.equal((await put({ studentIds: ids.slice(0, 2) })).status, 409);
userId = 'teacher-b';
assert.equal((await put({ studentIds: ids })).status, 409, 'another teacher cannot reorder this roster');
assert.equal(writes, 0);
userId = 'teacher-a';
const desired = [ids[2], ids[0], ids[1]];
assert.equal((await put({ studentIds: desired })).status, 200);
assert.equal(settings.get('search_engine'), 'concept');
assert.ok(!settings.has(order.studentOrderKey('teacher-b')));
const result = await (await GET(new Request('https://example.test/students'))).json();
assert.deepEqual(asIds(result.students), desired, 'a fresh GET must return the persisted order');
assert.deepEqual(result.studentOrder, desired);
saveError = { message: 'private DB error' };
assert.equal((await put({ studentIds: ids })).status, 500);
assert.equal(settings.get(order.studentOrderKey(userId)), JSON.stringify(desired));
readError = { message: 'DB unavailable' };
assert.equal((await put({ studentIds: ids })).status, 500);
console.log('PASS: move/sort, new/deleted/archived students, validation, ownership, persistence and DB failures');
