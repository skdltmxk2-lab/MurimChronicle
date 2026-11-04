/** Safe public errors for Gemini calls. Never return/log provider messages or payloads. */
export type GeminiFailureCode =
  | "GEMINI_INVALID_KEY" | "GEMINI_PERMISSION_DENIED" | "GEMINI_RATE_LIMITED"
  | "GEMINI_MODEL_UNAVAILABLE" | "GEMINI_INVALID_REQUEST" | "GEMINI_UNAVAILABLE"
  | "GEMINI_TIMEOUT" | "GEMINI_CANCELLED" | "GEMINI_UNKNOWN";

const REASONS = [
  "API_KEY_INVALID", "API_KEY_EXPIRED", "UNAUTHENTICATED",
  "PERMISSION_DENIED", "API_KEY_SERVICE_BLOCKED", "API_KEY_HTTP_REFERRER_BLOCKED",
  "API_KEY_IP_ADDRESS_BLOCKED", "API_KEY_ANDROID_APP_BLOCKED", "API_KEY_IOS_APP_BLOCKED",
  "SERVICE_DISABLED", "BILLING_DISABLED", "ACCESS_TOKEN_SCOPE_INSUFFICIENT",
  "RESOURCE_EXHAUSTED", "RATE_LIMIT_EXCEEDED", "QUOTA_EXCEEDED",
  "NOT_FOUND", "MODEL_NOT_FOUND", "INVALID_ARGUMENT", "FAILED_PRECONDITION",
  "UNAVAILABLE", "INTERNAL", "DEADLINE_EXCEEDED", "CANCELLED",
] as const;
type ProviderReason = typeof REASONS[number];
const QUOTA_SCOPES = ["REQUESTS_PER_DAY", "TOKENS_PER_DAY", "REQUESTS_PER_MINUTE", "TOKENS_PER_MINUTE"] as const;
export type GeminiQuotaScope = typeof QUOTA_SCOPES[number];

export type GeminiFailure = {
  /** Status for our endpoint. Provider authentication failures are server configuration failures. */
  status: number;
  code: GeminiFailureCode;
  message: string;
  /** Only this allowlisted metadata is suitable for operational logging. */
  metadata: {
    provider: "gemini";
    category: GeminiFailureCode;
    providerStatus?: number;
    providerReason?: ProviderReason;
    quotaScopes?: GeminiQuotaScope[];
    retryAfterSeconds?: number;
    retryable: boolean;
  };
};

const PUBLIC_ERRORS: Record<GeminiFailureCode, { status: number; message: string; retryable: boolean }> = {
  GEMINI_INVALID_KEY: { status: 503, message: "Gemini API 키가 유효하지 않거나 만료되었습니다. 서버의 API 키 설정을 확인해 주세요.", retryable: false },
  GEMINI_PERMISSION_DENIED: { status: 503, message: "Gemini API 접근 권한이 없습니다. 서버 API 키의 서비스 권한과 프로젝트 설정을 확인해 주세요.", retryable: false },
  GEMINI_RATE_LIMITED: { status: 429, message: "Gemini API 사용량 또는 요청 한도에 도달했습니다. 잠시 후 다시 시도하고, 계속되면 API 할당량을 확인해 주세요.", retryable: true },
  GEMINI_MODEL_UNAVAILABLE: { status: 503, message: "설정된 Gemini 모델을 사용할 수 없습니다. 서버의 모델 이름과 해당 API 지원 여부를 확인해 주세요.", retryable: false },
  GEMINI_INVALID_REQUEST: { status: 400, message: "Gemini가 요청 형식을 처리하지 못했습니다. 입력 자료와 서버의 AI 요청 설정을 확인해 주세요.", retryable: false },
  GEMINI_UNAVAILABLE: { status: 503, message: "Gemini 서비스가 일시적으로 응답하지 못했습니다. 잠시 후 다시 시도해 주세요.", retryable: true },
  GEMINI_TIMEOUT: { status: 504, message: "Gemini 응답 시간이 초과되었습니다. 입력 자료나 질문을 줄여 다시 시도해 주세요.", retryable: true },
  GEMINI_CANCELLED: { status: 499, message: "Gemini 요청이 취소되었습니다.", retryable: false },
  GEMINI_UNKNOWN: { status: 503, message: "Gemini 요청을 완료하지 못했습니다. 잠시 후 다시 시도하고, 계속되면 서버의 AI 연결 설정을 확인해 주세요.", retryable: true },
};

function property(value: object, key: string): unknown {
  try { return (value as Record<string, unknown>)[key]; } catch { return undefined; }
}

