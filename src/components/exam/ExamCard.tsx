import Link from "next/link";
import type { MockExam } from "@/types/exam";

export function ExamCard({ exam }: { exam: MockExam }) {
  const minutes = Math.floor(exam.timeLimitSec / 60);

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-soft">
      <div className="mb-4 flex flex-wrap gap-2">
        {exam.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700">
            {tag}
          </span>
        ))}
      </div>
      <h2 className="text-xl font-black tracking-normal text-ink">{exam.title}</h2>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">{exam.description}</p>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4 text-sm">
        <div>
          <div className="text-xs font-semibold text-slate-500">문항</div>
          <div className="mt-1 font-black text-ink">{exam.problems.length}문항</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">시간</div>
          <div className="mt-1 font-black text-ink">{minutes}분</div>
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500">방식</div>
          <div className="mt-1 font-black text-ink">선택모고</div>
        </div>
      </div>
      <Link
        href={`/student/exams/${exam.id}`}
        className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-brand-600 px-4 py-3 text-sm font-black text-white transition hover:bg-brand-700"
      >
        시험 시작
      </Link>
    </article>
  );
}
