import type { Page } from "@playwright/test";

export async function seedTestData(page: Page) {
  // Login as admin
  await page.request.post("/api/auth/login", {
    data: { username: "admin", password: "admin123" },
  });

  // Create test buckets
  const buckets = [
    { name: "Groceries", amount: 500, currency: "AUD" },
    { name: "Rent", amount: 1500, currency: "AUD" },
    { name: "Utilities", amount: 300, currency: "AUD" },
  ];

  for (const b of buckets) {
    await page.request.post("/api/buckets/", { data: b });
  }
}
