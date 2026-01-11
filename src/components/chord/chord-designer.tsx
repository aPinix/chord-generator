'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export function ChordDesigner() {
  const [strings, setStrings] = useState<StringState[]>(initialStrings);
  const [detectedName, setDetectedName] = useState<string | null>(null);
  const [customName, setCustomName] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Detect chord name when strings change
  useEffect(() => {
    const detected = detectChordName(strings);
    setDetectedName(detected);
  }, [strings]);

  // The actual name to display: custom if selected, otherwise detected
  const chordName = useCustom ? customName : detectedName || customName;

  const handleStringChange = useCallback(
    (stringIndex: number, fret: number | 'X' | 0) => {
      setStrings((prev) => {
        const newStrings = [...prev];
        newStrings[stringIndex] = { ...newStrings[stringIndex], fret };
        return newStrings;
      });
    },
    []
  );

  const handleFingerChange = useCallback(
    (stringIndex: number, finger: number | undefined) => {
      setStrings((prev) => {
        const newStrings = [...prev];
        newStrings[stringIndex] = { ...newStrings[stringIndex], finger };
        return newStrings;
      });
    },
    []
  );

  const handleChordSelect = useCallback(
    (newStrings: StringState[], name: string) => {
      setStrings(newStrings);
      setDetectedName(name);
      setCustomName('');
      setUseCustom(false);
    },
    []
  );

  const handleReset = useCallback(() => {
    setStrings(initialStrings);
    setDetectedName(null);
    setCustomName('');
    setUseCustom(false);
  }, []);

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
            <CardTitle className="flex items-center gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground text-sm">
                2
              </span>
              Interactive Fretboard
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

            {/* Finger Legend */}
            <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-background/80 p-3 dark:bg-zinc-800/50">
              <span className="text-muted-foreground text-sm">Fingers:</span>
              <div className="flex items-center gap-1">
                <div className="flex size-6 items-center justify-center rounded-full bg-orange-500 font-bold text-white text-xs">
                  •
                </div>
                <span className="font-semibold text-muted-foreground text-xs">
                  No finger
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex size-6 items-center justify-center rounded-full bg-sky-500 font-bold text-white text-xs">
                  1
                </div>
                <span className="font-semibold text-muted-foreground text-xs">
                  Index
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex size-6 items-center justify-center rounded-full bg-lime-500 font-bold text-white text-xs">
                  2
                </div>
                <span className="font-semibold text-muted-foreground text-xs">
                  Middle
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex size-6 items-center justify-center rounded-full bg-amber-500 font-bold text-white text-xs">
                  3
                </div>
                <span className="font-semibold text-muted-foreground text-xs">
                  Ring
                </span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex size-6 items-center justify-center rounded-full bg-pink-500 font-bold text-white text-xs">
                  4
                </div>
                <span className="font-semibold text-muted-foreground text-xs">
                  Pinky
                </span>
              </div>
              <div className="ml-auto flex flex-col gap-0.5 text-right text-muted-foreground text-xs">
                <span>
                  <span className="font-semibold">Click</span> to increase{' '}
                  <span className="tracking-tight">(• → 1 → 2 → 3 → 4)</span>
                </span>
                <span>
                  <span className="font-semibold">Right-click</span> or{' '}
                  <span className="font-semibold">Shift+click</span> to decrease
                </span>
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
              <div className="flex gap-2">
                {/* Detected chord button */}
                {detectedName && (
                  <button
                    className={`cursor-pointer rounded-lg border px-3 py-2 font-medium text-sm transition-colors ${
                      !useCustom
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                    onClick={() => setUseCustom(false)}
                    title="Use detected chord name"
                    type="button"
                  >
                    {detectedName}
                  </button>
                )}
                {/* Custom name input with select button */}
                <div
                  className={`flex flex-1 items-center gap-1 rounded-lg border px-1 transition-colors ${
                    useCustom
                      ? 'bg-background ring-1 ring-primary'
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <button
                    className={`inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-xs transition-colors ${
                      useCustom
                        ? 'bg-primary/20 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => setUseCustom(true)}
                    title="Use custom name"
                    type="button"
                  >
                    {useCustom ? '✓' : '○'}
                  </button>
                  <Input
                    className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
                    onChange={(e) => setCustomName(e.target.value)}
                    onFocus={() => setUseCustom(true)}
                    placeholder={
                      detectedName ? 'Custom name...' : 'e.g., Am, G7, Fmaj7'
                    }
                    value={customName}
                  />
                </div>
              </div>
            </div>

            <ChordDiagram
              chordName={chordName}
              onReset={handleReset}
              strings={strings}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
