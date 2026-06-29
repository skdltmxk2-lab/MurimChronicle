// 검토 포트 서버 - localhost:3001
// 답지 없는 PDF 문제를 검토 → 푸쉬 워크플로
// 큐 디렉토리: scripts/_review_queue/<name>.json
// 사용: node scripts/review_server.mjs

import { createServer } from "node:http";
import { readFile, readdir, writeFile, unlink, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const QUEUE_DIR = resolve(here, "_review_queue");
const HTML_PATH = resolve(here, "review_ui.html");

const envText = await readFile(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split(/\r?\n/).filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => { const [k, ...r] = l.split("="); return [k.trim(), r.join("=").trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const PORT = 3001;

function send(res, code, body, type = "application/json") {
  res.writeHead(code, {
    "content-type": type + "; charset=utf-8",
    "access-control-allow-origin": "*",
  });
  res.end(typeof body === "string" || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const text = Buffer.concat(chunks).toString("utf8");
  return text ? JSON.parse(text) : {};
}

async function listQueue() {
  try {
    const files = await readdir(QUEUE_DIR);
    const items = [];
    for (const f of files) {
      if (!f.endsWith(".json")) continue;
      const p = join(QUEUE_DIR, f);
      const st = await stat(p);
      const data = JSON.parse(await readFile(p, "utf8"));
      items.push({
        name: f.replace(/\.json$/, ""),
        title: data.title || f,
        schoolSlug: data.schoolSlug || "",
        year: data.year || "",
        count: (data.problems || []).length,
        mtime: st.mtimeMs,
      });
    }
    items.sort((a, b) => b.mtime - a.mtime);
    return items;
  } catch (e) {
    if (e.code === "ENOENT") return [];
    throw e;
  }
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    if (req.method === "OPTIONS") return send(res, 200, "", "text/plain");

    // 정적: HTML
    if (req.method === "GET" && (path === "/" || path === "/index.html")) {
      const html = await readFile(HTML_PATH, "utf8");
      return send(res, 200, html, "text/html");
    }

    // GET /api/queue — 목록
    if (req.method === "GET" && path === "/api/queue") {
      return send(res, 200, await listQueue());
    }

    // GET /api/queue/:name — 상세
    const detail = path.match(/^\/api\/queue\/([^/]+)$/);
    if (req.method === "GET" && detail) {
      const file = join(QUEUE_DIR, detail[1] + ".json");
      const data = JSON.parse(await readFile(file, "utf8"));
      return send(res, 200, data);
    }

    // PUT /api/queue/:name — 저장
    if (req.method === "PUT" && detail) {
      const file = join(QUEUE_DIR, detail[1] + ".json");
      const body = await readBody(req);
      await writeFile(file, JSON.stringify(body, null, 2), "utf8");
      return send(res, 200, { ok: true });
    }

    // DELETE /api/queue/:name — 버리기
    if (req.method === "DELETE" && detail) {
      const file = join(QUEUE_DIR, detail[1] + ".json");
      await unlink(file);
      return send(res, 200, { ok: true });
    }

    // POST /api/push/:name — Supabase 푸쉬 후 삭제
    const push = path.match(/^\/api\/push\/([^/]+)$/);
    if (req.method === "POST" && push) {
      const file = join(QUEUE_DIR, push[1] + ".json");
      const body = await readBody(req).catch(() => ({}));
      const data = JSON.parse(await readFile(file, "utf8"));
      const problems = data.problems || [];
      if (!problems.length) return send(res, 400, { error: "no problems" });

      const rows = problems.map((p) => ({
        id: p.id,
        subject: p.subject,
        unit: p.unit,
        concept: p.concept,
        difficulty: p.difficulty,
        source_type: p.source_type || "imported",
        question: p.question,
        content_type: "latex",
        question_image: p.question_image ?? null,
        options: p.options,
        correct_option_id: String(p.correct_option_id ?? p.answer),
        explanation: p.explanation || "",
        explanation_content_type: "latex",
        explanation_image: p.explanation_image ?? null,
        tags: p.tags || [],
        created_at: p.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await sb.from("questions").upsert(rows, { onConflict: "id" });
      if (error) return send(res, 500, { error: error.message });

      if (body.keep !== true) await unlink(file);
      return send(res, 200, { ok: true, inserted: rows.length });
    }

    return send(res, 404, { error: "not found", path });
  } catch (e) {
    return send(res, 500, { error: e.message, stack: e.stack });
  }
});

server.listen(PORT, () => {
  console.log(`\n검토 포트 서버: http://localhost:${PORT}`);
  console.log(`큐 디렉토리: ${QUEUE_DIR}`);
  console.log(`종료: Ctrl+C\n`);
});
