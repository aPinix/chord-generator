'use client';

import { useTheme } from 'next-themes';
import { type ImgHTMLAttributes, useCallback, useEffect, useRef } from 'react';
import { APP_NAME } from '@/config/variables.config';
import {
  PlaceholderImageVariantE,
  type PlaceholderImageVariantT,
  placeholderImage,
} from '@/helpers/placeholder';
import { useMounted } from '@/hooks/use-mounted';
import { cn } from '@/lib/utils';
import { ThemeModeE } from '@/types/theme';
import { AndSkeletonBlock } from './and-skeleton';

type AndImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  skeleton?: boolean;
  fallback?: PlaceholderImageVariantT;
} & (
    | {
        src: string;
        srcLight?: never;
        srcDark?: never;
        fallbackLight?: never;
        fallbackDark?: never;
      }
    | {
        src?: never;
        srcLight: string;
        srcDark: string;
        fallbackLight?: PlaceholderImageVariantT;
        fallbackDark?: PlaceholderImageVariantT;
      }
  );

export const AndImage = ({
  src,
  alt,
  className,
  srcLight,
  srcDark,
  skeleton,
  fallback = PlaceholderImageVariantE.ImageBig,
  fallbackLight,
  fallbackDark,
  ...props
}: AndImageProps) => {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const hasError = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Determine effective src
  let finalSrc = src;
  if (!finalSrc && srcLight && srcDark) {
    if (mounted) {
      finalSrc = resolvedTheme === ThemeModeE.Dark ? srcDark : srcLight;
    } else {
      finalSrc = srcLight;
    }
  }

  const isDark = mounted && resolvedTheme === ThemeModeE.Dark;
  const effectiveFallback = isDark
    ? (fallbackDark ?? fallback)
    : (fallbackLight ?? fallback);
  const placeholder = placeholderImage(
    effectiveFallback,
    isDark ? ThemeModeE.Dark : ThemeModeE.Light
  );

  // Update placeholder when theme changes after error
  useEffect(() => {
    if (hasError.current && imgRef.current && mounted) {
      const isDarkTheme = resolvedTheme === ThemeModeE.Dark;
      const effectiveFallback = isDarkTheme
        ? (fallbackDark ?? fallback)
        : (fallbackLight ?? fallback);
      const themePlaceholder = placeholderImage(
        effectiveFallback,
        isDarkTheme ? ThemeModeE.Dark : ThemeModeE.Light
      );
      imgRef.current.src = themePlaceholder;
    }
  }, [resolvedTheme, mounted, fallback, fallbackLight, fallbackDark]);

  const setFallbackImage = useCallback(() => {
    if (!hasError.current && imgRef.current) {
      const currentTheme = mounted && resolvedTheme === ThemeModeE.Dark;
      const effectiveFallback = currentTheme
        ? (fallbackDark ?? fallback)
        : (fallbackLight ?? fallback);
      const fallbackSrc = placeholderImage(
        effectiveFallback,
        currentTheme ? ThemeModeE.Dark : ThemeModeE.Light
      );
      imgRef.current.src = fallbackSrc;
      hasError.current = true;
    }
  }, [mounted, resolvedTheme, fallback, fallbackLight, fallbackDark]);

  const handleError = () => {
    setFallbackImage();
  };

  // Check for broken image on mount (SSR/hydration handling)
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth === 0) {
      setFallbackImage();
    }
  }, [setFallbackImage]);

  return (
    <AndSkeletonBlock enabled={skeleton}>
      {/** biome-ignore lint/performance/noImgElement: <explanation> */}
      <img
        alt={alt ?? `${APP_NAME} Image`}
        className={cn('h-auto w-auto object-cover', className)}
        onError={handleError}
        ref={imgRef}
        src={finalSrc ?? placeholder}
        {...props}
      />
    </AndSkeletonBlock>
  );
};
