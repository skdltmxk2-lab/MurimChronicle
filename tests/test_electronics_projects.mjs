import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function load(relative, dependencies = {}, globals = {}) {
  const output = ts.transpileModule(readFileSync(path.join(root, relative), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (!(name in dependencies)) throw Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, Buffer, Uint8Array, JSON, Request, Response, Blob, URL, ...globals }, { filename: relative });
  return mod.exports;
}
const physicalProfiles = load("src/lib/electronics/physical-profiles.ts");
const schema = load("src/lib/electronics/schema.ts", { "./physical-profiles": physicalProfiles });
const projectSource = load("src/lib/electronics/project-source.ts");
const engine = load("src/lib/electronics/engine.ts", { "./power": load("src/lib/electronics/power.ts"), "./physical-profiles": physicalProfiles });
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
          const entries = options.list ?? [...state.files.keys()].filter(key => key.startsWith(`${prefix}/`)).map(key => ({ name: key.slice(prefix.length + 1), metadata: { size: Buffer.byteLength(state.files.get(key)) } }));
          return ok(entries.slice(config.offset ?? 0, (config.offset ?? 0) + config.limit));
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
    "@/lib/electronics/project-source": projectSource,
  });
  return { state, route, post: value => route.POST(new Request("https://example.test/projects?userId=" + other, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) })), get: (offset = 0) => route.GET(new Request(`https://example.test/projects?userId=${other}&offset=${offset}`)) };
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
  assert.equal(list[1], owner); assert.equal(list[2].limit, 31);
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

const imageAttachment = (mimeType = "image/png", size) => {
  const header = mimeType === "image/png" ? [137, 80, 78, 71, 13, 10, 26, 10]
    : mimeType === "image/jpeg" ? [255, 216, 255] : [82, 73, 70, 70, 0, 0, 0, 0, 87, 69, 66, 80];
  const bytes = Buffer.alloc(size ?? header.length + 8); bytes.set(header);
  return { name: "original circuit.png", mimeType, data: bytes.toString("base64") };
};
const origins = [
  { channel: "gemini", provider: "gemini" },
  { channel: "assistant", provider: "chatgpt" },
  { channel: "assistant", provider: "claude" },
];

test("origin metadata keeps legacy projects compatible and only identifies the declared source", () => {
  assert.equal(projectSource.parseProjectSource(undefined), undefined);
  assert.equal(projectSource.isProjectSource(undefined), false);
  assert.equal(projectSource.getSourceLabel(undefined), "출처 미지정");
  for (const [index, origin] of origins.entries()) {
    const parsed = projectSource.parseProjectSource(origin);
    assert.deepEqual(JSON.parse(JSON.stringify(parsed)), origin);
    assert.equal(projectSource.isProjectSource(origin), true);
    assert.equal(projectSource.getSourceLabel(parsed), ["Gemini 분석", "ChatGPT · Codex 설계", "Claude 설계"][index]);
  }
  for (const invalid of [null, [], {}, { channel: "gemini", provider: "chatgpt" }, { channel: "assistant", provider: "gemini" }, { channel: "assistant", provider: "other" }, { ...origins[0], verified: true }]) {
    assert.throws(() => projectSource.parseProjectSource(invalid), error => error.name === "ProjectSourceValidationError");
    assert.equal(projectSource.isProjectSource(invalid), false);
  }
});

test("source images preserve original canonical bytes and enforce the exact 300KB boundary", () => {
  for (const mimeType of ["image/png", "image/jpeg", "image/webp"]) {
    const attachment = imageAttachment(mimeType);
    const result = projectSource.parseProjectSource({ ...origins[1], attachment });
    assert.deepEqual(JSON.parse(JSON.stringify(result.attachment)), attachment);
  }
  const atLimit = imageAttachment("image/png", projectSource.SOURCE_ATTACHMENT_MAX_BYTES);
  assert.equal(projectSource.parseProjectSource({ ...origins[2], attachment: atLimit }).attachment.data, atLimit.data);
  assert.throws(() => projectSource.parseProjectSource({ ...origins[2], attachment: imageAttachment("image/png", 300_001) }), /300KB/);
});

