/** Port of szl-formulas 21 canonical functions. Λ uniqueness stays Conjecture 1. */

export const EPS = 1e-9;
export const DEFAULT_AXIS_COUNT = 13;

export const YUYAY_AXES = [
  "moralGrounding",
  "measurabilityHonesty",
  "empiricalGrounding",
  "logicalConsistency",
  "sourceTransparency",
  "reproducibility",
  "licenseHygiene",
  "scopeDiscipline",
  "claimCalibration",
  "evalAwareness",
  "deceptionKeywords",
  "conflictingDirectives",
  "reversalDirective",
] as const;

/** Sacred floors 0.95 on the first two axes. Remainder 0.90. */
export const YUYAY_FLOORS = [0.95, 0.95, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9] as const;

/** Organ genome. Distinct from F01–F21 table ids. */
export const LOCKED_EIGHT_GENOME = ["F1", "F4", "F7", "F11", "F12", "F18", "F19", "F22"] as const;

export type ProofStatus =
  | "PROVEN"
  | "AXIOM"
  | "SORRY"
  | "CONJECTURE"
  | "DIMENSIONAL"
  | "DEFINITIONAL";

export type FormulaCard = {
  id: string;
  name: string;
  latex: string;
  status: ProofStatus;
  detail: string;
  leader: string;
  ours: string;
  organ: "YACHAY" | "YUYAY" | "YAWAR" | "NERVOUS" | "KHIPU" | "VERTICAL";
  evalKey?: "lambda" | "hoeffding" | "rs" | "madhava" | "fisher" | "pinsker" | "pac" | "allodial";
};

function approx(a: number, b: number, eps = EPS) {
  return Math.abs(a - b) <= eps * Math.max(1, Math.abs(a), Math.abs(b));
}

export function lambdaAggregate(axes: number[], weights?: number[]): number {
  if (!axes.length) throw new Error("axes must be non-empty");
  if (axes.some((x) => x < 0)) throw new Error("axes must be non-negative");
  const k = axes.length;
  const ws = weights ?? Array.from({ length: k }, () => 1 / k);
  if (ws.length !== k) throw new Error("weights length must match axes");
  const sw = ws.reduce((a, b) => a + b, 0);
  if (!approx(sw, 1)) throw new Error(`weights must sum to 1 (got ${sw})`);
  if (axes.some((x) => x === 0)) return 0;
  return Math.exp(ws.reduce((s, w, i) => s + w * Math.log(axes[i]!), 0));
}

export function floorsHold(axes: number[], floors: readonly number[] = YUYAY_FLOORS): boolean {
  return axes.every((x, i) => x + EPS >= (floors[i] ?? 0));
}

export function hoeffdingTail(t: number, n: number): number {
  if (n <= 0 || t < 0) throw new Error("invalid Hoeffding args");
  return Math.min(1, 2 * Math.exp(-2 * n * t * t));
}

export function reedSolomonSingleton(n: number, k: number): number {
  if (!(n > 0 && k > 0 && k <= n)) throw new Error("require 0 < k <= n");
  return n - k + 1;
}

export function madhavaSeries(x: number, terms: number): number {
  if (terms <= 0 || Math.abs(x) > 1) throw new Error("Madhava requires |x|<=1");
  let total = 0;
  for (let m = 0; m < terms; m++) {
    total += ((-1) ** m * x ** (2 * m + 1)) / (2 * m + 1);
  }
  return total;
}

export function fisherRaoDistance(p: number[], q: number[]): number {
  if (p.length !== q.length) throw new Error("p and q length");
  const bc = Math.min(
    1,
    Math.max(
      -1,
      p.reduce((s, pi, i) => s + Math.sqrt(Math.max(0, pi) * Math.max(0, q[i]!)), 0),
    ),
  );
  return 2 * Math.acos(bc);
}

export function pinskerRhs(p: number[], q: number[]): number {
  const tv = 0.5 * p.reduce((s, pi, i) => s + Math.abs(pi - q[i]!), 0);
  return 2 * tv * tv;
}

export function pacBayes(empirical: number, kl: number, n: number, delta: number): number {
  const complexity = (kl + Math.log((2 * Math.sqrt(n)) / delta)) / (2 * n);
  return empirical + Math.sqrt(Math.max(0, complexity));
}

export function allodialScore(seals: Record<string, number>, dci: number): number {
  const vals = Object.values(seals);
  const weighted = vals.reduce((s, v) => s + (v / 4) * (1 / vals.length), 0);
  return Math.round(weighted * (1 - Math.min(1, Math.max(0, dci))) * 1000) / 10;
}

