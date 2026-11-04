import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { readRecognitionRequest, recognizeCircuit, RecognitionError } from "@/lib/electronics/recognition";

export const runtime = "nodejs";
export const maxDuration = 180;

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const input = await readRecognitionRequest(request);
    const result = await recognizeCircuit(input, COMPONENT_CATALOG);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof RecognitionError ? error.status : 503;
    const message = error instanceof RecognitionError ? error.message : "분석 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    return NextResponse.json({ ok: false, message }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
