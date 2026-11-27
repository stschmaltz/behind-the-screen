import { defineConfig, devices } from '@playwright/test';
import { BASE_URL, E2E_PORT, STORAGE_STATE } from './e2e/support/env';

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    storageState: STORAGE_STATE,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    navigationTimeout: 90_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // The suite runs its own dev server with its own build folder, so it never
  // collides with (or depends on) a dev server you already have open.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `npx next dev -p ${E2E_PORT}`,
        url: BASE_URL,
        env: { NEXT_DIST_DIR: '.next-e2e' },
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
