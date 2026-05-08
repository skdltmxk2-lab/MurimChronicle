import { WeaknessReportClient } from "@/components/student/WeaknessReportClient";

export const metadata = {
  title: "취약유형 모의고사 리포트 · 루트매쓰 CBT",
};

export default async function WeaknessReportPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <WeaknessReportClient attemptId={attemptId} />;
}
