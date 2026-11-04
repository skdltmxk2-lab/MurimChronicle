import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export function StudentFooter() {
  return (
    <footer className="tz-footer">
      <div className="tz-footer__inner">
        <p className="tz-footer__copyright">
          © {new Date().getFullYear()} {LEGAL.serviceName}
        </p>
        <nav className="tz-footer__links">
          <Link href="/legal/terms" className="tz-footer__link">
            이용약관
          </Link>
          <Link href="/legal/privacy" className="tz-footer__link tz-footer__link--privacy">
            개인정보처리방침
          </Link>
          <a href={`mailto:${LEGAL.contactEmail}`} className="tz-footer__link">
            문의: {LEGAL.contactEmail}
          </a>
        </nav>
      </div>
    </footer>
  );
}
