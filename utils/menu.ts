import { Page } from '@playwright/test';

/** Click an item in the left menu, for example "Dashboard", "Report Builder" or "Theme Studio". */
export async function clickMenu(page: Page, menuName: string) {
  await page
    .getByRole('link')
    .filter({ hasText: new RegExp(`^\\s*${menuName}\\s*$`) })
    .first()
    .click();
}
