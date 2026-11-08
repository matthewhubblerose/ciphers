import { useEffect, useRef, useState } from "preact/hooks";
import {
  ABC,
  caesar,
  coincidence,
  format,
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
import {
  ENGLISH_GROUPS,
  formatOutput,
  gapSummary,
  IC_HELP,
  keyColumn,
  type Spacing,
} from "../../utils/workbench";
import { SAMPLES } from "../../utils/samples";
import FrequencyPlot from "./FrequencyPlot";

const TOOLS = [
  ["frequency", "Frequency", "01"],
  ["ngrams", "Bigrams & trigrams", "02"],
  ["caesar", "Caesar shift", "03"],
  ["substitution", "Substitution", "04"],
  ["transposition", "Transposition", "05"],
  ["vigenere", "Vigenère", "06"],
];
type SubstitutionMode = "manual" | "decode" | "encode";
type Route = "blocks" | "columnar" | "undo-blocks" | "undo-columnar";

export default function Workbench() {
  const [tool, setTool] = useState("frequency"),
    [text, setText] = useState("");
  const [spacing, setSpacing] = useState<Spacing>("preserve"),
    [punctuation, setPunctuation] = useState(true),
    [uppercase, setUppercase] = useState(true);
  const [sort, setSort] = useState(false),
    [compare, setCompare] = useState(true),
    [gramSort, setGramSort] = useState(true);
  const [shift, setShift] = useState(7),
    [allShifts, setAllShifts] = useState(false);
  const [subMode, setSubMode] = useState<SubstitutionMode>("manual"),
    [phrase, setPhrase] = useState("ORANGE"),
    [alphabet, setAlphabet] = useState(keyedAlphabet("ORANGE")),
    [mapping, setMapping] = useState<Record<string, string>>({});
  const [size, setSize] = useState(5),
    [orderKey, setOrderKey] = useState("12345"),
    [route, setRoute] = useState<Route>("blocks"),
    [drag, setDrag] = useState<number | null>(null);
  const [vigKey, setVigKey] = useState("BOT"),
    [column, setColumn] = useState(0),
    [vigDecode, setVigDecode] = useState(true);
  const [message, setMessage] = useState(""),
    [sample, setSample] = useState(-1),
    [ready, setReady] = useState(false);
  const toolNav = useRef<HTMLElement>(null);
  useEffect(() => {
    const sync = () => {
      const hash = location.hash.slice(1);
      if (TOOLS.some(([id]) => id === hash)) setTool(hash);
    };
    sync();
    window.addEventListener("hashchange", sync);
    try {
      const saved = JSON.parse(localStorage.getItem("ciphers-workbench") || "null");
      if (typeof saved?.text === "string") setText(saved.text);
    } catch {
      /* Storage is optional. */
    }
    setReady(true);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("ciphers-workbench", JSON.stringify({ text }));
      } catch {
        /* Storage is optional. */
      }
    }
  }, [text, ready]);
  useEffect(() => {
    const nav = toolNav.current,
      selected = nav?.querySelector<HTMLElement>('[aria-current="page"]');
    if (nav && selected && nav.scrollWidth > nav.clientWidth)
      nav.scrollLeft +=
        selected.getBoundingClientRect().left -
        nav.getBoundingClientRect().left -
        (nav.clientWidth - selected.clientWidth) / 2;
  }, [tool]);
  const clean = letters(text),
    selectedColumn = Math.max(0, Math.min(column, vigKey.length - 1));
  const columnCipher = vigKey ? keyColumn(text, vigKey.length, selectedColumn) : "";
  const selectedShift = vigKey ? ABC.indexOf(vigKey[selectedColumn]) : 0;
  const shiftedColumn = caesar(columnCipher, selectedShift, vigDecode);
  const lengths = tool === "vigenere" ? keyLengths(text) : [],
    gaps = tool === "vigenere" ? gapSummary(text) : [];
  const display = (raw: string) =>
    formatOutput(raw, text, {
      spacing,
      keepPunctuation: punctuation,
      uppercase,
      preserveOutputCase: tool === "transposition",
    });
  let order: number[] = [],
    result = "",
    error = "";
  const reverseRoute = route.startsWith("undo-");
  try {
    if (tool === "caesar") result = caesar(clean, shift);
    if (tool === "substitution")
      result =
        subMode === "manual"
          ? [...clean].map((c) => mapping[c] || "·").join("")
          : substitute(clean, alphabet, subMode === "decode");
    if (tool === "transposition") {
      order = parseOrder(orderKey, size);
      result = transpose(text, order, reverseRoute, route.endsWith("columnar"), true);
    }
    if (tool === "vigenere") result = vigenere(clean, vigKey, vigDecode);
  } catch (e) {
    error = (e as Error).message;
  }
  const gridSource = reverseRoute ? result : text.replace(/[^A-Za-z]/g, "");
  const gridText = uppercase ? gridSource.toUpperCase() : gridSource;
  const gridOrder = reverseRoute ? Array.from({ length: order.length }, (_, i) => i) : order;
  function changeTool(id: string) {
    setTool(id);
    location.hash = id;
    setMessage("");
  }
  function move(from: number, to: number) {
    const next = [...order];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setOrderKey(next.map((n) => n + 1).join(","));
  }
  function updateVig(index: number, value: number) {
    const key = [...vigKey];
    key[index] = ABC[mod(value)];
    setVigKey(key.join(""));
    setColumn(index);
  }
  async function copy(value: string, description = "Output") {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${description} copied.`);
    } catch {
      setMessage("Clipboard unavailable. Select the text and copy it manually.");
    }
  }

  return (
    <div class="wrap workbench" aria-busy={!ready}>
      <aside class="tool-sidebar">
        <p class="eyebrow">TOOLS</p>
        <nav ref={toolNav} aria-label="Cipher tools">
          {TOOLS.map(([id, label, num]) => (
            <button
              key={id}
              type="button"
              class={tool === id ? "active" : ""}
              aria-current={tool === id ? "page" : undefined}
              disabled={!ready}
              onClick={() => changeTool(id)}
            >
              <span>{num}</span>
              {label}
              <b aria-hidden="true">↗</b>
            </button>
          ))}
        </nav>
        <div class="sidebar-tip">
          <p>Your text stays in place when you switch tools.</p>
          <a href={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/guides/`}>Read the guides →</a>
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
            class="message-input"
            disabled={!ready}
            value={text}
            onInput={(e) => {
              setText(e.currentTarget.value);
              setSample(-1);
            }}
            placeholder="Paste text here. Spaces between cipher blocks are ignored by analysis."
            spellcheck={false}
            rows={8}
          />
          <div class="input-footer">
            <div class="sample-control">
              <label for="sample">Try a practice cipher</label>
              <select
                id="sample"
                disabled={!ready}
                value={sample}
                onChange={(e) => {
                  const index = Number(e.currentTarget.value);
                  setSample(index);
                  if (index >= 0) setText(format(SAMPLES[index].text));
                }}
              >
                <option value={-1}>Choose an example…</option>
                {SAMPLES.map((s, i) => (
                  <option key={s.name} value={i}>
                    {s.name}
                  </option>
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
            <details>
              <summary>Practice solution</summary>
              <p>{SAMPLES[sample].answer}</p>
              <p>These are original practice texts.</p>
            </details>
          )}
        </section>
        <section class="analysis-panel">
          <div class="tool-title">
            <h2>{TOOLS.find((t) => t[0] === tool)?.[1]}</h2>
          </div>
          {(tool === "frequency" || tool === "ngrams") && (
            <div class="stats">
              <div>
                <strong>{clean.length}</strong>
                <span>Letter count</span>
              </div>
              <div>
                <strong>{new Set(clean).size}</strong>
                <span>Distinct letters</span>
              </div>
              <div>
                <strong>{coincidence(text).toFixed(4)}</strong>
                <span>
                  Index of Coincidence{" "}
                  <span class="info-tooltip">
                    <button
                      type="button"
                      class="info-button"
                      aria-label="About Index of Coincidence"
                      aria-describedby="ic-explanation"
                    >
                      ?
                    </button>
                    <span id="ic-explanation" role="tooltip">
                      {IC_HELP}
                    </span>
                  </span>
                </span>
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
                  />
                  Order by frequency
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={compare}
                    onChange={(e) => setCompare(e.currentTarget.checked)}
                  />
                  Compare with English
                </label>
              </div>
              <FrequencyPlot text={text} ranked={sort} compare={compare} />
            </>
          )}
          {tool === "ngrams" && (
            <>
              <p class="hint">
                Groups overlap, and cipher block spaces are ignored. AAAAA contains four AA bigrams
                and three AAA trigrams.
              </p>
              <label class="controls">
                <input
                  type="checkbox"
                  checked={gramSort}
                  onChange={(e) => setGramSort(e.currentTarget.checked)}
                />
                Order groups by frequency
              </label>
              {[2, 3].map((n) => {
                const cipher = ngrams(text, n).slice(0, 30);
                const english = [...ENGLISH_GROUPS[n]];
                if (!gramSort) {
                  cipher.sort((a, b) => a.gram.localeCompare(b.gram));
                  english.sort();
                }
                return (
                  <section class="ngram-panel" key={n}>
                    <h3>{n === 2 ? "Bigrams" : "Trigrams"}</h3>
                    <div class="table-scroll ngram-table">
                      <table>
                        <caption>
                          Top 30 {n === 2 ? "bigrams" : "trigrams"}: your text and English reference
                        </caption>
                        <thead>
                          <tr>
                            <th>{gramSort ? "Rank" : "Row"}</th>
                            <th>Ciphertext group</th>
                            <th>Count</th>
                            <th>Ciphertext %</th>
                            <th>English group</th>
                          </tr>
                        </thead>
                        <tbody>
                          {english.map((gram, i) => (
                            <tr key={gram}>
                              <td>{i + 1}</td>
                              <th class="mono">{cipher[i]?.gram || "—"}</th>
                              <td>{cipher[i]?.count ?? 0}</td>
                              <td>{(cipher[i]?.percent ?? 0).toFixed(2)}</td>
                              <td class="mono english-reference">{gram}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}
              <p class="hint">
                English reference:{" "}
                <a href="https://www.norvig.com/mayzner.html">
                  Peter Norvig’s Google Books analysis
                </a>
                , ranked within words. Your ciphertext counts include groups across removed word
                spaces, so ranks can differ. Alphabetical mode sorts each top-30 list separately.
              </p>
            </>
          )}
          {tool === "caesar" && (
            <>
              <div class="controls">
                <label for="shift">
                  Shift left by <strong>{shift}</strong>
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
                  class="short-input"
                  aria-label="Shift number"
                  type="number"
                  min={0}
                  max={25}
                  value={shift}
                  onInput={(e) => setShift(mod(Number(e.currentTarget.value)))}
                />
              </div>
              <p class="hint">
                A shift of 3 moves D → A. Use 23 for the opposite direction, A → D.
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
                    <button key={s} onClick={() => setShift(s)}>
                      <b>{s.toString().padStart(2, "0")}</b>
                      <span>{display(caesar(clean, s)) || "—"}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          {tool === "substitution" && (
            <>
              <label class="field">
                Substitution operation
                <select
                  aria-label="Substitution operation"
                  value={subMode}
                  onChange={(e) => setSubMode(e.currentTarget.value as SubstitutionMode)}
                >
                  <option value="manual">Solve by hand</option>
                  <option value="encode">Generate ciphertext</option>
                  <option value="decode">Decode with an alphabet</option>
                </select>
              </label>
              {subMode === "manual" ? (
                <>
                  <p class="hint">
                    Enter the plaintext letter beneath each ciphertext letter. Unsolved letters
                    appear as ·.
                  </p>
                  <div class="alphabet-grid">
                    {[...ABC].map((c) => (
                      <label key={c}>
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
                              e.currentTarget.value = mapping[c] || "";
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
                    The keyphrase is followed by unused A–Z letters. Plaintext letters map to the
                    ciphertext letters directly below them.
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
                  <div class="alphabet-scroll">
                    <table class="alphabet-reference">
                      <caption>Substitution alphabet</caption>
                      <tbody>
                        <tr>
                          <th>Plain</th>
                          {[...ABC].map((c) => (
                            <td key={c}>{c}</td>
                          ))}
                        </tr>
                        <tr>
                          <th>Cipher</th>
                          {[...ABC].map((_, i) => (
                            <td key={i}>{alphabet[i] || "·"}</td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
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
                      if (Number.isInteger(n) && n >= 2 && n <= 30)
                        setOrderKey(Array.from({ length: n }, (_, i) => i + 1).join(","));
                    }}
                  />
                </label>
                <label class="field">
                  Column order or word key
                  <input
                    value={orderKey}
                    onInput={(e) => setOrderKey(e.currentTarget.value)}
                    placeholder="52413 or HOTEL"
                  />
                </label>
                <label class="field">
                  Method
                  <select
                    aria-label="Method"
                    value={route}
                    onChange={(e) => setRoute(e.currentTarget.value as Route)}
                  >
                    <option value="blocks">Read across reordered rows</option>
                    <option value="columnar">Read down reordered columns</option>
                    <option value="undo-blocks">Reverse a known block key</option>
                    <option value="undo-columnar">Restore a columnar cipher</option>
                  </select>
                </label>
              </div>
              <p class="hint">
                52413 reads columns 5, 2, 4, 1, 3. HOTEL sorts E, H, L, O, T → 41523. Repeated key
                letters sort left to right. The default output reads the grid rows in their visible
                order.
              </p>
              {order.length > 0 && (
                <>
                  <p class="small">
                    Column order:{" "}
                    <strong class="mono">{order.map((n) => n + 1).join(" → ")}</strong>.{" "}
                    {reverseRoute
                      ? "The grid below shows the restored result. Use the key field to change the reconstruction."
                      : "Drag columns or use their arrows."}
                  </p>
                  <div
                    class="transpose-grid"
                    aria-label={reverseRoute ? "Restored text grid" : "Reordered input grid"}
                  >
                    {gridOrder.map((col, index) => (
                      <div
                        key={col}
                        class="transpose-column"
                        draggable={!reverseRoute}
                        onDragStart={(e) => {
                          setDrag(index);
                          e.dataTransfer?.setData("text/plain", String(index));
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (!reverseRoute && drag !== null) move(drag, index);
                          setDrag(null);
                        }}
                        onDragEnd={() => setDrag(null)}
                      >
                        <div class="column-header">
                          <span>COL {col + 1}</span>
                          {!reverseRoute && (
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
                          )}
                        </div>
                        {Array.from(
                          { length: Math.min(12, Math.ceil(gridText.length / size)) },
                          (_, row) => (
                            <span key={row} class="grid-cell">
                              {gridText[row * size + col] || "·"}
                            </span>
                          ),
                        )}
                      </div>
                    ))}
                  </div>
                  <p class="small muted">
                    First twelve rows shown.{" "}
                    {route === "columnar"
                      ? "Output reads down each visible column, from left to right."
                      : "Output reads each visible row, from left to right."}{" "}
                    Empty final cells are skipped.
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
                    maxLength={40}
                    placeholder="e.g. BOT"
                    onInput={(e) => {
                      setVigKey(letters(e.currentTarget.value).slice(0, 40));
                      setColumn(0);
                    }}
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
                <label class="field">
                  Key operation
                  <select
                    aria-label="Key operation"
                    value={vigDecode ? "subtract" : "add"}
                    onChange={(e) => setVigDecode(e.currentTarget.value === "subtract")}
                  >
                    <option value="subtract">Subtract shifts (decode)</option>
                    <option value="add">Add shifts (encode)</option>
                  </select>
                </label>
              </div>
              <p class="hint">
                A = 0, B = 1, …, Z = 25. BOT means shifts 1, 14, 19. Select a key position to
                inspect its letters.
              </p>
              <div class="key-characters">
                {[...vigKey].map((c, i) => (
                  <div
                    key={i}
                    class={selectedColumn === i ? "key-character active" : "key-character"}
                  >
                    <button
                      aria-label={`Select key position ${i + 1}`}
                      aria-pressed={selectedColumn === i}
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
              {vigKey && (
                <section class="column-analysis">
                  <h3>Key position {selectedColumn + 1}</h3>
                  <p class="hint">
                    Letters {selectedColumn + 1}, {selectedColumn + 1 + vigKey.length},{" "}
                    {selectedColumn + 1 + 2 * vigKey.length}, … use this key position. Adjust its
                    shift and compare the resulting histogram with English.
                  </p>
                  <div class="controls">
                    <label for="column-shift">
                      Selected key shift:{" "}
                      <strong>
                        {selectedShift} / {vigKey[selectedColumn]}
                      </strong>
                    </label>
                    <input
                      id="column-shift"
                      type="range"
                      min={0}
                      max={25}
                      value={selectedShift}
                      onInput={(e) => updateVig(selectedColumn, Number(e.currentTarget.value))}
                    />
                    <input
                      class="short-input"
                      aria-label="Selected shift number"
                      type="number"
                      min={0}
                      max={25}
                      value={selectedShift}
                      onInput={(e) => updateVig(selectedColumn, Number(e.currentTarget.value))}
                    />
                  </div>
                  <FrequencyPlot text={shiftedColumn} counts label="Shifted column" />
                  <div class="panel-heading">
                    <label for="column-ciphertext">
                      Key position {selectedColumn + 1} ciphertext
                    </label>
                    <button
                      class="text-button"
                      disabled={!columnCipher}
                      onClick={() => copy(columnCipher, "Column ciphertext")}
                    >
                      Copy column ciphertext
                    </button>
                  </div>
                  <textarea
                    id="column-ciphertext"
                    class="column-ciphertext"
                    readOnly
                    rows={2}
                    value={columnCipher}
                  />
                </section>
              )}
              <details>
                <summary>Possible key lengths</summary>
                <p class="hint">
                  Average Index of Coincidence for each candidate length. Peaks near English (about
                  0.066) are worth trying; random letters average about 0.038. Multiples can also
                  peak.
                </p>
                <div class="length-chart">
                  {lengths.map((k) => (
                    <button
                      key={k.length}
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
                  Select a length to start with A (shift 0) in each key position.
                </p>
              </details>
              <details>
                <summary>Repeated-group gaps</summary>
                <p class="hint">
                  The ten most frequent gaps between repeated trigrams. Gaps count letters, ignoring
                  spaces. A key length may divide several gaps; accidental repeats also occur.
                </p>
                {gaps.length ? (
                  <div class="table-scroll">
                    <table>
                      <caption>Repeated trigram gap summary</caption>
                      <thead>
                        <tr>
                          <th>Gap (letters)</th>
                          <th>Occurrences</th>
                          <th>Example groups</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gaps.map((g) => (
                          <tr key={g.gap}>
                            <th>{g.gap}</th>
                            <td>{g.count}</td>
                            <td class="mono">{g.groups}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No repeated trigrams yet.</p>
                )}
              </details>
            </>
          )}
          {!["frequency", "ngrams"].includes(tool) && (
            <>
              <div class="output-options">
                <label>
                  Spacing
                  <select
                    aria-label="Spacing"
                    value={spacing}
                    onChange={(e) => setSpacing(e.currentTarget.value as Spacing)}
                  >
                    <option value="preserve">Preserve</option>
                    <option value="blocks">Blocks of 5</option>
                    <option value="none">No spacing</option>
                  </select>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={punctuation}
                    onChange={(e) => setPunctuation(e.currentTarget.checked)}
                  />
                  Keep punctuation
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={uppercase}
                    onChange={(e) => setUppercase(e.currentTarget.checked)}
                  />
                  Uppercase <span class="muted">(off: preserve case)</span>
                </label>
              </div>
              {error && (
                <p class="error" role="alert">
                  {error}
                </p>
              )}
              <div class="panel-heading">
                <label for="cipher-output">Output</label>
                <button
                  class="text-button"
                  disabled={!result || !!error}
                  onClick={() => copy(display(result))}
                >
                  Copy output
                </button>
              </div>
              <textarea
                id="cipher-output"
                class="output"
                readOnly
                value={error ? "" : display(result)}
                placeholder="Result"
                rows={6}
              />
            </>
          )}
          <p class="status" role="status">
            {message}
          </p>
          {!clean && <p class="empty">Enter a message or choose a practice cipher.</p>}
        </section>
      </div>
    </div>
  );
}
