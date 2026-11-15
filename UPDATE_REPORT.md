# Cipher resources update report

Completed 15 November 2026 on branch `more-guides`.

The initial implementation and all five teaching follow-ups were completed in separate stages. The site keeps its existing Astro/Preact framework and GitHub Pages configuration. The changes are local commits; they have not been pushed or deployed.

## Follow-up teaching revisions

| Follow-up                               | Result                                                                                                                                                                                                                                                                                                                                             | Commit    |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| English group comparisons               | English percentages now appear beside ciphertext percentages in tables and paired bars. Switch between independent frequency ranks and matching group names. The complete source counts, denominators and a reproducible importer are included.                                                                                                    | `3124dbe` |
| Spreadsheet lesson for first-time users | Starts with a movable transposition example, then cells, formulas, references, copying, fixed references, MID, COLUMN/ROW and character indices. Includes 21 actual Excel screenshot checkpoints, interactive MID/index exercises, values-only copying and moving whole columns. The adjustable-width lesson explains why each new part is useful. | `32d1fd6` |
| Cipher identification                   | Adds letter/bigram/trigram counting exercises and a matching-pair explanation of IC. Expands all four cipher explanations, fixes Caesar contrast, and presents one mystery observation with its relevant chart at a time. Five yes/no observations lead to a tick/cross comparison grid and reduced-motion-aware celebration.                      | `93b55a5` |
| Vigenère learning sequence              | Caesar recap → shifts 7/22 on alternating positions → recording shifts as letters → a word key. Input letters and crib starts are clickable. Adds before/after letter and group charts, sourced history, step-by-step crib arithmetic, a hands-on Kasiski gap example, and fuller IC/stream-solving explanations.                                  | `33c7004` |
| Substitution motivation                 | Explains why letter-by-letter trials can be slow, compares the same opening after a single-letter guess and a three-letter group guess, and motivates using one hypothesis to check several linked clues.                                                                                                                                          | `d92044c` |

The lessons now motivate an experiment before introducing its technique, introduce vocabulary before using it, and give pupils small actions with an observable result. Original practice material and source notes are visually separated from the main action buttons.

## Initial implementation stages

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
- **Unit tests:** 34 passed across six files. Coverage includes cipher vectors, transposition routes, statistical counts, repeat positions/factors, crib phase and contradictions, atomic substitution guesses, and English reference denominators and comparison alignment. The teaching sample is checked to ensure it supports the stated THE/THA/HER clues.
- **Production build:** passed, producing 13 static pages.
- **Full browser regression against the production build:** 54 passed, 2 intentionally skipped. Both desktop and mobile were exercised. The skips are the existing mobile desktop-drag test and duplicate mobile print export; mobile arrow controls and desktop printing are tested.
- **Browser coverage:** all guide experiments, malformed inputs, reveals/undo/reset, tool workflows, internal links, persistence, copy actions, deck animation controls, reduced motion, keyboard shortcuts, viewport fit, and one printed page per slide. Review screenshots and print artifacts are under the ignored `artifacts/` directory.
- **New teaching checks:** English percentages in both tables and bars; all 21 screenshot assets; MID experiments and position calculations; column-arrow reordering; letter-count and IC starter exercises; readable Caesar contrast; staged mystery observations and tick/cross matching; alternating shifts; clickable Vigenère letters; crib lengths including decimal input; and a Kasiski candidate that fits one gap but fails other gaps.
- **Live Microsoft Excel:** formulas were entered and copied through the connected ChatGPT add-in. The fixed and reusable five-column versions both produced `LETSMOVELETTERS`. Width 2 with `ABCDE` produced `BADCE`; width 3 with `ABCDEFGH` produced `CABFDEGH`; width 20 with a reversed key produced `TSRQPONMLKJIHGFEDCBA`. A 201-letter message at width 2 triggered `Add more rows`. A workbook error scan found no formula errors. Input, grid, solution and solver ranges were visually inspected. The verified examples remain in the open Book1 test sheets; no workbook export was requested.
- **Follow-up Excel verification:** captured each of the 21 new checkpoints from the actual Excel window and visually reviewed the crops. Rechecked the revised COLUMN/ROW position formula, values-only copying, native whole-column insert/move operations, row joins and the adjustable solver at widths 5 and 3. Dragging instructions are supported by the Microsoft and Google documentation; the native column-reordering results were verified through Excel’s connected APIs. A screenshot that caught the desktop and an answer initially clipped at the edge were recaptured before delivery.

