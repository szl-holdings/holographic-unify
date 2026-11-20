"""Offline behavior contract for the browser qualifier's actual Python stager.

The real publisher is replaced by a tiny synthetic, fixed-file test fixture.
No Hub connection, browser, credentials, renderer or production service runs.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts" / "qualify_native_frontend.cjs"


def command_from_source() -> str:
    """Extract the command the real JS browser harness invokes at startup."""
    source = SCRIPT.read_text(encoding="utf-8")
    match = re.search(r'\bconst python = ("[^\r\n]*");', source)
    if match is None:
        raise ValueError("BROWSER_STAGER_COMMAND_UNAVAILABLE")
    return json.loads(match.group(1))


def stage_fixture(*, nested: bool) -> tuple[int, str | None, bool]:
    with tempfile.TemporaryDirectory(prefix="szl-holo-stager-fixture-") as root:
        workspace = Path(root)
        (workspace / "scripts").mkdir()
        payload = {
            "server.py": (
                "from pathlib import Path\n"
                "Path(__file__).with_name('started.txt').write_text('RUN', encoding='ascii')\n"
            ).encode("ascii"),
            "index.html": b"<h1>Read-only local source fixture</h1>",
        }
        if nested:
            payload["assets/szl-card/org-context.svg"] = b"<svg/>"
            payload["assets/szl-card/mesh-receipts.svg"] = b"<svg/>"
        (workspace / "scripts" / "publish_space.py").write_text(
            "def payload(revision):\n"
            "    assert revision == 'a'*40\n"
            "    return " + repr(payload) + "\n",
            encoding="utf-8",
        )
        runtime = workspace / "runtime"
        runtime.mkdir()  # The JS harness creates this directory before boot.
        env = os.environ.copy()
        env["UNIFY_QA_RUNTIME"] = str(runtime)
        executed = subprocess.run(
            [sys.executable, "-I", "-B", "-c", command_from_source()],
            cwd=workspace,
            env=env,
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
        matching = all(
            (runtime / name).is_file() and (runtime / name).read_bytes() == body
            for name, body in payload.items()
        )
        marker = runtime / "started.txt"
        started = marker.read_text(encoding="ascii") if marker.is_file() else None
        return executed.returncode, started, matching


class BrowserStagerTests(unittest.TestCase):
    def test_nested_source_owned_svg_paths_stage_before_server_boot(self):
        # Regression: old direct Path.write_bytes without parent directories
        # raises FileNotFoundError and the Chromium runner reports "exited".
        status, started, matching = stage_fixture(nested=True)
        self.assertEqual(status, 0, "nested canonical payload must boot")
        self.assertEqual(started, "RUN")
        self.assertTrue(matching)

    def test_flat_legacy_payload_still_stages_and_boots(self):
        status, started, matching = stage_fixture(nested=False)
        self.assertEqual(status, 0)
        self.assertEqual(started, "RUN")
        self.assertTrue(matching)


if __name__ == "__main__":
    unittest.main()
