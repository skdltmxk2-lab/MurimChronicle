import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { getHomeworkFile, homeworkErrorResponse } from "@/lib/homework/server";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const auth = await requireUser(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await getHomeworkFile(auth.supabase, auth.userId, new URL(request.url).searchParams), { headers: { "Cache-Control": "private, no-store" } }); } catch (error) { return homeworkErrorResponse(error); }
}
