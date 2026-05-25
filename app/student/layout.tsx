import type { ReactNode } from "react";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { StudentShell } from "@/components/layout/StudentShell";
import { StudentFooter } from "@/components/layout/StudentFooter";
import { SubscriptionInquiryModal } from "@/components/layout/SubscriptionInquiryModal";
import { UserNotifications } from "@/components/layout/UserNotifications";

export default function StudentLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      <StudentHeader />
      <div className="flex-1">
        <StudentShell>{children}</StudentShell>
      </div>
      <StudentFooter />
      <SubscriptionInquiryModal />
      <UserNotifications />
    </div>
  );
}
