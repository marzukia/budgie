# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: buckets.spec.ts >> create a bucket
- Location: tests/e2e/buckets.spec.ts:3:1

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
  3  | test("create a bucket", async ({ page }) => {
  4  |   await page.goto("/login");
  5  |   await page.getByPlaceholder('username').fill('admin');
  6  |   await page.getByPlaceholder('password').fill('budgie123');
  7  |   await page.click('button:has-text("Sign in")');
  8  | 
> 9  |   await page.click('a:has-text("New Bucket")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  10 |   await page.getByPlaceholder('e.g. Groceries').fill('Test Bucket');
  11 |   await page.getByPlaceholder('e.g. 500.00').fill('1000');
  12 |   await page.click('button:has-text("Create")');
  13 |   await expect(page.locator("text=Test Bucket")).toBeVisible();
  14 | });
  15 | 
  16 | test("edit a bucket", async ({ page }) => {
  17 |   await page.goto("/login");
  18 |   await page.getByPlaceholder('username').fill('admin');
  19 |   await page.getByPlaceholder('password').fill('budgie123');
  20 |   await page.click('button:has-text("Sign in")');
  21 | 
  22 |   // Create first
  23 |   await page.click('a:has-text("New Bucket")');
  24 |   await page.getByPlaceholder('e.g. Groceries').fill('Edit Me');
  25 |   await page.getByPlaceholder('e.g. 500.00').fill('500');
  26 |   await page.click('button:has-text("Create")');
  27 | 
  28 |   // Click on bucket card to go to detail
  29 |   await page.click('text=Edit Me');
  30 |   await page.click('button:has-text("Edit")');
  31 |   await page.getByPlaceholder('e.g. Groceries').fill('Edited');
  32 |   await page.click('button:has-text("Update")');
  33 |   await expect(page.locator("text=Edited")).toBeVisible();
  34 | });
  35 | 
  36 | test("delete a bucket", async ({ page }) => {
  37 |   await page.goto("/login");
  38 |   await page.getByPlaceholder('username').fill('admin');
  39 |   await page.getByPlaceholder('password').fill('budgie123');
  40 |   await page.click('button:has-text("Sign in")');
  41 | 
  42 |   await page.click('a:has-text("New Bucket")');
  43 |   await page.getByPlaceholder('e.g. Groceries').fill('Delete Me');
  44 |   await page.getByPlaceholder('e.g. 500.00').fill('100');
  45 |   await page.click('button:has-text("Create")');
  46 | 
  47 |   await page.click('text=Delete Me');
  48 |   await page.click('button:has-text("Delete")');
  49 |   await page.click('button:has-text("Delete")'); // confirm modal
  50 |   await expect(page.locator("text=Delete Me")).not.toBeVisible();
  51 | });
  52 | 
```