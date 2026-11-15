import { useEffect, useState } from "preact/hooks";
import AnalysisVisual from "../decks/AnalysisVisual";
import FrequencyPlot from "../tools/FrequencyPlot";
import GroupChart from "../tools/GroupChart";
import CipherClueGrid from "./CipherClueGrid";
import {
  caesar,
  coincidence,
  keyedAlphabet,
  substitute,
  transpose,
  vigenere,
} from "../../utils/ciphers";
import { PRACTICE } from "../../utils/samples";
import { CIPHER_NAMES, CIPHER_CLUES, QUESTIONS } from "../../data/cipherClues";

const examples = [
  caesar(PRACTICE, 7, false),
  substitute(PRACTICE, keyedAlphabet("ORANGE"), false),
  transpose(PRACTICE, [4, 1, 3, 0, 2], true),
  vigenere(PRACTICE, "MAP", false),
];
const nextTests = [
  "Try each Caesar shift and read more than just the opening.",
  "Test one consistent group mapping, such as a candidate for THE, in several places.",
  "Try a grid and move the columns. Check how the letters are read from the grid.",
  "Compare Kasiski gaps and IC scores for candidate key lengths, then split the message into Caesar streams.",
];
export default function CipherDetective() {
  const [ready, setReady] = useState(false),
    [selected, setSelected] = useState(0),
    [mystery, setMystery] = useState(2),
    [answers, setAnswers] = useState<(boolean | null)[]>(Array(5).fill(null)),
    [guess, setGuess] = useState<number | null>(null),
    [hint, setHint] = useState(false),
    [ranked, setRanked] = useState(false);
  useEffect(() => setReady(true), []);
  const question = answers.findIndex((v) => v === null),
    complete = question === -1;
  function answer(value: boolean) {
    const next = [...answers];
    next[question] = value;
    setAnswers(next);
    setHint(false);
    setGuess(null);
  }
  function reset() {
    setAnswers(Array(5).fill(null));
    setGuess(null);
    setHint(false);
  }
  return (
    <>
      <section class="learning-lab" aria-label="Explore cipher patterns">
        <h2>Explore what each cipher changes</h2>
        <p>
          We have encrypted the same longer English passage in four different ways. Choose one, then
          compare its letters and its groups. You already know how the charts and IC work; now we
          can use them as clues.
        </p>
        <div class="choice-buttons" role="group" aria-label="Cipher pattern choices">
          {CIPHER_NAMES.map((name, i) => (
            <button
              disabled={!ready}
              key={name}
              aria-pressed={selected === i}
              onClick={() => setSelected(i)}
            >
              {name}
            </button>
          ))}
        </div>
        {selected === 0 && (
          <>
            <h3>Caesar: the skyline slides, but keeps its shape</h3>
            <p>
              A Caesar cipher replaces every letter with one a fixed distance along the alphabet.
              With shift 7, A becomes H, B becomes I, and E becomes L. All the E’s become L’s, so
              the old E bar and the new L bar have exactly the same height.
            </p>
            <p>
              The whole letter-frequency graph slides around the alphabet. Tall peaks, short bars
              and the gaps between them stay together. Sometimes you can recognise that familiar
              skyline before working out any words. Bars that pass Z wrap around to A.
            </p>
            <p>
              Use the animation or one-shift button below. Look for the shape lining up, then read
              the decoded text to check your idea. The light bars here are the original passage, so
              they line up exactly at the right shift; an ordinary English reference would be
              approximate.
            </p>
            <div class="analysis-slide guide-animation">
              <AnalysisVisual kind="caesar" />
            </div>
            <p>
              Groups keep their counts too: every THE becomes the same shifted triple, AOL, in this
              shift-7 example. Finding the shift that reads the whole passage is stronger evidence
              than matching a single tall bar.
            </p>
          </>
        )}
        {selected === 1 && (
          <>
            <h3>Substitution: the bars are jumbled, not lost</h3>
            <p>
              A simple substitution gives each plaintext letter a fixed replacement. Every e might
              become G, every h might become C, and every t might become T. Unlike Caesar, the
              replacements do not all move by the same distance.
            </p>
            <p>
              In alphabetical order, the English skyline is broken up: its tall bars have been
              scattered among new letter names. But each individual count survives. Sorting both
              graphs from tallest to shortest can reveal the same collection of bar heights. Select
              “Order by frequency” in the demonstration to see that happen.
            </p>
            <div class="analysis-slide guide-animation">
              <AnalysisVisual kind="substitution-letters" />
            </div>
            <h4>Neighbours survive under new names</h4>
            <p>
              Every THE becomes TCG in this example. If THE appeared 20 times, TCG would appear 20
              times. TH and HE keep their counts as TC and CG. Bigrams and trigrams therefore
              preserve linked clues, even though their labels change.
            </p>
            <div class="analysis-slide guide-animation">
              <AnalysisVisual kind="substitution-groups" />
            </div>
            <p>
              Similar ranked bars suggest a possible substitution. They do not tell you the whole
              alphabet automatically: equal or close counts can be ambiguous. Use several groups and
              word patterns to test a guess.
            </p>
          </>
        )}
        {selected === 2 && (
          <>
            <h3>Transposition: the letters stay, their neighbours change</h3>
            <p>
              A transposition changes positions rather than letter identities. Ten E’s are still ten
              E’s, so the letter-frequency graph keeps both its bar heights and their usual alphabet
              positions. An unreadable message whose E, T and other letter counts already look
              English is a good reason to try rearranging it.
            </p>
            <div class="analysis-slide guide-animation">
              <AnalysisVisual kind="transposition-letters" />
            </div>
            <p>
              Now ask whether the neighbours still look English. Moving letters apart can break THE
              into unrelated groups. The common bigram and trigram peaks are often reduced and the
              group chart can look flatter. Some groups survive by chance or because a particular
              route leaves neighbours together, so it will not be perfectly flat.
            </p>
            <div class="analysis-slide guide-animation">
              <AnalysisVisual kind="transposition-groups" />
            </div>
            <p>
              Move the columns below. Notice that the letters never change, but readable groups
              reappear as the neighbours are restored.
            </p>
            <div class="analysis-slide guide-animation">
              <AnalysisVisual kind="blocks" />
            </div>
          </>
        )}
        {selected === 3 && (
          <>
            <h3>Vigenère: one letter can have several replacements</h3>
            <p>
              A repeating-key Vigenère cipher mixes several Caesar shifts in one message. With the
              key MAP, a plaintext e can become Q, E or T, depending on its key position. The big
              pile of E counts is shared among different ciphertext bars instead of moving to just
              one new label.
            </p>
            <p>
              Other letters are shared out too. The result often looks flatter than English. A
              three-letter key will not necessarily make every bar equal, but one rotation or one
              fixed relabelling will usually fail to line up the whole pattern.
            </p>
            <FrequencyPlot text={examples[3]} />
            <h4>The same thing happens to groups</h4>
            <p>
              THE can become FHT, TWQ or ITE under MAP, depending on where it meets the key. Its
              occurrences are divided among several labels. The usual bigram and trigram peaks
              become less distinct too. Compare the ranked ciphertext percentages with English
              below.
            </p>
            <GroupChart text={examples[3]} n={2} compare />
            <GroupChart text={examples[3]} n={3} compare />
            <p>
              Remember IC, the chance of picking two matching letters? Sharing counts across more
              letters usually lowers that score. The original passage scores{" "}
              <strong>{coincidence(PRACTICE).toFixed(4)}</strong>; this ciphertext scores{" "}
              <strong>{coincidence(examples[3]).toFixed(4)}</strong>. It has moved away from the
              usual English neighbourhood of 0.066, towards the uniform-letter reference of 0.0385.
            </p>
            <p>
              That is a reason to investigate multiple shifts, not proof by itself. We can then try
              to discover the repeating key length and separate the shifts again.
            </p>
          </>
        )}
        <p class="guide-callout">
          <strong>Your next experiment: </strong>
          {nextTests[selected]}
        </p>
      </section>
      <section class="learning-lab" aria-label="Mystery cipher practice">
        <h2>Investigate a mystery, one clue at a time</h2>
        <p>
          Do not guess the cipher yet. First look at the charts and record five observations. You
          will then line up your answers with a grid of cipher clues.
        </p>
        <div class="choice-buttons" role="group" aria-label="Mystery selection">
          {CIPHER_NAMES.map((_, i) => (
            <button
              disabled={!ready}
              key={i}
              aria-pressed={mystery === i}
              onClick={() => {
                setMystery(i);
                reset();
                setRanked(false);
              }}
            >
              Mystery {i + 1}
            </button>
          ))}
        </div>
        <p class="cipher-excerpt mono">{examples[mystery].slice(0, 100)}…</p>
        {!complete && question < 3 && (
          <label>
            <input
              type="checkbox"
              disabled={!ready}
              checked={ranked}
              onChange={(e) => setRanked(e.currentTarget.checked)}
            />{" "}
            Sort letter bars from tallest to shortest
          </label>
        )}
        {!complete && question < 3 && (
          <p class="small">
            Turn sorting off when checking whether the peaks stayed in place or shifted together.
          </p>
        )}
        {!complete ? (
          <div class="question-step">
            <p class="eyebrow">OBSERVATION {question + 1} OF 5</p>
            <h3>{QUESTIONS[question].title}</h3>
            {question < 3 && <FrequencyPlot text={examples[mystery]} ranked={ranked} />}
            {question === 3 && (
              <>
                <GroupChart text={examples[mystery]} n={2} compare limit={6} />
                <GroupChart text={examples[mystery]} n={3} compare limit={6} />
              </>
            )}
            {question === 4 && (
              <>
                <p>
                  Whole-message IC:{" "}
                  <strong class="ic-reading">{coincidence(examples[mystery]).toFixed(4)}</strong>
                </p>
                <p>
                  Recall the matching-letter score: English often sits around 0.066, while uniform
                  random letters score around 0.0385. This is a longer sample, so the comparison is
                  more useful than it was for BANANA.
                </p>
              </>
            )}
            <div class="choice-buttons" role="group" aria-label={`Observation ${question + 1}`}>
              <button disabled={!ready} onClick={() => answer(true)}>
                Yes ✅
              </button>
              <button disabled={!ready} onClick={() => answer(false)}>
                No ❌
              </button>
              <button
                disabled={!ready}
                class="text-button"
                aria-expanded={hint}
                onClick={() => setHint(!hint)}
              >
                Help me look
              </button>
            </div>
            {hint && <p>{QUESTIONS[question].hint}</p>}
          </div>
        ) : (
          <>
            <h3>Line up the clues, then choose a cipher</h3>
            <p>
              Your observations are the first row. The rows underneath show usual patterns for these
              four cipher types. Green cells agree with your observations; outlined amber cells
              differ. Choose the cipher whose row best explains the evidence.
            </p>
            <CipherClueGrid answers={answers as boolean[]} disabled={!ready} onGuess={setGuess} />
            <p class="small">On a small screen, scroll the grid sideways to see all five clues.</p>
            <details>
              <summary>Look at this mystery’s charts again</summary>
              <FrequencyPlot text={examples[mystery]} />
              <GroupChart text={examples[mystery]} n={2} compare limit={6} />
              <GroupChart text={examples[mystery]} n={3} compare limit={6} />
            </details>
          </>
        )}
        {answers.some((v) => v !== null) && (
          <details>
            <summary>Review the observations I have recorded</summary>
            <ol>
              {answers.map(
                (v, i) =>
                  v !== null && (
                    <li key={i}>
                      {v ? "✅" : "❌"} {QUESTIONS[i].title}{" "}
                      <button
                        onClick={() => {
                          const next = [...answers];
                          next[i] = null;
                          setAnswers(next);
                          setGuess(null);
                        }}
                      >
                        Change answer {i + 1}
                      </button>
                    </li>
                  ),
              )}
            </ol>
          </details>
        )}
        {guess !== null && (
          <div class={guess === mystery ? "mystery-feedback success-feedback" : "mystery-feedback"}>
            {guess === mystery && (
              <div class="emoji-celebration" aria-hidden="true">
                🎉 🔓 🕵️ ⭐
              </div>
            )}
            <p role="status">
              {guess === mystery
                ? `🎉 Case solved! This example uses ${CIPHER_NAMES[mystery]}. ${nextTests[mystery]}`
                : `🔎 Another clue is worth checking. Your choice was ${CIPHER_NAMES[guess]}. Compare its row with your observations, then revisit the charts.`}
            </p>
            {guess === mystery && !CIPHER_CLUES[mystery].every((v, i) => v === answers[i]) && (
              <p>
                You found the cipher. Some recorded clues differ from its usual pattern: use
                “Review” to revisit those observations and explain the difference.
              </p>
            )}
          </div>
        )}
        <button disabled={!ready} class="text-button" onClick={reset}>
          Start these observations again
        </button>
        <p class="small">
          These are teaching examples. Real messages can be short, unusual or use combined ciphers.
          The grid helps you choose a next test; readable plaintext confirms the result.
        </p>
      </section>
    </>
  );
}
