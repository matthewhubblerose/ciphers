import type { PlotPair } from "../../utils/deckAnalysis";
export function ComparisonChart({
  rows,
  label = "Measured text",
  referenceLabel = "English reference",
  maximum = 16,
  highlight = "",
}: {
  rows: PlotPair[];
  label?: string;
  referenceLabel?: string;
  maximum?: number;
  highlight?: string;
}) {
  const max = Math.max(maximum, ...rows.map((r) => Math.max(r.value, r.reference)));
  const step = 1040 / rows.length;
  return (
    <div class="deck-chart">
      <div class="deck-legend">
        <span>
          <i />
          {label}
        </span>
        <span>
          <i />
          {referenceLabel}
        </span>
        <small>Frequency % · scale 0–{max.toFixed(1)}</small>
      </div>
      <svg
        viewBox="0 0 1040 236"
        role="img"
        aria-label={`${label} compared with ${referenceLabel}`}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1="0" x2="1040" y1={180 - i * 43} y2={180 - i * 43} stroke="#dce1d5" />
            <text x="3" y={176 - i * 43} class="axis-value">
              {((max * i) / 4).toFixed(1)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => (
          <g
            key={r.label}
            class={r.label === highlight ? "chart-column chart-highlight" : "chart-column"}
            style={{ transform: `translateX(${i * step}px)` }}
            data-group={r.label}
            data-value={r.value.toFixed(4)}
            data-reference={r.reference.toFixed(4)}
          >
            <title>
              {label} {r.label}: {r.value.toFixed(2)}%; {referenceLabel} {r.referenceLabel}:{" "}
              {r.reference.toFixed(2)}%
            </title>
            <rect
              class="measured-rect"
              x={step * 0.16}
              y={180 - (r.value / max) * 170}
              width={step * 0.3}
              height={(r.value / max) * 170}
            />
            <rect
              class="reference-rect"
              x={step * 0.5}
              y={180 - (r.reference / max) * 170}
              width={step * 0.3}
              height={(r.reference / max) * 170}
            />
            <text class="measured-label" text-anchor="middle" x={step * 0.32} y="202">
              {r.label}
            </text>
            <text class="reference-label" text-anchor="middle" x={step * 0.66} y="224">
              {r.referenceLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
