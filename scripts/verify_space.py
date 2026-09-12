#!/usr/bin/env python3
"""Verify the Holographic Unify source, server, and deployed health contract."""

from __future__ import annotations

import argparse
import json
import os
import re
import runpy
import socket
import subprocess
import sys
import tempfile
import time
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
SPACE = ROOT / "space"
PAYLOAD_FILES = {"Dockerfile", "README.md", "index.html", "server.py"}
EXPECTED_HONESTY: dict[str, Any] = {
    "surface": "SZL Holographic Unify",
    "github": "szl-holdings/holographic-unify",
    "kind": "HOLOGRAM",
    "flagship": False,
    "gpu_vllm": "ROADMAP",
    "unsloth": "ROADMAP",
    "energy_joules": "UNAVAILABLE",
    "lambda_uniqueness": "Conjecture 1",
    "proven_trust": False,
    "kimi_k3": "REFUSED",
    "signature": "UNSIGNED-honest",
    "hub_npm": False,
    "ok": True,
}


def require(condition: bool, message: str) -> None:
    if not condition:
        raise RuntimeError(message)


def verify_payload() -> None:
    actual = {path.name for path in SPACE.iterdir() if path.is_file()}
    require(actual == PAYLOAD_FILES, f"payload files differ: {sorted(actual)}")

    readme = (SPACE / "README.md").read_text(encoding="utf-8")
    dockerfile = (SPACE / "Dockerfile").read_text(encoding="utf-8")
    server = (SPACE / "server.py").read_text(encoding="utf-8")
    index = (SPACE / "index.html").read_text(encoding="utf-8")
    joined = "\n".join((readme, dockerfile, server, index))

    require("sdk: docker" in readme, "Space README must declare sdk: docker")
    require("app_port: 7860" in readme, "Space README must declare port 7860")
    require("mirror.gcr.io/library/python:3.12-slim" in dockerfile, "runtime image changed")
    docker_instructions = [
        line.strip().lower()
        for line in dockerfile.splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]
    require(
        not any("npm" in line for line in docker_instructions),
        "Hub Dockerfile must not invoke npm",
    )
    require(not re.search(r"(?:https?:)?//a11oy\.com(?:[/:]|$)", joined), "forbidden a11oy.com URL found")
    require("proven_trust" in joined and "false" in joined.lower(), "honesty lock missing")
    compile(server, str(SPACE / "server.py"), "exec")


def request(url: str, method: str = "GET") -> tuple[int, bytes, str]:
    req = urllib.request.Request(url, method=method, headers={"User-Agent": "szl-runtime-contract/1"})
    with urllib.request.urlopen(req, timeout=10) as response:
        return response.status, response.read(), response.headers.get_content_type()


def verify_url(
    base_url: str, timeout: float, expected_source_revision: str | None = None
) -> dict[str, Any]:
    base = base_url.rstrip("/")
    deadline = time.monotonic() + timeout
    last_error: Exception | None = None
    while time.monotonic() < deadline:
        try:
            root_status, root_body, root_type = request(base + "/")
            head_status, _, _ = request(base + "/", method="HEAD")
            health_status, health_body, health_type = request(base + "/healthz")
            ready_status, ready_body, ready_type = request(base + "/readyz")
            honesty_status, honesty_body, _ = request(base + "/api/honesty")
            require(root_status == 200 and head_status == 200, "root or HEAD was not HTTP 200")
            require(
                health_status == 200 and ready_status == 200 and honesty_status == 200,
                "health, readiness, or honesty endpoint was not HTTP 200",
            )
            require(root_type == "text/html", f"unexpected root content type: {root_type}")
            require(health_type == "application/json", f"unexpected health content type: {health_type}")
            require(ready_type == "application/json", f"unexpected readiness content type: {ready_type}")
            require(b"Wave 2026 admitted" in root_body, "expected hologram marker missing")
            health = json.loads(health_body)
            ready = json.loads(ready_body)
            honesty = json.loads(honesty_body)
            for key, expected in EXPECTED_HONESTY.items():
                require(health.get(key) == expected, f"healthz {key!r} differs")
                require(ready.get(key) == expected, f"readyz {key!r} differs")
                require(honesty.get(key) == expected, f"api/honesty {key!r} differs")
            require(ready.get("ready") is True, "readyz did not explicitly report ready")
            result: dict[str, Any] = {
                "url": base,
                "http": 200,
                "kind": health["kind"],
                "ready": True,
                "ok": True,
            }
            if expected_source_revision is not None:
                build_status, build_body, build_type = request(base + "/api/build-info")
                require(build_status == 200, "build-info was not HTTP 200")
                require(build_type == "application/json", f"unexpected build-info content type: {build_type}")
                build = json.loads(build_body)
                require(build.get("source_repository") == EXPECTED_HONESTY["github"], "source repository differs")
                require(build.get("source_revision") == expected_source_revision, "source revision differs")
                require(
                    build.get("build")
                    == {"state": "OBSERVED", "revision": expected_source_revision},
                    "canonical build witness differs",
                )
                require(build.get("receipt_minted") is False, "receipt state is not explicitly non-minted")
                result["source_revision"] = expected_source_revision
            return result
        except Exception as exc:
            last_error = exc
            time.sleep(2)
    raise RuntimeError(f"runtime did not satisfy contract: {last_error}")


def verify_local(timeout: float) -> dict[str, Any]:
    publisher = runpy.run_path(str(ROOT / "scripts" / "publish_space.py"))
    staged_payload = publisher["payload"]("0" * 40)
    with tempfile.TemporaryDirectory() as temporary:
        runtime = Path(temporary)
        for name, body in staged_payload.items():
            (runtime / name).write_bytes(body)
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", 0))
            port = probe.getsockname()[1]
        env = os.environ.copy()
        env.update({"HOST": "127.0.0.1", "PORT": str(port), "PYTHONDONTWRITEBYTECODE": "1"})
        process = subprocess.Popen(
            [sys.executable, "-I", "-B", str(runtime / "server.py")],
            cwd=runtime,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
        )
        try:
            result = verify_url(f"http://127.0.0.1:{port}", timeout)
            require(process.poll() is None, "server exited during the contract probe")
            result["mode"] = "local"
            return result
        finally:
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
                process.wait(timeout=5)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", help="Probe an already-running container or Space")
    parser.add_argument("--timeout", type=float, default=30.0)
    parser.add_argument("--expected-source-revision")
    args = parser.parse_args()
    if args.expected_source_revision is not None:
        require(args.url is not None, "expected source revision requires --url")
        require(
            re.fullmatch(r"[0-9a-f]{40}", args.expected_source_revision) is not None,
            "expected source revision must be a lowercase 40-character SHA",
        )
    verify_payload()
    result = (
        verify_url(args.url, args.timeout, args.expected_source_revision)
        if args.url
        else verify_local(args.timeout)
    )
    print(json.dumps(result, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
