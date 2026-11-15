import { describe, expect, it } from "vitest";
import { factorVotes, repeatedGroups, cribKey } from "./vigenereAnalysis";
import { keyLengths, vigenere } from "./ciphers";
import { PRACTICE } from "./samples";

describe("Vigenère evidence", () => {
  it("measures one-based repeat starts, including overlaps and formatting", () => {
    expect(repeatedGroups("ABC XYZ! ABCXYZABC").find((r) => r.group === "ABC")).toEqual({
      group: "ABC",
      positions: [1, 7, 13],
      gaps: [6, 6],
    });
    expect(repeatedGroups("AAAAA")[0]).toEqual({
      group: "AAA",
      positions: [1, 2, 3],
      gaps: [1, 1],
    });
    expect(repeatedGroups("AB")).toEqual([]);
  });
  it("votes for divisors, excluding one, and permits longer repeats", () => {
    const votes = factorVotes("ABCXYZABCXYZABC", 3, 8);
    expect(votes.find((v) => v.length === 3)?.votes).toBeGreaterThan(0);
    expect(votes.find((v) => v.length === 5)?.votes).toBe(0);
    expect(repeatedGroups("ABCDEABCDE", 5)[0]).toMatchObject({ group: "ABCDE", gaps: [5] });
  });
  it("finds MAP and its multiples by average stream IC on original prose", () => {
    const scores = keyLengths(vigenere(PRACTICE, "MAP", false));
    expect(scores.find((s) => s.length === 3)!.ic).toBeGreaterThan(scores[0].ic + 0.01);
    expect(scores.find((s) => s.length === 6)!.ic).toBeGreaterThan(0.06);
  });
  it("derives crib shifts at the correct phase and detects inconsistent guesses", () => {
    const cipher = vigenere("MEETATTHEOAKTREE", "MAP", false);
    expect(cribKey(cipher, "MEET", 0, 3)).toMatchObject({ key: "MAP", conflict: false });
    expect(cribKey(cipher, "EET", 1, 3)).toMatchObject({ key: "MAP", conflict: false });
    expect(cribKey(cipher, "MEET", 0, 2).conflict).toBe(true);
    expect(cribKey("X", "A", 0, 3).key).toBe("X??");
  });
});
