'use client';

import { useMemo } from 'react';
import {
  chordToStrings,
  formatChordName,
  getPopularChords,
} from '@/lib/chord-data';
import { cn } from '@/lib/utils';
import type { StringState } from '@/types/chord';
import { ChordDiagram } from './chord-diagram';

// The part of the 140 × 160 diagram that has ink in it: X and O marks down
// to the string names
const TILE_CROP = '20 8 100 122';

interface PopularChordsProps {
  /** Fret pattern on the fretboard, as "X 0 2 2 1 0" (low string first) */
  currentPattern: string;
  onSelect: (strings: StringState[], name: string) => void;
  className?: string;
}

/** The chords most songs use, one tap away. */
export function PopularChords({
  currentPattern,
  onSelect,
  className,
}: PopularChordsProps) {
  const chords = useMemo(() => getPopularChords(), []);

  return (
    <section aria-label="Popular chords" className={className}>
      {/*
        The row spans the whole screen so it scrolls to the edges, while the
        padding lines the first chord up with the page content. `100%` here
        is the width of the page column, so the gutter is half the leftover.
      */}
      <ul className="fb-scroll mx-[calc((100%-100vw)/2)] flex gap-2.5 overflow-x-auto px-[calc((100vw-100%)/2)] py-1.5">
        {chords.map((chord) => {
          const name = formatChordName(chord.chordName);
          const isActive = chord.strings === currentPattern;
          return (
            <li className="shrink-0" key={chord.chordName}>
              <button
                aria-label={`${name}, frets ${chord.strings}`}
                aria-pressed={isActive}
                className={cn(
                  // Outlined like the header buttons; the same space all round
                  'flex w-[4.75rem] cursor-pointer flex-col items-center gap-2 rounded-2xl p-2.5 pb-[0.6875rem] text-[#545d6a] ring-1 transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground dark:text-stage-foreground/80',
                  isActive
                    ? 'bg-stage-raised/60 ring-2 ring-stage-foreground'
                    : 'ring-stage-edge'
                )}
                onClick={() => onSelect(chordToStrings(chord), name)}
                type="button"
              >
                {/* Cropped to the drawing, so no hidden margin inside */}
                <ChordDiagram
                  bare
                  color="currentColor"
                  showControls={false}
                  showFingers={false}
                  size="xs"
                  static
                  strings={chordToStrings(chord)}
                  viewBox={TILE_CROP}
                />
                <span className="text-base leading-none font-bold tracking-tight [text-box:trim-both_cap_alphabetic]">
                  {name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
