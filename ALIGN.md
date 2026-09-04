# SZL align payload — paste this whole file to Grok in terminal

Goal: GitHub org `szl-holdings` aligned, and **this hologram lives on Hugging Face as a Space** (not a model dump, not `npm ci`).

Recommended Hub surface: **Space** `SZLHOLDINGS/holographic-unify`  
Payload: GitHub folder `space/` only (`Dockerfile` + `server.py` + `index.html` + README YAML).  
Hardware: `cpu-basic`. Port `7860`. Stdlib HTTP. RUNNING only after Immune / Hub readback.

You are Grok on a machine with `gh` logged in as an org owner. Optional: `HF_TOKEN` with write on `SZLHOLDINGS/holographic-unify`.

## Doctrine

- Take the job, never the weights.
- LIVE / HOLOGRAM / ROADMAP / REFUSED / UNSIGNED-honest / UNAVAILABLE.
- GPU vLLM / Unsloth = ROADMAP. Joules = UNAVAILABLE. Λ = Conjecture 1.
- No fake DSSE. No K3 / Qwen-Max / Inkling-975B dump.
- Do not `npm ci` on Hub. Do not COPY the Node app into a Space.
- Squash-merge only green PRs. Do not mass-close issues.

## Run

```bash
python3 szl_align.py
```

Save the block below as `szl_align.py` first.

