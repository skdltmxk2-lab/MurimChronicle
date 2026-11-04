"use client";

import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { isSiteDesign, SITE_DESIGNS, type SiteDesign } from "@/lib/design/presets";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";

type DesignContextValue = {
  design: SiteDesign;
  publishedDesign: SiteDesign;
  previewing: boolean;
  previewDesign: (design: SiteDesign) => void;
  cancelPreview: () => void;
  acceptPublished: (design: SiteDesign) => void;
  syncPublished: (design: SiteDesign) => void;
};

const DesignContext = createContext<DesignContextValue | null>(null);

export function DesignProvider({ initialDesign, children }: { initialDesign: SiteDesign; children: ReactNode }) {
  const { user, authChecked } = useAuth();
  const revision = useRef(0);
  const refreshSequence = useRef(0);
  const [publishedDesign, setPublishedDesign] = useState(initialDesign);
  const [preview, setPreview] = useState<SiteDesign | null>(null);
  const design = preview ?? publishedDesign;
  const syncPublished = useCallback((next: SiteDesign) => {
    if (isSiteDesign(next)) setPublishedDesign(next);
  }, []);
  const previewDesign = useCallback((next: SiteDesign) => {
    if (isAdminUser(user) && isSiteDesign(next)) setPreview(next);
  }, [user]);
  const cancelPreview = useCallback(() => setPreview(null), []);
  const acceptPublished = useCallback((next: SiteDesign) => {
    if (!isSiteDesign(next)) return;
    revision.current += 1;
    refreshSequence.current += 1;
    setPublishedDesign(next);
    setPreview(null);
  }, []);

  useEffect(() => syncPublished(initialDesign), [initialDesign, syncPublished]);
  useEffect(() => {
    if (authChecked && !isAdminUser(user)) setPreview(null);
  }, [authChecked, user]);
  useEffect(() => {
    document.documentElement.dataset.design = design;
    if (preview) document.documentElement.dataset.designPreview = "true";
    else delete document.documentElement.dataset.designPreview;
  }, [design, preview]);

  useEffect(() => {
    let active = true;
    const requests = new Set<AbortController>();
    async function refresh() {
      if (document.visibilityState === "hidden") return;
      const controller = new AbortController();
      const startedAtRevision = revision.current;
      const sequence = ++refreshSequence.current;
      requests.add(controller);
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch("/api/site-design", { cache: "no-store", signal: controller.signal });
        if (!response.ok) return;
        const result: { ok?: boolean; design?: unknown } = await response.json();
        if (active && revision.current === startedAtRevision && sequence === refreshSequence.current && result.ok && isSiteDesign(result.design)) syncPublished(result.design);
      } catch {
        // Keep the last confirmed design when the network is unavailable.
      } finally {
        clearTimeout(timeout);
        requests.delete(controller);
      }
    }
    void refresh();
    const timer = setInterval(() => void refresh(), 60000);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      for (const request of requests) request.abort();
    };
  }, [syncPublished]);

  const value = useMemo(() => ({ design, publishedDesign, previewing: preview !== null, previewDesign, cancelPreview, acceptPublished, syncPublished }), [design, publishedDesign, preview, previewDesign, cancelPreview, acceptPublished, syncPublished]);
  const name = SITE_DESIGNS.find(item => item.id === design)?.name ?? design;
  return (
    <DesignContext.Provider value={value}>
      {preview !== null && (
        <aside className="design-preview-bar" aria-label="디자인 미리보기">
          <p><strong>{name}</strong> 디자인 미리보기</p>
          <span>사이트에 저장되기 전입니다.</span>
          <Link href="/admin/appearance">디자인 설정</Link>
          <button type="button" onClick={cancelPreview}>미리보기 종료</button>
        </aside>
      )}
      {children}
    </DesignContext.Provider>
  );
}

export function useSiteDesign() {
  const context = useContext(DesignContext);
  if (!context) throw new Error("useSiteDesign must be used within DesignProvider");
  return context;
}
