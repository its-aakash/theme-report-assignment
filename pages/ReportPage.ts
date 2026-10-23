import { expect, Page } from '@playwright/test';
import { clickMenu } from '../utils/menu';
import { Mode, Theme } from '../test-data/themes';

/** The Report Module (called "Report Builder" in the left menu). */
export class ReportPage {
  constructor(private page: Page) {}

  // Elements we look at in the tests. Each one has a simple name.
  get heading() {
    return this.page.getByRole('heading', { name: 'Reports', level: 1 });
  }
  get tableHeader() {
    return this.page.getByRole('columnheader', { name: 'User id' });
  }
  get firstTableCell() {
    return this.page.getByRole('cell', { name: 'USR-0001', exact: true });
  }
  get pagination() {
    return this.page.getByText(/^\d+–\d+ of \d+$/).first(); // e.g. "1–15 of 1000"
  }
  get newUserButton() {
    return this.page.getByRole('button', { name: 'New User' });
  }
  get addUserDialog() {
    return this.page.locator('[role="dialog"], .urm-modal-card').filter({ hasText: 'Add User Details' }).first();
  }

  get dialogTitle() {
    return this.addUserDialog.getByText('Add User Details');
  }
  get dialogFirstLabel() {
    return this.addUserDialog.locator('label').first();
  }
  get dialogFirstInput() {
    return this.addUserDialog.locator('input').first();
  }

  async openReports() {
    await this.page.goto('/#/dashboard/reports', { waitUntil: 'domcontentloaded' });
    await this.expectLoaded();
  }

  /** The Report Module is ready when its title, table header and first data row are visible. */
  async expectLoaded() {
    await expect(this.page).toHaveURL(/#\/dashboard\/reports/);
    await expect(this.heading).toBeVisible();
    await expect(this.tableHeader).toBeVisible();
    await expect(this.firstTableCell).toBeVisible();
  }

  /** CHECK: the table header (the most colourful part of the report) uses the theme colour. */
  async expectTableHeaderThemed(theme: Theme, mode: Mode) {
    await expect(this.tableHeader, `table header should use the ${theme.label} (${mode}) colour`).toHaveCSS(
      'background-color',
      theme.tableHeader[mode],
    );
  }

  /** Go from the Report Module to the Dashboard using the left menu. */
  async goToDashboardFromMenu() {
    await clickMenu(this.page, 'Dashboard');
    await expect(this.page).toHaveURL(/#\/dashboard\/overview/);
  }

  async openAddUserDialog() {
    await this.newUserButton.click();
    await expect(this.addUserDialog).toBeVisible();
  }
}
