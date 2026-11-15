import { useEffect, useState } from "preact/hooks";
import { coincidence, letters } from "../../utils/ciphers";
import { PRACTICE } from "../../utils/samples";
import FrequencyPlot from "../tools/FrequencyPlot";
import GroupChart from "../tools/GroupChart";

export default function AnalysisStarter() {
  const [ready, setReady] = useState(false),
    [text, setText] = useState("BANANA"),
    [kind, setKind] = useState(1),
    [first, setFirst] = useState(0),
    [second, setSecond] = useState(1);
  useEffect(() => setReady(true), []);
  const clean = letters(text),
    windows = Array.from({ length: Math.max(0, clean.length - kind + 1) }, (_, i) =>
      clean.slice(i, i + kind),
    ),
    toy = "BANANA";
  return (
    <section class="learning-lab" aria-label="Learn frequency analysis">
      <fieldset class="lab-controls" disabled={!ready}>
        <h2>Start here: what are we counting?</h2>
        <p>
          Ciphertext is the scrambled message; plaintext is the readable message we hope to recover.
          Before guessing any letters, we can count what appears in the ciphertext. Counts give us
          clues even when we cannot read a word.
        </p>
        <h3>Count neighbours as well as single letters</h3>
        <p>
          English letters often travel together. For example, T is often followed by H, and TH is
          often followed by E. Counting those neighbours gives us clues that a single-letter count
          cannot show. A group does not have to be a whole word: ING can sit at the end of a word
          such as walking.
        </p>
        <div class="table-scroll">
          <table>
            <caption>Two useful names for neighbouring letters</caption>
            <thead>
              <tr>
                <th>Name</th>
                <th>What we count</th>
                <th>Common English examples</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th>Bigram</th>
                <td>Two letters next to each other. “Bi” means two.</td>
                <td>TH, HE, IN</td>
              </tr>
              <tr>
                <th>Trigram</th>
                <td>Three letters next to each other. “Tri” means three.</td>
                <td>THE, AND, ING</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Move along <strong>one letter at a time</strong>, so the groups overlap. THEN gives three
          bigrams: <code>TH · HE · EN</code>. It gives two trigrams: <code>THE · HEN</code>. The H
          belongs to more than one group; that is exactly what we want to count.
        </p>
        <p>
          If a cipher keeps the same neighbours together, a common group can help us guess several
          letters at once. If it breaks up those neighbours, the group counts change. Try the three
          counting buttons below to see the difference, starting with BANANA.
        </p>
        <label class="field">
          Counting practice text
          <textarea
            value={text}
            rows={3}
            onInput={(e) => setText(e.currentTarget.value)}
            spellcheck={false}
          />
        </label>
        <div class="choice-buttons">
          <button onClick={() => setText("BANANA")}>Use BANANA</button>
          <button onClick={() => setText(PRACTICE)}>Use a longer English passage</button>
        </div>
        <div class="choice-buttons" role="group" aria-label="What shall we count?">
          {[1, 2, 3].map((n) => (
            <button key={n} aria-pressed={kind === n} onClick={() => setKind(n)}>
              {n === 1 ? "1. Letters" : n === 2 ? "2. Bigrams" : "3. Trigrams"}
            </button>
          ))}
        </div>
        {kind === 1 ? (
          <>
            <h3>Frequency means “how often?”</h3>
            <p>
              In BANANA, A appears 3 times out of 6 letters. That is 3 ÷ 6 = 0.5, or{" "}
              <strong>50%</strong>. N appears twice and B once. A tall bar means a letter appears
              often; a short bar means it is rare.
            </p>
            <p>
              Long passages of ordinary English usually contain plenty of E and T, and few Q, X and
              Z. Their bars make an uneven skyline. A cipher may move those tall bars, shuffle them
              or spread their counts out. We will look for those changes.
            </p>
            <FrequencyPlot text={text} compare />
          </>
        ) : (
          <>
            <h3>
              {kind === 2
                ? "A bigram is a pair of neighbours"
                : "A trigram is a group of three neighbours"}
            </h3>
            <p>
              {kind === 2
                ? "Start at the first letter, read two letters, then move along by one letter and do it again. BANANA gives BA, AN, NA, AN, NA: five overlapping pairs. AN occurs twice, so its frequency is 2 ÷ 5 = 40%."
                : "Read three letters, move along by one, and read the next three. BANANA gives BAN, ANA, NAN, ANA: four overlapping triples. ANA occurs twice, so its frequency is 2 ÷ 4 = 50%."}
            </p>
            <p>
              These groups can sit inside words. TH and HE are common English pairs; THE, AND and
              ING are common triples. They can help us test several letter guesses together.
            </p>
            <p class="mono">
              {windows.slice(0, 18).join(" · ") || "Type a little more text to make a group."}
              {windows.length > 18 ? " · …" : ""}
            </p>
            <GroupChart text={text} n={kind} />
          </>
        )}
        <p class="checkpoint">
          Your text contains {clean.length} letters
          {kind > 1 ? ` and ${windows.length} overlapping ${kind === 2 ? "pairs" : "triples"}` : ""}
          . Spaces and punctuation do not count here. A six-letter word teaches us the arithmetic;
          use a much longer message before drawing conclusions about English.
        </p>
        <h3>One more clue: do two picked letters match?</h3>
        <p>
          The <strong>Index of Coincidence</strong>, shortened to <strong>IC</strong>, is a
          matching-letter score. Imagine choosing two different positions in a message without
          looking. How often would the two letters be the same? That probability is the IC.
        </p>
        <p>
          Try it in BANANA. Choose two different positions below. Choosing the two A’s is a match;
          choosing B and A is not. We compare the letters, not whether the position numbers match.
        </p>
        <div class="clue-grid">
          <label class="field">
            First picked position
            <select value={first} onChange={(e) => setFirst(Number(e.currentTarget.value))}>
              {[...toy].map((c, i) => (
                <option key={i} value={i} disabled={i === second}>
                  {i + 1}: {c}
                </option>
              ))}
            </select>
          </label>
          <label class="field">
            Second picked position
            <select value={second} onChange={(e) => setSecond(Number(e.currentTarget.value))}>
              {[...toy].map((c, i) => (
                <option key={i} value={i} disabled={i === first}>
                  {i + 1}: {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p class="guide-callout" role="status">
          {toy[first]} and {toy[second]}:{" "}
          {toy[first] === toy[second] ? "✅ a matching pair" : "❌ different letters"}.
        </p>
        <p>
          BANANA has 15 possible pairs of different positions. Four pairs match: three possible A/A
          pairs and one N/N pair. Its IC is 4 ÷ 15 ≈ <strong>0.2667</strong>. That is unusually high
          because this tiny word repeats so much.
        </p>
        <div class="clue-grid">
          <div class="stat-card">
            <strong>About 0.066</strong>
            <p>
              Typical longer English text: about 6 or 7 matches per 100 picked pairs. Some letters
              are much more common than others.
            </p>
          </div>
          <div class="stat-card">
            <strong>About 0.0385</strong>
            <p>
              Uniform random A–Z letters: about 4 matches per 100 pairs. Every letter is equally
              likely.
            </p>
          </div>
        </div>
        <p>
          Our longer English passage scores {coincidence(PRACTICE).toFixed(4)}. A Caesar shift, a
          simple substitution or a transposition keeps the number of matching pairs unchanged.
          Mixing several shifts can change it. IC is one clue to combine with the charts; it does
          not identify a cipher on its own.
        </p>
      </fieldset>
    </section>
  );
}
