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
    .from("direct_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", auth.userId);
  if (error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
