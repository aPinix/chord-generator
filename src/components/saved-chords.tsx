'use client';

import { PlusIcon, Trash2Icon, XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SavedChord } from '@/types/chord';
import { HoldToConfirmButton } from './hold-to-confirm-button';

/** Saved chords beyond this one have no number key */
export const SAVED_CHORD_HOTKEYS = 9;

interface SavedChordsProps {
  chords: SavedChord[];
  /** The saved chord currently on the fretboard, if any */
  activeId: string | null;
  /** What the chord on the fretboard would be saved as */
  currentName: string;
  onSave: () => void;
  onSelect: (chord: SavedChord) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  className?: string;
}

/** A strip of chords to switch between, by tap or with the number keys. */
export function SavedChords({
  chords,
  activeId,
  currentName,
  onSave,
  onSelect,
  onRemove,
  onClear,
  className,
}: SavedChordsProps) {
  return (
    <section aria-label="Saved chords" className={className}>
      <div className="fb-scroll -mx-4 flex items-center gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:flex-wrap sm:px-1">
        {chords.map((chord, index) => {
          const isActive = chord.id === activeId;
          const hotkey = index < SAVED_CHORD_HOTKEYS ? index + 1 : null;

          return (
            <div
              className={cn(
                'flex h-10 shrink-0 items-center rounded-full ring-1 transition-colors pointer-coarse:h-11',
                isActive
                  ? 'bg-stage-foreground text-stage ring-stage-foreground'
                  : 'ring-stage-edge hover:bg-stage-raised/60'
              )}
              key={chord.id}
            >
              <button
                aria-label={
                  hotkey
                    ? `${chord.name}, saved chord ${hotkey}`
                    : `${chord.name}, saved chord`
                }
                aria-pressed={isActive}
                className="flex h-full cursor-pointer items-center gap-2 rounded-l-full pr-1 pl-1.5 outline-none focus-visible:ring-2 focus-visible:ring-stage-foreground"
                onClick={() => onSelect(chord)}
                type="button"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex size-7 items-center justify-center rounded-full text-xs font-semibold tabular-nums',
                    isActive
                      ? 'bg-stage/15 text-stage'
                      : 'bg-stage-raised/70 text-stage-muted'
                  )}
                >
                  {hotkey ?? '·'}
                </span>
                <span className="font-display text-base font-semibold">
                  {chord.name}
                </span>
              </button>
              <button
                aria-label={`Remove ${chord.name} from saved chords`}
                className={cn(
                  'flex h-full w-9 cursor-pointer items-center justify-center rounded-r-full outline-none focus-visible:ring-2 focus-visible:ring-stage-foreground',
                  isActive
                    ? 'text-stage/70 hover:text-stage'
                    : 'text-stage-muted hover:text-stage-foreground'
                )}
                onClick={() => onRemove(chord.id)}
                type="button"
              >
                <XIcon className="size-3.5" strokeWidth={2.5} />
              </button>
            </div>
          );
        })}

        <button
          className="flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border border-dashed border-stage-muted/60 pr-4 pl-3 text-sm font-medium transition-colors outline-none hover:border-stage-foreground hover:bg-stage-raised/60 focus-visible:ring-2 focus-visible:ring-stage-foreground disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-stage-muted/60 disabled:hover:bg-transparent pointer-coarse:h-11"
          disabled={activeId !== null}
          onClick={onSave}
          type="button"
        >
          <PlusIcon className="size-4" strokeWidth={2} />
          {activeId !== null ? 'Saved' : `Save ${currentName}`}
        </button>

        {chords.length > 0 && (
          <HoldToConfirmButton
            className="h-10 pr-4 pl-3 text-sm font-medium text-stage-muted transition-colors hover:text-stage-foreground focus-visible:ring-stage-foreground sm:ml-auto pointer-coarse:h-11"
            fillClassName="bg-primary text-primary-foreground"
            icon={Trash2Icon}
            label={`Clear all ${chords.length} saved chords. Press and hold to confirm.`}
            onConfirm={onClear}
          >
            Hold to clear
          </HoldToConfirmButton>
        )}

        {chords.length === 0 && (
          <p className="shrink-0 text-sm text-stage-muted">
            <span className="pointer-coarse:hidden">
              Save chords, then switch between them with keys 1 to 9.
            </span>
            <span className="hidden pointer-coarse:inline">
              Save chords, then tap to switch between them.
            </span>
          </p>
        )}
      </div>
    </section>
  );
}