// QuotaFailure/RetryInfo are structured google.rpc details, not text patterns.
// https://github.com/googleapis/googleapis/blob/master/google/rpc/error_details.proto
// https://ai.google.dev/gemini-api/docs/rate-limits
function quotaScope(value: unknown): GeminiQuotaScope | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const id = property(value, "quotaId") ?? property(value, "quota_id");
  const metric = property(value, "quotaMetric") ?? property(value, "quota_metric");
  if (typeof id !== "string" || id.length > 160) return undefined;
  const request = /^GenerateRequestsPer(Day|Minute)PerProjectPerModel(?:-(?:FreeTier|PaidTier))?$/.exec(id);
  const token = /^GenerateContentInputTokensPerModelPer(Day|Minute)(?:-(?:FreeTier|PaidTier))?$/.exec(id);
  if (!request && !token) return undefined;
  // A metric such as generate_content_free_tier_requests alone has no period.
  // Never infer minute/day from its description, dimensions, or a retry delay.
  if (metric !== undefined) {
    if (typeof metric !== "string" || metric.length > 200) return undefined;
    const matched = /^generativelanguage\.googleapis\.com\/generate_content_(?:(?:free|paid)_tier_)?(requests|input_token_count)$/.exec(metric);
    if (!matched || matched[1] !== (request ? "requests" : "input_token_count")) return undefined;
  }
  return request ? (request[1] === "Day" ? "REQUESTS_PER_DAY" : "REQUESTS_PER_MINUTE")
    : token![1] === "Day" ? "TOKENS_PER_DAY" : "TOKENS_PER_MINUTE";
}

function retrySeconds(value: unknown): number | undefined {
  // ProtoJSON Duration: seconds plus up to nine fractional digits and an s suffix.
  // Out-of-range values are omitted, not shortened into an earlier retry advice.
  if (typeof value !== "string" || !/^(?:0|[1-9]\d{0,5})(?:\.\d{1,9})?s$/.test(value)) return undefined;
  const seconds = Number(value.slice(0, -1));
  return seconds >= 0 && seconds <= 86400 ? Math.max(1, Math.ceil(seconds)) : undefined;
}

/** SDK ApiError.status plus a JSON-encoded message; also tolerates nested HTTP errors. */
function providerFacts(error: unknown) {
  let status: number | undefined;
  let timeout = false;
  let aborted = false;
  const reasons = new Set<ProviderReason>();
  const quotaScopes = new Set<GeminiQuotaScope>();
  let retryAfterSeconds: number | undefined;
  const seen = new Set<object>();
  const queue: { value: unknown; depth: number }[] = [{ value: error, depth: 0 }];
  const knownReasons: ReadonlySet<string> = new Set(REASONS);
  // Bound parsing/traversal even when a provider returns a huge or cyclic body.
  for (let cursor = 0; cursor < queue.length && cursor < 64; cursor++) {
    const { value, depth } = queue[cursor];
    if (depth > 8) continue;
    if (typeof value === "string") {
      if (value.length > 32768) continue;
      const trimmed = value.trim();
      if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
        try { queue.push({ value: JSON.parse(trimmed), depth: depth + 1 }); } catch { /* No raw text fallback. */ }
      }
      continue;
    }
    if (!value || typeof value !== "object" || seen.has(value)) continue;
    seen.add(value);
    if (Array.isArray(value)) {
      for (const item of value.slice(0, 16)) queue.push({ value: item, depth: depth + 1 });
      continue;
    }
    const name = property(value, "name");
    const code = property(value, "code");
    const detailType = property(value, "@type");
    if (detailType === "type.googleapis.com/google.rpc.QuotaFailure") {
      const violations = property(value, "violations");
      if (Array.isArray(violations)) for (let i = 0; i < Math.min(violations.length, 16); i++) {
        const scope = quotaScope(property(violations, String(i)));
        if (scope) quotaScopes.add(scope);
      }
    } else if (detailType === "type.googleapis.com/google.rpc.RetryInfo") {
      const seconds = retrySeconds(property(value, "retryDelay") ?? property(value, "retry_delay"));
      if (seconds !== undefined) retryAfterSeconds = Math.max(retryAfterSeconds ?? 0, seconds);
    }
    timeout ||= name === "TimeoutError" || name === "APIConnectionTimeoutError" || code === "ETIMEDOUT" || code === "ECONNABORTED";
    aborted ||= name === "AbortError" || name === "APIUserAbortError" || code === "ABORT_ERR";
    for (const key of ["status", "statusCode", "code", "reason"] as const) {
      const candidate = property(value, key);
      if (status === undefined && typeof candidate === "number" && Number.isInteger(candidate) && candidate >= 400 && candidate <= 599) status = candidate;
      if (typeof candidate === "string" && knownReasons.has(candidate)) reasons.add(candidate as ProviderReason);
    }
    for (const key of ["error", "cause", "response", "body", "data", "details", "message"] as const) {
      const child = property(value, key);
      if (child !== undefined) queue.push({ value: child, depth: depth + 1 });
    }
  }
  return { status, reasons, timeout, aborted, quotaScopes, retryAfterSeconds };
}

