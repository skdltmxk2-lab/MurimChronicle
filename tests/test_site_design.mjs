import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

function load(file, overrides = {}, globals = {}) {
  const mod = { exports: {} };
  const code = ts.transpileModule(readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, {
    module: mod, exports: mod.exports,
    require(name) {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name === "@/lib/design/presets") return load("src/lib/design/presets.ts");
      throw Error(`Unexpected dependency: ${name}`);
    },
    Request, Response, AbortController, setTimeout, clearTimeout,
    process: { env: {} }, ...globals,
  }, { filename: path.normalize(file) });
  return mod.exports;
}

const presets = load("src/lib/design/presets.ts");
const nextResponse = { NextResponse: { json: (body, init = {}) => new Response(JSON.stringify(body), init) } };
const serverConstants = { SITE_DESIGN_SETTING_KEY: "site_design", SITE_DESIGN_CACHE_TAG: "site-design" };

function database(options = {}) {
  const calls = { tables: [], columns: [], filters: [], writes: [], signals: [] };
  let written;
  const query = {
    select(columns) { calls.columns.push(columns); return query; },
    eq(key, value) { calls.filters.push([key, value]); return query; },
    abortSignal(signal) { calls.signals.push(signal); return query; },
    upsert(value, config) { written = value; calls.writes.push({ value, config }); return query; },
    async maybeSingle() {
      if (options.readThrow) throw Error("private-database-details");
      if (options.pending) return new Promise(resolve => calls.signals.at(-1).addEventListener("abort", () => resolve({ data: null, error: { message: "private-timeout" } }), { once: true }));
      return options.readError ? { data: null, error: { message: "private-database-details" } } : { data: options.readValue === undefined ? null : { value: options.readValue }, error: null };
    },
    async single() {
      if (options.writeThrow) throw Error("private-write-details");
      return options.writeError ? { data: null, error: { message: "private-write-details" } } : { data: options.emptyWrite ? null : { value: options.savedValue ?? written.value }, error: null };
    },
  };
  return { calls, client: { from(table) { calls.tables.push(table); return query; } } };
}

function adminHarness(options = {}) {
  const db = database(options);
  const invalidations = [];
  const route = load("app/api/admin/appearance/route.ts", {
    "next/server": nextResponse,
    "next/cache": { revalidateTag: tag => invalidations.push(["tag", tag]), revalidatePath: (...args) => invalidations.push(["path", ...args]) },
    "@/lib/design/server": serverConstants,
    "@/lib/auth/requireAdmin": { requireAdmin: async () => {
      if (options.authThrow) throw Error("private-service-key");
      return options.denied ? { ok: false, response: new Response("denied", { status: options.denied }) } : { ok: true, userId: "example-admin", supabase: db.client };
    } },
  });
  return {
    ...db, invalidations,
    get: () => route.GET(new Request("https://example.test/api/admin/appearance")),
    patch: body => route.PATCH(new Request("https://example.test/api/admin/appearance", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })),
    malformed: () => route.PATCH(new Request("https://example.test/api/admin/appearance", { method: "PATCH", body: "{" })),
  };
}

test("design IDs are an exact allowlist with one recommended safe default", () => {
  assert.equal(presets.DEFAULT_SITE_DESIGN, "coral");
  assert.deepEqual(Array.from(presets.SITE_DESIGN_IDS), ["coral", "terrazzo", "console"]);
  for (const id of presets.SITE_DESIGN_IDS) assert.equal(presets.isSiteDesign(id), true);
  for (const input of [null, undefined, {}, [], 0, true, "Coral", " coral", "coral ", "dark", "__proto__", "search_engine"]) assert.equal(presets.isSiteDesign(input), false);
  assert.deepEqual(Array.from(presets.SITE_DESIGNS.filter(p => p.recommended), p => p.id), ["coral"]);
  assert.equal(new Set(presets.SITE_DESIGNS.map(p => p.id)).size, 3);
});

test("administrator authorization runs before any design read or write", async () => {
  for (const denied of [401, 403]) {
    const h = adminHarness({ denied });
    for (const response of [await h.get(), await h.patch({ design: "coral" }), await h.malformed()]) {
      assert.equal(response.status, denied);
      assert.equal(response.headers.get("cache-control"), "no-store");
    }
    assert.equal(h.calls.tables.length, 0);
    assert.equal(h.invalidations.length, 0);
  }
});

test("invalid or extra settings cannot reach the isolated settings write", async () => {
  const h = adminHarness();
  for (const input of [null, [], "coral", {}, { design: null }, { design: "unknown" }, { design: "Coral" }, { design: "console", key: "search_engine" }, { design: "coral", value: "anything" }]) {
    assert.equal((await h.patch(input)).status, 400);
  }
  assert.equal((await h.malformed()).status, 400);
  assert.equal(h.calls.tables.length, 0);
  assert.equal(h.calls.writes.length, 0);
  assert.equal(h.invalidations.length, 0);
});

