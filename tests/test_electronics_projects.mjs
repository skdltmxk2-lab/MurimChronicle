import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function load(relative, dependencies = {}) {
  const output = ts.transpileModule(readFileSync(path.join(root, relative), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (!(name in dependencies)) throw Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, Buffer, Uint8Array, JSON, Request, Response, Blob }, { filename: relative });
  return mod.exports;
}
const schema = load("src/lib/electronics/schema.ts");
const engine = load("src/lib/electronics/engine.ts", { "./power": load("src/lib/electronics/power.ts") });
const definitions = [{ id: "r", name: "저항", pins: [{ id: "1", label: "1" }, { id: "2", label: "2" }], kind: "resistor", mounting: "direct", pinoutStatus: "generic", package: "Axial", category: "수동", description: "" }];
const owner = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const other = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const projectId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const project = () => {
  const circuit = { id: "test-circuit", title: "분압", description: "", components: [{ id: "R1", definitionId: "r", value: "1k", pinNets: { "1": "VCC", "2": "GND" } }], netNames: { VCC: "전원", GND: "접지" }, instruments: [], notes: [], reviewItems: [] };
  const boardOptions = { boards: 1, railMode: "split" };
  const layout = engine.createLayout(circuit, definitions, boardOptions);
  return JSON.parse(JSON.stringify({ version: 1, id: projectId, title: "분압", updatedAt: "2026-01-01T00:00:00.000Z", circuit, boardOptions, layout, completedSteps: ["component:R1"], experimentId: "lab1" }));
};
const ok = data => ({ data, error: null });
function harness(options = {}) {
  const state = { calls: [], files: new Map(), bucketExists: options.missingBucket !== true, public: options.public === true };
  const storage = {
    async getBucket(name) {
      state.calls.push(["getBucket", name]);
      if (options.bucketError) return { data: null, error: options.bucketError };
      return state.bucketExists ? ok({ id: name, public: state.public }) : { data: null, error: { statusCode: "404" } };
    },
    async createBucket(name, config) { state.calls.push(["createBucket", name, config]); state.bucketExists = true; state.public = config.public; return ok({ name }); },
    async updateBucket(name, config) { state.calls.push(["updateBucket", name, config]); state.public = config.public; return ok({ name }); },
    from(name) {
      assert.equal(name, "electronics-projects");
      return {
        async upload(key, bytes, config) {
          state.calls.push(["upload", key, config]);
          if (options.uploadError) return { data: null, error: Error("private-service-key") };
          state.files.set(key, bytes.toString("utf8")); return ok({ path: key });
        },
        async list(prefix, config) {
          state.calls.push(["list", prefix, config]);
          return ok(options.list ?? [...state.files.keys()].filter(key => key.startsWith(`${prefix}/`)).slice(0, config.limit).map(key => ({ name: key.slice(prefix.length + 1), metadata: { size: Buffer.byteLength(state.files.get(key)) } })));
        },
        async download(key) {
          state.calls.push(["download", key]);
          return state.files.has(key) ? ok(new Blob([state.files.get(key)])) : { data: null, error: Error("private-path-failed") };
        },
      };
    },
  };
  const route = load("app/api/admin/electronics/projects/route.ts", {
    "next/server": { NextResponse: { json: (data, init = {}) => new Response(JSON.stringify(data), init) } },
    "@/lib/auth/requireAdmin": { requireAdmin: async () => options.denied ? { ok: false, response: new Response("forbidden", { status: 403 }) } : { ok: true, userId: owner, supabase: { storage } } },
    "@/lib/electronics/catalog": { COMPONENT_CATALOG: definitions },
    "@/lib/electronics/schema": schema,
    "@/lib/electronics/engine": engine,
  });
  return { state, route, post: value => route.POST(new Request("https://example.test/projects?userId=" + other, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) })), get: () => route.GET(new Request("https://example.test/projects?userId=" + other)) };
}

