import type { ReactNode } from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";

export default function AdminLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <AdminHeader />
      {children}
    </div>
  );
}
