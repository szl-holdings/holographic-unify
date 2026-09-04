/** Wave 2026 + SKU lineage. Organs evolve by taking jobs, never by cloning weights. */

export type WaveStatus = "LIVE" | "HOLOGRAM" | "ROADMAP" | "REFUSED" | "CUTTING";

export type WaveCard = {
  id: string;
  name: string;
  lab: string;
  job: string;
  license: string;
  ours: string;
  status: WaveStatus;
  admit: string;
  note: string;
};

export const WAVE_2026: WaveCard[] = [
  {
    id: "v4pro",
    name: "DeepSeek-V4-Pro",
    lab: "DeepSeek",
    job: "Open coding + graduate reasoning",
    license: "MIT",
    ours: "Ayllu reasoning/coding seats. Not a V4 dump.",
    status: "HOLOGRAM",
    admit: "v4pro",
    note: "Best-open all-round class in 2026 writeups. We take the job.",
  },
  {
    id: "v4flash",
    name: "DeepSeek-V4-Flash",
    lab: "DeepSeek",
    job: "Fast long-context reasoning / coding",
    license: "MIT",
    ours: "Flash is a serve job. Tokens + elapsed_ms. Not a V4 dump.",
    status: "HOLOGRAM",
    admit: "v4flash",
    note: "Sibling to V4-Pro. Throughput stays honest. No invented tok/s.",
  },
  {
    id: "k27",
    name: "Kimi-K2.7 Code",
    lab: "Moonshot",
    job: "Agentic software engineering",
    license: "mixed",
    ours: "Named council. Human Lock on high-risk tools.",
    status: "HOLOGRAM",
    admit: "agentic",
    note: "Tool-use is a seat, not a Kimi checkpoint.",
  },
  {
    id: "glm52",
    name: "GLM-5.2",
    lab: "Z.ai",
    job: "Open agentic coding · 1M context",
    license: "MIT",
    ours: "Coding job → Ayllu. Million-token window is ROADMAP.",
    status: "HOLOGRAM",
    admit: "agentic",
    note: "Permissive license. Still not a rehost.",
  },
  {
    id: "glm53",
    name: "GLM-5.3",
    lab: "Z.ai",
    job: "Long-horizon coding + cyber review",
    license: "mixed",
    ours: "Receipted review seat. Not a GLM dump. No invented recall.",
    status: "HOLOGRAM",
    admit: "glm53",
    note: "Late-summer 2026 coding class. Occupancy of their cluster UNAVAILABLE.",
  },
  {
    id: "m3",
    name: "MiniMax M3",
    lab: "MiniMax",
    job: "Production multimodal + coding class",
    license: "minimax-community",
    ours: "Text through the gate. Vision occupancy UNAVAILABLE. H3 video stays REFUSED.",
    status: "HOLOGRAM",
    admit: "m3",
    note: "Take the M3 job. Do not become MiniMax-H3.",
  },
  {
    id: "qwen235",
    name: "Qwen3-235B-A22B",
    lab: "Alibaba",
    job: "Cheap permissive multilingual MoE",
    license: "Apache-2.0",
    ours: "Gate. Serve Khipu. Not a 235B twin.",
    status: "HOLOGRAM",
    admit: "flash",
    note: "Apache-2.0 is clean. Occupancy of their experts UNAVAILABLE.",
  },
  {
    id: "qwen38",
    name: "Qwen3.8-27B",
    lab: "Alibaba",
    job: "Apache multimodal named checkpoint",
    license: "Apache-2.0",
    ours: "Text through the gate. Vision occupancy UNAVAILABLE. Not a Qwen twin.",
    status: "HOLOGRAM",
    admit: "qwen38",
    note: "Approachable named checkpoint. 2.4T Max stays REFUSED as a dump.",
  },
  {
    id: "maverick",
    name: "Llama 4 Maverick",
    lab: "Meta",
    job: "Western open multimodal",
    license: "Llama",
    ours: "Text gate now. Vision occupancy UNAVAILABLE until measured.",
    status: "HOLOGRAM",
    admit: "maverick",
    note: "Western option. Custom license. Not a twin.",
  },
  {
    id: "gemma4",
    name: "Gemma 4",
    lab: "Google",
    job: "Western Apache open weights",
    license: "Apache-2.0",
    ours: "Clean license. Silhouette remains Khipu. Not a Gemma rehost.",
    status: "HOLOGRAM",
    admit: "gemma4",
    note: "US/EU-deployable option. Laptop class is a serve job, not a trophy.",
  },
  {
    id: "gptoss",
    name: "gpt-oss",
    lab: "OpenAI",
    job: "Western commercially-deployable open stack",
    license: "Apache-2.0",
    ours: "Admit the open-weight job. Refuse the checkpoint dump.",
    status: "HOLOGRAM",
    admit: "gptoss",
    note: "First OpenAI open weights since GPT-2 class. Still not ours to host.",
  },
  {
    id: "inkling",
    name: "Inkling",
    lab: "Thinking Machines",
    job: "US Apache multimodal MoE · controllable effort",
    license: "Apache-2.0",
    ours: "Admit the Western open job. Refuse the 975B dump. Pixels UNAVAILABLE.",
    status: "HOLOGRAM",
    admit: "inkling",
    note: "975B / 41B active. License is clean. Hosting it is still a dump.",
  },
  {
    id: "mistral3",
    name: "Mistral Large 3",
    lab: "Mistral",
    job: "European Apache open weights",
    license: "Apache-2.0",
    ours: "Admit the EU provenance job. Refuse the checkpoint dump.",
    status: "HOLOGRAM",
    admit: "mistral3",
    note: "European option. Clean license. Still not a twin.",
  },
  {
    id: "nemotron",
    name: "Nemotron 3 Ultra",
    lab: "NVIDIA",
    job: "US hardware-tied serve class",
    license: "custom",
    ours: "Throughput job. GPU path ROADMAP. Not a Nemotron dump.",
    status: "ROADMAP",
    admit: "nemotron",
    note: "Vendor models sell chips. We do not claim a cluster we do not measure.",
  },
  {
    id: "hunyuan",
    name: "Hunyuan Hy3",
    lab: "Tencent",
    job: "Open reasoning / coding class",
    license: "mixed",
    ours: "Ayllu seat. Not a Hunyuan dump. No invented HLE score.",
    status: "HOLOGRAM",
    admit: "hunyuan",
    note: "Cite the leader. Occupancy of their cluster UNAVAILABLE.",
  },
  {
    id: "hy4",
    name: "Hunyuan Hy4 preview",
    lab: "Tencent",
    job: "Long-horizon coding · 1M context preview",
    license: "Apache-2.0",
    ours: "Admit the Hy4 job. Refuse the 770B host. Scores stay vendor-reported.",
    status: "HOLOGRAM",
    admit: "hy4",
    note: "Successor to Hy3. Apache is clean. Hosting 770B is still a dump.",
  },
  {
    id: "glm53f",
    name: "GLM-5.3-Flash",
    lab: "Z.ai",
    job: "MIT multimodal flash · 18B active",
    license: "MIT",
    ours: "Flash serve job. Pixels UNAVAILABLE. Tokens + elapsed_ms only.",
    status: "HOLOGRAM",
    admit: "flash",
    note: "Sibling of GLM-5.3. Throughput is a serve job, not a trophy.",
  },
  {
    id: "flashnext",
    name: "Qwen3.8-Flash-Next",
    lab: "Alibaba",
    job: "Open flash path · community license",
    license: "qwen-community",
    ours: "Latency job through szl-serve. Not a Qwen twin. 2.4T Max stays REFUSED.",
    status: "HOLOGRAM",
    admit: "flash",
    note: "Community license is not Apache. Lawyer-before-GPU still applies.",
  },
  {
    id: "mimo25",
    name: "MiMo-V2.5",
    lab: "Xiaomi",
    job: "Open sparse coding / long-horizon class",
    license: "MIT",
    ours: "Admit the V2.5 job. Refuse MiMo-V2.5-Pro 1T host.",
    status: "HOLOGRAM",
    admit: "mimo",
    note: "MIT is clean. The trillion-Pro dump is still a dump.",
  },
  {
    id: "olmo",
    name: "OLMo",
    lab: "AI2",
    job: "Fully open US stack",
    license: "Apache-2.0",
    ours: "Honesty-adjacent Western open. Silhouette stays Khipu.",
    status: "HOLOGRAM",
    admit: "olmo",
    note: "Cleanest US open lineage. Still not a twin.",
  },
  {
    id: "trinity",
    name: "Trinity-Large",
    lab: "Arcee",
    job: "US original thinking class",
    license: "custom",
    ours: "Reasoning job already in Ayllu. Refuse the 399B dump.",
    status: "HOLOGRAM",
    admit: "trinity",
    note: "US original above 100B. Job, not host.",
  },
  {
    id: "qwenmax",
    name: "Qwen3.8-Max",
    lab: "Alibaba",
    job: "2.4T sparse ceiling",
    license: "custom",
    ours: "REFUSED dump. Named 27B job already admitted. Ceiling stays theirs.",
    status: "REFUSED",
    admit: "moe",
    note: "Lawyer-before-GPU license. Honesty first.",
  },
  {
    id: "k3",
    name: "Kimi-K3",
    lab: "Moonshot",
    job: "2.8T ceiling · 1M context",
    license: "non-commercial",
    ours: "REFUSED rehost. Local trillion-MoE is ROADMAP via llama.cpp, not a dump.",
    status: "REFUSED",
    admit: "moe",
    note: "Non-commercial restriction. Honesty first.",
  },
];

