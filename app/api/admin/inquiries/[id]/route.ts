import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";

const ALLOWED_STATUS = new Set(["open", "in_progress", "resolved", "closed"]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = (await request.json().catch(() => null)) as {
    status?: string;
    adminReply?: string;
  } | null;
  if (!body) {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof body.status === "string") {
    if (!ALLOWED_STATUS.has(body.status)) {
      return NextResponse.json({ ok: false, message: "잘못된 상태값입니다." }, { status: 400 });
    }
    updates.status = body.status;
  }
  if (typeof body.adminReply === "string") {
    updates.admin_reply = body.adminReply.trim() || null;
    updates.admin_reply_at = body.adminReply.trim() ? new Date().toISOString() : null;
  }

  const { error } = await auth.supabase.from("inquiries").update(updates).eq("id", id);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
