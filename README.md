# Ciphers

A classroom field kit for classical cipher challenges: a shared interactive workbench, two practical guides, and two browser-based lesson decks.

## Run locally

Use Node 24 LTS and pnpm 10.18.3 (the version declared in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open <http://localhost:4321/ciphers/>. The `/ciphers` base path preserves the existing GitHub Pages deployment. All cipher operations run locally in the browser. The message is saved in this browser's local storage; Clear text clears that saved message too. No account, backend, analytics or external font service is needed.

## What's included

- **Frequency:** alphabetic or frequency ordering, English overlay, exact counts, percentages and index of coincidence.
- **Bigrams and trigrams:** overlapping groups across cipher display spaces, counts and percentages.
- **Caesar:** generation and deciphering, all 26 candidates, shift controls.
- **Substitution:** manual cipher-to-plain guesses, duplicate checks, keyphrase generation and editable cipher alphabets.
- **Transposition:** block reordering and columnar routes, numeric and word keys, draggable columns and accessible arrow alternatives. Incomplete final rows need no padding.
- **Vigenère:** generation and deciphering, adjustable key length and each key character, IC length candidates, Kasiski repeats and per-column chi-squared suggestions.
- **Guides:** frequency/bigram/trigram analysis with an original worked substitution example; transposition in Excel with copyable formulas, fixed-value dragging, numeric keys and word keys.
- **Decks:** the same lessons in 12 and 13 slides, keyboard navigation, shareable slide hashes, fullscreen, teacher notes and Print / Save PDF.

### Conventions

Tools operate on English A–Z letters. Analysis always ignores spaces and punctuation. Cipher output can be continuous, in groups of 5 or 10, or lowercase. Letter-replacement ciphers can preserve original spacing and punctuation instead. Nonletters never advance the Vigenère key. These classical ciphers are learning tools.

- **Caesar:** encryption adds the shift; deciphering subtracts it.
- **Vigenère:** A=0, so BOT means shifts 1, 14, 19.
- **Substitution:** a keyphrase is deduplicated then followed by unused A–Z. The cipher alphabet maps plaintext A–Z to cipher letters. Manual solving maps in the opposite direction.
- **Transposition:** 53124 means read original columns 5, 3, 1, 2, 4. HOTEL sorts E, H, L, O, T, giving read order 41523. Repeated letters sort left to right. This is a read-order convention, not the alphabetical ranks written beneath a word. Decipher reverses the encryption order. Dragging edits that order; the grid is a preview of the input, not a second independent key. Use comma-separated numbers for sizes above 9. Block sizes are 2–30.
- **Routes:** block transposition reads reordered rows; columnar transposition reads selected columns top to bottom. Columnar decoding accounts for unequal original column lengths.

The original practice samples are generated from one known plaintext. A short, attributed excerpt from [National Cipher Challenge 2026, Challenge 3 Part B](https://www.cipherchallenge.org/challenge/challenge-3/) is also used in regression tests; it includes no solution or guessed key.

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
- `src/pages/guides/`: readable lessons.
- `src/data/decks.ts`: slide content and teacher notes.
- `src/components/DeckPlayer.tsx`: presentation controls and print rendering.
- `tests/e2e/`: isolated browser workflows.

`pnpm build` writes `dist/`. `pnpm preview` serves that build. Existing GitHub Actions validate main and deploy passing builds to GitHub Pages. This project does not require Sites hosting or cloud services. No deployment is triggered by a local commit alone.

To add a tool, add its engine functions and meaningful vectors first, then expose it in the workbench. To add a deck, append an entry to `src/data/decks.ts`; Astro generates its route automatically.
