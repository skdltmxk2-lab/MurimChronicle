import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(path.join(root, "src/lib/electronics/ai-errors.ts"), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const mod = { exports: {} };
vm.runInNewContext(compiled, { module: mod, exports: mod.exports });
const { classifyGeminiError } = mod.exports;
const secret = "provider-key-and-user-private-circuit-do-not-leak";
const sdkError = (status, reason, text = secret) => Object.assign(new Error(JSON.stringify({ error: {
  code: status, message: text, status: status === 400 ? "INVALID_ARGUMENT" : undefined,
  details: [{ "@type": "type.googleapis.com/google.rpc.ErrorInfo", reason, domain: secret, metadata: { key: secret, prompt: secret } }],
} })), { name: "ApiError", status });

test("SDK numeric status and JSON message identify invalid API keys without treating it as user authentication", () => {
  for (const error of [sdkError(400, "API_KEY_INVALID"), sdkError(400, "API_KEY_EXPIRED"), { status: 401, message: secret }]) {
    const result = classifyGeminiError(error);
    assert.equal(result.code, "GEMINI_INVALID_KEY");
    assert.equal(result.status, 503);
    assert.equal(result.metadata.retryable, false);
    assert.ok(!JSON.stringify(result).includes(secret));
  }
  assert.equal(classifyGeminiError(sdkError(400, "API_KEY_INVALID")).metadata.providerReason, "API_KEY_INVALID");
});

test("403 and structured permission restrictions yield actionable safe server configuration errors", () => {
  for (const error of [{ status: 403 }, sdkError(400, "API_KEY_SERVICE_BLOCKED"), { error: { status: "PERMISSION_DENIED" } }]) {
    const result = classifyGeminiError(error);
    assert.equal(result.code, "GEMINI_PERMISSION_DENIED");
    assert.equal(result.status, 503);
    assert.equal(result.metadata.retryable, false);
  }
});

test("quota and rate errors remain distinguishable from temporary server unavailability", () => {
  for (const error of [{ status: 429 }, sdkError(429, "QUOTA_EXCEEDED"), { error: { status: "RESOURCE_EXHAUSTED" } }]) {
    const result = classifyGeminiError(error);
    assert.equal(result.code, "GEMINI_RATE_LIMITED");
    assert.equal(result.status, 429);
    assert.equal(result.metadata.retryable, true);
  }
});

test("missing model and rejected request schema have separate guidance and retry behavior", () => {
  const model = classifyGeminiError({ response: { status: 404, data: { error: { message: secret, status: "NOT_FOUND" } } } });
  assert.equal(model.code, "GEMINI_MODEL_UNAVAILABLE");
  assert.equal(model.status, 503);
  assert.equal(model.metadata.retryable, false);
  const schema = classifyGeminiError(sdkError(400, undefined));
  assert.equal(schema.code, "GEMINI_INVALID_REQUEST");
  assert.equal(schema.status, 400);
  assert.equal(schema.metadata.providerReason, "INVALID_ARGUMENT");
  assert.ok(!JSON.stringify([model, schema]).includes(secret));
});

test("503 and other server errors are temporary; upstream 504 is a timeout", () => {
  for (const status of [500, 502, 503]) {
    const result = classifyGeminiError({ status, message: secret });
    assert.equal(result.code, "GEMINI_UNAVAILABLE");
    assert.equal(result.status, 503);
    assert.equal(result.metadata.providerStatus, status);
    assert.equal(result.metadata.retryable, true);
  }
  assert.equal(classifyGeminiError({ status: 504 }).code, "GEMINI_TIMEOUT");
});

test("known timeout names and codes map to 504 without message substring guessing", () => {
  for (const error of [{ name: "TimeoutError" }, { name: "APIConnectionTimeoutError" }, { code: "ETIMEDOUT" }, { error: { status: "DEADLINE_EXCEEDED" } }]) {
    const result = classifyGeminiError(error);
    assert.equal(result.code, "GEMINI_TIMEOUT");
    assert.equal(result.status, 504);
  }
  assert.equal(classifyGeminiError(new Error("My private prompt says timeout API_KEY_INVALID" )).code, "GEMINI_UNKNOWN");
});

test("caller cancellation and deadline state override ambiguous abort errors", () => {
  assert.equal(classifyGeminiError({ name: "AbortError" }).status, 499);
  assert.equal(classifyGeminiError({ name: "AbortError" }, { timedOut: true, aborted: true }).status, 504);
  assert.equal(classifyGeminiError({ name: "TimeoutError" }, { aborted: true }).code, "GEMINI_CANCELLED");
  assert.equal(classifyGeminiError({ cause: { code: "ABORT_ERR" } }).code, "GEMINI_CANCELLED");
});

test("all output and metadata are allowlisted even for secret-bearing provider fields", () => {
  const result = classifyGeminiError({ status: 429, name: secret, message: secret, stack: secret, reason: secret,
    request: { headers: { authorization: secret }, prompt: secret }, details: [{ reason: secret, metadata: secret }] });
  assert.deepEqual(Object.keys(result).sort(), ["code", "message", "metadata", "status"]);
  assert.deepEqual(Object.keys(result.metadata).sort(), ["category", "provider", "providerStatus", "retryable"]);
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.equal(result.code, "GEMINI_RATE_LIMITED");
});

test("malformed, oversized, cyclic and accessor-throwing errors fail safely", () => {
  const cyclic = { message: secret }; cyclic.cause = cyclic;
  const getter = Object.defineProperty({}, "message", { get() { throw Error(secret); } });
  for (const error of [undefined, null, 17, secret, { message: "{" }, { message: "{" + secret.repeat(3000) + "}" }, cyclic, getter]) {
    const result = classifyGeminiError(error);
    assert.equal(result.code, "GEMINI_UNKNOWN");
    assert.equal(result.status, 503);
    assert.ok(!JSON.stringify(result).includes(secret));
  }
});

test("JSON-string body and nested cause are understood without serializing unknown object data", () => {
  const result = classifyGeminiError({ cause: { response: { body: JSON.stringify({ error: { code: 400, details: [{ reason: "API_KEY_INVALID" }] } }) } } });
  assert.equal(result.code, "GEMINI_INVALID_KEY");
  assert.equal(result.metadata.providerStatus, 400);
});
