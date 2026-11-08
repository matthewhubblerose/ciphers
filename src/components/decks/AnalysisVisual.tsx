import { useEffect, useId, useState } from "preact/hooks";
import type { VisualKind } from "../../data/decks";
import { ABC, frequencies, letters, mod, transpose } from "../../utils/ciphers";
import {
  ANALYSIS_TEXT,
  CAESAR_SHIFT,
  CAESAR_TEXT,
  decodedCaesar,
  letterPairs,
  repeatedAlphabet,
  shortChallenge,
  SUB_ALPHABET,
  SUB_TEXT,
  substitutionGroups,
  transpositionGroups,
  wordBigramPairs,
  type PlotPair,
} from "../../utils/deckAnalysis";
import { CHALLENGE_ORDER, CHALLENGE_SOURCE, CHALLENGE_TEXT } from "../../data/challenge";

export function ComparisonChart({
  rows,
  label = "Measured text",
  referenceLabel = "English reference",
  maximum = 16,
}: {
  rows: PlotPair[];
  label?: string;
  referenceLabel?: string;
  maximum?: number;
}) {
  const max = Math.max(maximum, ...rows.map((r) => Math.max(r.value, r.reference)));
  const step = 1040 / rows.length;
  return (
    <div class="deck-chart">
      <div class="deck-legend">
        <span>
          <i />
          {label}
        </span>
        <span>
          <i />
          {referenceLabel}
        </span>
        <small>Frequency % · scale 0–{max.toFixed(1)}</small>
      </div>
      <svg
        viewBox="0 0 1040 236"
        role="img"
        aria-label={`${label} compared with ${referenceLabel}`}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1="0" x2="1040" y1={180 - i * 43} y2={180 - i * 43} stroke="#dce1d5" />
            <text x="3" y={176 - i * 43} class="axis-value">
              {((max * i) / 4).toFixed(1)}
            </text>
          </g>
        ))}
        {rows.map((r, i) => (
          <g
            key={r.label}
            data-group={r.label}
            data-value={r.value.toFixed(4)}
            data-reference={r.reference.toFixed(4)}
          >
            <title>
              {label} {r.label}: {r.value.toFixed(2)}%; {referenceLabel} {r.referenceLabel}:{" "}
              {r.reference.toFixed(2)}%
            </title>
            <rect
              class="measured-rect"
              x={i * step + step * 0.16}
              y={180 - (r.value / max) * 170}
              width={step * 0.3}
              height={(r.value / max) * 170}
            />
            <rect
              class="reference-rect"
              x={i * step + step * 0.5}
              y={180 - (r.reference / max) * 170}
              width={step * 0.3}
              height={(r.reference / max) * 170}
            />
            <text class="measured-label" text-anchor="middle" x={i * step + step * 0.32} y="202">
              {r.label}
            </text>
            <text class="reference-label" text-anchor="middle" x={i * step + step * 0.66} y="224">
              {r.referenceLabel}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function TypingDemo({
  bigrams = false,
  staticView = false,
}: {
  bigrams?: boolean;
  staticView?: boolean;
}) {
  const [position, setPosition] = useState(staticView ? ANALYSIS_TEXT.length : 0),
    [playing, setPlaying] = useState(false),
    [speed, setSpeed] = useState(40),
    [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);
    const sync = () => {
      setReduced(query.matches);
      if (query.matches) setPlaying(false);
    };
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!playing || staticView) return;
    const timer = window.setInterval(
      () =>
        setPosition((p) => {
          if (p >= ANALYSIS_TEXT.length) {
            setPlaying(false);
            return p;
          }
          return p + 1;
        }),
      1000 / speed,
    );
    return () => clearInterval(timer);
  }, [playing, speed, staticView]);
  const current = ANALYSIS_TEXT.slice(0, position);
  return (
    <div class="analysis-visual typing-demo" data-position={position}>
      <div class="typing-preview" aria-label="Text entered so far">
        <span>{current.slice(-230) || "Press Play or Step to begin."}</span>
        {!staticView && (
          <span class="typing-cursor" aria-hidden="true">
            ▏
          </span>
        )}
      </div>
      <ComparisonChart
        rows={bigrams ? wordBigramPairs(current) : letterPairs(current)}
        label="Typed sample"
        maximum={bigrams ? 6 : 16}
      />
      {!staticView && (
        <div class="animation-controls" data-animation-controls>
          <button
            onClick={() => {
              if (position >= ANALYSIS_TEXT.length) setPosition(0);
              setPlaying(!playing);
            }}
            aria-pressed={playing}
          >
            {playing ? "Pause" : "Play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setPosition((p) => Math.min(ANALYSIS_TEXT.length, p + 1));
            }}
          >
            Step
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setPosition(0);
            }}
          >
            Replay
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setPosition(ANALYSIS_TEXT.length);
            }}
          >
            Show full text
          </button>
          <label>
            Speed
            <select
              aria-label="Typing speed"
              value={speed}
              onChange={(e) => setSpeed(Number(e.currentTarget.value))}
            >
              <option value={20}>Slow</option>
              <option value={40}>Normal</option>
              <option value={160}>Fast</option>
            </select>
          </label>
          <span>
            {letters(current).length} / {letters(ANALYSIS_TEXT).length} letters
          </span>
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
          ? "Reference: Norvig’s Google Books bigrams; this chart counts within words."
          : "Reference: typical English A–Z frequencies."}{" "}
        Samples vary; more text usually makes the pattern steadier.
        {reduced && !staticView
          ? " Reduced motion is enabled; use Step or the progress slider for manual control."
          : ""}
      </p>
    </div>
  );
}

