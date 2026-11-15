import { describe, expect, it } from "vitest";
import { partialDecode, tryGroup } from "./substitutionLearning";
import {
  encodedGroup,
  SUBSTITUTION_CIPHER,
  SUBSTITUTION_PLAIN,
} from "../data/substitutionPractice";
import { ngrams, frequencies } from "./ciphers";

describe("linked substitution hypotheses", () => {
  it("extends THE through THA and HER without erasing existing guesses", () => {
    let map = tryGroup({}, encodedGroup("THE"), "THE").mapping;
    expect(partialDecode(encodedGroup("THE THA HER"), map)).toMatch(/^theth[A-Z]he[A-Z]$/);
    map = tryGroup(map, encodedGroup("THA"), "THA").mapping;
    map = tryGroup(map, encodedGroup("HER"), "HER").mapping;
    expect(partialDecode(encodedGroup("THE THA HER"), map)).toBe("thethaher");
    expect(Object.keys(map)).toHaveLength(5);
  });
  it("rejects contradictory mappings, repeated-letter mismatch and duplicates atomically", () => {
    const original = { X: "T" };
    for (const [c, p] of [
      ["XYZ", "THEE"],
      ["XYZ", "AND"],
      ["ABC", "THE"],
      ["XX", "TH"],
      ["AB", "EE"],
    ]) {
      expect(tryGroup(original, c, p).error).toBeTruthy();
      expect(tryGroup(original, c, p).mapping).toEqual(original);
    }
    expect(partialDecode("XYZ!", original)).toBe("tYZ!");
  });
  it("uses an original passage that actually supports the taught frequency clues", () => {
    expect(ngrams(SUBSTITUTION_PLAIN, 3)[0].gram).toBe("THE");
    expect(["TH", "HE"]).toContain(ngrams(SUBSTITUTION_PLAIN, 2)[0].gram);
    expect(frequencies(SUBSTITUTION_PLAIN).sort((a, b) => b.count - a.count)[0].letter).toBe("E");
    for (const group of ["THE", "THA", "HER"])
      expect(ngrams(SUBSTITUTION_CIPHER, 3).some((g) => g.gram === encodedGroup(group))).toBe(true);
  });
});