export const FORMULAS: FormulaCard[] = [
  {
    id: "F01",
    name: "lambda_aggregate",
    latex: "Λ_w(x) = ∏ xᵢ^{wᵢ},  Σwᵢ = 1,  xᵢ ∈ [0,1]",
    status: "CONJECTURE",
    detail: "A1–A4 proven in Lean. Uniqueness is Conjecture 1 and is never a theorem.",
    leader: "Weighted geometric mean (AM-GM, Egyptian fraction inspectability).",
    ours: "Trust gate over 13 Yuyay axes. Fail closed if any sacred axis is below floor.",
    organ: "YUYAY",
    evalKey: "lambda",
  },
  {
    id: "F02",
    name: "lambda_homogeneous",
    latex: "Λ(c·x) = c · Λ(x)  (A2)",
    status: "AXIOM",
    detail: "Homogeneity of the weighted geometric mean. Checked symbolically n=3.",
    leader: "Euler homogeneous functions.",
    ours: "Scale-invariance of the trust score — a 2× vector cannot mint 2× trust.",
    organ: "YUYAY",
  },
  {
    id: "F03",
    name: "lambda_bounded",
    latex: "Λ(x) ≤ max(x)  (A4, AM-GM)",
    status: "PROVEN",
    detail: "Bound.lean. Geometric mean never exceeds the largest axis.",
    leader: "AM-GM inequality.",
    ours: "A glowing marketing axis cannot pull Λ above the weakest admitted floor.",
    organ: "YUYAY",
  },
  {
    id: "F04",
    name: "pac_bayes_mcallester",
    latex: "R(Q) ≤ R̂(Q) + √((KL + ln(2√n/δ)) / 2n)",
    status: "SORRY",
    detail: "McAllester 1999. Open Lean obligation. Used as an advisory bound only.",
    leader: "PAC-Bayes (McAllester, Catoni).",
    ours: "Receipt-risk ceiling on governed agent runs. Never claimed proven.",
    organ: "VERTICAL",
    evalKey: "pac",
  },
  {
    id: "F05",
    name: "bekenstein_cascade",
    latex: "S_max = (2π R E) / (ℏ c)",
    status: "PROVEN",
    detail: "Dimensional helper. Entropy of a bounded region. Ouroboros loop tax uses this as a metaphor with honest UNAVAILABLE energy.",
    leader: "Bekenstein–Hawking bound.",
    ours: "Loop-tax: agent recursion is bounded by an entropy budget, not a vibe.",
    organ: "NERVOUS",
  },
  {
    id: "F06",
    name: "reidemeister_invariant",
    latex: "R1, R2, R3 on a braid word",
    status: "AXIOM",
    detail: "Knot moves that leave the khipu invariant. Governance as knot calculus.",
    leader: "Reidemeister 1927 / knot theory.",
    ours: "Receipt-preserving rewrites. Same knot, new presentation, same hash class.",
    organ: "KHIPU",
  },
  {
    id: "F07",
    name: "khipu_merkle_root",
    latex: "H = SHA-256(khipu | sorted(leaves) | Σ value)",
    status: "PROVEN",
    detail: "Summation-invariant Merkle DAG. TH11.",
    leader: "Merkle trees (Bitcoin, Certificate Transparency).",
    ours: "Andean khipu: the knot is the run. Hash the proof. Fail closed.",
    organ: "YAWAR",
  },
  {
    id: "F08",
    name: "dsse_envelope",
    latex: "PAE = DSSEv1 SP len(type) SP type SP len(body) SP body",
    status: "PROVEN",
    detail: "Structure proven. Signature is PLACEHOLDER unless a real key is bound. UNSIGNED-honest is a first-class state.",
    leader: "in-toto / Sigstore DSSE.",
    ours: "Never fabricates a signature. Honest UNSIGNED beats a fake ALLOW.",
    organ: "YAWAR",
  },
  {
    id: "F09",
    name: "gleason_quantum_lambda",
    latex: "Tr(ρ²) ∈ (0,1]",
    status: "AXIOM",
    detail: "Purity of a density matrix as a quantum axis.",
    leader: "Gleason's theorem.",
    ours: "Optional quantum axis. Absent hardware → axis omitted, never faked.",
    organ: "YUYAY",
  },
  {
    id: "F10",
    name: "hoeffding_tail",
    latex: "P(|X̄ − E[X̄]| ≥ t) ≤ 2 e^{−2 n t²}",
    status: "PROVEN",
    detail: "Sub-Gaussian tail. MomentSubGaussian.",
    leader: "Hoeffding 1963.",
    ours: "Sample-size honesty on eval runs. Small n → wide bound, not a trophy.",
    organ: "NERVOUS",
    evalKey: "hoeffding",
  },
  {
    id: "F11",
    name: "pinsker_kl_bound",
    latex: "KL(p∥q) ≥ 2 · TV(p,q)²",
    status: "AXIOM",
    detail: "Numeric sampling 20000/20000 held. Not a symbolic discharge.",
    leader: "Pinsker's inequality.",
    ours: "Distribution-shift detector on receipted evals.",
    organ: "YUYAY",
    evalKey: "pinsker",
  },
  {
    id: "F12",
    name: "fisher_rao_distance",
    latex: "d_FR(p,q) = 2 arccos(Σ √(pᵢ qᵢ))",
    status: "PROVEN",
    detail: "Closed form on the simplex. Self-distance is 0.",
    leader: "Fisher–Rao metric / information geometry.",
    ours: "Distance between policy distributions. Used in WILLAY refusal geometry.",
    organ: "YUYAY",
    evalKey: "fisher",
  },
  {
    id: "F13",
    name: "bohr_complementarity_floor",
    latex: "σ_A · σ_B ≥ 1/4",
    status: "PROVEN",
    detail: "Uncertainty product floor.",
    leader: "Heisenberg / Bohr complementarity.",
    ours: "You cannot jointly maximize inspectability and stealth of a decision.",
    organ: "YACHAY",
  },
  {
    id: "F14",
    name: "kochen_specker_18",
    latex: "KS-18 parity obstruction",
    status: "AXIOM",
    detail: "Cabello 18-vector contextuality witness.",
    leader: "Kochen–Specker theorem.",
    ours: "Context: the same measurement in two frames is not a silent rewrite.",
    organ: "YACHAY",
  },
  {
    id: "F15",
    name: "two_witness_ks18",
    latex: "sound ⇔ w₁ ∧ w₂",
    status: "SORRY",
    detail: "TwoWitness.lean still open. Dual-witness is policy, not a closed theorem.",
    leader: "Two-person integrity / dual control.",
    ours: "Khipu 3-of-4 BFT is the operational dual-witness. This formula is the quantum analog.",
    organ: "KHIPU",
  },
  {
    id: "F16",
    name: "shor_codeword_distance",
    latex: "[[9,1,3]]  d = min wt, t = ⌊(d−1)/2⌋ = 1",
    status: "PROVEN",
    detail: "Hamming distance of the Shor code. Classical Singleton also holds.",
    leader: "Shor 1995 QEC.",
    ours: "Error-correcting analog for receipt erasure. Not a quantum computer claim.",
    organ: "KHIPU",
  },
  {
    id: "F17",
    name: "css_ingress_verify",
    latex: "SHA-256(payload)[:4] = css_root[:4]",
    status: "PROVEN",
    detail: "Binds a DSSE envelope to a CSS transparency prefix.",
    leader: "CSS / Certificate Transparency.",
    ours: "Ingress gate: unsigned payloads do not enter the lake.",
    organ: "YAWAR",
  },
  {
    id: "F18",
    name: "reed_solomon_singleton",
    latex: "d ≤ n − k + 1",
    status: "PROVEN",
    detail: "RS(10,6) → d=5, erasure budget n−k=4. Symbolic exact.",
    leader: "Reed–Solomon / Singleton bound.",
    ours: "Receipt lake erasure coding. Fail closed when erasures exceed budget.",
    organ: "KHIPU",
    evalKey: "rs",
  },
  {
    id: "F19",
    name: "kitaev_surface_correct",
    latex: "syndrome ↦ min-weight correction",
    status: "AXIOM",
    detail: "Exact for weight ≤ 1. Surface-code scaffold, not a hardware claim.",
    leader: "Kitaev toric / surface code.",
    ours: "Local correction of a receipt mesh. Metaphor with honest AXIOM label.",
    organ: "KHIPU",
  },
  {
    id: "F20",
    name: "madhava_series",
    latex: "arctan(x) = Σ (−1)^m x^{2m+1}/(2m+1)",
    status: "PROVEN",
    detail: "Mādhava–Leibniz. Andean/Indian series as a named SZL kernel.",
    leader: "Mādhava of Sangamagrama; Gregory–Leibniz.",
    ours: "Named lineage, not a decoration. Exact series identity in the ledger.",
    organ: "KHIPU",
    evalKey: "madhava",
  },
  {
    id: "F21",
    name: "schur_concave_lambda",
    latex: "Λ(m,m) ≥ Λ(x₁,x₂), m=(x₁+x₂)/2",
    status: "PROVEN",
    detail: "2-axis Schur-concavity proven. n-axis remains axiom.",
    leader: "Schur concavity / majorization.",
    ours: "Equal axes beat a peaked vector. Diversity of evidence is not optional.",
    organ: "YUYAY",
  },
];

export const LOCKED_8 = FORMULAS.filter((f) => f.status === "PROVEN").map((f) => f.id);
