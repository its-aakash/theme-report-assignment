import { test, expect, getCredentials } from '../fixtures/test';
import { LoginPage } from '../pages/LoginPage';
import { ReportPage } from '../pages/ReportPage';
import { expectReadable, LARGE_TEXT, NORMAL_TEXT } from '../utils/contrast';
import { editSavedTheme, expectTheme, expectThemeSaved, saveRawTheme, switchMode } from '../utils/theme';
import { defaultTheme, themes } from '../test-data/themes';

/**
 * 20 tests for: "When the theme changes, the Report Module shows the same theme".
 *
 * How to read this file:
 *   - Every test starts with a clean browser and logs in ("loggedIn").
 *   - themeStudioPage.changeTheme(...)  = the user picks a theme in Theme Studio.
 *   - expectTheme(...)                  = check the screen really uses that theme.
 *
 * Groups:
 *   A. Change the theme            TH-00, TH-01, TH-01b
 *   B. Report Module shows it      TH-02, TH-02b, TH-03, TH-04, TH-05, TH-05b, TH-06, TH-06b
 *   C. Can we read the text?       TH-07, TH-07b, TH-07c, TH-07d
 *   D. Wrong saved theme           TH-08a, TH-08b, TH-08c, TH-08e, TH-08f
 *
 * Six tests (TH-07, TH-07c, TH-07d, TH-08b, TH-08c, TH-08e) are expected to FAIL today,
 * because they find real bugs in the app. See the defect report in the docs folder.
 */

// =============================================================================================
// A. CHANGE THE THEME
// =============================================================================================

test('TH-00 A new user sees the default theme (Emerald, light)', async ({ loggedIn, reportPage, page }) => {
  await expectTheme(page, defaultTheme, 'light');

  await reportPage.openReports();
  await expectTheme(page, defaultTheme, 'light');
  await reportPage.expectTableHeaderThemed(defaultTheme, 'light');
});

test('TH-01 Change theme from Dashboard: the selected theme is applied', async ({
  loggedIn,
  themeStudioPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.corporateBlue);

  await expectTheme(page, themes.corporateBlue, 'light');
  await expectThemeSaved(page, themes.corporateBlue, 'light'); // the browser remembers it
});

test('TH-01b Switch to dark mode from the top bar: dark mode is applied', async ({ loggedIn, page }) => {
  await switchMode(page, 'dark');

  await expectTheme(page, defaultTheme, 'dark');
  await expectThemeSaved(page, defaultTheme, 'dark');
});

// =============================================================================================
// B. THE REPORT MODULE SHOWS THE THEME
// =============================================================================================

test('TH-02 Open Report Module after changing theme: the Report shows the same theme', async ({
  loggedIn,
  themeStudioPage,
  reportPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.corporateBlue);

  await reportPage.openReports();

  await expectTheme(page, themes.corporateBlue, 'light');
  await reportPage.expectTableHeaderThemed(themes.corporateBlue, 'light');
});

test('TH-02b Open Report Module in dark mode: the Report shows the same theme', async ({
  loggedIn,
  themeStudioPage,
  reportPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.oceanTeal);
  await switchMode(page, 'dark');

  await reportPage.openReports();

  await expectTheme(page, themes.oceanTeal, 'dark');
  await reportPage.expectTableHeaderThemed(themes.oceanTeal, 'dark');
});

test('TH-03 Refresh the Report Module: the theme stays the same', async ({
  loggedIn,
  themeStudioPage,
  reportPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.oceanTeal);
  await switchMode(page, 'dark');
  await reportPage.openReports();

  await page.reload({ waitUntil: 'domcontentloaded' });

  await reportPage.expectLoaded();
  await expectTheme(page, themes.oceanTeal, 'dark');
  await reportPage.expectTableHeaderThemed(themes.oceanTeal, 'dark');
});

test('TH-04 Go Dashboard to Report and back: the theme stays the same on both', async ({
  loggedIn,
  dashboardPage,
  themeStudioPage,
  reportPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.amber);
  await switchMode(page, 'dark');
  await dashboardPage.openDashboard(); // closes the Theme Studio panel
  await expectTheme(page, themes.amber, 'dark');

  await dashboardPage.goToReportsFromMenu();
  await reportPage.expectLoaded();
  await expectTheme(page, themes.amber, 'dark');

  await reportPage.goToDashboardFromMenu();
  await dashboardPage.expectLoaded();
  await expectTheme(page, themes.amber, 'dark');
});

