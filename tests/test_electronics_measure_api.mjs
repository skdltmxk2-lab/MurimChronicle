import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const cache = new Map();
function load(file, overrides = {}, cacheResult = true) {
  file = path.normalize(file); if (cacheResult && cache.has(file)) return cache.get(file);
  const mod = { exports: {} };
  const output = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (Object.hasOwn(overrides, name)) return overrides[name];
    if (name.startsWith("@/")) return load(path.join("src", `${name.slice(2)}.ts`));
    if (name.startsWith(".")) return load(path.join(path.dirname(file), `${name}.ts`));
    throw Error(`Unexpected dependency: ${name}`);
  }, Buffer, Uint8Array, JSON, Request, Response }, { filename: file });
  if (cacheResult) cache.set(file, mod.exports); return mod.exports;
}
const engine = load("src/lib/electronics/engine.ts");
const simulation = load("src/lib/electronics/simulation.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const { CIRCUIT_TEMPLATES: templates } = load("src/lib/electronics/templates.ts");
const config = { groundNetId: "GND", source: { netId: "IN", waveform: "sine", frequencyHz: 1000, amplitudePeak: 0.2, offset: 0 }, supplies: [], durationSeconds: 0.004, sampleCount: 256, acStartHz: 20, acStopHz: 20000, acPoints: 24 };
function input() {
  const circuit = JSON.parse(JSON.stringify(templates.find(item => item.id === "rc-lowpass")));
  const boardOptions = { boards: 1, railMode: "split" };
  return { circuit, boardOptions, layout: engine.createLayout(circuit, definitions, boardOptions), config: JSON.parse(JSON.stringify(config)), settings: { mode: "ac-voltage", power: "on", redNetId: "OUT", blackNetId: "GND" } };
}
function harness(options = {}) {
  let runs = 0;
  const route = load("app/api/admin/electronics/measure/route.ts", {
    "next/server": { NextResponse: { json: (data, init = {}) => new Response(JSON.stringify(data), init) } },
    "@/lib/auth/requireAdmin": { requireAdmin: async () => {
      if (options.authError) throw Error("secret-service-token");
      return options.denied ? { ok: false, response: new Response("denied", { status: options.denied }) } : { ok: true, userId: "test-admin", supabase: {} };
    } },
    "@/lib/electronics/simulation": { ...simulation, runSimulation(...args) { runs++; return simulation.runSimulation(...args); } },
  }, false);
  return { route, runs: () => runs,
    post: value => route.POST(new Request("https://example.test/measure", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) })),
    get: () => route.GET(new Request("https://example.test/measure")),
  };
}

test("measurement and capability endpoints authenticate before parsing", async () => {
  for (const denied of [401, 403]) {
    const h = harness({ denied });
    assert.equal((await h.post({ malformed: true })).status, denied);
    assert.equal((await h.get()).status, denied); assert.equal(h.runs(), 0);
  }
  const info = await (await harness().get()).json();
  assert.ok(info.modes.includes("diode")); assert.ok(info.modes.includes("ac-current"));
});

test("AC voltage is measured from a freshly computed, physically validated circuit", async () => {
  const h = harness(), value = input();
  const response = await h.post(value); assert.equal(response.status, 200, await response.clone().text());
  const data = await response.json(); assert.equal(data.reading.status, "ok"); assert.equal(data.validation.valid, true);
  assert.ok(data.reading.value > 0.1 && data.reading.value < 0.15); assert.equal(data.reading.unit, "V");
  assert.equal(h.runs(), 1); assert.equal(response.headers.get("cache-control"), "no-store");
});

test("unpowered resistance removes sources and returns the resistor network without running a transient", async () => {
  const circuit = templates.find(item => item.id === "divider"), boardOptions = { boards: 1, railMode: "split" };
  const value = { circuit, boardOptions, layout: engine.createLayout(circuit, definitions, boardOptions), settings: { mode: "resistance", power: "off", redNetId: "VCC", blackNetId: "GND" } };
  const h = harness(), response = await h.post(value); assert.equal(response.status, 200, await response.clone().text());
  const data = await response.json(); assert.ok(Math.abs(data.reading.value - 20000) < 1e-6); assert.equal(h.runs(), 0);
});

test("current measurements are signed branch-terminal values, and invalid terminal choices are rejected", async () => {
  const value = input(); value.settings = { mode: "ac-current", power: "on", branch: { componentId: "R1", terminal: "1" } };
  const response = await harness().post(value); assert.equal(response.status, 200, await response.clone().text());
  const reading = (await response.json()).reading; assert.equal(reading.unit, "A"); assert.ok(reading.value > 0);
  value.settings.branch.terminal = "fiction";
  const bad = await harness().post(value); assert.equal(bad.status, 422);
  assert.equal((await bad.json()).reading.value, null);
});

test("stale wiring and injected caller results never reach numerical measurement", async () => {
  const h = harness(), moved = input(); moved.layout.placements[0].pins[1] = "B1:B60"; moved.layout.issues = [];
  assert.equal((await h.post(moved)).status, 422); assert.equal(h.runs(), 0);
  const injected = input(); injected.result = { nodeVoltages: { OUT: [999] } };
  assert.equal((await h.post(injected)).status, 400); assert.equal(h.runs(), 0);
});

test("invalid settings, missing powered config, oversized bodies and server failures are bounded", async () => {
  const h = harness();
  for (const mutate of [v => { v.settings.unknown = true; }, v => { v.settings.continuityThresholdOhms = -1; }, v => { delete v.config; }]) {
    const value = input(); mutate(value); assert.equal((await h.post(value)).status, 400);
  }
  assert.equal(h.runs(), 0);
  const tooLarge = new Request("https://example.test/measure", { method: "POST", headers: { "content-type": "application/json" }, body: " ".repeat(1000001) });
  assert.equal((await h.route.POST(tooLarge)).status, 413);
  const failed = await harness({ authError: true }).post(input()); assert.equal(failed.status, 503); assert.ok(!(await failed.text()).includes("secret-service-token"));
  const getFailed = await harness({ authError: true }).get(); assert.equal(getFailed.status, 503); assert.ok(!(await getFailed.text()).includes("secret-service-token"));
});
