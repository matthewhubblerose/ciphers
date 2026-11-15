import { useEffect, useState } from "preact/hooks";
import { ABC, caesar, chiSquared, coincidence, letters, mod, vigenere } from "../../utils/ciphers";
import { cribKey } from "../../utils/vigenereAnalysis";
import { keyColumn } from "../../utils/workbench";
import { PRACTICE } from "../../utils/samples";
import FrequencyPlot from "../tools/FrequencyPlot";
import KeyLengthAnalysis from "../tools/KeyLengthAnalysis";

const shortPlain = "MEET AT THE OAK TREE";
const shortCipher = vigenere(shortPlain, "MAP", false);
const longCipher = vigenere(PRACTICE, "MAP", false);
export default function VigenereLab({ part }: { part: "play" | "crib" | "break" }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [text, setText] = useState(shortPlain),
    [key, setKey] = useState("MAP"),
    [decode, setDecode] = useState(false),
    [cursor, setCursor] = useState(0);
  const [crib, setCrib] = useState("MEET"),
    [start, setStart] = useState(0),
    [cribLength, setCribLength] = useState(3);
  const [solveKey, setSolveKey] = useState("AAA"),
    [slot, setSlot] = useState(0),
    [showAnswer, setShowAnswer] = useState(false);
  const clean = letters(text),
    safeKey = letters(key),
    out = safeKey ? vigenere(text, safeKey, decode, true) : "";
  const i = Math.min(cursor, Math.max(0, clean.length - 1));
  const shifts = cribKey(shortCipher, crib, start, cribLength);
  const stream = keyColumn(longCipher, solveKey.length, slot),
    shift = ABC.indexOf(solveKey[slot]);
  const ranked = Array.from({ length: 26 }, (_, s) => ({
    shift: s,
    score: chiSquared(caesar(stream, s)),
  })).sort((a, b) => a.score - b.score);
  function changeShift(n: number) {
    const next = [...solveKey];
    next[slot] = ABC[mod(n)];
    setSolveKey(next.join(""));
  }
  return (
    <section
      class="learning-lab"
      aria-label={
        part === "play"
          ? "Vigenère playground"
          : part === "crib"
            ? "Vigenère crib workshop"
            : "Vigenère breaking workshop"
      }
    >
      <fieldset class="lab-controls" disabled={!ready}>
        {part === "play" && (
          <>
            <h3>Move through the repeating shifts</h3>
            <label class="field">
              Playground message
              <textarea
                rows={3}
                value={text}
                onInput={(e) => {
                  setText(e.currentTarget.value);
                  setCursor(0);
                }}
              />
            </label>
            <label class="field">
              Playground key
              <input
                value={key}
                onInput={(e) => setKey(letters(e.currentTarget.value).slice(0, 20))}
                maxLength={20}
              />
            </label>
            <label class="field">
              Playground operation
              <select
                value={decode ? "decode" : "encode"}
                onChange={(e) => setDecode(e.currentTarget.value === "decode")}
              >
                <option value="encode">Encode: add shifts</option>
                <option value="decode">Decode: subtract shifts</option>
              </select>
            </label>
            {safeKey ? (
              <>
                <p>
                  Key length: <strong>{safeKey.length}</strong>. Shifts:{" "}
                  <strong class="mono">
                    {[...safeKey].map((c) => `${c}=${ABC.indexOf(c)}`).join(", ")}
                  </strong>
                  .
                </p>
                {clean.length > 0 && (
                  <>
                    <label class="field">
                      Inspect letter {i + 1}
                      <input
                        aria-label="Inspect message letter"
                        type="range"
                        min={0}
                        max={Math.max(0, clean.length - 1)}
                        value={i}
                        onInput={(e) => setCursor(Number(e.currentTarget.value))}
                      />
                    </label>
                    <p class="guide-callout">
                      Letter {i + 1}: {clean[i]} ({ABC.indexOf(clean[i])}) {decode ? "−" : "+"}{" "}
                      {safeKey[i % safeKey.length]} ({ABC.indexOf(safeKey[i % safeKey.length])}) ={" "}
                      {letters(out)[i]} ({ABC.indexOf(letters(out)[i])}), wrapping around 26. This
                      uses key position {(i % safeKey.length) + 1}.
                    </p>
                    <div class="table-scroll">
                      <table>
                        <caption>First 24 letters — spaces do not advance the key</caption>
                        <thead>
                          <tr>
                            <th>Position</th>
                            {[...clean.slice(0, 24)].map((_, j) => (
                              <th class={j === i ? "active-row" : ""} key={j}>
                                {j + 1}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th>Input</th>
                            {[...clean.slice(0, 24)].map((c, j) => (
                              <td key={j}>{c}</td>
                            ))}
                          </tr>
                          <tr>
                            <th>Key</th>
                            {[...clean.slice(0, 24)].map((_, j) => (
                              <td key={j}>{safeKey[j % safeKey.length]}</td>
                            ))}
                          </tr>
                          <tr>
                            <th>Output</th>
                            {[...letters(out).slice(0, 24)].map((c, j) => (
                              <td key={j}>{decode ? c.toLowerCase() : c}</td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
                <label class="field">
                  Playground output
                  <textarea readOnly rows={3} value={decode ? out.toLowerCase() : out} />
                </label>
              </>
            ) : (
              <p role="alert">Enter at least one A–Z letter in the key.</p>
            )}
          </>
        )}
        {part === "crib" && (
          <>
            <h3>Try a word you think might be there</h3>
            <p>
              This original message encodes a meeting instruction. Ciphertext:{" "}
              <strong class="mono">{shortCipher}</strong>. Suppose the message begins “MEET”. With
              A=0, cipher − guessed plain gives a key shift.
            </p>
            <label class="field">
              Guessed plaintext (crib)
              <input
                value={crib}
                onInput={(e) => {
                  setCrib(letters(e.currentTarget.value).slice(0, shortCipher.length));
                  setStart(0);
                }}
              />
            </label>
            <label class="field">
              Assumed key length
              <input
                type="number"
                min={1}
                max={10}
                value={cribLength}
                onInput={(e) =>
                  setCribLength(Math.max(1, Math.min(10, Number(e.currentTarget.value) || 1)))
                }
              />
            </label>
            <label class="field">
              Crib starts at letter {start + 1}
              <input
                aria-label="Crib starting position"
                type="range"
                min={0}
                max={Math.max(0, shortCipher.length - letters(crib).length)}
                value={start}
                onInput={(e) => setStart(Number(e.currentTarget.value))}
              />
            </label>
            <p>
              Key hypothesis:{" "}
              <output class="mono" aria-label="Crib key hypothesis">
                {shifts.key}
              </output>
              . ? means that position has no evidence yet.
            </p>
            {shifts.conflict ? (
              <p role="status">
                Conflict: two crib letters demand different shifts in the same key position. Change
                the word, alignment or assumed length.
              </p>
            ) : (
              <p role="status">
                No contradiction so far. This does not prove the guess: test it on the rest of the
                message.
              </p>
            )}
            <div class="table-scroll">
              <table>
                <caption>Crib calculation: subtract plaintext from ciphertext modulo 26</caption>
                <thead>
                  <tr>
                    <th>Letter position</th>
                    <th>Cipher</th>
                    <th>Crib</th>
                    <th>Shift</th>
                    <th>Key letter</th>
                    <th>Key position</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.rows.map((r) => (
                    <tr key={r.position}>
                      <th>{r.position}</th>
                      <td>{r.cipher}</td>
                      <td>{r.plain}</td>
                      <td>{r.shift}</td>
                      <td>{r.keyLetter}</td>
                      <td>{r.slot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!shifts.conflict && !shifts.key.includes("?") && (
              <p>
                Test that key:{" "}
                <output class="mono" aria-label="Crib decoded message">
                  {vigenere(shortCipher, shifts.key).toLowerCase()}
                </output>
                .
              </p>
            )}
            <p>
              Try length 2 with MEET: the key positions conflict. Try moving MEET along the
              ciphertext: a different alignment may fit a short crib by chance, so a readable full
              message matters.
            </p>
          </>
        )}
        {part === "break" && (
          <>
            <h3>Work a complete example</h3>
            <p>
              We encrypted the site’s original explorer story with a three-letter word. The full{" "}
              {longCipher.length}-letter ciphertext is below so you can investigate it
              independently.
            </p>
            <label class="field">
              Worked example ciphertext
              <textarea readOnly rows={4} value={longCipher} />
            </label>
            <p>
              Whole-message IC is {coincidence(longCipher).toFixed(4)}. Compare length 1 with
              lengths 3 and 6 below. The higher values at multiples of 3 suggest separating the text
              into three streams.
            </p>
            <KeyLengthAnalysis
              text={longCipher}
              onSelectLength={(n) => {
                setSolveKey("A".repeat(n));
                setSlot(0);
                setShowAnswer(false);
              }}
            />
            <h3>Now solve each stream as Caesar</h3>
            <p>
              Current key:{" "}
              <strong class="mono" aria-label="Workshop key">
                {solveKey}
              </strong>
              . With length 3, position 1 uses letters 1, 4, 7, …; position 2 uses 2, 5, 8, …;
              position 3 uses 3, 6, 9, …. All letters in a stream share one shift.
            </p>
            <label class="field">
              Inspect key position
              <select value={slot} onChange={(e) => setSlot(Number(e.currentTarget.value))}>
                {[...solveKey].map((_, j) => (
                  <option value={j} key={j}>
                    Position {j + 1}
                  </option>
                ))}
              </select>
            </label>
            <label class="field">
              Workshop Caesar shift: {shift} ({solveKey[slot]})
              <input
                aria-label="Workshop Caesar shift"
                type="range"
                min={0}
                max={25}
                value={shift}
                onInput={(e) => changeShift(Number(e.currentTarget.value))}
              />
            </label>
            <FrequencyPlot text={caesar(stream, shift)} label="Decoded stream" />
            <div class="choice-buttons" role="group" aria-label="Promising Caesar shifts">
              {ranked.slice(0, 3).map((r) => (
                <button key={r.shift} onClick={() => changeShift(r.shift)}>
                  Try {r.shift} ({ABC[r.shift]})
                </button>
              ))}
            </div>
            <p class="small">
              These suggestions have the lowest chi-squared differences from English letter
              frequencies. They help order your experiments; short or unusual texts may prefer the
              wrong shift.
            </p>
            <label class="field">
              Workshop decoded message
              <textarea readOnly rows={5} value={vigenere(longCipher, solveKey).toLowerCase()} />
            </label>
            <button
              onClick={() => {
                setSolveKey("AAA");
                setSlot(0);
                setShowAnswer(false);
              }}
            >
              Restart with three A shifts
            </button>{" "}
            <button
              onClick={() => {
                setShowAnswer(true);
                setSolveKey("MAP");
                setSlot(0);
              }}
            >
              Reveal worked solution
            </button>
            {showAnswer && (
              <p role="status">
                MAP means shifts 12, 0, 15. The opening reads “the other explorers were there”. The
                same key reads the entire story. Length 6 can also work as MAPMAP; its shortest
                repeating period is 3.
              </p>
            )}
          </>
        )}
      </fieldset>
    </section>
  );
}
