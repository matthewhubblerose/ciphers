import reference from "../data/englishNgrams.json";
import { ngrams } from "./ciphers";

export function englishGroups(n: number) {
  const counts: Record<string, number> = n === 2 ? reference.counts[2] : reference.counts[3];
  const total = n === 2 ? reference.totals[2] : reference.totals[3];
  return Object.entries(counts)
    .map(([gram, count]) => ({ gram, count, percent: (100 * count) / total }))
    .sort((a, b) => b.count - a.count || a.gram.localeCompare(b.gram));
}
export function englishGroupPercent(gram: string) {
  const counts: Record<string, number> =
    gram.length === 2 ? reference.counts[2] : reference.counts[3];
  const total = gram.length === 2 ? reference.totals[2] : reference.totals[3];
  return (100 * (counts[gram] ?? 0)) / total;
}
export function groupComparison(text: string, n: number, ranked = true, limit = 10) {
  const cipher = ngrams(text, n),
    english = englishGroups(n);
  if (ranked)
    return Array.from(
      { length: Math.min(limit, Math.max(cipher.length, english.length)) },
      (_, i) => ({
        cipherGram: cipher[i]?.gram ?? "—",
        cipherCount: cipher[i]?.count ?? 0,
        cipherPercent: cipher[i]?.percent ?? 0,
        englishGram: english[i]?.gram ?? "—",
        englishPercent: english[i]?.percent ?? 0,
      }),
    );
  const actual = new Map(cipher.map((g) => [g.gram, g]));
  return [...new Set([...cipher.slice(0, limit), ...english.slice(0, limit)].map((g) => g.gram))]
    .sort()
    .map((gram) => ({
      cipherGram: gram,
      cipherCount: actual.get(gram)?.count ?? 0,
      cipherPercent: actual.get(gram)?.percent ?? 0,
      englishGram: gram,
      englishPercent: englishGroupPercent(gram),
    }));
}
