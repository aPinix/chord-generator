'use client';

import { ThemeProvider } from 'next-themes';
import {
  composeProviders,
  createProvider,
} from '@/providers/compose.providers';
import { ThemeModeE } from '@/types/theme';
import {
  THEME_MODE_DEFAULT,
  THEME_MODE_STORAGE_KEY,
  THEME_MODES,
} from './variables-const.config';

const ProvidersWrapper = composeProviders([
  // ..
  createProvider(ThemeProvider, {
    attribute: 'class',
    defaultTheme: THEME_MODE_DEFAULT,
    enableSystem: THEME_MODES.includes(ThemeModeE.System),
    // disableTransitionOnChange: true,
    enableColorScheme: true,
    storageKey: THEME_MODE_STORAGE_KEY,
  }),
  // createProvider(SomeProvider, { ... }),
]);

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return <ProvidersWrapper>{children}</ProvidersWrapper>;
}
