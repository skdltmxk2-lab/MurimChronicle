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
    if (!(name in dependencies)) throw Error(`Unexpected dependency (including model/API imports): ${name}`);
    return dependencies[name];
  }, Buffer, Uint8Array, JSON, Request, Response }, { filename: relative });
  return mod.exports;
}
const physicalProfiles = load("src/lib/electronics/physical-profiles.ts");
const schema = load("src/lib/electronics/schema.ts", { "./physical-profiles": physicalProfiles });
const engine = load("src/lib/electronics/engine.ts", { "./power": load("src/lib/electronics/power.ts"), "./physical-profiles": physicalProfiles });
const catalog = load("src/lib/electronics/catalog.ts");
const workflow = readFileSync(path.join(root, "docs/electronics-agent-workflow.md"), "utf8");
const input = () => JSON.parse(workflow.match(/```json\r?\n([\s\S]*?)\r?\n```/)[1]);

function harness(options = {}) {
  let layouts = 0;
  const route = load("app/api/admin/electronics/design/route.ts", {
    "next/server": { NextResponse: { json: (value, init = {}) => new Response(JSON.stringify(value), init) } },
    "@/lib/auth/requireAdmin": { requireAdmin: async () => {
      if (options.authError) throw Error("secret-service-token");
      return options.denied ? { ok: false, response: new Response("forbidden", { status: 403 }) } : { ok: true, userId: "synthetic-admin", supabase: {} };
    } },
    "@/lib/electronics/catalog": catalog,
    "@/lib/electronics/schema": schema,
    "@/lib/electronics/engine": { ...engine, createLayout(...args) { layouts++; const layout = engine.createLayout(...args); options.mutateLayout?.(layout); return layout; } },
  });
  return { route, calls: () => layouts, post: value => route.POST(new Request("https://example.test/design", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(value) })), get: () => route.GET(new Request("https://example.test/design")) };
}

test("design and catalog discovery require administrator access", async () => {
  const h = harness({ denied: true });
  assert.equal((await h.post(input())).status, 403);
  assert.equal((await h.get()).status, 403);
  assert.equal(h.calls(), 0);
});
test("documented RC request uses the real catalog and engine without an AI dependency", async () => {
  const h = harness(); const response = await h.post(input());
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.ok, true);
  assert.equal(result.validation.valid, true);
  assert.equal(result.validation.checkedPins, 4);
  assert.equal(result.layout.placements.length, 2);
  assert.equal(result.layout.terminals.length, 4);
  assert.equal(result.layout.board.holes.length, 830);
  assert.ok(result.steps.length >= 6);
  assert.equal(result.circuit.reviewItems[0].resolved, false);
  assert.equal(result.validation.issues.some(issue => issue.code === "REVIEW_REQUIRED"), true);
  assert.equal(response.headers.get("cache-control"), "no-store");
});
test("reconstructs and reports a short instead of trusting layout issue metadata", async () => {
  const h = harness({ mutateLayout(layout) {
    const p = layout.placements[0];
    layout.jumpers.push({ id: "bad-short", from: p.pins["1"], to: p.pins["2"], netId: "IN", color: "#000000" });
    layout.issues = [];
  } });
  const response = await h.post(input()); assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.validation.valid, false);
  assert.equal(result.validation.issues.some(issue => issue.code === "SHORT_CIRCUIT"), true);
  assert.deepEqual(result.layout.issues, result.validation.issues);
});
test("rejects invalid parts, missing pins, dangling nets and forged layout input", async () => {
  for (const mutate of [value => { value.circuit.components[0].definitionId = "invented-part"; }, value => { delete value.circuit.components[0].pinNets["2"]; }, value => { value.circuit.components[0].pinNets["2"] = "unknown-net"; }, value => { value.layout = { valid: true }; }]) {
    const h = harness(); const value = input(); mutate(value);
    assert.equal((await h.post(value)).status, 400); assert.equal(h.calls(), 0);
  }
});
test("rejects unsupported boards, unsafe object keys and malformed JSON", async () => {
  const h = harness(); const value = input(); value.boardOptions.boards = 50;
  assert.equal((await h.post(value)).status, 400);
  const unsafe = JSON.parse(JSON.stringify(input()).replace('"netNames":{', '"netNames":{"__proto__":"bad",'));
  assert.equal((await h.post(unsafe)).status, 400);
  const response = await h.route.POST(new Request("https://example.test/design", { method: "POST", headers: { "content-type": "application/json" }, body: "{" }));
  assert.equal(response.status, 400); assert.equal(h.calls(), 0);
});
test("enforces streamed size limit and rejects incorrect content type", async () => {
  const h = harness();
  const response = await h.route.POST(new Request("https://example.test/design", { method: "POST", headers: { "content-type": "application/json" }, body: " ".repeat(1_000_001) }));
  assert.equal(response.status, 413); assert.equal(h.calls(), 0);
  const wrongType = await h.route.POST(new Request("https://example.test/design", { method: "POST", body: JSON.stringify(input()) }));
  assert.equal(wrongType.status, 415);
});
test("authenticated metadata describes current catalog and supported geometry", async () => {
  const h = harness(); const response = await h.get(); const result = await response.json();
  assert.equal(response.status, 200); assert.equal(result.limits.requestBytes, 1_000_000);
  assert.equal(result.catalog.length, catalog.COMPONENT_CATALOG.length);
  assert.equal(result.catalog.some(part => part.id === "resistor-axial"), true);
  assert.deepEqual(result.boardOptions.boards, [1, 2]); assert.equal(h.calls(), 0);
});
test("unexpected authentication failures do not expose provider secrets", async () => {
  const h = harness({ authError: true });
  const response = await h.post(input());
  assert.equal(response.status, 503); assert.equal((await response.text()).includes("secret-service-token"), false);
});
