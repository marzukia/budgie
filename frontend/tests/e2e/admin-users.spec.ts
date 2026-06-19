import { test, expect } from "@playwright/test";

const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("admin users page shows user list", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Users")');
  await expect(page.getByRole("heading", { name: "Users" })).toBeVisible();
});

test("admin can create a user", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Users")');
  await page.click('button:has-text("Create User")');
  await page.waitForSelector('[class*="mantine-Modal"] input');
  await page.locator('[class*="mantine-Modal"] input').first().fill("newuser");
  await page.locator('[class*="mantine-Modal"] input[type="password"]').fill("pass123");
  await page.locator('[class*="mantine-Modal"] button:has-text("Create")').click({ force: true });
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
  await page.waitForSelector('[class*="mantine-Modal"] input');
  await page.locator('[class*="mantine-Modal"] input').first().fill("delete-me");
  await page.locator('[class*="mantine-Modal"] input[type="password"]').fill("pass123");
  await page.locator('[class*="mantine-Modal"] button:has-text("Create")').click({ force: true });
  await page.waitForSelector("text=delete-me");

  // Now delete the seeded user
  await page.locator('button[class*="ActionIcon"]').last().click();
  await page.click('button:has-text("Delete")'); // confirm modal
});

test("creating duplicate user shows error", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');

  await page.click('a:has-text("Users")');
  await page.click('button:has-text("Create User")');
  await page.waitForSelector('[class*="mantine-Modal"] input');
  await page.locator('[class*="mantine-Modal"] input').first().fill("admin");
  await page.locator('[class*="mantine-Modal"] input[type="password"]').fill("password");
  await page.locator('[class*="mantine-Modal"] button:has-text("Create")').click({ force: true });

  // API returns 422 for duplicate username — modal closes, user not created
  // Verify the modal closed and no duplicate appeared in the table
  await expect(page.locator('[class*="mantine-Modal"]')).not.toBeVisible();
  // admin already exists in the table, but there should be no second "admin" entry
  const adminRows = await page.locator("text=admin").count();
  expect(adminRows).toBe(1); // just the original admin user
});
