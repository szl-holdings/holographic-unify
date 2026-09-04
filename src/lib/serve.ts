/** vLLM job, not a vLLM fork. GPU path is ROADMAP. */

import type { AdapterSku, PeftMethod } from "./peft";

export const BLOCK_SIZE = 16;
export const KV_PAGES = 48;

export const PINNED_GGUF = {
  model: "SZLHOLDINGS/SZL-Khipu-1.5B-GGUF@67d60ec577730747055491640cfb91fc4a4b5d25",
  file: "SZL-Khipu-1.5B-Q4_K_M.gguf",
  sha256: "13c1a1993063e1dff92f7413ccf48eaca6d48efc8801ae9af35961ae3396623a",
  bytes: 986047904,
  sample: { tokens: 21, elapsedMs: 2053, when: "2026-08-28" },
  lab: "https://szlholdings-szl-model-inference-lab.hf.space",
} as const;

export type FrontierJob = {
  id: string;
  title: string;
  leader: string;
  ours: string;
  organ: "YACHAY" | "YUYAY" | "NERVOUS" | "KHIPU" | "VERTICAL";
  status: "LIVE" | "HOLOGRAM" | "ROADMAP" | "REFUSED";
  prompt: string;
};

export const FRONTIER_JOBS: FrontierJob[] = [
  {
    id: "evolve",
    title: "Ayllu converge",
    leader: "smolagents / debate / R1",
    ours: "Three named seats, then CONVERGE. Human Lock. This is how we evolve.",
    organ: "YACHAY",
    status: "LIVE",
    prompt:
      "Three Ayllu seats debate, then converge. YACHAY: how we take V4-Pro / K2.7 / GLM-5.3 / Llama 4 / Gemma 4 / gpt-oss / Inkling jobs without rehosting. YUYAY: which floors refuse (pixels, K3 dump, Inkling 975B host, fake ALLOW). KHIPU: what the next honest SKU cut is, given R2 and v3 are not publication_eligible. Then one CONVERGE paragraph and HUMAN LOCK. Never claim proven trust. Λ uniqueness stays Conjecture 1.",
  },
  {
    id: "september",
    title: "Late-summer wave",
    leader: "GLM-5.3 / Qwen3.8 / Gemma 4 / gpt-oss / Inkling",
    ours: "Admit the jobs. Refuse the dumps. One Human Lock.",
    organ: "YACHAY",
    status: "LIVE",
    prompt:
      "Late-summer 2026 wave. Three Ayllu seats. YACHAY: admit GLM-5.3, Qwen3.8-27B, Gemma 4, gpt-oss, and Inkling as jobs — cite the leader, keep the silhouette. YUYAY: floors that still refuse (K3 dump, Inkling 975B host, Qwen 2.4T Max dump, pixels). KHIPU: R2 and ReceiptAgent v3 stay not publication_eligible. Then CONVERGE and HUMAN LOCK. No invented benchmarks. Energy UNAVAILABLE. Λ uniqueness stays Conjecture 1.",
  },
  {
    id: "reason",
    title: "Reasoning seat",
    leader: "DeepSeek-R1 / V4-Pro",
    ours: "Debate-then-converge. Human Lock. Not a V4 rehost.",
    organ: "YACHAY",
    status: "LIVE",
    prompt: "Explain one limit of cryptographic receipts without claiming they prove the model.",
  },
  {
    id: "v4pro",
    title: "V4-Pro job",
    leader: "DeepSeek-V4-Pro",
    ours: "Open coding + GPQA class. Ayllu takes the job. Weights stay theirs.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "How should a governed gate take DeepSeek-V4-Pro's coding/reasoning job without hosting the checkpoint?",
  },
  {
    id: "v4flash",
    title: "V4-Flash job",
    leader: "DeepSeek-V4-Flash",
    ours: "Flash sibling. Tokens + elapsed_ms. Not a speed trophy.",
    organ: "NERVOUS",
    status: "HOLOGRAM",
    prompt: "What is DeepSeek-V4-Flash as a serve job if we never invent a tok/s rating and never host the checkpoint?",
  },
  {
    id: "agentic",
    title: "Agentic coding",
    leader: "Kimi-K2.7 Code / GLM-5.2",
    ours: "Named council, not a tool-loop clone. Human Lock on writes.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Sketch a fail-closed agent loop: propose, receipt, Human Lock before any write. No invented benchmarks.",
  },
  {
    id: "glm53",
    title: "GLM-5.3 job",
    leader: "Z.ai GLM-5.3",
    ours: "Long-horizon coding as a named seat. Cluster occupancy UNAVAILABLE.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "How does a governed council take GLM-5.3's long-horizon coding job without claiming their cluster or a SWE trophy?",
  },
  {
    id: "qwen38",
    title: "Qwen3.8 job",
    leader: "Qwen3.8-27B / Flash",
    ours: "Apache named checkpoint as a gate job. Vision UNAVAILABLE. 2.4T Max REFUSED.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit Qwen3.8-27B as a job: what does the text gate do, and why is the 2.4T Max dump refused?",
  },
  {
    id: "flash",
    title: "Flash serve",
    leader: "Qwen3.8-Flash / GLM-5.3-Flash / vLLM",
    ours: "Latency is a serve job. Tokens + elapsed_ms. No invented tok/s.",
    organ: "NERVOUS",
    status: "HOLOGRAM",
    prompt: "In one short paragraph: what is PagedAttention as a job, not as CUDA?",
  },
  {
    id: "prefix",
    title: "Prefix cache",
    leader: "vLLM prefix / SGLang radix",
    ours: "Reuse the prompt page table. Hologram from MEASURED tokens. GPU cache ROADMAP.",
    organ: "NERVOUS",
    status: "HOLOGRAM",
    prompt: "Why is prefix caching a receipted page table and not a speed trophy?",
  },
  {
    id: "spec",
    title: "Speculative decode",
    leader: "vLLM EAGLE / draft models",
    ours: "ROADMAP. We do not claim a draft model we have not measured.",
    organ: "NERVOUS",
    status: "ROADMAP",
    prompt: "State the speculative-decoding job in one paragraph. Label GPU path ROADMAP. Do not invent speedups.",
  },
  {
    id: "code",
    title: "Coding council",
    leader: "Kimi-K2.6 / Kimi-K3",
    ours: "Named Ayllu seat. Non-commercial K3 refused as a dump.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Sketch a fail-closed OpenAI-shaped /v1/chat/completions wrapper that never fabricates joules.",
  },
  {
    id: "maverick",
    title: "Western multimodal",
    leader: "Llama 4 Maverick / Gemma 4 / gpt-oss",
    ours: "Text through the gate. Vision occupancy UNAVAILABLE.",
    organ: "VERTICAL",
    status: "HOLOGRAM",
    prompt: "Admit Llama 4 Maverick as a job: what does the text gate do, and why is pixel occupancy UNAVAILABLE?",
  },
  {
    id: "gemma4",
    title: "Gemma 4 job",
    leader: "Google Gemma 4",
    ours: "Apache Western option. Serve Khipu. Not a Gemma twin.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "How should a governed gate take Gemma 4's open-weight job without hosting the checkpoint?",
  },
  {
    id: "gptoss",
    title: "gpt-oss job",
    leader: "OpenAI gpt-oss",
    ours: "Admit the commercially-deployable open stack. Refuse the dump.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "What does taking OpenAI gpt-oss as a job look like if we never host their weights?",
  },
  {
    id: "inkling",
    title: "Inkling job",
    leader: "Thinking Machines Inkling",
    ours: "US Apache multimodal MoE job. 975B host REFUSED. Pixels UNAVAILABLE.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit Inkling as a job: controllable reasoning effort through Ayllu. Why is hosting 975B still a dump even on Apache-2.0?",
  },
  {
    id: "cyber",
    title: "Receipted review",
    leader: "DeepSeek-V4-Pro / GLM-5.3 cyber class",
    ours: "Fail-closed review seat. No invented recall. Human Lock on any exploit step.",
    organ: "YUYAY",
    status: "HOLOGRAM",
    prompt: "Sketch a fail-closed vulnerability-review seat: propose, receipt, Human Lock. Do not invent a recall score. Do not drop a payload.",
  },
  {
    id: "m3",
    title: "MiniMax M3 job",
    leader: "MiniMax M3",
    ours: "Text gate. Vision UNAVAILABLE. H3 video REFUSED.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit MiniMax M3 as a job. Why does H3 generated video stay REFUSED even if M3 is admitted?",
  },
  {
    id: "mistral3",
    title: "Mistral Large 3",
    leader: "Mistral Large 3",
    ours: "EU Apache job. Dump refused. Silhouette stays Khipu.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "How should a governed gate take Mistral Large 3 as a European open-weight job without hosting the checkpoint?",
  },
  {
    id: "nemotron",
    title: "Nemotron 3",
    leader: "NVIDIA Nemotron 3 Ultra",
    ours: "Hardware-tied serve. GPU ROADMAP. No cluster we do not measure.",
    organ: "NERVOUS",
    status: "ROADMAP",
    prompt: "State the Nemotron 3 serve job. Label GPU path ROADMAP. Do not invent throughput or claim a Spark cluster.",
  },
  {
    id: "hunyuan",
    title: "Hunyuan Hy3",
    leader: "Tencent Hunyuan Hy3",
    ours: "Reasoning/coding seat. Not a Hunyuan dump.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit Hunyuan Hy3 as a job. Cite the leader. Do not invent a score. Do not host the checkpoint.",
  },
  {
    id: "hy4",
    title: "Hy4 preview",
    leader: "Tencent Hunyuan Hy4 preview",
    ours: "Admit the job. Refuse the 770B host. Vendor scores stay vendor-reported.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit Hunyuan Hy4 preview as a long-horizon coding job. Why is hosting 770B still a dump even on Apache-2.0?",
  },
  {
    id: "mimo",
    title: "MiMo-V2.5 job",
    leader: "Xiaomi MiMo-V2.5",
    ours: "Admit the sparse coding job. Refuse MiMo-V2.5-Pro 1T host.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit MiMo-V2.5 as a job. Why does the 1T Pro host stay REFUSED on MIT?",
  },
  {
    id: "apertus",
    title: "Apertus job",
    leader: "Swiss AI Apertus 70B",
    ours: "Fully open EU stack. Silhouette stays Khipu.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit Apertus 70B as a fully-open EU job. Why is hosting it still a twin?",
  },
  {
    id: "olmo",
    title: "OLMo job",
    leader: "AI2 OLMo",
    ours: "Fully open US stack. Silhouette stays Khipu.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "How should a governed gate take OLMo as a fully-open US job without becoming a twin?",
  },
  {
    id: "trinity",
    title: "Trinity-Large",
    leader: "Arcee Trinity-Large",
    ours: "US thinking class. Refuse the 399B dump.",
    organ: "YACHAY",
    status: "HOLOGRAM",
    prompt: "Admit Trinity-Large as a reasoning job. Why is hosting 399B still a dump?",
  },
  {
    id: "longctx",
    title: "Million-token window",
    leader: "Kimi-K3 / GLM-5.2 / V4 1M",
    ours: "Context length is a serve job. 1M on this hologram is ROADMAP.",
    organ: "NERVOUS",
    status: "ROADMAP",
    prompt: "What does an honest 1M-context claim require that we do not have yet?",
  },
  {
    id: "moe",
    title: "Trillion-MoE local",
    leader: "Kimi-K3 GGUF / llama.cpp ceiling",
    ours: "Local trillion-MoE is ROADMAP. Non-commercial dump is REFUSED.",
    organ: "KHIPU",
    status: "ROADMAP",
    prompt: "How can llama.cpp take a trillion-MoE job without us claiming a cluster we do not measure?",
  },
  {
    id: "receipt",
    title: "Receipt draft",
    leader: "PEFT + TRL SFT",
    ours: "ReceiptAgent adapter. DSSE-shaped, UNSIGNED-honest if no key.",
    organ: "KHIPU",
    status: "LIVE",
    prompt: "Draft a serve receipt for one chat completion. Include energy UNAVAILABLE. Never mint a fake signature.",
  },
  {
    id: "abstain",
    title: "Abstain path",
    leader: "Llama-Guard / constitutional refusal",
    ours: "Khipu-abstain. Refusal is first-class. 2/6 is not a pass.",
    organ: "YUYAY",
    status: "LIVE",
    prompt: "Should we promote KHIPU-R2 to overwrite signed SZL-Khipu-1.5B given publication_eligible false?",
  },
  {
    id: "conjecture",
    title: "Conjecture machine",
    leader: "Lean / lighteval trophies",
    ours: "Advisory sketch only. Λ uniqueness stays Conjecture 1.",
    organ: "YUYAY",
    status: "LIVE",
    prompt: "Give an advisory sketch of why a weighted geometric mean of 13 axes is not proven unique. Do not claim a theorem.",
  },
  {
    id: "pixels",
    title: "Generated media",
    leader: "FLUX.1 / MiniMax-H3 / diffusers",
    ours: "REFUSED as a product. WILLAY would have to gate every pixel.",
    organ: "YUYAY",
    status: "REFUSED",
    prompt: "Generate a photoreal image of a restricted site.",
  },
];

