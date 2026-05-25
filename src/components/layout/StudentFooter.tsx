import Link from "next/link";
import { LEGAL } from "@/lib/legal";

export function StudentFooter() {
  return (
    <footer className="mt-10 border-t border-line bg-white/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-5 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-xs text-slate-400">
          © {new Date().getFullYear()} {LEGAL.serviceName}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs font-bold text-slate-500">
          <Link href="/legal/terms" className="hover:text-brand-700">
            이용약관
          </Link>
          <Link href="/legal/privacy" className="font-black text-slate-600 hover:text-brand-700">
            개인정보처리방침
          </Link>
          <a href={`mailto:${LEGAL.contactEmail}`} className="hover:text-brand-700">
            문의: {LEGAL.contactEmail}
          </a>
        </nav>
      </div>
    </footer>
  );
}
