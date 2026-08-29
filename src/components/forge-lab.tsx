import { Flame, KeyRound, Lock, Scissors } from "lucide-react";
import {
  ADAPTER_SKUS,
  KHIPU_1_5B,
  PEFT_METHODS,
  TARGET_MODULES,
  loraScale,
  trainableParams,
  vramHologramMb,
} from "@/lib/peft";
import { useForge } from "@/lib/forge-store";

function fmtCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function ForgeLab({ onServe }: { onServe: () => void }) {
  const method = useForge((s) => s.method);
  const sku = useForge((s) => s.sku);
  const rank = useForge((s) => s.rank);
  const alpha = useForge((s) => s.alpha);
  const modules = useForge((s) => s.modules);
  const quant = useForge((s) => s.quant);
  const keyed = useForge((s) => s.keyed);
  const cut = useForge((s) => s.cut);
  const setMethod = useForge((s) => s.setMethod);
  const setSku = useForge((s) => s.setSku);
  const setRank = useForge((s) => s.setRank);
  const setAlpha = useForge((s) => s.setAlpha);
  const toggleModule = useForge((s) => s.toggleModule);
  const setQuant = useForge((s) => s.setQuant);
  const setKeyed = useForge((s) => s.setKeyed);
  const cutAdapter = useForge((s) => s.cutAdapter);

  const meta = PEFT_METHODS.find((m) => m.id === method)!;
  const adapter = ADAPTER_SKUS.find((a) => a.id === sku)!;
  const trainable = trainableParams({ method, rank, modules });
  const fraction = trainable / KHIPU_1_5B.params;
  const scale = loraScale(method, alpha, rank);
  const vram = vramHologramMb({ quant: method === "qlora" ? "nf4" : quant, trainable });
  const aWidth = Math.max(8, Math.min(100, rank));
  const bHeight = Math.max(8, Math.min(72, rank));

  return (
    <section className="space-y-6">
      <div className="holo-panel rounded-xl p-5">
        <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">szl-forge · PEFT instilled · KHIPU</p>
        <h2 className="font-display mt-1 text-2xl">QLoRA kit, not a trainer</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Hugging Face PEFT / Unsloth is the leader job. Ours is a receipted adapter on the {KHIPU_1_5B.id} silhouette.
          This hologram composes the cut. GPU Unsloth stays on owner metal. The Hub Forge Lab is SNAPSHOT / BLUEPRINT_NOT_TRAINED.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="holo-panel rounded-xl p-5">
            <p className="text-xs tracking-widest text-muted uppercase">Method</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {PEFT_METHODS.map((m) => {
                const on = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`min-h-11 rounded-lg px-3 py-2 font-mono text-xs ${
                      on ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"
                    }`}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed">{meta.ours}</p>
            <p className="mt-1 font-mono text-[11px] text-muted">
              {meta.leader} · scale {meta.scale}
            </p>
          </div>

          <div className="holo-panel rounded-xl p-5">
            <p className="text-xs tracking-widest text-muted uppercase">SKU</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {ADAPTER_SKUS.map((a) => {
                const on = sku === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setSku(a.id)}
                    className={`rounded-lg p-3 text-left ${on ? "bg-accent text-accent-fg" : "bg-elevated text-fg"}`}
                  >
                    <p className="font-mono text-sm">{a.name}</p>
                    <p className={`mt-1 text-xs leading-relaxed ${on ? "text-accent-fg/80" : "text-muted"}`}>{a.honesty}</p>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{adapter.card}</p>
          </div>

          <div className="holo-panel rounded-xl p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs tracking-widest text-muted uppercase">LoRA geometry</p>
                <p className="mt-1 font-mono text-sm">
                  r={rank} · α={alpha} · scale {scale.toFixed(3)}
                </p>
              </div>
              <p className="font-mono text-xs text-muted">{method === "ia3" ? "vectors ⊙ x" : "ΔW = B A"}</p>
            </div>
            <div className="mt-4 flex items-end gap-3">
              <div className="flex-1">
                <p className="mb-1 font-mono text-[10px] tracking-widest text-muted uppercase">A · r × d</p>
                <div className="lora-slab h-8 w-full" style={{ maxWidth: `${aWidth}%` }} />
              </div>
              <div>
                <p className="mb-1 font-mono text-[10px] tracking-widest text-muted uppercase">B · d × r</p>
                <div className="lora-slab w-8" style={{ height: bHeight }} />
              </div>
            </div>
            <label className="mt-5 flex items-center gap-3 text-xs text-muted">
              <span className="w-16 font-mono">rank</span>
              <input
                type="range"
                min={4}
                max={64}
                step={4}
                value={rank}
                onChange={(e) => setRank(Number(e.target.value))}
                className="h-1 flex-1 accent-accent"
              />
              <span className="w-8 text-right font-mono tabular-nums text-fg">{rank}</span>
            </label>
            <label className="mt-3 flex items-center gap-3 text-xs text-muted">
              <span className="w-16 font-mono">alpha</span>
              <input
                type="range"
                min={8}
                max={128}
                step={8}
                value={alpha}
                onChange={(e) => setAlpha(Number(e.target.value))}
                className="h-1 flex-1 accent-accent"
              />
              <span className="w-8 text-right font-mono tabular-nums text-fg">{alpha}</span>
            </label>
            <p className="mt-4 text-xs tracking-widest text-muted uppercase">Target modules</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TARGET_MODULES.map((m) => {
                const on = modules.includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleModule(m)}
                    className={`min-h-11 rounded-lg px-3 py-2 font-mono text-xs ${
                      on ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"
                    }`}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
            {method !== "qlora" && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(["none", "nf4", "int8"] as const).map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuant(q)}
                    className={`min-h-11 rounded-lg px-3 py-2 font-mono text-xs ${
                      quant === q ? "bg-accent text-accent-fg" : "bg-elevated text-muted hover:text-fg"
                    }`}
                  >
                    {q === "none" ? "fp16 base" : q}
                  </button>
                ))}
              </div>
            )}
            {method === "qlora" && (
              <p className="mt-4 font-mono text-xs text-accent">NF4 locked — QLoRA is the 4-bit job.</p>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="holo-panel rounded-xl p-5">
            <p className="text-xs tracking-widest text-muted uppercase">Trainable</p>
            <p className="mt-2 font-mono text-3xl tabular-nums text-accent">{fmtCount(trainable)}</p>
            <p className="mt-1 text-sm text-muted">
              {(fraction * 100).toFixed(3)}% of {fmtCount(KHIPU_1_5B.params)} · ~{vram} MB hologram estimate
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted">VRAM is not MEASURED. No NVML on this surface.</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-muted">Base</dt>
                <dd className="font-mono">{KHIPU_1_5B.id}</dd>
              </div>
              <div>
                <dt className="text-muted">Eligible</dt>
                <dd className="font-mono text-danger">false</dd>
              </div>
              <div>
                <dt className="text-muted">Hub</dt>
                <dd className="font-mono">{adapter.hub}</dd>
              </div>
              <div>
                <dt className="text-muted">Energy</dt>
                <dd className="font-mono">UNAVAILABLE</dd>
              </div>
            </dl>
          </div>

          <div className="holo-panel rounded-xl p-5">
            <button
              type="button"
              onClick={() => setKeyed(!keyed)}
              className={`flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
                keyed ? "bg-accent text-accent-fg" : "bg-elevated text-muted"
              }`}
            >
              <span className="inline-flex items-center gap-2">
                {keyed ? <KeyRound className="size-4" /> : <Lock className="size-4" />}
                Governance key
              </span>
              <span className="font-mono text-xs">{keyed ? "present" : "absent"}</span>
            </button>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Fail-closed without a key. A cut is UNSIGNED-honest at best. This hologram never mints a DSSE signature.
            </p>
            <button
              type="button"
              onClick={() => cutAdapter()}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-3 text-sm text-accent-fg"
            >
              <Scissors className="size-4" />
              Cut adapter
            </button>
            {cut && (
              <pre className="mt-4 overflow-x-auto rounded-lg bg-elevated p-3 font-mono text-[11px] leading-relaxed text-muted">
                {JSON.stringify(
                  {
                    payloadType: "szl.adapter.v1",
                    fingerprint: cut.fingerprint,
                    status: cut.status,
                    method: cut.method,
                    sku: cut.sku,
                    rank: cut.rank,
                    alpha: cut.alpha,
                    modules: cut.modules,
                    quant: cut.quant,
                    trainable: cut.trainable,
                    publication_eligible: false,
                    energy: "UNAVAILABLE",
                  },
                  null,
                  2,
                )}
              </pre>
            )}
          </div>

          <div className="holo-panel rounded-xl p-5">
            <p className="text-sm leading-relaxed text-muted">
              Fuse this adapter into szl-serve. The gate is a prompt-space hologram. GPU LoRA merge is ROADMAP.
            </p>
            <button
              type="button"
              onClick={onServe}
              className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-accent underline-offset-4 hover:underline"
            >
              <Flame className="size-4" />
              Push to serve
            </button>
            <a
              className="mt-3 flex min-h-11 items-center font-mono text-xs text-muted underline-offset-4 hover:text-fg hover:underline"
              href="https://github.com/szl-holdings/szl-forge"
              target="_blank"
              rel="noreferrer"
            >
              github.com/szl-holdings/szl-forge
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
