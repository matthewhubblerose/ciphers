import { useEffect, useId, useState } from "preact/hooks";
import type { VisualKind } from "../../data/decks";
import { ABC, frequencies, mod } from "../../utils/ciphers";
import {
  ANALYSIS_TEXT,
  CAESAR_SHIFT,
  CAESAR_TEXT,
  decodedCaesar,
  repeatedAlphabet,
} from "../../utils/deckAnalysis";
import {
  TypingExample,
  SubstitutionExample,
  GroupExample,
  TranspositionLetters,
  BlockExample,
  PatternSummary,
  RouteExample,
  useMotion,
} from "./WorkedExamples";
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
  const motion = useMotion();
  useEffect(() => {
    setPlaying(motion && !staticView);
  }, [motion, staticView]);
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
      1500,
    );
    return () => clearInterval(timer);
  }, [playing, staticView]);
  const original = frequencies(ANALYSIS_TEXT),
    cipher = frequencies(CAESAR_TEXT),
    max = Math.max(16, ...original.map((f) => f.percent));
  return (
    <div class="analysis-visual caesar-demo" data-shift={shift}>
      <div class="caesar-working">
        <div>
          <span>Encrypted with shift +7</span>
          <code>{CAESAR_TEXT.slice(0, 64)}…</code>
        </div>
        <strong>Correction: −{shift}</strong>
        <div>
          <span>Follow the tallest bar</span>
          <code>
            L → {ABC[mod(11 - shift)]}
            {shift === 7 ? " = English E" : " · keep moving left"}
          </code>
        </div>
      </div>
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
                <g key={i}>
                  <rect
                    class="measured-rect"
                    x={(i + 13) * 20 + 2}
                    y={180 - (cipher[mod(i)].percent / max) * 170}
                    width="8"
                    height={(cipher[mod(i)].percent / max) * 170}
                  />
                  <text
                    x={(i + 13) * 20 + 6}
                    y="193"
                    text-anchor="middle"
                    class="cipher-ribbon-label"
                  >
                    {ABC[mod(i)]}
                  </text>
                </g>
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
      <div class="wrap-explanation">
        Left correction wraps at A: B → A → Z → Y. The faded sides repeat the same bars.
      </div>
      <div
        class="decoded-preview"
        aria-label="Caesar decoded text"
        data-correct={shift === CAESAR_SHIFT}
      >
        <span class="demo-label">
          {shift === 7 ? "Aligned bars · readable message" : "Current deciphered text"}
        </span>
        {decodedCaesar(shift).slice(0, 100)}…
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

export default function AnalysisVisual({
  kind,
  staticView = false,
}: {
  kind: VisualKind;
  staticView?: boolean;
}) {
  if (kind === "typing-letters" || kind === "typing-bigrams")
    return <TypingExample bigrams={kind === "typing-bigrams"} staticView={staticView} />;
  if (kind === "caesar" || kind === "caesar-clue")
    return (
      <CaesarDemo
        staticView={staticView || kind === "caesar-clue"}
        compact={kind === "caesar-clue"}
      />
    );
  if (kind === "substitution-letters") return <SubstitutionExample staticView={staticView} />;
  if (kind === "substitution-groups") return <GroupExample staticView={staticView} />;
  if (kind === "transposition-letters") return <TranspositionLetters staticView={staticView} />;
  if (kind === "transposition-groups")
    return <GroupExample transposition staticView={staticView} />;
  if (kind === "blocks") return <BlockExample staticView={staticView} />;
  if (kind === "routes") return <RouteExample staticView={staticView} />;
  return <PatternSummary />;
}
