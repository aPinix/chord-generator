'use client';

import { useMounted } from '@/hooks/use-mounted';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { THEME_NAMES, type ThemeValueT } from '@/types/theme';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';

function ThemeSelectItem({
  themeName,
  themeValue,
}: {
  themeName: string;
  themeValue: ThemeValueT;
}) {
  return (
    <div className="flex items-center gap-2" data-theme-name={themeValue}>
      <div className={cn(`h-5 w-5 rounded-full bg-primary`)} />
      <span>{themeName}</span>
    </div>
  );
}

export function ThemeNameSelector() {
  const mounted = useMounted();
  const { themeName, themeValue, setThemeValue } = useTheme();

  if (!mounted) {
    return null;
  }

  return (
    <Select
      onValueChange={(value) => {
        if (value) {
          setThemeValue(value as ThemeValueT);
        }
      }}
      value={themeValue}
    >
      <SelectTrigger className="w-[180px]">
        <ThemeSelectItem themeName={themeName} themeValue={themeValue} />
      </SelectTrigger>
      <SelectContent>
        {THEME_NAMES.map((theme) => (
          <SelectItem key={theme.value} value={theme.value}>
            <ThemeSelectItem themeName={theme.name} themeValue={theme.value} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
