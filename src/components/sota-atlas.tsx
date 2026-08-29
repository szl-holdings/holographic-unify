import { useMemo, useState } from "react";
import { ExternalLink, Filter } from "lucide-react";
import { ORGANS, type OrganId } from "@/lib/catalog";
import {
  HF_SOFTWARE,
  SOFTWARE_COUNTS,
  SOTA_COUNTS,
  SOTA_JOBS,
  searchUnify,
  type SotaStatus,
} from "@/lib/sota";

const STATUSES: SotaStatus[] = ["LIVE", "HOLOGRAM", "ROADMAP", "REFUSED"];

function tone(s: SotaStatus) {
  if (s === "LIVE") return "text-accent";
  if (s === "HOLOGRAM") return "text-accent";
  if (s === "ROADMAP") return "text-warn";
  return "text-danger";
}

function chip(s: SotaStatus) {
  if (s === "LIVE") return "bg-accent text-accent-fg";
  if (s === "HOLOGRAM") return "bg-elevated text-accent ring-1 ring-accent/40";
  if (s === "ROADMAP") return "bg-elevated text-warn";
  return "bg-elevated text-danger";
}

export function SotaAtlas({
  organ,
  query,
  onQuery,
}: {
  organ: OrganId | "ALL" | "UNIFY";
  query: string;
  onQuery: (q: string) => void;
}) {
  const [status, setStatus] = useState<SotaStatus | "ALL">("ALL");
  const [kind, setKind] = useState<"ALL" | "library" | "frontier" | "job">("ALL");
  const organFilter = organ === "UNIFY" || organ === "ALL" ? "ALL" : organ;

  const hits = useMemo(() => {
    return searchUnify(query).filter((h) => {
      if (organFilter !== "ALL" && h.organ !== organFilter) return false;
      if (status !== "ALL" && h.status !== status) return false;
      if (kind !== "ALL" && h.kind !== kind) return false;
      return true;
    });
  }, [query, organFilter, status, kind]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="font-display text-2xl">Instilled Hub SOTA</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Every first-party Hugging Face library, the Hub ecosystem, and 2026 frontier weights mapped onto an SZL organ. We take the job. We never rehost the leader.
          </p>
        </div>
        <p className="font-mono text-xs text-muted">
          {SOTA_JOBS.length} jobs · {HF_SOFTWARE.length} packages · {SOFTWARE_COUNTS.firstParty} first-party · {SOFTWARE_COUNTS.frontier} frontier
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Count label="LIVE" value={SOTA_COUNTS.live + SOFTWARE_COUNTS.live} ok />
        <Count label="HOLOGRAM" value={SOTA_COUNTS.hologram + SOFTWARE_COUNTS.hologram} />
        <Count label="ROADMAP" value={SOTA_COUNTS.roadmap + SOFTWARE_COUNTS.roadmap} warn />
        <Count label="REFUSED" value={SOTA_COUNTS.refused + SOFTWARE_COUNTS.refused} danger />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search unified catalog</span>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search transformers, Qwen, whisper, kernels…"
            className="h-11 w-full rounded-lg border border-border bg-elevated px-3 text-sm"
          />
        </label>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
          className="h-11 rounded-lg border border-border bg-elevated px-3 text-sm"
        >
          <option value="ALL">All kinds</option>
          <option value="job">Jobs</option>
          <option value="library">Libraries</option>
          <option value="frontier">Frontier models</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as SotaStatus | "ALL")}
          className="h-11 rounded-lg border border-border bg-elevated px-3 text-sm"
        >
          <option value="ALL">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <p className="flex items-center gap-2 font-mono text-xs text-muted">
        <Filter className="size-3.5" />
        {hits.length} instilled
        {organFilter !== "ALL" ? ` · ${ORGANS.find((o) => o.id === organFilter)?.name}` : ""}
      </p>

      <ul className="grid gap-3 md:grid-cols-2">
        {hits.map((h) => (
          <li key={`${h.kind}-${h.title}`} className="holo-panel rounded-xl p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <a
                href={h.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center gap-2 font-mono text-sm text-accent underline-offset-4 hover:underline"
              >
                {h.title}
                <ExternalLink className="size-3.5" />
              </a>
              <span className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider ${chip(h.status)}`}>
                {h.status}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{h.subtitle}</p>
            <p className="mt-2 text-sm leading-relaxed">{h.ours}</p>
            <p className="mt-3 font-mono text-[11px] text-muted">
              {h.organ} · {h.surface} · {h.kind}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatusLegend() {
  return (
    <ul className="flex flex-wrap gap-3 text-xs">
      {STATUSES.map((s) => (
        <li key={s} className={`font-mono ${tone(s)}`}>
          {s}
        </li>
      ))}
    </ul>
  );
}

function Count({
  label,
  value,
  ok,
  warn,
  danger,
}: {
  label: string;
  value: number;
  ok?: boolean;
  warn?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="holo-panel rounded-lg px-3 py-2">
      <p className="text-[10px] tracking-[0.18em] text-muted uppercase">{label}</p>
      <p
        className={`font-mono text-lg tabular-nums ${
          danger ? "text-danger" : warn ? "text-warn" : ok ? "text-accent" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
