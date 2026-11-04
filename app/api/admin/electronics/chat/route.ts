import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { COMPONENT_CATALOG } from "@/lib/electronics/catalog";
import { answerElectronicsChat, ElectronicsChatError, readChatRequest } from "@/lib/electronics/chat";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return auth.response;
    const input = await readChatRequest(request, COMPONENT_CATALOG);
    const result = await answerElectronicsChat(input, COMPONENT_CATALOG, request.signal);
    return NextResponse.json({ ok: true, ...result }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof ElectronicsChatError ? error.status : 503;
    const message = error instanceof ElectronicsChatError ? error.message : "채팅 서비스를 사용할 수 없습니다. 잠시 후 다시 시도해 주세요.";
    const code = error instanceof ElectronicsChatError ? error.code : undefined;
    return NextResponse.json({ ok: false, message, ...(code ? { code } : {}) }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
