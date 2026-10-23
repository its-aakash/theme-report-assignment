import { test as base } from '@playwright/test';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { ReportPage } from '../pages/ReportPage';
import { ThemeStudioPage } from '../pages/ThemeStudioPage';

/** Reads the username and password from the .env file. Stops with a clear message if they are missing. */
export function getCredentials() {
  const username = process.env.OOMNIEYE_USERNAME;
  const password = process.env.OOMNIEYE_PASSWORD;
  if (!username || !password) {
    throw new Error('Missing OOMNIEYE_USERNAME or OOMNIEYE_PASSWORD. Copy .env.staging to .env and fill it in.');
  }
  return { username, password };
}

/**
 * Fixtures = things every test gets ready-made.
 * A test only has to name what it needs, for example: async ({ loggedIn, dashboardPage }) => { ... }
 */
export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  reportPage: ReportPage;
  themeStudioPage: ThemeStudioPage;
  loggedIn: void;
}>({
  // 1) Create the page objects.
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  reportPage: async ({ page }, use) => {
    await use(new ReportPage(page));
  },

  themeStudioPage: async ({ page }, use) => {
    await use(new ThemeStudioPage(page));
  },

  // 2) Log in. Only tests that list "loggedIn" will log in.
  // (We log in for every test because the app keeps the login in sessionStorage,
  // which Playwright cannot save to a file
  loggedIn: async ({ loginPage }, use) => {
    const { username, password } = getCredentials();
    await loginPage.open();
    await loginPage.login(username, password);
    await use();
  },
});

export { expect } from '@playwright/test';