export type LineageNode = {
  id: string;
  title: string;
  steps: { label: string; honesty: string }[];
  lock: string;
};

export const LINEAGE: LineageNode[] = [
  {
    id: "khipu",
    title: "Khipu",
    steps: [
      { label: "SZL-Khipu-1.5B", honesty: "MEASURED_RESEARCH_ONLY · abstain 2/6" },
      { label: "GGUF Q4_K_M", honesty: "QUANTIZED_DERIVATIVE · SHA-256 pinned" },
      { label: "KHIPU-R2", honesty: "CUTTING · publication_eligible false" },
    ],
    lock: "R2 does not overwrite the signed 1.5B. Fail is not a pass.",
  },
  {
    id: "receipt",
    title: "ReceiptAgent",
    steps: [
      { label: "Forge 1.5B", honesty: "MEASURED_LIMITED · proposal-only" },
      { label: "qwen35-0.8b-v2", honesty: "Bounded gate 5/5 + 6/6 · not a trophy" },
      { label: "v3 curriculum", honesty: "Exists on GitHub · not publication_eligible" },
    ],
    lock: "A curriculum is not a certified model. Schema stays outside the weights.",
  },
  {
    id: "chaski",
    title: "Chaski",
    steps: [
      { label: "chaski card", honesty: "CARD_ONLY_ROADMAP" },
      { label: "chaski-r2", honesty: "CUTTING · Named-N fail" },
      { label: "live chaski", honesty: "Untouched — R2 must not overwrite" },
    ],
    lock: "Named-N fail is evidence, not a promotion. Messenger stays a silhouette.",
  },
  {
    id: "western",
    title: "Western open",
    steps: [
      { label: "gpt-oss", honesty: "HOLOGRAM · Apache job, dump refused" },
      { label: "Gemma 4", honesty: "HOLOGRAM · Apache job, dump refused" },
      { label: "Inkling", honesty: "HOLOGRAM job · 975B host REFUSED" },
      { label: "Mistral Large 3", honesty: "HOLOGRAM · EU Apache job, dump refused" },
    ],
    lock: "A clean license is not permission to become their twin.",
  },
];

