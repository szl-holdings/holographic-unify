# Holographic Space card assets: source binding, review only

The existing Hugging Face Space SZLHOLDINGS/holographic-unify at immutable
revision b700b5d837a61440bba5802d2bcf115156eed848 contained two
provider-only card SVG files. The canonical GitHub publisher correctly
denied publication with UNOWNED_PROVIDER_FILES rather than deleting files.

This branch adopts those existing, inert SVGs byte-identically into
canonical GitHub source space/assets/szl-card/ for owner license review.

HF original files and SHA-256:
- assets/szl-card/mesh-receipts.svg : e2ec8f99d35ccdaa3a2a7d2efc1551f186e53012ff84b56dbc994b36fef659db
- assets/szl-card/org-context.svg : cd7090a350bed6168133489b1f97e4968c0320d8961fec08e7d9950bfd6ea23f

The publisher uses exact nested relative paths, preserves .gitattributes,
refuses all other provider-only paths, rejects symlinks and requires exact
provider and live-byte verification after any authorized Hub commit. Runtime
identity checks include both card assets in the bound source manifest.
No new runtime HTTP endpoints are added.

No Hub write, file deletion, revision bypass, signing-key claim, workflow
dispatch or production maintenance action is authorized here. The target
was already RUNNING before this source branch; that does not prove a
candidate was published, trained or browser-verified.

Merge: card licensing and ownership approval, source CI and human review.
Production release: an approved maintenance window, exact protected-main
SHA, governed Hub writer, immutable provider and live-byte readback.


## Independently reproduced existing source-projection hold

The protected-main source's native-projection contract already fails in an
unaltered Linux Git archive: 51 tests, 4 failures. This branch's 53-test
candidate likewise has exactly 4 failures in that same test, with no new
failures. These discrepancies involve the five-item flat/native presentation
manifest, not the two newly adopted card SVGs.

Affected pinned assets:
- szl-tokens.css
- szl-source.json
- szl-icon-32.svg
- favicon.svg

Their working Git-blobs differ from the immutable hashes recorded in
space/szl-projection.json and tests/test_native_frontend.py. Do not simply
update expected hashes to make a green display. A separate szl-brand source
revision and exact-byte ownership review is required. Release remains HOLD.
