import { expect, Page } from '@playwright/test';

/** The login screen. */
export class LoginPage {
  constructor(private page: Page) {}

  async open() {
    await this.page.goto('/#/login', { waitUntil: 'domcontentloaded' });
    await expect(this.page.getByLabel('Email address')).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.page.getByLabel('Email address').fill(username);
    await this.page.getByLabel('Password', { exact: true }).fill(password);
    await this.page.getByRole('button', { name: /sign in/i }).click();
    // After a successful login the app opens the dashboard.
    await expect(this.page).toHaveURL(/#\/dashboard/);
  }

  /** Used by tests that expect to be sent back to the login screen. */
  async expectLoginScreen() {
    await expect(this.page).toHaveURL(/#\/login/);
    await expect(this.page.getByLabel('Email address')).toBeVisible();
  }
}
