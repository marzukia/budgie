import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("create a transaction", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Tx Bucket");
  await page.getByPlaceholder("e.g. 500.00").fill("1000");
  await page.click('button:has-text("Create")');

  await page.click("text=Tx Bucket");
  await page.click('button:has-text("Add Transaction")');
  await page.getByPlaceholder("e.g. 50.00").fill("50");
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=$50.00")).toBeVisible();
});

test("create transaction with negative amount", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Neg Bucket");
  await page.getByPlaceholder("e.g. 500.00").fill("500");
  await page.click('button:has-text("Create")');

  await page.click("text=Neg Bucket");
  await page.click('button:has-text("Add Transaction")');
  await page.getByPlaceholder("e.g. 50.00").fill("-50");
  await page.click('button:has-text("Create")');
  await expect(page.locator("text=-$50.00")).toBeVisible();
});

test("create transaction with empty amount stays on form", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Empty Tx");
  await page.getByPlaceholder("e.g. 500.00").fill("500");
  await page.click('button:has-text("Create")');

  await page.click("text=Empty Tx");
  await page.click('button:has-text("Add Transaction")');
  await page.getByPlaceholder("e.g. 50.00").fill("");
  await page.click('button:has-text("Create")');
  await expect(page.locator('button:has-text("Create")')).toBeVisible();
});

test("soft delete and undo transaction", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Undo Bucket");
  await page.getByPlaceholder("e.g. 500.00").fill("500");
  await page.click('button:has-text("Create")');

  await page.click("text=Undo Bucket");
  await page.click('button:has-text("Add Transaction")');
  await page.getByPlaceholder("e.g. 50.00").fill("25");
  await page.click('button:has-text("Create")');

  await page.click('button:has-text("🗑️")');
  await page.click('button:has-text("Delete")'); // confirm
  await expect(page.locator("text=Deleted")).toBeVisible();

  await page.click('button:has-text("↩️")');
  await expect(page.locator("text=Deleted")).not.toBeVisible();
});
