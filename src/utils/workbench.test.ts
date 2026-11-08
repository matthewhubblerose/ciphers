import { describe, expect, it } from "vitest";
import { caesar, parseOrder, transpose } from "./ciphers";
import {
  formatOutput,
  frequencyComparison,
  gapSummary,
  keyColumn,
  ENGLISH_GROUPS,
} from "./workbench";
import { challenge3, challenge3Order, challenge3Opening } from "../../tests/fixtures/challenge3";

describe("output formatting", () => {
  const source = "Ab cde! fg\nhij?",
    shifted = caesar(source, 23);
  it("preserves whitespace, punctuation and individual letter case independently", () => {
    expect(
      formatOutput(shifted, source, {
        spacing: "preserve",
        keepPunctuation: true,
        uppercase: false,
      }),
    ).toBe("De fgh! ij\nklm?");
    expect(
      formatOutput(shifted, source, {
        spacing: "preserve",
        keepPunctuation: false,
        uppercase: true,
      }),
    ).toBe("DE FGH IJ\nKLM");
    expect(
      formatOutput(shifted, source, { spacing: "none", keepPunctuation: true, uppercase: false }),
    ).toBe("Defgh!ijklm?");
  });
  it("counts only letters when adding blocks, including punctuation at block boundaries", () => {
    expect(
      formatOutput(shifted, source, { spacing: "blocks", keepPunctuation: true, uppercase: true }),
    ).toBe("DEFGH! IJKLM?");
    expect(
      formatOutput("··ABC", "abcde", {
        spacing: "blocks",
        keepPunctuation: false,
        uppercase: false,
      }),
    ).toBe("··abc");
    expect(
      formatOutput("", "", { spacing: "blocks", keepPunctuation: true, uppercase: true }),
    ).toBe("");
  });
});
describe("visual analysis", () => {
  it("ranks the ciphertext and English independently and keeps both letter labels", () => {
    const ranked = frequencyComparison("ZZZZBBBA", true);
    expect(ranked[0]).toMatchObject({
      letter: "Z",
      count: 4,
      englishLetter: "E",
      englishPercent: 12.702,
    });
    expect(ranked[1]).toMatchObject({ letter: "B", count: 3, englishLetter: "T" });
    expect(frequencyComparison("ZZZZ")[0]).toMatchObject({ letter: "A", englishLetter: "A" });
  });
  it("extracts the selected Vigenère stream without advancing on whitespace or punctuation", () => {
    expect(keyColumn("LXFOP VEFRN HR!", 5, 0)).toBe("LVH");
    expect(keyColumn("A-B C\nD!E F", 3, 1)).toBe("BE");
  });
  it("summarises repeated-group gaps into a small table", () => {
    const summary = gapSummary("ABCXYZABCXYZABC");
    expect(summary[0]).toMatchObject({ gap: 6 });
    expect(summary.length).toBeLessThanOrEqual(10);
    expect(gapSummary("ABCD")).toEqual([]);
    for (const n of [2, 3]) {
      expect(ENGLISH_GROUPS[n]).toHaveLength(30);
      expect(new Set(ENGLISH_GROUPS[n]).size).toBe(30);
    }
  });
});
describe("visible transposition order", () => {
  it("preserves the case of each moved letter", () => {
    const source = "AbCdE",
      order = parseOrder("52413", 5);
    const shuffled = transpose(source, order, false, false, true);
    expect(shuffled).toBe("EbdAC");
    expect(
      formatOutput(shuffled, source, {
        spacing: "none",
        keepPunctuation: false,
        uppercase: false,
        preserveOutputCase: true,
      }),
    ).toBe("EbdAC");
    expect(transpose(shuffled, order, true, false, true)).toBe(source);
  });
  it("reads the Challenge 3 B grid directly in order 52413", () => {
    const output = transpose(challenge3, parseOrder(challenge3Order, 5));
    expect(output.startsWith(challenge3Opening)).toBe(true);
    expect(output.slice(0, 15)).not.toBe("EEMZTTNIEHNIDRE");
  });
});
