"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { adminFetch } from "@/lib/api/adminFetch";
import type { CoachingStudent } from "@/types/coaching";

type CoachingStudentPickerProps = {
  selectedStudentIds: readonly string[];
  disabled?: boolean;
  onStudentsChange: (students: CoachingStudent[]) => void;
};

async function ensureOk<T>(response: Response): Promise<T> {
  const json = (await response.json().catch(() => null)) as ({ ok?: boolean; message?: string } & T) | null;
  if (!response.ok || json?.ok === false || !json) {
    throw new Error(json?.message ?? `HTTP ${response.status}`);
  }
  return json as T;
}

function sortStudents(students: CoachingStudent[]) {
  return [...students].sort((left, right) => {
    if (left.isActive !== right.isActive) return left.isActive ? -1 : 1;
    return left.name.localeCompare(right.name, "ko");
  });
}

function formatSelectedStudentNames(students: CoachingStudent[]) {
  if (students.length <= 4) return students.map((student) => student.name).join(", ");
  return `${students.slice(0, 3).map((student) => student.name).join(", ")} 외 ${students.length - 3}명`;
}

export function CoachingStudentPicker({
  selectedStudentIds,
  disabled = false,
  onStudentsChange,
}: CoachingStudentPickerProps) {
  const [students, setStudents] = useState<CoachingStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [managing, setManaging] = useState(false);
  const [message, setMessage] = useState("");
  const [newName, setNewName] = useState("");
  const [newMemo, setNewMemo] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editingName, setEditingName] = useState("");
  const [editingMemo, setEditingMemo] = useState("");

  const activeStudents = useMemo(() => students.filter((student) => student.isActive), [students]);
  const archivedStudents = useMemo(() => students.filter((student) => !student.isActive), [students]);
  const selectedStudentIdSet = useMemo(() => new Set(selectedStudentIds), [selectedStudentIds]);
  const selectedStudents = activeStudents.filter((student) => selectedStudentIdSet.has(student.id));

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setLoading(true);
      setMessage("");
      try {
        const json = await ensureOk<{ students: CoachingStudent[] }>(
          await adminFetch("/api/admin/coaching/students")
        );
        if (cancelled) return;
        const nextStudents = sortStudents(json.students ?? []);
        setStudents(nextStudents);
        const selectedIdSet = new Set(selectedStudentIds);
        const existingSelection = nextStudents.filter(
          (student) => student.isActive && selectedIdSet.has(student.id)
        );
        const initial =
          existingSelection.length > 0
            ? existingSelection
            : nextStudents.find((student) => student.isActive)
              ? [nextStudents.find((student) => student.isActive)!]
              : [];
        onStudentsChange(initial);
      } catch (error) {
        if (cancelled) return;
        setMessage(error instanceof Error ? error.message : "학생 명단을 불러오지 못했습니다.");
        onStudentsChange([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadStudents();
    return () => {
      cancelled = true;
    };
    // 최초 진입 시 서버 명단을 기준으로 선택 학생을 확정한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toggleStudent(studentId: string) {
    const student = students.find((item) => item.id === studentId && item.isActive) ?? null;
    if (!student) return;
    const next = selectedStudentIdSet.has(studentId)
      ? selectedStudents.filter((item) => item.id !== studentId)
      : activeStudents.filter(
          (item) => selectedStudentIdSet.has(item.id) || item.id === studentId
        );
    onStudentsChange(next);
    setMessage(
      selectedStudentIdSet.has(studentId)
        ? `${student.name} 학생을 출제 대상에서 제외했습니다.`
        : `${student.name} 학생을 출제 대상으로 선택했습니다.`
    );
  }

  function toggleAllStudents() {
    const allSelected =
      activeStudents.length > 0 && selectedStudents.length === activeStudents.length;
    onStudentsChange(allSelected ? [] : activeStudents);
    setMessage(allSelected ? "출제 대상 학생 선택을 해제했습니다." : `학생 ${activeStudents.length}명을 모두 선택했습니다.`);
  }

  async function addStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const json = await ensureOk<{ student: CoachingStudent }>(
        await adminFetch("/api/admin/coaching/students", {
          method: "POST",
          body: JSON.stringify({ name: newName, memo: newMemo }),
        })
      );
      const nextStudents = sortStudents([...students, json.student]);
      setStudents(nextStudents);
      setNewName("");
      setNewMemo("");
      onStudentsChange(
        activeStudents
          .filter((student) => selectedStudentIdSet.has(student.id))
          .concat(json.student)
      );
      setMessage(`${json.student.name} 학생을 등록하고 출제 대상으로 선택했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "학생 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  function beginEdit(student: CoachingStudent) {
    setEditingId(student.id);
    setEditingName(student.name);
    setEditingMemo(student.memo);
    setMessage("");
  }

  async function saveEdit(student: CoachingStudent) {
    if (saving) return;
    setSaving(true);
    setMessage("");
    try {
      const json = await ensureOk<{ student: CoachingStudent }>(
        await adminFetch(`/api/admin/coaching/students/${student.id}`, {
          method: "PATCH",
          body: JSON.stringify({ name: editingName, memo: editingMemo }),
        })
      );
      setStudents((current) => sortStudents(current.map((item) => (item.id === student.id ? json.student : item))));
      if (selectedStudentIdSet.has(student.id)) {
        onStudentsChange(
          selectedStudents.map((item) => (item.id === student.id ? json.student : item))
        );
      }
      setEditingId("");
      setMessage(`${json.student.name} 학생 정보를 수정했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "학생 정보 수정에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  async function setStudentActive(student: CoachingStudent, isActive: boolean) {
    if (saving) return;
    if (!isActive) {
      const confirmed = window.confirm(
        `${student.name} 학생을 보관할까요? 기존 문제 사용 이력은 유지되며 언제든 복구할 수 있습니다.`
      );
      if (!confirmed) return;
    }

    setSaving(true);
    setMessage("");
    try {
      const json = await ensureOk<{ student: CoachingStudent }>(
        await adminFetch(`/api/admin/coaching/students/${student.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isActive }),
        })
      );
      const nextStudents = sortStudents(
        students.map((item) => (item.id === student.id ? json.student : item))
      );
      setStudents(nextStudents);
      if (!isActive && selectedStudentIdSet.has(student.id)) {
        const remainingSelection = nextStudents.filter(
          (item) => item.isActive && item.id !== student.id && selectedStudentIdSet.has(item.id)
        );
        onStudentsChange(
          remainingSelection.length > 0
            ? remainingSelection
            : nextStudents.find((item) => item.isActive)
              ? [nextStudents.find((item) => item.isActive)!]
              : []
        );
      }
      setMessage(
        isActive
          ? `${json.student.name} 학생을 명단에 복구했습니다.`
          : `${json.student.name} 학생을 보관했습니다. 사용 이력은 유지됩니다.`
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "학생 상태 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mt-5 border-y border-line bg-slate-50 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-slate-600">출제 대상 학생</p>
          <p className="mt-1 text-xs font-bold text-brand-700">
            {selectedStudents.length > 0
              ? `${formatSelectedStudentNames(selectedStudents)} · ${selectedStudents.length}명 선택`
              : "학생을 1명 이상 선택해 주세요."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={disabled || loading || activeStudents.length === 0}
            onClick={toggleAllStudents}
            className="rounded-md border border-line bg-white px-3 py-2 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selectedStudents.length === activeStudents.length && activeStudents.length > 0 ? "전체 해제" : "전체 선택"}
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => setManaging((current) => !current)}
            className="rounded-md border border-line bg-white px-4 py-2 text-xs font-black text-slate-600 transition hover:border-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {managing ? "학생 관리 닫기" : "학생 등록·관리"}
          </button>
        </div>
      </div>

      <div
        role="group"
        aria-label="출제 대상 학생"
        className="mt-3 grid max-h-64 gap-2 overflow-y-auto pr-1 sm:grid-cols-2 lg:grid-cols-3"
      >
        {loading ? (
          <p className="text-xs font-bold text-slate-500">학생 명단 불러오는 중...</p>
        ) : activeStudents.length === 0 ? (
          <p className="text-xs font-bold text-slate-500">학생을 먼저 등록해 주세요.</p>
        ) : (
          activeStudents.map((student) => {
            const checked = selectedStudentIdSet.has(student.id);
            return (
              <label
                key={student.id}
                className={`flex min-w-0 items-start gap-3 rounded-md border bg-white px-3 py-3 text-sm transition ${
                  checked ? "border-brand-500 ring-2 ring-brand-100" : "border-line"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => toggleStudent(student.id)}
                  className="mt-0.5 size-4 shrink-0 rounded border-line"
                />
                <span className="min-w-0">
                  <span className="block truncate font-black text-ink">{student.name}</span>
                  {student.memo ? (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">{student.memo}</span>
                  ) : null}
                </span>
              </label>
            );
          })
        )}
      </div>

      {managing ? (
        <div className="mt-4 border-t border-line pt-4">
          <form onSubmit={addStudent} className="grid gap-2 md:grid-cols-[minmax(140px,0.7fr)_minmax(220px,1.3fr)_auto]">
            <input
              type="text"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              disabled={disabled || saving}
              maxLength={40}
              placeholder="학생 이름"
              aria-label="새 학생 이름"
              className="rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
            <input
              type="text"
              value={newMemo}
              onChange={(event) => setNewMemo(event.target.value)}
              disabled={disabled || saving}
              maxLength={200}
              placeholder="메모 (선택, 예: 월수반)"
              aria-label="새 학생 메모"
              className="rounded-md border border-line bg-white px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={disabled || saving || newName.trim().length === 0}
              className="rounded-md bg-brand-600 px-4 py-2 text-xs font-black text-white hover:bg-brand-700 disabled:bg-slate-300"
            >
              {saving ? "저장 중..." : "학생 등록"}
            </button>
          </form>

          {students.length > 0 ? (
            <ul className="mt-4 divide-y divide-line border-y border-line bg-white">
              {students.map((student) => (
                <li key={student.id} className="px-3 py-3">
                  {editingId === student.id ? (
                    <div className="grid gap-2 md:grid-cols-[minmax(140px,0.7fr)_minmax(220px,1.3fr)_auto_auto]">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(event) => setEditingName(event.target.value)}
                        disabled={disabled || saving}
                        maxLength={40}
                        aria-label={`${student.name} 학생 이름 수정`}
                        className="rounded-md border border-line px-3 py-2 text-sm"
                      />
                      <input
                        type="text"
                        value={editingMemo}
                        onChange={(event) => setEditingMemo(event.target.value)}
                        disabled={disabled || saving}
                        maxLength={200}
                        aria-label={`${student.name} 학생 메모 수정`}
                        className="rounded-md border border-line px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        disabled={disabled || saving || editingName.trim().length === 0}
                        onClick={() => void saveEdit(student)}
                        className="rounded-md bg-ink px-3 py-2 text-xs font-black text-white disabled:bg-slate-300"
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => setEditingId("")}
                        className="rounded-md border border-line px-3 py-2 text-xs font-black text-slate-600"
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-black text-ink">{student.name}</p>
                          <span className={`text-[11px] font-black ${student.isActive ? "text-emerald-700" : "text-slate-400"}`}>
                            {student.isActive ? "사용 중" : "보관됨"}
                          </span>
                        </div>
                        {student.memo ? <p className="mt-1 truncate text-xs text-slate-500">{student.memo}</p> : null}
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        {student.isActive ? (
                          <button
                            type="button"
                            disabled={saving || disabled}
                            onClick={() => toggleStudent(student.id)}
                            className="rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700 disabled:opacity-40"
                          >
                            {selectedStudentIdSet.has(student.id) ? "선택 해제" : "선택"}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          disabled={disabled || saving}
                          onClick={() => beginEdit(student)}
                          className="rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 hover:border-brand-600 hover:text-brand-700 disabled:opacity-40"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          disabled={disabled || saving}
                          onClick={() => void setStudentActive(student, !student.isActive)}
                          className="rounded-md border border-line px-3 py-1.5 text-xs font-black text-slate-600 hover:border-amber-500 hover:text-amber-700 disabled:opacity-40"
                        >
                          {student.isActive ? "보관" : "복구"}
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {archivedStudents.length > 0 ? (
            <p className="mt-2 text-xs text-slate-500">보관 학생 {archivedStudents.length}명 · 기존 사용 이력 유지</p>
          ) : null}
        </div>
      ) : null}

      {message ? <p className="mt-3 text-xs font-bold text-slate-600">{message}</p> : null}
    </section>
  );
}