```python
#!/usr/bin/env python3
"""Align szl-holdings GitHub + publish holographic-unify Hub Space flatten."""
from __future__ import annotations

import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ORG = "szl-holdings"
SPACE = "SZLHOLDINGS/holographic-unify"
REPO = "szl-holdings/holographic-unify"
DESC = (
    "SZL Holographic Unify — Wave 2026 estate command hologram. "
    "PEFT Forge. Serve gate. Circuit closed 16/2/1. Canonical source. Not a-11-oy.com."
)


def run(cmd: list[str], check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(cmd, text=True, capture_output=True, check=check)


def gh(*args: str, check: bool = True) -> subprocess.CompletedProcess[str]:
    return run(["gh", *args], check=check)


def gh_json(*args: str):
    p = gh(*args)
    return json.loads(p.stdout or "null")


def search(q: str) -> list[dict]:
    items: list[dict] = []
    page = 1
    while True:
        data = gh_json("api", f"search/issues?q={q}&per_page=100&page={page}")
        batch = data.get("items") or []
        items.extend(batch)
        if len(batch) < 100 or page * 100 >= int(data.get("total_count") or 0):
            break
        page += 1
    return items


def repo_of(item: dict) -> str:
    return str(item["repository_url"]).rstrip("/").split("/")[-1]


def pr_green(repo: str, n: int) -> tuple[bool, str]:
    view = gh_json(
        "pr", "view", str(n), "--repo", f"{ORG}/{repo}",
        "--json", "mergeable,mergeStateStatus,isDraft,statusCheckRollup,title",
    )
    if view.get("isDraft"):
        return False, "draft"
    roll = view.get("statusCheckRollup") or []
    failed = [c.get("name") for c in roll if str(c.get("conclusion") or "").upper() in
              {"FAILURE", "CANCELLED", "TIMED_OUT", "ACTION_REQUIRED"}]
    pending = [c.get("name") for c in roll
               if str(c.get("status") or "").upper() not in {"COMPLETED", "SUCCESS"}
               and str(c.get("conclusion") or "").upper() not in {"SUCCESS", "SKIPPED", "NEUTRAL"}]
    if failed:
        return False, f"failed:{failed}"
    if pending:
        return False, f"pending:{pending}"
    if view.get("mergeable") != "MERGEABLE":
        return False, str(view.get("mergeStateStatus"))
    return True, "green"


def squash(repo: str, n: int, title: str) -> dict:
    p = gh("pr", "merge", str(n), "--repo", f"{ORG}/{repo}", "--squash", "--delete-branch", check=False)
    return {"repo": repo, "number": n, "title": title, "ok": p.returncode == 0,
            "err": (p.stderr or "")[-300:]}


def align_unify() -> dict:
    p = gh("api", "-X", "PATCH", f"repos/{REPO}",
           "-f", f"description={DESC}", "-F", "archived=false",
           "-f", "homepage=https://huggingface.co/spaces/SZLHOLDINGS/holographic-unify",
           check=False)
    return {"ok": p.returncode == 0, "stderr": (p.stderr or "")[-200:]}


def publish_space(root: Path) -> dict:
    token = (os.environ.get("HF_TOKEN") or os.environ.get("HUGGING_FACE_HUB_TOKEN") or "").strip()
    flatten = root / "space"
    need = ["Dockerfile", "server.py", "index.html", "README.md"]
    missing = [n for n in need if not (flatten / n).is_file()]
    if missing:
        return {"ok": False, "error": f"flatten missing {missing}"}
    if not token:
        return {"ok": False, "error": "HF_TOKEN UNAVAILABLE — Space not pushed. GitHub flatten is ready."}

    # Prefer official CLI if present; else huggingface_hub; else raw Hub API upload is out of scope.
    if run(["which", "huggingface-cli"], check=False).returncode == 0:
        p = run(
            ["huggingface-cli", "upload", SPACE, str(flatten), ".", "--repo-type", "space"],
            check=False,
        )
        return {"ok": p.returncode == 0, "via": "huggingface-cli",
                "stdout": (p.stdout or "")[-400:], "stderr": (p.stderr or "")[-400:]}
    try:
        from huggingface_hub import HfApi  # type: ignore
    except ImportError:
        return {"ok": False, "error": "huggingface_hub UNAVAILABLE. pip install huggingface_hub and retry, or set HF_TOKEN and CLI."}
    try:
        api = HfApi(token=token)
        api.create_repo(SPACE, repo_type="space", exist_ok=True, space_sdk="docker")
        info = api.upload_folder(
            folder_path=str(flatten),
            repo_id=SPACE,
            repo_type="space",
            commit_message="chore(hub): stdlib Space flatten — no npm",
        )
        return {"ok": True, "via": "huggingface_hub", "commit": str(info)}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc)[:400]}


def probe_space() -> dict:
    url = f"https://huggingface.co/api/spaces/{SPACE}"
    req = urllib.request.Request(url, headers={"User-Agent": "szl-align/1"})
    try:
        with urllib.request.urlopen(req, timeout=20) as res:
            body = json.loads(res.read().decode())
        return {
            "ok": True,
            "id": body.get("id"),
            "sdk": (body.get("sdk") or body.get("cardData", {}).get("sdk")),
            "runtime": body.get("runtime", {}).get("stage") if isinstance(body.get("runtime"), dict) else body.get("runtime"),
            "likes": body.get("likes"),
        }
    except urllib.error.URLError as exc:
        return {"ok": False, "error": str(exc)}


def main() -> int:
    receipt = {
        "schema": "szl.align/v1",
        "org": ORG,
        "recommend": {
            "github_canonical": f"https://github.com/{REPO}",
            "hub_surface": "SPACE",
            "hub_id": SPACE,
            "hub_url": f"https://huggingface.co/spaces/{SPACE}",
            "not": "Not a model dump. Not a Node Space. Not a-11-oy.com.",
        },
        "proven_trust": False,
        "lambda": "Conjecture 1",
        "energy": "UNAVAILABLE",
        "gpu_vllm": "ROADMAP",
    }
    if gh("auth", "status", check=False).returncode != 0:
        print("UNAVAILABLE: gh auth", file=sys.stderr)
        return 2

    prs = search(f"org:{ORG}+is:pr+is:open")
    merged, blocked = [], []
    for item in prs:
        repo, n, title = repo_of(item), int(item["number"]), item["title"]
        for _ in range(8):
            ok, why = pr_green(repo, n)
            if ok:
                merged.append(squash(repo, n, title))
                break
            if why.startswith("failed") or why == "draft":
                blocked.append({"repo": repo, "number": n, "title": title, "why": why})
                break
            time.sleep(12)
        else:
            blocked.append({"repo": repo, "number": n, "title": title, "why": "timeout"})

    receipt["open_prs_before"] = len(prs)
    receipt["merged"] = merged
    receipt["blocked_prs"] = blocked
    receipt["open_prs_after"] = len(search(f"org:{ORG}+is:pr+is:open"))
    receipt["open_issues"] = len(search(f"org:{ORG}+is:issue+is:open"))
    receipt["unify"] = align_unify()

    root = Path.cwd()
    if not (root / "space" / "server.py").is_file():
        # try common checkouts
        for cand in (Path("/tmp/holographic-unify"), Path.home() / "holographic-unify"):
            if (cand / "space" / "server.py").is_file():
                root = cand
                break
    receipt["space_publish"] = publish_space(root)
    receipt["space_probe"] = probe_space()
    receipt["status"] = "ALIGNED" if receipt["open_prs_after"] == 0 else "PRS_REMAIN"
    receipt["note"] = (
        "Issues stay open without receipts. Space RUNNING is Immune/Hub readback, "
        "not this script claiming it."
    )
    print(json.dumps(receipt, indent=2))
    Path("szl-align-receipt.json").write_text(json.dumps(receipt, indent=2) + "\n")
    return 0 if receipt["status"] == "ALIGNED" else 1


if __name__ == "__main__":
    raise SystemExit(main())
```

## After it runs

1. Open https://huggingface.co/spaces/SZLHOLDINGS/holographic-unify
2. If the Space is BUILD_ERROR, check the Dockerfile is the flatten (`FROM mirror.gcr.io/library/python:3.12-slim`) — never a Node `npm ci`.
3. If HF_TOKEN was missing, from the holographic-unify checkout:

```bash
huggingface-cli upload SZLHOLDINGS/holographic-unify space . --repo-type space
```

4. Print `szl-align-receipt.json`. Never set `proven_trust` true.
