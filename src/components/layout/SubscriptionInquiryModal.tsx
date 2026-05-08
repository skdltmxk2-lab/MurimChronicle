"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import type { UserTier } from "@/types/auth";

// 로그인/가입 액션이 set 하는 1회용 플래그. 모달이 뜨면 즉시 clear되어
// 같은 세션 동안 페이지 이동/새로고침으로는 다시 뜨지 않고,
// 로그아웃 후 다시 로그인하면 또 set되어 다시 뜬다.
const SHOW_FLAG_KEY = "cbt:promo:inquiry:show";
const KAKAO_OPEN_CHAT_URL = "https://open.kakao.com/o/sBAS3Yti";

export function setSubscriptionInquiryPending() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SHOW_FLAG_KEY, "1");
  } catch {
    // sessionStorage 쓰기 실패는 무시.
  }
}

type ModalContent = {
  title: string;
  description: React.ReactNode;
  ctaLabel: string;
};

// 등급별 모달 문구. pro/max는 모달 자체를 띄우지 않으므로 여기 포함 안 됨.
function contentForTier(tier: UserTier): ModalContent | null {
  if (tier === "free") {
    return {
      title: "요금제 가입 문의",
      description: (
        <>
          Go · Plus · Pro · Max 요금제 가입은
          <br />
          아래 오픈채팅으로 편하게 문의해 주세요.
        </>
      ),
      ctaLabel: "카카오톡 오픈채팅으로 문의하기",
    };
  }
  if (tier === "go" || tier === "plus") {
    return {
      title: "Pro 등급으로 성적 향상하세요",
      description: (
        <>
          성적 향상의 핵심,{" "}
          <span className="font-black text-brand-600">취약유형 모의고사</span>로
          <br />
          자주 틀리는 유형을 집중 공략해 보세요.
          <br />
          업그레이드는 아래 오픈채팅으로 문의해 주세요.
        </>
      ),
      ctaLabel: "Pro 업그레이드 문의하기",
    };
  }
  return null;
}

export function SubscriptionInquiryModal() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setOpen(false);
      return;
    }
    if (typeof window === "undefined") return;
    // pro/max 등급은 팝업 노출 안 함. 플래그가 set돼 있어도 그대로 비움.
    const tier = (user.tier ?? "free") as UserTier;
    if (tier === "pro" || tier === "max") {
      try {
        window.sessionStorage.removeItem(SHOW_FLAG_KEY);
      } catch {
        // 무시.
      }
      return;
    }
    let pending: string | null = null;
    try {
      pending = window.sessionStorage.getItem(SHOW_FLAG_KEY);
    } catch {
      pending = null;
    }
    if (pending === "1") {
      setOpen(true);
      // 모달이 마운트되어 보이는 순간 플래그를 비워, 같은 세션 동안
      // 페이지 이동마다 다시 뜨지 않게 한다.
      try {
        window.sessionStorage.removeItem(SHOW_FLAG_KEY);
      } catch {
        // 무시.
      }
    }
  }, [user]);

  function close() {
    setOpen(false);
  }

  if (!open || !user) return null;
  const tier = (user.tier ?? "free") as UserTier;
  const content = contentForTier(tier);
  if (!content) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscription-inquiry-title"
      onClick={close}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={close}
          aria-label="닫기"
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="size-4"
          >
            <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L8.94 10l-4.72 4.72a.75.75 0 1 0 1.06 1.06L10 11.06l4.72 4.72a.75.75 0 1 0 1.06-1.06L11.06 10l4.72-4.72a.75.75 0 0 0-1.06-1.06L10 8.94 5.28 4.22Z" />
          </svg>
        </button>

        <div className="bg-gradient-to-b from-brand-50 to-white px-7 pb-2 pt-9 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-600/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-7"
            >
              <path d="M12 3C6.5 3 2 6.58 2 11c0 2.62 1.6 4.95 4.07 6.42-.18.66-.65 2.4-.74 2.78-.12.47.17.46.36.34.15-.1 2.4-1.63 3.37-2.29.95.13 1.93.2 2.94.2 5.5 0 10-3.58 10-8s-4.5-7.45-10-7.45Z" />
            </svg>
          </div>
          <h2
            id="subscription-inquiry-title"
            className="text-xl font-black tracking-tight text-ink"
          >
            {content.title}
          </h2>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            {content.description}
          </p>
        </div>

        <div className="px-7 pb-7 pt-4">
          <a
            href={KAKAO_OPEN_CHAT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-5 py-3.5 text-sm font-black text-[#191600] transition hover:brightness-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
              aria-hidden="true"
            >
              <path d="M12 3C6.5 3 2 6.58 2 11c0 2.62 1.6 4.95 4.07 6.42-.18.66-.65 2.4-.74 2.78-.12.47.17.46.36.34.15-.1 2.4-1.63 3.37-2.29.95.13 1.93.2 2.94.2 5.5 0 10-3.58 10-8s-4.5-7.45-10-7.45Z" />
            </svg>
            {content.ctaLabel}
          </a>
          <button
            type="button"
            onClick={close}
            className="mt-2 w-full rounded-xl px-5 py-2.5 text-xs font-semibold text-slate-400 transition hover:text-slate-600"
          >
            나중에 할게요
          </button>
        </div>
      </div>
    </div>
  );
}
