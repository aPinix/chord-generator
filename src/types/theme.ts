import { THEMES } from '@/config/themes.config';

export const ThemeModeE = {
  Light: 'light',
  Dark: 'dark',
  System: 'system',
} as const;
export type ThemeModeT = (typeof ThemeModeE)[keyof typeof ThemeModeE];

export type ThemeValueT = (typeof THEMES)[number]['value'];
export const THEME_NAMES: { name: string; value: ThemeValueT }[] = [...THEMES];
