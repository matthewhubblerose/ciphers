import { caesar, keyedAlphabet, substitute, transpose, vigenere } from "./ciphers";
export const PRACTICE =
  "THE OTHER EXPLORERS WERE THERE WHEN THE LETTER ARRIVED. THE THREE FRIENDS READ THE LETTER TOGETHER. THERE WAS A SECRET HIDDEN IN THE OLD TOWER AND THE ONLY WAY TO FIND IT WAS TO FOLLOW THE RIVER. THEY GATHERED THEIR THINGS AND SET OFF BEFORE THE WEATHER TURNED. EVERYWHERE THEY LOOKED THERE WERE MORE CLUES. THE LETTER TOLD THEM TO SEARCH THE NORTHERN WALL WHERE THE STONES WERE WORN BY THE RAIN. AFTER THREE HOURS THEY FOUND THE ANSWER. THE TREASURE WAS NEVER GOLD BUT THE KNOWLEDGE THEY HAD GAINED BY WORKING TOGETHER. THE OTHER EXPLORERS RETURNED TO THEIR SCHOOL TO SHARE THE STORY WITH THEIR FRIENDS.";
export const SAMPLES = [
  {
    name: "Substitution · ORANGE",
    text: substitute(PRACTICE, keyedAlphabet("ORANGE"), false),
    answer: "Keyphrase ORANGE. Start with THE, then look for OTHER and THERE.",
  },
  { name: "Caesar · shift 7", text: caesar(PRACTICE, 7, false), answer: "Decrypt with shift 7." },
  {
    name: "Block transposition · 53124",
    text: transpose(PRACTICE, [4, 2, 0, 1, 3]),
    answer: "Block size 5, read order 53124, decrypt.",
  },
  {
    name: "Columnar · HOTEL",
    text: transpose(PRACTICE, [3, 0, 4, 1, 2], false, true),
    answer: "Columnar transposition; size 5, word HOTEL, decrypt.",
  },
  {
    name: "Vigenère · BOT",
    text: vigenere(PRACTICE, "BOT", false),
    answer: "Key BOT (shifts 1, 14, 19). Key length 3; multiples may also score well.",
  },
];
