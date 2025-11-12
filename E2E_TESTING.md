# End-to-End Testing Guide

This project uses **Playwright** for reliable, non-flaky end-to-end testing.

## Why Playwright?

Playwright is significantly more reliable than older E2E tools because:

- ✅ **Auto-waiting** - Automatically waits for elements to be ready
- ✅ **Better async handling** - Handles race conditions properly
- ✅ **Built-in retry logic** - Retries on transient failures
- ✅ **Network interception** - Can mock API calls for stability
- ✅ **Parallel execution** - Tests run faster
- ✅ **Great debugging** - Screenshots, videos, traces on failures

## Setup

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test
npx playwright install
```

### 2. Configure Test User

Create a `.env.test` file with test credentials:

```env
TEST_USER_EMAIL=your-test-user@example.com
TEST_USER_PASSWORD=your-test-password
```

**Important:** Use a dedicated test account, not a real user account!

### 3. Database Seeding (Optional)

For more reliable tests, consider seeding your test database with known data:

```bash
npm run db:seed:test
```

## Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run specific test file
npx playwright test e2e/encounter-full-flow.spec.ts

# Debug a test
npx playwright test --debug
```

## Writing Non-Flaky Tests

### 1. Use Proper Selectors

**Good (Stable):**
```typescript
// Use roles (most stable)
await page.getByRole('button', { name: /save/i });

// Use test IDs
await page.getByTestId('submit-button');

// Use labels
await page.getByLabel('Email address');
```

**Bad (Flaky):**
```typescript
// CSS selectors that change
await page.locator('.btn-primary-xl-rounded');

// Text that might change
await page.locator('text=Save Changes');
```

### 2. Use Auto-Waiting

Playwright automatically waits - don't use arbitrary timeouts:

**Good:**
```typescript
await page.getByRole('button', { name: /save/i }).click();
await expect(page.getByText('Saved!')).toBeVisible();
```

**Bad:**
```typescript
await page.click('.save-btn');
await page.waitForTimeout(2000); // ❌ Arbitrary wait
```

### 3. Use Test Steps

Break tests into logical steps for better debugging:

```typescript
test('create campaign', async ({ page }) => {
  await test.step('Navigate to campaigns', async () => {
    await page.goto('/campaigns');
  });

  await test.step('Fill campaign form', async () => {
    await page.fill('input[name="name"]', 'My Campaign');
  });

  await test.step('Save campaign', async () => {
    await page.getByRole('button', { name: /save/i }).click();
    await expect(page.getByText('My Campaign')).toBeVisible();
  });
});
```

### 4. Isolate Tests

Each test should be independent:

```typescript
test.describe('Campaign Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Create fresh data for each test
    await page.goto('/');
    // ... login and setup
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: Delete test data
  });
});
```

### 5. Use Fixtures for Common Setup

```typescript
// fixtures/authenticated-page.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
    
    await use(page);
  },
});

// In your test
test('create campaign', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/campaigns/new');
  // ...
});
```

### 6. Mock External Dependencies

For more stability, mock external APIs:

```typescript
test('shows weather data', async ({ page }) => {
  // Mock API response
  await page.route('**/api/weather', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ temp: 72, condition: 'sunny' }),
    });
  });

  await page.goto('/dashboard');
  await expect(page.getByText('72°')).toBeVisible();
});
```

## Test Organization

```
e2e/
├── fixtures/           # Reusable test fixtures
├── helpers/            # Helper functions
├── auth/              # Authentication flow tests
├── campaigns/         # Campaign management tests
├── encounters/        # Encounter tests
│   ├── create.spec.ts
│   ├── full-flow.spec.ts
│   └── combat.spec.ts
└── players/           # Player management tests
```

## Common Patterns

### Creating Test Data

```typescript
async function createTestCampaign(page, name: string) {
  await page.goto('/campaigns/new');
  await page.fill('input[name="name"]', name);
  await page.fill('textarea[name="description"]', 'Test campaign');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page.getByText(name)).toBeVisible();
  
  const url = page.url();
  const campaignId = url.match(/campaigns\/([^/]+)/)?.[1];
  return campaignId;
}
```

### Waiting for Network

```typescript
test('loads data', async ({ page }) => {
  await page.goto('/campaigns');
  
  // Wait for specific API call
  const response = await page.waitForResponse(
    resp => resp.url().includes('/api/campaigns') && resp.status() === 200
  );
  
  const data = await response.json();
  expect(data.campaigns).toBeDefined();
});
```

### Taking Screenshots for Debugging

```typescript
test('complex interaction', async ({ page }) => {
  await page.goto('/encounters/123');
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'debug-before.png' });
  
  await page.getByRole('button', { name: /start/i }).click();
  
  await page.screenshot({ path: 'debug-after.png' });
});
```

## Debugging Failed Tests

### 1. Use Trace Viewer

When a test fails, view the trace:

```bash
npx playwright show-trace trace.zip
```

### 2. Use Debug Mode

```bash
npx playwright test --debug
```

This opens a browser and debugger where you can step through the test.

### 3. Check Screenshots

Failed tests automatically capture screenshots in `test-results/`.

### 4. Use UI Mode

```bash
npm run test:e2e:ui
```

Interactive UI to watch tests run and inspect failures.

## CI/CD Integration

In your CI pipeline (GitHub Actions, etc.):

```yaml
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  env:
    TEST_USER_EMAIL: ${{ secrets.TEST_USER_EMAIL }}
    TEST_USER_PASSWORD: ${{ secrets.TEST_USER_PASSWORD }}

- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Performance Tips

1. **Run tests in parallel** (Playwright does this by default)
2. **Reuse authentication state** between tests
3. **Mock slow external APIs**
4. **Use database snapshots** for faster test data setup
5. **Only test UI flows**, not business logic (use unit tests for that)

## Best Practices

- ✅ Write user-focused tests (test what users do, not implementation)
- ✅ Test critical paths first
- ✅ Keep tests independent and isolated
- ✅ Use descriptive test names
- ✅ Don't test every edge case in E2E (use unit tests)
- ✅ Keep test data minimal
- ✅ Clean up test data after tests
- ❌ Don't use `waitForTimeout()` (use auto-waiting)
- ❌ Don't test external services directly
- ❌ Don't make tests depend on each other

## Example: Full Flow Test

See `e2e/encounter-full-flow.spec.ts` for a complete example testing:
1. Sign in
2. Create campaign
3. Add players
4. Create encounter
5. Start combat
6. Play turns
7. Complete encounter

This test demonstrates proper structure, waiting, and assertions.

## Troubleshooting

### "Element not found"
- Check if element has different selector in your app
- Ensure page has loaded completely
- Check if element is hidden or disabled

### "Test timeout"
- Increase timeout in `playwright.config.ts`
- Check if app is running (`npm run dev`)
- Check for JavaScript errors in console

### "Database locked" errors
- Use separate test database
- Ensure tests clean up properly
- Run tests serially if needed (`workers: 1`)

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)

