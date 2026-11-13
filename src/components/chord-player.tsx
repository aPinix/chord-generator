'use client';

import { PlayIcon } from 'lucide-react';

export const STRUM_SPEED = { normal: 50, slow: 200 } as const;

interface ChordPlayerProps {
  /** Called with the milliseconds between strings */
  onStrum: (speed: number) => void;
}

export function ChordPlayer({ onStrum }: ChordPlayerProps) {
  return (
    <>
      <button
        className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-stage-foreground pr-5 pl-4 text-sm font-semibold text-stage transition-transform outline-none focus-visible:ring-2 focus-visible:ring-stage-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-stage active:scale-97 pointer-coarse:h-11"
        onClick={() => onStrum(STRUM_SPEED.normal)}
        type="button"
      >
        <PlayIcon className="size-4 fill-current" strokeWidth={2} />
        Strum
      </button>
      <button
        aria-label="Strum slowly"
        className="h-10 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium text-stage-foreground ring-1 ring-stage-edge transition-colors outline-none hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground active:scale-97 pointer-coarse:h-11"
        onClick={() => onStrum(STRUM_SPEED.slow)}
        type="button"
      >
        <span className="sm:hidden">Slow</span>
        <span className="max-sm:hidden">Strum slowly</span>
      </button>
    </>
  );
}
