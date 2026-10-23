import { expect, Page } from '@playwright/test';
import { Mode, THEME_STORAGE_KEY, Theme } from '../test-data/themes';

/**
 * Small reusable steps and checks about the theme.
 * They work on any screen (Dashboard or Report), so each one just needs the `page`.
 */

/** Click the Light/Dark button in the top bar (does nothing if we are already in that mode). */
export async function switchMode(page: Page, mode: Mode) {
  const html = page.locator('html');
  const currentMode = await html.getAttribute('data-theme-mode');
  if (currentMode === mode) return;

  // The button says "Switch to Dark Mode" when we are in light mode, and the opposite.
  const buttonName = mode === 'dark' ? 'Switch to Dark Mode' : 'Switch to Light Mode';
  await page.getByRole('button', { name: buttonName }).click();
  await expect(html).toHaveAttribute('data-theme-mode', mode);
}

export async function expectTheme(page: Page, theme: Theme, mode: Mode) {
  const html = page.locator('html');
  await expect(html, `mode should be ${mode}`).toHaveAttribute('data-theme-mode', mode);

  // The colour animates for a moment, so we keep checking until it matches (or time runs out).
  await expect
    .poll(
      async () => {
        const color = await html.evaluate((el) => getComputedStyle(el).getPropertyValue('--primary'));
        return color.trim().toLowerCase();
      },
      { message: `${theme.label} (${mode}) main colour should be ${theme.primary[mode]}` },
    )
    .toBe(theme.primary[mode].toLowerCase());
}

/** CHECK: the browser has saved this theme (so it survives a refresh). */
export async function expectThemeSaved(page: Page, theme: Theme, mode: Mode) {
  await expect
    .poll(async () =>
      page.evaluate((key) => {
        const saved = JSON.parse(localStorage.getItem(key) || '{}');
        return { presetId: saved.state?.settings?.presetId, mode: saved.state?.settings?.mode };
      }, THEME_STORAGE_KEY),
    )
    .toEqual({ presetId: theme.id, mode });
}

export async function editSavedTheme(page: Page, changes: Record<string, string>) {
  await page.evaluate(
    ([key, changes]) => {
      const saved = JSON.parse(localStorage.getItem(key as string)!);
      Object.assign(saved.state.settings, changes);
      localStorage.setItem(key as string, JSON.stringify(saved));
    },
    [THEME_STORAGE_KEY, changes] as const,
  );
}

/** Replaces the saved theme with any text we want (even text that is not valid JSON). */
export async function saveRawTheme(page: Page, text: string) {
  await page.evaluate(([key, text]) => localStorage.setItem(key, text), [THEME_STORAGE_KEY, text] as const);
}
