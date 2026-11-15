import { useEffect, useState } from "preact/hooks";
import { transpose } from "../../utils/ciphers";
export default function SpreadsheetLab() {
  const [ready, setReady] = useState(false),
    [order, setOrder] = useState([0, 1, 2, 3, 4]),
    [drag, setDrag] = useState<number | null>(null);
  useEffect(() => setReady(true), []);
  const text = "SEMTLLVEEORTSET",
    answer = transpose(text, order);
  function move(from: number, to: number) {
    const next = [...order],
      removed = next.splice(from, 1)[0];
    next.splice(to, 0, removed);
    setOrder(next);
  }
  return (
    <section class="learning-lab" aria-label="Five-column spreadsheet model">
      <h3>Move the columns and read across</h3>
      <p>
        “LET’S MOVE LETTERS” has 15 letters after removing spaces and the apostrophe. They have been
        rearranged into three blocks of five. All the letters are still here. Can you put the same
        five columns in a different order so the three rows make sense?
      </p>
      <p>
        Drag a column by its heading, or use its left/right buttons. The colours and numbers travel
        with their columns.
      </p>
      <div class="transpose-grid lesson-transpose-grid">
        {order.map((c, i) => (
          <div
            class={`transpose-column lesson-column colour-${c}`}
            key={c}
            draggable={ready}
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (drag !== null) move(drag, i);
              setDrag(null);
            }}
            onDragEnd={() => setDrag(null)}
          >
            <div class="column-header">
              <b>COL {c + 1}</b>
              <div>
                <button
                  disabled={!ready || i === 0}
                  aria-label={`Move practice column ${c + 1} left`}
                  onClick={() => move(i, i - 1)}
                >
                  ←
                </button>
                <button
                  disabled={!ready || i === 4}
                  aria-label={`Move practice column ${c + 1} right`}
                  onClick={() => move(i, i + 1)}
                >
                  →
                </button>
              </div>
            </div>
            {[0, 1, 2].map((r) => (
              <span class="grid-cell" key={r}>
                {text[r * 5 + c]}
              </span>
            ))}
          </div>
        ))}
      </div>
      <p>
        Read left to right along row 1, then row 2, then row 3:{" "}
        <output class="mono" aria-label="Spreadsheet model output">
          {answer}
        </output>
      </p>
      <p role="status">
        {answer === "LETSMOVELETTERS"
          ? "🎉 You found it! LET’S MOVE LETTERS. The same column move worked in all three rows."
          : "Look for LETSM, then OVELE, then TTERS. Every column moves as a whole."}
      </p>
      <div class="choice-buttons">
        <button disabled={!ready} onClick={() => setOrder([0, 1, 2, 3, 4])}>
          Start again
        </button>
        <button disabled={!ready} onClick={() => setOrder([4, 1, 3, 0, 2])}>
          Show the working order
        </button>
      </div>
    </section>
  );
}