test("source images reject malformed base64, noncanonical pad bits, spoofed MIME and unknown metadata", () => {
  const valid = imageAttachment();
  const invalidImages = [
    { ...valid, name: " " }, { ...valid, name: "x".repeat(201) }, { ...valid, name: "bad\u0000.png" },
    { ...valid, mimeType: "image/svg+xml" }, { ...valid, mimeType: "application/pdf" }, { ...valid, mimeType: "image/jpeg" },
    { ...valid, data: "" }, { ...valid, data: "%%%=" }, { ...valid, data: valid.data + "\n" }, { ...valid, data: `data:image/png;base64,${valid.data}` },
    { ...valid, data: Buffer.from("not an image").toString("base64") }, { ...valid, data: "iVBORw0KGgoB==" },
    // The same PNG header decodes from both strings in permissive decoders;
    // the final nonzero padding bits must be rejected, not normalized silently.
    { ...valid, data: "iVBORw0KGgp=" }, { ...valid, data: "iVBORw0KGgoAAB==" },
    { ...valid, url: "https://example.test/image.png" }, null,
  ];
  assert.deepEqual(Buffer.from("iVBORw0KGgp=", "base64"), Buffer.from("iVBORw0KGgo=", "base64"));
  for (const attachment of invalidImages) assert.throws(() => projectSource.parseProjectSource({ ...origins[0], attachment }), error => error.name === "ProjectSourceValidationError");
  const unsafe = JSON.parse('{"channel":"gemini","provider":"gemini","__proto__":{}}');
  assert.throws(() => projectSource.parseProjectSource(unsafe), /지원하지/);
});

test("cloud POST and GET preserve each source and original attachment without changing validation", async () => {
  for (const origin of origins) {
    const h = harness(); const p = project();
    p.source = { ...origin, attachment: imageAttachment() };
    p.layout.jumpers.push({ id: "Wshort", netId: "VCC", from: "B1:A1", to: "B1:A5", color: "#000000" });
    const savedResponse = await h.post(p); assert.equal(savedResponse.status, 200);
    const saved = (await savedResponse.json()).project;
    assert.deepEqual(saved.source, p.source);
    assert.deepEqual(saved.circuit, p.circuit);
    assert.equal(saved.layout.issues.some(issue => issue.code === "SHORT_CIRCUIT"), true);
    const loaded = await (await h.get()).json();
    assert.equal(loaded.projects.length, 1); assert.deepEqual(loaded.projects[0].source, p.source);
    assert.deepEqual(JSON.parse(h.state.files.get(`${owner}/${projectId}.json`)).source, p.source);
  }
});

test("invalid source is rejected before cloud storage and corrupt saved metadata is skipped", async () => {
  for (const source of [{ channel: "assistant", provider: "gemini" }, { ...origins[1], verified: true }, { ...origins[2], attachment: { ...imageAttachment(), data: "not-base64" } }]) {
    const h = harness(); const response = await h.post({ ...project(), source });
    assert.equal(response.status, 400); assert.equal(h.state.calls.length, 0);
  }
  const h = harness(); const p = project();
  h.state.files.set(`${owner}/${projectId}.json`, JSON.stringify({ ...p, source: { channel: "assistant", provider: "gemini" } }));
  const validId = "dddddddd-dddd-4ddd-8ddd-dddddddddddd";
  h.state.files.set(`${owner}/${validId}.json`, JSON.stringify({ ...p, id: validId }));
  const data = await (await h.get()).json();
  assert.equal(data.projects.length, 1); assert.equal(data.projects[0].id, validId); assert.equal(data.skipped, 1);
  assert.equal(Object.hasOwn(data.projects[0], "source"), false);
});

