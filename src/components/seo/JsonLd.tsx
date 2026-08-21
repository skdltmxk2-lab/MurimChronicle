import { SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * 발행 주체(Organization) + 사이트(WebSite) 구조화 데이터.
 *
 * 넣지 않는 것과 그 이유:
 * - 문항·학생·모의고사 수: @/lib/stats/displayed 의 표시용 보정치라 사실이 아니다.
 *   (가입자 수는 2배, 문항 수는 7,500+ 하한이 걸려 있다)
 * - Course / EducationalOrganization: 강의 콘텐츠가 전부 로그인 뒤에 있어 크롤러가 못 본다.
 *   운영주체도 비사업자 개인이라 교육기관을 선언하면 없는 법인을 만들어내는 셈이 된다.
 * - FAQPage: 페이지에 실제로 보이는 FAQ가 없다. 마크업만 넣는 건 구글 가이드라인 위반.
 * - Offer: 결제 연동이 없어 살 수 없는 상품을 판매 중이라고 선언하게 된다.
 * - AggregateRating / Review: 후기 데이터가 없다.
 * - SearchAction: /student/search 는 로그인 전용 이미지 검색이라 쿼리 URL이 없다.
 * - email / representative: SEO상 쓰이는 곳이 없는데, 전 라우트의 ld+json에 박히면
 *   기계가 긁기 좋은 형태가 된다. 푸터·약관에 이미 사람이 읽을 형태로 있으므로 생략한다.
 *   (LEGAL.representative 는 '대표·개인정보 보호책임자'이지 founder 라는 근거가 없어
 *    founder 로도 쓰지 않는다)
 */
const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const GRAPH = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        "@id": `${SITE_URL}/#logo`,
        url: `${SITE_URL}/icon.svg`,
        contentUrl: `${SITE_URL}/icon.svg`,
        caption: SITE_NAME,
      },
      areaServed: "KR",
      knowsLanguage: "ko",
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: "ko-KR",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
};

/**
 * JSON.stringify 는 `<`, U+2028, U+2029 를 이스케이프하지 않는다.
 * 지금 값들은 안전하지만, 나중에 문자열에 `</script` 가 섞이면 블록이 깨지고
 * 그대로 XSS 경로가 된다. 값이 아니라 직렬화 단계에서 막아 둔다.
 */
function serializeJsonLd(graph: unknown): string {
  return JSON.stringify(graph)
    .replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

/** 전 라우트가 상속하도록 app/layout.tsx 의 <body> 안에서 한 번만 렌더한다. */
export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(GRAPH) }}
    />
  );
}
