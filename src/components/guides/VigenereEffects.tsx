import { useEffect, useState } from "preact/hooks";
import { coincidence, vigenere } from "../../utils/ciphers";
import { PRACTICE } from "../../utils/samples";
import FrequencyPlot from "../tools/FrequencyPlot";
import GroupChart from "../tools/GroupChart";
const cipher = vigenere(PRACTICE, "MAP", false);
export default function VigenereEffects() {
  const [ready, setReady] = useState(false),
    [encrypted, setEncrypted] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <section class="learning-lab" aria-label="Compare Vigenère frequency effects">
      <fieldset class="lab-controls" disabled={!ready}>
        <h3>Compare a story before and after encryption</h3>
        <p>
          We used the same longer story in both views. Switch between them and watch how the tall
          peaks change. Both letter graphs use the same percentage scale.
        </p>
        <div class="choice-buttons" role="group" aria-label="Before and after shifts">
          <button aria-pressed={!encrypted} onClick={() => setEncrypted(false)}>
            Original English
          </button>
          <button aria-pressed={encrypted} onClick={() => setEncrypted(true)}>
            After MAP encryption
          </button>
        </div>
        <FrequencyPlot
          text={encrypted ? cipher : PRACTICE}
          label={encrypted ? "MAP ciphertext" : "Original story"}
        />
        <h4>Now compare the groups</h4>
        <p>
          Each reference bar shows an English group percentage. Look at the sizes of the leading
          peaks as you switch views; the ciphertext labels need not match the English labels.
        </p>
        <GroupChart text={encrypted ? cipher : PRACTICE} n={2} compare limit={6} />
        <GroupChart text={encrypted ? cipher : PRACTICE} n={3} compare limit={6} />
        <p class="guide-callout">
          Matching-letter score (IC): original story{" "}
          <strong>{coincidence(PRACTICE).toFixed(4)}</strong>; MAP ciphertext{" "}
          <strong>{coincidence(cipher).toFixed(4)}</strong>. Spreading the counts has made two
          randomly picked letters less likely to match.
        </p>
      </fieldset>
    </section>
  );
}