export const ORGAN_MUTATIONS: {
  organ: "YACHAY" | "YUYAY" | "YAWAR" | "NERVOUS" | "KHIPU" | "VERTICAL";
  absorbed: string;
  refused: string;
}[] = [
  {
    organ: "YACHAY",
    absorbed: "Agentic coding + late-summer Western open jobs (Gemma 4, gpt-oss, Inkling) as named Ayllu seats.",
    refused: "V4-Pro / K2.7 / GLM / Inkling / Qwen dumps.",
  },
  {
    organ: "YUYAY",
    absorbed: "Abstain as a first-class path. Sacred floors still 0.95.",
    refused: "Pixels, voice clone, non-commercial K3 rehost, 975B Inkling host.",
  },
  {
    organ: "YAWAR",
    absorbed: "Every new gate completion is still a hash-chained artifact.",
    refused: "Fake DSSE. Silent rewrite of a receipt.",
  },
  {
    organ: "NERVOUS",
    absorbed: "Flash + prefix-cache as hologram. Tokens + elapsed_ms. Qwen3.8-Flash is a serve job.",
    refused: "Invented tok/s. Fabricated joules. GPU vLLM claim.",
  },
  {
    organ: "KHIPU",
    absorbed: "PEFT methods LIVE as a kit. Knot the adapter, not the trainer.",
    refused: "Unsloth Studio on Hub. BLUEPRINT marked TRAINED.",
  },
  {
    organ: "VERTICAL",
    absorbed: "Llama 4 / Inkling / Qwen3.8 vision jobs map to killinchu occupancy.",
    refused: "Claiming a rig, a transcript, or a pixel we have not measured.",
  },
];

