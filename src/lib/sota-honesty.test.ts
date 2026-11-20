import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { catalogStatusLabel, catalogStatusSummary, SOTA_JOBS } from "./sota.ts";

test("curated LIVE labels never imply runtime or signature verification", () => {
  const out = catalogStatusSummary(SOTA_JOBS);
  assert.equal(out.total, SOTA_JOBS.length);
  assert.equal(out.catalogLiveLabels, SOTA_JOBS.filter((j) => j.status === "LIVE").length);
  assert.equal(out.runtimeVerified, false);
  assert.equal(out.signedReceiptVerified, false);
  assert.equal(out.evidenceSource, "CURATED_SOURCE_CATALOG");
});

test("catalog status display never implies authenticated runtime", () => {
  assert.equal(catalogStatusLabel("LIVE"), "CATALOG LIVE");
  for (const status of ["HOLOGRAM", "ROADMAP", "REFUSED"] as const) {
    assert.equal(catalogStatusLabel(status), status);
  }
});

test("atlas uses curated labels and visible source-only disclosure", () => {
  const source = readFileSync(new URL("../components/sota-atlas.tsx", import.meta.url), "utf8");
  assert.match(source, /<Count label="CATALOG LIVE" value=\{SOTA_COUNTS\.live \+ SOFTWARE_COUNTS\.live\}/);
  assert.match(source, /\{catalogStatusLabel\(h\.status\)\}/);
  assert.match(source, /\{catalogStatusLabel\(s\)\}/);
  assert.match(source, /role="note"/);
  assert.match(source, /Curated catalog labels only/);
});

test("all-LIVE and empty catalog samples remain non-admitted", () => {
  for (const statuses of [[], [{ status: "LIVE" }, { status: "LIVE" }]] as const) {
    const out = catalogStatusSummary(statuses);
    assert.equal(out.catalogLiveLabels, statuses.length);
    assert.equal(out.runtimeVerified, false);
    assert.equal(out.signedReceiptVerified, false);
  }
});