## Verification limit

Live Google Sheets UI testing could not be completed. Browser access was unavailable, and the Chrome computer-control fallback stopped because it could not determine the current URL confidently enough to enforce its policy. No browser safety control was bypassed. The formulas use functions documented by Google Sheets, avoid Excel spill syntax, and passed native Excel recalculation, but this report does not claim a live Google Sheets run.

## Original material and attribution

No National Cipher Challenge ciphertext is included in the current source, deck examples or test fixtures. The Wilf workbook was inspected for its teaching structure and formulas; its ciphertext was not copied. All new practice passages and their ciphertexts were created for this site. Source links appear beside the relevant guide content.

- [Peter Norvig, English Letter Frequency Counts](https://www.norvig.com/mayzner.html) and its [published n-gram archive](https://www.norvig.com/tsv/ngrams-all.tsv.zip): English group counts, ranks and percentages. The within-word totals are 2,819,662,855,499 bigrams and 2,098,121,156,991 trigrams. For example, TH is about 3.56% of bigrams and THE about 3.30% of trigrams in this reference. Percentages use the complete total for that length, not just the top groups. The site explains that ciphertext groups may cross removed word boundaries. `scripts/import-ngram-reference.mjs` reproduces the imported data.
- [University of Rhode Island, Vigenère cryptanalysis](https://cs.uri.edu/cryptography/classical-ciphers/vigenere/cryptanalysis-article.html): Kasiski and coincidence methods.
- [Trinity College, Vigenère tutorial](https://www.cs.trincoll.edu/cryptography/vigenere.html): repeating alphabets and separating a message into streams.
- [University of Rhode Island, substitution cryptanalysis demonstration](https://cs.uri.edu/cryptography/classical-ciphers/substitution/cryptanalysis-demo.html): general frequency/group-assisted manual substitution.
- [Google Sheets function list](https://support.google.com/docs/table/25273?hl=en), [Google TEXTJOIN](https://support.google.com/docs/answer/7013992?hl=en), and [Microsoft MID](https://support.microsoft.com/en-us/office/mid-function-d5f9e25c-d7d6-472e-b568-4ecb12433028): spreadsheet function references.
- [Microsoft: moving columns](https://support.microsoft.com/en-gb/excel/move-or-copy-cells-rows-and-columns) and [Google: moving columns](https://support.google.com/docs/answer/54813?hl=en-GB): moving, inserting and dragging instructions.
- [William F. Friedman, Introduction to Cryptology IV](https://www.nsa.gov/portals/75/documents/news-features/declassified-documents/friedman-documents/lectures-speeches/FOLDER_175/41758839079798.pdf), NSA Technical Journal (1961), printed pages 51 and 60: diplomatic, military and agent use of Vigenère-type systems and Kasiski’s 1863 publication.
- [Chris Christensen, Cryptography of the Vigenère Cipher](https://www.nku.edu/~christensen/1901csscmat483%20section%2013%20vigenere%20cryptography.pdf), Northern Kentucky University: alternating alphabets, Vigenère’s diplomatic background and the long-lived reputation of the cipher. The guide distinguishes that reputation from a claim of mathematical unbreakability.
- The requested [dCode bigram](https://www.dcode.fr/bigrams) and [trigram](https://www.dcode.fr/trigrams) pages were reviewed as comparison tools; their ciphertexts and layouts were not copied.

To review locally, run `pnpm dev` and open `http://localhost:4321/ciphers/guides/`.
