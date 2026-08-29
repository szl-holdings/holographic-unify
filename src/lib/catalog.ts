export type SpaceStage =
  | "RUNNING"
  | "BUILD_ERROR"
  | "RUNTIME_ERROR"
  | "BUILDING"
  | "SLEEPING"
  | "APP_STARTING"
  | "UNKNOWN";

export type SpaceRow = {
  id: string;
  sdk: "docker" | "static" | "gradio";
  github: string | null;
  role: string;
  audience: "dev" | "investor" | "both";
  organ: OrganId;
};

export type OrganId = "YACHAY" | "YUYAY" | "YAWAR" | "NERVOUS" | "KHIPU" | "VERTICAL";

export const ORGANS: {
  id: OrganId;
  name: string;
  quechua: string;
  job: string;
  leader: string;
  ours: string;
  formula: string;
}[] = [
  {
    id: "YACHAY",
    name: "Brain",
    quechua: "knowing / read-only cortex",
    job: "Governed orchestrator. Deny-by-default before a tool fires.",
    leader: "OpenAI Agents SDK, LangGraph, AutoGen",
    ours: "a11oy. Signed receipt per decision. Flagship. Not a hologram.",
    formula: "F03 bounded Λ · F08 DSSE",
  },
  {
    id: "YUYAY",
    name: "Heart",
    quechua: "thought / 13-axis conjunctive gate",
    job: "A scalar of how much this run should be trusted.",
    leader: "Constitutional AI, Llama-Guard, NeMo Guardrails",
    ours: "Λ = weighted geometric mean. Sacred floors 0.95. Uniqueness = Conjecture 1.",
    formula: "F01 Λ  ·  A1–A4 proven",
  },
  {
    id: "YAWAR",
    name: "Circulation",
    quechua: "blood / append-only receipt bus",
    job: "Every inference is an artifact someone else can verify offline.",
    leader: "in-toto, SLSA, Sigstore, Certificate Transparency",
    ours: "Decision-SLSA. SHA3 lake. UNSIGNED-honest is a first-class state.",
    formula: "F07 Merkle · F08 DSSE · F17 CSS",
  },
  {
    id: "NERVOUS",
    name: "Nervous",
    quechua: "OTel / energy / loop-tax",
    job: "Bound recursion. Honest joules or silence.",
    leader: "OpenTelemetry, NVML, vLLM energy traces",
    ours: "MEASURED-NVML or UNAVAILABLE. A fabricated joule downs the organ.",
    formula: "F05 Bekenstein cascade · F10 Hoeffding",
  },
  {
    id: "KHIPU",
    name: "Skeleton",
    quechua: "knotted-cord ledger",
    job: "Kernels, formulas, consensus. The knot is the run.",
    leader: "FlashAttention, PBFT, Reed–Solomon",
    ours: "Receipted silhouettes. 3-of-4 BFT. Arithmetic proven; safety is Conjecture 2.",
    formula: "F07 · F16 · F18",
  },
  {
    id: "VERTICAL",
    name: "Verticals",
    quechua: "this-world products",
    job: "Take the category job. Never the leader's code.",
    leader: "Zillow, CoStar, Palantir, Anduril",
    ours: "killinchu, real-estate, david-leads, sovereign-os. Occupancy UNAVAILABLE until measured.",
    formula: "F21 Schur · F04 PAC-Bayes advisory",
  },
];

