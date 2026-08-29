import { ORGANS, type OrganId } from "@/lib/catalog";
import { SOTA_JOBS, type SotaStatus } from "@/lib/sota";

const ORGAN_POS: Record<OrganId, number> = {
  YACHAY: -Math.PI / 2,
  YUYAY: -Math.PI / 2 + Math.PI / 3,
  YAWAR: -Math.PI / 2 + (2 * Math.PI) / 3,
  NERVOUS: Math.PI / 2,
  KHIPU: Math.PI / 2 + Math.PI / 3,
  VERTICAL: Math.PI / 2 + (2 * Math.PI) / 3,
};

const CX = 200;
const CY = 148;
const R = 88;

function r(n: number) {
  return Math.round(n * 100) / 100;
}

function statusFill(s: SotaStatus) {
  if (s === "LIVE" || s === "HOLOGRAM") return "var(--color-accent)";
  if (s === "ROADMAP") return "var(--color-warn)";
  return "var(--color-danger)";
}

export function HologramLattice({
  selected,
  onSelect,
}: {
  selected: OrganId | "UNIFY";
  onSelect: (id: OrganId | "UNIFY") => void;
}) {
  const nodes = ORGANS.map((o) => {
    const a = ORGAN_POS[o.id];
    return {
      ...o,
      x: r(CX + Math.cos(a) * R),
      y: r(CY + Math.sin(a) * R),
      jobs: SOTA_JOBS.filter((j) => j.organ === o.id),
    };
  });

  return (
    <div className="holo-panel overflow-hidden rounded-xl">
      <svg
        viewBox="0 0 400 300"
        className="block h-auto w-full"
        role="group"
        aria-label="Holographic organ lattice. Activate a node to filter the unified catalog."
      >
        <defs>
          <radialGradient id="holo-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="300" fill="var(--color-bg)" />
        <circle cx={CX} cy={CY} r="118" fill="url(#holo-glow)" />
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-accent)" strokeOpacity="0.18" />
        <circle cx={CX} cy={CY} r={R * 0.42} fill="none" stroke="var(--color-accent)" strokeOpacity="0.12" />

        {nodes.map((n) => (
          <g key={n.id}>
            <line
              x1={CX}
              y1={CY}
              x2={n.x}
              y2={n.y}
              stroke="var(--color-accent)"
              strokeOpacity={selected === n.id ? 0.8 : 0.28}
              strokeWidth={selected === n.id ? 1.6 : 1}
            />
            <circle className="holo-bead" r="1.8" fill="var(--color-accent)">
              <animateMotion dur="5.5s" repeatCount="indefinite" path={`M ${CX},${CY} L ${n.x},${n.y}`} />
            </circle>
            {n.jobs.map((j, i) => {
              const ang = ORGAN_POS[n.id] + (i - (n.jobs.length - 1) / 2) * 0.14;
              const rr = R + 26 + (i % 3) * 6;
              const x = r(CX + Math.cos(ang) * rr);
              const y = r(CY + Math.sin(ang) * rr);
              return (
                <g key={j.job}>
                  <line x1={n.x} y1={n.y} x2={x} y2={y} stroke="var(--color-accent)" strokeOpacity="0.12" />
                  <circle cx={x} cy={y} r="2.1" fill={statusFill(j.status)} opacity={j.status === "REFUSED" ? 0.7 : 1}>
                    <title>{`${j.job} · ${j.status}`}</title>
                  </circle>
                </g>
              );
            })}
          </g>
        ))}

        {nodes.map((n) => {
          const on = selected === n.id;
          const live = n.jobs.filter((j) => j.status === "LIVE").length;
          return (
            <g key={`btn-${n.id}`}>
              <circle
                cx={n.x}
                cy={n.y}
                r={on ? 30 : 26}
                fill={on ? "color-mix(in oklab, var(--color-accent) 16%, var(--color-surface))" : "var(--color-surface)"}
                stroke="var(--color-accent)"
                strokeOpacity={on ? 1 : 0.4}
                className="cursor-pointer"
                tabIndex={0}
                onClick={() => onSelect(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(n.id);
                  }
                }}
              />
              <text
                x={n.x}
                y={n.y - 4}
                textAnchor="middle"
                fill={on ? "var(--color-accent)" : "var(--color-fg)"}
                fontSize="10"
                fontFamily="ui-monospace, SF Mono, Menlo, monospace"
                className="pointer-events-none"
              >
                {n.name}
              </text>
              <text
                x={n.x}
                y={n.y + 9}
                textAnchor="middle"
                fill="var(--color-muted)"
                fontSize="9"
                fontFamily="ui-monospace, SF Mono, Menlo, monospace"
                className="pointer-events-none"
              >
                {live}/{n.jobs.length}
              </text>
            </g>
          );
        })}

        <g>
          <circle
            cx={CX}
            cy={CY}
            r={selected === "UNIFY" ? 38 : 34}
            fill={selected === "UNIFY" ? "color-mix(in oklab, var(--color-accent) 16%, var(--color-surface))" : "var(--color-surface)"}
            stroke="var(--color-accent)"
            className="cursor-pointer"
            tabIndex={0}
            onClick={() => onSelect("UNIFY")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect("UNIFY");
              }
            }}
          />
          <text
            x={CX}
            y={CY - 4}
            textAnchor="middle"
            fill="var(--color-accent)"
            fontSize="11"
            fontFamily="ui-monospace, SF Mono, Menlo, monospace"
            fontWeight="600"
            className="pointer-events-none"
          >
            UNIFY
          </text>
          <text
            x={CX}
            y={CY + 10}
            textAnchor="middle"
            fill="var(--color-muted)"
            fontSize="9"
            fontFamily="ui-monospace, SF Mono, Menlo, monospace"
            className="pointer-events-none"
          >
            {SOTA_JOBS.length} jobs
          </text>
        </g>
      </svg>
    </div>
  );
}
