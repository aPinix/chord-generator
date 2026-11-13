import { cn } from '@/lib/utils';

interface SegmentedControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  className?: string;
}

/** A single-choice control for a handful of options. */
export function SegmentedControl<T extends string>({
  label,
  value,
  options,
  onChange,
  className,
}: SegmentedControlProps<T>) {
  return (
    <div
      aria-label={label}
      className={cn('inline-flex rounded-full bg-muted p-1', className)}
      role="radiogroup"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: styled radio group
          <button
            aria-checked={isActive}
            className={cn(
              'h-8 min-w-10 flex-1 cursor-pointer rounded-full px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring pointer-coarse:h-10',
              isActive
                ? 'bg-card text-foreground shadow-sm dark:bg-foreground/15'
                : 'text-muted-foreground hover:text-foreground'
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            role="radio"
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