export const SPACES: SpaceRow[] = [
  { id: "a11oy", sdk: "docker", github: "szl-holdings/a11oy", role: "Flagship command center. Signed receipts. Not a hologram.", audience: "both", organ: "YACHAY" },
  { id: "killinchu", sdk: "docker", github: "szl-holdings/killinchu", role: "Counter-UAS. DSSE per interdiction.", audience: "both", organ: "VERTICAL" },
  { id: "anatomy", sdk: "docker", github: "szl-holdings/anatomy", role: "Five-organ living map.", audience: "both", organ: "YACHAY" },
  { id: "yarqa", sdk: "docker", github: "szl-holdings/yarqa", role: "Compartmental CFD → receipted canals.", audience: "dev", organ: "KHIPU" },
  { id: "llm-router-live", sdk: "docker", github: "szl-holdings/szl-router", role: "Sovereign LLM router.", audience: "dev", organ: "YACHAY" },
  { id: "hatun-mcp", sdk: "docker", github: "szl-holdings/hatun-mcp", role: "Doctrine MCP. 16 tools under PURIQ.", audience: "dev", organ: "YACHAY" },
  { id: "sda", sdk: "docker", github: "szl-holdings/sda", role: "Sovereign domain awareness.", audience: "investor", organ: "VERTICAL" },
  { id: "immune", sdk: "docker", github: "szl-holdings/immune", role: "YAWAR receipt chain + HUKLLA tripwires. Holds the Hub write token.", audience: "both", organ: "YAWAR" },
  { id: "david-leads", sdk: "docker", github: "szl-holdings/david-leads", role: "Public-data insurance intelligence.", audience: "investor", organ: "VERTICAL" },
  { id: "cosmos", sdk: "docker", github: "szl-holdings/cosmos", role: "Holographic substrate map.", audience: "both", organ: "NERVOUS" },
  { id: "holographic", sdk: "docker", github: null, role: "Estate observatory. Capacity donor.", audience: "investor", organ: "NERVOUS" },
  { id: "energy-attested-runs", sdk: "static", github: "szl-holdings/szl-energy-attest", role: "Energy receipts. Honest UNAVAILABLE.", audience: "dev", organ: "NERVOUS" },
  { id: "governed-receipt-verifier", sdk: "static", github: "szl-holdings/governed-receipt-spec", role: "Offline receipt verifier.", audience: "dev", organ: "YAWAR" },
  { id: "guardrail-receipt", sdk: "static", github: "szl-holdings/szl-guardrail-receipt", role: "Wrap any guardrail, emit DSSE.", audience: "dev", organ: "YUYAY" },
  { id: "governed-norm-holo", sdk: "static", github: "szl-holdings/governed-norm-holo", role: "WILLAY refusal hologram.", audience: "dev", organ: "YUYAY" },
  { id: "lambda-gate-holo", sdk: "static", github: "szl-holdings/lambda-gate-holo", role: "Λ explainer. Conjecture 1.", audience: "both", organ: "YUYAY" },
  { id: "energy-attest-holo", sdk: "static", github: "szl-holdings/energy-attest-holo", role: "NVML hologram. Red when unmet.", audience: "dev", organ: "NERVOUS" },
  { id: "receipt-chain-live", sdk: "static", github: "szl-holdings/receipt-chain-live", role: "SHA3-256 lake verifier in-browser.", audience: "dev", organ: "YAWAR" },
  { id: "szl-provctl-live", sdk: "static", github: "szl-holdings/szl-provctl-live", role: "in-toto / SLSA DAG hologram.", audience: "dev", organ: "YAWAR" },
  { id: "szl-kernels-live", sdk: "static", github: "szl-holdings/szl-kernels-live", role: "Kernel suite hub.", audience: "dev", organ: "KHIPU" },
  { id: "szl-govsign-live", sdk: "static", github: "szl-holdings/szl-govsign", role: "DSSE sign hologram.", audience: "dev", organ: "YAWAR" },
  { id: "szl-blocked-live", sdk: "static", github: "szl-holdings/szl-blocked", role: "Honest BLOCKED surface.", audience: "dev", organ: "YUYAY" },
  { id: "szl-estate-live", sdk: "static", github: "szl-holdings/szl-estate-os", role: "Estate control plane mirror.", audience: "both", organ: "YACHAY" },
  { id: "szl-forge-lab", sdk: "static", github: "szl-holdings/szl-forge", role: "Sovereign fine-tune kit.", audience: "dev", organ: "KHIPU" },
  { id: "szl-model-inference-lab", sdk: "docker", github: null, role: "Inference lab.", audience: "dev", organ: "KHIPU" },
  { id: "governed-agent-bench", sdk: "gradio", github: null, role: "Agent bench. Still Gradio SDK — residual boot risk.", audience: "dev", organ: "YACHAY" },
  { id: "szl-quant-live", sdk: "static", github: "szl-holdings/szl-quant", role: "Paper-only quant. Not advice.", audience: "investor", organ: "VERTICAL" },
  { id: "szl-khipu", sdk: "docker", github: "szl-holdings/szl-khipu", role: "Live kernels. Knot the run. Docker hologram, no Gradio.", audience: "both", organ: "KHIPU" },
  { id: "ayllu", sdk: "docker", github: "szl-holdings/ayllu", role: "Eleven-seat holographic counsel.", audience: "both", organ: "YUYAY" },
  { id: "experiments", sdk: "docker", github: "szl-holdings/szl-experiments", role: "Experimental tier. Not locked-8.", audience: "dev", organ: "KHIPU" },
  { id: "szl-atelier", sdk: "static", github: "szl-holdings/szl-atelier", role: "Walk all Hub models. Cards with honesty labels.", audience: "both", organ: "KHIPU" },
  { id: "szl-experiments", sdk: "docker", github: "szl-holdings/szl-experiments", role: "Allodial / neuroplasticity lab.", audience: "dev", organ: "KHIPU" },
  { id: "khipu-lab", sdk: "docker", github: "szl-holdings/khipu-lab", role: "Kernel atlas lab. Hub is the Python hologram.", audience: "dev", organ: "KHIPU" },
  { id: "counsel", sdk: "docker", github: "szl-holdings/counsel", role: "Legal Matter Command. Stdlib Docker hologram.", audience: "both", organ: "YUYAY" },
  { id: "nexus", sdk: "docker", github: "szl-holdings/nexus", role: "Holographic analog computer. Python CRT hologram in PR; full synth on GitHub.", audience: "both", organ: "NERVOUS" },
  { id: "szl-command-lab", sdk: "docker", github: "szl-holdings/szl-command-lab", role: "Command body. Not the flagship.", audience: "dev", organ: "YACHAY" },
  { id: "szl-real-estate", sdk: "docker", github: "szl-holdings/szl-real-estate", role: "Public-records underwriting. Not an MLS. Occupancy UNAVAILABLE.", audience: "investor", organ: "VERTICAL" },
  { id: "szl-sovereign-os", sdk: "docker", github: "szl-holdings/szl-sovereign-os", role: "Fail-closed operator kernel. Five verticals.", audience: "both", organ: "VERTICAL" },
  { id: "immune-lattice", sdk: "docker", github: "szl-holdings/immune-lattice", role: "Lattice COP HUD. Stuck APP_STARTING on leftover Node tree.", audience: "both", organ: "YAWAR" },
  { id: "a11oy-factory", sdk: "docker", github: "szl-holdings/a11oy-factory", role: "Decision Cell Compiler. BIND_AS_A11OY_PACKAGE. Not a second flagship.", audience: "dev", organ: "YACHAY" },
  { id: "second-brain", sdk: "docker", github: "szl-holdings/szl-second-brain", role: "Public retrieval hologram. Handles only. 575 chunks.", audience: "dev", organ: "YACHAY" },
  { id: "holographic-unify", sdk: "docker", github: "szl-holdings/holographic-unify", role: "Estate command hologram. PEFT Forge, vLLM-job Serve, Wave 2026 Evolve. Hub flatten only — no npm.", audience: "both", organ: "YACHAY" },
];

