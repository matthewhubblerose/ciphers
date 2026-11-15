import { CIPHER_NAMES, CIPHER_CLUES, CLUE_LABELS } from "../../data/cipherClues";
export default function CipherClueGrid({
  answers,
  onGuess,
  disabled = false,
}: {
  answers?: boolean[];
  onGuess?: (i: number) => void;
  disabled?: boolean;
}) {
  return (
    <div class="table-scroll clue-grid-scroll">
      <table class="cipher-cheatsheet clue-cheatsheet">
        <caption>
          {answers
            ? "Line up your observations with the cipher clues"
            : "Cipher clue cheat sheet: ✅ usually yes, ❌ usually no"}
        </caption>
        <thead>
          <tr>
            <th>Possible cipher</th>
            {CLUE_LABELS.map((l) => (
              <th key={l}>{l}</th>
            ))}
            {onGuess && <th>Your choice</th>}
          </tr>
        </thead>
        <tbody>
          {answers && (
            <tr class="observation-row">
              <th>Your observations</th>
              {answers.map((v, i) => (
                <td key={i}>{v ? "✅" : "❌"}</td>
              ))}
              {onGuess && <td>Compare below ↓</td>}
            </tr>
          )}
          {CIPHER_NAMES.map((name, i) => (
            <tr key={name}>
              <th>{name}</th>
              {CIPHER_CLUES[i].map((v, j) => (
                <td
                  key={j}
                  class={answers ? (answers[j] === v ? "clue-agrees" : "clue-differs") : ""}
                  aria-label={`${CLUE_LABELS[j]}: ${v ? "yes" : "no"}${answers ? (answers[j] === v ? ", agrees with your observation" : ", differs from your observation") : ""}`}
                >
                  {v ? "✅" : "❌"}
                </td>
              ))}
              {onGuess && (
                <td>
                  <button disabled={disabled} onClick={() => onGuess(i)}>
                    Choose {name}
                  </button>
                  <small>
                    {CIPHER_CLUES[i].filter((v, j) => v === answers?.[j]).length} of 5 clues agree
                  </small>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
