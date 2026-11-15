import { useState } from "preact/hooks";
import { keyLengths, letters } from "../../utils/ciphers";
import { factorVotes, repeatedGroups } from "../../utils/vigenereAnalysis";

export default function KeyLengthAnalysis({
  text,
  onSelectLength,
}: {
  text: string;
  onSelectLength?: (n: number) => void;
}) {
  const [size, setSize] = useState(3);
  const scores = keyLengths(text),
    repeats = repeatedGroups(text, size),
    votes = factorVotes(text, size);
  const count = letters(text).length,
    max = Math.max(0.08, ...scores.map((s) => s.ic));
  return (
    <section class="key-length-analysis" aria-label="Vigenère key-length evidence">
      <h3>Possible key lengths</h3>
      <p class="hint">
        For each candidate length, take every nth letter to make separate streams, then average
        their Index of Coincidence (IC). Peaks near English (about 0.066) are worth testing. Random
        A–Z letters average about 0.0385. Multiples can peak too; prefer the shortest length that
        gives a consistent readable answer.
      </p>
      {count < 100 && (
        <p class="guide-callout">
          Only {count} letters: short streams give unstable scores. Use more text if available;
          these are clues, not a verdict.
        </p>
      )}
      {!scores.length ? (
        <p>Enter at least two letters to compare key lengths.</p>
      ) : (
        <>
          <div class="length-chart" aria-label="Average IC by candidate key length">
            {scores.map((s) => (
              <button
                type="button"
                key={s.length}
                aria-label={`Try key length ${s.length}, average IC ${s.ic.toFixed(4)}`}
                disabled={!onSelectLength}
                style={{ "--score": `${(s.ic / max) * 100}%` }}
                onClick={() => onSelectLength?.(s.length)}
              >
                <span>{s.ic.toFixed(3)}</span>
                <span class="ic-track">
                  <i />
                </span>
                <b>{s.length}</b>
              </button>
            ))}
          </div>
          <p class="small muted">
            Horizontal axis: candidate length. Vertical bars: average IC (0–{max.toFixed(3)}).
            Select a bar or table row to start that many A shifts.
          </p>
          <details>
            <summary>Exact IC values and stream sizes</summary>
            <div class="table-scroll">
              <table>
                <caption>Average stream IC — lengths up to 20</caption>
                <thead>
                  <tr>
                    <th>Length</th>
                    <th>Average IC</th>
                    <th>Shortest stream</th>
                    <th>Try</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((s) => (
                    <tr key={s.length}>
                      <th>{s.length}</th>
                      <td>{s.ic.toFixed(4)}</td>
                      <td>
                        {Math.floor(count / s.length)} letters
                        {Math.floor(count / s.length) < 20 ? " (very short)" : ""}
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={!onSelectLength}
                          onClick={() => onSelectLength?.(s.length)}
                        >
                          Try {s.length}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      )}
      <h3>Kasiski examination: repeated-group gaps</h3>
      <label class="field">
        Repeated group length
        <select value={size} onChange={(e) => setSize(Number(e.currentTarget.value))}>
          {[3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} letters
            </option>
          ))}
        </select>
      </label>
      <p class="hint">
        Measure the distance between the starts of consecutive copies of a group. Repeated words
        encrypted at the same key position can leave gaps divisible by the key length. Accidental
        repeats and overlapping groups also vote, so combine this with IC and readable output.
      </p>
      {repeats.length ? (
        <>
          <div class="table-scroll">
            <table>
              <caption>Factor votes from all consecutive repeated-group gaps</caption>
              <thead>
                <tr>
                  <th>Candidate length</th>
                  <th>Gaps divisible by it</th>
                  <th>Different groups</th>
                  <th>Try</th>
                </tr>
              </thead>
              <tbody>
                {votes
                  .filter((v) => v.votes > 0)
                  .map((v) => (
                    <tr key={v.length}>
                      <th>{v.length}</th>
                      <td>{v.votes}</td>
                      <td>{v.groups}</td>
                      <td>
                        <button
                          type="button"
                          disabled={!onSelectLength}
                          onClick={() => onSelectLength?.(v.length)}
                        >
                          Try {v.length}
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {!votes.some((v) => v.votes) && <p>No observed gap has a factor from 2 to 20.</p>}
          <details>
            <summary>Inspect repeated groups, positions and gaps</summary>
            <p class="small">
              Positions start at 1 and count A–Z letters only. Showing the first 30 groups; votes
              above use all {repeats.length}. At most 20 positions and gaps per row are shown.
              Length 1 divides every gap, so it is omitted from the votes.
            </p>
            <div class="table-scroll">
              <table>
                <caption>Repeated groups ordered by occurrence count</caption>
                <thead>
                  <tr>
                    <th>Group</th>
                    <th>Start positions</th>
                    <th>Consecutive gaps</th>
                  </tr>
                </thead>
                <tbody>
                  {repeats.slice(0, 30).map((r) => (
                    <tr key={r.group}>
                      <th class="mono">{r.group}</th>
                      <td>
                        {r.positions.slice(0, 20).join(", ")}
                        {r.positions.length > 20 ? ", …" : ""}
                      </td>
                      <td>
                        {r.gaps.slice(0, 20).join(", ")}
                        {r.gaps.length > 20 ? ", …" : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </>
      ) : (
        <p>
          No repeated {size}-letter groups. Try a longer message or a shorter group. No repeats does
          not rule out Vigenère.
        </p>
      )}
    </section>
  );
}
