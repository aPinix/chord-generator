'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Kbd } from '@/components/ui/kbd';
import { pluckString, preloadChord } from '@/lib/chord-audio';
import { splitChordName } from '@/lib/notes';
import { cn } from '@/lib/utils';
import type { SavedChord, StringState } from '@/types/chord';
import { PickIcon } from './pick-icon';
import { SAVED_CHORD_HOTKEYS } from './saved-chords';

// String gauges in px, low string first. The three lowest are wound.
const GAUGES = [6, 5, 4, 3.25, 2.75, 2.25] as const;
const WOUND_COUNT = 3;

// How close a press must land to a string to pluck it without moving
const PLUCK_REACH = 8;

interface ZenModeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chordName: string;
  /** Shown in place of the name when the shape has none */
  fallbackName: string;
  /** High string first, like the fretboard */
  strings: StringState[];
  /** The note each string sounds, low string first; null when muted */
  notes: (string | null)[];
  /** Shown when the guitar is not in standard tuning */
  tuningLabel?: string;
  savedChords: SavedChord[];
  activeSavedId: string | null;
  onSelectSaved: (chord: SavedChord) => void;
}

/**
 * A full-screen strumming surface. The pick follows the pointer and only
 * sounds the strings while it is held down, so you can lift it between
 * strokes. Strings are laid out as you see them looking down at a guitar:
 * the low string on top.
 */
