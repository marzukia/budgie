# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: insights.spec.ts >> insights page renders summary and chart
- Location: tests/e2e/insights.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a:has-text("Insights")')

```

# Page snapshot

```yaml
- heading "Budget Overview" [level=2] [ref=e4]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test("insights page renders summary and chart", async ({ page }) => {
  4  |   await page.goto("/login");
  5  |   await page.getByPlaceholder('username').fill('admin');
  6  |   await page.getByPlaceholder('password').fill('budgie123');
  7  |   await page.click('button:has-text("Sign in")');
  8  | 
> 9  |   await page.click('a:has-text("Insights")');
     |              ^ Error: page.click: Test timeout of 30000ms exceeded.
  10 |   await expect(page.locator("text=Monthly Summary")).toBeVisible();
  11 |   await expect(page.locator("text=Monthly Trend")).toBeVisible();
  12 | });
  13 | 
```