import { ResultViewer } from "@/components/exam/ResultViewer";

type PageProps = {
  params: Promise<{
    attemptId: string;
  }>;
};

export default async function StudentResultPage({ params }: PageProps) {
  const { attemptId } = await params;
  return <ResultViewer attemptId={attemptId} />;
}
