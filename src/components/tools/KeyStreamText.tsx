import { letters } from "../../utils/ciphers";

export default function KeyStreamText({
  text,
  keyLength,
  position,
  label,
}: {
  text: string;
  keyLength: number;
  position: number;
  label: string;
}) {
  let index = 0;
  const count = letters(text).length,
    positions = Array.from(
      { length: Math.min(6, Math.max(0, Math.ceil((count - position) / keyLength))) },
      (_, j) => position + 1 + j * keyLength,
    );
  return (
    <section class="key-stream-preview" aria-label={label}>
      <p class="small">
        <strong>{label}</strong>. Underlined letters use key position {position + 1}
        {positions.length > 0
          ? `: ${positions.join(", ")}${count > position + 6 * keyLength ? ", …" : ""}`
          : ": no letters at this position yet"}
        . Spaces and punctuation do not advance the key.
      </p>
      <p class="key-stream-text mono" tabIndex={0}>
        {[...text].map((c, j) => {
          if (!/[A-Za-z]/.test(c)) return c;
          const letterIndex = index++;
          return letterIndex % keyLength === position ? (
            <mark class="key-stream-letter" data-letter-position={letterIndex + 1} key={j}>
              {c}
            </mark>
          ) : (
            c
          );
        })}
        {!text && "Type a message to see its key positions."}
      </p>
    </section>
  );
}