export type Diagnosis = {
  id: string;
  stage: SpaceStage;
  error: string;
  cause: string;
  fix: string;
  publisher: string;
  severity: "down" | "risk" | "fixed";
};

/** Snapshot of the estate repair. Live runtime overlays stage. Audited 2026-08-29 ~14:15 UTC. */
export const DIAGNOSIS: Diagnosis[] = [
  {
    id: "immune-lattice",
    stage: "APP_STARTING",
    error: "Stuck APP_STARTING. hardware.current=null. Leftover Node tree on Hub.",
    cause: "Immune published the whole Grok/Vite repo (startup.sh → npm run dev, package.json, src/). Dockerfile is already GCR python, but the factory still sees a node tree.",
    fix: "Flatten Hub to Dockerfile + server.py + index.html + README. Immune PR #72 switches this Space to pub_hologram and deletes leftover Node files.",
    publisher: "immune (token) · PR #72",
    severity: "down",
  },
  {
    id: "nexus",
    stage: "RUNNING",
    error: "RUNNING on leftover ECR node + space-dist. Next dirty deploy can 128.",
    cause: "Yarqa prebuild put space-dist on Hub. GitHub space/ had no server.py, so Immune hologram failed closed. Root Dockerfile is still npm ci + public.ecr.aws.",
    fix: "PR #21 adds GCR Python Lorenz hologram (space/server.py). Immune PR #72 factory-reboots after flatten. Full analog synth stays on GitHub.",
    publisher: "immune hologram · yarqa was the node publisher",
    severity: "risk",
  },
  {
    id: "governed-agent-bench",
    stage: "RUNNING",
    error: "Only remaining Gradio Space (sdk 6.20.0). HfFolder not present now, still a boot risk.",
    cause: "Created as Gradio. huggingface_hub 1.x removed HfFolder — that killed counsel. This bench still imports gradio.",
    fix: "Convert to docker hologram: GCR python:3.12-slim, stdlib HTTP over the committed leaderboard JSON. No Gradio import.",
    publisher: "PENDING — not in immune sibling list",
    severity: "risk",
  },
  {
    id: "a11oy-factory",
    stage: "RUNNING",
    error: "RUNNING with leftover startup.sh / package.json / src/ on Hub.",
    cause: "Full-repo docker upload. Dockerfile is GCR hologram. Leftover Node is a time bomb.",
    fix: "Immune PR #72 adds delete_patterns (startup.sh, package.json, public/**) on full-repo publishes.",
    publisher: "immune",
    severity: "risk",
  },
  {
    id: "experiments",
    stage: "RUNNING",
    error: "Docker Hub python:3.12-slim + COPY . . — factory 128 class on next rebuild.",
    cause: "Unpinned Docker Hub FROM and a bare COPY . (pytest cache / grok tree).",
    fix: "FROM mirror.gcr.io/library/python:3.12-slim. Explicit COPY. Never COPY .",
    publisher: "immune",
    severity: "risk",
  },
  {
    id: "szl-experiments",
    stage: "RUNNING",
    error: "Same Docker Hub python + COPY . as experiments.",
    cause: "Unpinned FROM python:3.12-slim.",
    fix: "GCR pin, explicit COPY.",
    publisher: "immune",
    severity: "risk",
  },
  {
    id: "second-brain",
    stage: "RUNNING",
    error: "Docker Hub python:3.12-slim + COPY . .",
    cause: "Same factory-128 class as experiments.",
    fix: "GCR pin, explicit COPY.",
    publisher: "PENDING",
    severity: "risk",
  },
  {
    id: "cosmos",
    stage: "RUNNING",
    error: "Docker Hub python:3.11-slim + COPY . /app.",
    cause: "Unpinned Hub python. Anatomy already proves GCR 3.12-slim boots.",
    fix: "GCR pin, explicit COPY.",
    publisher: "immune",
    severity: "risk",
  },
  {
    id: "holographic",
    stage: "RUNNING",
    error: "Docker Hub python:3.11-slim + COPY . /app.",
    cause: "Same as cosmos.",
    fix: "GCR pin, explicit COPY.",
    publisher: "Hub-only",
    severity: "risk",
  },
  {
    id: "counsel",
    stage: "RUNNING",
    error: "Was Gradio HfFolder crash. Now RUNNING on stdlib Docker.",
    cause: "Hub leftover Gradio app.py. GitHub is stdlib. Immune #63 published docker.",
    fix: "PR #72 payload-only upload + factory reboot so leftover Gradio cannot return.",
    publisher: "immune",
    severity: "fixed",
  },
  {
    id: "khipu-lab",
    stage: "RUNNING",
    error: "Was npm ci cache-miss. Now RUNNING on GCR hologram. Leftover grok public/ still on Hub.",
    cause: "TanStack app copied to Hub. Flatten hologram now boots.",
    fix: "PR #8 puts hologram at root + space/. Immune delete_patterns wipe leftover Node.",
    publisher: "immune",
    severity: "fixed",
  },
  {
    id: "szl-command-lab",
    stage: "RUNNING",
    error: "Was ECR Public 128. Now RUNNING on GCR hologram.",
    cause: "Leftover node image. Flatten hologram now boots.",
    fix: "PR #9 adds space/Dockerfile. Keep Hub as hologram, full app on GitHub.",
    publisher: "immune",
    severity: "fixed",
  },
  {
    id: "ayllu",
    stage: "RUNNING",
    error: "Was exit 128 (Docker Hub python + COPY . including pytest cache).",
    cause: "Fixed: GCR pin, explicit COPY, ignore pytest cache. Token-bearing repo.",
    fix: "Keep explicit COPY. Never COPY .",
    publisher: "ayllu (own token)",
    severity: "fixed",
  },
  {
    id: "szl-khipu",
    stage: "RUNNING",
    error: "Was Gradio 5 HfFolder. Now RUNNING docker + numpy kernels.",
    cause: "Pinned Gradio Space. Immune published space/ as docker hologram.",
    fix: "Keep spaces/ (plural) Gradio tree off Hub. Immune extra_delete app.py + requirements.txt.",
    publisher: "immune",
    severity: "fixed",
  },
];

