#!/usr/bin/env python3
"""Publish the exact Holographic Unify flatten with local Hugging Face auth."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SPACE_DIR = ROOT / "space"
SPACE_ID = "SZLHOLDINGS/holographic-unify"
EXPECTED_FILES = {".gitattributes", "Dockerfile", "README.md", "index.html", "server.py"}


def run(command: list[str], *, check: bool = True) -> str:
    result = subprocess.run(command, cwd=ROOT, text=True, capture_output=True)
    if check and result.returncode != 0:
        detail = (result.stderr or result.stdout).strip()
        raise RuntimeError(f"command failed ({command[0]}): {detail}")
    return result.stdout.strip()


def exact_main() -> str:
    if run(["git", "status", "--porcelain"]):
        raise RuntimeError("publication requires a clean checkout")
    branch = run(["git", "branch", "--show-current"])
    if branch != "main":
        raise RuntimeError(f"publication requires main, found {branch!r}")
    local = run(["git", "rev-parse", "HEAD"])
    remote_line = run(["git", "ls-remote", "--exit-code", "origin", "refs/heads/main"])
    remote = remote_line.split()[0]
    if local != remote:
        raise RuntimeError(f"local main {local} does not match origin/main {remote}")
    return local


def authenticated_publisher() -> str:
    identity = json.loads(run(["hf", "auth", "whoami", "--format", "json"]))
    orgs = identity.get("orgs") or ""
    if isinstance(orgs, str):
        org_names = {item.strip() for item in orgs.split(",")}
    else:
        org_names = {str(item.get("name", item)) for item in orgs}
    if "SZLHOLDINGS" not in org_names:
        raise RuntimeError("active Hugging Face identity is not a SZLHOLDINGS member")
    return str(identity.get("user") or "<unknown>")


def space_info() -> dict[str, Any]:
    return json.loads(run(["hf", "spaces", "info", SPACE_ID]))


def wait_for_runtime(timeout: float) -> dict[str, Any]:
    deadline = time.monotonic() + timeout
    last_stage = "UNKNOWN"
    while time.monotonic() < deadline:
        info = space_info()
        runtime = info.get("runtime") or {}
        last_stage = str(runtime.get("stage") or "UNKNOWN")
        if last_stage == "RUNNING":
            files = {item["rfilename"] for item in info.get("siblings", [])}
            unexpected = files - EXPECTED_FILES
            missing = EXPECTED_FILES - files
            if unexpected or missing:
                raise RuntimeError(
                    f"Space file set differs; missing={sorted(missing)} unexpected={sorted(unexpected)}"
                )
            return info
        if "ERROR" in last_stage or last_stage in {"PAUSED", "STOPPED"}:
            raise RuntimeError(f"Space entered terminal stage {last_stage}")
        time.sleep(10)
    raise RuntimeError(f"Space did not reach RUNNING; last stage={last_stage}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Create/upload and wait for runtime")
    parser.add_argument("--timeout", type=float, default=1200.0)
    args = parser.parse_args()

    source_sha = exact_main()
    publisher = authenticated_publisher()
    plan = {
        "action": "publish" if args.apply else "dry-run",
        "publisher": publisher,
        "source": "szl-holdings/holographic-unify",
        "source_sha": source_sha,
        "space": SPACE_ID,
        "payload": sorted(path.name for path in SPACE_DIR.iterdir() if path.is_file()),
    }
    print(json.dumps(plan, sort_keys=True))
    if not args.apply:
        return 0

    run(["hf", "repos", "create", SPACE_ID, "--type", "space", "--space-sdk", "docker", "--exist-ok"])
    run(
        [
            "hf",
            "upload",
            SPACE_ID,
            str(SPACE_DIR),
            ".",
            "--type",
            "space",
            "--commit-message",
            f"deploy: source-bound holographic-unify {source_sha[:12]}",
        ]
    )
    info = wait_for_runtime(args.timeout)
    host = str(info["host"])
    run(
        [
            sys.executable,
            "-I",
            "-B",
            str(ROOT / "scripts" / "verify_space.py"),
            "--url",
            host,
            "--timeout",
            "90",
        ]
    )
    receipt = {
        "host": host,
        "http": 200,
        "source_sha": source_sha,
        "space": SPACE_ID,
        "space_sha": info.get("sha"),
        "stage": (info.get("runtime") or {}).get("stage"),
    }
    print(json.dumps(receipt, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())