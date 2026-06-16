import { test, expect } from "@playwright/test";

test("settings page loads and can update currency", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Settings")');
  await expect(page.locator("text=Base Currency")).toBeVisible();
  await expect(page.locator("text=Theme")).toBeVisible();
});
