import { ngrams, letters } from "../../utils/ciphers";
import { groupComparison } from "../../utils/englishGroups";

export default function GroupChart({
  text,
  n,
  compare = false,
  ranked = true,
  limit = 10,
}: {
  text: string;
  n: number;
  compare?: boolean;
  ranked?: boolean;
  limit?: number;
}) {
  const groups = ngrams(text, n).slice(0, 10);
  const total = Math.max(0, letters(text).length - n + 1);
  const max = Math.max(1, ...groups.map((g) => g.percent));
  if (compare) {
    const rows = groupComparison(text, n, ranked, limit),
      maximum = Math.max(1, ...rows.flatMap((r) => [r.cipherPercent, r.englishPercent]));
    return (
      <div
        class="group-chart group-comparison-chart"
        aria-label={`${n === 2 ? "Bigram" : "Trigram"} percentages compared with English`}
      >
        <div class="legend">
          <span>
            <i class="cipher-swatch" />
            Ciphertext
          </span>
          <span>
            <i class="english-swatch" />
            English reference
          </span>
        </div>
        <p class="small">
          {ranked
            ? "The most common groups in each text, ranked separately. Different labels are possible substitution clues, not confirmed matches."
            : "The same group appears in both bars. Groups shown are the combined top ten from your text and the English reference."}
        </p>
        <p class="small muted">
          Shared scale: 0–{maximum.toFixed(2)}%. Your percentages count all {total} overlapping
          groups.
        </p>
        {rows.map((r, i) => (
          <div class="group-bar-row paired-group-row" key={i}>
            <div class="group-pair-line">
              <b class="mono">{r.cipherGram}</b>
              <span class="group-bar-track">
                <i style={{ width: `${(100 * r.cipherPercent) / maximum}%` }} />
              </span>
              <span>
                {r.cipherPercent.toFixed(2)}% <small>({r.cipherCount})</small>
              </span>
            </div>
            <div class="group-pair-line english-pair-line">
              <b class="mono">{r.englishGram}</b>
              <span class="group-bar-track">
                <i style={{ width: `${(100 * r.englishPercent) / maximum}%` }} />
              </span>
              <span>{r.englishPercent.toFixed(2)}%</span>
            </div>
          </div>
        ))}
        <p class="small muted">
          English percentages use all within-word groups of this length in{" "}
          <a href="https://www.norvig.com/mayzner.html">Peter Norvig’s Google Books counts</a>. Your
          text also counts groups across removed spaces, so exact values can differ.
        </p>
      </div>
    );
  }
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
