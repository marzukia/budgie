import { test, expect } from "@playwright/test";
const password = process.env.TEST_ADMIN_PASSWORD ?? "budgie123";

test("debug csrf cookie", async ({ page }) => {
  // Listen to actual request events
  const requests: string[] = [];
  page.on("request", (req) => {
    if (req.url().includes("/api/")) {
      const csrf = req.headers()["x-csrftoken"] || "MISSING";
      requests.push(`[${req.method()}] ${req.url().split("?")[0]} csrf=${csrf}`);
    }
  });

  await page.goto("/login");
  await page.getByPlaceholder("username").fill("admin");
  await page.getByPlaceholder("password").fill(password);
  await page.click('button:has-text("Sign in")');
  await expect(page).toHaveURL("/");
  await page.waitForTimeout(500);

  // Navigate to admin buckets
  await page.click('a:has-text("Buckets")');
  await page.waitForTimeout(500);

  // Open modal
  await page.click('button:has-text("Create Bucket")');
  await page.waitForTimeout(500);
  
  // Fill form
  await page.locator('[class*="mantine-Modal"] input').first().fill("Test Bucket CSRF");
  await page.locator('[class*="mantine-Modal"] input[inputmode="decimal"]').fill("500");
  
  // Check cookie right before Create click
  const cookieCheck = await page.evaluate(() => {
    const name = "csrftoken";
    const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
    return {
      cookie: document.cookie,
      matchFound: !!match,
      matchValue: match ? decodeURIComponent(match[2]) : null
    };
  });
  console.log("Cookie before Create:", JSON.stringify(cookieCheck, null, 2));

  // Click Create
  await page.locator('[class*="mantine-Modal"] button:has-text("Create")').click({ force: true });
  await page.waitForTimeout(2000);

  // Print all API requests and their CSRF headers
  console.log("API requests:");
  for (const r of requests) {
    console.log("  " + r);
  }
});
