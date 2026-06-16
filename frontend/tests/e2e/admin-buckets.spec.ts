import { test, expect } from "@playwright/test";

test("admin buckets page shows all buckets", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Buckets")');
  await expect(page.locator("text=All Buckets")).toBeVisible();
});
