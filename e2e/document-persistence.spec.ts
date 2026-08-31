import { expect, test } from "@playwright/test";
import { scanOnePage } from "./fixtures";
import { STORAGE_STATE_PATH } from "./env";

test.use({ storageState: STORAGE_STATE_PATH });

test("saves a scan, lists it after reload, reopens it, then deletes it", async ({ page }) => {
  await page.goto("/");

  const textarea = await scanOnePage(page);
  await textarea.waitFor();

  const saveResponse = page.waitForResponse(
    (response) => response.request().method() === "POST" && response.ok(),
  );
  await page.getByRole("button", { name: /save progress/i }).click();
  await saveResponse;

  await page.reload();
  await expect(page.getByText(/my scans/i)).toBeVisible();
  await expect(page.getByText(/scanned document · 1 page/i)).toBeVisible();

  await page.getByRole("button", { name: /^open scanned document$/i }).click();
  await expect(page.getByText(/this is a mock transcription/i)).toBeVisible();

  // Back to a fresh idle session (in-browser state only) so "My Scans" is
  // visible again — the saved document itself lives on the server.
  await page.reload();
  await expect(page.getByRole("button", { name: /^delete scanned document$/i })).toBeVisible();
  await page.getByRole("button", { name: /^delete scanned document$/i }).click();

  await expect(page.getByText(/my scans/i)).toHaveCount(0);
});
