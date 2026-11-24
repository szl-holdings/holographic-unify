# W27 HF batch-1 audit #7: holographic-unify leader study (propose-only)

Date: 2026-11-24. OUROBOROS program, HF SZLHOLDINGS space audit batch 1, item 7.
Governing seat ruling nonce: HOLK1-20261124T012800Z (Kimi GO_MERGES for this study doc; plan edits appended).

Facts (measured 2026-11-23/24):
- Wave 2026 estate command desk; self-described NOT the flagship (canonical product a11oy).
- Container space (app_port 7860, cpu-basic suggested hardware). Tags: peft, vllm, ayllu, hologram.
- Recently landed: publisher retries transient stale runtime readbacks WITHOUT relaxing
  admission; source-own immutable holographic Space card assets (#61); null Git revision
  rejected across publisher, runtime and UI (#60).
- TS repo, 94 files. Doctrine v11, fail-closed, Apache-2.0, GitHub=source HF=mirror.

Leaders studied (2026-11-24):
1. PEFT practice 2026: HF PEFT methods docs; practitioner guides converge on
   LoRA/DoRA over quantized bases for single-GPU budgets (gamut.so 2026 guide;
   pristren 2026 single-GPU LoRA walkthrough).
2. vLLM in production 2026: high-throughput serving patterns; MLOps inference
   optimization production patterns 2026 (data-gate.ch).
3. GGUF/llama.cpp deployment 2026: real deployment guides (qwe.edu.pl) and the
   practical local-LLM stack 2026 (haal-lab.solutions): CPU-first serving with
   quantized GGUF fits cpu-basic hardware far better than GPU-oriented vLLM paths.

Honest gaps (no claims asserted as measured without receipts):
- Serve gate references vLLM while the Space runs cpu-basic: the vLLM path may be
  dead weight HERE while llama.cpp/GGUF is the natural fit - benchmark before switch,
  no assertion either way.
- No PEFT recipe receipts visible at repo top level.
- No performance/scale claims made in this study; all require receipts first.

Absorb plan (ratified, Kimi HOLK1-20261124T012800Z):
1. THIS PR: propose-only study doc (text-only; no runtime, deps, CI, deploy changes).
2. Later PR: honest benchmark receipts, serve-gate vLLM vs llama.cpp/GGUF on cpu-basic,
   BEFORE any switch decision.
3. Later PR (conditional): PEFT recipe receipt template (LoRA/DoRA config provenance)
   only if PEFT Forge is used in anger in this Space.
4. Absorb-or-sunset memo to owner: this desk overlaps a11oy flagship functions; the
   estate must not silently grow a second flagship - owner decides absorb vs sunset.

Governing seat plan edits (verbatim):
- PR-1 (this text-only study PR) is approved for merge: it is non-runtime, fail-closed, and creates the missing leader-study card without changing admission, serving, or asset behavior.
- PR-1 must explicitly record the hardware mismatch as an open question, not a conclusion: vLLM references in the serve gate are not proven dead weight, and llama.cpp/GGUF is not approved as a replacement until measured on the actual cpu-basic Space.
- PR-2 must be a benchmark-receipts PR before any switch: compare the current serve-gate path against llama.cpp GGUF on cpu-basic using the same prompts, context lengths, concurrency, quantization level, and admission policy; report cold start, time to first token, tokens/sec, p50/p95 latency, memory/RSS, failure rate, and gate outcomes.
- PR-2 must include a control proving the serve gate still fails closed under both paths; no admission relaxation, no null Git revision acceptance, and no publisher retry behavior changes are permitted as part of the benchmark.
- PR-3 (PEFT recipe receipt template) is approved only as a conditional later PR: add LoRA/DoRA config provenance, base model and quantization details, dataset/source provenance, license, seed, dependency versions, and artifact hashes if and only if PEFT Forge is actually used in anger.
- PR-4 must be an owner-facing ABSORB-OR-SUNSET decision memo with an explicit function-overlap matrix against a11oy; it must not silently grow holographic-unify into a second flagship and must state the migration/archival path if a11oy absorbs the desk.
- All scale/performance language in PR-1 must be framed as hypotheses or measured gaps; all technology availability statements must carry dated primary-source checks and the 2026-11-24 study date.

Non-goals: no renderer/publisher changes, no dependency changes, no secrets.
Each implementation step = separate PR + governing review + owner approval.
