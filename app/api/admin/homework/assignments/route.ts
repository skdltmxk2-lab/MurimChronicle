import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createHomeworkAssignment, homeworkErrorResponse, readHomeworkBody } from "@/lib/homework/server";
export async function POST(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await createHomeworkAssignment(auth.supabase, auth.userId, await readHomeworkBody(request))); } catch (error) { return homeworkErrorResponse(error); }
}