function CaesarDemo({
  staticView = false,
  compact = false,
}: {
  staticView?: boolean;
  compact?: boolean;
}) {
  const [shift, setShift] = useState(staticView ? CAESAR_SHIFT : 0),
    [playing, setPlaying] = useState(false);
  const clip = useId().replace(/[^a-zA-Z0-9]/g, "");
  useEffect(() => {
    if (!playing || staticView) return;
    const timer = window.setInterval(
      () =>
        setShift((p) => {
          if (p >= CAESAR_SHIFT - 1) {
            setPlaying(false);
            return CAESAR_SHIFT;
          }
          return p + 1;
        }),
      900,
    );
    return () => clearInterval(timer);
  }, [playing, staticView]);
  const original = frequencies(ANALYSIS_TEXT),
    cipher = frequencies(CAESAR_TEXT),
    max = Math.max(16, ...original.map((f) => f.percent));
  return (
    <div class="analysis-visual caesar-demo" data-shift={shift}>
      <div class="deck-chart">
        <div class="deck-legend">
          <span>
            <i />
            Shifted ciphertext
          </span>
          <span>
            <i />
            Original English passage
          </span>
          <small>13 repeated letters · A–Z · 13 repeated letters</small>
        </div>
        <svg
          viewBox="0 0 1040 240"
          role="img"
          aria-label="Caesar histogram with thirteen repeated letters on each side"
        >
          <defs>
            <clipPath id={clip}>
              <rect x="0" y="0" width="1040" height="195" />
            </clipPath>
          </defs>
          <rect x="260" y="0" width="520" height="235" fill="#e6edd8" />
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2="1040" y1={180 - i * 50} y2={180 - i * 50} stroke="#cfd9c4" />
          ))}
          {repeatedAlphabet.map((letter, i) => (
            <g key={i} opacity={i < 13 || i >= 39 ? 0.42 : 1}>
              <rect
                class="reference-rect"
                x={i * 20 + 11}
                y={180 - (original[ABC.indexOf(letter)].percent / max) * 170}
                width="8"
                height={(original[ABC.indexOf(letter)].percent / max) * 170}
              />
              <text class="ribbon-label" text-anchor="middle" x={i * 20 + 10} y="213">
                {letter}
              </text>
            </g>
          ))}
          <g clip-path={`url(#${clip})`}>
            <g class="moving-bars" style={{ transform: `translateX(${-shift * 20}px)` }}>
              {Array.from({ length: 104 }, (_, i) => i - 39).map((i) => (
                <rect
                  key={i}
                  class="measured-rect"
                  x={(i + 13) * 20 + 2}
                  y={180 - (cipher[mod(i)].percent / max) * 170}
                  width="8"
                  height={(cipher[mod(i)].percent / max) * 170}
                />
              ))}
            </g>
          </g>
          <line x1="260" x2="260" y1="0" y2="235" stroke="#255d48" stroke-dasharray="4 4" />
          <line x1="780" x2="780" y1="0" y2="235" stroke="#255d48" stroke-dasharray="4 4" />
        </svg>
      </div>
      {!staticView && !compact && (
        <div class="animation-controls" data-animation-controls>
          <button
            onClick={() => {
              setShift(0);
              setPlaying(true);
            }}
          >
            Animate shifts
          </button>
          <button onClick={() => setPlaying(false)}>Pause</button>
          <button
            onClick={() => {
              setPlaying(false);
              setShift(mod(shift - 1));
            }}
          >
            ← One shift
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setShift(mod(shift + 1));
            }}
          >
            One shift →
          </button>
          <label>
            Shift <strong>{shift}</strong>
            <input
              aria-label="Caesar correction shift"
              type="range"
              min={0}
              max={25}
              value={shift}
              onInput={(e) => {
                setPlaying(false);
                setShift(Number(e.currentTarget.value));
              }}
            />
          </label>
        </div>
      )}
      <div
        class="decoded-preview"
        aria-label="Caesar decoded text"
        data-correct={shift === CAESAR_SHIFT}
      >
        {decodedCaesar(shift).slice(0, 155)}…
      </div>
      <p class="visual-note">
        {shift === CAESAR_SHIFT
          ? "Shift 7: the bars line up and the message is readable."
          : "One shared shift moves the complete pattern; bar heights do not change."}{" "}
        This controlled example compares the same passage before and after encryption.
      </p>
    </div>
  );
}

