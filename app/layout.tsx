import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import { ClientAuthWrapper } from "@/components/layout/ClientAuthWrapper";
import "./globals.css";

const SITE_URL = "https://routrans.com";
const SITE_NAME = "루트편입";
const SITE_DESC =
  "편입수학·편입영어 CBT. 실제 1타강사 현장조교가 만든 5,000+ 문항, AI 풀이·검색·튜터, 취약유형 맞춤 모의고사까지. 가입 1분, 신용카드 불필요.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — 편입수학·편입영어 CBT`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESC,
  keywords: [
    "편입",
    "편입수학",
    "편입영어",
    "편입학원",
    "편입 모의고사",
    "편입 기출",
    "편입 단어",
    "CBT",
    "루트편입",
    "AI 편입",
  ],
  applicationName: SITE_NAME,
  authors: [{ name: "루트편입", url: SITE_URL }],
  creator: "루트편입",
  publisher: "루트편입",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — 편입수학·편입영어 CBT`,
    description: SITE_DESC,
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — 편입수학·편입영어 CBT`,
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  formatDetection: { email: false, address: false, telephone: false },
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
        <Analytics />
      </body>
    </html>
  );
}