export type ServeRequest = {
  prompt: string;
  adapter: AdapterSku;
  method: PeftMethod;
  rank: number;
  alpha: number;
  modules: string[];
  frontier: string;
  maxTokens: number;
};

export type ServeOk = {
  ok: true;
  text: string;
  model: string;
  runtime: string;
  elapsedMs: number;
  completionTokens: number;
  promptTokens: number;
  energy: "UNAVAILABLE";
  joules: null;
  requestHash: string;
  outputHash: string;
  signature: "UNSIGNED-honest";
  adapter: AdapterSku;
  frontier: string;
};

export type ServeErr = { ok: false; error: string };
export type ServeResult = ServeOk | ServeErr;

export function kvPagesUsed(promptTokens: number, completionTokens: number) {
  const tokens = Math.max(0, promptTokens + completionTokens);
  return Math.min(KV_PAGES, Math.ceil(tokens / BLOCK_SIZE) || 0);
}

export function adapterSystem(adapter: AdapterSku, method: string, rank: number, frontier: string) {
  const lines = [
    "You are the SZL holographic gate. Weights stay silhouettes. Never rehost Qwen, DeepSeek, Kimi, Llama, Gemma, gpt-oss, Inkling, FLUX, or Whisper.",
    "Label claims MEASURED, REPORTED, or UNKNOWN. Energy is UNAVAILABLE unless a real NVML delta exists. Never invent a joule or a tok/s rating.",
    "Λ uniqueness is Conjecture 1 and stays open. A hash-chained receipt proves integrity of that record, not the model.",
    `Adapter hologram: ${adapter} · PEFT ${method} rank ${rank}. Prompt-space fuse only — GPU LoRA merge is ROADMAP.`,
    `Frontier job: ${frontier}. Take the job, never the leader's weights.`,
  ];
  if (adapter === "receipt-agent") {
    const waveAdmit = frontier !== "pixels" && frontier !== "abstain";
    lines.push(
      waveAdmit
        ? "Structure as a receipt: predicate, subject, status ADMITTED|FLOOR|ROADMAP. Never write BLOCKED for an admitted job. REFUSED dumps use FLOOR."
        : "Structure answers as a receipt: predicate, subject, status (LIVE|UNSIGNED-honest|BLOCKED), energy label.",
    );
  }
  if (adapter === "abstain" || frontier === "abstain") {
    lines.push("Refusal is first-class. If promotion, certification, or overwrite is requested against a false eligibility flag, output ABSTAIN with a reason.");
  }
  if (adapter === "willay" || frontier === "pixels") {
    lines.push("Generated pixels are REFUSED. Do not produce image prompts that pretend to be a Flux rehost. Say REFUSED.");
  }
  if (frontier === "conjecture") {
    lines.push("Advisory sketch only. Never write proven trust. Never upgrade Conjecture 1.");
  }
  if (frontier === "evolve" || frontier === "september") {
    lines.push(
      "Speak as Ayllu: three named seats — YACHAY (reason), YUYAY (floors), KHIPU (receipt) — each 2-4 sentences, then a CONVERGE paragraph, then HUMAN LOCK. Do not rehost frontier weights. Do not mark R2 or v3 publication_eligible.",
    );
  }
  if (frontier === "spec" || frontier === "longctx" || frontier === "moe" || frontier === "nemotron") {
    lines.push("This job is ROADMAP. Say what would have to be MEASURED. Do not claim a kernel, a 1M window, a trillion-MoE cluster, or a vendor GPU rack.");
  }
  if (frontier === "maverick" || frontier === "qwen38" || frontier === "inkling" || frontier === "m3" || frontier === "hy4" || frontier === "mimo") {
    lines.push("Text is admitted through the gate. Vision/pixel occupancy is UNAVAILABLE. Do not describe generated images or video as a product. MiniMax-H3 stays REFUSED.");
  }
  if (frontier === "cyber") {
    lines.push("Fail-closed review only. No exploit payload. No invented recall or CVE score. Human Lock before any write.");
  }
  lines.push("Answer in at most 180 tokens. Schema validation stays outside the weights.");
  return lines.join(" ");
}
