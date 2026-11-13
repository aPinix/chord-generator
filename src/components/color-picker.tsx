'use client';

import { CheckIcon, PipetteIcon } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/** Stands in for "no colour" wherever a colour is stored */
export const TRANSPARENT = 'transparent';

export interface ColorOption {
  value: string;
  name: string;
}

const HEX_PATTERN = /^#?([0-9a-f]{6}|[0-9a-f]{3})$/i;

/** "#abc" or "ABCDEF" → "#aabbcc", anything else → null */
function normalizeHex(input: string): string | null {
  const match = HEX_PATTERN.exec(input.trim());
  if (!match) return null;
  const digits =
    match[1].length === 3
      ? [...match[1]].map((digit) => digit + digit).join('')
      : match[1];
  return `#${digits.toLowerCase()}`;
}

const sameColor = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

interface SwatchProps {
  color: string;
  className?: string;
}

/** A colour dot. Transparent reads as a white dot with a red slash. */
export function Swatch({ color, className }: SwatchProps) {
  const isTransparent = color === TRANSPARENT;
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block size-7 shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/15%)] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/25%)]',
        className
      )}
      style={{ backgroundColor: isTransparent ? '#ffffff' : color }}
    >
      {isTransparent && (
        <span className="absolute top-1/2 left-1/2 h-[1.5px] w-[140%] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#e11d48]" />
      )}
    </span>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  options: readonly ColorOption[];
  /** Offer "Transparent" as the first option */
  allowTransparent?: boolean;
}

/** A labelled swatch that opens presets, a hex field and the system picker. */
export function ColorPicker({
  label,
  value,
  onChange,
  options,
  allowTransparent = false,
}: ColorPickerProps) {
  const hexId = useId();
  const isTransparent = value === TRANSPARENT;
  const [hexDraft, setHexDraft] = useState(isTransparent ? '' : value);

  // Follow outside changes (a preset, a reset) into the field
  useEffect(() => {
    setHexDraft(value === TRANSPARENT ? '' : value);
  }, [value]);

  const choices: ColorOption[] = allowTransparent
    ? [{ value: TRANSPARENT, name: 'Transparent' }, ...options]
    : [...options];
  const current = choices.find((choice) => sameColor(choice.value, value));
  const valueName = current?.name ?? value.toUpperCase();

  const commitHex = () => {
    const hex = normalizeHex(hexDraft);
    if (hex) {
      onChange(hex);
    } else {
      setHexDraft(isTransparent ? '' : value);
    }
  };

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button
            aria-label={`${label}: ${valueName}`}
            className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 text-sm outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:py-2"
            type="button"
          />
        }
      >
        <Swatch color={value} />
        {label}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-64 gap-3 rounded-3xl p-4"
        sideOffset={8}
      >
        <p className="text-sm font-medium">
          {label}
          <span className="ml-2 font-normal text-muted-foreground">
            {valueName}
          </span>
        </p>

        <ul aria-label={`${label} colours`} className="grid grid-cols-5 gap-2">
          {choices.map((choice) => {
            const isActive = sameColor(choice.value, value);
            return (
              <li key={choice.value}>
                <button
                  aria-label={choice.name}
                  aria-pressed={isActive}
                  className={cn(
                    'relative flex size-9 cursor-pointer items-center justify-center rounded-full ring-offset-2 ring-offset-popover transition-shadow outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:size-10',
                    isActive && 'ring-2 ring-foreground'
                  )}
                  onClick={() => onChange(choice.value)}
                  title={choice.name}
                  type="button"
                >
                  <Swatch className="size-full" color={choice.value} />
                  {isActive && choice.value !== TRANSPARENT && (
                    <CheckIcon
                      className="absolute size-4 text-white mix-blend-difference"
                      strokeWidth={2.5}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor={hexId}>
            {label} hex code
          </label>
          <div className="flex h-9 min-w-0 flex-1 items-center rounded-full bg-muted px-3 transition-shadow focus-within:ring-2 focus-within:ring-ring pointer-coarse:h-11">
            <span aria-hidden="true" className="text-sm text-muted-foreground">
              #
            </span>
            <input
              autoCapitalize="off"
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent pl-1 text-sm uppercase tabular-nums outline-none placeholder:text-muted-foreground placeholder:normal-case pointer-coarse:text-base"
              id={hexId}
              maxLength={7}
              onBlur={commitHex}
              onChange={(e) => setHexDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitHex();
                }
              }}
              placeholder={isTransparent ? 'None' : 'RRGGBB'}
              spellCheck={false}
              value={hexDraft.replace(/^#/, '')}
            />
          </div>

          {/* The system picker, for any colour at all */}
          <label
            className="relative flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-border transition-colors ring-inset hover:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring pointer-coarse:size-11"
            title="Pick any colour"
          >
            <PipetteIcon className="size-4" />
            <span className="sr-only">
              Pick any {label.toLowerCase()} colour
            </span>
            <input
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              onChange={(e) => onChange(e.target.value)}
              type="color"
              value={isTransparent ? '#ffffff' : value}
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  );
}
