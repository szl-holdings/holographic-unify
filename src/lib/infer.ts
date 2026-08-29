import { createServerFn } from "@tanstack/react-start";
import type { AdapterSku, PeftMethod } from "./peft";
import { adapterSystem, type ServeRequest, type ServeResult } from "./serve";

const ADAPTERS = new Set<AdapterSku>(["receipt-agent", "khipu", "abstain", "chaski", "willay", "custom"]);
const METHODS = new Set<PeftMethod>(["lora", "qlora", "dora", "rslora", "ia3"]);

async function sha256hex(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function parseInput(input: unknown): ServeRequest {
  if (!input || typeof input !== "object") throw new Error("invalid serve payload");
  const d = input as Record<string, unknown>;
  const prompt = String(d.prompt ?? "").trim();
  if (!prompt) throw new Error("prompt required");
  if (prompt.length > 800) throw new Error("prompt exceeds 800 characters");
  const adapter = (ADAPTERS.has(d.adapter as AdapterSku) ? d.adapter : "khipu") as AdapterSku;
  const method = (METHODS.has(d.method as PeftMethod) ? d.method : "qlora") as PeftMethod;
  const rank = Math.min(128, Math.max(1, Number(d.rank) || 16));
  const alpha = Math.min(256, Math.max(1, Number(d.alpha) || 32));
  const modules = Array.isArray(d.modules) ? d.modules.map((m) => String(m)).slice(0, 8) : ["q_proj", "v_proj"];
  const frontier = String(d.frontier ?? "reason").slice(0, 32);
  const maxTokens = Math.min(180, Math.max(24, Number(d.maxTokens) || 140));
  return { prompt, adapter, method, rank, alpha, modules, frontier, maxTokens };
}

export const runServe = createServerFn({ method: "POST" })
  .validator((input: unknown) => parseInput(input))
  .handler(async ({ data }): Promise<ServeResult> => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      return { ok: false, error: "Gate UNAVAILABLE — no runtime key in this environment." };
    }

    const system = adapterSystem(data.adapter, data.method, data.rank, data.frontier);
    const t0 = Date.now();
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4.5",
        temperature: 0.35,
        max_tokens: data.maxTokens,
        messages: [
          { role: "system", content: system },
          { role: "user", content: data.prompt },
        ],
      }),
    });
    const elapsedMs = Date.now() - t0;
    if (!res.ok) {
      return { ok: false, error: `Gate error ${res.status}. Honest fail-closed.` };
    }
    const body = (await res.json()) as {
      model?: string;
      choices?: { message?: { content?: string } }[];
      usage?: { completion_tokens?: number; prompt_tokens?: number };
    };
    const text = body.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, error: "Empty completion. UNSIGNED-honest silence." };
    const requestHash = await sha256hex(`${data.adapter}|${data.frontier}|${data.prompt}`);
    const outputHash = await sha256hex(text);
    return {
      ok: true,
      text,
      model: body.model ?? "grok-4.5",
      runtime: "xAI gate hologram · not SZL-Khipu-1.5B-GGUF weights · GPU vLLM ROADMAP",
      elapsedMs,
      completionTokens: body.usage?.completion_tokens ?? 0,
      promptTokens: body.usage?.prompt_tokens ?? 0,
      energy: "UNAVAILABLE",
      joules: null,
      requestHash,
      outputHash,
      signature: "UNSIGNED-honest",
      adapter: data.adapter,
      frontier: data.frontier,
    };
  });
