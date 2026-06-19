import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("admin users page shows user list", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Users")');
  await expect(page.locator("text=Users")).toBeVisible();
});

test("admin can create a user", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Users")');
  await page.click('button:has-text("Create User")');
  await page.locator('[class*="form"] input').first().fill("newuser");
  await page.locator('[class*="form"] input[type="password"]').fill("pass123");
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=newuser")).toBeVisible();
});

test("admin can delete a user", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Users")');

  // Seed a known user to delete
  await page.click('button:has-text("Create User")');
  await page.locator('[class*="form"] input').first().fill("delete-me");
  await page.locator('[class*="form"] input[type="password"]').fill("pass123");
  await page.click('button:has-text("Create")');
  await page.waitForSelector("text=delete-me");

  // Now delete the seeded user
  const deleteBtns = page.locator('button:has-text("Delete")');
  await deleteBtns.first().click();
  await page.click('button:has-text("Delete")'); // confirm modal
});
