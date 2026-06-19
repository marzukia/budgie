import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("create a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Test Bucket");
  await page.getByPlaceholder("500.00").fill("1000");
  await page.click('button:has-text("Create Bucket")');
  await expect(page.locator("text=Test Bucket")).toBeVisible();
});

test("edit a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Edit Me");
  await page.getByPlaceholder("500.00").fill("500");
  await page.click('button:has-text("Create Bucket")');

  await page.click("text=Edit Me");
  await page.click('button:has-text("Edit")');
  await page.getByPlaceholder("e.g. Groceries").fill("Edited");
  await page.click('button:has-text("Save Changes")');
  await expect(page.locator("text=Edited")).toBeVisible();
});

test("delete a bucket", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Delete Me");
  await page.getByPlaceholder("500.00").fill("100");
  await page.click('button:has-text("Create Bucket")');

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

  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("");
  await page.getByPlaceholder("500.00").fill("100");
  await page.click('button:has-text("Create Bucket")');
  // Should stay on form page (validation prevents navigation)
  await expect(page.locator('button:has-text("Create Bucket")')).toBeVisible();
});

test("create bucket with zero amount", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Zero Bucket");
  await page.getByPlaceholder("500.00").fill("0");
  await page.click('button:has-text("Create Bucket")');
  await expect(page.locator("text=Zero Bucket")).toBeVisible();
});

test("reset bucket spent to zero", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  // Create a bucket with a transaction so it has spent > 0
  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Reset Me");
  await page.getByPlaceholder("500.00").fill("500");
  await page.click('button:has-text("Create Bucket")');

  await page.click("text=Reset Me");
  await page.click('button:has-text("Add Transaction")');
  await page.getByPlaceholder("e.g. 50.00").fill("100");
  await page.click('button:has-text("Create")');

  // Go back to bucket detail and reset
  await page.click("text=Reset Me");
  await page.click('button:has-text("Actions")');
  await page.getByLabel("Reset").click();
  // Verify spent reset to 0
  await expect(page.locator("text=$0.00")).toBeVisible();
});

test("share bucket with another user", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  // Create a second user via API
  await page.request.post("/api/users/", {
    data: { name: "share-user", password: "share123" },
  });

  // Create a bucket to share
  await page.click('button:has-text("New Bucket")');
  await page.getByPlaceholder("e.g. Groceries").fill("Shared Bucket");
  await page.getByPlaceholder("500.00").fill("300");
  await page.click('button:has-text("Create Bucket")');

  await page.click("text=Shared Bucket");
  // Open share modal
  await page.click('button:has-text("Actions")');
  await page.getByLabel("Share").click();

  // Fill share form — find the user by their ID (newly created user)
  await page.locator('input[type="number"]').fill("2");
  await page.click("text=Share");
  await expect(page.locator("text=Shared with")).toBeVisible();
});