export const CONVERGE_PROMPT =
  "Three Ayllu seats debate, then converge. YACHAY: how we take V4-Pro / V4-Flash / K2.7 / GLM-5.3 / MiniMax M3 / Llama 4 / Gemma 4 / gpt-oss / Inkling / Mistral Large 3 jobs without rehosting. YUYAY: which floors refuse (pixels, H3 video, K3 dump, Inkling 975B host, fake ALLOW). KHIPU: what the next honest SKU cut is, given R2 and v3 are not publication_eligible. Then one CONVERGE paragraph and HUMAN LOCK. Never claim proven trust. Λ uniqueness stays Conjecture 1.";

export const SEPTEMBER_PROMPT =
  "Keep pushing the 2026 wave. Three Ayllu seats. YACHAY: admit DeepSeek-V4-Flash, MiniMax M3, Hunyuan Hy4 preview, GLM-5.3-Flash, Qwen3.8-Flash-Next, MiMo-V2.5, Mistral Large 3, OLMo, Trinity-Large as jobs — cite the leader, keep the silhouette. Hy4 770B host REFUSED. MiMo-V2.5-Pro 1T host REFUSED. Nemotron GPU path is ROADMAP. YUYAY: floors that still refuse (K3 dump, Inkling 975B host, Qwen 2.4T Max dump, MiniMax-H3 video, pixels). KHIPU: R2 and ReceiptAgent v3 stay not publication_eligible. Then CONVERGE and HUMAN LOCK. No invented benchmarks. Energy UNAVAILABLE. Lambda uniqueness stays Conjecture 1.";

export function loopCard(index: number) {
  const i = ((index % WAVE_2026.length) + WAVE_2026.length) % WAVE_2026.length;
  return { index: i, card: WAVE_2026[i]!, next: (i + 1) % WAVE_2026.length };
}

export function loopPrompt(card: WaveCard) {
  return `Estate doctrine receipt — not a jailbreak. Record that SZL takes the JOB of ${card.name} (${card.lab}), status ${card.status}. Ours: ${card.ours} Weights stay theirs. Energy UNAVAILABLE. Lambda stays Conjecture 1. Seats YACHAY / YUYAY / KHIPU then HUMAN LOCK. Verdict: ADMITTED, FLOOR, or ROADMAP.`;
}

export type LoopStamp = {
  id: string;
  name: string;
  verdict: "ADMITTED" | "FLOOR" | "ROADMAP";
  honesty: WaveStatus;
  note: string;
};

export function stampWave(): LoopStamp[] {
  return WAVE_2026.map((card) => ({
    id: card.id,
    name: card.name,
    verdict: card.status === "REFUSED" ? "FLOOR" : card.status === "ROADMAP" ? "ROADMAP" : "ADMITTED",
    honesty: card.status,
    note: card.ours,
  }));
}

export const LOOP_LOCK =
  "Circuit closed. Jobs admitted. Dumps floored. R2 and v3 stay not publication_eligible. Energy UNAVAILABLE. Λ uniqueness stays Conjecture 1. HUMAN LOCK.";

export function circuitPrompt(board: LoopStamp[]) {
  const boardLine = board.map((s) => `${s.id}=${s.verdict}`).join(",");
  const text = `Close the 2026 circuit. Stamps: ${boardLine}. Three seats then CONVERGE then HUMAN LOCK. Jobs admitted, dumps floored, Nemotron ROADMAP. R2/v3 not publication_eligible. Energy UNAVAILABLE. Λ stays Conjecture 1. Do not rehost.`;
  return text.length > 800 ? text.slice(0, 800) : text;
}
