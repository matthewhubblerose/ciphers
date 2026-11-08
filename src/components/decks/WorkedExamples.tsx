import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks";
import { ComparisonChart } from "./ComparisonChart";
import { ABC, frequencies, letters, ngrams, transpose } from "../../utils/ciphers";
import {
  ANALYSIS_TEXT,
  CAESAR_TEXT,
  CHALLENGE_PLAIN,
  letterPairs,
  shortChallenge,
  SUB_ALPHABET,
  SUB_TEXT,
  substitutionGroups,
  transpositionGroups,
  wordBigramPairs,
  typingWindow,
  ROUTE_MESSAGE,
  ROUTE_ORDER,
} from "../../utils/deckAnalysis";
import { CHALLENGE_ORDER, CHALLENGE_SOURCE, CHALLENGE_TEXT } from "../../data/challenge";

export function useMotion() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setAllowed(!media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return allowed;
}

function TextPair({ plain, cipher }: { plain: string; cipher: string }) {
  return (
    <div class="example-text-pair">
      <div>
        <span>English passage</span>
        <p>{plain}</p>
      </div>
      <div>
        <span>Ciphertext</span>
        <p>{cipher}</p>
      </div>
    </div>
  );
}

export function TypingExample({
  bigrams = false,
  staticView = false,
}: {
  bigrams?: boolean;
  staticView?: boolean;
}) {
  const motion = useMotion();
  const textPanel = useRef<HTMLParagraphElement>(null);
  const [columns, setColumns] = useState(72);
  useLayoutEffect(() => {
    const panel = textPanel.current;
    if (!panel) return;
    const canvas = document.createElement("canvas"),
      ctx = canvas.getContext("2d");
    const measure = () => {
      if (!ctx) return;
      const style = getComputedStyle(panel);
      ctx.font = `${style.fontSize} ${style.fontFamily}`;
      const width = ctx.measureText("M").width;
      setColumns(Math.max(8, Math.floor((panel.clientWidth - width) / width)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    void document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, []);
  const [position, setPosition] = useState(staticView ? ANALYSIS_TEXT.length : 0);
  const [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(160);
  useEffect(() => {
    if (!staticView && matchMedia("(prefers-reduced-motion: reduce)").matches)
      setPosition(ANALYSIS_TEXT.length);
  }, [staticView]);
  useEffect(() => {
    setPlaying(motion && !staticView);
  }, [motion, staticView]);
  useEffect(() => {
    if (!playing || staticView) return;
    const timer = window.setInterval(
      () => setPosition((p) => Math.min(ANALYSIS_TEXT.length, p + 1)),
      1000 / speed,
    );
    return () => clearInterval(timer);
  }, [playing, staticView, speed]);
  useEffect(() => {
    if (position === ANALYSIS_TEXT.length) setPlaying(false);
  }, [position]);
  const current = ANALYSIS_TEXT.slice(0, position),
    clean = letters(current);
  const last = bigrams
    ? (current.match(/[A-Za-z]{2}$/)?.[0] ?? "")
    : (current.match(/[A-Za-z]$/)?.[0] ?? "");
  const rows = bigrams ? wordBigramPairs(current) : letterPairs(current);
  const focus = bigrams ? "TH" : "E",
    pair = rows.find((r) => r.label === focus)!;
  const count = bigrams
    ? (current.toUpperCase().match(/TH/g)?.length ?? 0)
    : clean.split("E").length - 1;
  const sample =
    position < 40
      ? "A few letters: the bars jump around."
      : position < 500
        ? "More words: familiar peaks begin to appear."
        : "A longer passage: the overall English pattern becomes clearer.";
  const textWindow = typingWindow(ANALYSIS_TEXT, position, columns);
  return (
    <div class="analysis-visual typing-demo" data-position={position} data-playing={playing}>
      <div class="live-reading">
        <div class="typed-passage">
          <span class="demo-label">
            English text arriving · {clean.length.toLocaleString()} letters
          </span>
          <p
            aria-label="Text entered so far"
            ref={textPanel}
            data-columns={columns}
            data-first-line={textWindow.firstLine}
          >
            {textWindow.lines.map((line) => {
              const highlight = Math.max(0, position - last.length - line.start);
              return (
                <span class="typing-line" data-line={line.index} key={line.index}>
                  {last && highlight < line.text.length ? (
                    <>
                      {line.text.slice(0, highlight)}
                      <mark>{line.text.slice(highlight)}</mark>
                    </>
                  ) : (
                    line.text
                  )}
                  {line.active && (
                    <b class="typing-cursor" aria-hidden="true">
                      ▍
                    </b>
                  )}
                </span>
              );
            })}
          </p>
        </div>
        <div class="count-explanation">
          <strong>{focus}</strong>
          <span>
            {count} {bigrams ? "pairs" : "letters"}
          </span>
          <b>{pair.value.toFixed(1)}%</b>
          <small>English reference {pair.reference.toFixed(1)}%</small>
        </div>
      </div>
      <ComparisonChart
        rows={rows}
        label="Text so far"
        maximum={bigrams ? 6 : 16}
        highlight={last}
      />
      <div class="demo-observation">
        <strong>{sample}</strong>
        <span>
          {bigrams
            ? "Watch TH and HE emerge as common pairs."
            : "E and T are often high. J, Q, X and Z are usually low."}
        </span>
      </div>
      {!staticView && (
        <div class="animation-controls" data-animation-controls>
          <button
            onClick={() => {
              if (position === ANALYSIS_TEXT.length) setPosition(0);
              setPlaying(!playing);
            }}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setPosition((p) => Math.min(p + 1, ANALYSIS_TEXT.length));
            }}
          >
            Step
          </button>
          <button
            onClick={() => {
              setPosition(0);
              setPlaying(motion);
            }}
          >
            Replay
          </button>
          {[25, 250, ANALYSIS_TEXT.length].map((n) => (
            <button
              key={n}
              onClick={() => {
                setPlaying(false);
                setPosition(n);
              }}
            >
              {n === ANALYSIS_TEXT.length ? "Show full text" : `${n} characters`}
            </button>
          ))}
          <label>
            Speed
            <select
              aria-label="Typing speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.currentTarget.value))}
            >
              <option value={40}>Slow</option>
              <option value={160}>Normal</option>
              <option value={320}>Fast</option>
            </select>
          </label>
          <input
            aria-label="Text progress"
            type="range"
            min={0}
            max={ANALYSIS_TEXT.length}
            value={position}
            onInput={(e) => {
              setPlaying(false);
              setPosition(Number(e.currentTarget.value));
            }}
          />
        </div>
      )}
      <p class="visual-note">
        {bigrams
          ? "Reference: Norvig’s Google Books pairs; this chart counts within words."
          : "Reference: typical English letter frequencies."}{" "}
        A sample approaches the overall pattern, not an exact match. The text panel shows the latest
        words; the chart counts the whole sample.
        {!motion && !staticView
          ? " Reduced motion is enabled; use Step or choose a sample size."
          : ""}
      </p>
    </div>
  );
}

export function SubstitutionExample({ staticView = false }: { staticView?: boolean }) {
  const motion = useMotion();
  const [ranked, setRanked] = useState(staticView);
  useEffect(() => {
    if (!motion || staticView) return;
    const timer = setTimeout(() => setRanked(true), 2600);
    return () => clearTimeout(timer);
  }, [motion, staticView]);
  const e = frequencies(ANALYSIS_TEXT)[4],
    replacement = SUB_ALPHABET[4];
  return (
    <div class="analysis-visual substitution-example" data-ranked={ranked}>
      <TextPair plain={ANALYSIS_TEXT.slice(0, 88)} cipher={SUB_TEXT.slice(0, 88)} />
      <div class="key-alphabet" aria-label="ORANGE substitution alphabet">
        <span>Plain</span>
        {[...ABC].map((c, i) => (
          <b key={c} class={c === "E" ? "focus-letter" : ""}>
            {c}
            <small>{SUB_ALPHABET[i]}</small>
          </b>
        ))}
        <span>Cipher</span>
      </div>
      <ComparisonChart
        rows={letterPairs(SUB_TEXT, ranked, ANALYSIS_TEXT)}
        label="Ciphertext"
        referenceLabel="Original English"
        highlight={replacement}
      />
      <div class="demo-observation">
        <strong>
          {ranked
            ? "Rank the counts: same heights, different letters."
            : "Alphabetical order: this does not look like one shared shift."}
        </strong>
        <span>
          Every E becomes {replacement}: {e.count} E letters become {e.count} {replacement} letters.
          Keyphrase ORANGE.
        </span>
      </div>
      {!staticView && (
        <div class="animation-controls" data-animation-controls>
          <label>
            <input
              type="checkbox"
              checked={ranked}
              onChange={(e) => setRanked(e.currentTarget.checked)}
            />
            Order by frequency
          </label>
          <button onClick={() => setRanked(false)}>Compare A–Z</button>
          <button onClick={() => setRanked(true)}>Animate frequency order</button>
        </div>
      )}
      <p class="visual-note">
        The orange bars use this same passage before encryption, so the count preservation is exact.
        For an unknown message, compare with typical English and test a consistent mapping.
      </p>
    </div>
  );
}

export function GroupExample({
  transposition = false,
  staticView = false,
}: {
  transposition?: boolean;
  staticView?: boolean;
}) {
  const motion = useMotion();
  const [restored, setRestored] = useState(false),
    [reveal, setReveal] = useState(staticView);
  const [explained, setExplained] = useState(staticView);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) setReveal(true);
  }, []);
  useEffect(() => {
    if (!motion || staticView) return;
    const timer = setTimeout(() => setReveal(true), 1400);
    return () => clearTimeout(timer);
  }, [motion, staticView]);
  const groups = (n: number) => {
    const rows = transposition ? transpositionGroups(n) : substitutionGroups(n);
    return rows.map((r) => ({
      ...r,
      value: transposition && restored ? r.reference : reveal ? r.value : 0,
    }));
  };
  const originalCount =
    ngrams(transposition ? CHALLENGE_PLAIN : ANALYSIS_TEXT, 3).find((g) => g.gram === "THE")
      ?.count ?? 0;
  const cipherGroup = transposition ? "THE" : "TCG";
  const cipherCount =
    ngrams(transposition ? CHALLENGE_TEXT : SUB_TEXT, 3).find((g) => g.gram === cipherGroup)
      ?.count ?? 0;
  return (
    <div class="analysis-visual group-example" data-restored={restored}>
      {transposition ? (
        <div class="challenge-strip">
          <span>Challenge 3 B · compare the common English groups</span>
          <p>{restored ? "MEETZ INTHE DINER ATBRE AKFAS…" : "TEZEM HNETI EIRND RTEBA AKSFA…"}</p>
        </div>
      ) : (
        <div class="group-mapping">
          <span class="group-token">THE</span>
          <b>becomes</b>
          <span class="group-token cipher-token">TCG</span>
          <span>
            {originalCount} occurrences before · {cipherCount} after
          </span>
        </div>
      )}
      <div class="deck-group-pair">
        {[2, 3].map((n) => (
          <div key={n}>
            <h3>
              {n === 2 ? "Bigrams" : "Trigrams"} ·{" "}
              {transposition ? "same labels" : "replacement labels"}
            </h3>
            <ComparisonChart
              rows={groups(n)}
              label={restored ? "Restored text" : "Ciphertext"}
              referenceLabel="Original English"
              maximum={n === 2 ? 5 : 3}
            />
          </div>
        ))}
      </div>
      <div class="demo-observation">
        <strong>
          {transposition
            ? restored
              ? "Restore the order: the common pairs and triples return."
              : "THE appeared " +
                originalCount +
                " times in the original, but only " +
                cipherCount +
                " times in the ciphertext."
            : "THE → TCG, TH → TC, HE → CG: the same alphabet explains every group."}
        </strong>
        <span>
          {transposition
            ? explained
              ? "The letters have been moved instead of replaced. This is called transposition."
              : "The letter counts looked English, but these group counts do not. What could explain that?"
            : "Substitution keeps neighbours together. Their names change, but their counts survive."}
        </span>
      </div>
      {!staticView && (
        <div class="animation-controls" data-animation-controls>
          {transposition ? (
            <>
              <button onClick={() => setExplained(true)}>Reveal explanation</button>
              <button
                onClick={() => {
                  setReveal(true);
                  setRestored(false);
                }}
              >
                Show scrambled groups
              </button>
              {explained && (
                <button
                  onClick={() => {
                    setReveal(true);
                    setRestored(true);
                  }}
                >
                  Restore the column order
                </button>
              )}
            </>
          ) : (
            <button onClick={() => setReveal(!reveal)}>
              {reveal ? "Hide cipher counts" : "Reveal cipher counts"}
            </button>
          )}
        </div>
      )}
      <p class="visual-note">
        {transposition
          ? "The orange bars show the original English passage; the green bars show the scrambled version of that same passage."
          : "Bars compare the same passage before and after ORANGE substitution; both label rows show the known replacements."}
      </p>
    </div>
  );
}

