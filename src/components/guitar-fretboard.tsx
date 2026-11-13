'use client';

import { XIcon } from 'lucide-react';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { StringState } from '@/types/chord';
import { STRING_NAMES, TOTAL_FRETS, TOTAL_STRINGS } from '@/types/chord';

const FINGER_NAMES = ['', 'index', 'middle', 'ring', 'pinky'] as const;

// Position markers, as inlaid on most guitars
const SINGLE_INLAYS = new Set([3, 5, 7, 9, 15, 17, 19, 21]);
const DOUBLE_INLAYS = new Set([12]);

// String gauges in px, high E to low E. The three lowest are wound.
const STRING_GAUGES = [2, 2.25, 2.75, 3.25, 4, 5] as const;
const WOUND_FROM = 3;

// Frets narrow towards the body. A real neck halves every 12 frets; this
// halves every 24 so the upper frets stay comfortable to click.
const fretGrow = (fret: number) => 2 ** (-(fret - 1) / 24);

export interface Strum {
  /** Changes on every strum so the animation restarts */
  id: number;
  /** Milliseconds between strings */
  speed: number;
}

interface GuitarFretboardProps {
  strings: StringState[];
  onStringChange: (stringIndex: number, fret: number | 'X' | 0) => void;
  onFingerChange?: (stringIndex: number, finger: number | undefined) => void;
  visibleFrets?: number;
  strum?: Strum | null;
  /** Open-string names, high string first. Defaults to standard tuning */
  stringNames?: readonly string[];
  /** Something to show above the neck, pointing down at `fret` */
  callout?: FretboardCallout | null | false;
}

export interface FretboardCallout {
  fret: number;
  node: React.ReactNode;
}

/**
 * Keeps a callout above one fret while the neck scrolls. It lives outside the
 * scroll area so it can rise over the fret numbers without being clipped.
 */
