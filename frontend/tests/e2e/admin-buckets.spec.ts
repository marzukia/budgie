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
  await page.waitForSelector('[class*="mantine-Modal"] input');
  await page.locator('[class*="mantine-Modal"] input').first().fill("Admin Bucket");
  await page.locator('[class*="mantine-Modal"] input[inputmode="decimal"]').fill("500");
  await page.locator('[class*="mantine-Modal"] button:has-text("Create")').click({ force: true });
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
  await page.waitForSelector('[class*="mantine-Modal"] input');
  await page.locator('[class*="mantine-Modal"] input').first().fill("Delete Admin");
  await page.locator('[class*="mantine-Modal"] input[inputmode="decimal"]').fill("100");
  await page.locator('[class*="mantine-Modal"] button:has-text("Create")').click({ force: true });

  // Delete it
  await page.locator('button[class*="ActionIcon"]').last().click();
  await page.click('button:has-text("Delete")'); // confirm
  await expect(page.locator("text=Delete Admin")).not.toBeVisible();
});
