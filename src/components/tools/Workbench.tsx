import { useEffect, useState } from "preact/hooks";
import {
  ABC,
  caesar,
  chiSquared,
  coincidence,
  format,
  frequencies,
  kasiski,
  keyedAlphabet,
  keyLengths,
  letters,
  mod,
  ngrams,
  parseOrder,
  substitute,
  transpose,
  vigenere,
} from "../../utils/ciphers";
import { SAMPLES } from "../../utils/samples";

const TOOLS = [
  ["frequency", "Frequency", "01"],
  ["ngrams", "Bigrams & trigrams", "02"],
  ["caesar", "Caesar shift", "03"],
  ["substitution", "Substitution", "04"],
  ["transposition", "Transposition", "05"],
  ["vigenere", "Vigenère", "06"],
];
const TITLES: Record<string, string> = {
  frequency: "Let the letters do the talking.",
  ngrams: "Look for letters that stick together.",
  caesar: "A different shift. A new possibility.",
  substitution: "Build the alphabet, one clue at a time.",
  transposition: "Same letters. Different arrangement.",
  vigenere: "One key. Several Caesar shifts.",
};

export default function Workbench() {
  const [tool, setTool] = useState("frequency");
  const [text, setText] = useState("");
  const [group, setGroup] = useState(5);
  const [lower, setLower] = useState(false);
  const [preserve, setPreserve] = useState(false);
  const [decrypt, setDecrypt] = useState(true);
  const [sort, setSort] = useState(false);
  const [compare, setCompare] = useState(true);
  const [shift, setShift] = useState(7);
  const [allShifts, setAllShifts] = useState(false);
  const [phrase, setPhrase] = useState("ORANGE");
  const [alphabet, setAlphabet] = useState(keyedAlphabet("ORANGE"));
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [manual, setManual] = useState(true);
  const [size, setSize] = useState(5);
  const [orderKey, setOrderKey] = useState("53124");
  const [columnar, setColumnar] = useState(false);
  const [drag, setDrag] = useState<number | null>(null);
  const [vigKey, setVigKey] = useState("BOT");
  const [column, setColumn] = useState(0);
  const [message, setMessage] = useState("");
  const [sample, setSample] = useState(-1);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      if (TOOLS.some(([id]) => id === hash)) setTool(hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    try {
      const saved = localStorage.getItem("ciphers-workbench");
      if (saved) {
        const state = JSON.parse(saved);
        if (typeof state.text === "string") setText(state.text);
      }
    } catch {
      /* Storage may be disabled. */
    }
    setReady(true);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("ciphers-workbench", JSON.stringify({ text }));
      } catch {
        /* Workbench still works without storage. */
      }
    }
  }, [text, ready]);
  const clean = letters(text);
  const display = (value: string) =>
    preserve && tool !== "transposition"
      ? lower
        ? value.toLowerCase()
        : value
      : format(value, group, lower);
  const changeTool = (id: string) => {
    setTool(id);
    location.hash = id;
    setMessage("");
  };
  let order: number[] = [],
    error = "",
    result = "";
  try {
    if (tool === "caesar") result = caesar(text, shift, decrypt, preserve);
    if (tool === "substitution")
      result =
        manual && decrypt
          ? [...text.toUpperCase()]
              .map((c) => (/[A-Z]/.test(c) ? mapping[c] || "·" : preserve ? c : ""))
              .join("")
          : substitute(text, alphabet, decrypt, preserve);
    if (tool === "transposition") {
      order = parseOrder(orderKey, size);
      result = transpose(text, order, decrypt, columnar);
    }
    if (tool === "vigenere") result = vigenere(text, vigKey, decrypt, preserve);
  } catch (e) {
    error = (e as Error).message;
  }
  const sorted = frequencies(text).sort((a, b) =>
    sort ? b.count - a.count || a.letter.localeCompare(b.letter) : a.letter.localeCompare(b.letter),
  );
  const maxFrequency = Math.max(14, ...sorted.map((f) => f.percent));
  const chosenColumn = [...clean]
    .filter((_, i) => i % Math.max(1, vigKey.length) === Math.min(column, vigKey.length - 1))
    .join("");
  const rankedShifts = Array.from({ length: 26 }, (_, s) => ({
    shift: s,
    score: chiSquared(caesar(chosenColumn, s)),
  })).sort((a, b) => a.score - b.score);
  function move(from: number, to: number) {
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrderKey(next.map((n) => n + 1).join(","));
  }
  function updateVig(index: number, shift: number) {
    const key = [...vigKey];
    key[index] = ABC[mod(shift)];
    setVigKey(key.join(""));
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(display(result));
      setMessage("Copied to clipboard.");
    } catch {
      setMessage("Clipboard unavailable. Select the output and copy it manually.");
    }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([display(result)], { type: "text/plain" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tool}-${decrypt ? "decoded" : "encoded"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div class="wrap workbench" aria-busy={!ready}>
      <aside class="tool-sidebar">
        <p class="eyebrow">YOUR TOOLKIT</p>
        <nav aria-label="Cipher tools">
          {TOOLS.map(([id, label, num]) => (
            <button
              type="button"
              class={tool === id ? "active" : ""}
              aria-current={tool === id ? "page" : undefined}
              onClick={() => changeTool(id)}
              disabled={!ready}
            >
              <span>{num}</span>
              {label}
              <b aria-hidden="true">↗</b>
            </button>
          ))}
        </nav>
        <div class="sidebar-tip">
          <span>KEEP EXPLORING</span>
          <p>Your message stays with you as you switch tools.</p>
          <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/guides/`}>
            Need a starting point? →
          </a>
        </div>
      </aside>
      <div class="tool-main">
        <section class="input-panel">
          <div class="panel-heading">
            <label for="cipher-input">Your message</label>
            <span class="mono muted">{clean.length} LETTERS</span>
          </div>
          <textarea
            id="cipher-input"
            disabled={!ready}
            value={text}
            onInput={(e) => {
              setText(e.currentTarget.value);
              setSample(-1);
            }}
            placeholder="Paste your ciphertext here. Five-letter groups are welcome."
            spellcheck={false}
            rows={5}
          />
          <div class="input-footer">
            <div class="sample-control">
              <label for="sample">Try a practice cipher</label>
              <select
                id="sample"
                disabled={!ready}
                value={sample}
                onChange={(e) => {
                  const n = Number(e.currentTarget.value);
                  setSample(n);
                  if (n >= 0) setText(format(SAMPLES[n].text));
                }}
              >
                <option value={-1}>Choose an example…</option>
                {SAMPLES.map((s, i) => (
                  <option value={i}>{s.name}</option>
                ))}
              </select>
            </div>
            <button
              class="text-button"
              onClick={() => {
                setText("");
                setSample(-1);
              }}
            >
              Clear text
            </button>
          </div>
          {sample >= 0 && (
            <details class="sample-answer">
              <summary>Practice solution</summary>
              <p>{SAMPLES[sample].answer}</p>
              <p>All examples are original classroom practice texts.</p>
            </details>
          )}
        </section>
        <section class="analysis-panel">
          <div class="tool-title">
            <p class="eyebrow">{TOOLS.find((t) => t[0] === tool)?.[1]}</p>
            <h2>{TITLES[tool]}</h2>
          </div>
          {(tool === "frequency" || tool === "ngrams") && (
            <div class="stats">
              <div>
                <strong>{clean.length}</strong>
                <span>letters</span>
              </div>
              <div>
                <strong>{new Set(clean).size}</strong>
                <span>distinct letters</span>
              </div>
              <div>
                <strong>{coincidence(text).toFixed(4)}</strong>
                <span>index of coincidence</span>
              </div>
            </div>
          )}
          {tool === "frequency" && (
            <>
              <div class="controls">
                <label>
                  <input
                    type="checkbox"
                    checked={sort}
                    onChange={(e) => setSort(e.currentTarget.checked)}
                  />{" "}
                  Order by frequency
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={compare}
                    onChange={(e) => setCompare(e.currentTarget.checked)}
                  />{" "}
                  Compare with English
                </label>
              </div>
              <div class="legend">
                <span>
                  <i class="cipher-swatch" />
                  Your text
                </span>
                {compare && (
                  <span>
                    <i class="english-swatch" />
                    Typical English
                  </span>
                )}
                <span>Frequency (%)</span>
              </div>
              <div class="chart-scroll">
                <div
                  class="frequency-chart"
                  role="img"
                  aria-label="Letter frequencies, with exact values in the table below"
                >
                  {sorted.map((f) => (
                    <div
                      class="chart-column"
                      title={`${f.letter}: ${f.count} letters, ${f.percent.toFixed(2)}%; English ${f.english}%`}
                    >
                      <div class="bar-track">
                        <div
                          class="bar"
                          style={{ height: `${(f.percent / maxFrequency) * 100}%` }}
                        />
                        {compare && (
                          <div
                            class="bar english-bar"
                            style={{ height: `${(f.english / maxFrequency) * 100}%` }}
                          />
                        )}
                      </div>
                      <span>{f.letter}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p class="hint">
                A Caesar shift rotates the English pattern along the alphabet. A substitution
                shuffles it. A transposition keeps the letter counts unchanged. These are clues, not
                proof.
              </p>
              <details>
                <summary>Exact counts & percentages</summary>
                <div class="table-scroll">
                  <table>
                    <caption>Letter frequencies</caption>
                    <thead>
                      <tr>
                        <th>Letter</th>
                        <th>Count</th>
                        <th>Your text %</th>
                        <th>English %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((f) => (
                        <tr>
                          <th>{f.letter}</th>
                          <td>{f.count}</td>
                          <td>{f.percent.toFixed(2)}</td>
                          <td>{f.english.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
          {tool === "ngrams" && (
            <>
              <p class="hint">
                Spaces and punctuation are ignored. Overlapping groups count: AAAAA contains four AA
                bigrams and three AAA trigrams.
              </p>
              <div class="two-col">
                {[2, 3].map((n) => (
                  <div>
                    <h3>{n === 2 ? "Bigrams" : "Trigrams"}</h3>
                    <p class="small muted">
                      English clues:{" "}
                      {n === 2 ? "TH · HE · IN · ER · AN" : "THE · AND · ING · HER · ERE"}
                    </p>
                    <table>
                      <caption>Top 20 {n === 2 ? "bigrams" : "trigrams"}</caption>
                      <thead>
                        <tr>
                          <th>Group</th>
                          <th>Count</th>
                          <th>%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ngrams(text, n)
                          .slice(0, 20)
                          .map((g) => (
                            <tr>
                              <th class="mono">{g.gram}</th>
                              <td>{g.count}</td>
                              <td>{g.percent.toFixed(2)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                    {clean.length < n && (
                      <p class="empty">Enter at least {n} letters to see groups.</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          {!["frequency", "ngrams"].includes(tool) && (
            <>
              <div class="mode-switch" aria-label="Cipher direction">
                <button
                  aria-pressed={decrypt}
                  class={decrypt ? "selected" : ""}
                  onClick={() => setDecrypt(true)}
                >
                  Decipher
                </button>
                <button
                  aria-pressed={!decrypt}
                  class={!decrypt ? "selected" : ""}
                  onClick={() => setDecrypt(false)}
                >
                  Generate ciphertext
                </button>
              </div>
              {tool === "caesar" && (
                <>
                  <div class="controls">
                    <label for="shift">
                      Shift{" "}
                      <strong>
                        {shift} / {ABC[shift]}
                      </strong>
                    </label>
                    <input
                      id="shift"
                      type="range"
                      min={0}
                      max={25}
                      value={shift}
                      onInput={(e) => setShift(Number(e.currentTarget.value))}
                    />
                    <button aria-label="Decrease shift" onClick={() => setShift(mod(shift - 1))}>
                      −
                    </button>
                    <button aria-label="Increase shift" onClick={() => setShift(mod(shift + 1))}>
                      +
                    </button>
                    <input
                      aria-label="Shift number"
                      class="short-input"
                      type="number"
                      min={0}
                      max={25}
                      value={shift}
                      onInput={(e) => setShift(mod(Number(e.currentTarget.value)))}
                    />
                  </div>
                  <p class="hint">
                    Encryption moves A forward by the shift. Deciphering reverses it. A shift of 7
                    turns A into H.
                  </p>
                  <button
                    class="secondary"
                    aria-expanded={allShifts}
                    onClick={() => setAllShifts(!allShifts)}
                  >
                    {allShifts ? "Hide" : "Show"} all 26 shifts
                  </button>
                  {allShifts && (
                    <div class="all-shifts">
                      {Array.from({ length: 26 }, (_, s) => (
                        <button onClick={() => setShift(s)}>
                          <b>{s.toString().padStart(2, "0")}</b>
                          <span>{display(caesar(text, s, decrypt, preserve)) || "—"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {tool === "substitution" && (
                <>
                  <label class="controls">
                    <input
                      type="checkbox"
                      checked={manual}
                      onChange={(e) => setManual(e.currentTarget.checked)}
                    />{" "}
                    Solve by hand (cipher letter → plaintext letter)
                  </label>
                  {manual && decrypt ? (
                    <>
                      <p class="hint">
                        Start with a guess. Unknown letters appear as ·. Each plaintext letter can
                        only be used once.
                      </p>
                      <div class="alphabet-grid">
                        {[...ABC].map((c) => (
                          <label>
                            <span>{c}</span>
                            <input
                              aria-label={`Plaintext for ${c}`}
                              maxLength={1}
                              value={mapping[c] || ""}
                              onInput={(e) => {
                                const value = letters(e.currentTarget.value);
                                if (
                                  value &&
                                  Object.entries(mapping).some(([k, v]) => k !== c && v === value)
                                ) {
                                  setMessage(
                                    `${value} is already assigned. Clear its other mapping first.`,
                                  );
                                  return;
                                }
                                setMapping({ ...mapping, [c]: value });
                                setMessage("");
                              }}
                            />
                          </label>
                        ))}
                      </div>
                      <button class="text-button" onClick={() => setMapping({})}>
                        Reset guesses
                      </button>
                      <div class="two-col">
                        {[2, 3].map((n) => (
                          <div>
                            <h4>Top {n === 2 ? "bigrams" : "trigrams"}</h4>
                            <div class="gram-chips">
                              {ngrams(text, n)
                                .slice(0, 8)
                                .map((g) => (
                                  <span class="mono">
                                    {g.gram} <small>×{g.count}</small>
                                  </span>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <label class="field">
                        Keyphrase
                        <input
                          value={phrase}
                          onInput={(e) => {
                            setPhrase(e.currentTarget.value);
                            setAlphabet(keyedAlphabet(e.currentTarget.value));
                          }}
                          placeholder="e.g. ORANGE"
                        />
                      </label>
                      <p class="hint">
                        Remove repeated letters from the keyphrase, then append unused letters A–Z.
                        The alphabet maps plaintext A–Z to ciphertext.
                      </p>
                      <label class="field">
                        Cipher alphabet (editable)
                        <input
                          class="mono"
                          value={alphabet}
                          onInput={(e) => setAlphabet(letters(e.currentTarget.value))}
                          maxLength={26}
                        />
                      </label>
                      <div class="alphabet-reference mono">
                        <span>Plain: {ABC}</span>
                        <span>Cipher: {alphabet}</span>
                      </div>
                    </>
                  )}
                </>
              )}
              {tool === "transposition" && (
                <>
                  <div class="controls">
                    <label class="field">
                      Block size / columns
                      <input
                        type="number"
                        min={2}
                        max={30}
                        value={size}
                        onInput={(e) => {
                          const n = Number(e.currentTarget.value);
                          setSize(n);
                          if (n >= 2 && n <= 30)
                            setOrderKey(Array.from({ length: n }, (_, i) => i + 1).join(","));
                        }}
                      />
                    </label>
                    <label class="field">
                      Column order or word key
                      <input
                        value={orderKey}
                        onInput={(e) => setOrderKey(e.currentTarget.value)}
                        placeholder="53124 or HOTEL"
                      />
                    </label>
                    <label class="field">
                      Method
                      <select
                        aria-label="Method"
                        value={columnar ? "columnar" : "blocks"}
                        onChange={(e) => setColumnar(e.currentTarget.value === "columnar")}
                      >
                        <option value="blocks">Reorder each block</option>
                        <option value="columnar">Columnar: read down columns</option>
                      </select>
                    </label>
                  </div>
                  <p class="hint">
                    53124 reads columns 5, 3, 1, 2, 4. HOTEL sorts E, H, L, O, T → 41523. Repeated
                    key letters sort left to right. Decipher reverses this order; generation applies
                    it. No padding is added.
                  </p>
                  {order.length > 0 && (
                    <>
                      <p class="small">
                        Read order:{" "}
                        <strong class="mono">{order.map((n) => n + 1).join(" → ")}</strong>. Drag a
                        column or use its arrow buttons.
                      </p>
                      <div class="transpose-grid">
                        {order.map((col, index) => (
                          <div
                            class="transpose-column"
                            draggable
                            onDragStart={(e) => {
                              setDrag(index);
                              e.dataTransfer?.setData("text/plain", String(index));
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (drag !== null) move(drag, index);
                              setDrag(null);
                            }}
                            onDragEnd={() => setDrag(null)}
                          >
                            <div class="column-header">
                              <span>COL {col + 1}</span>
                              <div>
                                <button
                                  aria-label={`Move column ${col + 1} left`}
                                  disabled={index === 0}
                                  onClick={() => move(index, index - 1)}
                                >
                                  ←
                                </button>
                                <button
                                  aria-label={`Move column ${col + 1} right`}
                                  disabled={index === order.length - 1}
                                  onClick={() => move(index, index + 1)}
                                >
                                  →
                                </button>
                              </div>
                            </div>
                            {Array.from(
                              { length: Math.min(8, Math.ceil(clean.length / size)) },
                              (_, r) => (
                                <span class="grid-cell">{clean[r * size + col] || "·"}</span>
                              ),
                            )}
                          </div>
                        ))}
                      </div>
                      <p class="small muted">
                        Grid previews the first eight rows of the input written across. In decipher
                        mode, output reverses the selected encryption order.
                      </p>
                    </>
                  )}
                </>
              )}
              {tool === "vigenere" && (
                <>
                  <div class="controls">
                    <label class="field">
                      Key
                      <input
                        value={vigKey}
                        onInput={(e) => {
                          setVigKey(letters(e.currentTarget.value).slice(0, 40));
                          setColumn(0);
                        }}
                        placeholder="e.g. BOT"
                        maxLength={40}
                      />
                    </label>
                    <label class="field">
                      Key length
                      <input
                        type="number"
                        min={1}
                        max={40}
                        value={vigKey.length || 1}
                        onInput={(e) => {
                          const n = Math.max(1, Math.min(40, Number(e.currentTarget.value) || 1));
                          setVigKey(vigKey.padEnd(n, "A").slice(0, n));
                          setColumn(0);
                        }}
                      />
                    </label>
                  </div>
                  <p class="hint">
                    A = 0, B = 1, …, Z = 25. BOT means shifts 1, 14, 19. Spaces and punctuation
                    never advance the key.
                  </p>
                  <div class="key-characters">
                    {[...vigKey].map((c, i) => (
                      <div class={column === i ? "key-character active" : "key-character"}>
                        <button
                          aria-label={`Analyse key character ${i + 1}`}
                          onClick={() => setColumn(i)}
                        >
                          #{i + 1} <b>{c}</b>
                        </button>
                        <div>
                          <button
                            aria-label={`Decrease key character ${i + 1}`}
                            onClick={() => updateVig(i, ABC.indexOf(c) - 1)}
                          >
                            −
                          </button>
                          <span>{ABC.indexOf(c)}</span>
                          <button
                            aria-label={`Increase key character ${i + 1}`}
                            onClick={() => updateVig(i, ABC.indexOf(c) + 1)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <details open>
                    <summary>Investigate key lengths</summary>
                    <p class="hint">
                      Average index of coincidence within each possible set of columns. English is
                      often around 0.066; random letters around 0.038. Peaks and their multiples are
                      candidates, not certainties. Use a few hundred letters for stronger evidence.
                    </p>
                    <div class="length-chart">
                      {keyLengths(text).map((k) => (
                        <button
                          style={{ "--score": `${Math.min(100, (k.ic / 0.12) * 100)}%` }}
                          title={`Length ${k.length}: ${k.ic.toFixed(4)}`}
                          onClick={() => {
                            setVigKey("A".repeat(k.length));
                            setColumn(0);
                          }}
                        >
                          <span>{k.ic.toFixed(3)}</span>
                          <i />
                          <b>{k.length}</b>
                        </button>
                      ))}
                    </div>
                    <p class="small muted">
                      Click a candidate to start that length with all shifts at A (0).
                    </p>
                    <details>
                      <summary>Repeated trigrams (Kasiski clues)</summary>
                      <p class="small">
                        Distances between repeats may be multiples of the key length. Positions
                        start at 1; accidental repeats are common.
                      </p>
                      {kasiski(text).map((k) => (
                        <p class="mono small">
                          {k.gram}: positions {k.positions.map((p) => p + 1).join(", ")}; gaps{" "}
                          {k.gaps.join(", ")}
                        </p>
                      ))}
                      {!kasiski(text).length && <p>No repeated trigrams yet.</p>}
                    </details>
                  </details>
                  {vigKey && (
                    <details open>
                      <summary>Analyse key character {Math.min(column + 1, vigKey.length)}</summary>
                      <p class="hint">
                        This column has {chosenColumn.length} letters. Try one of the lowest
                        chi-squared scores against English, then read the full message to check.
                        Short samples can mislead.
                      </p>
                      <div class="shift-suggestions">
                        {rankedShifts.slice(0, 5).map((s) => (
                          <button
                            onClick={() => updateVig(Math.min(column, vigKey.length - 1), s.shift)}
                          >
                            {ABC[s.shift]} / {s.shift}
                            <small>χ² {Number.isFinite(s.score) ? s.score.toFixed(1) : "—"}</small>
                          </button>
                        ))}
                      </div>
                      <p class="mono column-preview">
                        {format(
                          caesar(
                            chosenColumn,
                            ABC.indexOf(vigKey[Math.min(column, vigKey.length - 1)]),
                          ),
                          5,
                          true,
                        ) || "Your selected column will appear here."}
                      </p>
                    </details>
                  )}
                </>
              )}
              <div class="output-options">
                <label>
                  Output grouping
                  <select value={group} onChange={(e) => setGroup(Number(e.currentTarget.value))}>
                    <option value={0}>Continuous</option>
                    <option value={5}>Blocks of 5</option>
                    <option value={10}>Blocks of 10</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={lower}
                    onChange={(e) => setLower(e.currentTarget.checked)}
                  />{" "}
                  Lowercase output
                </label>
                {tool !== "transposition" && (
                  <label>
                    <input
                      type="checkbox"
                      checked={preserve}
                      onChange={(e) => setPreserve(e.currentTarget.checked)}
                    />{" "}
                    Keep original spacing & punctuation
                  </label>
                )}
              </div>
              {preserve && tool !== "transposition" && (
                <p class="small muted">
                  Original spacing overrides output grouping. Disable it to remove cipher block
                  spaces.
                </p>
              )}
              {error && (
                <p role="alert" class="error">
                  {error}
                </p>
              )}
              <div class="panel-heading">
                <label for="cipher-output">
                  {decrypt ? "Deciphered text" : "Generated ciphertext"}
                </label>
                <div class="actions">
                  <button class="text-button" disabled={!result || !!error} onClick={copy}>
                    Copy
                  </button>
                  <button class="text-button" disabled={!result || !!error} onClick={download}>
                    Download .txt
                  </button>
                </div>
              </div>
              <textarea
                id="cipher-output"
                class="output"
                readOnly
                value={error ? "" : display(result)}
                placeholder="Your result appears here as you work."
                rows={5}
              />
              <button
                class="secondary"
                disabled={!result || !!error}
                onClick={() => {
                  setText(display(result));
                  setSample(-1);
                  setMessage("Output is now your input. Choose another tool to continue.");
                }}
              >
                Use output as input →
              </button>
            </>
          )}
          <p class="status" role="status">
            {message}
          </p>
          {!clean && (
            <p class="empty">Start with your own message, or choose a practice cipher above.</p>
          )}
        </section>
      </div>
    </div>
  );
}
