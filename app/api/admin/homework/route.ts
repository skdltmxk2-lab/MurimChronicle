import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { homeworkErrorResponse, listHomeworkAdmin } from "@/lib/homework/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await listHomeworkAdmin(auth.supabase), { headers: { "Cache-Control": "private, no-store" } }); } catch (error) { return homeworkErrorResponse(error); }
}
