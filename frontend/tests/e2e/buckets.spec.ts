import { test, expect } from "@playwright/test";

test("create a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.fill('input[name="name"]', "Test Bucket");
  await page.fill('input[name="amount"]', "1000");
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=Test Bucket")).toBeVisible();
});

test("edit a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  // Create first
  await page.click('a:has-text("New Bucket")');
  await page.fill('input[name="name"]', "Edit Me");
  await page.fill('input[name="amount"]', "500");
  await page.click('button:has-text("Create")');

  // Click on bucket card to go to detail
  await page.click('text=Edit Me');
  await page.click('button:has-text("Edit")');
  await page.fill('input[name="name"]', "Edited");
  await page.click('button:has-text("Update")');
  await expect(page.locator("text=Edited")).toBeVisible();
});

test("delete a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "admin123");
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.fill('input[name="name"]', "Delete Me");
  await page.fill('input[name="amount"]', "100");
  await page.click('button:has-text("Create")');

  await page.click('text=Delete Me');
  await page.click('button:has-text("Delete")');
  await page.click('button:has-text("Delete")'); // confirm modal
  await expect(page.locator("text=Delete Me")).not.toBeVisible();
});
