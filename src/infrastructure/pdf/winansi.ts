/**
 * pdf-lib's StandardFonts (Helvetica) can only encode WinAnsi
 * (Windows-1252) characters. English handwriting transcribed by an LLM is
 * expected to stay within that range, but a stray smart quote, dash, or
 * emoji must never crash PDF generation — this sanitizer maps common
 * typographic characters to plain equivalents and replaces anything else
 * with "?" so encoding always succeeds.
 */
const TYPOGRAPHIC_REPLACEMENTS: Record<string, string> = {
  "‘": "'", // left single quote
  "’": "'", // right single quote / apostrophe
  "“": '"', // left double quote
  "”": '"', // right double quote
  "–": "-", // en dash
  "—": "--", // em dash
  "…": "...", // ellipsis
  "•": "*", // bullet
  " ": " ", // non-breaking space
};

const TYPOGRAPHIC_PATTERN = new RegExp(
  `[${Object.keys(TYPOGRAPHIC_REPLACEMENTS).join("")}]`,
  "g",
);

const isWinAnsiSafe = (char: string): boolean => {
  if (char === "\n" || char === "\t") return true;
  const code = char.codePointAt(0) ?? 0;
  return (code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff);
};

/** Maps text to characters pdf-lib's Helvetica can always encode. */
export const sanitizeForWinAnsi = (text: string): string => {
  const withPlainPunctuation = text.replace(
    TYPOGRAPHIC_PATTERN,
    (char) => TYPOGRAPHIC_REPLACEMENTS[char],
  );

  // Array.from (not .split) so a surrogate-pair character like an emoji
  // is treated as one code point — and becomes one "?" — instead of two
  // lone surrogate halves that would each need their own placeholder.
  return Array.from(withPlainPunctuation)
    .map((char) => (isWinAnsiSafe(char) ? char : "?"))
    .join("");
};
