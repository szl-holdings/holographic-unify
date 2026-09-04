import { useEffect, useMemo, useState } from "react";
import { Cpu, Radio, Shield } from "lucide-react";
import { ADAPTER_SKUS } from "@/lib/peft";
import { useForge } from "@/lib/forge-store";
import { runServe } from "@/lib/infer";
import {
  BLOCK_SIZE,
  FRONTIER_JOBS,
  KV_PAGES,
  PINNED_GGUF,
  kvPagesUsed,
  type FrontierJob,
  type ServeOk,
} from "@/lib/serve";

const ORGANS: FrontierJob["organ"][] = ["YACHAY", "YUYAY", "NERVOUS", "KHIPU", "VERTICAL"];

export function ServeConsole() {
  const method = useForge((s) => s.method);
  const sku = useForge((s) => s.sku);
  const rank = useForge((s) => s.rank);
  const alpha = useForge((s) => s.alpha);
  const modules = useForge((s) => s.modules);
  const cut = useForge((s) => s.cut);
  const frontier = useForge((s) => s.frontier);
  const setSku = useForge((s) => s.setSku);
  const setFrontier = useForge((s) => s.setFrontier);

  const job = FRONTIER_JOBS.find((j) => j.id === frontier) ?? FRONTIER_JOBS[0]!;
  const [prompt, setPrompt] = useState(job.prompt);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ServeOk | null>(null);
  const [shown, setShown] = useState("");
  const [prefixPages, setPrefixPages] = useState(0);

  const adapter = ADAPTER_SKUS.find((a) => a.id === sku)!;
  const pages = useMemo(() => {
    if (!result) return 0;
    return kvPagesUsed(result.promptTokens, result.completionTokens);
  }, [result]);

  const grouped = useMemo(() => {
    return ORGANS.map((organ) => ({
      organ,
      jobs: FRONTIER_JOBS.filter((j) => j.organ === organ),
    })).filter((g) => g.jobs.length);
  }, []);

  useEffect(() => {
    setPrompt(job.prompt);
    setError(null);
  }, [job]);

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

  async function serve() {
    const text = prompt.trim();
    if (!text || busy) return;
    if (job.status === "REFUSED") {
      setError("WILLAY floor — generated media is REFUSED. Not a Flux rehost.");
      setResult(null);
      setShown("");
      return;
    }
    setBusy(true);
    setError(null);
    setShown("");
    try {
      const out = await runServe({
        data: {
          prompt: text,
          adapter: sku,
          method,
          rank,
          alpha,
          modules,
          frontier: job.id,
          maxTokens: job.id === "evolve" || job.id === "september" ? 180 : 140,
        },
      });
      if (!out.ok) {
        setError(out.error);
        setResult(null);
        return;
      }
      setResult(out);
      setPrefixPages(kvPagesUsed(out.promptTokens, 0));
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
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">szl-serve · vLLM job · NERVOUS</p>
        <h2 className="font-display mt-1 text-2xl">One call. One pin. One receipt.</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          High-throughput serve is the leader job (vLLM, TGI, SGLang). This hologram takes the job: OpenAI-shaped chat,
          PEFT adapter fused in prompt-space, energy UNAVAILABLE, GPU PagedAttention ROADMAP. Not a vLLM fork.
        </p>
      </div>

      <div className="space-y-3">
        {grouped.map((g) => (
          <div key={g.organ}>
            <p className="mb-1 font-mono text-[10px] tracking-wider text-muted uppercase">{g.organ}</p>
            <div className="flex flex-wrap gap-2">
              {g.jobs.map((j) => {
                const on = frontier === j.id;
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => setFrontier(j.id)}
                    className={`min-h-11 rounded-lg px-3 py-2 text-left ${on ? "bg-accent text-accent-fg" : "holo-panel"}`}
                  >
                    <p className="text-sm">{j.title}</p>
                    <p className={`font-mono text-[10px] ${on ? "text-accent-fg/80" : j.status === "REFUSED" ? "text-danger" : "text-muted"}`}>
                      {j.status}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm leading-relaxed text-muted">{job.ours}</p>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="holo-panel rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs tracking-widest text-muted uppercase">Prompt</p>
              <p className="font-mono text-xs text-muted">
                {adapter.name} · {method} r{rank}
              </p>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value.slice(0, 800))}
              rows={6}
              className="mt-3 w-full rounded-lg border border-border bg-elevated px-3 py-3 text-sm leading-relaxed"
              placeholder="Take the job. Never the weights."
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-mono text-xs text-muted">{prompt.length}/800</p>
              <button
                type="button"
                onClick={() => void serve()}
                disabled={busy || !prompt.trim()}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-accent px-4 text-sm text-accent-fg disabled:opacity-40"
              >
                <Cpu className="size-4" />
                {busy ? "Serving…" : "Run gate"}
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
            {shown && (
              <div className="token-out mt-4 rounded-lg bg-elevated p-4 text-sm leading-relaxed whitespace-pre-wrap">{shown}</div>
            )}
          </div>

          <div className="holo-panel rounded-xl p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs tracking-widest text-muted uppercase">PagedAttention hologram</p>
              <p className="font-mono text-xs text-muted">
                {BLOCK_SIZE} tok/page · {pages}/{KV_PAGES} · prefix {prefixPages}
              </p>
            </div>
            <div className="kv-grid mt-4" aria-hidden="true">
              {Array.from({ length: KV_PAGES }, (_, i) => (
                <span
                  key={i}
                  className={`kv-cell ${i < pages ? "is-hot" : ""} ${i < prefixPages && i < pages ? "is-prefix" : ""}`}
                />
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Hot pages from MEASURED tokens. Prefix tint is the prompt page table. GPU kernels remain ROADMAP.
            </p>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="holo-panel rounded-xl p-5">
            <p className="text-xs tracking-widest text-muted uppercase">Fused adapter</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {ADAPTER_SKUS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setSku(a.id)}
                  className={`min-h-11 rounded-lg px-3 py-2 font-mono text-xs ${
                    sku === a.id ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"
                  }`}
                >
                  {a.name}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {cut
                ? `${cut.status} · ${cut.fingerprint}`
                : "No cut yet. Serve still runs; adapter is a prompt-space hologram."}
            </p>
          </div>

          <div className="holo-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted">
              <Radio className="size-4" />
              <h3 className="font-display text-lg text-fg">Receipt</h3>
            </div>
            {result ? (
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-muted">Tokens</dt>
                  <dd className="font-mono tabular-nums">{result.completionTokens}</dd>
                </div>
                <div>
                  <dt className="text-muted">elapsed_ms</dt>
                  <dd className="font-mono tabular-nums">{result.elapsedMs}</dd>
                </div>
                <div>
                  <dt className="text-muted">Energy</dt>
                  <dd className="font-mono">{result.energy}</dd>
                </div>
                <div>
                  <dt className="text-muted">Joules</dt>
                  <dd className="font-mono">null</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted">Signature</dt>
                  <dd className="font-mono">{result.signature}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted">output sha256</dt>
                  <dd className="truncate font-mono text-xs">{result.outputHash}</dd>
                </div>
              </dl>
            ) : (
              <p className="mt-3 text-sm text-muted">No completion yet. A receipt is an artifact of a run, not a decoration.</p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-muted">{result?.runtime ?? "Gate idle."}</p>
          </div>

          <div className="holo-panel rounded-xl p-5">
            <div className="flex items-center gap-2 text-muted">
              <Shield className="size-4" />
              <h3 className="font-display text-lg text-fg">Pinned GGUF</h3>
            </div>
            <p className="mt-2 font-mono text-xs leading-relaxed">{PINNED_GGUF.model}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted">
              MEASURED CPU lab {PINNED_GGUF.sample.when}: {PINNED_GGUF.sample.tokens} tokens · {PINNED_GGUF.sample.elapsedMs} ms.
              This command surface uses the xAI gate hologram. Same job, different runtime, honesty labelled.
            </p>
            <a
              className="mt-3 inline-flex min-h-11 items-center font-mono text-xs text-accent underline-offset-4 hover:underline"
              href="https://github.com/szl-holdings/szl-serve"
              target="_blank"
              rel="noreferrer"
            >
              github.com/szl-holdings/szl-serve
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
