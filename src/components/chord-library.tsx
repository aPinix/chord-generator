'use client';

import { Dialog } from '@base-ui/react/dialog';
import { PlayIcon, SearchIcon, XIcon } from 'lucide-react';
import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import { Kbd } from '@/components/ui/kbd';
import { playChord } from '@/lib/chord-audio';
import {
  chordToStrings,
  formatChordName,
  getChordsByCategory,
  searchChords,
} from '@/lib/chord-data';
import { STANDARD_TUNING } from '@/lib/tunings';
import type { ChordData, StringState } from '@/types/chord';
import { ChordDiagram } from './chord-diagram';

const TILE_SELECTOR = '[data-chord-tile]';

interface ChordLibraryProps {
  onChordSelect: (strings: StringState[], chordName: string) => void;
  showFingers: boolean;
}

/** Library shapes are written for standard tuning, so that is how they sound. */
const playLibraryChord = (chord: ChordData) => {
  playChord(
    chord.strings.split(' ').map((fret) => (fret === 'X' ? 'X' : Number(fret))),
    { strumSpeed: 50, tuning: STANDARD_TUNING }
  );
};

/** The "Browse" button and the dialog listing every chord in the library. */
export const ChordLibrary = ({
  onChordSelect,
  showFingers,
}: ChordLibraryProps) => {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState('');
  // Every result renders a diagram: let typing stay ahead of the grid
  const deferredFilter = useDeferredValue(filter.trim());
  const categories = useMemo(() => getChordsByCategory(), []);
  const searchRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // While filtering, one ranked list of matches replaces the groups
  const results = useMemo(
    () => (deferredFilter ? searchChords(deferredFilter) : null),
    [deferredFilter]
  );
  const visibleCategories = results
    ? results.length > 0
      ? [
          {
            id: 'Results',
            name: results.length === 1 ? '1 chord' : `${results.length} chords`,
            description: '',
            chords: results,
          },
        ]
      : []
    : categories;

  const handleOpenChange = (isOpen: boolean) => {
    // Every visit starts with the whole library
    if (isOpen) setFilter('');
    setOpen(isOpen);
  };

  const focusFirstTile = () => {
    const first = scrollRef.current?.querySelector<HTMLElement>(TILE_SELECTOR);
    first?.focus();
    first?.scrollIntoView({ block: 'nearest' });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusFirstTile();
    } else if (e.key === 'Enter') {
      // Enter takes the best match
      const best = (results ?? [])[0];
      if (best) {
        e.preventDefault();
        selectChord(best);
      }
    } else if (e.key === 'Escape' && filter) {
      // The first Escape clears the filter, the second closes the dialog
      e.preventDefault();
      e.stopPropagation();
      setFilter('');
    }
  };

  // ⌘K (Ctrl+K) opens and closes the library from anywhere
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== 'k') return;
      e.preventDefault();
      setOpen((isOpen) => {
        // Leave another open dialog (Zen mode) alone
        if (!isOpen && document.querySelector('[role="dialog"]')) return isOpen;
        if (!isOpen) setFilter('');
        return !isOpen;
      });
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const selectChord = (chord: ChordData) => {
    onChordSelect(chordToStrings(chord), formatChordName(chord.chordName));
    setOpen(false);
  };

  /** Arrow keys walk the grid in all four directions, across sections. */
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (
      e.key.length === 1 &&
      e.key !== ' ' &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      // Focus moves before the key lands, so the character is typed there
      searchRef.current?.focus();
      return;
    }
    if (!e.key.startsWith('Arrow') && e.key !== 'Home' && e.key !== 'End') {
      return;
    }
    const container = scrollRef.current;
    if (!container) return;

    const tiles = [...container.querySelectorAll<HTMLElement>(TILE_SELECTOR)];
    const current = (e.target as HTMLElement).closest<HTMLElement>(
      TILE_SELECTOR
    );
    const index = current ? tiles.indexOf(current) : -1;
    let target: HTMLElement | undefined;

    if (index === -1) {
      target = tiles[0];
    } else if (e.key === 'ArrowRight') {
      target = tiles[index + 1];
    } else if (e.key === 'ArrowLeft') {
      target = tiles[index - 1];
    } else if (e.key === 'Home') {
      target = tiles[0];
    } else if (e.key === 'End') {
      target = tiles[tiles.length - 1];
    } else if (current) {
      // Up and down: the tile in the next row that sits closest underneath
      const from = current.getBoundingClientRect();
      const centre = from.left + from.width / 2;
      const isDown = e.key === 'ArrowDown';
      const beyond = tiles
        .map((tile) => ({ tile, rect: tile.getBoundingClientRect() }))
        .filter(({ rect }) =>
          isDown ? rect.top > from.top + 4 : rect.top < from.top - 4
        );
      if (beyond.length > 0) {
        const rowTop = isDown
          ? Math.min(...beyond.map(({ rect }) => rect.top))
          : Math.max(...beyond.map(({ rect }) => rect.top));
        target = beyond
          .filter(({ rect }) => Math.abs(rect.top - rowTop) < 4)
          .reduce((best, candidate) =>
            Math.abs(candidate.rect.left + candidate.rect.width / 2 - centre) <
            Math.abs(best.rect.left + best.rect.width / 2 - centre)
              ? candidate
              : best
          ).tile;
      }
    }

    if (target) {
      e.preventDefault();
      target.focus();
      target.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      // Above the first row is the search box
      e.preventDefault();
      searchRef.current?.focus();
    }
  };

  return (
    <Dialog.Root onOpenChange={handleOpenChange} open={open}>
      <Dialog.Trigger
        render={
          <button
            className="flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-stage-foreground pr-2.5 pl-4 text-sm font-semibold text-stage transition-transform outline-none focus-visible:ring-2 focus-visible:ring-stage-foreground focus-visible:ring-offset-2 active:scale-97 max-md:pr-4 pointer-coarse:h-10 pointer-coarse:pr-4"
            type="button"
          />
        }
      >
        Browse
        <Kbd className="bg-stage/15 text-stage max-md:hidden pointer-coarse:hidden">
          ⌘K
        </Kbd>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm transition-opacity duration-300 data-ending-style:opacity-0 data-ending-style:duration-200 data-starting-style:opacity-0" />
        <Dialog.Popup
          className="fixed top-1/2 left-1/2 z-50 flex h-[calc(100dvh-1rem)] w-[calc(100vw-1rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl bg-background text-foreground shadow-[0_32px_80px_-16px_rgb(0_0_0/45%)] ring-1 ring-foreground/10 transition-[opacity,scale,translate] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] outline-none data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-ending-style:duration-200 data-starting-style:translate-y-[calc(-50%+1.5rem)] data-starting-style:scale-[0.96] data-starting-style:opacity-0 motion-reduce:transition-none sm:h-[min(54rem,calc(100dvh-4rem))] sm:w-[calc(100vw-4rem)]"
          initialFocus={searchRef}
        >
          <header className="flex items-start justify-between gap-4 px-4 pt-4 sm:px-6 sm:pt-6">
            <div>
              <Dialog.Title className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Chord library
              </Dialog.Title>
              <Dialog.Description className="mt-1.5 text-sm text-muted-foreground">
                <span className="pointer-coarse:hidden">
                  Type to filter. Arrow keys move, <Kbd>Space</Kbd> plays a
                  chord and <Kbd>Enter</Kbd> puts it on the fretboard.
                </span>
                <span className="hidden pointer-coarse:inline">
                  Tap a chord to put it on the fretboard, or play it first.
                </span>
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="Close the chord library"
              className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:size-11"
            >
              <XIcon className="size-5" />
            </Dialog.Close>
          </header>

          <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 pt-4 pb-3 sm:px-6">
            <div className="flex h-11 items-center gap-2 rounded-full bg-muted pr-1.5 pl-4 transition-shadow focus-within:ring-2 focus-within:ring-ring pointer-coarse:h-12">
              <SearchIcon className="size-4.5 shrink-0 text-muted-foreground" />
              <input
                aria-label="Filter chords"
                autoCapitalize="off"
                autoComplete="off"
                autoCorrect="off"
                className="h-full min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
                enterKeyHint="go"
                onChange={(e) => setFilter(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Filter: F#m, sus4, Bb7…"
                ref={searchRef}
                spellCheck={false}
                type="search"
                value={filter}
              />
              {filter && (
                <button
                  aria-label="Clear the filter"
                  className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors outline-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:size-9"
                  onClick={() => {
                    setFilter('');
                    searchRef.current?.focus();
                  }}
                  type="button"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>

            <nav
              aria-label="Jump to a group of chords"
              className="fb-scroll -mx-4 flex gap-1.5 overflow-x-auto px-4 sm:-mx-6 sm:px-6"
              hidden={filter.trim() !== ''}
            >
              {categories.map((category) => (
                <button
                  className="h-8 shrink-0 cursor-pointer rounded-full bg-muted px-3 text-sm font-medium text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-10 pointer-coarse:px-4"
                  key={category.id}
                  onClick={() =>
                    document
                      .getElementById(`chord-group-${category.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                  tabIndex={-1}
                  type="button"
                >
                  {category.id}
                </button>
              ))}
            </nav>
          </div>

          {/* biome-ignore lint/a11y/noStaticElementInteractions: arrow-key grid navigation for the tiles inside */}
          <div
            className="flex-1 space-y-8 overflow-y-auto overscroll-contain px-4 py-5 sm:space-y-10 sm:px-6 sm:py-6"
            onKeyDown={handleGridKeyDown}
            ref={scrollRef}
          >
            {results && results.length === 0 && (
              <p className="py-16 text-center text-muted-foreground">
                No chord matches “{deferredFilter}”. Try a root and a type, like
                Am7 or Dsus4.
              </p>
            )}

            {visibleCategories.map((category) => (
              <section
                className="scroll-mt-4"
                id={`chord-group-${category.id}`}
                key={category.id}
              >
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                )}
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-[repeat(auto-fill,minmax(6.5rem,1fr))] sm:gap-3">
                  {category.chords.map((chord) => {
                    const name = formatChordName(chord.chordName);
                    return (
                      <div
                        className="overflow-hidden rounded-xl bg-white text-zinc-600 ring-1 ring-border transition-shadow hover:shadow-md hover:ring-foreground/40 has-focus-visible:ring-2 has-focus-visible:ring-ring"
                        key={`${chord.chordName}-${chord.strings}`}
                      >
                        <button
                          aria-label={`${name}, frets ${chord.strings}`}
                          className="block w-full cursor-pointer p-1 outline-none"
                          data-chord-tile=""
                          onClick={() => selectChord(chord)}
                          onKeyDown={(e) => {
                            // Space auditions the chord, Enter picks it
                            if (e.key === ' ') {
                              e.preventDefault();
                              if (!e.repeat) playLibraryChord(chord);
                            }
                          }}
                          onKeyUp={(e) => {
                            if (e.key === ' ') e.preventDefault();
                          }}
                          type="button"
                        >
                          <ChordDiagram
                            chordName={name}
                            showControls={false}
                            showFingers={showFingers}
                            size="sm"
                            static
                            strings={chordToStrings(chord)}
                          />
                        </button>
                        <button
                          aria-label={`Play ${name}`}
                          className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 border-t border-zinc-200 text-xs font-medium transition-colors outline-none hover:bg-zinc-100 hover:text-zinc-900 focus-visible:bg-zinc-100 active:bg-zinc-200 pointer-coarse:h-10"
                          onClick={() => playLibraryChord(chord)}
                          tabIndex={-1}
                          type="button"
                        >
                          <PlayIcon
                            className="size-3 fill-current"
                            strokeWidth={2}
                          />
                          Play
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