test('TH-05 Change theme again: the Report shows the latest theme', async ({
  loggedIn,
  dashboardPage,
  themeStudioPage,
  reportPage,
  page,
}) => {
  // First theme
  await themeStudioPage.changeTheme(themes.amber);
  await reportPage.openReports();
  await expectTheme(page, themes.amber, 'light');

  // Second theme
  await dashboardPage.openDashboard();
  await themeStudioPage.changeTheme(themes.graphite);
  await reportPage.openReports();

  // The Report must show Graphite, not Amber.
  await expectTheme(page, themes.graphite, 'light');
  await reportPage.expectTableHeaderThemed(themes.graphite, 'light');
});

test('TH-05b Click several themes quickly: the last one wins', async ({
  loggedIn,
  themeStudioPage,
  reportPage,
  page,
}) => {
  const allThemes = Object.values(themes);
  const lastTheme = allThemes[allThemes.length - 1];

  await themeStudioPage.openThemeStudio();
  for (const theme of allThemes) {
    await themeStudioPage.selectTheme(theme);
  }

  await expectTheme(page, lastTheme, 'light');
  await reportPage.openReports();
  await expectTheme(page, lastTheme, 'light');
});

test('TH-06 Open Report Module in a new tab: login is needed, then the saved theme is shown', async ({
  loggedIn,
  themeStudioPage,
  context,
  page,
}) => {
  // How the app works: the THEME is saved in the browser (every tab sees it),
  // but the LOGIN belongs to one tab only (a new tab must log in again).
  await themeStudioPage.changeTheme(themes.corporateBlue);
  await switchMode(page, 'dark');

  // Open the Report link in a brand-new tab. We expect the login screen.
  const newTab = await context.newPage();
  await newTab.goto('/#/dashboard/reports', { waitUntil: 'domcontentloaded' });
  const newTabLogin = new LoginPage(newTab);
  await newTabLogin.expectLoginScreen();

  // Log in, open the Report, and check it uses the theme chosen in the first tab.
  const { username, password } = getCredentials();
  await newTabLogin.login(username, password);
  const newTabReport = new ReportPage(newTab);
  await newTabReport.openReports();
  await expectTheme(newTab, themes.corporateBlue, 'dark');
  await newTabReport.expectTableHeaderThemed(themes.corporateBlue, 'dark');
});

test('TH-06b Open the Report link without logging in: we are sent to the login screen', async ({
  loginPage,
  page,
}) => {
  await page.goto('/#/dashboard/reports', { waitUntil: 'domcontentloaded' });

  await loginPage.expectLoginScreen();
});

// =============================================================================================
// C. CAN WE READ THE TEXT?
// =============================================================================================

/** Looks at the main parts of the Report Module and checks the text is easy to read. */
async function checkReportIsReadable(reportPage: ReportPage) {
  await expectReadable(reportPage.heading, 'Report heading', LARGE_TEXT);
  await expectReadable(reportPage.tableHeader, 'Table column header', NORMAL_TEXT);
  await expectReadable(reportPage.firstTableCell, 'Table cell', NORMAL_TEXT);
  await expectReadable(reportPage.pagination, 'Pagination text', NORMAL_TEXT);

  // Open the "Add User" dialog and check it too.
  await reportPage.openAddUserDialog();
  await expectReadable(reportPage.dialogTitle, 'Dialog title', LARGE_TEXT);
  await expectReadable(reportPage.dialogFirstLabel, 'Dialog form label', NORMAL_TEXT);
  await expect(reportPage.dialogFirstInput, 'Dialog input should be usable').toBeEditable();
}

// EXPECTED TO FAIL (DEF-04): the "Reports" heading is light green on white.
test('TH-07 Report Module is readable in the default theme (Emerald, light)', async ({ loggedIn, reportPage }) => {
  await reportPage.openReports();
  await checkReportIsReadable(reportPage);
});

test('TH-07b Report Module is readable in dark mode (Corporate Blue, dark)', async ({
  loggedIn,
  themeStudioPage,
  reportPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.corporateBlue);
  await switchMode(page, 'dark');
  await reportPage.openReports();

  await checkReportIsReadable(reportPage);
});

