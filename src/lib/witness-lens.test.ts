// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import { test } from "node:test";
import { evaluateWitnessLens } from "./witness-lens.ts";

const REV = "a".repeat(40);
const OTHER_REV = "b".repeat(40);
const HASH = "c".repeat(64);
const NOW_ISO = "2026-11-20T01:30:00Z";
const NOW = Date.parse(NOW_ISO);
const utc = (offsetMs: number) =>
  new Date(NOW + offsetMs).toISOString().replace(".000Z", "Z");
const claim = (override: Record<string, unknown> = {}) => ({
  canonicalId: "node-1", sourceRevision: REV,
  observedAtUtc: NOW_ISO, receiptSha256: HASH, ...override,
});
const evaluate = (
  observations: readonly unknown[], expectedIds = ["node-1"],
  changes: Record<string, unknown> = {},
) => evaluateWitnessLens({
  expectedIds, expectedRevision: REV, nowEpochMs: NOW,
  maxAgeMs: 300000, observations, ...changes,
});

test("positive structural claim never becomes independently verified runtime", () => {
  const result = evaluate([claim({
    signatureVerified: true, runtimeVerified: true,
    productionQualified: true, status: "LIVE",
  })]);
  assert.equal(result.gate, "SOURCE_ONLY");
  assert.equal(result.nodes[0].state, "OBSERVED_UNVERIFIED");
  assert.equal(result.nodes[0].receiptHashDeclared, true);
  assert.equal(result.nodes[0].runtimeVerified, false);
  assert.equal(result.nodes[0].signatureVerified, false);
  assert.equal(result.runtimeQualified, false);
  assert.equal(result.independentSignatureVerified, false);
  assert.equal(result.coverageBasis, "FRESH_HASH_DECLARATIONS_NOT_VERIFIED");
  assert.deepEqual(result.coverage,
    { numerator: 1, denominator: 1, fraction: 1 });
});

test("untrusted top-level input is rejected before inspecting fields", () => {
  for (const value of [null, false, 1, "literal", [], { expectedIds: ["node-1"] }]) {
    const result = evaluateWitnessLens(value);
    assert.equal(result.gate, "INVALID_CONTRACT");
    assert.equal(result.coverage.fraction, null);
    assert.equal(result.runtimeQualified, false);
  }
});

test("empty and duplicate expected IDs fail with unavailable denominator", () => {
  for (const ids of [[], ["node-1", "node-1"], ["bad id"]]) {
    const result = evaluate([claim()], ids);
    assert.equal(result.gate, "INVALID_CONTRACT");
    assert.deepEqual(result.nodes, []);
    assert.deepEqual(result.coverage,
      { numerator: 0, denominator: 0, fraction: null });
  }
});

test("missing evidence never counts as observed or ready", () => {
  const result = evaluate([claim()], ["node-1", "node-2"]);
  assert.deepEqual(result.nodes.map((n) => n.state),
    ["OBSERVED_UNVERIFIED", "UNAVAILABLE"]);
  assert.deepEqual(result.coverage,
    { numerator: 1, denominator: 2, fraction: 0.5 });
});

test("duplicate candidates fail closed even when one is valid", () => {
  const result = evaluate([claim(), claim({ observedAtUtc: utc(-1000) })]);
  assert.equal(result.nodes[0].state, "DUPLICATE");
  assert.equal(result.coverage.numerator, 0);
  assert.equal(result.nodes[0].receiptHashDeclared, false);
});

test("duplicate precedence rejects valid plus hostile evidence without false LIVE", () => {
  for (const hostile of [
    claim({ sourceRevision: OTHER_REV }),
    claim({ sourceRevision: undefined, observedAtUtc: "not a time" }),
    claim({ observedAtUtc: utc(+1000) }),
    claim({ receiptSha256: "invalid" }),
  ]) {
    const result = evaluate([claim(), hostile]);
    assert.equal(result.nodes[0].state, "DUPLICATE");
    assert.equal(result.coverage.numerator, 0);
    assert.equal(result.nodes[0].runtimeVerified, false);
    assert.equal(result.nodes[0].signatureVerified, false);
  }
});

