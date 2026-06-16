import { test, expect } from "@playwright/test";

test("insights page renders summary and chart", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Insights")');
  await expect(page.locator("text=Monthly Summary")).toBeVisible();
  await expect(page.locator("text=Monthly Trend")).toBeVisible();
});