export function classifyGeminiError(error: unknown, context: { timedOut?: boolean; aborted?: boolean } = {}): GeminiFailure {
  const facts = providerFacts(error);
  const matching = (...reasons: ProviderReason[]) => reasons.find(reason => facts.reasons.has(reason));
  let code: GeminiFailureCode;
  let reason: ProviderReason | undefined;
  if (context.timedOut) code = "GEMINI_TIMEOUT";
  else if (context.aborted) code = "GEMINI_CANCELLED";
  else if (facts.timeout || (reason = matching("DEADLINE_EXCEEDED")) || facts.status === 408 || facts.status === 504) code = "GEMINI_TIMEOUT";
  else if (facts.aborted || (reason = matching("CANCELLED"))) code = "GEMINI_CANCELLED";
  else if ((reason = matching("API_KEY_INVALID", "API_KEY_EXPIRED", "UNAUTHENTICATED")) || facts.status === 401) code = "GEMINI_INVALID_KEY";
  else if ((reason = matching("PERMISSION_DENIED", "API_KEY_SERVICE_BLOCKED", "API_KEY_HTTP_REFERRER_BLOCKED", "API_KEY_IP_ADDRESS_BLOCKED", "API_KEY_ANDROID_APP_BLOCKED", "API_KEY_IOS_APP_BLOCKED", "SERVICE_DISABLED", "BILLING_DISABLED", "ACCESS_TOKEN_SCOPE_INSUFFICIENT")) || facts.status === 403) code = "GEMINI_PERMISSION_DENIED";
  else if ((reason = matching("RESOURCE_EXHAUSTED", "RATE_LIMIT_EXCEEDED", "QUOTA_EXCEEDED")) || facts.status === 429) code = "GEMINI_RATE_LIMITED";
  else if ((reason = matching("NOT_FOUND", "MODEL_NOT_FOUND")) || facts.status === 404) code = "GEMINI_MODEL_UNAVAILABLE";
  else if ((reason = matching("UNAVAILABLE", "INTERNAL")) || (facts.status !== undefined && facts.status >= 500)) code = "GEMINI_UNAVAILABLE";
  else if ((reason = matching("INVALID_ARGUMENT", "FAILED_PRECONDITION")) || facts.status === 400 || facts.status === 422) code = "GEMINI_INVALID_REQUEST";
  else code = "GEMINI_UNKNOWN";
  const result = PUBLIC_ERRORS[code];
  const quotaScopes = code === "GEMINI_RATE_LIMITED" ? QUOTA_SCOPES.filter(scope => facts.quotaScopes.has(scope)) : [];
  const dailyQuota = quotaScopes.some(scope => scope === "REQUESTS_PER_DAY" || scope === "TOKENS_PER_DAY");
  let message = result.message;
  if (dailyQuota) message = "Gemini API의 일일 사용량 한도에 도달했습니다. 잠깐 기다린 뒤 재시도해도 해결되지 않을 수 있습니다. 프로젝트의 일일 할당량과 초기화 시점을 확인해 주세요.";
  else if (quotaScopes.length) message = "Gemini API의 분당 요청 또는 토큰 한도에 도달했습니다. " + (facts.retryAfterSeconds !== undefined
    ? `최소 ${facts.retryAfterSeconds}초 후 다시 시도해 주세요.` : "잠시 기다린 뒤 다시 시도해 주세요.");
  return {
    status: result.status, code, message,
    metadata: {
      provider: "gemini", category: code,
      ...(facts.status !== undefined ? { providerStatus: facts.status } : {}),
      ...(reason ? { providerReason: reason } : {}),
      ...(quotaScopes.length ? { quotaScopes } : {}),
      ...(code === "GEMINI_RATE_LIMITED" && facts.retryAfterSeconds !== undefined ? { retryAfterSeconds: facts.retryAfterSeconds } : {}),
      retryable: dailyQuota ? false : result.retryable,
    },
  };
}
