# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-transactions.spec.ts >> admin transactions page shows all transactions
- Location: tests/e2e/admin-transactions.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a:has-text("Transactions")')

```

# Page snapshot

```yaml
- heading "Budget Overview" [level=2] [ref=e4]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("admin transactions page shows all transactions", async ({ page }) => {
  4  |   await page.goto("/login");
  5  |   await page.getByPlaceholder('username').fill('admin');
  6  |   await page.getByPlaceholder('password').fill('budgie123');
  7  |   await page.click('button:has-text("Sign in")');
  8  | 
> 9  |   await page.click('a:has-text("Transactions")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  10 |   await expect(page.locator("text=All Transactions")).toBeVisible();
  11 | });
  12 | 
```