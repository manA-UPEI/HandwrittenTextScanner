import { expect, test } from "@playwright/test";
import { MOCK_TRANSCRIPTION_TEXT } from "../src/infrastructure/ai/providers/mock";
import { scanOnePage } from "./fixtures";
import { STORAGE_STATE_PATH } from "./env";

test.use({ storageState: STORAGE_STATE_PATH });

test("captures, crops, and transcribes a page with the mock provider, then adds it", async ({
  page,
}) => {
  await page.goto("/");

  const textarea = await scanOnePage(page);
  await expect(textarea).toHaveValue(MOCK_TRANSCRIPTION_TEXT);

  await page.getByRole("button", { name: /add another page/i }).click();

  await expect(page.getByLabel("Take a photo of your handwriting")).toBeVisible();
  await expect(page.getByText(/1 page saved/i)).toBeVisible();
});
