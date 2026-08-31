import { expect, test } from "@playwright/test";

test("shows the sign-in screen and no scanner UI when signed out", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: /sign in with google/i })).toBeVisible();
  await expect(page.getByLabel("Take a photo of your handwriting")).toHaveCount(0);
});
