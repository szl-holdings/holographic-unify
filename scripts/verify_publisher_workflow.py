#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Fail-closed static contract for the canonical Hugging Face publisher.

This verifier performs no network access, reads no credentials, and treats the
workflow, publisher, runtime honesty source, and exact-candidate CI as one
source-attribution boundary.
"""
from __future__ import annotations

import ast
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "deploy-hf-space.yml"
CI_WORKFLOW = ROOT / ".github" / "workflows" / "ci.yml"
PUBLISHER = ROOT / "scripts" / "publish_space.py"
SERVER = ROOT / "space" / "server.py"
EXPECTED_REPOSITORY = "szl-holdings/holographic-unify"
EXPECTED_SPACE = "SZLHOLDINGS/holographic-unify"
SHA_PIN = re.compile(r"^[0-9a-f]{40}$")
USES = re.compile(r"^\s*uses:\s*([^@\s]+)@([^\s#]+)", re.MULTILINE)


class ContractError(RuntimeError):
    """Raised when source attribution or evidence retention weakens."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def python_invokes(workflow: str, script: str, *, suffix: str = "") -> bool:
    pattern = rf"python(?:\s+-\S+)*\s+{re.escape(script)}{re.escape(suffix)}(?:\s|$)"
    return re.search(pattern, workflow, re.MULTILINE) is not None


def require_pinned_actions(workflow: str, *, label: str) -> None:
    action_refs = USES.findall(workflow)
    require(action_refs, f"{label} contains no reusable action references")
    for action, ref in action_refs:
        require(
            SHA_PIN.fullmatch(ref) is not None,
            f"{label} contains mutable action reference: {action}@{ref}",
        )


def main() -> int:
    workflow = WORKFLOW.read_text(encoding="utf-8")
    ci = CI_WORKFLOW.read_text(encoding="utf-8")
    publisher = PUBLISHER.read_text(encoding="utf-8")
    server = SERVER.read_text(encoding="utf-8")
    ast.parse(publisher, filename=str(PUBLISHER))
    ast.parse(server, filename=str(SERVER))

    require("pull_request_target" not in workflow, "publisher must not use pull_request_target")
    require("contents: write" not in workflow, "publisher repository permissions must remain read-only")
    require("secrets: inherit" not in workflow, "publisher must not inherit an unbounded secret set")
    require("permissions:\n  contents: read" in workflow, "publisher requires explicit contents: read")
    require(
        "if: github.repository == 'szl-holdings/holographic-unify' && github.ref == 'refs/heads/main'"
        in workflow,
        "publisher job must be bound to the canonical repository and protected main",
    )
    require("ref: ${{ github.sha }}" in workflow, "checkout must use the exact triggering SHA")
    require("ref: main" not in workflow, "publisher must not race a moving main ref")
    require("persist-credentials: false" in workflow, "checkout credentials must not persist")
    require(
        'test "$GITHUB_REF" = "refs/heads/main"' in workflow,
        "publisher must prove the protected-main ref",
    )
    require(
        'test "$(git rev-parse HEAD)" = "$GITHUB_SHA"' in workflow,
        "publisher must prove the checked-out commit",
    )
    require(
        python_invokes(workflow, "scripts/verify_space.py"),
        "runtime closure verifier is missing",
    )
    require(
        python_invokes(workflow, "scripts/verify_publisher_workflow.py"),
        "publisher self-verification is missing",
    )
    require(
        python_invokes(workflow, "scripts/publish_space.py", suffix=" --apply"),
        "publisher apply path is missing",
    )
    require("if: always()" in workflow, "deployment receipt must be retained on failure")
    require(
        'Path("artifacts/hf-publish-receipt.json")' in workflow,
        "bounded failure receipt path is missing",
    )
    require(
        '"status": "FAILED_BEFORE_FINAL_RECEIPT"' in workflow,
        "pre-publication failures must remain explicit",
    )
    require("set -x" not in workflow, "publisher must not enable shell trace around credentials")
    require('echo "$HF_TOKEN"' not in workflow, "publisher must not print the credential")
    require_pinned_actions(workflow, label="publisher workflow")

    require("pull_request_target" not in ci, "CI must not use pull_request_target")
    require(
        "SOURCE_SHA: ${{ github.event.pull_request.head.sha || github.sha }}" in ci,
        "CI must bind pull-request checks to the exact candidate head",
    )
    require("ref: ${{ env.SOURCE_SHA }}" in ci, "CI checkout is not exact-head bound")
    require("persist-credentials: false" in ci, "CI checkout credentials must not persist")
    require(
        'test "$(git rev-parse HEAD)" = "$SOURCE_SHA"' in ci,
        "CI must prove the checked-out candidate",
    )
    require(
        python_invokes(ci, "scripts/verify_publisher_workflow.py"),
        "CI does not enforce the publisher contract",
    )
    require_pinned_actions(ci, label="CI workflow")

    require(
        f'SPACE_ID = "{EXPECTED_SPACE}"' in publisher,
        "publisher target differs from the governed Space identity",
    )
    require(
        f'SOURCE_REPOSITORY = "{EXPECTED_REPOSITORY}"' in publisher,
        "publisher source authority differs from the canonical repository",
    )
    for primitive in (
        "CommitOperationAdd",
        "CommitOperationDelete",
        "api.create_commit",
        "hf_hub_download",
        "provider_revision",
        "provider_readback",
        "exact_bytes",
        "deployment.json",
        "write_receipt",
        "wait_for_runtime",
        'root_bytes == (SPACE / "index.html").read_bytes()',
    ):
        require(primitive in publisher, f"publisher is missing permanent primitive: {primitive}")

    require(
        f'"github": "{EXPECTED_REPOSITORY}"' in server,
        "runtime source repository differs from publisher authority",
    )
    require(
        f'"canonical_space": "{EXPECTED_SPACE}"' in server,
        "runtime canonical Space differs from publisher target",
    )

    receipt = {
        "schema": "szl.holographic-publisher-static-contract/v2",
        "repository": EXPECTED_REPOSITORY,
        "space": EXPECTED_SPACE,
        "workflow_sha256": sha256(WORKFLOW),
        "ci_sha256": sha256(CI_WORKFLOW),
        "publisher_sha256": sha256(PUBLISHER),
        "server_sha256": sha256(SERVER),
        "network_access": False,
        "credential_access": False,
        "status": "PASS",
    }
    print(json.dumps(receipt, sort_keys=True, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
