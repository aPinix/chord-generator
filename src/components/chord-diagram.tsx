'use client';

import { DownloadIcon, RotateCcwIcon, ShareIcon } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type ColorOption,
  ColorPicker,
  TRANSPARENT,
} from '@/components/color-picker';
import { SegmentedControl } from '@/components/segmented-control';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { StringState } from '@/types/chord';
import { STRING_NAMES_LOW_TO_HIGH } from '@/types/chord';
import { AndImage } from './and/and-image';

interface ChordDiagramProps {
  strings: StringState[];
  chordName?: string;
  size?: DiagramSize;
  showControls?: boolean;
  /** When true, renders SVG directly without PNG conversion for faster display */
  static?: boolean;
  /** Whether to show finger numbers on the dots */
  showFingers?: boolean;
  /** Callback when showFingers changes */
  onShowFingersChange?: (value: boolean) => void;
  /** Whether the chord name is printed under the diagram */
  showName?: boolean;
  /** Open-string names, low string first. Defaults to standard tuning */
  stringNames?: readonly string[];
  /** The chord name control, shown as the first export setting */
  nameField?: React.ReactNode;
  /** Static only: line colour instead of the saved one; `currentColor` follows the text */
  color?: string;
  /** Static only: no white card behind the lines */
  bare?: boolean;
  /** Static only: crop to part of the drawing, in its 140 × 160 units */
  viewBox?: string;
}

const NAME_LETTER_SPACING = 1.5;

/** White behind dark lines, charcoal behind light ones. */
function contrastBacking(hex: string): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return '#ffffff';
  const value = Number.parseInt(match[1], 16);
  const [r, g, b] = [value >> 16, (value >> 8) & 255, value & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  // The point where #333 starts to contrast better than white
  return luminance > 0.25 ? '#333333' : '#ffffff';
}

const DEFAULT_FILL_COLOR = '#545d6a';
// Exports have no background unless one is picked
const DEFAULT_BACKGROUND_COLOR = TRANSPARENT;

// A new key: the old one stored white for everyone, picked or not
const BACKGROUND_STORAGE_KEY = 'chord-diagram-background';

const LINE_COLORS: readonly ColorOption[] = [
  { value: '#545d6a', name: 'Slate' },
  { value: '#111111', name: 'Black' },
  { value: '#ffffff', name: 'White' },
  { value: '#1e3a8a', name: 'Navy' },
  { value: '#14532d', name: 'Forest' },
  { value: '#7c2d12', name: 'Rust' },
  { value: '#e11d48', name: 'Rose' },
  { value: '#7c3aed', name: 'Violet' },
  { value: '#0e7490', name: 'Teal' },
];

const BACKGROUND_COLORS: readonly ColorOption[] = [
  { value: '#ffffff', name: 'White' },
  { value: '#f5f0e6', name: 'Paper' },
  { value: '#eef1ef', name: 'Mist' },
  { value: '#c3e5d7', name: 'Surf green' },
  { value: '#fde68a', name: 'Butter' },
  { value: '#fecdd3', name: 'Blush' },
  { value: '#e11d48', name: 'Rose' },
  { value: '#111111', name: 'Black' },
  { value: '#1e293b', name: 'Night' },
];

/** Older saves kept 8-digit hex with alpha; keep just the colour */
const toHex6 = (color: string) =>
  /^#[0-9a-f]{8}$/i.test(color) ? color.slice(0, 7) : color;

type DownloadFormat = 'png' | 'jpg' | 'svg';
type DiagramSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// SVG is always rendered at base size for consistent quality
const BASE_WIDTH = 140;
const BASE_HEIGHT = 160;

// Preview/export sizes - these scale the output, not the SVG internals
const SIZE_SCALES: Record<DiagramSize, number> = {
  xs: 0.5,
  sm: 0.7,
  md: 1,
  lg: 1.3,
  xl: 1.5,
};

const SIZE_OPTIONS = (Object.keys(SIZE_SCALES) as DiagramSize[]).map(
  (value) => ({ value, label: value.toUpperCase() })
);

