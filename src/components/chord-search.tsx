'use client';

import { useEffect, useRef, useState } from 'react';
import { highlightMatch } from '@/helpers/highlight-match';
import { formatChordName as formatName, searchChords } from '@/lib/chord-data';
import type { ChordData, StringState } from '@/types/chord';
import { ChordDiagram } from './chord-diagram';
import { ChordSearchInput } from './chord-search-input';

interface ChordSearchProps {
  onChordSelect: (strings: StringState[], chordName: string) => void;
}

export function ChordSearch({ onChordSelect }: ChordSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFingers, setShowFingers] = useState(true);
  const [results, setResults] = useState<ChordData[]>([]);

  const debounceRef = useRef<NodeJS.Timeout | null>(null);

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

  return (
    <div className="flex flex-col gap-4">
      <ChordSearchInput
        loading={loading}
        onChordSelect={onChordSelect}
        parseStringsToState={parseStringsToState}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFingers={showFingers}
      />

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
                    className={`truncate font-bold text-lg ${
                      isExactMatch ? 'text-primary' : ''
                    }`}
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
