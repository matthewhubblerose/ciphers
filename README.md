# Ciphers

Tools, guides and slide decks for an afterschool cipher club.

## Run locally

Use Node 24 LTS and pnpm 10.18.3 (the version declared in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:4321/ciphers/>. The `/ciphers` base path preserves the existing GitHub Pages deployment. All cipher operations run locally in the browser. The message is saved in this browser's local storage; Clear text clears that saved message too. No account, backend, analytics or external font service is needed.

## What's included

- **Frequency:** alphabetic or independent frequency ordering for ciphertext and English, both letter labels, exact counts, percentages and an Index of Coincidence explanation.
- **Bigrams and trigrams:** paired ciphertext/English percentage bars and top-30 tables with English percentages. Compare independently ranked groups or align the same group names. Ciphertext percentages use all overlapping groups; English percentages use Norvig’s complete within-word counts for that group length. The source counts and importer are checked in.
- **Caesar:** one left-shift operation, all 26 candidates, and independent formatting controls.
- **Substitution:** unsolved ciphertext stays uppercase; guessed plaintext is lowercase, highlighted and underlined. Includes duplicate checks, keyphrase generation and editable cipher alphabets.
- **Transposition:** block reordering and columnar routes, numeric and word keys, draggable columns and accessible arrow alternatives. Incomplete final rows need no padding.
- **Vigenère:** adjustable keys and individual shifts, input/output highlights for every letter at the selected key position, a live histogram for that stream, copyable column ciphertext, average-stream IC charts and exact values for lengths up to 20, and Kasiski factor votes with repeated 3–5-letter groups, positions and gaps. Highlighting skips spaces and punctuation and distinguishes repeated letters at different key positions.
- **Spreadsheet guide:** motivates transposition with a movable puzzle, then teaches cells, formulas, references, copying, MID and grid indices in small steps. Includes 23 actual Excel screenshot checkpoints and interactive MID/index exercises. Lesson 2 uses horizontal and vertical SEQUENCE helpers, a one-time values-only paste of column labels, and live formula columns that can move in place. The reusable solver covers widths 2–20, with fixed blank edges preserving the joined answer through moves. Uses ordinary references without the Excel spill-reference operator. SEQUENCE needs modern Excel or Google Sheets; a fill-handle fallback supports older Excel. Native Excel verified; live Google Sheets UI testing remains unverified.
- **Identification guide:** visible introductory definitions of bigrams, trigrams and overlapping groups, an interactive counting and IC starter, fuller four-cipher explanations, shared deck animations with readable colours, and mysteries that collect five yes/no observations before showing a tick/cross comparison grid. Correct choices have reduced-motion-aware emoji feedback.
- **Vigenère guide:** Caesar recap → two alternating shifts → letter-coded shifts → word keys. An aligned table connects message letters, key letters and shift numbers. Click key positions to highlight their input/output letters, click message letters to inspect shifts, or click a crib start. Includes history with sources, before/after letter and group comparisons, a hands-on Kasiski gap example, fuller crib/IC reasoning and a complete stream-solving workshop with stream highlights.
- **Substitution guide:** motivates why group guesses save work with a one-letter/three-letter comparison, then teaches THE → THA → HER with atomic guesses, contradiction checks, undo, individual clearing, optional word spaces and a solution reveal.
- **Deck:** one independent 10-slide cipher-analysis presentation. Demonstrations start on entry: typed text builds letter and pair histograms, labelled Caesar bars slide and wrap, substitution bars animate into rank order, and coloured practice columns move in three stages. A question-led comparison introduces transposition; a readable 15-letter grid demonstrates column moves before comparing row and column routes. Includes pause, steps, replay, reduced-motion controls, fullscreen and completed print examples.

### Conventions

Tools operate on English A–Z letters. Analysis ignores spaces and punctuation. Every output tool offers Preserve / Blocks of 5 / No spacing and an independent Keep punctuation toggle. Manual substitution always distinguishes uppercase ciphertext from lowercase guesses; other output modes offer an Uppercase toggle (off preserves the original letter case). Nonletters never advance the Vigenère key. Copy buttons are available for results; there are no text-download or output-to-input actions.

- **Caesar:** the selected shift is subtracted. Shift 3 maps D to A; shift 23 applies the opposite direction, mapping A to D.
- **Vigenère:** A=0, so BOT means shifts 1, 14, 19.
- **Substitution:** a keyphrase is deduplicated then followed by unused A–Z. The cipher alphabet maps plaintext A–Z to cipher letters. Manual solving maps in the opposite direction.
- **Transposition:** the default reads across the grid exactly as displayed. 52413 reads original columns 5, 2, 4, 1, 3; dragging changes this order directly. HOTEL gives 41523. Repeated letters sort left to right. The separate Reverse a known block key / Restore a columnar cipher methods reconstruct an encryption route and display the restored result grid. Use comma-separated numbers above 9; block sizes are 2–30.
- **Routes:** block transposition reads reordered rows; columnar transposition reads selected columns top to bottom. Columnar decoding accounts for unequal original column lengths.

All practice ciphertexts, deck examples and test fixtures are generated from original text written for this site. No National Cipher Challenge ciphertext is included. English group reference counts, ranks and percentages come from [Peter Norvig's Google Books analysis](https://www.norvig.com/mayzner.html); they count within words, whereas ciphertext groups can cross removed word boundaries. `scripts/import-ngram-reference.mjs` reproduces `src/data/englishNgrams.json` from the archive linked on that page. The imported `*/*` totals are the denominators, so percentages are not renormalized over only the top groups.

## Verify changes

```sh
pnpm format:check
pnpm check
pnpm lint
pnpm test:run
pnpm build
pnpm test:e2e
```

Unit tests check standard vectors, statistical counts, key conventions, all Caesar shifts, transposition round trips, repeat positions and factor votes, crib phase/conflicts, and atomic substitution hypotheses. Playwright covers generation/deciphering workflows, guide experiments and reveals, malformed keys, local persistence, all internal page links, desktop dragging, mobile arrow controls, deck navigation and print layouts.

Browser tests use an installed Google Chrome in an isolated headless profile; they never attach to your personal browser session. They start their own local server when needed. Install Google Chrome before running them, or change `channel` in `playwright.config.ts` to use Playwright's bundled Chromium. Browser artifacts go into ignored `test-results/`.

Set `PLAYWRIGHT_BASE_URL` to reuse a preview at another address (for example `http://localhost:4321` when a dev server is bound to localhost rather than 127.0.0.1). Clipboard test permissions follow the configured origin.

`pnpm verify` runs the complete sequence. CI installs bundled Chromium and runs the browser tests against the production build using `astro preview`; local tests use the development server. `PLAYWRIGHT_CHANNEL` can override the browser channel. Layout captures and test PDF handouts go into ignored `artifacts/`. The commit hook checks formatting, lint and unit tests directly, so it also works with this machine's older Git version.

## Structure and publishing

Astro builds static pages; a Preact island powers the tools and another powers the deck player. Plain CSS replaces the former Tailwind/DaisyUI stack. Production needs only Astro, its Preact integration and Preact. The checked-in pnpm lockfile makes CI reproducible. TypeScript stays on 6.x because the current Astro checker does not support 7.x.

Dependency overrides select patched Rollup and minimatch versions while upstream packages still resolve vulnerable releases. Lint, type checks, builds and browser tests cover the resulting dependency set.

- `src/utils/ciphers.ts`: pure cipher and analysis functions.
- `src/components/tools/Workbench.tsx`: shared input and tool UI.
- `src/pages/guides/`: written guides.
- `src/data/decks.ts`: slide content and presenter notes.
- `src/components/DeckPlayer.tsx`: presentation controls and print rendering.
- `tests/e2e/`: isolated browser workflows.

`pnpm build` writes `dist/`. `pnpm preview` serves that build. Existing GitHub Actions validate main and deploy passing builds to GitHub Pages. This project does not require Sites hosting or cloud services. No deployment is triggered by a local commit alone.

To add a tool, add its engine functions and meaningful vectors first, then expose it in the workbench. To add a deck, append an entry to `src/data/decks.ts`; Astro generates its route automatically.
