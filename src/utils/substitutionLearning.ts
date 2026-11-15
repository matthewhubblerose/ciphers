import { letters } from "./ciphers";

export type GuessMap = Record<string, string>;
// Apply a hypothesis atomically. Existing guesses stay put until explicitly cleared or undone.
export function tryGroup(
  mapping: GuessMap,
  cipher: string,
  plain: string,
): { mapping: GuessMap; error?: string } {
  const c = letters(cipher),
    p = letters(plain),
    next = { ...mapping };
  if (!c || c.length !== p.length)
    return { mapping, error: "Use the same number of A–Z letters in both groups." };
  for (let i = 0; i < c.length; i++) {
    if (next[c[i]] && next[c[i]] !== p[i])
      return {
        mapping,
        error: `${c[i]} already means ${next[c[i]].toLowerCase()}. Undo or clear that guess first.`,
      };
    if (Object.entries(next).some(([letter, value]) => letter !== c[i] && value === p[i]))
      return {
        mapping,
        error: `${p[i].toLowerCase()} is already used by a different cipher letter. A simple substitution must be one-to-one.`,
      };
    next[c[i]] = p[i];
  }
  return { mapping: next };
}
export const partialDecode = (text: string, mapping: GuessMap) =>
  [...text.toUpperCase()].map((c) => mapping[c]?.toLowerCase() || c).join("");
