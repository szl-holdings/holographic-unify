// SPDX-License-Identifier: Apache-2.0
/**
 * Source-only proposal for the holographic evidence rail.
 * It categorizes structural claims, NEVER verifies signatures or live runtime.
 * A caller-provided clock/revision is NOT an independent attestation.
 */
export type WitnessState =
  | "UNAVAILABLE" | "DUPLICATE" | "INVALID" | "REVISION_MISMATCH"
  | "FUTURE" | "STALE" | "UNVERIFIED" | "OBSERVED_UNVERIFIED";

export type WitnessNode = Readonly<{
  canonicalId: string;
  state: WitnessState;
  ageMs: number | null;
  receiptHashDeclared: boolean;
  runtimeVerified: false;
  signatureVerified: false;
}>;

export type WitnessLensResult = Readonly<{
  gate: "SOURCE_ONLY" | "INVALID_CONTRACT";
  nodes: readonly WitnessNode[];
  unknownObservations: number;
  coverage: Readonly<{ numerator: number; denominator: number; fraction: number | null }>;
  coverageBasis: "FRESH_HASH_DECLARATIONS_NOT_VERIFIED";
  runtimeQualified: false;
  independentSignatureVerified: false;
}>;

export type WitnessLensInput = Readonly<{
  expectedIds: readonly string[];
  expectedRevision: string;
  nowEpochMs: number;
  maxAgeMs: number;
  observations: readonly unknown[];
}>;

/** Documented untrusted wire shape, not a validated identity or signed receipt. */
export type WitnessObservation = Readonly<{
  canonicalId: string;
  sourceRevision: string;
  observedAtUtc: string;
  receiptSha256?: string | null;
}>;

const ID = /^[A-Za-z0-9][A-Za-z0-9_.:/-]{0,127}$/;
const GIT_SHA = /^[0-9a-f]{40}$/;
const RECEIPT_SHA = /^[0-9a-f]{64}$/;
const UTC_SECOND = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/;
const empty = (denominator = 0) => ({
  numerator: 0, denominator, fraction: null as number | null,
});
const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function validInput(value: unknown): value is WitnessLensInput {
  if (!isRecord(value)) return false;
  const { expectedIds, expectedRevision, nowEpochMs, maxAgeMs, observations } = value;
  return Array.isArray(expectedIds) && expectedIds.length > 0 && expectedIds.length <= 256
    && expectedIds.every((id: unknown) => typeof id === "string" && ID.test(id))
    && new Set(expectedIds).size === expectedIds.length
    && typeof expectedRevision === "string" && GIT_SHA.test(expectedRevision)
    && typeof nowEpochMs === "number" && Number.isSafeInteger(nowEpochMs) && nowEpochMs >= 0
    && typeof maxAgeMs === "number" && Number.isSafeInteger(maxAgeMs)
    && maxAgeMs >= 1 && maxAgeMs <= 300000
    && Array.isArray(observations) && observations.length <= 512;
}

function utcEpoch(value: unknown): number | null {
  if (typeof value !== "string" || !UTC_SECOND.test(value)) return null;
  const epoch = Date.parse(value);
  return Number.isFinite(epoch) && new Date(epoch).toISOString() === value.replace("Z", ".000Z")
    ? epoch : null;
}

function node(id: string, state: WitnessState, ageMs: number | null = null,
  receiptHashDeclared = false): WitnessNode {
  return { canonicalId: id, state, ageMs, receiptHashDeclared,
    runtimeVerified: false, signatureVerified: false };
}

/**
 * No network, ambient clock, signature trust, model execution or provider writes.
 * Duplicates have unconditional hard-refusal precedence even over malformed peers.
 * Coverage counts only fresh declarations with a syntactically valid receipt hash;
 * it is NOT observation quality, cryptographic proof or runtime health.
 */
export function evaluateWitnessLens(input: unknown): WitnessLensResult {
  const refused = (): WitnessLensResult => ({
    gate: "INVALID_CONTRACT", nodes: [], unknownObservations: 0,
    coverage: empty(), coverageBasis: "FRESH_HASH_DECLARATIONS_NOT_VERIFIED",
    runtimeQualified: false, independentSignatureVerified: false,
  });
  if (!validInput(input)) return refused();

  const expected = new Set(input.expectedIds);
  const grouped = new Map<string, Record<string, unknown>[]>();
  let unknownObservations = 0;
  for (const observation of input.observations) {
    if (!isRecord(observation) || typeof observation.canonicalId !== "string" ||
        !expected.has(observation.canonicalId)) {
      unknownObservations++;
      continue;
    }
    const group = grouped.get(observation.canonicalId) ?? [];
    group.push(observation);
    grouped.set(observation.canonicalId, group);
  }

  const nodes = input.expectedIds.map((id): WitnessNode => {
    const group = grouped.get(id) ?? [];
    if (!group.length) return node(id, "UNAVAILABLE");
    if (group.length > 1) return node(id, "DUPLICATE");
    const claim = group[0];
    if (typeof claim.sourceRevision !== "string" || !GIT_SHA.test(claim.sourceRevision))
      return node(id, "INVALID");
    if (claim.sourceRevision !== input.expectedRevision)
      return node(id, "REVISION_MISMATCH");
    const timestamp = utcEpoch(claim.observedAtUtc);
    if (timestamp === null) return node(id, "INVALID");
    const age = input.nowEpochMs - timestamp;
    if (age < 0) return node(id, "FUTURE", age);
    if (age > input.maxAgeMs) return node(id, "STALE", age);
    if (claim.receiptSha256 == null) return node(id, "UNVERIFIED", age);
    if (typeof claim.receiptSha256 !== "string" || !RECEIPT_SHA.test(claim.receiptSha256))
      return node(id, "INVALID", age);
    return node(id, "OBSERVED_UNVERIFIED", age, true);
  });
  const numerator = nodes.filter((x) => x.state === "OBSERVED_UNVERIFIED").length;
  return { gate: "SOURCE_ONLY", nodes, unknownObservations,
    coverage: { numerator, denominator: nodes.length, fraction: numerator / nodes.length },
    coverageBasis: "FRESH_HASH_DECLARATIONS_NOT_VERIFIED",
    runtimeQualified: false, independentSignatureVerified: false };
}
