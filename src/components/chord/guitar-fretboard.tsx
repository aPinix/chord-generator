'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { StringState } from '@/types/chord';
import { STRING_NAMES, TOTAL_FRETS, TOTAL_STRINGS } from '@/types/chord';

// Finger colors for visual correlation
const FINGER_COLORS = {
  1: { bg: 'bg-sky-500', ring: 'ring-sky-600', text: 'text-white' },
  2: { bg: 'bg-lime-500', ring: 'ring-lime-600', text: 'text-white' },
  3: { bg: 'bg-amber-500', ring: 'ring-amber-600', text: 'text-white' },
  4: { bg: 'bg-pink-500', ring: 'ring-pink-600', text: 'text-white' },
} as const;

const DEFAULT_DOT = {
  bg: 'bg-orange-500',
  ring: 'ring-orange-600',
  text: 'text-white',
};

interface GuitarFretboardProps {
  strings: StringState[];
  onStringChange: (stringIndex: number, fret: number | 'X' | 0) => void;
  onFingerChange?: (stringIndex: number, finger: number | undefined) => void;
  visibleFrets?: number;
}

export function GuitarFretboard({
  strings,
  onStringChange,
  onFingerChange,
  visibleFrets = TOTAL_FRETS,
}: GuitarFretboardProps) {
  const handleFretClick = useCallback(
    (stringIndex: number, fret: number) => {
      const currentState = strings[stringIndex];
      if (currentState.fret === fret) {
        // Position already active - cycle finger number
        if (onFingerChange) {
          const currentFinger = currentState.finger;
          const nextFinger = currentFinger
            ? currentFinger >= 4
              ? undefined
              : currentFinger + 1
            : 1;
          onFingerChange(stringIndex, nextFinger);
        }
      } else {
        // New position - set fret, no finger assigned initially
        onStringChange(stringIndex, fret);
      }
    },
    [strings, onStringChange, onFingerChange]
  );

  const handleOpenMuteToggle = useCallback(
    (stringIndex: number) => {
      const currentState = strings[stringIndex];
      if (currentState.fret === 'X') {
        onStringChange(stringIndex, 0);
      } else if (currentState.fret === 0) {
        onStringChange(stringIndex, 'X');
      } else {
        // Going from fretted to open - clear finger
        onStringChange(stringIndex, 0);
        if (onFingerChange) {
          onFingerChange(stringIndex, undefined);
        }
      }
    },
    [strings, onStringChange, onFingerChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex overflow-hidden rounded-lg">
        {/* String labels - sticky on scroll */}
        <div className="sticky left-0 z-20 flex flex-col rounded-l-lg bg-white dark:bg-stone-900">
          {/* Spacer to align with fret numbers row */}
          <div className="h-7 rounded-tl-lg border-background border-r-4 bg-background" />
          {/* String labels with nut border */}
          <div className="flex flex-col border-stone-800 border-r-4 dark:border-stone-300">
            {Array.from({ length: TOTAL_STRINGS }).map((_, stringIndex) => {
              const stringState = strings[stringIndex];
              const isOpen = stringState.fret === 0;
              const isMuted = stringState.fret === 'X';

              return (
                <div
                  className="flex h-11 items-center gap-1.5 px-2 sm:h-10 sm:px-2"
                  // biome-ignore lint/suspicious/noArrayIndexKey: String positions are fixed
                  key={`label-string-${stringIndex}`}
                >
                  <button
                    className={cn(
                      'flex size-7 touch-manipulation items-center justify-center rounded-full font-bold text-xs transition-all sm:size-6',
                      isMuted &&
                        'bg-red-500/30 text-red-700 dark:bg-red-500/20 dark:text-red-400',
                      isOpen &&
                        'bg-green-500/30 text-green-700 dark:bg-green-500/20 dark:text-green-400',
                      !isMuted &&
                        !isOpen &&
                        'bg-stone-200 text-stone-600 dark:bg-stone-700 dark:text-stone-300'
                    )}
                    onClick={() => handleOpenMuteToggle(stringIndex)}
                    type="button"
                  >
                    {isMuted ? 'X' : isOpen ? 'O' : ''}
                  </button>
                  <span className="w-4 text-center font-bold font-mono text-sm text-stone-800 dark:text-stone-100">
                    {STRING_NAMES[stringIndex]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrollable fretboard area */}
        <div className="overflow-x-auto bg-linear-to-b from-amber-800 via-amber-900 to-amber-950 [-ms-overflow-style:none] [scrollbar-width:none] dark:from-amber-900 dark:via-amber-950 dark:to-stone-950 [&::-webkit-scrollbar]:hidden">
          <div className="flex">
            {Array.from({ length: visibleFrets }).map((_, fretIndex) => {
              const fretNum = fretIndex + 1;
              const hasMarker = [3, 5, 7, 9, 15, 17, 19, 21].includes(fretNum);
              const hasDoubleMarker = [12].includes(fretNum);

              // Marker positioning variables
              const markerSize = 12; // size-3 = 12px
              const doubleMarkerSpacing = 40; // spacing between double markers

              return (
                <div
                  className="relative flex flex-col border-stone-400 border-r-2 dark:border-stone-600"
                  key={`fret-col-${fretNum}`}
                >
                  {/* Fret number */}
                  <div className="flex h-7 w-12 items-center justify-center border-transparent border-x bg-background sm:w-14">
                    <span className="font-mono font-semibold text-stone-500 text-xs">
                      {fretNum}
                    </span>
                  </div>

                  {/* Fret marker dot - centered on entire fret column */}
                  {hasMarker && (
                    <div
                      className={`pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-full bg-linear-to-br from-amber-100 via-amber-50 to-amber-200 opacity-60 shadow-inner`}
                      style={{
                        width: `${markerSize}px`,
                        height: `${markerSize}px`,
                        top: `calc(50% + ${markerSize / 2}px)`,
                      }}
                    />
                  )}
                  {/* Double marker for 12th fret */}
                  {hasDoubleMarker && (
                    <>
                      <div
                        className={`pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-full bg-linear-to-br from-amber-100 via-amber-50 to-amber-200 opacity-60 shadow-inner`}
                        style={{
                          width: `${markerSize}px`,
                          height: `${markerSize}px`,
                          top: `calc(50% - ${doubleMarkerSpacing - markerSize / 2}px)`,
                        }}
                      />
                      <div
                        className={`pointer-events-none absolute left-1/2 z-0 -translate-x-1/2 rounded-full bg-linear-to-br from-amber-100 via-amber-50 to-amber-200 opacity-60 shadow-inner`}
                        style={{
                          width: `${markerSize}px`,
                          height: `${markerSize}px`,
                          top: `calc(50% + ${doubleMarkerSpacing + markerSize / 2}px)`,
                        }}
                      />
                    </>
                  )}

                  {/* Strings on this fret */}
                  {Array.from({ length: TOTAL_STRINGS }).map(
                    (_, stringIndex) => {
                      const stringState = strings[stringIndex];
                      const isActive = stringState.fret === fretNum;
                      const stringThickness = getStringThickness(stringIndex);

                      return (
                        <button
                          className={cn(
                            'group relative flex h-11 w-12 touch-manipulation items-center justify-center transition-all sm:h-10 sm:w-14',
                            'hover:bg-white/10'
                            // isActive && 'bg-white/20'
                          )}
                          // biome-ignore lint/suspicious/noArrayIndexKey: String positions are fixed (6 strings never reorder)
                          key={`fret-${fretNum}-string-${stringIndex}`}
                          onClick={() => handleFretClick(stringIndex, fretNum)}
                          type="button"
                        >
                          {/* String line - metallic look */}
                          <div
                            className={cn(
                              'absolute inset-x-0 bg-linear-to-b from-gray-200 via-gray-400 to-gray-300',
                              'dark:from-gray-300 dark:via-gray-400 dark:to-gray-200',
                              'shadow-sm',
                              stringThickness
                            )}
                            style={{
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}
                          />

                          {/* Finger position indicator */}
                          {isActive &&
                            (() => {
                              const finger = stringState.finger as
                                | 1
                                | 2
                                | 3
                                | 4
                                | undefined;
                              const colors = finger
                                ? FINGER_COLORS[finger]
                                : DEFAULT_DOT;
                              return (
                                <span
                                  className={cn(
                                    'absolute z-10 flex size-8 select-none items-center justify-center rounded-full font-bold text-sm shadow-lg ring-2 transition-colors sm:size-7',
                                    colors.bg,
                                    colors.ring,
                                    colors.text
                                  )}
                                >
                                  {finger || '•'}
                                </span>
                              );
                            })()}

                          {/* Hover indicator */}
                          {!isActive && (
                            <div className="absolute z-10 size-7 rounded-full bg-orange-400/0 transition-all group-hover:bg-orange-400/40 sm:size-6" />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function getStringThickness(stringIndex: number): string {
  const thicknesses = ['h-0.5', 'h-0.5', 'h-[3px]', 'h-[3px]', 'h-1', 'h-1'];
  return thicknesses[stringIndex];
}
