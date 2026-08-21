import { describe, expect, it } from "vitest";
import { wrapLines } from "@/infrastructure/pdf/text-layout";

/** One unit per character — deterministic and easy to reason about. */
const charWidthMeasure = (text: string) => text.length;

describe("wrapLines", () => {
  it("keeps a short line whole", () => {
    expect(wrapLines("hello world", charWidthMeasure, 20)).toEqual(["hello world"]);
  });

  it("wraps on word boundaries once the width is exceeded", () => {
    expect(wrapLines("the quick brown fox", charWidthMeasure, 10)).toEqual([
      "the quick",
      "brown fox",
    ]);
  });

  it("preserves an authored line break instead of merging short lines", () => {
    expect(wrapLines("line one\nline two", charWidthMeasure, 100)).toEqual([
      "line one",
      "line two",
    ]);
  });

  it("preserves a blank line between paragraphs", () => {
    expect(wrapLines("para one\n\npara two", charWidthMeasure, 100)).toEqual([
      "para one",
      "",
      "para two",
    ]);
  });

  it("keeps a single overlong word on its own line rather than breaking it", () => {
    expect(wrapLines("supercalifragilistic word", charWidthMeasure, 10)).toEqual([
      "supercalifragilistic",
      "word",
    ]);
  });

  it("handles an empty string as a single blank line", () => {
    expect(wrapLines("", charWidthMeasure, 10)).toEqual([""]);
  });
});
