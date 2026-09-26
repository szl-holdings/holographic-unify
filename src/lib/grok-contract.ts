/**
 * Framework-free xAI chat-completions transport for the serve gate.
 *
 * Same split as szl-holdings/lyte-lattice `src/lib/grok-contract.ts`: no framework
 * imports and no module-level credential reads, so `node --test` can exercise it
 * against a mocked `fetch`. Retry policy follows the estate transport boundary
 * (szl-holdings/.github `docs/HF_HTTP_TRANSPORT_BOUNDARIES.md`): only 429 and 5xx
 * (plus network failures) retry, attempts are bounded, Retry-After is capped, the
 * final attempt never sleeps, retryable bodies are closed unread, and provider
 * text or exception messages never reach the caller.
 */

export const XAI_CHAT_COMPLETIONS_URL = "https://api.x.ai/v1/chat/completions";

/**
 * The one reviewed model id for the serve gate: request body and receipt fallback.
 * Changing it is a model change and needs its own review and owner canary.
 */
export const DEFAULT_GROK_MODEL = "grok-4.7";

/**
 * Code-reviewed allowlist: the pin plus its single rollback target. SZL_GROK_MODEL
 * may select only these; adding an id here is itself the reviewed model change.
 */
export const ALLOWED_GROK_MODELS: readonly string[] = Object.freeze([DEFAULT_GROK_MODEL, "grok-4.5"]);

export const GATE_UNAVAILABLE = "Gate UNAVAILABLE — no runtime key in this environment.";

/** Same honest UNAVAILABLE shape; never echoes the configured value. */
export const GATE_MODEL_UNAVAILABLE = "Gate UNAVAILABLE — SZL_GROK_MODEL is not a reviewed model id.";

/**
 * Parameters xAI documents as rejected by reasoning models ("Requests that include
 * them return an error"). Every allowed Grok id is a reasoning model, so a payload
 * carrying any of them fails closed before a request instead of spending one.
 */
export const REASONING_REJECTED_PARAMS: readonly string[] = Object.freeze([
  "stop",
  "presence_penalty",
  "frequency_penalty",
  "presencePenalty",
  "frequencyPenalty",
]);

export type GrokModelResolution = { ok: true; model: string } | { ok: false; error: string };

/**
 * Resolve the serve-gate model from the server-side SZL_GROK_MODEL value (the
 * caller passes `process.env.SZL_GROK_MODEL`; never a browser variable). The value
 * is trimmed; empty or whitespace uses DEFAULT_GROK_MODEL. Anything outside
 * ALLOWED_GROK_MODELS (aliases, other case, unreviewed ids) fails closed and never
 * silently falls back to the default.
 */
export function resolveGrokModel(configured: string | undefined): GrokModelResolution {
  const value = configured?.trim();
  if (!value) return { ok: true, model: DEFAULT_GROK_MODEL };
  if (ALLOWED_GROK_MODELS.includes(value)) return { ok: true, model: value };
  return { ok: false, error: GATE_MODEL_UNAVAILABLE };
}

export type GrokPolicy = {
  /** Per-request abort via AbortSignal.timeout (lyte-lattice completeGrok uses 60 s). */
  attemptTimeoutMs: number;
  /** Hard wall-clock cap across every attempt, body read and backoff wait. */
  deadlineMs: number;
  /** Hard cap on requests sent, including the first. */
  maxAttempts: number;
  /** Exponential backoff base and ceiling, before jitter. */
  baseDelayMs: number;
  maxDelayMs: number;
  /** Longest provider Retry-After we will wait; a longer ask fails closed instead. */
  retryAfterCapMs: number;
};

export const GROK_POLICY: Readonly<GrokPolicy> = Object.freeze({
  attemptTimeoutMs: 60_000,
  deadlineMs: 90_000,
  maxAttempts: 3,
  baseDelayMs: 500,
  maxDelayMs: 4_000,
  retryAfterCapMs: 10_000,
});

/** Test seams only; production uses real timers and Math.random. */
export type GrokDeps = {
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
};

export type GrokCall =
  | { ok: true; body: Record<string, unknown>; attempts: number; elapsedMs: number }
  | { ok: false; error: string; attempts: number };

export function isRetryableStatus(status: number): boolean {
  return status === 429 || (status >= 500 && status <= 599);
}

/**
 * Retry-After in milliseconds, from delta-seconds or an HTTP-date. Invalid,
 * negative, fractional or non-finite values return undefined (use backoff).
 */
export function retryAfterMs(value: string | null, nowMs: number = Date.now()): number | undefined {
  if (value === null) return undefined;
  const v = value.trim();
  if (/^\d+$/.test(v)) {
    const ms = Number(v) * 1000;
    return Number.isFinite(ms) ? ms : undefined;
  }
  // Anything else must look like an HTTP-date (starts with a day name), never "1.5" or "-1".
  if (!/^[A-Za-z]/.test(v)) return undefined;
  const at = Date.parse(v);
  return Number.isFinite(at) ? Math.max(0, at - nowMs) : undefined;
}

