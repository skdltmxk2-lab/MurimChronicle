// 출제 시점 품질 게이트 — 서버 어댑터 (설계 DESIGN_quality_gate.md §6)
//
// 관리자 라우트(service-role 클라이언트)에서만 쓴다. 순수 판정은 qualityGateCore.mjs,
// 여기서는 모드 조회·오탐 해제 목록·이미지 확인·DB 쓰기(자동수정·격리·의심 기록)를 붙인다.
//
// 안전장치
//  - 모드 기본값은 shadow(검사·보고만, DB 쓰기 0).
//  - enforce 인데 로그 테이블(마이그레이션 20261104)이 없으면 shadow 로 내려간다.
//    원본 백업 로그 없이 문항을 고치거나 격리하지 않는다.
//  - 자동수정은 DB 행(snake_case)을 다시 읽어 그 행 기준으로 만들고, updated_at CAS 로 저장한다.
//  - 게이트 자체 오류는 출제를 막지 않는다(selectWithGate). 해당 문항은 gateFailed 로 보고한다.
//  - 요청마다 결과를 로그 한 줄([quality-gate])로 남긴다. shadow 결과는 DB 에 남지 않기 때문이다.

import type { SupabaseClient } from "@supabase/supabase-js";
import { COACHING_QUESTION_SELECT, fromQuestionDb } from "@/lib/admin/coaching";
import {
  GATE_RULES,
  QUALITY_GATE_VERSION,
  applySafeFixes,
  checkImages,
  codesByTier,
  contentFingerprint,
  fixedFieldsToRowPatch,
  guardedProposals,
  inspectQuestion,
  mergeIssues,
  selectWithGate,
  type GateFailedItem,
  type GateIssue,
  type GateMode,
  type GateReport,
  type GateReportItem,
  type GateResult,
} from "@/lib/questions/qualityGate";
import type { QuestionRecord } from "@/types/question";

export type GateContext = "unit-mock" | "school-mock" | "related" | "twin" | "school-ai" | "save" | "manual";

export type QualityGateResponse = {
  mode: GateMode;
  requestedMode: GateMode;
  /** enforce 를 요청했지만 shadow 로 내려간 이유 */
  downgradeReason: "migration_missing" | null;
  version: string;
  inspected: number;
  autoFixed: GateReportItem[];
  quarantined: GateReportItem[];
  suspectSkipped: GateReportItem[];
  suspectUsed: GateReportItem[];
  warnings: GateReportItem[];
  fixFailed: GateReportItem[];
  gateFailed: GateFailedItem[];
  writeErrors: number;
  /** 보고에 등장한 코드의 한국어 설명 */
  labels: Record<string, string>;
};

const GATE_MODES: GateMode[] = ["off", "shadow", "enforce"];
const IMAGE_BUDGET_MS = 8000;
const CLEARANCE_PAGE = 1000;
const CLEARANCE_MAX = 20000;

const RAW_ROW_SELECT = [
  "id",
  "question",
  "content_type",
  "question_image",
  "question_type",
  "options",
  "correct_option_id",
  "answer_text",
  "explanation",
  "explanation_content_type",
  "explanation_image",
  "quality_status",
  "updated_at",
].join(", ");

function isMissingRelation(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  const message = error.message ?? "";
  return (
    error.code === "42P01" ||
    error.code === "42883" ||
    error.code === "PGRST202" ||
    error.code === "PGRST205" ||
    message.includes("question_quality_events") ||
    message.includes("question_quality_clearances") ||
    message.includes("quality_gate_")
  );
}

export async function loadGateMode(supabase: SupabaseClient): Promise<GateMode> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("value")
    .eq("key", "quality_gate_mode")
    .maybeSingle();
  if (error || !data) return "shadow";
  const value = String((data as { value?: unknown }).value ?? "");
  return (GATE_MODES as string[]).includes(value) ? (value as GateMode) : "shadow";
}

async function loadClearances(supabase: SupabaseClient): Promise<{ set: Set<string>; available: boolean }> {
  const set = new Set<string>();
  for (let offset = 0; offset < CLEARANCE_MAX; offset += CLEARANCE_PAGE) {
    const { data, error } = await supabase
      .from("question_quality_clearances")
      .select("question_id, code, fingerprint")
      .order("question_id", { ascending: true })
      .range(offset, offset + CLEARANCE_PAGE - 1);
    if (error) return { set, available: !isMissingRelation(error) };
    const rows = (data ?? []) as { question_id: string; code: string; fingerprint: string }[];
    for (const row of rows) set.add(`${row.question_id}|${row.code}|${row.fingerprint}`);
    if (rows.length < CLEARANCE_PAGE) break;
  }
  return { set, available: true };
}

