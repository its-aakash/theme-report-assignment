# Task 1 — Exploration notes (OomniEye staging, 22 Oct 2026)

## Workflow observed
1. Sign in at `#/login` → lands on `#/dashboard/overview`.
2. Sidebar: **Dashboard**, Menu Item 2, **Report Builder** (Report Module, `#/dashboard/reports`), **Theme Studio**, Account Settings.
3. **Theme Studio** opens as a side panel (`?themeStudio=true`) with a live preview. Theme options live under
   *Theme Settings → Presets* (6 ready-made themes) / *My Themes* (saved custom themes) / *Mode* (light/dark).
4. A **light/dark toggle** also sits in the top bar (`title="Switch to Dark Mode"` / `"Switch to Light Mode"`).
5. Selecting a preset applies immediately — there is no Save/Apply step.

## Supported themes
| Preset | Stored `presetId` | Light `--primary` | Dark `--primary` |
|---|---|---|---|
| Corporate Blue | corporate | #4F6BFF | #7d8fe8 |
| Emerald (default) | emerald | #10B981 | #85e0c2 |
| Indigo Violet | indigo | #A97BFF | #a27de8 |
| Graphite | **slate** | #455a64 | #a3b8c2 |
| Ocean Teal | teal | #00838f | #7ddfe8 |
| Amber | amber | #e65100 | #e8a27d |

Each preset × {light, dark} = 12 combinations. Full token table: `test-data/themes.ts`.

## How the theme is applied (what the tests assert on)
- `<html data-theme-mode="light|dark">` — the mode signal. (There is **no** `data-theme` attribute.)
- Inline CSS custom properties on `<html>`: `--primary`, `--highlight`, `--bg-dashboard`, `--bg-card`, … (~390 vars).
- Components consume the tokens, e.g. Report table header `background-color` = `--highlight` @ 0.14 alpha (light) / 0.22 (dark);
  Dashboard "NEW" button `background-color` = `--primary`; body background `#fff` / `#121212`.
- Theme changes animate via CSS transitions → assertions must retry (`toHaveCSS`, `expect.poll`), never read once.

## How the preference is persisted
- **Client-side only**: localStorage key `omnieye-theme-studio` (zustand persist, `{state:{settings:{presetId, mode, primaryHex, …}}}`).
- **No network request** is made when a theme changes — confirmed via network log. The key does not exist until the first change.
- On load, the store's `merge` sanitises bad values (unknown preset/mode/colour → defaults) **in memory only**.
- Auth session is a sessionStorage flag (`omnieye_auth_session`), so it is **per tab**; theme (localStorage) is **per browser profile**.

## Baseline appearance of the Report Module (fresh profile)
Emerald / light: white background, green-tinted table header (`rgba(46, 230, 166, 0.14)`), green "New User" gradient button,
15 rows of 1,000, pagination footer. Toolbar: View, Search, Sort, Filter, Show/Hide Columns, List/Grid view, More actions.

## Assumptions
- A1. The intended rule is "last selected preset + mode applies everywhere in this browser". No spec says otherwise.
- A2. The theme is a per-browser preference, not per-user — inferred from localStorage-only persistence with no API call (not tested on a second device).
- A3. WCAG 2.1 AA (4.5:1 normal text, 3:1 large text) is the readability bar for TH-07.

## Unclear requirements — questions for the product owner
1. Should the theme follow the **user** across devices (server-side) or stay per browser? Today it's per browser.
2. Is Theme Studio meant for every general user? It also edits branding (app name, logo, login screen) — admin-like scope.
3. After sign-in from a deep link (e.g. a Report URL in a new tab) should the user return to that page? Today they land on Dashboard.
4. Are the six presets required to meet WCAG AA? Three currently do not (DEF-01).

## Observations not automated / needing confirmation
- Filter / View menus did not visibly open from the exploration browser's synthetic clicks — re-check manually before logging.
- Add User dialog shows no Save/Submit button in view (out of theme scope).
- Theme Studio accordion sometimes collapses on its own while interacting — handled with retry in `ThemeStudio.selectPreset`.
