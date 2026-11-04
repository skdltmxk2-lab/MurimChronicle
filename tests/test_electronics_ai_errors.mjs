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

const quotaError = (violations, retryDelay, extras = []) => Object.assign(new Error(JSON.stringify({ error: {
  code: 429, status: "RESOURCE_EXHAUSTED", message: secret,
  details: [
    { "@type": "type.googleapis.com/google.rpc.QuotaFailure", violations },
    ...(retryDelay === undefined ? [] : [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retryDelay }]),
    ...extras,
  ],
} })), { status: 429 });
const quotaViolation = (quotaId, quotaMetric = "generativelanguage.googleapis.com/generate_content_free_tier_requests") => ({
  quotaId, quotaMetric, quotaDimensions: { model: secret, project: secret, location: secret },
  subject: `project:${secret}`, description: secret, quotaValue: secret,
});

test("daily request quota stays non-retryable even when the provider also supplies a short retry delay", () => {
  const result = classifyGeminiError(quotaError([quotaViolation("GenerateRequestsPerDayPerProjectPerModel-FreeTier")], "45s"));
  assert.equal(result.code, "GEMINI_RATE_LIMITED"); assert.equal(result.status, 429);
  assert.deepEqual(Array.from(result.metadata.quotaScopes), ["REQUESTS_PER_DAY"]);
  assert.equal(result.metadata.retryAfterSeconds, 45); assert.equal(result.metadata.retryable, false);
  assert.match(result.message, /일일/); assert.ok(!result.message.includes("45초"));
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.ok(!JSON.stringify(result).includes("GenerateRequests"));
  assert.ok(!JSON.stringify(result).includes("generativelanguage.googleapis.com"));
});

test("minute request and token quotas expose only deduplicated enum scopes and rounded-up retry seconds", () => {
  const requests = quotaViolation("GenerateRequestsPerMinutePerProjectPerModel-FreeTier");
  const tokens = quotaViolation("GenerateContentInputTokensPerModelPerMinute-FreeTier", "generativelanguage.googleapis.com/generate_content_free_tier_input_token_count");
  const result = classifyGeminiError(quotaError([requests, tokens, requests], "12.000000001s"));
  assert.deepEqual(Array.from(result.metadata.quotaScopes), ["REQUESTS_PER_MINUTE", "TOKENS_PER_MINUTE"]);
  assert.equal(result.metadata.retryAfterSeconds, 13); assert.equal(result.metadata.retryable, true);
  assert.match(result.message, /분당/); assert.match(result.message, /최소 13초/);
  assert.ok(!JSON.stringify(result).includes(secret));
});

test("daily token quota takes precedence over simultaneous minute limits and supports proto field names", () => {
  const result = classifyGeminiError(quotaError([
    quotaViolation("GenerateRequestsPerMinutePerProjectPerModel-PaidTier", "generativelanguage.googleapis.com/generate_content_paid_tier_requests"),
    { quota_id: "GenerateContentInputTokensPerModelPerDay", quota_metric: "generativelanguage.googleapis.com/generate_content_input_token_count", quota_dimensions: { project: secret } },
  ], "1s"));
  assert.deepEqual(Array.from(result.metadata.quotaScopes), ["TOKENS_PER_DAY", "REQUESTS_PER_MINUTE"]);
  assert.equal(result.metadata.retryable, false); assert.match(result.message, /일일/);
});

test("unknown quota identifiers, metrics without periods, and untyped data remain generic and private", () => {
  const generic = classifyGeminiError({ status: 429 });
  for (const violations of [
    [quotaViolation(secret)],
    [{ quotaMetric: "generativelanguage.googleapis.com/generate_content_free_tier_requests", description: "requests per day " + secret }],
    [quotaViolation("GenerateRequestsPerDayPerProjectPerModel-FreeTier-" + secret)],
    [quotaViolation("GenerateRequestsPerDayPerProjectPerModel-FreeTier", secret)],
    [quotaViolation("GenerateRequestsPerDayPerProjectPerModel-FreeTier", "generativelanguage.googleapis.com/generate_content_free_tier_input_token_count")],
  ]) {
    const result = classifyGeminiError(quotaError(violations, undefined));
    assert.equal(result.message, generic.message); assert.equal(result.metadata.quotaScopes, undefined);
    assert.equal(result.metadata.retryable, true); assert.ok(!JSON.stringify(result).includes(secret));
  }
  const untyped = classifyGeminiError({ status: 429, details: [{ violations: [quotaViolation("GenerateRequestsPerDayPerProjectPerModel-FreeTier")], retryDelay: "10s" }] });
  assert.equal(untyped.metadata.quotaScopes, undefined); assert.equal(untyped.metadata.retryAfterSeconds, undefined);
  const fakeType = classifyGeminiError({ status: 429, details: [{ "@type": secret + "/google.rpc.QuotaFailure", violations: [quotaViolation("GenerateRequestsPerDayPerProjectPerModel-FreeTier")] }] });
  assert.equal(fakeType.metadata.quotaScopes, undefined);
});

test("retry hints accept only bounded ProtoJSON durations without shortening excessive waits", () => {
  for (const [value, expected] of [["0s", 1], ["0.25s", 1], ["60s", 60], ["86399.1s", 86400], ["86400s", 86400]]) {
    assert.equal(classifyGeminiError(quotaError([], value)).metadata.retryAfterSeconds, expected);
  }
  for (const value of ["-1s", "86400.1s", "999999999s", "1e3s", "1.0000000001s", "45", "1m", secret, 45, { seconds: secret }]) {
    const result = classifyGeminiError(quotaError([], value));
    assert.equal(result.metadata.retryAfterSeconds, undefined);
    assert.ok(!JSON.stringify(result).includes(secret));
  }
  const result = classifyGeminiError(quotaError([], "10s", [{ "@type": "type.googleapis.com/google.rpc.RetryInfo", retry_delay: "20s" }]));
  assert.equal(result.metadata.retryAfterSeconds, 20);
});

test("quota and retry details do not change higher-priority authentication or cancellation classifications", () => {
  const error = quotaError([quotaViolation("GenerateRequestsPerDayPerProjectPerModel-FreeTier")], "10s");
  error.status = 401;
  const invalidKey = classifyGeminiError(error);
  assert.equal(invalidKey.code, "GEMINI_INVALID_KEY");
  assert.equal(invalidKey.metadata.quotaScopes, undefined); assert.equal(invalidKey.metadata.retryAfterSeconds, undefined);
  const cancelled = classifyGeminiError(error, { aborted: true });
  assert.equal(cancelled.code, "GEMINI_CANCELLED"); assert.equal(cancelled.metadata.quotaScopes, undefined);
});