test("anonymous and non-admin access touches no storage", async () => {
  const h = harness({ denied: true });
  assert.equal((await h.post(project())).status, 403);
  assert.equal((await h.get()).status, 403);
  assert.equal(h.state.calls.length, 0);
});
test("save is scoped to authenticated owner and replaces supplied board topology", async () => {
  const h = harness(); const p = project();
  p.layout.board.holes[0].group = "forged-global-short";
  p.layout.board.holes[0].x = 99999;
  p.layout.issues = [{ severity: "error", code: "FAKE", message: "stale" }];
  const response = await h.post(p); assert.equal(response.status, 200);
  const saved = (await response.json()).project;
  assert.deepEqual(saved.layout.placements, p.layout.placements);
  assert.notEqual(saved.layout.board.holes[0].group, "forged-global-short");
  assert.notEqual(saved.layout.board.holes[0].x, 99999);
  assert.equal(saved.layout.issues.some(issue => issue.code === "FAKE"), false);
  assert.equal(h.state.files.has(`${owner}/${projectId}.json`), true);
  assert.equal(h.state.files.has(`${other}/${projectId}.json`), false);
  assert.notEqual(saved.updatedAt, p.updatedAt);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("rejects UUID traversal, unsupported boards and malformed pin locations before storage", async () => {
  for (const mutate of [p => { p.id = "../other"; }, p => { p.boardOptions.boards = 3; }, p => { p.layout.placements[0].pins["1"] = "B1:X999"; }, p => { delete p.layout.placements[0].pins["2"]; }, p => { p.ownerId = other; }]) {
    const h = harness(); const p = project(); mutate(p);
    assert.equal((await h.post(p)).status, 400);
    assert.equal(h.state.calls.length, 0);
  }
});
test("rejects invalid completed steps and unsafe JSON keys", async () => {
  const h = harness(); const p = project(); p.completedSteps.push("jumper:unlisted");
  assert.equal((await h.post(p)).status, 400);
  const unsafe = JSON.parse(JSON.stringify(project()).replace('"netNames":{', '"netNames":{"__proto__":"bad",'));
  assert.equal((await h.post(unsafe)).status, 400);
});
test("electrically invalid editing drafts retain recomputed errors", async () => {
  const h = harness(); const p = project();
  p.layout.jumpers.push({ id: "Wshort", netId: "VCC", from: "B1:A1", to: "B1:A5", color: "#000000" });
  const response = await h.post(p); assert.equal(response.status, 200);
  const saved = (await response.json()).project;
  assert.equal(saved.layout.issues.some(issue => issue.code === "SHORT_CIRCUIT"), true);
});
test("loads only the owner's prefix and keeps manual placement", async () => {
  const h = harness(); const p = project();
  p.layout.placements[0].pins = { "1": "B1:B8", "2": "B1:B12" };
  await h.post(p);
  h.state.files.set(`${other}/${projectId}.json`, JSON.stringify({ ...p, title: "other user" }));
  const response = await h.get(); assert.equal(response.status, 200);
  const data = await response.json(); assert.equal(data.projects.length, 1);
  assert.deepEqual(data.projects[0].layout.placements[0].pins, p.layout.placements[0].pins);
  const list = h.state.calls.find(call => call[0] === "list");
  assert.equal(list[1], owner); assert.equal(list[2].limit, 30);
  assert.equal(h.state.calls.filter(call => call[0] === "download").every(call => call[1].startsWith(owner + "/")), true);
});
test("creates a private bucket only on 404 and corrects a public bucket", async () => {
  const missing = harness({ missingBucket: true }); assert.equal((await missing.post(project())).status, 200);
  assert.equal(missing.state.calls.find(call => call[0] === "createBucket")[2].public, false);
  const publicBucket = harness({ public: true }); assert.equal((await publicBucket.post(project())).status, 200);
  assert.equal(publicBucket.state.public, false);
  assert.equal(publicBucket.state.calls.some(call => call[0] === "createBucket"), false);
  const failed = harness({ bucketError: { statusCode: "500", message: "private key" } });
  const response = await failed.post(project()); assert.equal(response.status, 503);
  assert.equal(failed.state.calls.some(call => call[0] === "createBucket"), false);
  assert.equal((await response.text()).includes("private key"), false);
});
test("rejects oversized streamed JSON and hides storage error details", async () => {
  const h = harness();
  const response = await h.route.POST(new Request("https://example.test/projects", { method: "POST", headers: { "content-type": "application/json" }, body: " ".repeat(1_000_001) }));
  assert.equal(response.status, 413); assert.equal(h.state.calls.length, 0);
  const failed = harness({ uploadError: true }); const unavailable = await failed.post(project());
  assert.equal(unavailable.status, 503); assert.equal((await unavailable.text()).includes("private-service-key"), false);
});
test("ignores traversing filenames and oversized or corrupt stored entries", async () => {
  const corruptId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  const h = harness({ list: [{ name: `../${other}/${projectId}.json` }, { name: `${projectId}.json`, metadata: { size: 1_000_001 } }, { name: `${corruptId}.json`, metadata: { size: 10 } }] });
  h.state.files.set(`${owner}/${corruptId}.json`, "not json");
  const response = await h.get(); assert.equal(response.status, 200);
  const data = await response.json(); assert.equal(data.projects.length, 0); assert.equal(data.skipped, 2);
  const downloads = h.state.calls.filter(call => call[0] === "download");
  assert.equal(downloads.length, 1); assert.equal(downloads[0][1], `${owner}/${corruptId}.json`);
});