/** Exponential backoff with equal jitter (half fixed, half random). `retry` is 1-based. */
export function backoffMs(retry: number, policy: GrokPolicy = GROK_POLICY, random: () => number = Math.random): number {
  const ceiling = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** Math.max(0, retry - 1));
  return Math.round(ceiling / 2 + (ceiling / 2) * Math.min(1, Math.max(0, random())));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const sleepFor = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * POST one non-streaming chat completion to xAI. A missing or blank key, a
 * `payload.model` outside ALLOWED_GROK_MODELS, or a parameter that reasoning
 * models reject fails closed before any request. Returns the parsed JSON
 * object on success; every failure is a fixed gate message that never
 * includes the key, the configured model value, the provider body, or an
 * exception message.
 */
export async function postGrok(
  payload: Record<string, unknown>,
  apiKey: string | undefined,
  policy: Readonly<GrokPolicy> = GROK_POLICY,
  deps: GrokDeps = {},
): Promise<GrokCall> {
  const key = apiKey?.trim();
  if (!key) return { ok: false, error: GATE_UNAVAILABLE, attempts: 0 };
  if (typeof payload.model !== "string" || !ALLOWED_GROK_MODELS.includes(payload.model)) {
    return { ok: false, error: GATE_MODEL_UNAVAILABLE, attempts: 0 };
  }
  if (REASONING_REJECTED_PARAMS.some((name) => name in payload)) {
    return {
      ok: false,
      error: "Gate request carries a parameter reasoning models reject. Honest fail-closed.",
      attempts: 0,
    };
  }
  const sleep = deps.sleep ?? sleepFor;
  const random = deps.random ?? Math.random;
  const requestBody = JSON.stringify(payload);
  const started = performance.now();
  const elapsed = () => Math.round(performance.now() - started);
  const timedOut = () => `Gate timeout after ${elapsed()} ms. Honest fail-closed.`;
  const deadline = AbortSignal.timeout(policy.deadlineMs);
  const maxAttempts = Math.max(1, Math.floor(policy.maxAttempts));
  let failure = "Gate unreachable. Honest fail-closed.";
  let attempts = 0;

  while (attempts < maxAttempts) {
    if (deadline.aborted) break;
    attempts += 1;
    const signal = AbortSignal.any([deadline, AbortSignal.timeout(policy.attemptTimeoutMs)]);
    let res: Response | undefined;
    try {
      res = await fetch(XAI_CHAT_COMPLETIONS_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: requestBody,
        signal,
      });
    } catch {
      // Our own abort is a timeout: terminal, because the provider may already be generating.
      if (signal.aborted) return { ok: false, error: timedOut(), attempts };
      failure = `Gate unreachable after ${attempts} attempt${attempts === 1 ? "" : "s"}. Honest fail-closed.`;
    }

    let retryAfter: number | undefined;
    if (res) {
      if (res.ok) {
        const elapsedMs = elapsed();
        let parsed: unknown;
        try {
          parsed = await res.json();
        } catch {
          if (signal.aborted) return { ok: false, error: timedOut(), attempts };
          return { ok: false, error: "Gate returned a malformed completion. Honest fail-closed.", attempts };
        }
        if (!isRecord(parsed)) {
          return { ok: false, error: "Gate returned a malformed completion. Honest fail-closed.", attempts };
        }
        return { ok: true, body: parsed, attempts, elapsedMs };
      }
      await res.body?.cancel().catch(() => undefined);
      if (!isRetryableStatus(res.status)) {
        return { ok: false, error: `Gate error ${res.status}. Honest fail-closed.`, attempts };
      }
      failure = `Gate error ${res.status} after ${attempts} attempt${attempts === 1 ? "" : "s"}. Honest fail-closed.`;
      retryAfter = retryAfterMs(res.headers.get("retry-after"));
      if (retryAfter !== undefined && retryAfter > policy.retryAfterCapMs) {
        return {
          ok: false,
          error: `Gate error ${res.status}; provider asked to wait ${Math.ceil(retryAfter / 1000)} s, over the ${Math.round(policy.retryAfterCapMs / 1000)} s cap. Honest fail-closed.`,
          attempts,
        };
      }
    }

    if (attempts >= maxAttempts) break; // the final attempt never sleeps
    const wait = Math.max(backoffMs(attempts, policy, random), retryAfter ?? 0);
    if (elapsed() + wait >= policy.deadlineMs) break; // never sleep past the deadline
    await sleep(wait);
  }
  return { ok: false, error: failure, attempts };
}
