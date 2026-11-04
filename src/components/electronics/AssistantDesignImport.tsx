"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { clipboardFiles } from "@/lib/electronics/clipboard";
import { getSourceLabel, parseProjectSource, SOURCE_ATTACHMENT_MAX_BYTES } from "@/lib/electronics/project-source";
import type { ProjectSource, ProjectSourceAttachment } from "@/lib/electronics/types";

export function ProjectSourceSummary({ source }: { source?: ProjectSource }) {
  return <div className="el-project-source">
    <span className="el-source-badge">{getSourceLabel(source)}</span>
    {source?.attachment && <details className="el-original-image">
      <summary>원본 사진 보기 <span>{source.attachment.name}</span></summary>
      <Image src={`data:${source.attachment.mimeType};base64,${source.attachment.data}`} alt={`설계 원본: ${source.attachment.name}`} width={800} height={600} unoptimized />
    </details>}
  </div>;
}

export function AssistantDesignImport({ onImport }: { onImport: (value: unknown, source: ProjectSource) => boolean }) {
  const [provider, setProvider] = useState<"chatgpt" | "claude">("chatgpt");
  const [json, setJson] = useState("");
  const [attachment, setAttachment] = useState<ProjectSourceAttachment>();
  const [attachmentRemoved, setAttachmentRemoved] = useState(false);
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [readingJson, setReadingJson] = useState(false);
  const alive = useRef(true);
  const imageVersion = useRef(0), jsonVersion = useRef(0);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  async function readImage(file?: File) {
    if (!file) return;
    const version = ++imageVersion.current;
    setError(""); setReading(false);
    if (file.size > SOURCE_ATTACHMENT_MAX_BYTES) { setError("원본 사진은 300KB 이하로 첨부해 주세요."); return; }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) { setError("원본 사진은 PNG, JPG, WebP로 첨부해 주세요."); return; }
    setReading(true);
    try {
      const data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
        reader.onerror = () => reject(new Error("사진을 읽지 못했습니다. 다시 선택해 주세요."));
        reader.readAsDataURL(file);
      });
      if (!alive.current || version !== imageVersion.current) return;
      const validated = parseProjectSource({ channel: "assistant", provider: "chatgpt", attachment: { name: file.name, mimeType: file.type, data } });
      setAttachment(validated?.attachment); setAttachmentRemoved(false);
    } catch (e) { if (alive.current && version === imageVersion.current) setError(e instanceof Error ? e.message : "사진을 읽지 못했습니다."); }
    finally { if (alive.current && version === imageVersion.current) setReading(false); }
  }

  async function readJson(file?: File) {
    if (!file) return;
    const version = ++jsonVersion.current;
    setError(""); setReadingJson(false);
    if (file.size >= 3_000_000) { setError("설계 JSON은 3MB 미만으로 선택해 주세요."); return; }
    setReadingJson(true);
    try {
      const text = await file.text();
      if (!alive.current || version !== jsonVersion.current) return;
      setJson(text);
      // Preview only validated source metadata embedded in a project export.
      try {
        const value = JSON.parse(text);
        const source = parseProjectSource(value?.source);
        if (source?.channel === "assistant") setProvider(source.provider);
        if (source?.attachment) { setAttachment(source.attachment); setAttachmentRemoved(false); }
      } catch { /* The import action reports invalid JSON/project data. */ }
    } catch { if (alive.current && version === jsonVersion.current) setError("설계 파일을 읽지 못했습니다."); }
    finally { if (alive.current && version === jsonVersion.current) setReadingJson(false); }
  }

  function paste(event: React.ClipboardEvent<HTMLElement>) {
    // This channel owns its clipboard; never send it to the Gemini upload flow.
    event.stopPropagation();
    const files = clipboardFiles(event.clipboardData);
    if (files.length) { event.preventDefault(); if (files.length !== 1) setError("원본 사진은 한 장씩 붙여넣어 주세요."); else void readImage(files[0]); return; }
    const target = event.target as HTMLElement;
    if (target.closest("input, textarea, [contenteditable=true]")) return;
    const text = event.clipboardData.getData("text/plain");
    if (text.trim()) { event.preventDefault(); if (text.length >= 3_000_000) setError("설계 JSON은 3MB 미만으로 붙여넣어 주세요."); else setJson(text); }
  }

  function submit() {
    setError("");
    try {
      if (!json.trim()) throw new Error("대화에서 받은 회로 또는 프로젝트 JSON을 넣어 주세요.");
      const value = JSON.parse(json);
      const savedImage = !attachment && !attachmentRemoved ? parseProjectSource(value?.source)?.attachment : undefined;
      const image = attachment ?? savedImage;
      const source = parseProjectSource({ channel: "assistant", provider, ...(image ? { attachment: image } : {}) });
      if (!source || !onImport(value, source)) setError("설계 JSON의 소자·핀·연결 형식을 확인해 주세요.");
    } catch (e) { setError(e instanceof Error ? e.message : "설계 JSON을 읽지 못했습니다."); }
  }

  return <div className="el-assistant-import" onPaste={paste}>
    <h3>구독 대화에서 만든 설계 가져오기</h3>
    <p>ChatGPT·Codex 또는 Claude 대화에 자료를 보내고, 받은 설계 JSON을 여기에 넣으세요. 가져온 설계는 새 프로젝트로 저장됩니다.</p>
    <div className="el-source-provider" role="group" aria-label="설계한 대화 서비스">
      <button type="button" className={provider === "chatgpt" ? "active" : ""} aria-pressed={provider === "chatgpt"} onClick={() => setProvider("chatgpt")}>ChatGPT · Codex</button>
      <button type="button" className={provider === "claude" ? "active" : ""} aria-pressed={provider === "claude"} onClick={() => setProvider("claude")}>Claude</button>
    </div>
    <label className="el-json-import">설계 JSON 파일 선택<input type="file" accept="application/json,.json" disabled={readingJson} onChange={e => { void readJson(e.target.files?.[0]); e.target.value = ""; }} /></label>
    <label className="el-field-label" htmlFor="el-assistant-json">설계 JSON 붙여넣기</label>
    <textarea id="el-assistant-json" value={json} maxLength={2_999_999} onChange={e => setJson(e.target.value)} rows={7} spellCheck={false} placeholder='{"id":"my-circuit", "components":[…], …}' />
    <div className="el-assistant-original" tabIndex={0} aria-label="원본 사진 붙여넣기 영역">
      <div><b>원본 사진 함께 보관</b><span>선택 사항 · PNG/JPG/WebP · 300KB 이하 · Ctrl+V 가능</span></div>
      <label className="el-button el-small">사진 선택<input type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={e => { void readImage(e.target.files?.[0]); e.target.value = ""; }} /></label>
      {reading && <p role="status">사진을 읽고 있습니다…</p>}
      {attachment && <div className="el-assistant-preview"><Image src={`data:${attachment.mimeType};base64,${attachment.data}`} alt={`${attachment.name} 원본 미리보기`} width={500} height={320} unoptimized /><div><span>{attachment.name}</span><button type="button" className="el-text-button" onClick={() => { imageVersion.current++; setReading(false); setAttachment(undefined); setAttachmentRemoved(true); }}>제거</button></div></div>}
    </div>
    {error && <p className="el-notice error" role="alert">{error}</p>}
    <button type="button" className="el-button el-primary el-full" disabled={reading || readingJson || !json.trim()} onClick={submit}>{readingJson ? "설계 파일 읽는 중…" : "새 설계로 가져오기"}</button>
    <p className="el-small-note">이 경로는 대화 결과를 직접 가져옵니다. 구독 계정에 자동 접속하거나 별도 AI API를 호출하지 않습니다. 가져온 회로도 원본과 핀·연결을 확인해 주세요.</p>
  </div>;
}
