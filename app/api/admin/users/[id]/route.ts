import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const FALLBACK_ADMIN_PASSWORD = "routeroute";

function checkAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD || FALLBACK_ADMIN_PASSWORD;
  const provided = request.headers.get("x-admin-password");
  return Boolean(provided) && provided === expected;
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!checkAdmin(request)) {
    return NextResponse.json({ ok: false, message: "관리자 권한이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ ok: false, message: "사용자 ID가 필요합니다." }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
