import { useEffect, useState } from "preact/hooks";
import { vigenere } from "../../utils/ciphers";
const cipher = vigenere("THECATSATTHECATRANTHECATHID", "MAP", false),
  positions = [1, 10, 19];
export default function KasiskiMini() {
  const [ready, setReady] = useState(false),
    [first, setFirst] = useState(1),
    [second, setSecond] = useState(10),
    [length, setLength] = useState(3);
  useEffect(() => setReady(true), []);
  const gap = Math.abs(second - first),
    selectedFits = gap % length === 0,
    allFit = 9 % length === 0;
  return (
    <section class="learning-lab" aria-label="Try a Kasiski gap">
      <fieldset class="lab-controls" disabled={!ready}>
        <h3>Count from the start of one FHT to the next</h3>
        <div class="table-scroll">
          <table class="clickable-cipher-grid">
            <caption>A short ciphertext with FHT at positions 1, 10 and 19</caption>
            <thead>
              <tr>
                <th>Position</th>
                {[...cipher].map((_, i) => (
                  <th key={i}>{i + 1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Cipher letter</th>
                {[...cipher].map((c, i) => (
                  <td
                    class={positions.some((p) => i + 1 >= p && i + 1 < p + 3) ? "active-row" : ""}
                    key={i}
                  >
                    {c}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Key position</th>
                {[...cipher].map((_, i) => (
                  <td key={i}>{(i % 3) + 1}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <div class="clue-grid">
          <label class="field">
            First repeated group starts at
            <select value={first} onChange={(e) => setFirst(Number(e.currentTarget.value))}>
              {positions.map((p) => (
                <option key={p} disabled={p === second} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label class="field">
            Second repeated group starts at
            <select value={second} onChange={(e) => setSecond(Number(e.currentTarget.value))}>
              {positions.map((p) => (
                <option key={p} disabled={p === first} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          Selected gap: <strong aria-label="Selected Kasiski gap">{gap}</strong> letters. Subtract
          the start positions, {Math.max(first, second)} − {Math.min(first, second)}. We measure
          start to start; we do not count only the letters in between.
        </p>
        <label class="field">
          Try a possible key length
          <input
            type="number"
            min={1}
            max={20}
            value={length}
            onInput={(e) => {
              const n = Math.max(1, Math.min(20, Math.trunc(Number(e.currentTarget.value) || 1)));
              e.currentTarget.value = String(n);
              setLength(n);
            }}
          />
        </label>
        <p role="status">
          {selectedFits
            ? `✅ ${length} divides this gap of ${gap} exactly (${gap} ÷ ${length} = ${gap / length}).`
            : `❌ ${length} does not divide ${gap} exactly.`}{" "}
          {allFit
            ? "It also divides both consecutive gaps of 9. It is a candidate to investigate."
            : "It does not divide the two consecutive gaps of 9, so it does not explain all the repeats."}
        </p>
        <p>
          Try key lengths 3 and 9: both explain the two gaps of 9. Now compare positions 1 and 19
          and try length 6. It fits that gap of 18, but misses the nearer gaps. This is why we
          collect several repeats instead of trusting one.
        </p>
      </fieldset>
    </section>
  );
}
