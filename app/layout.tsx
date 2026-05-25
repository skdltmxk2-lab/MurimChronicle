import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ClientAuthWrapper } from "@/components/layout/ClientAuthWrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "루트편입",
  description: "편입수학 빈출 유형 및 취약 유형 맞춤 CBT"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ClientAuthWrapper>{children}</ClientAuthWrapper>
      </body>
    </html>
  );
}
