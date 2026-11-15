import { useEffect, useState } from "preact/hooks";
import { ABC, mod } from "../../utils/ciphers";
const plain = "MEETBYTHEOLDOAK";
export default function ShiftSequenceLab({ part }: { part: "caesar" | "two" }) {
  const [ready, setReady] = useState(false),
    [first, setFirst] = useState(7),
    [second, setSecond] = useState(22),
    [selected, setSelected] = useState(2),
    [showKey, setShowKey] = useState(false);
  useEffect(() => setReady(true), []);
  const shifts = [...plain].map((_, i) => (part === "two" && i % 2 === 1 ? second : first)),
    cipher = [...plain].map((c, i) => ABC[mod(ABC.indexOf(c) + shifts[i])]).join("");
  return (
    <section
      class="learning-lab"
      aria-label={part === "caesar" ? "Caesar recap playground" : "Two alternating shifts"}
    >
      <fieldset class="lab-controls" disabled={!ready}>
        <h3>
          {part === "caesar"
            ? "Try one shift for every letter"
            : "Try alternating between two shifts"}
        </h3>
        <label class="field">
          {part === "caesar" ? "Caesar recap shift" : "Shift for letters 1, 3, 5, …"}
          <input
            type="number"
            min={0}
            max={25}
            value={first}
            onInput={(e) => {
              const n = Math.max(0, Math.min(25, Math.trunc(Number(e.currentTarget.value) || 0)));
              e.currentTarget.value = String(n);
              setFirst(n);
            }}
          />
        </label>
        {part === "two" && (
          <label class="field">
            Shift for letters 2, 4, 6, …
            <input
              type="number"
              min={0}
              max={25}
              value={second}
              onInput={(e) => {
                const n = Math.max(0, Math.min(25, Math.trunc(Number(e.currentTarget.value) || 0)));
                e.currentTarget.value = String(n);
                setSecond(n);
              }}
            />
          </label>
        )}
        <p>
          The message is “meet by the old oak”. We count its letters, leaving out spaces. Click a
          plaintext letter in the grid to follow its shift.
        </p>
        <div class="table-scroll">
          <table class="clickable-cipher-grid">
            <caption>
              Follow one letter through{" "}
              {part === "caesar" ? "a Caesar shift" : "the alternating shifts"}
            </caption>
            <thead>
              <tr>
                <th>Position</th>
                {[...plain].map((_, i) => (
                  <th class={selected === i ? "active-row" : ""} key={i}>
                    {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Plaintext</th>
                {[...plain].map((c, i) => (
                  <td key={i}>
                    <button
                      aria-label={`Inspect recap letter ${i + 1}, ${c.toLowerCase()}`}
                      aria-pressed={selected === i}
                      onClick={() => setSelected(i)}
                    >
                      {c.toLowerCase()}
                    </button>
                  </td>
                ))}
              </tr>
              <tr>
                <th>Shift</th>
                {shifts.map((s, i) => (
                  <td class={part === "two" ? (i % 2 ? "shift-even" : "shift-odd") : ""} key={i}>
                    {s}
                  </td>
                ))}
              </tr>
              <tr>
                <th>Ciphertext</th>
                {[...cipher].map((c, i) => (
                  <td key={i}>{c}</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        <p class="guide-callout">
          Letter {selected + 1} is <strong>{plain[selected].toLowerCase()}</strong>. Move it{" "}
          {shifts[selected]} places forward to get <strong>{cipher[selected]}</strong>.
          {part === "two"
            ? ` It uses the ${selected % 2 === 0 ? "first" : "second"} shift because its position is ${selected % 2 === 0 ? "odd" : "even"}.`
            : " To decode, move the ciphertext letter back by the same amount."}
        </p>
        <p>
          The two e’s at positions 2 and 3 become <strong>{cipher[1]}</strong> and{" "}
          <strong>{cipher[2]}</strong>.{" "}
          {cipher[1] === cipher[2]
            ? "They share a shift, so they share a replacement."
            : "The same plaintext letter has two different replacements because its key positions differ."}
        </p>
        {part === "two" && (
          <>
            <button aria-expanded={showKey} onClick={() => setShowKey(!showKey)}>
              Record these shifts with letters
            </button>
            {showKey && (
              <p class="guide-callout">
                Number the alphabet A=0, B=1, …, Z=25. {ABC[first]} stands for {first}, and{" "}
                {ABC[second]} stands for {second}. The two-letter key{" "}
                <strong>
                  {ABC[first]}
                  {ABC[second]}
                </strong>{" "}
                records the repeating shifts {first}, {second}, {first}, {second}, … . A key does
                not have to be a word, but a word can be easier to remember.
              </p>
            )}
          </>
        )}
        <p class="mono">
          Ciphertext:{" "}
          <output
            aria-label={part === "caesar" ? "Caesar recap output" : "Alternating shifts output"}
          >
            {cipher}
          </output>
        </p>
      </fieldset>
    </section>
  );
}
