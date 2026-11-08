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
- **Bigrams and trigrams:** overlapping counts and percentages alongside top-30 English reference tables, with frequency or alphabetical ordering.
- **Caesar:** one left-shift operation, all 26 candidates, and independent formatting controls.
- **Substitution:** manual cipher-to-plain guesses, duplicate checks, keyphrase generation and editable cipher alphabets.
- **Transposition:** block reordering and columnar routes, numeric and word keys, draggable columns and accessible arrow alternatives. Incomplete final rows need no padding.
- **Vigenère:** adjustable keys and individual shifts, a live histogram for the selected key position, copyable column ciphertext, key-length candidates and a compact repeated-group gap table.
- **Guide:** one beginner Excel walkthrough, from cells, formulas and fixed references to a generated grid, fixed-value column moves and a copyable result. Screenshots come from the real Excel worksheet ranges and exclude application side panes.
- **Deck:** one independent 10-slide cipher-analysis presentation. Demonstrations start on entry: typed text builds letter and pair histograms, labelled Caesar bars slide and wrap, substitution bars animate into rank order, and coloured Challenge 3 B columns move in three stages. A question-led comparison introduces transposition; a readable 15-letter grid demonstrates column moves before comparing row and column routes. Includes pause, steps, replay, reduced-motion controls, fullscreen and completed print examples.

### Conventions

Tools operate on English A–Z letters. Analysis ignores spaces and punctuation. Every output tool offers Preserve / Blocks of 5 / No spacing, an independent Keep punctuation toggle, and an Uppercase toggle (off preserves the original letter case). Nonletters never advance the Vigenère key. Copy buttons are available for results; there are no text-download or output-to-input actions.

- **Caesar:** the selected shift is subtracted. Shift 3 maps D to A; shift 23 applies the opposite direction, mapping A to D.
- **Vigenère:** A=0, so BOT means shifts 1, 14, 19.
- **Substitution:** a keyphrase is deduplicated then followed by unused A–Z. The cipher alphabet maps plaintext A–Z to cipher letters. Manual solving maps in the opposite direction.
- **Transposition:** the default reads across the grid exactly as displayed. 52413 reads original columns 5, 2, 4, 1, 3; dragging changes this order directly. HOTEL gives 41523. Repeated letters sort left to right. The separate Reverse a known block key / Restore a columnar cipher methods reconstruct an encryption route and display the restored result grid. Use comma-separated numbers above 9; block sizes are 2–30.
- **Routes:** block transposition reads reordered rows; columnar transposition reads selected columns top to bottom. Columnar decoding accounts for unequal original column lengths.

The original practice samples are generated from one known plaintext. An attributed excerpt from [National Cipher Challenge 2026, Challenge 3 Part B](https://www.cipherchallenge.org/challenge/challenge-3/) verifies that order 52413 reads MEETZINTHEDINER in both the grid and output. English group reference ranks come from [Peter Norvig’s Google Books analysis](https://www.norvig.com/mayzner.html); they count within words, whereas ciphertext groups can cross removed word boundaries.

## Verify changes

```sh
pnpm format:check
pnpm check
pnpm lint
pnpm test:run
pnpm build
pnpm test:e2e
```

Unit tests check standard vectors, statistical counts, key conventions, all Caesar shifts, and transposition round trips across sizes and short final rows. Playwright covers complete generation/deciphering workflows, malformed keys, local persistence, all internal page links, desktop dragging, mobile arrow controls, deck navigation and print layouts.

Browser tests use an installed Google Chrome in an isolated headless profile; they never attach to your personal browser session. They start their own local server when needed. Install Google Chrome before running them, or change `channel` in `playwright.config.ts` to use Playwright's bundled Chromium. Browser artifacts go into ignored `test-results/`.

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
