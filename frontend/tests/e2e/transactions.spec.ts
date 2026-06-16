import { test, expect } from "@playwright/test";

test("create a transaction", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  // Create a bucket first
  await page.click('a:has-text("New Bucket")');
  await page.fill('input[name="name"]', "Tx Bucket");
  await page.fill('input[name="amount"]', "1000");
  await page.click('button:has-text("Create")');

  // Go to bucket detail
  await page.click('text=Tx Bucket');
  await page.click('button:has-text("Add Transaction")');
  await page.fill('input[name="amount"]', "50");
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=$50.00")).toBeVisible();
});

test("soft delete and undo transaction", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  // Create bucket + transaction
  await page.click('a:has-text("New Bucket")');
  await page.fill('input[name="name"]', "Undo Bucket");
  await page.fill('input[name="amount"]', "500");
  await page.click('button:has-text("Create")');

  await page.click('text=Undo Bucket');
  await page.click('button:has-text("Add Transaction")');
  await page.fill('input[name="amount"]', "25");
  await page.click('button:has-text("Create")');

  // Soft delete
  await page.click('button:has-text("🗑️")');
  await page.click('button:has-text("Delete")'); // confirm
  await expect(page.locator("text=Deleted")).toBeVisible();

  // Undo
  await page.click('button:has-text("↩️")');
  await expect(page.locator("text=Deleted")).not.toBeVisible();
});
