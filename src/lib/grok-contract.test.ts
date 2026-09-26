import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ALLOWED_GROK_MODELS,
  DEFAULT_GROK_MODEL,
  GATE_MODEL_UNAVAILABLE,
  GATE_UNAVAILABLE,
  GROK_POLICY,
  REASONING_REJECTED_PARAMS,
  XAI_CHAT_COMPLETIONS_URL,
  backoffMs,
  postGrok,
  resolveGrokModel,
  retryAfterMs,
  type GrokPolicy,
} from "./grok-contract.ts";

const KEY = "test-only-placeholder";
const payload = { model: DEFAULT_GROK_MODEL, max_tokens: 24, messages: [{ role: "user", content: "hi" }] };
type Init = RequestInit | undefined;

function completion() {
  return Response.json({
    model: DEFAULT_GROK_MODEL,
    choices: [{ message: { content: "measured" }, finish_reason: "stop" }],
    usage: { prompt_tokens: 3, completion_tokens: 1 },
  });
}
/** Error response whose body echoes the key, so a leak would be visible. */
function status(code: number, headers: Record<string, string> = {}, onCancel?: () => void) {
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      c.enqueue(new TextEncoder().encode(JSON.stringify({ error: `provider echo ${KEY}` })));
    },
    cancel() {
      onCancel?.();
    },
  });
  return new Response(body, { status: code, headers });
}
/** A provider that never answers; holds the event loop until our signal aborts. */
function hang(init: Init) {
  return new Promise<Response>((_, reject) => {
    const hold = setInterval(() => undefined, 1000);
    const signal = init?.signal as AbortSignal;
    signal.addEventListener(
      "abort",
      () => {
        clearInterval(hold);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
function recorder() {
  const waits: number[] = [];
  return { waits, deps: { sleep: async (ms: number) => void waits.push(ms), random: () => 0.5 } };
}
const policy = (over: Partial<GrokPolicy> = {}): GrokPolicy => ({ ...GROK_POLICY, ...over });
function assertNoLeak(error: string) {
  assert.doesNotMatch(error, new RegExp(KEY));
  assert.doesNotMatch(error, /provider echo/);
}

test("policy stays inside the estate transport bounds", () => {
  assert.ok(GROK_POLICY.maxAttempts >= 1 && GROK_POLICY.maxAttempts <= 10);
  assert.ok(GROK_POLICY.retryAfterCapMs > 0 && GROK_POLICY.retryAfterCapMs <= 30_000);
  assert.ok(GROK_POLICY.attemptTimeoutMs > 0 && GROK_POLICY.attemptTimeoutMs <= GROK_POLICY.deadlineMs);
  assert.ok(Number.isFinite(GROK_POLICY.deadlineMs));
  assert.equal(DEFAULT_GROK_MODEL, "grok-4.7");
  assert.deepEqual(ALLOWED_GROK_MODELS, ["grok-4.7", "grok-4.5"]);
  assert.ok(Object.isFrozen(ALLOWED_GROK_MODELS));
  assert.ok(Object.isFrozen(GROK_POLICY));
});

test("missing or blank key fails closed without fetching", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("must not fetch");
  });
  for (const key of [undefined, "", "   \n"]) {
    const out = await postGrok(payload, key);
    assert.deepEqual(out, { ok: false, error: GATE_UNAVAILABLE, attempts: 0 });
  }
  assert.equal(stub.mock.callCount(), 0);
});

test("sends the pinned model, key only in Authorization, under an abort signal", async (t) => {
  let seenUrl: unknown;
  let seenInit: Init;
  t.mock.method(globalThis, "fetch", async (url: unknown, init?: RequestInit) => {
    seenUrl = url;
    seenInit = init;
    return completion();
  });
  const out = await postGrok(payload, `  ${KEY}\n`);
  assert.equal(out.ok, true);
  assert.equal(seenUrl, XAI_CHAT_COMPLETIONS_URL);
  assert.equal(seenInit?.method, "POST");
  assert.ok(seenInit?.signal instanceof AbortSignal);
  const headers = seenInit?.headers as Record<string, string>;
  assert.equal(headers.Authorization, `Bearer ${KEY}`);
  const sent = JSON.parse(String(seenInit?.body));
  assert.equal(sent.model, "grok-4.7");
  for (const name of REASONING_REJECTED_PARAMS) assert.equal(name in sent, false, `${name} must not be sent`);
  assert.doesNotMatch(String(seenInit?.body), new RegExp(KEY));
  if (out.ok) {
    assert.equal(out.attempts, 1);
    assert.ok(out.elapsedMs >= 0);
    assert.equal((out.body.choices as { message: { content: string } }[])[0].message.content, "measured");
  }
});

test("SZL_GROK_MODEL: blank uses the default, the rollback target is honoured, trimmed", () => {
  for (const blank of [undefined, "", "   \n"]) {
    assert.deepEqual(resolveGrokModel(blank), { ok: true, model: "grok-4.7" });
  }
  assert.deepEqual(resolveGrokModel("grok-4.7"), { ok: true, model: "grok-4.7" });
  assert.deepEqual(resolveGrokModel("grok-4.5"), { ok: true, model: "grok-4.5" });
  assert.deepEqual(resolveGrokModel("  grok-4.5\n"), { ok: true, model: "grok-4.5" });
});

test("SZL_GROK_MODEL outside the allowlist fails closed and never falls back to the default", () => {
  // grok-4.6 is a real, well-formed xAI id that is not reviewed for this surface.
  for (const bad of ["grok-4.6", "grok-4.7-latest", "grok-latest", "GROK-4.7", "grok-4", "grok-4.5 grok-4.7", "grok-4.70"]) {
    const out = resolveGrokModel(bad);
    assert.deepEqual(out, { ok: false, error: GATE_MODEL_UNAVAILABLE }, `"${bad}"`);
    if (!out.ok) assert.equal(out.error.includes(bad), false, "the configured value is never echoed");
  }
});

test("the rollback target is sent when SZL_GROK_MODEL selects it", async (t) => {
  let sentModel: unknown;
  t.mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => {
    sentModel = JSON.parse(String(init?.body)).model;
    return completion();
  });
  const resolved = resolveGrokModel("grok-4.5");
  assert.equal(resolved.ok, true);
  if (!resolved.ok) return;
  const out = await postGrok({ ...payload, model: resolved.model }, KEY);
  assert.equal(out.ok, true);
  assert.equal(sentModel, "grok-4.5");
});

test("an unlisted model id fails closed with zero fetch calls, even with a key", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("must not fetch");
  });
  for (const model of ["grok-4.6", "grok-4.7-latest", "", undefined, 47]) {
    const out = await postGrok({ ...payload, model }, KEY);
    assert.deepEqual(out, { ok: false, error: GATE_MODEL_UNAVAILABLE, attempts: 0 });
  }
  assert.equal(stub.mock.callCount(), 0);
});

