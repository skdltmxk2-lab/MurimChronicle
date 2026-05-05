import { ExamCard } from "@/components/exam/ExamCard";
import { GeneratedExamCards } from "@/components/exam/GeneratedExamCards";
import { mockExams } from "@/data/mockData";

export default function StudentExamsPage() {
  const totalProblems = mockExams.reduce((sum, exam) => sum + exam.problems.length, 0);

  return (
    <main className="mx-auto max-w-6xl px-5 py-8">
      <section className="mb-6 rounded-lg border border-line bg-white p-6 shadow-soft">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-600">Student CBT MVP</p>
        <div className="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black text-ink">시험 목록</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Supabase와 Gemini 연결 전 단계의 mockData 기반 MVP입니다. 시험을 선택하면 답안 저장,
              제출, 자동 채점, 결과와 해설 확인까지 이어집니다.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">시험</div>
              <div className="mt-1 text-xl font-black text-ink">{mockExams.length}</div>
            </div>
            <div className="rounded-md border border-line px-4 py-3">
              <div className="text-xs font-bold text-slate-500">문항</div>
              <div className="mt-1 text-xl font-black text-ink">{totalProblems}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {mockExams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} />
        ))}
      </section>
      <GeneratedExamCards />
    </main>
  );
}