const FORMAT_OPTIONS = (['png', 'jpg', 'svg'] as DownloadFormat[]).map(
  (value) => ({ value, label: value.toUpperCase() })
);

export const ChordDiagram = forwardRef<SVGSVGElement, ChordDiagramProps>(
  function ChordDiagram(
    {
      strings,
      chordName = '',
      size,
      showControls = true,
      static: isStatic = false,
      showFingers: showFingersProp,
      onShowFingersChange,
      nameField,
      stringNames = STRING_NAMES_LOW_TO_HIGH,
      showName = true,
      color,
      bare = false,
      viewBox: viewBoxProp,
    },
    ref
  ) {
    const internalRef = useRef<SVGSVGElement>(null);
    const svgRef = (ref as React.RefObject<SVGSVGElement>) || internalRef;
    const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('png');
    const [diagramSize, setDiagramSize] = useState<DiagramSize>('md');
    const titleId = useId();
    // Static tiles render their draggable PNG lazily, on first hover or touch
    const [isArmed, setIsArmed] = useState(false);
    const [showFingersInternal, setShowFingersInternal] = useState(false);
    const [diagramColor, setDiagramColor] =
      useState<string>(DEFAULT_FILL_COLOR);
    const [backgroundColor, setBackgroundColor] = useState<string>(
      DEFAULT_BACKGROUND_COLOR
    );

    // Use controlled or uncontrolled showFingers
    const showFingers = showFingersProp ?? showFingersInternal;
    const setShowFingers = (value: boolean) => {
      setShowFingersInternal(value);
      onShowFingersChange?.(value);
      if (typeof window !== 'undefined') {
        localStorage.setItem('chord-diagram-fingers', String(value));
      }
      // Dispatch custom event for same-window sync
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('chord-fingers-change', { detail: value })
        );
      }
    };

    // Reset colors to defaults
    const resetColors = () => {
      setDiagramColor(DEFAULT_FILL_COLOR);
      setBackgroundColor(DEFAULT_BACKGROUND_COLOR);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chord-diagram-diagram-color');
        localStorage.removeItem(BACKGROUND_STORAGE_KEY);
      }
    };

    // User's preferred drag size (from localStorage) - used for dragged images in static mode
    const [userPreferredSize, setUserPreferredSize] =
      useState<DiagramSize>('md');

    // Sync preferences from localStorage after hydration to avoid SSR mismatch
    useEffect(() => {
      if (typeof window === 'undefined') return;

      const savedFormat = localStorage.getItem('chord-diagram-format');
      if (savedFormat && ['png', 'jpg', 'svg'].includes(savedFormat)) {
        setDownloadFormat(savedFormat as DownloadFormat);
      }
      const savedSize = localStorage.getItem('chord-diagram-size');
      if (savedSize && ['xs', 'sm', 'md', 'lg', 'xl'].includes(savedSize)) {
        setUserPreferredSize(savedSize as DiagramSize);
        if (!size) {
          setDiagramSize(savedSize as DiagramSize);
        }
      }
      const savedFingers = localStorage.getItem('chord-diagram-fingers');
      if (savedFingers !== null) {
        const value = savedFingers === 'true';
        setShowFingersInternal(value);
        onShowFingersChange?.(value);
      }

      // Load saved colors
      const savedDiagramColor = localStorage.getItem(
        'chord-diagram-diagram-color'
      );
      if (savedDiagramColor) {
        setDiagramColor(toHex6(savedDiagramColor));
      }
      const savedBackgroundColor = localStorage.getItem(BACKGROUND_STORAGE_KEY);
      if (savedBackgroundColor) {
        setBackgroundColor(toHex6(savedBackgroundColor));
      }

      // Listen for finger toggle changes from other instances
      const handleFingersChange = (e: CustomEvent<boolean>) => {
        setShowFingersInternal(e.detail);
        onShowFingersChange?.(e.detail);
      };
      window.addEventListener(
        'chord-fingers-change',
        handleFingersChange as EventListener
      );
      return () => {
        window.removeEventListener(
          'chord-fingers-change',
          handleFingersChange as EventListener
        );
      };
    }, [size, onShowFingersChange]);
    const [pngDataUrl, setPngDataUrl] = useState<string | null>(null);
    const [xlPngDataUrl, setXlPngDataUrl] = useState<string | null>(null);

    // Separate useEffect for localStorage persistence to avoid dependency issues
    useEffect(() => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('chord-diagram-format', downloadFormat);
    }, [downloadFormat]);

    useEffect(() => {
      if (typeof window === 'undefined' || size) return;
      localStorage.setItem('chord-diagram-size', diagramSize);
    }, [diagramSize, size]);

    // Persist colors to localStorage
    useEffect(() => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('chord-diagram-diagram-color', diagramColor);
    }, [diagramColor]);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundColor);
    }, [backgroundColor]);

    const hasBackground = backgroundColor !== TRANSPARENT;
    // Nothing to reset when both colours are already the defaults
    const isDefaultColors =
      diagramColor.toLowerCase() === DEFAULT_FILL_COLOR &&
      backgroundColor === DEFAULT_BACKGROUND_COLOR;
    // JPG cannot be transparent, so it falls back to white
    const exportBackground = hasBackground
      ? backgroundColor
      : downloadFormat === 'jpg'
        ? '#ffffff'
        : null;

    // Use prop size if provided (for fixed size previews), otherwise use internal state
    const effectiveSize = size || diagramSize;

    // For static mode, use user's preferred size for dragged images
    const dragSize = isStatic ? userPreferredSize : effectiveSize;
    const dragScale = SIZE_SCALES[dragSize];

    // SVG always renders at base size
    const svgWidth = BASE_WIDTH;
    const svgHeight = BASE_HEIGHT;

    // Preview/export dimensions (for drag) - use user's preferred size in static mode
    const outputWidth = Math.round(BASE_WIDTH * dragScale);
    const outputHeight = Math.round(BASE_HEIGHT * dragScale);

    // XL dimensions for high-quality display
    const xlScale = SIZE_SCALES.xl;
    const xlWidth = Math.round(BASE_WIDTH * xlScale);
    const xlHeight = Math.round(BASE_HEIGHT * xlScale);

    const diagramData = useMemo(() => {
      // Always use base dimensions for SVG rendering
      const padding = 28; // Side padding (extra space for barre/dots and fret numbers)
      const topMargin = 24; // Space for X/O markers + top spacing
      const bottomMargin = 44; // Space for string names + chord name + bottom spacing
      const diagramWidth = svgWidth - padding * 2;
      const diagramHeight = svgHeight - topMargin - bottomMargin;
      const stringSpacing = diagramWidth / 5;
      const fretSpacing = diagramHeight / 5;
      const startX = padding;
      const startY = topMargin;
      const dotRadius = 7;

      const reversedStrings = [...strings].reverse();

      const frettedNotes = reversedStrings
        .map((s) => s.fret)
        .filter((f): f is number => typeof f === 'number' && f > 0);
      const minFret = frettedNotes.length > 0 ? Math.min(...frettedNotes) : 1;
      const maxFret = frettedNotes.length > 0 ? Math.max(...frettedNotes) : 5;
      const startFret = maxFret <= 5 ? 1 : Math.max(1, minFret);

      // Calculate barres
      const fingerPositions: Map<
        number,
        { fret: number; strings: number[] }[]
      > = new Map();
      for (let i = 0; i < 6; i++) {
        const stringState = reversedStrings[i];
        if (
          typeof stringState.fret === 'number' &&
          stringState.fret > 0 &&
          stringState.finger
        ) {
          const finger = stringState.finger;
          const fret = stringState.fret;
          if (!fingerPositions.has(finger)) {
            fingerPositions.set(finger, []);
          }
          const positions = fingerPositions.get(finger)!;
          const existing = positions.find((p) => p.fret === fret);
          if (existing) {
            existing.strings.push(i);
          } else {
            positions.push({ fret, strings: [i] });
          }
        }
      }

      const barres: {
        finger: number;
        fret: number;
        startString: number;
        endString: number;
      }[] = [];
      fingerPositions.forEach((positions, finger) => {
        for (const pos of positions) {
          if (pos.strings.length >= 2) {
            let minString = Math.min(...pos.strings);
            let maxString = Math.max(...pos.strings);

            // Extend barre through strings that have any fretted position
            // Check strings below minString (towards low E)
            for (let s = minString - 1; s >= 0; s--) {
              const ss = reversedStrings[s];
              if (typeof ss.fret === 'number' && ss.fret > 0) {
                minString = s;
              } else {
                break; // Stop extending if string is open or muted
              }
            }
            // Check strings above maxString (towards high E)
            for (let s = maxString + 1; s < 6; s++) {
              const ss = reversedStrings[s];
              if (typeof ss.fret === 'number' && ss.fret > 0) {
                maxString = s;
              } else {
                break; // Stop extending if string is open or muted
              }
            }

            barres.push({
              finger,
              fret: pos.fret,
              startString: minString,
              endString: maxString,
            });
          }
        }
      });

      const barreStrings = new Set<string>();
      for (const barre of barres) {
        for (let s = barre.startString; s <= barre.endString; s++) {
          barreStrings.add(`${barre.fret}-${s}`);
        }
      }

      return {
        padding,
        diagramWidth,
        diagramHeight,
        stringSpacing,
        fretSpacing,
        startX,
        startY,
        dotRadius,
        reversedStrings,
        startFret,
        barres,
        barreStrings,
      };
    }, [strings, svgWidth, svgHeight]);

    const {
      diagramWidth,
      diagramHeight,
      stringSpacing,
      fretSpacing,
      startX,
      startY,
      dotRadius,
      reversedStrings,
      startFret,
      barres,
      barreStrings,
    } = diagramData;

    const getSvgString = useCallback(() => {
      const svg = svgRef.current;
      if (!svg) return '';
      const serializer = new XMLSerializer();
      return serializer.serializeToString(svg);
    }, [svgRef]);

    // Generate PNG previews from SVG - XL for display (non-static), selected size for drag (always)
    // Note: chordName, diagramData, showFingers, diagramColor are trigger dependencies -
    // they affect the SVG content which is serialized from svgRef.current
    // biome-ignore lint/correctness/useExhaustiveDependencies: these deps trigger re-render when SVG content changes
    useEffect(() => {
      // A tile's image is only needed once someone reaches for it
      if (isStatic && !isArmed) return;

      const svg = svgRef.current;
      if (!svg) return;

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svg);
      const dpr = window.devicePixelRatio || 1;

      // Generate selected-size PNG for drag (always needed for dragging)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = outputWidth * dpr;
      canvas.height = outputHeight * dpr;
      ctx.scale(dpr, dpr);

      const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        // The SVG already carries the background; JPG also needs a fill
        // where the background is transparent
        if (exportBackground) {
          ctx.fillStyle = exportBackground;
          ctx.fillRect(0, 0, outputWidth, outputHeight);
        }
        ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
        setPngDataUrl(
          downloadFormat === 'jpg'
            ? canvas.toDataURL('image/jpeg', 0.95)
            : canvas.toDataURL('image/png')
        );

        // Only generate XL for display in non-static mode
        if (!isStatic) {
          const xlCanvas = document.createElement('canvas');
          const xlCtx = xlCanvas.getContext('2d');
          if (xlCtx) {
            xlCanvas.width = xlWidth * dpr;
            xlCanvas.height = xlHeight * dpr;
            xlCtx.scale(dpr, dpr);
            if (exportBackground) {
              xlCtx.fillStyle = exportBackground;
              xlCtx.fillRect(0, 0, xlWidth, xlHeight);
            }
            xlCtx.drawImage(img, 0, 0, xlWidth, xlHeight);
            setXlPngDataUrl(
              downloadFormat === 'jpg'
                ? xlCanvas.toDataURL('image/jpeg', 0.95)
                : xlCanvas.toDataURL('image/png')
            );
          }
        }

        URL.revokeObjectURL(url);
      };

      img.src = url;
    }, [
      svgRef,
      outputWidth,
      outputHeight,
      xlWidth,
      xlHeight,
      chordName,
      stringNames,
      diagramData,
      showFingers,
      isStatic,
      isArmed,
      showName,
      downloadFormat,
      diagramColor,
      backgroundColor,
      exportBackground,
    ]);

    const downloadImage = useCallback(() => {
      const fileName = chordName
        ? `${chordName.replace(/[^a-zA-Z0-9]/g, '-')}-${effectiveSize}`
        : `chord-${effectiveSize}`;

      if (downloadFormat === 'svg') {
        const svgString = getSvgString();
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${fileName}.svg`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // Convert SVG to PNG/JPG via canvas
        const svgString = getSvgString();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        canvas.width = outputWidth * dpr;
        canvas.height = outputHeight * dpr;
        ctx.scale(dpr, dpr);

        const img = new Image();
        const svgBlob = new Blob([svgString], {
          type: 'image/svg+xml;charset=utf-8',
        });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          if (exportBackground) {
            ctx.fillStyle = exportBackground;
            ctx.fillRect(0, 0, outputWidth, outputHeight);
          }
          ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
          URL.revokeObjectURL(url);

          const mimeType =
            downloadFormat === 'jpg' ? 'image/jpeg' : 'image/png';
          const dataUrl = canvas.toDataURL(mimeType, 0.95);
          const link = document.createElement('a');
          link.download = `${fileName}.${downloadFormat}`;
          link.href = dataUrl;
          link.click();
        };

        img.src = url;
      }
    }, [
      chordName,
      effectiveSize,
      downloadFormat,
      getSvgString,
      outputWidth,
      outputHeight,
      exportBackground,
    ]);

    // Sharing a file opens the phone's share sheet: save to photos, copy, send
    const [canShare, setCanShare] = useState(false);
    useEffect(() => {
      try {
        const probe = new File([''], 'chord.png', { type: 'image/png' });
        setCanShare(
          typeof navigator.share === 'function' &&
            Boolean(navigator.canShare?.({ files: [probe] }))
        );
      } catch {
        setCanShare(false);
      }
    }, []);

    const shareImage = useCallback(async () => {
      if (!pngDataUrl) return;

      // Built from the already-rendered preview, with no awaiting, so the
      // share sheet opens within the tap. SVG is shared as PNG.
      const [header, base64] = pngDataUrl.split(',');
      const isJpeg = header.includes('image/jpeg');
      const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
      const baseName = chordName
        ? chordName.replace(/[^a-zA-Z0-9]/g, '-')
        : 'chord';
      const file = new File(
        [bytes],
        `${baseName}-${effectiveSize}.${isJpeg ? 'jpg' : 'png'}`,
        { type: isJpeg ? 'image/jpeg' : 'image/png' }
      );

      try {
        await navigator.share({
          files: [file],
          title: chordName ? `${chordName} chord` : 'Chord diagram',
        });
      } catch (error) {
        // Closing the share sheet is not an error
        if ((error as DOMException).name !== 'AbortError') {
          console.warn('Sharing the diagram failed', error);
        }
      }
    }, [pngDataUrl, chordName, effectiveSize]);

    // Lines and dots; a static tile may ask for its own colour
    const ink = (isStatic && color) || diagramColor;
    // A cropped tile keeps the crop's proportions
    const [, , cropWidth, cropHeight] = (viewBoxProp ?? '')
      .split(' ')
      .map(Number);

    const svgElement = (
      <svg
        aria-labelledby={titleId}
        className={
          isStatic
            ? cn('h-auto w-full', !bare && 'rounded-lg bg-white')
            : 'absolute -left-[9999px]'
        }
        height={isStatic && cropHeight ? cropHeight : svgHeight}
        ref={svgRef}
        role="img"
        style={isStatic && !viewBoxProp ? { maxWidth: xlWidth } : undefined}
        viewBox={
          isStatic ? (viewBoxProp ?? `0 0 ${svgWidth} ${svgHeight}`) : undefined
        }
        width={isStatic && cropWidth ? cropWidth : svgWidth}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title id={titleId}>
          {chordName ? `${chordName} chord diagram` : 'Chord diagram'}
        </title>
        {/* The picked background is part of every export, SVG included */}
        {!isStatic && hasBackground && (
          <rect fill={backgroundColor} height={svgHeight} width={svgWidth} />
        )}

        {/* String labels (X/O) - close to nut */}
        {reversedStrings.map((stringState, i) => {
          const x = startX + i * stringSpacing;
          if (stringState.fret === 'X') {
            return (
              <text
                fill={ink}
                fontFamily="system-ui, sans-serif"
                fontSize={16}
                // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
                key={`label-${i}`}
                textAnchor="middle"
                x={x}
                y={startY - 4}
              >
                ✕
              </text>
            );
          } else if (stringState.fret === 0) {
            return (
              <text
                fill={ink}
                fontFamily="system-ui, sans-serif"
                fontSize={16}
                // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
                key={`label-${i}`}
                textAnchor="middle"
                x={x}
                y={startY - 4}
              >
                ○
              </text>
            );
          }
          return null;
        })}

        {/* Nut or fret number */}
        {startFret === 1 ? (
          <line
            stroke={ink}
            strokeWidth={3}
            x1={startX}
            x2={startX + diagramWidth}
            y1={startY}
            y2={startY}
          />
        ) : (
          <>
            <line
              stroke={ink}
              strokeWidth={1}
              x1={startX}
              x2={startX + diagramWidth}
              y1={startY}
              y2={startY}
            />
            <text
              fill={ink}
              fontFamily="system-ui, sans-serif"
              fontSize={11}
              textAnchor="end"
              x={startX - 8}
              y={startY + fretSpacing / 2 + 4}
            >
              {startFret}
            </text>
          </>
        )}

        {/* Frets */}
        {[1, 2, 3, 4, 5].map((i) => (
          <line
            key={`fret-${i}`}
            stroke={ink}
            strokeWidth={1}
            x1={startX}
            x2={startX + diagramWidth}
            y1={startY + i * fretSpacing}
            y2={startY + i * fretSpacing}
          />
        ))}

        {/* Strings */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <line
            key={`string-${i}`}
            stroke={ink}
            strokeWidth={1.5}
            x1={startX + i * stringSpacing}
            x2={startX + i * stringSpacing}
            y1={startY}
            y2={startY + diagramHeight}
          />
        ))}

        {/* Barres */}
        {barres.map((barre, idx) => {
          const relativeFret = barre.fret - startFret + 1;
          const y = startY + (relativeFret - 0.5) * fretSpacing;
          const x1 = startX + barre.startString * stringSpacing;
          const x2 = startX + barre.endString * stringSpacing;
          const barreHeight = dotRadius * 1.6;
          return (
            <rect
              fill={ink}
              height={barreHeight}
              // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
              key={`barre-${idx}`}
              rx={barreHeight / 2}
              width={x2 - x1 + dotRadius * 2}
              x={x1 - dotRadius}
              y={y - barreHeight / 2}
            />
          );
        })}

        {/* Finger dots */}
        {reversedStrings.map((stringState, i) => {
          if (typeof stringState.fret !== 'number' || stringState.fret <= 0) {
            return null;
          }
          const x = startX + i * stringSpacing;
          const relativeFret = stringState.fret - startFret + 1;
          const y = startY + (relativeFret - 0.5) * fretSpacing;
          const isInBarre = barreStrings.has(`${stringState.fret}-${i}`);

          const barre = barres.find(
            (b) =>
              b.fret === stringState.fret && b.finger === stringState.finger
          );
          const shouldShowFinger =
            showFingers &&
            stringState.finger &&
            (!barre || i === barre.startString);

          // Center finger number on barre
          const fingerX = barre
            ? startX +
              ((barre.startString + barre.endString) / 2) * stringSpacing
            : x;

          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
            <g key={`dot-${i}`}>
              {!isInBarre && <circle cx={x} cy={y} fill={ink} r={dotRadius} />}
              {shouldShowFinger && (
                <text
                  fill="white"
                  fontFamily="system-ui, sans-serif"
                  fontSize={12}
                  fontWeight="bold"
                  textAnchor="middle"
                  x={fingerX}
                  y={y + 4}
                >
                  {stringState.finger}
                </text>
              )}
            </g>
          );
        })}

        {/* String names - close to fretboard */}
        {stringNames.map((name, i) => (
          <text
            fill={ink}
            fontFamily="system-ui, sans-serif"
            fontSize={stringNames.some((n) => n.length > 1) ? 10.5 : 14}
            fontWeight="semibold"
            // biome-ignore lint/suspicious/noArrayIndexKey: Static array with unique positions
            key={`name-${i}`}
            textAnchor="middle"
            x={startX + i * stringSpacing}
            y={startY + diagramHeight + 14}
          >
            {name}
          </text>
        ))}

        {/* Chord name at bottom */}
        {chordName && showName && (
          <text
            fill={ink}
            fontFamily="system-ui, sans-serif"
            fontSize={16}
            fontWeight="bold"
            // A little air between letters keeps names like "Cmaj7" legible
            letterSpacing={NAME_LETTER_SPACING}
            textAnchor="middle"
            // Spacing trails the last letter too, so nudge it back to centre
            x={svgWidth / 2 + NAME_LETTER_SPACING / 2}
            y={svgHeight - 8}
          >
            {chordName}
          </text>
        )}
      </svg>
    );

    const altText = chordName ? `${chordName} chord diagram` : 'Chord diagram';

    // Library tiles and search results: just the diagram, draggable as an image
    if (isStatic) {
      return (
        // biome-ignore lint/a11y/noStaticElementInteractions: only prepares the draggable image
        <div
          className="relative flex h-full w-full flex-col items-center"
          onPointerEnter={() => setIsArmed(true)}
        >
          {svgElement}
          {pngDataUrl && (
            <AndImage
              alt={altText}
              className="absolute inset-0 h-full w-full rounded-lg opacity-0"
              draggable
              height={outputHeight}
              src={pngDataUrl}
              width={outputWidth}
            />
          )}
        </div>
      );
    }

    return (
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-12">
        {svgElement}

        {/* Preview at the size it will be exported */}
        <div className="preview-mat relative flex min-h-80 flex-col items-center justify-center rounded-3xl px-6 pt-8 pb-14">
          {xlPngDataUrl && (
            <div
              className="relative overflow-hidden rounded-md shadow-[0_1px_2px_rgb(16_37_30/20%),0_12px_24px_-10px_rgb(16_37_30/35%)] transition-[width,height] duration-200 ease-out"
              style={{
                width: outputWidth,
                height: outputHeight,
                // A see-through image sits on whichever plain backing keeps
                // the lines readable. It is not part of the export.
                backgroundColor:
                  exportBackground ?? contrastBacking(diagramColor),
              }}
            >
              <AndImage
                alt={altText}
                className="h-full w-full"
                draggable={false}
                height={xlHeight}
                src={xlPngDataUrl}
                width={xlWidth}
              />
              {/* Export-size copy on top, so dragging it out gives the real file */}
              {pngDataUrl && (
                <AndImage
                  alt=""
                  className="absolute inset-0 h-full w-full cursor-grab opacity-0 active:cursor-grabbing"
                  draggable
                  height={outputHeight}
                  src={pngDataUrl}
                  width={outputWidth}
                />
              )}
            </div>
          )}
          <p className="absolute inset-x-6 bottom-5 text-center text-sm text-muted-foreground">
            <span className="pointer-coarse:hidden">
              Drag it into any folder or document
            </span>
            <span className="hidden pointer-coarse:inline">
              Press and hold to save or share
            </span>
          </p>
        </div>

        {/* Export settings */}
        {showControls && (
          <div className="flex flex-col">
            <dl className="divide-y divide-border border-y border-border">
              {nameField && <Setting label="Name">{nameField}</Setting>}

              <Setting
                hint={`${outputWidth} × ${outputHeight} px`}
                label="Size"
              >
                <SegmentedControl
                  className="w-full"
                  label="Size"
                  onChange={setDiagramSize}
                  options={SIZE_OPTIONS}
                  value={effectiveSize}
                />
              </Setting>

              <Setting label="Format">
                <SegmentedControl
                  className="w-full"
                  label="Format"
                  onChange={setDownloadFormat}
                  options={FORMAT_OPTIONS}
                  value={downloadFormat}
                />
              </Setting>

              <Setting inline label="Finger numbers">
                <Switch
                  aria-label="Show finger numbers on the diagram"
                  checked={showFingers}
                  onCheckedChange={setShowFingers}
                />
              </Setting>

              <Setting
                hint={
                  !hasBackground && downloadFormat === 'jpg'
                    ? 'JPG has no transparency: white'
                    : undefined
                }
                label="Colors"
              >
                <div className="flex w-full items-center gap-2">
                  <ColorPicker
                    label="Lines"
                    onChange={setDiagramColor}
                    options={LINE_COLORS}
                    value={diagramColor}
                  />
                  <ColorPicker
                    allowTransparent
                    label="Background"
                    onChange={setBackgroundColor}
                    options={BACKGROUND_COLORS}
                    value={backgroundColor}
                  />
                  <button
                    aria-label="Reset colors"
                    className="ml-auto flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full ring-1 ring-border transition-colors outline-none ring-inset hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-97 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:active:scale-100 pointer-coarse:size-11"
                    disabled={isDefaultColors}
                    onClick={resetColors}
                    title="Reset colors"
                    type="button"
                  >
                    <RotateCcwIcon className="size-4" />
                  </button>
                </div>
              </Setting>
            </dl>

            <div className="mt-6 flex gap-3">
              <button
                className="flex h-12 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-primary text-base font-semibold text-primary-foreground transition-[background-color,transform] outline-none hover:bg-[color-mix(in_srgb,var(--primary),black_10%)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-98"
                onClick={downloadImage}
                type="button"
              >
                <DownloadIcon className="size-5" strokeWidth={2} />
                Download {downloadFormat.toUpperCase()}
              </button>
              {canShare && (
                <button
                  className="hidden h-12 cursor-pointer items-center justify-center gap-2 rounded-full px-6 text-base font-semibold ring-1 ring-border transition-colors outline-none ring-inset hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring active:scale-98 pointer-coarse:flex"
                  onClick={shareImage}
                  type="button"
                >
                  <ShareIcon className="size-5" strokeWidth={2} />
                  Share
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
);

interface SettingProps {
  label: string;
  hint?: string;
  /** Keep the label and control on one line, even on a phone */
  inline?: boolean;
  children: React.ReactNode;
}

function Setting({ label, hint, inline = false, children }: SettingProps) {
  return (
    <div
      className={cn(
        'py-3.5 sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:items-center sm:gap-x-4',
        // On a phone the control sits under its label and spans the width
        inline
          ? 'flex items-center justify-between gap-4'
          : 'flex flex-col gap-2'
      )}
    >
      <dt className="flex items-baseline justify-between gap-3 text-sm font-medium sm:block">
        {label}
        {hint && (
          <span className="text-xs font-normal text-muted-foreground tabular-nums sm:block">
            {hint}
          </span>
        )}
      </dt>
      <dd className="flex min-w-0 items-center sm:justify-end">{children}</dd>
    </div>
  );
}
