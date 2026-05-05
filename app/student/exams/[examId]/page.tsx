import { StudentExamLoader } from "@/components/exam/StudentExamLoader";
import { mockExams } from "@/data/mockData";

type PageProps = {
  params: Promise<{
    examId: string;
  }>;
};

export function generateStaticParams() {
  return mockExams.map((exam) => ({
    examId: exam.id
  }));
}

export default async function StudentExamPage({ params }: PageProps) {
  const { examId } = await params;
  return <StudentExamLoader examId={examId} />;
}
