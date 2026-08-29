/** PEFT hologram. The kit is real; this surface does not train. */

export const KHIPU_1_5B = {
  id: "SZL-Khipu-1.5B",
  params: 1_540_000_000,
  hidden: 1536,
  layers: 28,
  honesty: "TRAINED silhouette · not a SOTA claim",
} as const;

export const TARGET_MODULES = ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"] as const;
export type TargetModule = (typeof TARGET_MODULES)[number];

export type PeftMethod = "lora" | "qlora" | "dora" | "rslora" | "ia3";
export type Quant = "none" | "nf4" | "int8";
export type AdapterSku = "receipt-agent" | "khipu" | "abstain" | "chaski" | "willay" | "custom";

export const PEFT_METHODS: {
  id: PeftMethod;
  name: string;
  leader: string;
  ours: string;
  scale: string;
}[] = [
  {
    id: "lora",
    name: "LoRA",
    leader: "Hu et al. / PEFT",
    ours: "ΔW = B A. Frozen base. Receipt on the adapter, not a trainer fork.",
    scale: "α / r",
  },
  {
    id: "qlora",
    name: "QLoRA",
    leader: "Dettke / Unsloth",
    ours: "NF4 base + fp16 LoRA. szl-forge laptop kit. Hub Space is SNAPSHOT.",
    scale: "α / r · 4-bit base",
  },
  {
    id: "dora",
    name: "DoRA",
    leader: "Liu et al. weight-decomposed LoRA",
    ours: "Magnitude vector + direction LoRA. Still a receipted adapter.",
    scale: "m · (W+BA) / ||W+BA||",
  },
  {
    id: "rslora",
    name: "rsLoRA",
    leader: "Kalajdzievski rank-stabilized",
    ours: "Scale α/√r so rank is not a lottery. Honesty on the scale.",
    scale: "α / √r",
  },
  {
    id: "ia3",
    name: "IA³",
    leader: "Liu et al. Infused Adapter",
    ours: "Learned rescale vectors. Tiny, fail-closed, not a second base.",
    scale: "x ⊙ l",
  },
];

export const ADAPTER_SKUS: {
  id: AdapterSku;
  name: string;
  card: string;
  hub: string;
  honesty: string;
  eligible: boolean;
}[] = [
  {
    id: "receipt-agent",
    name: "ReceiptAgent",
    card: "Emits DSSE-shaped traces. Proposal-only. Not independently certified.",
    hub: "SZL-Forge-1.5B-ReceiptAgent",
    honesty: "MEASURED_LIMITED · publication_eligible false",
    eligible: false,
  },
  {
    id: "khipu",
    name: "Khipu 1.5B",
    card: "Sovereign silhouette. Grounded receipts. The gate is the product.",
    hub: "SZL-Khipu-1.5B",
    honesty: "MEASURED_RESEARCH_ONLY · abstain 2/6",
    eligible: false,
  },
  {
    id: "abstain",
    name: "Khipu abstain",
    card: "Refusal is a first-class output. Held-out abstention stays 2/6.",
    hub: "SZL-Khipu-1.5B-abstain",
    honesty: "TRAINED adapter · not a pass",
    eligible: false,
  },
  {
    id: "chaski",
    name: "Chaski R2",
    card: "Messenger SKU. Named-N fail is not a pass. Does not overwrite live chaski.",
    hub: "chaski-r2",
    honesty: "CUTTING · publication_eligible false",
    eligible: false,
  },
  {
    id: "willay",
    name: "WILLAY",
    card: "Refusal geometry. Sacred floors 0.95. Never a fake ALLOW.",
    hub: "WILLAY",
    honesty: "TRAINED silhouette",
    eligible: false,
  },
  {
    id: "custom",
    name: "Custom cut",
    card: "Blueprint you compose here. Not trained until owner metal runs Unsloth.",
    hub: "szl-forge-lab",
    honesty: "BLUEPRINT_NOT_TRAINED",
    eligible: false,
  },
];

export type AdapterCut = {
  sku: AdapterSku;
  method: PeftMethod;
  rank: number;
  alpha: number;
  modules: TargetModule[];
  quant: Quant;
  keyed: boolean;
  trainable: number;
  fraction: number;
  scale: number;
  status: "UNSIGNED-honest" | "BLUEPRINT_NOT_TRAINED" | "BLOCKED";
  cutAt: string;
  fingerprint: string;
};

export function loraScale(method: PeftMethod, alpha: number, rank: number) {
  if (rank <= 0) return 0;
  if (method === "rslora") return alpha / Math.sqrt(rank);
  if (method === "ia3") return 1;
  return alpha / rank;
}

export function trainableParams(opts: {
  method: PeftMethod;
  rank: number;
  modules: readonly string[];
  hidden?: number;
  layers?: number;
}) {
  const hidden = opts.hidden ?? KHIPU_1_5B.hidden;
  const layers = opts.layers ?? KHIPU_1_5B.layers;
  const n = Math.max(1, opts.modules.length);
  if (opts.method === "ia3") return hidden * n * layers;
  const matrices = 2 * hidden * opts.rank * n * layers;
  if (opts.method === "dora") return matrices + hidden * n * layers;
  return matrices;
}

export function vramHologramMb(opts: { quant: Quant; trainable: number }) {
  const baseBytes = KHIPU_1_5B.params * (opts.quant === "nf4" ? 0.5 : opts.quant === "int8" ? 1 : 2);
  const adapterBytes = opts.trainable * 2;
  return Math.round((baseBytes + adapterBytes) / (1024 * 1024));
}

export function defaultQuant(method: PeftMethod): Quant {
  if (method === "qlora") return "nf4";
  return "none";
}

export function fingerprintOf(cut: Omit<AdapterCut, "fingerprint" | "cutAt" | "status" | "trainable" | "fraction" | "scale">) {
  return `${cut.sku}:${cut.method}:r${cut.rank}:a${cut.alpha}:${cut.modules.join(",")}:${cut.quant}:${cut.keyed ? "keyed" : "open"}`;
}

export function composeCut(input: {
  sku: AdapterSku;
  method: PeftMethod;
  rank: number;
  alpha: number;
  modules: TargetModule[];
  quant: Quant;
  keyed: boolean;
}): AdapterCut {
  const modules = input.modules.length ? input.modules : (["q_proj", "v_proj"] as TargetModule[]);
  const method = input.method;
  const rank = Math.min(128, Math.max(1, Math.round(input.rank)));
  const alpha = Math.min(256, Math.max(1, Math.round(input.alpha)));
  const quant = method === "qlora" ? "nf4" : input.quant;
  const trainable = trainableParams({ method, rank, modules });
  const fraction = trainable / KHIPU_1_5B.params;
  const scale = loraScale(method, alpha, rank);
  const keyed = input.keyed;
  const status: AdapterCut["status"] = keyed ? "UNSIGNED-honest" : "BLUEPRINT_NOT_TRAINED";
  const body = { sku: input.sku, method, rank, alpha, modules, quant, keyed };
  return {
    ...body,
    trainable,
    fraction,
    scale,
    status,
    cutAt: new Date().toISOString(),
    fingerprint: fingerprintOf(body),
  };
}