test("parameters reasoning models reject fail closed with zero fetch calls", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("must not fetch");
  });
  for (const name of REASONING_REJECTED_PARAMS) {
    const out = await postGrok({ ...payload, [name]: name === "stop" ? ["\n\n\n"] : 0 }, KEY);
    assert.equal(out.ok, false);
    if (!out.ok) {
      assert.equal(out.attempts, 0);
      assert.match(out.error, /reasoning models reject/);
    }
  }
  assert.equal(stub.mock.callCount(), 0);
});

test("per-request timeout aborts and fails closed without retry", { timeout: 5_000 }, async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => hang(init));
  const { waits, deps } = recorder();
  const out = await postGrok(payload, KEY, policy({ attemptTimeoutMs: 25 }), deps);
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.match(out.error, /timeout/i);
    assertNoLeak(out.error);
    assert.equal(out.attempts, 1);
  }
  assert.equal(stub.mock.callCount(), 1);
  assert.deepEqual(waits, []);
});

test("total wall-clock deadline caps a hung provider even with a long per-request timeout", { timeout: 5_000 }, async (t) => {
  t.mock.method(globalThis, "fetch", async (_url: unknown, init?: RequestInit) => hang(init));
  const t0 = performance.now();
  const out = await postGrok(payload, KEY, policy({ attemptTimeoutMs: 60_000, deadlineMs: 40 }));
  assert.equal(out.ok, false);
  if (!out.ok) assert.match(out.error, /timeout/i);
  assert.ok(performance.now() - t0 < 5_000);
});

test("429 then 200 succeeds after one retry and closes the 429 body unread", async (t) => {
  let cancelled = false;
  const replies = [() => status(429, {}, () => (cancelled = true)), completion];
  const stub = t.mock.method(globalThis, "fetch", async () => replies.shift()!());
  const { waits, deps } = recorder();
  const out = await postGrok(payload, KEY, GROK_POLICY, deps);
  assert.equal(out.ok, true);
  if (out.ok) assert.equal(out.attempts, 2);
  assert.equal(stub.mock.callCount(), 2);
  assert.equal(waits.length, 1);
  assert.equal(cancelled, true);
});

test("Retry-After is honoured when longer than the backoff (seconds and HTTP-date)", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => completion());
  for (const [header, atLeast] of [
    ["3", 3000],
    [new Date(Date.now() + 5_000).toUTCString(), 3_000],
  ] as const) {
    const replies = [() => status(429, { "Retry-After": header }), completion];
    stub.mock.mockImplementation(async () => replies.shift()!());
    const { waits, deps } = recorder();
    const out = await postGrok(payload, KEY, GROK_POLICY, deps);
    assert.equal(out.ok, true);
    assert.equal(waits.length, 1);
    assert.ok(waits[0] >= atLeast, `waited ${waits[0]} ms for Retry-After ${header}`);
    assert.ok(waits[0] <= GROK_POLICY.retryAfterCapMs);
  }
  // 503 carries Retry-After too.
  const replies = [() => status(503, { "Retry-After": "2" }), completion];
  stub.mock.mockImplementation(async () => replies.shift()!());
  const { waits, deps } = recorder();
  assert.equal((await postGrok(payload, KEY, GROK_POLICY, deps)).ok, true);
  assert.deepEqual(waits, [2000]);
});

