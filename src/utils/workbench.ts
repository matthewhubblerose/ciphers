import { frequencies, kasiski } from "./ciphers";

export type Spacing = "preserve" | "blocks" | "none";
export interface OutputOptions {
  spacing: Spacing;
  keepPunctuation: boolean;
  uppercase: boolean;
  preserveOutputCase?: boolean;
}

// Reinsert formatting after a letters-only operation; punctuation never counts as a letter.
export function formatOutput(output: string, source: string, options: OutputOptions) {
  let index = 0,
    count = 0,
    result = "";
  for (const c of source) {
    if (/[A-Za-z]/.test(c)) {
      if (index >= output.length) break;
      const next = output[index++];
      if (options.spacing === "blocks" && count > 0 && count % 5 === 0) result += " ";
      result += options.uppercase
        ? next.toUpperCase()
        : options.preserveOutputCase
          ? next
          : c === c.toLowerCase()
            ? next.toLowerCase()
            : next;
      count++;
    } else if (/\s/.test(c)) {
      if (options.spacing === "preserve") result += c;
    } else if (options.keepPunctuation) result += c;
  }
  return result;
}

export function frequencyComparison(text: string, ranked = false) {
  const cipher = frequencies(text);
  const english = frequencies("");
  if (ranked) {
    cipher.sort((a, b) => b.count - a.count || a.letter.localeCompare(b.letter));
    english.sort((a, b) => b.english - a.english || a.letter.localeCompare(b.letter));
  }
  return cipher.map((entry, i) => ({
    ...entry,
    englishLetter: english[i].letter,
    englishPercent: english[i].english,
  }));
}

export function gapSummary(text: string) {
  const gaps = new Map<number, { gap: number; count: number; groups: Set<string> }>();
  for (const entry of kasiski(text))
    for (const gap of entry.gaps) {
      const item = gaps.get(gap) ?? { gap, count: 0, groups: new Set<string>() };
      item.count++;
      item.groups.add(entry.gram);
      gaps.set(gap, item);
    }
  return [...gaps.values()]
    .sort((a, b) => b.count - a.count || a.gap - b.gap)
    .slice(0, 10)
    .map((item) => ({ ...item, groups: [...item.groups].slice(0, 3).join(", ") }));
}

export function keyColumn(text: string, length: number, position: number) {
  return [...text.toUpperCase().replace(/[^A-Z]/g, "")]
    .filter((_, i) => i % length === position)
    .join("");
}

// Ranked within-word sequences from Peter Norvig's Google Books analysis.
// https://www.norvig.com/mayzner.html — the tables are reference ranks, not predicted counts.
export const ENGLISH_GROUPS: Record<number, string[]> = {
  2: "TH HE IN ER AN RE ON AT EN ND TI ES OR TE OF ED IS IT AL AR ST TO NT NG SE HA AS OU IO LE".split(
    " ",
  ),
  3: "THE AND ING ION TIO ENT ATI FOR HER TER HAT THA ERE ATE HIS CON RES VER ALL ONS NCE MEN ITH TED ERS PRO THI WIT ARE ESS".split(
    " ",
  ),
};
export const IC_HELP =
  "The probability that two letters picked at different positions are the same. English is often around 0.066; uniformly random A–Z text around 0.038. Substitution and transposition preserve it. Short messages can vary greatly.";