function SubstitutionDemo({ staticView = false }: { staticView?: boolean }) {
  const [ranked, setRanked] = useState(staticView);
  return (
    <div class="analysis-visual">
      <div class="deck-alphabet">
        <span>Plain {ABC}</span>
        <span>Cipher {SUB_ALPHABET}</span>
      </div>
      <ComparisonChart
        rows={letterPairs(SUB_TEXT, ranked, ANALYSIS_TEXT)}
        label="Ciphertext"
        referenceLabel="Original English"
      />
      {!staticView && (
        <label class="animation-controls" data-animation-controls>
          <input
            type="checkbox"
            checked={ranked}
            onChange={(e) => setRanked(e.currentTarget.checked)}
          />
          Order by frequency
        </label>
      )}
      <p class="visual-note">
        {ranked
          ? "Both lists are ranked independently. Heights match, but paired letter labels have changed."
          : "These replacements do not form a single Caesar rotation. Sort by frequency to compare the counts."}{" "}
        Keyphrase: ORANGE.
      </p>
    </div>
  );
}

function GroupComparison({ transposition = false }: { transposition?: boolean }) {
  return (
    <div class="analysis-visual">
      <div class="deck-group-pair">
        {[2, 3].map((n) => (
          <div key={n}>
            <h3>{n === 2 ? "Bigrams" : "Trigrams"}</h3>
            <ComparisonChart
              rows={transposition ? transpositionGroups(n) : substitutionGroups(n)}
              label="Ciphertext"
              referenceLabel="Original English"
              maximum={n === 2 ? 5 : 3}
            />
          </div>
        ))}
      </div>
      <p class="visual-note">
        {transposition
          ? "The same group labels are compared before and after restoring the Challenge excerpt. Letter counts are unchanged, but group counts differ."
          : "Each displayed cipher group is the ORANGE replacement of the English group beneath it. Its count is unchanged."}
      </p>
    </div>
  );
}