test("Retry-After beyond the cap fails closed instead of retrying early", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => status(429, { "Retry-After": "120" }));
  const { waits, deps } = recorder();
  const out = await postGrok(payload, KEY, GROK_POLICY, deps);
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.match(out.error, /429/);
    assert.match(out.error, /cap/);
    assertNoLeak(out.error);
  }
  assert.equal(stub.mock.callCount(), 1);
  assert.deepEqual(waits, []);
});

test("400 and other non-429 4xx are never retried", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => status(400));
  for (const code of [400, 401, 403, 404, 408, 409, 413, 422]) {
    stub.mock.resetCalls();
    stub.mock.mockImplementation(async () => status(code, { "Retry-After": "1" }));
    const { waits, deps } = recorder();
    const out = await postGrok(payload, KEY, GROK_POLICY, deps);
    assert.deepEqual(out, { ok: false, error: `Gate error ${code}. Honest fail-closed.`, attempts: 1 });
    assert.equal(stub.mock.callCount(), 1, `HTTP ${code} must not retry`);
    assert.deepEqual(waits, []);
  }
});

test("retries are exhausted at maxAttempts and the final attempt never sleeps", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => status(503));
  const { waits, deps } = recorder();
  const out = await postGrok(payload, KEY, GROK_POLICY, deps);
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.attempts, GROK_POLICY.maxAttempts);
    assert.match(out.error, /Gate error 503 after 3 attempts/);
    assertNoLeak(out.error);
  }
  assert.equal(stub.mock.callCount(), GROK_POLICY.maxAttempts);
  assert.equal(waits.length, GROK_POLICY.maxAttempts - 1);
  // Exponential: the second wait's jitter window starts where the first one's ends.
  assert.ok(waits[1] >= waits[0]);
});

test("network errors retry, then fail closed without echoing the exception", async (t) => {
  const replies = [
    () => {
      throw new TypeError("fetch failed: private diagnostic");
    },
    completion,
  ];
  const stub = t.mock.method(globalThis, "fetch", async () => replies.shift()!());
  const { deps } = recorder();
  const ok = await postGrok(payload, KEY, GROK_POLICY, deps);
  assert.equal(ok.ok, true);
  assert.equal(stub.mock.callCount(), 2);

  stub.mock.resetCalls();
  stub.mock.mockImplementation(async () => {
    throw new TypeError("fetch failed: private diagnostic");
  });
  const out = await postGrok(payload, KEY, GROK_POLICY, recorder().deps);
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.match(out.error, /unreachable after 3 attempts/);
    assert.doesNotMatch(out.error, /private diagnostic/);
  }
  assert.equal(stub.mock.callCount(), GROK_POLICY.maxAttempts);
});

test("a wait that would cross the deadline is not taken", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => status(503, { "Retry-After": "5" }));
  const { waits, deps } = recorder();
  const out = await postGrok(payload, KEY, policy({ deadlineMs: 1_000 }), deps);
  assert.equal(out.ok, false);
  if (!out.ok) assert.match(out.error, /Gate error 503 after 1 attempt\./);
  assert.equal(stub.mock.callCount(), 1);
  assert.deepEqual(waits, []);
});

test("malformed 200 bodies fail closed without retry", async (t) => {
  const stub = t.mock.method(globalThis, "fetch", async () => new Response("not json", { status: 200 }));
  for (const make of [() => new Response("not json", { status: 200 }), () => Response.json(null), () => Response.json([1])]) {
    stub.mock.resetCalls();
    stub.mock.mockImplementation(async () => make());
    const out = await postGrok(payload, KEY, GROK_POLICY, recorder().deps);
    assert.equal(out.ok, false);
    if (!out.ok) assert.match(out.error, /malformed/);
    assert.equal(stub.mock.callCount(), 1);
  }
});

test("retryAfterMs accepts delta-seconds and HTTP-dates, rejects everything else", () => {
  const now = Date.parse("2026-09-26T00:00:00Z");
  assert.equal(retryAfterMs(null, now), undefined);
  assert.equal(retryAfterMs("2", now), 2000);
  assert.equal(retryAfterMs(" 0 ", now), 0);
  assert.equal(retryAfterMs("Sat, 26 Sep 2026 00:00:07 GMT", now), 7000);
  assert.equal(retryAfterMs("Fri, 25 Sep 2026 23:59:00 GMT", now), 0);
  for (const bad of ["", "-1", "1.5", "+3", "abc", "Infinity", "NaN", "1e3"])
    assert.equal(retryAfterMs(bad, now), undefined, `"${bad}"`);
});

test("backoffMs is exponential, jittered within [half, full] and capped", () => {
  const p = policy({ baseDelayMs: 500, maxDelayMs: 4_000 });
  assert.equal(backoffMs(1, p, () => 0), 250);
  assert.equal(backoffMs(1, p, () => 1), 500);
  assert.equal(backoffMs(2, p, () => 0), 500);
  assert.equal(backoffMs(2, p, () => 1), 1000);
  assert.equal(backoffMs(10, p, () => 1), 4_000);
  assert.equal(backoffMs(10, p, () => 0), 2_000);
  assert.equal(backoffMs(1, p, () => 7), 500);
});
