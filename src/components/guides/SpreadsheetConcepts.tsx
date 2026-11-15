import { useEffect, useState } from "preact/hooks";
const cipher = "SEMTLLVEEORTSET";
export default function SpreadsheetConcepts({ part }: { part: "mid" | "index" }) {
  const [ready, setReady] = useState(false),
    [text, setText] = useState("SEMTL"),
    [start, setStart] = useState(2),
    [count, setCount] = useState(1),
    [row, setRow] = useState(2),
    [col, setCol] = useState(1);
  useEffect(() => setReady(true), []);
  const index = col + (row - 2) * 5,
    result = text.slice(start - 1, start - 1 + count);
  return (
    <section
      class="learning-lab"
      aria-label={part === "mid" ? "Try the MID function" : "Explore grid positions"}
    >
      <fieldset class="lab-controls" disabled={!ready}>
        {part === "mid" ? (
          <>
            <h3>Try MID before typing it in your sheet</h3>
            <label class="field">
              Text to take letters from
              <input
                value={text}
                maxLength={30}
                onInput={(e) => setText(e.currentTarget.value.toUpperCase())}
              />
            </label>
            <div class="clue-grid">
              <label class="field">
                Start at character
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={start}
                  onInput={(e) =>
                    setStart(Math.max(1, Math.min(40, Number(e.currentTarget.value) || 1)))
                  }
                />
              </label>
              <label class="field">
                How many characters?
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={count}
                  onInput={(e) =>
                    setCount(Math.max(1, Math.min(30, Number(e.currentTarget.value) || 1)))
                  }
                />
              </label>
            </div>
            <div class="letter-buttons" aria-label="Choose MID starting character">
              {[...text].map((c, i) => (
                <button
                  key={i}
                  aria-label={`Start at character ${i + 1}, ${c}`}
                  aria-pressed={start === i + 1}
                  class={i >= start - 1 && i < start - 1 + count ? "active-row" : ""}
                  onClick={() => setStart(i + 1)}
                >
                  <small>{i + 1}</small>
                  {c === " " ? "␣" : c}
                </button>
              ))}
            </div>
            <p>
              <code>{`=MID(${JSON.stringify(text)},${start},${count})`}</code> gives{" "}
              <output aria-label="MID result" class="mono">
                {result || "(empty)"}
              </output>
              .
            </p>
            <p>
              Try start 5 and count 1: you get L. Now try start 2 and count 3: you get EMT. MID
              counts characters from 1, including spaces. It gives an empty answer when the start is
              beyond the text.
            </p>
          </>
        ) : (
          <>
            <h3>Which character belongs in this cell?</h3>
            <p>
              Click a cell. Our first row of letters is worksheet row 2, so it has zero complete
              rows before it.
            </p>
            <div class="table-scroll">
              <table>
                <caption>Character positions in a five-column grid</caption>
                <thead>
                  <tr>
                    <th>Worksheet row</th>
                    {[1, 2, 3, 4, 5].map((c) => (
                      <th key={c}>
                        {"ABCDE"[c - 1]} ({c})
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[2, 3, 4].map((r) => (
                    <tr key={r}>
                      <th>{r}</th>
                      {[1, 2, 3, 4, 5].map((c) => (
                        <td key={c}>
                          <button
                            class={row === r && col === c ? "active-row" : ""}
                            aria-label={`Worksheet row ${r}, column ${"ABCDE"[c - 1]}`}
                            onClick={() => {
                              setRow(r);
                              setCol(c);
                            }}
                          >
                            {c + (r - 2) * 5}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p class="guide-callout">
              Cell {"ABCDE"[col - 1]}
              {row}: {row - 2} complete rows × 5 letters, then {col} more = <strong>{index}</strong>
              . Character {index} is <strong>{cipher[index - 1]}</strong>.
            </p>
            <p>
              <code>{`=COLUMN()+(ROW()-2)*5`}</code> becomes <code>{`=${col}+(${row}-2)*5`}</code>{" "}
              in this cell. MID can use that answer as its start position.
            </p>
          </>
        )}
      </fieldset>
    </section>
  );
}
