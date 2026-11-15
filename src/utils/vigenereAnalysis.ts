import { ABC, letters, mod } from "./ciphers";

// Positions shown to students are one-based. Gaps are between consecutive starts.
export function repeatedGroups(text: string, size = 3) {
  const clean = letters(text),
    seen = new Map<string, number[]>();
  for (let i = 0; i <= clean.length - size; i++) {
    const group = clean.slice(i, i + size);
    if (!seen.has(group)) seen.set(group, []);
    seen.get(group)!.push(i + 1);
  }
  return [...seen]
    .filter(([, positions]) => positions.length > 1)
    .map(([group, positions]) => ({
      group,
      positions,
      gaps: positions.slice(1).map((p, i) => p - positions[i]),
    }))
    .sort((a, b) => b.positions.length - a.positions.length || a.group.localeCompare(b.group));
}
export function factorVotes(text: string, size = 3, maximum = 20) {
  const repeats = repeatedGroups(text, size);
  return Array.from({ length: Math.max(0, maximum - 1) }, (_, i) => {
    const length = i + 2;
    let votes = 0,
      groups = 0;
    for (const repeat of repeats) {
      const count = repeat.gaps.filter((gap) => gap % length === 0).length;
      votes += count;
      if (count) groups++;
    }
    return { length, votes, groups };
  }).sort((a, b) => b.votes - a.votes || a.length - b.length);
}
export function cribKey(text: string, crib: string, start: number, length: number) {
  const cipher = letters(text),
    plain = letters(crib),
    key = Array<string>(length).fill("?");
  let conflict = false;
  const rows = [...plain]
    .map((letter, i) => {
      const position = start + i,
        c = cipher[position];
      if (!c) return null;
      const shift = mod(ABC.indexOf(c) - ABC.indexOf(letter)),
        slot = position % length;
      if (key[slot] !== "?" && key[slot] !== ABC[shift]) conflict = true;
      key[slot] = ABC[shift];
      return {
        position: position + 1,
        cipher: c,
        plain: letter.toLowerCase(),
        shift,
        keyLetter: ABC[shift],
        slot: slot + 1,
      };
    })
    .filter((row) => row !== null);
  return { key: key.join(""), conflict, rows };
}
