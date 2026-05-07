import { Suspense } from "react";
import { StudentResultsList } from "@/components/exam/StudentResultsList";

export default function StudentResultsIndexPage() {
  return (
    <Suspense fallback={null}>
      <StudentResultsList />
    </Suspense>
  );
}
