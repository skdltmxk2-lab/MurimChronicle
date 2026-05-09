// 특정 이메일을 수동으로 인증 완료 처리.
// 사용법: node scripts/_confirm_email.mjs <email>
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(resolve(here, "..", ".env.local"), "utf8");
const env = Object.fromEntries(envText.split(/\r?\n/).filter(l=>l&&l.includes("=")).map(l=>{const[k,...r]=l.split("=");return[k.trim(),r.join("=").trim()];}));
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const email = process.argv[2];
if (!email) { console.error("이메일 인자 필요"); process.exit(1); }

// Admin API로 사용자 찾기 (페이지네이션)
let target = null;
for (let page = 1; page <= 50 && !target; page++) {
  const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
  if (error) { console.error(error.message); process.exit(1); }
  target = data.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
  if (!data.users.length || data.users.length < 200) break;
}
if (!target) { console.error(`${email} 사용자 없음`); process.exit(1); }

console.log(`찾음: ${target.id}  email_confirmed_at=${target.email_confirmed_at ?? "없음"}`);

const { data: updated, error: upErr } = await sb.auth.admin.updateUserById(target.id, {
  email_confirm: true
});
if (upErr) { console.error("업데이트 실패:", upErr.message); process.exit(1); }
console.log(`✅ 인증 완료 처리: ${updated.user.email}  email_confirmed_at=${updated.user.email_confirmed_at}`);
