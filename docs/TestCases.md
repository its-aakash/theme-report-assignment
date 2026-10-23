# Test Cases: Theme change and Report Module

**Application:** OomniEye staging (base-application-stage.oomnieye.com)
**Scope:** When a user changes the theme, the Report Module shows the same theme.
**Total:** 20 test cases, each automated in Playwright (`tests/theme-report.spec.ts`).
**Last full run:** 22 Oct 2026, Chromium. Result: 14 pass, 6 fail.

**Common precondition (all cases unless noted):** fresh browser window (or cleared site data) so the default theme (Emerald, light) is shown, and the user is signed in.

## Summary

| ID | Scenario | Group | Automated result | Defect |
|----|----------|-------|------------------|--------|
| TH-00 | New user sees the default theme | A. Change the theme | Pass | |
| TH-01 | Change theme from Dashboard | A. Change the theme | Pass | |
| TH-01b | Switch to dark mode from the top bar | A. Change the theme | Pass | |
| TH-02 | Open Report Module after changing theme | B. Report shows theme | Pass | |
| TH-02b | Open Report Module in dark mode after changing theme | B. Report shows theme | Pass | |
| TH-03 | Refresh Report Module | B. Report shows theme | Pass | |
| TH-04 | Navigate Dashboard > Report > Dashboard | B. Report shows theme | Pass | |
| TH-05 | Change theme again and reopen Report Module | B. Report shows theme | Pass | |
| TH-05b | Click several themes quickly | B. Report shows theme | Pass | |
| TH-06 | Open Report Module directly in a new tab | B. Report shows theme | Pass | |
| TH-06b | Open Report link without logging in | B. Report shows theme | Pass | |
| TH-07 | Report Module readable in default theme | C. Readability | **Fail** | DEF-04 |
| TH-07b | Report Module readable in dark mode | C. Readability | Pass | |
| TH-07c | "NEW" button text readable in Indigo Violet | C. Readability | **Fail** | DEF-01 |
| TH-07d | Every theme can be chosen with the keyboard | C. Readability | **Fail** | DEF-02 |
| TH-08a | Saved theme is not valid JSON | D. Wrong saved theme | Pass | |
| TH-08b | Saved theme has an invalid colour | D. Wrong saved theme | **Fail** | DEF-05 |
| TH-08c | Unknown theme and mode (Dashboard) | D. Wrong saved theme | **Fail** | DEF-03 |
| TH-08e | Unknown theme and mode (Report) | D. Wrong saved theme | **Fail** | DEF-05 |
| TH-08f | Saved theme has missing values | D. Wrong saved theme | Pass | |

---

## A. Change the theme

### TH-00: A new user sees the default theme
**Steps**
1. Open the app and sign in.
2. Look at the Dashboard.
3. Open "Report Builder" in the left menu.

**Expected:** Both the Dashboard and the Report Module use the default theme: Emerald (green), light mode.

### TH-01: Change theme from Dashboard
**Steps**
1. Open the app and sign in.
2. Open "Theme Studio" > "Theme Settings" > "Presets" and click "Corporate Blue".

**Expected:** The Dashboard changes to Corporate Blue straight away. No Save button is needed. The choice is saved in the browser.

### TH-01b: Switch to dark mode from the top bar
**Steps**
1. Open the app and sign in.
2. Click the Light/Dark button in the top bar ("Switch to Dark Mode").

**Expected:** The page changes to dark mode (dark background, light text). The theme colour stays Emerald.

---

## B. Report Module shows the theme

### TH-02: Open Report Module after changing theme
**Steps**
1. Open the app and sign in.
2. Open Theme Studio > Theme Settings > Presets and click "Corporate Blue".
3. Click "Report Builder" in the left menu.

**Expected:** The Report Module uses Corporate Blue. The table header has a light blue tint. Nothing is still green.

### TH-02b: Open Report Module in dark mode after changing theme
**Steps**
1. Open the app and sign in.
2. Open Theme Studio > Theme Settings > Presets and click "Ocean Teal".
3. Click the Light/Dark button to switch to dark mode.
4. Click "Report Builder".

**Expected:** The Report Module uses Ocean Teal in dark mode.

### TH-03: Refresh Report Module
**Steps**
1. Open the app and sign in.
2. Choose "Ocean Teal" and switch to dark mode.
3. Open "Report Builder".
4. Press F5 to refresh.

**Expected:** After the refresh the Report Module still shows Ocean Teal in dark mode.

### TH-04: Navigate Dashboard > Report > Dashboard
**Steps**
1. Open the app and sign in.
2. Choose "Amber" and switch to dark mode.
3. Close Theme Studio and stay on the Dashboard.
4. Click "Report Builder".
5. Click "Dashboard" in the left menu.

**Expected:** Amber dark is shown on the Dashboard, then on the Report Module, then on the Dashboard again. The theme never changes by itself.

### TH-05: Change theme again and reopen Report Module
**Steps**
1. Open the app and sign in.
2. Choose "Amber", open "Report Builder" and look at the colours.
3. Go back to the Dashboard.
4. Change the theme to "Graphite".
5. Open "Report Builder" again.

**Expected:** The Report Module shows Graphite (the latest choice), not Amber.

