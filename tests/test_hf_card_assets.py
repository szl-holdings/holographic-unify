# SPDX-License-Identifier: Apache-2.0
"""Exact-byte, inert HF Space card assets imported from an owned immutable revision."""
import hashlib
import unittest
from pathlib import Path
import xml.etree.ElementTree as ET

SPACE = Path(__file__).resolve().parents[1] / "space"
SOURCE_HF_REVISION = "b700b5d837a61440bba5802d2bcf115156eed848"
EXACT = {
    "assets/szl-card/mesh-receipts.svg":
        "e2ec8f99d35ccdaa3a2a7d2efc1551f186e53012ff84b56dbc994b36fef659db",
    "assets/szl-card/org-context.svg":
        "cd7090a350bed6168133489b1f97e4968c0320d8961fec08e7d9950bfd6ea23f",
}
FORBIDDEN_ELEMENTS = {"script", "foreignobject", "animate", "set"}

class ImportedCardAssetTests(unittest.TestCase):
    def test_files_are_exactly_the_two_reviewed_artifacts(self):
        names = {
            file.relative_to(SPACE).as_posix()
            for file in (SPACE / "assets" / "szl-card").rglob("*")
            if file.is_file()
        }
        self.assertEqual(names, set(EXACT))
        self.assertEqual(len(SOURCE_HF_REVISION), 40)

    def test_assets_have_exact_immutable_hf_sha256(self):
        for name, expected in EXACT.items():
            with self.subTest(name=name):
                path = SPACE / name
                self.assertFalse(path.is_symlink())
                blob = path.read_bytes()
                self.assertLessEqual(len(blob), 512000)
                self.assertEqual(hashlib.sha256(blob).hexdigest(), expected)

    def test_artifacts_are_passive_svg_without_remote_active_content(self):
        for name in EXACT:
            with self.subTest(name=name):
                data = (SPACE / name).read_bytes()
                self.assertNotIn(b"<!ENTITY", data.upper())
                root = ET.fromstring(data)
                self.assertEqual(root.tag.rsplit("}", 1)[-1].lower(), "svg")
                for element in root.iter():
                    local = element.tag.rsplit("}", 1)[-1].lower()
                    self.assertNotIn(local, FORBIDDEN_ELEMENTS)
                    for key, value in element.attrib.items():
                        key = key.rsplit("}", 1)[-1].lower()
                        if key.startswith("on") and key not in {"opacity"}:
                            self.fail("event handler is not an inert SVG property")
                        if key == "href":
                            self.assertTrue(value.startswith("#"), "external reference forbidden")
                        self.assertNotIn("javascript:", value.lower())
                        self.assertNotIn("http://", value.lower())
                        self.assertNotIn("https://", value.lower())

if __name__ == "__main__":
    unittest.main()
