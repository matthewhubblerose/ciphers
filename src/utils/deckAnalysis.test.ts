import { describe, expect, it } from "vitest";
import { ABC, frequencies, letters, mod, transpose } from "./ciphers";
import {
  ANALYSIS_TEXT,
  CAESAR_SHIFT,
  CAESAR_TEXT,
  CHALLENGE_PLAIN,
  decodedCaesar,
  letterPairs,
  repeatedAlphabet,
  shortChallenge,
  SUB_ALPHABET,
  substitutionGroups,
  transpositionGroups,
  wordBigramPairs,
  typingWindow,
  ROUTE_MESSAGE,
  ROUTE_ORDER,
} from "./deckAnalysis";
import { CHALLENGE_ORDER, CHALLENGE_TEXT } from "../data/challenge";

describe("analysis deck examples", () => {
  it("keeps characters fixed until a whole third line is complete", () => {
    const text = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    expect(typingWindow(text, 14, 5).lines.map((l) => l.text)).toEqual(["ABCDE", "FGHIJ", "KLMN"]);
    const next = typingWindow(text, 15, 5);
    expect(next.firstLine).toBe(1);
    expect(next.lines.map((l) => l.text)).toEqual(["FGHIJ", "KLMNO", ""]);
    expect(typingWindow(text, 16, 5).lines.map((l) => l.text)).toEqual(["FGHIJ", "KLMNO", "P"]);
  });
  it("starts the route example with fifteen readable letters", () => {
    expect(ROUTE_MESSAGE).toHaveLength(15);
    expect(ROUTE_MESSAGE).toBe("LETSMOVELETTERS");
    expect(transpose(ROUTE_MESSAGE, ROUTE_ORDER)).toBe("MTLESEEOVLSETTR");
    expect(transpose(ROUTE_MESSAGE, ROUTE_ORDER, false, true)).toBe("MESTEELOTEVTSLR");
  });
  it("shows a steadier English fingerprint with the full sample", () => {
    const error = (rows: ReturnType<typeof letterPairs>) =>
      rows.reduce((sum, r) => sum + Math.abs(r.value - r.reference), 0);
    expect(error(letterPairs(ANALYSIS_TEXT))).toBeLessThan(
      error(letterPairs(ANALYSIS_TEXT.slice(0, 25))),
    );
    expect(error(wordBigramPairs(ANALYSIS_TEXT))).toBeLessThan(
      error(wordBigramPairs(ANALYSIS_TEXT.slice(0, 25))),
    );
    expect(wordBigramPairs("T H").every((r) => r.value === 0)).toBe(true);
    expect(wordBigramPairs("TH")[0].value).toBe(100);
  });
  it("repeats thirteen letters on either side and aligns the Caesar counts at seven", () => {
    expect(repeatedAlphabet).toHaveLength(52);
    expect(repeatedAlphabet.slice(13, 39).join("")).toBe(ABC);
    expect(repeatedAlphabet.slice(0, 13).join("")).toBe(ABC.slice(13));
    expect(repeatedAlphabet.slice(39).join("")).toBe(ABC.slice(0, 13));
    const cipher = frequencies(CAESAR_TEXT),
      plain = frequencies(ANALYSIS_TEXT);
    for (let i = 0; i < 26; i++) expect(cipher[mod(i + CAESAR_SHIFT)].count).toBe(plain[i].count);
    expect(decodedCaesar(CAESAR_SHIFT)).toBe(ANALYSIS_TEXT.toUpperCase());
  });
  it("uses a non-Caesar substitution preserving every mapped group count", () => {
    expect(new Set([...SUB_ALPHABET].map((c, i) => mod(ABC.indexOf(c) - i))).size).toBeGreaterThan(
      1,
    );
    for (const n of [2, 3])
      for (const pair of substitutionGroups(n)) expect(pair.value).toBeCloseTo(pair.reference, 10);
  });
  it("restores the real challenge while changing neighbours but preserving letters", () => {
    expect(transpose(shortChallenge, CHALLENGE_ORDER)).toBe("MEETZINTHEDINER");
    expect(CHALLENGE_PLAIN.startsWith("MEETZINTHEDINER")).toBe(true);
    expect([...letters(CHALLENGE_TEXT)].sort()).toEqual([...CHALLENGE_PLAIN].sort());
    for (const n of [2, 3])
      expect(transpositionGroups(n).some((p) => Math.abs(p.value - p.reference) > 0.5)).toBe(true);
  });
});
