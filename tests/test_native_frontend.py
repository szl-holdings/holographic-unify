"""Exact source presentation assets and preserved Space card boundaries."""
import hashlib
import json
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]
SPACE = ROOT / "space"
EXPECTED = {
    "szl-tokens.css": "81f7c9baeef0b435e6e3f9d0c4e0d70e40fa17df5d1f30697f623cd3ef5f8eab",
    "szl-source.json": "967a77235227f1d75852fb61873e46336e67403cbc0e7e12b141e31c83fbd93d",
    "szl-icon-32.svg": "6e2b7d72a3af3d9602b79de41df0194ede6496a9661f057108ec224c0efc92e6",
    "favicon.svg": "6e2dc7c9794dc452fbccb44ffadbd168c2584361904e8bcaeba542427d9e1a3a",
    "apple-touch-icon.png": "ddeb873e960f14c41078d82cad4f7bb5a40dca555867ac3c3fb869ce46bbef6c",
}


class NativeFrontendTests(unittest.TestCase):
    def test_native_projection_is_exact_and_distinguishes_the_installed_subset(self):
        projection = json.loads((SPACE / "szl-projection.json").read_bytes())
        self.assertEqual(projection["repository"], "https://github.com/szl-holdings/szl-brand")
        self.assertEqual(projection["bundle_revision"], "4309f6fce89179331b0b3ed8c99494e76c5be256")
        self.assertEqual(projection["qualified_token_source_revision"], "27d12e77fc0f9f1a0e5fae8b34adf2380d51d070")
        self.assertEqual(sorted(a["installed_path"] for a in projection["assets"]), sorted(EXPECTED))
        self.assertIn("Unsigned projection metadata", projection["qualification"])
        for name, expected in EXPECTED.items():
            with self.subTest(name=name):
                body = (SPACE / name).read_bytes()
                row = next(a for a in projection["assets"] if a["installed_path"] == name)
                self.assertEqual(hashlib.sha256(body).hexdigest(), expected)
                self.assertEqual(row["sha256"], expected)
                self.assertEqual(row["bytes"], len(body))
                self.assertRegex(row["source_revision"], r"^[0-9a-f]{40}$")

    def test_honesty_declarations_and_native_identity_are_source_visible_without_javascript(self):
        html = (SPACE / "index.html").read_text()
        for phrase in ["ROADMAP", "UNAVAILABLE", "Conjecture 1", "UNSIGNED-honest", "BLUEPRINT_NOT_TRAINED", "K3 dump REFUSED", "proven_trust: false", "21 tokens / 2053 ms"]:
            self.assertIn(phrase, html)
        self.assertLess(html.index('href="./szl-tokens.css"'), html.index('href="./unify.css"'))
        self.assertIn('src="./szl-icon-32.svg" width="40" height="40"', html)
        self.assertIn('href="./api/build-info"', html)
        self.assertNotRegex(html, r'<(?:svg|canvas)\b')
        self.assertNotIn('src="./szl-space-hologram.js"', html)
        self.assertRegex(html, r'id="appearance"[^>]+hidden')
        self.assertRegex(html, r'id="refresh-identity"[^>]+hidden')
        script = (SPACE / "unify.js").read_text()
        self.assertEqual(len(re.findall(r'\bfetch\(', script)), 1)
        self.assertIn('credentials: "omit"', script)
        self.assertIn('redirect: "error"', script)
        self.assertNotRegex(script, r'\b(?:innerHTML|localStorage|sessionStorage|setInterval)\b')


if __name__ == "__main__":
    unittest.main()
