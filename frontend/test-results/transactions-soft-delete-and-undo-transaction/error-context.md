# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: transactions.spec.ts >> soft delete and undo transaction
- Location: tests/e2e/transactions.spec.ts:23:1

# Error details

```
Error: page.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('a:has-text("New Bucket")')

```

```
Error: write EPIPE
```