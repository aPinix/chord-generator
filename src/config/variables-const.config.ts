import { stringToLocalStorageKey } from '@/lib/string';
import { ThemeModeE, type ThemeModeT } from '@/types/theme';
import { APP_NAME } from './variables.config';

// --------------------------------------------------
// #DEBUG
// --------------------------------------------------

// if true, the react scan will be enabled (debug rerenders visually)
export const DEBUG_REACT_SCAN: boolean = false;

// if true, the non-implemented features will be visually highlighted
export const DEBUG_NON_IMPLEMENTED_VISUALLY: boolean = false; // TODO: to implement

// --------------------------------------------------
// #THEME
// --------------------------------------------------

// Define available theme modes for the application
// Un/Comment desired modes and adjust order for theme selector appearance
export const THEME_MODES: ThemeModeT[] = [
  ThemeModeE.Light,
  ThemeModeE.Dark,
  ThemeModeE.System,
];

// the default theme mode
export const THEME_MODE_DEFAULT: ThemeModeT = ThemeModeE.Light;

// --------------------------------------------------
// #PLACEHOLDEER
// --------------------------------------------------

// placeholder colors
export const PLACEHOLDER_BACKGROUND_COLOR_LIGHT: string = '#F1F5F9';
export const PLACEHOLDER_FOREGROUND_COLOR_LIGHT: string = '#64748B';
export const PLACEHOLDER_BACKGROUND_COLOR_DARK: string = '#141316';
export const PLACEHOLDER_FOREGROUND_COLOR_DARK: string = '#64748B';

// --------------------------------------------------
// #LOCAL STORAGE
// --------------------------------------------------

// theme --------------------

// the key used to store the theme mode in the browser
export const THEME_MODE_STORAGE_KEY: string = `theme-mode-${stringToLocalStorageKey(APP_NAME)}`;

// the key used to store the theme name in the browser
export const THEME_NAME_STORAGE_KEY: string = `theme-name-${stringToLocalStorageKey(APP_NAME)}`;

// sidebar --------------------

// the key used to store the sidebar state in the browser
export const SIDEBAR_STATE_STORAGE_KEY: string = `sidebar-state-${stringToLocalStorageKey(APP_NAME)}`;

// locale --------------------

// the key used to store the locale in the browser
export const LOCALE_COOKIE_KEY: string = `NEXT_LOCALE_${stringToLocalStorageKey(
  APP_NAME,
  'screaming-snake'
)}`;
