import { NextResponse, after } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { createHomeworkMaterial, homeworkErrorResponse, loadHomeworkSettings, readHomeworkBody } from "@/lib/homework/server";
import { processHomeworkReference } from "@/lib/homework/processor";
export const maxDuration = 300;
export async function POST(request: Request) {
  const auth = await requireAdmin(request); if (!auth.ok) return auth.response;
  try {
    const result = await createHomeworkMaterial(auth.supabase, auth.userId, await readHomeworkBody(request));
    if (process.env.GEMINI_API_KEY && (await loadHomeworkSettings(auth.supabase)).aiEnabled) after(() => processHomeworkReference(auth.supabase, result.material.id));
    return NextResponse.json(result);
  } catch (error) { return homeworkErrorResponse(error); }
}
