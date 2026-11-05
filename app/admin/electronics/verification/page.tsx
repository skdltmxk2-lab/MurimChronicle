import type { Metadata } from "next";
import { CourseVerificationPanel } from "@/components/electronics/CourseVerificationPanel";
import report from "@/lib/electronics/course-verification-report.json";
import type { CourseVerificationReport } from "@/lib/electronics/course-verification";

export const metadata: Metadata = { title: "전체 실험 검증 · 전자공학 실험실", robots: { index: false, follow: false } };
export default function CourseVerificationPage() {
  return <CourseVerificationPanel report={report as CourseVerificationReport} />;
}