function BlocksDemo({ staticView = false }: { staticView?: boolean }) {
  const [reordered, setReordered] = useState(staticView);
  const order = reordered ? CHALLENGE_ORDER : [0, 1, 2, 3, 4];
  return (
    <div class="analysis-visual">
      <div
        class="animated-columns"
        aria-label="Five-column transposition grid"
        data-order={order.map((n) => n + 1).join("")}
      >
        {[0, 1, 2, 3, 4].map((col) => (
          <div
            class="animated-column"
            key={col}
            style={{ transform: `translateX(${order.indexOf(col) * 100}%)` }}
          >
            <strong>{col + 1}</strong>
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
      {!staticView && (
        <div class="animation-controls" data-animation-controls>
          <button onClick={() => setReordered(true)}>Reorder 5, 2, 4, 1, 3</button>
          <button onClick={() => setReordered(false)}>Reset columns</button>
        </div>
      )}
      <p class="visual-note">
        {reordered
          ? "Read the rows: MEET Z IN THE DINER. Apply the same order to every subsequent block."
          : "Start with the three five-letter blocks exactly as supplied."}{" "}
        Display groups are not word boundaries.
      </p>
    </div>
  );
}

function RoutesDemo({ staticView = false }: { staticView?: boolean }) {
  const [columnar, setColumnar] = useState(false);
  return (
    <div class="analysis-visual">
      <div class="route-example">
        <pre>{"Order: 5 3 1 2 4\n       E A W E R\n       O S D I C\n       D R V E E"}</pre>
        <div>
          <h3>{columnar ? "Read down columns ↓" : "Read across rows →"}</h3>
          <div class="decoded-preview">
            {transpose("WEAREDISCOVERED", [4, 2, 0, 1, 3], false, columnar)}
          </div>
          {!staticView && (
            <div class="animation-controls" data-animation-controls>
              <button aria-pressed={!columnar} onClick={() => setColumnar(false)}>
                Across rows
              </button>
              <button aria-pressed={columnar} onClick={() => setColumnar(true)}>
                Down columns
              </button>
            </div>
          )}
        </div>
      </div>
      <p class="visual-note">
        Both routes move existing letters. Their outputs differ even with the same grid and key.
      </p>
    </div>
  );
}

export default function AnalysisVisual({
  kind,
  staticView = false,
}: {
  kind: VisualKind;
  staticView?: boolean;
}) {
  if (kind === "typing-letters" || kind === "typing-bigrams")
    return <TypingDemo bigrams={kind === "typing-bigrams"} staticView={staticView} />;
  if (kind === "caesar" || kind === "caesar-clue")
    return (
      <CaesarDemo
        staticView={staticView || kind === "caesar-clue"}
        compact={kind === "caesar-clue"}
      />
    );
  if (kind === "substitution-letters") return <SubstitutionDemo staticView={staticView} />;
  if (kind === "substitution-groups") return <GroupComparison />;
  if (kind === "transposition-letters")
    return (
      <div class="analysis-visual">
        <ComparisonChart rows={letterPairs(CHALLENGE_TEXT)} label="Challenge 3 B" />
        <p class="visual-note">
          Counts already sit under English-like letter labels.{" "}
          <a href={CHALLENGE_SOURCE}>Challenge 3 Part B</a> · opening excerpt (
          {letters(CHALLENGE_TEXT).length} letters).
        </p>
      </div>
    );
  if (kind === "transposition-groups") return <GroupComparison transposition />;
  if (kind === "blocks") return <BlocksDemo staticView={staticView} />;
  if (kind === "routes") return <RoutesDemo staticView={staticView} />;
  return (
    <div class="analysis-visual">
      <table class="deck-summary">
        <thead>
          <tr>
            <th>Pattern</th>
            <th>Candidate</th>
            <th>Next test</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>English shape rotated along A–Z</td>
            <td>Caesar shift</td>
            <td>Try all 26 shifts</td>
          </tr>
          <tr>
            <td>Letter and group counts survive with new labels</td>
            <td>Substitution</td>
            <td>Test a consistent alphabet</td>
          </tr>
          <tr>
            <td>English-like letter labels; disrupted groups</td>
            <td>Transposition</td>
            <td>Reorder blocks or columns</td>
          </tr>
        </tbody>
      </table>
      <p class="visual-note">
        Use several clues and check for readable output. Short texts and combined ciphers can
        mislead.
      </p>
    </div>
  );
}
