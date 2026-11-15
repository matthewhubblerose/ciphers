# Cipher resources update report

Completed 15 November 2026 on branch `more-guides`.

All five requested stages were implemented, tested and committed separately. The site keeps its existing Astro/Preact framework and GitHub Pages configuration. The changes are local commits; they have not been pushed or deployed.

## Completed stages

| Stage                          | Result                                                                                                                                                                                                                                                                                                                                                           | Commit    |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| 1. Tools and original examples | Partial substitution keeps unsolved ciphertext uppercase and shows guesses lowercase, highlighted and underlined. Bigrams/trigrams have top-ten percentage bars, exact counts and percentages, and explicit overlapping-group denominators. Existing competition excerpts in the deck and test fixtures were replaced with generated original practice material. | `2fed9e7` |
| 2. Spreadsheet guide           | A small fixed five-column exercise based on the formula structure in Wilf’s workbook, then a reusable solver for widths 2–20. Includes an interactive grid/formula model, short-row checks and a capacity warning. Uses MID, ROW, COLUMN, IF and TEXTJOIN with ordinary ranges; no spill references.                                                             | `37061d5` |
| 3. Cipher identification       | An interactive guide reuses the deck animations, adds four mystery-message exercises, explains Vigenère clues, and includes a compact comparison cheat sheet.                                                                                                                                                                                                    | `d89e2fd` |
| 4. Vigenère                    | A repeating-shift playground, crib alignment and conflict checking, worked Kasiski and IC examples, and a complete stream-by-stream Caesar workshop. The workbench now shows IC scores and stream sizes for candidate lengths up to 20, plus Kasiski factor votes, repeated groups of 3–5 letters, positions and gaps.                                           | `0088526` |
| 5. Faster substitution         | An interactive THE → THA → HER exercise, linked group guesses, contradiction checks, undo, individual clearing, optional word-space hints and a solution reveal. The guide explains that frequency ranks are useful hypotheses and vary between passages.                                                                                                        | `0043cea` |

Final regression work also fixes deck shortcuts when a keyboard event targets the document, and adds a regression check. Animation controls wait for hydration before accepting input, which prevents early actions from being overwritten during startup.

## Pages

- `/ciphers/guides/transposition/` — Excel and Google Sheets, from five fixed columns to a reusable solver.
- `/ciphers/guides/identify/` — cipher patterns, animations, mysteries and cheat sheet.
- `/ciphers/guides/vigenere/` — repeating shifts, cribbing, Kasiski, IC and stream solving.
- `/ciphers/guides/substitution/` — linked letter/group hypotheses and reversible practice.
- `/ciphers/tools/` — the updated shared workbench.

The guide index and homepage link to the expanded collection. The old frequency-guide URL redirects to the identification guide.

## Verification

- **Type checks:** Astro/TypeScript passed with no errors or warnings.
- **Formatting and lint:** passed; each commit also runs the repository’s checks.
- **Unit tests:** 32 passed across five files. Coverage includes cipher vectors, transposition routes, statistical counts, repeat positions/factors, crib phase and contradictions, and atomic substitution guesses. The teaching sample is checked to ensure it supports the stated THE/THA/HER clues.
- **Production build:** passed, producing 13 static pages.
- **Full browser regression against the production build:** 52 passed, 2 intentionally skipped. Both desktop and mobile were exercised. The skips are the existing mobile desktop-drag test and duplicate mobile print export; mobile arrow controls and desktop printing are tested.
- **Browser coverage:** all guide experiments, malformed inputs, reveals/undo/reset, tool workflows, internal links, persistence, copy actions, deck animation controls, reduced motion, keyboard shortcuts, viewport fit, and one printed page per slide. Review screenshots and print artifacts are under the ignored `artifacts/` directory.
- **Live Microsoft Excel:** formulas were entered and copied through the connected ChatGPT add-in. The fixed and reusable five-column versions both produced `LETSMOVELETTERS`. Width 2 with `ABCDE` produced `BADCE`; width 3 with `ABCDEFGH` produced `CABFDEGH`; width 20 with a reversed key produced `TSRQPONMLKJIHGFEDCBA`. A 201-letter message at width 2 triggered `Add more rows`. A workbook error scan found no formula errors. Input, grid, solution and solver ranges were visually inspected. The verified examples remain in the open Book1 test sheets; no workbook export was requested.

## Verification limit

Live Google Sheets UI testing could not be completed. Browser access was unavailable, and the Chrome computer-control fallback stopped because it could not determine the current URL confidently enough to enforce its policy. No browser safety control was bypassed. The formulas use functions documented by Google Sheets, avoid Excel spill syntax, and passed native Excel recalculation, but this report does not claim a live Google Sheets run.

## Original material and attribution

No National Cipher Challenge ciphertext is included in the current source, deck examples or test fixtures. The Wilf workbook was inspected for its teaching structure and formulas; its ciphertext was not copied. All new practice passages and their ciphertexts were created for this site. Source links appear beside the relevant guide content.

- [Peter Norvig, English Letter Frequency Counts](https://www.norvig.com/mayzner.html): English group reference ranks. The site explains the difference between these within-word counts and its own groups across removed spaces.
- [University of Rhode Island, Vigenère cryptanalysis](https://cs.uri.edu/cryptography/classical-ciphers/vigenere/cryptanalysis-article.html): Kasiski and coincidence methods.
- [Trinity College, Vigenère tutorial](https://www.cs.trincoll.edu/cryptography/vigenere.html): repeating alphabets and separating a message into streams.
- [University of Rhode Island, substitution cryptanalysis demonstration](https://cs.uri.edu/cryptography/classical-ciphers/substitution/cryptanalysis-demo.html): general frequency/group-assisted manual substitution.
- [Google Sheets function list](https://support.google.com/docs/table/25273?hl=en), [Google TEXTJOIN](https://support.google.com/docs/answer/7013992?hl=en), and [Microsoft MID](https://support.microsoft.com/en-us/office/mid-function-d5f9e25c-d7d6-472e-b568-4ecb12433028): spreadsheet function references.
- The requested [dCode bigram](https://www.dcode.fr/bigrams) and [trigram](https://www.dcode.fr/trigrams) pages were reviewed as comparison tools; their ciphertexts and layouts were not copied.

To review locally, run `pnpm dev` and open `http://localhost:4321/ciphers/guides/`.
