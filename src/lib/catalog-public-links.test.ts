import assert from "node:assert/strict";
import { test } from "node:test";
import { MODELS, SPACES } from "./catalog.ts";

// The catalog is served publicly and every non-null `github` value is rendered
// as a github.com link. A link to a repository that is not public 404s for
// visitors and discloses a non-public repository name, so each value must be a
// repository that was verified public.
//
// This allowlist was built by checking every `github` value in catalog.ts with
// `gh api repos/<owner>/<name> --jq .visibility` (a 404 counts as not public).
// To add a link: verify the repository is public first, then add it here.
// Hub-only rows use `github: null`.
const VERIFIED_PUBLIC_REPOS: ReadonlySet<string> = new Set([
  "szl-holdings/YARQA-ATTN",
  "szl-holdings/a11oy",
  "szl-holdings/a11oy-factory",
  "szl-holdings/anatomy",
  "szl-holdings/ayllu",
  "szl-holdings/cosmos",
  "szl-holdings/counsel",
  "szl-holdings/david-leads",
  "szl-holdings/energy-attest-holo",
  "szl-holdings/governed-inference-meter",
  "szl-holdings/governed-norm-holo",
  "szl-holdings/governed-receipt-spec",
  "szl-holdings/hatun-mcp",
  "szl-holdings/holographic-unify",
  "szl-holdings/immune",
  "szl-holdings/immune-lattice",
  "szl-holdings/khipu-lab",
  "szl-holdings/killinchu",
  "szl-holdings/lambda-gate-holo",
  "szl-holdings/nexus",
  "szl-holdings/receipt-chain-live",
  "szl-holdings/sda",
  "szl-holdings/szl-atelier",
  "szl-holdings/szl-block-kv",
  "szl-holdings/szl-blocked",
  "szl-holdings/szl-command-lab",
  "szl-holdings/szl-energy-attest",
  "szl-holdings/szl-experiments",
  "szl-holdings/szl-forge",
  "szl-holdings/szl-formulas",
  "szl-holdings/szl-governed-norm",
  "szl-holdings/szl-govsign",
  "szl-holdings/szl-guardrail-receipt",
  "szl-holdings/szl-invariants",
  "szl-holdings/szl-kernels",
  "szl-holdings/szl-kernels-live",
  "szl-holdings/szl-khipu",
  "szl-holdings/szl-lambda-gate",
  "szl-holdings/szl-maskmod",
  "szl-holdings/szl-nemo",
  "szl-holdings/szl-ouroboros",
  "szl-holdings/szl-provctl",
  "szl-holdings/szl-provctl-live",
  "szl-holdings/szl-quant",
  "szl-holdings/szl-real-estate",
  "szl-holdings/szl-receipt-attn",
  "szl-holdings/szl-router",
  "szl-holdings/szl-second-brain",
  "szl-holdings/szl-serve",
  "szl-holdings/szl-sovereign-os",
  "szl-holdings/yarqa",
]);

const REPO_SLUG = /^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/;

function catalogLinks(): { where: string; github: string | null }[] {
  return [
    ...SPACES.map((s) => ({ where: `SPACES[${s.id}]`, github: s.github })),
    ...MODELS.map((m) => ({ where: `MODELS[${m.id}]`, github: m.github })),
  ];
}

test("every catalog github link points at a verified-public repository", () => {
  const offenders = catalogLinks()
    .filter((row) => row.github !== null && !VERIFIED_PUBLIC_REPOS.has(row.github))
    .map((row) => row.where);
  assert.deepEqual(
    offenders,
    [],
    "catalog github links outside the verified-public allowlist; verify visibility, then allowlist or set github: null",
  );
});

test("catalog github links are bare owner/name slugs", () => {
  for (const row of catalogLinks()) {
    if (row.github === null) continue;
    assert.match(row.github, REPO_SLUG, `${row.where} github is not an owner/name slug`);
  }
});

test("the allowlist does not go stale", () => {
  const used = new Set(catalogLinks().flatMap((row) => (row.github === null ? [] : [row.github])));
  const unused = [...VERIFIED_PUBLIC_REPOS].filter((repo) => !used.has(repo));
  assert.deepEqual(unused, [], "allowlisted repositories no longer referenced by the catalog; drop them");
});
