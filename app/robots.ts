import type { MetadataRoute } from "next";

const SITE_URL = "https://routrans.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 학생 개인영역·관리자·API·인증 콜백은 색인 제외
        disallow: ["/admin", "/api", "/auth", "/student/profile", "/student/results", "/student/wrong-questions"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
