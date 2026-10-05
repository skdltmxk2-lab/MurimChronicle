import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { homeworkErrorResponse, readHomeworkBody, saveHomeworkSettings } from "@/lib/homework/server";
export async function PATCH(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await saveHomeworkSettings(auth.supabase, await readHomeworkBody(request))); } catch (error) { return homeworkErrorResponse(error); }
}
