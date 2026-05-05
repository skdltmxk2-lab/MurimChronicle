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

  if (exams.length === 0) return null;

  return (
    <section className="mt-6">
      <div className="mb-3 text-sm font-black text-ink">관리자가 생성한 모의고사</div>
      <div className="grid gap-5 md:grid-cols-2">
        {exams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </div>
    </section>
  );
}
