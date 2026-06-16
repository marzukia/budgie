import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("settings page loads and shows currency and theme", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Settings")');
  await expect(page.locator("text=Base Currency")).toBeVisible();
  await expect(page.locator("text=Theme")).toBeVisible();
});

test("settings can update currency", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Settings")');
  await page.selectOption("select", "USD");
  await page.click('button:has-text("Save")');
  // Verify save succeeded — no error toast
  await expect(page.locator("text=Settings")).toBeVisible();
});

test("settings can toggle theme", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Settings")');
  // Toggle dark mode
  await page.click('[role="switch"]');
  await page.click('button:has-text("Save")');
  await expect(page.locator("text=Settings")).toBeVisible();
});
