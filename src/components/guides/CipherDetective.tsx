import { useEffect, useState } from "preact/hooks";
import AnalysisVisual from "../decks/AnalysisVisual";
import FrequencyPlot from "../tools/FrequencyPlot";
import GroupChart from "../tools/GroupChart";
import {
  caesar,
  coincidence,
  keyedAlphabet,
  substitute,
  transpose,
  vigenere,
} from "../../utils/ciphers";
import { PRACTICE } from "../../utils/samples";
import type { VisualKind } from "../../data/decks";

const lessons: { name: string; visual?: VisualKind; clue: string; action: string }[] = [
  {
    name: "Caesar",
    visual: "caesar",
    clue: "The letter peaks keep their order, but slide around the alphabet. Every letter has the same shift. Groups such as THE move by that shift too.",
    action: "Try all 26 shifts. A readable passage using one shift is strong evidence.",
  },
  {
    name: "Substitution",
    visual: "substitution-groups",
    clue: "The letter names are shuffled. Ranked letter and group counts still have English-like peaks. A repeated group always stands for the same plaintext group.",
    action:
      "Try a consistent mapping for THE and check it in several places. Do the other groups and word patterns agree?",
  },
  {
    name: "Transposition",
    visual: "blocks",
    clue: "The actual letter labels and counts stay English-like. Many familiar bigrams and trigrams disappear because the neighbours have changed.",
    action:
      "Try a small grid. Keep the letters and change their positions. Check both the column order and the reading route.",
  },
  {
    name: "Vigenère",
    clue: "Several Caesar shifts are mixed together. Overall letter frequencies often look flatter; the usual letter, bigram and trigram patterns no longer line up consistently, even after ranking.",
    action:
      "Look for repeated-group gaps and peaks in average column Index of Coincidence. Then split the text into key positions and solve a Caesar shift in each.",
  },
];
const examples = [
  caesar(PRACTICE, 7, false),
  substitute(PRACTICE, keyedAlphabet("ORANGE"), false),
  transpose(PRACTICE, [4, 1, 3, 0, 2], true),
  vigenere(PRACTICE, "MAP", false),
];
export default function CipherDetective() {
  const [ready, setReady] = useState(false),
    [selected, setSelected] = useState(0),
    [mystery, setMystery] = useState(2),
    [guess, setGuess] = useState<number | null>(null);
  useEffect(() => setReady(true), []);
  const lesson = lessons[selected];
  return (
    <>
      <section class="learning-lab" aria-label="Explore cipher patterns">
        <h2>1. Compare four patterns</h2>
        <p>Choose a cipher. Watch what survives when the same original passage is enciphered.</p>
        <div class="choice-buttons" role="group" aria-label="Cipher pattern choices">
          {lessons.map((l, i) => (
            <button
              disabled={!ready}
              key={l.name}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              {l.name}
            </button>
          ))}
        </div>
        <h3>{lesson.name}: what to look for</h3>
        <p>{lesson.clue}</p>
        {lesson.visual ? (
          <div class="analysis-slide guide-animation">
            <AnalysisVisual key={selected} kind={lesson.visual} />
          </div>
        ) : (
          <>
            <FrequencyPlot text={examples[3]} />
            <GroupChart text={examples[3]} n={3} />
            <p>
              Whole-message IC: <strong>{coincidence(examples[3]).toFixed(4)}</strong>. The same
              original passage has IC {coincidence(PRACTICE).toFixed(4)}. IC measures how often two
              different positions hold the same letter.
            </p>
          </>
        )}
        <p class="guide-callout">
          <strong>Your next test: </strong>
          {lesson.action}
        </p>
      </section>
      <section class="learning-lab" aria-label="Mystery cipher practice">
        <h2>2. Make a prediction, then check it</h2>
        <p>
          These are original practice messages. Compare the letter labels, then the groups. Select
          the cipher you would test first.
        </p>
        <div class="choice-buttons" role="group" aria-label="Mystery selection">
          {[0, 1, 2, 3].map((i) => (
            <button
              disabled={!ready}
              key={i}
              aria-pressed={mystery === i}
              onClick={() => {
                setMystery(i);
                setGuess(null);
              }}
            >
              Mystery {i + 1}
            </button>
          ))}
        </div>
        <p class="cipher-excerpt mono">{examples[mystery].slice(0, 100)}…</p>
        <FrequencyPlot text={examples[mystery]} />
        <GroupChart text={examples[mystery]} n={2} />
        <div class="choice-buttons" role="group" aria-label="Identify the mystery">
          {lessons.map((l, i) => (
            <button disabled={!ready} key={l.name} onClick={() => setGuess(i)}>
              {l.name}
            </button>
          ))}
        </div>
        {guess !== null && (
          <p role="status">
            {guess === mystery
              ? `Yes: this example uses ${lessons[mystery].name}. ${lessons[mystery].action}`
              : `Try another clue. ${lessons[mystery].clue}`}
          </p>
        )}
        <button disabled={!ready} class="text-button" onClick={() => setGuess(mystery)}>
          Reveal the explanation
        </button>
      </section>
    </>
  );
}
