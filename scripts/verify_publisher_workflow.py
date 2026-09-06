#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Execute publisher behavior contracts; static markers alone are not evidence."""
from __future__ import annotations
import hashlib
import json
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    workflow = (ROOT / '.github/workflows/deploy-hf-space.yml').read_text()
    ci = (ROOT / '.github/workflows/ci.yml').read_text()
    required = (
        'ref: ${{ github.sha }}', 'persist-credentials: false',
        "github.ref == 'refs/heads/main'", 'cancel-in-progress: false',
        'contents: read', 'if: always()',
        'scripts/verify_publisher_workflow.py', 'scripts/publish_space.py --apply',
    )
    if not all(s in workflow for s in required) or 'ref: main' in workflow:
        raise RuntimeError('publisher workflow source contract differs')
    if 'scripts/verify_publisher_workflow.py' not in ci:
        raise RuntimeError('CI does not execute behavioral publisher contracts')
    for body in (ci, workflow):
        refs = re.findall(r'^\s*(?:-\s*)?uses:\s*([^\s#]+)', body, re.M)
        if not refs or any(not re.fullmatch(r'[^@]+@[a-f0-9]{40}', ref) for ref in refs):
            raise RuntimeError('external action must be commit-pinned')
        if 'pull_request_target' in body or 'secrets: inherit' in body:
            raise RuntimeError('unexpected credential-bearing trigger or inheritance')
    suite = unittest.defaultTestLoader.discover(str(ROOT / 'tests'), pattern='test_publisher.py')
    if suite.countTestCases() < 25:
        raise RuntimeError('publisher behavior contracts missing')
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    print(json.dumps({'schema': 'szl.publisher-offline-contract/v1',
        'passed': result.wasSuccessful(), 'tests_run': result.testsRun,
        'network_access': False, 'provider_acceptance': 'NOT_CLAIMED',
        'publisher_sha256': hashlib.sha256((ROOT/'scripts/publish_space.py').read_bytes()).hexdigest()}))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
