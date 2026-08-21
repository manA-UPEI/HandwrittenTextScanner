/** Measures the rendered width of a string, in the same units as `maxWidth`. */
type TextMeasurer = (text: string) => number;

/**
 * Wraps a single paragraph (no line breaks) on word boundaries so no line
 * exceeds maxWidth. A single word wider than maxWidth is left on its own
 * line rather than broken mid-word — acceptable for handwritten prose,
 * where that's rare, and simpler than hyphenating at arbitrary points.
 */
const wrapParagraph = (paragraph: string, measure: TextMeasurer, maxWidth: number): string[] => {
  if (paragraph === "") return [""];

  const words = paragraph.split(/\s+/).filter(Boolean);

  return words.reduce<string[]>((lines, word) => {
    const currentLine = lines.at(-1);
    const candidate = currentLine === undefined ? word : `${currentLine} ${word}`;

    const fitsOnCurrentLine = currentLine !== undefined && measure(candidate) <= maxWidth;
    if (fitsOnCurrentLine) return [...lines.slice(0, -1), candidate];

    return currentLine === undefined ? [candidate] : [...lines, word];
  }, []);
};

/**
 * Wraps text into lines no wider than maxWidth, splitting on word
 * boundaries. Author-supplied line breaks (\n) are preserved as their own
 * paragraphs — including blank lines — so a transcription's structure
 * survives into the PDF. Pure: takes a measurer instead of a font, so it
 * has no pdf-lib dependency and needs no rendering to test.
 */
export const wrapLines = (text: string, measure: TextMeasurer, maxWidth: number): string[] =>
  text.split(/\r?\n/).flatMap((paragraph) => wrapParagraph(paragraph, measure, maxWidth));
