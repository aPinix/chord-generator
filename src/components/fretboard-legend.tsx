import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';

const FINGERS = [
  { finger: 1, name: 'Index' },
  { finger: 2, name: 'Middle' },
  { finger: 3, name: 'Ring' },
  { finger: 4, name: 'Pinky' },
  { finger: undefined, name: 'Any finger' },
] as const;

const SHORTCUTS = [
  { keys: 'Space', action: 'Strum' },
  { keys: '1–9', action: 'Saved chords' },
  { keys: '⌘F', action: 'Find a chord' },
  { keys: '⌘K', action: 'Browse' },
  { keys: '⌘Z', action: 'Undo' },
  { keys: '⌘⇧Z', action: 'Redo' },
] as const;

// What each press does on the fretboard
const HINTS = [
  { action: 'a fret', result: 'to add a finger' },
  { action: 'it again', result: 'to choose the finger' },
  { action: 'a circle', result: 'to mute or open a string' },
] as const;

/** "Tap" on touch screens, "Click" with a mouse. */
const Press = () => (
  <>
    <span className="pointer-coarse:hidden">Click</span>
    <span className="hidden pointer-coarse:inline">Tap</span>
  </>
);

interface FretboardLegendProps {
  className?: string;
}

export const FretboardLegend = ({ className }: FretboardLegendProps) => {
  return (
    <div
      className={cn('flex flex-col gap-3 text-sm text-stage-muted', className)}
    >
      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-[0.8125rem]">
        {HINTS.map(({ action, result }) => (
          <li key={result}>
            <span className="font-medium text-stage-foreground">
              <Press /> {action}
            </span>{' '}
            {result}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {FINGERS.map(({ finger, name }) => (
            <li className="flex items-center gap-1.5" key={name}>
              <span
                className="finger-dot flex size-5 items-center justify-center rounded-full text-xs font-bold"
                data-finger={finger}
                data-flat=""
              >
                {finger}
              </span>
              {name}
            </li>
          ))}
        </ul>

        {/* Keyboard shortcuts are no use on a phone */}
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 max-md:hidden pointer-coarse:hidden">
          {SHORTCUTS.map(({ keys, action }) => (
            <li className="flex items-center gap-1.5" key={action}>
              <Kbd className="bg-stage-raised/70 text-stage-foreground">
                {keys}
              </Kbd>
              {action}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
