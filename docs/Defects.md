# Defect Report: Theme change and Report Module

**Environment (all defects):** OomniEye staging (base-application-stage.oomnieye.com), Chromium, 22 Oct 2026, general-user account.
**Evidence:** when an automated test fails, Playwright saves a screenshot, video and trace in `test-results/` (open with `npm run report`).
**Priority:** left for the team to set.

## Summary

| ID | Title | Severity | Found by | Status |
|----|-------|----------|----------|--------|
| DEF-01 | Button text hard to read in 3 of 6 themes | Medium | TH-07c | Open |
| DEF-02 | Themes cannot be chosen with the keyboard | Medium | TH-07d | Open |
| DEF-03 | Unsupported theme mode / theme name is not validated | Medium | TH-08c | Open |
| DEF-04 | "Reports" heading hard to read in default theme | Medium | TH-07 | Open |
| DEF-05 | Report Module shows a blank page when saved theme is invalid | High | TH-08b, TH-08e | Open |
| SEC-01 | Login checked only inside the browser (outside theme scope) | High if production behaves the same | Exploration | Open |

---

## DEF-01: Button text is hard to read in 3 of 6 themes (contrast too low)
- **Severity:** Medium
- **Found by:** TH-07c
- **Steps to reproduce**
  1. Sign in. Open Theme Studio > Presets.
  2. Choose Indigo Violet (also try Amber and Corporate Blue).
  3. Look at the text on the Dashboard "NEW" button.
- **Expected:** Text contrast is at least 4.5:1 (WCAG 2.1 AA).
- **Actual:** White text on the theme colour:

  | Theme | Contrast | Result |
  |-------|----------|--------|
  | Indigo Violet | 3.02:1 | Fail |
  | Amber | 3.79:1 | Fail |
  | Corporate Blue | 4.30:1 | Fail |
  | Ocean Teal | 4.52:1 | Only just passes |
  | Graphite | 7.24:1 | Pass |
  | Emerald | 7.25:1 | Pass |

- **Likely cause:** Each theme sets its own button text colour. Emerald correctly uses dark text; the other themes use white even when their main colour is light.
- **Suggested fix:** Pick black or white text automatically based on the theme colour, or darken the three failing theme colours.

## DEF-02: Themes cannot be chosen with the keyboard
- **Severity:** Medium
- **Found by:** TH-07d
- **Steps to reproduce**
  1. Sign in. Open Theme Studio > Presets.
  2. Press Tab repeatedly.
- **Expected:** Every theme tile can be reached with Tab and chosen with Enter or Space. The selected theme is announced to screen readers.
- **Actual:** Tiles cannot be focused. Keyboard and screen-reader users cannot change the theme (the Light/Dark button does work).
- **Likely cause:** Tiles are plain clickable boxes (no button or radio role, not focusable).
- **Suggested fix:** Use buttons or a radio group (`role="radio"`, `aria-checked`) and show a visible focus outline.

## DEF-03: Unsupported theme mode / theme name is not checked ("purple" ends up in the page)
- **Severity:** Medium
- **Found by:** TH-08c
- **Steps to reproduce**
  1. Sign in and choose Amber.
  2. DevTools > Application > Local Storage > key `omnieye-theme-studio`.
  3. Set `presetId` = `does-not-exist` and `mode` = `purple`.
  4. Reload the Dashboard.
- **Expected:** Wrong values are rejected. The app goes back to the default theme (Emerald, light) and fixes the saved value.
- **Actual:**
  - The page gets `data-theme-mode="purple"`, so neither light nor dark styling applies (white page, unstyled sidebar).
  - Amber colours stay; the default is not used.
  - The wrong values stay saved.
- **Likely cause:** When loading the saved theme, the app copies `mode` and `presetId` without checking them against the allowed values (light/dark and the six theme names).
- **Suggested fix:** Check both values against allowed lists on load, fall back to the default theme, and save the corrected values.

## DEF-04: "Reports" heading is hard to read in the default theme (Emerald, light)
- **Severity:** Medium
- **Found by:** TH-07
- **Steps to reproduce**
  1. Open the app in a fresh browser (Emerald, light).
  2. Open Report Builder.
  3. Look at the "Reports" heading.
- **Expected:** Heading text contrast is at least 3:1 (large text, WCAG AA).
- **Actual:** Green heading (#10B981) on white = 2.54:1. This is what every new user sees first.
- **Likely cause:** The heading uses the theme main colour as its text colour, and Emerald is too light for that.
- **Suggested fix:** Use a darker text colour for headings on light backgrounds.

## DEF-05: Report Module shows a blank page when the saved theme is invalid
- **Severity:** High
- **Found by:** TH-08b and TH-08e
- **Steps to reproduce**
  - **A) Invalid colour**
    1. Sign in and choose Amber.
    2. DevTools > Local Storage > `omnieye-theme-studio`: set `state.settings.primaryHex` = `not-a-colour`.
    3. Reload and open Report Builder.
  - **B) Unknown theme**
    1. Same key: set `presetId` = `does-not-exist` (and/or `mode` = `purple`).
    2. Reload and open Report Builder.
- **Expected:** Wrong values are ignored. The default theme is used and the Report Module opens (the Dashboard already behaves like this).
- **Actual:** The page is completely blank. The only way to recover is to clear the site data.
  - A) Console error: `Minified MUI error #9 ... not-a-colour`
  - B) Console error: `Cannot read properties of undefined (reading 'disabled')`
- **Likely cause:** The saved theme is not checked, so the bad colour reaches the UI library (MUI) or a theme setting is missing. There is no error screen to catch the problem in the Report Module.
- **Suggested fix:** Check the saved theme on load (colours and theme names), fall back to the default, and add an error boundary around the Report Module.

## SEC-01: Login is checked only inside the browser (outside theme scope, report separately)
- **Severity:** High if production works the same way
- **Found by:** Exploration
- **Steps to reproduce**
  1. Sign in and watch the Network tab.
  2. Look at the app JavaScript and at Session Storage.
- **Expected:** The server checks the login and sends back a session.
- **Actual:** No network request is made at sign-in. The login details are inside the downloaded JavaScript file, and "logged in" is just a Session Storage value set to `true`. With "Remember me", the email is saved in plain text.
- **Likely cause:** Login is done fully on the client side.
- **Suggested fix:** Check the login on the server and use a secure session cookie or token. Never put login details in browser code.

---

## Open questions for the product owner

| ID | Question | Why we ask |
|----|----------|------------|
| Q1 | Should the theme follow the user to other devices (saved on the server), or stay in one browser? | Today it is saved only in the browser. TH-06 and TH-08 are based on this. |
| Q2 | Is Theme Studio meant for every normal user? It also changes branding (app name, logo, login screen). | It looks like an admin feature. |
| Q3 | After login from a direct Report link (new tab), should the user land on the Report Module? | Today the user lands on the Dashboard. |
| Q4 | Must all six themes meet WCAG AA? | Three themes fail for button text (DEF-01); the default theme fails for the heading (DEF-04). |
| Q5 | What should the app do when the saved theme is invalid? | We assume "use the default theme and fix the saved value" (TH-08). Please confirm. |
