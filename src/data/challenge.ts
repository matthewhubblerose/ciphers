// Original practice material written for this site. No competition ciphertext.
import { transpose, letters } from "../utils/ciphers";
import { PRACTICE } from "../utils/samples";
export const DEMO_ORDER = [4, 1, 3, 0, 2];
export const DEMO_TEXT = transpose(letters("BRING YOUR MAP NOW. " + PRACTICE), DEMO_ORDER, true);
