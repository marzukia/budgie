import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("insights page renders summary and chart", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Insights")');
  await expect(page.locator("text=Monthly Summary")).toBeVisible();
  await expect(page.locator("text=Monthly Trend")).toBeVisible();
});

test("insights page shows empty state when no data", async ({ page }) => {
  // Login as a user with no buckets (if possible) or check empty table
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Insights")');
  await expect(page.locator("text=No summary data")).toBeVisible();
});
