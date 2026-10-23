# Theme & Report Module tests (Playwright + TypeScript)

These tests check one thing: **when a user changes the theme, the Report Module shows the same theme.**
There are 20 short tests. Each test has a plain-English name and reads like a list of steps.
Expected result today: **14 pass, 6 fail**. The 6 failures are real bugs in the app (see section 3).

## 1. Setup (one time)

You need Node.js 18 or newer.

```bash
npm install
npx playwright install chromium
cp .env.example .env      # then open .env and type your username and password
```

## 2. Run the tests

```bash
npm test                              # run all tests
npm run test:headed                   # run all tests and watch the browser
npx playwright test -g "TH-03"        # run just one test
npm run report                        # open the HTML report (screenshots and videos of failures)
```

## 3. What is tested

| ID | What the test does | What we expect | Today |
|----|--------------------|----------------|-------|
| TH-00 | Log in as a new user | Default theme (Emerald, light) is shown | Pass |
| TH-01 | Change the theme from the Dashboard | The chosen theme is applied and saved | Pass |
| TH-01b | Click the Light/Dark button in the top bar | Dark mode is applied | Pass |
| TH-02 | Change theme, then open the Report Module | The Report shows the same theme | Pass |
| TH-02b | Same, in dark mode | The Report shows the same theme | Pass |
| TH-03 | Refresh the Report Module | The theme stays the same | Pass |
| TH-04 | Go Dashboard → Report → Dashboard | The theme stays the same everywhere | Pass |
| TH-05 | Change theme again, then open the Report | The latest theme is shown | Pass |
| TH-05b | Click all themes quickly | The last one wins | Pass |
| TH-06 | Open the Report in a new tab | Login is needed, then the saved theme is shown | Pass |
| TH-06b | Open the Report link without logging in | We are sent to the login screen | Pass |
| TH-07 | Look at the Report in the default theme | Text, table and dialog are easy to read | **Fail** (DEF-04) |
| TH-07b | Same, in dark mode | Text, table and dialog are easy to read | Pass |
| TH-07c | Look at the "NEW" button in Indigo Violet | Button text is easy to read | **Fail** (DEF-01) |
| TH-07d | Check every theme tile can be used with the keyboard | Every tile is reachable | **Fail** (DEF-02) |
| TH-08a | Saved theme is not valid JSON | Default theme, Report opens | Pass |
| TH-08b | Saved theme has an invalid colour | Report still opens | **Fail** (DEF-05) |
| TH-08c | Saved theme has an unknown theme and mode (Dashboard) | Default theme is used | **Fail** (DEF-03) |
| TH-08e | Saved theme has an unknown theme and mode (Report) | Report still opens | **Fail** (DEF-05) |
| TH-08f | Saved theme has missing values | Report still opens | Pass |

The "Today" column comes from an earlier full run on staging (22 Oct 2026). The 6 failing tests fail because of
bugs in the app, not because of the test code. The bugs are in `docs/Manual-Test-Cases-and-Defect-Report.xlsx`.
If the app is fixed, those tests will start to pass.

## 4. Folder map

```
tests/theme-report.spec.ts   all 20 tests (start reading here)
pages/                       one file per screen; each has the clicks and checks for that screen
  LoginPage.ts               login screen
  DashboardPage.ts           Dashboard
  ThemeStudioPage.ts         Theme Studio panel (this is where the theme is changed)
  ReportPage.ts              Report Module
fixtures/test.ts             creates the page objects and logs in (nothing else)
test-data/themes.ts          the themes and their colours, in one place
utils/theme.ts               small shared steps and checks: switchMode, expectTheme, expectThemeSaved, editSavedTheme
utils/menu.ts                click an item in the left menu
utils/contrast.ts            "is this text readable?" check (used by TH-07)
playwright.config.ts         browser, timeouts, reports
.env.staging                 copy to .env and add your login
```

## 5. How to read a test

```ts
test('TH-02 Open Report Module after changing theme', async ({ loggedIn, themeStudioPage, reportPage, page }) => {
  await themeStudioPage.changeTheme(themes.corporateBlue);         // 1. choose a theme
  await reportPage.open();                                         // 2. open the Report Module
  await expectTheme(page, themes.corporateBlue, 'light');          // 3. check the theme is applied
});
```

- `loggedIn` means "log me in first". `themeStudioPage` and `reportPage` are ready-to-use screens. `page` is the browser tab.
- Words starting with `expect` are **checks**. If a check is wrong, the test fails.
- To add a new theme to the tests, add it to `test-data/themes.ts`.

## 6. Good to know

- Every test starts with a fresh browser, logs in (about 1 second) and picks its own theme.
  We log in every time because this app keeps the login in a place Playwright cannot save to a file.
- The app saves the theme only in the browser (no server call), so the TH-08 tests simulate a bad setting by editing the saved value.
- Never share or commit the `.env` file. It holds your password.