function issueDetails(issues: GateIssue[]) {
  return issues.map((issue) => ({
    code: issue.code,
    tier: issue.tier,
    field: issue.field,
    evidence: issue.evidence,
    ...(issue.meta ? { meta: issue.meta } : {}),
  }));
}

function mergeItems<T extends { id: string }>(target: T[], source: T[], keyOf: (item: T) => string = (item) => item.id) {
  const seen = new Set(target.map((item) => keyOf(item)));
  for (const item of source) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    target.push(item);
  }
}

export type QualityGateSession = {
  mode: GateMode;
  /** selectUnitMockCandidates 같은 결정적 선택기를 게이트로 감싼다 */
  select: (args: {
    candidates: QuestionRecord[];
    count: number;
    select: (pool: QuestionRecord[], count: number) => QuestionRecord[];
    allowSuspectFallback?: boolean;
  }) => Promise<QuestionRecord[]>;
  /** 게이트 없이 단건 검사 (저장 전 검사 등) */
  inspect: (question: QuestionRecord) => Promise<GateResult>;
  response: () => QualityGateResponse;
};

export async function createQualityGateSession(params: {
  supabase: SupabaseClient;
  actorId: string | null;
  context: GateContext;
  /** 상대 경로 이미지(/white/…) 확인용 사이트 주소. 없으면 상대 경로 이미지는 건너뛴다 */
  origin?: string | null;
  /** 테스트·디버그용 강제 모드 */
  forceMode?: GateMode;
}): Promise<QualityGateSession> {
  const { supabase, actorId, context, origin } = params;
  const requestedMode = params.forceMode ?? (await loadGateMode(supabase));
  let mode: GateMode = requestedMode;
  let downgradeReason: QualityGateResponse["downgradeReason"] = null;

  if (mode === "enforce") {
    const probe = await supabase.from("question_quality_events").select("id").limit(1);
    if (probe.error && isMissingRelation(probe.error)) {
      mode = "shadow";
      downgradeReason = "migration_missing";
    }
  }

  const clearances = mode === "off" ? { set: new Set<string>(), available: false } : await loadClearances(supabase);
  const memo = new Map<string, Promise<GateResult>>();
  let imageSpentMs = 0;
  let writeErrors = 0;

  const total: GateReport & { writeErrors: number } = {
    mode,
    inspected: 0,
    autoFixed: [],
    quarantined: [],
    suspectSkipped: [],
    suspectUsed: [],
    warnings: [],
    fixFailed: [],
    gateFailed: [],
    writeErrors: 0,
  };

  const inspect = (question: QuestionRecord): Promise<GateResult> => {
    const key = `${question.id}|${question.updatedAt ?? ""}`;
    const cached = memo.get(key);
    if (cached) return cached;
    const run = (async () => {
      let result = inspectQuestion(question, { clearances: clearances.set });
      if (imageSpentMs < IMAGE_BUDGET_MS) {
        const started = Date.now();
        const imageIssues = await checkImages(question, (url, init) => fetch(url, init), {
          origin: origin ?? undefined,
          timeoutMs: 3000,
        });
        imageSpentMs += Date.now() - started;
        result = mergeIssues(result, imageIssues);
      }
      return result;
    })();
    memo.set(key, run);
    return run;
  };

  const autofix = async (question: QuestionRecord, result: GateResult): Promise<QuestionRecord | null> => {
    const { data: row, error } = await supabase.from("questions").select(RAW_ROW_SELECT).eq("id", question.id).maybeSingle();
    if (error || !row) {
      writeErrors += 1;
      return null;
    }
    const raw = row as unknown as Record<string, unknown>;
    if (raw.quality_status !== "approved") return null;
    const outcome = applySafeFixes(raw);
    if (!outcome || !outcome.fixed) return null;
    const patch = fixedFieldsToRowPatch(raw, outcome.fixed);
    if (Object.keys(patch).length === 0) return null;
    const { data: newUpdatedAt, error: rpcError } = await supabase.rpc("quality_gate_autofix", {
      p_question_id: question.id,
      p_expected_updated_at: String(raw.updated_at ?? ""),
      p_patch: patch,
      p_details: {
        codes: codesByTier(result).fix,
        fields: outcome.applied,
      },
      p_fingerprint: contentFingerprint(raw),
      p_version: QUALITY_GATE_VERSION,
      p_context: context,
      p_actor: actorId,
    });
    if (rpcError) {
      writeErrors += 1;
      return null;
    }
    if (!newUpdatedAt) return null; // 동시 수정(CAS 충돌) — 이번엔 원본 그대로 둔다
    const { data: fresh } = await supabase.from("questions").select(COACHING_QUESTION_SELECT).eq("id", question.id).maybeSingle();
    if (!fresh) return null;
    const record = fromQuestionDb(fresh as unknown as Record<string, unknown>);
    return {
      ...record,
      coachingUseCount: question.coachingUseCount,
      coachingUsedStudentCount: question.coachingUsedStudentCount,
      coachingLastUsedAt: question.coachingLastUsedAt,
    };
  };

  const quarantine = async (question: QuestionRecord, result: GateResult) => {
    const blockIssues = result.issues.filter((issue) => issue.tier === "block");
    const { error } = await supabase.rpc("quality_gate_quarantine", {
      p_question_id: question.id,
      p_codes: codesByTier(result).block,
      p_details: { issues: issueDetails(blockIssues), proposals: guardedProposals(result) },
      p_fingerprint: result.fingerprint,
      p_version: QUALITY_GATE_VERSION,
      p_context: context,
      p_actor: actorId,
      p_event: "quarantine",
    });
    if (error) writeErrors += 1;
  };

  const recordSuspect = async (question: QuestionRecord, result: GateResult) => {
    const suspectIssues = result.issues.filter((issue) => issue.tier === "suspect");
    const { error } = await supabase.rpc("quality_gate_record_suspect", {
      p_question_id: question.id,
      p_codes: codesByTier(result).suspect,
      p_details: { issues: issueDetails(suspectIssues), proposals: guardedProposals(result) },
      p_fingerprint: result.fingerprint,
      p_version: QUALITY_GATE_VERSION,
      p_context: context,
      p_actor: actorId,
    });
    if (error) writeErrors += 1;
  };

  return {
    mode,
    inspect,
    select: async ({ candidates, count, select, allowSuspectFallback = true }) => {
      const { selected, report } = await selectWithGate<QuestionRecord>({
        candidates,
        count,
        select,
        inspect,
        mode,
        allowSuspectFallback,
        onFixable: mode === "enforce" ? autofix : undefined,
        onBlocked: mode === "enforce" ? quarantine : undefined,
        onSuspect: mode === "enforce" ? recordSuspect : undefined,
      });
      total.inspected += report.inspected;
      mergeItems(total.autoFixed, report.autoFixed);
      mergeItems(total.quarantined, report.quarantined);
      mergeItems(total.suspectSkipped, report.suspectSkipped);
      mergeItems(total.suspectUsed, report.suspectUsed);
      mergeItems(total.warnings, report.warnings);
      mergeItems(total.fixFailed, report.fixFailed);
      mergeItems(total.gateFailed, report.gateFailed, (item) => `${item.id}|${item.stage}`);
      return selected;
    },
    response: () => {
      // 나중 섹션에서 쓰인 의심 문항은 "건너뜀"에서 뺀다
      const used = new Set(total.suspectUsed.map((item) => item.id));
      const suspectSkipped = total.suspectSkipped.filter((item) => !used.has(item.id));
      const codes = new Set<string>();
      for (const list of [total.autoFixed, total.quarantined, suspectSkipped, total.suspectUsed, total.warnings]) {
        for (const item of list) for (const code of item.codes) codes.add(code);
      }
      const result: QualityGateResponse = {
        mode,
        requestedMode,
        downgradeReason,
        version: QUALITY_GATE_VERSION,
        inspected: total.inspected,
        autoFixed: total.autoFixed,
        quarantined: total.quarantined,
        suspectSkipped,
        suspectUsed: total.suspectUsed,
        warnings: total.warnings,
        fixFailed: total.fixFailed,
        gateFailed: total.gateFailed,
        writeErrors,
        labels: Object.fromEntries([...codes].map((code) => [code, GATE_RULES[code]?.[1] ?? code])),
      };
      if (result.inspected > 0) console.info("[quality-gate]", JSON.stringify({ context, ...result, labels: undefined }));
      return result;
    },
  };
}
