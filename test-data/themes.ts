/**
 * The themes our tests use, with the values we OBSERVED in the app (22 Oct 2026).
 *
 *  label       = the name you see in Theme Studio
 *  id          = the name the app saves in the browser (note: Graphite is saved as "slate")
 *  primary     = the main colour of the theme (CSS variable --primary)
 *  tableHeader = background colour of the Report table header
 *
 * If a theme colour changes in the app, update it here - this is the only place.
 */
export type Mode = 'light' | 'dark';

export interface Theme {
  label: string;
  id: string;
  primary: Record<Mode, string>;
  tableHeader: Record<Mode, string>;
}

export const themes = {
  corporateBlue: {
    label: 'Corporate Blue',
    id: 'corporate',
    primary: { light: '#4F6BFF', dark: '#7d8fe8' },
    tableHeader: { light: 'rgba(109, 134, 255, 0.14)', dark: 'rgba(109, 134, 255, 0.22)' },
  },
  emerald: {
    label: 'Emerald',
    id: 'emerald',
    primary: { light: '#10B981', dark: '#85e0c2' },
    tableHeader: { light: 'rgba(46, 230, 166, 0.14)', dark: 'rgba(46, 230, 166, 0.22)' },
  },
  oceanTeal: {
    label: 'Ocean Teal',
    id: 'teal',
    primary: { light: '#00838f', dark: '#7ddfe8' },
    tableHeader: { light: 'rgba(38, 198, 218, 0.14)', dark: 'rgba(38, 198, 218, 0.22)' },
  },
  amber: {
    label: 'Amber',
    id: 'amber',
    primary: { light: '#e65100', dark: '#e8a27d' },
    tableHeader: { light: 'rgba(255, 138, 61, 0.14)', dark: 'rgba(255, 138, 61, 0.22)' },
  },
  graphite: {
    label: 'Graphite',
    id: 'slate',
    primary: { light: '#455a64', dark: '#a3b8c2' },
    tableHeader: { light: 'rgba(144, 164, 174, 0.14)', dark: 'rgba(144, 164, 174, 0.22)' },
  },
  indigoViolet: {
    label: 'Indigo Violet',
    id: 'indigo',
    primary: { light: '#A97BFF', dark: '#a27de8' },
    tableHeader: { light: 'rgba(169, 123, 255, 0.14)', dark: 'rgba(169, 123, 255, 0.22)' },
  },
} satisfies Record<string, Theme>;

/** A brand-new browser has no saved theme, so the app shows Emerald + light. */
export const defaultTheme = themes.emerald;

/** The browser storage key where the app saves the chosen theme. */
export const THEME_STORAGE_KEY = 'omnieye-theme-studio';
