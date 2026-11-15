import { useEffect, useState } from "preact/hooks";
import { parseOrder, transpose } from "../../utils/ciphers";

export default function SpreadsheetLab() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [key, setKey] = useState("12345");
  const [row, setRow] = useState(1);
  const text = "SEMTLLVEEORTSET";
  let order: number[] = [],
    error = "";
  try {
    order = parseOrder(key, 5);
  } catch (e) {
    error = (e as Error).message;
  }
  return (
    <section class="learning-lab" aria-label="Five-column spreadsheet model">
      <h3>Try the five-column model</h3>
      <label class="field">
        Practice column order
        <input disabled={!ready} value={key} onInput={(e) => setKey(e.currentTarget.value)} />
      </label>
      <label class="field">
        Formula row
        <select
          disabled={!ready}
          value={row}
          onChange={(e) => setRow(Number(e.currentTarget.value))}
        >
          {[1, 2, 3].map((r) => (
            <option key={r} value={r}>
              Row {r}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p role="alert">{error}</p>
      ) : (
        <>
          <p>
            Cell A{row}: <code>{`=MID(Input!$A$3,${order[0] + 1}+(ROW()-1)*5,1)`}</code>
          </p>
          <p>
            Start at {order[0] + 1} + ({row} − 1) × 5 ={" "}
            <strong>{order[0] + 1 + (row - 1) * 5}</strong>. Read{" "}
            <strong>{text[order[0] + (row - 1) * 5]}</strong>.
          </p>
          <div class="table-scroll">
            <table>
              <caption>Reordered grid — each row reads left to right</caption>
              <thead>
                <tr>
                  {order.map((c) => (
                    <th key={c}>Col {c + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[0, 1, 2].map((r) => (
                  <tr key={r} class={r === row - 1 ? "active-row" : ""}>
                    {order.map((c) => (
                      <td class="mono" key={c}>
                        {text[r * 5 + c]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Joined answer:{" "}
            <output class="mono" aria-label="Spreadsheet model output">
              {transpose(text, order)}
            </output>
          </p>
          <p role="status">
            {key.replaceAll(",", "") === "52413"
              ? "You found it: LET’S MOVE LETTERS!"
              : "Look for a readable phrase. Each column must be used once."}
          </p>
        </>
      )}
    </section>
  );
}
