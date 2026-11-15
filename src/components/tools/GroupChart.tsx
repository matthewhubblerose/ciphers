import { ngrams, letters } from "../../utils/ciphers";

export default function GroupChart({ text, n }: { text: string; n: number }) {
  const groups = ngrams(text, n).slice(0, 10);
  const total = Math.max(0, letters(text).length - n + 1);
  const max = Math.max(1, ...groups.map((g) => g.percent));
  return (
    <div class="group-chart">
      <p class="small">
        Top {groups.length} {n === 2 ? "bigrams" : "trigrams"} · {total} overlapping groups in
        total. Each percentage is count ÷ {total || "total groups"} × 100.
      </p>
      {groups.map((g) => (
        <div class="group-bar-row" key={g.gram}>
          <b class="mono">{g.gram}</b>
          <span class="group-bar-track">
            <i style={{ width: `${(g.percent / max) * 100}%` }} />
          </span>
          <span>
            {g.percent.toFixed(2)}% <small>({g.count})</small>
          </span>
        </div>
      ))}
      {!groups.length && <p>Enter at least {n} letters to see the chart.</p>}
      <p class="small muted">
        Bars share a scale within this chart. Percentages include all groups, even those outside the
        top ten.
      </p>
    </div>
  );
}
