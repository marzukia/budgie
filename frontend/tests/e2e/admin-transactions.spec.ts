import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("admin transactions page shows all transactions", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Transactions")');
  await expect(page.locator("text=All Transactions")).toBeVisible();
});

test("admin transactions page shows data when transactions exist", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  // Create a bucket + transaction first so there's data
  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Admin Data Bucket");
  await page.getByPlaceholder("e.g. 500.00").fill("500");
  await page.click('button:has-text("Create")');

  await page.click("text=Admin Data Bucket");
  await page.click('button:has-text("Add Transaction")');
  await page.waitForSelector('[placeholder="e.g. 50.00"]');
  await page.getByPlaceholder("e.g. 50.00").fill("150");
  await page.click('button:has-text("Create")');

  // Go to admin transactions and verify data shows
  await page.click('a:has-text("Transactions")');
  await expect(page.locator("text=$150.00")).toBeVisible();
});

test("admin can edit a transaction", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  // Create a bucket + transaction first
  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Admin Tx Bucket");
  await page.getByPlaceholder("e.g. 500.00").fill("500");
  await page.click('button:has-text("Create")');

  await page.click("text=Admin Tx Bucket");
  await page.click('button:has-text("Add Transaction")');
  await page.waitForSelector('[placeholder="e.g. 50.00"]');
  await page.getByPlaceholder("e.g. 50.00").fill("100");
  await page.click('button:has-text("Create")');

  // Go to admin transactions
  await page.click('a:has-text("Transactions")');
  // Click the edit button (first ActionIcon in the transactions table)
  await page.getByLabel("Edit").first().click();
  await page.locator('[class*="form"] input[type="number"]').fill("200");
  await page.click('button:has-text("Save")');
  await expect(page.locator("text=$200.00")).toBeVisible();
});
