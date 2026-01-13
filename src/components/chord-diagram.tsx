'use client';

import Color from 'color';
import { Download, Volume2 } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { ButtonColorsSettings } from '@/components/ui/button-colors-settings';
import {
  ButtonGroupSettings,
  ButtonGroupSettingsItem,
} from '@/components/ui/button-group-settings';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GUITAR_TYPES,
  type GuitarType,
  playChord,
  setGuitarType,
} from '@/lib/chord-audio';
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
}

const DEFAULT_FILL_COLOR = '#545D6A';
const DEFAULT_BACKGROUND_COLOR = '#FFFFFF';

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
    },
    ref
  ) {
    const internalRef = useRef<SVGSVGElement>(null);
    const svgRef = (ref as React.RefObject<SVGSVGElement>) || internalRef;
    const [downloadFormat, setDownloadFormat] = useState<DownloadFormat>('png');
    const [diagramSize, setDiagramSize] = useState<DiagramSize>('md');
    const [guitarType, setGuitarTypeState] = useState<GuitarType>(
      'acoustic_guitar_nylon'
    );
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
        localStorage.removeItem('chord-diagram-background-color');
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
      const savedGuitar = localStorage.getItem('chord-diagram-guitar');
      if (savedGuitar && savedGuitar in GUITAR_TYPES) {
        setGuitarTypeState(savedGuitar as GuitarType);
        setGuitarType(savedGuitar as GuitarType);
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
        setDiagramColor(savedDiagramColor);
      }
      const savedBackgroundColor = localStorage.getItem(
        'chord-diagram-background-color'
      );
      if (savedBackgroundColor) {
        setBackgroundColor(savedBackgroundColor);
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

    useEffect(() => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('chord-diagram-guitar', guitarType);
      setGuitarType(guitarType);
    }, [guitarType]);

    // Persist colors to localStorage
    useEffect(() => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('chord-diagram-diagram-color', diagramColor);
    }, [diagramColor]);

    useEffect(() => {
      if (typeof window === 'undefined') return;
      localStorage.setItem('chord-diagram-background-color', backgroundColor);
    }, [backgroundColor]);

    // Helper function to parse color with alpha
    const parseColorWithAlpha = (colorString: string) => {
      try {
        const color = Color(colorString);
        return {
          hex: color.hex(),
          alpha: Math.round(color.alpha() * 100),
        };
      } catch {
        return {
          hex: '#000000',
          alpha: 100,
        };
      }
    };

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
        // Generate based on download format
        if (downloadFormat === 'jpg') {
          // JPG needs background color
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, outputWidth, outputHeight);
          ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
          setPngDataUrl(canvas.toDataURL('image/jpeg', 0.95));
        } else {
          // PNG - transparent background
          ctx.drawImage(img, 0, 0, outputWidth, outputHeight);
          setPngDataUrl(canvas.toDataURL('image/png'));
        }

        // Only generate XL for display in non-static mode
        if (!isStatic) {
          const xlCanvas = document.createElement('canvas');
          const xlCtx = xlCanvas.getContext('2d');
          if (xlCtx) {
            xlCanvas.width = xlWidth * dpr;
            xlCanvas.height = xlHeight * dpr;
            xlCtx.scale(dpr, dpr);
            if (downloadFormat === 'jpg') {
              // JPG needs background color
              xlCtx.fillStyle = backgroundColor;
              xlCtx.fillRect(0, 0, xlWidth, xlHeight);
              xlCtx.drawImage(img, 0, 0, xlWidth, xlHeight);
              setXlPngDataUrl(xlCanvas.toDataURL('image/jpeg', 0.95));
            } else {
              // PNG - transparent background
              xlCtx.drawImage(img, 0, 0, xlWidth, xlHeight);
              setXlPngDataUrl(xlCanvas.toDataURL('image/png'));
            }
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
      diagramData,
      showFingers,
      isStatic,
      downloadFormat,
      diagramColor,
      backgroundColor,
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
          // Only add white background for JPG format, keep PNG transparent
          if (downloadFormat === 'jpg') {
            ctx.fillStyle = '#ffffff';
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
    ]);

    return (
      <div
        className={`flex h-full w-full flex-col items-center ${isStatic ? 'relative' : ''}`}
      >
        {/* SVG - hidden when generating PNG, visible in static mode */}
        <svg
          aria-labelledby="chord-title"
          className={
            isStatic ? 'w-full rounded-lg bg-white' : 'absolute -left-[9999px]'
          }
          height={svgHeight}
          ref={svgRef}
          role="img"
          style={isStatic ? { maxWidth: xlWidth } : undefined}
          viewBox={isStatic ? `0 0 ${svgWidth} ${svgHeight}` : undefined}
          width={svgWidth}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="chord-title">
            {chordName ? `${chordName} chord diagram` : 'Chord diagram'}
          </title>
          {/* Only add white background for JPG format or static display, keep PNG transparent */}
          {(downloadFormat === 'jpg' || isStatic) && (
            <rect fill={backgroundColor} height={svgHeight} width={svgWidth} />
          )}

          {/* String labels (X/O) - close to nut */}
          {reversedStrings.map((stringState, i) => {
            const x = startX + i * stringSpacing;
            if (stringState.fret === 'X') {
              return (
                <text
                  fill={diagramColor}
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
                  fill={diagramColor}
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
              stroke={diagramColor}
              strokeWidth={3}
              x1={startX}
              x2={startX + diagramWidth}
              y1={startY}
              y2={startY}
            />
          ) : (
            <>
              <line
                stroke={diagramColor}
                strokeWidth={1}
                x1={startX}
                x2={startX + diagramWidth}
                y1={startY}
                y2={startY}
              />
              <text
                fill={diagramColor}
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
              stroke={diagramColor}
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
              stroke={diagramColor}
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
                fill={diagramColor}
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
                {!isInBarre && (
                  <circle cx={x} cy={y} fill={diagramColor} r={dotRadius} />
                )}
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
          {STRING_NAMES_LOW_TO_HIGH.map((name, i) => (
            <text
              fill={diagramColor}
              fontFamily="system-ui, sans-serif"
              fontSize={14}
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
          {chordName && (
            <text
              fill={diagramColor}
              fontFamily="system-ui, sans-serif"
              fontSize={16}
              fontWeight="bold"
              textAnchor="middle"
              x={svgWidth / 2}
              y={svgHeight - 8}
            >
              {chordName}
            </text>
          )}
        </svg>

        {/* Draggable PNG overlay for static mode */}
        {isStatic && pngDataUrl && (
          <AndImage
            alt={chordName ? `${chordName} chord diagram` : 'Chord diagram'}
            className="absolute inset-0 h-full w-full rounded-lg opacity-0"
            draggable
            height={outputHeight}
            src={pngDataUrl}
            width={outputWidth}
          />
        )}

        {/* PNG preview with high-quality display and draggable selected-size layer */}
        {!isStatic && xlPngDataUrl && (
          <div className="relative">
            {/* High-quality XL display (visible) */}
            <AndImage
              alt={chordName ? `${chordName} chord diagram` : 'Chord diagram'}
              className="w-full rounded-lg border border-border bg-white"
              draggable={false}
              height={xlHeight}
              src={xlPngDataUrl}
              style={{ backgroundColor }}
              width={xlWidth}
            />
            {/* Selected-size for drag (invisible overlay) */}
            {pngDataUrl && (
              <AndImage
                alt={chordName ? `${chordName} chord diagram` : 'Chord diagram'}
                className="absolute inset-0 h-full w-full opacity-0"
                draggable
                height={outputHeight}
                src={pngDataUrl}
                width={outputWidth}
              />
            )}
          </div>
        )}

        {/* Controls */}
        {showControls && (
          <div className="mt-4 w-full space-y-3">
            {/* Primary action: Download */}
            <Button
              className="h-10 w-full rounded-full"
              onClick={downloadImage}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>

            {/* Options Section */}
            <div className="flex flex-col gap-3 rounded-2xl bg-background/60 p-3 dark:bg-zinc-800/40">
              <span className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                Options
              </span>
              <div className="flex flex-col gap-2">
                <ButtonGroupSettings label="Size">
                  {(['xs', 'sm', 'md', 'lg', 'xl'] as DiagramSize[]).map(
                    (s) => (
                      <ButtonGroupSettingsItem
                        isActive={effectiveSize === s}
                        key={s}
                        onClick={() => setDiagramSize(s)}
                      >
                        {s.toUpperCase()}
                      </ButtonGroupSettingsItem>
                    )
                  )}
                </ButtonGroupSettings>
                <ButtonGroupSettings label="Format">
                  {(['png', 'jpg', 'svg'] as DownloadFormat[]).map((f) => (
                    <ButtonGroupSettingsItem
                      isActive={downloadFormat === f}
                      key={f}
                      onClick={() => setDownloadFormat(f)}
                    >
                      {f.toUpperCase()}
                    </ButtonGroupSettingsItem>
                  ))}
                </ButtonGroupSettings>
                <ButtonGroupSettings label="Fingers">
                  <ButtonGroupSettingsItem
                    isActive={showFingers}
                    onClick={() => setShowFingers(true)}
                  >
                    Show
                  </ButtonGroupSettingsItem>
                  <ButtonGroupSettingsItem
                    isActive={!showFingers}
                    onClick={() => setShowFingers(false)}
                  >
                    Hide
                  </ButtonGroupSettingsItem>
                </ButtonGroupSettings>
                <ButtonColorsSettings
                  backgroundColor={parseColorWithAlpha(backgroundColor).hex}
                  diagramColor={parseColorWithAlpha(diagramColor).hex}
                  label="Colors"
                  onBackgroundColorChange={(color) => {
                    const current = parseColorWithAlpha(backgroundColor);
                    const newColor = Color(color).alpha(current.alpha / 100);
                    setBackgroundColor(newColor.hex());
                  }}
                  onDiagramColorChange={(color) => {
                    const current = parseColorWithAlpha(diagramColor);
                    const newColor = Color(color).alpha(current.alpha / 100);
                    setDiagramColor(newColor.hex());
                  }}
                  onResetColors={resetColors}
                />

                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <span className="w-12 shrink-0">Guitar</span>
                  <Select
                    onValueChange={(value) =>
                      setGuitarTypeState(value as GuitarType)
                    }
                    value={guitarType}
                  >
                    <SelectTrigger className="h-auto flex-1 rounded-full border-0 bg-muted px-3 py-1.5 text-xs shadow-none hover:bg-muted-foreground/10">
                      <SelectValue>{GUITAR_TYPES[guitarType]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(
                        Object.entries(GUITAR_TYPES) as [GuitarType, string][]
                      ).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <ButtonGroupSettings label="Play">
                  <ButtonGroupSettingsItem
                    onClick={() => {
                      const audioStrings = [...strings]
                        .reverse()
                        .map((s) => s.fret);
                      playChord(audioStrings, { strumSpeed: 50 });
                    }}
                  >
                    <Volume2 className="h-3 w-3" />
                    Normal
                  </ButtonGroupSettingsItem>
                  <ButtonGroupSettingsItem
                    onClick={() => {
                      const audioStrings = [...strings]
                        .reverse()
                        .map((s) => s.fret);
                      playChord(audioStrings, { strumSpeed: 200 });
                    }}
                  >
                    <Volume2 className="h-3 w-3" />
                    Slow
                  </ButtonGroupSettingsItem>
                </ButtonGroupSettings>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);
