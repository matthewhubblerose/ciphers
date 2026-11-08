import { describe, expect, it } from "vitest";
import {
  ABC,
  caesar,
  chiSquared,
  coincidence,
  format,
  frequencies,
  kasiski,
  keyedAlphabet,
  keyLengths,
  letters,
  ngrams,
  parseOrder,
  substitute,
  transpose,
  vigenere,
} from "./ciphers";
import { PRACTICE, SAMPLES } from "./samples";
import { challenge3 } from "../../tests/fixtures/challenge3";

describe("classical ciphers", () => {
  it("matches known Caesar and Vigenère vectors", () => {
    expect(caesar("Attack at dawn!", 3, false)).toBe("DWWDFNDWGDZQ");
    expect(caesar("DWWDFN DW GDZQ!", 3, true, true)).toBe("ATTACK AT DAWN!");
    expect(vigenere("ATTACKATDAWN", "LEMON", false)).toBe("LXFOPVEFRNHR");
    expect(vigenere("LXFOP VEFRN HR", "LEMON")).toBe("ATTACKATDAWN");
    expect(vigenere("AAA", "BOT", false)).toBe("BOT");
    expect(() => vigenere("ABC", "123")).toThrow();
  });
  it("builds a unique keyed alphabet and rejects invalid alphabets", () => {
    const alphabet = keyedAlphabet("Balloon!");
    expect(alphabet).toBe("BALONCDEFGHIJKMPQRSTUVWXYZ");
    expect(substitute(substitute(PRACTICE, alphabet, false), alphabet)).toBe(letters(PRACTICE));
    expect(() => substitute("ABC", "A".repeat(26))).toThrow();
  });
  it("normalises block spacing and formats short final groups", () => {
    expect(letters("Abcde fghij!\nK")).toBe("ABCDEFGHIJK");
    expect(format("ABCDEFGHIJK")).toBe("ABCDE FGHIJ K");
    expect(format("ABC", 0, true)).toBe("abc");
    expect(format("")).toBe("");
  });
  it("interprets numeric read orders, words and repeated letters consistently", () => {
    expect(parseOrder("53124", 5)).toEqual([4, 2, 0, 1, 3]);
    expect(parseOrder(" 53124 ", 5)).toEqual([4, 2, 0, 1, 3]);
    expect(parseOrder("HOTEL", 5)).toEqual([3, 0, 4, 1, 2]);
    expect(parseOrder("BALLOON", 7)).toEqual([1, 0, 2, 3, 6, 4, 5]);
    expect(parseOrder("10,9,8,7,6,5,4,3,2,1", 10)[0]).toBe(9);
    for (const key of ["11111", "1234", "62345", "HOTELS", "1.2345"])
      expect(() => parseOrder(key, 5)).toThrow();
  });
  it("matches hand-calculated transposition examples", () => {
    const order = parseOrder("53124", 5);
    expect(transpose("WEAREDISCOVERED", order)).toBe("EAWEROSDICDRVEE");
    expect(transpose("WEAREDISCOVERED", order, false, true)).toBe("EODASRWDVEIERCE");
  });
  it("round-trips every final-row length, many keys, and both transposition routes", () => {
    for (let n = 2; n <= 15; n++)
      for (let length = 0; length < 100; length++) {
        const plain = ABC.repeat(4).slice(0, length);
        const order = Array.from({ length: n }, (_, i) => n - i - 1);
        for (const columnar of [true, false])
          expect(transpose(transpose(plain, order, false, columnar), order, true, columnar)).toBe(
            plain,
          );
      }
  });
  it("round-trips every Caesar shift and varied Vigenère key lengths", () => {
    for (let shift = 0; shift < 26; shift++)
      expect(caesar(caesar(PRACTICE, shift, false), shift)).toBe(letters(PRACTICE));
    for (const key of ["A", "BOT", "LEMON", "LONGERTHANTHEMESSAGE"])
      expect(vigenere(vigenere(PRACTICE, key, false), key)).toBe(letters(PRACTICE));
  });
});
describe("analysis", () => {
  it("handles a real grouped Challenge 3 Part B excerpt without losing letters", () => {
    expect(letters(challenge3)).toHaveLength(200);
    expect(frequencies(challenge3).reduce((sum, f) => sum + f.count, 0)).toBe(200);
    const order = parseOrder("HOTEL", 5);
    for (const columnar of [true, false]) {
      const rearranged = transpose(challenge3, order, true, columnar);
      expect(frequencies(rearranged)).toEqual(frequencies(challenge3));
      expect(transpose(rearranged, order, false, columnar)).toBe(letters(challenge3));
    }
  });
  it("counts overlapping groups across presentation spaces", () => {
    expect(ngrams("AA AAA", 2)).toEqual([{ gram: "AA", count: 4, percent: 100 }]);
    expect(ngrams("AAAAA", 3)[0].count).toBe(3);
    expect(ngrams("A", 3)).toEqual([]);
    expect(frequencies("Aab!")[0]).toMatchObject({ count: 2, percent: 200 / 3 });
    expect(frequencies("").every((f) => f.percent === 0)).toBe(true);
  });
  it("computes coincidence and repeated trigram distances", () => {
    expect(coincidence("AAAA")).toBe(1);
    expect(coincidence("ABCD")).toBe(0);
    expect(coincidence("A")).toBe(0);
    expect(kasiski("ABCXYZABC")[0]).toMatchObject({ gram: "ABC", positions: [0, 6], gaps: [6] });
    expect(keyLengths("")).toEqual([]);
  });
  it("finds a plausible length and the correct per-column shifts for BOT", () => {
    const cipher = SAMPLES[4].text;
    const scores = keyLengths(cipher);
    expect(scores.find((k) => k.length === 3)!.ic).toBeGreaterThan(
      scores.find((k) => k.length === 1)!.ic,
    );
    for (let i = 0; i < 3; i++) {
      const column = [...cipher].filter((_, j) => j % 3 === i).join("");
      const shifts = Array.from({ length: 26 }, (_, s) => ({
        s,
        score: chiSquared(caesar(column, s)),
      })).sort((a, b) => a.score - b.score);
      expect(shifts[0].s).toBe(ABC.indexOf("BOT"[i]));
    }
  });
  it("uses THE as the leading trigram in the guide example", () => {
    expect(letters(PRACTICE).length).toBeGreaterThan(2500);
    expect(coincidence(PRACTICE)).toBeGreaterThan(0.06);
    expect(coincidence(PRACTICE)).toBeLessThan(0.075);
    expect(ngrams(PRACTICE, 3)[0].gram).toBe("THE");
    expect(SAMPLES.map((s) => s.text.length).every((n) => n === letters(PRACTICE).length)).toBe(
      true,
    );
  });
});