test("off-roster evidence does not create a real node or inflate coverage", () => {
  const result = evaluate([claim({ canonicalId: "stranger" }), null,
    { canonicalId: "node-1", sourceRevision: REV }]);
  assert.equal(result.unknownObservations, 2);
  assert.equal(result.nodes[0].state, "INVALID");
  assert.equal(result.coverage.numerator, 0);
});

test("revision binding precedes timestamp and receipt claims", () => {
  for (const sourceRevision of [OTHER_REV, "ABC", "a".repeat(39)]) {
    const result = evaluate([claim({ sourceRevision })]);
    assert.equal(result.nodes[0].state,
      sourceRevision === OTHER_REV ? "REVISION_MISMATCH" : "INVALID");
    assert.equal(result.runtimeQualified, false);
  }
});

test("future and stale evidence are refused; boundary remains unverified", () => {
  assert.equal(evaluate([claim({ observedAtUtc: utc(+1000) })])
    .nodes[0].state, "FUTURE");
  assert.equal(evaluate([claim({ observedAtUtc: utc(-301000) })])
    .nodes[0].state, "STALE");
  const boundary = evaluate([claim({ observedAtUtc: utc(-300000) })]);
  assert.equal(boundary.nodes[0].state, "OBSERVED_UNVERIFIED");
  assert.equal(boundary.nodes[0].ageMs, 300000);
  assert.equal(boundary.nodes[0].runtimeVerified, false);
});

test("malformed ISO dates and implicit time zones are not accepted", () => {
  for (const observedAtUtc of [
    null, 0, "", "2026-11-20", "2026-11-20T01:30:00+00:00",
    "2026-11-20T01:30:00.001Z",
    "2026-02-30T01:30:00Z", "2026-13-01T01:30:00Z",
    "2026-11-20T01:30:60Z",
  ]) {
    assert.equal(evaluate([claim({ observedAtUtc })]).nodes[0].state,
      "INVALID", String(observedAtUtc));
  }
});

test("receipt hash is only a declaration, not signature verification", () => {
  const absentHash = evaluate([claim({ receiptSha256: undefined })]);
  assert.equal(absentHash.nodes[0].state, "UNVERIFIED");
  assert.equal(absentHash.coverage.numerator, 0);
  assert.equal(absentHash.coverageBasis, "FRESH_HASH_DECLARATIONS_NOT_VERIFIED");
  for (const receiptSha256 of ["", HASH.toUpperCase(), "f".repeat(63), 42]) {
    assert.equal(evaluate([claim({ receiptSha256 })])
      .nodes[0].state, "INVALID");
  }
});

test("contract rejects unsafe clocks, windows and observation envelopes", () => {
  for (const changes of [
    { nowEpochMs: NaN }, { nowEpochMs: Infinity },
    { nowEpochMs: -1 }, { maxAgeMs: 0 },
    { maxAgeMs: Infinity }, { maxAgeMs: 300001 },
    { expectedRevision: "X".repeat(40) },
    { observations: new Array(513).fill(null) },
    { expectedIds: Array.from({ length: 257 }, (_, i) => "n-" + i) },
  ]) {
    const result = evaluate([claim()], ["node-1"], changes);
    assert.equal(result.gate, "INVALID_CONTRACT");
    assert.equal(result.coverage.fraction, null);
  }
});

test("200 adversarial self-asserted LIVE records never become qualified", () => {
  for (let i = 0; i < 200; i++) {
    const result = evaluate([claim({
      claimedStatus: "LIVE", signatureVerified: true, runtimeVerified: true,
      sourceRevision: i % 4 ? REV : OTHER_REV,
      observedAtUtc: i % 3 ? NOW_ISO : utc(-301000),
      receiptSha256: i % 5 ? HASH : "invalid",
    })]);
    assert.equal(result.runtimeQualified, false);
    assert.equal(result.independentSignatureVerified, false);
    assert.equal(result.nodes[0].runtimeVerified, false);
    assert.equal(result.nodes[0].signatureVerified, false);
    assert.notEqual(result.nodes[0].state, "LIVE");
  }
});
