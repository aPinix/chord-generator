'use client';

import { useTheme } from 'next-themes';
import { useEffect } from 'react';

/**
 * Tints the mobile browser chrome to match the stage, following the
 * light/dark toggle rather than only the system setting.
 */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme();

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-read the CSS variable when the theme changes
  useEffect(() => {
    const stage = getComputedStyle(document.documentElement)
      .getPropertyValue('--stage')
      .trim();
    if (!stage) return;

    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    );
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'theme-color';
      document.head.appendChild(meta);
    }
    meta.content = stage;
  }, [resolvedTheme]);

  return null;
}
