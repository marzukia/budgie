import { test, expect } from "@playwright/test";

test("admin transactions page shows all transactions", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Transactions")');
  await expect(page.locator("text=All Transactions")).toBeVisible();
});
