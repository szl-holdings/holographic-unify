---
title: SZL Holographic Unify
emoji: 🔮
colorFrom: yellow
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
suggested_hardware: cpu-basic
short_description: Estate command hologram. PEFT Forge. Serve gate. Wave 2026.
tags:
  - governed-ai
  - hologram
  - peft
  - vllm
  - ayllu
  - szl-holdings
szl:
  source_repo: szl-holdings/holographic-unify
  proof_url: https://github.com/szl-holdings/holographic-unify
---

# SZL Holographic Unify — Hub flatten

**GitHub is canonical.** Source:
[github.com/szl-holdings/holographic-unify](https://github.com/szl-holdings/holographic-unify).
Its `space/` directory is this Space's payload.

- Stdlib HTTP on 7860. No npm. No CUDA. No Unsloth.
- GPU vLLM / Unsloth remain **ROADMAP**.
- Energy joules are **UNAVAILABLE**. This Space takes no NVML reading.
- Λ uniqueness is **Conjecture 1**. Never proven trust.
- Kimi-K3 dump is **REFUSED**.

The only writer is the committed workflow
`.github/workflows/deploy-hf-space.yml` in the source repository. It runs
`scripts/publish_space.py --apply` on the exact `main` commit (push or manual
dispatch), then requires provider byte readback and a live `/healthz` before it
records success. Do not `npm ci` on Hub.