test("each successful selection confirms only site_design then invalidates shared layout and tag", async () => {
  for (const design of presets.SITE_DESIGN_IDS) {
    const h = adminHarness();
    const response = await h.patch({ design });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, design });
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.deepEqual(h.calls.tables, ["app_settings"]);
    assert.equal(h.calls.writes.length, 1);
    const { value, config } = h.calls.writes[0];
    assert.deepEqual(Object.keys(value).sort(), ["key", "updated_at", "value"]);
    assert.equal(value.key, "site_design");
    assert.equal(value.value, design);
    assert.ok(Number.isFinite(Date.parse(value.updated_at)));
    assert.equal(config.onConflict, "key");
    assert.deepEqual(h.calls.columns, ["value"]);
    assert.equal(h.calls.signals.length, 1);
    assert.deepEqual(h.invalidations, [["tag", "site-design"], ["path", "/", "layout"]]);
  }
});

test("save errors, empty confirmations and mismatched saved rows never report success", async () => {
  for (const options of [{ writeError: true }, { writeThrow: true }, { emptyWrite: true }, { savedValue: "console" }]) {
    const h = adminHarness(options);
    const response = await h.patch({ design: "coral" });
    assert.equal(response.status, 500);
    const body = await response.json();
    assert.equal(body.ok, false);
    assert.equal(typeof body.message, "string");
    assert.ok(!JSON.stringify(body).includes("private-"));
    assert.equal(h.invalidations.length, 0);
  }
});

test("admin reads are fresh and expose only safe IDs, while read failures remain errors", async () => {
  for (const stored of ["coral", "terrazzo", "console", undefined, "private-setting-value"]) {
    const h = adminHarness({ readValue: stored });
    const response = await h.get();
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, design: presets.isSiteDesign(stored) ? stored : "coral" });
    assert.deepEqual(h.calls.filters, [["key", "site_design"]]);
    assert.deepEqual(h.calls.columns, ["value"]);
    assert.equal(h.calls.writes.length, 0);
  }
  for (const options of [{ readError: true }, { readThrow: true }, { authThrow: true }]) {
    const h = adminHarness(options);
    for (const response of [await h.get(), ...(options.authThrow ? [await h.patch({ design: "coral" })] : [])]) {
      assert.equal(response.status, 500);
      const body = await response.json();
      assert.equal(body.ok, false);
      assert.ok(!JSON.stringify(body).includes("private-"));
    }
  }
});

test("public endpoint returns only the allowlisted helper result and no settings metadata", async () => {
  for (const design of presets.SITE_DESIGN_IDS) {
    const route = load("app/api/site-design/route.ts", {
      "next/server": nextResponse,
      "@/lib/design/server": { getSiteDesign: async () => design },
    });
    const response = await route.GET();
    assert.deepEqual(await response.json(), { ok: true, design });
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

function serverHarness(options = {}) {
  const db = database(options);
  const cache = [];
  const clients = [];
  const timers = [];
  const server = load("src/lib/design/server.ts", {
    "server-only": {},
    "@supabase/supabase-js": { createClient: (...args) => { clients.push(args); return db.client; } },
    "next/cache": { unstable_cache: (fn, key, config) => { cache.push({ key, config }); return options.cacheThrow ? async () => { throw Error("private-cache-details"); } : fn; } },
  }, {
    process: { env: options.noEnv ? {} : { NEXT_PUBLIC_SUPABASE_URL: "https://database.example.invalid", SUPABASE_SERVICE_ROLE_KEY: "private-service-key" } },
    setTimeout: (callback, ms) => { timers.push(ms); return setTimeout(callback, options.pending ? 1 : ms); },
  });
  return { ...db, server, cache, clients, timers };
}

test("server reads isolate one key in a tagged 60-second cache", async () => {
  const h = serverHarness({ readValue: "console" });
  assert.equal(await h.server.getSiteDesign(), "console");
  assert.equal(h.cache[0].config.revalidate, 60);
  assert.deepEqual(Array.from(h.cache[0].config.tags), ["site-design"]);
  assert.deepEqual(h.calls.tables, ["app_settings"]);
  assert.deepEqual(h.calls.filters, [["key", "site_design"]]);
  assert.deepEqual(h.calls.columns, ["value"]);
  assert.equal(h.calls.writes.length, 0);
  assert.equal(h.clients[0][2].auth.persistSession, false);
  assert.equal(h.clients[0][2].auth.autoRefreshToken, false);
  assert.equal(h.clients[0][2].auth.detectSessionInUrl, false);
  assert.deepEqual(h.timers, [2500]);
});

test("missing settings, invalid values and unavailable reads fall back without breaking pages", async () => {
  for (const options of [{}, { readValue: "private-invalid-value" }, { readError: true }, { readThrow: true }, { cacheThrow: true }, { noEnv: true }]) {
    const h = serverHarness(options);
    assert.equal(await h.server.getSiteDesign(), "coral");
    if (options.noEnv) assert.equal(h.clients.length, 0);
    assert.equal(h.calls.writes.length, 0);
  }
});

test("server read deadline aborts a stalled query and returns the safe default", async () => {
  const h = serverHarness({ pending: true });
  assert.equal(await h.server.getSiteDesign(), "coral");
  assert.equal(h.calls.signals[0].aborted, true);
  assert.deepEqual(h.timers, [2500]);
});
