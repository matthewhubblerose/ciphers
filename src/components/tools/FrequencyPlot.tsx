import { letters } from "../../utils/ciphers";
import { frequencyComparison } from "../../utils/workbench";

interface Props {
  text: string;
  ranked?: boolean;
  compare?: boolean;
  counts?: boolean;
  label?: string;
}
export default function FrequencyPlot({
  text,
  ranked = false,
  compare = true,
  counts = false,
  label = "Ciphertext",
}: Props) {
  const rows = frequencyComparison(text, ranked),
    length = letters(text).length;
  const actual = (row: (typeof rows)[number]) => (counts ? row.count : row.percent);
  const expected = (row: (typeof rows)[number]) =>
    counts ? (length * row.englishPercent) / 100 : row.englishPercent;
  const rawMaximum = Math.max(
    counts ? 1 : 14,
    ...rows.map(actual),
    ...(compare ? rows.map(expected) : []),
  );
  const maximum = counts ? Math.ceil(rawMaximum) : rawMaximum;
  return (
    <div class="frequency-plot">
      <div class="legend">
        <span>
          <i class="cipher-swatch" />
          {label}
        </span>
        {compare && (
          <span>
            <i class="english-swatch" />
            English
          </span>
        )}
        <span>{counts ? "Letter count" : "Frequency (%)"}</span>
      </div>
      <p class="chart-scale small muted">
        Scale: 0–{counts ? Math.ceil(maximum) : maximum.toFixed(1)}
        {counts ? " letters" : "%"}
      </p>
      <div
        class="chart-scroll"
        tabIndex={0}
        aria-label={`${label} histogram; scroll horizontally on a small screen`}
      >
        <div
          class="frequency-chart comparison-chart"
          role="img"
          aria-label={`${label} letter ${counts ? "counts" : "frequencies"}${compare ? " compared with English" : ""}${ranked ? ", ordered by frequency" : ""}`}
        >
          {rows.map((row) => (
            <div
              class="chart-column"
              key={row.letter}
              title={`${label} ${row.letter}: ${row.count} (${row.percent.toFixed(2)}%). English ${row.englishLetter}: ${row.englishPercent.toFixed(2)}%${counts ? `; expected count ${expected(row).toFixed(1)}` : ""}`}
            >
              <div class="bar-track">
                <div
                  class="bar cipher-bar"
                  data-letter={row.letter}
                  data-count={row.count}
                  style={{ height: `${(actual(row) / maximum) * 100}%` }}
                />
                {compare && (
                  <div
                    class="bar english-bar"
                    data-letter={row.englishLetter}
                    style={{ height: `${(expected(row) / maximum) * 100}%` }}
                  />
                )}
              </div>
              <div class="bar-labels">
                <span class="cipher-label" aria-label={`${label} ${row.letter}`}>
                  {row.letter}
                </span>
                {compare && (
                  <span class="english-label" aria-label={`English ${row.englishLetter}`}>
                    {row.englishLetter}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <p class="small muted">
        Letter labels follow the bar colours: dark = {label.toLowerCase()}
        {compare ? ", light = English" : ""}.
        {ranked && compare
          ? " Both distributions are ranked separately; paired letters are candidates, not confirmed substitutions."
          : ""}
        {counts && compare ? " English bars show expected counts for a sample of this length." : ""}
      </p>
      <details>
        <summary>Exact counts & percentages</summary>
        <div class="table-scroll">
          <table>
            <caption>
              {label} letter frequencies{compare ? " and English reference" : ""}
            </caption>
            <thead>
              <tr>
                <th>{label}</th>
                <th>Count</th>
                <th>%</th>
                {compare && (
                  <>
                    <th>English letter</th>
                    <th>English %</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.letter}>
                  <th>{row.letter}</th>
                  <td>{row.count}</td>
                  <td>{row.percent.toFixed(2)}</td>
                  {compare && (
                    <>
                      <td>{row.englishLetter}</td>
                      <td>{row.englishPercent.toFixed(2)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