test("local persistence and project JSON import/export retain source bytes and reject invalid imports atomically", () => {
  let stored = "[]";
  const storage = load("src/lib/electronics/storage.ts", { "./project-source": projectSource, "./engine": engine }, { localStorage: {
    getItem: () => stored, setItem: (_key, value) => { stored = value; },
  } });
  const { parseProjectForWorkspace } = load("src/lib/electronics/project-input.ts", {
    "./schema": schema, "./engine": engine, "./storage": storage, "./project-source": projectSource,
  });
  for (const origin of origins) {
    const p = { ...project(), source: { ...origin, attachment: imageAttachment() } };
    storage.saveLocalProject(owner, p);
    const local = storage.readLocalProjects(owner)[0];
    const imported = parseProjectForWorkspace(JSON.parse(JSON.stringify(local)), definitions);
    const exported = JSON.parse(JSON.stringify(imported));
    assert.deepEqual(exported.source, p.source); assert.deepEqual(exported.circuit, p.circuit);
    p.source.attachment.name = "changed outside saved project";
    assert.notEqual(imported.source.attachment.name, p.source.attachment.name);
  }
  const bad = { ...project(), source: { channel: "assistant", provider: "gemini" } }, previous = stored;
  assert.throws(() => storage.saveLocalProject(owner, bad), /일치하지/); assert.equal(stored, previous);
  assert.throws(() => parseProjectForWorkspace(bad, definitions));
  stored = JSON.stringify([bad, project()]);
  const legacy = storage.readLocalProjects(owner);
  assert.equal(legacy.length, 1); assert.equal(legacy[0].source, undefined);
  assert.equal(parseProjectForWorkspace(legacy[0], definitions).source, undefined);
});

test("browser autosave compacts derived board holes and restores legacy and current manual layouts", () => {
  let stored = "[]";
  const storage = load("src/lib/electronics/storage.ts", { "./project-source": projectSource, "./engine": engine }, { localStorage: {
    getItem: () => stored, setItem: (_key, value) => { stored = value; },
  } });
  const original = project();
  original.boardOptions = { boards: 2, railMode: "continuous" };
  original.layout = JSON.parse(JSON.stringify(engine.createLayout(original.circuit, definitions, original.boardOptions)));
  original.layout.placements[0].pins = { "1": "B2:B8", "2": "B2:B12" };
  original.source = { ...origins[1], attachment: imageAttachment() };
  stored = JSON.stringify([original]);
  const legacy = storage.readLocalProjectState(owner);
  assert.equal(legacy.error, null);
  assert.equal(legacy.projects[0].layout.board.holes.length, 1660);
  assert.deepEqual(legacy.projects[0].layout.placements, original.layout.placements);
  const originalBytes = Buffer.byteLength(stored);
  storage.saveLocalProject(owner, original);
  const encoded = JSON.parse(stored)[0];
  assert.equal(encoded.layout.board.holes.length, 0);
  assert.ok(Buffer.byteLength(stored) < originalBytes / 10, "derived geometry should not exhaust browser quota");
  assert.equal(original.layout.board.holes.length, 1660, "compact serialization must not mutate active board");
  const restored = storage.readLocalProjectState(owner);
  assert.equal(restored.error, null);
  assert.deepEqual(JSON.parse(JSON.stringify(restored.projects[0].layout.board)), original.layout.board);
  assert.deepEqual(restored.projects[0].layout.placements, original.layout.placements);
  assert.deepEqual(restored.projects[0].source, original.source);
});

test("unreadable or corrupt browser storage is surfaced and never overwritten by autosave", () => {
  for (const saved of ["broken json", "{}", JSON.stringify([project(), { invalid: true }])]) {
    let writes = 0;
    const storage = load("src/lib/electronics/storage.ts", { "./project-source": projectSource, "./engine": engine }, { localStorage: {
      getItem: () => saved, setItem: () => { writes++; },
    } });
    const result = storage.readLocalProjectState(owner);
    assert.match(result.error, /읽지 못했습니다/);
    assert.throws(() => storage.saveLocalProject(owner, project()), /읽지 못했습니다/);
    assert.equal(writes, 0);
    if (saved.startsWith("[")) { assert.equal(result.projects.length, 1); assert.equal(result.skipped, 1); }
  }
  const blocked = load("src/lib/electronics/storage.ts", { "./project-source": projectSource, "./engine": engine }, { localStorage: {
    getItem: () => { throw new Error("denied"); }, setItem: () => assert.fail("blocked store must not be overwritten"),
  } });
  assert.match(blocked.readLocalProjectState(owner).error, /읽지 못했습니다/);
  assert.throws(() => blocked.saveLocalProject(owner, project()), /읽지 못했습니다/);
});

