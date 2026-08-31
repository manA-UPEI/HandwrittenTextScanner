import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { expect, type Page } from "@playwright/test";
import { ONE_PIXEL_PNG_BASE64 } from "../src/test/fixtures";

/** Decodes the same fixture PNG the unit tests use into a real file, since
 *  Playwright's file input needs a path rather than in-memory bytes. */
export const writeSampleImageFile = (): string => {
  const dir = mkdtempSync(path.join(tmpdir(), "handwriting-scanner-e2e-"));
  const filePath = path.join(dir, "sample.png");
  writeFileSync(filePath, Buffer.from(ONE_PIXEL_PNG_BASE64, "base64"));
  return filePath;
};

/** Drives capture -> crop -> mock transcription once, leaving the review
 *  textarea visible — the same three steps every scan-dependent spec needs. */
export const scanOnePage = async (page: Page) => {
  await page.getByLabel("Take a photo of your handwriting").setInputFiles(writeSampleImageFile());

  const confirmButton = page.getByRole("button", { name: /confirm crop/i });
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();

  return page.getByLabel(/transcription/i);
};
