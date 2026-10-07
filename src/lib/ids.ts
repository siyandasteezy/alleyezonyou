import { randomInt } from "node:crypto";

// No 0/O/1/I to keep references easy to read out over the phone.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function reference(prefix: string, length = 8) {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}-${out}`;
}