export const REPAIR_PRS = [
  { repo: "szl-holdings/nexus", n: 21, title: "GCR Python Lorenz hologram" },
  { repo: "szl-holdings/khipu-lab", n: 8, title: "Flatten-compatible hologram payload" },
  { repo: "szl-holdings/szl-command-lab", n: 9, title: "space/Dockerfile GCR hologram" },
  { repo: "szl-holdings/immune", n: 72, title: "Flatten lattice + counsel; wipe Node; factory reboot" },
];

export const MODELS: {
  id: string;
  kind: string;
  card: string;
  github: string | null;
  honesty: string;
}[] = [
  { id: "SZL-Khipu-1.5B", kind: "text-generation", card: "Sovereign 1.5B silhouette. Grounded receipts. Weights are not the product — the gate is.", github: "szl-holdings/szl-khipu", honesty: "TRAINED silhouette · not a SOTA claim" },
  { id: "SZL-Khipu-1.5B-GGUF", kind: "text-generation", card: "CPU GGUF of Khipu. Derived form. llama.cpp path.", github: "szl-holdings/szl-serve", honesty: "QUANTIZED_DERIVATIVE" },
  { id: "SZL-Khipu-1.5B-abstain", kind: "text-generation", card: "Abstain-tuned sibling. Refusal is a first-class output.", github: "szl-holdings/szl-khipu", honesty: "TRAINED adapter" },
  { id: "KHIPU-R2", kind: "text-generation", card: "Separate SKU. Adapter AVAILABLE. publication_eligible false. Does not overwrite signed 1.5B.", github: "szl-holdings/szl-forge", honesty: "CUTTING · not a pass" },
  { id: "chaski-r2", kind: "text-generation", card: "Messenger SKU on disclosed Qwen3.5-0.8B. Named-N fail is not a pass.", github: "szl-holdings/szl-forge", honesty: "CUTTING · publication_eligible false" },
  { id: "SZL-Forge-1.5B-ReceiptAgent", kind: "text-generation", card: "Receipt-agent fine-tune. Emits DSSE-shaped traces, not vibes.", github: "szl-holdings/szl-forge", honesty: "TRAINED adapter" },
  { id: "szl-receiptagent-qwen35-0.8b-v2", kind: "text-generation", card: "Small receipt agent on Qwen. Demo weights. Not locked-8.", github: "szl-holdings/szl-forge", honesty: "TRAINED adapter" },
  { id: "szl-receiptagent-qwen35-0.8b-v3", kind: "text-generation", card: "v3 curriculum on GitHub. Not publication_eligible. Does not overwrite v2.", github: "szl-holdings/szl-forge", honesty: "CURRICULUM · not a certified release" },
  { id: "chakana", kind: "feature-extraction", card: "Bridge embedding kit. ROADMAP recipe. nDCG@10 UNKNOWN.", github: "szl-holdings/szl-forge", honesty: "ROADMAP · Hub stub, no weights" },
  { id: "szl-khipu", kind: "kernel", card: "Live Python kernels. Knot the run. Hash the proof.", github: "szl-holdings/szl-khipu", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-formulas", kind: "kernel", card: "21 canonical formulas. Composer in torch-ext. Hub joblib is QUARANTINED.", github: "szl-holdings/szl-formulas", honesty: "SOFTWARE_KERNEL_CARD · joblib quarantined" },
  { id: "szl-lambda-gate", kind: "kernel", card: "Λ aggregator. A1–A4 proven. Uniqueness Conjecture 1.", github: "szl-holdings/szl-lambda-gate", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-invariants", kind: "kernel", card: "8 falsifiable receipt invariants.", github: "szl-holdings/szl-invariants", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-ouroboros", kind: "kernel", card: "Bounded loop-tax. Recursion has an entropy budget.", github: "szl-holdings/szl-ouroboros", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-govsign", kind: "kernel", card: "DSSE / in-toto signatures. UNSIGNED-honest if no key.", github: "szl-holdings/szl-govsign", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-provctl", kind: "kernel", card: "SLSA provenance controller. L1 honest, L2 roadmap.", github: "szl-holdings/szl-provctl", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-blocked", kind: "kernel", card: "Honest BLOCKED. Never a fake ALLOW.", github: "szl-holdings/szl-blocked", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-governed-norm", kind: "kernel", card: "Receipted RMSNorm. WILLAY refusal geometry.", github: "szl-holdings/szl-governed-norm", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-kernels", kind: "feature-extraction", card: "Kernel suite + MiniEmbed. get_kernel path.", github: "szl-holdings/szl-kernels", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-receipt-attn", kind: "kernel", card: "Triton tiled attention + SHA3 receipts. Not a FlashAttention rehost.", github: "szl-holdings/szl-receipt-attn", honesty: "silhouette · GPU cubins UNAVAILABLE" },
  { id: "szl-maskmod", kind: "kernel", card: "score_mod + block-sparse mask. FlexAttention job, original cut.", github: "szl-holdings/szl-maskmod", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "szl-block-kv", kind: "kernel", card: "Paged KV + SHA3 block table. PagedAttention job.", github: "szl-holdings/szl-block-kv", honesty: "Triton page kernel UNAVAILABLE" },
  { id: "YARQA-ATTN", kind: "kernel", card: "Canal / compartment attention. Irrigation, not a CUDA clone.", github: "szl-holdings/YARQA-ATTN", honesty: "GPU cubins UNAVAILABLE" },
  { id: "szl-nemo", kind: "kernel", card: "Doctrine rule_check. Not NVIDIA Nemotron. Not NeMo Guardrails.", github: "szl-holdings/szl-nemo", honesty: "SOFTWARE_KERNEL_CARD" },
  { id: "WILLAY", kind: "text-generation", card: "Refusal classifiers. Context is not a silent rewrite.", github: "szl-holdings/governed-norm-holo", honesty: "TRAINED silhouette" },
  { id: "chaski", kind: "text-generation", card: "Messenger silhouette. FIFO runner.", github: null, honesty: "CARD_ONLY_ROADMAP" },
  { id: "MiniEmbed-Nano", kind: "kernel", card: "Tiny embedding. Trained silhouette.", github: "szl-holdings/szl-kernels", honesty: "TRAINED silhouette" },
  { id: "ReceiptAgent-Nano", kind: "kernel", card: "Tiny receipt agent. npz + TRAINING_RECEIPT.", github: "szl-holdings/szl-khipu", honesty: "TRAINED silhouette" },
  { id: "TinyKhipu-Nano", kind: "kernel", card: "Tiny khipu. npz weights + receipt.", github: "szl-holdings/szl-khipu", honesty: "TRAINED silhouette" },
  { id: "Moons-Nano", kind: "kernel", card: "Tiny moons toy. Honest demo, not a foundation model.", github: "szl-holdings/szl-khipu", honesty: "TRAINED silhouette" },
  { id: "A11OY-MINI", kind: "text-generation", card: "Mini a11oy substrate card. Flagship remains a11oy Space.", github: "szl-holdings/a11oy", honesty: "CARD_ONLY_ROADMAP" },
  { id: "KILLINCHU-EYE", kind: "image-classification", card: "Killinchu perception card. Interdiction still emits DSSE.", github: "szl-holdings/killinchu", honesty: "CARD_ONLY_ROADMAP" },
  { id: "governed-inference-meter", kind: "kernel", card: "Meter every inference. Energy MEASURED or UNAVAILABLE.", github: "szl-holdings/governed-inference-meter", honesty: "SOFTWARE_KERNEL_CARD" },
];

export const LEADERS = [
  {
    job: "Interactive demo that always boots",
    leader: "Gradio / Streamlit Spaces",
    take: "The job: a Hub page a stranger can click.",
    ours: "Stdlib HTTP hologram. No Gradio import. Fail closed if a dep would crash the organ.",
  },
  {
    job: "Agent orchestration",
    leader: "LangGraph, CrewAI, AutoGen",
    take: "Graph of agents, a supervisor, memory.",
    ours: "Ayllu 11 named seats. Debate-then-converge. Receipt per turn. Human Lock on high-risk.",
  },
  {
    job: "Guardrails",
    leader: "NVIDIA NeMo Guardrails, Llama-Guard, Guardrails AI",
    take: "Policy around the model.",
    ours: "Wrap any callable, emit a DSSE receipt. UNSIGNED-honest if no key. Never a fake ALLOW.",
  },
  {
    job: "Fast attention",
    leader: "FlashAttention, SageAttention, FlexAttention, PagedAttention",
    take: "The kernel job, not the code.",
    ours: "szl-receipt-attn / maskmod / block-kv. Silhouette + SHA3 receipts. Not a rehost.",
  },
  {
    job: "Fine-tune / adapters",
    leader: "PEFT, Unsloth, TRL, bitsandbytes",
    take: "LoRA / QLoRA on an open base.",
    ours: "szl-forge kit. Fail-closed without a key. Forge Lab is SNAPSHOT. publication_eligible stays false until measured.",
  },
  {
    job: "Serve",
    leader: "vLLM, TGI, TensorRT-LLM",
    take: "High-throughput serving.",
    ours: "szl-serve: OpenAI-shaped gate hologram + pinned GGUF CPU lab. Tokens + elapsed_ms. GPU vLLM ROADMAP. Energy UNAVAILABLE.",
  },
  {
    job: "Provenance",
    leader: "in-toto, SLSA, Sigstore",
    take: "Supply-chain attestations.",
    ours: "Decision-SLSA. Every inference is an artifact. Lake is szl-lake. Verifier is dependency-free.",
  },
  {
    job: "Trust score",
    leader: "Constitutional AI, deliberative alignment, debate",
    take: "A scalar of 'how much should we trust this'.",
    ours: "Λ = weighted geometric mean over 13 axes. A1–A4 proven. Uniqueness = Conjecture 1.",
  },
  {
    job: "BFT consensus",
    leader: "PBFT, HotStuff, Tendermint",
    take: "n = 3f+1, quorum 2f+1.",
    ours: "Khipu 3-of-4. Arithmetic proven. Safety remains Conjecture 2.",
  },
  {
    job: "Analog computing",
    leader: "THE ANALOG THING, analog patchbays, CRT holograms",
    take: "Integrators, coefficients, repetitive operation.",
    ours: "NEXUS Lorenz RK4 as voltages. Organs fail-close the VCA. Hub is a CRT hologram; the instrument stays on GitHub.",
  },
  {
    job: "Property intelligence",
    leader: "Zillow, CoStar, First American",
    take: "Listings, comps, occupancy.",
    ours: "szl-real-estate. Public records only. Occupancy UNAVAILABLE. PLUTO MEASURED on Kings/Queens. Not an MLS.",
  },
  {
    job: "Operator kernel",
    leader: "Kubernetes, Ubuntu, Palantir Gotham",
    take: "The OS the operator lives in.",
    ours: "szl-sovereign-os. Fail-closed. Five organs, five verticals. Take the job, never the distro.",
  },
  {
    job: "Legal command",
    leader: "Westlaw, Lexis, Harvey",
    take: "Docket, brief, citation.",
    ours: "Ayllu Counsel. Human Lock fail-closed. No fabricated citations. Informational only — not a law firm.",
  },
];

export const PUBLISHERS = [
  { name: "immune", hasToken: true, writes: "counsel, ayllu, khipu-lab, command-lab, experiments, cosmos, real-estate, sovereign-os, lattice, factory, nexus hologram, szl-khipu" },
  { name: "ayllu", hasToken: true, writes: "SZLHOLDINGS/ayllu only" },
  { name: "szl-atelier", hasToken: true, writes: "atelier static + sibling mirror (must stay docker, not gradio)" },
  { name: "a11oy", hasToken: true, writes: "flagship Space + relock" },
  { name: "khipu-lab / nexus / counsel / szl-khipu", hasToken: false, writes: "honest skip. GitHub remains source. Do not claim LIVE." },
];

export const INVESTOR_POINTS = [
  "Two flagships: a11oy (governed orchestrator) and killinchu (counter-UAS). Everything else is an organ or a vertical.",
  "Honesty is the moat. UNSIGNED, UNAVAILABLE, CONJECTURE 1 are first-class states. Competitors paint green.",
  "42 Spaces, 42 models, 28 datasets, 14 kernels, 93 GitHub repos. GitHub is canonical. Hub is the mirror.",
  "21 formulas in the table. Locked-8 organ genome is F1 F4 F7 F11 F12 F18 F19 F22. Λ uniqueness is open and stays open.",
  "Not a model company. A decision-receipt company. Weights are silhouettes; the product is the gate.",
  "Forge, Serve, and Evolve are live holograms: PEFT cuts, gated inference, and Ayllu converge on the 2026 wave. GPU Unsloth / vLLM remain ROADMAP.",
  "Hub factory cannot npm ci and cannot pull Docker Hub/ECR reliably. Python stdlib holograms boot. The full app stays on GitHub.",
  "Public BUILD_ERROR / RUNTIME_ERROR count as of this audit: zero. One Space stuck APP_STARTING (immune-lattice leftover Node). Residual risk is unpinned Docker Hub python and leftover Gradio on the bench.",
  "Fifth vertical is public-records underwriting (not Zillow). Occupancy is UNAVAILABLE until a jurisdiction is measured.",
];

export const DEV_POINTS = [
  "Clone github.com/szl-holdings/<organ>. Hub Spaces are demos. Do not npm ci on Hugging Face.",
  "Python organs: stdlib first. FastAPI only when the organ already imports it. Gradio is a known boot killer (HfFolder on hub 1.x).",
  "Docker Spaces: FROM mirror.gcr.io/library/python:3.12-slim, explicit COPY, never COPY . with pytest cache. ECR Public = exit 128.",
  "Receipts: SHA-256 or SHA3-256 hash chain, DSSE envelope, energy null unless NVML MEASURED.",
  "Λ is Conjecture 1. Do not write 'proven trust' in a card, commit, or Space blurb.",
  "Only immune, ayllu, szl-atelier, a11oy bind HF_TOKEN. Other repos must skip Hub write honestly — never print published when the token is empty.",
  "Immune mirror is the estate publisher. Adding a Space means adding it there, flattened, sdk docker.",
  "Evolve tab admits V4-Pro, K2.7, GLM-5.2, Qwen3-235B, Llama 4 Maverick as jobs. K3 dump stays REFUSED. Ayllu converge is one gated call.",
  "Open repair PRs: nexus#21, khipu-lab#8, szl-command-lab#9, immune#72. Merge those, then factory-reboot Hub.",
];