### TH-05b: Click several themes quickly
**Steps**
1. Open the app and sign in.
2. Open Theme Studio > Presets.
3. Click every theme one after the other, finishing with "Indigo Violet" (the last tile in the list; the manual sheet says "Graphite", which differs from the automated test, see note below).
4. Open "Report Builder".

**Expected:** The last clicked theme is shown on the Dashboard and on the Report Module. No older theme is shown.

> **Note:** The automated test finishes with Indigo Violet (last entry in `test-data/themes.ts`), while the Excel manual case says Graphite. Align one of them so both describe the same scenario.

### TH-06: Open Report Module directly in a new tab
**Rule seen while exploring:** the theme is saved in the browser; the login belongs to one tab only.

**Steps**
1. Open the app and sign in.
2. Choose "Corporate Blue" and switch to dark mode.
3. Copy the Report Module address (`...#/dashboard/reports`).
4. Open a new browser tab and paste the address.
5. Sign in when asked.
6. Open "Report Builder" if you are not already there.

**Expected:** The new tab asks you to sign in. After signing in, the Report Module shows Corporate Blue in dark mode.
**Open question (Q3):** after login the app opens the Dashboard, not the Report. Confirm with the product owner.

### TH-06b: Open Report link without logging in
**Precondition:** a private (incognito) window, not signed in.

**Steps**
1. Open a new private window.
2. Paste the Report Module address (`...#/dashboard/reports`).

**Expected:** The login screen is shown. The Report Module is not shown.

---

## C. Readability

### TH-07: Report Module readable in the default theme (Emerald, light)
**Steps**
1. Open the app and sign in.
2. Open "Report Builder".
3. Look at the "Reports" title, table header, table rows and page numbers.
4. Click "New User" to open the "Add User Details" dialog.
5. Look at the dialog title and field labels. Click in a field and type.

**Expected:** All text is easy to read (contrast at least 3:1 for large text, 4.5:1 for normal text). Table, dialog and fields are usable.
**Known issue:** "Reports" heading is light green on white (DEF-04).

### TH-07b: Report Module readable in dark mode (Corporate Blue, dark)
**Steps**
1. Open the app and sign in.
2. Choose "Corporate Blue" and switch to dark mode.
3. Open "Report Builder".
4. Repeat steps 3-5 of TH-07.

**Expected:** All text, table, dialog and fields are easy to read on the dark background.

### TH-07c: "NEW" button text readable in Indigo Violet
**Steps**
1. Open the app and sign in.
2. Choose "Indigo Violet".
3. Look at the text on the "NEW" button on the Dashboard.

**Expected:** Button text contrast is at least 4.5:1.
**Known issue:** white text on light purple is hard to read (DEF-01).

### TH-07d: Every theme can be chosen with the keyboard
**Steps**
1. Open the app and sign in.
2. Open Theme Studio > Presets.
3. Press Tab repeatedly.
4. When a theme tile is highlighted, press Enter.

**Expected:** Tab moves through every theme tile and Enter chooses the highlighted theme.
**Known issue:** tiles cannot be reached with the keyboard (DEF-02).

---

## D. Wrong saved theme

The theme is saved only in the browser (Local Storage key `omnieye-theme-studio`), so these tests damage that value and check the app copes. They need browser DevTools (F12 > Application > Local Storage). Assumption to confirm (Q5): the app should use the default theme and fix the saved value.

### TH-08a: Saved theme is not valid JSON
**Steps**
1. Open the app and sign in.
2. Open "Report Builder".
3. In DevTools, set the `omnieye-theme-studio` value to: `{not valid json`
4. Refresh the page.

**Expected:** The app ignores the broken value, shows the default theme (Emerald, light), the Report Module opens normally, and no page errors are thrown.

### TH-08b: Saved theme has an invalid colour
**Steps**
1. Open the app and sign in.
2. Choose "Amber".
3. In DevTools, edit the saved value and change `primaryHex` to `not-a-colour`.
4. Open "Report Builder" and refresh.

**Expected:** The app ignores the wrong colour and the Report Module opens normally.
**Known issue:** the page is blank (DEF-05).

### TH-08c: Saved theme has an unknown theme and mode (Dashboard)
**Steps**
1. Open the app and sign in.
2. Choose "Amber".
3. In DevTools, change `presetId` to `does-not-exist` and `mode` to `purple`.
4. Open the Dashboard and refresh.

**Expected:** The Dashboard shows the default theme (Emerald, light).
**Known issue:** the page keeps the mode "purple" and looks half-styled (DEF-03).

### TH-08e: Saved theme has an unknown theme and mode (Report)
**Steps**
1. Open the app and sign in.
2. Choose "Amber".
3. In DevTools, change `presetId` to `does-not-exist` and `mode` to `purple`.
4. Open "Report Builder" and refresh.

**Expected:** The Report Module opens normally with a valid theme.
**Known issue:** the page is blank (DEF-05).

### TH-08f: Saved theme has missing values
**Steps**
1. Open the app and sign in.
2. In DevTools, replace the whole value with:
   `{"state":{"settings":{"presetId":"teal","mode":"dark"}},"version":0}`
3. Open "Report Builder" and refresh.

**Expected:** The Report Module opens normally (the app fills in the missing values) and no page errors are thrown.
