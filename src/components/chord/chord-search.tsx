'use client';

import { Grid2X2, Search } from 'lucide-react';
import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  formatChordName as formatName,
  getChordsByCategory,
  searchChords,
} from '@/lib/chord-data';
import type { ChordData, StringState } from '@/types/chord';
import { ChordDiagram } from './chord-diagram';

interface ChordSearchProps {
  onChordSelect: (strings: StringState[], chordName: string) => void;
}

// Helper to highlight matching text in search results
function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      // biome-ignore lint/suspicious/noArrayIndexKey: Parts derived from static text split
      <mark className="rounded bg-primary/30 px-0.5 text-primary" key={i}>
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function ChordSearch({ onChordSelect }: ChordSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ChordData[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFingers, setShowFingers] = useState(true);
  const [dialogReady, setDialogReady] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const chordCategories = useMemo(() => getChordsByCategory(), []);

  // Defer rendering of dialog content until after dialog opens
  useEffect(() => {
    if (dialogOpen) {
      startTransition(() => {
        setDialogReady(true);
      });
    } else {
      setDialogReady(false);
    }
  }, [dialogOpen]);

  // Sync showFingers from localStorage and custom events
  useEffect(() => {
    const savedFingers = localStorage.getItem('chord-diagram-fingers');
    if (savedFingers !== null) {
      setShowFingers(savedFingers === 'true');
    }
    // Listen for storage changes from other tabs
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'chord-diagram-fingers' && e.newValue !== null) {
        setShowFingers(e.newValue === 'true');
      }
    };
    // Listen for custom event from same window
    const handleCustomEvent = (e: CustomEvent<boolean>) => {
      setShowFingers(e.detail);
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener(
      'chord-fingers-change',
      handleCustomEvent as EventListener
    );
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(
        'chord-fingers-change',
        handleCustomEvent as EventListener
      );
    };
  }, []);

  // Debounced search effect using local chord data
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(() => {
      const localResults = searchChords(searchQuery);
      setResults(localResults);
      setLoading(false);
    }, 150);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery]);

  const parseStringsToState = (
    stringsStr: string,
    fingeringStr: string
  ): StringState[] => {
    const stringValues = stringsStr.split(' ');
    const fingerValues = fingeringStr.split(' ');

    // Chord data is low E to high E, but UI is high E to low E, so reverse
    const states = stringValues.map((val, index) => {
      const finger = fingerValues[index];
      if (val === 'X') {
        return { fret: 'X' as const, finger: undefined };
      }
      const fretNum = parseInt(val, 10);
      const fingerNum =
        finger && finger !== 'X' ? parseInt(finger, 10) : undefined;
      return {
        fret: fretNum,
        finger: fingerNum && !Number.isNaN(fingerNum) ? fingerNum : undefined,
      };
    });
    return states.reverse();
  };

  const handleChordClick = (chord: ChordData) => {
    const stringStates = parseStringsToState(chord.strings, chord.fingering);
    onChordSelect(stringStates, formatName(chord.chordName));
  };

  const handleDialogChordClick = (chord: ChordData) => {
    handleChordClick(chord);
    setDialogOpen(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex overflow-hidden rounded-full bg-muted">
        <div className="flex flex-1 items-center gap-2 pl-4">
          <Search
            className={`size-4 ${loading ? 'animate-pulse' : ''} text-muted-foreground`}
          />
          <Input
            className="h-auto flex-1 border-0 bg-transparent py-3 shadow-none focus-visible:ring-0"
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chords (e.g., Am, G, Fmaj7)"
            value={searchQuery}
          />
        </div>
        <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
          <DialogTrigger
            render={
              <Button
                className="h-auto rounded-none rounded-r-full px-5 py-3"
                title="Browse all chords"
                variant="outline"
              />
            }
          >
            <Grid2X2 className="size-4" />
            <span className="text-sm">Browse</span>
          </DialogTrigger>
          <DialogContent className="max-h-[calc(100dvh-4rem)]! w-screen! max-w-[calc(100vw-4rem)]! gap-0 overflow-hidden p-0">
            <DialogHeader className="border-border border-b px-6 py-6">
              <DialogTitle className="text-2xl">Chord Library</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Browse all chords in the library
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[calc(100vh-12rem)]">
              <div className="min-h-[calc(100vh-14rem)] space-y-6 px-6 py-6">
                {!dialogReady ? (
                  <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
                    <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : (
                  chordCategories.map((category) => (
                    <div key={category.name}>
                      <div className="mb-3">
                        <h3 className="font-semibold text-lg">
                          {category.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {category.description}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.chords.map((chord, index) => {
                          const displayName = formatName(
                            chord.chordName
                          ).replace(/\//g, '');
                          return (
                            <button
                              className="flex cursor-pointer flex-col items-center rounded-lg border border-transparent transition-colors hover:border-primary"
                              key={`${chord.chordName}-${index}`}
                              onClick={() => handleDialogChordClick(chord)}
                              type="button"
                            >
                              <div className="h-fit w-[110px] shrink-0 overflow-hidden">
                                <ChordDiagram
                                  chordName={displayName}
                                  showControls={false}
                                  showFingers={showFingers}
                                  size="sm"
                                  static
                                  strings={parseStringsToState(
                                    chord.strings,
                                    chord.fingering
                                  )}
                                />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      {results.length === 0 && searchQuery && !loading && (
        <p className="text-muted-foreground text-sm">
          No chords found. Try searching for: A, Am, C, D, E, Em, F, G
        </p>
      )}

      {results.length > 0 && (
        <div className="grid max-h-72 grid-cols-2 gap-2 overflow-y-auto rounded-lg border border-border bg-background p-2 sm:grid-cols-3 md:grid-cols-4">
          {results.slice(0, 30).map((chord, index) => {
            const displayName = formatName(chord.chordName).replace(/\//g, '');
            const isExactMatch =
              searchQuery.trim().toLowerCase() === displayName.toLowerCase();

            return (
              <button
                className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-left transition-colors hover:bg-muted ${
                  isExactMatch ? 'bg-primary/5 ring-1 ring-primary/20' : ''
                }`}
                key={`${chord.chordName}-${chord.strings}-${index}`}
                onClick={() => handleChordClick(chord)}
                type="button"
              >
                <div className="h-[70px] w-[50px] shrink-0 overflow-hidden">
                  <ChordDiagram
                    showControls={false}
                    showFingers={showFingers}
                    size="xs"
                    static
                    strings={parseStringsToState(
                      chord.strings,
                      chord.fingering
                    )}
                  />
                </div>
                <div className="flex min-w-0 flex-col">
                  <span
                    className={`truncate font-bold text-lg ${isExactMatch ? 'text-primary' : ''}`}
                  >
                    {highlightMatch(displayName, searchQuery)}
                  </span>
                  <span className="truncate font-mono text-muted-foreground text-xs">
                    {chord.strings}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
