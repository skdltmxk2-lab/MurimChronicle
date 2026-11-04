import { NextResponse } from "next/server";
import { getSiteDesign } from "@/lib/design/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const design = await getSiteDesign();
  return NextResponse.json({ ok: true, design }, { headers: { "Cache-Control": "no-store" } });
}