export function TranspositionLetters({ staticView = false }: { staticView?: boolean }) {
  return (
    <div class="analysis-visual transposition-letter-example" data-static={staticView}>
      <div class="challenge-strip">
        <span>
          <a href={CHALLENGE_SOURCE}>National Cipher Challenge · Challenge 3 B</a> ·{" "}
          {letters(CHALLENGE_TEXT).length} letters
        </span>
        <p>{CHALLENGE_TEXT.slice(0, 90)}</p>
      </div>
      <ComparisonChart rows={letterPairs(CHALLENGE_TEXT)} label="Challenge ciphertext" />
      <div class="demo-observation">
        <strong>The individual letters look familiar. Why can’t we read the message?</strong>
        <span>
          Have the letters changed, or have their positions changed? Check the neighbouring letters
          next.
        </span>
      </div>
      <p class="visual-note">
        Letter counts alone do not tell the whole story. The next comparison looks at pairs and
        triples.
      </p>
    </div>
  );
}

export function BlockExample({ staticView = false }: { staticView?: boolean }) {
  const motion = useMotion();
  const [step, setStep] = useState(staticView ? 3 : 0),
    [playing, setPlaying] = useState(false);
  useEffect(() => setPlaying(motion && !staticView), [motion, staticView]);
  useEffect(() => {
    if (!playing || staticView) return;
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, 3)), 1700);
    return () => clearInterval(timer);
  }, [playing, staticView]);
  useEffect(() => {
    if (step === 3) setPlaying(false);
  }, [step]);
  const orders = [[0, 1, 2, 3, 4], [4, 0, 1, 2, 3], [4, 1, 0, 2, 3], CHALLENGE_ORDER];
  const order = orders[step];
  const notes = [
    "Take each five-letter block as a row.",
    "Move original column 5 to the front.",
    "Put original column 2 second.",
    "Put original column 4 third. Read the rows.",
  ];
  return (
    <div class="analysis-visual block-example" data-step={step}>
      <div class="block-context">
        <span>As supplied</span>
        <code>TEZEM HNETI EIRND</code>
        <b>3 blocks of 5 letters</b>
      </div>
      <div
        class="animated-columns"
        aria-label="Five-column transposition grid"
        data-order={order.map((n) => n + 1).join("")}
      >
        {[0, 1, 2, 3, 4].map((col) => (
          <div
            class={`animated-column column-colour-${col}`}
            key={col}
            style={{ transform: `translateX(${order.indexOf(col) * 100}%)` }}
          >
            <strong>Column {col + 1}</strong>
            {[0, 1, 2].map((row) => (
              <span key={row}>{shortChallenge[row * 5 + col]}</span>
            ))}
          </div>
        ))}
      </div>
      <div class="decoded-preview" aria-label="Block transposition output">
        {transpose(shortChallenge, order)
          .match(/.{1,5}/g)
          ?.join(" ")}
      </div>
      <div class="demo-observation">
        <strong>{notes[step]}</strong>
        <span>
          {step === 3
            ? "MEET Z IN THE DINER. Apply exactly the same column order to every block."
            : "The coloured columns move as complete units, keeping every letter."}
        </span>
      </div>
      {!staticView && (
        <div class="animation-controls" data-animation-controls>
          <button
            onClick={() => {
              setStep(0);
              setPlaying(true);
            }}
          >
            Replay column moves
          </button>
          <button onClick={() => setPlaying(false)}>Pause</button>
          <button
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.min(s + 1, 3));
            }}
          >
            Step column move
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStep(3);
            }}
          >
            Reorder 5, 2, 4, 1, 3
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
          >
            Reset columns
          </button>
        </div>
      )}
      <p class="visual-note">
        Read left to right across each row, then continue on the next row. Five-letter display
        groups do not mark word boundaries.
      </p>
    </div>
  );
}

