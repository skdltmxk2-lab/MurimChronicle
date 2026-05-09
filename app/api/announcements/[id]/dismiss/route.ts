import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(request);
  if (!auth.ok) return auth.response;
  const { id } = await params;

  const { error } = await auth.supabase
    .from("announcement_reads")
    .upsert(
      { user_id: auth.userId, announcement_id: id, dismissed_at: new Date().toISOString() },
      { onConflict: "user_id,announcement_id" }
    );
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
