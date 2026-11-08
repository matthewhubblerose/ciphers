export type VisualKind =
  | "typing-letters"
  | "typing-bigrams"
  | "caesar"
  | "substitution-letters"
  | "substitution-groups"
  | "transposition-letters"
  | "transposition-groups"
  | "blocks"
  | "routes"
  | "summary";
export interface Slide {
  title: string;
  body?: string;
  bullets?: string[];
  code?: string;
  notes: string;
  visual?: VisualKind;
}
export interface Deck {
  slug: string;
  title: string;
  description: string;
  duration: string;
  slides: Slide[];
}
export const decks: Deck[] = [
  {
    slug: "cipher-analysis",
    title: "Which cipher was used?",
    description:
      "Use letter and group frequencies to distinguish Caesar shifts, keyphrase substitutions and transpositions.",
    duration: "25–35 minutes",
    slides: [
      {
        title: "English has a letter-frequency fingerprint",
        body: "Watch the measured frequencies settle as more English text arrives.",
        visual: "typing-letters",
        notes:
          "Play the typing animation, or step and scrub through it. Early counts fluctuate strongly. More text usually gives a more stable English-like distribution, but improvement is not monotonic and no single sample matches a reference exactly. E and T are often common; compare the full pattern.",
      },
      {
        title: "Letter pairs have a fingerprint too",
        body: "Bigrams such as TH and HE become useful clues in a longer sample.",
        visual: "typing-bigrams",
        notes:
          "This example uses bigrams because the TH / HE / IN pattern is clearer and more stable than individual trigrams in this sample. For consistency with Peter Norvig’s reference, this typing chart counts within words. The cipher tools ignore display spaces and include groups across removed word boundaries.",
      },
      {
        title: "A Caesar shift moves the whole pattern",
        body: "Shift every count together. The extra thirteen letters on each side make wrapping visible.",
        visual: "caesar",
        notes:
          "Start at shift zero. Animate the correction one position at a time, or use the slider. The central region is A–Z; each side repeats thirteen letters. The original English passage is the reference so the correct shift lines up exactly. A generic English reference would only be approximate. At shift seven, read the recovered opening.",
      },
      {
        title: "A keyphrase substitution shuffles the labels",
        body: "ORANGE changes the alphabet without moving every letter by one shared shift.",
        visual: "substitution-letters",
        notes:
          "Compare alphabetical order first, then select Order by frequency. Independently ranked heights match the original passage, but the paired letter names differ. The full alphabet shows that the replacements do not form a Caesar rotation. Ties mean frequency alone may not determine a unique mapping.",
      },
      {
        title: "Letter groupings remain",
        body: "Bigrams and trigrams survive with different letter names.",
        visual: "substitution-groups",
        notes:
          "The English reference is the original passage for this controlled example. Every encoded pair or triple has exactly the count of its original group. The labels show the known ORANGE mapping; in an unknown puzzle these would be hypotheses to check consistently across several groups.",
      },
      {
        title: "Why does this unreadable text have English-like letter counts?",
        body: "We cannot read Challenge 3 B, but its letter frequencies already look English. What could have happened?",
        visual: "transposition-letters",
        notes:
          "This is an attributed excerpt from National Cipher Challenge 2026, Challenge 3 Part B. No rotation or relabelling is needed to make the single-letter chart English-like. The graph alone cannot rule out every substitution or mixed cipher; it gives us a reason to try a transposition.",
      },
      {
        title: "Do the bigrams and trigrams look English too?",
        body: "Compare the groups. What does this tell us about the positions of the letters?",
        visual: "transposition-groups",
        notes:
          "These charts compare the scrambled excerpt with the same excerpt restored by the known key, using identical group labels and percentage denominators. Notice that common English groups are reduced or missing in the ciphertext. Reordering preserves letter counts but changes most adjacencies; accidental groups can remain.",
      },
      {
        title: "Reorder each block of five the same way",
        body: "For Challenge 3 B, read columns 5, 2, 4, 1, 3 in every row.",
        visual: "blocks",
        notes:
          "Each row is a block, independent of display spacing. Animate the column order, then read MEETZ / INTHE / DINER. Explain that the output does not insert word spaces automatically. The same operation in the transposition tool now reads the visible grid directly.",
      },
      {
        title: "Reorder columns, then choose how to read them",
        body: "Start with LET’S MOVE LETTERS in a five-column grid. Move the columns, then read across rows or down columns.",
        visual: "routes",
        notes:
          "LETSMOVELETTERS has exactly 15 letters, so no padding is needed. Read the original grid across rows: LETSM / OVELE / TTERS. Move columns to 53124, then trace either reading route. The route changes the ciphertext even though the reordered grid stays the same.",
      },
      {
        title: "Use the pattern to choose your next test",
        visual: "summary",
        notes:
          "A pattern narrows the search. Confirm with readable output and several consistent clues. Letter and group distributions vary with the source and text length, and combined ciphers may hide these patterns. Vigenère can flatten a distribution and needs separate key-length analysis.",
      },
    ],
  },
];
