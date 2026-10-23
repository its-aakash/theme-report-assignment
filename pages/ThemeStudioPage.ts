import { expect, Page } from '@playwright/test';
import { clickMenu } from '../utils/menu';
import { Theme } from '../test-data/themes';

/**
 * Theme Studio: the side panel where the user changes the theme.
 * It opens from the "Theme Studio" item in the left menu.
 */
export class ThemeStudioPage {
  constructor(private page: Page) {}

  get themeSettingsSection() {
    return this.page.getByText('Theme Settings', { exact: true }).first();
  }

  /** Open the Theme Studio panel from the left menu. */
  async openThemeStudio() {
    await clickMenu(this.page, 'Theme Studio');
    await expect(this.themeSettingsSection).toBeVisible();
  }

  async showTile(theme: Theme) {
    // Each theme is a tile with a tooltip like "Amber — applies this colour palette".
    const tile = this.page.getByTitle(`${theme.label} — applies this colour palette`, { exact: true });

    await expect(async () => {
      if (!(await tile.isVisible())) {
        await this.themeSettingsSection.click();
        const presetsTab = this.page.getByRole('button', { name: 'Ready-made colour themes.' });
        if (await presetsTab.isVisible()) await presetsTab.click();
      }
      await expect(tile).toBeVisible({ timeout: 2_000 });
    }).toPass({ timeout: 15_000 });

    return tile;
  }

  /** Click one of the ready-made themes. The change applies immediately (there is no Save button). */
  async selectTheme(theme: Theme) {
    const tile = await this.showTile(theme);
    await tile.click();
  }

  /** The two steps together: open Theme Studio, then pick a theme. */
  async changeTheme(theme: Theme) {
    await this.openThemeStudio();
    await this.selectTheme(theme);
  }
}
