import { useEffect, useMemo, useState } from "react";
import { Orbit, Radio, Spline } from "lucide-react";
import { CONVERGE_PROMPT, LINEAGE, ORGAN_MUTATIONS, SEPTEMBER_PROMPT, WAVE_2026 } from "@/lib/evolve";
import { useForge } from "@/lib/forge-store";
import { runServe } from "@/lib/infer";
import type { ServeOk } from "@/lib/serve";

function tone(status: string) {
  if (status === "REFUSED") return "text-danger";
  if (status === "ROADMAP" || status === "CUTTING") return "text-warn";
  return "text-accent";
}

export function EvolveDeck({ onServe }: { onServe: () => void }) {
  const method = useForge((s) => s.method);
  const sku = useForge((s) => s.sku);
  const rank = useForge((s) => s.rank);
  const alpha = useForge((s) => s.alpha);
  const modules = useForge((s) => s.modules);
  const setFrontier = useForge((s) => s.setFrontier);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ServeOk | null>(null);
  const [shown, setShown] = useState("");
  const [wave, setWave] = useState<"evolve" | "september">("september");

  const counts = useMemo(() => {
    const acc = { HOLOGRAM: 0, REFUSED: 0, ROADMAP: 0, LIVE: 0, CUTTING: 0 };
    for (const w of WAVE_2026) acc[w.status] += 1;
    return acc;
  }, []);

  useEffect(() => {
    if (!result) return;
    const full = result.text;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(full);
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 4;
      setShown(full.slice(0, i));
      if (i >= full.length) window.clearInterval(id);
    }, 16);
    return () => window.clearInterval(id);
  }, [result]);

  useEffect(() => {
    if (!shown) return;
    document.getElementById("ayllu-converge")?.scrollIntoView({ block: "nearest" });
  }, [shown]);

  function admit(jobId: string) {
    setFrontier(jobId);
    onServe();
  }

  async function converge(kind: "evolve" | "september") {
    if (busy) return;
    setBusy(true);
    setError(null);
    setShown("");
    setWave(kind);
    setFrontier(kind);
    try {
      const out = await runServe({
        data: {
          prompt: kind === "september" ? SEPTEMBER_PROMPT : CONVERGE_PROMPT,
          adapter: sku,
          method,
          rank,
          alpha,
          modules,
          frontier: kind,
          maxTokens: 180,
        },
      });
      if (!out.ok) {
        setError(out.error);
        setResult(null);
        return;
      }
      setResult(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : "UNAVAILABLE");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-6">
      <div className="holo-panel rounded-xl p-5">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">wave 2026 · late summer · Doctrine v11</p>
        <h2 className="font-display mt-1 text-2xl">Push the frontier. Keep the silhouette.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          V4-Pro, K2.7, GLM-5.3, Qwen3.8, Gemma 4, gpt-oss, Inkling, Llama 4. Jobs through Ayllu. Not twins.
          K3 dump REFUSED. Inkling 975B host REFUSED. Λ uniqueness stays Conjecture 1.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-elevated p-3">
            <dt className="font-mono text-[10px] tracking-wider text-muted uppercase">Admitted jobs</dt>
            <dd className="font-display text-xl text-accent">{counts.HOLOGRAM + counts.LIVE}</dd>
          </div>
          <div className="rounded-lg bg-elevated p-3">
            <dt className="font-mono text-[10px] tracking-wider text-muted uppercase">Refused dumps</dt>
            <dd className="font-display text-xl text-danger">{counts.REFUSED}</dd>
          </div>
          <div className="rounded-lg bg-elevated p-3">
            <dt className="font-mono text-[10px] tracking-wider text-muted uppercase">Roadmap</dt>
            <dd className="font-display text-xl text-warn">{counts.ROADMAP}</dd>
          </div>
          <div className="rounded-lg bg-elevated p-3">
            <dt className="font-mono text-[10px] tracking-wider text-muted uppercase">Wave cards</dt>
            <dd className="font-display text-xl">{WAVE_2026.length}</dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {WAVE_2026.map((w) => (
          <article key={w.id} className="holo-panel rounded-xl p-4">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="font-display text-lg">{w.name}</h3>
              <span className={`font-mono text-[10px] tracking-wider ${tone(w.status)}`}>{w.status}</span>
            </div>
            <p className="mt-1 font-mono text-xs text-muted">
              {w.lab} · {w.license}
            </p>
            <p className="mt-2 text-sm leading-relaxed">{w.ours}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">{w.note}</p>
            <button
              type="button"
              onClick={() => admit(w.admit)}
              className="mt-3 inline-flex min-h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
            >
              {w.status === "REFUSED" ? "Show the floor" : "Admit through the gate"}
            </button>
          </article>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        {LINEAGE.map((line) => (
          <article key={line.id} className="holo-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted">
              <Spline className="size-4" />
              <h3 className="font-display text-lg text-fg">{line.title}</h3>
            </div>
            <ol className="lineage-rail mt-4 space-y-3 pl-7">
              {line.steps.map((step) => (
                <li key={step.label}>
                  <p className="font-mono text-sm">{step.label}</p>
                  <p className="text-xs leading-relaxed text-muted">{step.honesty}</p>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-muted">{line.lock}</p>
          </article>
        ))}
      </div>

      <div className="holo-panel rounded-xl p-5">
        <p className="text-xs tracking-widest text-muted uppercase">Organ mutations this wave</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ORGAN_MUTATIONS.map((m) => (
            <li key={m.organ} className="rounded-lg bg-elevated p-3">
              <p className="font-mono text-xs text-accent">{m.organ}</p>
              <p className="mt-1 text-sm leading-relaxed">{m.absorbed}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">Refuse: {m.refused}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="holo-panel rounded-xl p-5" id="ayllu-converge">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Ayllu · evolve us</p>
            <h3 className="font-display mt-1 text-xl">Debate, then converge</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              One gated call. Three seats. One Human Lock. Adapter stays the Forge cut. Energy UNAVAILABLE.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void converge("september")}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm text-accent-fg disabled:opacity-40"
            >
              <Orbit className="size-4" />
              {busy && wave === "september" ? "Seats in session…" : "Push this wave"}
            </button>
            <button
              type="button"
              onClick={() => void converge("evolve")}
              disabled={busy}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-elevated px-4 text-sm disabled:opacity-40"
            >
              {busy && wave === "evolve" ? "Seats in session…" : "Evolve us"}
            </button>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-danger">{error}</p>}
        {shown && <div className="token-out mt-4 rounded-lg bg-elevated p-4 text-sm leading-relaxed whitespace-pre-wrap">{shown}</div>}
        {result && (
          <p className="mt-3 flex items-center gap-2 font-mono text-xs text-muted">
            <Radio className="size-3.5" />
            {result.frontier} · {result.completionTokens} tok · {result.elapsedMs} ms · {result.signature} · joules null
          </p>
        )}
      </div>
    </section>
  );
}
