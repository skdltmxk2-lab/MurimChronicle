"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { isAdminUser } from "@/lib/auth/mockAuth";
import { DEFAULT_HOMEWORK_SETTINGS, type HomeworkAssignment, type HomeworkMaterial, type HomeworkSettings } from "@/types/homework";
import { HomeworkMaterialPanel } from "./HomeworkMaterialPanel";
import { HomeworkAssignmentsPanel } from "./HomeworkAssignmentsPanel";
import { HomeworkSettingsPanel } from "./HomeworkSettingsPanel";
import { errorMessage, homeworkApi, Notice, secondaryClass } from "./HomeworkShared";

export type HomeworkUser = { id: string; name: string; email: string; isAdmin: boolean; studentGroup: string };
type RootResponse = { materials: HomeworkMaterial[]; assignments: HomeworkAssignment[]; settings: HomeworkSettings; aiAvailable: boolean };
type Tab = "materials" | "assignments" | "settings";

export function AdminHomeworkClient() {
  const { user, authChecked } = useAuth();
  const admin = isAdminUser(user);
  const [tab, setTab] = useState<Tab>("materials");
  const [visitedTabs, setVisitedTabs] = useState<Tab[]>(["materials"]);
  const [data, setData] = useState<RootResponse>({ materials: [], assignments: [], settings: DEFAULT_HOMEWORK_SETTINGS, aiAvailable: false });
  const [users, setUsers] = useState<HomeworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [usersError, setUsersError] = useState("");
  const [assignMaterialId, setAssignMaterialId] = useState("");
  const [assignSelectionVersion, setAssignSelectionVersion] = useState(0);
  useEffect(() => { const params = new URLSearchParams(window.location.search); const id = params.get("material"); if (id && params.get("tab") === "assignments") { setAssignMaterialId(id); setTab("assignments"); setVisitedTabs(["materials", "assignments"]); } }, []);
  function selectTab(next: Tab) { setTab(next); setVisitedTabs((previous) => previous.includes(next) ? previous : [...previous, next]); }
  const refresh = useCallback(async () => {
    const next = await homeworkApi<RootResponse>("/api/admin/homework");
    setData(next);
    setError("");
  }, []);
  const refreshUsers = useCallback(async () => {
    try {
      const result = await homeworkApi<{ users: HomeworkUser[] }>("/api/admin/users");
      setUsers(result.users); setUsersError("");
    } catch (e) { setUsersError(errorMessage(e)); }
  }, []);
  useEffect(() => {
    if (!authChecked || !admin) return;
    let alive = true;
    setLoading(true);
    Promise.all([refresh(), refreshUsers()]).catch((e) => { if (alive) setError(errorMessage(e)); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [authChecked, admin, refresh, refreshUsers]);

  if (!authChecked) return <main className="px-5 py-12 text-center text-sm text-slate-500">로그인 정보를 확인하고 있습니다.</main>;
  if (!admin) return <main className="mx-auto max-w-3xl px-5 py-16 text-center"><h1 className="text-2xl font-black text-ink">관리자만 접근할 수 있습니다</h1><Link href="/student/exams" className={`${secondaryClass} mt-6`}>돌아가기</Link></main>;

  const tabs: Array<{ key: Tab; label: string }> = [{ key: "materials", label: "자료함" }, { key: "assignments", label: "배부와 제출" }, { key: "settings", label: "AI 설정" }];
  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-brand-700">← 관리자 콘솔</Link><h1 className="mt-2 text-2xl font-black text-ink sm:text-3xl">숙제와 첨삭</h1><p className="mt-2 text-sm leading-6 text-slate-500">단원별 모고로 문제지를 만들거나 자료함에서 선택해 학생에게 배부하세요.</p></div>
      <button type="button" disabled={loading} onClick={() => { setLoading(true); refresh().catch((e) => setError(errorMessage(e))).finally(() => setLoading(false)); }} className={secondaryClass}>새로고침</button>
    </header>
    <div className="grid grid-cols-3 gap-3"><Summary label="등록 자료" value={data.materials.length} /><Summary label="배부한 숙제" value={data.assignments.length} /><Summary label="받은 제출" value={data.assignments.reduce((sum, a) => sum + a.submittedCount, 0)} /></div>
    <nav aria-label="숙제 관리 메뉴" className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">{tabs.map((item) => <button type="button" key={item.key} aria-current={tab === item.key ? "page" : undefined} onClick={() => selectTab(item.key)} className={`min-w-[100px] flex-1 rounded-lg px-4 py-3 text-sm font-black transition ${tab === item.key ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-ink"}`}>{item.label}</button>)}</nav>
    {error && <Notice error>{error}</Notice>}
    {loading && data.materials.length === 0 && data.assignments.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">숙제 자료를 불러오고 있습니다.</p> : <>
      {visitedTabs.includes("materials") && <div hidden={tab !== "materials"}><HomeworkMaterialPanel active={tab === "materials"} materials={data.materials} aiAvailable={data.aiAvailable} aiEnabled={data.settings.aiEnabled} refresh={refresh} onAssign={(id) => { setAssignMaterialId(id); setAssignSelectionVersion((v) => v + 1); selectTab("assignments"); }} /></div>}
      {visitedTabs.includes("assignments") && <div hidden={tab !== "assignments"}><HomeworkAssignmentsPanel active={tab === "assignments"} materials={data.materials} assignments={data.assignments} users={users} usersError={usersError} refreshUsers={refreshUsers} initialMaterialId={assignMaterialId} selectionVersion={assignSelectionVersion} settings={data.settings} aiAvailable={data.aiAvailable} refresh={refresh} /></div>}
      {visitedTabs.includes("settings") && <div hidden={tab !== "settings"}><HomeworkSettingsPanel settings={data.settings} aiAvailable={data.aiAvailable} refresh={refresh} /></div>}
    </>}
  </main>;
}

function Summary({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-line bg-white px-3 py-4 sm:px-5"><p className="text-xs font-bold text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-ink">{value.toLocaleString()}</p></div>;
}