export function ZenMode({
  open,
  onOpenChange,
  chordName,
  fallbackName,
  strings,
  notes,
  tuningLabel,
  savedChords,
  activeSavedId,
  onSelectSaved,
}: ZenModeProps) {
  const stringRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const pickRef = useRef<HTMLDivElement>(null);
  // Where each pressed pointer was last seen, to find the strings it crossed
  const pointers = useRef(new Map<number, { y: number; time: number }>());

  // Bumped on every pluck to restart that string's vibration
  const [plucks, setPlucks] = useState<number[]>(() => Array(6).fill(0));
  const [hasPlayed, setHasPlayed] = useState(false);

  // Low string first, as the audio engine expects
  const frets = useMemo(
    () => [...strings].reverse().map((s) => s.fret),
    [strings]
  );

  useEffect(() => {
    if (open) preloadChord(frets);
  }, [open, frets]);

  useEffect(() => {
    if (!open) {
      pointers.current.clear();
      setHasPlayed(false);
    }
  }, [open]);

  const pluck = useCallback(
    (index: number, velocity = 0.8, delay = 0) => {
      const fret = frets[index];
      if (fret === 'X') return;

      pluckString(index, fret, velocity, delay);
      const vibrate = () =>
        setPlucks((previous) =>
          previous.map((count, i) => (i === index ? count + 1 : count))
        );
      if (delay > 0) {
        setTimeout(vibrate, delay * 1000);
      } else {
        vibrate();
      }
      setHasPlayed(true);
    },
    [frets]
  );

  /** Strum every string in one stroke. */
  const strum = useCallback(
    (direction: 'down' | 'up') => {
      const order =
        direction === 'down' ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
      order.forEach((index, step) => {
        pluck(index, 0.8, step * 0.03);
      });
    },
    [pluck]
  );

  const stringPositions = () =>
    stringRefs.current.map((element) => {
      if (!element) return Number.NaN;
      const rect = element.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });

  const movePick = (event: React.PointerEvent) => {
    const pick = pickRef.current;
    if (!pick) return;
    pick.style.translate = `${event.clientX}px ${event.clientY}px`;
    pick.dataset.visible = '';
  };

  const setPickDown = (isDown: boolean) => {
    const pick = pickRef.current;
    if (!pick) return;
    if (isDown) {
      pick.dataset.down = '';
    } else {
      delete pick.dataset.down;
    }
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    try {
      // Keep the stroke going if the pointer slides over a button
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Capture is a nicety; strumming works without it
    }
    pointers.current.set(event.pointerId, {
      y: event.clientY,
      time: event.timeStamp,
    });
    movePick(event);
    setPickDown(true);

    // Landing right on a string picks that one note
    const positions = stringPositions();
    let nearest = -1;
    let distance = PLUCK_REACH;
    positions.forEach((y, index) => {
      const gap = Math.abs(y - event.clientY);
      if (gap <= distance) {
        nearest = index;
        distance = gap;
      }
    });
    if (nearest >= 0) pluck(nearest);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    movePick(event);

    const previous = pointers.current.get(event.pointerId);
    if (!previous) return; // the pick is up: moving makes no sound

    const from = previous.y;
    const to = event.clientY;
    if (from === to) return;

    const elapsed = Math.max(event.timeStamp - previous.time, 1);
    const speed = Math.abs(to - from) / elapsed; // px per ms
    const velocity = Math.min(0.35 + speed * 0.45, 1);

    const crossed = stringPositions()
      .map((y, index) => ({ y, index }))
      .filter(({ y }) => (from < y && to >= y) || (from > y && to <= y))
      .sort((a, b) => (to > from ? a.y - b.y : b.y - a.y));

    // A fast sweep can cross several strings between two events: spread them
    crossed.forEach(({ index }, step) => {
      pluck(index, velocity, step * 0.012);
    });

    pointers.current.set(event.pointerId, { y: to, time: event.timeStamp });
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) setPickDown(false);
    // A finger has no hover state: the pick leaves with it
    if (event.pointerType !== 'mouse' && pickRef.current) {
      delete pickRef.current.dataset.visible;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault();
      if (!event.repeat) strum('down');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!event.repeat) strum('up');
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      if (savedChords.length === 0) return;
      event.preventDefault();
      const current = savedChords.findIndex((c) => c.id === activeSavedId);
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const next =
        current === -1
          ? 0
          : (current + step + savedChords.length) % savedChords.length;
      onSelectSaved(savedChords[next]);
    }
  };

  const { root, rest } = splitChordName(chordName);

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={open}>
      <Dialog.Portal>
        <Dialog.Popup
          className="zen-stage fixed inset-0 z-50 flex flex-col overflow-hidden outline-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] data-open:animate-in data-open:duration-300 data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
          onKeyDown={handleKeyDown}
        >
          <Dialog.Title className="sr-only">Zen mode</Dialog.Title>
          <Dialog.Description className="sr-only">
            Hold the pick down and sweep it across the strings to play. Space
            strums the whole chord, the number keys switch between your saved
            chords, and Escape leaves Zen mode.
          </Dialog.Description>

          {/* The strumming surface fills the screen */}
          <div
            className="absolute inset-0 cursor-none touch-none"
            onPointerCancel={handlePointerUp}
            onPointerDown={handlePointerDown}
            onPointerLeave={(event) => {
              if (!pointers.current.has(event.pointerId) && pickRef.current) {
                delete pickRef.current.dataset.visible;
              }
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* The chord, set huge and faint behind the strings */}
            <p
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center px-4 text-center font-display text-[clamp(6rem,30vw,22rem)] leading-none font-extrabold tracking-tight whitespace-nowrap text-(--zen-ink)/[0.07]"
            >
              {chordName ? (
                <>
                  {root}
                  {rest && <span className="text-[0.58em]">{rest}</span>}
                </>
              ) : null}
            </p>

            <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col">
              {GAUGES.map((gauge, index) => {
                const note = notes[index];
                return (
                  <div
                    className="relative h-[clamp(2.75rem,9.5dvh,4.75rem)]"
                    key={index}
                  >
                    <span
                      className={cn(
                        'absolute bottom-1/2 left-4 mb-2 text-xs font-medium tabular-nums sm:left-6',
                        note === null
                          ? 'text-(--zen-muted)/50'
                          : 'text-(--zen-muted)'
                      )}
                    >
                      {note ?? '×'}
                    </span>
                    <span
                      className="fb-string zen-string top-1/2"
                      data-muted={note === null ? '' : undefined}
                      data-strum={plucks[index] > 0 ? '' : undefined}
                      data-wound={index < WOUND_COUNT ? '' : undefined}
                      // A new pluck remounts the string so it vibrates again
                      key={plucks[index]}
                      ref={(element) => {
                        stringRefs.current[index] = element;
                      }}
                      style={{ '--gauge': `${gauge}px` } as React.CSSProperties}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top: what is playing, and the way out */}
          <div className="pointer-events-none relative z-10 flex items-start justify-between gap-4 p-4 sm:p-6">
            <div aria-live="polite" className="min-w-0">
              <p className="truncate font-display text-3xl leading-none font-bold">
                <span className="sr-only">Playing </span>
                {chordName || fallbackName}
              </p>
              {tuningLabel && (
                <p className="mt-2 text-sm text-(--zen-muted)">{tuningLabel}</p>
              )}
            </div>
            <Dialog.Close className="pointer-events-auto flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full pr-2.5 pl-4 text-sm font-medium text-(--zen-ink) ring-1 ring-(--zen-ink)/20 transition-colors outline-none hover:bg-(--zen-ink)/10 focus-visible:ring-2 focus-visible:ring-(--zen-ink) pointer-coarse:h-11 pointer-coarse:pr-4">
              Leave
              <Kbd className="bg-(--zen-ink)/10 text-(--zen-ink) pointer-coarse:hidden">
                Esc
              </Kbd>
            </Dialog.Close>
          </div>

          {/* Bottom: saved chords, and a hint until the first note */}
          <div className="pointer-events-none relative z-10 mt-auto flex flex-col items-center gap-4 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
            <p
              className={cn(
                'max-w-sm text-center text-sm text-balance text-(--zen-muted) transition-opacity duration-700',
                hasPlayed && 'opacity-0'
              )}
            >
              <span className="pointer-coarse:hidden">
                Hold the mouse button to lower the pick, then sweep it across
                the strings.
              </span>
              <span className="hidden pointer-coarse:inline">
                Drag a finger across the strings.
              </span>
            </p>

            {savedChords.length > 0 ? (
              <ul className="fb-scroll pointer-events-auto flex max-w-full gap-2 overflow-x-auto p-1">
                {savedChords.map((chord, index) => {
                  const isActive = chord.id === activeSavedId;
                  return (
                    <li className="shrink-0" key={chord.id}>
                      <button
                        aria-pressed={isActive}
                        className={cn(
                          'flex h-11 cursor-pointer items-center gap-2 rounded-full pr-4 pl-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--zen-ink)',
                          isActive
                            ? 'bg-(--zen-ink) text-[#0b1f18]'
                            : 'text-(--zen-ink) ring-1 ring-(--zen-ink)/20 hover:bg-(--zen-ink)/10'
                        )}
                        onClick={() => onSelectSaved(chord)}
                        type="button"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'flex size-8 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                            isActive ? 'bg-[#0b1f18]/10' : 'bg-(--zen-ink)/10'
                          )}
                        >
                          {index < SAVED_CHORD_HOTKEYS ? index + 1 : '·'}
                        </span>
                        <span className="font-display text-base font-semibold">
                          {chord.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="max-w-sm text-center text-sm text-balance text-(--zen-muted)/70">
                Save chords on the fretboard to switch between them here.
              </p>
            )}
          </div>

          <div className="zen-pick" ref={pickRef}>
            <PickIcon shaded />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
