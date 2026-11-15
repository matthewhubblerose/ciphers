// Reproduce src/data/englishNgrams.json from Norvig's published archive.
// Usage: node scripts/import-ngram-reference.mjs path/to/ngrams-all.tsv.zip
// Despite its .zip name, the published file contains concatenated gzip members.
import fs from "node:fs";
import { gunzipSync } from "node:zlib";
import process from "node:process";
import console from "node:console";
const input = process.argv[2];
if (!input) throw new Error("Supply the downloaded Norvig n-gram archive.");
const counts = { 2: {}, 3: {} };
for (const line of gunzipSync(fs.readFileSync(input)).toString("utf8").split("\n")) {
  const [gram, raw] = line.split("\t");
  if (/^[A-Z]{2,3}$/.test(gram)) counts[gram.length][gram] = Number(raw);
}
const totals = Object.fromEntries(
  Object.entries(counts).map(([n, rows]) => [n, Object.values(rows).reduce((a, b) => a + b, 0)]),
);
fs.writeFileSync(
  "src/data/englishNgrams.json",
  JSON.stringify(
    {
      source: "https://www.norvig.com/mayzner.html",
      archive: "https://www.norvig.com/tsv/ngrams-all.tsv.zip",
      basis: "Within-word groups, weighted by Google Books word counts; column */*",
      totals,
      counts,
    },
    null,
    2,
  ) + "\n",
);
console.log({
  totals,
  TH: (100 * counts[2].TH) / totals[2],
  THE: (100 * counts[3].THE) / totals[3],
});
