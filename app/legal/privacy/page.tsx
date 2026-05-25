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
  title: "개인정보처리방침 | 루트편입",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-10">
      <Link href="/student/exams" className="text-xs font-black text-slate-500 hover:text-brand-700">
        ← 돌아가기
      </Link>
      <h1 className="mt-3 text-3xl font-black text-ink">개인정보처리방침</h1>
      <p className="mt-2 text-xs text-slate-500">
        시행일: {LEGAL.effectiveDate} · {LEGAL.serviceName}(이하 &ldquo;서비스&rdquo;)
      </p>

      <Section title="제1조 (총칙)">
        <p>
          {LEGAL.operator}(대표 {LEGAL.representative}, 이하 &ldquo;운영자&rdquo;)은(는) 이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등
          관련 법령을 준수합니다. 본 방침은 운영자가 제공하는 서비스 이용과 관련하여 어떤 개인정보를 어떤 목적으로
          수집·이용하며, 이를 어떻게 보호·관리하는지를 안내합니다.
        </p>
      </Section>

      <Section title="제2조 (수집하는 개인정보 항목)">
        <p>운영자는 회원가입 및 서비스 제공을 위해 다음의 개인정보를 수집합니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>필수: 이메일 주소, 비밀번호(암호화 저장), 이름(닉네임)</li>
          <li>가입 시 입력: 현재 학습 진도(과목), 학습 방법</li>
          <li>
            서비스 이용 과정에서 생성: 시험 응시·채점 기록, 정답/오답 및 정답률, 단원별 학습 통계, 이용 등급 및
            만료일, 최근 접속 시각
          </li>
          <li>커뮤니티 게시글·댓글·좋아요, 실시간 채팅 메시지, 1:1 문의 내용</li>
          <li>AI 문제검색 이용 시: 이용자가 업로드한 문제 이미지 및 그로부터 추출된 텍스트, 이용 횟수</li>
          <li>자동 수집: 접속 로그, 쿠키, 기기·브라우저 정보, (광고 도입 시) 광고 식별자</li>
          <li>유료(PRO) 결제 시: 결제정보는 결제대행사(PG)를 통해 처리되며 운영자는 카드번호 등 민감정보를 저장하지 않습니다.</li>
        </ul>
      </Section>

      <Section title="제3조 (개인정보의 수집·이용 목적)">
        <ul className="list-disc space-y-1 pl-5">
          <li>회원 식별 및 본인 확인, 로그인 등 서비스 제공</li>
          <li>맞춤형 학습·취약유형 분석, 오답 복습 등 핵심 기능 제공</li>
          <li>커뮤니티·실시간 채팅 운영, 문의 응대</li>
          <li>유료 서비스(PRO) 제공 및 결제·정산</li>
          <li>서비스 개선, 부정 이용 방지, 통계 분석</li>
          <li>(광고 도입 시) 광고 노출 및 효과 측정</li>
        </ul>
      </Section>

      <Section title="제4조 (개인정보의 보유 및 이용기간)">
        <p>
          운영자는 원칙적으로 회원 탈퇴 시 지체 없이 개인정보를 파기합니다. 다만 관계 법령에 따라 일정 기간 보존이
          필요한 경우 해당 기간 동안 보관합니다.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래 등에서의 소비자보호에 관한 법률)</li>
          <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (동법)</li>
          <li>소비자 불만 또는 분쟁처리에 관한 기록: 3년 (동법)</li>
          <li>접속 로그 등 통신사실확인자료: 3개월 (통신비밀보호법)</li>
        </ul>
      </Section>

      <Section title="제5조 (개인정보의 제3자 제공)">
        <p>
          운영자는 이용자의 개인정보를 본 방침에 명시한 범위를 넘어 제3자에게 제공하지 않습니다. 단, 이용자가 사전에
          동의하거나 법령에 따라 요구되는 경우는 예외로 합니다.
        </p>
      </Section>

      <Section title="제6조 (개인정보 처리의 위탁 및 국외 이전)">
        <p>운영자는 안정적인 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁하며, 일부는 국외에서 처리됩니다.</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <b>Supabase Inc.</b> (미국 등): 회원 인증, 데이터베이스 및 파일 저장, 실시간 기능 — 회원정보·학습기록 보관
          </li>
          <li>
            <b>Google LLC</b> (미국 등): AI 문제검색 기능(Gemini API)에 한해 업로드한 문제 이미지 및 텍스트 처리
          </li>
          <li>(광고 도입 시) 광고 제휴사, (결제 도입 시) 결제대행사(PG)</li>
        </ul>
        <p>
          위탁받은 자는 위탁 목적 범위 내에서만 개인정보를 처리하며, 운영자는 관련 법령에 따라 안전하게 관리되도록
          감독합니다. AI 문제검색은 PRO 회원이 직접 이미지를 업로드해 이용하는 선택적 기능으로, 이용 시 위 국외
          처리에 동의하는 것으로 간주됩니다.
        </p>
      </Section>

      <Section title="제7조 (개인정보의 파기절차 및 방법)">
        <p>
          보유기간이 경과하거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구가 불가능한
          방법으로 영구 삭제하며, 출력물 등은 분쇄 또는 소각합니다. 회원은 서비스 내 &lsquo;회원탈퇴&rsquo; 기능으로
          직접 계정 및 학습기록 삭제를 요청할 수 있습니다.
        </p>
      </Section>

      <Section title="제8조 (이용자 및 법정대리인의 권리와 행사방법)">
        <p>
          이용자는 언제든지 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요구할 수 있으며, 회원탈퇴를 통해 동의를
          철회할 수 있습니다. 권리 행사는 아래 연락처로 요청할 수 있고, 운영자는 지체 없이 조치합니다. 만 14세 미만
          아동의 가입은 제한될 수 있습니다.
        </p>
      </Section>

      <Section title="제9조 (쿠키 등 자동 수집 장치)">
        <p>
          서비스는 로그인 유지 및 이용 분석을 위해 쿠키를 사용할 수 있습니다. 이용자는 브라우저 설정에서 쿠키 저장을
          거부할 수 있으나, 이 경우 일부 기능 이용이 제한될 수 있습니다. 광고 도입 시 광고 제휴사가 맞춤형 광고를 위해
          쿠키·식별자를 사용할 수 있습니다.
        </p>
      </Section>

      <Section title="제10조 (개인정보의 안전성 확보 조치)">
        <p>
          운영자는 비밀번호 암호화 저장, 접근권한 관리, 전송구간 암호화(HTTPS) 등 관리적·기술적 보호조치를 시행합니다.
        </p>
      </Section>

      <Section title="제11조 (개인정보 보호책임자)">
        <ul className="list-disc space-y-1 pl-5">
          <li>개인정보 보호책임자: {LEGAL.privacyOfficer}</li>
          <li>연락처(이메일): {LEGAL.contactEmail}</li>
        </ul>
        <p>개인정보 관련 문의·불만·피해구제는 위 연락처로 접수할 수 있습니다.</p>
      </Section>

      <Section title="제12조 (권익침해 구제 방법)">
        <p>
          개인정보 침해에 대한 신고·상담이 필요한 경우 아래 기관에 문의할 수 있습니다. 개인정보분쟁조정위원회
          (1833-6972), 개인정보침해신고센터 (118), 대검찰청 사이버수사과 (1301), 경찰청 사이버수사국 (182).
        </p>
      </Section>

      <Section title="제13조 (방침의 변경)">
        <p>
          본 방침은 법령·서비스 변경에 따라 개정될 수 있으며, 변경 시 서비스 내 공지를 통해 사전 고지합니다.
        </p>
      </Section>

      <p className="mt-10 text-xs text-slate-400">
        ※ 본 문서는 표준 양식을 기반으로 한 초안이며, 실제 게시 전 운영주체 정보 보완 및 법률 검토를 권장합니다.
      </p>
    </main>
  );
}
