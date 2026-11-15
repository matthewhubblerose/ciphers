export const CIPHER_NAMES = ["Caesar", "Substitution", "Transposition", "Vigenère"];
export const CLUE_LABELS = [
  "Uneven letter peaks",
  "Peaks on usual English letters",
  "Peaks shifted together",
  "Group peaks survive with new labels",
  "IC still English-like",
];
export const CIPHER_CLUES = [
  [true, false, true, true, true],
  [true, false, false, true, true],
  [true, true, false, false, true],
  [false, false, false, false, false],
];
export const QUESTIONS = [
  {
    title: "Are the letter bars uneven, with some tall peaks like English?",
    hint: "Ignore the letter names for now. Look for a few common letters and lots of rare ones. A flatter chart spreads the counts more evenly.",
  },
  {
    title: "Are the tall peaks on the usual English letters?",
    hint: "Now check names. Do E and T themselves tend to be high, with Q and Z low? This asks whether the peaks stayed in the same places.",
  },
  {
    title: "Have the peaks all moved together by one shared shift?",
    hint: "Look for the English skyline moved around the alphabet, including peaks that wrapped past Z. Shuffled peaks have not all travelled the same distance. A pattern already in the usual places is not a moved skyline for this question.",
  },
  {
    title: "Do the bigram and trigram charts keep familiar tall peaks, under changed labels?",
    hint: "Compare their ranked percentages with English. In a simple substitution, every occurrence of one group gets the same new label. Reordering letters or mixing shifts can break that group pattern.",
  },
  {
    title: "Does the whole-message IC still look roughly English-like?",
    hint: "Remember the matching-letter score: longer English often scores around 0.066. A score nearer 0.0385 suggests the letter counts have spread out. These are reference values, not hard boundaries.",
  },
];
