"use client";

import { useEffect, useState } from "react";
import { ExamCard } from "@/components/exam/ExamCard";
import { examRepo } from "@/lib/exams/generatedExamRepository";
import type { GeneratedExam } from "@/types/generatedExam";

export function GeneratedExamCards() {
  const [exams, setExams] = useState<GeneratedExam[]>([]);

  useEffect(() => {
    examRepo.listGenerated().then(setExams);
  }, []);

  // weakness 시험은 사용자 본인이 생성한 취약유형 모의고사라서
  // "관리자가 생성한 모의고사" 섹션에 표시하면 안 된다.
  const adminGenerated = exams.filter(
    (e) => !(e.tags ?? []).includes("weakness")
  );
  if (adminGenerated.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 text-sm font-black text-ink">관리자가 생성한 모의고사</div>
      <div className="grid gap-5 md:grid-cols-2">
        {adminGenerated.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </section>
  );
}
