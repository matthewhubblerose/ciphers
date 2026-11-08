import {
  ABC,
  caesar,
  ENGLISH,
  frequencies,
  keyedAlphabet,
  letters,
  mod,
  ngrams,
  substitute,
  transpose,
} from "./ciphers";
import { PRACTICE } from "./samples";
import { CHALLENGE_ORDER, CHALLENGE_TEXT } from "../data/challenge";

export const ANALYSIS_TEXT = PRACTICE;
export const CAESAR_SHIFT = 7;
export const CAESAR_TEXT = caesar(ANALYSIS_TEXT, CAESAR_SHIFT, false, true);
export const SUB_ALPHABET = keyedAlphabet("ORANGE");
export const SUB_TEXT = substitute(ANALYSIS_TEXT, SUB_ALPHABET, false, true);
export const CHALLENGE_PLAIN = transpose(CHALLENGE_TEXT, CHALLENGE_ORDER);
export const BIGRAM_REFERENCE = [
  ["TH", 3.56],
  ["HE", 3.07],
  ["IN", 2.43],
  ["ER", 2.05],
  ["AN", 1.99],
  ["RE", 1.85],
  ["ON", 1.76],
  ["AT", 1.49],
  ["EN", 1.45],
  ["ND", 1.35],
  ["TI", 1.34],
  ["ES", 1.34],
] as const;
export interface PlotPair {
  label: string;
  referenceLabel: string;
  value: number;
  reference: number;
}
export function letterPairs(text: string, ranked = false, referenceText?: string): PlotPair[] {
  const actual = frequencies(text),
    reference = referenceText
      ? frequencies(referenceText).map((f) => ({ letter: f.letter, value: f.percent }))
      : [...ABC].map((letter, i) => ({ letter, value: ENGLISH[i] }));
  if (ranked) {
    actual.sort((a, b) => b.percent - a.percent || a.letter.localeCompare(b.letter));
    reference.sort((a, b) => b.value - a.value || a.letter.localeCompare(b.letter));
  }
  return actual.map((f, i) => ({
    label: f.letter,
    referenceLabel: reference[i].letter,
    value: f.percent,
    reference: reference[i].value,
  }));
}
// The published bigram reference counts within words, so the typing demonstration does too.
export function wordBigramPairs(text: string): PlotPair[] {
  const counts = new Map<string, number>();
  let total = 0;
  for (const word of text.toUpperCase().match(/[A-Z]+/g) ?? [])
    for (let i = 0; i < word.length - 1; i++) {
      const gram = word.slice(i, i + 2);
      counts.set(gram, (counts.get(gram) ?? 0) + 1);
      total++;
    }
  return BIGRAM_REFERENCE.map(([gram, value]) => ({
    label: gram,
    referenceLabel: gram,
    value: total ? ((counts.get(gram) ?? 0) / total) * 100 : 0,
    reference: value,
  }));
}
export function substitutionGroups(n: number): PlotPair[] {
  const cipher = new Map(ngrams(SUB_TEXT, n).map((g) => [g.gram, g.percent]));
  return ngrams(ANALYSIS_TEXT, n)
    .slice(0, 8)
    .map((g) => {
      const label = substitute(g.gram, SUB_ALPHABET, false);
      return { label, referenceLabel: g.gram, value: cipher.get(label) ?? 0, reference: g.percent };
    });
}
export function transpositionGroups(n: number): PlotPair[] {
  const cipher = new Map(ngrams(CHALLENGE_TEXT, n).map((g) => [g.gram, g.percent]));
  return ngrams(CHALLENGE_PLAIN, n)
    .slice(0, 8)
    .map((g) => ({
      label: g.gram,
      referenceLabel: g.gram,
      value: cipher.get(g.gram) ?? 0,
      reference: g.percent,
    }));
}
export const repeatedAlphabet = Array.from({ length: 52 }, (_, i) => ABC[mod(i - 13)]);
export const decodedCaesar = (shift: number) => caesar(CAESAR_TEXT, shift, true, true);
export const shortChallenge = letters(CHALLENGE_TEXT).slice(0, 15);

export const ROUTE_MESSAGE = "LETSMOVELETTERS";
export const ROUTE_ORDER = [4, 2, 0, 1, 3];

export function typingWindow(text: string, position: number, columns: number) {
  const width = Math.max(1, Math.floor(columns));
  const cursor = Math.max(0, Math.min(position, text.length));
  const activeLine = Math.floor(cursor / width);
  const firstLine = Math.max(0, activeLine - 2);
  return {
    firstLine,
    columns: width,
    lines: Array.from({ length: 3 }, (_, i) => {
      const index = firstLine + i,
        start = index * width;
      return {
        index,
        start,
        text: text.slice(Math.min(start, cursor), Math.min(start + width, cursor)),
        active: index === activeLine,
      };
    }),
  };
}
