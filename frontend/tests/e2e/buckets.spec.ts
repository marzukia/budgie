import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("create a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Test Bucket");
  await page.getByPlaceholder("e.g. 500.00").fill("1000");
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=Test Bucket")).toBeVisible();
});

test("edit a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Edit Me");
  await page.getByPlaceholder("e.g. 500.00").fill("500");
  await page.click('button:has-text("Create")');

  await page.click("text=Edit Me");
  await page.click('button:has-text("Edit")');
  await page.getByPlaceholder("e.g. Groceries").fill("Edited");
  await page.click('button:has-text("Update")');
  await expect(page.locator("text=Edited")).toBeVisible();
});

test("delete a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Delete Me");
  await page.getByPlaceholder("e.g. 500.00").fill("100");
  await page.click('button:has-text("Create")');

  await page.click("text=Delete Me");
  await page.click('button:has-text("Delete")');
  await page.click('button:has-text("Delete")'); // confirm modal
  await expect(page.locator("text=Delete Me")).not.toBeVisible();
});

test("create bucket with empty name shows error", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("");
  await page.getByPlaceholder("e.g. 500.00").fill("100");
  await page.click('button:has-text("Create")');
  // Should stay on form page (validation prevents navigation)
  await expect(page.locator('button:has-text("Create")')).toBeVisible();
});

test("create bucket with zero amount", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Zero Bucket");
  await page.getByPlaceholder("e.g. 500.00").fill("0");
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=Zero Bucket")).toBeVisible();
});
