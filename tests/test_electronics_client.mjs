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
  }, JSON, Headers, DOMException, ...globals }, { filename: relative });
  return mod.exports;
}
test("session switching while getSession awaits never sends old workspace data with new credentials", async () => {
  let resolveSession;
  let requests = 0;
  const api = load("src/lib/electronics/api.ts", { "@/lib/supabase/client": { supabase: { auth: { getSession: () => new Promise(resolve => { resolveSession = resolve; }) } } } }, { fetch: () => { requests++; throw Error("must not send"); } });
  const pending = api.electronicsAdminFetch("owner-A", "/api/admin/electronics/projects", { method: "POST", body: "owner-A secret draft" });
  resolveSession({ data: { session: { access_token: "owner-B-token", user: { id: "owner-B" } } } });
  await assert.rejects(pending, /계정이 변경/);
  assert.equal(requests, 0);
});
test("matching owner receives the captured token and authorization header cannot be overridden", async () => {
  let sent;
  const api = load("src/lib/electronics/api.ts", { "@/lib/supabase/client": { supabase: { auth: { getSession: async () => ({ data: { session: { access_token: "owner-A-token", user: { id: "owner-A" } } } }) } } } }, { fetch: async (url, init) => { sent = { url, init }; return { ok: true }; } });
  await api.electronicsAdminFetch("owner-A", "/api/admin/electronics/projects", { method: "POST", body: "{}", headers: { Authorization: "Bearer other" } });
  assert.equal(sent.init.headers.get("Authorization"), "Bearer owner-A-token");
  assert.equal(sent.init.headers.get("Content-Type"), "application/json");
});
test("logout and cancelled account-bound operations do not send requests", async () => {
  let session = null;
  let requests = 0;
  const api = load("src/lib/electronics/api.ts", { "@/lib/supabase/client": { supabase: { auth: { getSession: async () => ({ data: { session } }) } } } }, { fetch: () => { requests++; } });
  await assert.rejects(api.electronicsAdminFetch("owner-A", "/api/admin/electronics/analyze"), /로그인/);
  session = { access_token: "A-token", user: { id: "owner-A" } };
  const controller = new AbortController(); controller.abort();
  await assert.rejects(api.electronicsAdminFetch("owner-A", "/api/admin/electronics/analyze", { signal: controller.signal }), error => error.name === "AbortError");
  assert.equal(requests, 0);
});
test("local project list excludes metadata that would crash rendering or assembly controls", () => {
  const good = { version: 1, id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", title: "draft", updatedAt: "2026-01-01T00:00:00Z", circuit: { components: [] }, boardOptions: { boards: 1, railMode: "split" }, completedSteps: [] };
  const bad = [ { ...good, title: {} }, { ...good, updatedAt: {} }, { ...good, completedSteps: {} }, { ...good, circuit: { components: null } }, { ...good, id: "../../B" } ];
  const storage = load("src/lib/electronics/storage.ts", { "./project-source": load("src/lib/electronics/project-source.ts"), "./engine": { createBoard: () => assert.fail("layout-free metadata should not create a board") } }, { localStorage: { getItem: key => { assert.equal(key, "cbt:electronics:v1:owner-A"); return JSON.stringify([good, ...bad]); } } });
  const projects = storage.readLocalProjects("owner-A");
  assert.equal(projects.length, 1); assert.equal(projects[0].title, "draft");
  assert.equal(storage.isSavedProjectMetadata({ ...good, completedSteps: "all" }), false);
});
