import React from 'react';
import { cn } from '@/lib/utils';

interface FretboardLegendProps {
  className?: string;
  children: React.ReactNode;
}

export const FretboardLegend = ({
  className,
  children,
}: FretboardLegendProps) => {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-2xl bg-background p-4 dark:bg-zinc-800/40',
        className
      )}
    >
      {children}
    </div>
  );
};

interface FretboardLegendRowProps {
  title: string;
  children: React.ReactNode;
}

export const FretboardLegendRow = ({
  title,
  children,
}: FretboardLegendRowProps) => {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {/* title */}
      <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
        {title}
      </span>

      {/* content */}
      <div className="flex flex-wrap items-center gap-2">
        <FretboardLegendKbdWrapper>{children}</FretboardLegendKbdWrapper>
      </div>
    </div>
  );
};

export const FretboardLegendFingerItemColorE = {
  None: 'none',
  Index: 'index',
  Middle: 'middle',
  Ring: 'ring',
  Pinky: 'pinky',
} as const;
type FretboardLegendFingerItemColorT =
  (typeof FretboardLegendFingerItemColorE)[keyof typeof FretboardLegendFingerItemColorE];

interface FretboardLegendFingerItemProps {
  finger: FretboardLegendFingerItemColorT;
}

export const FretboardLegendFingerItem = ({
  finger,
}: FretboardLegendFingerItemProps) => {
  const getFingerClassName = (finger: FretboardLegendFingerItemColorT) => {
    const defaultColor = 'bg-orange-500';

    switch (finger) {
      case FretboardLegendFingerItemColorE.None:
        return defaultColor;
      case FretboardLegendFingerItemColorE.Index:
        return 'bg-sky-500';
      case FretboardLegendFingerItemColorE.Middle:
        return 'bg-lime-500';
      case FretboardLegendFingerItemColorE.Ring:
        return 'bg-amber-500';
      case FretboardLegendFingerItemColorE.Pinky:
        return 'bg-pink-500';
      default:
        return defaultColor;
    }
  };

  const getFingerLabel = (finger: FretboardLegendFingerItemColorT) => {
    switch (finger) {
      case FretboardLegendFingerItemColorE.None:
        return '•';
      case FretboardLegendFingerItemColorE.Index:
        return '1';
      case FretboardLegendFingerItemColorE.Middle:
        return '2';
      case FretboardLegendFingerItemColorE.Ring:
        return '3';
      case FretboardLegendFingerItemColorE.Pinky:
        return '4';
      default:
        return '-';
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={cn(
          'flex size-5 items-center justify-center rounded-full font-bold text-[10px] text-white shadow-sm',
          getFingerClassName(finger)
        )}
      >
        {getFingerLabel(finger)}
      </div>
      <span className="text-muted-foreground text-xs">{finger}</span>
    </div>
  );
};

interface FretboardLegendKbdWrapperProps {
  children: React.ReactNode;
}

export const FretboardLegendKbdWrapper = ({
  children,
}: FretboardLegendKbdWrapperProps) => {
  const childrenArray = React.Children.toArray(children);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {childrenArray.map((child, index) => (
        <React.Fragment
          key={`child-${index}-${typeof child === 'string' ? child : 'element'}`}
        >
          {child}
          {index < childrenArray.length - 1 && (
            <span className="mx-0.5 text-muted-foreground/50"></span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface FretboardLegendKbdItemProps {
  label: string;
  children: React.ReactNode;
}

export const FretboardLegendKbdItem = ({
  label,
  children,
}: FretboardLegendKbdItemProps) => {
  return (
    <span className="flex items-center gap-1.5 text-muted-foreground">
      <kbd className="rounded-lg bg-muted px-2 py-1 font-mono font-semibold text-xs">
        {children}
      </kbd>
      <span className="text-xs">{label}</span>
    </span>
  );
};
