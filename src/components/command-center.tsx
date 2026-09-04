import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Building2,
  Check,
  Compass,
  Cpu,
  ExternalLink,
  Flame,
  GitBranch,
  Hash,
  Layers,
  Orbit,
  Radio,
  Shield,
  Waypoints,
  Terminal,
} from "lucide-react";
import {
  DIAGNOSIS,
  DEV_POINTS,
  INVESTOR_POINTS,
  LEADERS,
  MODELS,
  ORGANS,
  REPAIR_PRS,
  SPACES,
  type OrganId,
} from "@/lib/catalog";
import type { EstateSnapshot, LiveSpace } from "@/lib/estate";
import {
  FORMULAS,
  LOCKED_8,
  YUYAY_AXES,
  allodialScore,
  fisherRaoDistance,
  floorsHold,
  hoeffdingTail,
  lambdaAggregate,
  madhavaSeries,
  pacBayes,
  pinskerRhs,
  reedSolomonSingleton,
  type ProofStatus,
} from "@/lib/formulas";
import { HF_SOFTWARE, SOTA_JOBS, SOFTWARE_COUNTS, jobsForOrgan } from "@/lib/sota";
import { occupancyTone, VERTICALS } from "@/lib/verticals";
import { HologramLattice } from "@/components/hologram-lattice";
import { SotaAtlas } from "@/components/sota-atlas";
import { ForgeLab } from "@/components/forge-lab";
import { ServeConsole } from "@/components/serve-console";
import { EvolveDeck } from "@/components/evolve-deck";
import { VerticalDeck } from "@/components/vertical-deck";

type Tab = "pulse" | "verticals" | "unify" | "evolve" | "forge" | "serve" | "sota" | "broken" | "organs" | "spaces" | "models" | "formulas" | "leaders" | "briefing";

const COMMAND_TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "pulse", label: "Pulse", icon: Radio },
  { id: "verticals", label: "Verticals", icon: Building2 },
  { id: "evolve", label: "Evolve", icon: Orbit },
  { id: "forge", label: "Forge", icon: Flame },
  { id: "serve", label: "Serve", icon: Cpu },
];

const ATLAS_TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: "unify", label: "Unify", icon: Waypoints },
  { id: "sota", label: "SOTA", icon: Layers },
  { id: "broken", label: "Repair", icon: AlertTriangle },
  { id: "organs", label: "Organs", icon: Shield },
  { id: "spaces", label: "Spaces", icon: Hash },
  { id: "models", label: "Cards", icon: Hash },
  { id: "formulas", label: "Formulas", icon: Compass },
  { id: "leaders", label: "Leaders", icon: GitBranch },
  { id: "briefing", label: "Briefing", icon: BookOpen },
];

function stageTone(stage: string) {
  if (stage === "RUNNING") return "text-accent";
  if (stage === "BUILDING" || stage === "SLEEPING" || stage === "APP_STARTING") return "text-warn";
  if (stage.includes("ERROR")) return "text-danger";
  return "text-muted";
}

function proofTone(s: ProofStatus) {
  if (s === "PROVEN") return "text-accent";
  if (s === "CONJECTURE" || s === "SORRY") return "text-warn";
  if (s === "AXIOM") return "text-fg";
  return "text-muted";
}

function mergeSpaces(live: LiveSpace[]) {
  const map = new Map(live.map((s) => [s.id, s]));
  const rows = SPACES.map((row) => {
    const l = map.get(row.id);
    const diag = DIAGNOSIS.find((d) => d.id === row.id);
    return {
      ...row,
      stage: l?.stage ?? diag?.stage ?? "UNKNOWN",
      error: l?.error || diag?.error || "",
      likes: l?.likes ?? 0,
    };
  });
  for (const extra of live) {
    if (rows.some((r) => r.id === extra.id)) continue;
    rows.push({
      id: extra.id,
      sdk: extra.sdk as "docker" | "static" | "gradio",
      github: null,
      role: "Live Hub Space not yet carded in this atlas.",
      audience: "dev",
      organ: "KHIPU",
      stage: extra.stage,
      error: extra.error,
      likes: extra.likes,
    });
  }
  return rows;
}

