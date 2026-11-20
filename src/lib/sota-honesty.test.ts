import assert from "node:assert/strict";
import { test } from "node:test";
import { catalogStatusSummary, SOTA_JOBS } from "./sota.ts";

test("curated LIVE labels never imply runtime or signature verification", () => {
  const out = catalogStatusSummary(SOTA_JOBS);
  assert.equal(out.total, SOTA_JOBS.length);
  assert.equal(out.catalogLiveLabels, SOTA_JOBS.filter((j) => j.status === "LIVE").length);
  assert.equal(out.runtimeVerified, false);
  assert.equal(out.signedReceiptVerified, false);
  assert.equal(out.evidenceSource, "CURATED_SOURCE_CATALOG");
});

test("all-LIVE and empty catalog samples remain non-admitted", () => {
  for (const statuses of [[], [{ status: "LIVE" }, { status: "LIVE" }]] as const) {
    const out = catalogStatusSummary(statuses);
    assert.equal(out.catalogLiveLabels, statuses.length);
    assert.equal(out.runtimeVerified, false);
    assert.equal(out.signedReceiptVerified, false);
  }
});
