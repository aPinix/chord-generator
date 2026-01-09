import { useTheme as useNextTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { THEME_NAME_STORAGE_KEY } from '@/config/variables-const.config';
import { THEME_NAMES, ThemeModeE, type ThemeValueT } from '@/types/theme';

export const useTheme = () => {
  const { theme, setTheme, resolvedTheme } = useNextTheme();

  // Get name from localStorage or default to default
  const [themeValue, setThemeValue] = useState<ThemeValueT>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_NAME_STORAGE_KEY);
      if (stored && THEME_NAMES.some((t) => t.value === stored)) {
        return stored as ThemeValueT;
      }
    }
    return THEME_NAMES[0].value;
  });

  const themeName: string =
    THEME_NAMES.find((t) => t.value === themeValue)?.name ??
    THEME_NAMES[0].name;

  useEffect(() => {
    const root = window.document.documentElement;

    // Set data-theme-name attribute
    root.setAttribute('data-theme-name', themeValue);

    // Store name in localStorage
    localStorage.setItem(THEME_NAME_STORAGE_KEY, themeValue);
  }, [themeValue]);

  const toggleTheme = () => {
    if (theme === ThemeModeE.Light) {
      setTheme(ThemeModeE.Dark);
    } else if (theme === ThemeModeE.Dark) {
      setTheme(ThemeModeE.System);
    } else {
      setTheme(ThemeModeE.Light);
    }
  };

  const changeThemeValue = (newValue: ThemeValueT) => {
    setThemeValue(newValue);
  };

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    themeName,
    themeValue,
    setThemeValue: changeThemeValue,
  };
};

// Export useThemeContext for backward compatibility
export const useThemeContext = () => {
  const { themeValue, setThemeValue } = useTheme();
  return {
    themeColor: themeValue,
    setThemeColor: setThemeValue,
  };
};
