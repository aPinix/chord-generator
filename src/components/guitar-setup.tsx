'use client';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GuitarIcon,
  RotateCcwIcon,
  Volume2Icon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GUITAR_TYPES,
  type GuitarType,
  setGuitarType,
} from '@/lib/chord-audio';
import {
  findTuningPreset,
  isStandardTuning,
  noteName,
  STANDARD_TUNING,
  TUNING_PRESETS,
  TUNING_RANGE,
  type TuningNotes,
} from '@/lib/tunings';
import { cn } from '@/lib/utils';
import { AndTooltip } from './and/and-tooltip';

const GUITAR_STORAGE_KEY = 'chord-diagram-guitar';

// Both dropdowns share the toolbar's pill look
const pill =
  'flex h-10 min-w-0 cursor-pointer items-center gap-2 rounded-full pr-3 pl-3.5 text-sm font-medium text-stage-foreground ring-1 ring-stage-edge transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground pointer-coarse:h-11';

// The open panel and its rows, shared by both dropdowns
const menuPanel =
  'max-h-[min(38rem,calc(100dvh-2rem))] max-w-[calc(100vw-2rem)] gap-0 overflow-y-auto rounded-3xl p-2';
const menuItem =
  'flex h-9 w-full cursor-pointer items-center gap-2 rounded-xl px-3 text-left text-sm outline-none hover:bg-muted focus-visible:bg-muted data-highlighted:bg-muted data-highlighted:text-foreground data-selected:font-semibold pointer-coarse:h-11';

const stepper =
  'flex size-9 cursor-pointer items-center justify-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent pointer-coarse:size-11';

/** Which guitar the chords are played on. */
export function SoundSelect({ className }: { className?: string }) {
  const [guitarType, setGuitarTypeState] = useState<GuitarType>(
    'acoustic_guitar_nylon'
  );

  // Restore the saved sound after hydration to avoid an SSR mismatch
  useEffect(() => {
    const saved = localStorage.getItem(GUITAR_STORAGE_KEY);
    if (saved && saved in GUITAR_TYPES) {
      setGuitarTypeState(saved as GuitarType);
      setGuitarType(saved as GuitarType);
    }
  }, []);

  const handleChange = (type: GuitarType) => {
    setGuitarTypeState(type);
    setGuitarType(type);
    localStorage.setItem(GUITAR_STORAGE_KEY, type);
  };

  return (
    <Select
      onValueChange={(value) => handleChange(value as GuitarType)}
      value={guitarType}
    >
      <SelectTrigger
        aria-label="Guitar sound"
        className={cn(
          pill,
          'h-10! w-auto border-0 bg-transparent shadow-none dark:bg-transparent dark:hover:bg-stage-raised/60 pointer-coarse:h-11! [&_svg]:text-stage-muted!',
          className
        )}
      >
        <Volume2Icon className="size-4 shrink-0 text-stage-foreground!" />
        <SelectValue>{GUITAR_TYPES[guitarType]}</SelectValue>
      </SelectTrigger>
      {/* Opens below like the tuning menu, with the same rounded panel */}
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        className={menuPanel}
        sideOffset={8}
      >
        {(Object.entries(GUITAR_TYPES) as [GuitarType, string][]).map(
          ([key, label]) => (
            <SelectItem
              className={cn(menuItem, 'pr-9 *:last:right-3')}
              key={key}
              value={key}
            >
              {label}
            </SelectItem>
          )
        )}
      </SelectContent>
    </Select>
  );
}

interface TuningMenuProps {
  /** Open-string notes, low string first */
  tuning: TuningNotes;
  onTuningChange: (tuning: TuningNotes) => void;
  className?: string;
}