function evalFormula(id: string, axes: number[]) {
  switch (id) {
    case "F01":
      return { label: "Λ", value: lambdaAggregate(axes).toFixed(6), note: floorsHold(axes) ? "floors hold" : "sacred floor miss → BLOCKED" };
    case "F04":
      return { label: "PAC-Bayes", value: pacBayes(0.12, 0.4, 200, 0.05).toFixed(4), note: "advisory only · Lean SORRY" };
    case "F10":
      return { label: "Hoeffding tail", value: hoeffdingTail(0.1, 80).toFixed(6), note: "n=80, t=0.1" };
    case "F11": {
      const p = [0.5, 0.5];
      const q = [0.7, 0.3];
      return { label: "Pinsker RHS", value: pinskerRhs(p, q).toFixed(4), note: "2 · TV² on a 2-simplex" };
    }
    case "F12":
      return { label: "Fisher–Rao", value: fisherRaoDistance([0.5, 0.5], [0.8, 0.2]).toFixed(4), note: "radians on the simplex" };
    case "F18":
      return { label: "RS distance", value: String(reedSolomonSingleton(10, 6)), note: "n=10 k=6 → d=5" };
    case "F20":
      return { label: "Madhava arctan(1)", value: madhavaSeries(1, 21).toFixed(6), note: "21 terms · π/4 series" };
    default:
      return {
        label: "Allodial A",
        value: String(allodialScore({ model_weights: 2, inference_compute: 1, data_residency: 1, chain_of_title: 3, governance_keys: 0 }, 0.41)),
        note: "MODELED · not locked-8",
      };
  }
}

