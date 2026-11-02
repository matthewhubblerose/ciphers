export const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ENGLISH = [
  8.167, 1.492, 2.782, 4.253, 12.702, 2.228, 2.015, 6.094, 6.966, 0.153, 0.772, 4.025, 2.406, 6.749,
  7.507, 1.929, 0.095, 5.987, 6.327, 9.056, 2.758, 0.978, 2.36, 0.15, 1.974, 0.074,
];
export const letters = (text: string) => text.toUpperCase().replace(/[^A-Z]/g, "");
export const mod = (n: number) => ((n % 26) + 26) % 26;
export function format(text: string, grouping = 5, lower = false) {
  const value = lower ? text.toLowerCase() : text.toUpperCase();
  return grouping > 0
    ? (value.match(new RegExp(`.{1,${Math.min(100, Math.max(1, grouping))}}`, "g"))?.join(" ") ??
        "")
    : value;
}
export function transform(
  text: string,
  fn: (letter: string, index: number) => string,
  preserve = false,
) {
  let index = 0;
  return text
    .toUpperCase()
    .split("")
    .map((c) => (/[A-Z]/.test(c) ? fn(c, index++) : preserve ? c : ""))
    .join("");
}
export const caesar = (text: string, shift: number, decrypt = true, preserve = false) =>
  transform(text, (c) => ABC[mod(ABC.indexOf(c) + (decrypt ? -shift : shift))], preserve);
export function vigenere(text: string, key: string, decrypt = true, preserve = false) {
  const clean = letters(key);
  if (!clean) throw new Error("Enter a key containing at least one letter.");
  return transform(
    text,
    (c, i) => ABC[mod(ABC.indexOf(c) + (decrypt ? -1 : 1) * ABC.indexOf(clean[i % clean.length]))],
    preserve,
  );
}
export function keyedAlphabet(key: string) {
  return [...new Set(letters(key) + ABC)].join("");
}
export function substitute(text: string, alphabet: string, decrypt = true, preserve = false) {
  if (alphabet.length !== 26 || new Set(alphabet).size !== 26 || /[^A-Z]/.test(alphabet))
    throw new Error("The cipher alphabet must contain each A–Z letter exactly once.");
  return transform(
    text,
    (c) => (decrypt ? ABC[alphabet.indexOf(c)] : alphabet[ABC.indexOf(c)]),
    preserve,
  );
}
export function frequencies(text: string) {
  const clean = letters(text);
  return [...ABC].map((letter, i) => {
    const count = clean.split(letter).length - 1;
    return {
      letter,
      count,
      percent: clean.length ? (100 * count) / clean.length : 0,
      english: ENGLISH[i],
    };
  });
}
export function ngrams(text: string, n: number) {
  const clean = letters(text),
    counts = new Map<string, number>();
  for (let i = 0; i <= clean.length - n; i++) {
    const gram = clean.slice(i, i + n);
    counts.set(gram, (counts.get(gram) ?? 0) + 1);
  }
  return [...counts]
    .map(([gram, count]) => ({
      gram,
      count,
      percent: (count * 100) / Math.max(1, clean.length - n + 1),
    }))
    .sort((a, b) => b.count - a.count || a.gram.localeCompare(b.gram));
}
export function coincidence(text: string) {
  const clean = letters(text);
  return clean.length < 2
    ? 0
    : frequencies(clean).reduce((sum, f) => sum + f.count * (f.count - 1), 0) /
        (clean.length * (clean.length - 1));
}
export function chiSquared(text: string) {
  const clean = letters(text);
  return clean.length
    ? frequencies(clean).reduce(
        (sum, f) =>
          sum +
          (f.count - (clean.length * f.english) / 100) ** 2 / ((clean.length * f.english) / 100),
        0,
      )
    : Infinity;
}
export function keyLengths(text: string, max = 20) {
  const clean = letters(text);
  return Array.from({ length: Math.min(max, Math.floor(clean.length / 2)) }, (_, i) => {
    const length = i + 1;
    const columns = Array.from({ length }, (_, col) =>
      [...clean].filter((_, pos) => pos % length === col).join(""),
    );
    return { length, ic: columns.reduce((sum, c) => sum + coincidence(c), 0) / length };
  });
}
export function kasiski(text: string) {
  const clean = letters(text),
    seen = new Map<string, number[]>();
  for (let i = 0; i < clean.length - 2; i++) {
    const gram = clean.slice(i, i + 3);
    seen.set(gram, [...(seen.get(gram) ?? []), i]);
  }
  return [...seen]
    .filter(([, positions]) => positions.length > 1)
    .map(([gram, positions]) => ({
      gram,
      positions,
      gaps: positions.slice(1).map((p, i) => p - positions[i]),
    }))
    .sort((a, b) => b.positions.length - a.positions.length)
    .slice(0, 20);
}
// Numeric keys give a read order; word keys sort columns alphabetically: HOTEL -> 41523.
export function parseOrder(key: string, size: number): number[] {
  if (!Number.isInteger(size) || size < 2 || size > 30)
    throw new Error("Choose a block size from 2 to 30.");
  let order: number[];
  if (/^[\d\s,]+$/.test(key.trim())) {
    const tokens = /[\s,]/.test(key.trim()) ? key.trim().split(/[\s,]+/) : key.split("");
    order = tokens.map((n) => Number(n) - 1);
  } else {
    const word = letters(key);
    if (word.length !== size) throw new Error(`The word key must have ${size} letters.`);
    order = [...word]
      .map((letter, index) => ({ letter, index }))
      .sort((a, b) => a.letter.localeCompare(b.letter) || a.index - b.index)
      .map((x) => x.index);
  }
  if (
    order.length !== size ||
    new Set(order).size !== size ||
    order.some((n) => n < 0 || n >= size || !Number.isInteger(n))
  )
    throw new Error(
      `Use each column 1–${size} exactly once. Separate numbers with commas for sizes above 9.`,
    );
  return order;
}
export function transpose(text: string, order: number[], decrypt = false, columnar = false) {
  const clean = letters(text),
    n = order.length;
  if (!n || new Set(order).size !== n || order.some((i) => i < 0 || i >= n))
    throw new Error("Invalid column order.");
  const rows = Math.ceil(clean.length / n);
  if (columnar) {
    if (!decrypt)
      return order
        .map((col) => Array.from({ length: rows }, (_, row) => clean[row * n + col] ?? "").join(""))
        .join("");
    const columns: string[] = Array(n).fill("");
    let offset = 0;
    for (const col of order) {
      const len = Math.floor(clean.length / n) + (col < clean.length % n ? 1 : 0);
      columns[col] = clean.slice(offset, offset + len);
      offset += len;
    }
    return Array.from({ length: rows }, (_, row) =>
      columns.map((col) => col[row] ?? "").join(""),
    ).join("");
  }
  let result = "";
  for (let row = 0; row < rows; row++) {
    const block = clean.slice(row * n, (row + 1) * n),
      available = order.filter((col) => col < block.length);
    if (!decrypt) result += available.map((col) => block[col]).join("");
    else {
      const restored: string[] = [];
      available.forEach((col, i) => {
        restored[col] = block[i];
      });
      result += restored.join("");
    }
  }
  return result;
}
