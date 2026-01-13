'use client';

import { Redo2, RotateCcw, Undo2 } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useHistory } from '@/hooks/use-history';
import { detectChordName } from '@/lib/chord-data';
import type { StringState } from '@/types/chord';
import { TOTAL_STRINGS } from '@/types/chord';
import { CardBento } from './card-bento';
import { ChordDiagram } from './chord-diagram';
import { ChordSearch } from './chord-search';
import {
  FretboardLegend,
  FretboardLegendFingerItem,
  FretboardLegendFingerItemColorE,
  FretboardLegendKbdItem,
  FretboardLegendRow,
} from './fretboard-legend';
import { GuitarFretboard } from './guitar-fretboard';
import { TooltipButton } from './tooltip-button';

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
      <CardBento
        classNameContent="pb-0"
        description="Search for chords by name or partial name. You can also browse all chords."
        step="1"
        title="Search Chords"
      >
        <ChordSearch onChordSelect={handleChordSelect} />
      </CardBento>

      {/* Main Designer */}
      <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
        {/* Fretboard */}
        <CardBento
          classNameContent="gap-4"
          classNameTitle="flex items-center justify-between"
          description="Click on the fretboard to place finger positions. Click the O/X buttons to toggle open or muted strings."
          step="2"
          title="Interactive Fretboard"
          titleSuffix={
            <div className="flex items-center gap-1.5">
              {/* undo */}
              <TooltipButton
                disabled={!canUndo}
                onClick={canUndo ? undo : undefined}
                tooltipText="Undo (Ctrl+Z)"
              >
                <Undo2 className="size-5" />
              </TooltipButton>

              {/* redo */}
              <TooltipButton
                disabled={!canRedo}
                onClick={canRedo ? redo : undefined}
                tooltipText="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="size-5" />
              </TooltipButton>

              {/* reset */}
              <TooltipButton
                disabled={!canUndo && !canRedo}
                onClick={handleReset}
                tooltipText="Reset"
              >
                <RotateCcw className="size-5" />
              </TooltipButton>
            </div>
          }
        >
          <GuitarFretboard
            onFingerChange={handleFingerChange}
            onStringChange={handleStringChange}
            strings={strings}
            visibleFrets={21}
          />

          {/* Legend & Controls Info */}
          <FretboardLegend>
            <FretboardLegendRow title="Fingers">
              <FretboardLegendFingerItem
                finger={FretboardLegendFingerItemColorE.None}
              />
              <FretboardLegendFingerItem
                finger={FretboardLegendFingerItemColorE.Index}
              />
              <FretboardLegendFingerItem
                finger={FretboardLegendFingerItemColorE.Middle}
              />
              <FretboardLegendFingerItem
                finger={FretboardLegendFingerItemColorE.Ring}
              />
              <FretboardLegendFingerItem
                finger={FretboardLegendFingerItemColorE.Pinky}
              />
            </FretboardLegendRow>

            <FretboardLegendRow title="Mouse">
              <FretboardLegendKbdItem label="+1">Click</FretboardLegendKbdItem>
              <FretboardLegendKbdItem label="-1">
                Right-Click
              </FretboardLegendKbdItem>
            </FretboardLegendRow>

            <FretboardLegendRow title="Keyboard">
              <FretboardLegendKbdItem label="Undo">⌘Z</FretboardLegendKbdItem>
              <FretboardLegendKbdItem label="Redo">⌘⇧Z</FretboardLegendKbdItem>
            </FretboardLegendRow>
          </FretboardLegend>
        </CardBento>

        {/* Output Diagram */}
        <CardBento
          className="lg:w-72"
          classNameContent="items-center gap-4"
          step="3"
          title="Chord Diagram"
        >
          <div className="w-full space-y-3">
            <Label className="text-muted-foreground text-xs">Chord Name</Label>
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
        </CardBento>
      </div>
    </div>
  );
}
