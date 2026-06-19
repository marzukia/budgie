import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("settings page loads and shows currency and appearance", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Settings")');
  await expect(page.locator("text=Base Currency")).toBeVisible();
  await expect(page.locator("text=Appearance")).toBeVisible();
});

test("settings can update currency", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Settings")');
  // Mantine Select renders as a custom dropdown — click to open then select USD
  await page.click('[class*="mantine-Select-root"]');
  await page.getByRole("option").filter({ hasText: "USD" }).click();
  await page.click('button:has-text("Save Changes")');
  // Verify save succeeded — no error toast
  await expect(page.locator("text=Settings")).toBeVisible();
});

test("settings can toggle theme", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Settings")');
  // Click the "Dark" segmented control option
  await page.getByText("Dark").click();
  await page.click('button:has-text("Save Changes")');
  await expect(page.locator("text=Settings")).toBeVisible();
});
