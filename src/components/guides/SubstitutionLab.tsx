import { useEffect, useState } from "preact/hooks";
import { ABC, frequencies, letters, ngrams } from "../../utils/ciphers";
import {
  encodedGroup,
  SUBSTITUTION_ALPHABET,
  SUBSTITUTION_CIPHER,
} from "../../data/substitutionPractice";
import { partialDecode, tryGroup, type GuessMap } from "../../utils/substitutionLearning";

const stages = [
  {
    name: "Find THE",
    group: "THE",
    prompt:
      "Compare the most common trigram with THE. Its first two letters may stand for TH, and its last letter for e. Cross-check the bigram and letter counts before trying it.",
  },
  {
    name: "Follow THA",
    group: "THA",
    prompt:
      "If THE is right, look for a group beginning th with one unknown letter. THA occurs in THAT and THAN. It is a useful way to suggest a, but check the words around it.",
  },
  {
    name: "Follow HER",
    group: "HER",
    prompt:
      "Now look for he followed by an unknown letter. HER occurs inside THERE, WHERE, OTHER and TOGETHER as well as the word HER. Try r and see whether it helps several places.",
  },
  {
    name: "Check whole words",
    group: "THERE",
    prompt:
      "Use repeated-letter patterns. THERE has its third and fifth letters the same. Try the matching five-letter cipher group below. Then test THE LETTER and OTHER, using the same mapping everywhere.",
  },
];
export default function SubstitutionLab() {
  const [ready, setReady] = useState(false),
    [step, setStep] = useState(0),
    [mapping, setMapping] = useState<GuessMap>({}),
    [history, setHistory] = useState<GuessMap[]>([]),
    [group, setGroup] = useState(encodedGroup("THE")),
    [guess, setGuess] = useState(""),
    [message, setMessage] = useState(""),
    [hint, setHint] = useState(false),
    [spaces, setSpaces] = useState(false);
  useEffect(() => setReady(true), []);
  const stage = stages[step],
    source = spaces ? SUBSTITUTION_CIPHER : letters(SUBSTITUTION_CIPHER),
    decoded = partialDecode(source, mapping);
  const trigrams = ngrams(source, 3).slice(0, 12),
    bigrams = ngrams(source, 2).slice(0, 8),
    topLetters = frequencies(source)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  function apply(cipher = group, plain = guess) {
    const result = tryGroup(mapping, cipher, plain);
    if (result.error) {
      setMessage(result.error);
      return;
    }
    setHistory([...history, mapping]);
    setMapping(result.mapping);
    setMessage("Hypothesis applied everywhere. Check several words; undo if they disagree.");
  }
  function chooseStep(n: number) {
    setStep(n);
    setGroup(encodedGroup(stages[n].group));
    setGuess("");
    setHint(false);
    setMessage("");
  }
  return (
    <section class="learning-lab" aria-label="Substitution practice workshop">
      <fieldset class="lab-controls" disabled={!ready}>
        <h3>Build a chain of guesses</h3>
        <p>
          This original practice story was written to make the linked clues easy to see. Your
          challenge text may have a different ranking.
        </p>
        <div class="choice-buttons" role="group" aria-label="Substitution learning steps">
          {stages.map((s, i) => (
            <button key={s.name} aria-pressed={step === i} onClick={() => chooseStep(i)}>
              {i + 1}. {s.name}
            </button>
          ))}
        </div>
        <p class="guide-callout">{stage.prompt}</p>
        <div class="clue-grid">
          <div>
            <h4>Top letters</h4>
            {topLetters.map((g) => (
              <p class="small mono" key={g.letter}>
                {g.letter} · {g.count} · {g.percent.toFixed(2)}%
              </p>
            ))}
          </div>
          <div>
            <h4>Top bigrams</h4>
            {bigrams.map((g) => (
              <p class="small mono" key={g.gram}>
                {g.gram} · {g.count} · {g.percent.toFixed(2)}%
              </p>
            ))}
          </div>
        </div>
        <div class="table-scroll">
          <table>
            <caption>Top ciphertext trigrams — select one to investigate</caption>
            <thead>
              <tr>
                <th>Group</th>
                <th>Count</th>
                <th>% of all trigrams</th>
                <th>Current reading</th>
                <th>Try</th>
              </tr>
            </thead>
            <tbody>
              {trigrams.map((g) => (
                <tr key={g.gram}>
                  <th class="mono">{g.gram}</th>
                  <td>{g.count}</td>
                  <td>{g.percent.toFixed(2)}</td>
                  <td class="mono">{partialDecode(g.gram, mapping)}</td>
                  <td>
                    <button
                      onClick={() => {
                        setGroup(g.gram);
                        setGuess("");
                      }}
                    >
                      Investigate {g.gram}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p class="small">
          Counts overlap and ignore spaces. The percentages use every group in the whole message,
          not just the groups displayed.
        </p>
        <label class="field">
          Cipher group
          <input
            value={group}
            maxLength={12}
            onInput={(e) => setGroup(letters(e.currentTarget.value))}
          />
        </label>
        <label class="field">
          Plaintext hypothesis
          <input
            value={guess}
            maxLength={12}
            onInput={(e) => setGuess(letters(e.currentTarget.value))}
            placeholder={`Try a ${letters(group).length}-letter group`}
          />
        </label>
        <div class="choice-buttons">
          <button onClick={() => apply()}>Test this mapping</button>
          <button
            disabled={!history.length}
            onClick={() => {
              setMapping(history[history.length - 1]);
              setHistory(history.slice(0, -1));
              setMessage("Last guess undone.");
            }}
          >
            Undo last guess
          </button>
          <button
            onClick={() => {
              setMapping({});
              setHistory([]);
              setMessage("Guesses cleared.");
            }}
          >
            Reset all guesses
          </button>
          <button onClick={() => setHint(!hint)} aria-expanded={hint}>
            {hint ? "Hide" : "Show"} step hint
          </button>
        </div>
        {hint && (
          <p class="guide-callout">
            In this teaching example, try{" "}
            <strong>
              {encodedGroup(stage.group)} → {stage.group.toLowerCase()}
            </strong>
            .{" "}
            {step === 1
              ? "The first two letters should already read th."
              : step === 2
                ? "The first two letters should already read he."
                : "Check that the same guess works in several places."}
          </p>
        )}
        <p role="status">{message}</p>
        <p>
          <strong>{Object.keys(mapping).length} letters guessed.</strong> Lowercase, highlighted and
          underlined = your guesses. UPPERCASE = still ciphertext. A guess is not yet proof.
        </p>
        <label>
          <input
            type="checkbox"
            checked={spaces}
            onChange={(e) => setSpaces(e.currentTarget.checked)}
          />{" "}
          Show original word spaces as a hint
        </label>
        <div
          class="output mixed-output"
          role="textbox"
          aria-readonly="true"
          aria-label="Substitution practice output"
          tabIndex={0}
        >
          {[...decoded].map((c, i) =>
            /[a-z]/.test(c) ? (
              <mark class="solved-letter" key={i}>
                {c}
              </mark>
            ) : (
              <span key={i}>{c}</span>
            ),
          )}
        </div>
        <details>
          <summary>Inspect or clear an individual guess</summary>
          <div class="choice-buttons">
            {Object.entries(mapping).map(([cipher, plain]) => (
              <button
                key={cipher}
                onClick={() => {
                  setHistory([...history, mapping]);
                  const next = { ...mapping };
                  delete next[cipher];
                  setMapping(next);
                  setMessage(`Cleared ${cipher}.`);
                }}
              >
                {cipher} → {plain.toLowerCase()} · clear
              </button>
            ))}
          </div>
        </details>
        <details>
          <summary>Reveal the complete practice solution</summary>
          <p>
            Use this after checking your own guesses. The ORANGE cipher alphabet maps plaintext A–Z
            to {SUBSTITUTION_ALPHABET}.
          </p>
          <button
            onClick={() => {
              setHistory([...history, mapping]);
              setMapping(
                Object.fromEntries([...ABC].map((plain, i) => [SUBSTITUTION_ALPHABET[i], plain])),
              );
              setMessage("Practice solution revealed. Use Undo to return to your guesses.");
            }}
          >
            Reveal practice mapping
          </button>
        </details>
      </fieldset>
    </section>
  );
}
