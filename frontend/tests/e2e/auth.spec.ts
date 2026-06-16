import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("login with valid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL("/");
});

test("login with invalid username shows error", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("nobody");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');
  await expect(page.locator("text=invalid credentials")).toBeVisible();
});

test("login with invalid password shows error", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill("wrong");
  await page.click('button:has-text("Sign in")');
  await expect(page.locator("text=invalid credentials")).toBeVisible();
});

test("login with empty fields shows validation", async ({ page }) => {
  await page.goto("/login");
  await page.click('button:has-text("Sign in")');
  await expect(page.locator("text=invalid credentials")).toBeVisible();
});

test("logout clears session", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');
  await page.request.post("/api/auth/logout");
  await page.goto("/");
  await expect(page).toHaveURL("/login");
});
