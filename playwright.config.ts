import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config(); // reads BASE_URL, OOMNIEYE_USERNAME and OOMNIEYE_PASSWORD from the .env file

export default defineConfig({
  testDir: './tests',
  workers: 2, // staging is shared, so we do not run too many tests at once
  timeout: 120_000, // one test may take up to 2 minutes (the staging site can be slow)
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://base-application-stage.oomnieye.com',
    viewport: { width: 1440, height: 900 },
    navigationTimeout: 90_000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } }],
});