export function CommandCenter({ snapshot }: { snapshot: EstateSnapshot }) {
  const [tab, setTab] = useState<Tab>("pulse");
  const [query, setQuery] = useState("");
  const [organ, setOrgan] = useState<OrganId | "ALL">("ALL");
  const [lattice, setLattice] = useState<OrganId | "UNIFY">("UNIFY");
  const [axes, setAxes] = useState(() => [0.97, 0.96, 0.93, 0.91, 0.9, 0.92, 0.88, 0.91, 0.9, 0.94, 0.9, 0.89, 0.91]);
  const [selected, setSelected] = useState(FORMULAS[0]!.id);

  const rows = useMemo(() => mergeSpaces(snapshot.spaces), [snapshot.spaces]);
  const broken = rows.filter((r) => String(r.stage).includes("ERROR") || r.stage === "APP_STARTING");
  const running = rows.filter((r) => r.stage === "RUNNING");
  const downDiag = DIAGNOSIS.filter((d) => d.severity === "down");
  const lambda = useMemo(() => {
    try {
      return lambdaAggregate(axes);
    } catch {
      return 0;
    }
  }, [axes]);
  const sacredFail = axes[0]! < 0.95 || axes[1]! < 0.95;
  const formula = FORMULAS.find((f) => f.id === selected) ?? FORMULAS[0]!;
  const demo = useMemo(() => {
    try {
      return evalFormula(formula.id, axes);
    } catch (err) {
      return { label: "error", value: "—", note: err instanceof Error ? err.message : "UNAVAILABLE" };
    }
  }, [formula.id, axes]);
  const q = query.trim().toLowerCase();
  const filteredSpaces = rows.filter((r) => {
    if (organ !== "ALL" && r.organ !== organ) return false;
    if (!q) return true;
    return `${r.id} ${r.role} ${r.github} ${r.organ}`.toLowerCase().includes(q);
  });
  const modelLive = snapshot.models;
  const modelRows = MODELS.map((m) => {
    const live = modelLive.find((x) => x.id === m.id);
    return { ...m, downloads: live?.downloads ?? 0, likes: live?.likes ?? 0, tag: live?.tag ?? m.kind };
  });
  const instilled = SOTA_JOBS.length + HF_SOFTWARE.length;
  const latticeJobs = lattice === "UNIFY" ? SOTA_JOBS : jobsForOrgan(lattice);

  return (
    <div className="holo-app relative z-10 min-h-dvh text-fg">
      <header className="relative z-10 border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.22em] text-muted uppercase">SZL Holdings · holographic unify · Doctrine v11</p>
              <h1 className="font-display mt-1 text-3xl leading-tight tracking-tight sm:text-4xl">Estate Command</h1>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
                Six product desks. PEFT on Forge. Gate on Serve. Wave on Evolve. Lambda uniqueness stays Conjecture 1.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Instilled" value={String(instilled)} ok />
              <Stat label="Running" value={String(running.length)} ok />
              <Stat label="Down" value={String(broken.length)} danger={broken.length > 0} />
              <Stat label="Proven" value={`${LOCKED_8.length}/21`} />
            </div>
          </div>
          <div className="space-y-2">
            <NavRow label="Command" tabs={COMMAND_TABS} tab={tab} onTab={setTab} />
            <NavRow label="Atlas" tabs={ATLAS_TABS} tab={tab} onTab={setTab} quiet />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {tab === "verticals" && (
          <VerticalDeck
            onUnify={() => {
              setLattice("VERTICAL");
              setOrgan("VERTICAL");
              setTab("unify");
            }}
          />
        )}

        {tab === "unify" && (
          <section className="space-y-6">
            <HologramLattice
              selected={lattice}
              onSelect={(id) => {
                setLattice(id);
                if (id !== "UNIFY") setOrgan(id);
                else setOrgan("ALL");
              }}
            />
            <div className="holo-panel rounded-xl p-5">
              <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
                {lattice === "UNIFY" ? "Whole estate" : ORGANS.find((o) => o.id === lattice)?.quechua}
              </p>
              <h2 className="font-display mt-1 text-xl">
                {lattice === "UNIFY" ? "All organs ingest Hub SOTA" : ORGANS.find((o) => o.id === lattice)?.name}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {lattice === "UNIFY"
                  ? "Click a node. Every first-party Hugging Face library, ecosystem runtime, and 2026 frontier checkpoint maps onto an organ as LIVE, HOLOGRAM, ROADMAP, or REFUSED."
                  : ORGANS.find((o) => o.id === lattice)?.ours}
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {latticeJobs.map((j) => (
                  <li key={j.job} className="rounded-lg bg-elevated p-3">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-sm">{j.job}</p>
                      <span className="font-mono text-[10px] text-accent">{j.status}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-muted">{j.hf}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">{j.ours}</p>
                  </li>
                ))}
              </ul>
            </div>
            <SotaAtlas
              organ={lattice === "UNIFY" ? "ALL" : lattice}
              query={query}
              onQuery={setQuery}
            />
          </section>
        )}

        <div className={tab === "evolve" ? "contents" : "hidden"}>
          <EvolveDeck
            onServe={() => {
              setTab("serve");
            }}
          />
        </div>

        {tab === "forge" && <ForgeLab onServe={() => setTab("serve")} />}

        {tab === "serve" && <ServeConsole />}

        {tab === "sota" && (
          <section className="space-y-6">
            <div className="holo-panel rounded-xl p-5">
              <h2 className="font-display text-xl">Hub download class, 2026</h2>
              <p className="mt-1 text-sm text-muted">
                {snapshot.error
                  ? `Live Hub UNAVAILABLE — showing curated frontier hologram. ${snapshot.error}`
                  : `Fetched ${snapshot.fetchedAt}. Live rows overlay the doctrine map.`}
              </p>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {snapshot.hubSota.slice(0, 16).map((m) => {
                    const mapped = HF_SOFTWARE.find((s) => s.id === m.id || s.name === m.id);
                    return (
                      <li key={m.id} className="rounded-lg bg-elevated p-3">
                        <a
                          className="font-mono text-sm text-accent underline-offset-4 hover:underline"
                          href={`https://huggingface.co/${m.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {m.id}
                        </a>
                        <p className="mt-1 text-xs text-muted">
                          {m.tag ?? mapped?.job ?? "model"} · {m.downloads ? `${m.downloads.toLocaleString()} dl` : "hologram fallback"}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed">
                          {mapped ? `${mapped.status} → ${mapped.organ} · ${mapped.ours}` : "Uncarded Hub weight. Job still maps through the gate, never as a twin."}
                        </p>
                      </li>
                    );
                  })}
              </ul>
            </div>
            <SotaAtlas organ={organ} query={query} onQuery={setQuery} />
          </section>
        )}

        {tab === "pulse" && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <HologramLattice
                selected="UNIFY"
                onSelect={(id) => {
                  setLattice(id);
                  setTab("unify");
                }}
              />
              <div className="holo-panel rounded-xl p-5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-xl">Vertical desks</h2>
                  <button
                    type="button"
                    className="text-sm text-accent underline-offset-4 hover:underline"
                    onClick={() => setTab("verticals")}
                  >
                    Open desks
                  </button>
                </div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {VERTICALS.map((v) => (
                    <li key={v.id} className="rounded-lg bg-elevated px-3 py-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="text-sm">{v.name}</p>
                        <span className={`font-mono text-[10px] ${occupancyTone(v.occupancy)}`}>{v.occupancy}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{v.product}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="holo-panel rounded-xl p-5">
                <h2 className="font-display text-xl">What is actually down</h2>
                <p className="mt-1 text-sm text-muted">
                  {snapshot.error ? `Hub fetch UNAVAILABLE — ${snapshot.error}` : `Fetched ${snapshot.fetchedAt}`}
                </p>
                <ul className="mt-5 space-y-3">
                  {downDiag.map((d) => {
                    const live = rows.find((r) => r.id === d.id);
                    const stage = live?.stage ?? d.stage;
                    return (
                      <li key={d.id} className="rounded-lg border border-border bg-elevated p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <a
                            className="font-mono text-sm text-accent underline-offset-4 hover:underline"
                            href={`https://huggingface.co/spaces/SZLHOLDINGS/${d.id}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            SZLHOLDINGS/{d.id}
                          </a>
                          <span className={`font-mono text-xs ${stageTone(stage)}`}>{stage}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed">{d.cause}</p>
                        <p className="mt-2 text-sm text-muted">Fix: {d.fix}</p>
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="holo-panel rounded-xl p-5">
                <h2 className="font-display text-xl">Repair PRs — merged</h2>
                <p className="mt-1 text-sm text-muted">GitHub is canonical. Immune was re-triggered to republish Hub.</p>
                <ul className="mt-4 space-y-2">
                  {REPAIR_PRS.map((p) => (
                    <li key={`${p.repo}-${p.n}`}>
                      <a
                        className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-accent underline-offset-4 hover:underline"
                        href={`https://github.com/${p.repo}/pull/${p.n}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="size-4" />
                        {p.repo}#{p.n}
                      </a>
                      <p className="pl-6 text-sm text-muted">{p.title}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <aside className="flex flex-col gap-4">
              <div className="holo-panel rounded-xl p-5">
                <h2 className="font-display text-xl">Λ playground</h2>
                <p className="mt-1 text-sm text-muted">13 Yuyay axes. Sacred floors 0.95. Weighted geometric mean.</p>
                <p className="mt-4 font-mono text-3xl tabular-nums text-accent">{lambda.toFixed(4)}</p>
                <p className={`mt-1 text-xs ${sacredFail ? "text-danger" : "text-muted"}`}>
                  {sacredFail ? "BLOCKED — sacred axis below floor" : "ADMITTED under floors · uniqueness still Conjecture 1"}
                </p>
                <div className="mt-4 space-y-2">
                  {axes.map((v, i) => (
                    <label key={i} className="flex items-center gap-3 text-xs text-muted">
                      <span className="w-28 truncate font-mono" title={YUYAY_AXES[i]}>
                        {YUYAY_AXES[i] ?? `A${i + 1}`}
                      </span>
                      <input
                        type="range"
                        min={0.5}
                        max={1}
                        step={0.01}
                        value={v}
                        onChange={(e) => {
                          const next = [...axes];
                          next[i] = Number(e.target.value);
                          setAxes(next);
                        }}
                        className="h-1 flex-1 accent-accent"
                      />
                      <span className="w-10 text-right font-mono tabular-nums text-fg">{v.toFixed(2)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="holo-panel rounded-xl p-5">
                <h2 className="font-display text-xl">Doctrine lock</h2>
                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-muted">Hub SOTA</dt>
                    <dd className="font-mono">{instilled} instilled</dd>
                  </div>
                  <div>
                    <dt className="text-muted">First-party</dt>
                    <dd className="font-mono">{SOFTWARE_COUNTS.firstParty}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Datasets</dt>
                    <dd className="font-mono">{snapshot.datasetCount}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Models</dt>
                    <dd className="font-mono">{snapshot.models.length || MODELS.length}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">GitHub</dt>
                    <dd className="font-mono">93 repos</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Lean</dt>
                    <dd className="font-mono">749 / 14 / 163</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </section>
        )}

        {tab === "broken" && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl">Repair queue</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Public BUILD_ERROR and RUNTIME_ERROR are zero. Residual risk is leftover Node trees, unpinned Docker Hub python, and the last Gradio Space. Each fix is a boot path the Hub factory can finish.
            </p>
            {DIAGNOSIS.map((d) => (
              <article key={d.id} className="holo-panel rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-mono text-lg">{d.id}</h3>
                  <span className={`font-mono text-xs ${d.severity === "down" ? "text-danger" : d.severity === "risk" ? "text-warn" : "text-accent"}`}>
                    {d.severity.toUpperCase()} · {d.stage}
                  </span>
                </div>
                <p className="mt-3 text-sm text-danger">{d.error}</p>
                <p className="mt-2 text-sm leading-relaxed">{d.cause}</p>
                <p className="mt-3 text-sm text-accent">{d.fix}</p>
                <p className="mt-2 font-mono text-xs text-muted">{d.publisher}</p>
                <a
                  className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
                  href={`https://github.com/szl-holdings/${d.id === "szl-experiments" ? "szl-experiments" : d.id === "experiments" ? "szl-experiments" : d.id === "second-brain" ? "szl-second-brain" : d.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <GitBranch className="size-4" />
                  GitHub source
                </a>
              </article>
            ))}
          </section>
        )}

        {tab === "organs" && (
          <section className="grid gap-4 md:grid-cols-2">
            {ORGANS.map((o) => {
              const kids = rows.filter((r) => r.organ === o.id);
              const live = kids.filter((k) => k.stage === "RUNNING").length;
              const jobs = jobsForOrgan(o.id);
              return (
                <article key={o.id} className="holo-panel rounded-xl p-5">
                  <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">{o.quechua}</p>
                  <h2 className="font-display mt-1 text-2xl">{o.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed">{o.job}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg bg-elevated p-3">
                      <p className="text-xs tracking-widest text-muted uppercase">Leader job</p>
                      <p className="mt-1 text-sm leading-relaxed">{o.leader}</p>
                    </div>
                    <div className="rounded-lg bg-elevated p-3">
                      <p className="text-xs tracking-widest text-muted uppercase">Our cut</p>
                      <p className="mt-1 text-sm leading-relaxed">{o.ours}</p>
                    </div>
                  </div>
                  <p className="mt-3 font-mono text-xs text-muted">
                    {o.formula} · {live}/{kids.length} running · {jobs.length} Hub jobs
                  </p>
                  <button
                    type="button"
                    className="mt-3 inline-flex min-h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
                    onClick={() => {
                      setLattice(o.id);
                      setTab("unify");
                    }}
                  >
                    Open hologram
                  </button>
                </article>
              );
            })}
          </section>
        )}

        {tab === "spaces" && (
          <section>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="font-display text-2xl">{rows.length} Spaces</h2>
              <div className="flex flex-col gap-2 sm:flex-row">
                <select
                  value={organ}
                  onChange={(e) => setOrgan(e.target.value as OrganId | "ALL")}
                  className="h-11 rounded-lg border border-border bg-elevated px-3 text-sm"
                >
                  <option value="ALL">All organs</option>
                  {ORGANS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Filter id, role, repo"
                  className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm sm:max-w-xs"
                />
              </div>
            </div>
            <div className="holo-panel overflow-x-auto rounded-xl">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-elevated text-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Space</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">SDK</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">GitHub</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSpaces.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-3 font-mono">
                        <a
                          className="text-accent underline-offset-4 hover:underline"
                          href={`https://huggingface.co/spaces/SZLHOLDINGS/${s.id}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {s.id}
                        </a>
                      </td>
                      <td className={`px-4 py-3 font-mono text-xs ${stageTone(s.stage)}`}>{s.stage}</td>
                      <td className="px-4 py-3 text-muted">{s.sdk}</td>
                      <td className="px-4 py-3">{s.role}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{s.github ?? "Hub-only"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {tab === "models" && (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modelRows.map((m) => (
              <article key={m.id} className="holo-panel rounded-xl p-4">
                <a
                  className="font-mono text-sm text-accent underline-offset-4 hover:underline"
                  href={`https://huggingface.co/SZLHOLDINGS/${m.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {m.id}
                </a>
                <p className="mt-2 text-sm leading-relaxed">{m.card}</p>
                <p className="mt-3 text-xs leading-relaxed text-muted">{m.honesty}</p>
                <p className="mt-2 font-mono text-xs text-muted">
                  {m.tag} · {m.downloads} dl · {m.github ?? "no GH twin"}
                </p>
              </article>
            ))}
            <article className="holo-panel rounded-xl border-dashed p-4">
              <p className="font-display text-lg">Card rule</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Every model card must state: what it is, what it is not, proof status, energy honesty, and the GitHub source. Kernel packages are not weights. GGUF is a derived form. Λ is never proven.
              </p>
            </article>
          </section>
        )}

        {tab === "formulas" && (
          <section className="grid gap-6 lg:grid-cols-[16rem_1fr]">
            <ul className="flex gap-2 overflow-x-auto lg:flex-col">
              {FORMULAS.map((f) => (
                <li key={f.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelected(f.id)}
                    className={`min-h-11 w-full rounded-lg px-3 py-2 text-left text-sm ${
                      selected === f.id ? "bg-accent text-accent-fg" : "bg-surface text-muted hover:text-fg"
                    }`}
                  >
                    <span className="font-mono text-xs">{f.id}</span>
                    <span className="mt-0.5 block truncate">{f.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <article className="holo-panel rounded-xl p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-display text-2xl">{formula.name}</h2>
                <span className={`font-mono text-xs ${proofTone(formula.status)}`}>{formula.status}</span>
              </div>
              <p className="mt-4 overflow-x-auto font-mono text-sm leading-relaxed text-accent">{formula.latex}</p>
              <p className="mt-4 text-sm leading-relaxed">{formula.detail}</p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-elevated p-4">
                  <p className="text-xs tracking-widest text-muted uppercase">Leader</p>
                  <p className="mt-2 text-sm leading-relaxed">{formula.leader}</p>
                </div>
                <div className="rounded-lg bg-elevated p-4">
                  <p className="text-xs tracking-widest text-muted uppercase">Our cut</p>
                  <p className="mt-2 text-sm leading-relaxed">{formula.ours}</p>
                </div>
              </div>
              <div className="mt-6 rounded-lg border border-border bg-elevated p-4">
                <p className="text-xs tracking-widest text-muted uppercase">Live eval</p>
                <p className="mt-2 font-mono text-2xl tabular-nums text-accent">
                  {demo.label} {demo.value}
                </p>
                <p className="mt-1 text-sm text-muted">{demo.note}</p>
              </div>
              <p className="mt-6 text-xs text-muted">
                Locked-8 (PROVEN ids): {LOCKED_8.join(", ")}. Everything else is axiom, sorry, or conjecture.
              </p>
            </article>
          </section>
        )}

        {tab === "leaders" && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl">Take the job, never the code</h2>
            <p className="max-w-2xl text-sm leading-relaxed text-muted">
              Each organ studies the category leader, then ships an SZL original: receipted, fail-closed, honesty-labelled. Not a rehost.
            </p>
            {LEADERS.map((l) => (
              <article key={l.job} className="holo-panel rounded-xl p-5">
                <h3 className="font-display text-lg">{l.job}</h3>
                <p className="mt-1 text-xs tracking-widest text-muted uppercase">{l.leader}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <p className="text-sm leading-relaxed text-muted">{l.take}</p>
                  <p className="text-sm leading-relaxed">{l.ours}</p>
                </div>
              </article>
            ))}
          </section>
        )}

        {tab === "briefing" && (
          <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <article className="holo-panel rounded-xl p-6">
              <div className="flex items-center gap-2 text-muted">
                <BookOpen className="size-4" />
                <h2 className="font-display text-xl text-fg">Investor</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {INVESTOR_POINTS.map((p) => (
                  <li key={p} className="flex gap-3 text-sm leading-relaxed">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
            <article className="holo-panel rounded-xl p-6">
              <div className="flex items-center gap-2 text-muted">
                <Terminal className="size-4" />
                <h2 className="font-display text-xl text-fg">Developer</h2>
              </div>
              <ul className="mt-4 space-y-3">
                {DEV_POINTS.map((p) => (
                  <li key={p} className="flex gap-3 text-sm leading-relaxed">
                    <Activity className="mt-0.5 size-4 shrink-0 text-accent" />
                    {p}
                  </li>
                ))}
              </ul>
              <p className="mt-6 font-mono text-xs text-muted">
                Source: github.com/szl-holdings · Hub: huggingface.co/SZLHOLDINGS · Evidence: a-11-oy.com
              </p>
            </article>
            <article className="holo-panel rounded-xl p-6">
              <div className="flex items-center gap-2 text-muted">
                <Radio className="size-4" />
                <h2 className="font-display text-xl text-fg">Other desks</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                When this Grok desk is out of credits, ChatGPT and Perplexity keep the same GitHub. Hugging Face writes go through ChatGPT MCP or a local token — Perplexity has no official Hub connector.
              </p>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed">
                <li>
                  <span className="font-mono text-xs text-accent">ChatGPT</span>
                  <span className="text-muted"> — Settings → Apps → GitHub. Then Hugging Face app or MCP https://huggingface.co/mcp with a token you create at huggingface.co/settings/tokens.</span>
                </li>
                <li>
                  <span className="font-mono text-xs text-accent">Perplexity</span>
                  <span className="text-muted"> — Pro/Max only. perplexity.ai/account/connectors → GitHub. Authorize szl-holdings. Hub stays read-via-web.</span>
                </li>
                <li>
                  <span className="font-mono text-xs text-accent">Prompt</span>
                  <span className="text-muted"> — Paste artifacts/SZL-OTHER-DESKS.md into both. Same doctrine. No tokens in chat. Squash-merge only green PRs.</span>
                </li>
              </ol>
            </article>
          </section>
        )}
      </main>
    </div>
  );
}

function NavRow({
  label,
  tabs,
  tab,
  onTab,
  quiet,
}: {
  label: string;
  tabs: { id: Tab; label: string; icon: typeof Activity }[];
  tab: Tab;
  onTab: (id: Tab) => void;
  quiet?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="hidden w-16 shrink-0 font-mono text-[10px] tracking-[0.16em] text-subtle uppercase sm:block">
        {label}
      </span>
      <nav className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-1" aria-label={label}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTab(t.id)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors duration-150 ${
                on ? "bg-accent text-accent-fg" : quiet ? "bg-transparent text-muted hover:bg-surface hover:text-fg" : "bg-surface text-muted hover:text-fg"
              }`}
            >
              <Icon className="size-4" strokeWidth={1.75} />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function Stat({
  label,
  value,
  ok,
  danger,
}: {
  label: string;
  value: string;
  ok?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="holo-panel min-w-[5.5rem] rounded-lg px-3 py-2">
      <p className="text-[10px] tracking-[0.18em] text-muted uppercase">{label}</p>
      <p className={`font-mono text-lg tabular-nums ${danger ? "text-danger" : ok ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}
