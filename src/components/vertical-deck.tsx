import { useState } from "react";
import { Building2, ExternalLink, Radar, ShieldAlert } from "lucide-react";
import { occupancyTone, VERTICALS, type VerticalDesk } from "@/lib/verticals";

export function VerticalDeck({ onUnify }: { onUnify: () => void }) {
  const [id, setId] = useState(VERTICALS[0]!.id);
  const desk = VERTICALS.find((v) => v.id === id) ?? VERTICALS[0]!;
  const measured = VERTICALS.reduce(
    (n, v) => n + v.data.filter((d) => d.state === "MEASURED").length,
    0,
  );
  const open = VERTICALS.filter((v) => v.occupancy === "UNAVAILABLE").length;

  return (
    <section className="space-y-6">
      <div className="holo-panel rounded-xl p-5 sm:p-6">
        <p className="font-mono text-xs tracking-[0.2em] text-muted uppercase">This-world products</p>
        <h2 className="font-display mt-1 text-3xl tracking-tight">Vertical desks</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Six finished desks. Each takes a category job and refuses the leader's code.
          Occupancy is {open}/{VERTICALS.length} UNAVAILABLE. Measured cells: {measured}. Not Zillow. Not Anduril.
        </p>
        <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Mini label="Desks" value={String(VERTICALS.length)} />
          <Mini label="Flagship" value="killinchu" />
          <Mini label="Measured cells" value={String(measured)} />
          <Mini label="Empty occupancy" value={String(open)} warn />
        </dl>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {VERTICALS.map((v) => {
          const on = v.id === desk.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => setId(v.id)}
              className={`flex min-h-11 shrink-0 flex-col rounded-xl px-4 py-2 text-left transition-colors ${
                on ? "bg-accent text-accent-fg" : "bg-surface text-muted hover:text-fg"
              }`}
            >
              <span className="text-sm font-medium">{v.name}</span>
              <span className={`font-mono text-[10px] ${on ? "text-accent-fg/80" : "text-subtle"}`}>
                {v.occupancy}
              </span>
            </button>
          );
        })}
      </div>

      <DeskPanel desk={desk} onUnify={onUnify} />
    </section>
  );
}

function DeskPanel({ desk, onUnify }: { desk: VerticalDesk; onUnify: () => void }) {
  return (
    <article className="holo-panel overflow-hidden rounded-xl">
      <header className="border-b border-border px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">{desk.product}</p>
            <h3 className="font-display mt-1 text-2xl">{desk.name}</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">{desk.ours}</p>
          </div>
          <span className="rounded-full bg-elevated px-3 py-1 font-mono text-[11px] text-accent">
            {desk.status} · occupancy {desk.occupancy}
          </span>
        </div>
        <p className="mt-4 text-sm leading-relaxed">
          Leader job: <span className="text-muted">{desk.leader}</span> — {desk.job}
        </p>
      </header>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4 p-5 sm:p-6">
          <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">Occupancy board</p>
          <ul className="grid gap-2">
            {desk.data.map((row) => (
              <li key={row.label} className="flex items-start justify-between gap-3 rounded-lg bg-elevated px-3 py-3">
                <div>
                  <p className="text-sm">{row.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{row.note}</p>
                </div>
                <span className={`shrink-0 font-mono text-[10px] ${occupancyTone(row.state)}`}>{row.state}</span>
              </li>
            ))}
          </ul>
          <p className="flex gap-2 text-sm leading-relaxed text-muted">
            <Radar className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={1.75} />
            {desk.next}
          </p>
        </div>
        <div className="space-y-4 border-t border-border p-5 lg:border-t-0 lg:border-l sm:p-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">We take</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed">
              {desk.take.map((item) => (
                <li key={item} className="text-fg">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-danger uppercase">We refuse</p>
            <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted">
              {desk.refuse.map((item) => (
                <li key={item} className="flex gap-2">
                  <ShieldAlert className="mt-0.5 size-3.5 shrink-0 text-danger" strokeWidth={1.75} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="font-mono text-[11px] text-muted">organs · {desk.organs.join(" · ")}</p>
          <div className="flex flex-wrap gap-2">
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-elevated px-3 text-sm text-accent"
              href={`https://github.com/${desk.github}`}
              target="_blank"
              rel="noreferrer"
            >
              <Building2 className="size-4" />
              GitHub
            </a>
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-elevated px-3 text-sm text-muted hover:text-fg"
              href={`https://huggingface.co/spaces/SZLHOLDINGS/${desk.space}`}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink className="size-4" />
              Hub hologram
            </a>
            <button
              type="button"
              onClick={onUnify}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm text-muted underline-offset-4 hover:text-fg hover:underline"
            >
              Open VERTICAL organ
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function Mini({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div className="rounded-lg bg-elevated px-3 py-2">
      <p className="text-[11px] tracking-widest text-muted uppercase">{label}</p>
      <p className={`mt-1 font-mono text-sm ${warn ? "text-danger" : "text-fg"}`}>{value}</p>
    </div>
  );
}
