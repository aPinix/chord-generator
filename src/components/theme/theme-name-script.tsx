'use client';

import { THEME_NAME_STORAGE_KEY } from '@/config/variables-const.config';

export function ThemeNameScript() {
  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{
        __html: `(function() {
          try {
            var storageKey = '${THEME_NAME_STORAGE_KEY}';
            var stored = localStorage.getItem(storageKey);
            if (stored) {
              document.documentElement.setAttribute('data-theme-name', stored);
            }
          } catch (e) {}
        })();`,
      }}
      id="theme-name-script"
    />
  );
}
