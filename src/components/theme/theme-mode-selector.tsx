'use client';

import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from 'next-themes';
import { useCallback } from 'react';
import { THEME_MODES } from '@/config/variables-const.config';
import { useMounted } from '@/hooks/use-mounted';
import { ThemeModeE, type ThemeModeT } from '@/types/theme';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from '../ui/select';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

const ThemeModeSelectorVariantE = {
  ButtonCycle: 'button-cycle',
  ButtonGroup: 'button-group',
  SelectIcon: 'select-icon',
  SelectIconText: 'select-icon-text',
} as const;

const themeIconAnimation = {
  initial: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.25, filter: 'blur(4px)' },
  transition: {
    type: 'spring' as const,
    duration: 0.3,
    bounce: 0,
  },
};
type ThemeModeSelectorVariantT =
  (typeof ThemeModeSelectorVariantE)[keyof typeof ThemeModeSelectorVariantE];

type ThemeModeSelectorPropsT = {
  variant?: ThemeModeSelectorVariantT;
  modes?: ThemeModeT[];
};

export const ThemeModeSelector: React.FC<ThemeModeSelectorPropsT> = ({
  variant = ThemeModeSelectorVariantE.ButtonGroup,
  modes = THEME_MODES,
}) => {
  const mounted = useMounted();
  const { theme, setTheme } = useTheme();

  const cycleTheme = useCallback(() => {
    if (!modes.length) return;

    const currentIndex = modes.indexOf(theme as ThemeModeT);
    const nextIndex = (currentIndex + 1) % modes.length;
    const nextTheme = modes[nextIndex];

    setTheme(nextTheme);
  }, [theme, modes, setTheme]);

  const getThemeIcon = useCallback(
    (mode?: ThemeModeT) => {
      const themeMode = mode || theme;
      switch (themeMode) {
        case ThemeModeE.Light:
          return <SunIcon className="h-4 w-4" />;
        case ThemeModeE.Dark:
          return <MoonIcon className="h-4 w-4" />;
        case ThemeModeE.System:
          return <MonitorIcon className="h-4 w-4" />;
        default:
          return <SunIcon className="h-4 w-4" />;
      }
    },
    [theme]
  );

  const getThemeLabel = useCallback((mode: ThemeModeT) => {
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {variant === ThemeModeSelectorVariantE.ButtonCycle && (
        <Button onClick={cycleTheme} size="icon" variant="outline">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div key={theme} {...themeIconAnimation}>
              {getThemeIcon()}
            </motion.div>
          </AnimatePresence>
        </Button>
      )}

      {variant === ThemeModeSelectorVariantE.ButtonGroup && (
        <ToggleGroup
          onValueChange={(value) => {
            const nextValue = value?.[0];
            if (nextValue) setTheme(nextValue);
          }}
          value={theme ? [theme] : undefined}
          variant="outline"
        >
          {modes.map((mode) => (
            <ToggleGroupItem
              aria-label={`Toggle ${mode}`}
              key={mode}
              value={mode}
            >
              {getThemeIcon(mode)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )}

      {variant === ThemeModeSelectorVariantE.SelectIcon && (
        <Select
          onValueChange={(value) => value && setTheme(value)}
          value={theme}
        >
          <SelectTrigger className="inline-flex w-[36px] justify-center px-0 [&>svg]:hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div key={theme} {...themeIconAnimation}>
                {getThemeIcon()}
              </motion.div>
            </AnimatePresence>
          </SelectTrigger>
          <SelectContent className="min-w-10">
            {modes.map((mode) => (
              <SelectItem key={mode} value={mode}>
                {getThemeIcon(mode)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {variant === ThemeModeSelectorVariantE.SelectIconText && (
        <Select
          onValueChange={(value) => value && setTheme(value)}
          value={theme}
        >
          <SelectTrigger>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div
                key={theme}
                {...themeIconAnimation}
                className="flex items-center gap-2"
              >
                {getThemeIcon()}
              </motion.div>
            </AnimatePresence>
            {getThemeLabel(theme as ThemeModeT)}
          </SelectTrigger>
          <SelectContent className="min-w-10">
            <SelectGroup>
              <SelectLabel>Theme Modes</SelectLabel>
              {modes.map((mode) => (
                <SelectItem
                  className="flex items-center gap-2"
                  key={mode}
                  value={mode}
                >
                  {getThemeIcon(mode)}
                  <span>{getThemeLabel(mode)}</span>
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    </>
  );
};