/** Preset tunings, a stepper for each string, and a way back to standard. */
export function TuningMenu({
  tuning,
  onTuningChange,
  className,
}: TuningMenuProps) {
  const preset = findTuningPreset(tuning);
  const flats = preset?.flats ?? false;
  const isStandard = isStandardTuning(tuning);
  // Phones get the short form: "Standard", "Drop D", "Custom"
  const shortLabel = preset ? preset.name : 'Custom';
  const label = preset && !isStandard ? preset.name : `${shortLabel} tuning`;

  const retuneString = (index: number, semitones: number) => {
    const next = [...tuning] as [
      number,
      number,
      number,
      number,
      number,
      number,
    ];
    next[index] += semitones;
    onTuningChange(next);
  };

  return (
    <div className={cn('relative flex min-w-0 items-center', className)}>
      <Popover>
        <PopoverTrigger
          render={
            <button
              aria-label={`Tuning: ${label}`}
              className={cn(pill, 'flex-1')}
              type="button"
            />
          }
        >
          <GuitarIcon className="size-4 shrink-0" />
          <span className="flex-1 truncate text-left">
            <span className="sm:hidden">{shortLabel}</span>
            <span className="max-sm:hidden">{label}</span>
          </span>
          {/* A fixed slot the reset button sits on, so nothing moves */}
          <span className="-mr-1.5 flex size-7 shrink-0 items-center justify-center">
            <ChevronDownIcon
              className={cn(
                'size-4 text-stage-muted',
                !isStandard && 'invisible'
              )}
            />
          </span>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          className={cn(menuPanel, 'w-80')}
          sideOffset={8}
        >
          <ul aria-label="Preset tunings">
            {TUNING_PRESETS.map((option) => {
              const isActive = option.id === preset?.id;
              return (
                <li key={option.id}>
                  <button
                    aria-pressed={isActive}
                    className={cn(menuItem, isActive && 'font-semibold')}
                    onClick={() => onTuningChange(option.notes)}
                    type="button"
                  >
                    <span className="flex-1">{option.name}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {option.notes
                        .map((note) => noteName(note, option.flats))
                        .join(' ')}
                    </span>
                    <CheckIcon
                      className={cn('size-4', !isActive && 'invisible')}
                      strokeWidth={2.5}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-2 border-t border-border px-3 pt-3 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Tune each string
              </span>
              {!isStandard && (
                <button
                  className="cursor-pointer rounded-full text-xs font-medium text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring dark:text-pick"
                  onClick={() => onTuningChange(STANDARD_TUNING)}
                  type="button"
                >
                  Back to standard
                </button>
              )}
            </div>

            {/* One stepper per string, low string on the left */}
            <ul className="mt-1 grid grid-cols-6 gap-1">
              {tuning.map((note, index) => {
                const offset = note - STANDARD_TUNING[index];
                const stringNumber = 6 - index;
                const name = noteName(note, flats);
                return (
                  <li className="flex flex-col items-center" key={stringNumber}>
                    <button
                      aria-label={`Tune string ${stringNumber} up, now ${name}`}
                      className={stepper}
                      disabled={offset >= TUNING_RANGE.up}
                      onClick={() => retuneString(index, 1)}
                      type="button"
                    >
                      <ChevronUpIcon className="size-4" />
                    </button>
                    <span
                      className={cn(
                        'font-display text-lg font-bold',
                        offset !== 0 && 'text-primary dark:text-pick'
                      )}
                    >
                      {name}
                    </span>
                    <button
                      aria-label={`Tune string ${stringNumber} down, now ${name}`}
                      className={stepper}
                      disabled={offset <= TUNING_RANGE.down}
                      onClick={() => retuneString(index, -1)}
                      type="button"
                    >
                      <ChevronDownIcon className="size-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </PopoverContent>
      </Popover>

      {!isStandard && (
        <AndTooltip
          asChild
          trigger={
            <button
              aria-label="Back to standard tuning"
              className="absolute top-1/2 right-1.5 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-stage-raised/70 text-stage-foreground outline-none hover:bg-stage-raised focus-visible:ring-2 focus-visible:ring-stage-foreground active:scale-97"
              onClick={() => onTuningChange(STANDARD_TUNING)}
              type="button"
            >
              <RotateCcwIcon className="size-4" />
            </button>
          }
        >
          Back to standard tuning
        </AndTooltip>
      )}
    </div>
  );
}