function useCalloutPosition(fret: number | undefined) {
  const outerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const calloutRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{
    left: number;
    top: number;
    arrow: number;
    inView: boolean;
  } | null>(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const scroller = scrollRef.current;
    if (!fret || !outer || !scroller) {
      setPosition(null);
      return;
    }

    const update = () => {
      const column = scroller.querySelector<HTMLElement>(
        `[data-fret="${fret}"]`
      );
      const box = calloutRef.current;
      if (!column || !box) return;
      const outerRect = outer.getBoundingClientRect();
      const scrollRect = scroller.getBoundingClientRect();
      const columnRect = column.getBoundingClientRect();
      const target = columnRect.left + columnRect.width / 2 - outerRect.left;
      const width = box.offsetWidth;
      // Stay inside the fretboard; the arrow keeps pointing at the fret
      const left = Math.min(
        Math.max(target - width / 2, 0),
        outerRect.width - width
      );
      const visibleFrom = scrollRect.left - outerRect.left;
      const visibleTo =
        Math.min(scrollRect.right, window.innerWidth) - outerRect.left;
      setPosition({
        // Whole pixels, so the small digits inside render crisp and centred
        left: Math.round(outerRect.left + left) - outerRect.left,
        // 2rem down is the top of the wood, nudged onto a whole pixel
        top: Math.round(outerRect.top + 32) - outerRect.top,
        arrow: Math.min(Math.max(target - left, 16), width - 16),
        inView: target > visibleFrom + 8 && target < visibleTo - 8,
      });
    };

    update();
    scroller.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(outer);
    if (calloutRef.current) observer.observe(calloutRef.current);
    return () => {
      scroller.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [fret]);

  return { outerRef, scrollRef, calloutRef, position };
}

export function GuitarFretboard({
  strings,
  onStringChange,
  onFingerChange,
  visibleFrets = TOTAL_FRETS,
  strum,
  stringNames = STRING_NAMES,
  callout,
}: GuitarFretboardProps) {
  const { outerRef, scrollRef, calloutRef, position } = useCalloutPosition(
    callout ? callout.fret : undefined
  );
  // "Mute all / Open all" only affects strings without a finger on them
  const unfrettedStrings = strings.filter(
    (s) => s.fret === 0 || s.fret === 'X'
  );
  const allUnfrettedMuted =
    unfrettedStrings.length > 0 &&
    unfrettedStrings.every((s) => s.fret === 'X');

  const handleToggleAll = useCallback(() => {
    const newValue = allUnfrettedMuted ? 0 : 'X';
    for (let i = 0; i < TOTAL_STRINGS; i++) {
      const current = strings[i].fret;
      if (current === 0 || current === 'X') {
        onStringChange(i, newValue);
      }
    }
  }, [allUnfrettedMuted, strings, onStringChange]);

  const handleFretClick = useCallback(
    (stringIndex: number, fret: number, decrease: boolean = false) => {
      const currentState = strings[stringIndex];
      if (currentState.fret === fret) {
        // Position already active - cycle finger number
        if (onFingerChange) {
          const currentFinger = currentState.finger;
          let nextFinger: number | undefined;

          if (decrease) {
            // Decrease: undefined → 4 → 3 → 2 → 1 → undefined
            nextFinger = currentFinger
              ? currentFinger <= 1
                ? undefined
                : currentFinger - 1
              : 4;
          } else {
            // Increase: undefined → 1 → 2 → 3 → 4 → undefined
            nextFinger = currentFinger
              ? currentFinger >= 4
                ? undefined
                : currentFinger + 1
              : 1;
          }
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
    <div
      className="relative flex select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
      ref={outerRef}
    >
      {/* Rises over the fret numbers, its arrow resting on the wood */}
      {callout && (
        <div
          className={cn(
            'absolute z-40 -translate-y-full pb-2 transition-opacity duration-150',
            (!position || !position.inView) && 'pointer-events-none opacity-0'
          )}
          ref={calloutRef}
          style={
            {
              left: position?.left ?? 0,
              top: position?.top ?? 32,
              '--arrow-x': `${position?.arrow ?? 0}px`,
            } as React.CSSProperties
          }
        >
          {callout.node}
        </div>
      )}

      {/* Headstock side: string names and open/mute toggles */}
      <div className="flex shrink-0 flex-col">
        <div className="flex h-8 items-center">
          <button
            className="-ml-2 h-8 cursor-pointer rounded-full px-2 text-xs font-medium text-stage-muted underline-offset-4 transition-colors outline-none hover:text-stage-foreground hover:underline focus-visible:ring-2 focus-visible:ring-stage-foreground disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline"
            disabled={unfrettedStrings.length === 0}
            onClick={handleToggleAll}
            type="button"
          >
            {allUnfrettedMuted ? 'Open all' : 'Mute all'}
          </button>
        </div>

        <div className="flex">
          <div className="flex flex-col">
            {Array.from({ length: TOTAL_STRINGS }).map((_, stringIndex) => {
              const stringState = strings[stringIndex];
              const isOpen = stringState.fret === 0;
              const isMuted = stringState.fret === 'X';
              const label = isMuted
                ? 'muted. Click to open it'
                : isOpen
                  ? 'open. Click to mute it'
                  : `fretted at ${stringState.fret}. Click to lift the finger`;

              return (
                <div
                  className="flex h-11 items-center gap-1 pr-1.5 sm:gap-2 sm:pr-2.5"
                  key={`label-string-${stringIndex}`}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'w-6 text-center font-display text-base font-bold transition-opacity',
                      isMuted && 'opacity-40'
                    )}
                  >
                    {stringNames[stringIndex]}
                  </span>
                  <button
                    aria-label={`${stringNames[stringIndex]} string, ${label}`}
                    className={cn(
                      'relative flex size-8 cursor-pointer touch-manipulation items-center justify-center rounded-full transition-colors outline-none after:absolute after:-inset-x-1 after:-inset-y-1.5 focus-visible:ring-2 focus-visible:ring-stage-foreground',
                      isMuted &&
                        'bg-pick/15 text-primary hover:bg-pick/25 dark:text-pick',
                      isOpen &&
                        'bg-stage-raised/70 text-stage-foreground hover:bg-stage-raised',
                      !isMuted &&
                        !isOpen &&
                        'text-stage-muted hover:bg-stage-raised/70'
                    )}
                    onClick={() => handleOpenMuteToggle(stringIndex)}
                    title={
                      isMuted
                        ? 'Muted string'
                        : isOpen
                          ? 'Open string'
                          : 'Lift finger'
                    }
                    type="button"
                  >
                    {isMuted ? (
                      <XIcon className="size-4" strokeWidth={2.5} />
                    ) : isOpen ? (
                      <span className="size-3.5 rounded-full border-2 border-current" />
                    ) : (
                      <span className="size-2 rounded-full bg-current" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <div aria-hidden="true" className="fb-nut w-2.5 rounded-l-sm" />
        </div>
      </div>

      {/*
        On smaller screens the neck scrolls sideways and runs off the right
        edge of the screen, like a guitar too long to fit. `fb-bed` paints
        wood and strings on the scroll area itself, so when macOS and iOS
        bounce the neck past its end there is more neck, not a gap.
      */}
      <div
        className="fb-scroll fb-bed -mr-4 min-w-0 flex-1 overflow-x-auto overscroll-x-contain pb-6 sm:-mr-6 lg:mr-0"
        ref={scrollRef}
      >
        <div className="flex w-max min-w-full">
          <div className="relative isolate flex min-w-[54rem] flex-1">
            {/*
            The wood (and the strings below) carry on far past the nut, out of
            view. macOS and iOS bounce a scroll area past its start; this way
            the bounce shows more neck instead of a gap.
          */}
            <div
              aria-hidden="true"
              className="fb-wood absolute top-8 right-0 bottom-0 -left-[100vw] lg:rounded-r-lg"
            />

            {Array.from({ length: visibleFrets }).map((_, fretIndex) => {
              const fretNum = fretIndex + 1;
              const hasInlay = SINGLE_INLAYS.has(fretNum);
              const hasDoubleInlay = DOUBLE_INLAYS.has(fretNum);
              const isLast = fretNum === visibleFrets;

              return (
                <div
                  className="relative flex min-w-0 flex-col"
                  data-fret={fretNum}
                  key={`fret-col-${fretNum}`}
                  style={{ flex: `${fretGrow(fretNum)} 1 0` }}
                >
                  {/* Fret number */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      'flex h-8 items-center justify-center text-xs tabular-nums',
                      hasInlay || hasDoubleInlay
                        ? 'font-semibold text-stage-foreground'
                        : 'text-stage-muted/70'
                    )}
                  >
                    {fretNum}
                  </div>

                  {/* Inlays sit between the strings */}
                  {hasInlay && (
                    <span
                      aria-hidden="true"
                      className="fb-inlay pointer-events-none absolute top-[calc(2rem+8.25rem)] left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    />
                  )}
                  {hasDoubleInlay && (
                    <>
                      <span
                        aria-hidden="true"
                        className="fb-inlay pointer-events-none absolute top-[calc(2rem+5.5rem)] left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      />
                      <span
                        aria-hidden="true"
                        className="fb-inlay pointer-events-none absolute top-[calc(2rem+11rem)] left-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                      />
                    </>
                  )}

                  {/* One cell per string */}
                  {Array.from({ length: TOTAL_STRINGS }).map(
                    (_, stringIndex) => {
                      const stringState = strings[stringIndex];
                      const isActive = stringState.fret === fretNum;
                      const finger = isActive ? stringState.finger : undefined;

                      return (
                        <button
                          aria-label={`${stringNames[stringIndex]} string, fret ${fretNum}${
                            isActive
                              ? finger
                                ? `, ${FINGER_NAMES[finger]} finger`
                                : ', any finger'
                              : ''
                          }`}
                          aria-pressed={isActive}
                          className="group relative flex h-11 cursor-pointer touch-manipulation items-center justify-center outline-none"
                          key={`fret-${fretNum}-string-${stringIndex}`}
                          onClick={(e) =>
                            handleFretClick(stringIndex, fretNum, e.shiftKey)
                          }
                          onContextMenu={(e) => {
                            e.preventDefault();
                            handleFretClick(stringIndex, fretNum, true);
                          }}
                          type="button"
                        >
                          {isActive ? (
                            <span
                              className="finger-dot fb-dot-in relative z-20 flex size-8 items-center justify-center rounded-full text-[1.0625rem] font-bold ring-bone select-none group-focus-visible:ring-2"
                              data-finger={finger}
                              // Re-run the pop when the finger changes
                              key={finger ?? 'any'}
                            >
                              {finger}
                            </span>
                          ) : (
                            <span className="relative z-20 size-7 rounded-full bg-bone/0 ring-2 ring-bone/0 transition-colors group-hover:bg-bone/25 group-hover:ring-bone/60 group-focus-visible:bg-bone/25 group-focus-visible:ring-bone" />
                          )}
                        </button>
                      );
                    }
                  )}

                  {/* Fret wire */}
                  {!isLast && (
                    <span
                      aria-hidden="true"
                      className="fb-fret-wire pointer-events-none absolute top-8 right-0 bottom-0 w-[3px] translate-x-1/2"
                    />
                  )}
                </div>
              );
            })}

            {/* Strings run over the frets, under the finger dots */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-8 right-0 -left-[100vw] z-10 h-[16.5rem]"
            >
              {STRING_GAUGES.map((gauge, stringIndex) => {
                const isMuted = strings[stringIndex].fret === 'X';
                const strumDelay = strum
                  ? (TOTAL_STRINGS - 1 - stringIndex) * strum.speed
                  : 0;

                return (
                  <span
                    className="fb-string"
                    data-muted={isMuted || undefined}
                    data-strum={strum && !isMuted ? '' : undefined}
                    data-wound={stringIndex >= WOUND_FROM ? '' : undefined}
                    // A new strum id remounts the string so the animation restarts
                    key={`string-${stringNames[stringIndex]}-${stringIndex}-${strum?.id ?? 0}`}
                    style={
                      {
                        top: `${stringIndex * 2.75 + 1.375}rem`,
                        '--gauge': `${gauge}px`,
                        '--strum-delay': `${strumDelay}ms`,
                      } as React.CSSProperties
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
