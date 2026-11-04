import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
function load(relative, dependencies = {}, extras = {}) {
  const output = ts.transpileModule(readFileSync(path.join(root, relative), "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(output, { module: mod, exports: mod.exports, require(name) {
    if (!(name in dependencies)) throw Error(`Unexpected dependency: ${name}`);
    return dependencies[name];
  }, Buffer, Uint8Array, Request, Response, JSON, ...extras }, { filename: relative });
  return mod.exports;
}
const schema = load("src/lib/electronics/schema.ts");
const definitions = [{ id: "r", name: "저항", pins: [{ id: "1", label: "1" }, { id: "2", label: "2" }], kind: "resistor", mounting: "direct", pinoutStatus: "generic", package: "axial", category: "수동", description: "" }];
const circuit = () => ({ id: "test-circuit", title: "분압", description: "", components: [{ id: "R1", definitionId: "r", value: "1k", pinNets: { "1": "VCC", "2": "GND" } }], netNames: { VCC: "전원", GND: "접지" }, instruments: [], notes: [], reviewItems: [], provenance: "synthetic fixture" });
function harness(options = {}) {
  const calls = [];
  const sdk = { GoogleGenAI: class { constructor() {} models = { generateContent: async (request) => {
    calls.push(request);
    if (options.error) throw options.error;
    return { text: JSON.stringify(options.output ?? circuit()) };
  } }; } };
  const recognition = load("src/lib/electronics/recognition.ts", { "@google/genai": sdk, "./schema": schema, "@/lib/ai/gemini": { GEMINI_MODEL: "existing-primary-test-model" } }, { process: { env: { GEMINI_API_KEY: options.noKey ? "" : "synthetic-key" } } });
  return { recognition, calls };
}

test("strict parser retains exact pins and all circuit references", () => {
  assert.deepEqual(JSON.parse(JSON.stringify(schema.parseCircuit(circuit(), definitions))), circuit());
});
test("rejects unknown, missing and duplicated component identities", () => {
  for (const change of [c => { c.components[0].definitionId = "unlisted"; }, c => { delete c.components[0].pinNets["2"]; }, c => { c.components[0].pinNets["3"] = "GND"; }, c => c.components.push(structuredClone(c.components[0]))]) {
    const c = circuit(); change(c); assert.throws(() => schema.parseCircuit(c, definitions), /부품|핀|중복/);
  }
});
test("rejects dangling nets, excess capacity and unknown metadata", () => {
  const c = circuit(); c.components[0].pinNets["2"] = "not-defined";
  assert.throws(() => schema.parseCircuit(c, definitions), /정의되지/);
  const many = circuit(); many.components = Array.from({ length: 81 }, (_, i) => ({ ...many.components[0], id: `R${i}` }));
  assert.throws(() => schema.parseCircuit(many, definitions), /최대/);
  assert.throws(() => schema.parseCircuit({ ...circuit(), executable: "bad" }, definitions), /알 수 없는/);
});
test("rejects dangerous keys and non-boolean review states", () => {
  for (const key of ["__proto__", "constructor", "prototype"]) {
    const c = JSON.parse(JSON.stringify(circuit()).replace('"netNames":{', `"netNames":{"${key}":"evil",`));
    assert.throws(() => schema.parseCircuit(c, definitions), /허용하지/);
  }
  const c = circuit(); c.reviewItems = [{ id: "x", message: "check", resolved: "false" }];
  assert.throws(() => schema.parseCircuit(c, definitions), /참\/거짓/);
});
test("accepts a supported PDF and rejects spoofed MIME and malformed base64", () => {
  const { recognition: r } = harness();
  const file = { name: "circuit.pdf", mimeType: "application/pdf", data: Buffer.from("%PDF-1.7\nsynthetic").toString("base64") };
  assert.equal(r.validateRecognitionInput({ text: "", files: [file] }).files.length, 1);
  assert.throws(() => r.validateRecognitionInput({ files: [{ ...file, mimeType: "image/png" }] }), /일치하지/);
  assert.throws(() => r.validateRecognitionInput({ files: [{ ...file, data: "%%%=" }] }), /인코딩/);
  assert.throws(() => r.validateRecognitionInput({ files: [file, file, file, file, file] }), /4개/);
});
test("rejects empty input, huge text and file payloads", () => {
  const { recognition: r } = harness();
  assert.throws(() => r.validateRecognitionInput({}), /입력/);
  assert.throws(() => r.validateRecognitionInput({ text: "x".repeat(20001) }), /20,000/);
  const data = Buffer.alloc(r.RECOGNITION_LIMITS.fileBytes + 1).toString("base64");
  assert.throws(() => r.validateRecognitionInput({ files: [{ name: "x.pdf", mimeType: "application/pdf", data }] }), error => error.status === 413);
});
test("body size limit also applies when Content-Length is absent", async () => {
  const { recognition: r } = harness();
  const request = new Request("https://example.test/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: " ".repeat(r.RECOGNITION_LIMITS.requestBytes + 1) });
  await assert.rejects(r.readRecognitionRequest(request), error => error.status === 413);
  const malformed = new Request("https://example.test/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{" });
  await assert.rejects(r.readRecognitionRequest(malformed), /JSON/);
});
test("uses only configured primary model and forces unresolved source review", async () => {
  const output = circuit(); output.reviewItems.push({ id: "verify", message: "핀 확인", resolved: true });
  const { recognition: r, calls } = harness({ output });
  const result = await r.recognizeCircuit({ text: "원본을 확인", files: [] }, definitions);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].model, "existing-primary-test-model");
  assert.equal(calls[0].config.responseMimeType, "application/json");
  assert.equal(result.circuit.reviewItems.every(item => item.resolved === false), true);
  assert.equal(result.circuit.reviewItems.some(item => item.id === "source-review"), true);
});
test("missing key and provider failures do not fabricate a circuit or expose secrets", async () => {
  const absent = harness({ noKey: true });
  await assert.rejects(absent.recognition.recognizeCircuit({ text: "x", files: [] }, definitions), error => error.status === 503);
  assert.equal(absent.calls.length, 0);
  const failed = harness({ error: Error("internal secret token: do-not-disclose") });
  await assert.rejects(failed.recognition.recognizeCircuit({ text: "x", files: [] }, definitions), error => error.status === 503 && !error.message.includes("do-not-disclose"));
  assert.equal(failed.calls.length, 1);
});
test("invalid AI connectivity is rejected instead of being repaired or substituted", async () => {
  const output = circuit(); output.components[0].pinNets["2"] = "missing";
  const { recognition: r } = harness({ output });
  await assert.rejects(r.recognizeCircuit({ text: "x", files: [] }, definitions), error => error.status === 422);
});
test("API checks administrator access before reading files or invoking AI", async () => {
  let invoked = false;
  const route = load("app/api/admin/electronics/analyze/route.ts", {
    "next/server": { NextResponse: { json: (body, options = {}) => new Response(JSON.stringify(body), options) } },
    "@/lib/auth/requireAdmin": { requireAdmin: async () => ({ ok: false, response: new Response("unauthorized", { status: 403 }) }) },
    "@/lib/electronics/catalog": { COMPONENT_CATALOG: definitions },
    "@/lib/electronics/recognition": { ...harness().recognition, readRecognitionRequest: async () => { invoked = true; } },
  });
  const result = await route.POST(new Request("https://example.test/analyze", { method: "POST" }));
  assert.equal(result.status, 403); assert.equal(invoked, false);
});
