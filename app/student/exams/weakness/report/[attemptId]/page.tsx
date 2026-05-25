import { WeaknessReportClient } from "@/components/student/WeaknessReportClient";

export const metadata = {
  title: "취약유형 모의고사 리포트 · 루트편입",
};

export default async function WeaknessReportPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  return <WeaknessReportClient attemptId={attemptId} />;
}
