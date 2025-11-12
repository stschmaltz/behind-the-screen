# E2E Tests

End-to-end tests using Playwright.

## Quick Start

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Copy env template
cp .env.test.example .env.test
# Edit .env.test with test credentials

# Run tests
npm run test:e2e

# Run with UI (recommended for development)
npm run test:e2e:ui
```

## Test Files

- `example.spec.ts` - Basic navigation tests
- `encounter-full-flow.spec.ts` - Complete encounter workflow test

## Key Features

✅ **Auto-waiting** - No need for manual delays
✅ **Auto-retry** - Handles transient failures
✅ **Screenshots on failure** - Easy debugging
✅ **Test isolation** - Each test is independent
✅ **Parallel execution** - Fast test runs

See [E2E_TESTING.md](../E2E_TESTING.md) for complete documentation.

