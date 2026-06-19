import { test, expect } from "@playwright/test";
const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";
test("check delete button", async ({ page }) => {
  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL("/");
  await page.waitForTimeout(500);
  await page.click('a:has-text("Users")');
  await page.waitForTimeout(500);
  // Create a user first
  await page.click('button:has-text("Create User")');
  await page.waitForSelector('[class*="mantine-Modal"] input');
  await page.locator('[class*="mantine-Modal"] input').first().fill("test-delete-user");
  await page.locator('[class*="mantine-Modal"] input[type="password"]').fill("pass123");
  await page.locator('[class*="mantine-Modal"] button:has-text("Create")').click({ force: true });
  await page.waitForTimeout(1000);
  // Check delete buttons
  const buttons = await page.evaluate(() => {
    const btns = document.querySelectorAll('button');
    return Array.from(btns).map(b => ({
      text: b.textContent?.substring(0, 20),
      ariaLabel: b.getAttribute('aria-label'),
      className: b.className.substring(0, 60),
      outer: b.outerHTML.substring(0, 200)
    }));
  });
  console.log("Total buttons:", buttons.length);
  for (const b of buttons) {
    console.log("Button:", JSON.stringify(b, null, 2));
  }
});
