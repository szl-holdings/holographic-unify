# SZL other desks — ChatGPT + Perplexity on GitHub and Hugging Face

Use this when Grok credits are out. You connect **your** accounts. Nobody else can authorize them for you.

## What this is

Same estate, three desks:

| Desk | GitHub | Hugging Face |
| --- | --- | --- |
| Grok | already hooked in this builder | Hub is artifact registry only |
| ChatGPT | Settings → Apps → GitHub | Settings → Apps → Hugging Face, or MCP `https://huggingface.co/mcp` |
| Perplexity Pro/Max | [Connectors](https://www.perplexity.ai/account/connectors) → GitHub | No first-party HF connector. Use Hub search in chat + this prompt, or HF MCP in a local client |

Canonical source: https://github.com/szl-holdings/holographic-unify  
Flagship product: https://github.com/szl-holdings/a11oy  
Hub org: https://huggingface.co/SZLHOLDINGS  
Proof: https://a11oy.net  
Product site: https://a-11-oy.com (not certified)

## 1. ChatGPT

1. Open ChatGPT → profile → **Settings → Apps / Connectors**.
2. Enable **GitHub**. Authorize `szl-holdings` (and your user) with the smallest scopes that still let it read code and open PRs. Prefer a fine-grained PAT if the app asks for a token: `contents:read/write`, `pull_requests:write`, `issues:write` on named repos only. Never `admin:org`. Never paste the token into a chat.
3. Enable **Hugging Face** if it appears in Apps. Else add a custom MCP connector:
   - URL: `https://huggingface.co/mcp`
   - Auth: Hugging Face access token from https://huggingface.co/settings/tokens  
   - Token lives in ChatGPT connector settings, not in a repo.
4. Create a Custom GPT named **SZL estate desk**. Paste the system prompt below as Instructions. Knowledge: attach this file plus `https://github.com/szl-holdings/.github/blob/main/AGENTS.md` if the GPT accepts URLs.
5. Start a chat: “Open PRs in szl-holdings. Squash-merge only if checks are green. Do not close issues without receipts.”

## 2. Perplexity

1. Plan must be **Pro, Max, or Enterprise**. Free has no GitHub connector.
2. Open https://www.perplexity.ai/account/connectors
3. Enable **GitHub** → Authorize. Same scope discipline as above.
4. Create a Space / collection named **SZL estate**. Add the GitHub org and this file.
5. First query: “Search org:szl-holdings is:pr is:open. List them. Do not merge until I confirm.”
6. Hugging Face: Perplexity has no official Hub connector. Tell it the org `SZLHOLDINGS` and paste model/Space IDs. For write access to Hub, use ChatGPT HF app, `huggingface_hub` locally, or HF MCP in Cursor — not Perplexity.

## 3. Tokens (create these yourself)

- GitHub: https://github.com/settings/tokens?type=beta — fine-grained, expire 30–90 days, repos `szl-holdings/*` you actually need.
- Hugging Face: https://huggingface.co/settings/tokens — write only if the desk must push Spaces. Otherwise read.
- Never commit tokens. Never put them in Unify, Grok chat, or this file.

## 4. System prompt (paste into both desks)

```text
You are the SZL Holdings fallback desk. GitHub org szl-holdings. Hub org SZLHOLDINGS.
Canonical hologram: szl-holdings/holographic-unify. Flagship: szl-holdings/a11oy. Proof: a11oy.net. Product: a-11-oy.com (not certified).
Doctrine v11. Take the JOB never the leader's weights. Labels: LIVE | HOLOGRAM | ROADMAP | REFUSED | UNSIGNED-honest | UNAVAILABLE | BLUEPRINT_NOT_TRAINED.
GPU Unsloth/vLLM CUDA = ROADMAP. Joules = UNAVAILABLE unless NVML MEASURED. Λ uniqueness = Conjecture 1. No fake DSSE. No Flux/K3/Qwen-Max/Inkling-975B dumps.
Squash-merge only green PRs. Do not mass-close issues. Close only with attached evidence.
When Grok is out of credits, keep pushing Wave 2026 jobs the same way: admit the job, refuse the dump.
```

## 5. Honesty

This file does not log you in. After you click Enable on both products, those desks can see the same GitHub the Grok desk already uses. Hugging Face writes stay on ChatGPT MCP or a local token — Perplexity can read the public Hub, not operate it.
