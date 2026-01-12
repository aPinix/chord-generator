'use client';

import { Redo2, RotateCcw, Undo2 } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useHistory } from '@/hooks/use-history';
import { detectChordName } from '@/lib/chord-data';
import type { StringState } from '@/types/chord';
import { TOTAL_STRINGS } from '@/types/chord';
import { ChordDiagram } from './chord-diagram';
import { ChordSearch } from './chord-search';
import { GuitarFretboard } from './guitar-fretboard';

const initialStrings: StringState[] = Array.from(
  { length: TOTAL_STRINGS },
  () => ({
    fret: 0,
    finger: undefined,
  })
);

interface ChordState {
  strings: StringState[];
  detectedName: string | null;
  customName: string;
  useCustom: boolean;
}

const initialChordState: ChordState = {
  strings: initialStrings,
  detectedName: null,
  customName: '',
  useCustom: false,
};

export function ChordDesigner() {
  const {
    state: chordState,
    set: setChordState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  } = useHistory<ChordState>(initialChordState);

  const { strings, detectedName, customName, useCustom } = chordState;

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Detect chord name when strings change (update without creating history entry)
  useEffect(() => {
    const detected = detectChordName(strings);
    if (detected !== detectedName && !useCustom) {
      // Only update detected name, don't create history entry for auto-detection
    }
  }, [strings, detectedName, useCustom]);

  // The actual name to display: custom if selected, otherwise detected
  const chordName = useCustom ? customName : detectedName || customName;

  const handleStringChange = useCallback(
    (stringIndex: number, fret: number | 'X' | 0) => {
      const newStrings = [...strings];
      newStrings[stringIndex] = { ...newStrings[stringIndex], fret };
      const detected = detectChordName(newStrings);
      setChordState({
        ...chordState,
        strings: newStrings,
        detectedName: detected,
      });
    },
    [strings, chordState, setChordState]
  );

  const handleFingerChange = useCallback(
    (stringIndex: number, finger: number | undefined) => {
      const newStrings = [...strings];
      newStrings[stringIndex] = { ...newStrings[stringIndex], finger };
      setChordState({
        ...chordState,
        strings: newStrings,
      });
    },
    [strings, chordState, setChordState]
  );

  const handleChordSelect = useCallback(
    (newStrings: StringState[], name: string) => {
      setChordState({
        strings: newStrings,
        detectedName: name,
        customName: '',
        useCustom: false,
      });
    },
    [setChordState]
  );

  const handleReset = useCallback(() => {
    reset(initialChordState);
  }, [reset]);

  const handleCustomNameChange = useCallback(
    (value: string) => {
      setChordState({
        ...chordState,
        customName: value,
        useCustom: true,
      });
    },
    [chordState, setChordState]
  );

  const handleUseCustomToggle = useCallback(
    (value: boolean) => {
      setChordState({
        ...chordState,
        useCustom: value,
      });
    },
    [chordState, setChordState]
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Search Section */}
      <Card className="rounded-3xl border-0 bg-muted/50 shadow-none ring-0 dark:bg-zinc-900/80 dark:ring-1 dark:ring-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
              1
            </span>
            Search Chords
          </CardTitle>
          <CardDescription>
            Search for chords by name or partial name. You can also browse all
            chords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChordSearch onChordSelect={handleChordSelect} />
        </CardContent>
      </Card>

      {/* Main Designer */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
        {/* Fretboard */}
        <Card className="rounded-3xl border-0 bg-muted/50 shadow-none ring-0 dark:bg-zinc-900/80 dark:ring-1 dark:ring-white/10">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                  2
                </span>
                Interactive Fretboard
              </div>
              <div className="flex items-center gap-1.5">
                <Tooltip>
                  <TooltipTrigger
                    aria-disabled={!canUndo}
                    className={`inline-flex size-9 items-center justify-center rounded-lg border transition-all ${
                      canUndo
                        ? 'cursor-pointer border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-95'
                        : 'pointer-events-none cursor-not-allowed border-transparent bg-transparent text-muted-foreground/40'
                    }`}
                    onClick={canUndo ? undo : undefined}
                  >
                    <Undo2 className="size-5" />
                    <span className="sr-only">Undo (Ctrl+Z)</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Undo (Ctrl+Z)</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    aria-disabled={!canRedo}
                    className={`inline-flex size-9 items-center justify-center rounded-lg border transition-all ${
                      canRedo
                        ? 'cursor-pointer border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-95'
                        : 'pointer-events-none cursor-not-allowed border-transparent bg-transparent text-muted-foreground/40'
                    }`}
                    onClick={canRedo ? redo : undefined}
                  >
                    <Redo2 className="size-5" />
                    <span className="sr-only">Redo (Ctrl+Shift+Z)</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    Redo (Ctrl+Shift+Z)
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger
                    className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
                    onClick={handleReset}
                  >
                    <RotateCcw className="size-5" />
                    <span className="sr-only">Reset</span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Reset</TooltipContent>
                </Tooltip>
              </div>
            </CardTitle>
            <CardDescription>
              Click on the fretboard to place finger positions. Click the O/X
              buttons to toggle open or muted strings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GuitarFretboard
              onFingerChange={handleFingerChange}
              onStringChange={handleStringChange}
              strings={strings}
              visibleFrets={21}
            />

            {/* Legend & Controls Info */}
            <div className="flex flex-col gap-4 rounded-2xl bg-background/60 p-4 dark:bg-zinc-800/40">
              {/* Finger Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Fingers:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-orange-500 font-bold text-[10px] text-white shadow-sm">
                      •
                    </div>
                    <span className="text-muted-foreground text-xs">None</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-sky-500 font-bold text-[10px] text-white shadow-sm">
                      1
                    </div>
                    <span className="text-muted-foreground text-xs">Index</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-lime-500 font-bold text-[10px] text-white shadow-sm">
                      2
                    </div>
                    <span className="text-muted-foreground text-xs">
                      Middle
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-amber-500 font-bold text-[10px] text-white shadow-sm">
                      3
                    </div>
                    <span className="text-muted-foreground text-xs">Ring</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex size-5 items-center justify-center rounded-full bg-pink-500 font-bold text-[10px] text-white shadow-sm">
                      4
                    </div>
                    <span className="text-muted-foreground text-xs">Pinky</span>
                  </div>
                </div>
              </div>

              {/* Shortcuts */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-muted border-t pt-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    Mouse:
                  </span>
                  <span className="text-muted-foreground">
                    <kbd className="rounded-full bg-muted px-2 py-1 font-mono font-semibold text-xs">
                      Click
                    </kbd>{' '}
                    +1
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-muted-foreground">
                    <kbd className="rounded-full bg-muted px-2 py-1 font-mono font-semibold text-xs">
                      Right-click
                    </kbd>{' '}
                    −1
                  </span>
                </div>
              </div>

              {/* History Shortcuts */}
              <div className="flex flex-wrap gap-x-8 gap-y-3 border-muted border-t pt-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                    History:
                  </span>
                  <span className="text-muted-foreground">
                    <kbd className="rounded-full bg-muted px-2 py-1 font-mono font-semibold text-xs">
                      ⌘Z
                    </kbd>{' '}
                    Undo
                  </span>
                  <span className="text-muted-foreground/50">·</span>
                  <span className="text-muted-foreground">
                    <kbd className="rounded-full bg-muted px-2 py-1 font-mono font-semibold text-xs">
                      ⌘⇧Z
                    </kbd>{' '}
                    Redo
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Diagram */}
        <Card className="rounded-3xl border-0 bg-muted/50 shadow-none ring-0 lg:w-72 dark:bg-zinc-900/80 dark:ring-1 dark:ring-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                3
              </span>
              Chord Diagram
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="w-full space-y-3">
              <Label className="text-muted-foreground text-xs">
                Chord Name
              </Label>
              <div className="flex overflow-hidden rounded-full bg-muted">
                {/* Detected chord button */}
                {detectedName && (
                  <button
                    className={`cursor-pointer px-4 py-2.5 font-medium text-sm transition-colors ${
                      !useCustom
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted-foreground/10'
                    }`}
                    onClick={() => handleUseCustomToggle(false)}
                    title="Use detected chord name"
                    type="button"
                  >
                    {detectedName}
                  </button>
                )}
                {/* Custom name input */}
                <div
                  className={`flex flex-1 items-center transition-colors ${
                    useCustom ? 'bg-primary/10' : ''
                  }`}
                >
                  <Input
                    className="h-auto flex-1 border-0 bg-transparent py-2.5 shadow-none focus-visible:ring-0"
                    onChange={(e) => handleCustomNameChange(e.target.value)}
                    onFocus={() => handleUseCustomToggle(true)}
                    placeholder={
                      detectedName ? 'Custom name...' : 'e.g., Am, G7, Fmaj7'
                    }
                    value={customName}
                  />
                </div>
              </div>
            </div>

            <ChordDiagram chordName={chordName} strings={strings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
