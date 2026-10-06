import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createGeneratedHomeworkMaterial, homeworkErrorResponse, readHomeworkBody } from "@/lib/homework/server";
export const maxDuration = 60;
export async function POST(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try { return NextResponse.json(await createGeneratedHomeworkMaterial(auth.supabase,auth.userId,await readHomeworkBody(request))); } catch (error) { return homeworkErrorResponse(error); }
}
