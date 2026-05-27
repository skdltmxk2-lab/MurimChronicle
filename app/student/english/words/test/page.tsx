import { EnglishWordTestClient } from "@/components/english/EnglishWordTestClient";

export default async function EnglishWordTestPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const sp = await searchParams;
  const dayNum = sp.day != null ? Number(sp.day) : NaN;
  const day = Number.isFinite(dayNum) && dayNum >= 1 ? Math.floor(dayNum) : null;
  return <EnglishWordTestClient dayMode={day} />;
}