test("project list merging preserves cloud-only entries and compares actual instants across time zones", () => {
  const storage = load("src/lib/electronics/storage.ts", { "./project-source": projectSource, "./engine": engine });
  const base = project();
  const newer = { ...base, title: "newer edit", updatedAt: "2026-01-01T00:00:00Z" };
  const older = { ...base, title: "older edit", updatedAt: "2026-01-01T08:00:00+09:00" };
  const cloudOnly = { ...base, id: other, title: "cloud only" };
  const merged = storage.mergeProjects([newer], [older, cloudOnly]);
  assert.equal(merged.length, 2);
  assert.equal(merged.find(item => item.id === projectId).title, "newer edit");
  assert.equal(merged.find(item => item.id === other).title, "cloud only");
});

test("a failed compact write leaves the previous browser snapshot intact", () => {
  const previous = JSON.stringify([project()]);
  let stored = previous;
  const storage = load("src/lib/electronics/storage.ts", { "./project-source": projectSource, "./engine": engine }, { localStorage: {
    getItem: () => stored, setItem: () => { throw new Error("QuotaExceededError"); },
  } });
  assert.throws(() => storage.saveLocalProject(owner, { ...project(), title: "new edit" }), /QuotaExceededError/);
  assert.equal(stored, previous);
});

test("saving a new local project retains more than thirty older local-only projects", () => {
  const base = project();
  const previous = Array.from({ length: 35 }, (_, index) => ({
    ...base,
    id: `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`,
    title: `Older project ${index}`,
    layout: { ...base.layout, board: { ...base.layout.board, holes: [] } },
  }));
  let stored = JSON.stringify(previous);
  const storage = load("src/lib/electronics/storage.ts", { "./project-source": projectSource, "./engine": engine }, { localStorage: {
    getItem: () => stored, setItem: (_key, value) => { stored = value; },
  } });
  assert.equal(storage.readLocalProjects(owner).length, 35);
  storage.saveLocalProject(owner, base);
  const restored = storage.readLocalProjects(owner);
  assert.equal(restored.length, 36);
  for (const item of previous) assert.ok(restored.some(candidate => candidate.id === item.id));
  assert.ok(restored.every(item => item.layout.board.holes.length === 830));
});

test("cloud pagination makes projects beyond the first thirty accessible without duplicate downloads", async () => {
  const h = harness();
  const base = project();
  for (let index = 0; index < 61; index++) {
    const id = `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;
    h.state.files.set(`${owner}/${id}.json`, JSON.stringify({ ...base, id }));
  }
  const first = await (await h.get()).json();
  assert.equal(first.projects.length, 30); assert.equal(first.nextOffset, 30);
  const second = await (await h.get(first.nextOffset)).json();
  assert.equal(second.projects.length, 30); assert.equal(second.nextOffset, 60);
  const last = await (await h.get(second.nextOffset)).json();
  assert.equal(last.projects.length, 1); assert.equal(last.nextOffset, null);
  assert.equal(new Set([...first.projects, ...second.projects, ...last.projects].map(item => item.id)).size, 61);
  assert.equal(h.state.calls.filter(call => call[0] === "download").length, 61);
});

test("cloud pagination rejects invalid offsets before storage and advances past corrupt entries", async () => {
  for (const offset of ["-1", "1.5", "Infinity", "01", "1000001", "hello"]) {
    const h = harness();
    assert.equal((await h.get(offset)).status, 400);
    assert.equal(h.state.calls.length, 0);
  }
  const h = harness();
  const base = project();
  for (let index = 0; index < 31; index++) {
    const id = `00000000-0000-4000-8000-${index.toString(16).padStart(12, "0")}`;
    h.state.files.set(`${owner}/${id}.json`, index < 30 ? "corrupt" : JSON.stringify({ ...base, id }));
  }
  const first = await (await h.get()).json();
  assert.equal(first.projects.length, 0); assert.equal(first.skipped, 30); assert.equal(first.nextOffset, 30);
  const last = await (await h.get(first.nextOffset)).json();
  assert.equal(last.projects.length, 1); assert.equal(last.nextOffset, null);
});