// EXPECTED TO FAIL (DEF-01): white text on light purple is hard to read.
test('TH-07c The "NEW" button text is readable in Indigo Violet', async ({
  loggedIn,
  themeStudioPage,
  dashboardPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.indigoViolet);
  await expectTheme(page, themes.indigoViolet, 'light');

  await expectReadable(dashboardPage.newButton, '"NEW" button text', NORMAL_TEXT);
});

// EXPECTED TO FAIL (DEF-02): theme tiles cannot be reached with the keyboard.
test('TH-07d Every theme can be chosen with the keyboard', async ({ loggedIn, themeStudioPage }) => {
  await themeStudioPage.openThemeStudio();

  for (const theme of Object.values(themes)) {
    const tile = await themeStudioPage.showTile(theme);

    // A tile can be reached with the keyboard only if it is (or sits inside) a button, link or tab stop.
    const canUseKeyboard = await tile.evaluate(
      (el) => el.closest('button, a[href], [role="button"], [role="radio"], [tabindex]:not([tabindex="-1"])') !== null,
    );
    expect(canUseKeyboard, `The "${theme.label}" tile cannot be reached with the keyboard`).toBe(true);
  }
});

// =============================================================================================
// D. WRONG SAVED THEME
// The app saves the theme only in the browser (no server call), so there is no "server error"
// to test. We damage the saved theme instead, like a corrupted or old setting, and see if the
// app copes: it should use a valid theme and never show a blank page.
// =============================================================================================

test('TH-08a Saved theme is not valid JSON: the default theme is used and the Report opens', async ({
  loggedIn,
  reportPage,
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await reportPage.openReports();

  await saveRawTheme(page, '{not valid json');
  await page.reload({ waitUntil: 'domcontentloaded' });

  await reportPage.expectLoaded();
  await expectTheme(page, defaultTheme, 'light');
  expect(pageErrors, 'the page should not throw errors').toEqual([]);
});

// EXPECTED TO FAIL (DEF-05): blank page.
test('TH-08b Saved theme has an invalid colour: the Report Module still opens', async ({
  loggedIn,
  themeStudioPage,
  reportPage,
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await themeStudioPage.changeTheme(themes.amber);

  await editSavedTheme(page, { primaryHex: 'not-a-colour' });
  await page.goto('/#/dashboard/reports', { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(reportPage.heading, 'Report Module should still open').toBeVisible();
  expect(pageErrors, 'the page should not throw errors').toEqual([]);
});

// EXPECTED TO FAIL (DEF-03): the app keeps the unsupported mode "purple".
test('TH-08c Saved theme has an unknown theme and mode: the Dashboard uses the default theme', async ({
  loggedIn,
  themeStudioPage,
  dashboardPage,
  page,
}) => {
  await themeStudioPage.changeTheme(themes.amber);

  await editSavedTheme(page, { presetId: 'does-not-exist', mode: 'purple' });
  await dashboardPage.openDashboard();
  await page.reload({ waitUntil: 'domcontentloaded' });

  await dashboardPage.expectLoaded();
  await expectTheme(page, defaultTheme, 'light');
});

// EXPECTED TO FAIL (DEF-05): blank page.
test('TH-08e Saved theme has an unknown theme and mode: the Report Module still opens', async ({
  loggedIn,
  themeStudioPage,
  reportPage,
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await themeStudioPage.changeTheme(themes.amber);

  await editSavedTheme(page, { presetId: 'does-not-exist', mode: 'purple' });
  await page.goto('/#/dashboard/reports', { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(reportPage.heading, 'Report Module should still open').toBeVisible();
  expect(pageErrors, 'the page should not throw errors').toEqual([]);
});

test('TH-08f Saved theme has missing values: the Report Module still opens', async ({
  loggedIn,
  reportPage,
  page,
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  // An old or half-written setting: a valid theme, but most values are missing.
  await saveRawTheme(page, JSON.stringify({ state: { settings: { presetId: 'teal', mode: 'dark' } }, version: 0 }));
  await page.goto('/#/dashboard/reports', { waitUntil: 'domcontentloaded' });
  await page.reload({ waitUntil: 'domcontentloaded' });

  await reportPage.expectLoaded();
  expect(pageErrors, 'the page should not throw errors').toEqual([]);
});