export function RouteExample({ staticView = false }: { staticView?: boolean }) {
  const motion = useMotion();
  const [phase, setPhase] = useState(staticView ? 2 : 0),
    [columnar, setColumnar] = useState(false),
    [position, setPosition] = useState(staticView ? 15 : 0),
    [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing || staticView) return;
    const timer = setInterval(() => setPosition((p) => Math.min(15, p + 1)), 400);
    return () => clearInterval(timer);
  }, [playing, staticView]);
  useEffect(() => {
    if (position === 15) setPlaying(false);
  }, [position]);
  const order = phase === 0 ? [0, 1, 2, 3, 4] : ROUTE_ORDER;
  const grid = transpose(ROUTE_MESSAGE, order);
  const route = Array.from({ length: 15 }, (_, i) =>
    columnar ? (i % 3) * 5 + Math.floor(i / 3) : i,
  );
  const output = route
    .slice(0, position)
    .map((i) => grid[i])
    .join("");
  const startRoute = (down: boolean) => {
    setPhase(2);
    setColumnar(down);
    setPosition(0);
    setPlaying(motion);
  };
  return (
    <div class="analysis-visual route-demonstration" data-phase={phase}>
      <ol class="route-steps">
        <li aria-current={phase === 0 ? "step" : undefined}>1. Write the message</li>
        <li aria-current={phase === 1 ? "step" : undefined}>2. Move the columns</li>
        <li aria-current={phase === 2 ? "step" : undefined}>3. Choose a reading route</li>
      </ol>
      <div class="route-layout">
        <div
          class="animated-columns route-columns"
          aria-label="Reading route grid"
          data-order={order.map((c) => c + 1).join("")}
        >
          {[0, 1, 2, 3, 4].map((col) => (
            <div
              key={col}
              class={"animated-column column-colour-" + col}
              style={{ transform: "translateX(" + order.indexOf(col) * 100 + "%)" }}
            >
              <strong>Column {col + 1}</strong>
              {[0, 1, 2].map((row) => {
                const index = row * 5 + order.indexOf(col),
                  readIndex = route.indexOf(index);
                return (
                  <span
                    key={row}
                    class={
                      phase === 2
                        ? (readIndex < position ? "route-read " : "") +
                          (route[position - 1] === index ? "route-current" : "")
                        : ""
                    }
                  >
                    {phase === 2 && <small>{readIndex + 1}</small>}
                    {ROUTE_MESSAGE[row * 5 + col]}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
        <div>
          <h3>
            {phase === 0
              ? "LET’S MOVE LETTERS"
              : phase === 1
                ? "Columns moved: 5, 3, 1, 2, 4"
                : columnar
                  ? "Read down each column ↓"
                  : "Read across each row →"}
          </h3>
          <p>
            {phase === 0
              ? "Read the rows: LETSM / OVELE / TTERS. This is our original 15-letter message."
              : phase === 1
                ? "Every coloured column keeps its three letters. Now choose how to collect them."
                : "Follow the numbered cells. Compare the results of the two reading routes."}
          </p>
          <div class="decoded-preview" aria-label="Reading route output">
            {phase === 0
              ? ROUTE_MESSAGE
              : phase === 1
                ? "Choose “Across rows” or “Down columns”"
                : output || "The letters will collect here…"}
          </div>
          {phase === 2 && <p class="route-count">{position} / 15 letters</p>}
        </div>
      </div>
      {!staticView && (
        <div class="animation-controls" data-animation-controls>
          <button
            onClick={() => {
              setPhase(0);
              setPosition(0);
              setPlaying(false);
            }}
          >
            Reset original grid
          </button>
          <button
            onClick={() => {
              setPhase(1);
              setPosition(0);
              setPlaying(false);
            }}
          >
            Reorder columns 5, 3, 1, 2, 4
          </button>
          <button
            disabled={phase === 0}
            aria-pressed={phase === 2 && !columnar}
            onClick={() => startRoute(false)}
          >
            Across rows
          </button>
          <button
            disabled={phase === 0}
            aria-pressed={phase === 2 && columnar}
            onClick={() => startRoute(true)}
          >
            Down columns
          </button>
          {phase === 2 && (
            <>
              <button onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setPosition((p) => Math.min(p + 1, 15));
                }}
              >
                Read one letter
              </button>
              <button
                onClick={() => {
                  setPlaying(false);
                  setPosition(15);
                }}
              >
                Show complete route
              </button>
            </>
          )}
        </div>
      )}
      {phase === 2 && (
        <div class="demo-observation">
          <strong>Same reordered grid, two possible ciphertexts</strong>
          <span>
            Across rows: {transpose(ROUTE_MESSAGE, ROUTE_ORDER)}
            <br />
            Down columns: {transpose(ROUTE_MESSAGE, ROUTE_ORDER, false, true)}
          </span>
        </div>
      )}
    </div>
  );
}

export function PatternSummary() {
  const mini = [
    {
      name: "Caesar shift",
      rows: letterPairs(CAESAR_TEXT),
      clue: "One whole pattern slides.",
      action: "Try a shared rotation.",
    },
    {
      name: "Substitution",
      rows: letterPairs(SUB_TEXT, true, ANALYSIS_TEXT),
      clue: "Counts survive under new labels.",
      action: "Test letter and group mappings.",
    },
    {
      name: "Transposition",
      rows: letterPairs(CHALLENGE_TEXT),
      clue: "Letters fit; neighbours do not.",
      action: "Try block and column orders.",
    },
  ];
  return (
    <div class="analysis-visual">
      <div class="pattern-summary">
        {mini.map((item) => (
          <div key={item.name}>
            <h3>{item.name}</h3>
            <ComparisonChart rows={item.rows} label="Sample" />
            <strong>{item.clue}</strong>
            <p>{item.action}</p>
          </div>
        ))}
      </div>
      <p class="visual-note">
        These patterns guide your next test. Check several clues, then confirm with readable text.
        Short messages and combined ciphers can be misleading.
      </p>
    </div>
  );
}
