# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: transactions.spec.ts >> create a transaction
- Location: tests/e2e/transactions.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a:has-text("New Bucket")')

```

# Page snapshot

```yaml
- heading "Budget Overview" [level=2] [ref=e4]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("create a transaction", async ({ page }) => {
  4  |   await page.goto("/login");
  5  |   await page.getByPlaceholder('username').fill('admin');
  6  |   await page.getByPlaceholder('password').fill('budgie123');
  7  |   await page.click('button:has-text("Sign in")');
  8  | 
  9  |   // Create a bucket first
> 10 |   await page.click('a:has-text("New Bucket")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  11 |   await page.getByPlaceholder('e.g. Groceries').fill('Tx Bucket');
  12 |   await page.getByPlaceholder('e.g. 500.00').fill('1000');
  13 |   await page.click('button:has-text("Create")');
  14 | 
  15 |   // Go to bucket detail
  16 |   await page.click('text=Tx Bucket');
  17 |   await page.click('button:has-text("Add Transaction")');
  18 |   await page.getByPlaceholder('e.g. 50.00').fill('50');
  19 |   await page.click('button:has-text("Create")');
  20 |   await expect(page.locator("text=$50.00")).toBeVisible();
  21 | });
  22 | 
  23 | test("soft delete and undo transaction", async ({ page }) => {
  24 |   await page.goto("/login");
  25 |   await page.getByPlaceholder('username').fill('admin');
  26 |   await page.getByPlaceholder('password').fill('budgie123');
  27 |   await page.click('button:has-text("Sign in")');
  28 | 
  29 |   // Create bucket + transaction
  30 |   await page.click('a:has-text("New Bucket")');
  31 |   await page.getByPlaceholder('e.g. Groceries').fill('Undo Bucket');
  32 |   await page.getByPlaceholder('e.g. 500.00').fill('500');
  33 |   await page.click('button:has-text("Create")');
  34 | 
  35 |   await page.click('text=Undo Bucket');
  36 |   await page.click('button:has-text("Add Transaction")');
  37 |   await page.getByPlaceholder('e.g. 50.00').fill('25');
  38 |   await page.click('button:has-text("Create")');
  39 | 
  40 |   // Soft delete
  41 |   await page.click('button:has-text("🗑️")');
  42 |   await page.click('button:has-text("Delete")'); // confirm
  43 |   await expect(page.locator("text=Deleted")).toBeVisible();
  44 | 
  45 |   // Undo
  46 |   await page.click('button:has-text("↩️")');
  47 |   await expect(page.locator("text=Deleted")).not.toBeVisible();
  48 | });
  49 | 
```