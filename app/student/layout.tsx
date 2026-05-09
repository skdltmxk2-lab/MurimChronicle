import type { ReactNode } from "react";
import { StudentHeader } from "@/components/layout/StudentHeader";
import { SubscriptionInquiryModal } from "@/components/layout/SubscriptionInquiryModal";
import { UserNotifications } from "@/components/layout/UserNotifications";

export default function StudentLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="min-h-screen">
      <StudentHeader />
      {children}
      <SubscriptionInquiryModal />
      <UserNotifications />
    </div>
  );
}
