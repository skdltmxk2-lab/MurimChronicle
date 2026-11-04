import { NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { DEFAULT_SITE_DESIGN, isSiteDesign } from "@/lib/design/presets";
import { SITE_DESIGN_CACHE_TAG, SITE_DESIGN_SETTING_KEY } from "@/lib/design/server";

export const dynamic = "force-dynamic";

function json(body: { ok: true; design: string } | { ok: false; message: string }, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      auth.response.headers.set("Cache-Control", "no-store");
      return auth.response;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const { data, error } = await auth.supabase
        .from("app_settings")
        .select("value")
        .eq("key", SITE_DESIGN_SETTING_KEY)
        .abortSignal(controller.signal)
        .maybeSingle();
      if (error) return json({ ok: false, message: "현재 디자인을 불러오지 못했습니다. 다시 시도해 주세요." }, 500);
      return json({ ok: true, design: isSiteDesign(data?.value) ? data.value : DEFAULT_SITE_DESIGN });
    } finally {
      clearTimeout(timer);
    }
  } catch {
    return json({ ok: false, message: "현재 디자인을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." }, 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) {
      auth.response.headers.set("Cache-Control", "no-store");
      return auth.response;
    }

    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body) ||
        Object.keys(body).length !== 1 || !("design" in body) || !isSiteDesign(body.design)) {
      return json({ ok: false, message: "디자인은 Coral, Terrazzo, Console 중 하나를 선택해 주세요." }, 400);
    }

    const design = body.design;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      const { data, error } = await auth.supabase
        .from("app_settings")
        .upsert({ key: SITE_DESIGN_SETTING_KEY, value: design, updated_at: new Date().toISOString() }, { onConflict: "key" })
        .select("value")
        .abortSignal(controller.signal)
        .single();
      if (error || data?.value !== design) {
        return json({ ok: false, message: "디자인 저장을 확인하지 못했습니다. 다시 불러온 뒤 시도해 주세요." }, 500);
      }
    } finally {
      clearTimeout(timer);
    }

    revalidateTag(SITE_DESIGN_CACHE_TAG);
    revalidatePath("/", "layout");
    return json({ ok: true, design });
  } catch {
    return json({ ok: false, message: "디자인 저장을 확인하지 못했습니다. 잠시 후 다시 불러와 주세요." }, 500);
  }
}
