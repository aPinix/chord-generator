'use client';

import type { LucideIcon } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface HoldToConfirmButtonProps {
  /** What the button does, e.g. "Hold to clear" */
  children: React.ReactNode;
  icon?: LucideIcon;
  /** Runs once the button has been held for the whole duration */
  onConfirm: () => void;
  /** How long to hold, in milliseconds */
  duration?: number;
  /** Read by screen readers, which announce the hold */
  label: string;
  className?: string;
  /** Classes for the coloured layer that fills while holding */
  fillClassName?: string;
}

/**
 * A destructive action that needs a deliberate press and hold.
 *
 * Two copies of the content sit on top of each other. The top copy is
 * coloured and clipped away to nothing; holding unclips it left to right
 * over `duration`, and letting go snaps it back quickly. The action runs
 * when the fill reaches the end. Works with mouse, touch, Space and Enter.
 */
export function HoldToConfirmButton({
  children,
  icon: Icon,
  onConfirm,
  duration = 1200,
  label,
  className,
  fillClassName,
}: HoldToConfirmButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setIsHolding(false);
  }, []);

  const start = useCallback(() => {
    if (timer.current) return;
    setIsHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setIsHolding(false);
      navigator.vibrate?.(30);
      onConfirm();
    }, duration);
  }, [duration, onConfirm]);

  useEffect(() => cancel, [cancel]);

  const content = (
    <>
      {Icon && <Icon className="size-4 shrink-0" />}
      {children}
    </>
  );

  return (
    <button
      aria-label={label}
      className={cn(
        'relative isolate flex shrink-0 cursor-pointer touch-none items-center gap-2 overflow-hidden rounded-full outline-none select-none [-webkit-touch-callout:none] focus-visible:ring-2',
        className
      )}
      onBlur={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) {
          e.preventDefault();
          start();
        } else if (e.key === 'Escape') {
          cancel();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') cancel();
      }}
      onPointerCancel={cancel}
      onPointerDown={(e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        start();
      }}
      onPointerLeave={cancel}
      onPointerUp={cancel}
      type="button"
    >
      {content}
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 flex items-center gap-2',
          fillClassName
        )}
        style={{
          // Same padding as the button, so both labels line up exactly
          padding: 'inherit',
          clipPath: isHolding ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
          // Fill slowly and evenly; empty fast so letting go feels immediate
          transition: isHolding
            ? `clip-path ${duration}ms linear`
            : 'clip-path 200ms ease-out',
        }}
      >
        {content}
      </span>
    </button>
  );
}
