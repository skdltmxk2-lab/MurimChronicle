import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/requireUser";
import { createHomeworkUpload, homeworkErrorResponse, readHomeworkBody } from "@/lib/homework/server";
export async function POST(request: Request) {
  const auth = await requireUser(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await createHomeworkUpload(auth.supabase, auth.userId, await readHomeworkBody(request))); } catch (error) { return homeworkErrorResponse(error); }
}
