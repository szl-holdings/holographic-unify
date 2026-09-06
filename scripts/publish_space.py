#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Atomic publication to an existing target with exact source and byte readback.

No repository creation, visibility change, file deletion, target override, or
implicit Constellation migration. Unit tests inject a provider; live acceptance
requires the real provider revision and the exact served deployment document.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import subprocess
import tempfile
import time
import urllib.request
from pathlib import Path
from typing import Any, Callable, Mapping

ROOT = Path(__file__).resolve().parents[1]
SPACE = ROOT / "space"
SOURCE_REPOSITORY = "szl-holdings/holographic-unify"
SPACE_ID = "SZLHOLDINGS/holographic-unify"
ORIGIN = "https://szlholdings-holographic-unify.hf.space"
PAYLOAD_FILES = frozenset({"Dockerfile", "README.md", "index.html", "server.py"})
SHA40 = re.compile(r"[0-9a-f]{40}")
MAX_BYTES = 8 * 1024 * 1024


class PublicationError(RuntimeError):
    """Bounded code-only failure; never include credential/provider response text."""


def require(ok: bool, code: str) -> None:
    if not ok:
        raise PublicationError(code)


def exact_sha(value: Any) -> str:
    require(isinstance(value, str) and SHA40.fullmatch(value) is not None, "INVALID_REVISION")
    return value


def encoded(value: Any) -> bytes:
    return (json.dumps(value, sort_keys=True, separators=(",", ":"), allow_nan=False) + "\n").encode()


def git(*args: str) -> str:
    try:
        p = subprocess.run(["git", *args], cwd=ROOT, capture_output=True,
                           text=True, timeout=30, check=True)
        require(len(p.stdout) <= 65536, "GIT_RESPONSE_LIMIT")
        return p.stdout.strip()
    except (OSError, subprocess.SubprocessError):
        raise PublicationError("GIT_UNAVAILABLE") from None


def exact_main() -> str:
    require(not git("status", "--porcelain", "--untracked-files=normal"), "DIRTY_SOURCE")
    origin = git("remote", "get-url", "origin")
    require(origin in {f"https://github.com/{SOURCE_REPOSITORY}",
                       f"https://github.com/{SOURCE_REPOSITORY}.git",
                       f"git@github.com:{SOURCE_REPOSITORY}.git"}, "WRONG_ORIGIN")
    local = exact_sha(git("rev-parse", "HEAD"))
    if os.getenv("GITHUB_ACTIONS") == "true":
        require(os.getenv("GITHUB_REPOSITORY") == SOURCE_REPOSITORY, "WRONG_REPOSITORY")
        require(os.getenv("GITHUB_REF") == "refs/heads/main", "WRONG_REF")
        require(os.getenv("GITHUB_EVENT_NAME") in {"push", "workflow_dispatch"}, "WRONG_EVENT")
        require(exact_sha(os.getenv("GITHUB_SHA")) == local, "EVENT_SOURCE_MISMATCH")
    else:
        require(git("branch", "--show-current") == "main", "LOCAL_MAIN_REQUIRED")
    remote = git("ls-remote", "--exit-code", "origin", "refs/heads/main").split()
    require(len(remote) == 2 and remote[1] == "refs/heads/main", "INVALID_REMOTE_REF")
    require(exact_sha(remote[0]) == local, "STALE_SOURCE")
    return local


