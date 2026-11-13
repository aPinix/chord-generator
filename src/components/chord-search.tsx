'use client';

import { SearchIcon } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Kbd } from '@/components/ui/kbd';
import { highlightMatch } from '@/helpers/highlight-match';
import {
  chordToStrings,
  formatChordName,
  searchChords,
} from '@/lib/chord-data';
import { cn } from '@/lib/utils';
import type { ChordData, StringState } from '@/types/chord';
import { ChordDiagram } from './chord-diagram';
import { ChordLibrary } from './chord-library';

const MAX_RESULTS = 24;

interface ChordSearchProps {
  onChordSelect: (strings: StringState[], chordName: string) => void;
  className?: string;
}

export function ChordSearch({ onChordSelect, className }: ChordSearchProps) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showFingers, setShowFingers] = useState(true);

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Keep the mini diagrams in sync with the "finger numbers" setting
  useEffect(() => {
    const savedFingers = localStorage.getItem('chord-diagram-fingers');
    if (savedFingers !== null) {
      setShowFingers(savedFingers === 'true');
    }
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'chord-diagram-fingers' && e.newValue !== null) {
        setShowFingers(e.newValue === 'true');
      }
    };
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

  // Each result renders a diagram, so wait for a pause in typing
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 120);
    return () => clearTimeout(timeout);
  }, [query]);

  const results = useMemo(
    () =>
      debouncedQuery ? searchChords(debouncedQuery).slice(0, MAX_RESULTS) : [],
    [debouncedQuery]
  );

  // ⌘F (Ctrl+F) focuses the search instead of the browser's find bar.
  // "/" does the same when no text field has focus.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isFindShortcut =
        (e.metaKey || e.ctrlKey) &&
        !e.altKey &&
        !e.shiftKey &&
        e.key.toLowerCase() === 'f';
      const isSlash = e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey;
      if (!isFindShortcut && !isSlash) return;

      // Leave open dialogs (Zen mode, the library) their own keys
      if (document.querySelector('[role="dialog"]')) return;
      const target = e.target as HTMLElement | null;
      if (
        isSlash &&
        target?.closest('input, textarea, select, [contenteditable="true"]')
      )
        return;

      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close the results when clicking elsewhere
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  const selectChord = (chord: ChordData) => {
    onChordSelect(chordToStrings(chord), formatChordName(chord.chordName));
    setQuery('');
    setDebouncedQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const showPanel = isOpen && debouncedQuery.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (results.length === 0) return;

    // Results sit in two columns from the `sm` breakpoint up
    const columns = window.matchMedia('(min-width: 40rem)').matches ? 2 : 1;
    const move = (step: number) => {
      e.preventDefault();
      setIsOpen(true);
      setActiveIndex((i) => {
        const next = i + step;
        return next >= 0 && next < results.length ? next : i;
      });
    };

    if (e.key === 'ArrowDown') {
      move(columns);
    } else if (e.key === 'ArrowUp') {
      move(-columns);
    } else if (e.key === 'ArrowRight' && columns > 1 && showPanel) {
      move(1);
    } else if (e.key === 'ArrowLeft' && columns > 1 && showPanel) {
      move(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      selectChord(results[Math.min(activeIndex, results.length - 1)]);
    }
  };

  const optionId = (index: number) => `${listboxId}-option-${index}`;

  // Keep the highlighted result in view while moving with the keyboard
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs when the highlight moves
  useEffect(() => {
    document
      .getElementById(optionId(activeIndex))
      ?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  return (
    <div className={cn('relative', className)} ref={rootRef}>
      <div className="flex h-12 items-center gap-2 rounded-full bg-stage-raised pr-1.5 pl-4 shadow-[0_1px_2px_rgb(16_37_30/12%)] ring-1 ring-stage-edge transition-shadow focus-within:ring-2 focus-within:ring-stage-foreground">
        <SearchIcon className="size-4.5 shrink-0 text-stage-muted" />
        <input
          aria-activedescendant={
            showPanel && results.length > 0 ? optionId(activeIndex) : undefined
          }
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-expanded={showPanel}
          aria-label="Find a chord by name"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-ellipsis text-stage-foreground outline-none placeholder:text-stage-muted/80"
          enterKeyHint="go"
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Find a chord: Am, G7, Fmaj7"
          ref={inputRef}
          role="combobox"
          spellCheck={false}
          type="text"
          value={query}
        />
        <Kbd className="hidden bg-stage/60 text-stage-muted md:inline-flex pointer-coarse:hidden">
          ⌘F
        </Kbd>
        <ChordLibrary onChordSelect={onChordSelect} showFingers={showFingers} />
      </div>

      {showPanel && (
        <div
          className="absolute inset-x-0 top-full z-40 mt-2 max-h-[min(26rem,55dvh)] overflow-y-auto rounded-3xl bg-popover p-2 text-popover-foreground shadow-[0_24px_48px_-12px_rgb(16_37_30/35%)] ring-1 ring-border"
          id={listboxId}
          role="listbox"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No chord called “{debouncedQuery}” in the library. Try Am, G7 or
              Fmaj7, or build it on the fretboard.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
              {results.map((chord, index) => {
                const displayName = formatChordName(chord.chordName);
                const isActive = index === activeIndex;

                return (
                  <button
                    aria-selected={isActive}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-2xl p-2 text-left transition-colors outline-none',
                      isActive ? 'bg-muted' : 'hover:bg-muted/60'
                    )}
                    id={optionId(index)}
                    key={`${chord.chordName}-${chord.strings}-${index}`}
                    onClick={() => selectChord(chord)}
                    onMouseMove={() => setActiveIndex(index)}
                    role="option"
                    tabIndex={-1}
                    type="button"
                  >
                    <div className="w-14 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
                      <ChordDiagram
                        showControls={false}
                        showFingers={showFingers}
                        size="xs"
                        static
                        strings={chordToStrings(chord)}
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-display text-lg leading-tight font-bold">
                        {highlightMatch(displayName, debouncedQuery)}
                      </span>
                      <span className="truncate text-sm text-muted-foreground tabular-nums">
                        {chord.strings.replace(/X/g, '×')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
