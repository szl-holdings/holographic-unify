#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Fail-closed static contract for the canonical Hugging Face publisher.

The public runtime can only be attributed to this repository when the publisher
checks out the exact triggering commit, proves that subject before any provider
call, keeps repository permissions read-only, and retains an immutable receipt.
This verifier performs no network access and reads no credentials.
"""
from __future__ import annotations

import ast
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKFLOW = ROOT / ".github" / "workflows" / "deploy-hf-space.yml"
PUBLISHER = ROOT / "scripts" / "publish_space.py"
SERVER = ROOT / "space" / "server.py"
EXPECTED_REPOSITORY = "szl-holdings/holographic-unify"
EXPECTED_SPACE = "SZLHOLDINGS/holographic-unify"
SHA_PIN = re.compile(r"^[0-9a-f]{40}$")
USES = re.compile(r"^\s*uses:\s*([^@\s]+)@([^\s#]+)", re.MULTILINE)


class ContractError(RuntimeError):
    """Raised when the deployment workflow can no longer prove its subject."""


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ContractError(message)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def python_invokes(workflow: str, script: str, *, suffix: str = "") -> bool:
    """Accept bounded interpreter flags while requiring the exact script path."""
    pattern = rf"python(?:\s+-\S+)*\s+{re.escape(script)}{re.escape(suffix)}(?:\s|$)"
    return re.search(pattern, workflow, re.MULTILINE) is not None


def main() -> int:
    workflow = WORKFLOW.read_text(encoding="utf-8")
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

    action_refs = USES.findall(workflow)
    require(action_refs, "workflow contains no reusable action references")
    for action, ref in action_refs:
        require(SHA_PIN.fullmatch(ref) is not None, f"mutable action reference: {action}@{ref}")

    require(
        f'SPACE_ID = "{EXPECTED_SPACE}"' in publisher,
        "publisher target differs from the governed Space identity",
    )
    require(
        f'"github": "{EXPECTED_REPOSITORY}"' in server,
        "runtime source repository differs from the publisher authority",
    )
    require("exact_bytes" in publisher, "publisher must verify exact uploaded bytes")
    require("wait_for_runtime" in publisher, "publisher must wait for runtime readback")
    require("provider_rev" in publisher, "publisher receipt must retain provider revision")

    receipt = {
        "schema": "szl.holographic-publisher-static-contract/v1",
        "repository": EXPECTED_REPOSITORY,
        "space": EXPECTED_SPACE,
        "workflow_sha256": sha256(WORKFLOW),
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
