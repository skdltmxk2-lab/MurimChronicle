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
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('cbt:theme');if(t==='dark'||(!t&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();"
          }}
        />
      </head>
      <body>
        <ClientAuthWrapper>{children}</ClientAuthWrapper>
      </body>
    </html>
  );
}
