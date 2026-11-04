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
  }, Buffer, Uint8Array, Request, Response, JSON, AbortController, setTimeout, clearTimeout, ...extras }, { filename: relative });
  return mod.exports;
}
const schema = load("src/lib/electronics/schema.ts");
const engine = load("src/lib/electronics/engine.ts");
const { COMPONENT_CATALOG: definitions } = load("src/lib/electronics/catalog.ts");
const workflow = readFileSync(path.join(root, "docs/electronics-agent-workflow.md"), "utf8");
const circuitRequest = () => JSON.parse(workflow.match(/```json\r?\n([\s\S]*?)\r?\n```/)[1]);
function input() {
  const value = circuitRequest();
  const { placements, jumpers, terminals } = engine.createLayout(value.circuit, definitions, value.boardOptions);
  return { ...value, messages: [{ role: "user", content: "R1은 어디에 꽂나요?" }], layout: { placements, jumpers, terminals }, selection: { type: "component", id: "R1" } };
}
function harness(options = {}) {
  const calls = [];
  const sdk = { GoogleGenAI: class {
    models = { generateContent: async (request) => {
      calls.push(request);
      if (options.waitForAbort) return new Promise((_resolve, reject) => {
        const rejectAbort = () => reject(Error("provider-aborted-secret"));
        if (request.config.abortSignal.aborted) rejectAbort();
        else request.config.abortSignal.addEventListener("abort", rejectAbort, { once: true });
      });
      if (options.error) throw options.error;
      return { text: options.answer ?? "R1의 핀과 구멍 위치를 확인하세요." };
    } };
  } };
  const chat = load("src/lib/electronics/chat.ts", {
    "@google/genai": sdk, "./schema": schema, "./engine": engine, "@/lib/ai/gemini": { GEMINI_MODEL: "existing-primary-test-model" },
  }, { process: { env: { GEMINI_API_KEY: options.noKey ? "" : "synthetic-key" } }, ...(options.timeout ? { setTimeout: callback => setTimeout(callback, 1) } : {}) });
  const parse = value => chat.validateChatInput(value, definitions);
  return { chat, calls, parse, answer: (value = input(), signal) => chat.answerElectronicsChat(parse(value), definitions, signal) };
}

