import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("admin buckets page shows all buckets", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Buckets")');
  await expect(page.locator("text=All Buckets")).toBeVisible();
});

test("admin can create a bucket via admin page", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Buckets")');
  await page.click('button:has-text("Create Bucket")');
  await page.locator('[class*="form"] input').first().fill("Admin Bucket");
  await page.locator('[class*="form"] input[type="number"]').fill("500");
  await page.click('button:has-text("Create")');
  // Modal closes and table refreshes
  await expect(page.locator("text=Admin Bucket")).toBeVisible();
});

test("admin can delete a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  // Create via admin page
  await page.click('a:has-text("Buckets")');
  await page.click('button:has-text("Create Bucket")');
  await page.locator('[class*="form"] input').first().fill("Delete Admin");
  await page.locator('[class*="form"] input[type="number"]').fill("100");
  await page.click('button:has-text("Create")');

  // Delete it
  await page.click('button:has-text("Delete")');
  await page.click('button:has-text("Delete")'); // confirm
  await expect(page.locator("text=Delete Admin")).not.toBeVisible();
});
