import { keyedAlphabet, substitute } from "../utils/ciphers";
export interface Slide {
  title: string;
  body?: string;
  bullets?: string[];
  code?: string;
  notes: string;
}
export interface Deck {
  slug: string;
  title: string;
  description: string;
  duration: string;
  slides: Slide[];
}
const alphabet = keyedAlphabet("ORANGE");
const enc = (text: string) => substitute(text, alphabet, false);
const reveal = (text: string, known: string) =>
  [...text]
    .filter((c) => /[A-Z]/.test(c))
    .map((c) => (known.includes(c) ? c : "·"))
    .join("");
export const decks: Deck[] = [
  {
    slug: "frequency",
    title: "Frequency, bigrams & trigrams",
    description:
      "Recognise the cipher, find THE, and build an alphabet from a few well-tested guesses.",
    duration: "25–35 minutes",
    slides: [
      {
        title: "Every cipher leaves a clue",
        body: "Frequency analysis, bigrams and trigrams",
        code: "COUNT → GUESS → TEST → REVISE",
        notes:
          "Ask club members what can survive encryption. Aim: distinguish Caesar, substitution and transposition, then use neighbouring letters to test a mapping. Allow about 30 minutes including the activity.",
      },
      {
        title: "The first inspection",
        bullets: [
          "Remove five-letter display groups before counting.",
          "Count A–Z letters and compare percentages.",
          "Use a few hundred letters when possible.",
        ],
        code: "AAAAA BBBBB ≠ two five-letter words",
        notes:
          "Open the frequency tool alongside the session. Five-letter groups are usually transmission formatting, not word boundaries. Punctuation is ignored by analysis.",
      },
      {
        title: "English has an uneven fingerprint",
        bullets: [
          "E is often around 12–13%.",
          "T, A, O, I and N are also common.",
          "Short texts and unusual vocabulary can change the order.",
        ],
        code: "E  █████████████\nT  █████████\nA  ████████\nZ  ▏",
        notes:
          "These are approximate values, not a promise about the sample. Show the English overlay and the exact count table. Ask why raw counts are not suitable for comparing different lengths.",
      },
      {
        title: "A Caesar shift rotates the pattern",
        body: "The bar heights survive. Each letter label moves the same distance, wrapping at Z.",
        code: "Shift 7: E → L, T → A, A → H\nAOL ZLJYLA → THE SECRET",
        notes:
          "Keep bars in alphabetical order to see the rotation; frequency sorting removes that spatial clue. Compare the whole shape, not just its tallest bar. Demonstrate all 26 Caesar candidates.",
      },
      {
        title: "Substitution shuffles the labels",
        bullets: [
          "The frequent letters can have unfamiliar names.",
          "Each cipher letter always maps to the same plaintext letter.",
          "One high bar suggests a guess; it does not prove E.",
        ],
        code: "Plain:  ABCDEFGHIJKLMNOPQRSTUVWXYZ\nCipher: " + alphabet,
        notes:
          "This is the ORANGE keyphrase alphabet used in the guide. Repeated letters in the keyphrase are removed, then unused A–Z letters are appended. Contrast arbitrary shuffling with a Caesar rotation.",
      },
      {
        title: "Transposition keeps letter counts",
        bullets: [
          "The actual E, T and A bars may still look English.",
          "Positions change, so ordinary letter pairs often break.",
          "Natural letter counts with strange pairs suggest rearrangement.",
        ],
        notes:
          "A substitution also preserves the index of coincidence. IC alone cannot distinguish those two cipher families. Long enough text is needed for a useful fingerprint.",
      },
      {
        title: "Look at neighbouring letters",
        body: "Count overlapping bigrams and trigrams in the continuous message.",
        code: "THERE\nBigrams:  TH  HE  ER  RE\nTrigrams: THE HER ERE",
        notes:
          "Common candidates include TH, HE, IN, ER, AN and THE, AND, ING, HER, ERE. They can cross word boundaries when spaces have been removed. They are not guaranteed to rank in this order.",
      },
      {
        title: "Worked example: test THE",
        body: `In our ORANGE sample, ${enc("THE")} is the most common trigram. Guess ${enc("THE")} → THE.`,
        code: `${enc("THE OTHER EXPLORERS WERE THERE")}\n${reveal("THE OTHER EXPLORERS WERE THERE", "THE")}`,
        notes: `Load the Substitution · ORANGE practice sample. In manual substitution, set ${enc("T")} → T, ${enc("H")} → H, ${enc("E")} → E. Ask club members which fragments might become words. All practice text is original.`,
      },
      {
        title: "Use HER to discover R",
        body: `Look for ${enc("HE")} followed by another cipher letter. ${enc("HER")} could be HER, giving ${enc("R")} → R.`,
        code: reveal("THE OTHER EXPLORERS WERE THERE", "THER"),
        notes:
          "Check THERE and possible OTHER together. HE may have other continuations, so test rather than assume. Show how the same mapping affects every occurrence in the message.",
      },
      {
        title: "Expand and check the whole message",
        bullets: [
          `·THER suggests OTHER: ${enc("O")} → O.`,
          `·ERE may be WERE: ${enc("W")} → W.`,
          `·ETTER may be LETTER: ${enc("L")} → L.`,
        ],
        code: "A good guess helps several fragments at once.",
        notes:
          "Undo a guess that makes other fragments implausible. A readable word alone is not enough; require several pieces of consistent evidence. The full solution and alphabet are in the guide.",
      },
      {
        title: "Your investigation",
        bullets: [
          "Load the substitution practice cipher.",
          "Compare single letters, bigrams and trigrams.",
          "Test THE, then HER. Record the evidence for each guess.",
          "Generate a new keyphrase cipher for a partner.",
        ],
        notes:
          "Allow 8–10 minutes. Club members can switch tools without losing their input. Have them explain why a guess is plausible, and what would make them reject it. For generating, select Generate ciphertext and enter a keyphrase.",
      },
      {
        title: "Questions to discuss",
        bullets: [
          "How does a Caesar chart differ from an arbitrary substitution?",
          "Why might an English-like chart suggest transposition?",
          "How can knowing THE help you find R?",
        ],
        code: "Clues suggest. The full message confirms.",
        notes:
          "Expected answers: the Caesar histogram is a cyclic rotation; transposition preserves letter labels/counts; a candidate HER reuses HE and can reveal R. Ask for one reason each method can be misleading.",
      },
    ],
  },
  {
    slug: "transposition",
    title: "Transposition in Excel",
    description:
      "Build a grid, rearrange fixed columns, and use a numeric or word key to control the route.",
    duration: "30–40 minutes",
    slides: [
      {
        title: "Same letters, different places",
        body: "Build a transposition workbench in Excel",
        code: "WEAREDISCOVERED → EAWEROSDICDRVEE",
        notes:
          "Aim: write text across a grid, reorder columns, use keys, and distinguish block from columnar transposition. The example has 15 letters. Use the full guide for formulas and longer notes.",
      },
      {
        title: "Write the message across five columns",
        code: "1 2 3 4 5\nW E A R E\nD I S C O\nV E R E D",
        body: "Letter identities and counts stay unchanged.",
        notes:
          "Ask club members which information a frequency analyser can still recover. Writing across rows is the convention in this session; other puzzles may use different routes.",
      },
      {
        title: "A numeric key is a read order",
        body: "53124 means read original columns 5, 3, 1, 2, 4.",
        code: "5 3 1 2 4\nE A W E R\nO S D I C\nD R V E E",
        notes:
          "Original column numbers travel with their columns. Read each row to get block transposition. Numeric rank labels under a word are a different representation; define the convention first.",
      },
      {
        title: "Block and columnar routes",
        code: "Across each reordered row:\nEAWER OSDIC DRVEE\n\nDown each selected column:\nEOD ASR WDV EIE RCE",
        notes:
          "These are different ciphers, using the same grid and read order. Display grouping of five letters is separate from block size. The workbench offers both routes and reverses either one.",
      },
      {
        title: "Set up Excel",
        bullets: [
          "Setup!B1: WEAREDISCOVERED",
          "Setup!B2: 5",
          "Setup!B3: cleaned uppercase text",
          "Grid!A1:E1: original column numbers 1–5",
        ],
        notes:
          'For the club sample B3 can be =UPPER(SUBSTITUTE(B1," ","")); the full guide also removes tabs and line breaks. Use letters and whitespace only. Set up three sheets: Setup, Grid and Output.',
      },
      {
        title: "Extract one character per cell",
        body: "Put this in Grid!A2. Fill across to E2, then down to row 4.",
        code: "=MID(Setup!$B$3,\n (ROW()-2)*Setup!$B$2+COLUMN(),1)",
        notes:
          "The dollar signs fix the source and block-size references. ROW and COLUMN locate each character. The guide contains the single-line formula. Empty cells beyond the text return empty strings. Formula separators may vary by locale.",
      },
      {
        title: "Fix values before moving columns",
        bullets: [
          "Copy the grid to a sheet called Manual.",
          "Paste Special → Values.",
          "Shift-drag the column border between other columns.",
          "Or use Cut → Insert Cut Cells.",
        ],
        code: "Freeze Panes keeps headings visible.\nPaste Values fixes the letters.",
        notes:
          "Do not drag the formula-generated grid: ROW/COLUMN would recalculate. Microsoft reference: https://support.microsoft.com/en-gb/excel/move-or-copy-cells-rows-and-columns?nochrome=true . The Shift-drag instruction is for desktop Excel for Windows. Insert Cut Cells is a useful alternative.",
      },
      {
        title: "Prefer dragging rows?",
        bullets: [
          "Paste the fixed grid with Transpose.",
          "Original columns become complete rows.",
          "Move the rows, keeping their original labels.",
          "Transpose back to read the blocks.",
        ],
        notes:
          "Original labels 1–5 are now in the first column. Use Freeze First Column for visibility only. Browser and Mac Excel may have different drag interactions.",
      },
      {
        title: "Let a numeric key control the grid",
        body: "Put 5, 3, 1, 2, 4 in Output!A1:E1. In A2, enter and fill across and down:",
        code: '=INDEX(Grid!$A2:$E2,1,A$1)\n\nJoin a row:\n=TEXTJOIN("",TRUE,A2:E2)',
        notes:
          "Join all resulting rows for block output. Join whole selected columns for columnar output. Keep the original Grid unchanged. All numbers 1–5 must occur exactly once in the key.",
      },
      {
        title: "Word keys: HOTEL → 41523",
        code: "Column: 1 2 3 4 5\nKey:    H O T E L\n\nAlphabetical: E H L O T\nRead order:   4 1 5 2 3",
        body: "Break ties between repeated letters from left to right.",
        notes:
          "The ranks written under HOTEL would be 2,4,5,1,3. Here the tool expects a read order, not rank labels. The full guide includes a SORTBY formula for Excel 365 / 2024.",
      },
      {
        title: "Automatically sort a word key",
        body: "Put HOTEL in Setup!B4. In Output!A1, leave room for the result to spill:",
        code: "=LET(k,UPPER(Setup!$B$4),\np,SEQUENCE(1,LEN(k)),\nSORTBY(p,MID(k,p,1),1,p,1))",
        notes:
          "Excel 365 / 2024 formula. Original positions provide a secondary sort for duplicate letters. Earlier Excel versions can sort a table of key letters and original positions manually.",
      },
      {
        title: "Deciphering uses the inverse route",
        code: "Encryption order: 5 3 1 2 4\nFull-block inverse: 3 4 2 5 1",
        bullets: [
          "Incomplete final blocks need their own inverse.",
          "Columnar decoding must reconstruct column lengths first.",
          "No automatic padding is added.",
        ],
        notes:
          "For a hypothetical 14-letter message, columns 1–4 have length 3 and column 5 length 2. With 53124, take ciphertext chunks of lengths 2,3,3,3,3, restore original columns, then read across rows. For a short block of 4 letters, remove column 5 from the order before inverting.",
      },
      {
        title: "Build, test, swap",
        bullets: [
          "Generate the known message with key 53124.",
          "Check block and columnar results against the examples.",
          "Decipher each result back to WEAREDISCOVERED.",
          "Try a word key, then an incomplete final block.",
        ],
        notes:
          "Allow 10 minutes. Ask club members to explain the route to a partner. Verify with the transposition tool. The guide contains detailed formulas and the handling of short final rows.",
      },
    ],
  },
];
