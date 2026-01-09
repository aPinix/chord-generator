import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import { isValidElement } from 'react';

import { cn } from '@/lib/utils';

const SKELETON_CLASS_TEXT = cn(
  '**:letter-spacing-[-0.1rem] pointer-events-none animate-pulse select-none font-normal! font-skeleton! text-(--skeleton-foreground)! **:text-[currentColor]'
);
const SKELETON_CLASS_BLOCK = cn(
  'relative border-0! bg-(--skeleton-background) after:absolute after:inset-0 after:rounded-[inherit] after:bg-inherit after:content-[""]'
);

interface AndSkeletonBlockProps extends HTMLAttributes<HTMLDivElement> {
  enabled?: boolean;
  className?: string;
  children?: ReactNode;
}

export const AndSkeletonBlock = ({
  enabled,
  className,
  children,
  ...props
}: AndSkeletonBlockProps) => {
  if (!enabled) return children;

  const { className: childClassName, style: childStyle } =
    getElementProps(children);

  return (
    <div
      className={cn(
        'pointer-events-none',
        skeletonClass(true, SkeletonVariantE.Block),
        childClassName,
        className
      )}
      style={childStyle}
      {...props}
    >
      <div className="pointer-events-none invisible">{children}</div>
    </div>
  );
};

type AndSkeletonTextProps = HTMLAttributes<HTMLDivElement> & {
  enabled?: boolean;
} & (
    | { text: string; chars?: never; words?: never }
    | { text?: never; chars: number; words?: never }
    | { text?: never; chars?: never; words: number }
  );

export const AndSkeletonText = ({
  enabled,
  text,
  chars,
  words,
  className,
  children,
  ...props
}: AndSkeletonTextProps) => {
  if (!enabled) return <>{children}</>;

  const { className: childClassName, style: childStyle } =
    getElementProps(children);
  const skeletonText =
    text ??
    (chars !== undefined
      ? skeletonChars(chars)
      : words !== undefined
        ? skeletonWords(words, true)
        : '');

  return (
    <div
      {...props}
      className={cn(
        skeletonClass(true, SkeletonVariantE.Text),
        childClassName,
        className
      )}
      style={childStyle}
    >
      {skeletonText}
    </div>
  );
};

// types --------------------

export const SkeletonVariantE = {
  Block: 'block',
  Text: 'text',
} as const;
export type SkeletonVariantT =
  (typeof SkeletonVariantE)[keyof typeof SkeletonVariantE];

const SkeletonTypeE = {
  Characters: 'characters',
  Words: 'words',
} as const;
type SkeletonTypeT = (typeof SkeletonTypeE)[keyof typeof SkeletonTypeE];

// utils --------------------

const getElementProps = (
  child: ReactNode
): { className: string; style: CSSProperties } => {
  if (!isValidElement(child)) {
    return { className: '', style: {} };
  }
  const props = child.props as { className?: string; style?: CSSProperties };
  return {
    className: props.className || '',
    style: props.style || {},
  };
};

const LOREM_IPSUM =
  'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum.';
const LOREM_WORDS = LOREM_IPSUM.split(' ');

const getLoremIpsum = (
  count: number,
  type: SkeletonTypeT,
  period: boolean = false
): string => {
  let result: string;

  if (type === SkeletonTypeE.Characters) {
    result = LOREM_IPSUM.slice(0, count);
    if (result.endsWith(' ')) {
      result = `${result.slice(0, -1)}a`;
    }
  } else {
    result = LOREM_WORDS.slice(0, count).join(' ');
  }

  return period && result.length > 0 ? `${result.slice(0, -1)}.` : result;
};

export function skeletonChars(count: number, period: boolean = false): string {
  return getLoremIpsum(count, SkeletonTypeE.Characters, period);
}

export function skeletonWords(count: number, period: boolean = false): string {
  return getLoremIpsum(count, SkeletonTypeE.Words, period);
}

export function skeletonClass(
  enabled: boolean,
  variant: SkeletonVariantT = SkeletonVariantE.Block
): string {
  if (!enabled) return '';

  const variantClass =
    variant === SkeletonVariantE.Text
      ? SKELETON_CLASS_TEXT
      : SKELETON_CLASS_BLOCK;

  return `${variantClass} animate-pulse`;
}
