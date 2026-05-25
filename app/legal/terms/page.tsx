import Link from "next/link";
import type { ReactNode } from "react";
import { LEGAL } from "@/lib/legal";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-black text-ink">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}

export const metadata = {
  title: "이용약관 | 루트편입",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/student/exams" className="text-xs font-black text-slate-500 hover:text-brand-700">
        ← 돌아가기
      </Link>
      <h1 className="mt-3 text-3xl font-black text-ink">이용약관</h1>
      <p className="mt-2 text-xs text-slate-500">
        시행일: {LEGAL.effectiveDate} · {LEGAL.serviceName}
      </p>

      <Section title="제1조 (목적)">
        <p>
          본 약관은 {LEGAL.operator}(대표 {LEGAL.representative}, 이하 &ldquo;운영자&rdquo;)이(가) 제공하는 {LEGAL.serviceName}(이하
          &ldquo;서비스&rdquo;) 이용과 관련하여 운영자와 이용자(회원)의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
        </p>
      </Section>

      <Section title="제2조 (정의)">
        <ul className="list-disc space-y-1 pl-5">
          <li>&ldquo;회원&rdquo;: 본 약관에 동의하고 가입하여 서비스를 이용하는 자.</li>
          <li>&ldquo;무료 서비스&rdquo;: 별도 결제 없이 이용 가능한 기능(데일리·단원별·과목별·취약유형 모의고사, 커뮤니티 등).</li>
          <li>&ldquo;유료 서비스(PRO)&rdquo;: 결제 후 이용 가능한 기능(실전 모의고사, AI 문제검색, 30일 오답복습, 광고 제거 등).</li>
        </ul>
      </Section>

      <Section title="제3조 (약관의 게시와 개정)">
        <p>
          운영자는 본 약관을 서비스 화면에 게시합니다. 운영자는 관련 법령을 위반하지 않는 범위에서 약관을 개정할 수
          있으며, 개정 시 적용일자와 사유를 명시하여 사전 공지합니다. 이용자가 개정 약관에 동의하지 않을 경우 이용을
          중단하고 탈퇴할 수 있습니다.
        </p>
      </Section>

      <Section title="제4조 (서비스의 제공 및 변경)">
        <p>
          운영자는 편입수학 학습을 위한 문제 풀이·모의고사·해설·AI 기능 등을 제공합니다. 운영자는 운영·기술상 필요에
          따라 서비스의 내용을 변경하거나 일부를 중단할 수 있으며, 중대한 변경 시 사전에 공지합니다.
        </p>
      </Section>

      <Section title="제5조 (이용계약의 체결)">
        <p>
          이용계약은 이용자가 본 약관 및 개인정보처리방침에 동의하고 가입을 신청한 후, 이메일 인증 등 운영자가 정한
          절차를 완료함으로써 성립합니다. 타인의 정보를 도용하거나 허위 정보를 기재한 경우 이용이 제한될 수 있습니다.
        </p>
      </Section>

      <Section title="제6조 (회원의 의무 및 금지행위)">
        <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>타인의 개인정보 도용, 계정 공유·양도</li>
          <li>커뮤니티·채팅에서의 욕설·비방·음란물·스팸·광고성 게시물 작성</li>
          <li>서비스의 문제·해설 등 콘텐츠를 무단 복제·배포·판매하는 행위</li>
          <li>비정상적인 방법으로 서비스에 접근하거나 운영을 방해하는 행위</li>
        </ul>
        <p>위반 시 운영자는 게시물 삭제, 이용 제한, 계정 정지 등의 조치를 취할 수 있습니다.</p>
      </Section>

      <Section title="제7조 (유료 서비스 및 결제·환불)">
        <ul className="list-disc space-y-1 pl-5">
          <li>PRO는 월 정기 구독 방식으로 제공되며, 결제 금액·혜택은 요금제 페이지에 게시된 바에 따릅니다.</li>
          <li>
            환불은 「콘텐츠 이용자 보호지침」 및 관련 법령에 따릅니다. 결제 후 콘텐츠를 이용하지 않은 경우 청약철회가
            가능하며, 이미 이용한 부분에 대해서는 환불이 제한될 수 있습니다.
          </li>
          <li>구체적인 결제·환불 절차는 결제 수단 도입 시 별도 안내합니다.</li>
        </ul>
      </Section>

      <Section title="제8조 (콘텐츠 및 지식재산권)">
        <p>
          서비스에 게시된 문제·해설·디자인 등 모든 콘텐츠에 대한 지식재산권은 운영자 또는 정당한 권리자에게 있으며,
          이용자는 개인적 학습 목적 외에 이를 복제·전송·배포할 수 없습니다. 회원이 커뮤니티·채팅에 게시한 게시물의
          책임은 작성자에게 있습니다.
        </p>
      </Section>

      <Section title="제9조 (서비스 중단 및 면책)">
        <p>
          운영자는 천재지변, 시스템 장애, 제3자(클라우드·AI·결제대행 등) 서비스의 중단 등 불가항력적 사유로 서비스를
          일시 중단할 수 있으며, 이로 인한 손해에 대해 고의 또는 중대한 과실이 없는 한 책임을 지지 않습니다. AI 기능이
          제공하는 풀이·분석은 참고용이며 정확성을 보증하지 않습니다.
        </p>
      </Section>

      <Section title="제10조 (회원 탈퇴 및 이용 제한)">
        <p>
          회원은 서비스 내 &lsquo;회원탈퇴&rsquo; 기능을 통해 언제든지 탈퇴할 수 있습니다. 운영자는 회원이 본 약관을
          위반한 경우 사전 통지 후(긴급한 경우 사후 통지) 이용을 제한하거나 계약을 해지할 수 있습니다.
        </p>
      </Section>

      <Section title="제11조 (분쟁해결 및 준거법)">
        <p>
          본 약관은 {LEGAL.jurisdiction} 법령에 따라 해석되며, 서비스 이용과 관련한 분쟁에 대해서는 관련 법령상의
          관할 법원을 제1심 관할 법원으로 합니다.
        </p>
      </Section>

      <Section title="부칙">
        <p>본 약관은 {LEGAL.effectiveDate}부터 시행합니다. 문의: {LEGAL.contactEmail}</p>
      </Section>

      <p className="mt-10 text-xs text-slate-400">
        ※ 본 문서는 표준 양식을 기반으로 한 초안이며, 실제 게시 전 운영주체 정보 보완 및 법률 검토를 권장합니다.
      </p>
    </main>
  );
}
