import { expect, Page } from '@playwright/test';
import { clickMenu } from '../utils/menu';

export class DashboardPage {
  constructor(private page: Page) {}

  get newButton() {
    return this.page.getByRole('button', { name: 'Create New Record' }).first();
  }

  async openDashboard() {
    await this.page.goto('/#/dashboard/overview', { waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  /** The Dashboard is ready when we are on its address and the left menu is visible. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/#\/dashboard\/overview/);
    await expect(this.page.getByRole('link', { name: 'Dashboard' }).first()).toBeVisible();
  }

  /** Go from Dashboard to the Report Module using the left menu. */
  async goToReportsFromMenu() {
    await clickMenu(this.page, 'Report Builder');
    await expect(this.page).toHaveURL(/#\/dashboard\/reports/);
  }
}
