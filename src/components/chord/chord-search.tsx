'use client';

import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ChordDiagram } from '@/components/chord/chord-diagram';
import { Input } from '@/components/ui/input';
import {
  formatChordName as formatName,
  normalizeChordQuery,
  searchChords,
} from '@/lib/chord-data';
import type { ChordData, StringState } from '@/types/chord';

interface ChordSearchProps {
  onChordSelect: (strings: StringState[], chordName: string) => void;
}

export function ChordSearch({ onChordSelect }: ChordSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ChordData[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        // Try API first
        const normalizedSearch = normalizeChordQuery(searchQuery);
        const response = await fetch(
          `/api/chords?nameLike=${encodeURIComponent(normalizedSearch)}`
        );

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const sorted = data
              .filter((chord: ChordData) => {
                const name = normalizeChordQuery(formatName(chord.chordName));
                return (
                  name.includes(normalizedSearch) ||
                  normalizedSearch.includes(name)
                );
              })
              .sort((a: ChordData, b: ChordData) => {
                const nameA = normalizeChordQuery(formatName(a.chordName));
                const nameB = normalizeChordQuery(formatName(b.chordName));
                const exactA = nameA === normalizedSearch;
                const exactB = nameB === normalizedSearch;
                if (exactA && !exactB) return -1;
                if (exactB && !exactA) return 1;
                const startsA = nameA.startsWith(normalizedSearch);
                const startsB = nameB.startsWith(normalizedSearch);
                if (startsA && !startsB) return -1;
                if (startsB && !startsA) return 1;
                return nameA.length - nameB.length;
              });
            if (sorted.length > 0) {
              setResults(sorted);
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // API failed, fall through to local search
      }

      // Fallback to local search
      const localResults = searchChords(searchQuery);
      setResults(localResults);
      setLoading(false);
    }, 300);

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
      <div className="flex gap-2">
        <Input
          className="bg-white dark:bg-zinc-900"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search chords (e.g., Am, G, Fmaj7)"
          value={searchQuery}
        />
        {loading && (
          <div className="flex items-center px-2">
            <Search className="size-4 animate-pulse text-muted-foreground" />
          </div>
        )}
      </div>

      {results.length === 0 && searchQuery && !loading && (
        <p className="text-muted-foreground text-sm">
          No chords found. Try searching for: A, Am, C, D, E, Em, F, G
        </p>
      )}

      {results.length > 0 && (
        <div className="flex max-h-60 flex-col gap-1 overflow-y-auto rounded-lg border border-border p-2">
          {results.slice(0, 20).map((chord, index) => (
            <button
              className="flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
              key={`${chord.chordName}-${chord.strings}-${index}`}
              onClick={() => handleChordClick(chord)}
              type="button"
            >
              <div className="h-[84px] w-[60px] shrink-0 overflow-hidden">
                <ChordDiagram
                  chordName={formatName(chord.chordName).replace(/\//g, '')}
                  height={280}
                  strings={parseStringsToState(chord.strings, chord.fingering)}
                  width={200}
                />
              </div>
              <span className="flex-1 font-medium">
                {formatName(chord.chordName).replace(/\//g, '')}
              </span>
              <span className="font-mono text-muted-foreground text-xs">
                {chord.strings}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
