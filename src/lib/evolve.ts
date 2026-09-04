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
  "Three Ayllu seats debate, then converge. YACHAY: how we take V4-Pro / K2.7 / GLM-5.3 / Llama 4 / Gemma 4 / gpt-oss / Inkling jobs without rehosting. YUYAY: which floors refuse (pixels, K3 dump, Inkling 975B host, fake ALLOW). KHIPU: what the next honest SKU cut is, given R2 and v3 are not publication_eligible. Then one CONVERGE paragraph and HUMAN LOCK. Never claim proven trust. Λ uniqueness stays Conjecture 1.";

export const SEPTEMBER_PROMPT =
  "Late-summer 2026 wave. Three Ayllu seats. YACHAY: admit GLM-5.3, Qwen3.8-27B, Gemma 4, gpt-oss, and Inkling as jobs — cite the leader, keep the silhouette. YUYAY: floors that still refuse (K3 dump, Inkling 975B host, Qwen 2.4T Max dump, pixels). KHIPU: R2 and ReceiptAgent v3 stay not publication_eligible. Then CONVERGE and HUMAN LOCK. No invented benchmarks. Energy UNAVAILABLE. Λ uniqueness stays Conjecture 1.";
