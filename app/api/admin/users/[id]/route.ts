import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const ALLOWED_TIERS = new Set(["free", "go", "plus", "pro", "max"]);

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "사용자 ID가 필요합니다." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as
    | { tier?: string; isAdmin?: boolean }
    | null;
  if (!body) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof body.tier === "string") {
    if (!ALLOWED_TIERS.has(body.tier)) {
      return NextResponse.json(
        { ok: false, message: `등급은 free/go/plus/pro/max 중 하나여야 합니다.` },
        { status: 400 }
      );
    }
    updates.tier = body.tier;
  }
  if (typeof body.isAdmin === "boolean") {
    // 본인이 본인 admin 권한을 해제하는 것은 금지(자기-락아웃 방지)
    if (body.isAdmin === false && id === auth.userId) {
      return NextResponse.json(
        { ok: false, message: "본인 계정의 관리자 권한은 해제할 수 없습니다." },
        { status: 400 }
      );
    }
    updates.is_admin = body.isAdmin;
  }
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: false, message: "변경할 항목이 없습니다." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("profiles").update(updates).eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "사용자 ID가 필요합니다." }, { status: 400 });
  }

  // 본인 계정 자기 삭제 방지
  if (id === auth.userId) {
    return NextResponse.json(
      { ok: false, message: "본인 계정은 이 화면에서 삭제할 수 없습니다." },
      { status: 400 }
    );
  }

  const { error } = await auth.supabase.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