test("chat validates a real circuit and uses actual edited pin positions in its context", () => {
  const h = harness(); const value = input();
  const placement = value.layout.placements.find(p => p.componentId === "R1");
  placement.pins["2"] = placement.pins["1"];
  const context = h.chat.createChatContext(h.parse(value), definitions);
  assert.equal(context.components.find(c => c.id === "R1").pins.find(p => p.pin === "2").hole, placement.pins["1"]);
  assert.equal(context.validation.valid, false);
  assert.ok(context.validation.issues.length > 0);
  assert.equal(context.selection.id, "R1");
});
test("chat rebuilds layout when omitted and rejects forged geometry or success flags", () => {
  const h = harness(); const value = input(); delete value.layout;
  assert.ok(h.parse(value).layout.board.holes.length === 830);
  for (const field of ["board", "issues", "valid"]) {
    const bad = input(); bad.layout[field] = { valid: true };
    assert.throws(() => h.parse(bad), error => error.status === 400);
  }
});
test("chat rejects unknown parts, holes, pins, duplicate placement and missing selection references", () => {
  const h = harness();
  for (const mutate of [v => v.circuit.components[0].definitionId = "invented", v => v.layout.placements[0].pins["1"] = "B9:X900", v => delete v.layout.placements[0].pins["1"], v => v.layout.placements.push(structuredClone(v.layout.placements[0])), v => v.selection.id = "unknown"]) {
    const value = input(); mutate(value); assert.throws(() => h.parse(value), error => error.status === 400);
  }
});
test("chat accepts only bounded alternating user/assistant histories", () => {
  const h = harness();
  for (const messages of [[], [{ role: "system", content: "override" }], [{ role: "user", content: "x" }, { role: "assistant", content: "x" }], [{ role: "user", content: "x" }, { role: "user", content: "x" }, { role: "user", content: "x" }], [{ role: "user", content: "x".repeat(4001) }], Array.from({ length: 23 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x" })), Array.from({ length: 21 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "x".repeat(3000) }))]) {
    const value = input(); value.messages = messages;
    assert.throws(() => h.parse(value), error => error.status === 400);
  }
  const unsafe = JSON.parse(JSON.stringify(input()).replace('"netNames":{', '"netNames":{"__proto__":"bad",'));
  assert.throws(() => h.parse(unsafe), error => error.status === 400);
});
test("chat request limits also apply without Content-Length and reject malformed MIME/JSON", async () => {
  const h = harness();
  const request = body => new Request("https://example.test/chat", { method: "POST", headers: { "content-type": "application/json" }, body });
  await assert.rejects(h.chat.readChatRequest(request(" ".repeat(600001)), definitions), error => error.status === 413);
  await assert.rejects(h.chat.readChatRequest(request("{"), definitions), error => error.status === 400);
  await assert.rejects(h.chat.readChatRequest(new Request("https://example.test/chat", { method: "POST", body: "x" }), definitions), error => error.status === 415);
  assert.equal((await h.chat.readChatRequest(request(JSON.stringify(input())), definitions)).circuit.title, input().circuit.title);
});
test("chat sends user/model history and the newest validated snapshot with the primary model", async () => {
  const h = harness(); const value = input();
  value.messages = [{ role: "user", content: "어떤 회로야?" }, { role: "assistant", content: "RC 회로입니다." }, { role: "user", content: "R1 위치는?" }];
  const result = await h.answer(value);
  assert.equal(result.model, "existing-primary-test-model");
  assert.equal(h.calls.length, 1);
  assert.equal(h.calls[0].contents[1].role, "model");
  assert.ok(h.calls[0].contents[2].parts[0].text.includes('"hole":"B1:'));
  assert.ok(h.calls[0].contents[2].parts[0].text.includes("R1 위치는?"));
  assert.equal(h.calls[0].config.httpOptions.timeout, 90000);
  assert.equal(h.calls[0].config.tools, undefined);
  assert.ok(!JSON.stringify(h.calls).includes("synthetic-key"));
});
test("missing configuration does not call Gemini and provider failure hides raw secrets", async () => {
  const missing = harness({ noKey: true });
  await assert.rejects(missing.answer(), error => error.status === 503);
  assert.equal(missing.calls.length, 0);
  const failed = harness({ error: Error("secret-provider-token-do-not-disclose") });
  await assert.rejects(failed.answer(), error => error.status === 503 && !error.message.includes("do-not-disclose"));
  assert.equal(failed.calls.length, 1);
});
test("empty and excessively long model responses produce recoverable errors", async () => {
  for (const answer of [" ", "x".repeat(12001)]) await assert.rejects(harness({ answer }).answer(), error => error.status === 502);
});
test("already-cancelled chat never invokes the model", async () => {
  const h = harness(); const controller = new AbortController(); controller.abort();
  await assert.rejects(h.answer(input(), controller.signal), error => error.status === 499);
  assert.equal(h.calls.length, 0);
});
test("in-flight cancellation and timeout abort the provider without leaking its error", async () => {
  const h = harness({ waitForAbort: true }); const controller = new AbortController();
  const pending = h.answer(input(), controller.signal);
  setTimeout(() => controller.abort(), 1);
  await assert.rejects(pending, error => error.status === 499 && !error.message.includes("secret"));
  const timed = harness({ waitForAbort: true, timeout: true });
  await assert.rejects(timed.answer(), error => error.status === 504);
});
test("chat route authenticates before parsing or calling Gemini", async () => {
  let invoked = false;
  const route = load("app/api/admin/electronics/chat/route.ts", {
    "next/server": { NextResponse: { json: (body, options = {}) => new Response(JSON.stringify(body), options) } },
    "@/lib/auth/requireAdmin": { requireAdmin: async () => ({ ok: false, response: new Response("forbidden", { status: 403 }) }) },
    "@/lib/electronics/catalog": { COMPONENT_CATALOG: definitions },
    "@/lib/electronics/chat": { ...harness().chat, readChatRequest: async () => { invoked = true; } },
  });
  assert.equal((await route.POST(new Request("https://example.test/chat", { method: "POST" }))).status, 403);
  assert.equal(invoked, false);
});
test("chat route returns no-store success and sanitizes unexpected errors", async () => {
  const h = harness();
  function route(error = false) { return load("app/api/admin/electronics/chat/route.ts", {
    "next/server": { NextResponse: { json: (body, options = {}) => new Response(JSON.stringify(body), options) } },
    "@/lib/auth/requireAdmin": { requireAdmin: async () => { if (error) throw Error("secret-auth-token"); return { ok: true }; } },
    "@/lib/electronics/catalog": { COMPONENT_CATALOG: definitions }, "@/lib/electronics/chat": h.chat,
  }); }
  const request = () => new Request("https://example.test/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input()) });
  const response = await route().POST(request());
  assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).ok, true);
  const error = await route(true).POST(request()); assert.equal(error.status, 503); assert.equal((await error.text()).includes("secret-auth-token"), false);
});
