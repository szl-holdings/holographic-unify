#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Read-only Holographic Unify surface with locally verified build identity."""
from __future__ import annotations

import hashlib
import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
HOST = os.environ.get("HOST", "0.0.0.0")
PORT = int(os.environ.get("PORT", "7860"))
if not 1 <= PORT <= 65535:
    raise ValueError("PORT must be between 1 and 65535")
SOURCE = "szl-holdings/holographic-unify"
TARGET = "SZLHOLDINGS/holographic-unify"
PAYLOAD_FILES = {"Dockerfile", "README.md", "index.html", "server.py"}
HONESTY = {
    "surface": "SZL Holographic Unify", "github": SOURCE,
    "canonical_space": TARGET, "kind": "HOLOGRAM", "flagship": False,
    "gpu_vllm": "ROADMAP", "unsloth": "ROADMAP", "energy_joules": "UNAVAILABLE",
    "energy_channel": "UNAVAILABLE", "lambda_uniqueness": "Conjecture 1",
    "proven_trust": False, "kimi_k3": "REFUSED", "signature": "UNSIGNED-honest", "hub_npm": False,
}


def strict_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("duplicate deployment field")
        result[key] = value
    return result


def deployment_bytes() -> tuple[bytes, str]:
    path = HERE / "deployment.json"
    if path.is_symlink() or path.stat().st_size > 65536:
        raise ValueError("invalid deployment document")
    raw = path.read_bytes()
    data = json.loads(raw, object_pairs_hook=strict_object)
    if not isinstance(data, dict) or data.get("schema") != "szl.holographic-deployment/v1":
        raise ValueError("invalid deployment schema")
    source, target, rows = data.get("source"), data.get("target"), data.get("files")
    if not isinstance(source, dict) or source.get("repository") != SOURCE:
        raise ValueError("invalid source")
    revision = source.get("revision")
    if not isinstance(revision, str) or re.fullmatch(r"[0-9a-f]{40}", revision) is None:
        raise ValueError("invalid source revision")
    if target != {"repo_id": TARGET, "repo_type": "space"}:
        raise ValueError("invalid target")
    if not isinstance(rows, list) or len(rows) != len(PAYLOAD_FILES):
        raise ValueError("invalid payload manifest")
    seen = set()
    for row in rows:
        if not isinstance(row, dict) or row.get("path") not in PAYLOAD_FILES:
            raise ValueError("invalid manifest path")
        name = row["path"]
        if name in seen:
            raise ValueError("duplicate manifest path")
        seen.add(name)
        p = HERE / name
        if p.is_symlink() or not p.is_file() or p.stat().st_size > 8 * 1024 * 1024:
            raise ValueError("invalid payload file")
        body = p.read_bytes()
        if type(row.get("bytes")) is not int or len(body) != row["bytes"] or hashlib.sha256(body).hexdigest() != row.get("sha256"):
            raise ValueError("payload mismatch")
    return raw, revision


class Handler(BaseHTTPRequestHandler):
    def _send(self, code: int, body: bytes, content_type: str, head: bool) -> None:
        self.send_response(code)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        if not head:
            self.wfile.write(body)

    def respond(self, head: bool = False) -> None:
        path = self.path.split("?", 1)[0]
        code, kind = 200, "application/json"
        if path in {"/healthz", "/api/honesty"}:
            body = json.dumps({**HONESTY, "ok": True}).encode()
        elif path in {"/api/build-info", "/deployment.json"}:
            try:
                document, revision = deployment_bytes()
                body = document if path == "/deployment.json" else json.dumps({
                    "schema": "szl.build-info/v1", "source_repository": SOURCE,
                    "source_revision": revision, "build": {"revision": revision},
                    "state": "LOCAL_BYTES_VERIFIED", "signature": "UNSIGNED-honest",
                }).encode()
            except (OSError, ValueError, TypeError, KeyError):
                code, body = 503, b'{"state":"SOURCE_BINDING_UNAVAILABLE"}'
        elif path == "/":
            body, kind = (HERE / "index.html").read_bytes(), "text/html; charset=utf-8"
        else:
            code, body = 404, b'{"error":"not found"}'
        self._send(code, body, kind, head)

    def do_GET(self) -> None:
        self.respond()

    def do_HEAD(self) -> None:
        self.respond(head=True)


def main() -> None:
    with ThreadingHTTPServer((HOST, PORT), Handler) as httpd:
        httpd.serve_forever()


if __name__ == "__main__":
    main()