def payload(source: str) -> dict[str, bytes]:
    exact_sha(source)
    entries = list(SPACE.iterdir())
    require({p.name for p in entries} == PAYLOAD_FILES, "UNEXPECTED_LOCAL_PAYLOAD")
    require(all(p.is_file() and not p.is_symlink() for p in entries), "NONREGULAR_PAYLOAD")
    require(all(p.stat().st_size <= MAX_BYTES for p in entries), "PAYLOAD_SIZE_LIMIT")
    files = {p.name: p.read_bytes() for p in entries}
    require(sum(map(len, files.values())) <= MAX_BYTES, "PAYLOAD_SIZE_LIMIT")
    manifest = {
        "schema": "szl.holographic-deployment/v1",
        "source": {"repository": SOURCE_REPOSITORY, "revision": source},
        "target": {"repo_id": SPACE_ID, "repo_type": "space"},
        "files": [{"path": n, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
                  for n, b in sorted(files.items())],
        "claims": {"model_quality": "NOT_EVALUATED", "execution_authority": False},
    }
    files["deployment.json"] = encoded(manifest)
    return files


def write_receipt(path: Path, value: Mapping[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    require(not path.is_symlink(), "RECEIPT_SYMLINK")
    body = dict(value)
    body["receipt_sha256"] = hashlib.sha256(encoded(body)).hexdigest()
    temporary = None
    try:
        with tempfile.NamedTemporaryFile(dir=path.parent, mode="wb", delete=False) as f:
            temporary = Path(f.name)
            f.write(encoded(body))
            f.flush()
            os.fsync(f.fileno())
        os.replace(temporary, path)
    finally:
        if temporary is not None and temporary.exists():
            temporary.unlink()


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise PublicationError("RUNTIME_REDIRECT_REFUSED")


def runtime_get(path: str) -> bytes:
    require(path in {"/", "/deployment.json", "/healthz"}, "INVALID_RUNTIME_PATH")
    req = urllib.request.Request(ORIGIN + path,
        headers={"User-Agent": "SZL-Exact-Publisher/2", "Cache-Control": "no-cache"})
    with urllib.request.build_opener(NoRedirect()).open(req, timeout=15) as r:
        body = r.read(MAX_BYTES + 1)
    require(len(body) <= MAX_BYTES, "RUNTIME_SIZE_LIMIT")
    return body


def publication(api: Any, download: Callable[[str, str], bytes], add: Callable[..., Any],
                files: dict[str, bytes], source: str, receipt: dict[str, Any],
                persist: Callable[[], None], fresh: Callable[[], str],
                read: Callable[[str], bytes] = runtime_get, timeout: float = 1200,
                sleep: Callable[[float], None] = time.sleep) -> None:
    """Provider calls are injectable so admission/failure behavior is testable offline."""
    info = api.space_info(SPACE_ID)
    require(getattr(info, "id", None) == SPACE_ID, "WRONG_PROVIDER_TARGET")
    require(getattr(info, "sdk", None) == "docker", "TARGET_SDK_MISMATCH")
    parent = exact_sha(info.sha)
    existing = set(api.list_repo_files(SPACE_ID, repo_type="space", revision=parent))
    require(existing <= set(files) | {".gitattributes"}, "UNOWNED_PROVIDER_FILES")
    if ".gitattributes" in existing:
        attributes = download(".gitattributes", parent)
        require(isinstance(attributes, bytes) and len(attributes) <= 65536, "ATTRIBUTES_LIMIT")
        files[".gitattributes"] = attributes  # Preserve; never delete provider metadata.
    require(fresh() == source, "SOURCE_MOVED_BEFORE_COMMIT")
    operations = [add(path_in_repo=n, path_or_fileobj=b) for n, b in sorted(files.items())]
    receipt.update(status="COMMIT_ATTEMPTED", parent_revision=parent)
    persist()  # A timeout during commit means outcome unknown, not proof of no write.
    result = api.create_commit(repo_id=SPACE_ID, repo_type="space", revision="main",
        parent_commit=parent, operations=operations, num_threads=2,
        commit_message=f"deploy: exact source {source}")
    revision = exact_sha(result.oid)
    receipt.update(provider_revision=revision, status="PROVIDER_COMMITTED")
    persist()
    observed = set(api.list_repo_files(SPACE_ID, repo_type="space", revision=revision))
    require(observed == set(files), "PROVIDER_FILE_SET_MISMATCH")
    for name, body in files.items():
        require(download(name, revision) == body, "PROVIDER_BYTES_MISMATCH")
    receipt.update(status="PROVIDER_VERIFIED", exact_bytes=True)
    persist()
    wait_for_runtime(api, revision, files, source, fresh, read, timeout, sleep)
    receipt.update(status="RUNTIME_VERIFIED", runtime_revision=revision)
    persist()


def wait_for_runtime(api: Any, revision: str, files: Mapping[str, bytes], source: str,
                     fresh: Callable[[], str], read: Callable[[str], bytes],
                     timeout: float, sleep: Callable[[float], None]) -> None:
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        info = api.space_info(SPACE_ID)
        require(exact_sha(info.sha) == revision, "PROVIDER_SUPERSEDED")
        runtime = info.runtime or {}
        stage = runtime.get("stage")
        require(stage not in {"BUILD_ERROR", "RUNTIME_ERROR", "PAUSED", "STOPPED"}, "RUNTIME_TERMINAL")
        if stage == "RUNNING" and runtime.get("sha") == revision:
            try:
                require(read("/") == files["index.html"], "RUNTIME_ROOT_MISMATCH")
                require(read("/deployment.json") == files["deployment.json"], "RUNTIME_SOURCE_MISMATCH")
                health = json.loads(read("/healthz"))
                require(health.get("ok") is True and health.get("github") == SOURCE_REPOSITORY
                        and health.get("canonical_space") == SPACE_ID, "RUNTIME_HEALTH_MISMATCH")
            except (OSError, ValueError):
                sleep(min(2, max(0, deadline - time.monotonic())))
                continue
            require(fresh() == source, "SOURCE_SUPERSEDED_AFTER_PUBLICATION")
            require(api.space_info(SPACE_ID).sha == revision, "PROVIDER_SUPERSEDED")
            return
        sleep(min(2, max(0, deadline - time.monotonic())))
    raise PublicationError("RUNTIME_TIMEOUT")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--timeout", type=float, default=1200)
    args = parser.parse_args()
    receipt_path = Path(os.getenv("RUNNER_TEMP", tempfile.gettempdir())) / "szl-holographic-receipt.json"
    receipt: dict[str, Any] = {"schema": "szl.holographic-publish/v2",
        "source_repository": SOURCE_REPOSITORY, "space": SPACE_ID,
        "status": "ADMISSION_STARTED", "secret_values_recorded": False}
    def persist() -> None:
        write_receipt(receipt_path, receipt)
    try:
        require(0 < args.timeout <= 1200, "INVALID_TIMEOUT")
        source = exact_main()
        receipt["source_revision"] = source
        files = payload(source)
        receipt["payload_sha256"] = hashlib.sha256(encoded(
            {n: hashlib.sha256(b).hexdigest() for n, b in sorted(files.items())})).hexdigest()
        if not args.apply:
            receipt["status"] = "DRY_RUN_NO_PROVIDER_CALLS"
        else:
            token = os.getenv("HF_TOKEN")
            require(bool(token), "PUBLISHER_CREDENTIAL_UNAVAILABLE")
            from huggingface_hub import HfApi, CommitOperationAdd, hf_hub_download
            api = HfApi(token=token)
            identity = api.whoami()
            orgs = identity.get("orgs") or []
            require(any(isinstance(o, dict) and o.get("name") == "SZLHOLDINGS"
                        for o in orgs), "PUBLISHER_ORGANIZATION_MISMATCH")
            def download(name: str, rev: str) -> bytes:
                path = hf_hub_download(SPACE_ID, name, repo_type="space", revision=rev, token=token)
                p = Path(path)
                require(p.stat().st_size <= MAX_BYTES, "PROVIDER_SIZE_LIMIT")
                return p.read_bytes()
            publication(api, download, CommitOperationAdd, files, source, receipt,
                        persist, exact_main, timeout=args.timeout)
        persist()
        print(json.dumps({"status": receipt["status"], "receipt_path": str(receipt_path)}))
        return 0
    except Exception as exc:
        receipt.update(status="FAILED", failed_phase=receipt["status"],
                       error_code=str(exc) if isinstance(exc, PublicationError) else type(exc).__name__)
        persist()
        print(json.dumps({"status": "FAILED", "error_code": receipt["error_code"],
                          "receipt_path": str(receipt_path)}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
