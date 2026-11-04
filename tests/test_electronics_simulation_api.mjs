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
  return { circuit, boardOptions, layout: engine.createLayout(circuit, definitions, boardOptions), config: JSON.parse(JSON.stringify(config)) };
}
function harness(options = {}) {
  let runs = 0;
  const route = load("app/api/admin/electronics/simulate/route.ts", {
    "next/server": { NextResponse: { json: (data, init = {}) => new Response(JSON.stringify(data), init) } },
    "@/lib/auth/requireAdmin": { requireAdmin: async () => {
      if (options.authError) throw Error("secret-service-token");
      return options.denied ? { ok: false, response: new Response("denied", { status: options.denied }) } : { ok: true, userId: "test-admin", supabase: {} };
    } },
    "@/lib/electronics/simulation": { ...simulation, runSimulation(...args) { runs++; return simulation.runSimulation(...args); } },
  }, false);
  return { route, runs: () => runs,
    post: value => route.POST(new Request("https://example.test/simulate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) })),
    get: () => route.GET(new Request("https://example.test/simulate")),
  };
}

test("simulation and capabilities require administrator access before parsing or running", async () => {
  for (const denied of [401, 403]) {
    const h = harness({ denied });
    assert.equal((await h.post({ malformed: true })).status, denied);
    assert.equal((await h.get()).status, denied);
    assert.equal(h.runs(), 0);
  }
});

test("a real RC request returns numerical results and actual breadboard probe nodes", async () => {
  const h = harness(), value = input();
  const outputHole = value.layout.placements.find(p => p.componentId === "R1").pins["2"];
  value.probeHoleIds = [outputHole];
  const response = await h.post(value); assert.equal(response.status, 200, await response.clone().text());
  const data = await response.json();
  assert.equal(data.ok, true); assert.equal(data.validation.valid, true);
  assert.equal(data.result.model, "linear-ideal");
  assert.ok(data.result.time.length >= 128);
  assert.ok(data.result.nodeVoltages.OUT.every(Number.isFinite));
  assert.deepEqual(data.probes, [{ holeId: outputHole, netId: "OUT" }]);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(h.runs(), 1);
});

test("BJT, MOS and multitone mixer requests use the same nonlinear engine after real board validation", async () => {
  for (const id of ["ce-amplifier", "mos-current-mirror", "mos-differential", "bjt-mixer"]) {
    const circuit=structuredClone(templates.find(item=>item.id===id));
    const boardOptions={boards:2,railMode:"split"};
    const value={circuit,boardOptions,layout:engine.createLayout(circuit,definitions,boardOptions),config:{...simulation.defaultSimulationConfig(circuit),acPoints:8}};
    const response=await harness().post(value); assert.equal(response.status,200,`${id}: ${await response.clone().text()}`);
    const data=await response.json();
    assert.equal(data.result.model,"nonlinear-educational"); assert.equal(data.validation.valid,true);
    assert.ok(Object.values(data.result.nodeVoltages).flat().every(Number.isFinite));
    assert.ok(Object.keys(data.result.dc.deviceCurrents).length>0);
    for (const pins of Object.values(data.result.dc.deviceCurrents)) assert.ok(Math.abs(Object.values(pins).reduce((sum,value)=>sum+value,0))<1e-10);
    if(id==="bjt-mixer") assert.equal(value.config.extraSources.length,2);
  }
});

test("dynamic opamp API keeps time-domain switching and explicitly omits unstable AC analysis", async () => {
  const circuit = structuredClone(templates.find(item => item.id === "schmitt-inverting"));
  const boardOptions = { boards: 2, railMode: "split" };
  const response = await harness().post({ circuit, boardOptions, layout: engine.createLayout(circuit, definitions, boardOptions), config: simulation.defaultSimulationConfig(circuit) });
  assert.equal(response.status, 200, await response.clone().text());
  const { result, validation } = await response.json();
  assert.equal(validation.valid, true); assert.equal(result.model, "nonlinear-educational");
  assert.ok(result.acUnavailableReason); assert.deepEqual(result.ac.frequenciesHz, []);
  assert.ok(Math.max(...result.nodeVoltages.OUT) > 7); assert.ok(Math.min(...result.nodeVoltages.OUT) < -7);
});

test("a manually moved pin with old wires blocks computation even if stored issues claim success", async () => {
  const h = harness(), value = input();
  value.layout.placements.find(p => p.componentId === "R1").pins["1"] = "B1:B2";
  value.layout.issues = [];
  const response = await h.post(value); assert.equal(response.status, 422);
  const data = await response.json();
  assert.equal(data.code, "LAYOUT_INVALID");
  assert.ok(data.issues.some(issue => issue.code === "OPEN_CIRCUIT"));
  assert.equal(h.runs(), 0); assert.equal(data.result, undefined);
});

test("supplied board geometry is canonicalized and cannot join isolated strips", async () => {
  const h = harness(), value = input();
  value.layout.board.holes.forEach(hole => { hole.group = "fake-all-connected"; hole.x = -1000; });
  const good = await h.post(value); assert.equal(good.status, 200, await good.clone().text());
  value.probeHoleIds = ["B1:A63"];
  const response = await h.post(value); assert.equal(response.status, 422);
  assert.equal((await response.json()).code, "ISOLATED_PROBE_HOLE");
  assert.equal(h.runs(), 1);
});

test("missing/current-layout tampering and excessive probes are rejected before numerical work", async () => {
  for (const mutate of [v => { delete v.layout; }, v => { v.layout.placements[0] = null; }, v => { v.layout.jumpers[0].from = "B1:Z1"; }, v => { v.boardOptions.boards = 999; }, v => { v.layout.placements.push(v.layout.placements[0]); }, v => { v.probeHoleIds = Array(17).fill("B1:A1"); }, v => { v.unknown = true; }]) {
    const h = harness(), value = input(); mutate(value);
    assert.equal((await h.post(value)).status, 400); assert.equal(h.runs(), 0);
  }
});

test("config bounds, unsupported models and floating circuits return errors without fabricated waveforms", async () => {
  const bounded = harness(), invalidConfig = input(); invalidConfig.config.sampleCount = 100000000;
  const bounds = await bounded.post(invalidConfig); assert.equal(bounds.status, 422); assert.equal(bounded.runs(), 0);

  const unsupported = input();
  const diode = definitions.find(d => d.kind === "led" && d.mounting === "direct" && d.pinoutStatus !== "unverified" && d.pins.length === 2);
  const prior = unsupported.circuit.components[0];
  unsupported.circuit.components[0] = { ...prior, definitionId: diode.id, value: diode.name, pinNets: Object.fromEntries(diode.pins.map((pin, i) => [pin.id, i ? "OUT" : "IN"])) };
  unsupported.layout = engine.createLayout(unsupported.circuit, definitions, unsupported.boardOptions);
  const h = harness(); const rejected = await h.post(unsupported); assert.equal(rejected.status, 422);
  const unsupportedData = await rejected.json();
  assert.equal(unsupportedData.result, undefined); assert.equal(unsupportedData.code, "SIMULATION_REJECTED"); assert.equal(h.runs(), 1);

  const floating = input();
  floating.circuit.netNames.FLOAT1 = "FLOAT1"; floating.circuit.netNames.FLOAT2 = "FLOAT2";
  floating.circuit.components.push({ ...floating.circuit.components[0], id: "Rfloating", pinNets: { "1": "FLOAT1", "2": "FLOAT2" } });
  floating.layout = engine.createLayout(floating.circuit, definitions, floating.boardOptions);
  const floated = await h.post(floating); assert.equal(floated.status, 422);
  const floatingData = await floated.json();
  assert.equal(floatingData.result, undefined); assert.equal(floatingData.code, "SIMULATION_REJECTED"); assert.equal(h.runs(), 2);
});

test("request stream limits, MIME and JSON checks run before numerical work", async () => {
  const h = harness();
  const request = (body, headers = { "content-type": "application/json" }) => new Request("https://example.test/simulate", { method: "POST", headers, body });
  assert.equal((await h.route.POST(request(" ".repeat(1000001)))).status, 413);
  assert.equal((await h.route.POST(request("{}", { "content-type": "application/json", "content-length": "1000001" }))).status, 413);
  assert.equal((await h.route.POST(request("{"))).status, 400);
  assert.equal((await h.route.POST(request("{}", {}))).status, 415);
  assert.equal(h.runs(), 0);
});

test("capabilities are authenticated and unexpected server failures never disclose details", async () => {
  const h = harness(); const response = await h.get(); const data = await response.json();
  assert.equal(response.status, 200); assert.ok(data.required.includes("layout"));
  assert.deepEqual(data.analyses, ["dc", "transient", "ac"]);
  assert.equal(data.limits.probes, 16);
  assert.equal(data.limits.signalSources, 4); assert.ok(data.models.includes("nonlinear-educational"));
  assert.deepEqual(data.configExtensions.opampModel, ["ideal", "educational-dynamic"]);
  assert.ok(data.nonlinearModels.some(model => model.definitionId === "bjt-bc549c-onsemi-to92" && model.educational));
  const failed = await harness({ authError: true }).post(input()); assert.equal(failed.status, 503);
  assert.ok(!(await failed.text()).includes("secret-service-token"));
});
