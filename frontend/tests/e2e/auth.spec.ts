import { test, expect } from "@playwright/test";

test("login with valid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL("/");
});

test("login with invalid credentials shows error", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "wrong");
  await page.click('button:has-text("Sign in")');
  await expect(page.locator("text=invalid credentials")).toBeVisible();
});

test("logout clears session", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');
  // Navigate to logout endpoint
  await page.request.post("/api/auth/logout");
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});
