import type { ReactNode } from "react";
import { StudentHeader } from "@/components/layout/StudentHeader";

export default function StudentLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <StudentHeader />
      {children}
    </div>
  );
}
