"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { adminFetch } from "@/lib/api/adminFetch";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { useSiteDesign } from "@/lib/design/DesignProvider";
import { DEFAULT_SITE_DESIGN, SITE_DESIGNS, isSiteDesign, type SiteDesign } from "@/lib/design/presets";

function designName(value: SiteDesign) {
  return SITE_DESIGNS.find((preset) => preset.id === value)?.name ?? value;
}

async function readDesignResponse(response: Response, fallback: string): Promise<SiteDesign> {
  const body: unknown = await response.json().catch(() => null);
  if (!body || typeof body !== "object") throw new Error(fallback);
  const result = body as { ok?: boolean; design?: unknown; message?: unknown };
  if (!response.ok || result.ok !== true || !isSiteDesign(result.design)) {
    throw new Error(typeof result.message === "string" ? result.message : fallback);
  }
  return result.design;
}

export function AdminAppearanceClient() {
  const { user, authChecked } = useAuth();
  const admin = authChecked && isAdminUser(user);
  const {
    design, publishedDesign, previewing,
    previewDesign, cancelPreview, acceptPublished, syncPublished,
  } = useSiteDesign();
  const [selected, setSelected] = useState<SiteDesign>(design ?? DEFAULT_SITE_DESIGN);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [publishError, setPublishError] = useState("");
  const [notice, setNotice] = useState("");
  const selectionTouched = useRef(previewing);
  const mounted = useRef(false);
  const requestSequence = useRef(0);
  const requestController = useRef<AbortController | null>(null);
  const savingRef = useRef(false);

  const loadAppearance = useCallback(async () => {
    if (!admin) return;
    const sequence = ++requestSequence.current;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setLoadError("");
    try {
      const response = await adminFetch("/api/admin/appearance", { signal: controller.signal });
      const current = await readDesignResponse(response, "현재 디자인을 불러오지 못했습니다. 다시 시도해 주세요.");
      if (!mounted.current || controller.signal.aborted || sequence !== requestSequence.current) return;
      syncPublished(current);
      if (!selectionTouched.current) setSelected(current);
    } catch (error) {
      if (!mounted.current || controller.signal.aborted || sequence !== requestSequence.current) return;
      setLoadError(error instanceof Error ? error.message : "현재 디자인을 불러오지 못했습니다.");
    } finally {
      if (mounted.current && sequence === requestSequence.current) setLoading(false);
    }
  }, [admin, syncPublished]);

  useEffect(() => {
    mounted.current = true;
    if (admin) void loadAppearance();
    return () => {
      mounted.current = false;
      requestSequence.current += 1;
      requestController.current?.abort();
    };
  }, [admin, loadAppearance]);

  function selectDesign(next: SiteDesign) {
    selectionTouched.current = true;
    setSelected(next);
    setPublishError("");
    setNotice("");
  }

  function previewSelection() {
    previewDesign(selected);
    setPublishError("");
    setNotice(`${designName(selected)} 디자인을 미리보고 있습니다. 다른 화면에서도 확인할 수 있습니다.`);
  }

  function endPreview() {
    cancelPreview();
    selectionTouched.current = true;
    setSelected(publishedDesign);
    setPublishError("");
    setNotice("미리보기를 종료하고 현재 사이트 디자인으로 돌아왔습니다.");
  }

  async function publishSelection() {
    if (!admin || savingRef.current || loading || loadError || selected === publishedDesign) return;
    savingRef.current = true;
    setSaving(true);
    setNotice("");
    setPublishError("");
    const target = selected;
    const sequence = ++requestSequence.current;
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    try {
      const response = await adminFetch("/api/admin/appearance", {
        method: "PATCH",
        body: JSON.stringify({ design: target }),
        signal: controller.signal,
      });
      const applied = await readDesignResponse(response, "디자인을 적용하지 못했습니다. 다시 시도해 주세요.");
      if (!mounted.current || controller.signal.aborted || sequence !== requestSequence.current) return;
      acceptPublished(applied);
      setSelected(applied);
      setNotice(`${designName(applied)} 디자인을 사이트 전체에 적용했습니다.`);
    } catch (error) {
      if (!mounted.current || controller.signal.aborted || sequence !== requestSequence.current) return;
      setPublishError(error instanceof Error ? error.message : "디자인을 적용하지 못했습니다.");
    } finally {
      savingRef.current = false;
      if (mounted.current && sequence === requestSequence.current) setSaving(false);
    }
  }

  if (!authChecked) return null;
  if (!admin) {
    return (
      <main className="design-picker">
        <section className="design-picker-access">
          <h1>관리자만 접근할 수 있습니다</h1>
          <Link href="/student/exams" className="design-picker-button design-picker-button-primary">학생 화면으로</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="design-picker" aria-busy={loading || saving}>
      <header className="design-picker-heading">
        <div>
          <Link href="/admin" className="design-picker-back">관리자 콘솔</Link>
          <h1>사이트 디자인</h1>
          <p>서로 다른 Hallmark 디자인을 비교하고, 마음에 드는 화면을 사이트 전체에 적용하세요.</p>
        </div>
        <div className="design-picker-mode">
          <span>라이트·다크 비교</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="design-picker-current" aria-live="polite">
        <span>현재 적용 중</span><strong>{designName(publishedDesign)}</strong>
        {previewing && <span className="design-picker-preview-status">{designName(design)} 미리보기 중</span>}
      </div>

      {loadError ? (
        <div className="design-picker-message design-picker-message-error" role="alert">
          <p>{loadError}</p>
          <button type="button" className="design-picker-button" onClick={() => void loadAppearance()} disabled={loading || saving}>다시 불러오기</button>
        </div>
      ) : loading ? <p className="design-picker-loading" role="status">현재 디자인을 확인하고 있습니다.</p> : null}

      <fieldset className="design-picker-options" disabled={saving}>
        <legend>디자인 선택</legend>
        <div className="design-picker-grid">
          {SITE_DESIGNS.map((preset) => (
            <label key={preset.id} className="design-picker-choice" data-selected={selected === preset.id || undefined}>
              <input
                type="radio"
                name="site-design"
                value={preset.id}
                checked={selected === preset.id}
                onChange={() => selectDesign(preset.id)}
                className="design-picker-choice-input"
              />
              <span className="design-picker-thumbnail">
                <Image src={`/hallmark/previews/${preset.id}-light.png`} width={1440} height={900} unoptimized alt={`${preset.name} 라이트 학습 화면`} className="design-picker-thumbnail-light" priority={preset.id === DEFAULT_SITE_DESIGN} />
                <Image src={`/hallmark/previews/${preset.id}-dark.png`} width={1440} height={900} unoptimized alt={`${preset.name} 다크 학습 화면`} className="design-picker-thumbnail-dark" priority={preset.id === DEFAULT_SITE_DESIGN} />
              </span>
              <span className="design-picker-choice-content">
                <span className="design-picker-choice-title">
                  <strong>{preset.name}</strong>
                  {preset.id === publishedDesign ? <span className="design-picker-tag">적용 중</span> : preset.recommended ? <span className="design-picker-tag">추천</span> : null}
                  <span className="design-picker-choice-indicator" aria-hidden="true">{selected === preset.id ? "선택됨" : "선택"}</span>
                </span>
                <span className="design-picker-description">{preset.description}</span>
                <span className="design-picker-caption">학습 화면 예시</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section className="design-picker-actions" aria-labelledby="design-picker-action-title">
        <div className="design-picker-action-copy">
          <h2 id="design-picker-action-title">{designName(selected)} 선택</h2>
          <p>미리보기는 나에게만 보입니다. ‘사이트 전체에 적용’을 누르면 모든 사용자에게 같은 디자인이 적용됩니다.</p>
          <div className="design-picker-preview-links">
            <Link href="/student/exams">학습 화면 보기</Link>
            <Link href="/">메인 화면 보기</Link>
          </div>
        </div>
        <div className="design-picker-action-buttons">
          {previewing && <button type="button" onClick={endPreview} className="design-picker-button" disabled={saving}>미리보기 종료</button>}
          <button type="button" onClick={previewSelection} className="design-picker-button" disabled={saving || selected === design}>
            {selected === design ? previewing ? "미리보기 중" : "현재 디자인" : "미리보기"}
          </button>
          <button type="button" onClick={() => void publishSelection()} className="design-picker-button design-picker-button-primary" disabled={saving || loading || !!loadError || selected === publishedDesign}>
            {saving ? "적용 중..." : "사이트 전체에 적용"}
          </button>
        </div>
      </section>
      {publishError && <p className="design-picker-message design-picker-message-error" role="alert">{publishError}</p>}
      {notice && <p className="design-picker-message" role="status">{notice}</p>}
    </main>
  );
}
